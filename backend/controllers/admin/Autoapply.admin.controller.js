'use strict';

const { JobApplication, User, Job, Company } = require('../../models');
const { success, error } = require('../../utils/apiResponse');
const { Op }             = require('sequelize');

// ════════════════════════════════════════════════════════════
// GET /admin/auto-apply/applications
// ════════════════════════════════════════════════════════════
exports.getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const offset = (parseInt(page)-1) * parseInt(limit);
    const sequelize = JobApplication.sequelize;

    const statusFilter = status ? `AND ja.status = '${status}'` : '';
    const searchFilter = search
      ? `AND (u.full_name ILIKE '%${search.replace(/'/g,"''")}%' OR u.email ILIKE '%${search.replace(/'/g,"''")}%' OR j.title ILIKE '%${search.replace(/'/g,"''")}%')`
      : '';

    const baseQuery = `
      FROM job_applications ja
      LEFT JOIN users u    ON u.id  = ja.user_id
      LEFT JOIN jobs j     ON j.id  = ja.job_id
      LEFT JOIN companies c ON c.id = j.company_id
      WHERE ja.is_auto_applied = true
      ${statusFilter} ${searchFilter}
    `;

    const totalRows = await sequelize.query(
      `SELECT COUNT(*)::int AS total ${baseQuery}`,
      { type: sequelize.QueryTypes.SELECT }
    );
    const total = totalRows[0]?.total || 0;

    const rows = await sequelize.query(`
      SELECT
        ja.id, ja.status, ja.match_score AS "matchScore",
        ja.email_sent_at AS "emailSentAt", ja.cover_letter AS "coverLetter",
        ja.created_at AS "createdAt",
        u.id AS "userId", u.full_name AS "userFullName",
        u.email AS "userEmail", u.plan_key AS "userPlanKey",
        u.avatar_url AS "userAvatarUrl",
        j.id AS "jobId", j.title AS "jobTitle",
        c.id AS "companyId", c.name AS "companyName", c.logo_url AS "companyLogo"
      ${baseQuery}
      ORDER BY ja.created_at DESC
      LIMIT :limit OFFSET :offset
    `, {
      replacements: { limit: parseInt(limit), offset },
      type: sequelize.QueryTypes.SELECT,
    });

    const applications = rows.map(r => ({
      id:          r.id,
      status:      r.status,
      matchScore:  r.matchScore,
      emailSentAt: r.emailSentAt,
      coverLetter: r.coverLetter,
      createdAt:   r.createdAt,
      user: {
        id:       r.userId,
        fullName: r.userFullName,
        email:    r.userEmail,
        planKey:  r.userPlanKey,
        avatarUrl:r.userAvatarUrl,
      },
      job: {
        id:    r.jobId,
        title: r.jobTitle,
        company: {
          id:      r.companyId,
          name:    r.companyName,
          logoUrl: r.companyLogo,
        },
      },
    }));

    // Stats
    const statsRows = await sequelize.query(`
      SELECT
        COUNT(*)::int                                                              AS total,
        COUNT(CASE WHEN email_sent_at IS NOT NULL THEN 1 END)::int                AS emails_sent,
        COUNT(CASE WHEN status IN ('viewed','shortlisted','interview','accepted') THEN 1 END)::int AS responded,
        ROUND(AVG(match_score))::int                                              AS avg_score
      FROM job_applications
      WHERE is_auto_applied = true
    `, { type: sequelize.QueryTypes.SELECT });
    const stats = statsRows[0] || {};

    return success(res, {
      applications,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total/parseInt(limit)) },
      stats: {
        total:      stats.total      || 0,
        emailsSent: stats.emails_sent || 0,
        responded:  stats.responded  || 0,
        avgScore:   stats.avg_score  || 0,
        responseRate: stats.total > 0 ? Math.round((stats.responded/stats.total)*100) : 0,
      },
    });
  } catch (err) { return error(res, err.message, 500); }
};