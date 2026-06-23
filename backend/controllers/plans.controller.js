

'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/pricing.controller.js
// Full CRUD for pricing tiers + plans, stored in Settings table
// Keys: pricing.tiers  (JSON string — the full TIERS object)
//       pricing.features (JSON string — PLAN_FEATURES object)
// Falls back to config/pricing.js defaults if DB has nothing yet
// ════════════════════════════════════════════════════════════

const Setting              = require('../models/Setting');
const { success, error }   = require('../utils/apiResponse');
const { TIERS: DEFAULT_TIERS, PLAN_FEATURES: DEFAULT_FEATURES } = require('../config/pricing');
const AuditLog             = require('../models/AuditLog');

const TIERS_KEY    = 'pricing.tiers';
const FEATURES_KEY = 'pricing.features';

// ── helpers ───────────────────────────────────────────────
async function loadTiers() {
  const row = await Setting.findByPk(TIERS_KEY);
  if (!row) return JSON.parse(JSON.stringify(DEFAULT_TIERS)); // deep clone defaults
  try { return JSON.parse(row.value); } catch { return JSON.parse(JSON.stringify(DEFAULT_TIERS)); }
}

async function loadFeatures() {
  const row = await Setting.findByPk(FEATURES_KEY);
  if (!row) return JSON.parse(JSON.stringify(DEFAULT_FEATURES));
  try { return JSON.parse(row.value); } catch { return JSON.parse(JSON.stringify(DEFAULT_FEATURES)); }
}

function detectCountry(req) {
  const cf  = req.headers['cf-ipcountry'];
  if (cf && cf !== 'XX') return cf.toUpperCase();
  const xcc = req.headers['x-country-code'];
  if (xcc) return xcc.toUpperCase();
  if (req.user?.locationCountry) return req.user.locationCountry.toUpperCase();
  if (req.query?.country) return req.query.country.toUpperCase();
  return null;
}

function getTierForCountry(tiers, cc) {
  const upper = (cc || '').toUpperCase();
  for (const tier of Object.values(tiers)) {
    if ((tier.countries || []).includes(upper)) return tier;
  }
  return tiers.global || Object.values(tiers)[0];
}

// ════════════════════════════════════════════════════════════
// PUBLIC: GET /plans  — returns plans for detected country
// ════════════════════════════════════════════════════════════
exports.getPlans = async (req, res) => {
  const tiers    = await loadTiers();
  const features = await loadFeatures();
  const country  = detectCountry(req) || req.query.country || 'AE';
  const tier     = getTierForCountry(tiers, country);

  const plans = ['free', 'pro', 'elite'].map(key => ({
    key,
    name:     key === 'free' ? 'Free'    : key === 'pro' ? 'Pro'      : 'Elite',
    nameAr:   key === 'free' ? 'مجاني'  : key === 'pro' ? 'احترافي'  : 'نخبة',
    ...(tier.plans?.[key] || { monthly: 0, yearly: 0 }),
    currency: tier.currency || 'USD',
    symbol:   tier.symbol   || '$',
    features: features[key] || {},
    savings: key !== 'free' && (tier.plans?.[key]?.monthly || 0) > 0
      ? Math.round((1 - (tier.plans[key].yearly) / (tier.plans[key].monthly * 12)) * 100)
      : 0,
  }));

  return success(res, {
    country,
    tier: tier.id,
    tierId: tier.id,
    tierLabel: tier.label,
    currency: tier.currency,
    symbol:   tier.symbol,
    plans,
    allTiers: Object.entries(tiers).map(([id, t]) => ({
      id, label: t.label, countries: t.countries, currency: t.currency, symbol: t.symbol,
    })),
  });
};

// PUBLIC: GET /plans/geo
exports.getGeo = async (req, res) => {
  const tiers   = await loadTiers();
  const country = detectCountry(req);
  if (!country) return success(res, { country: null, tier: null });
  const tier = getTierForCountry(tiers, country);
  return success(res, { country, tier: tier.id });
};

// ════════════════════════════════════════════════════════════
// ADMIN: GET /admin/pricing
// Returns all tiers + features for the admin editor
// ════════════════════════════════════════════════════════════
exports.adminGetPricing = async (_req, res) => {
  const tiers    = await loadTiers();
  const features = await loadFeatures();
  return success(res, { tiers, features });
};

// ════════════════════════════════════════════════════════════
// ADMIN: PUT /admin/pricing/tiers
// Full replace of tiers object
// ════════════════════════════════════════════════════════════
exports.adminSaveTiers = async (req, res) => {
  const { tiers } = req.body;
  if (!tiers || typeof tiers !== 'object')
    return error(res, 'tiers object required', 400);

  // Basic validation
  for (const [id, tier] of Object.entries(tiers)) {
    if (!tier.plans?.free || !tier.plans?.pro || !tier.plans?.elite)
      return error(res, `Tier "${id}" must have free/pro/elite plans`, 400);
  }

  await Setting.upsert({ key: TIERS_KEY, value: JSON.stringify(tiers) });
  await AuditLog.create({
    actorId: req.user.id, action: 'pricing.update_tiers',
    entity: 'Setting', entityId: null,
    meta: { tiersCount: Object.keys(tiers).length },
  }).catch(() => {});
  return success(res, {}, 'Pricing tiers saved');
};

// ════════════════════════════════════════════════════════════
// ADMIN: PUT /admin/pricing/features
// ════════════════════════════════════════════════════════════
exports.adminSaveFeatures = async (req, res) => {
  const { features } = req.body;
  if (!features || typeof features !== 'object')
    return error(res, 'features object required', 400);

  await Setting.upsert({ key: FEATURES_KEY, value: JSON.stringify(features) });
  await AuditLog.create({
    actorId: req.user.id, action: 'pricing.update_features',
    entity: 'Setting', entityId: null, meta: {},
  }).catch(() => {});
  return success(res, {}, 'Plan features saved');
};

// ════════════════════════════════════════════════════════════
// ADMIN: POST /admin/pricing/reset
// Reset to code defaults
// ════════════════════════════════════════════════════════════
exports.adminResetPricing = async (req, res) => {
  await Setting.destroy({ where: { key: TIERS_KEY } });
  await Setting.destroy({ where: { key: FEATURES_KEY } });
  await AuditLog.create({
    actorId: req.user.id, action: 'pricing.reset',
    entity: 'Setting', entityId: null, meta: {},
  }).catch(() => {});
  return success(res, {}, 'Pricing reset to defaults');
};