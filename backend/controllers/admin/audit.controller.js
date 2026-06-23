'use strict';

const { Op } = require('sequelize');
const { AuditLog, User } = require('../../models');
const { paginate, error } = require('../../utils/apiResponse');

exports.getAll = async (req, res) => {
  try {
    const { action, entityType, actorId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = { [Op.iLike]: `%${action}%` };
    if (entityType) where.entityType = entityType;
    if (actorId) where.actorId = actorId;

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [{ model: User, as: 'actor', attributes: ['id', 'fullName', 'email'], required: false }],
      order: [['created_at', 'DESC']], limit, offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
};