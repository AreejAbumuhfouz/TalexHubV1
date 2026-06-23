'use strict';
// backend/middleware/checkFeature.js
// ════════════════════════════════════════════════════════════
// Enforces plan feature limits — reads from DB (live),
// falls back to config/pricing.js if DB has nothing.
// Works for BOTH boolean features and daily/total numeric limits.
// ════════════════════════════════════════════════════════════

const { PLAN_FEATURES: DEFAULTS } = require('../config/pricing');
const Setting  = require('../models/Setting');
const { Op }   = require('sequelize');

const FEATURES_KEY = 'pricing.features';

// In-memory cache (60s TTL)
let _cache     = null;
let _cacheTime = 0;
const TTL      = 60_000;

async function loadFeatures() {
  const now = Date.now();
  if (_cache && now - _cacheTime < TTL) return _cache;
  try {
    const row  = await Setting.findByPk(FEATURES_KEY);
    _cache     = row ? JSON.parse(row.value) : JSON.parse(JSON.stringify(DEFAULTS));
    _cacheTime = now;
    return _cache;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

function bustCache() { _cache = null; _cacheTime = 0; }

async function countTodayUsage(userId, featureKey) {
  try {
    const { TokenUsage } = require('../models');
    const start = new Date(); start.setHours(0, 0, 0, 0);
    return await TokenUsage.count({ where: { userId, feature: featureKey, status: 'success', timestamp: { [Op.gte]: start } } });
  } catch { return 0; }
}

// ── Feature key → limit field mapping ───────────────────
const KEY_MAP = {
  cvUpload:         'cvUploads',
  aiAnalysis:       'aiAnalysis',
  coverLetter:      'coverLetterDaily',
  interview:        'training',
  careerPath:       'careerPathDaily',
  autoApply:        'autoApplyDaily',
  chat:             'chatDaily',
  jobApplications:  'jobApplications',
  cvBuilder:        'cvBuilder',
  courses:          'courses',
  prioritySupport:  'prioritySupport',
};

const checkFeature = (featureKey) => async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required', upgradeRequired: false });

    const features  = await loadFeatures();
    const planKey   = req.user.planKey || 'free';
    const planFeat  = features[planKey] || DEFAULTS[planKey] || {};
    const limitKey  = KEY_MAP[featureKey] || featureKey;
    const limit     = planFeat[limitKey];

    // Boolean feature check
    if (typeof limit === 'boolean') {
      if (!limit) return res.status(403).json({
        success: false, upgradeRequired: true, feature: featureKey, planKey,
        message: `هذه الميزة غير متاحة في خطة ${planKey}. يرجى الترقية.`,
        messageEn: `${featureKey} is not available on your ${planKey} plan. Please upgrade.`,
      });
      return next();
    }

    // Unlimited
    if (limit === undefined || limit === -1) return next();

    // Blocked (0)
    if (limit === 0) return res.status(403).json({
      success: false, upgradeRequired: true, feature: featureKey, planKey, limit: 0,
      message: `هذه الميزة غير متاحة في خطتك الحالية.`,
      messageEn: `This feature is not available on your current plan.`,
    });

    // Daily usage count
    const used = await countTodayUsage(req.user.id, featureKey);
    if (used >= limit) {
      const tomorrow = new Date(); tomorrow.setHours(24, 0, 0, 0);
      return res.status(429).json({
        success: false, upgradeRequired: true, feature: featureKey, planKey,
        used, limit, resetsAt: tomorrow.toISOString(),
        message: `وصلت للحد اليومي (${limit} مرة). سيتجدد الرصيد غداً.`,
        messageEn: `Daily limit reached (${limit}/${limit} uses). Resets tomorrow.`,
      });
    }

    req.planLimit = { feature: featureKey, used, limit, remaining: limit - used };
    next();
  } catch (err) {
    console.error('[checkFeature]', err.message);
    next(); // fail open
  }
};

module.exports = checkFeature;
module.exports.bustCache = bustCache;
