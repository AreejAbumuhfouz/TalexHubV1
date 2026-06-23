
'use strict';

const aiService  = require('./ai.service');
const { CV }     = require('../models');
const storageSvc = require('./storage.service');
const logger     = require('../utils/logger');

/* ─────────────────────────────────────────────────────────
   FREE TEMPLATE — no AI, no tokens
───────────────────────────────────────────────────────── */
function freeTemplateCoverLetter({ user, job, company, language = 'en' }) {
  const isAr = language === 'ar';

  if (isAr) {
    return `السيد/السيدة المسؤول عن التوظيف في ${company.name}،

تحية طيبة وبعد،

يسعدني تقديم طلبي للانضمام إلى فريقكم في وظيفة ${job.title} المُعلنة على منصة TalexHub.

أنا ${user.fullName}${user.headline ? `، ${user.headline}` : ''}. أؤمن بأن مؤهلاتي وخبراتي تجعلني مرشحاً مناسباً لهذا المنصب.${user.locationCity ? `\n\nأقيم حالياً في ${user.locationCity}${user.locationCountry ? `، ${user.locationCountry}` : ''}.` : ''}

أتطلع إلى فرصة مناقشة كيف يمكنني المساهمة في نجاح ${company.name}.

مع خالص التقدير،
${user.fullName}
${user.email}${user.phone ? `\n${user.phone}` : ''}`;
  }

  return `Dear Hiring Team at ${company.name},

I am writing to express my strong interest in the ${job.title} position listed on TalexHub.

My name is ${user.fullName}${user.headline ? `, ${user.headline}` : ''}. I believe my background and skills make me a strong candidate for this role.${user.locationCity ? `\n\nI am currently based in ${user.locationCity}${user.locationCountry ? `, ${user.locationCountry}` : ''}.` : ''}

I would welcome the opportunity to discuss how I can contribute to the success of ${company.name}.

Best regards,
${user.fullName}
${user.email}${user.phone ? `\n${user.phone}` : ''}`;
}

/* ─────────────────────────────────────────────────────────
   AI COVER LETTER — Pro/Elite
   Uses points (tracked by tokenTracker)
───────────────────────────────────────────────────────── */
async function aiCoverLetter({ user, job, company, cv, language = 'en' }) {
  const cvText = cv?.rawText || Object.entries(cv?.builderData || {})
    .filter(([k]) => ['summary','skills','experiences','education'].includes(k))
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}: ${v.map(i => typeof i === 'object' ? Object.values(i).join(' ') : i).join(', ')}`;
      return `${k}: ${v}`;
    }).join('\n');

  // ✅ DEBUG — confirm exactly what language reaches the AI call
  logger.info(`[coverLetter] aiCoverLetter called with language="${language}" for job "${job.title}"`);

  const generated = await aiService.generateCoverLetter({
    cvText:         cvText?.substring(0, 1500) || '',
    jobTitle:       job.title,
    companyName:    company.name,
    jobDescription: (job.description || '').substring(0, 800),
    language,
    userInfo: { id: user.id, email: user.email, fullName: user.fullName },
  });

  return generated;
}

/* ─────────────────────────────────────────────────────────
   ✅ FIXED: MAIN — generateCoverLetter
   - Pro/Elite → AI (uses points)
   - Free      → Template

   Bug fixed: the old "auto" branch had a JS operator-precedence
   trap — `job.language || job.title?.match(...) ? 'ar' : 'en'`
   evaluates as `(job.language || match-result) ? 'ar' : 'en'`,
   so ANY truthy job.language (even 'en') silently forced 'ar'.
   Rewritten explicitly below so each case is unambiguous.
───────────────────────────────────────────────────────── */
function resolveLanguage(language, job) {
  if (language && language !== 'auto') return language; // explicit user choice always wins

  // language === 'auto' → infer from the job itself
  if (job?.language === 'ar' || job?.language === 'en') return job.language;
  const titleHasArabic = !!job?.title?.match(/[\u0600-\u06FF]/);
  return titleHasArabic ? 'ar' : 'en';
}

async function generateCoverLetter({ user, job, company, language = 'auto', userSettings = {} }) {
  const effectiveLang = resolveLanguage(language, job);

  logger.info(`[coverLetter] generateCoverLetter: requested="${language}" → effective="${effectiveLang}"`);

  const planKey = user.planKey || 'free';
  const useAI   = ['pro', 'elite'].includes(planKey);

  if (!useAI) {
    return freeTemplateCoverLetter({ user, job, company, language: effectiveLang });
  }

  try {
    const cv = await CV.findOne({
      where: { userId: user.id },
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
      attributes: ['rawText', 'builderData'],
    }).catch(() => null);

    const letter = await aiCoverLetter({ user, job, company, cv, language: effectiveLang });
    return letter;
  } catch (e) {
    logger.warn('[coverLetter] AI failed, falling back to template:', e.message);
    return freeTemplateCoverLetter({ user, job, company, language: effectiveLang });
  }
}

/* ─────────────────────────────────────────────────────────
   GET CV ATTACHMENT — fetch the ALREADY-RENDERED templated
   PDF straight from R2. No on-the-fly generation here.
───────────────────────────────────────────────────────── */
async function buildCVAttachment({ userId }) {
  try {
    const cv = await CV.findOne({
      where: { userId },
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
      attributes: ['id', 'title', 'fileKey', 'fileUrl', 'builderData'],
    });
    if (!cv?.fileKey) {
      logger.warn(`[coverLetter] No stored PDF found for user ${userId}`);
      return null;
    }

    const exists = await storageSvc.exists(cv.fileKey).catch(() => false);
    if (!exists) {
      logger.warn(`[coverLetter] CV file missing in R2: ${cv.fileKey}`);
      return null;
    }

    const buffer = await storageSvc.downloadFile(cv.fileKey);
    const name   = cv.builderData?.fullName || cv.title || 'CV';
    return { buffer, filename: `${name}.pdf`, mimetype: 'application/pdf' };
  } catch (e) {
    logger.warn('[coverLetter] buildCVAttachment failed:', e.message);
    return null;
  }
}

module.exports = { generateCoverLetter, buildCVAttachment, freeTemplateCoverLetter, aiCoverLetter };