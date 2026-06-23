// 'use strict';

// const { Setting, AuditLog } = require('../../models');
// const { PLAN_FEATURES } = require('../../config/pricing');
// const { success, error } = require('../../utils/apiResponse');

// const audit = (actor, action, id, o, n) =>
//   AuditLog.create({ actorId: actor, action, entityType: 'Pricing', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

// exports.get = async (req, res) => {
//   try {
//     const row = await Setting.findOne({ where: { key: 'pricing_tiers' } });
//     const tiers = row ? JSON.parse(row.value) : PLAN_FEATURES;
//     return success(res, { tiers });
//   } catch (err) { return error(res, err.message, 500); }
// };

// exports.saveTiers = async (req, res) => {
//   try {
//     const { tiers } = req.body;
//     if (!tiers || typeof tiers !== 'object') return error(res, 'Tiers object required', 400);

//     const old = await Setting.findOne({ where: { key: 'pricing_tiers' } });
//     await Setting.upsert({ key: 'pricing_tiers', value: JSON.stringify(tiers) });
//     await audit(req.user.id, 'pricing.tiers_update', null, old?.value, JSON.stringify(tiers));
//     return success(res, { tiers }, 'Tiers saved');
//   } catch (err) { return error(res, err.message, 400); }
// };

// exports.saveFeatures = async (req, res) => {
//   try {
//     const { features } = req.body;
//     if (!features || typeof features !== 'object') return error(res, 'Features object required', 400);

//     const old = await Setting.findOne({ where: { key: 'pricing_features' } });
//     await Setting.upsert({ key: 'pricing_features', value: JSON.stringify(features) });
//     await audit(req.user.id, 'pricing.features_update', null, old?.value, JSON.stringify(features));
//     return success(res, { features }, 'Features saved');
//   } catch (err) { return error(res, err.message, 400); }
// };

// exports.reset = async (req, res) => {
//   try {
//     await Setting.upsert({ key: 'pricing_tiers', value: JSON.stringify(PLAN_FEATURES) });
//     await audit(req.user.id, 'pricing.reset', null, null, { tiers: PLAN_FEATURES });
//     return success(res, { tiers: PLAN_FEATURES }, 'Pricing reset to defaults');
//   } catch (err) { return error(res, err.message, 500); }
// };

// exports.getPlanFeatures = async (req, res) => success(res, { plans: PLAN_FEATURES });


'use strict';

const { Setting, AuditLog } = require('../../models');
const { PLAN_FEATURES } = require('../../config/pricing');
const { success, error } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Pricing', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

/* ─────────────────────────────────────────────────────────
   ✅ NEW: getLiveFeatures()
   Pulls real numbers from every feature's OWN admin settings
   (the same settings shown in CV Management, Auto-Apply admin,
   AI Interview limits, Career Path limits, etc.) instead of the
   separate hardcoded pricing_features Setting. This is the single
   source of truth — change a limit in CV Management and the
   Pricing page updates automatically, no manual sync needed.

   Falls back to PLAN_FEATURES defaults for anything not yet
   configured, so the page never breaks if a setting is missing.
───────────────────────────────────────────────────────── */
async function getLiveFeatures() {
  const getJSON = async (key, fallback) => {
    try {
      const row = await Setting.findOne({ where: { key } });
      if (!row?.value) return fallback;
      return typeof row.value === 'object' ? row.value : JSON.parse(row.value);
    } catch { return fallback; }
  };
  const getNum = async (key, fallback) => {
    try {
      const row = await Setting.findOne({ where: { key } });
      const n = parseInt(row?.value);
      return isNaN(n) ? fallback : n;
    } catch { return fallback; }
  };

  // ── CV Management (cv_plan_config) ──────────────────────
  const cvConfig = await getJSON('cv_plan_config', null);

  // ── AI Interview (interview_limits) ─────────────────────
  const interviewLimits = await getJSON('interview_limits', null);

  // ── Career Path limits ──────────────────────────────────
  const careerPathLimits = await getJSON('career_path_limits', null);

  // ── Auto-Apply limits (admin-controlled, per-plan keys) ──
  const [
    proAutoDaily, eliteAutoDaily,
    proAutoMonthly, eliteAutoMonthly,
  ] = await Promise.all([
    getNum('autoApply.dailyLimit.pro', null),
    getNum('autoApply.dailyLimit.elite', null),
    getNum('autoApply.monthlyLimit.pro', null),
    getNum('autoApply.monthlyLimit.elite', null),
  ]);

  // ── Training/Chat limits (training.controller uses these) ──
  const trainingLimits = await getJSON('career_chat_limits', null);

  const base = JSON.parse(JSON.stringify(PLAN_FEATURES)); // deep clone defaults

  // ── Merge CV numbers ─────────────────────────────────────
  if (cvConfig) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!cvConfig[plan]) continue;
      base[plan].cvUploads = cvConfig[plan].maxCVs ?? base[plan].cvUploads;
      // aiAnalysis: -1 means unlimited (elite), else daily limit shown
      base[plan].aiAnalysis = cvConfig[plan].useAI
        ? (cvConfig[plan].analysisPerDay === 0 ? -1 : cvConfig[plan].analysisPerDay ?? base[plan].aiAnalysis)
        : 0;
    }
  }

  // ── Merge AI Interview numbers ───────────────────────────
  if (interviewLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!interviewLimits[plan]) continue;
      const perDay = interviewLimits[plan].perDay;
      base[plan].training = perDay === 0 ? 0 : (interviewLimits[plan].allowCreation === false ? 0 : (perDay ?? base[plan].training));
    }
  }

  // ── Merge Career Path numbers ────────────────────────────
  if (careerPathLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!careerPathLimits[plan]) continue;
      base[plan].careerPathDaily = careerPathLimits[plan].perDay ?? base[plan].careerPathDaily;
    }
  }

  // ── Merge Auto-Apply numbers (admin-controlled, pro/elite only) ──
  if (proAutoDaily   !== null) base.pro.autoApplyDaily   = proAutoDaily;
  if (eliteAutoDaily !== null) base.elite.autoApplyDaily = eliteAutoDaily;
  base.pro.autoApply   = base.pro.autoApplyDaily   !== 0;
  base.elite.autoApply = base.elite.autoApplyDaily !== 0;
  base.free.autoApplyDaily = 0;
  base.free.autoApply      = false;

  // ── Merge Career Chat numbers ────────────────────────────
  if (trainingLimits) {
    for (const plan of ['free', 'pro', 'elite']) {
      if (!trainingLimits[plan]) continue;
      base[plan].chatDaily = trainingLimits[plan].perDay ?? base[plan].chatDaily;
    }
  }

  return base;
}

// ════════════════════════════════════════════════════════════
// GET /admin/pricing — tiers (prices, unchanged)
// ════════════════════════════════════════════════════════════
exports.get = async (req, res) => {
  try {
    const row = await Setting.findOne({ where: { key: 'pricing_tiers' } });
    const tiers = row ? JSON.parse(row.value) : PLAN_FEATURES;
    return success(res, { tiers });
  } catch (err) { return error(res, err.message, 500); }
};

exports.saveTiers = async (req, res) => {
  try {
    const { tiers } = req.body;
    if (!tiers || typeof tiers !== 'object') return error(res, 'Tiers object required', 400);

    const old = await Setting.findOne({ where: { key: 'pricing_tiers' } });
    await Setting.upsert({ key: 'pricing_tiers', value: JSON.stringify(tiers) });
    await audit(req.user.id, 'pricing.tiers_update', null, old?.value, JSON.stringify(tiers));
    return success(res, { tiers }, 'Tiers saved');
  } catch (err) { return error(res, err.message, 400); }
};

// ✅ saveFeatures kept for backward compat / manual override,
// but getPlanFeatures (used by the public Pricing page) now
// IGNORES pricing_features and reads live numbers instead — see
// getLiveFeatures() above. This endpoint still works if you want
// to force specific values that won't auto-sync.
exports.saveFeatures = async (req, res) => {
  try {
    const { features } = req.body;
    if (!features || typeof features !== 'object') return error(res, 'Features object required', 400);

    const old = await Setting.findOne({ where: { key: 'pricing_features' } });
    await Setting.upsert({ key: 'pricing_features', value: JSON.stringify(features) });
    await audit(req.user.id, 'pricing.features_update', null, old?.value, JSON.stringify(features));
    return success(res, { features }, 'Features saved');
  } catch (err) { return error(res, err.message, 400); }
};

exports.reset = async (req, res) => {
  try {
    await Setting.upsert({ key: 'pricing_tiers', value: JSON.stringify(PLAN_FEATURES) });
    await audit(req.user.id, 'pricing.reset', null, null, { tiers: PLAN_FEATURES });
    return success(res, { tiers: PLAN_FEATURES }, 'Pricing reset to defaults');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// ✅ CHANGED: GET /plans (public, used by Pricing page)
// Now returns LIVE feature numbers pulled from each feature's
// own admin settings, instead of the static pricing_features.
// ════════════════════════════════════════════════════════════
exports.getPlanFeatures = async (req, res) => {
  try {
    const plans = await getLiveFeatures();
    return success(res, { plans });
  } catch (err) {
    // Never break the pricing page — fall back to static defaults
    return success(res, { plans: PLAN_FEATURES });
  }
};

// Exported in case other controllers need live numbers too
exports.getLiveFeatures = getLiveFeatures;