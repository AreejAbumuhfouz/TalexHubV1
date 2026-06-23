
'use strict';

const { User, CV, JobApplication, TrainingSession, Notification,
        Wallet, UserCourse, Job, Company } = require('../models');
const { success, error } = require('../utils/apiResponse');
const storageSvc         = require('../services/storage.service');
const bcrypt             = require('bcryptjs');
const { Op, fn, col }    = require('sequelize');

// ════════════════════════════════════════════════════════════
// GET /api/v1/users/me/stats
// ════════════════════════════════════════════════════════════
exports.getMyStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const d30    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const d7     = new Date(Date.now() -  7 * 24 * 60 * 60 * 1000);

    const [
      cvCount, appCount, trainingCount, coursesCount,
      topCV, recentApps, wallet, trainingSessions,
      appsByStatus, newAppsThisWeek,
    ] = await Promise.all([

      CV.count({ where: { userId } }).catch(() => 0),

      JobApplication.count({ where: { userId } }).catch(() => 0),

      TrainingSession.count({ where: { userId } }).catch(() => 0),

      UserCourse.count({ where: { userId } }).catch(() => 0),

      // CV.findOne({
      //   where:      { userId, is_primary: true },
      //   attributes: ['id', 'title', 'ats_score', 'file_type', 'created_at'],
      // }).catch(() => null),
      CV.findOne({
  where:      { userId, is_primary: true },
  attributes: ['id', 'title', 'ats_score', 'atsScore', 'analysisData', 'file_type', 'created_at'],
}).catch(() => null),

      // recent 6 with job title + company logo
      JobApplication.findAll({
        where:   { userId },
        limit:   6,
        order:   [['created_at', 'DESC']],
        include: [{
          model:      Job,
          as:         'job',
          attributes: ['id', 'title', 'titleAr'],
          required:   false,
          include:    [{
            model:      Company,
            as:         'company',
            attributes: ['id', 'name', 'logoUrl'],
            required:   false,
          }],
        }],
      }).catch(() => []),

      Wallet.findOne({ where: { userId } }).catch(() => null),

      // last 5 completed training sessions for avg score
      // TrainingSession.findAll({
      //   where:      { userId, status: 'completed' },
      //   limit:      5,
      //   order:      [['started_at', 'DESC']],
      //   attributes: ['id', 'title', 'overall_score', 'started_at'],
      // }).catch(() => []),
      TrainingSession.findAll({
  where:      { userId, status: 'completed' },
  limit:      5,
  order:      [['completedAt', 'DESC']],
  attributes: ['id', 'title', 'overallScore', 'completedAt'],
}).catch(() => []),

      // count by status — last 30 days for funnel chart
      JobApplication.findAll({
        where:      { userId, createdAt: { [Op.gte]: d30 } },
        attributes: ['status', [fn('COUNT', col('id')), 'count']],
        group:      ['status'],
        raw:        true,
      }).catch(() => []),

      JobApplication.count({
        where: { userId, createdAt: { [Op.gte]: d7 } },
      }).catch(() => 0),
    ]);

    // build status map
    const statusMap = {};
    appsByStatus.forEach(r => { statusMap[r.status] = parseInt(r.count || 0); });

    // average training score
    // const avgTrainingScore = trainingSessions.length
    //   ? Math.round(trainingSessions.reduce((s, t) => s + parseFloat(t.overall_score || 0), 0) / trainingSessions.length)
    //   : null;
      const avgTrainingScore = trainingSessions.length
  ? Math.round(trainingSessions.reduce((s, t) => s + parseFloat(t.overallScore || 0), 0) / trainingSessions.length)
  : null;

    return success(res, {
      cvCount,
      applicationCount:   appCount,
      trainingCount,
      coursesCount,
      pointsBalance:      wallet?.pointsBalance  || 0,
      cashBalance:        parseFloat(wallet?.cashBalance || 0).toFixed(2),
      currency:           wallet?.currency || 'USD',

      topCV: topCV ? {
  id:       topCV.id,
  title:    topCV.title,
  ats_score: topCV.ats_score || topCV.atsScore || 0,
  atsScore:  topCV.ats_score || topCV.atsScore || 0,
  // aiScore = DeepSeek result stored in analysisData
  aiScore:   topCV.analysisData?.overallScore || topCV.analysisData?.atsScore || topCV.ats_score || topCV.atsScore || 0,
} : null,
      
      // topCV,
      recentApplications: recentApps.map(a => ({
        id:         a.id,
        status:     a.status,
        createdAt:  a.createdAt,
        matchScore: a.matchScore,
        jobTitle:   a.job?.title  || null,
        company:    a.job?.company
          ? { name: a.job.company.name, logoUrl: a.job.company.logoUrl }
          : null,
      })),
      appsByStatus: {
        sent:        statusMap.sent        || 0,
        viewed:      statusMap.viewed      || 0,
        shortlisted: statusMap.shortlisted || 0,
        interview:   statusMap.interview   || 0,
        accepted:    statusMap.accepted    || 0,
        rejected:    statusMap.rejected    || 0,
      },
      newAppsThisWeek,
      avgTrainingScore,
      // trainingSessions: trainingSessions.map(t => ({
      //   id:    t.id,
      //   title: t.title,
      //   score: parseFloat(t.overall_score || 0),
      //   date:  t.startedAt,
      // })),
      trainingSessions: trainingSessions.map(t => ({
  id:    t.id,
  title: t.title,
  score: parseFloat(t.overallScore || 0),
  date:  t.completedAt,
})),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName avatarUrl');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// ════════════════════════════════════════════════════════════
// GET /api/v1/users/me
// ════════════════════════════════════════════════════════════
exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash', 'twoFaSecret', 'failedLoginCount', 'lockedUntil'] },
  });
  if (!user) return error(res, 'غير موجود', 404);

  // Profile completion calculation
  const fields = [
    'fullName', 'headline', 'bio',
    'locationCountry', 'locationCity', 'phone',
    'desiredJobTitle', 'desiredIndustries', 'desiredJobTypes', 'avatarUrl',
  ];

  const filled = fields.filter(f => {
    const v = user[f];
    return v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== '');
  });

  const score      = Math.round((filled.length / fields.length) * 100);
  const missing    = fields.filter(f => {
    const v = user[f];
    return !v || (Array.isArray(v) && v.length === 0) || String(v).trim() === '';
  });
  const isComplete = score >= 60;

  return success(res, {
    user,
    profileCompletion: { score, isComplete, missing },
  });
};

// ════════════════════════════════════════════════════════════
// PATCH /api/v1/users/me
// ════════════════════════════════════════════════════════════
exports.updateMe = async (req, res) => {
  const ALLOWED = [
    'fullName', 'phone', 'headline', 'bio',
    'locationCountry', 'locationCity', 'dateOfBirth', 'gender', 'nationality',
    'linkedinUrl', 'portfolioUrl', 'preferredLanguage',
    'desiredJobTitle', 'desiredIndustries', 'desiredLocations',
    'desiredSalaryMin', 'desiredSalaryMax', 'desiredJobTypes',
    'openToWork', 'discoverable', 'autoApplyEnabled',
  ];

  const updates = {};
  ALLOWED.forEach(k => {
    if (req.body[k] === undefined) return;

    if (k === 'dateOfBirth') {
      const val = req.body[k];
      if (!val || String(val).trim() === '' || val === 'Invalid date') return;
      const d = new Date(val);
      if (isNaN(d.getTime())) return;
      updates[k] = d.toISOString().split('T')[0];
      return;
    }

    if ((k === 'desiredSalaryMin' || k === 'desiredSalaryMax') && req.body[k] === '') return;

    updates[k] = req.body[k];
  });

  if (Object.keys(updates).length === 0)
    return error(res, 'لا توجد بيانات للتحديث', 400);

  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 'المستخدم غير موجود', 404);

  await user.update(updates);
  return success(res, { user }, 'تم تحديث الملف الشخصي بنجاح');
};

// ════════════════════════════════════════════════════════════
// PATCH /api/v1/users/me/password
// ════════════════════════════════════════════════════════════
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return error(res, 'يرجى إدخال كلمة المرور الحالية والجديدة', 400);
  if (newPassword.length < 8)
    return error(res, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400);

  const user = await User.findByPk(req.user.id, { attributes: ['id', 'passwordHash'] });
  if (!user) return error(res, 'المستخدم غير موجود', 404);

  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) return error(res, 'كلمة المرور الحالية غير صحيحة', 400);

  const hash = await bcrypt.hash(newPassword, 12);
  await user.update({ passwordHash: hash });
  return success(res, {}, 'تم تغيير كلمة المرور بنجاح');
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/users/me/notifications
// ════════════════════════════════════════════════════════════
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.findAll({
    where: { userId: req.user.id },
    order: [['created_at', 'DESC']],
    limit: 20,
  });
  return success(res, { notifications });
};

// ════════════════════════════════════════════════════════════
// DELETE /api/v1/users/me — soft delete
// ════════════════════════════════════════════════════════════
exports.deleteMe = async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 'المستخدم غير موجود', 404);

  if (user.avatarKey) await storageSvc.remove(user.avatarKey).catch(() => {});

  await user.update({
    status:    'deleted',
    deletedAt: new Date(),
    email:     `deleted_${Date.now()}_${user.email}`,
  });

  res.clearCookie('refreshToken');
  return success(res, {}, 'تم حذف الحساب بنجاح');
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/users/me/avatar/presets
// ════════════════════════════════════════════════════════════
exports.getPresetAvatars = async (req, res) => {
  try {
    const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
    const client = storageSvc.getClient();

    const cmd = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME,
      Prefix: 'avatars/',
    });

    const result = await client.send(cmd);

    const avatars = (result.Contents || [])
      .filter(o => o.Key !== 'avatars/')
      .map(o => ({
        id:  o.Key,
        url: `${process.env.R2_PUBLIC_URL_AVATAR}/${o.Key}`,
      }));

    return success(res, { avatars });
  } catch (err) {
    console.error('getPresetAvatars error:', err);
    return error(res, 'فشل تحميل الصور', 500);
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /api/v1/users/me/avatar/preset — اختيار avatar جاهز
// ════════════════════════════════════════════════════════════
exports.setPresetAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    if (!avatarUrl) return error(res, 'الرابط مطلوب', 400);

    const user = await User.findByPk(req.user.id);
    if (!user) return error(res, 'المستخدم غير موجود', 404);

    // احذف الصورة القديمة فقط إذا كانت صورة مرفوعة من المستخدم
    if (user.avatarKey && user.avatarKey.startsWith('Profileimages/')) {
      await storageSvc.remove(user.avatarKey).catch(() => {});
    }

    await user.update({ avatarUrl, avatarKey: null });
    return success(res, { avatarUrl }, 'تم تحديث الصورة بنجاح');
  } catch (err) {
    return error(res, 'حدث خطأ', 500);
  }
};

// ════════════════════════════════════════════════════════════
// POST /api/v1/users/me/avatar — رفع صورة خاصة
// ════════════════════════════════════════════════════════════
exports.uploadAvatar = async (req, res) => {
  if (!req.file) return error(res, 'يرجى رفع صورة', 400);

  const user = await User.findByPk(req.user.id);
  if (!user) return error(res, 'المستخدم غير موجود', 404);

  // احذف الصورة القديمة فقط إذا كانت في Profileimages
  if (user.avatarKey && user.avatarKey.startsWith('Profileimages/')) {
    await storageSvc.remove(user.avatarKey).catch(() => {});
  }

  const { key, url } = await storageSvc.uploadAvatar({
    buffer:       req.file.buffer,
    mimetype:     req.file.mimetype,
    originalname: req.file.originalname,
  });

  await user.update({ avatarUrl: url, avatarKey: key });
  return success(res, { avatarUrl: url, avatarKey: key }, 'تم رفع الصورة الشخصية بنجاح');
};