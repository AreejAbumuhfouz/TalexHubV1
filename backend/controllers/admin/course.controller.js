'use strict';

const { Op } = require('sequelize');
const multer = require('multer');
const { v4: uuid } = require('uuid');
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3, BUCKET } = require('../../config/storage');
const { Course, CourseCategory, CourseLesson, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
  fileFilter: (_, f, cb) => f.mimetype === 'application/pdf' ? cb(null, true) : cb(new Error('PDF only')),
});

const uploadToR2 = async (buffer, name) => {
  const key = `courses/${uuid()}_${name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200)}`;
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: 'application/pdf' }));
  await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
  return key;
};

const deleteFromR2 = async (key) => {
  if (!key) return;
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key })).catch(() => {});
};

const presignedUrl = async (key) => {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn: 3600 });
};

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Course', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

const v = {
  str(val, max = 200) { if (!val?.trim()) throw new Error('Required'); return val.trim().slice(0, max); },
  opt(val, max = 500) { if (!val?.trim()) return null; return val.trim().slice(0, max); },
  bool(val) { if (val === undefined) return false; return val === true || val === 'true' || val === '1'; },
  num(val, min = 0, max = 9999) { if (!val) return 0; const n = Number(val); if (isNaN(n) || n < min || n > max) throw new Error('Invalid number'); return n; },
  status(val) { const a = ['draft','published','archived']; if (!a.includes(val)) throw new Error('Invalid status'); return val; },
  level(val) { const a = ['beginner','intermediate','advanced','expert','all_levels']; if (!a.includes(val)) throw new Error('Invalid level'); return val; },
  lang(val) { const a = ['ar','en','both']; if (!a.includes(val)) throw new Error('Invalid language'); return val; },
  arr(val, max = 30) { if (!val) return []; const arr = Array.isArray(val) ? val : (typeof val === 'string' ? JSON.parse(val) : []); return arr.slice(0, max).map(i => String(i).slice(0, 100)); },
};

// GET STATS
exports.getStats = async (req, res) => {
  try {
    const [total, published, draft, archived, enrollments, downloads, free, paid] = await Promise.all([
      Course.count(), Course.count({ where: { status: 'published' } }), Course.count({ where: { status: 'draft' } }),
      Course.count({ where: { status: 'archived' } }), Course.sum('enrolledCount'), Course.sum('downloadCount'),
      Course.count({ where: { isFree: true } }), Course.count({ where: { isFree: false } }),
    ]);
    return success(res, { totalCourses: total, publishedCourses: published, draftCourses: draft, archivedCourses: archived, totalEnrollments: enrollments || 0, totalDownloads: downloads || 0, freeCourses: free, paidCourses: paid });
  } catch (err) { return error(res, err.message, 500); }
};

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const { status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (search) where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }, { titleAr: { [Op.iLike]: `%${search}%` } }];

    const { count, rows } = await Course.findAndCountAll({
      where, include: [{ model: CourseCategory, as: 'category', attributes: ['id','name'], required: false }],
      order: [['created_at', 'DESC']], limit, offset,
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
};

// GET ONE
exports.getOne = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: CourseCategory, as: 'category', attributes: ['id','name'], required: false },
        { model: CourseLesson, as: 'lessons', attributes: ['id','title','sortOrder'], required: false },
      ],
    });
    if (!course) return error(res, 'Course not found', 404);
    let dl = null;
    if (course.pdfKey) { try { dl = await presignedUrl(course.pdfKey); } catch {} }
    return success(res, { ...course.toJSON(), downloadUrl: dl });
  } catch (err) { return error(res, err.message, 500); }
};

// CREATE
exports.create = (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err) return error(res, err.message, 400);
    try {
      const { title, titleAr, description, descriptionAr, categoryId, price, isFree, isFreeDownload, level, language, status, tags, skillsCovered } = req.body;
      const safeTitle = v.str(title);
      const safeTitleAr = v.opt(titleAr, 200);
      const safeDesc = v.str(description, 10000);
      const safeDescAr = v.opt(descriptionAr, 10000);
      const safeIsFree = v.bool(isFree);
      const safeFreeDL = v.bool(isFreeDownload);
      const safePrice = safeIsFree ? 0 : v.num(price);
      const safeLevel = level ? v.level(level) : 'beginner';
      const safeLang = language ? v.lang(language) : 'ar';
      const safeStatus = status ? v.status(status) : 'draft';
      const safeTags = v.arr(tags, 20);
      const safeSkills = v.arr(skillsCovered, 30);
      if (!req.file) return error(res, 'PDF required', 400);

      const pdfKey = await uploadToR2(req.file.buffer, req.file.originalname);
      const course = await Course.create({
        title: safeTitle, titleAr: safeTitleAr, description: safeDesc, descriptionAr: safeDescAr,
        categoryId: categoryId || null, price: safePrice, isFree: safeIsFree, isFreeDownload: safeFreeDL,
        level: safeLevel, language: safeLang, status: safeStatus, pdfKey, pdfSize: req.file.size,
        pdfName: req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_'), tags: safeTags, skillsCovered: safeSkills,
        createdBy: req.user.id,
      });
      await audit(req.user.id, 'course.create', course.id, null, { title: safeTitle });
      return success(res, { course: { id: course.id, title: course.title, status: course.status } }, 'Course created', 201);
    } catch (e) { return error(res, e.message, 400); }
  });
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    const old = { title: course.title, status: course.status };
    const u = {};
    if (req.body.title !== undefined) u.title = v.str(req.body.title);
    if (req.body.titleAr !== undefined) u.titleAr = v.opt(req.body.titleAr, 200);
    if (req.body.description !== undefined) u.description = v.str(req.body.description, 10000);
    if (req.body.descriptionAr !== undefined) u.descriptionAr = v.opt(req.body.descriptionAr, 10000);
    if (req.body.categoryId !== undefined) u.categoryId = req.body.categoryId || null;
    if (req.body.isFree !== undefined) { u.isFree = v.bool(req.body.isFree); if (u.isFree) u.price = 0; }
    if (req.body.isFreeDownload !== undefined) u.isFreeDownload = v.bool(req.body.isFreeDownload);
    if (req.body.price !== undefined && !u.isFree && !(req.body.isFree === undefined && course.isFree)) u.price = v.num(req.body.price);
    if (req.body.level !== undefined) u.level = v.level(req.body.level);
    if (req.body.language !== undefined) u.language = v.lang(req.body.language);
    if (req.body.tags !== undefined) u.tags = v.arr(req.body.tags, 20);
    if (req.body.skillsCovered !== undefined) u.skillsCovered = v.arr(req.body.skillsCovered, 30);
    if (!Object.keys(u).length) return error(res, 'No fields', 400);
    await course.update(u);
    await audit(req.user.id, 'course.update', course.id, old, u);
    return success(res, { course: { id: course.id, ...u } }, 'Course updated');
  } catch (e) { return error(res, e.message, 400); }
};

// REPLACE PDF
exports.replacePdf = (req, res) => {
  upload.single('pdf')(req, res, async (err) => {
    if (err) return error(res, err.message, 400);
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) return error(res, 'Course not found', 404);
      if (!req.file) return error(res, 'PDF required', 400);

      const newKey = await uploadToR2(req.file.buffer, req.file.originalname);
      const oldKey = course.pdfKey;
      await course.update({ pdfKey: newKey, pdfSize: req.file.size, pdfName: req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_') });
      await deleteFromR2(oldKey);
      await audit(req.user.id, 'course.pdf_replace', course.id, { pdfKey: oldKey }, { pdfKey: newKey });
      return success(res, {}, 'PDF replaced');
    } catch (e) { return error(res, e.message, 400); }
  });
};

// UPDATE STATUS
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const safeStatus = v.status(status);
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    if (safeStatus === 'published' && !course.pdfKey) return error(res, 'Cannot publish without PDF', 400);
    const old = course.status;
    await course.update({ status: safeStatus });
    await audit(req.user.id, 'course.status_update', course.id, { status: old }, { status: safeStatus });
    return success(res, { id: course.id, status: safeStatus }, 'Status updated');
  } catch (e) { return error(res, e.message, 400); }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return error(res, 'Course not found', 404);
    const key = course.pdfKey;
    await course.destroy();
    await deleteFromR2(key);
    await audit(req.user.id, 'course.delete', course.id, { title: course.title }, null);
    return success(res, {}, 'Course deleted');
  } catch (e) { return error(res, e.message, 500); }
};

// DOWNLOAD
exports.downloadPdf = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course?.pdfKey) return error(res, 'No PDF', 404);
    const url = await presignedUrl(course.pdfKey);
    await course.increment('downloadCount');
    await audit(req.user.id, 'course.download', course.id, null, { filename: course.pdfName });
    return success(res, { url, filename: course.pdfName, expiresIn: 3600 });
  } catch (e) { return error(res, e.message, 500); }
};