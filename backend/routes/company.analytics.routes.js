'use strict';

const express  = require('express');
const router   = express.Router();
const { query, param, body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const ctrl     = require('../controllers/Company/company.analytics.controller');
const appCtrl  = require('../controllers/application.controller');

// كل الـ routes تتطلب مصادقة + دور company أو admin
router.use(protect, authorize('company', 'admin'));

// ── Analytics ─────────────────────────────────────────────
router.get('/overview',
  [query('range').optional().isInt({ min: 1, max: 365 })],
  validate, ctrl.getOverview
);

router.get('/applicants-over-time',
  [query('range').optional().isInt({ min: 1, max: 365 })],
  validate, ctrl.getApplicantsOverTime
);

router.get('/top-jobs',  ctrl.getTopJobs);

// ── Pipeline ──────────────────────────────────────────────
router.get('/pipeline',
  [query('jobId').optional().isUUID()],
  validate, ctrl.getPipeline
);

// ── Update status from pipeline ───────────────────────────
router.patch('/applications/:id/status',
  [
    param('id').isUUID(),
    body('status').isIn(['viewed','shortlisted','interview','accepted','rejected']),
    body('interviewAt').optional().isISO8601(),
    body('companyNote').optional().trim().isLength({ max: 1000 }),
  ],
  validate, appCtrl.updateStatus
);

module.exports = router;
