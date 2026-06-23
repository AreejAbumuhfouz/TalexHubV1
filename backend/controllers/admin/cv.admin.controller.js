
'use strict';

const { CV, User, TokenUsage } = require('../../models');
const storageSvc               = require('../../services/storage.service');
const { getSetting, setSetting } = require('../../services/settings.service');
const { success, error }       = require('../../utils/apiResponse');
const { Op }                   = require('sequelize');

// ════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ════════════════════════════════════════════════════════════
const DEFAULT_CV_PLAN_CONFIG = {
  free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
  pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
  elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
};

// ════════════════════════════════════════════════════════════
// GET /admin/cv-config
// ════════════════════════════════════════════════════════════
exports.getConfig = async (req, res) => {
  try {
    const raw    = await getSetting('cv_plan_config');
    const config = raw ? (typeof raw === 'object' ? raw : JSON.parse(raw)) : DEFAULT_CV_PLAN_CONFIG;
    return success(res, { config, defaults: DEFAULT_CV_PLAN_CONFIG });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// PUT /admin/cv-config
// ════════════════════════════════════════════════════════════
exports.updateConfig = async (req, res) => {
  try {
    const { config } = req.body;
    if (!config) return error(res, 'config is required', 400);
    for (const plan of ['free','pro','elite']) {
      if (!config[plan]) return error(res, `Missing plan: ${plan}`, 400);
    }
    await setSetting('cv_plan_config', JSON.stringify(config));
    try { require('../middleware/checkFeature').bustCache?.(); } catch {}
    return success(res, { config }, 'CV plan config updated ✅');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /admin/cv-stats
// ════════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
  try {
    const sequelize  = CV.sequelize;
    const today      = new Date(); today.setHours(0,0,0,0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);

    // ✅ Use raw SQL to avoid Sequelize column name issues
    const countsRows = await sequelize.query(`
      SELECT
        COUNT(*)::int                                                    AS total,
        COUNT(CASE WHEN created_at >= :today THEN 1 END)::int            AS today_count,
        COUNT(CASE WHEN created_at >= :month_start THEN 1 END)::int      AS month_count,
        COUNT(CASE WHEN is_analyzed = true THEN 1 END)::int              AS analyzed_count,
        COUNT(DISTINCT user_id)::int                                     AS unique_users,
        ROUND(AVG(
  COALESCE(
    (analysis_data->>'overallScore')::int,
    (analysis_data->>'atsScore')::int,
    ats_score
  )
) FILTER (WHERE analysis_data IS NOT NULL OR ats_score IS NOT NULL))::int AS avg_score
      FROM cvs
      WHERE deleted_at IS NULL
    `, { replacements: { today, month_start: monthStart }, type: sequelize.QueryTypes.SELECT });
    const counts = countsRows[0] || {};

    // By plan
    const byPlan = await sequelize.query(`
      SELECT u.plan_key AS "planKey", COUNT(c.id)::int AS count
      FROM cvs c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.deleted_at IS NULL
      GROUP BY u.plan_key
      ORDER BY count DESC
    `, { type: sequelize.QueryTypes.SELECT }).catch(() => []);

    // By language
    const byLanguage = await sequelize.query(`
      SELECT language, COUNT(*)::int AS count
      FROM cvs WHERE deleted_at IS NULL
      GROUP BY language
    `, { type: sequelize.QueryTypes.SELECT }).catch(() => []);

    // ✅ token_usage (no s) + timestamp field
    const usageRows = await sequelize.query(`
      SELECT
        COUNT(CASE WHEN timestamp >= :today THEN 1 END)::int       AS analysis_today,
        COUNT(CASE WHEN timestamp >= :month_start THEN 1 END)::int AS analysis_month
      FROM token_usage
      WHERE feature = 'cv_analysis'
    `, { replacements: { today, month_start: monthStart }, type: sequelize.QueryTypes.SELECT }).catch(() => [{ analysis_today:0, analysis_month:0 }]);
    const usageCounts = usageRows[0] || { analysis_today:0, analysis_month:0 };

    return success(res, {
      total:          counts.total          || 0,
      todayCount:     counts.today_count    || 0,
      monthCount:     counts.month_count    || 0,
      analyzedCount:  counts.analyzed_count || 0,
      uniqueUsers:    counts.unique_users   || 0,
      avgScore:       counts.avg_score      || 0,
      analysisToday:  usageCounts?.analysis_today  || 0,
      analysisMonth:  usageCounts?.analysis_month  || 0,
      byPlan:     byPlan.map(r    => ({ planKey: r.planKey || 'free', count: r.count })),
      byLanguage: byLanguage.map(r => ({ language: r.language || 'en', count: r.count })),
    });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /admin/cvs
// ════════════════════════════════════════════════════════════
exports.listCVs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, plan, lang } = req.query;
    const offset    = (parseInt(page)-1) * parseInt(limit);
    const sequelize = CV.sequelize;

    // Build filters
    const cvFilter   = lang ? `AND c.language = '${lang}'` : '';
    const planFilter = plan ? `AND u.plan_key = '${plan}'` : '';
    const searchFilter = search
      ? `AND (u.full_name ILIKE '%${search.replace(/'/g,"''")}%' OR u.email ILIKE '%${search.replace(/'/g,"''")}%' OR c.title ILIKE '%${search.replace(/'/g,"''")}%')`
      : '';

    const baseQuery = `
      FROM cvs c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.deleted_at IS NULL ${cvFilter} ${planFilter} ${searchFilter}
    `;

    const totalRows = await sequelize.query(
      `SELECT COUNT(*)::int AS total ${baseQuery}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const total = totalRows[0]?.total || 0;

    const rows = await sequelize.query(`
      SELECT
        c.id, c.title, c.language, 
        COALESCE(
  (c.analysis_data->>'overallScore')::int,
  (c.analysis_data->>'atsScore')::int,
  c.ats_score
) AS "atsScore",
c.overall_score AS "overallScore",
        c.is_analyzed AS "isAnalyzed", c.is_primary AS "isPrimary", c.file_url AS "fileUrl",
        c.file_type AS "fileType", c.status, c.analysis_data AS "analysisData",
        c.created_at AS "createdAt",
        u.id AS "userId", u.full_name AS "userFullName", u.email AS "userEmail",
        u.plan_key AS "userPlanKey", u.avatar_url AS "userAvatarUrl"
      ${baseQuery}
      ORDER BY c.created_at DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { limit: parseInt(limit), offset },
      type: sequelize.QueryTypes.SELECT,
    });

    // Format rows
    const cvs = rows.map(r => ({
      id:          r.id,
      title:       r.title,
      language:    r.language,
      atsScore:    r.atsScore,
      overallScore:r.overallScore,
      isAnalyzed:  r.isAnalyzed,
      isPrimary:   r.isPrimary,
      fileUrl:     r.fileUrl,
      fileType:    r.fileType,
      status:      r.status,
      analysisData:r.analysisData,
      createdAt:   r.createdAt,
      user: {
        id:       r.userId,
        fullName: r.userFullName,
        email:    r.userEmail,
        planKey:  r.userPlanKey,
        avatarUrl:r.userAvatarUrl,
      },
    }));

    return success(res, {
      cvs,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total/parseInt(limit)) },
    });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /admin/cvs/:id
// ════════════════════════════════════════════════════════════
exports.getCV = async (req, res) => {
  try {
    const sequelize = CV.sequelize;
    const cvRows = await sequelize.query(`
      SELECT
        c.*, c.created_at AS "createdAt",
        u.id AS "userId", u.full_name AS "userFullName", u.email AS "userEmail",
        u.plan_key AS "userPlanKey", u.avatar_url AS "userAvatarUrl"
      FROM cvs c
      LEFT JOIN users u ON u.id = c.user_id
      WHERE c.id = :id AND c.deleted_at IS NULL
    `, { replacements: { id: req.params.id }, type: sequelize.QueryTypes.SELECT });
    const row = cvRows[0];
    if (!row) return error(res, 'CV not found', 404);

    const cv = {
      ...row,
      user: {
        id:       row.userId,
        fullName: row.userFullName,
        email:    row.userEmail,
        planKey:  row.userPlanKey,
        avatarUrl:row.userAvatarUrl,
      },
    };

    return success(res, { cv });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// DELETE /admin/cvs/:id
// ════════════════════════════════════════════════════════════
exports.deleteCV = async (req, res) => {
  try {
    const cv = await CV.findByPk(req.params.id);
    if (!cv) return error(res, 'CV not found', 404);
    if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(() => {});
    await cv.destroy();
    return success(res, {}, 'CV deleted successfully');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /admin/cv-usage
// ════════════════════════════════════════════════════════════
exports.getUsage = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset     = (parseInt(page)-1) * parseInt(limit);
    const today      = new Date(); today.setHours(0,0,0,0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const sequelize  = CV.sequelize;

    // ✅ token_usage (no s) + timestamp field
    const rows = await sequelize.query(`
      SELECT
        u.id,
        u.full_name       AS "fullName",
        u.email,
        u.plan_key        AS "planKey",
        u.avatar_url      AS "avatarUrl",
        COUNT(CASE WHEN t.timestamp >= :today      THEN 1 END)::int AS "todayCount",
        COUNT(CASE WHEN t.timestamp >= :monthStart THEN 1 END)::int AS "monthCount",
        COUNT(t.id)::int                                            AS "totalCount",
        (SELECT COUNT(*) FROM cvs c WHERE c.user_id = u.id AND c.deleted_at IS NULL)::int AS "cvCount"
      FROM users u
      LEFT JOIN token_usage t ON t.user_id = u.id AND t.feature = 'cv_analysis'
      GROUP BY u.id, u.full_name, u.email, u.plan_key, u.avatar_url
      HAVING COUNT(t.id) > 0
      ORDER BY "totalCount" DESC
      LIMIT :limit OFFSET :offset
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { today, monthStart, limit: parseInt(limit), offset },
    }).catch(() => []);

    return success(res, { usage: rows });
  } catch (err) { return error(res, err.message, 500); }
};