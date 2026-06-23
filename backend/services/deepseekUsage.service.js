
// 'use strict';
// // backend/services/deepseekUsage.service.js
// // ════════════════════════════════════════════════════════════

// const { TokenUsage, User, Setting } = require('../models');
// const { Op, fn, col, literal } = require('sequelize');
// const { sendMail } = require('../config/mailer');

// // DeepSeek Pricing (USD per 1M tokens) — مُحدث ليشمل V4 Pro
// const PRICING = {
 
//   'deepseek-v4-flash':    { input: 0.14,  output: 0.28 },  // ✅ جديد
//   'deepseek-v4-pro':      { input: 1.74,  output: 3.48 },  // ✅ جديد (الأقوى)
//   'deepseek-v4-flash-v2': { input: 0.14,  output: 0.28 },  // Alias
//   default:                { input: 0.14,  output: 0.28 },
// };

// const FEATURES = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];



// // حساب تاريخ البداية حسب الفترة
// function getStartDate(period) {
//   const now = new Date();
//   switch (period) {
//     case 'day':   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     case 'week':  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//     case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
//     case 'year':  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
//     default:      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
//   }
// }

// class DeepSeekUsageService {

//   // ═══════════════════════════════════════════════════════════
//   //  رصيد API
//   // ═══════════════════════════════════════════════════════════

//   async getBalance() {
//     try {
//       const row = await Setting.findOne({ where: { key: 'deepseek_balance' } });
//       if (!row) {
//         const defaults = { toppedUp: 0, monthlyExpenses: 0, currency: 'USD', lastSyncedAt: null };
//         await Setting.create({ key: 'deepseek_balance', value: JSON.stringify(defaults) });
//         return defaults;
//       }
//       return JSON.parse(row.value);
//     } catch (err) {
//       console.error('[DeepSeek] getBalance error:', err.message);
//       return { toppedUp: 0, monthlyExpenses: 0, currency: 'USD' };
//     }
//   }

//   async updateBalance(toppedUp, monthlyExpenses) {
//     try {
//       const current = await this.getBalance();
//       const updated = {
//         toppedUp:        toppedUp        ?? current.toppedUp,
//         monthlyExpenses: monthlyExpenses ?? current.monthlyExpenses,
//         currency:        current.currency || 'USD',
//         lastUpdated:     new Date().toISOString(),
//       };
//       await Setting.upsert({ key: 'deepseek_balance', value: JSON.stringify(updated) });
//       return { success: true, balance: updated };
//     } catch (err) {
//       return { success: false, error: err.message };
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  إحصائيات الاستخدام
//   // ═══════════════════════════════════════════════════════════

//   async getUsageStats(period = 'month') {
//     try {
//       const startDate = getStartDate(period);

//       const rows = await TokenUsage.findAll({
//         where: { timestamp: { [Op.gte]: startDate } },
//         attributes: ['feature', 'model', 'inputTokens', 'outputTokens', 'totalTokens', 'estimatedCost', 'status', 'timestamp'],
//       });

//       const totalRequests     = rows.length;
//       const totalTokens       = rows.reduce((s, r) => s + (r.totalTokens  || 0), 0);
//       const totalInputTokens  = rows.reduce((s, r) => s + (r.inputTokens  || 0), 0);
//       const totalOutputTokens = rows.reduce((s, r) => s + (r.outputTokens || 0), 0);
//       const totalCost         = rows.reduce((s, r) => s + parseFloat(r.estimatedCost || 0), 0);
//       const failedCount       = rows.filter(r => r.status === 'failed').length;

//       // توزيع حسب الميزة
//       const featureBreakdown = {};
//       FEATURES.forEach(f => {
//         const fRows = rows.filter(r => r.feature === f);
//         const fTokens = fRows.reduce((s, r) => s + (r.totalTokens || 0), 0);
//         const fCost   = fRows.reduce((s, r) => s + parseFloat(r.estimatedCost || 0), 0);
//         featureBreakdown[f] = {
//           count:      fRows.length,
//           tokens:     fTokens,
//           cost:       fCost,
//           percentage: totalTokens > 0 ? Math.round((fTokens / totalTokens) * 100) : 0,
//         };
//       });

//       // توزيع حسب النموذج
//       const modelBreakdown = {};
//       rows.forEach(r => {
//         const m = r.model || 'deepseek-v4-flash';
//         if (!modelBreakdown[m]) modelBreakdown[m] = { count: 0, tokens: 0, cost: 0 };
//         modelBreakdown[m].count  += 1;
//         modelBreakdown[m].tokens += r.totalTokens || 0;
//         modelBreakdown[m].cost   += parseFloat(r.estimatedCost || 0);
//       });

//       // إحصائيات يومية
//       const dailyMap = new Map();
//       rows.forEach(r => {
//         const day = r.timestamp.toISOString().split('T')[0];
//         if (!dailyMap.has(day)) dailyMap.set(day, { date: day, tokens: 0, requests: 0, cost: 0 });
//         const d = dailyMap.get(day);
//         d.tokens   += r.totalTokens || 0;
//         d.requests += 1;
//         d.cost     += parseFloat(r.estimatedCost || 0);
//       });
//       const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

//       return {
//         period,
//         totalRequests,
//         totalTokens,
//         totalInputTokens,
//         totalOutputTokens,
//         totalCost,
//         failedCount,
//         successRate: totalRequests > 0 ? Math.round(((totalRequests - failedCount) / totalRequests) * 100) : 100,
//         featureBreakdown,
//         modelBreakdown,
//         dailyStats,
//       };
//     } catch (err) {
//       console.error('[DeepSeek] getUsageStats error:', err.message);
//       return { totalRequests: 0, totalTokens: 0, totalCost: 0, featureBreakdown: {}, dailyStats: [] };
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  سجلات الاستخدام مع فلاتر وصفحات
//   // ═══════════════════════════════════════════════════════════

//   async getLogs({ page = 1, limit = 50, startDate, endDate, feature, model, status, userId, userName } = {}) {
//     try {
//       const where = {};
//       if (startDate) where.timestamp = { [Op.gte]: new Date(startDate) };
//       if (endDate)   where.timestamp = { ...(where.timestamp || {}), [Op.lte]: new Date(endDate) };
//       if (feature)   where.feature   = feature;
//       if (model)     where.model     = model;
//       if (status)    where.status    = status;
//       if (userId)    where.userId    = userId;
//       if (userName)  where.userName  = { [Op.like]: `%${userName}%` };

//       const offset = (parseInt(page) - 1) * parseInt(limit);

//       const { count, rows } = await TokenUsage.findAndCountAll({
//         where,
//         include: [{
//           model: User, as: 'user',
//           attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
//           required: false,
//         }],
//         order:  [['timestamp', 'DESC']],
//         limit:  parseInt(limit),
//         offset,
//       });

//       return {
//         logs: rows,
//         pagination: {
//           total:      count,
//           page:       parseInt(page),
//           limit:      parseInt(limit),
//           totalPages: Math.ceil(count / parseInt(limit)),
//         },
//       };
//     } catch (err) {
//       console.error('[DeepSeek] getLogs error:', err.message);
//       return { logs: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  الاستخدام حسب المستخدم
//   // ═══════════════════════════════════════════════════════════

//   async getUserUsage(period = 'month') {
//     try {
//       const startDate = getStartDate(period);

//       const rows = await TokenUsage.findAll({
//         where: { timestamp: { [Op.gte]: startDate } },
//         attributes: [
//           'userId',
//           [fn('COUNT', col('id')),                          'requestCount'],
//           [fn('SUM',   col('total_tokens')),                'totalTokens'],
//           [fn('SUM',   col('input_tokens')),                'inputTokens'],
//           [fn('SUM',   col('output_tokens')),               'outputTokens'],
//           [fn('SUM',   col('estimated_cost')),              'totalCost'],
//         ],
//         include: [{
//           model: User, as: 'user',
//           attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
//           required: false,
//         }],
//         group:  ['userId', 'user.id'],
//         order:  [[literal('"totalTokens"'), 'DESC']],
//         limit:  50,
//       });

//       return rows.map(r => ({
//         userId:       r.userId,
//         user:         r.user,
//         requestCount: parseInt(r.dataValues.requestCount || 0),
//         totalTokens:  parseInt(r.dataValues.totalTokens  || 0),
//         inputTokens:  parseInt(r.dataValues.inputTokens  || 0),
//         outputTokens: parseInt(r.dataValues.outputTokens || 0),
//         totalCost:    parseFloat(r.dataValues.totalCost   || 0),
//       }));
//     } catch (err) {
//       console.error('[DeepSeek] getUserUsage error:', err.message);
//       return [];
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  تسجيل استخدام توكن
//   // ═══════════════════════════════════════════════════════════

//   async recordUsage({ userId, feature, model = 'deepseek-v4-flash', inputTokens = 0, outputTokens = 0, status = 'success', promptPreview, errorMessage, metadata, req }) {
//     try {
//       const pricing       = PRICING[model] || PRICING.default;
//       const totalTokens   = inputTokens + outputTokens;
//       const estimatedCost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output);

//       const user = await User.findByPk(userId, { attributes: ['fullName', 'email'] });

//       await TokenUsage.create({
//         userId,
//         userEmail:     user?.email    || null,
//         userName:      user?.fullName || null,
//         feature,
//         model,
//         inputTokens,
//         outputTokens,
//         totalTokens,
//         estimatedCost,
//         status,
//         promptPreview: promptPreview ? promptPreview.substring(0, 500) : null,
//         errorMessage:  errorMessage  || null,
//         ipAddress:     req?.ip       || null,
//         userAgent:     req?.headers?.['user-agent'] || null,
//         metadata:      metadata      || null,
//         timestamp:     new Date(),
//       });

//       return { success: true };
//     } catch (err) {
//       console.error('[DeepSeek] recordUsage error:', err.message);
//       return { success: false, error: err.message };
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  إعدادات التنبيهات
//   // ═══════════════════════════════════════════════════════════

//   async getAlertSettings() {
//     try {
//       const row = await Setting.findOne({ where: { key: 'usage_alert_settings' } });
//       if (!row) {
//         const defaults = {
//           enabled:           true,
//           balanceThreshold:  2.0,
//           tokenThreshold:    500000,
//           requestThreshold:  1000,
//           costThreshold:     5.0,
//           alertFrequency:    'daily',
//           recipients:        [process.env.ADMIN_EMAIL || ''].filter(Boolean),
//           alertTypes:        ['low_balance', 'high_usage', 'high_cost'],
//           lastAlertSentAt:   null,
//         };
//         await Setting.create({ key: 'usage_alert_settings', value: JSON.stringify(defaults) });
//         return defaults;
//       }
//       return JSON.parse(row.value);
//     } catch (err) {
//       console.error('[DeepSeek] getAlertSettings error:', err.message);
//       return {
//         enabled: true, balanceThreshold: 2.0, tokenThreshold: 500000,
//         requestThreshold: 1000, costThreshold: 5.0, alertFrequency: 'daily',
//         recipients: [], alertTypes: ['low_balance', 'high_usage', 'high_cost'],
//       };
//     }
//   }

//   async updateAlertSettings(settings) {
//     try {
//       await Setting.upsert({ key: 'usage_alert_settings', value: JSON.stringify(settings) });
//       return { success: true, settings };
//     } catch (err) {
//       return { success: false, error: err.message };
//     }
//   }

//   // ═══════════════════════════════════════════════════════════
//   //  حذف السجلات القديمة
//   // ═══════════════════════════════════════════════════════════

//   async clearOldLogs(daysToKeep = 90) {
//     try {
//       const cutoff  = new Date();
//       cutoff.setDate(cutoff.getDate() - daysToKeep);
//       const deleted = await TokenUsage.destroy({ where: { timestamp: { [Op.lt]: cutoff } } });
//       return { success: true, deletedCount: deleted };
//     } catch (err) {
//       return { success: false, error: err.message };
//     }
//   }
// }



// module.exports = new DeepSeekUsageService();

'use strict';
// backend/services/deepseekUsage.service.js
// ════════════════════════════════════════════════════════════

const { TokenUsage, User, Setting } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sendMail } = require('../config/mailer');

// DeepSeek Pricing (USD per 1M tokens)
const PRICING = {
  'deepseek-v4-flash':    { input: 0.14,  output: 0.28 },
  'deepseek-v4-pro':      { input: 1.74,  output: 3.48 },
  'deepseek-v4-flash-v2': { input: 0.14,  output: 0.28 },
  default:                { input: 0.14,  output: 0.28 },
};

const FEATURES = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];

function getStartDate(period) {
  const now = new Date();
  switch (period) {
    case 'day':   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month': return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case 'year':  return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  }
}

class DeepSeekUsageService {

  // ═══════════════════════════════════════════════════════════
  //  رصيد API
  // ═══════════════════════════════════════════════════════════

  async getBalance() {
    try {
      const row = await Setting.findOne({ where: { key: 'deepseek_balance' } });
      if (!row) {
        const defaults = { toppedUp: 0, monthlyExpenses: 0, currency: 'USD', lastSyncedAt: null };
        await Setting.create({ key: 'deepseek_balance', value: JSON.stringify(defaults) });
        return defaults;
      }
      return JSON.parse(row.value);
    } catch (err) {
      console.error('[DeepSeek] getBalance error:', err.message);
      return { toppedUp: 0, monthlyExpenses: 0, currency: 'USD' };
    }
  }

  async updateBalance(toppedUp, monthlyExpenses) {
    try {
      const current = await this.getBalance();
      const updated = {
        toppedUp:        toppedUp        ?? current.toppedUp,
        monthlyExpenses: monthlyExpenses ?? current.monthlyExpenses,
        currency:        current.currency || 'USD',
        lastUpdated:     new Date().toISOString(),
      };
      await Setting.upsert({ key: 'deepseek_balance', value: JSON.stringify(updated) });
      return { success: true, balance: updated };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  إحصائيات الاستخدام
  // ═══════════════════════════════════════════════════════════

  async getUsageStats(period = 'month') {
    try {
      const startDate = getStartDate(period);

      const rows = await TokenUsage.findAll({
        where: { timestamp: { [Op.gte]: startDate } },
        attributes: ['feature', 'model', 'inputTokens', 'outputTokens', 'totalTokens', 'estimatedCost', 'status', 'timestamp'],
      });

      const totalRequests     = rows.length;
      const totalTokens       = rows.reduce((s, r) => s + (r.totalTokens  || 0), 0);
      const totalInputTokens  = rows.reduce((s, r) => s + (r.inputTokens  || 0), 0);
      const totalOutputTokens = rows.reduce((s, r) => s + (r.outputTokens || 0), 0);
      const totalCost         = rows.reduce((s, r) => s + parseFloat(r.estimatedCost || 0), 0);
      const failedCount       = rows.filter(r => r.status === 'failed').length;

      const featureBreakdown = {};
      FEATURES.forEach(f => {
        const fRows   = rows.filter(r => r.feature === f);
        const fTokens = fRows.reduce((s, r) => s + (r.totalTokens || 0), 0);
        const fCost   = fRows.reduce((s, r) => s + parseFloat(r.estimatedCost || 0), 0);
        featureBreakdown[f] = {
          count:      fRows.length,
          tokens:     fTokens,
          cost:       fCost,
          percentage: totalTokens > 0 ? Math.round((fTokens / totalTokens) * 100) : 0,
        };
      });

      const modelBreakdown = {};
      rows.forEach(r => {
        const m = r.model || 'deepseek-v4-flash';
        if (!modelBreakdown[m]) modelBreakdown[m] = { count: 0, tokens: 0, cost: 0 };
        modelBreakdown[m].count  += 1;
        modelBreakdown[m].tokens += r.totalTokens || 0;
        modelBreakdown[m].cost   += parseFloat(r.estimatedCost || 0);
      });

      const dailyMap = new Map();
      rows.forEach(r => {
        const day = r.timestamp.toISOString().split('T')[0];
        if (!dailyMap.has(day)) dailyMap.set(day, { date: day, tokens: 0, requests: 0, cost: 0 });
        const d = dailyMap.get(day);
        d.tokens   += r.totalTokens || 0;
        d.requests += 1;
        d.cost     += parseFloat(r.estimatedCost || 0);
      });
      const dailyStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      return {
        period,
        totalRequests,
        totalTokens,
        totalInputTokens,
        totalOutputTokens,
        totalCost,
        failedCount,
        successRate: totalRequests > 0 ? Math.round(((totalRequests - failedCount) / totalRequests) * 100) : 100,
        featureBreakdown,
        modelBreakdown,
        dailyStats,
      };
    } catch (err) {
      console.error('[DeepSeek] getUsageStats error:', err.message);
      return { totalRequests: 0, totalTokens: 0, totalCost: 0, featureBreakdown: {}, dailyStats: [] };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  سجلات الاستخدام مع فلاتر وصفحات
  // ═══════════════════════════════════════════════════════════

  async getLogs({ page = 1, limit = 50, startDate, endDate, feature, model, status, userId, userName } = {}) {
    try {
      const where = {};
      if (startDate) where.timestamp = { [Op.gte]: new Date(startDate) };
      if (endDate)   where.timestamp = { ...(where.timestamp || {}), [Op.lte]: new Date(endDate) };
      if (feature)   where.feature   = feature;
      if (model)     where.model     = model;
      if (status)    where.status    = status;
      if (userId)    where.userId    = userId;
      if (userName)  where.userName  = { [Op.like]: `%${userName}%` };

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await TokenUsage.findAndCountAll({
        where,
        include: [{
          model: User, as: 'user',
          attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
          required: false,
        }],
        order:  [['timestamp', 'DESC']],
        limit:  parseInt(limit),
        offset,
      });

      return {
        logs: rows,
        pagination: {
          total:      count,
          page:       parseInt(page),
          limit:      parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      };
    } catch (err) {
      console.error('[DeepSeek] getLogs error:', err.message);
      return { logs: [], pagination: { total: 0, page: 1, limit: 50, totalPages: 0 } };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  الاستخدام حسب المستخدم
  // ═══════════════════════════════════════════════════════════

  async getUserUsage(period = 'month') {
    try {
      const startDate = getStartDate(period);

      const rows = await TokenUsage.findAll({
        where: { timestamp: { [Op.gte]: startDate } },
        attributes: [
          'userId',
          [fn('COUNT', col('id')),             'requestCount'],
          [fn('SUM',   col('total_tokens')),   'totalTokens'],
          [fn('SUM',   col('input_tokens')),   'inputTokens'],
          [fn('SUM',   col('output_tokens')),  'outputTokens'],
          [fn('SUM',   col('estimated_cost')), 'totalCost'],
        ],
        include: [{
          model: User, as: 'user',
          attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
          required: false,
        }],
        group:  ['userId', 'user.id'],
        order:  [[literal('"totalTokens"'), 'DESC']],
        limit:  50,
      });

      return rows.map(r => ({
        userId:       r.userId,
        user:         r.user,
        requestCount: parseInt(r.dataValues.requestCount || 0),
        totalTokens:  parseInt(r.dataValues.totalTokens  || 0),
        inputTokens:  parseInt(r.dataValues.inputTokens  || 0),
        outputTokens: parseInt(r.dataValues.outputTokens || 0),
        totalCost:    parseFloat(r.dataValues.totalCost   || 0),
      }));
    } catch (err) {
      console.error('[DeepSeek] getUserUsage error:', err.message);
      return [];
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  تسجيل استخدام توكن
  // ═══════════════════════════════════════════════════════════

  async recordUsage({ userId, feature, model = 'deepseek-v4-flash', inputTokens = 0, outputTokens = 0, status = 'success', promptPreview, errorMessage, metadata, req }) {
    try {
      const pricing       = PRICING[model] || PRICING.default;
      const totalTokens   = inputTokens + outputTokens;
      const estimatedCost = (inputTokens / 1_000_000 * pricing.input) + (outputTokens / 1_000_000 * pricing.output);

      const user = await User.findByPk(userId, { attributes: ['fullName', 'email'] });

      await TokenUsage.create({
        userId,
        userEmail:     user?.email    || null,
        userName:      user?.fullName || null,
        feature,
        model,
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
        status,
        promptPreview: promptPreview ? promptPreview.substring(0, 500) : null,
        errorMessage:  errorMessage  || null,
        ipAddress:     req?.ip       || null,
        userAgent:     req?.headers?.['user-agent'] || null,
        metadata:      metadata      || null,
        timestamp:     new Date(),
      });

      return { success: true };
    } catch (err) {
      console.error('[DeepSeek] recordUsage error:', err.message);
      return { success: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  إعدادات التنبيهات
  // ═══════════════════════════════════════════════════════════

  async getAlertSettings() {
    try {
      const row = await Setting.findOne({ where: { key: 'usage_alert_settings' } });
      if (!row) {
        const defaults = {
          enabled:          true,
          balanceThreshold: 2.0,
          tokenThreshold:   500000,
          requestThreshold: 1000,
          costThreshold:    5.0,
          alertFrequency:   'daily',
          recipients:       [process.env.ADMIN_EMAIL || ''].filter(Boolean),
          alertTypes:       ['low_balance', 'high_usage', 'high_cost'],
          lastAlertSentAt:  null,
        };
        await Setting.create({ key: 'usage_alert_settings', value: JSON.stringify(defaults) });
        return defaults;
      }
      return JSON.parse(row.value);
    } catch (err) {
      console.error('[DeepSeek] getAlertSettings error:', err.message);
      return {
        enabled: true, balanceThreshold: 2.0, tokenThreshold: 500000,
        requestThreshold: 1000, costThreshold: 5.0, alertFrequency: 'daily',
        recipients: [], alertTypes: ['low_balance', 'high_usage', 'high_cost'],
      };
    }
  }

  async updateAlertSettings(settings) {
    try {
      await Setting.upsert({ key: 'usage_alert_settings', value: JSON.stringify(settings) });
      return { success: true, settings };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  ✅ FIX: checkAndSendAlerts — was missing, caused 500 on Test/Send
  // ═══════════════════════════════════════════════════════════

  async checkAndSendAlerts(force = false) {
    try {
      const settings = await this.getAlertSettings();

      // If alerts disabled and not forced → skip
      if (!settings.enabled && !force) {
        return { sent: false, reason: 'Alerts are disabled' };
      }

      const recipients = (settings.recipients || []).filter(Boolean);
      if (!recipients.length) {
        return { sent: false, reason: 'No recipients configured — add emails in Alert Settings' };
      }

      // Frequency throttle (skip if forced)
      if (!force && settings.lastAlertSentAt) {
        const last      = new Date(settings.lastAlertSentAt);
        const now       = new Date();
        const diffHours = (now - last) / (1000 * 60 * 60);
        const minHours  = settings.alertFrequency === 'hourly' ? 1
                        : settings.alertFrequency === 'weekly' ? 168 : 24;
        if (diffHours < minHours) {
          return { sent: false, reason: `Next alert allowed in ${Math.ceil(minHours - diffHours)}h` };
        }
      }

      // Check thresholds
      const balance = await this.getBalance();
      const stats   = await this.getUsageStats('month');
      const alerts  = [];
      const types   = settings.alertTypes || [];

      if (types.includes('low_balance') && (balance.toppedUp || 0) < (settings.balanceThreshold || 2)) {
        alerts.push(`⚠️ Low Balance: $${(balance.toppedUp || 0).toFixed(2)} (threshold: $${settings.balanceThreshold})`);
      }
      if (types.includes('high_usage') && (stats.totalRequests || 0) > (settings.requestThreshold || 1000)) {
        alerts.push(`📊 High Usage: ${stats.totalRequests} requests (threshold: ${settings.requestThreshold})`);
      }
      if (types.includes('high_cost') && (stats.totalCost || 0) > (settings.costThreshold || 10)) {
        alerts.push(`💸 High Cost: $${(stats.totalCost || 0).toFixed(4)} (threshold: $${settings.costThreshold})`);
      }

      // If no thresholds exceeded and not forced → don't send
      if (!alerts.length && !force) {
        return { sent: false, reason: 'No thresholds exceeded' };
      }

      const alertLines = alerts.length
        ? alerts.join('\n')
        : '✅ Test alert — all systems normal, no thresholds exceeded';

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
          <h2 style="color:#1a1a1a">🔔 TalexHub — DeepSeek API Alert</h2>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0">
            <pre style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${alertLines}</pre>
          </div>
          <hr style="border:none;border-top:1px solid #eee;margin:16px 0"/>
          <div style="font-size:12px;color:#666">
            <p><strong>Balance:</strong> $${(balance.toppedUp || 0).toFixed(2)}</p>
            <p><strong>Monthly Requests:</strong> ${stats.totalRequests || 0}</p>
            <p><strong>Monthly Cost:</strong> $${(stats.totalCost || 0).toFixed(4)}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
          <p style="font-size:11px;color:#999">Sent to: ${recipients.join(', ')}</p>
        </div>
      `;

      await sendMail({
        to:      recipients.join(','),
        subject: `[TalexHub] DeepSeek API Alert — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        html,
      });

      // Update lastAlertSentAt
      await this.updateAlertSettings({ ...settings, lastAlertSentAt: new Date().toISOString() });

      return { sent: true, alerts, recipients };
    } catch (err) {
      console.error('[DeepSeek] checkAndSendAlerts error:', err.message);
      throw err;
    }
  }

  // ═══════════════════════════════════════════════════════════
  //  حذف السجلات القديمة
  // ═══════════════════════════════════════════════════════════

  async clearOldLogs(daysToKeep = 90) {
    try {
      const cutoff  = new Date();
      cutoff.setDate(cutoff.getDate() - daysToKeep);
      const deleted = await TokenUsage.destroy({ where: { timestamp: { [Op.lt]: cutoff } } });
      return { success: true, deletedCount: deleted };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}

module.exports = new DeepSeekUsageService();