

'use strict';

const { Op } = require('sequelize');
const { Job, Company, JobCategory, JobApplication, User } = require('../models');
const { success, error, paginate } = require('../utils/apiResponse');

// ── helpers ──────────────────────────────────────────────
const jobPublicAttrs = [
  'id', 'title', 'titleAr', 'description', 'descriptionAr',
  'requirements', 'benefits', 'skillsRequired',
  'job_type', 'locationCountry', 'locationCity', 'is_remote',
  'salary_min', 'salary_max', 'salaryCurrency', 'salaryVisible',
  'easyApply', 'deadline', 'viewsCount', 'applicationsCount',
  'status', 'created_at', 'slug',
];

const companyAttrs = ['id', 'name', 'logoUrl', 'locationCity', 'locationCountry', 'industry', 'companySize'];

// ══════════════════════════════════════════════════════════
// GET /api/v1/jobs  — public search, no auth required
// Query: q, type, country, city, category, remote, page, limit
// ══════════════════════════════════════════════════════════
exports.getJobs = async (req, res) => {
  const {
    q, type, country, city, category,
    remote, salaryMin, salaryMax,
    page = 1,
    limit = 12,
    sort = 'newest',
  } = req.query;

  const where = { status: 'active', deletedAt: null };

  // Text search across title, titleAr, description
  if (q) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { titleAr: { [Op.iLike]: `%${q}%` } },
      { keywords: { [Op.contains]: [q] } },
    ];
  }

  if (type) where.jobType = String(type).replace(/-/g, '_');
  if (country) where.locationCountry = country;
  if (city) where.locationCity = { [Op.iLike]: `%${city}%` };
  if (remote === 'true') where.isRemote = true;
  if (salaryMin) where.salaryMin = { [Op.gte]: parseFloat(salaryMin) };
  if (salaryMax) where.salaryMax = { [Op.lte]: parseFloat(salaryMax) };

  if (category) {
    const cat = await JobCategory.findOne({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  const orderMap = {
    newest: [['created_at', 'DESC']],
    oldest: [['created_at', 'ASC']],
    popular: [['viewsCount', 'DESC']],
    salary: [['salary_max', 'DESC']],
  };
  const order = orderMap[sort] || orderMap.newest;

  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Job.findAndCountAll({
    where,
    attributes: jobPublicAttrs,
    include: [
      {
        model: Company,
        as: 'company',
        attributes: companyAttrs,
        where: { status: 'active' },
        required: true,
      },
      {
        model: JobCategory,
        as: 'category',
        attributes: ['id', 'name', 'nameAr', 'slug', 'icon'],
        required: false,
      },
    ],
    order,
    limit: parseInt(limit),
    offset,
    distinct: true,
  });

  return paginate(res, rows, count, page, limit);
};

// ══════════════════════════════════════════════════════════
// GET /api/v1/jobs/:id  — single job detail (public)
// ══════════════════════════════════════════════════════════
exports.getJob = async (req, res) => {
  const { id } = req.params;

  const job = await Job.findOne({
    where: {
      [Op.or]: [{ id }, { slug: id }],
      status: 'active',
      deletedAt: null,
    },
    attributes: [...jobPublicAttrs, 'applicationEmail', 'applicationUrl', 'benefits'],
    include: [
      { model: Company, as: 'company', attributes: [...companyAttrs, 'description', 'website'] },
      { model: JobCategory, as: 'category', attributes: ['id', 'name', 'nameAr', 'icon'] },
    ],
  });

  if (!job) return error(res, 'الوظيفة غير موجودة', 404);

  // Increment view count (fire-and-forget)
  job.increment('viewsCount').catch(() => { });

  return success(res, { job });
};

// ══════════════════════════════════════════════════════════
// GET /api/v1/jobs/categories  — list all job categories
// ══════════════════════════════════════════════════════════
exports.getCategories = async (_req, res) => {
  const categories = await JobCategory.findAll({
    where: { parentId: null },
    attributes: ['id', 'name', 'nameAr', 'slug', 'icon', 'sortOrder'],
    order: [['sortOrder', 'ASC'], ['name', 'ASC']],
  });
  return success(res, { categories });
};

// ══════════════════════════════════════════════════════════
// POST /api/v1/jobs  — create job (company role only)
// ══════════════════════════════════════════════════════════
exports.createJob = async (req, res) => {
  const userId = req.user.id;
  const company = await Company.findOne({
    where: { ownerId: userId, status: 'active', deletedAt: null },
  });
  if (!company) return error(res, 'لا توجد شركة مفعّلة مرتبطة بحسابك', 403);

  const {
    title, titleAr, description, descriptionAr,
    requirements, benefits, skillsRequired,
    jobType, locationCountry, locationCity, isRemote,
    salaryMin, salaryMax, salaryCurrency, salaryVisible,
    easyApply, applicationEmail, applicationUrl,
    deadline, keywords, categoryId,
  } = req.body;

  const slug = `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now()}`;

  const job = await Job.create({
    companyId: company.id,
    postedBy: userId,
    categoryId,
    status: 'pending_approval',
    title, titleAr, description, descriptionAr,
    requirements, benefits,
    skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
    jobType: jobType || 'full_time',
    locationCountry, locationCity,
    isRemote: !!isRemote,
    salaryMin, salaryMax,
    salaryCurrency: salaryCurrency || 'USD',
    salaryVisible: salaryVisible !== false,
    easyApply: easyApply !== false,
    applicationEmail, applicationUrl,
    deadline,
    keywords: Array.isArray(keywords) ? keywords : [],
    slug,
  });

  return success(res, { job }, 'تم إنشاء الوظيفة وهي بانتظار الموافقة', 201);
};

// ══════════════════════════════════════════════════════════
// PATCH /api/v1/jobs/:id  — update job (owner only)
// ══════════════════════════════════════════════════════════
exports.updateJob = async (req, res) => {
  const job = await Job.findOne({
    where: { id: req.params.id, deletedAt: null },
    include: [{ model: Company, as: 'company', where: { ownerId: req.user.id } }],
  });
  if (!job) return error(res, 'الوظيفة غير موجودة أو لا تملك صلاحية تعديلها', 404);

  const allowed = [
    'title', 'titleAr', 'description', 'descriptionAr', 'requirements', 'benefits',
    'skillsRequired', 'job_type', 'locationCountry', 'locationCity', 'is_remote',
    'salary_min', 'salary_max', 'salaryCurrency', 'salaryVisible',
    'easyApply', 'applicationEmail', 'applicationUrl', 'deadline', 'keywords', 'status',
  ];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  await job.update(updates);
  return success(res, { job }, 'تم تحديث الوظيفة');
};

// ══════════════════════════════════════════════════════════
// DELETE /api/v1/jobs/:id  — soft delete job
// ══════════════════════════════════════════════════════════
exports.deleteJob = async (req, res) => {
  const job = await Job.findOne({
    where: { id: req.params.id, deletedAt: null },
    include: [{ model: Company, as: 'company', where: { ownerId: req.user.id } }],
  });
  if (!job) return error(res, 'الوظيفة غير موجودة', 404);
  await job.update({ status: 'archived', deletedAt: new Date() });
  return success(res, {}, 'تم حذف الوظيفة');
};

// ══════════════════════════════════════════════════════════
// GET /api/v1/jobs/search/suggestions  — autocomplete
// ══════════════════════════════════════════════════════════
exports.getSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return success(res, { suggestions: [] });

  const jobs = await Job.findAll({
    where: {
      status: 'active',
      [Op.or]: [
        { title: { [Op.iLike]: `${q}%` } },
        { titleAr: { [Op.iLike]: `${q}%` } },
      ],
    },
    attributes: ['title', 'titleAr'],
    limit: 8,
    group: ['title', 'titleAr'],
  });

  const suggestions = [...new Set(jobs.map(j => j.title).concat(jobs.map(j => j.titleAr).filter(Boolean)))];
  return success(res, { suggestions });
};


