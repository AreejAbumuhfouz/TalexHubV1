'use strict';

const { Op } = require('sequelize');
const { Company, User, Job, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');

const v = {
  str(val, max = 200) {
    if (!val?.trim()) throw new Error('Required field');
    return val.trim().slice(0, max);
  },
  optional(val, max = 200) {
    if (!val?.trim()) return null;
    return val.trim().slice(0, max);
  },
  status(val) {
    const allowed = ['active', 'pending_review', 'suspended', 'rejected'];
    if (!allowed.includes(val)) throw new Error('Invalid status');
    return val;
  },
  url(val) {
    if (!val) return null;
    try { new URL(val); return val; } catch { throw new Error('Invalid URL'); }
  },
};

const audit = (actor, action, id, oldVal, newVal) =>
  AuditLog.create({
    actorId: actor, action, entityType: 'Company', entityId: id,
    oldValue: oldVal ? JSON.stringify(oldVal) : null,
    newValue: JSON.stringify(newVal),
  }).catch(() => {});

const makeSlug = (name) =>
  `${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString(36)}`;

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (search) where.name = { [Op.iLike]: `%${search}%` };

    const { count, rows } = await Company.findAndCountAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'fullName', 'email'], required: false }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// GET PENDING
exports.getPending = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Company.findAndCountAll({
      where: { status: 'pending_review', deletedAt: null },
      include: [{ model: User, as: 'owner', attributes: ['id', 'fullName', 'email'], required: false }],
      order: [['created_at', 'ASC']],
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
    const company = await Company.findByPk(req.params.id, {
      include: [
        { model: User, as: 'owner', attributes: ['id', 'fullName', 'email', 'phone'], required: false },
        { model: Job, as: 'jobs', attributes: ['id', 'title', 'status', 'created_at'], limit: 20, required: false },
      ],
    });
    if (!company) return error(res, 'Company not found', 404);
    return success(res, { company });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// CREATE
exports.create = async (req, res) => {
  try {
    const { name, ownerId, emailDomain, industry, website, locationCountry, locationCity, companySize, description, status = 'active' } = req.body;

    const safeName = v.str(name);
    const safeDomain = v.str(emailDomain, 253);
    const safeIndustry = v.optional(industry, 100);
    const safeWebsite = v.url(website);
    const safeCountry = v.optional(locationCountry, 100);
    const safeCity = v.optional(locationCity, 100);
    const safeSize = v.optional(companySize, 20);
    const safeDesc = v.optional(description, 2000);
    const safeStatus = v.status(status);

    const owner = await User.findByPk(ownerId);
    if (!owner) return error(res, 'Owner not found', 404);

    const company = await Company.create({
      name: safeName, ownerId, emailDomain: safeDomain, industry: safeIndustry,
      website: safeWebsite, locationCountry: safeCountry, locationCity: safeCity,
      companySize: safeSize, description: safeDesc, status: safeStatus,
      slug: makeSlug(safeName), reviewedBy: req.user.id, reviewedAt: new Date(),
    });

    await audit(req.user.id, 'company.create', company.id, null, { name: safeName });
    return success(res, { company }, 'Company created', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'Company not found', 404);

    const oldValues = { name: company.name, status: company.status };
    const updates = {};

    if (req.body.name !== undefined) updates.name = v.str(req.body.name);
    if (req.body.emailDomain !== undefined) updates.emailDomain = v.str(req.body.emailDomain, 253);
    if (req.body.industry !== undefined) updates.industry = v.optional(req.body.industry, 100);
    if (req.body.website !== undefined) updates.website = v.url(req.body.website);
    if (req.body.locationCountry !== undefined) updates.locationCountry = v.optional(req.body.locationCountry, 100);
    if (req.body.locationCity !== undefined) updates.locationCity = v.optional(req.body.locationCity, 100);
    if (req.body.companySize !== undefined) updates.companySize = v.optional(req.body.companySize, 20);
    if (req.body.description !== undefined) updates.description = v.optional(req.body.description, 2000);
    if (req.body.status !== undefined) updates.status = v.status(req.body.status);

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    await company.update(updates);
    await audit(req.user.id, 'company.update', company.id, oldValues, updates);

    return success(res, { company: { id: company.id, ...updates } }, 'Company updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// APPROVE
exports.approve = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'Company not found', 404);

    const old = company.status;
    await company.update({ status: 'active', reviewedBy: req.user.id, reviewedAt: new Date() });
    await audit(req.user.id, 'company.approve', company.id, { status: old }, { status: 'active' });

    return success(res, {}, 'Company approved');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// REJECT
exports.reject = async (req, res) => {
  try {
    const { reason } = req.body;
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'Company not found', 404);

    const old = company.status;
    await company.update({ status: 'rejected', rejectionReason: reason?.slice(0, 500), reviewedBy: req.user.id, reviewedAt: new Date() });
    await audit(req.user.id, 'company.reject', company.id, { status: old }, { status: 'rejected', reason });

    return success(res, {}, 'Company rejected');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);
    if (!company) return error(res, 'Company not found', 404);

    await Promise.all([
      company.update({ deletedAt: new Date() }),
      Job.update({ deletedAt: new Date() }, { where: { companyId: company.id } }),
    ]);

    await audit(req.user.id, 'company.delete', company.id, { name: company.name }, null);
    return success(res, {}, 'Company deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};