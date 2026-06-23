

'use strict';

const express    = require('express');
const router     = express.Router();
const { protect } = require('../middleware/auth');
const { JobApplication } = require('../models');
const { getSetting, setSetting } = require('../services/settings.service');
const { success, error }         = require('../utils/apiResponse');
const { Op }                     = require('sequelize');
const autoApplySvc = require('../services/autoApply.service');

// ════════════════════════════════════════════════════════════
// GET /auto-apply/settings
// ════════════════════════════════════════════════════════════
router.get('/settings', protect, async (req, res) => {
  try {
    const raw      = await getSetting(`autoApply.userSettings.${req.user.id}`);
    const defaults = { enabled: false, template: 'classic', coverLetterLang: 'auto' };
    const stored   = raw ? (typeof raw === 'object' ? raw : JSON.parse(raw)) : {};
    const settings = { ...defaults, ...stored };

    // Sync enabled state from User model
    settings.enabled = req.user.autoApplyEnabled ?? settings.enabled;

    return success(res, settings);
  } catch (err) { return error(res, err.message, 500); }
});

// ════════════════════════════════════════════════════════════
// POST /auto-apply/settings
// ════════════════════════════════════════════════════════════
router.post('/settings', protect, async (req, res) => {
  try {
    const { enabled, template, coverLetterLang } = req.body;
    const settings = {
      enabled:         !!enabled,
      template:        template        || 'classic',
      coverLetterLang: coverLetterLang || 'auto',
      // ✅ minMatchScore is admin-controlled only — not user-settable
    };

    await setSetting(`autoApply.userSettings.${req.user.id}`, JSON.stringify(settings));
    await req.user.update({ autoApplyEnabled: !!enabled });

    return success(res, settings, 'Settings saved ✓');
  } catch (err) { return error(res, err.message, 500); }
});

// ════════════════════════════════════════════════════════════
// GET /auto-apply/stats
// ════════════════════════════════════════════════════════════
router.get('/stats', protect, async (req, res) => {
  try {
    const userId  = req.user.id;
    const planKey = req.user.planKey || 'free';

    const [dailyLimit, monthlyLimit, usedToday, usedThisMonth, totalApplied] = await Promise.all([
      autoApplySvc.getDailyLimit(planKey),
      autoApplySvc.getMonthlyLimit(planKey),
      autoApplySvc.countToday(userId),
      autoApplySvc.countThisMonth(userId),
      JobApplication.count({ where: { userId, isAutoApplied: true } }),
    ]);

    const responded = await JobApplication.count({
      where: { userId, isAutoApplied: true, status: { [Op.in]: ['viewed','shortlisted','interview','accepted'] } },
    });
    const responseRate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;

    return success(res, { dailyLimit, monthlyLimit, usedToday, usedThisMonth, totalApplied, responseRate });
  } catch (err) { return error(res, err.message, 500); }
});

// ════════════════════════════════════════════════════════════
// POST /auto-apply/run
// ════════════════════════════════════════════════════════════
router.post('/run', protect, async (req, res) => {
  try {
    const planKey = req.user.planKey || 'free';
    if (!['pro','elite'].includes(planKey) && req.user.role !== 'admin') {
      return error(res, 'Auto-apply requires Pro or Elite plan', 403);
    }

    // ✅ Get user's template/language settings (matchThreshold is admin-only now)
    const raw          = await getSetting(`autoApply.userSettings.${req.user.id}`);
    const userSettings = raw ? (typeof raw === 'object' ? raw : JSON.parse(raw)) : {};
    const maxBatch     = parseInt(req.body.maxBatch) || 5;

    const results = await autoApplySvc.runAutoApply(req.user.id, {
      maxBatch,
      dryRun: req.body.dryRun || false,
      // ✅ no matchThresholdOverride — uses global admin-set threshold
      userSettings,  // template, coverLetterLang only
    });

    return success(res, results, `Applied to ${results.applied?.length || 0} jobs`);
  } catch (err) { return error(res, err.message, 500); }
});

module.exports = router;