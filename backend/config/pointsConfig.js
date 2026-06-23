'use strict';
// backend/config/pointsConfig.js
// ════════════════════════════════════════════════════════════
// النظام: Admin يتحكم بـ "كم نقطة = كم توكن"
// المستخدم يرى نقاط، الأدمن يرى توكنات وتكلفة
//
// المنطق:
//   - عند الاشتراك: المستخدم يحصل على نقاط (= رصيد توكنات)
//   - عند استخدام AI: يُخصم من نقاطه حسب التوكنات المستهلكة
//   - 1 point = X tokens (يحدده الأدمن)
// ════════════════════════════════════════════════════════════

const { Setting } = require('../models');
const { Sequelize } = require('../models'); // للتحديث الآمن

const SETTINGS_KEY = 'points_config';

// القيم الافتراضية
const DEFAULTS = Object.freeze({
  // نسبة التحويل: 1 نقطة = كم توكن
  tokensPerPoint: 1000,       // 1 point = 1,000 tokens

  // نقاط الاشتراك لكل خطة
  subscriptionBonus: Object.freeze({
    free:  0,
    pro:   1000,    // 1000 points = 1,000,000 tokens
    elite: 3000,    // 3000 points = 3,000,000 tokens
  }),

  // مكافآت الميزات (حالياً 0 = مجانية)
  featureCost: Object.freeze({
    cv_analysis:  0,
    cover_letter: 0,
    interview:    0,
    career_path:  0,
    auto_apply:   0,
    chat:         0,
    skill_gap:    0,
  }),

  deductionEnabled: true,

  blockOnZeroPoints: false,

  // حدود الأمان
  limits: Object.freeze({
    minTokensPerPoint: 1,
    maxTokensPerPoint: 1000000,
    maxPoints: 1000000000,  // مليار نقطة كحد أقصى
  }),

  zeroPointsMessage: Object.freeze({
    ar: 'نقاطك غير كافية لاستخدام هذه الميزة. يرجى الترقية أو الانتظار.',
    en: 'You don\'t have enough points to use this feature. Please upgrade your plan.',
  }),
});

// ── Validation helper ────────────────────────────────────
const validate = {
  positiveInteger(value, fieldName) {
    if (value === undefined || value === null) return undefined;
    const num = Number(value);
    if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) {
      throw new Error(`${fieldName} يجب أن يكون رقماً صحيحاً موجباً`);
    }
    return num;
  },

  tokensPerPoint(value) {
    const num = this.positiveInteger(value, 'tokensPerPoint');
    if (num === undefined) return undefined;
    if (num < DEFAULTS.limits.minTokensPerPoint || num > DEFAULTS.limits.maxTokensPerPoint) {
      throw new Error(
        `tokensPerPoint يجب أن يكون بين ${DEFAULTS.limits.minTokensPerPoint} و ${DEFAULTS.limits.maxTokensPerPoint}`
      );
    }
    return num;
  },

  subscriptionBonus(data) {
    if (!data || typeof data !== 'object') return undefined;
    const cleaned = {};
    for (const [plan, points] of Object.entries(data)) {
      if (!['free', 'pro', 'elite'].includes(plan)) {
        throw new Error(`خطة غير معروفة: ${plan}`);
      }
      cleaned[plan] = this.positiveInteger(points, `subscriptionBonus.${plan}`);
    }
    return cleaned;
  },

  featureCost(data) {
    if (!data || typeof data !== 'object') return undefined;
    const validFeatures = Object.keys(DEFAULTS.featureCost);
    const cleaned = {};
    for (const [feature, cost] of Object.entries(data)) {
      if (!validFeatures.includes(feature)) {
        throw new Error(`ميزة غير معروفة: ${feature}`);
      }
      cleaned[feature] = this.positiveInteger(cost, `featureCost.${feature}`);
    }
    return cleaned;
  },
};

// ── Read from DB (with fallback to defaults) ─────────────
async function get() {
  try {
    const row = await Setting.findOne({ where: { key: SETTINGS_KEY } });
    if (!row) return deepClone(DEFAULTS);
    
    const parsed = JSON.parse(row.value);
    // دمج عميق مع DEFAULTS لضمان وجود كل المفاتيح
    return deepMerge(DEFAULTS, parsed);
  } catch (err) {
    console.error('pointsConfig.get() error:', err.message);
    return deepClone(DEFAULTS);
  }
}

// ── Save to DB (مع حماية Race Condition) ────────────────
async function set(data) {
  // ✅ Validation قبل أي شيء
  const validated = {};

  if (data.tokensPerPoint !== undefined) {
    validated.tokensPerPoint = validate.tokensPerPoint(data.tokensPerPoint);
  }

  if (data.subscriptionBonus !== undefined) {
    validated.subscriptionBonus = validate.subscriptionBonus(data.subscriptionBonus);
  }

  if (data.featureCost !== undefined) {
    validated.featureCost = validate.featureCost(data.featureCost);
  }

  if (data.deductionEnabled !== undefined) {
    validated.deductionEnabled = Boolean(data.deductionEnabled);
  }

  if (data.blockOnZeroPoints !== undefined) {
    validated.blockOnZeroPoints = Boolean(data.blockOnZeroPoints);
  }

  if (data.zeroPointsMessage !== undefined) {
    if (typeof data.zeroPointsMessage !== 'object') {
      throw new Error('zeroPointsMessage يجب أن يكون كائناً');
    }
    validated.zeroPointsMessage = {
      ar: String(data.zeroPointsMessage.ar || DEFAULTS.zeroPointsMessage.ar).slice(0, 500),
      en: String(data.zeroPointsMessage.en || DEFAULTS.zeroPointsMessage.en).slice(0, 500),
    };
  }

  // ✅ حماية من Race Condition باستخدام قفل على مستوى الصف
  const transaction = await Setting.sequelize.transaction();
  
  try {
    // قفل الصف للقراءة والتحديث
    const [row] = await Setting.findOrCreate({
      where: { key: SETTINGS_KEY },
      defaults: { key: SETTINGS_KEY, value: JSON.stringify(DEFAULTS) },
      lock: transaction.LOCK.UPDATE,  // ✅ قفل للكتابة
      transaction,
    });

    const current = JSON.parse(row.value);
    const merged = deepMerge(current, validated);
    merged.updatedAt = new Date().toISOString();
    merged.updatedBy = data.adminId || 'system';  // ✅ تتبع من قام بالتغيير

    await row.update(
      { value: JSON.stringify(merged) },
      { transaction }
    );

    await transaction.commit();

    // ✅ Audit Log (بعد commit)
    logAudit({
      action: 'points_config_update',
      oldValue: current,
      newValue: merged,
      adminId: data.adminId || 'system',
    }).catch(err => console.error('Audit log failed:', err));

    return merged;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

// ── Convert tokens → points ──────────────────────────────
async function tokensToPoints(tokens) {
  const cfg = await get();
  
  // ✅ حماية من Division by Zero
  if (!cfg.tokensPerPoint || cfg.tokensPerPoint <= 0) {
    console.error('⚠️ tokensPerPoint is invalid:', cfg.tokensPerPoint);
    throw new Error('إعدادات النقاط غير صالحة. يرجى التواصل مع الإدارة.');
  }

  const points = Math.ceil(tokens / cfg.tokensPerPoint);
  
  // ✅ حماية من تجاوز الحد الأقصى
  if (points > DEFAULTS.limits.maxPoints) {
    console.error('⚠️ Points overflow:', { tokens, points });
    return DEFAULTS.limits.maxPoints;
  }
  
  return points;
}

// ── Convert points → tokens ──────────────────────────────
async function pointsToTokens(points) {
  const cfg = await get();

  // ✅ حماية من تجاوز Number.MAX_SAFE_INTEGER
  const tokens = points * cfg.tokensPerPoint;
  if (tokens > Number.MAX_SAFE_INTEGER) {
    console.error('⚠️ Tokens overflow:', { points, tokens });
    return Number.MAX_SAFE_INTEGER;
  }
  
  return tokens;
}

// ── Helper functions ─────────────────────────────────────
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && base[key]) {
      result[key] = { ...base[key], ...value };
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ✅ Audit Log helper (تحتاجين إنشاء مودل AuditLog)
async function logAudit({ action, oldValue, newValue, adminId }) {
  try {
    // إذا كان عندك مودل AuditLog:
    // await AuditLog.create({ action, oldValue, newValue, adminId, timestamp: new Date() });
    
    // حالياً: تسجيل في console
    console.log('📝 [AUDIT]', {
      action,
      adminId,
      timestamp: new Date().toISOString(),
      changes: getChanges(oldValue, newValue),
    });
  } catch (err) {
    console.error('logAudit failed:', err);
  }
}

function getChanges(oldObj, newObj) {
  const changes = {};
  for (const key of Object.keys(newObj)) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = { from: oldObj[key], to: newObj[key] };
    }
  }
  return changes;
}

module.exports = {
  get,
  set,
  tokensToPoints,
  pointsToTokens,
  DEFAULTS,
  SETTINGS_KEY,
};