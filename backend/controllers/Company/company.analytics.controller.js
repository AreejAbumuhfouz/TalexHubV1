'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/company.analytics.controller.js
// FIXES:
//   - col('matchScore') → col('match_score')  (underscored:true maps camelCase→snake_case)
//   - where: { matchScore: ... }  → where: { match_score: ... }
//   - order: [['matchScore',...]] → order: [['match_score',...]]
//   - attributes: ['matchScore']  → keep as-is (Sequelize maps it back); ORDER raw string fixed
// ════════════════════════════════════════════════════════════

const { Op, fn, col } = require('sequelize');
const { sequelize, Company, Job, JobApplication, User, CompanyMember } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

/* ── Get company for user (owner OR member) ─────────────── */
const getCompany = async (userId) => {
  let c = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
  if (!c) {
    const m = await CompanyMember.findOne({
      where: { userId },
      include: [{ model: Company, as: 'company', where: { deletedAt: null } }],
    });
    c = m?.company;
  }
  return c;
};

/* ── Get job IDs for a company ──────────────────────────── */
const getJobIds = async (companyId, jobId) => {
  const where = { companyId };
  if (jobId) where.id = jobId;
  const rows = await Job.findAll({ where, attributes: ['id'], raw: true });
  return rows.map(r => r.id);
};

// ════════════════════════════════════════════════════════════
// GET /companies/analytics/overview
// ════════════════════════════════════════════════════════════
exports.getOverview = async (req, res) => {
  try {
    const company = await getCompany(req.user.id);
    if (!company) return error(res, 'لا توجد شركة مرتبطة', 404);

    const days  = Math.min(365, Math.max(1, parseInt(req.query.range) || 30));
    const since = new Date(Date.now() - days * 86400000);
    const prev  = new Date(Date.now() - days * 2 * 86400000);

    const jobIds = await getJobIds(company.id);

    if (!jobIds.length) {
      return success(res, {
        totalApplicants: 0, newApplicants: 0, prevApplicants: 0, applicantGrowth: null,
        activeJobs: 0, closedJobs: 0, totalJobs: 0,
        shortlisted: 0, interviewed: 0, hired: 0, conversionRate: 0, avgMatchScore: null,
        pipeline: { sent:0, viewed:0, shortlisted:0, interview:0, accepted:0, rejected:0 },
      });
    }

    const [total, newApps, prevApps, activeJobs, closedJobs, pipeline, avgRow] = await Promise.all([
      JobApplication.count({ where: { jobId: { [Op.in]: jobIds } } }),
      JobApplication.count({ where: { jobId: { [Op.in]: jobIds }, created_at: { [Op.gte]: since } } }),
      JobApplication.count({ where: { jobId: { [Op.in]: jobIds }, created_at: { [Op.between]: [prev, since] } } }),
      Job.count({ where: { companyId: company.id, status: 'active' } }),
      Job.count({ where: { companyId: company.id, status: { [Op.in]: ['closed','archived'] } } }),
      JobApplication.findAll({
        where: { jobId: { [Op.in]: jobIds } },
        attributes: ['status', [fn('COUNT', col('id')), 'cnt']],
        group: ['status'], raw: true,
      }),
      // FIX: col('match_score') — snake_case because underscored:true
      // FIX: where key is also snake_case for raw: true queries; use Sequelize field name for ORM
      JobApplication.findOne({
        where: { jobId: { [Op.in]: jobIds }, matchScore: { [Op.ne]: null } },
        attributes: [[fn('AVG', col('match_score')), 'avg']], raw: true,
      }),
    ]);

    const pipeMap = pipeline.reduce((a, r) => { a[r.status] = parseInt(r.cnt); return a; }, {});
    const hired = pipeMap.accepted || 0;

    return success(res, {
      totalApplicants: total,
      newApplicants:   newApps,
      prevApplicants:  prevApps,
      applicantGrowth: prevApps > 0 ? Math.round(((newApps - prevApps) / prevApps) * 100) : null,
      activeJobs,
      closedJobs,
      totalJobs:       activeJobs + closedJobs,
      shortlisted:     pipeMap.shortlisted || 0,
      interviewed:     pipeMap.interview   || 0,
      hired,
      conversionRate:  total > 0 ? Math.round((hired / total) * 100) : 0,
      avgMatchScore:   avgRow?.avg ? Math.round(parseFloat(avgRow.avg)) : null,
      pipeline: {
        sent:        pipeMap.sent        || 0,
        viewed:      pipeMap.viewed      || 0,
        shortlisted: pipeMap.shortlisted || 0,
        interview:   pipeMap.interview   || 0,
        accepted:    pipeMap.accepted    || 0,
        rejected:    pipeMap.rejected    || 0,
      },
    });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/analytics/applicants-over-time
// ════════════════════════════════════════════════════════════
exports.getApplicantsOverTime = async (req, res) => {
  try {
    const company = await getCompany(req.user.id);
    if (!company) return error(res, 'لا توجد شركة', 404);

    const days  = Math.min(365, Math.max(1, parseInt(req.query.range) || 30));
    const since = new Date(Date.now() - days * 86400000);
    const jobIds = await getJobIds(company.id);

    if (!jobIds.length) return success(res, { data: [] });

    const rows = await JobApplication.findAll({
      where: { jobId: { [Op.in]: jobIds }, created_at: { [Op.gte]: since } },
      attributes: [[fn('DATE', col('created_at')), 'date'], [fn('COUNT', col('id')), 'count']],
      group: [fn('DATE', col('created_at'))],
      order: [[fn('DATE', col('created_at')), 'ASC']],
      raw: true,
    });

    const map = rows.reduce((a, r) => { a[r.date] = parseInt(r.count); return a; }, {});
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d   = new Date(Date.now() - i * 86400000);
      const key = d.toISOString().split('T')[0];
      data.push({ date: key, count: map[key] || 0 });
    }

    return success(res, { data });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/analytics/top-jobs
// ════════════════════════════════════════════════════════════
exports.getTopJobs = async (req, res) => {
  try {
    const company = await getCompany(req.user.id);
    if (!company) return error(res, 'لا توجد شركة', 404);

    const jobs = await Job.findAll({
      where: { companyId: company.id, deletedAt: null },
      attributes: ['id','title','status','applicationsCount','viewsCount','created_at'],
      order: [['applicationsCount','DESC']],
      limit: 8,
    });

    return success(res, { jobs });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/analytics/pipeline
// ════════════════════════════════════════════════════════════
exports.getPipeline = async (req, res) => {
  try {
    const company = await getCompany(req.user.id);
    if (!company) return error(res, 'لا توجد شركة', 404);

    const jobIds = await getJobIds(company.id, req.query.jobId);
    if (!jobIds.length) return success(res, { columns: {}, total: 0 });

    const STAGES = ['sent','viewed','shortlisted','interview','accepted','rejected'];

    const apps = await JobApplication.findAll({
      where: { jobId: { [Op.in]: jobIds } },
      // FIX: keep camelCase field names for Sequelize ORM attributes (it maps them)
      // FIX: order must use snake_case string when underscored:true
      attributes: ['id','status','matchScore','created_at','interviewAt','coverLetter','companyNote'],
      include: [
        { model: User, as: 'applicant', attributes: ['id','fullName','avatarUrl','email','headline','locationCity','locationCountry'] },
        { model: Job,  as: 'job',       attributes: ['id','title'] },
      ],
      order: [['match_score', 'DESC NULLS LAST']],
    });

    const columns = STAGES.reduce((a, s) => { a[s] = []; return a; }, {});
    apps.forEach(a => { (columns[a.status] || columns.sent).push(a); });

    return success(res, { columns, total: apps.length });
  } catch (err) { return error(res, err.message, 500); }
};