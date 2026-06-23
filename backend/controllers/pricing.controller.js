


// 'use strict';
// // backend/controllers/pricing.controller.js
// // ════════════════════════════════════════════════════════════
// // Per-country pricing controller
// // DB keys:
// //   pricing.countries → overrides for individual countries
// //   pricing.features  → PLAN_FEATURES overrides
// // ════════════════════════════════════════════════════════════

// const Setting = require('../models/Setting');
// const AuditLog = require('../models/AuditLog');
// const { success, error } = require('../utils/apiResponse');
// const detectCountry = require('../utils/detectCountry'); // ✅ استخدم الملف الموحد
// const {
//   COUNTRY_PRICING, DEFAULT_PRICING, FREE_PLAN,
//   PLAN_FEATURES: DEFAULT_FEATURES,
//   buildPlansForCountry, getPricingForCountry,
// } = require('../config/pricing');

// let _checkFeatureCache = null;
// try { _checkFeatureCache = require('../middleware/checkFeature'); } catch {}
// let _planLimitsCache = null;
// try { _planLimitsCache = require('../middleware/planLimits'); } catch {}

// const COUNTRIES_KEY = 'pricing.countries';
// const FEATURES_KEY  = 'pricing.features';

// // ── Loaders ───────────────────────────────────────────────
// async function loadCountryPricing() {
//   const row = await Setting.findByPk(COUNTRIES_KEY).catch(() => null);
//   if (!row) return {};
//   try { return JSON.parse(row.value); } catch { return {}; }
// }

// async function loadFeatures() {
//   const row = await Setting.findByPk(FEATURES_KEY).catch(() => null);
//   if (!row) return JSON.parse(JSON.stringify(DEFAULT_FEATURES));
//   try { return JSON.parse(row.value); } catch { return JSON.parse(JSON.stringify(DEFAULT_FEATURES)); }
// }

// // ✅ حذف الدالة المحلية detectCountry - أصبحت مستوردة من utils

// function mergedPricingForCountry(cc, overrides) {
//   const base     = getPricingForCountry(cc); // from config defaults
//   const override = overrides[cc];
//   if (!override) return base;
//   return {
//     ...base,
//     pro:   { ...base.pro,   ...(override.pro   || {}) },
//     elite: { ...base.elite, ...(override.elite || {}) },
//     currency: override.currency || base.currency,
//     symbol:   override.symbol   || base.symbol,
//   };
// }

// // ════════════════════════════════════════════════════════════
// //  PUBLIC: GET /plans
// // ════════════════════════════════════════════════════════════
// exports.getPlans = async (req, res) => {
//   try {
//     // ✅ changed default from 'AE' to 'USA'
//     const cc = detectCountry(req) || req.query.country || 'USA';
//     const [overrides, features] = await Promise.all([loadCountryPricing(), loadFeatures()]);

//     const cp    = mergedPricingForCountry(cc, overrides);
//     const plans = [
//       {
//         key: 'free', name: 'Free', nameAr: 'مجاني',
//         monthly: 0, yearly: 0,
//         currency: cp.currency, symbol: cp.symbol,
//         features: features.free || DEFAULT_FEATURES.free, savings: 0,
//       },
//       {
//         key: 'pro', name: 'Pro', nameAr: 'احترافي',
//         ...cp.pro, currency: cp.currency, symbol: cp.symbol,
//         features: features.pro || DEFAULT_FEATURES.pro,
//         savings: cp.pro.monthly > 0 ? Math.round((1 - cp.pro.yearly / (cp.pro.monthly * 12)) * 100) : 0,
//       },
//       {
//         key: 'elite', name: 'Elite', nameAr: 'النخبة',
//         ...cp.elite, currency: cp.currency, symbol: cp.symbol,
//         features: features.elite || DEFAULT_FEATURES.elite,
//         savings: cp.elite.monthly > 0 ? Math.round((1 - cp.elite.yearly / (cp.elite.monthly * 12)) * 100) : 0,
//       },
//     ];

//     return success(res, {
//       country:    cc,
//       countryName: cp.name,
//       currency:   cp.currency,
//       symbol:     cp.symbol,
//       usdRate:    cp.usdRate || 1,
//       tier:       cc, tierId: cc, tierLabel: cp.name,
//       plans,
//       // Legacy: allTiers = just this country for dropdown
//       allTiers: [{ id: cc, label: cp.name, currency: cp.currency, symbol: cp.symbol, countries: [cc] }],
//     });
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// //  PUBLIC: GET /plans/geo
// // ════════════════════════════════════════════════════════════
// exports.getGeo = async (req, res) => {
//   const cc = detectCountry(req);
//   if (!cc) return success(res, { country: null, tier: null });
//   const cp = getPricingForCountry(cc);
//   return success(res, { country: cc, tier: cc, countryName: cp.name, currency: cp.currency });
// };

// // ════════════════════════════════════════════════════════════
// //  ADMIN: GET /admin/pricing
// //  Returns all countries with their prices for the admin table
// // ════════════════════════════════════════════════════════════
// exports.adminGetPricing = async (_req, res) => {
//   try {
//     const [overrides, features] = await Promise.all([loadCountryPricing(), loadFeatures()]);

//     // Build merged list of all countries
//     const allCountries = {};
//     Object.entries(COUNTRY_PRICING).forEach(([cc, base]) => {
//       allCountries[cc] = {
//         ...base,
//         pro:   { ...base.pro,   ...(overrides[cc]?.pro   || {}) },
//         elite: { ...base.elite, ...(overrides[cc]?.elite || {}) },
//         currency: overrides[cc]?.currency || base.currency,
//         symbol:   overrides[cc]?.symbol   || base.symbol,
//         _overridden: !!overrides[cc],
//       };
//     });

//     // Keep tiers for backward compat (admin pricing tab prices section)
//     const tiers = {
//       countries: allCountries,
//     };

//     return success(res, { tiers, features, countries: allCountries, overrides });
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// //  ADMIN: PUT /admin/pricing/tiers
// //  Saves per-country price overrides
// //  Body: { tiers: { countries: { JO: { pro: {...}, elite: {...} }, ... } } }
// //     OR: { tiers: { JO: { pro: {...} }, ... } }  (direct object)
// // ════════════════════════════════════════════════════════════
// exports.adminSaveTiers = async (req, res) => {
//   try {
//     const body = req.body.tiers;
//     if (!body || typeof body !== 'object') return error(res, 'tiers object required', 400);

//     // Support both formats:
//     // { tiers: { countries: { JO: {...} } } } or { tiers: { JO: {...} } }
//     const countryData = body.countries || body;

//     await Setting.upsert({ key: COUNTRIES_KEY, value: JSON.stringify(countryData) });
//     await AuditLog.create({
//       actorId: req.user.id, action: 'pricing.update_countries',
//       entity: 'Setting', entityId: null,
//       meta: { countriesCount: Object.keys(countryData).length },
//     }).catch(() => {});

//     return success(res, {}, 'Country pricing saved');
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// //  ADMIN: PUT /admin/pricing/features
// // ════════════════════════════════════════════════════════════
// exports.adminSaveFeatures = async (req, res) => {
//   try {
//     const { features } = req.body;
//     if (!features || typeof features !== 'object') return error(res, 'features object required', 400);
//     await Setting.upsert({ key: FEATURES_KEY, value: JSON.stringify(features) });
//     if (_checkFeatureCache?.bustCache) _checkFeatureCache.bustCache();
//     if (_planLimitsCache?.bustFeatureCache) _planLimitsCache.bustFeatureCache();
//     await AuditLog.create({ actorId: req.user.id, action: 'pricing.update_features', entity: 'Setting', entityId: null, meta: {} }).catch(() => {});
//     return success(res, { features }, 'Plan features saved');
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// //  ADMIN: POST /admin/pricing/reset
// // ════════════════════════════════════════════════════════════
// exports.adminResetPricing = async (req, res) => {
//   try {
//     await Setting.destroy({ where: { key: COUNTRIES_KEY } });
//     await Setting.destroy({ where: { key: FEATURES_KEY } });
//     if (_checkFeatureCache?.bustCache) _checkFeatureCache.bustCache();
//     if (_planLimitsCache?.bustFeatureCache) _planLimitsCache.bustFeatureCache();
//     await AuditLog.create({ actorId: req.user.id, action: 'pricing.reset', entity: 'Setting', entityId: null, meta: {} }).catch(() => {});
//     return success(res, {}, 'Pricing reset to defaults');
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

'use strict';
// backend/controllers/pricing.controller.js
// ════════════════════════════════════════════════════════════
// Per-country pricing controller
// DB keys:
//   pricing.countries → overrides for individual countries
//   pricing.features  → manual PLAN_FEATURES overrides (legacy,
//                        now superseded by live feature sync below)
// ════════════════════════════════════════════════════════════

const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');
const { success, error } = require('../utils/apiResponse');
const detectCountry = require('../utils/detectCountry');
const {
  COUNTRY_PRICING, DEFAULT_PRICING, FREE_PLAN,
  PLAN_FEATURES: DEFAULT_FEATURES,
  buildPlansForCountry, getPricingForCountry,
} = require('../config/pricing');

let _checkFeatureCache = null;
try { _checkFeatureCache = require('../middleware/checkFeature'); } catch {}
let _planLimitsCache = null;
try { _planLimitsCache = require('../middleware/planLimits'); } catch {}

const COUNTRIES_KEY = 'pricing.countries';
const FEATURES_KEY  = 'pricing.features';

// ── Loaders ───────────────────────────────────────────────
async function loadCountryPricing() {
  const row = await Setting.findByPk(COUNTRIES_KEY).catch(() => null);
  if (!row) return {};
  try { return JSON.parse(row.value); } catch { return {}; }
}

// kept for adminGetPricing / manual override editor — no longer
// used by getPlans (see getLiveFeatures below)
async function loadFeatures() {
  const row = await Setting.findByPk(FEATURES_KEY).catch(() => null);
  if (!row) return JSON.parse(JSON.stringify(DEFAULT_FEATURES));
  try { return JSON.parse(row.value); } catch { return JSON.parse(JSON.stringify(DEFAULT_FEATURES)); }
}

/* ─────────────────────────────────────────────────────────
   ✅ NEW: getLiveFeatures()
   Pulls real numbers from each feature's OWN admin settings —
   CV Management (cv_plan_config), AI Interview (interview_limits),
   Career Path (career_path_limits), Auto-Apply (autoApply.*Limit.*),
   Career Chat (career_chat_limits) — instead of the separate
   manually-edited pricing.features Setting.

   This is the single source of truth: change a limit in any
   admin panel and the public Pricing page updates automatically.
   Falls back to DEFAULT_FEATURES for anything not configured yet,
   so the page never breaks.
───────────────────────────────────────────────────────── */
async function getLiveFeatures() {
  const getJSON = async (key, fallback) => {
    try {
      const row = await Setting.findByPk(key);
      if (!row?.value) return fallback;
      return typeof row.value === 'object' ? row.value : JSON.parse(row.value);
    } catch { return fallback; }
  };
  const getNum = async (key, fallback) => {
    try {
      const row = await Setting.findByPk(key);
      const n = parseInt(row?.value);
      return isNaN(n) ? fallback : n;
    } catch { return fallback; }
  };

  const [
    cvConfig, interviewLimits, careerPathLimits, trainingLimits,
    proAutoDaily, eliteAutoDaily,
  ] = await Promise.all([
    getJSON('cv_plan_config', null),
    getJSON('interview_limits', null),
    getJSON('career_path_limits', null),
    getJSON('career_chat_limits', null),
    getNum('autoApply.dailyLimit.pro', null),
    getNum('autoApply.dailyLimit.elite', null),
  ]);

  const base = JSON.parse(JSON.stringify(DEFAULT_FEATURES)); // deep clone defaults

  // ── CV numbers ───────────────────────────────────────────
  if (cvConfig) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!cvConfig[plan]) continue;
      base[plan].cvUploads = cvConfig[plan].maxCVs ?? base[plan].cvUploads;
      base[plan].aiAnalysis = cvConfig[plan].useAI
        ? (cvConfig[plan].analysisPerDay === 0 ? -1 : cvConfig[plan].analysisPerDay ?? base[plan].aiAnalysis)
        : 0;
    }
  }

  // ── AI Interview numbers ──────────────────────────────────
  if (interviewLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!interviewLimits[plan]) continue;
      const perDay = interviewLimits[plan].perDay;
      base[plan].training = interviewLimits[plan].allowCreation === false
        ? 0
        : (perDay ?? base[plan].training);
    }
  }

  // ── Career Path numbers ───────────────────────────────────
  if (careerPathLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!careerPathLimits[plan]) continue;
      base[plan].careerPathDaily = careerPathLimits[plan].perDay ?? base[plan].careerPathDaily;
    }
  }

  // ── Auto-Apply numbers (admin-controlled, Pro/Elite only) ──
  if (proAutoDaily   !== null) base.pro.autoApplyDaily   = proAutoDaily;
  if (eliteAutoDaily !== null) base.elite.autoApplyDaily = eliteAutoDaily;
  base.pro.autoApply    = base.pro.autoApplyDaily   !== 0;
  base.elite.autoApply  = base.elite.autoApplyDaily !== 0;
  base.free.autoApplyDaily = 0;
  base.free.autoApply      = false;

  // ── Career Chat numbers ───────────────────────────────────
  if (trainingLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!trainingLimits[plan]) continue;
      base[plan].chatDaily = trainingLimits[plan].perDay ?? base[plan].chatDaily;
    }
  }

  return base;
}

function mergedPricingForCountry(cc, overrides) {
  const base     = getPricingForCountry(cc);
  const override = overrides[cc];
  if (!override) return base;
  return {
    ...base,
    pro:   { ...base.pro,   ...(override.pro   || {}) },
    elite: { ...base.elite, ...(override.elite || {}) },
    currency: override.currency || base.currency,
    symbol:   override.symbol   || base.symbol,
  };
}

// ════════════════════════════════════════════════════════════
//  PUBLIC: GET /plans
//  ✅ CHANGED: features now come from getLiveFeatures() —
//  real numbers synced from every feature's own admin panel.
// ════════════════════════════════════════════════════════════
exports.getPlans = async (req, res) => {
  try {
    const cc = detectCountry(req) || req.query.country || 'USA';
    const [overrides, features] = await Promise.all([loadCountryPricing(), getLiveFeatures()]);

    const cp    = mergedPricingForCountry(cc, overrides);
    const plans = [
      {
        key: 'free', name: 'Free', nameAr: 'مجاني',
        monthly: 0, yearly: 0,
        currency: cp.currency, symbol: cp.symbol,
        features: features.free || DEFAULT_FEATURES.free, savings: 0,
      },
      {
        key: 'pro', name: 'Pro', nameAr: 'احترافي',
        ...cp.pro, currency: cp.currency, symbol: cp.symbol,
        features: features.pro || DEFAULT_FEATURES.pro,
        savings: cp.pro.monthly > 0 ? Math.round((1 - cp.pro.yearly / (cp.pro.monthly * 12)) * 100) : 0,
      },
      {
        key: 'elite', name: 'Elite', nameAr: 'النخبة',
        ...cp.elite, currency: cp.currency, symbol: cp.symbol,
        features: features.elite || DEFAULT_FEATURES.elite,
        savings: cp.elite.monthly > 0 ? Math.round((1 - cp.elite.yearly / (cp.elite.monthly * 12)) * 100) : 0,
      },
    ];

    return success(res, {
      country:    cc,
      countryName: cp.name,
      currency:   cp.currency,
      symbol:     cp.symbol,
      usdRate:    cp.usdRate || 1,
      tier:       cc, tierId: cc, tierLabel: cp.name,
      plans,
      allTiers: [{ id: cc, label: cp.name, currency: cp.currency, symbol: cp.symbol, countries: [cc] }],
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  PUBLIC: GET /plans/geo
// ════════════════════════════════════════════════════════════
exports.getGeo = async (req, res) => {
  const cc = detectCountry(req);
  if (!cc) return success(res, { country: null, tier: null });
  const cp = getPricingForCountry(cc);
  return success(res, { country: cc, tier: cc, countryName: cp.name, currency: cp.currency });
};

// ════════════════════════════════════════════════════════════
//  ADMIN: GET /admin/pricing
//  ✅ Now includes liveFeatures alongside the legacy manual
//  features, so the admin pricing editor can show both if needed.
// ════════════════════════════════════════════════════════════
exports.adminGetPricing = async (_req, res) => {
  try {
    const [overrides, features, liveFeatures] = await Promise.all([
      loadCountryPricing(), loadFeatures(), getLiveFeatures(),
    ]);

    const allCountries = {};
    Object.entries(COUNTRY_PRICING).forEach(([cc, base]) => {
      allCountries[cc] = {
        ...base,
        pro:   { ...base.pro,   ...(overrides[cc]?.pro   || {}) },
        elite: { ...base.elite, ...(overrides[cc]?.elite || {}) },
        currency: overrides[cc]?.currency || base.currency,
        symbol:   overrides[cc]?.symbol   || base.symbol,
        _overridden: !!overrides[cc],
      };
    });

    const tiers = { countries: allCountries };

    return success(res, { tiers, features, liveFeatures, countries: allCountries, overrides });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  ADMIN: PUT /admin/pricing/tiers
// ════════════════════════════════════════════════════════════
exports.adminSaveTiers = async (req, res) => {
  try {
    const body = req.body.tiers;
    if (!body || typeof body !== 'object') return error(res, 'tiers object required', 400);

    const countryData = body.countries || body;

    await Setting.upsert({ key: COUNTRIES_KEY, value: JSON.stringify(countryData) });
    await AuditLog.create({
      actorId: req.user.id, action: 'pricing.update_countries',
      entity: 'Setting', entityId: null,
      meta: { countriesCount: Object.keys(countryData).length },
    }).catch(() => {});

    return success(res, {}, 'Country pricing saved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  ADMIN: PUT /admin/pricing/features
//  (legacy manual override — getPlans no longer reads this,
//  but kept functional in case you want to force specific values)
// ════════════════════════════════════════════════════════════
exports.adminSaveFeatures = async (req, res) => {
  try {
    const { features } = req.body;
    if (!features || typeof features !== 'object') return error(res, 'features object required', 400);
    await Setting.upsert({ key: FEATURES_KEY, value: JSON.stringify(features) });
    if (_checkFeatureCache?.bustCache) _checkFeatureCache.bustCache();
    if (_planLimitsCache?.bustFeatureCache) _planLimitsCache.bustFeatureCache();
    await AuditLog.create({ actorId: req.user.id, action: 'pricing.update_features', entity: 'Setting', entityId: null, meta: {} }).catch(() => {});
    return success(res, { features }, 'Plan features saved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  ADMIN: POST /admin/pricing/reset
// ════════════════════════════════════════════════════════════
exports.adminResetPricing = async (req, res) => {
  try {
    await Setting.destroy({ where: { key: COUNTRIES_KEY } });
    await Setting.destroy({ where: { key: FEATURES_KEY } });
    if (_checkFeatureCache?.bustCache) _checkFeatureCache.bustCache();
    if (_planLimitsCache?.bustFeatureCache) _planLimitsCache.bustFeatureCache();
    await AuditLog.create({ actorId: req.user.id, action: 'pricing.reset', entity: 'Setting', entityId: null, meta: {} }).catch(() => {});
    return success(res, {}, 'Pricing reset to defaults');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// Exported for reuse elsewhere if needed
exports.getLiveFeatures = getLiveFeatures;