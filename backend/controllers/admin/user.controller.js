'use strict';

const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Wallet, CV, JobApplication, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');
const { PLAN_FEATURES } = require('../../config/pricing');

// ════════════════════════════════════════════════════════════
// VALIDATORS
// ════════════════════════════════════════════════════════════
const v = {
  email(val) {
    if (!val) throw new Error('Email is required');
    const email = val.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
    if (email.length > 254) throw new Error('Email too long');
    return email;
  },
  password(val) {
    if (!val) throw new Error('Password is required');
    if (val.length < 8) throw new Error('Password must be 8+ characters');
    if (val.length > 128) throw new Error('Password too long');
    return val;
  },
  fullName(val) {
    if (!val?.trim()) throw new Error('Full name is required');
    return val.trim().slice(0, 100);
  },
  role(val) {
    const roles = ['user', 'company', 'admin', 'support', 'moderator'];
    if (!roles.includes(val)) throw new Error(`Invalid role. Valid: ${roles.join(', ')}`);
    return val;
  },
  planKey(val) {
    const plans = Object.keys(PLAN_FEATURES);
    if (!plans.includes(val)) throw new Error(`Invalid plan. Valid: ${plans.join(', ')}`);
    return val;
  },
  status(val, allowed = ['active', 'suspended', 'pending', 'deleted']) {
    if (!allowed.includes(val)) throw new Error(`Invalid status. Valid: ${allowed.join(', ')}`);
    return val;
  },
  phone(val) {
    if (!val) return null;
    const clean = String(val).replace(/[^\d+\-() ]/g, '').trim();
    if (clean.length > 20) throw new Error('Phone too long');
    return clean;
  },
  str(val, max = 500) {
    if (!val?.trim()) return null;
    return val.trim().slice(0, max);
  },
};

// ════════════════════════════════════════════════════════════
// AUDIT HELPER
// ════════════════════════════════════════════════════════════
const audit = (actor, action, id, oldVal, newVal) =>
  AuditLog.create({
    actorId: actor,
    action,
    entityType: 'User',
    entityId: id,
    oldValue: oldVal ? JSON.stringify(oldVal) : null,
    newValue: JSON.stringify(newVal),
  }).catch(() => {});

// ════════════════════════════════════════════════════════════
// GET ALL
// ════════════════════════════════════════════════════════════
exports.getAll = async (req, res) => {
  try {
    const { search, status, role, planKey } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { deletedAt: null };
    if (status) where.status = status;
    if (role) where.role = role;
    if (planKey) where.planKey = planKey;
    if (search) {
      where[Op.or] = [
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: ['id', 'fullName', 'email', 'role', 'status', 'planKey', 'locationCountry', 'created_at', 'lastLoginAt', 'avatarUrl', 'phone'],
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
// GET ONE
// ════════════════════════════════════════════════════════════
exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['passwordHash', 'twoFaSecret'] },
      include: [
        { model: CV, as: 'cvs', attributes: ['id', 'title', 'atsScore', 'created_at'], limit: 5, required: false },
        { model: JobApplication, as: 'applications', attributes: ['id', 'status', 'created_at'], limit: 10, required: false },
        { model: Wallet, as: 'wallet', attributes: ['id', 'pointsBalance', 'cashBalance', 'isFrozen'], required: false },
      ],
    });
    if (!user) return error(res, 'User not found', 404);
    return success(res, { user });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// CREATE
// ════════════════════════════════════════════════════════════
exports.create = async (req, res) => {
  try {
    const { fullName, email, password, role = 'user', planKey = 'free', status = 'active' } = req.body;

    const safeName = v.fullName(fullName);
    const safeEmail = v.email(email);
    const safePass = v.password(password);
    const safeRole = v.role(role);
    const safePlan = v.planKey(planKey);
    const safeStatus = v.status(status, ['active', 'pending']);

    const exists = await User.findOne({ where: { email: safeEmail } });
    if (exists) return error(res, 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(safePass, 12);
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await User.create({
      fullName: safeName,
      email: safeEmail,
      passwordHash,
      role: safeRole,
      planKey: safePlan,
      status: safeStatus,
      emailVerified: true,
      referralCode,
    });

    await Wallet.create({ userId: user.id });
    await audit(req.user.id, 'user.create', user.id, null, { email: safeEmail, role: safeRole });

    return success(res, { user: { id: user.id, email: user.email, role: user.role } }, 'User created', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// UPDATE
// ════════════════════════════════════════════════════════════
exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const oldValues = { fullName: user.fullName, email: user.email, role: user.role, status: user.status, planKey: user.planKey };
    const updates = {};

    if (req.body.fullName !== undefined) updates.fullName = v.fullName(req.body.fullName);
    if (req.body.email !== undefined) {
      updates.email = v.email(req.body.email);
      const dup = await User.findOne({ where: { email: updates.email, id: { [Op.ne]: user.id } } });
      if (dup) return error(res, 'Email already in use', 409);
    }
    if (req.body.role !== undefined) updates.role = v.role(req.body.role);
    if (req.body.status !== undefined) updates.status = v.status(req.body.status);
    if (req.body.planKey !== undefined) updates.planKey = v.planKey(req.body.planKey);
    if (req.body.phone !== undefined) updates.phone = v.phone(req.body.phone);
    if (req.body.locationCountry !== undefined) updates.locationCountry = v.str(req.body.locationCountry, 100);
    if (req.body.locationCity !== undefined) updates.locationCity = v.str(req.body.locationCity, 100);
    if (req.body.headline !== undefined) updates.headline = v.str(req.body.headline, 200);
    if (req.body.bio !== undefined) updates.bio = v.str(req.body.bio, 2000);

    if (!Object.keys(updates).length) return error(res, 'No fields to update', 400);

    await user.update(updates);
    await audit(req.user.id, 'user.update', user.id, oldValues, updates);

    return success(res, { user: { id: user.id, ...updates } }, 'User updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// UPDATE STATUS
// ════════════════════════════════════════════════════════════
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const safeStatus = v.status(status);

    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const old = user.status;
    await user.update({ status: safeStatus });
    await audit(req.user.id, 'user.status_update', user.id, { status: old }, { status: safeStatus });

    return success(res, { id: user.id, status: safeStatus }, 'Status updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// UPDATE PLAN
// ════════════════════════════════════════════════════════════
exports.updatePlan = async (req, res) => {
  try {
    const { planKey } = req.body;
    const safePlan = v.planKey(planKey);

    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const old = user.planKey;
    await user.update({ planKey: safePlan });
    await audit(req.user.id, 'user.plan_update', user.id, { planKey: old }, { planKey: safePlan });

    return success(res, { id: user.id, planKey: safePlan, features: PLAN_FEATURES[safePlan] }, 'Plan updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// RESET PASSWORD
// ════════════════════════════════════════════════════════════
exports.resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const safePass = v.password(newPassword);

    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    const hash = await bcrypt.hash(safePass, 12);
    await user.update({ passwordHash: hash, failedLoginCount: 0, lockedUntil: null });
    await audit(req.user.id, 'user.password_reset', user.id, null, { email: user.email });

    return success(res, {}, 'Password reset');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// DELETE
// ════════════════════════════════════════════════════════════
exports.delete = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return error(res, 'User not found', 404);

    await Promise.all([
      user.update({ status: 'deleted', deletedAt: new Date() }),
      CV.update({ deletedAt: new Date() }, { where: { userId: user.id } }),
      Wallet.update({ isFrozen: true }, { where: { userId: user.id } }),
    ]);

    await audit(req.user.id, 'user.delete', user.id, { email: user.email }, { deletedAt: new Date() });

    return success(res, {}, 'User deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// BULK UPDATE PLANS
// ════════════════════════════════════════════════════════════
exports.bulkUpdatePlans = async (req, res) => {
  try {
    const { planKey, filterByPlan, filterByRole } = req.body;
    const safePlan = v.planKey(planKey);

    const where = { role: { [Op.ne]: 'admin' }, deletedAt: null };
    if (filterByPlan) where.planKey = filterByPlan;
    if (filterByRole) where.role = filterByRole;

    const count = await User.count({ where });
    if (count > 10000) return error(res, 'Too many users, narrow filters', 400);
    if (count === 0) return error(res, 'No users match filters', 400);

    const [updated] = await User.update({ planKey: safePlan }, { where });
    await audit(req.user.id, 'user.bulk_plan_update', null, null, { planKey: safePlan, count: updated });

    return success(res, { updated, planKey: safePlan }, `${updated} users updated`);
  } catch (err) {
    return error(res, err.message, 400);
  }
};