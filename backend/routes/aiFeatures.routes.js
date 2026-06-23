'use strict';
// backend/routes/aiFeatures.routes.js

const express    = require('express');
const router     = express.Router();
const { protect, authorize } = require('../middleware/auth');const ctrl       = require('../controllers/aiFeatures.controller');

// All routes require admin
router.use(protect, authorize('admin', 'super_admin'));

router.get('/',                   ctrl.getAll);
router.put('/',                   ctrl.updateAll);
router.get('/:feature',           ctrl.getOne);
router.put('/:feature',           ctrl.updateOne);
router.post('/:feature/reset',    ctrl.resetOne);

module.exports = router;
