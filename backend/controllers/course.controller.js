'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/course.controller.js — النسخة النهائية
// ════════════════════════════════════════════════════════════

const {
  GetObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl }  = require('@aws-sdk/s3-request-presigner');
const { s3, BUCKET }    = require('../config/storage');
const { Course, CourseCategory, UserCourse } = require('../models');
const { success, error, paginate } = require('../utils/apiResponse');
const { Op } = require('sequelize');

// ── presigned download URL (1 hour) ──────────────────────
const presignedUrl = async (key) => {
  const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn: 3600 });
};

// ════════════════════════════════════════════════════════════
// GET /courses   — قائمة الكورسات المنشورة
// ════════════════════════════════════════════════════════════
exports.getCourses = async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      level, language, categoryId,
      free, search, sortBy,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = { status: 'published' };

    if (level)      where.level      = level;
    if (language)   where.language   = language;
    if (categoryId) where.categoryId = categoryId;
    if (free === 'true') where.isFree = true;
    if (search) {
      where[Op.or] = [
        { title:       { [Op.iLike]: `%${search}%` } },
        { titleAr:     { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const orderMap = {
      popular: [['downloadCount', 'DESC']],
      rating:  [['ratingAvg',     'DESC']],
      newest:  [['created_at',     'DESC']],
    };
    const order = orderMap[sortBy] || [['downloadCount', 'DESC']];

    const { count, rows } = await Course.findAndCountAll({
      where,
      attributes: [
        'id', 'title', 'titleAr', 'description', 'descriptionAr',
        'thumbnailUrl', 'level', 'language', 'price', 'isFree',
        'isFreeDownload', 'pdfName', 'pdfSize',
        'downloadCount', 'enrolledCount', 'ratingAvg', 'ratingCount',
        'tags', 'skillsCovered', 'slug', 'created_at',
        // لا نُرسل pdfKey للمستخدم أبداً
      ],
      include: [{
        model: CourseCategory, as: 'category',
        attributes: ['id', 'name', 'nameAr'],
        required: false,
      }],
      order,
      limit:  parseInt(limit),
      offset,
    });

    return paginate(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /courses/categories
// ════════════════════════════════════════════════════════════
exports.getCategories = async (_req, res) => {
  try {
    const cats = await CourseCategory.findAll({ order: [['name', 'ASC']] });
    return success(res, cats);
  } catch {
    return success(res, []);
  }
};

// ════════════════════════════════════════════════════════════
// GET /courses/my   — كورساتي (المسجّل فيها)
// ════════════════════════════════════════════════════════════
exports.getMyCourses = async (req, res) => {
  try {
    const rows = await UserCourse.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Course, as: 'course',
        attributes: [
          'id', 'title', 'titleAr', 'description',
          'thumbnailUrl', 'level', 'language',
          'isFree', 'isFreeDownload', 'price',
          'pdfName', 'pdfSize', 'downloadCount', 'slug',
        ],
        where: { status: 'published' },
        required: true,
      }],
      order: [['enrolledAt', 'DESC']],
    });
    return success(res, rows);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /courses/:id
// ════════════════════════════════════════════════════════════
exports.getCourse = async (req, res) => {
  try {
    const isUUID = /^[0-9a-f-]{36}$/i.test(req.params.id);
    const where  = isUUID
      ? { id: req.params.id, status: 'published' }
      : { slug: req.params.id, status: 'published' };

    const course = await Course.findOne({
      where,
      attributes: { exclude: ['pdfKey'] },   // لا نُرسل المفتاح للمستخدم
      include: [{
        model: CourseCategory, as: 'category',
        attributes: ['id', 'name', 'nameAr'],
        required: false,
      }],
    });

    if (!course) return error(res, 'الكورس غير موجود', 404);
    return success(res, course);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// POST /courses/:id/enroll   — التسجيل
// ════════════════════════════════════════════════════════════
exports.enrollCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id, status: 'published' },
    });
    if (!course) return error(res, 'الكورس غير موجود', 404);

    // كورس مدفوع — يتطلب paymentRef
    if (!course.isFree && parseFloat(course.price) > 0) {
      const { paymentRef } = req.body;
      if (!paymentRef) return error(res, 'هذا الكورس مدفوع', 402, {
        code: 'PAYMENT_REQUIRED',
        price: course.price,
        currency: course.currency,
      });
    }

    // مسجّل مسبقاً؟
    const existing = await UserCourse.findOne({
      where: { userId: req.user.id, courseId: course.id },
    });
    if (existing) return success(res, existing, 'أنت مسجّل بالفعل');

    const enrollment = await UserCourse.create({
      userId:   req.user.id,
      courseId: course.id,
    });
    await course.increment('enrolledCount');

    return success(res, enrollment, 'تم التسجيل بنجاح', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /courses/:id/download
// يُرجع presigned URL من R2 صالح ساعة
//
// منطق الوصول:
//  isFreeDownload = true  → أي شخص يحمّل (حتى بدون تسجيل)
//  isFreeDownload = false → لازم يكون مسجّل في الكورس
// ════════════════════════════════════════════════════════════
exports.downloadCourse = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id, status: 'published' },
    });
    if (!course)        return error(res, 'الكورس غير موجود', 404);
    if (!course.pdfKey) return error(res, 'الملف غير متاح حالياً', 404);

    // فحص الصلاحية
    if (!course.isFreeDownload) {
      if (!req.user) return error(res, 'يجب تسجيل الدخول أولاً', 401);

      const enrolled = await UserCourse.findOne({
        where: { userId: req.user.id, courseId: course.id },
      });
      if (!enrolled) return error(res, 'يجب التسجيل في الكورس أولاً', 403, {
        code: 'NOT_ENROLLED',
      });
    }

    // أنشئ presigned URL (صالح ساعة)
    const url = await presignedUrl(course.pdfKey);

    // زيادة عداد التحميل
    await course.increment('downloadCount');

    return success(res, {
      url,
      filename:  course.pdfName || `${course.title}.pdf`,
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    });
  } catch (err) {
    return error(res, err.message, 500);
  }
};
