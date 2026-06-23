
// 'use strict';

// // ════════════════════════════════════════════════════════════
// // Matching Service — AI Job Matching
// // Uses keyword overlap + skill matching (no OpenAI embeddings needed)
// // Can be upgraded to embeddings later
// // ════════════════════════════════════════════════════════════

// const { Job, CV, Company, JobCategory } = require('../models');
// const { Op } = require('sequelize');

// /* ── Normalize text ─────────────────────────────────────── */
// const normalize = (text = '') =>
//   text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

// /* ── Stop words to ignore ───────────────────────────────── */
// const STOP = new Set(['the','and','for','with','that','this','from','have','will','your','about','which','they','been','more','also','into','than','when','what','were','their','there','other','some','such','each','most']);

// const tokens = (text = '') => normalize(text).filter(w => !STOP.has(w));

// /* ══════════════════════════════════════════════════════════
//    CORE: Score a single CV against a single job (0-100)
// ═══════════════════════════════════════════════════════════ */
// const scoreMatch = (cvData, jobData) => {
//   let score = 0;

//   // ── 1. Skills match (40 points) ─────────────────────────
//   const jobSkills = (jobData.skillsRequired || []).map(s => s.toLowerCase());
//   const cvSkills  = tokens(cvData.skills || '');
//   const cvText    = tokens([cvData.summary, cvData.experience, cvData.rawText].filter(Boolean).join(' '));

//   if (jobSkills.length > 0) {
//     const matched = jobSkills.filter(s =>
//       cvSkills.some(cs => cs.includes(s) || s.includes(cs)) ||
//       cvText.some(ct => ct.includes(s) || s.includes(ct))
//     );
//     score += Math.round((matched.length / jobSkills.length) * 40);
//   } else {
//     score += 20; // no skills listed → neutral
//   }

//   // ── 2. Keywords overlap (30 points) ─────────────────────
//   const jobTokens = tokens([jobData.title, jobData.description, (jobData.keywords || []).join(' ')].join(' '));
//   const cvAllTokens = tokens([cvData.rawText, cvData.summary, cvData.skills].filter(Boolean).join(' '));

//   const uniqueJobTokens = [...new Set(jobTokens)];
//   if (uniqueJobTokens.length > 0) {
//     const overlap = uniqueJobTokens.filter(t => cvAllTokens.includes(t));
//     score += Math.round((overlap.length / Math.min(uniqueJobTokens.length, 30)) * 30);
//   } else {
//     score += 15;
//   }

//   // ── 3. Location match (15 points) ───────────────────────
//   const cvCountry = (cvData.locationCountry || '').toLowerCase();
//   const cvCity    = (cvData.locationCity    || '').toLowerCase();
//   const jobCountry = (jobData.locationCountry || '').toLowerCase();
//   const jobCity    = (jobData.locationCity    || '').toLowerCase();

//   if (jobData.isRemote) {
//     score += 15; // remote = always a match
//   } else if (cvCountry && jobCountry && cvCountry === jobCountry) {
//     score += cvCity && jobCity && cvCity === jobCity ? 15 : 10;
//   }

//   // ── 4. Job type preference (15 points) ──────────────────
//   const desiredTypes = cvData.desiredJobTypes || [];
//   if (desiredTypes.length === 0 || desiredTypes.includes(jobData.jobType)) {
//     score += 15;
//   }

//   return Math.min(Math.round(score), 100);
// };

// /* ══════════════════════════════════════════════════════════
//    GET MATCHED JOBS for a user
//    Returns top N jobs sorted by match score
// ═══════════════════════════════════════════════════════════ */
// const getMatchedJobs = async (userId, { limit = 10, minScore = 40 } = {}) => {
//   // Get user's primary CV data
//   const cv = await CV.findOne({
//     where: { userId, isPrimary: true, deletedAt: null },
//     order: [['created_at', 'DESC']],
//   });

//   if (!cv) return [];

//   // Get user profile for preferences
//   const { User } = require('../models');
//   const user = await User.findByPk(userId, {
//     attributes: ['desiredJobTitle', 'desiredJobTypes', 'locationCountry', 'locationCity', 'desiredIndustries'],
//   });

//   const cvData = {
//     rawText:        cv.rawText        || '',
//     summary:        cv.summary        || '',
//     skills:         (cv.extractedSkills || []).join(' '),
//     experience:     cv.experience     || '',
//     locationCountry: user?.locationCountry || '',
//     locationCity:    user?.locationCity    || '',
//     desiredJobTypes: user?.desiredJobTypes || [],
//   };

//   // Fetch active jobs (limit to 200 for performance)
//   const jobs = await Job.findAll({
//     where: { status: 'active', deletedAt: null },
//     attributes: ['id','title','titleAr','description','skillsRequired','keywords','job_type','locationCountry','locationCity','is_remote','salary_min','salary_max','salaryCurrency','salaryVisible','created_at','slug','applicationsCount','easyApply'],
//     include: [
//       { model: Company,     as: 'company',  attributes: ['id','name','logoUrl','locationCity','industry'], where: { status: 'active' }, required: true },
//       { model: JobCategory, as: 'category', attributes: ['id','name','nameAr','icon'], required: false },
//     ],
//     order: [['created_at', 'DESC']],
//     limit: 200,
//   });

//   // Score each job
//   const scored = jobs
//     .map(job => ({
//       ...job.toJSON(),
//       matchScore: scoreMatch(cvData, job.toJSON()),
//     }))
//     .filter(j => j.matchScore >= minScore)
//     .sort((a, b) => b.matchScore - a.matchScore)
//     .slice(0, limit);

//   return scored;
// };

// /* ══════════════════════════════════════════════════════════
//    SCORE a specific CV against a specific job (for display)
// ═══════════════════════════════════════════════════════════ */
// const scoreJobForUser = async (userId, jobId) => {
//   const { User } = require('../models');
//   const [cv, job, user] = await Promise.all([
//     CV.findOne({ where: { userId, isPrimary: true, deletedAt: null } }),
//     Job.findByPk(jobId),
//     User.findByPk(userId, {
//       attributes: ['desiredJobTitle', 'desiredJobTypes', 'locationCountry', 'locationCity', 'desiredIndustries'],
//     }),
//   ]);
//   if (!cv || !job) return 0;

//   // Same cvData structure as getMatchedJobs — unified scoring
//   const cvData = {
//     rawText:         cv.rawText         || '',
//     summary:         cv.summary         || '',
//     skills:          (cv.extractedSkills || []).join(' '),
//     experience:      cv.experience      || '',
//     locationCountry: user?.locationCountry || '',
//     locationCity:    user?.locationCity    || '',
//     desiredJobTypes: user?.desiredJobTypes || [],
//   };

//   return scoreMatch(cvData, job.toJSON());
// };

// /* ══════════════════════════════════════════════════════════
//    AUTO DELETE — remove expired jobs (called by cron job)
// ═══════════════════════════════════════════════════════════ */
// const deleteExpiredJobs = async () => {
//   const now = new Date();
//   const result = await Job.update(
//     { status: 'closed', deletedAt: now },
//     {
//       where: {
//         status:    { [Op.in]: ['active', 'pending_approval'] },
//         deadline:  { [Op.lt]: now },
//         deletedAt: null,
//       },
//     }
//   );
//   return result[0]; // number of updated rows
// };

// module.exports = {
//   scoreMatch,
//   getMatchedJobs,
//   scoreJobForUser,
//   deleteExpiredJobs,
// };

'use strict';

// ════════════════════════════════════════════════════════════
// Matching Service — Hybrid Matching
// Stage 1: Fast keyword/skill algorithm (0 tokens) — pre-filter
// Stage 2: AI-based deep match scoring (uses points) — final score
// ════════════════════════════════════════════════════════════

const { Job, CV, Company, JobCategory } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/* ── Normalize text ─────────────────────────────────────── */
const normalize = (text = '') =>
  text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);

/* ── Stop words to ignore ───────────────────────────────── */
const STOP = new Set(['the','and','for','with','that','this','from','have','will','your','about','which','they','been','more','also','into','than','when','what','were','their','there','other','some','such','each','most']);

const tokens = (text = '') => normalize(text).filter(w => !STOP.has(w));

/* ══════════════════════════════════════════════════════════
   STAGE 1 — fast algorithm score (0 tokens, unchanged)
   Used to pre-filter large job lists before any AI call.
═══════════════════════════════════════════════════════════ */
const scoreMatch = (cvData, jobData) => {
  let score = 0;

  // ── 1. Skills match (40 points) ─────────────────────────
  const jobSkills = (jobData.skillsRequired || []).map(s => s.toLowerCase());
  const cvSkills  = tokens(cvData.skills || '');
  const cvText    = tokens([cvData.summary, cvData.experience, cvData.rawText].filter(Boolean).join(' '));

  if (jobSkills.length > 0) {
    const matched = jobSkills.filter(s =>
      cvSkills.some(cs => cs.includes(s) || s.includes(cs)) ||
      cvText.some(ct => ct.includes(s) || s.includes(ct))
    );
    score += Math.round((matched.length / jobSkills.length) * 40);
  } else {
    score += 20;
  }

  // ── 2. Keywords overlap (30 points) ─────────────────────
  const jobTokens = tokens([jobData.title, jobData.description, (jobData.keywords || []).join(' ')].join(' '));
  const cvAllTokens = tokens([cvData.rawText, cvData.summary, cvData.skills].filter(Boolean).join(' '));

  const uniqueJobTokens = [...new Set(jobTokens)];
  if (uniqueJobTokens.length > 0) {
    const overlap = uniqueJobTokens.filter(t => cvAllTokens.includes(t));
    score += Math.round((overlap.length / Math.min(uniqueJobTokens.length, 30)) * 30);
  } else {
    score += 15;
  }

  // ── 3. Location match (15 points) ───────────────────────
  const cvCountry = (cvData.locationCountry || '').toLowerCase();
  const cvCity    = (cvData.locationCity    || '').toLowerCase();
  const jobCountry = (jobData.locationCountry || '').toLowerCase();
  const jobCity    = (jobData.locationCity    || '').toLowerCase();

  if (jobData.isRemote) {
    score += 15;
  } else if (cvCountry && jobCountry && cvCountry === jobCountry) {
    score += cvCity && jobCity && cvCity === jobCity ? 15 : 10;
  }

  // ── 4. Job type preference (15 points) ──────────────────
  const desiredTypes = cvData.desiredJobTypes || [];
  if (desiredTypes.length === 0 || desiredTypes.includes(jobData.jobType)) {
    score += 15;
  }

  return Math.min(Math.round(score), 100);
};

/* ══════════════════════════════════════════════════════════
   ✅ STAGE 2 — AI deep match score (uses points/tokens)
   Reads the actual CV content and job description, returns
   a more accurate score + short reasoning. Falls back to the
   algorithm score on any failure so callers never get 0.
═══════════════════════════════════════════════════════════ */
const aiScoreMatch = async (cvText, jobData, userInfo = {}) => {
  try {
    const aiSvc = require('./ai.service');
    const result = await aiSvc.matchCVToJob(
      cvText,
      jobData.title,
      jobData.description || '',
      (jobData.requirements || []).join(', '),
      userInfo
    );
    if (result && typeof result.matchScore === 'number') {
      return { score: Math.max(0, Math.min(100, Math.round(result.matchScore))), aiUsed: true, details: result };
    }
    return null;
  } catch (e) {
    logger.warn('[matching] aiScoreMatch failed, falling back to algorithm:', e.message);
    return null;
  }
};

/* ══════════════════════════════════════════════════════════
   GET MATCHED JOBS for a user (browse/matched tab — algorithm only,
   no AI cost for casual browsing)
═══════════════════════════════════════════════════════════ */
const getMatchedJobs = async (userId, { limit = 10, minScore = 40 } = {}) => {
  const cv = await CV.findOne({
    where: { userId, isPrimary: true, deletedAt: null },
    order: [['created_at', 'DESC']],
  });
  if (!cv) return [];

  const { User } = require('../models');
  const user = await User.findByPk(userId, {
    attributes: ['desiredJobTitle', 'desiredJobTypes', 'locationCountry', 'locationCity', 'desiredIndustries'],
  });

  const cvData = {
    rawText:         cv.rawText         || '',
    summary:         cv.summary         || '',
    skills:          (cv.extractedSkills || []).join(' '),
    experience:      cv.experience      || '',
    locationCountry: user?.locationCountry || '',
    locationCity:    user?.locationCity    || '',
    desiredJobTypes: user?.desiredJobTypes || [],
  };

  const jobs = await Job.findAll({
    where: { status: 'active', deletedAt: null },
    attributes: ['id','title','titleAr','description','skillsRequired','keywords','job_type','locationCountry','locationCity','is_remote','salary_min','salary_max','salaryCurrency','salaryVisible','created_at','slug','applicationsCount','easyApply'],
    include: [
      { model: Company,     as: 'company',  attributes: ['id','name','logoUrl','locationCity','industry'], where: { status: 'active' }, required: true },
      { model: JobCategory, as: 'category', attributes: ['id','name','nameAr','icon'], required: false },
    ],
    order: [['created_at', 'DESC']],
    limit: 200,
  });

  const scored = jobs
    .map(job => ({ ...job.toJSON(), matchScore: scoreMatch(cvData, job.toJSON()) }))
    .filter(j => j.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};

/* ══════════════════════════════════════════════════════════
   SCORE a specific CV against a specific job — algorithm only
   (kept for backwards compatibility / display on job detail page,
   where calling AI on every page view would be wasteful)
═══════════════════════════════════════════════════════════ */
const scoreJobForUser = async (userId, jobId) => {
  const { User } = require('../models');
  const [cv, job, user] = await Promise.all([
    CV.findOne({ where: { userId, isPrimary: true, deletedAt: null } }),
    Job.findByPk(jobId),
    User.findByPk(userId, {
      attributes: ['desiredJobTitle', 'desiredJobTypes', 'locationCountry', 'locationCity', 'desiredIndustries'],
    }),
  ]);
  if (!cv || !job) return 0;

  const cvData = {
    rawText:         cv.rawText         || '',
    summary:         cv.summary         || '',
    skills:          (cv.extractedSkills || []).join(' '),
    experience:      cv.experience      || '',
    locationCountry: user?.locationCountry || '',
    locationCity:    user?.locationCity    || '',
    desiredJobTypes: user?.desiredJobTypes || [],
  };

  return scoreMatch(cvData, job.toJSON());
};

/* ══════════════════════════════════════════════════════════
   ✅ NEW: scoreJobForUserHybrid — used by Auto-Apply only
   Stage 1 (free): quick algorithm pre-check. If it clears a low
   bar, Stage 2 (AI, costs points) gives the real final score that
   decides whether to actually apply. This keeps AI calls limited
   to jobs that already look plausible, instead of running AI on
   every single active job in the database.
═══════════════════════════════════════════════════════════ */
const PREFILTER_MIN_SCORE = 35; // algorithm floor before bothering with AI

const scoreJobForUserHybrid = async (userId, jobId, userInfo = {}) => {
  const { User } = require('../models');
  const [cv, job, user] = await Promise.all([
    CV.findOne({ where: { userId, isPrimary: true, deletedAt: null } }),
    Job.findByPk(jobId),
    User.findByPk(userId, {
      attributes: ['desiredJobTitle', 'desiredJobTypes', 'locationCountry', 'locationCity', 'desiredIndustries'],
    }),
  ]);
  if (!cv || !job) return { score: 0, aiUsed: false, stage: 'none' };

  const cvData = {
    rawText:         cv.rawText         || '',
    summary:         cv.summary         || '',
    skills:          (cv.extractedSkills || []).join(' '),
    experience:      cv.experience      || '',
    locationCountry: user?.locationCountry || '',
    locationCity:    user?.locationCity    || '',
    desiredJobTypes: user?.desiredJobTypes || [],
  };

  const jobData = job.toJSON();

  // Stage 1 — free pre-filter
  const algoScore = scoreMatch(cvData, jobData);
  if (algoScore < PREFILTER_MIN_SCORE) {
    return { score: algoScore, aiUsed: false, stage: 'algorithm', reason: 'below_prefilter' };
  }

  // Stage 2 — AI deep score (costs points), only for jobs that passed the pre-filter
  const cvText = cv.rawText || cvData.summary || '';
  if (cvText.length > 50) {
    const aiResult = await aiScoreMatch(cvText, jobData, userInfo);
    if (aiResult) {
      return { score: aiResult.score, aiUsed: true, stage: 'ai', details: aiResult.details };
    }
  }

  // AI failed or no usable CV text — fall back to algorithm score
  return { score: algoScore, aiUsed: false, stage: 'algorithm_fallback' };
};

/* ══════════════════════════════════════════════════════════
   AUTO DELETE — remove expired jobs (called by cron job)
═══════════════════════════════════════════════════════════ */
const deleteExpiredJobs = async () => {
  const now = new Date();
  const result = await Job.update(
    { status: 'closed', deletedAt: now },
    {
      where: {
        status:    { [Op.in]: ['active', 'pending_approval'] },
        deadline:  { [Op.lt]: now },
        deletedAt: null,
      },
    }
  );
  return result[0];
};

module.exports = {
  scoreMatch,
  getMatchedJobs,
  scoreJobForUser,        // unchanged — algorithm only, used for display
  scoreJobForUserHybrid,  // ✅ new — algorithm + AI, used by Auto-Apply
  deleteExpiredJobs,
};