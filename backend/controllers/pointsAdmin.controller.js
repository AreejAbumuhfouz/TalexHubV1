'use strict';
// backend/controllers/pointsAdmin.controller.js
// ════════════════════════════════════════════════════════════
// Admin endpoints للتحكم الكامل بنظام النقاط
// ════════════════════════════════════════════════════════════

const pointsCfg  = require('../config/pointsConfig');
const walletSvc  = require('../services/wallet.service');
const { User, Wallet, WalletTransaction, TokenUsage } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { success, error, paginate } = require('../utils/apiResponse');

// ════════════════════════════════════════════════════════════
//  GET /api/v1/points-admin/config
// ════════════════════════════════════════════════════════════
exports.getConfig = async (req, res) => {
  try {
    const cfg = await pointsCfg.get();
    return success(res, cfg);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  PUT /api/v1/points-admin/config
// ════════════════════════════════════════════════════════════
exports.updateConfig = async (req, res) => {
  try {
    const cfg = await pointsCfg.set(req.body);
    return success(res, cfg, 'Points configuration updated');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  GET /api/v1/points-admin/users
//  All users with points, tokens used, cost
// ════════════════════════════════════════════════════════════
exports.getUsersPoints = async (req, res) => {
  try {
    const { page = 1, limit = 30, search, planKey, sortBy = 'points_desc' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Users + wallets
    const userWhere = { deletedAt: null };
    if (planKey) userWhere.planKey = planKey;
    if (search)  userWhere[Op.or] = [
      { fullName: { [Op.iLike]: `%${search}%` } },
      { email:    { [Op.iLike]: `%${search}%` } },
    ];

    const orderMap = {
      points_desc:   [['wallet', 'pointsBalance', 'DESC']],
      points_asc:    [['wallet', 'pointsBalance', 'ASC']],
      name_asc:      [['fullName', 'ASC']],
      plan_desc:     [['planKey', 'DESC']],
    };

    const { count, rows } = await User.findAndCountAll({
      where:   userWhere,
      include: [{
        model:    Wallet,
        as:       'wallet',
        required: false,
        attributes: ['pointsBalance', 'cashBalance', 'isFrozen'],
      }],
      attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl', 'created_at'],
      order:   orderMap[sortBy] || orderMap.points_desc,
      limit:   parseInt(limit),
      offset,
    });

    // Attach token usage totals per user
    const userIds = rows.map(u => u.id);
    const usageTotals = await TokenUsage.findAll({
      where:      { userId: { [Op.in]: userIds } },
      attributes: [
        'userId',
        [fn('SUM', col('total_tokens')),   'totalTokens'],
        [fn('SUM', col('input_tokens')),   'inputTokens'],
        [fn('SUM', col('output_tokens')),  'outputTokens'],
        [fn('SUM', col('estimated_cost')), 'totalCost'],
        [fn('COUNT', col('id')),           'requestCount'],
      ],
      group: ['userId'],
    });

    const usageMap = {};
    usageTotals.forEach(u => {
      usageMap[u.userId] = {
        totalTokens:  parseInt(u.dataValues.totalTokens  || 0),
        inputTokens:  parseInt(u.dataValues.inputTokens  || 0),
        outputTokens: parseInt(u.dataValues.outputTokens || 0),
        totalCost:    parseFloat(u.dataValues.totalCost   || 0),
        requestCount: parseInt(u.dataValues.requestCount  || 0),
      };
    });

    const cfg = await pointsCfg.get();

    const data = rows.map(u => ({
      id:           u.id,
      fullName:     u.fullName,
      email:        u.email,
      planKey:      u.planKey || 'free',
      avatarUrl:    u.avatarUrl,
      points:       u.wallet?.pointsBalance  || 0,
      cashBalance:  u.wallet?.cashBalance    || 0,
      isFrozen:     u.wallet?.isFrozen       || false,
      // Convert points to tokens for admin view
      tokenBalance: (u.wallet?.pointsBalance || 0) * cfg.tokensPerPoint,
      usage:        usageMap[u.id] || { totalTokens: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, requestCount: 0 },
    }));

    return paginate(res, data, count, parseInt(page), parseInt(limit));
  } catch (err) {
    console.error('[pointsAdmin.getUsersPoints]', err.message);
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  POST /api/v1/points-admin/adjust/:userId
//  Adjust points for single user
// ════════════════════════════════════════════════════════════
exports.adjustUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { points, description, action = 'add' } = req.body; // action: add | deduct | set

    if (!points || points <= 0) return error(res, 'points must be positive', 400);

    let wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) wallet = await Wallet.create({ userId });

    let delta = parseInt(points);
    let desc  = description || `Admin adjustment: ${action} ${points} points`;

    if (action === 'deduct') {
      delta = -Math.min(parseInt(points), wallet.pointsBalance); // don't go negative
      await wallet.decrement('pointsBalance', { by: Math.abs(delta) });
    } else if (action === 'set') {
      delta = parseInt(points) - wallet.pointsBalance;
      await wallet.update({ pointsBalance: parseInt(points) });
    } else {
      // add
      await wallet.increment('pointsBalance', { by: delta });
    }

    await WalletTransaction.create({
      walletId:    wallet.id,
      type:        'admin_adjustment',
      pointsDelta: delta,
      cashDelta:   0,
      description: desc,
      createdBy:   req.user.id,
    });

    const updated = await Wallet.findOne({ where: { userId } });
    return success(res, { points: updated.pointsBalance }, `Points adjusted: ${delta > 0 ? '+' : ''}${delta}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  POST /api/v1/points-admin/bulk-adjust
//  Bulk adjust by plan
// ════════════════════════════════════════════════════════════
exports.bulkAdjust = async (req, res) => {
  try {
    const { points, planKey, description } = req.body;
    if (!points || points <= 0) return error(res, 'points required', 400);

    const userWhere = { deletedAt: null, status: 'active' };
    if (planKey) userWhere.planKey = planKey;

    const users   = await User.findAll({ where: userWhere, attributes: ['id'] });
    const wallets = await Wallet.findAll({ where: { userId: { [Op.in]: users.map(u => u.id) } } });

    let updated = 0;
    for (const w of wallets) {
      await w.increment('pointsBalance', { by: parseInt(points) });
      await WalletTransaction.create({
        walletId:    w.id,
        type:        'admin_adjustment',
        pointsDelta: parseInt(points),
        cashDelta:   0,
        description: description || `Bulk points grant — admin`,
        createdBy:   req.user.id,
      });
      updated++;
    }

    return success(res, { updated }, `Added ${points} points to ${updated} users${planKey ? ` (${planKey} plan)` : ''}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  GET /api/v1/points-admin/summary
//  Platform-wide points summary
// ════════════════════════════════════════════════════════════
exports.getSummary = async (req, res) => {
  try {
    const cfg = await pointsCfg.get();

    const [walletStats, usageStats] = await Promise.all([
      Wallet.findAll({
        attributes: [
          [fn('SUM', col('points_balance')), 'totalPoints'],
          [fn('AVG', col('points_balance')), 'avgPoints'],
          [fn('COUNT', col('id')),           'totalWallets'],
        ],
        raw: true,
      }),
      TokenUsage.findAll({
        attributes: [
          [fn('SUM', col('total_tokens')),   'totalTokens'],
          [fn('SUM', col('estimated_cost')), 'totalCost'],
          [fn('COUNT', col('id')),           'totalRequests'],
        ],
        where: { timestamp: { [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        raw: true,
      }),
    ]);

    const w = walletStats[0] || {};
    const u = usageStats[0]  || {};

    return success(res, {
      totalPoints:    parseInt(w.totalPoints  || 0),
      avgPoints:      parseFloat(w.avgPoints  || 0).toFixed(0),
      totalWallets:   parseInt(w.totalWallets || 0),
      totalTokens30d: parseInt(u.totalTokens  || 0),
      totalCost30d:   parseFloat(u.totalCost  || 0),
      totalRequests30d: parseInt(u.totalRequests || 0),
      tokensPerPoint: cfg.tokensPerPoint,
      subscriptionBonus: cfg.subscriptionBonus,
      deductionEnabled:  cfg.deductionEnabled,
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
//  GET /api/v1/points-admin/transactions/:userId
// ════════════════════════════════════════════════════════════
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return success(res, { logs: [], pagination: { total: 0 } });

    const { count, rows } = await WalletTransaction.findAndCountAll({
      where:  { walletId: wallet.id },
      order:  [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset,
    });

    return paginate(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};
