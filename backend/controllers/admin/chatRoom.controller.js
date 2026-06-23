
'use strict';

const { Op } = require('sequelize');
const { ChatRoom, ChatCategory, User, PostReport, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');
const { getSetting, setSetting } = require('../../services/settings.service');

// ════════════════════════════════════════════════════════════
// DEFAULT PLANS CONFIG
// ════════════════════════════════════════════════════════════
const DEFAULT_PLANS = {
  free:  { stages: 3,  durationMinutes: 30,  canCreate: false, canHost: true,  maxRoomsPerMonth: 0,  maxRoomsPerDay: 0, capacity: 50 },
  pro:   { stages: 6,  durationMinutes: 120, canCreate: true,  canHost: true,  maxRoomsPerMonth: 15, maxRoomsPerDay: 2, capacity: 200 },
  elite: { stages: 8,  durationMinutes: 300, canCreate: true,  canHost: true,  maxRoomsPerMonth: 30, maxRoomsPerDay: 3, capacity: 500 },
};

// ════════════════════════════════════════════════════════════
// AUDIT HELPER
// ════════════════════════════════════════════════════════════
const audit = (actorId, action, entityType, entityId, oldValue = null, newValue = {}) =>
  AuditLog.create({
    actorId, action, entityType, entityId,
    oldValue: oldValue ? JSON.stringify(oldValue) : null,
    newValue: JSON.stringify(newValue),
  }).catch(() => {});

// ════════════════════════════════════════════════════════════
// GET ALL ROOMS
// ════════════════════════════════════════════════════════════
exports.getAll = async (req, res) => {
  try {
    const { status, search, planKey } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = {};
    if (status === 'active') where.isActive = true;
    if (status === 'closed') where.isActive = false;
    if (planKey) where.planKey = planKey;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { nameAr: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ChatRoom.findAndCountAll({
      where,
      attributes: [
        'id', 'name', 'nameAr', 'description', 'roomType',
        'isActive', 'isPremium', 'maxMembers', 'maxStages',
        'planKey', 'stage', 'memberCount', 'maxMembers', 'createdBy', // ✅ added capacity
        'created_at', 'expiresAt', 'closedAt',
      ],
      include: [
        { model: ChatCategory, as: 'category', attributes: ['id', 'name', 'nameAr'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email', 'avatarUrl'], required: false }, // ✅ added avatarUrl
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    // ✅ Add reportsCount for each room
    const { fn, col } = require('sequelize');
    const roomIds = rows.map(r => r.id);
    const reportCounts = roomIds.length ? await PostReport.findAll({
      where: { roomId: roomIds, resolved: false },
      attributes: ['roomId', [fn('COUNT', col('id')), 'count']],
      group: ['roomId'],
      raw: true,
    }) : [];
    const reportMap = {};
    reportCounts.forEach(r => { reportMap[r.roomId] = parseInt(r.count); });

    const enriched = rows.map(room => ({
  ...room.toJSON(),
  reportsCount: reportMap[room.id] || 0,
  capacity:   room.maxMembers  || 50,   // ✅ map maxMembers → capacity for frontend
  hostName:   room.creator?.fullName  || 'Unknown',
  hostAvatar: room.creator?.avatarUrl || null,
}));

    return paginate(res, enriched, count, page, limit);
  } catch (err) {
    console.error('getAll ChatRooms Error:', err);
    return error(res, 'Failed to fetch chat rooms', 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET ONE ROOM
// ════════════════════════════════════════════════════════════
exports.getOne = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id, {
      include: [
        { model: ChatCategory, as: 'category', attributes: ['id', 'name', 'nameAr'] },
        { model: User, as: 'creator', attributes: ['id', 'fullName', 'email', 'planKey'] },
      ],
    });

    if (!room) return error(res, 'Chat room not found', 404);

    // Get reports for this room
    const reports = await PostReport.findAll({
      where: { roomId: room.id, resolved: false },
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'fullName', 'email'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit: 20,
    });

    return success(res, {
      ...room.toJSON(),
      reports: reports.map(r => r.toJSON()),
      reportsCount: reports.length,
    });
  } catch (err) {
    console.error('getOne ChatRoom Error:', err);
    return error(res, 'Failed to fetch chat room', 500);
  }
};

// ════════════════════════════════════════════════════════════
// CREATE ROOM (Admin)
// ════════════════════════════════════════════════════════════
exports.create = async (req, res) => {
  try {
    const {
      name, nameAr, description, categoryId,
      roomType = 'mixed', maxMembers = 500,
      maxStages = 8, planKey = 'elite',
      isPremium = false, durationDays = 30,
    } = req.body;

    if (!name?.trim()) return error(res, 'Room name is required', 400);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (parseInt(durationDays) || 30));

    const room = await ChatRoom.create({
      name: name.trim(),
      nameAr: nameAr?.trim() || null,
      description: description?.trim() || null,
      categoryId: categoryId || null,
      roomType,
      maxMembers: Math.min(10000, Math.max(2, parseInt(maxMembers) || 500)),
      maxStages: Math.min(20, Math.max(1, parseInt(maxStages) || 8)),
      planKey,
      isPremium: isPremium === true || isPremium === 'true',
      isActive: true,
      expiresAt,
      createdBy: req.user.id,
    });

    await audit(req.user.id, 'chatroom.create', 'ChatRoom', room.id, null, {
      name: room.name,
      planKey: room.planKey,
      maxStages: room.maxStages,
    });

    return success(res, { room }, 'Chat room created successfully', 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// UPDATE ROOM
// ════════════════════════════════════════════════════════════
exports.update = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return error(res, 'Chat room not found', 404);

    const oldValues = {
      name: room.name,
      planKey: room.planKey,
      maxStages: room.maxStages,
      isActive: room.isActive,
    };

    const updates = {};

    if (req.body.name !== undefined) updates.name = req.body.name.trim().slice(0, 100);
    if (req.body.nameAr !== undefined) updates.nameAr = req.body.nameAr?.trim().slice(0, 100);
    if (req.body.description !== undefined) updates.description = req.body.description?.trim().slice(0, 1000);
    if (req.body.categoryId !== undefined) updates.categoryId = req.body.categoryId || null;
    if (req.body.maxMembers !== undefined) updates.maxMembers = Math.min(10000, Math.max(2, parseInt(req.body.maxMembers) || 500));
    if (req.body.maxStages !== undefined) updates.maxStages = Math.min(20, Math.max(1, parseInt(req.body.maxStages) || 3));
    if (req.body.planKey !== undefined) {
      if (!['free', 'pro', 'elite'].includes(req.body.planKey)) {
        return error(res, 'Invalid plan key. Valid: free, pro, elite', 400);
      }
      updates.planKey = req.body.planKey;
    }
    if (req.body.isPremium !== undefined) updates.isPremium = req.body.isPremium === true || req.body.isPremium === 'true';
    if (req.body.durationDays !== undefined) {
      const days = parseInt(req.body.durationDays);
      updates.expiresAt = new Date();
      updates.expiresAt.setDate(updates.expiresAt.getDate() + days);
    }

    if (Object.keys(updates).length === 0) return error(res, 'No fields to update', 400);

    await room.update(updates);
    await audit(req.user.id, 'chatroom.update', 'ChatRoom', room.id, oldValues, updates);

    return success(res, { room: { id: room.id, ...updates } }, 'Chat room updated');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// TOGGLE ROOM ACTIVE/INACTIVE
// ════════════════════════════════════════════════════════════
exports.toggle = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return error(res, 'Chat room not found', 404);

    const isActive = !room.isActive;
    await room.update({
      isActive,
      ...(isActive ? {} : { closedAt: new Date() }),
    });

    await audit(req.user.id, 'chatroom.toggle', 'ChatRoom', room.id,
      { isActive: room.isActive }, { isActive });

    return success(res, {
      id: room.id,
      isActive,
    }, `Room ${isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// DELETE ROOM
// ════════════════════════════════════════════════════════════
exports.delete = async (req, res) => {
  try {
    const room = await ChatRoom.findByPk(req.params.id);
    if (!room) return error(res, 'Chat room not found', 404);

    await audit(req.user.id, 'chatroom.delete', 'ChatRoom', room.id,
      { name: room.name, planKey: room.planKey }, null);

    await room.update({ isActive: false, closedAt: new Date() });

    return success(res, {}, 'Chat room closed successfully');
  } catch (err) {
    console.error('delete ChatRoom Error:', err);
    return error(res, 'Failed to close chat room', 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET ROOM STATS
// ════════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
  try {
    const [
      totalRooms,
      activeRooms,
      closedRooms,
      freeRooms,
      proRooms,
      eliteRooms,
      totalReports,
      pendingReports,
    ] = await Promise.all([
      ChatRoom.count(),
      ChatRoom.count({ where: { isActive: true } }),
      ChatRoom.count({ where: { isActive: false } }),
      ChatRoom.count({ where: { planKey: 'free' } }),
      ChatRoom.count({ where: { planKey: 'pro' } }),
      ChatRoom.count({ where: { planKey: 'elite' } }),
      PostReport.count({ where: { roomId: { [Op.ne]: null } } }),
      PostReport.count({ where: { roomId: { [Op.ne]: null }, resolved: false } }),
    ]);

    return success(res, {
      totalRooms,
      activeRooms,
      closedRooms,
      freeRooms,
      proRooms,
      eliteRooms,
      totalReports,
      pendingReports,
    });
  } catch (err) {
    console.error('getStats ChatRooms Error:', err);
    return error(res, 'Failed to fetch stats', 500);
  }
};

// ════════════════════════════════════════════════════════════
// PLANS CONFIG
// ════════════════════════════════════════════════════════════
exports.getPlans = async (req, res) => {
  try {
    const row = await getSetting('chat_plans_config');
    // ✅ getSetting now auto-parses JSON — no need to JSON.parse
    const plans = !row
      ? DEFAULT_PLANS
      : typeof row === 'object'
        ? row
        : JSON.parse(row);
    return success(res, { plans });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.updatePlans = async (req, res) => {
  try {
    const { plans } = req.body;

    if (!plans || typeof plans !== 'object') {
      return error(res, 'Plans config object is required', 400);
    }

    // Validate each plan
    for (const [key, config] of Object.entries(plans)) {
      if (!['free', 'pro', 'elite'].includes(key)) {
        return error(res, `Invalid plan key: ${key}. Valid: free, pro, elite`, 400);
      }

      if (config.stages !== undefined) {
        const stages = parseInt(config.stages);
        if (isNaN(stages) || stages < 1 || stages > 20) {
          return error(res, `${key}: stages must be between 1-20`, 400);
        }
      }

      if (config.durationDays !== undefined) {
        const days = parseInt(config.durationDays);
        if (isNaN(days) || days < 1 || days > 365) {
          return error(res, `${key}: durationDays must be between 1-365`, 400);
        }
      }

      if (config.maxRooms !== undefined) {
        const max = parseInt(config.maxRooms);
        if (isNaN(max) || max < 0 || max > 10) {
          return error(res, `${key}: maxRooms must be between 0-10`, 400);
        }
      }
    }

    const oldRow = await getSetting('chat_plans_config');
    // ✅ setSetting handles JSON.stringify internally
    await setSetting('chat_plans_config', plans);

    await audit(req.user.id, 'chatroom.plans_update', 'Setting', null,
      !oldRow ? null : typeof oldRow === 'object' ? oldRow : JSON.parse(oldRow), plans);

    return success(res, { plans }, 'Plans configuration updated successfully');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.resetPlans = async (req, res) => {
  try {
    // ✅ setSetting handles JSON.stringify internally
    await setSetting('chat_plans_config', DEFAULT_PLANS);

    await audit(req.user.id, 'chatroom.plans_reset', 'Setting', null, null, DEFAULT_PLANS);

    return success(res, { plans: DEFAULT_PLANS }, 'Plans reset to defaults');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// TOGGLE FREE ROOM CREATION
// ════════════════════════════════════════════════════════════
exports.toggleFreeCreate = async (req, res) => {
  try {
    const current = await getSetting('allow_free_room_create');
    const isEnabled = current === 'true';
    const nextValue = String(!isEnabled);

    await setSetting('allow_free_room_create', nextValue);

    await audit(req.user.id, 'chatroom.toggle_free_create', 'Setting', null,
      { allowFreeCreate: isEnabled }, { allowFreeCreate: !isEnabled });

    return success(res, {
      allowFreeCreate: !isEnabled,
    }, `Free room creation ${!isEnabled ? 'enabled ✅' : 'disabled ❌'}`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// SUSPEND USER FROM ALL ROOMS
// ════════════════════════════════════════════════════════════
exports.suspendUser = async (req, res) => {
  try {
    const { userId, reason, durationHours = 72 } = req.body;

    if (!userId) return error(res, 'User ID is required', 400);

    const user = await User.findByPk(userId);
    if (!user) return error(res, 'User not found', 404);

    const suspendedUntil = new Date();
    suspendedUntil.setHours(suspendedUntil.getHours() + (parseInt(durationHours) || 72));

    // Update user suspension
    await user.update({
      chatSuspendedUntil: suspendedUntil,
      chatSuspensionReason: reason?.trim() || 'Violation of room rules',
    });

    await audit(req.user.id, 'chatroom.suspend_user', 'User', userId, null, {
      reason,
      durationHours,
      suspendedUntil,
    });

    return success(res, {
      userId,
      suspendedUntil,
      reason,
    }, `User suspended from chat rooms for ${durationHours} hours`);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// UNSUSPEND USER
// ════════════════════════════════════════════════════════════
exports.unsuspendUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return error(res, 'User ID is required', 400);

    const user = await User.findByPk(userId);
    if (!user) return error(res, 'User not found', 404);

    await user.update({
      chatSuspendedUntil: null,
      chatSuspensionReason: null,
    });

    await audit(req.user.id, 'chatroom.unsuspend_user', 'User', userId, null, null);

    return success(res, { userId }, 'User unsuspended from chat rooms');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// ════════════════════════════════════════════════════════════
// REPORTS
// ════════════════════════════════════════════════════════════
exports.getReports = async (req, res) => {
  try {
    const { resolved, roomId } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const where = { roomId: { [Op.ne]: null } };
    if (resolved === 'true') where.resolved = true;
    if (resolved === 'false') where.resolved = false;
    if (roomId) where.roomId = roomId;

    const { count, rows } = await PostReport.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'fullName', 'email'], required: false },
        { model: ChatRoom, as: 'room', attributes: ['id', 'name', 'nameAr', 'isActive', 'planKey'], required: false },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) {
    console.error('getReports Error:', err);
    return error(res, 'Failed to fetch reports', 500);
  }
};

exports.getReport = async (req, res) => {
  try {
    const report = await PostReport.findByPk(req.params.id, {
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'fullName', 'email'], required: false },
        { model: ChatRoom, as: 'room', attributes: ['id', 'name', 'nameAr', 'isActive', 'planKey', 'createdBy'], required: false },
      ],
    });

    if (!report) return error(res, 'Report not found', 404);

    return success(res, { report });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { action, reason } = req.body;
    // action: 'resolve' | 'dismiss' | 'close_room' | 'suspend_user'

    const report = await PostReport.findByPk(req.params.id);
    if (!report) return error(res, 'Report not found', 404);

    const updates = {
      resolved: true,
      resolvedBy: req.user.id,
      resolutionAction: action || 'resolve',
      resolutionReason: reason?.trim() || null,
    };

    await report.update(updates);

    // Take action based on the resolution
    if (action === 'close_room' && report.roomId) {
      await ChatRoom.update(
        { isActive: false, closedAt: new Date(), closedReason: reason || 'Closed due to reports' },
        { where: { id: report.roomId } }
      );

      await audit(req.user.id, 'chatroom.close_from_report', 'ChatRoom', report.roomId, null, {
        reportId: report.id,
        reason,
      });
    }

    if (action === 'suspend_user' && report.reportedUserId) {
      const suspendedUntil = new Date();
      suspendedUntil.setHours(suspendedUntil.getHours() + 72);

      await User.update(
        {
          chatSuspendedUntil: suspendedUntil,
          chatSuspensionReason: reason || 'Reported violation',
        },
        { where: { id: report.reportedUserId } }
      );

      await audit(req.user.id, 'chatroom.suspend_from_report', 'User', report.reportedUserId, null, {
        reportId: report.id,
        reason,
        suspendedUntil,
      });
    }

    await audit(req.user.id, 'report.resolve', 'PostReport', report.id,
      { resolved: false }, { resolved: true, action, reason });

    return success(res, { report: { id: report.id, ...updates } }, 'Report resolved');
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await PostReport.findByPk(req.params.id);
    if (!report) return error(res, 'Report not found', 404);

    await audit(req.user.id, 'report.delete', 'PostReport', report.id,
      { reason: report.reason, roomId: report.roomId }, null);

    await report.destroy();

    return success(res, {}, 'Report deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET SUSPENDED USERS
// ════════════════════════════════════════════════════════════
exports.getSuspendedUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: {
        chatSuspendedUntil: { [Op.gt]: new Date() },
        deletedAt: null,
      },
      attributes: [
        'id', 'fullName', 'email', 'avatarUrl',
        'chatSuspendedUntil', 'chatSuspensionReason', 'planKey',
      ],
      order: [['chatSuspendedUntil', 'DESC']],
      limit,
      offset,
    });

    return paginate(res, rows, count, page, limit);
  } catch (err) {
    return error(res, err.message, 500);
  }
};