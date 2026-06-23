'use strict';
// ════════════════════════════════════════════════════════════
// backend/routes/contact.routes.js
//
// في server.js أضف:
//   app.use(`${API}/contact`, require('./routes/contact.routes'));
//
// في models/index.js أضف:
//   const ContactMessage = require('./ContactMessage');
//   ContactMessage.belongsTo(User, { foreignKey: 'userId',    as: 'sender'  });
//   ContactMessage.belongsTo(User, { foreignKey: 'repliedBy', as: 'replier' });
//   وفي module.exports: أضف ContactMessage
// ════════════════════════════════════════════════════════════

const router = require('express').Router();
const ctrl   = require('../controllers/contact.controller');
const { protect, authorize } = require('../middleware/auth');

// ── Public ────────────────────────────────────────────────
// أي شخص (مسجّل أو زائر) يرسل رسالة
// optionalProtect: لو مسجّل يربط الـ userId
router.post('/', ctrl.submit);

// ── Admin only ────────────────────────────────────────────
router.get('/stats',       protect, authorize('admin', 'support'), ctrl.getStats);
router.get('/',            protect, authorize('admin', 'support'), ctrl.getAll);
router.get('/:id',         protect, authorize('admin', 'support'), ctrl.getOne);
router.patch('/:id/reply', protect, authorize('admin', 'support'), ctrl.reply);
router.patch('/:id/status',protect, authorize('admin', 'support'), ctrl.updateStatus);
router.delete('/:id',      protect, authorize('admin', 'support'), ctrl.deleteOne);

module.exports = router;
