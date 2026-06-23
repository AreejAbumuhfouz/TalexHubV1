'use strict';
// backend/controllers/admin/careerPath.admin.controller.js

const { success, error } = require('../../utils/apiResponse');
const { LearningPath, User } = require('../../models');
const { getSetting, setSetting } = require('../../services/settings.service');
const { Op, fn, col, literal } = require('sequelize');

// ════════════════════════════════════════════════════════════
// DEFAULT LIMITS
// ════════════════════════════════════════════════════════════
const DEFAULT_CAREER_LIMITS = {
  free:  { perDay: 0, perMonth: 0,  allowGeneration: false },
  pro:   { perDay: 1, perMonth: 5,  allowGeneration: true  },
  elite: { perDay: 3, perMonth: 15, allowGeneration: true  },
};

const getConfig = async () => {
  try {
    const row = await getSetting('career_path_limits');
    if (!row) return DEFAULT_CAREER_LIMITS;
    if (typeof row === 'object') return row;
    return JSON.parse(row);
  } catch {}
  return DEFAULT_CAREER_LIMITS;
};

// ════════════════════════════════════════════════════════════
// GET /admin/career-path/limits
// ════════════════════════════════════════════════════════════
exports.getLimits = async (req, res) => {
  try {
    const limits = await getConfig();
    return success(res, { limits });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// PUT /admin/career-path/limits
// ════════════════════════════════════════════════════════════
exports.updateLimits = async (req, res) => {
  try {
    const { limits } = req.body;
    if (!limits || typeof limits !== 'object')
      return error(res, 'Limits object required', 400);

    for (const [key, cfg] of Object.entries(limits)) {
      if (!['free', 'pro', 'elite'].includes(key))
        return error(res, `Invalid plan key: ${key}`, 400);
    }

    await setSetting('career_path_limits', limits);
    return success(res, { limits }, 'Career path limits updated ✅');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// POST /admin/career-path/limits/reset
// ════════════════════════════════════════════════════════════
exports.resetLimits = async (req, res) => {
  try {
    await setSetting('career_path_limits', DEFAULT_CAREER_LIMITS);
    return success(res, { limits: DEFAULT_CAREER_LIMITS }, 'Limits reset to defaults');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/career-path/sessions — all generated paths
// ════════════════════════════════════════════════════════════
exports.getAllSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await LearningPath.findAndCountAll({
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
        required: false,
      }],
      order:  [['generatedAt', 'DESC']],
      limit:  parseInt(limit),
      offset,
    });

    return success(res, {
      sessions: rows,
      pagination: {
        total:      count,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/career-path/stats
// ════════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
  try {
    const total   = await LearningPath.count();
    const today   = new Date(); today.setHours(0, 0, 0, 0);
    const month   = new Date(); month.setDate(1); month.setHours(0, 0, 0, 0);

    const [todayCount, monthCount] = await Promise.all([
      LearningPath.count({ where: { generatedAt: { [Op.gte]: today } } }),
      LearningPath.count({ where: { generatedAt: { [Op.gte]: month } } }),
    ]);

    // Usage by plan
    const byPlan = await LearningPath.findAll({
      include: [{
        model: User, as: 'user',
        attributes: [],
        required: true,
      }],
      attributes: [
        [col('user.plan_key'), 'planKey'],
        [fn('COUNT', col('LearningPath.id')), 'count'],
      ],
      group: ['user.plan_key'],
      raw: true,
    });

    return success(res, {
      total,
      todayCount,
      monthCount,
      byPlan: byPlan.map(r => ({ planKey: r.planKey, count: parseInt(r.count) })),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};