// 'use strict';
// // backend/controllers/usage.controller.js
// // ════════════════════════════════════════════════════════════
// // جميع endpoints الخاصة بإدارة استخدام DeepSeek API
// // ════════════════════════════════════════════════════════════

// const deepseekSvc        = require('../services/deepseekUsage.service');
// const apiSettingsSvc     = require('../services/apiSettings.service');
// const { success, error } = require('../utils/apiResponse');
// const { TokenUsage, User } = require('../models');
// const { Op } = require('sequelize');

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/dashboard
// //  لوحة التحكم الكاملة: رصيد + إحصائيات + سجلات حديثة
// // ═══════════════════════════════════════════════════════════
// exports.getDashboard = async (req, res) => {
//   try {
//     const period = req.query.period || 'month';

//     const [balance, usage, alertSettings, apiSettings, userUsage] = await Promise.all([
//       deepseekSvc.getBalance(),
//       deepseekSvc.getUsageStats(period),
//       deepseekSvc.getAlertSettings(),
//       apiSettingsSvc.getDeepSeekSettings(),
//       deepseekSvc.getUserUsage(period),
//     ]);

//     return success(res, {
//       balance,
//       usage,
//       alertSettings,
//       apiSettings,
//       userUsage,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error('[usage.getDashboard]', err.message);
//     return error(res, 'Failed to fetch dashboard', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/logs
// //  سجلات الاستخدام مع فلاتر وصفحات
// // ═══════════════════════════════════════════════════════════
// exports.getUsageLogs = async (req, res) => {
//   try {
//     const { page = 1, limit = 50, startDate, endDate, feature, model, status, userId, userName } = req.query;
//     const result = await deepseekSvc.getLogs({ page, limit, startDate, endDate, feature, model, status, userId, userName });
//     return success(res, result);
//   } catch (err) {
//     console.error('[usage.getUsageLogs]', err.message);
//     return error(res, 'Failed to fetch logs', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/logs/:id
// // ═══════════════════════════════════════════════════════════
// exports.getUsageLogDetail = async (req, res) => {
//   try {
//     const log = await TokenUsage.findByPk(req.params.id, {
//       include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'planKey'], required: false }],
//     });
//     if (!log) return error(res, 'Log not found', 404);
//     return success(res, log);
//   } catch (err) {
//     return error(res, 'Failed to fetch log', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  DELETE /api/v1/usage/logs/clear
// // ═══════════════════════════════════════════════════════════
// exports.clearOldLogs = async (req, res) => {
//   try {
//     const { days = 90 } = req.body;
//     const result = await deepseekSvc.clearOldLogs(parseInt(days));
//     if (result.success) return success(res, { deletedCount: result.deletedCount }, `Cleared ${result.deletedCount} logs`);
//     return error(res, result.error, 500);
//   } catch (err) {
//     return error(res, 'Failed to clear logs', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/stats
// //  إحصائيات مفصّلة (يومية + ميزة + نموذج)
// // ═══════════════════════════════════════════════════════════
// exports.getUsageStats = async (req, res) => {
//   try {
//     const { period = 'month' } = req.query;
//     const stats = await deepseekSvc.getUsageStats(period);
//     return success(res, stats);
//   } catch (err) {
//     return error(res, 'Failed to fetch stats', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/user-usage
// //  الاستخدام حسب المستخدم
// // ═══════════════════════════════════════════════════════════
// exports.getUserUsage = async (req, res) => {
//   try {
//     const { period = 'month' } = req.query;
//     const data = await deepseekSvc.getUserUsage(period);
//     return success(res, data);
//   } catch (err) {
//     return error(res, 'Failed to fetch user usage', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET /api/v1/usage/api-settings
// //  PUT /api/v1/usage/api-settings
// // ═══════════════════════════════════════════════════════════
// exports.getApiSettings = async (req, res) => {
//   try {
//     const settings = await apiSettingsSvc.getDeepSeekSettings();
//     // لا نرجع مفتاح API كاملاً — نخفيه جزئياً
//     if (settings.apiKey) {
//       settings.apiKeyMasked = settings.apiKey.substring(0, 6) + '***' + settings.apiKey.slice(-4);
//       delete settings.apiKey;
//     }
//     return success(res, settings);
//   } catch (err) {
//     return error(res, 'Failed to fetch API settings', 500);
//   }
// };

// exports.updateApiSettings = async (req, res) => {
//   try {
//     const result = await apiSettingsSvc.updateDeepSeekSettings(req.body);
//     if (result.success) return success(res, result.settings, 'API settings updated');
//     return error(res, result.error, 500);
//   } catch (err) {
//     return error(res, 'Failed to update API settings', 500);
//   }
// };

// exports.testApiKey = async (req, res) => {
//   try {
//     const { apiKey } = req.body;
//     if (!apiKey) return error(res, 'API key is required', 400);
//     const result = await apiSettingsSvc.testApiKey(apiKey);
//     if (result.success) return success(res, result, 'API key is valid');
//     return error(res, result.error || 'Invalid API key', 400);
//   } catch (err) {
//     return error(res, 'Failed to test API key', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  GET  /api/v1/usage/alerts/settings
// //  PUT  /api/v1/usage/alerts/settings
// //  POST /api/v1/usage/alerts/check   ← يرسل إيميل حقيقي
// //  POST /api/v1/usage/alerts/test    ← إرسال تجريبي فوري
// // ═══════════════════════════════════════════════════════════
// exports.getAlertSettings = async (req, res) => {
//   try {
//     const settings = await deepseekSvc.getAlertSettings();
//     return success(res, settings);
//   } catch (err) {
//     return error(res, 'Failed to fetch alert settings', 500);
//   }
// };

// exports.updateAlertSettings = async (req, res) => {
//   try {
//     const result = await deepseekSvc.updateAlertSettings(req.body);
//     if (result.success) return success(res, result.settings, 'Alert settings saved');
//     return error(res, result.error, 500);
//   } catch (err) {
//     return error(res, 'Failed to update alert settings', 500);
//   }
// };

// // يُحقق من حدود التنبيه ويرسل إيميل حقيقي إذا تجاوزها
// exports.checkAlerts = async (req, res) => {
//   try {
//     const { force = false } = req.body;
//     const result = await deepseekSvc.checkAndSendAlerts(force);
//     const msg = result.sent
//       ? `${result.alerts.length} alert(s) sent to: ${result.recipients?.join(', ')}`
//       : `No alerts sent — ${result.reason || 'thresholds not exceeded'}`;
//     return success(res, result, msg);
//   } catch (err) {
//     console.error('[usage.checkAlerts]', err.message);
//     return error(res, 'Failed to check alerts: ' + err.message, 500);
//   }
// };

// // إرسال إيميل تجريبي فوري بغض النظر عن الحدود
// exports.testAlert = async (req, res) => {
//   try {
//     const result = await deepseekSvc.checkAndSendAlerts(true); // force=true
//     return success(res, result, result.sent ? 'Test alert sent' : 'Alert sent (no thresholds exceeded but forced)');
//   } catch (err) {
//     return error(res, 'Failed to send test alert: ' + err.message, 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  PUT /api/v1/usage/balance
// // ═══════════════════════════════════════════════════════════
// exports.updateBalance = async (req, res) => {
//   try {
//     const { toppedUp, monthlyExpenses } = req.body;
//     const result = await deepseekSvc.updateBalance(toppedUp, monthlyExpenses);
//     if (result.success) return success(res, result.balance, 'Balance updated');
//     return error(res, result.error, 500);
//   } catch (err) {
//     return error(res, 'Failed to update balance', 500);
//   }
// };

// // ═══════════════════════════════════════════════════════════
// //  POST /api/v1/usage/simulate  (Testing)
// // ═══════════════════════════════════════════════════════════
// exports.simulateUsage = async (req, res) => {
//   try {
//     const { userId, feature, tokens = 1000, model = 'deepseek-chat' } = req.body;
//     const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];

//     let targetUser = userId
//       ? await User.findByPk(userId)
//       : await User.findOne({ where: { role: 'user' } });

//     if (!targetUser) return error(res, 'No user found for simulation', 404);

//     const result = await deepseekSvc.recordUsage({
//       userId:       targetUser.id,
//       feature:      features.includes(feature) ? feature : features[Math.floor(Math.random() * features.length)],
//       model,
//       inputTokens:  Math.floor(tokens * 0.6),
//       outputTokens: Math.ceil(tokens * 0.4),
//       status:       'success',
//       metadata:     { simulated: true, source: 'admin_test' },
//     });

//     return success(res, result, `Simulated ${tokens} tokens for ${targetUser.email}`);
//   } catch (err) {
//     return error(res, 'Failed to simulate usage: ' + err.message, 500);
//   }
// };

'use strict';
// backend/controllers/usage.controller.js

const deepseekSvc        = require('../services/deepseekUsage.service');
const apiSettingsSvc     = require('../services/apiSettings.service');
const { success, error } = require('../utils/apiResponse');
const { TokenUsage, User } = require('../models');
const { Op } = require('sequelize');

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/dashboard
// ═══════════════════════════════════════════════════════════
exports.getDashboard = async (req, res) => {
  try {
    const period = req.query.period || 'month';

    const [balance, usage, alertSettings, apiSettings, userUsage] = await Promise.all([
      deepseekSvc.getBalance(),
      deepseekSvc.getUsageStats(period),
      deepseekSvc.getAlertSettings(),
      apiSettingsSvc.getDeepSeekSettings(),
      deepseekSvc.getUserUsage(period),
    ]);

    return success(res, {
      balance,
      usage,
      alertSettings,
      apiSettings,
      userUsage,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[usage.getDashboard]', err.message);
    return error(res, 'Failed to fetch dashboard', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/logs
// ═══════════════════════════════════════════════════════════
exports.getUsageLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate, feature, model, status, userId, userName } = req.query;
    const result = await deepseekSvc.getLogs({ page, limit, startDate, endDate, feature, model, status, userId, userName });
    return success(res, result);
  } catch (err) {
    console.error('[usage.getUsageLogs]', err.message);
    return error(res, 'Failed to fetch logs', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/logs/:id
// ═══════════════════════════════════════════════════════════
exports.getUsageLogDetail = async (req, res) => {
  try {
    const log = await TokenUsage.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'planKey'], required: false }],
    });
    if (!log) return error(res, 'Log not found', 404);
    return success(res, log);
  } catch (err) {
    return error(res, 'Failed to fetch log', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  DELETE /api/v1/usage/logs/clear
// ═══════════════════════════════════════════════════════════
exports.clearOldLogs = async (req, res) => {
  try {
    const { days = 90 } = req.body;
    const result = await deepseekSvc.clearOldLogs(parseInt(days));
    if (result.success) return success(res, { deletedCount: result.deletedCount }, `Cleared ${result.deletedCount} logs`);
    return error(res, result.error, 500);
  } catch (err) {
    return error(res, 'Failed to clear logs', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/stats
// ═══════════════════════════════════════════════════════════
exports.getUsageStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const stats = await deepseekSvc.getUsageStats(period);
    return success(res, stats);
  } catch (err) {
    return error(res, 'Failed to fetch stats', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/user-usage
// ═══════════════════════════════════════════════════════════
exports.getUserUsage = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const data = await deepseekSvc.getUserUsage(period);
    return success(res, data);
  } catch (err) {
    return error(res, 'Failed to fetch user usage', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  GET /api/v1/usage/api-settings
//  PUT /api/v1/usage/api-settings
// ═══════════════════════════════════════════════════════════
exports.getApiSettings = async (req, res) => {
  try {
    const settings = await apiSettingsSvc.getDeepSeekSettings();
    // ✅ FIX: return full API key — admin-only route, already protected by auth middleware
    return success(res, settings);
  } catch (err) {
    return error(res, 'Failed to fetch API settings', 500);
  }
};

exports.updateApiSettings = async (req, res) => {
  try {
    const result = await apiSettingsSvc.updateDeepSeekSettings(req.body);
    if (result.success) return success(res, result.settings, 'API settings updated');
    return error(res, result.error, 500);
  } catch (err) {
    return error(res, 'Failed to update API settings', 500);
  }
};

exports.testApiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) return error(res, 'API key is required', 400);
    const result = await apiSettingsSvc.testApiKey(apiKey);
    if (result.success) return success(res, result, 'API key is valid');
    return error(res, result.error || 'Invalid API key', 400);
  } catch (err) {
    return error(res, 'Failed to test API key', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  Alert Settings
// ═══════════════════════════════════════════════════════════
exports.getAlertSettings = async (req, res) => {
  try {
    const settings = await deepseekSvc.getAlertSettings();
    return success(res, settings);
  } catch (err) {
    return error(res, 'Failed to fetch alert settings', 500);
  }
};

exports.updateAlertSettings = async (req, res) => {
  try {
    const result = await deepseekSvc.updateAlertSettings(req.body);
    if (result.success) return success(res, result.settings, 'Alert settings saved');
    return error(res, result.error, 500);
  } catch (err) {
    return error(res, 'Failed to update alert settings', 500);
  }
};

// ✅ FIX: checkAlerts — calls checkAndSendAlerts which now exists
exports.checkAlerts = async (req, res) => {
  try {
    const { force = false } = req.body;
    const result = await deepseekSvc.checkAndSendAlerts(force);
    const msg = result.sent
      ? `${result.alerts?.length || 0} alert(s) sent to: ${result.recipients?.join(', ')}`
      : `No alerts sent — ${result.reason || 'thresholds not exceeded'}`;
    return success(res, result, msg);
  } catch (err) {
    console.error('[usage.checkAlerts]', err.message);
    return error(res, 'Failed to check alerts: ' + err.message, 500);
  }
};

// ✅ FIX: testAlert — force=true so it always sends regardless of thresholds
exports.testAlert = async (req, res) => {
  try {
    const result = await deepseekSvc.checkAndSendAlerts(true);
    return success(res, result, result.sent ? 'Test alert sent ✅' : result.reason || 'Could not send alert');
  } catch (err) {
    return error(res, 'Failed to send test alert: ' + err.message, 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  PUT /api/v1/usage/balance
// ═══════════════════════════════════════════════════════════
exports.updateBalance = async (req, res) => {
  try {
    const { toppedUp, monthlyExpenses } = req.body;
    const result = await deepseekSvc.updateBalance(toppedUp, monthlyExpenses);
    if (result.success) return success(res, result.balance, 'Balance updated');
    return error(res, result.error, 500);
  } catch (err) {
    return error(res, 'Failed to update balance', 500);
  }
};

// ═══════════════════════════════════════════════════════════
//  POST /api/v1/usage/simulate
// ═══════════════════════════════════════════════════════════
exports.simulateUsage = async (req, res) => {
  try {
    const { userId, feature, tokens = 1000, model = 'deepseek-v4-flash' } = req.body;
    const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];

    let targetUser = userId
      ? await User.findByPk(userId)
      : await User.findOne({ where: { role: 'user' } });

    if (!targetUser) return error(res, 'No user found for simulation', 404);

    const result = await deepseekSvc.recordUsage({
      userId:       targetUser.id,
      feature:      features.includes(feature) ? feature : features[Math.floor(Math.random() * features.length)],
      model,
      inputTokens:  Math.floor(tokens * 0.6),
      outputTokens: Math.ceil(tokens * 0.4),
      status:       'success',
      metadata:     { simulated: true, source: 'admin_test' },
    });

    return success(res, result, `Simulated ${tokens} tokens for ${targetUser.email}`);
  } catch (err) {
    return error(res, 'Failed to simulate usage: ' + err.message, 500);
  }
};