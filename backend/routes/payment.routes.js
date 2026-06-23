'use strict';
// ════════════════════════════════════════════════════════════
// backend/routes/payment.routes.js
// في server.js أضف:
//   app.use('/api/v1/payments', require('./routes/payment.routes'));
// ════════════════════════════════════════════════════════════

const router = require('express').Router();
const ctrl   = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth');

// ── User routes ───────────────────────────────────────────
router.post('/',          protect, ctrl.submitRequest);    // إرسال طلب + إيصال
router.get('/my',         protect, ctrl.getMyRequests);    // طلباتي

// ── Admin routes ──────────────────────────────────────────
router.get('/',           protect, authorize('admin'), ctrl.getAllRequests);
router.patch('/:id/approve', protect, authorize('admin'), ctrl.approveRequest);
router.patch('/:id/reject',  protect, authorize('admin'), ctrl.rejectRequest);

module.exports = router;
