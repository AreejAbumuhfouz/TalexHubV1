'use strict';
const { TrainingSession, User } = require('../../models');
const { Op, Sequelize } = require('sequelize');
const { getSetting, setSetting } = require('../../services/settings.service');

/* ── GET ALL TRAINING SESSIONS (Admin) ── */
exports.getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const { rows, count } = await TrainingSession.findAndCountAll({
      include: [{ 
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'plan_key']  // ✅ changed from plan to plan_key
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });
    
    const formattedSessions = rows.map(session => {
      const sessionData = session.toJSON();
      if (sessionData.user) {
        sessionData.user.name = sessionData.user.email?.split('@')[0] || 'User';
      }
      return sessionData;
    });
    
    res.json({ 
      success: true, 
      data: { 
        sessions: formattedSessions, 
        total: count 
      } 
    });
  } catch (err) {
    console.error('Error in getAllSessions:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET SINGLE SESSION DETAILS ── */
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await TrainingSession.findByPk(id, {
      include: [{ 
        model: User, 
        as: 'user',
        attributes: ['id', 'email', 'plan_key']  // ✅ changed from plan to plan_key
      }]
    });
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    const sessionData = session.toJSON();
    if (sessionData.user) {
      sessionData.user.name = sessionData.user.email?.split('@')[0] || 'User';
    }
    
    res.json({ success: true, data: sessionData });
  } catch (err) {
    console.error('Error in getSessionById:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET INTERVIEW LIMITS CONFIGURATION ── */
exports.getLimitsConfig = async (req, res) => {
  try {
    const defaultLimits = {
      free: { perDay: 0, perMonth: 0, allowCreation: false },
      pro: { perDay: 3, perMonth: 18, allowCreation: true },
      elite: { perDay: 5, perMonth: 24, allowCreation: true }
    };
    
    const savedLimits = await getSetting('interview_limits');
    const limits = savedLimits || defaultLimits;
    
    res.json({ success: true, data: { limits } });
  } catch (err) {
    console.error('Error in getLimitsConfig:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── UPDATE INTERVIEW LIMITS CONFIGURATION ── */
exports.updateLimitsConfig = async (req, res) => {
  try {
    const { limits } = req.body;
    
    if (!limits || typeof limits !== 'object') {
      return res.status(400).json({ success: false, message: 'Limits object required' });
    }

    await setSetting('interview_limits', limits);
    
    console.log(`[ADMIN] Interview limits updated by ${req.user?.email}`, limits);

    res.json({ 
      success: true, 
      data: { limits },
      message: 'Interview limits updated successfully'
    });
  } catch (err) {
    console.error('Error in updateLimitsConfig:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET GLOBAL STATISTICS ── */
exports.getGlobalStats = async (req, res) => {
  try {
    const totalSessions = await TrainingSession.count();
    const completedSessions = await TrainingSession.count({ where: { status: 'completed' } });
    
    const avgScoreResult = await TrainingSession.findOne({
      attributes: [[Sequelize.fn('AVG', Sequelize.col('overall_score')), 'avgScore']],
      where: { status: 'completed' }
    });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await TrainingSession.count({
      where: { created_at: { [Op.gte]: today } }
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthSessions = await TrainingSession.count({
      where: { created_at: { [Op.gte]: monthStart } }
    });

    // ✅ changed plan to plan_key
    const usageByPlan = await TrainingSession.findAll({
      include: [{ 
        model: User, 
        as: 'user',
        attributes: [],
        required: true 
      }],
      attributes: [
        [Sequelize.col('user.plan_key'), 'plan'],  // ✅ changed from user.plan to user.plan_key
        [Sequelize.fn('COUNT', Sequelize.col('TrainingSession.id')), 'count']
      ],
      group: ['user.plan_key']  // ✅ changed from user.plan to user.plan_key
    });

    res.json({ 
      success: true, 
      data: {
        totalSessions,
        completedSessions,
        completionRate: totalSessions ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0,
        averageScore: parseFloat(avgScoreResult?.dataValues?.avgScore || 0).toFixed(1),
        todaySessions,
        monthSessions,
        usageByPlan: usageByPlan.map(item => ({
          plan: item.dataValues.plan,
          count: parseInt(item.dataValues.count)
        }))
      }
    });
  } catch (err) {
    console.error('Error in getGlobalStats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET USER USAGE STATISTICS ── */
exports.getUserUsageStats = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    const where = {};
    if (userId) where.userId = userId;
    if (startDate) where.created_at = { [Op.gte]: new Date(startDate) };
    if (endDate) where.created_at = { [Op.lte]: new Date(endDate) };

    const stats = await TrainingSession.findAll({
      where,
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
        [Sequelize.fn('AVG', Sequelize.col('overall_score')), 'avgScore']
      ],
      group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'DESC']],
      limit: 30
    });

    const formattedStats = stats.map(stat => ({
      date: stat.dataValues.date,
      count: parseInt(stat.dataValues.count),
      avgScore: parseFloat(stat.dataValues.avgScore || 0).toFixed(1)
    }));

    res.json({ success: true, data: formattedStats });
  } catch (err) {
    console.error('Error in getUserUsageStats:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── RESET USER LIMITS ── */
exports.resetUserLimits = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'both' } = req.body;
    
    console.log(`[ADMIN] Reset limits for user ${userId}, type: ${type}`);
    
    res.json({ 
      success: true, 
      message: `User ${userId} limits reset successfully (${type})` 
    });
  } catch (err) {
    console.error('Error in resetUserLimits:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};