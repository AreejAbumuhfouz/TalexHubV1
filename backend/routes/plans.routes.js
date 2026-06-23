'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/pricing.controller');

router.get('/',    ctrl.getPlans);
router.get('/geo', ctrl.getGeo);

module.exports = router;