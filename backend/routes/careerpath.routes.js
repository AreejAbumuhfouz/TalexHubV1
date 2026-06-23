// 'use strict';
// const express = require('express');
// const router  = express.Router();
// const { protect } = require('../middleware/auth');
// const ctrl = require('../controllers/careerpath.controller');

// router.get('/settings',              ctrl.getSettings);
// router.get('/',          protect,    ctrl.getCareerPath);
// router.post('/generate', protect,    ctrl.generatePath);
// router.post('/admin/toggle-free',    protect, ctrl.adminToggleFreeAccess);

// module.exports = router;

// const { protect, authorize } = require('../middleware/auth');
// const ctrl = require('../controllers/careerpath.controller');

// router.get('/settings',         ctrl.getSettings);
// router.get('/limits', protect,  ctrl.checkLimits);  // ✅ ADD THIS
// router.get('/',       protect,  ctrl.getCareerPath);
// router.post('/generate', protect, ctrl.generatePath);
// router.post('/admin/toggle-free', protect, ctrl.adminToggleFreeAccess);
// module.exports = router;

'use strict';
const express        = require('express');
const router         = express.Router();
const { protect, authorize } = require('../middleware/auth');
const ctrl           = require('../controllers/careerpath.controller');

router.get('/settings',              ctrl.getSettings);
router.get('/limits',   protect,     ctrl.checkLimits);       // ✅ user usage + limits
router.get('/',         protect,     ctrl.getCareerPath);
router.post('/generate', protect,    ctrl.generatePath);
router.post('/admin/toggle-free', protect, authorize('admin', 'support'), ctrl.adminToggleFreeAccess);

module.exports = router;