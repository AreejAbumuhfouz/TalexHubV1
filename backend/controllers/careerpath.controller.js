

'use strict';

const { success, error } = require('../utils/apiResponse');
const { LearningPath, CV, Course } = require('../models');
const { generateCareerPath } = require('../services/ai.service');
const { getSetting, setSetting, getSettingBool } = require('../services/settings.service');
const { Op } = require('sequelize');

// ════════════════════════════════════════════════════════════
// DEFAULT LIMITS
// ════════════════════════════════════════════════════════════
const DEFAULT_CAREER_LIMITS = {
  free:  { perDay: 0, perMonth: 0,  allowGeneration: false },
  pro:   { perDay: 1, perMonth: 5,  allowGeneration: true  },
  elite: { perDay: 3, perMonth: 15, allowGeneration: true  },
};

const getCareerLimitsConfig = async () => {
  try {
    const row = await getSetting('career_path_limits');
    if (!row) return DEFAULT_CAREER_LIMITS;
    if (typeof row === 'object') return row;
    return JSON.parse(row);
  } catch {}
  return DEFAULT_CAREER_LIMITS;
};

// Export for use in admin controller
exports.getCareerLimitsConfig = getCareerLimitsConfig;

// ════════════════════════════════════════════════════════════
// ACCESS CHECK
// ════════════════════════════════════════════════════════════
const hasAccess = async (user) => {
  if (!user) return false;
  if (['admin', 'support'].includes(user.role)) return true;
  if (['pro', 'elite'].includes(user.planKey)) return true;
  return await getSettingBool('allow_free_career_path', false);
};

// ════════════════════════════════════════════════════════════
// GET /career-path/limits — user sees their usage + limits
// ════════════════════════════════════════════════════════════
exports.checkLimits = async (req, res) => {
  try {
    const planKey   = req.user.planKey || 'free';
    const allLimits = await getCareerLimitsConfig();
    const limits    = allLimits[planKey] || allLimits.free;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [todayCount, monthCount] = await Promise.all([
      LearningPath.count({ where: { userId: req.user.id, generated_at: { [Op.gte]: today } } }),
      LearningPath.count({ where: { userId: req.user.id, generated_at: { [Op.gte]: monthStart } } }),
    ]);

    return res.json({
      success: true,
      data: {
        limits,
        usage: { today: todayCount, thisMonth: monthCount },
        planKey,
      },
    });
  } catch (err) {
    console.error('checkLimits error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ════════════════════════════════════════════════════════════
// GET /career-path — get saved path
// ════════════════════════════════════════════════════════════
exports.getCareerPath = async (req, res) => {
  if (!await hasAccess(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'مسار الحياة المهنية متاح لمشتركي Pro فقط',
      upgradeRequired: true,
    });
  }
  const path = await LearningPath.findOne({
    where: { userId: req.user.id },
     order: [['generated_at', 'DESC']],
  });
  if (!path) return success(res, null, 'لم يتم إنشاء مسار مهني بعد');
  return success(res, path);
};

// ════════════════════════════════════════════════════════════
// POST /career-path/generate — generate new path
// ════════════════════════════════════════════════════════════
exports.generatePath = async (req, res) => {
  if (!await hasAccess(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'مسار الحياة المهنية متاح لمشتركي Pro فقط',
      upgradeRequired: true,
    });
  }

  // ✅ Check plan limits
  const planKey   = req.user.planKey || 'free';
  const allLimits = await getCareerLimitsConfig();
  const limits    = allLimits[planKey] || allLimits.free;

  if (!limits.allowGeneration) {
    return res.status(403).json({
      success: false,
      message: {
        en: 'Career path generation is not available for your plan. Please upgrade.',
        ar: 'توليد المسار المهني غير متاح لخطتك. يرجى الترقية.',
      },
      upgradeRequired: true,
    });
  }

  // Check daily limit
  if (limits.perDay > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await LearningPath.count({
      where: { userId: req.user.id, generated_at: { [Op.gte]: today } },
    });
    if (todayCount >= limits.perDay) {
      return res.status(429).json({
        success: false,
        message: {
          en: `Daily limit reached (${todayCount}/${limits.perDay}). Try again tomorrow.`,
          ar: `تم الوصول للحد اليومي (${todayCount}/${limits.perDay}). حاول غداً.`,
        },
        upgradeRequired: false,
      });
    }
  }

  // Check monthly limit
  if (limits.perMonth > 0) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthCount = await LearningPath.count({
      where: { userId: req.user.id, generated_at: { [Op.gte]: monthStart } },
    });
    if (monthCount >= limits.perMonth) {
      return res.status(429).json({
        success: false,
        message: {
          en: `Monthly limit reached (${monthCount}/${limits.perMonth}). Upgrade for more.`,
          ar: `تم الوصول للحد الشهري (${monthCount}/${limits.perMonth}). قم بالترقية للمزيد.`,
        },
        upgradeRequired: true,
      });
    }
  }

  const { targetRole, lang = 'ar' } = req.body;

  const cv = await CV.findOne({
    where: { userId: req.user.id, isPrimary: true },
  });
  if (!cv) return error(res, 'يجب رفع سيرة ذاتية أولاً لتوليد المسار المهني', 400);

  const cvText = cv.parsedText || cv.rawText || '';
  if (!cvText || cvText.length < 50)
    return error(res, 'لم يتم تحليل السيرة الذاتية بعد. الرجاء إعادة رفعها', 400);

  try {
    const aiResult = await generateCareerPath({
      cvText, targetRole, lang,
      userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
    });

    let matchedCourses = [];
    if (aiResult.missingSkills?.length > 0) {
      matchedCourses = await Course.findAll({
        where: {
          status: 'published',
          [Op.or]: aiResult.missingSkills.slice(0, 5).map(skill => ({
            skillsCovered: { [Op.contains]: [skill.toLowerCase()] },
          })),
        },
        attributes: ['id', 'title', 'titleAr', 'level', 'thumbnailUrl', 'isFree', 'skillsCovered', 'ratingAvg'],
        limit: 8,
      });
    }

    // await LearningPath.destroy({ where: { userId: req.user.id } });
    // ✅ لا نحذف السجلات القديمة — نحتاجها لعد الاستخدام
const saved = await LearningPath.create({
  userId:             req.user.id,
  goal:               targetRole || aiResult.targetRole,
  currentSkills:      aiResult.currentSkills || [],
  missingSkills:      aiResult.missingSkills || [],
  recommendedCourses: matchedCourses.map(c => c.id),
  aiNotes:            JSON.stringify(aiResult),
  generatedAt:        new Date(), // ✅ للعد الصحيح
});

    return success(res, { ...saved.toJSON(), aiResult, matchedCourses }, 'تم إنشاء مسارك المهني! 🎯');
  } catch (err) {
    console.error('Career path error:', err.message);
    return error(res, 'فشل في توليد المسار المهني. حاول مرة أخرى', 500);
  }
};

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
exports.getSettings = async (req, res) => {
  const allowFreeCareerPath = await getSettingBool('allow_free_career_path', false);
  return success(res, { allowFreeCareerPath });
};

exports.adminToggleFreeAccess = async (req, res) => {
  if (!['admin', 'support'].includes(req.user?.role))
    return error(res, 'غير مصرح', 403);
  const current = await getSettingBool('allow_free_career_path', false);
  await setSetting('allow_free_career_path', String(!current));
  return success(res, { allowFreeCareerPath: !current },
    `مسار الحياة المهنية للـ Free ${!current ? 'مفعّل ✅' : 'معطّل ❌'}`
  );
};