'use strict';
const express = require('express');
const router  = require('express').Router();
const { protect } = require('../middleware/auth');
const { Wallet, WalletTransaction } = require('../models');
const { Op } = require('sequelize');

/* ── GET /wallet/me ── */
router.get('/me', protect, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) wallet = await Wallet.create({ userId: req.user.id });
    res.json({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ── GET /wallet/transactions ── */
router.get('/transactions', protect, async (req, res) => {
  try {
    const { page = 1, limit = 15, type } = req.query;
    const wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) return res.json({ success: true, data: [] });

    const where = { walletId: wallet.id };

    // Filter map — frontend sends: all | ai | gains | cash | credit | debit
    if (type === 'ai')      where.type = 'ai_usage';
    if (type === 'gains')   where.type = { [Op.in]: ['subscription_reward', 'referral_reward', 'admin_adjustment'] };
    if (type === 'credit')  where.type = { [Op.in]: ['subscription_reward', 'referral_reward', 'admin_adjustment'] };
    if (type === 'debit')   where.type = { [Op.in]: ['purchase', 'withdrawal', 'chat_time', 'ai_usage'] };
    if (type === 'cash')    where[Op.or] = [
      { cashDelta: { [Op.gt]: 0 } },
      { cashDelta: { [Op.lt]: 0 } },
    ];

    const { rows, count } = await WalletTransaction.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    const mapped = rows.map(t => ({
      id:           t.id,
      rawType:      t.type,
      // pointsDelta: signed integer (+ = gain, - = deduction)
      pointsDelta:  parseInt(t.pointsDelta || 0),
      cashDelta:    parseFloat(t.cashDelta  || 0),
      // Legacy compat
      amount:       Math.abs(parseFloat(t.cashDelta   || 0)),
      pointsAmount: Math.abs(parseInt(t.pointsDelta   || 0)),
      description:  t.description,
      status:       'completed',
      createdAt:    t.createdAt || t.created_at,
    }));

    res.json({ success: true, data: mapped, total: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
/* ── GET /wallet/points-config — public read ── */
router.get('/points-config', protect, async (req, res) => {
  try {
    const { Setting } = require('../models');
    const row = await Setting.findOne({ where: { key: 'points_config' } });
    const cfg = row ? JSON.parse(row.value) : { tokensPerPoint: 1000, subscriptionBonus: { free: 0, pro: 1000, elite: 3000 } };
    // Return only non-sensitive fields
    res.json({ success: true, data: {
      tokensPerPoint:    cfg.tokensPerPoint    || 1000,
      subscriptionBonus: cfg.subscriptionBonus || { free: 0, pro: 1000, elite: 3000 },
    }});
  } catch {
    res.json({ success: true, data: { tokensPerPoint: 1000, subscriptionBonus: { free: 0, pro: 1000, elite: 3000 } } });
  }
});
/* ── POST /wallet/deposit — disabled ── */
router.post('/deposit', protect, (_req, res) => {
  res.status(403).json({
    success: false,
    message: 'الإيداع المباشر غير مدعوم. يرجى الذهاب لصفحة الاشتراك.',
    code: 'USE_PAYMENT_FLOW',
  });
});

module.exports = router;
