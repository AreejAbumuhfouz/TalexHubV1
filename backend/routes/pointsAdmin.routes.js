'use strict';
// backend/routes/pointsAdmin.routes.js

const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/pointsAdmin.controller');

router.use(protect, authorize('admin', 'super_admin'));

router.get('/config',                        ctrl.getConfig);
router.put('/config',                        ctrl.updateConfig);
router.get('/summary',                       ctrl.getSummary);
router.get('/users',                         ctrl.getUsersPoints);
router.post('/adjust/:userId',               ctrl.adjustUser);
router.post('/bulk-adjust',                  ctrl.bulkAdjust);
router.get('/transactions/:userId',          ctrl.getUserTransactions);

module.exports = router;
