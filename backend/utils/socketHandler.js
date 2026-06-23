

'use strict';

const jwt    = require('jsonwebtoken');
const logger = require('./logger');
const { ChatMessage, User, ChatRoom } = require('../models');
const { containsBadWords } = require('../services/badWordsFilter');

const rooms = new Map();

const getRoomState = (roomId) => {
  const r = rooms.get(roomId);
  if (!r) return null;
  return {
    hostSocketId: r.hostSocketId,
    hostUserId:   r.hostUserId,
    coHosts:      [...r.coHosts],
    stage:        [...r.stage],
    members:      Object.fromEntries(r.members),
    memberCount:  r.members.size,
  };
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const isHost   = (r, socketId) => r?.hostSocketId === socketId;
const isCoHost = (r, socketId) => r?.coHosts.has(socketId);
const canControl = (r, socketId) => isHost(r, socketId) || isCoHost(r, socketId);

/* ══════════════════════════════════════════════════════════
   CLEANUP EXPIRED ROOMS — كل 5 دقائق
══════════════════════════════════════════════════════════ */
const cleanupExpiredRooms = async () => {
  try {
    const { Op } = require('sequelize');
    const result = await ChatRoom.update(
      { isActive: false, closedAt: new Date(), status: 'expired' },
      { where: { isActive: true, expiresAt: { [Op.lt]: new Date() } } }
    );
    if (result[0] > 0) {
      logger.info(`✅ Auto-closed ${result[0]} expired rooms`);
    }
  } catch (err) {
    logger.error('Cleanup expired rooms error:', err.message);
  }
};

/* ══════════════════════════════════════════════════════════
   SOCKET HANDLER
══════════════════════════════════════════════════════════ */
const socketHandler = (io) => {

  // ✅ تشغيل تنظيف الغرف المنتهية كل 5 دقائق
  setInterval(cleanupExpiredRooms, 5 * 60 * 1000);

  /* ── Auth middleware ─────────────────────────────────── */
  io.use(async (socket, next) => {
    let token = socket.handshake.auth?.token;
    if (!token) {
      const cookie = socket.handshake.headers?.cookie || '';
      const m = cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
      if (m) token = decodeURIComponent(m[1]);
    }
    if (!token) {
      socket.userId = null; socket.planKey = 'free';
      return next();
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId   = decoded.id;
      socket.userRole = decoded.role;
      socket.planKey  = decoded.planKey || 'free';
      const user = await User.findByPk(decoded.id, { attributes: ['id', 'fullName', 'avatarUrl'] });
      socket.fullName  = user?.fullName  || 'User';
      socket.avatarUrl = user?.avatarUrl || null;
      next();
    } catch { next(new Error('Invalid token')); }
  });

  io.on('connection', (socket) => {
    if (socket.userId) socket.join(`user:${socket.userId}`);

    /* ════════════════════════════════════════════════════
       JOIN ROOM
    ════════════════════════════════════════════════════ */
    socket.on('chat:join', async ({ roomId }) => {
      if (!socket.userId) return socket.emit('error', { message: 'Not authenticated' });

      // Check suspension
      const existingRoom = rooms.get(roomId);
      if (existingRoom?.suspended?.has(socket.userId)) {
        return socket.emit('chat:suspended', {
          message: 'You are suspended from this room. Contact admin.',
        });
      }

      // Fetch room from DB
      let dbRoom;
      try {
        dbRoom = await ChatRoom.findOne({ where: { id: roomId, isActive: true } });
        if (!dbRoom) return socket.emit('error', { message: 'Room not found' });
      } catch (e) {
        return socket.emit('error', { message: 'Connection error' });
      }

      socket.join(`room:${roomId}`);

      // ✅ Init room state if not exists
      if (!rooms.has(roomId)) {
        // ✅ إلغاء أي Timer قديم
        const oldRoom = rooms.get(roomId);
        if (oldRoom?.closeTimer) clearTimeout(oldRoom.closeTimer);

        rooms.set(roomId, {
          hostSocketId: socket.id,
          hostUserId:   socket.userId,
          dbHostUserId: dbRoom.createdBy,
          coHosts:   new Set(),
          stage:     new Set(),
          members:   new Map(),
          suspended: new Set(),
          closeTimer: null,
        });
      }

      const room = rooms.get(roomId);

      // ✅ منشئ الغرفة الحقيقي = Host
      if (socket.userId === room.dbHostUserId) {
        room.hostSocketId = socket.id;
        room.hostUserId   = socket.userId;
      }

      // Add to members
      room.members.set(socket.id, {
        socketId:  socket.id,
        userId:    socket.userId,
        fullName:  socket.fullName,
        avatarUrl: socket.avatarUrl,
        planKey:   socket.planKey,
        onStage:   false,
        muted:     false,
      });

      // ✅ Host على المنصة تلقائياً
      if (socket.id === room.hostSocketId) {
        room.stage.add(socket.id);
        room.members.get(socket.id).onStage = true;
        socket.emit('stage:you_are_on', { roomId, autoMic: true });
      }

      // ✅ إلغاء close timer لما حد يدخل
      if (room.closeTimer) {
        clearTimeout(room.closeTimer);
        room.closeTimer = null;
      }

      // Load history
      try {
        const msgs = await ChatMessage.findAll({
          where: { roomId, isDeleted: false },
          include: [{ model: User, as: 'sender', attributes: ['id', 'fullName', 'avatarUrl'] }],
          order: [['created_at', 'DESC']], limit: 50,
        });
        socket.emit('chat:history', msgs.reverse().map(m => m.toJSON()));
      } catch (e) { logger.error('history error:', e.message); }

      socket.emit('room:state', getRoomState(roomId));

      socket.to(`room:${roomId}`).emit('room:user_joined', {
        socketId: socket.id, userId: socket.userId,
        fullName: socket.fullName, avatarUrl: socket.avatarUrl,
      });

      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
      logger.info(`${socket.fullName} joined room ${roomId}`);
    });

    /* ════════════════════════════════════════════════════
       LEAVE ROOM
    ════════════════════════════════════════════════════ */
    socket.on('chat:leave', ({ roomId }) => _leave(socket, roomId, io));

    /* ════════════════════════════════════════════════════
       MESSAGES
    ════════════════════════════════════════════════════ */
    socket.on('chat:message', async ({ roomId, content, tempId }) => {
      if (!socket.userId || !content?.trim()) return;

      if (containsBadWords(content)) {
        socket.emit('chat:message_blocked', {
          tempId,
          message: 'Message blocked: contains inappropriate language',
        });
        return;
      }

      try {
        const msg = await ChatMessage.create({
          roomId, senderId: socket.userId, content: content.trim(),
        });
        const full = await ChatMessage.findByPk(msg.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'fullName', 'avatarUrl'] }],
        });
        io.to(`room:${roomId}`).emit('chat:new_message', { ...full.toJSON(), tempId });
      } catch { socket.emit('chat:message_error', { tempId }); }
    });

    socket.on('chat:typing',      ({ roomId }) => socket.to(`room:${roomId}`).emit('chat:typing',      { socketId: socket.id }));
    socket.on('chat:stop_typing', ({ roomId }) => socket.to(`room:${roomId}`).emit('chat:stop_typing', { socketId: socket.id }));

    /* ════════════════════════════════════════════════════
       STAGE
    ════════════════════════════════════════════════════ */
    socket.on('stage:request', ({ roomId }) => {
      if (!socket.userId) return;
      socket.to(`room:${roomId}`).emit('stage:hand_raised', {
        socketId: socket.id, userId: socket.userId, fullName: socket.fullName,
      });
    });

    socket.on('stage:accept', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !canControl(r, socket.id)) return;
      r.stage.add(targetSocketId);
      const m = r.members.get(targetSocketId);
      if (m) m.onStage = true;
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
      io.to(targetSocketId).emit('stage:you_are_on', { roomId, autoMic: false });
    });

    socket.on('stage:remove', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !canControl(r, socket.id)) return;
      if (targetSocketId === r.hostSocketId) return;
      r.stage.delete(targetSocketId);
      const m = r.members.get(targetSocketId);
      if (m) { m.onStage = false; m.muted = false; }
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
      io.to(targetSocketId).emit('stage:you_are_removed', { roomId });
    });

    socket.on('stage:leave_stage', ({ roomId }) => {
      const r = rooms.get(roomId);
      if (!r) return;
      if (socket.id === r.hostSocketId) return;
      r.stage.delete(socket.id);
      const m = r.members.get(socket.id);
      if (m) { m.onStage = false; m.muted = false; }
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
      socket.emit('stage:you_left_stage', { roomId });
    });

    /* ════════════════════════════════════════════════════
       MUTE
    ════════════════════════════════════════════════════ */
    socket.on('stage:mute', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !canControl(r, socket.id)) return;
      if (targetSocketId === r.hostSocketId) return;
      const m = r.members.get(targetSocketId);
      if (m) m.muted = true;
      io.to(targetSocketId).emit('stage:you_are_muted', { roomId });
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    socket.on('stage:unmute', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !canControl(r, socket.id)) return;
      const m = r.members.get(targetSocketId);
      if (m) m.muted = false;
      io.to(targetSocketId).emit('stage:you_are_unmuted', { roomId });
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    socket.on('stage:self_mute', ({ roomId }) => {
      const r = rooms.get(roomId);
      if (!r) return;
      const m = r.members.get(socket.id);
      if (m) m.muted = true;
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    socket.on('stage:self_unmute', ({ roomId }) => {
      const r = rooms.get(roomId);
      if (!r) return;
      const m = r.members.get(socket.id);
      if (m) m.selfMuted = false;
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    /* ════════════════════════════════════════════════════
       CO-HOST
    ════════════════════════════════════════════════════ */
    socket.on('cohost:add', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !isHost(r, socket.id)) return;
      r.coHosts.add(targetSocketId);
      io.to(targetSocketId).emit('cohost:you_are_cohost', { roomId });
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    socket.on('cohost:remove', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !isHost(r, socket.id)) return;
      r.coHosts.delete(targetSocketId);
      io.to(targetSocketId).emit('cohost:you_are_removed', { roomId });
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    /* ════════════════════════════════════════════════════
       KICK
    ════════════════════════════════════════════════════ */
    socket.on('mod:kick', ({ roomId, targetSocketId }) => {
      const r = rooms.get(roomId);
      if (!r || !canControl(r, socket.id)) return;
      if (targetSocketId === r.hostSocketId) return;
      io.to(targetSocketId).emit('mod:you_are_kicked', { roomId });
      r.stage.delete(targetSocketId);
      r.coHosts.delete(targetSocketId);
      r.members.delete(targetSocketId);
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) targetSocket.leave(`room:${roomId}`);
      io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
    });

    /* ════════════════════════════════════════════════════
       CLOSE ROOM — Host فقط
    ════════════════════════════════════════════════════ */
    socket.on('room:close', ({ roomId }) => {
      const r = rooms.get(roomId);
      if (!r || !isHost(r, socket.id)) return;

      // ✅ إلغاء أي timer
      if (r.closeTimer) clearTimeout(r.closeTimer);

      // ✅ إشعار الكل
      io.to(`room:${roomId}`).emit('room:closed', { roomId });

      // ✅ تحديث DB
      ChatRoom.update({ isActive: false, closedAt: new Date() }, { where: { id: roomId } }).catch(() => {});

      // ✅ تنظيف الذاكرة
      rooms.delete(roomId);
      io.socketsLeave(`room:${roomId}`);
      logger.info(`Room ${roomId} closed by host`);
    });

    /* ════════════════════════════════════════════════════
       WebRTC SIGNALING
    ════════════════════════════════════════════════════ */
    socket.on('webrtc:offer',  ({ to, offer, roomId })     => io.to(to).emit('webrtc:offer',  { from: socket.id, offer, roomId }));
    socket.on('webrtc:answer', ({ to, answer, roomId })    => io.to(to).emit('webrtc:answer', { from: socket.id, answer, roomId }));
    socket.on('webrtc:ice',    ({ to, candidate, roomId }) => io.to(to).emit('webrtc:ice',    { from: socket.id, candidate, roomId }));

    /* ════════════════════════════════════════════════════
       COMMUNITY
    ════════════════════════════════════════════════════ */
    socket.on('new_post', (post) => socket.broadcast.emit('community_new_post', post));

    /* ════════════════════════════════════════════════════
       DISCONNECT
    ════════════════════════════════════════════════════ */
    socket.on('disconnect', async () => {
      for (const [roomId] of rooms.entries()) {
        const r = rooms.get(roomId);
        if (r?.members.has(socket.id)) {
          await _leave(socket, roomId, io);
        }
      }
    });
  });

  /* ── _leave helper ──────────────────────────────────── */
  async function _leave(socket, roomId, io) {
    const r = rooms.get(roomId);
    if (!r) return;

    r.stage.delete(socket.id);
    r.coHosts.delete(socket.id);
    r.members.delete(socket.id);
    socket.leave(`room:${roomId}`);

    io.to(`room:${roomId}`).emit('room:user_left', {
      socketId: socket.id, userId: socket.userId,
    });

    // ✅ Host transfer
    if (r.hostSocketId === socket.id) {
      const nextCoHost = [...r.coHosts][0];
      const nextAny    = [...r.members.keys()][0];
      const newHostSid = nextCoHost || nextAny;

      if (newHostSid) {
        r.hostSocketId = newHostSid;
        r.hostUserId   = r.members.get(newHostSid)?.userId;
        r.coHosts.delete(newHostSid);
        r.stage.add(newHostSid);
        const m = r.members.get(newHostSid);
        if (m) m.onStage = true;
        io.to(newHostSid).emit('room:you_are_host', { roomId });
        io.to(newHostSid).emit('stage:you_are_on', { roomId, autoMic: true });
      } else {
        // ✅ الغرفة فاضية — اضبط Timer للإغلاق بعد 5 دقائق
        logger.info(`Room ${roomId} empty — will close in 5 minutes if nobody joins`);
        r.closeTimer = setTimeout(async () => {
          const currentRoom = rooms.get(roomId);
          if (currentRoom && currentRoom.members.size === 0) {
            rooms.delete(roomId);
            await ChatRoom.update({ isActive: false, closedAt: new Date(), status: 'closed' }, { where: { id: roomId } }).catch(() => {});
            logger.info(`Room ${roomId} closed (empty timeout)`);
          }
        }, 5 * 60 * 1000); // 5 دقائق
        return;
      }
    }

    io.to(`room:${roomId}`).emit('room:state', getRoomState(roomId));
  }
};

module.exports = socketHandler;