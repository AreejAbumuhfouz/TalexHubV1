const express = require('express');
const router = express.Router();
const {
  subscribe,
  unsubscribe,
  getAllSubscribers,
  getSubscriberStats,
  deleteSubscriber,
  exportSubscribers
} = require('../controllers/newsletter.controller');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/subscribe', subscribe);
router.get('/unsubscribe/:email', unsubscribe);

// Admin only routes
router.get('/subscribers', protect, getAllSubscribers);
router.get('/stats', protect, getSubscriberStats);
router.get('/export', protect, exportSubscribers);
router.delete('/subscribers/:id', protect, deleteSubscriber);

module.exports = router;