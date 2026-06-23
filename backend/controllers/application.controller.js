

'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/application.controller.js
// ════════════════════════════════════════════════════════════

const { JobApplication, Job, CV, Company, User, Notification } = require('../models');
const { success, error, paginate } = require('../utils/apiResponse');
const matchingSvc  = require('../services/matching.service');
const storageSvc   = require('../services/storage.service');
const { sendMail } = require('../config/mailer');
const { Op }       = require('sequelize');
const logger       = require('../utils/logger');

/* ══════════════════════════════════════════════════════════
   HELPER — In-App Notification (Bilingual support)
══════════════════════════════════════════════════════════ */
async function createNotification({ userId, title, titleAr, titleEn, body, bodyAr, bodyEn, type, refId, refType, io }) {
  try {
    // Get user's language preference
    const user = await User.findByPk(userId, { attributes: ['language'] });
    const userLang = user?.language || 'ar';
    const isAr = userLang === 'ar';
    
    // Use appropriate language versions
    const finalTitle = isAr ? (titleAr || title) : (titleEn || title);
    const finalBody = isAr ? (bodyAr || body) : (bodyEn || body);
    
    const notif = await Notification.create({
      userId,
      title: finalTitle,
      titleAr: titleAr || finalTitle,
      titleEn: titleEn || finalTitle,
      body: finalBody,
      bodyAr: bodyAr || finalBody,
      bodyEn: bodyEn || finalBody,
      type,
      referenceId: refId || null,
      referenceType: refType || null,
      isRead: false,
    });
    
    if (io) io.to(`user-${userId}`).emit('notification', notif);
    return notif;
  } catch (err) { 
    logger.error('createNotification:', err.message); 
  }
}

/* ══════════════════════════════════════════════════════════
   HELPER — Notify Company Owner (Language aware)
══════════════════════════════════════════════════════════ */
async function notifyCompanyOwner(job, applicant, application, io, isAr) {
  try {
    const company = await Company.findByPk(job.companyId, { attributes: ['ownerId', 'name'] });
    if (!company?.ownerId) return;
    
    // Get company owner's language preference
    const owner = await User.findByPk(company.ownerId, { attributes: ['language'] });
    const ownerLang = owner?.language || 'ar';
    const isOwnerAr = ownerLang === 'ar';
    
    const matchScore = application.matchScore ? Math.round(parseFloat(application.matchScore)) : null;
    
    await createNotification({
      userId: company.ownerId,
      title: isOwnerAr ? `طلب توظيف جديد: ${job.title}` : `New application: ${job.title}`,
      titleAr: `طلب توظيف جديد: ${job.title}`,
      titleEn: `New application: ${job.title}`,
      body: isOwnerAr
        ? `${applicant.fullName} تقدم لوظيفة "${job.title}"${matchScore ? ` بتطابق ${matchScore}%` : ''}`
        : `${applicant.fullName} applied to "${job.title}"${matchScore ? ` with ${matchScore}% match` : ''}`,
      bodyAr: `${applicant.fullName} تقدم لوظيفة "${job.title}"${matchScore ? ` بتطابق ${matchScore}%` : ''}`,
      bodyEn: `${applicant.fullName} applied to "${job.title}"${matchScore ? ` with ${matchScore}% match` : ''}`,
      type: 'new_application',
      refId: application.id,
      refType: 'JobApplication',
      io: io,
    });
  } catch (err) { 
    logger.error('notifyCompanyOwner:', err.message); 
  }
}

/* ══════════════════════════════════════════════════════════
   HELPER — Email to Applicant (Language aware)
══════════════════════════════════════════════════════════ */
async function sendEmailToApplicant(applicant, job, isAr) {
  try {
    const companyName = job.company?.name || 'الشركة';
    const subject = isAr 
      ? `تم التقديم على وظيفة ${job.title}`
      : `Application submitted for ${job.title}`;
    
    const html = isAr
      ? `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:'Tajawal',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="560" style="background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E0E0DB;">
      <tr><td style="padding:28px 32px;background:#0D0D0D;">
        <span style="font-size:18px;font-weight:900;color:#BD8E50;">TalexHub</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:22px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">✅ تم إرسال طلبك بنجاح</p>
        <p style="font-size:14px;color:#666;line-height:1.7;">مرحباً <strong>${applicant.fullName}</strong>، تم إرسال طلب تقديمك لوظيفة <strong>${job.title}</strong> إلى ${companyName}. سنعلمك عند أي تحديث.</p>
        <div style="background:#F8F8F6;border-radius:12px;padding:16px;margin:20px 0;">
          <p style="font-size:12px;color:#999;margin:0 0 5px;">الوظيفة</p>
          <p style="font-size:16px;font-weight:700;color:#0D0D0D;margin:0;">${job.title}</p>
          <p style="font-size:12px;color:#666;margin:5px 0 0;">${companyName}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/dashboard/jobs" style="display:inline-block;padding:12px 28px;background:#0D0D0D;color:#BD8E50;text-decoration:none;border-radius:10px;font-weight:700;">تتبع طلباتي ←</a>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #EDEDEA;text-align:center;">
        <p style="font-size:11px;color:#AAA;">© 2025 TalexHub. جميع الحقوق محفوظة.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
      : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="560" style="background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E0E0DB;">
      <tr><td style="padding:28px 32px;background:#0D0D0D;">
        <span style="font-size:18px;font-weight:900;color:#BD8E50;">TalexHub</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:22px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">✅ Application Submitted</p>
        <p style="font-size:14px;color:#666;line-height:1.7;">Hello <strong>${applicant.fullName}</strong>, your application for <strong>${job.title}</strong> has been sent to ${companyName}. We'll notify you of any updates.</p>
        <div style="background:#F8F8F6;border-radius:12px;padding:16px;margin:20px 0;">
          <p style="font-size:12px;color:#999;margin:0 0 5px;">Job</p>
          <p style="font-size:16px;font-weight:700;color:#0D0D0D;margin:0;">${job.title}</p>
          <p style="font-size:12px;color:#666;margin:5px 0 0;">${companyName}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/dashboard/jobs" style="display:inline-block;padding:12px 28px;background:#0D0D0D;color:#BD8E50;text-decoration:none;border-radius:10px;font-weight:700;">Track My Applications →</a>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #EDEDEA;text-align:center;">
        <p style="font-size:11px;color:#AAA;">© 2025 TalexHub. All rights reserved.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
    
    await sendMail({ to: applicant.email, subject, html });
    logger.info(`Applicant email sent → ${applicant.email}`);
  } catch (err) { 
    logger.error('sendEmailToApplicant:', err.message); 
  }
}

/* ══════════════════════════════════════════════════════════
   HELPER — Email to Company (Language aware + CV attachment)
══════════════════════════════════════════════════════════ */
async function sendEmailToCompany(applicant, job, application, isAr) {
  try {
    const company = await Company.findByPk(job.companyId, {
      include: [{ model: User, as: 'owner', attributes: ['email', 'fullName'] }],
    });
    
    const recipients = [];
    if (company?.owner?.email) recipients.push(company.owner.email);
    if (job.applicationEmail) recipients.push(job.applicationEmail);
    if (recipients.length === 0) return;
    
    // Get CV attachment
    const attachment = await getCVAttachment(application.cvId, applicant.fullName);
    const attachments = attachment ? [attachment] : [];
    
    const matchScore = application.matchScore ? Math.round(parseFloat(application.matchScore)) : null;
    const companyLang = company?.language || 'ar';
    const isCompanyAr = companyLang === 'ar';
    
    const subject = isCompanyAr
      ? `طلب توظيف جديد: ${applicant.fullName} — ${job.title}`
      : `New application: ${applicant.fullName} — ${job.title}`;
    
    const html = isCompanyAr
      ? `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:'Tajawal',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="560" style="background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E0E0DB;">
      <tr><td style="padding:28px 32px;background:#0D0D0D;">
        <span style="font-size:18px;font-weight:900;color:#BD8E50;">TalexHub</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:22px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">🎯 طلب تقديم جديد</p>
        <p style="font-size:14px;color:#666;line-height:1.7;">استلمت طلب تقديم جديد من <strong>${applicant.fullName}</strong> على وظيفة <strong>${job.title}</strong></p>
        
        <div style="background:#F8F8F6;border-radius:12px;padding:18px;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">معلومات المرشح</p>
          <p><strong>الاسم:</strong> ${applicant.fullName}</p>
          <p><strong>البريد الإلكتروني:</strong> ${applicant.email}</p>
          ${applicant.phone ? `<p><strong>الهاتف:</strong> ${applicant.phone}</p>` : ''}
          ${applicant.headline ? `<p><strong>المسمى:</strong> ${applicant.headline}</p>` : ''}
          ${matchScore ? `<p><strong>نسبة التطابق:</strong> <span style="color:#22C55E;">${matchScore}%</span></p>` : ''}
        </div>
        
        ${application.coverLetter ? `
        <div style="background:#FFF8EC;border-radius:12px;padding:16px;margin:16px 0;border-right:4px solid #F59E0B;">
          <p style="font-size:12px;font-weight:700;color:#B8731A;margin:0 0 5px;">📝 خطاب التقديم</p>
          <p style="font-size:13px;color:#333;margin:0;">${application.coverLetter}</p>
        </div>` : ''}
        
        ${attachments.length > 0 ? `
        <div style="background:#F0FFF5;border-radius:12px;padding:12px 16px;margin:16px 0;border-right:4px solid #22C55E;">
          <p style="font-size:13px;color:#166534;margin:0;">📎 السيرة الذاتية مرفقة بهذا البريد</p>
        </div>` : ''}
        
        <a href="${process.env.FRONTEND_URL}/company/pipeline" style="display:inline-block;padding:12px 28px;background:#0D0D0D;color:#BD8E50;text-decoration:none;border-radius:10px;font-weight:700;">عرض الطلب في Pipeline ←</a>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #EDEDEA;text-align:center;">
        <p style="font-size:11px;color:#AAA;">© 2025 TalexHub</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
      : `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#F5F5F0;font-family:Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
  <tr><td align="center">
    <table width="560" style="background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid #E0E0DB;">
      <tr><td style="padding:28px 32px;background:#0D0D0D;">
        <span style="font-size:18px;font-weight:900;color:#BD8E50;">TalexHub</span>
      </td></tr>
      <tr><td style="padding:28px 32px;">
        <p style="font-size:22px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">🎯 New Application Received</p>
        <p style="font-size:14px;color:#666;line-height:1.7;">You have received a new application from <strong>${applicant.fullName}</strong> for <strong>${job.title}</strong></p>
        
        <div style="background:#F8F8F6;border-radius:12px;padding:18px;margin:20px 0;">
          <p style="font-size:13px;font-weight:700;color:#0D0D0D;margin:0 0 10px;">Candidate Information</p>
          <p><strong>Name:</strong> ${applicant.fullName}</p>
          <p><strong>Email:</strong> ${applicant.email}</p>
          ${applicant.phone ? `<p><strong>Phone:</strong> ${applicant.phone}</p>` : ''}
          ${applicant.headline ? `<p><strong>Headline:</strong> ${applicant.headline}</p>` : ''}
          ${matchScore ? `<p><strong>Match Score:</strong> <span style="color:#22C55E;">${matchScore}%</span></p>` : ''}
        </div>
        
        ${application.coverLetter ? `
        <div style="background:#FFF8EC;border-radius:12px;padding:16px;margin:16px 0;border-left:4px solid #F59E0B;">
          <p style="font-size:12px;font-weight:700;color:#B8731A;margin:0 0 5px;">📝 Cover Letter</p>
          <p style="font-size:13px;color:#333;margin:0;">${application.coverLetter}</p>
        </div>` : ''}
        
        ${attachments.length > 0 ? `
        <div style="background:#F0FFF5;border-radius:12px;padding:12px 16px;margin:16px 0;border-left:4px solid #22C55E;">
          <p style="font-size:13px;color:#166534;margin:0;">📎 CV attached to this email</p>
        </div>` : ''}
        
        <a href="${process.env.FRONTEND_URL}/company/pipeline" style="display:inline-block;padding:12px 28px;background:#0D0D0D;color:#BD8E50;text-decoration:none;border-radius:10px;font-weight:700;">View in Pipeline →</a>
      </td></tr>
      <tr><td style="padding:16px 32px;border-top:1px solid #EDEDEA;text-align:center;">
        <p style="font-size:11px;color:#AAA;">© 2025 TalexHub</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
    
    await sendMail({ to: [...new Set(recipients)].join(','), subject, html, attachments });
    logger.info(`Company email sent → ${recipients.join(',')} | CV attached: ${attachments.length > 0}`);
  } catch (err) { 
    logger.error('sendEmailToCompany:', err.message); 
  }
}

/* ══════════════════════════════════════════════════════════
   HELPER — Download CV Buffer from R2 for email attachment
══════════════════════════════════════════════════════════ */
async function getCVAttachment(cvId, applicantName) {
  try {
    const cv = await CV.findByPk(cvId, { attributes: ['id', 'title', 'fileKey', 'fileType'] });
    if (!cv?.fileKey) return null;
    
    const buffer = await storageSvc.downloadFile(cv.fileKey);
    if (!buffer || buffer.length === 0) return null;
    
    const isPdf = cv.fileType === 'pdf' || cv.fileType?.includes('pdf');
    const ext = isPdf ? 'pdf' : 'docx';
    const mime = isPdf
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    const safeName = (applicantName || 'Applicant')
      .replace(/[^\u0600-\u06FFa-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 50);
    
    return {
      filename: `CV_${safeName}.${ext}`,
      content: buffer,
      contentType: mime,
    };
  } catch (err) {
    logger.error('getCVAttachment:', err.message);
    return null;
  }
}

/* ══════════════════════════════════════════════════════════
   POST /api/v1/jobs/:id/apply
   User applies to a job
══════════════════════════════════════════════════════════ */
exports.applyToJob = async (req, res) => {
  const userId = req.user.id;
  const jobId  = req.params.id;
  const { cvId, coverLetter } = req.body;

  // Check job exists and is active
  const job = await Job.findOne({
    where: { id: jobId, status: 'active', deletedAt: null },
    include: [{ model: Company, as: 'company', attributes: ['id', 'name', 'ownerId'] }],
  });
  if (!job) return error(res, 'Job not found or closed', 404);

  // Check not already applied
  const existing = await JobApplication.findOne({ where: { jobId, userId } });
  if (existing) return error(res, 'You have already applied to this job', 409);

  // Get CV to use
  const cv = cvId
    ? await CV.findOne({ where: { id: cvId, userId, deletedAt: null } })
    : await CV.findOne({ where: { userId, isPrimary: true, deletedAt: null } });

  if (!cv) return error(res, 'Please upload a CV first', 400);

  // Calculate match score
  const matchScore = await matchingSvc.scoreJobForUser(userId, jobId);

  // Create application
  const application = await JobApplication.create({
    jobId, userId,
    cvId: cv.id,
    status: 'sent',
    matchScore,
    coverLetter: coverLetter || null,
    applyMethod: 'manual',
  });

  // Increment job applications count
  job.increment('applicationsCount').catch(() => {});

  // Notify via socket (real-time to company)
  if (req.io) {
    req.io.to(`company-${job.companyId}`).emit('new_application', {
      jobId, jobTitle: job.title, applicantName: req.user.fullName,
    });
  }

  // Get user language preference
  const userLang = req.user.language || 'ar';
  const isAr = userLang === 'ar';

  // Send emails + in-app notifications (fire and forget)
  Promise.allSettled([
    sendEmailToApplicant(req.user, job, isAr),
    sendEmailToCompany(req.user, job, application, isAr),
    createNotification({
      userId: req.user.id,
      title: isAr ? `تم التقديم على وظيفة ${job.title}` : `Applied to ${job.title}`,
      titleAr: `تم التقديم على وظيفة ${job.title}`,
      titleEn: `Applied to ${job.title}`,
      body: isAr 
        ? `تم إرسال طلبك بنجاح إلى ${job.company?.name || 'الشركة'}. سنعلمك عند أي تحديث.`
        : `Your application has been successfully sent to ${job.company?.name || 'the company'}. We'll notify you of any updates.`,
      bodyAr: `تم إرسال طلبك بنجاح إلى ${job.company?.name || 'الشركة'}. سنعلمك عند أي تحديث.`,
      bodyEn: `Your application has been successfully sent to ${job.company?.name || 'the company'}. We'll notify you of any updates.`,
      type: 'application_sent',
      refId: application.id,
      refType: 'JobApplication',
      io: req.io,
    }),
    notifyCompanyOwner(job, req.user, application, req.io, isAr),
  ]).catch(() => {});

  return success(res, { application }, isAr ? 'تم التقديم بنجاح' : 'Application submitted successfully', 201);
};

/* ══════════════════════════════════════════════════════════
   GET /api/v1/users/me/applications
   User's own applications
══════════════════════════════════════════════════════════ */
exports.getMyApplications = async (req, res) => {
  const userId = req.user.id;
  const { status, page = 1, limit = 10 } = req.query;

  const where = { userId };
  if (status) where.status = status;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    include: [
      {
        model: Job,
        as: 'job',
        attributes: ['id', 'title', 'titleAr', 'job_type', 'locationCity', 'locationCountry', 'is_remote', 'salary_min', 'salary_max', 'salaryCurrency', 'salaryVisible', 'status', 'deadline'],
        include: [
          { model: Company, as: 'company', attributes: ['id', 'name', 'logoUrl', 'industry'] },
        ],
      },
      {
        model: CV,
        as: 'cv',
        attributes: ['id', 'title', 'ats_score'],
      },
    ],
    order: [['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return paginate(res, rows, count, page, limit);
};

/* ══════════════════════════════════════════════════════════
   GET /api/v1/jobs/:id/applications
   Company sees applicants for their job
══════════════════════════════════════════════════════════ */
exports.getJobApplications = async (req, res) => {
  const jobId = req.params.id;
  const userId = req.user.id;
  const { status, page = 1, limit = 20, sort = 'score' } = req.query;

  // Verify company owns this job
  const job = await Job.findOne({
    where: { id: jobId, deletedAt: null },
    include: [{ model: Company, as: 'company', where: { ownerId: userId }, required: true }],
  });
  if (!job) return error(res, 'Job not found or unauthorized', 403);

  const where = { jobId };
  if (status) where.status = status;

  const orderMap = {
    score: [['matchScore', 'DESC']],
    newest: [['created_at', 'DESC']],
    oldest: [['created_at', 'ASC']],
  };

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await JobApplication.findAndCountAll({
    where,
    include: [
      {
        model: User,
        // as: 'user',
        as: 'applicant',
        attributes: ['id', 'fullName', 'email', 'avatarUrl', 'headline', 'locationCity', 'locationCountry'],
      },
      {
        model: CV,
        as: 'cv',
        attributes: ['id', 'title', 'atsScore', 'fileUrl', 'fileKey', 'overallScore', 'extractedSkills'],
      },
    ],
    order: orderMap[sort] || orderMap.score,
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return paginate(res, rows, count, page, limit);
};

/* ══════════════════════════════════════════════════════════
   PATCH /api/v1/applications/:id/status
   Company updates application status
══════════════════════════════════════════════════════════ */
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, companyNote, interviewAt, offerSalary } = req.body;
  const userId = req.user.id;

  const ALLOWED_STATUS = ['viewed', 'shortlisted', 'interview', 'accepted', 'rejected'];
  if (!ALLOWED_STATUS.includes(status)) return error(res, 'Invalid status', 400);

  const application = await JobApplication.findOne({
    where: { id },
    include: [{
      model: Job,
      as: 'job',
      include: [{ model: Company, as: 'company', where: { ownerId: userId }, required: true }],
    }],
  });
  if (!application) return error(res, 'Application not found', 404);

  await application.update({
    status,
    companyNote: companyNote || application.companyNote,
    interviewAt: interviewAt || application.interviewAt,
    offerSalary: offerSalary || application.offerSalary,
  });

  // Real-time notify applicant
  if (req.io) {
    req.io.to(`user-${application.userId}`).emit('application_status_changed', {
      applicationId: id,
      status,
      jobTitle: application.job?.title,
    });
  }

  return success(res, { application }, 'Application status updated');
};

/* ══════════════════════════════════════════════════════════
   GET /api/v1/users/me/matched-jobs
   AI-matched jobs for the logged-in user
══════════════════════════════════════════════════════════ */
exports.getMatchedJobs = async (req, res) => {
  const userId = req.user.id;
  const limit = parseInt(req.query.limit) || 10;
  const minScore = parseInt(req.query.minScore) || 40;

  const jobs = await matchingSvc.getMatchedJobs(userId, { limit, minScore });
  return success(res, { jobs, total: jobs.length });
};

// Add this to your controller file
exports.triggerAutoApply = async (req, res) => {
  const userId = req.user.id;
  const { runAutoApply } = require('../services/autoApply.service');
  
  try {
    const result = await runAutoApply(userId, { dryRun: false, maxBatch: 5 });
    return success(res, result, 'Auto-apply completed');
  } catch (error) {
    return error(res, error.message, 500);
  }
};