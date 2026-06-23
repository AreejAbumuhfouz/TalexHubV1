// 'use strict';
// // backend/routes/tokenUsage.routes.js

// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const {
//   getTokenUsageSummary,
//   getPlatformMetrics,
//   getRecentUsage,
//   simulateUsage,
// } = require('../controllers/tokenUsage.controller');

// // User routes
// router.get('/summary', protect, getTokenUsageSummary);
// router.get('/recent', protect, getRecentUsage);

// // Admin routes
// router.get('/platform-metrics', protect, getPlatformMetrics);
// router.post('/simulate', protect, simulateUsage);

// module.exports = router;