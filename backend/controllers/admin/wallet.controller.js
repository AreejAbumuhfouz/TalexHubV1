'use strict';

const { Op } = require('sequelize');
const { Wallet, WalletTransaction, User, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Wallet', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await Wallet.findAndCountAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email'], required: false }],
      order: [['pointsBalance', 'DESC']], limit, offset,
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
};

// GET ONE
exports.getOne = async (req, res) => {
  try {
    const wallet = await Wallet.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'planKey'], required: false }],
    });
    if (!wallet) return error(res, 'Wallet not found', 404);
    return success(res, { wallet });
  } catch (err) { return error(res, err.message, 500); }
};

// ADJUST
exports.adjust = async (req, res) => {
  try {
    const { userId, pointsDelta = 0, cashDelta = 0, description } = req.body;
    const pts = parseInt(pointsDelta) || 0;
    const cash = parseFloat(cashDelta) || 0;
    if (!userId) return error(res, 'userId required', 400);
    if (!pts && !cash) return error(res, 'pointsDelta or cashDelta required', 400);

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) return error(res, 'Wallet not found', 404);

    const newPts = wallet.pointsBalance + pts;
    const newCash = wallet.cashBalance + cash;
    if (newPts < 0) return error(res, 'Insufficient points', 400);
    if (newCash < 0) return error(res, 'Insufficient cash', 400);

    await wallet.increment({ pointsBalance: pts, cashBalance: cash });
    await WalletTransaction.create({
      walletId: wallet.id, type: 'admin_adjustment',
      pointsDelta: pts, cashDelta: cash,
      description: description?.slice(0, 500) || 'Admin adjustment',
      createdBy: req.user.id,
    });

    await audit(req.user.id, 'wallet.adjust', wallet.id, { points: wallet.pointsBalance, cash: wallet.cashBalance }, { pointsDelta: pts, cashDelta: cash, description });
    return success(res, { wallet: { id: wallet.id, pointsBalance: newPts, cashBalance: newCash } }, 'Wallet adjusted');
  } catch (err) { return error(res, err.message, 400); }
};

// BULK ADD POINTS
exports.bulkAddPoints = async (req, res) => {
  try {
    const { points, filterByPlan, filterByRole, description } = req.body;
    const pts = parseInt(points);
    if (!pts) return error(res, 'Points required', 400);

    const userWhere = { deletedAt: null, status: 'active' };
    if (filterByPlan) userWhere.planKey = filterByPlan;
    if (filterByRole) userWhere.role = filterByRole;

    const count = await User.count({ where: userWhere });
    if (count > 50000) return error(res, 'Too many users, narrow filters', 400);
    if (!count) return error(res, 'No users match', 400);

    const users = await User.findAll({ where: userWhere, attributes: ['id'], limit: 50000 });
    const wallets = await Wallet.findAll({ where: { userId: { [Op.in]: users.map(u => u.id) } } });

    const BATCH = 100;
    let done = 0;
    for (let i = 0; i < wallets.length; i += BATCH) {
      const batch = wallets.slice(i, i + BATCH);
      await Promise.all(batch.map(async w => {
        if (w.pointsBalance + pts < 0) return;
        await w.increment({ pointsBalance: pts });
        await WalletTransaction.create({ walletId: w.id, type: 'admin_adjustment', pointsDelta: pts, cashDelta: 0, description: description?.slice(0, 500) || 'Bulk points', createdBy: req.user.id });
        done++;
      }));
    }

    await audit(req.user.id, 'wallet.bulk_points', null, null, { points: pts, count: done, description });
    return success(res, { updated: done, points: pts }, `Points added to ${done} users`);
  } catch (err) { return error(res, err.message, 400); }
};

// GET TRANSACTIONS
exports.getTransactions = async (req, res) => {
  try {
    const { userId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = userId ? { '$wallet.userId$': userId } : {};
    const { count, rows } = await WalletTransaction.findAndCountAll({
      where,
      include: [{ model: Wallet, as: 'wallet', include: [{ model: User, as: 'user', attributes: ['fullName', 'email'], required: false }], required: !!userId }],
      order: [['created_at', 'DESC']], limit, offset,
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
};