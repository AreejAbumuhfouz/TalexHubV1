
'use strict';
const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/chat.controller');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (!req.user || !['admin', 'support', 'moderator'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// ── Public settings ─────────────────────────────────────────
router.get('/settings',   protect,                 ctrl.getRoomSettings);

// ── Admin plans management ──────────────────────────────────
router.get('/plans',                       protect, authorize('admin', 'support'), ctrl.getPlansConfig);
router.put('/plans',                       protect, authorize('admin', 'support'), ctrl.updatePlansConfig);
router.post('/admin/toggle-free-create',   protect, authorize('admin', 'support'), ctrl.adminToggleFreeCreate);

// ── Categories ──────────────────────────────────────────────
router.get('/categories',                  ctrl.getCategories);

// ── Rooms ───────────────────────────────────────────────────
router.get('/rooms',                       ctrl.getRooms);
router.get('/rooms/:id',      protect,     ctrl.getRoom);
router.post('/rooms',         protect,     ctrl.createRoom);
router.delete('/rooms/:id',   protect,     ctrl.deleteRoom);

// ── Messages (ephemeral — لا تُحفظ) ─────────────────────────
router.get('/rooms/:id/messages',  protect, ctrl.getMessages);
router.post('/rooms/:id/messages', protect, ctrl.sendMessage);

// ── Reports (الوحيد اللي ينحفظ) ─────────────────────────────
router.post('/rooms/:id/report',   protect, ctrl.reportRoom);

router.get('/bad-words', ctrl.getPublicBadWords);

// ── Admin reports management ────────────────────────────────
router.get('/admin/chat-reports', protect, adminOnly, ctrl.getReports);
router.get('/admin/chat-rooms/:id', protect, adminOnly, ctrl.getRoomById);
router.patch('/admin/chat-reports/:id/resolve', protect, adminOnly, ctrl.resolveReport);
router.delete('/admin/chat-reports/:id', protect, adminOnly, ctrl.deleteReport);
router.post('/admin/chat-rooms/:roomId/kick-user', protect, adminOnly, ctrl.kickUserFromRoom);

module.exports = router;