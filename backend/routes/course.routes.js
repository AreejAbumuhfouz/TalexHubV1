'use strict';
// ════════════════════════════════════════════════════════════
// backend/routes/course.routes.js — النسخة النهائية
// ════════════════════════════════════════════════════════════
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/course.controller');
const { protect, optionalProtect } = require('../middleware/auth');

router.get('/',             ctrl.getCourses);             // كل الكورسات
router.get('/categories',   ctrl.getCategories);          // الفئات
router.get('/my',           protect, ctrl.getMyCourses);  // كورساتي

// التحميل: optionalProtect لأن isFreeDownload يسمح بدون login
router.get('/:id/download', optionalProtect, ctrl.downloadCourse);

router.post('/:id/enroll',  protect, ctrl.enrollCourse);  // تسجيل
router.get('/:id',          ctrl.getCourse);              // تفاصيل (آخراً)

module.exports = router;
