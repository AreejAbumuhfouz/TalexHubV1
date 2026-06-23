'use strict';

const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');

const ctrl    = require('../controllers/application.controller');

const checkFeature = require('../middleware/checkFeature');

router.post('/auto-apply/trigger', protect, checkFeature('autoApply'), ctrl.triggerAutoApply);

// ── User: my applications ─────────────────────────────────
router.get('/me', protect, authorize('user'), ctrl.getMyApplications);

// ── User: AI matched jobs ─────────────────────────────────
router.get('/matched-jobs', protect, authorize('user'), ctrl.getMatchedJobs);

// ── Company: update application status ───────────────────
router.patch('/:id/status', protect, authorize('company'), ctrl.updateStatus);
// In your routes file
// router.post('/auto-apply/trigger', protect, ctrl.triggerAutoApply);
module.exports = router;