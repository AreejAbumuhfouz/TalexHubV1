'use strict';
// ════════════════════════════════════════════════════════════
// job.routes.js
// ════════════════════════════════════════════════════════════

const express      = require('express');
const router       = express.Router();
const { body }     = require('express-validator');
const validate     = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const checkFeature = require('../middleware/checkFeature');
const ctrl         = require('../controllers/job.controller');
const appCtrl      = require('../controllers/application.controller');
const autoApplySvc = require('../services/autoApply.service');
const { success, error } = require('../utils/apiResponse');


// ── Public (no auth needed) ───────────────────────────────
router.get('/',                   ctrl.getJobs);
router.get('/categories',         ctrl.getCategories);
router.get('/search/suggestions', ctrl.getSuggestions);




// ── Auto-apply status + trigger (must be before /:id) ────
router.get('/auto-apply/status', protect, authorize('user'), async (req, res) => {
  try {
    const planKey = req.user.planKey || 'free';
    const canUse  = ['pro', 'elite'].includes(planKey);

    if (!canUse) {
      return success(res, {
        canUse: false, planKey, monthlyLimit: 0, dailyLimit: 0,
        usedThisMonth: 0, usedToday: 0, remaining: 0, remainingToday: 0,
        matchThreshold: 65, openToWork: req.user.openToWork,
      });
    }

    const [monthlyLimit, dailyLimit, usedThisMonth, usedToday, matchThreshold] = await Promise.all([
      autoApplySvc.getMonthlyLimit(planKey),
      autoApplySvc.getDailyLimit(planKey),
      autoApplySvc.countThisMonth(req.user.id),
      autoApplySvc.countToday(req.user.id),
      autoApplySvc.getMatchThreshold(),
    ]);

    return success(res, {
      canUse, planKey,
      monthlyLimit, dailyLimit,
      usedThisMonth, usedToday,
      remaining:      Math.max(0, monthlyLimit - usedThisMonth),
      remainingToday: Math.max(0, dailyLimit   - usedToday),
      matchThreshold,
      openToWork: req.user.openToWork,
    });
  } catch (e) { return error(res, e.message, 500); }
});

router.post('/auto-apply/run', protect, authorize('user'), async (req, res) => {
  try {
    const { dryRun = false, maxBatch = 5 } = req.body;
    const result = await autoApplySvc.runAutoApply(req.user.id, {
      dryRun, maxBatch: Math.min(parseInt(maxBatch) || 5, 10),
    });
    return success(res, result, dryRun ? 'Preview ready' : `Applied to ${result.applied.length} jobs`);
  } catch (e) { return error(res, e.message, 500); }
});

// ── Single job (public) ───────────────────────────────────
router.get('/:id', ctrl.getJob);

// ── Job match score — BUG FIX: was missing, caused 404 toast ──
// Returns AI match score between the user's primary CV and this job
router.get('/:id/match-score', protect, authorize('user'), async (req, res) => {
  try {
    const { CV, JobApplication } = require('../models');
    const { Op } = require('sequelize');

    // Check if already applied — return stored score
    const existing = await JobApplication.findOne({
      where: { jobId: req.params.id, userId: req.user.id },
      attributes: ['matchScore', 'aiSummary'],
    });
    if (existing?.matchScore) {
      return success(res, { score: Number(existing.matchScore), summary: existing.aiSummary, source: 'application' });
    }

    // Calculate from CV skills vs job keywords
    const cv = await CV.findOne({
      where: { userId: req.user.id, isPrimary: true, deletedAt: null },
      attributes: ['extractedSkills', 'keywords'],
    });
    if (!cv) return success(res, { score: null, summary: null, source: 'no_cv' });

    const { Job } = require('../models');
    const job = await Job.findByPk(req.params.id, { attributes: ['skillsRequired', 'keywords', 'title'] });
    if (!job) return error(res, 'Job not found', 404);

    const userSkills  = [...(cv.extractedSkills || []), ...(cv.keywords || [])].map(s => s.toLowerCase());
    const jobSkills   = [...(job.skillsRequired || []), ...(job.keywords || [])].map(s => s.toLowerCase());

    if (!jobSkills.length) return success(res, { score: null, summary: null, source: 'no_skills' });

    const matched = jobSkills.filter(s => userSkills.some(u => u.includes(s) || s.includes(u)));
    const score   = Math.round((matched.length / jobSkills.length) * 100);
    const clamped = Math.min(Math.max(score, 5), 98);

    return success(res, {
      score: clamped,
      matchedSkills: matched,
      totalRequired: jobSkills.length,
      source: 'calculated',
    });
  } catch (e) { return error(res, e.message, 500); }
});

// ── User: apply — checks plan limit ──────────────────────
router.post(
  '/:id/apply',
  protect,
  authorize('user'),
  checkFeature('jobApplications'),
  appCtrl.applyToJob
);

// ── Company: view applicants ──────────────────────────────
router.get('/:id/applications', protect, authorize('company'), appCtrl.getJobApplications);

// ── Company: manage jobs ──────────────────────────────────
router.post('/',
  protect,
  authorize('company'),
  [
    body('title').trim().notEmpty().isLength({ max: 255 }),
    body('description').trim().notEmpty(),
    body('jobType').isIn(['full_time', 'part_time', 'freelance', 'internship', 'remote']),
  ],
  validate,
  ctrl.createJob
);

router.patch('/:id',  protect, authorize('company'), ctrl.updateJob);
router.delete('/:id', protect, authorize('company'), ctrl.deleteJob);

module.exports = router;