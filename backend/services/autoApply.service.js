
'use strict';

const { Op }      = require('sequelize');
const { Job, CV, JobApplication, User, Company } = require('../models');
const matchingSvc = require('./matching.service');
const aiService   = require('./ai.service');
const storageSvc  = require('./storage.service');
const { sendMail } = require('../config/mailer');
const logger          = require('../utils/logger');
const Setting         = require('../models/Setting');
const coverLetterSvc  = require('./coverLetter.service');

/* ─────────────────────────────────────────────────────────
   ADMIN-CONTROLLED SETTINGS
───────────────────────────────────────────────────────── */
async function getSetting(key, fallback) {
  try {
    const row = await Setting.findOne({ where: { key } });
    return row ? row.value : fallback;
  } catch { return fallback; }
}

async function getMonthlyLimit(planKey) {
  const v = await getSetting(`autoApply.monthlyLimit.${planKey}`, planKey === 'elite' ? '100' : '30');
  return parseInt(v) || 30;
}

async function getDailyLimit(planKey) {
  const v = await getSetting(`autoApply.dailyLimit.${planKey}`, planKey === 'elite' ? '20' : '15');
  return parseInt(v) || 5;
}

async function getMatchThreshold() {
  const v = await getSetting('autoApply.matchThreshold', '65');
  return parseInt(v) || 65;
}

/* ─────────────────────────────────────────────────────────
   QUOTA HELPERS
───────────────────────────────────────────────────────── */
async function countThisMonth(userId) {
  const start = new Date();
  start.setDate(1); start.setHours(0, 0, 0, 0);
  return JobApplication.count({
    where: { userId, isAutoApplied: true, created_at: { [Op.gte]: start } },
  });
}

async function countToday(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return JobApplication.count({
    where: { userId, isAutoApplied: true, created_at: { [Op.gte]: start } },
  });
}

/* ─────────────────────────────────────────────────────────
   ✅ CHANGED: GET CV ATTACHMENT
   The PDF is already rendered with the user's chosen template
   and stored in R2 (cv.controller.js handles regeneration on
   upload / template change). No template/language params needed
   here anymore — just fetch what's already there.
───────────────────────────────────────────────────────── */
const getCVAttachment = async (userId) => {
  return coverLetterSvc.buildCVAttachment({ userId });
};

/* ─────────────────────────────────────────────────────────
   EMAIL BUILDER
───────────────────────────────────────────────────────── */
function buildApplicationEmail({ user, job, company, coverLetter, cvUrl, score, hasAttachment = false }) {
  const greeting  = job.contactName ? `Dear ${job.contactName},` : 'Dear Hiring Team,';
  const scoreNote = score ? `<p style="color:#6b7280;font-size:13px;margin:0 0 4px">AI Match Score: <strong>${Math.round(score)}%</strong></p>` : '';
  const cvSection = `
    <p style="margin:16px 0 0">
      ${hasAttachment ? '<span style="display:inline-block;padding:10px 20px;background:#059669;color:#fff;border-radius:8px;font-size:14px;font-weight:600;margin-right:10px">📎 CV Attached (PDF)</span>' : ''}
      ${cvUrl ? `<a href="${cvUrl}" style="display:inline-block;padding:10px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">⬇ Download CV</a>` : ''}
    </p>`;

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">
        <tr><td style="background:#111;padding:24px 32px;text-align:center">
          <p style="margin:0;font-size:22px;font-weight:800;color:#fff">TalexHub</p>
          <p style="margin:4px 0 0;font-size:12px;color:#9ca3af">Connecting Talent with Opportunity</p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:14px 32px;border-bottom:1px solid #e5e7eb">
          <p style="margin:0;font-size:13px;color:#6b7280">Application submitted via <strong>TalexHub AI Auto-Apply</strong> on behalf of <strong>${user.fullName}</strong></p>
          ${scoreNote}
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 24px;font-size:15px;color:#374151">${greeting}</p>
          <p style="margin:0 0 16px;font-size:15px;color:#374151">I am writing to express my strong interest in the <strong>${job.title}</strong> position at <strong>${company.name}</strong>.</p>
          <div style="background:#f9fafb;border-left:3px solid #111;padding:20px 24px;border-radius:0 8px 8px 0;margin:0 0 24px">
            <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase">Cover Letter</p>
            <div style="font-size:14px;color:#374151;line-height:1.7;white-space:pre-line">${coverLetter || `I am ${user.fullName}${user.headline ? `, ${user.headline}` : ''}. I believe my background makes me an excellent candidate for this role.`}</div>
          </div>
          <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px 24px;margin:0 0 24px">
            <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#111;text-transform:uppercase">About the Candidate</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50%" style="padding:0 8px 10px 0;vertical-align:top">
                  <p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase">Name</p>
                  <p style="margin:2px 0 0;font-size:14px;color:#111;font-weight:600">${user.fullName}</p>
                </td>
                ${user.headline ? `<td width="50%" style="padding:0 0 10px 8px;vertical-align:top"><p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase">Title</p><p style="margin:2px 0 0;font-size:14px;color:#111;font-weight:600">${user.headline}</p></td>` : '<td></td>'}
              </tr>
              ${user.email ? `<tr><td colspan="2" style="padding:0 0 10px 0"><p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase">Email</p><p style="margin:2px 0 0;font-size:14px;color:#111"><a href="mailto:${user.email}" style="color:#111;text-decoration:none">${user.email}</a></p></td></tr>` : ''}
              ${user.phone ? `<tr><td colspan="2" style="padding:0"><p style="margin:0;font-size:11px;color:#9ca3af;text-transform:uppercase">Phone</p><p style="margin:2px 0 0;font-size:14px;color:#111">${user.phone}</p></td></tr>` : ''}
            </table>
          </div>
          ${cvSection}
          <p style="margin:24px 0 0;font-size:14px;color:#374151">Thank you for considering this application.</p>
          <p style="margin:8px 0 0;font-size:14px;color:#374151">Best regards,<br><strong>${user.fullName}</strong></p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">Submitted through <strong>TalexHub</strong> · <a href="https://TalexHub.com" style="color:#9ca3af">TalexHub.com</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = `Application for ${job.title} at ${company.name}\n\n${greeting}\n\n${coverLetter || `I am applying for the ${job.title} position.`}\n\nCandidate: ${user.fullName}\nEmail: ${user.email}\n${user.phone ? `Phone: ${user.phone}\n` : ''}${cvUrl ? `\nCV: ${cvUrl}\n` : ''}`;

  return { html, text };
}

async function sendCandidateConfirmation({ user, job, company, score }) {
  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 8px rgba(0,0,0,0.08)">
<tr><td style="background:#111;padding:20px 32px;text-align:center"><p style="margin:0;font-size:20px;font-weight:800;color:#fff">TalexHub</p></td></tr>
<tr><td style="padding:28px 32px">
  <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#111">Application Sent!</p>
  <p style="margin:0 0 20px;font-size:14px;color:#6b7280">Your AI Auto-Apply just submitted an application on your behalf.</p>
  <div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin:0 0 20px">
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#111">${job.title}</p>
    <p style="margin:0 0 8px;font-size:13px;color:#6b7280">${company.name}</p>
    ${score ? `<p style="margin:0;font-size:12px;color:#6b7280">AI Match: <strong style="color:#111">${Math.round(score)}%</strong></p>` : ''}
  </div>
  <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">Your CV was attached as PDF. Track this application in your TalexHub dashboard.</p>
</td></tr>
<tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center">
  <p style="margin:0;font-size:11px;color:#9ca3af">TalexHub · <a href="https://TalexHub.com" style="color:#9ca3af">TalexHub.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  await sendMail({
    to:      user.email,
    subject: `Application sent: ${job.title} at ${company.name}`,
    html,
    text: `Your application for ${job.title} at ${company.name} was sent via TalexHub AI Auto-Apply.`,
  });
}

/* ─────────────────────────────────────────────────────────
   MAIN: runAutoApply
───────────────────────────────────────────────────────── */
async function runAutoApply(userId, options = {}) {
  const { dryRun = false, maxBatch = 5, matchThresholdOverride = null, userSettings = null } = options;

  // 1. Load user
  const user = await User.findByPk(userId, {
    attributes: [
      'id', 'planKey', 'fullName', 'headline', 'email', 'phone',
      'desiredJobTitle', 'desiredJobTypes', 'desiredLocations',
      'desiredSalaryMin', 'desiredSalaryMax',
      'locationCountry', 'locationCity', 'openToWork',
    ],
  });
  if (!user) throw new Error('User not found');

  // 2. Plan check
  if (!['pro', 'elite'].includes(user.planKey)) {
    return { applied: [], skipped: [], reason: 'plan_insufficient' };
  }

  // 3. openToWork check
  if (user.openToWork === false) {
    return { applied: [], skipped: [], reason: 'not_open_to_work' };
  }

  // 4. Quota
  const [dailyLimit, monthlyLimit, usedToday, usedThisMonth] = await Promise.all([
    getDailyLimit(user.planKey),
    getMonthlyLimit(user.planKey),
    countToday(userId),
    countThisMonth(userId),
  ]);

  if (usedToday >= dailyLimit)     return { applied: [], skipped: [], reason: 'daily_limit_reached',   dailyLimit, usedToday, monthlyLimit, usedThisMonth };
  if (usedThisMonth >= monthlyLimit) return { applied: [], skipped: [], reason: 'monthly_limit_reached', dailyLimit, usedToday, monthlyLimit, usedThisMonth };

  const remainingToday = dailyLimit   - usedToday;
  const remainingMonth = monthlyLimit - usedThisMonth;
  const batchMax       = Math.min(maxBatch, remainingToday, remainingMonth);

  // 5. Get CV
  const cv = await CV.findOne({
    where:      { userId, deletedAt: null },
    attributes: ['id', 'fileUrl', 'fileKey', 'title'],
    order:      [['is_primary', 'DESC'], ['created_at', 'DESC']],
  });
  if (!cv) return { applied: [], skipped: [], reason: 'no_cv', dailyLimit, usedToday, monthlyLimit, usedThisMonth };

  // Build presigned URL
  let cvDownloadUrl = cv.fileUrl || null;
  if (cv.fileKey) {
    cvDownloadUrl = await storageSvc.getPresignedUrl(cv.fileKey, 86400).catch(() => cv.fileUrl);
  }

  // 6. Already applied jobs
  const existing      = await JobApplication.findAll({ where: { userId }, attributes: ['jobId'] });
  const appliedJobIds = new Set(existing.map(a => a.jobId));

  // 7. Match threshold — admin-controlled global value (override kept for internal/testing use)
  const matchThreshold = matchThresholdOverride || await getMatchThreshold();
  logger.info(`[autoApply] Running for ${user.email} | threshold: ${matchThreshold}% | batch: ${batchMax}`);

  // 8. Candidate jobs
  const candidates = await Job.findAll({
    where:   { status: 'active', deletedAt: null },
    include: [{
      model:      Company,
      as:         'company',
      attributes: ['id', 'name', 'logoUrl', 'emailDomain', 'ownerId'],
      where:      { status: 'active' },
      required:   true,
    }],
    order: [['created_at', 'DESC']],
    limit: 50,
  });

  // 9. Process
  const results = { applied: [], skipped: [], dailyLimit, usedToday, monthlyLimit, usedThisMonth };
  let batchCount = 0;

  for (const job of candidates) {
    if (batchCount >= batchMax) break;
    if (appliedJobIds.has(job.id)) continue;

    // ✅ Hybrid matching: free algorithm pre-filter, then AI deep score
    // (costs points) only for jobs that already look plausible.
    const matchResult = await matchingSvc.scoreJobForUserHybrid(userId, job.id, {
      id: user.id, email: user.email, fullName: user.fullName,
    }).catch(() => ({ score: 0, aiUsed: false }));
    const score = matchResult.score;

    if (score < matchThreshold) {
      results.skipped.push({ jobId: job.id, title: job.title, reason: 'low_match', score, aiUsed: matchResult.aiUsed });
      continue;
    }

    if (dryRun) {
      results.applied.push({ jobId: job.id, title: job.title, company: job.company?.name, score, dryRun: true });
      batchCount++;
      continue;
    }

    // 10. Generate cover letter — AI for Pro/Elite, template for Free
    let coverLetter = null;
    try {
      coverLetter = await coverLetterSvc.generateCoverLetter({
        user,
        job,
        company:  job.company,
        language: userSettings?.coverLetterLang || 'auto',
      });
    } catch (e) {
      logger.warn('[autoApply] Cover letter generation failed:', e.message);
    }

    // 11. Resolve recipient email
    let recipientEmail = job.applicationEmail || null;
    if (!recipientEmail && job.company?.ownerId) {
      const owner = await User.findByPk(job.company.ownerId, { attributes: ['email'] }).catch(() => null);
      if (owner?.email) recipientEmail = owner.email;
    }
    if (!recipientEmail && job.company?.emailDomain) {
      recipientEmail = `hr@${job.company.emailDomain}`;
    }

    let emailSentAt = null;

    if (recipientEmail) {
      try {
        // ✅ CHANGED: no template/language params — fetches the already-rendered
        // R2 PDF that always reflects the user's current Auto-Apply template choice
        const cvAttachment = await getCVAttachment(userId);
        const attachments  = cvAttachment ? [cvAttachment] : [];
        const { html, text } = buildApplicationEmail({
          user, job, company: job.company, coverLetter, cvUrl: cvDownloadUrl, score, hasAttachment: !!cvAttachment,
        });

        await sendMail({
          to:      recipientEmail,
          cc:      user.email,
          replyTo: user.email,
          subject: `Job Application: ${job.title} — ${user.fullName}`,
          html, text, attachments,
        });

        emailSentAt = new Date();
        sendCandidateConfirmation({ user, job, company: job.company, score }).catch(() => {});
        logger.info(`📧 Auto-apply sent to ${recipientEmail} for "${job.title}"`);
      } catch (emailErr) {
        logger.error(`[autoApply] Email failed for job ${job.id}:`, emailErr.message);
      }
    } else {
      logger.warn(`[autoApply] No recipient email for job ${job.id} (${job.title})`);
    }

    // 12. Record in DB
    const application = await JobApplication.create({
      jobId: job.id, userId, cvId: cv.id,
      status: 'sent', matchScore: score,
      isAutoApplied: true, applyMethod: 'auto_ai',
      coverLetter, emailSentAt,
    });

    job.increment('applicationsCount').catch(() => {});
    appliedJobIds.add(job.id);
    batchCount++;

    results.applied.push({
      jobId:         job.id,
      title:         job.title,
      company:       job.company?.name,
      score,
      aiMatchUsed:   matchResult.aiUsed,
      applicationId: application.id,
      emailSent:     !!emailSentAt,
      sentTo:        recipientEmail,
    });
  }

  results.usedToday     = usedToday     + results.applied.length;
  results.usedThisMonth = usedThisMonth + results.applied.length;

  logger.info(`[autoApply] Done: ${results.applied.length} applied, ${results.skipped.length} skipped`);
  return results;
}

module.exports = { runAutoApply, getMonthlyLimit, getDailyLimit, getMatchThreshold, countThisMonth, countToday };