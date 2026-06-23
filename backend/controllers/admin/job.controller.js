'use strict';

const { Op } = require('sequelize');
const { Job, Company, JobCategory, JobApplication, User, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');

const v = {
  str(val, max = 200) { if (!val?.trim()) throw new Error('Required'); return val.trim().slice(0, max); },
  optional(val, max = 500) { if (!val?.trim()) return null; return val.trim().slice(0, max); },
  status(val) { const a = ['draft','pending_approval','active','archived','closed']; if (!a.includes(val)) throw new Error('Invalid status'); return val; },
  jobType(val) { const a = ['full_time','part_time','contract','freelance','internship','remote']; if (!a.includes(val)) throw new Error('Invalid job type'); return val; },
  float(val, min = 0) { if (val === undefined || val === null) return null; const n = Number(val); if (isNaN(n) || n < min) throw new Error('Invalid number'); return n; },
  bool(val) { if (val === undefined || val === null) return false; return val === true || val === 'true' || val === '1'; },
  array(val, max = 30) { if (!val) return []; const arr = Array.isArray(val) ? val : [val]; return arr.slice(0, max).filter(Boolean); },
  date(val) { if (!val) return null; const d = new Date(val); if (isNaN(d.getTime())) throw new Error('Invalid date'); return d; },
};

const audit = (actor, action, id, oldVal, newVal) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Job', entityId: id, oldValue: oldVal ? JSON.stringify(oldVal) : null, newValue: JSON.stringify(newVal) }).catch(() => {});

const makeSlug = (title) => `${title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}-${Date.now().toString(36)}`;

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const { status, search, companyId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Job.findAndCountAll({
      where,
      include: [{ model: Company, as: 'company', attributes: ['id', 'name'], required: false }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET ONE
exports.getOne = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id, {
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'], required: false },
        { model: JobCategory, as: 'category', attributes: ['id', 'name'], required: false },
      ],
    });
    if (!job) return error(res, 'Job not found', 404);
    return success(res, { job });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { title, description, jobType, companyId, locationCountry, locationCity, isRemote, salaryMin, salaryMax, salaryCurrency, deadline, categoryId, status = 'active', requirements, benefits, skillsRequired } = req.body;

    const safeTitle = v.str(title, 200);
    const safeDesc = v.str(description, 10000);
    const safeType = v.jobType(jobType);
    const safeStatus = v.status(status);
    const safeRemote = v.bool(isRemote);
    const safeMin = v.float(salaryMin);
    const safeMax = v.float(salaryMax);
    const safeCurrency = salaryCurrency || 'USD';
    const safeDeadline = v.date(deadline);
    const safeReqs = v.array(requirements, 20);
    const safeBenefits = v.array(benefits, 20);
    const safeSkills = v.array(skillsRequired, 30);

    if (safeMin && safeMax && safeMin > safeMax) return error(res, 'Min salary > max salary', 400);

    const company = await Company.findByPk(companyId);
    if (!company) return error(res, 'Company not found', 404);

    const job = await Job.create({
      title: safeTitle, description: safeDesc, jobType: safeType, companyId,
      locationCountry: v.optional(locationCountry, 100), locationCity: v.optional(locationCity, 100),
      isRemote: safeRemote, salaryMin: safeMin, salaryMax: safeMax, salaryCurrency: safeCurrency,
      deadline: safeDeadline, categoryId: categoryId || null,
      status: safeStatus, requirements: safeReqs, benefits: safeBenefits, skillsRequired: safeSkills,
      postedBy: req.user.id, approvedBy: req.user.id, approvedAt: new Date(),
      slug: makeSlug(safeTitle),
    });

    await audit(req.user.id, 'job.create', job.id, null, { title: safeTitle, companyId });
    return success(res, { job: { id: job.id, title: job.title, status: job.status } }, 'Job created', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found', 404);

    const oldValues = { title: job.title, status: job.status };
    const updates = {};

    if (req.body.title !== undefined) updates.title = v.str(req.body.title, 200);
    if (req.body.description !== undefined) updates.description = v.str(req.body.description, 10000);
    if (req.body.jobType !== undefined) updates.jobType = v.jobType(req.body.jobType);
    if (req.body.status !== undefined) updates.status = v.status(req.body.status);
    if (req.body.isRemote !== undefined) updates.isRemote = v.bool(req.body.isRemote);
    if (req.body.salaryMin !== undefined) updates.salaryMin = v.float(req.body.salaryMin);
    if (req.body.salaryMax !== undefined) updates.salaryMax = v.float(req.body.salaryMax);
    if (req.body.deadline !== undefined) updates.deadline = v.date(req.body.deadline);
    if (req.body.requirements !== undefined) updates.requirements = v.array(req.body.requirements, 20);
    if (req.body.benefits !== undefined) updates.benefits = v.array(req.body.benefits, 20);
    if (req.body.skillsRequired !== undefined) updates.skillsRequired = v.array(req.body.skillsRequired, 30);

    const finalMin = updates.salaryMin !== undefined ? updates.salaryMin : job.salaryMin;
    const finalMax = updates.salaryMax !== undefined ? updates.salaryMax : job.salaryMax;
    if (finalMin && finalMax && finalMin > finalMax) return error(res, 'Min salary > max salary', 400);

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    await job.update(updates);
    await audit(req.user.id, 'job.update', job.id, oldValues, updates);

    return success(res, { job: { id: job.id, ...updates } }, 'Job updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// APPROVE
exports.approve = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found', 404);
    const old = job.status;
    await job.update({ status: 'active', approvedBy: req.user.id, approvedAt: new Date() });
    await audit(req.user.id, 'job.approve', job.id, { status: old }, { status: 'active' });
    return success(res, {}, 'Job approved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// REJECT
exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found', 404);
    const old = job.status;
    await job.update({ status: 'archived', rejectionReason: reason?.slice(0, 500) });
    await audit(req.user.id, 'job.reject', job.id, { status: old }, { status: 'archived', reason });
    return success(res, {}, 'Job rejected');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return error(res, 'Job not found', 404);
    await job.update({ deletedAt: new Date() });
    await audit(req.user.id, 'job.delete', job.id, { title: job.title }, null);
    return success(res, {}, 'Job deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET APPLICANTS
exports.getApplicants = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await JobApplication.findAndCountAll({
      where: { jobId: req.params.id },
      include: [{ model: User, as: 'applicant', attributes: ['id', 'fullName', 'email', 'locationCountry'], required: false }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// BULK CSV UPLOAD — append to end of job.controller.js
// ════════════════════════════════════════════════════════════

/* ─────────────────────────────────────────────────────────
   Minimal CSV parser — no external dependency.
   Handles quoted fields, commas inside quotes, and \r\n / \n.
───────────────────────────────────────────────────────── */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') { field += '"'; i++; }
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else {
      if (char === '"') { inQuotes = true; }
      else if (char === ',') { row.push(field); field = ''; }
      else if (char === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else { field += char; }
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }

  return rows.filter(r => r.some(c => c.trim().length > 0));
}

/* ─────────────────────────────────────────────────────────
   CSV headers (case-insensitive, order-independent):

   title*, titleAr, description*, descriptionAr, companyName*,
   jobType, locationCountry, locationCity, isRemote,
   salaryMin, salaryMax, salaryCurrency, deadline, status,
   requirements, benefits, skillsRequired, applicationEmail

   requirements / benefits / skillsRequired: pipe-separated
   companyName must match an EXISTING company exactly (case-insensitive)
   applicationEmail: validated — invalid format is ignored with a warning
   * = required, row skipped + reported if missing
───────────────────────────────────────────────────────── */
const REQUIRED = ['title', 'description', 'companyname'];
const VALID_JOB_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'remote'];
const VALID_STATUSES  = ['draft', 'pending_approval', 'active', 'archived', 'closed'];
const EMAIL_RE         = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeJobType = (val) => {
  if (!val) return 'full_time';
  const v = val.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return VALID_JOB_TYPES.includes(v) ? v : 'full_time';
};

const normalizeStatus = (val) => {
  if (!val) return 'active';
  const v = val.toLowerCase().trim();
  return VALID_STATUSES.includes(v) ? v : 'active';
};

const normalizeBool = (val) => {
  if (!val) return false;
  const v = val.toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(v);
};

const splitPipe = (val) => (val || '').split('|').map(s => s.trim()).filter(Boolean);

const normalizeEmail = (val) => {
  const v = (val || '').trim();
  if (!v) return { email: null, warning: null };
  if (!EMAIL_RE.test(v)) return { email: null, warning: `Invalid applicationEmail "${v}" — ignored, will fall back to company owner email` };
  return { email: v.toLowerCase(), warning: null };
};

const makeSlugBulk = (title) =>
  `${title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// ════════════════════════════════════════════════════════════
// POST /admin/jobs/bulk-csv  — multipart/form-data, field "file"
// ════════════════════════════════════════════════════════════
exports.bulkUploadCSV = async (req, res) => {
  try {
    if (!req.file) return error(res, 'CSV file is required', 400);

    const text = req.file.buffer.toString('utf-8');
    const rows = parseCSV(text);
    if (rows.length < 2) return error(res, 'CSV must have a header row and at least one data row', 400);

    const headerRow = rows[0].map(h => h.trim().toLowerCase());
    const dataRows   = rows.slice(1);

    const missingHeaders = REQUIRED.filter(h => !headerRow.includes(h));
    if (missingHeaders.length) {
      return error(res, `Missing required CSV columns: ${missingHeaders.join(', ')}`, 400);
    }

    const colIndex = (name) => headerRow.indexOf(name.toLowerCase());
    const getCol = (row, name) => {
      const idx = colIndex(name);
      return idx === -1 ? '' : (row[idx] || '').trim();
    };

    const allCompanies = await Company.findAll({
      where: { status: 'active', deletedAt: null },
      attributes: ['id', 'name'],
    });
    const companyByName = new Map(allCompanies.map(c => [c.name.toLowerCase().trim(), c.id]));

    const results = { total: dataRows.length, created: 0, skipped: 0, errors: [], warnings: [] };
    const jobsToCreate = [];

    dataRows.forEach((row, idx) => {
      const rowNum = idx + 2;

      const title       = getCol(row, 'title');
      const description = getCol(row, 'description');
      const companyName = getCol(row, 'companyName');

      if (!title || !description || !companyName) {
        results.skipped++;
        results.errors.push({ row: rowNum, reason: `Missing required field(s): ${[!title&&'title', !description&&'description', !companyName&&'companyName'].filter(Boolean).join(', ')}` });
        return;
      }

      const companyId = companyByName.get(companyName.toLowerCase().trim());
      if (!companyId) {
        results.skipped++;
        results.errors.push({ row: rowNum, reason: `Company not found: "${companyName}"` });
        return;
      }

      const salaryMinRaw = getCol(row, 'salaryMin');
      const salaryMaxRaw = getCol(row, 'salaryMax');
      const salaryMin = salaryMinRaw ? parseFloat(salaryMinRaw) : null;
      const salaryMax = salaryMaxRaw ? parseFloat(salaryMaxRaw) : null;

      if (salaryMin !== null && isNaN(salaryMin)) { results.skipped++; results.errors.push({ row: rowNum, reason: 'Invalid salaryMin' }); return; }
      if (salaryMax !== null && isNaN(salaryMax)) { results.skipped++; results.errors.push({ row: rowNum, reason: 'Invalid salaryMax' }); return; }
      if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) { results.skipped++; results.errors.push({ row: rowNum, reason: 'salaryMin > salaryMax' }); return; }

      const deadlineRaw = getCol(row, 'deadline');
      let deadline = null;
      if (deadlineRaw) {
        const d = new Date(deadlineRaw);
        if (isNaN(d.getTime())) { results.skipped++; results.errors.push({ row: rowNum, reason: `Invalid deadline date: "${deadlineRaw}"` }); return; }
        deadline = d;
      }

      const { email: applicationEmail, warning: emailWarning } = normalizeEmail(getCol(row, 'applicationEmail'));
      if (emailWarning) results.warnings.push({ row: rowNum, reason: emailWarning });

      jobsToCreate.push({
        title,
        titleAr:         getCol(row, 'titleAr') || null,
        description,
        descriptionAr:   getCol(row, 'descriptionAr') || null,
        companyId,
        jobType:         normalizeJobType(getCol(row, 'jobType')),
        locationCountry: getCol(row, 'locationCountry') || null,
        locationCity:    getCol(row, 'locationCity') || null,
        isRemote:        normalizeBool(getCol(row, 'isRemote')),
        salaryMin, salaryMax,
        salaryCurrency:  getCol(row, 'salaryCurrency') || 'USD',
        deadline,
        status:          normalizeStatus(getCol(row, 'status')),
        requirements:    splitPipe(getCol(row, 'requirements')),
        benefits:        splitPipe(getCol(row, 'benefits')),
        skillsRequired:  splitPipe(getCol(row, 'skillsRequired')),
        applicationEmail,
        postedBy:   req.user.id,
        approvedBy: req.user.id,
        approvedAt: new Date(),
        slug: makeSlugBulk(title),
        __rowNum: rowNum,
      });
    });

    if (jobsToCreate.length > 0) {
      const sequelize = Job.sequelize;
      const t = await sequelize.transaction();
      try {
        for (const jobData of jobsToCreate) {
          const { __rowNum, ...cleanData } = jobData;
          try {
            await Job.create(cleanData, { transaction: t });
            results.created++;
          } catch (e) {
            results.skipped++;
            results.errors.push({ row: __rowNum, reason: e.message?.slice(0, 200) || 'Insert failed' });
          }
        }
        await t.commit();
      } catch (e) {
        await t.rollback();
        return error(res, `Bulk insert failed: ${e.message}`, 500);
      }
    }

    await audit(req.user.id, 'job.bulk_upload', null, null, {
      total: results.total, created: results.created, skipped: results.skipped, emailWarnings: results.warnings.length,
    });

    const msg = results.warnings.length > 0
      ? `${results.created} jobs created, ${results.skipped} skipped, ${results.warnings.length} email warnings`
      : `${results.created} jobs created, ${results.skipped} skipped`;

    return success(res, results, msg, 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/jobs/bulk-csv/template — download starter CSV
// ════════════════════════════════════════════════════════════
exports.downloadBulkTemplate = async (req, res) => {
  const headers = [
    'title','titleAr','description','descriptionAr','companyName','jobType',
    'locationCountry','locationCity','isRemote','salaryMin','salaryMax',
    'salaryCurrency','deadline','status','requirements','benefits',
    'skillsRequired','applicationEmail',
  ];
  const example = [
    'Senior Backend Engineer','مهندس باك إند أول',
    'We are looking for an experienced backend engineer to join our team.','',
    'TalexHub Test Co','full_time','Jordan','Amman','false','1200','2000','USD',
    '2026-12-31','active',
    '3+ years Node.js experience|Strong SQL skills|Experience with REST APIs',
    'Health insurance|Remote-friendly|Annual bonus',
    'Node.js|PostgreSQL|Express|Docker',
    'hr@example.com',
  ];

  const csvLine = (arr) => arr.map(v => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',');

  const csv = csvLine(headers) + '\n' + csvLine(example) + '\n';

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="jobs-bulk-upload-template.csv"');
  return res.send(csv);
};