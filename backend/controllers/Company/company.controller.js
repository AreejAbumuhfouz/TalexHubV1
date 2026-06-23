
// // // 'use strict';
// // // // backend/controllers/company.controller.js — FIXED
// // // // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// // // //        2) /me route collision resolved in routes file
// // // //        3) NaNw ago: use 'created_at' snake_case for raw queries

// // // const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../models');
// // // const { Op }  = require('sequelize');
// // // const storage = require('../../services/storage.service');
// // // const { success, error } = require('../../utils/apiResponse');

// // // const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // // // ── Helper ────────────────────────────────────────────────
// // // async function _getCompanyForUser(userId) {
// // //   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
// // //   if (!company) {
// // //     const m = await CompanyMember.findOne({
// // //       where: { userId },
// // //       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
// // //     });
// // //     company = m?.company || null;
// // //   }
// // //   return company;
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies
// // // // ════════════════════════════════════════════════════════════
// // // exports.createCompany = async (req, res) => {
// // //   try {
// // //     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
// // //     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
// // //     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
// // //     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
// // //     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
// // //     const company = await Company.create({
// // //       name, industry, companySize, website, description, locationCountry, locationCity,
// // //       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
// // //       slug, ownerId: req.user.id, status: 'pending_review',
// // //     });
// // //     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
// // //     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyCompany = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
// // //     return success(res, { company });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/stats
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyStats = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

// // //     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// // //     const [activeJobs, totalApplicants, members] = await Promise.all([
// // //       Job.count({ where: { companyId: company.id, status: 'active' } }),
// // //       JobApplication.count({
// // //         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
// // //       }),
// // //       CompanyMember.count({ where: { companyId: company.id } }),
// // //     ]);

// // //     // New applicants this week — use raw query to avoid Sequelize date casting
// // //     const [newResult] = await sequelize.query(`
// // //       SELECT COUNT(*) AS cnt FROM job_applications ja
// // //       INNER JOIN jobs j ON ja.job_id = j.id
// // //       WHERE j.company_id = :companyId
// // //         AND ja.created_at >= :since
// // //         AND ja.deleted_at IS NULL
// // //     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
// // //     const newApplicants = parseInt(newResult?.cnt || 0);

// // //     // Recent applicants — alias is 'applicant' per associations
// // //     const recentApplicants = await JobApplication.findAll({
// // //       include: [
// // //         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
// // //         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
// // //       ],
// // //       order:  [['created_at', 'DESC']],
// // //       limit:  5,
// // //     }).catch(() => []);

// // //     const recentJobs = await Job.findAll({
// // //       where: { companyId: company.id },
// // //       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
// // //       order: [['created_at', 'DESC']],
// // //       limit: 5,
// // //     }).catch(() => []);

// // //     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/jobs
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyJobs = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة', 404);
// // //     const { status, page = 1, limit = 50, q } = req.query;
// // //     const where = { companyId: company.id };
// // //     if (status && status !== 'all') where.status = status;
// // //     if (q) where.title = { [Op.iLike]: `%${q}%` };
// // //     const { count, rows } = await Job.findAndCountAll({
// // //       where, order: [['created_at', 'DESC']],
// // //       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
// // //     });
// // //     return success(res, { jobs: rows, total: count, page: parseInt(page) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/applicants
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyApplicants = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة', 404);
// // //     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

// // //     const jobWhere = { companyId: company.id };
// // //     if (jobId) jobWhere.id = jobId;
// // //     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
// // //     const jobIds = jobs.map(j => j.id);
// // //     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

// // //     const where = { jobId: { [Op.in]: jobIds } };
// // //     if (status && status !== 'all') where.status = status;

// // //     const orderMap = {
// // //       newest: [['created_at', 'DESC']],
// // //       oldest: [['created_at', 'ASC']],
// // //       score:  [['match_score', 'DESC NULLS LAST']],
// // //     };

// // //     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
// // //     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

// // //     const { count, rows } = await JobApplication.findAndCountAll({
// // //       where,
// // //       include: [
// // //         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
// // //         userInclude,
// // //       ],
// // //       order:    orderMap[sort] || orderMap.newest,
// // //       limit:    parseInt(limit),
// // //       offset:   (parseInt(page) - 1) * parseInt(limit),
// // //       distinct: true,
// // //     });

// // //     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/:id — public
// // // // ════════════════════════════════════════════════════════════
// // // exports.getCompany = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id, {
// // //       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
// // //     });
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     return success(res, company);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // PATCH /companies/:id
// // // // ════════════════════════════════════════════════════════════
// // // exports.updateCompany = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// // //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// // //     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
// // //     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
// // //     await company.save();
// // //     return success(res, { company }, 'تم الحفظ');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies/:id/logo
// // // // ════════════════════════════════════════════════════════════
// // // exports.uploadLogo = async (req, res) => {
// // //   try {
// // //     if (!req.file) return error(res, 'لا يوجد ملف', 400);
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// // //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// // //     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
// // //     company.logoUrl = uploaded.url;
// // //     await company.save();
// // //     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/:id/members
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMembers = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
// // //     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// // //     const members = await CompanyMember.findAll({
// // //       where: { companyId: req.params.id },
// // //       include: [{ model: User, as: 'user', attributes: USER_ATTRS, required: false }],
// // //       order: [['created_at', 'ASC']],
// // //     });
// // //     return success(res, { members });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies/:id/members
// // // // ════════════════════════════════════════════════════════════
// // // exports.inviteMember = async (req, res) => {
// // //   try {
// // //     const { email, role = 'hr' } = req.body;
// // //     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
// // //     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
// // //     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
// // //     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
// // //     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
// // //     const validRoles = ['admin', 'hr', 'viewer'];
// // //     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
// // //     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // DELETE /companies/:id/members/:userId
// // // // ════════════════════════════════════════════════════════════
// // // exports.removeMember = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// // //     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
// // //     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
// // //     return success(res, {}, 'تمت الإزالة');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies — public list
// // // // ════════════════════════════════════════════════════════════
// // // exports.listCompanies = async (req, res) => {
// // //   try {
// // //     const { q, industry, page = 1, limit = 20 } = req.query;
// // //     const where = { status: 'active' };
// // //     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
// // //     if (industry) where.industry = industry;
// // //     const { rows, count } = await Company.findAndCountAll({
// // //       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
// // //       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
// // //     });
// // //     return success(res, { companies: rows, total: count, page: parseInt(page) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // 'use strict';
// // // // backend/controllers/company.controller.js — FIXED
// // // // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// // // //        2) /me route collision resolved in routes file
// // // //        3) NaNw ago: use 'created_at' snake_case for raw queries

// // // const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../models');
// // // const { Op }  = require('sequelize');
// // // const storage = require('../../services/storage.service');
// // // const { success, error } = require('../../utils/apiResponse');

// // // const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // // // ── Helper ────────────────────────────────────────────────
// // // async function _getCompanyForUser(userId) {
// // //   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
// // //   if (!company) {
// // //     const m = await CompanyMember.findOne({
// // //       where: { userId },
// // //       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
// // //     });
// // //     company = m?.company || null;
// // //   }
// // //   return company;
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies
// // // // ════════════════════════════════════════════════════════════
// // // exports.createCompany = async (req, res) => {
// // //   try {
// // //     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
// // //     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
// // //     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
// // //     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
// // //     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
// // //     const company = await Company.create({
// // //       name, industry, companySize, website, description, locationCountry, locationCity,
// // //       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
// // //       slug, ownerId: req.user.id, status: 'pending_review',
// // //     });
// // //     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
// // //     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyCompany = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
// // //     return success(res, { company });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/stats
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyStats = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

// // //     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// // //     const [activeJobs, totalApplicants, members] = await Promise.all([
// // //       Job.count({ where: { companyId: company.id, status: 'active' } }),
// // //       JobApplication.count({
// // //         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
// // //       }),
// // //       CompanyMember.count({ where: { companyId: company.id } }),
// // //     ]);

// // //     // New applicants this week — use raw query to avoid Sequelize date casting
// // //     const [newResult] = await sequelize.query(`
// // //       SELECT COUNT(*) AS cnt FROM job_applications ja
// // //       INNER JOIN jobs j ON ja.job_id = j.id
// // //       WHERE j.company_id = :companyId
// // //         AND ja.created_at >= :since
// // //         AND ja.deleted_at IS NULL
// // //     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
// // //     const newApplicants = parseInt(newResult?.cnt || 0);

// // //     // Recent applicants — alias is 'applicant' per associations
// // //     const recentApplicants = await JobApplication.findAll({
// // //       include: [
// // //         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
// // //         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
// // //       ],
// // //       order:  [['created_at', 'DESC']],
// // //       limit:  5,
// // //     }).catch(() => []);

// // //     const recentJobs = await Job.findAll({
// // //       where: { companyId: company.id },
// // //       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
// // //       order: [['created_at', 'DESC']],
// // //       limit: 5,
// // //     }).catch(() => []);

// // //     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/jobs
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyJobs = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة', 404);
// // //     const { status, page = 1, limit = 50, q } = req.query;
// // //     const where = { companyId: company.id };
// // //     if (status && status !== 'all') where.status = status;
// // //     if (q) where.title = { [Op.iLike]: `%${q}%` };
// // //     const { count, rows } = await Job.findAndCountAll({
// // //       where, order: [['created_at', 'DESC']],
// // //       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
// // //     });
// // //     return success(res, { jobs: rows, total: count, page: parseInt(page) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/me/applicants
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMyApplicants = async (req, res) => {
// // //   try {
// // //     const company = await _getCompanyForUser(req.user.id);
// // //     if (!company) return error(res, 'لا توجد شركة', 404);
// // //     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

// // //     const jobWhere = { companyId: company.id };
// // //     if (jobId) jobWhere.id = jobId;
// // //     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
// // //     const jobIds = jobs.map(j => j.id);
// // //     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

// // //     const where = { jobId: { [Op.in]: jobIds } };
// // //     if (status && status !== 'all') where.status = status;

// // //     const orderMap = {
// // //       newest: [['created_at', 'DESC']],
// // //       oldest: [['created_at', 'ASC']],
// // //       score:  [['match_score', 'DESC NULLS LAST']],
// // //     };

// // //     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
// // //     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

// // //     const { count, rows } = await JobApplication.findAndCountAll({
// // //       where,
// // //       include: [
// // //         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
// // //         userInclude,
// // //       ],
// // //       order:    orderMap[sort] || orderMap.newest,
// // //       limit:    parseInt(limit),
// // //       offset:   (parseInt(page) - 1) * parseInt(limit),
// // //       distinct: true,
// // //     });

// // //     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/:id — public
// // // // ════════════════════════════════════════════════════════════
// // // exports.getCompany = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id, {
// // //       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
// // //     });
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     return success(res, company);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // PATCH /companies/:id
// // // // ════════════════════════════════════════════════════════════
// // // exports.updateCompany = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// // //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// // //     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
// // //     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
// // //     await company.save();
// // //     return success(res, { company }, 'تم الحفظ');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies/:id/logo
// // // // ════════════════════════════════════════════════════════════
// // // exports.uploadLogo = async (req, res) => {
// // //   try {
// // //     if (!req.file) return error(res, 'لا يوجد ملف', 400);
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// // //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// // //     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
// // //     company.logoUrl = uploaded.url;
// // //     await company.save();
// // //     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies/:id/members
// // // // ════════════════════════════════════════════════════════════
// // // exports.getMembers = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
// // //     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// // //     const members = await CompanyMember.findAll({
// // //       where: { companyId: req.params.id },
// // //       include: [{ model: User, as: 'applicant', attributes: USER_ATTRS, required: false }],
// // //       order: [['created_at', 'ASC']],
// // //     });
// // //     return success(res, { members });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // POST /companies/:id/members
// // // // ════════════════════════════════════════════════════════════
// // // exports.inviteMember = async (req, res) => {
// // //   try {
// // //     const { email, role = 'hr' } = req.body;
// // //     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
// // //     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
// // //     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
// // //     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
// // //     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
// // //     const validRoles = ['admin', 'hr', 'viewer'];
// // //     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
// // //     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // DELETE /companies/:id/members/:userId
// // // // ════════════════════════════════════════════════════════════
// // // exports.removeMember = async (req, res) => {
// // //   try {
// // //     const company = await Company.findByPk(req.params.id);
// // //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// // //     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// // //     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
// // //     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
// // //     return success(res, {}, 'تمت الإزالة');
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // // // ════════════════════════════════════════════════════════════
// // // // GET /companies — public list
// // // // ════════════════════════════════════════════════════════════
// // // exports.listCompanies = async (req, res) => {
// // //   try {
// // //     const { q, industry, page = 1, limit = 20 } = req.query;
// // //     const where = { status: 'active' };
// // //     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
// // //     if (industry) where.industry = industry;
// // //     const { rows, count } = await Company.findAndCountAll({
// // //       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
// // //       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
// // //     });
// // //     return success(res, { companies: rows, total: count, page: parseInt(page) });
// // //   } catch (err) { return error(res, err.message, 500); }
// // // };

// // 'use strict';
// // // backend/controllers/company.controller.js — FIXED
// // // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// // //        2) /me route collision resolved in routes file
// // //        3) NaNw ago: use 'created_at' snake_case for raw queries

// // const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../../../models');
// // const { Op }  = require('sequelize');
// // const storage = require('../../../../services/storage.service');
// // const { success, error } = require('../../../../utils/apiResponse');

// // const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // // ── Helper ────────────────────────────────────────────────
// // async function _getCompanyForUser(userId) {
// //   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
// //   if (!company) {
// //     const m = await CompanyMember.findOne({
// //       where: { userId },
// //       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
// //     });
// //     company = m?.company || null;
// //   }
// //   return company;
// // }

// // // ════════════════════════════════════════════════════════════
// // // POST /companies
// // // ════════════════════════════════════════════════════════════
// // exports.createCompany = async (req, res) => {
// //   try {
// //     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
// //     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
// //     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
// //     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
// //     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
// //     const company = await Company.create({
// //       name, industry, companySize, website, description, locationCountry, locationCity,
// //       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
// //       slug, ownerId: req.user.id, status: 'pending_review',
// //     });
// //     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
// //     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me
// // // ════════════════════════════════════════════════════════════
// // exports.getMyCompany = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
// //     return success(res, { company });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/stats
// // // ════════════════════════════════════════════════════════════
// // exports.getMyStats = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

// //     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// //     const [activeJobs, totalApplicants, members] = await Promise.all([
// //       Job.count({ where: { companyId: company.id, status: 'active' } }),
// //       JobApplication.count({
// //         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
// //       }),
// //       CompanyMember.count({ where: { companyId: company.id } }),
// //     ]);

// //     // New applicants this week — use raw query to avoid Sequelize date casting
// //     const [newResult] = await sequelize.query(`
// //       SELECT COUNT(*) AS cnt FROM job_applications ja
// //       INNER JOIN jobs j ON ja.job_id = j.id
// //       WHERE j.company_id = :companyId
// //         AND ja.created_at >= :since
// //     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
// //     const newApplicants = parseInt(newResult?.cnt || 0);

// //     // Recent applicants — alias is 'applicant' per associations
// //     const recentApplicants = await JobApplication.findAll({
// //       include: [
// //         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
// //         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
// //       ],
// //       order:  [['created_at', 'DESC']],
// //       limit:  5,
// //     }).catch(() => []);

// //     const recentJobs = await Job.findAll({
// //       where: { companyId: company.id },
// //       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
// //       order: [['created_at', 'DESC']],
// //       limit: 5,
// //     }).catch(() => []);

// //     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/jobs
// // // ════════════════════════════════════════════════════════════
// // exports.getMyJobs = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة', 404);
// //     const { status, page = 1, limit = 50, q } = req.query;
// //     const where = { companyId: company.id };
// //     if (status && status !== 'all') where.status = status;
// //     if (q) where.title = { [Op.iLike]: `%${q}%` };
// //     const { count, rows } = await Job.findAndCountAll({
// //       where, order: [['created_at', 'DESC']],
// //       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
// //     });
// //     return success(res, { jobs: rows, total: count, page: parseInt(page) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/applicants
// // // ════════════════════════════════════════════════════════════
// // exports.getMyApplicants = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة', 404);
// //     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

// //     const jobWhere = { companyId: company.id };
// //     if (jobId) jobWhere.id = jobId;
// //     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
// //     const jobIds = jobs.map(j => j.id);
// //     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

// //     const where = { jobId: { [Op.in]: jobIds } };
// //     if (status && status !== 'all') where.status = status;

// //     const orderMap = {
// //       newest: [['created_at', 'DESC']],
// //       oldest: [['created_at', 'ASC']],
// //       score:  [['match_score', 'DESC NULLS LAST']],
// //     };

// //     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
// //     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

// //     const { count, rows } = await JobApplication.findAndCountAll({
// //       where,
// //       include: [
// //         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
// //         userInclude,
// //       ],
// //       order:    orderMap[sort] || orderMap.newest,
// //       limit:    parseInt(limit),
// //       offset:   (parseInt(page) - 1) * parseInt(limit),
// //       distinct: true,
// //     });

// //     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/:id — public
// // // ════════════════════════════════════════════════════════════
// // exports.getCompany = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id, {
// //       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
// //     });
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     return success(res, company);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // PATCH /companies/:id
// // // ════════════════════════════════════════════════════════════
// // exports.updateCompany = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// //     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
// //     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
// //     await company.save();
// //     return success(res, { company }, 'تم الحفظ');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // POST /companies/:id/logo
// // // ════════════════════════════════════════════════════════════
// // exports.uploadLogo = async (req, res) => {
// //   try {
// //     if (!req.file) return error(res, 'لا يوجد ملف', 400);
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// //     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
// //     company.logoUrl = uploaded.url;
// //     await company.save();
// //     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/:id/members
// // // ════════════════════════════════════════════════════════════
// // exports.getMembers = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
// //     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// //     const members = await CompanyMember.findAll({
// //       where: { companyId: req.params.id },
// //       include: [{ model: User, as: 'user', attributes: USER_ATTRS, required: false }],
// //       order: [['created_at', 'ASC']],
// //     });
// //     return success(res, { members });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // POST /companies/:id/members
// // // ════════════════════════════════════════════════════════════
// // exports.inviteMember = async (req, res) => {
// //   try {
// //     const { email, role = 'hr' } = req.body;
// //     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
// //     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
// //     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
// //     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
// //     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
// //     const validRoles = ['admin', 'hr', 'viewer'];
// //     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
// //     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // DELETE /companies/:id/members/:userId
// // // ════════════════════════════════════════════════════════════
// // exports.removeMember = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// //     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
// //     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
// //     return success(res, {}, 'تمت الإزالة');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies — public list
// // // ════════════════════════════════════════════════════════════
// // exports.listCompanies = async (req, res) => {
// //   try {
// //     const { q, industry, page = 1, limit = 20 } = req.query;
// //     const where = { status: 'active' };
// //     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
// //     if (industry) where.industry = industry;
// //     const { rows, count } = await Company.findAndCountAll({
// //       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
// //       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
// //     });
// //     return success(res, { companies: rows, total: count, page: parseInt(page) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };



// // 'use strict';
// // // backend/controllers/company.controller.js — FIXED
// // // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// // //        2) /me route collision resolved in routes file
// // //        3) NaNw ago: use 'created_at' snake_case for raw queries

// // const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../models');
// // const { Op }  = require('sequelize');
// // const storage = require('../../services/storage.service');
// // const { success, error } = require('../../utils/apiResponse');

// // const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // // ── Helper ────────────────────────────────────────────────
// // async function _getCompanyForUser(userId) {
// //   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
// //   if (!company) {
// //     const m = await CompanyMember.findOne({
// //       where: { userId },
// //       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
// //     });
// //     company = m?.company || null;
// //   }
// //   return company;
// // }

// // // ════════════════════════════════════════════════════════════
// // // POST /companies
// // // ════════════════════════════════════════════════════════════
// // exports.createCompany = async (req, res) => {
// //   try {
// //     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
// //     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
// //     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
// //     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
// //     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
// //     const company = await Company.create({
// //       name, industry, companySize, website, description, locationCountry, locationCity,
// //       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
// //       slug, ownerId: req.user.id, status: 'pending_review',
// //     });
// //     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
// //     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me
// // // ════════════════════════════════════════════════════════════
// // exports.getMyCompany = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
// //     return success(res, { company });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/stats
// // // ════════════════════════════════════════════════════════════
// // exports.getMyStats = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

// //     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

// //     const [activeJobs, totalApplicants, members] = await Promise.all([
// //       Job.count({ where: { companyId: company.id, status: 'active' } }),
// //       JobApplication.count({
// //         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
// //       }),
// //       CompanyMember.count({ where: { companyId: company.id } }),
// //     ]);

// //     // New applicants this week — use raw query to avoid Sequelize date casting
// //     const [newResult] = await sequelize.query(`
// //       SELECT COUNT(*) AS cnt FROM job_applications ja
// //       INNER JOIN jobs j ON ja.job_id = j.id
// //       WHERE j.company_id = :companyId
// //         AND ja.created_at >= :since
// // //     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
// //     const newApplicants = parseInt(newResult?.cnt || 0);

// //     // Recent applicants — alias is 'applicant' per associations
// //     const recentApplicants = await JobApplication.findAll({
// //       include: [
// //         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
// //         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
// //       ],
// //       order:  [['created_at', 'DESC']],
// //       limit:  5,
// //     }).catch(() => []);

// //     const recentJobs = await Job.findAll({
// //       where: { companyId: company.id },
// //       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
// //       order: [['created_at', 'DESC']],
// //       limit: 5,
// //     }).catch(() => []);

// //     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/jobs
// // // ════════════════════════════════════════════════════════════
// // exports.getMyJobs = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة', 404);
// //     const { status, page = 1, limit = 50, q } = req.query;
// //     const where = { companyId: company.id };
// //     if (status && status !== 'all') where.status = status;
// //     if (q) where.title = { [Op.iLike]: `%${q}%` };
// //     const { count, rows } = await Job.findAndCountAll({
// //       where, order: [['created_at', 'DESC']],
// //       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
// //     });
// //     return success(res, { jobs: rows, total: count, page: parseInt(page) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/me/applicants
// // // ════════════════════════════════════════════════════════════
// // exports.getMyApplicants = async (req, res) => {
// //   try {
// //     const company = await _getCompanyForUser(req.user.id);
// //     if (!company) return error(res, 'لا توجد شركة', 404);
// //     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

// //     const jobWhere = { companyId: company.id };
// //     if (jobId) jobWhere.id = jobId;
// //     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
// //     const jobIds = jobs.map(j => j.id);
// //     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

// //     const where = { jobId: { [Op.in]: jobIds } };
// //     if (status && status !== 'all') where.status = status;

// //     const orderMap = {
// //       newest: [['created_at', 'DESC']],
// //       oldest: [['created_at', 'ASC']],
// //       score:  [['match_score', 'DESC NULLS LAST']],
// //     };

// //     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
// //     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

// //     const { count, rows } = await JobApplication.findAndCountAll({
// //       where,
// //       include: [
// //         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
// //         userInclude,
// //       ],
// //       order:    orderMap[sort] || orderMap.newest,
// //       limit:    parseInt(limit),
// //       offset:   (parseInt(page) - 1) * parseInt(limit),
// //       distinct: true,
// //     });

// //     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/:id — public
// // // ════════════════════════════════════════════════════════════
// // exports.getCompany = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id, {
// //       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
// //     });
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     return success(res, company);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // PATCH /companies/:id
// // // ════════════════════════════════════════════════════════════
// // exports.updateCompany = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// //     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
// //     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
// //     await company.save();
// //     return success(res, { company }, 'تم الحفظ');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // POST /companies/:id/logo
// // // ════════════════════════════════════════════════════════════
// // exports.uploadLogo = async (req, res) => {
// //   try {
// //     if (!req.file) return error(res, 'لا يوجد ملف', 400);
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
// //     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
// //     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
// //     company.logoUrl = uploaded.url;
// //     await company.save();
// //     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies/:id/members
// // // ════════════════════════════════════════════════════════════
// // exports.getMembers = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
// //     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// //     const members = await CompanyMember.findAll({
// //       where: { companyId: req.params.id },
// //       include: [{ model: User, as: 'applicant', attributes: USER_ATTRS, required: false }],
// //       order: [['created_at', 'ASC']],
// //     });
// //     return success(res, { members });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // POST /companies/:id/members
// // // ════════════════════════════════════════════════════════════
// // exports.inviteMember = async (req, res) => {
// //   try {
// //     const { email, role = 'hr' } = req.body;
// //     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
// //     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
// //     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
// //     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
// //     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
// //     const validRoles = ['admin', 'hr', 'viewer'];
// //     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
// //     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // DELETE /companies/:id/members/:userId
// // // ════════════════════════════════════════════════════════════
// // exports.removeMember = async (req, res) => {
// //   try {
// //     const company = await Company.findByPk(req.params.id);
// //     if (!company) return error(res, 'الشركة غير موجودة', 404);
// //     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
// //     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
// //     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
// //     return success(res, {}, 'تمت الإزالة');
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// // // ════════════════════════════════════════════════════════════
// // // GET /companies — public list
// // // ════════════════════════════════════════════════════════════
// // exports.listCompanies = async (req, res) => {
// //   try {
// //     const { q, industry, page = 1, limit = 20 } = req.query;
// //     const where = { status: 'active' };
// //     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
// //     if (industry) where.industry = industry;
// //     const { rows, count } = await Company.findAndCountAll({
// //       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
// //       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
// //     });
// //     return success(res, { companies: rows, total: count, page: parseInt(page) });
// //   } catch (err) { return error(res, err.message, 500); }
// // };

// 'use strict';
// // backend/controllers/company.controller.js — FIXED
// // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// //        2) /me route collision resolved in routes file
// //        3) NaNw ago: use 'created_at' snake_case for raw queries

// const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../models');
// const { Op }  = require('sequelize');
// const storage = require('../../services/storage.service');
// const { success, error } = require('../../utils/apiResponse');

// const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // ── Helper ────────────────────────────────────────────────
// async function _getCompanyForUser(userId) {
//   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
//   if (!company) {
//     const m = await CompanyMember.findOne({
//       where: { userId },
//       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
//     });
//     company = m?.company || null;
//   }
//   return company;
// }

// // ════════════════════════════════════════════════════════════
// // POST /companies
// // ════════════════════════════════════════════════════════════
// exports.createCompany = async (req, res) => {
//   try {
//     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
//     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
//     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
//     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
//     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
//     const company = await Company.create({
//       name, industry, companySize, website, description, locationCountry, locationCity,
//       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
//       slug, ownerId: req.user.id, status: 'pending_review',
//     });
//     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
//     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me
// // ════════════════════════════════════════════════════════════
// exports.getMyCompany = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
//     return success(res, { company });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/stats
// // ════════════════════════════════════════════════════════════
// exports.getMyStats = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

//     const [activeJobs, totalApplicants, members] = await Promise.all([
//       Job.count({ where: { companyId: company.id, status: 'active' } }),
//       JobApplication.count({
//         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
//       }),
//       CompanyMember.count({ where: { companyId: company.id } }),
//     ]);

//     // New applicants this week — use raw query to avoid Sequelize date casting
//     const [newResult] = await sequelize.query(`
//       SELECT COUNT(*) AS cnt FROM job_applications ja
//       INNER JOIN jobs j ON ja.job_id = j.id
//       WHERE j.company_id = :companyId
//         AND ja.created_at >= :since
//     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
//     const newApplicants = parseInt(newResult?.cnt || 0);

//     // Recent applicants — alias is 'applicant' per associations
//     const recentApplicants = await JobApplication.findAll({
//       include: [
//         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
//         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
//       ],
//       order:  [['created_at', 'DESC']],
//       limit:  5,
//     }).catch(() => []);

//     const recentJobs = await Job.findAll({
//       where: { companyId: company.id },
//       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
//       order: [['created_at', 'DESC']],
//       limit: 5,
//     }).catch(() => []);

//     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/jobs
// // ════════════════════════════════════════════════════════════
// exports.getMyJobs = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة', 404);
//     const { status, page = 1, limit = 50, q } = req.query;
//     const where = { companyId: company.id };
//     if (status && status !== 'all') where.status = status;
//     if (q) where.title = { [Op.iLike]: `%${q}%` };
//     const { count, rows } = await Job.findAndCountAll({
//       where, order: [['created_at', 'DESC']],
//       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
//     });
//     return success(res, { jobs: rows, total: count, page: parseInt(page) });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/applicants
// // ════════════════════════════════════════════════════════════
// exports.getMyApplicants = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة', 404);
//     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

//     const jobWhere = { companyId: company.id };
//     if (jobId) jobWhere.id = jobId;
//     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
//     const jobIds = jobs.map(j => j.id);
//     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

//     const where = { jobId: { [Op.in]: jobIds } };
//     if (status && status !== 'all') where.status = status;

//     const orderMap = {
//       newest: [['created_at', 'DESC']],
//       oldest: [['created_at', 'ASC']],
//       score:  [['match_score', 'DESC NULLS LAST']],
//     };

//     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
//     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

//     const { count, rows } = await JobApplication.findAndCountAll({
//       where,
//       include: [
//         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
//         userInclude,
//       ],
//       order:    orderMap[sort] || orderMap.newest,
//       limit:    parseInt(limit),
//       offset:   (parseInt(page) - 1) * parseInt(limit),
//       distinct: true,
//     });

//     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/:id — public
// // ════════════════════════════════════════════════════════════
// exports.getCompany = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id, {
//       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
//     });
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     return success(res, company);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // PATCH /companies/:id
// // ════════════════════════════════════════════════════════════
// exports.updateCompany = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
//     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
//     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
//     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
//     await company.save();
//     return success(res, { company }, 'تم الحفظ');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /companies/:id/logo
// // ════════════════════════════════════════════════════════════
// exports.uploadLogo = async (req, res) => {
//   try {
//     if (!req.file) return error(res, 'لا يوجد ملف', 400);
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
//     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
//     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
//     company.logoUrl = uploaded.url;
//     await company.save();
//     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /companies/me/certificate
// // رفع شهادة التسجيل → تغيير status إلى pending_review
// // ════════════════════════════════════════════════════════════
// exports.uploadCertificate = async (req, res) => {
//   try {
//     if (!req.file) return error(res, 'لا يوجد ملف', 400);
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة مرتبطة', 404);

//     // مسموح فقط لو الـ status هو pending_documents أو rejected
//     if (!['pending_documents', 'pending_review', 'rejected'].includes(company.status)) {
//       return error(res, 'لا يمكن رفع الشهادة في هذه المرحلة', 400);
//     }

//     // رفع الملف لـ R2
//     const uploaded = await storage.upload({
//       buffer:       req.file.buffer,
//       mimetype:     req.file.mimetype,
//       originalname: req.file.originalname,
//       folder:       'CompanyCertificates',
//       type:         'certificate',
//     });

//     // تحديث الشركة
//     company.tradeLicenseUrl = uploaded.url;
//     company.status          = 'pending_review';
//     await company.save();

//     return success(res, {
//       tradeLicenseUrl: uploaded.url,
//       status:          company.status,
//     }, 'تم رفع الشهادة وإرسالها للمراجعة');
//   } catch (err) {
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/:id/members
// // ════════════════════════════════════════════════════════════
// exports.getMembers = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
//     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
//     const members = await CompanyMember.findAll({
//       where: { companyId: req.params.id },
//       include: [{ model: User, as: 'user', attributes: USER_ATTRS, required: false }],
//       order: [['created_at', 'ASC']],
//     });
//     return success(res, { members });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /companies/:id/members
// // ════════════════════════════════════════════════════════════
// exports.inviteMember = async (req, res) => {
//   try {
//     const { email, role = 'hr' } = req.body;
//     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
//     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
//     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
//     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
//     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
//     const validRoles = ['admin', 'hr', 'viewer'];
//     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
//     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // DELETE /companies/:id/members/:userId
// // ════════════════════════════════════════════════════════════
// exports.removeMember = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
//     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
//     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
//     return success(res, {}, 'تمت الإزالة');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies — public list
// // ════════════════════════════════════════════════════════════
// exports.listCompanies = async (req, res) => {
//   try {
//     const { q, industry, page = 1, limit = 20 } = req.query;
//     const where = { status: 'active' };
//     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
//     if (industry) where.industry = industry;
//     const { rows, count } = await Company.findAndCountAll({
//       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
//       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
//     });
//     return success(res, { companies: rows, total: count, page: parseInt(page) });
//   } catch (err) { return error(res, err.message, 500); }
// };

// 'use strict';
// // backend/controllers/company.controller.js — FIXED
// // Fixes: 1) alias 'user' → 'applicant' for JobApplication
// //        2) /me route collision resolved in routes file
// //        3) NaNw ago: use 'created_at' snake_case for raw queries

// const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../models');
// const { Op }  = require('sequelize');
// const storage = require('../services/storage.service');
// const { success, error } = require('../utils/apiResponse');

// const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// // ── Helper ────────────────────────────────────────────────
// async function _getCompanyForUser(userId) {
//   let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
//   if (!company) {
//     const m = await CompanyMember.findOne({
//       where: { userId },
//       include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
//     });
//     company = m?.company || null;
//   }
//   return company;
// }

// // ════════════════════════════════════════════════════════════
// // POST /companies
// // ════════════════════════════════════════════════════════════
// exports.createCompany = async (req, res) => {
//   try {
//     const existing = await Company.findOne({ where: { ownerId: req.user.id } });
//     if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
//     const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
//     if (!name) return error(res, 'اسم الشركة مطلوب', 400);
//     const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
//     const company = await Company.create({
//       name, industry, companySize, website, description, locationCountry, locationCity,
//       emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
//       slug, ownerId: req.user.id, status: 'pending_review',
//     });
//     await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
//     return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me
// // ════════════════════════════════════════════════════════════
// exports.getMyCompany = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
//     return success(res, { company });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/stats
// // ════════════════════════════════════════════════════════════
// exports.getMyStats = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

//     const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

//     const [activeJobs, totalApplicants, members] = await Promise.all([
//       Job.count({ where: { companyId: company.id, status: 'active' } }),
//       JobApplication.count({
//         include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
//       }),
//       CompanyMember.count({ where: { companyId: company.id } }),
//     ]);

//     // New applicants this week — use raw query to avoid Sequelize date casting
//     const [newResult] = await sequelize.query(`
//       SELECT COUNT(*) AS cnt FROM job_applications ja
//       INNER JOIN jobs j ON ja.job_id = j.id
//       WHERE j.company_id = :companyId
//         AND ja.created_at >= :since
// //     `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
//     const newApplicants = parseInt(newResult?.cnt || 0);

//     // Recent applicants — alias is 'applicant' per associations
//     const recentApplicants = await JobApplication.findAll({
//       include: [
//         { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
//         { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
//       ],
//       order:  [['created_at', 'DESC']],
//       limit:  5,
//     }).catch(() => []);

//     const recentJobs = await Job.findAll({
//       where: { companyId: company.id },
//       attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
//       order: [['created_at', 'DESC']],
//       limit: 5,
//     }).catch(() => []);

//     return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/jobs
// // ════════════════════════════════════════════════════════════
// exports.getMyJobs = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة', 404);
//     const { status, page = 1, limit = 50, q } = req.query;
//     const where = { companyId: company.id };
//     if (status && status !== 'all') where.status = status;
//     if (q) where.title = { [Op.iLike]: `%${q}%` };
//     const { count, rows } = await Job.findAndCountAll({
//       where, order: [['created_at', 'DESC']],
//       limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
//     });
//     return success(res, { jobs: rows, total: count, page: parseInt(page) });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/me/applicants
// // ════════════════════════════════════════════════════════════
// exports.getMyApplicants = async (req, res) => {
//   try {
//     const company = await _getCompanyForUser(req.user.id);
//     if (!company) return error(res, 'لا توجد شركة', 404);
//     const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

//     const jobWhere = { companyId: company.id };
//     if (jobId) jobWhere.id = jobId;
//     const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
//     const jobIds = jobs.map(j => j.id);
//     if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

//     const where = { jobId: { [Op.in]: jobIds } };
//     if (status && status !== 'all') where.status = status;

//     const orderMap = {
//       newest: [['created_at', 'DESC']],
//       oldest: [['created_at', 'ASC']],
//       score:  [['match_score', 'DESC NULLS LAST']],
//     };

//     const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
//     if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

//     const { count, rows } = await JobApplication.findAndCountAll({
//       where,
//       include: [
//         { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
//         userInclude,
//       ],
//       order:    orderMap[sort] || orderMap.newest,
//       limit:    parseInt(limit),
//       offset:   (parseInt(page) - 1) * parseInt(limit),
//       distinct: true,
//     });

//     return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/:id — public
// // ════════════════════════════════════════════════════════════
// exports.getCompany = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id, {
//       include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
//     });
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     return success(res, company);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // PATCH /companies/:id
// // ════════════════════════════════════════════════════════════
// exports.updateCompany = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
//     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
//     const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address'];
//     allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
//     await company.save();
//     return success(res, { company }, 'تم الحفظ');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /companies/:id/logo
// // ════════════════════════════════════════════════════════════
// exports.uploadLogo = async (req, res) => {
//   try {
//     if (!req.file) return error(res, 'لا يوجد ملف', 400);
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
//     if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
//     const uploaded = await storage.upload({ buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname, folder: 'logos', type: 'logo' });
//     company.logoUrl = uploaded.url;
//     await company.save();
//     return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies/:id/members
// // ════════════════════════════════════════════════════════════
// exports.getMembers = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
//     if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
//     const members = await CompanyMember.findAll({
//       where: { companyId: req.params.id },
//       include: [{ model: User, as: 'applicant', attributes: USER_ATTRS, required: false }],
//       order: [['created_at', 'ASC']],
//     });
//     return success(res, { members });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /companies/:id/members
// // ════════════════════════════════════════════════════════════
// exports.inviteMember = async (req, res) => {
//   try {
//     const { email, role = 'hr' } = req.body;
//     if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
//     const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
//     if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
//     const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
//     if (already) return error(res, 'المستخدم عضو بالفعل', 400);
//     const validRoles = ['admin', 'hr', 'viewer'];
//     await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
//     return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // DELETE /companies/:id/members/:userId
// // ════════════════════════════════════════════════════════════
// exports.removeMember = async (req, res) => {
//   try {
//     const company = await Company.findByPk(req.params.id);
//     if (!company) return error(res, 'الشركة غير موجودة', 404);
//     if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
//     if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
//     await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
//     return success(res, {}, 'تمت الإزالة');
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // GET /companies — public list
// // ════════════════════════════════════════════════════════════
// exports.listCompanies = async (req, res) => {
//   try {
//     const { q, industry, page = 1, limit = 20 } = req.query;
//     const where = { status: 'active' };
//     if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
//     if (industry) where.industry = industry;
//     const { rows, count } = await Company.findAndCountAll({
//       where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
//       attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
//     });
//     return success(res, { companies: rows, total: count, page: parseInt(page) });
//   } catch (err) { return error(res, err.message, 500); }
// };

'use strict';

const { Company, User, CompanyMember, Job, JobApplication, CV, sequelize } = require('../../models');
const { Op }  = require('sequelize');
const storage = require('../../services/storage.service');
const { success, error } = require('../../utils/apiResponse');

const USER_ATTRS = ['id', 'fullName', 'avatarUrl', 'email', 'headline', 'locationCity', 'locationCountry'];

// ── Helper ────────────────────────────────────────────────
async function _getCompanyForUser(userId) {
  let company = await Company.findOne({ where: { ownerId: userId, deletedAt: null } });
  if (!company) {
    const m = await CompanyMember.findOne({
      where: { userId },
      include: [{ model: Company, as: 'company', where: { deletedAt: null }, required: true }],
    });
    company = m?.company || null;
  }
  return company;
}

// ════════════════════════════════════════════════════════════
// POST /companies
// ════════════════════════════════════════════════════════════
exports.createCompany = async (req, res) => {
  try {
    const existing = await Company.findOne({ where: { ownerId: req.user.id } });
    if (existing) return error(res, 'لديك شركة مسجلة بالفعل', 400);
    const { name, industry, companySize, website, description, locationCountry, locationCity, emailDomain } = req.body;
    if (!name) return error(res, 'اسم الشركة مطلوب', 400);
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now().toString(36);
    const company = await Company.create({
      name, industry, companySize, website, description, locationCountry, locationCity,
      emailDomain: emailDomain || (req.user.email?.split('@')[1] || 'company.com'),
      slug, ownerId: req.user.id, status: 'pending_review',
    });
    await CompanyMember.create({ companyId: company.id, userId: req.user.id, role: 'admin', acceptedAt: new Date() });
    return success(res, { company }, 'تم إنشاء الشركة بنجاح', 201);
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/me
// ════════════════════════════════════════════════════════════
exports.getMyCompany = async (req, res) => {
  try {
    console.log('🔍 getMyCompany called');
    console.log('🔍 User ID:', req.user.id);
    console.log('🔍 User Role:', req.user.role);
    
    const company = await _getCompanyForUser(req.user.id);
    console.log('🔍 Company found:', company ? 'YES' : 'NO');
    
    if (!company) {
      console.log('❌ No company found for user');
      return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);
    }
    
    console.log('✅ Company data:', company.id, company.name);
    return success(res, { company });
  } catch (err) {
    console.error('❌ Error in getMyCompany:', err);
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /companies/me/stats
// ════════════════════════════════════════════════════════════
exports.getMyStats = async (req, res) => {
  try {
    const company = await _getCompanyForUser(req.user.id);
    if (!company) return error(res, 'لا توجد شركة مرتبطة بهذا الحساب', 404);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [activeJobs, totalApplicants, members] = await Promise.all([
      Job.count({ where: { companyId: company.id, status: 'active' } }),
      JobApplication.count({
        include: [{ model: Job, as: 'job', where: { companyId: company.id }, required: true }],
      }),
      CompanyMember.count({ where: { companyId: company.id } }),
    ]);

    // New applicants this week — use raw query to avoid Sequelize date casting
    const [newResult] = await sequelize.query(`
      SELECT COUNT(*) AS cnt FROM job_applications ja
      INNER JOIN jobs j ON ja.job_id = j.id
      WHERE j.company_id = :companyId
        AND ja.created_at >= :since
    `, { replacements: { companyId: company.id, since: sevenDaysAgo }, type: sequelize.QueryTypes.SELECT });
    const newApplicants = parseInt(newResult?.cnt || 0);

    // Recent applicants — alias is 'applicant' per associations
    const recentApplicants = await JobApplication.findAll({
      include: [
        { model: Job,  as: 'job',        where: { companyId: company.id }, attributes: ['id', 'title'], required: true },
        { model: User, as: 'applicant',  attributes: USER_ATTRS, required: false },
      ],
      order:  [['created_at', 'DESC']],
      limit:  5,
    }).catch(() => []);

    const recentJobs = await Job.findAll({
      where: { companyId: company.id },
      attributes: ['id', 'title', 'status', 'applicationsCount', 'viewsCount', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 5,
    }).catch(() => []);

    return success(res, { company, stats: { activeJobs, totalApplicants, newApplicants, members }, recentApplicants, recentJobs });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/me/jobs
// ════════════════════════════════════════════════════════════
exports.getMyJobs = async (req, res) => {
  try {
    const company = await _getCompanyForUser(req.user.id);
    if (!company) return error(res, 'لا توجد شركة', 404);
    const { status, page = 1, limit = 50, q } = req.query;
    const where = { companyId: company.id };
    if (status && status !== 'all') where.status = status;
    if (q) where.title = { [Op.iLike]: `%${q}%` };
    const { count, rows } = await Job.findAndCountAll({
      where, order: [['created_at', 'DESC']],
      limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit),
    });
    return success(res, { jobs: rows, total: count, page: parseInt(page) });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/me/applicants
// ════════════════════════════════════════════════════════════
exports.getMyApplicants = async (req, res) => {
  try {
    const company = await _getCompanyForUser(req.user.id);
    if (!company) return error(res, 'لا توجد شركة', 404);
    const { status, jobId, page = 1, limit = 20, sort = 'newest', q } = req.query;

    const jobWhere = { companyId: company.id };
    if (jobId) jobWhere.id = jobId;
    const jobs = await Job.findAll({ where: jobWhere, attributes: ['id'], raw: true });
    const jobIds = jobs.map(j => j.id);
    if (!jobIds.length) return success(res, { applications: [], total: 0, page: 1 });

    const where = { jobId: { [Op.in]: jobIds } };
    if (status && status !== 'all') where.status = status;

    const orderMap = {
      newest: [['created_at', 'DESC']],
      oldest: [['created_at', 'ASC']],
      score:  [['match_score', 'DESC NULLS LAST']],
    };

    const userInclude = { model: User, as: 'applicant', attributes: USER_ATTRS, required: false };
    if (q) userInclude.where = { fullName: { [Op.iLike]: `%${q}%` } };

    const { count, rows } = await JobApplication.findAndCountAll({
      where,
      include: [
        { model: Job, as: 'job', attributes: ['id', 'title', 'locationCity', 'jobType'], required: true },
        userInclude,
      ],
      order:    orderMap[sort] || orderMap.newest,
      limit:    parseInt(limit),
      offset:   (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
    });

    return success(res, { applications: rows, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies/:id — public
// ════════════════════════════════════════════════════════════
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [{ model: Job, as: 'jobs', where: { status: 'active' }, required: false, attributes: ['id', 'title', 'locationCity', 'jobType', 'salaryMin', 'salaryMax'] }],
    });
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    return success(res, company);
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// PATCH /companies/:id
// ════════════════════════════════════════════════════════════
exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    const isMember = await CompanyMember.findOne({ where: { companyId: company.id, userId: req.user.id } });
    if (company.ownerId !== req.user.id && !isMember) return error(res, 'غير مصرح', 403);
    const allowed = ['name','industry','companySize','website','description','locationCountry','locationCity','emailDomain','foundedYear','coverUrl','address','phone'];
    allowed.forEach(f => { if (req.body[f] !== undefined) company[f] = req.body[f]; });
    await company.save();
    return success(res, { company }, 'تم الحفظ');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// POST /companies/:id/logo
// ════════════════════════════════════════════════════════════
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return error(res, 'لا يوجد ملف', 400);
    const company = await _getCompanyForUser(req.user.id);
    if (!company) return error(res, 'لا توجد شركة مرتبطة', 404);
    const uploaded = await storage.upload({
      buffer:       req.file.buffer,
      mimetype:     req.file.mimetype,
      originalname: req.file.originalname,
      folder:       'CompaniesLogos',
      type:         'logo',
    });
    company.logoUrl = uploaded.url;
    await company.save();
    return success(res, { logo: uploaded.url }, 'تم رفع الشعار');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// POST /companies/me/certificate
// رفع شهادة التسجيل → تغيير status إلى pending_review
// ════════════════════════════════════════════════════════════
exports.uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return error(res, 'لا يوجد ملف', 400);
    const company = await _getCompanyForUser(req.user.id);
    if (!company) return error(res, 'لا توجد شركة مرتبطة', 404);

    // مسموح فقط لو الـ status هو pending_documents أو rejected
    if (!['pending_documents', 'pending_review', 'rejected'].includes(company.status)) {
      return error(res, 'لا يمكن رفع الشهادة في هذه المرحلة', 400);
    }

    // رفع الملف لـ R2
    const uploaded = await storage.upload({
      buffer:       req.file.buffer,
      mimetype:     req.file.mimetype,
      originalname: req.file.originalname,
      folder:       'CompaniesCertificates',
      type:         'certificate',
    });

    // تحديث الشركة
    company.tradeLicenseUrl = uploaded.url;
    company.status          = 'pending_review';
    await company.save();

    return success(res, {
      tradeLicenseUrl: uploaded.url,
      status:          company.status,
    }, 'تم رفع الشهادة وإرسالها للمراجعة');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /companies/:id/members
// ════════════════════════════════════════════════════════════
exports.getMembers = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    const isMember = await CompanyMember.findOne({ where: { companyId: req.params.id, userId: req.user.id } });
    if (!isMember && company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
    const members = await CompanyMember.findAll({
      where: { companyId: req.params.id },
      include: [{ model: User, as: 'user', attributes: USER_ATTRS, required: false }],
      order: [['created_at', 'ASC']],
    });
    return success(res, { members });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// POST /companies/:id/members
// ════════════════════════════════════════════════════════════
exports.inviteMember = async (req, res) => {
  try {
    const { email, role = 'hr' } = req.body;
    if (!email) return error(res, 'البريد الإلكتروني مطلوب', 400);
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    if (company.ownerId !== req.user.id) return error(res, 'فقط المالك يمكنه الدعوة', 403);
    const invitee = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!invitee) return error(res, 'المستخدم غير موجود في المنصة', 404);
    const already = await CompanyMember.findOne({ where: { companyId: company.id, userId: invitee.id } });
    if (already) return error(res, 'المستخدم عضو بالفعل', 400);
    const validRoles = ['admin', 'hr', 'viewer'];
    await CompanyMember.create({ companyId: company.id, userId: invitee.id, role: validRoles.includes(role) ? role : 'hr', acceptedAt: new Date() });
    return success(res, { member: { user: invitee, role } }, 'تمت الدعوة بنجاح', 201);
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// DELETE /companies/:id/members/:userId
// ════════════════════════════════════════════════════════════
exports.removeMember = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'الشركة غير موجودة', 404);
    if (company.ownerId !== req.user.id) return error(res, 'غير مصرح', 403);
    if (req.params.userId === company.ownerId) return error(res, 'لا يمكن إزالة المالك', 400);
    await CompanyMember.destroy({ where: { companyId: company.id, userId: req.params.userId } });
    return success(res, {}, 'تمت الإزالة');
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// GET /companies — public list
// ════════════════════════════════════════════════════════════
exports.listCompanies = async (req, res) => {
  try {
    const { q, industry, page = 1, limit = 20 } = req.query;
    const where = { status: 'active' };
    if (q) where[Op.or] = [{ name: { [Op.iLike]: `%${q}%` } }];
    if (industry) where.industry = industry;
    const { rows, count } = await Company.findAndCountAll({
      where, limit: parseInt(limit), offset: (parseInt(page) - 1) * parseInt(limit), order: [['created_at', 'DESC']],
      attributes: ['id','name','logoUrl','industry','companySize','locationCity','locationCountry'],
    });
    return success(res, { companies: rows, total: count, page: parseInt(page) });
  } catch (err) { return error(res, err.message, 500); }
};