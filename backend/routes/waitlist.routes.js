'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/waitlist.controller');
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Tight rate limit for waitlist signups — 5 per IP per hour
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'طلبات كثيرة جداً، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public
router.post('/', waitlistLimiter, ctrl.joinWaitlist);

// Admin only
router.get('/',              protect, authorize('admin'), ctrl.getWaitlist);
router.delete('/:email',     protect, authorize('admin'), ctrl.removeFromWaitlist);

module.exports = router;