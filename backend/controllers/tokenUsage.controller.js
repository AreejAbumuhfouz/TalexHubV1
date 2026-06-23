// 'use strict';
// // backend/controllers/tokenUsage.controller.js

// const { Op } = require('sequelize');
// const TokenUsage = require('../models/TokenUsage');
// const User       = require('../models/User');
// const { success, error } = require('../utils/apiResponse');

// // DeepSeek pricing (USD per 1M tokens)
// const DEEPSEEK_PRICING = {
//   input:  0.14, // $0.14 per 1M input tokens
//   output: 0.28, // $0.28 per 1M output tokens
// };

// /**
//  * Record token usage — called internally by AI services
//  */
// exports.recordTokenUsage = async ({ userId, feature, inputTokens, outputTokens }) => {
//   try {
//     const totalTokens    = inputTokens + outputTokens;
//     const estimatedCost  = (inputTokens / 1000000 * DEEPSEEK_PRICING.input)
//                          + (outputTokens / 1000000 * DEEPSEEK_PRICING.output);

//     await TokenUsage.create({
//       userId,
//       feature,
//       inputTokens,
//       outputTokens,
//       totalTokens,
//       estimatedCost,
//     });

//     return { success: true };
//   } catch (err) {
//     console.error('Error recording token usage:', err.message);
//     return { success: false, error: err.message };
//   }
// };

// /**
//  * GET /api/v1/token-usage/summary
//  */
// exports.getTokenUsageSummary = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { period = 'month' } = req.query;

//     let startDate;
//     const now = new Date();

//     switch (period) {
//       case 'day':   startDate = new Date(now.setHours(0, 0, 0, 0));              break;
//       case 'week':  startDate = new Date(now.setDate(now.getDate() - 7));        break;
//       case 'month': startDate = new Date(now.setMonth(now.getMonth() - 1));      break;
//       default:      startDate = null;
//     }

//     const where = { userId };
//     if (startDate) where.timestamp = { [Op.gte]: startDate };

//     const usage = await TokenUsage.findAll({ where });

//     const summary = {
//       totalTokens:       usage.reduce((s, u) => s + u.totalTokens, 0),
//       totalInputTokens:  usage.reduce((s, u) => s + u.inputTokens, 0),
//       totalOutputTokens: usage.reduce((s, u) => s + u.outputTokens, 0),
//       totalCost:         usage.reduce((s, u) => s + parseFloat(u.estimatedCost), 0),
//       byFeature:         {},
//       dailyUsage:        [],
//     };

//     const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];
//     features.forEach(f => {
//       const fU = usage.filter(u => u.feature === f);
//       summary.byFeature[f] = {
//         count:  fU.length,
//         tokens: fU.reduce((s, u) => s + u.totalTokens, 0),
//         cost:   fU.reduce((s, u) => s + parseFloat(u.estimatedCost), 0),
//       };
//     });

//     const dailyMap = new Map();
//     usage.forEach(u => {
//       const day = u.timestamp.toISOString().split('T')[0];
//       if (!dailyMap.has(day)) dailyMap.set(day, { date: day, tokens: 0, cost: 0 });
//       const e = dailyMap.get(day);
//       e.tokens += u.totalTokens;
//       e.cost   += parseFloat(u.estimatedCost);
//     });
//     summary.dailyUsage = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

//     const limits = {
//       free:  { monthlyTokens: 100000,   monthlyCost: 1.0  },
//       pro:   { monthlyTokens: 1000000,  monthlyCost: 5.0  },
//       elite: { monthlyTokens: 5000000,  monthlyCost: 20.0 },
//     };
//     const limit          = limits[req.user.planKey || 'free'] || limits.free;
//     summary.limit        = limit;
//     summary.remainingTokens = Math.max(0, limit.monthlyTokens - summary.totalTokens);
//     summary.usagePercent    = Math.min((summary.totalTokens / limit.monthlyTokens) * 100, 100);

//     return success(res, summary);
//   } catch (err) {
//     console.error('Error getting token usage:', err.message);
//     return error(res, 'Failed to get token usage', 500);
//   }
// };

// /**
//  * GET /api/v1/token-usage/platform-metrics  (admin only)
//  */
// exports.getPlatformMetrics = async (req, res) => {
//   try {
//     if (!['admin', 'super_admin'].includes(req.user.role))
//       return error(res, 'Admin access required', 403);

//     const { days = 7 } = req.query;
//     const startDate = new Date();
//     startDate.setDate(startDate.getDate() - parseInt(days));

//     const totalUsage  = await TokenUsage.findAll({ where: { timestamp: { [Op.gte]: startDate } } });
//     const activeUsers = await TokenUsage.findAll({
//       attributes: ['userId'],
//       where:  { timestamp: { [Op.gte]: startDate } },
//       group:  ['userId'],
//     });

//     const totalTokens    = totalUsage.reduce((s, u) => s + u.totalTokens, 0);
//     const avgDailyTokens = totalTokens / parseInt(days);

//     let pressureLevel = 'low', pressureColor = '#22C55E', pressureMessage = 'All systems operational';
//     if      (avgDailyTokens > 5000000) { pressureLevel = 'critical'; pressureColor = '#EF4444'; pressureMessage = 'Critical load!'; }
//     else if (avgDailyTokens > 2000000) { pressureLevel = 'high';     pressureColor = '#F59E0B'; pressureMessage = 'High load. Consider scaling up'; }
//     else if (avgDailyTokens > 500000)  { pressureLevel = 'medium';   pressureColor = '#3B82F6'; pressureMessage = 'Moderate load. Monitor closely'; }

//     const features = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];
//     const featureStats = {};
//     features.forEach(f => {
//       const fU = totalUsage.filter(u => u.feature === f);
//       featureStats[f] = { count: fU.length, tokens: fU.reduce((s, u) => s + u.totalTokens, 0) };
//     });

//     const monthStart    = new Date(new Date().setDate(1));
//     const usedThisMonth = await TokenUsage.sum('total_tokens', { where: { timestamp: { [Op.gte]: monthStart } } });
//     const monthlyLimit  = 10000000;

//     return success(res, {
//       period: `${days} days`,
//       totalTokens, totalRequests: totalUsage.length,
//       activeUsers: activeUsers.length, avgDailyTokens,
//       pressureLevel, pressureColor, pressureMessage, featureStats,
//       apiQuota: {
//         used:      usedThisMonth || 0,
//         limit:     monthlyLimit,
//         remaining: Math.max(0, monthlyLimit - (usedThisMonth || 0)),
//         percent:   ((usedThisMonth || 0) / monthlyLimit) * 100,
//       },
//     });
//   } catch (err) {
//     console.error('Error getting platform metrics:', err.message);
//     return error(res, 'Failed to get platform metrics', 500);
//   }
// };

// /**
//  * GET /api/v1/token-usage/recent
//  */
// exports.getRecentUsage = async (req, res) => {
//   try {
//     const { limit = 20 } = req.query;
//     const usage = await TokenUsage.findAll({
//       where: { userId: req.user.id },
//       order: [['timestamp', 'DESC']],
//       limit: parseInt(limit),
//     });
//     return success(res, usage);
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// /**
//  * POST /api/v1/token-usage/simulate
//  * BUG FIX: was calling `tokenUsageService` which was never imported/defined — crash on call
//  */
// exports.simulateUsage = async (req, res) => {
//   try {
//     const { feature, tokens = 1000 } = req.body;
//     const userId = req.user.id;

//     const features        = ['cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat'];
//     const selectedFeature = features.includes(feature) ? feature : features[0];
//     const inputTokens     = Math.floor(tokens * 0.6);
//     const outputTokens    = tokens - inputTokens;
//     const estimatedCost   = (inputTokens / 1000000 * DEEPSEEK_PRICING.input)
//                           + (outputTokens / 1000000 * DEEPSEEK_PRICING.output);

//     // BUG FIX: was `tokenUsageService.recordUsage(...)` — undefined reference
//     // Now calls TokenUsage.create directly (same effect, no missing import)
//     await TokenUsage.create({
//       userId, feature: selectedFeature,
//       inputTokens, outputTokens,
//       totalTokens:   tokens,
//       estimatedCost,
//       status:        'success',
//       timestamp:     new Date(),
//       metadata:      { simulated: true },
//     });

//     return success(res, { message: `Simulated ${tokens} tokens for ${selectedFeature}` });
//   } catch (err) {
//     console.error('Error simulating usage:', err.message);
//     return error(res, err.message, 500);
//   }
// };
