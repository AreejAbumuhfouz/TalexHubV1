

'use strict';

const { success, error, paginate } = require('../utils/apiResponse');
const { ChatCategory, ChatRoom, ChatMessage, User } = require('../models');
const { getSettingBool, getSetting } = require('../services/settings.service');
const { containsBadWords, filterBadWords } = require('../services/badWordsFilter');
const { getList } = require('../services/badWordsFilter');


// ════════════════════════════════════════════════════════════
// PLANS CONFIG — يتحكم فيها الأدمن من لوحة التحكم
// ════════════════════════════════════════════════════════════
const DEFAULT_PLANS = {
  free:  { stages: 3,  durationMinutes: 30,  canCreate: false, canHost: true,  maxRoomsPerMonth: 0,  maxRoomsPerDay: 0, capacity: 50 },
  pro:   { stages: 6,  durationMinutes: 120, canCreate: true,  canHost: true,  maxRoomsPerMonth: 15, maxRoomsPerDay: 2, capacity: 200 },
  elite: { stages: 8,  durationMinutes: 300, canCreate: true,  canHost: true,  maxRoomsPerMonth: 30, maxRoomsPerDay: 3, capacity: 500 },
};

// const getPlansConfig = async () => {
//   try {
//     const row = await getSetting('chat_plans_config');
//     if (row) return JSON.parse(row);
//   } catch {}
//   return DEFAULT_PLANS;
// };
const getPlansConfig = async () => {
  try {
    const row = await getSetting('chat_plans_config');
    if (row && typeof row === 'object') return row;      // ✅ already parsed
    if (row && typeof row === 'string') return JSON.parse(row); // ✅ fallback
  } catch {}
  return DEFAULT_PLANS;
};

const getPlanConfig = async (planKey) => {
  const plans = await getPlansConfig();
  return plans[planKey] || plans.free;
};

const { getIceServers } = require('../config/turn');


/* ══ CATEGORIES ══════════════════════════════════════════ */
exports.getCategories = async (req, res) => {
  const categories = await ChatCategory.findAll({
    include: [{
      model: ChatRoom, as: 'rooms',
      where: { isActive: true }, required: false,
      attributes: ['id', 'name', 'nameAr', 'roomType', 'maxMembers', 'isPremium'],
    }],
    order: [['sortOrder', 'ASC']],
  });
  return success(res, categories);
};

/* ══ ROOMS ═══════════════════════════════════════════════ */
exports.getRooms = async (req, res) => {
  try {
    const { categoryId, stage = 0 } = req.query;
    const where = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    if (stage) where.stage = parseInt(stage);

    const rooms = await ChatRoom.findAll({
      where,
      include: [
        { model: ChatCategory, as: 'category', attributes: ['id', 'name', 'nameAr', 'icon'] },
      ],
      order: [['memberCount', 'DESC'], ['created_at', 'DESC']],
    });

    const plans = await getPlansConfig();
    
    // جلب بيانات المستخدمين يدوياً
    const userIds = [...new Set(rooms.map(room => room.createdBy).filter(id => id))];
    const users = await User.findAll({
      where: { id: userIds },
      attributes: ['id', 'fullName', 'avatarUrl']
    });
    
    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user.id, user);
    });
    
    const enriched = rooms.map(room => {
      const roomJson = room.toJSON();
      const creator = userMap.get(roomJson.createdBy);
      
      return {
        ...roomJson,
        plans,
        hostName: creator?.fullName || 'Unknown',
        hostAvatar: creator?.avatarUrl || null,
        host: creator ? {
          id: creator.id,
          fullName: creator.fullName,
          avatarUrl: creator.avatarUrl
        } : null
      };
    });

    return success(res, enriched);
  } catch (err) {
    console.error('Get rooms error:', err);
    return error(res, err.message, 500);
  }
};
exports.getRoom = async (req, res) => {
  const room = await ChatRoom.findOne({
    where: { id: req.params.id, isActive: true },
    include: [
      { model: ChatCategory, as: 'category', attributes: ['id', 'name', 'nameAr', 'icon'] },
    ],
  });
  
  if (!room) return error(res, 'Room not found', 404);

  const planConfig = await getPlanConfig(req.user?.planKey || 'free');
  const roomJson = room.toJSON();
  
  let hostName = 'Host';
  let hostAvatar = null;
  
  if (roomJson.createdBy) {
    try {
      const host = await User.findByPk(roomJson.createdBy, {
        attributes: ['fullName', 'avatarUrl']
      });
      if (host) {
        hostName = host.fullName;
        hostAvatar = host.avatarUrl;
      }
    } catch (err) {
      console.error('Error fetching host:', err);
    }
  }

  return success(res, {
    ...roomJson,
    iceServers: getIceServers(),
    planLimits: planConfig,
    hostName,
    hostAvatar,
  });
};

exports.createRoom = async (req, res) => {
  const { Op } = require('sequelize');
  const planKey = req.user?.planKey || 'free';
  const planConfig = await getPlanConfig(planKey) || DEFAULT_PLANS.free;

  if (!planConfig || !planConfig.canCreate) {
    return res.status(403).json({
      success: false,
      message: 'Room creation is available for Pro and Elite plans only',
    });
  }

  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const roomsThisMonth = await ChatRoom.count({
    where: {
      createdBy: req.user.id,
      created_at: { [Op.gte]: thisMonth },
    },
  });

  const maxRoomsPerMonth = planConfig.maxRoomsPerMonth || 15;

  if (roomsThisMonth >= maxRoomsPerMonth) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    const daysLeft = Math.ceil((nextMonth - new Date()) / (1000 * 60 * 60 * 24));
    
    return res.status(403).json({
      success: false,
      message: {
        en: `Monthly room limit reached (${roomsThisMonth}/${maxRoomsPerMonth}).\n\nYour limit will reset in ${daysLeft} day(s).\nConsider upgrading to Elite for ${DEFAULT_PLANS.elite.maxRoomsPerMonth} rooms per month.`,
        ar: `تم الوصول للحد الشهري للغرف (${roomsThisMonth}/${maxRoomsPerMonth}).\n\nسيتم تجديد الحد بعد ${daysLeft} يوم.\nيمكنك الترقية إلى Elite للحصول على ${DEFAULT_PLANS.elite.maxRoomsPerMonth} غرفة شهرياً.`,
      },
      upgradeRequired: planKey !== 'elite',
    });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const roomsToday = await ChatRoom.count({
    where: {
      createdBy: req.user.id,
      created_at: { [Op.gte]: today },
    },
  });

  const maxRoomsPerDay = planConfig.maxRoomsPerDay || 2;

  if (roomsToday >= maxRoomsPerDay) {
    return res.status(403).json({
      success: false,
      message: {
        en: `Daily room limit reached (${roomsToday}/${maxRoomsPerDay}).\n\nYour limit will reset tomorrow.\nConsider upgrading to Elite for ${DEFAULT_PLANS.elite.maxRoomsPerDay} rooms per day.`,
        ar: `تم الوصول للحد اليومي للغرف (${roomsToday}/${maxRoomsPerDay}).\n\nسيتم تجديد الحد غداً.\nيمكنك الترقية إلى Elite للحصول على ${DEFAULT_PLANS.elite.maxRoomsPerDay} غرف يومياً.`,
      },
      upgradeRequired: planKey !== 'elite',
    });
  }

  const activeRooms = await ChatRoom.count({
    where: { createdBy: req.user.id, isActive: true },
  });

  if (activeRooms >= 1) {
    return res.status(403).json({
      success: false,
      message: {
        en: `You already have an active room.\n\nPlease close your current room before creating a new one. Only one room can be active at a time.`,
        ar: `لديك غرفة نشطة حالياً.\n\nيرجى إغلاق غرفتك الحالية قبل إنشاء غرفة جديدة. يمكن تفعيل غرفة واحدة فقط في نفس الوقت.`,
      },
    });
  }

  const {
    name, nameAr, description, categoryId,
    roomType = 'mixed', stage = 0, maxMembers,
  } = req.body;

  if (!name?.trim()) return error(res, 'Room name is required', 400);

  const capacity = planConfig.capacity || 50;
  const finalMaxMembers = Math.min(10000, Math.max(2, parseInt(maxMembers) || capacity));

  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + (planConfig.durationMinutes || 30));

  const room = await ChatRoom.create({
    name: name.trim(),
    nameAr: nameAr?.trim() || null,
    description: description?.trim() || null,
    categoryId: categoryId || null,
    createdBy: req.user.id,
    roomType,
    stage: parseInt(stage) || 0,
    maxMembers: finalMaxMembers,
    maxStages: planConfig.stages || 3,
    isActive: true,
    expiresAt,
    planKey,
    durationMinutes: planConfig.durationMinutes || 30,
    capacity: capacity,
    tags: '[]',
    language: 'ar',
  });

  return success(res, {
    ...room.toJSON(),
    iceServers: getIceServers(),
    planLimits: planConfig,
  }, 'Room created successfully', 201);
};

exports.deleteRoom = async (req, res) => {
  const room = await ChatRoom.findByPk(req.params.id);
  if (!room) return error(res, 'Room not found', 404);

  const isOwner = room.createdBy === req.user.id;
  const isAdmin = ['admin', 'support', 'moderator'].includes(req.user.role);

  if (!isOwner && !isAdmin) return error(res, 'Unauthorized', 403);

  await room.update({ isActive: false, closedAt: new Date() });
  return success(res, null, 'Room closed');
};

/* ══ MESSAGES (لا تُحفظ في الداتابيز) ═══════════════════ */
exports.getMessages = async (req, res) => {
  return success(res, []);
};

exports.sendMessage = async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return error(res, 'Message content is required', 400);

  if (containsBadWords(content)) {
    return error(res, 'Message contains inappropriate language and was blocked', 400);
  }

  const room = await ChatRoom.findOne({
    where: { id: req.params.id, isActive: true },
  });
  if (!room) return error(res, 'Room not found', 404);

  return success(res, {
    id: `msg_${Date.now()}`,
    content: content.trim(),
    senderId: req.user.id,
    sender: {
      id: req.user.id,
      fullName: req.user.fullName,
      avatarUrl: req.user.avatarUrl,
    },
    createdAt: new Date().toISOString(),
    ephemeral: true,
  }, 'Message sent', 201);
};

/* ══ REPORTS ════════════════════════════════════════════ */
exports.reportRoom = async (req, res) => {
  try {
    const { reason, description } = req.body;
    const roomId = req.params.id;

    if (!reason?.trim()) return error(res, 'Reason is required', 400);

    const room = await ChatRoom.findByPk(roomId);
    if (!room) return error(res, 'Room not found', 404);

    const { PostReport } = require('../models');
    await PostReport.create({
      reporterId: req.user.id,
      roomId,
      reason: reason.trim(),
      description: description?.trim() || null,
      reportedUserId: room.createdBy,
      resolved: false,
    });

    return success(res, null, 'Report submitted. Admin will review it.');
  } catch (err) {
    console.error('Report error:', err);
    return error(res, err.message, 500);
  }
};

/* ══ SETTINGS ════════════════════════════════════════════ */
exports.getRoomSettings = async (req, res) => {
  const { Op } = require('sequelize');
  const plans = await getPlansConfig();
  const allowFreeCreate = await getSettingBool('allow_free_room_create', false);

  let usedToday = 0;
  let usedMonth = 0;

  if (req.user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const [todayCount, monthCount] = await Promise.all([
      ChatRoom.count({ where: { createdBy: req.user.id, created_at: { [Op.gte]: today } } }),
      ChatRoom.count({ where: { createdBy: req.user.id, created_at: { [Op.gte]: thisMonth } } }),
    ]);

    usedToday = todayCount;
    usedMonth = monthCount;
  }

  return success(res, {
    plans,
    allowFreeCreate,
    usedToday,
    usedMonth,
  });
};

exports.getPlansConfig = async (req, res) => {
  const plans = await getPlansConfig();
  return success(res, { plans });
};

exports.updatePlansConfig = async (req, res) => {
  if (!['admin', 'support'].includes(req.user?.role)) {
    return error(res, 'Unauthorized', 403);
  }

  const { plans } = req.body;
  if (!plans || typeof plans !== 'object') return error(res, 'Invalid plans config', 400);

  for (const [key, config] of Object.entries(plans)) {
    if (!['free', 'pro', 'elite'].includes(key)) {
      return error(res, `Invalid plan key: ${key}`, 400);
    }
    if (config.stages && (!Number.isInteger(config.stages) || config.stages < 1 || config.stages > 20)) {
      return error(res, `${key}: stages must be 1-20`, 400);
    }
    if (config.durationDays && (!Number.isInteger(config.durationDays) || config.durationDays < 1 || config.durationDays > 365)) {
      return error(res, `${key}: durationDays must be 1-365`, 400);
    }
  }

  const { setSetting } = require('../services/settings.service');
  // await setSetting('chat_plans_config', JSON.stringify(plans));
  await setSetting('chat_plans_config', plans); 

  return success(res, { plans }, 'Plans updated');
};

exports.adminToggleFreeCreate = async (req, res) => {
  if (!['admin', 'support'].includes(req.user?.role)) {
    return error(res, 'Unauthorized', 403);
  }

  const current = await getSettingBool('allow_free_room_create', false);
  const { setSetting } = require('../services/settings.service');
  await setSetting('allow_free_room_create', String(!current));

  return success(res, {
    allowFreeCreate: !current,
  }, `Free room creation ${!current ? 'enabled ✅' : 'disabled ❌'}`);
};

exports.getPublicBadWords = async (req, res) => {
  try {
    const list = getList();
    return success(res, { list });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

/* ══ ADMIN REPORTS MANAGEMENT ═══════════════════════════════════════ */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, roomId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { PostReport } = require('../models');
    
    const where = {};
    if (status === 'pending') where.resolved = false;
    if (status === 'resolved') where.resolved = true;
    if (roomId) where.roomId = roomId;
    
    const { count, rows } = await PostReport.findAndCountAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'fullName', 'avatarUrl'] },
        { model: ChatRoom, as: 'room', attributes: ['id', 'name', 'nameAr', 'createdBy', 'isActive', 'planKey', 'memberCount', 'capacity', 'maxStages', 'createdAt'] }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });
    
    return success(res, {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get reports error:', err);
    return error(res, err.message, 500);
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await ChatRoom.findOne({
      where: { id: req.params.id }
    });
    
    if (!room) return error(res, 'Room not found', 404);
    
    const roomJson = room.toJSON();
    let hostName = 'Host';
    let hostAvatar = null;
    
    if (roomJson.createdBy) {
      try {
        const host = await User.findByPk(roomJson.createdBy, {
          attributes: ['fullName', 'avatarUrl']
        });
        if (host) {
          hostName = host.fullName;
          hostAvatar = host.avatarUrl;
        }
      } catch (err) {
        console.error('Error fetching host:', err);
      }
    }
    
    return success(res, {
      ...roomJson,
      hostName,
      hostAvatar
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved } = req.body;
    const { PostReport } = require('../models');
    
    const report = await PostReport.findByPk(id);
    if (!report) return error(res, 'Report not found', 404);
    
    await report.update({ resolved: resolved === true || resolved === 'true' });
    
    return success(res, null, resolved ? 'Report resolved' : 'Report reopened');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { PostReport } = require('../models');
    
    const report = await PostReport.findByPk(id);
    if (!report) return error(res, 'Report not found', 404);
    
    await report.destroy();
    
    return success(res, null, 'Report deleted');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

exports.kickUserFromRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    
    const room = await ChatRoom.findByPk(roomId);
    if (!room) return error(res, 'Room not found', 404);
    
    const io = req.app.get('io');
    if (io) {
      io.to(roomId).emit('mod:you_are_kicked', { userId });
    }
    
    return success(res, null, 'User kicked from room');
  } catch (err) {
    return error(res, err.message, 500);
  }
};