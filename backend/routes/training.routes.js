

'use strict';
const express = require('express');
const router  = express.Router();
const { protect,authorize } = require('../middleware/auth');
const trainingController = require('../controllers/training.controller');

router.post('/generate',          protect, trainingController.generate);
router.post('/score',             protect, trainingController.scoreAnswer);
router.post('/sessions',          protect, trainingController.saveSession);
router.get('/sessions',           protect, trainingController.getSessions);
// أضيفي قبل module.exports:
router.get('/limits',               protect, trainingController.checkLimits);
router.post('/end-session',         protect, trainingController.endSession);

// Admin routes (في admin.routes.js):
router.get('/interview-limits',     protect, authorize('admin', 'support'), trainingController.getLimits);
router.put('/interview-limits',     protect, authorize('admin', 'support'), trainingController.updateLimits);
// أضف هذا السطر مع باقي الـ routes
router.post('/deduct-points', protect, trainingController.deductPoints);
module.exports = router;