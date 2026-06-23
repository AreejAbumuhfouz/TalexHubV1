'use strict';
const aiService = require('../services/ai.service');
const { TrainingSession } = require('../models');
const { Op } = require('sequelize');

/* ── GET /training/limits ── */
exports.checkLimits = async (req, res) => {
  try {
    const planKey = req.user.planKey || req.user.plan_key || 'free';
    const allLimits = await aiService.getLimitsConfig();
    const limits = allLimits[planKey] || allLimits.free;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await TrainingSession.count({
      where: { userId: req.user.id, startedAt: { [Op.gte]: today } },
    });

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthCount = await TrainingSession.count({
      where: { userId: req.user.id, startedAt: { [Op.gte]: monthStart } },
    });

    return res.json({
      success: true,
      data: { limits, usage: { today: todayCount, thisMonth: monthCount }, planKey },
    });
  } catch (err) {
    console.error('checkLimits error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /training/generate ── */
exports.generate = async (req, res) => {
  try {
    const { jobTitle, jobDescription = '', difficulty = 'medium', count = 5, language = 'ar' } = req.body;
    if (!jobTitle) return res.status(400).json({ success: false, message: 'jobTitle is required' });

    const planKey = req.user?.planKey || 'free';
    const limitCheck = await aiService.checkInterviewLimit(req.user.id, planKey);
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false, message: limitCheck.message, upgradeRequired: limitCheck.upgradeRequired,
      });
    }

    const maxQuestions = limitCheck.limits?.questionsPerInterview || 8;
    const finalCount   = Math.min(parseInt(count) || 5, maxQuestions);

    const result = await aiService.generateInterviewQuestions({
      jobTitle, jobDescription, difficulty, count: finalCount, language,
      // ✅ FIX: userInfo so token usage logged with correct userId
      userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
    });
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Error in generate:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /training/score ── */
exports.scoreAnswer = async (req, res) => {
  try {
    const { question, answer, jobTitle, language = 'ar' } = req.body;
    if (!question || !answer)
      return res.status(400).json({ success: false, message: 'question and answer required' });

    const result = await aiService.scoreInterviewAnswer({
      question, answer, jobTitle, language,
      // ✅ FIX: userInfo so token usage logged with correct userId
      userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /training/sessions ── */
exports.saveSession = async (req, res) => {
  try {
    const { jobTitle, questions, answers, overallScore, status = 'completed' } = req.body;
    const session = await TrainingSession.create({
      userId:      req.user.id,
      title:       jobTitle,
      questions,
      answers:     answers?.map((a, i) => ({ q: questions?.[i]?.question, a })),
      overallScore: parseFloat(overallScore) || 0,
      status,
      startedAt:   new Date(),
      completedAt: status === 'completed' ? new Date() : null,
    });
    res.json({ success: true, data: session });
  } catch (err) {
    console.error('Error in saveSession:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /training/sessions ── */
exports.getSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { rows, count } = await TrainingSession.findAndCountAll({
      where:  { userId: req.user.id },
      order:  [['startedAt', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    res.json({ success: true, data: { rows, count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /training/deduct-points ── */
exports.deductPoints = async (req, res) => {
  try {
    const { points, description } = req.body;
    if (!points || points <= 0)
      return res.status(400).json({ success: false, message: 'Invalid points amount' });

    const { Wallet, WalletTransaction } = require('../models');
    let wallet = await Wallet.findOne({ where: { userId: req.user.id } });
    if (!wallet) wallet = await Wallet.create({ userId: req.user.id, pointsBalance: 0 });

    if (wallet.pointsBalance < points)
      return res.status(400).json({ success: false, message: `Insufficient balance. Have ${wallet.pointsBalance}, need ${points}.` });

    await wallet.update({ pointsBalance: wallet.pointsBalance - points });
    await WalletTransaction.create({
      walletId: wallet.id, type: 'ai_usage', pointsDelta: -points,
      description: description || 'AI Interview — Points deducted',
    });

    return res.json({ success: true, data: { pointsBalance: wallet.pointsBalance, deducted: points } });
  } catch (err) {
    console.error('Error deducting points:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /training/end-session ── */
exports.endSession = async (req, res) => {
  try { return res.json({ success: true }); }
  catch (err) { return res.status(500).json({ success: false, message: err.message }); }
};

/* ── ADMIN: GET limits ── */
exports.getLimits = async (req, res) => {
  try {
    const config = await aiService.getLimitsConfig();
    res.json({ success: true, data: { limits: config } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── ADMIN: PUT limits ── */
exports.updateLimits = async (req, res) => {
  try {
    const { limits } = req.body;
    if (!limits || typeof limits !== 'object')
      return res.status(400).json({ success: false, message: 'Limits object required' });

    const { setSetting } = require('../services/settings.service');
    await setSetting('interview_limits', limits);
    res.json({ success: true, data: { limits } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};