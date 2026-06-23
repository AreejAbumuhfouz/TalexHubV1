'use strict';
// backend/routes/settings.routes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCliqSettings, updateCliqSettings } = require('../controllers/settings.controller');

// GET /api/v1/settings/cliq-settings - Get CliQ payment info (any authenticated user)
router.get('/cliq-settings', protect, getCliqSettings);

// PUT /api/v1/settings/cliq-settings - Update CliQ payment info (admin only)
router.put('/cliq-settings', protect, updateCliqSettings);

// module.exports = router;


// 'use strict';
// ════════════════════════════════════════════════════════════
// ADD to backend/routes/settings.routes.js  (or create it)
// Then require it in server.js:
//   const settingsRoutes = require('./routes/settings.routes');
//   app.use(`${process.env.API_PREFIX}/settings`, settingsRoutes);
// ════════════════════════════════════════════════════════════

// const express = require('express');
// const router  = express.Router();

// ── GET /api/v1/settings/public ───────────────────────────
// Returns public config that the frontend needs:
//   - CV daily limits per plan (comes from AIFeatures admin settings)
//   - Any other public flags
// No auth required.
router.get('/public', async (req, res) => {
  try {
    // Try to read from the AiFeatureSetting model if it exists
    let cvLimits = { free: 1, pro: 10, elite: 20 };

    try {
      const { AiFeatureSetting } = require('../models');
      const feat = await AiFeatureSetting.findOne({ where: { featureKey: 'cv_analysis' } });
      if (feat) {
        cvLimits = {
          free:  feat.dailyLimitFree  ?? 1,
          pro:   feat.dailyLimitPro   ?? 10,
          elite: feat.dailyLimitElite ?? 20,
        };
      }
    } catch {
      // Model might not exist yet — use env fallbacks
      cvLimits = {
        free:  parseInt(process.env.CV_LIMIT_FREE  || '1'),
        pro:   parseInt(process.env.CV_LIMIT_PRO   || '10'),
        elite: parseInt(process.env.CV_LIMIT_ELITE || '20'),
      };
    }

    return res.json({
      success: true,
      data: {
        cvLimits,
        appName: process.env.APP_NAME || 'TalexHub',
      },
    });
  } catch (err) {
    return res.json({
      success: true,
      data: { cvLimits: { free: 1, pro: 10, elite: 20 } },
    });
  }
});

module.exports = router;