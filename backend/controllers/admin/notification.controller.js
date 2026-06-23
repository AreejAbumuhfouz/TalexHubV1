'use strict';

const { Op } = require('sequelize');
const { User, Notification, AuditLog } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Notification', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

// BROADCAST
exports.broadcast = async (req, res) => {
  try {
    const { title, titleAr, body, bodyAr, type = 'system', filterByPlan, filterByRole, targetUserId } = req.body;
    if (!title || !body) return error(res, 'Title and body required', 400);

    let userIds = [];
    if (targetUserId) {
      userIds = [targetUserId];
    } else {
      const where = { status: 'active', deletedAt: null };
      if (filterByPlan) where.planKey = filterByPlan;
      if (filterByRole) where.role = filterByRole;

      const count = await User.count({ where });
      if (count > 50000) return error(res, 'Too many recipients, narrow filters', 400);
      if (!count) return error(res, 'No recipients', 400);

      const users = await User.findAll({ where, attributes: ['id'], limit: 50000 });
      userIds = users.map(u => u.id);
    }

    const BATCH = 500;
    for (let i = 0; i < userIds.length; i += BATCH) {
      const batch = userIds.slice(i, i + BATCH);
      await Notification.bulkCreate(batch.map(uid => ({
        userId: uid, title: title.slice(0, 200), titleAr: (titleAr || title).slice(0, 200),
        body: body.slice(0, 1000), bodyAr: (bodyAr || body).slice(0, 1000),
        type, channel: 'in_app', isRead: false, sentAt: new Date(),
      })), { ignoreDuplicates: true });
    }

    await audit(req.user.id, 'notification.broadcast', null, null, { title, count: userIds.length });
    return success(res, { sent: userIds.length }, `Notification sent to ${userIds.length} users`);
  } catch (err) { return error(res, err.message, 400); }
};