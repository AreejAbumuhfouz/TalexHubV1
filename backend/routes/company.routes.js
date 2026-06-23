// // // 'use strict';
// // // // backend/routes/company.routes.js
// // // // ════════════════════════════════════════════════════════════
// // // // CRITICAL ORDER: /me routes MUST come before /:id
// // // // Otherwise Express matches "me" as UUID → 500 error
// // // // ════════════════════════════════════════════════════════════

// // // const router  = require('express').Router();
// // // const multer  = require('multer');
// // // const ctrl    = require('../controllers/Company/company.controller');
// // // const { protect, authorize } = require('../middleware/auth');

// // // const upload = multer({
// // //   storage: multer.memoryStorage(),
// // //   limits: { fileSize: 5 * 1024 * 1024 },
// // //   fileFilter: (_req, file, cb) => {
// // //     const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
// // //     cb(ok ? null : new Error('صور فقط (JPEG/PNG/WebP)'), ok);
// // //   },
// // // });

// // // // ── Public list ───────────────────────────────────────────
// // // router.get('/', ctrl.listCompanies);

// // // // ════════════════════════════════════════════════════════════
// // // // /me ROUTES — ⚠️ MUST be before /:id
// // // // ════════════════════════════════════════════════════════════
// // // router.get('/me',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.getMyCompany);

// // // router.get('/me/stats',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.getMyStats);

// // // router.get('/me/jobs',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.getMyJobs);

// // // router.get('/me/applicants',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.getMyApplicants);

// // // // ════════════════════════════════════════════════════════════
// // // // /:id ROUTES — after /me
// // // // ════════════════════════════════════════════════════════════
// // // router.get('/:id',    ctrl.getCompany);

// // // router.post('/',      protect, ctrl.createCompany);

// // // router.patch('/:id',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.updateCompany);

// // // router.post('/:id/logo',
// // //   protect, authorize('company', 'admin'),
// // //   upload.single('logo'),
// // //   ctrl.uploadLogo);

// // // router.get('/:id/members',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.getMembers);

// // // router.post('/:id/members',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.inviteMember);

// // // router.delete('/:id/members/:userId',
// // //   protect, authorize('company', 'admin'),
// // //   ctrl.removeMember);

// // // module.exports = router;

// // 'use strict';
// // // backend/routes/company.routes.js
// // // ════════════════════════════════════════════════════════════
// // // CRITICAL ORDER: /me routes MUST come before /:id
// // // Otherwise Express matches "me" as UUID → 500 error
// // // ════════════════════════════════════════════════════════════

// // const router  = require('express').Router();
// // const multer  = require('multer');
// // const ctrl    = require('../controllers/Company/company.controller');
// // const { protect, authorize } = require('../middleware/auth');

// // // multer للصور (logo)
// // const upload = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 5 * 1024 * 1024 },
// //   fileFilter: (_req, file, cb) => {
// //     const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
// //     cb(ok ? null : new Error('صور فقط (JPEG/PNG/WebP)'), ok);
// //   },
// // });

// // // multer للشهادات (PDF + صور — حتى 10MB)
// // const uploadCert = multer({
// //   storage: multer.memoryStorage(),
// //   limits: { fileSize: 10 * 1024 * 1024 },
// //   fileFilter: (_req, file, cb) => {
// //     const ok = ['application/pdf','image/jpeg','image/png','image/webp'].includes(file.mimetype);
// //     cb(ok ? null : new Error('PDF أو صورة فقط'), ok);
// //   },
// // });

// // // ── Public list ───────────────────────────────────────────
// // router.get('/', ctrl.listCompanies);

// // // ════════════════════════════════════════════════════════════
// // // /me ROUTES — ⚠️ MUST be before /:id
// // // ════════════════════════════════════════════════════════════
// // router.get('/me',
// //   protect, authorize('company', 'admin'),
// //   ctrl.getMyCompany);

// // router.get('/me/stats',
// //   protect, authorize('company', 'admin'),
// //   ctrl.getMyStats);

// // router.get('/me/jobs',
// //   protect, authorize('company', 'admin'),
// //   ctrl.getMyJobs);

// // router.get('/me/applicants',
// //   protect, authorize('company', 'admin'),
// //   ctrl.getMyApplicants);

// // // رفع شهادة التسجيل → CompanyCertificates/ في R2
// // router.post('/me/certificate',
// //   protect, authorize('company', 'admin'),
// //   uploadCert.single('certificate'),
// //   ctrl.uploadCertificate);

// // // ════════════════════════════════════════════════════════════
// // // /:id ROUTES — after /me
// // // ════════════════════════════════════════════════════════════
// // router.get('/:id',    ctrl.getCompany);

// // router.post('/',      protect, ctrl.createCompany);

// // router.patch('/:id',
// //   protect, authorize('company', 'admin'),
// //   ctrl.updateCompany);

// // router.post('/:id/logo',
// //   protect, authorize('company', 'admin'),
// //   upload.single('logo'),
// //   ctrl.uploadLogo);

// // router.get('/:id/members',
// //   protect, authorize('company', 'admin'),
// //   ctrl.getMembers);

// // router.post('/:id/members',
// //   protect, authorize('company', 'admin'),
// //   ctrl.inviteMember);

// // router.delete('/:id/members/:userId',
// //   protect, authorize('company', 'admin'),
// //   ctrl.removeMember);

// // module.exports = router;

// 'use strict';
// // backend/routes/company.routes.js
// // ════════════════════════════════════════════════════════════
// // CRITICAL ORDER: /me routes MUST come before /:id
// // Otherwise Express matches "me" as UUID → 500 error
// // ════════════════════════════════════════════════════════════

// const router  = require('express').Router();
// const multer  = require('multer');
// const ctrl    = require('../controllers/Company/company.controller');
// const { protect, authorize } = require('../middleware/auth');

// // multer للصور (logo)
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
//     cb(ok ? null : new Error('صور فقط (JPEG/PNG/WebP)'), ok);
//   },
// });

// // multer للشهادات (PDF + صور — حتى 10MB)
// const uploadCert = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const ok = ['application/pdf','image/jpeg','image/png','image/webp'].includes(file.mimetype);
//     cb(ok ? null : new Error('PDF أو صورة فقط'), ok);
//   },
// });

// // ── Public list ───────────────────────────────────────────
// router.get('/', ctrl.listCompanies);

// // ════════════════════════════════════════════════════════════
// // /me ROUTES — ⚠️ MUST be before /:id
// // ════════════════════════════════════════════════════════════
// router.get('/me',
//   protect, authorize('company', 'admin'),
//   ctrl.getMyCompany);

// router.get('/me/stats',
//   protect, authorize('company', 'admin'),
//   ctrl.getMyStats);

// router.get('/me/jobs',
//   protect, authorize('company', 'admin'),
//   ctrl.getMyJobs);

// router.get('/me/applicants',
//   protect, authorize('company', 'admin'),
//   ctrl.getMyApplicants);

// // رفع شهادة التسجيل → CompanyCertificates/ في R2
// router.post('/me/certificate',
//   protect, authorize('company', 'admin'),
//   uploadCert.single('certificate'),
//   ctrl.uploadCertificate);

// // ════════════════════════════════════════════════════════════
// // /:id ROUTES — after /me
// // ════════════════════════════════════════════════════════════
// router.get('/:id',    ctrl.getCompany);

// router.post('/',      protect, ctrl.createCompany);

// router.patch('/:id',
//   protect, authorize('company', 'admin'),
//   ctrl.updateCompany);

// router.post('/me/logo',
//   protect, authorize('company', 'admin'),
//   upload.single('logo'),
//   ctrl.uploadLogo);

// router.get('/:id/members',
//   protect, authorize('company', 'admin'),
//   ctrl.getMembers);

// router.post('/:id/members',
//   protect, authorize('company', 'admin'),
//   ctrl.inviteMember);

// router.delete('/:id/members/:userId',
//   protect, authorize('company', 'admin'),
//   ctrl.removeMember);

// module.exports = router;

'use strict';
const router = require('express').Router();
const multer = require('multer');
const ctrl = require('../controllers/Company/company.controller');
const { protect, authorize } = require('../middleware/auth');

// multer للصور (logo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
    cb(ok ? null : new Error('صور فقط (JPEG/PNG/WebP)'), ok);
  },
});

// multer للشهادات (PDF + صور — حتى 10MB)
const uploadCert = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['application/pdf','image/jpeg','image/png','image/webp'].includes(file.mimetype);
    cb(ok ? null : new Error('PDF أو صورة فقط'), ok);
  },
});

// ── Public list ───────────────────────────────────────────
router.get('/', ctrl.listCompanies);

// ════════════════════════════════════════════════════════════
// ✅ /me ROUTES — يجب أن تكون أولاً وقبل /:id
// ════════════════════════════════════════════════════════════
router.get('/me', protect, authorize('company', 'admin'), ctrl.getMyCompany);
router.get('/me/stats', protect, authorize('company', 'admin'), ctrl.getMyStats);
router.get('/me/jobs', protect, authorize('company', 'admin'), ctrl.getMyJobs);
router.get('/me/applicants', protect, authorize('company', 'admin'), ctrl.getMyApplicants);

// ✅ رفع الشعار — يجب أن يكون قبل /:id
router.post('/me/logo',
  protect,
  authorize('company', 'admin'),
  upload.single('logo'),
  ctrl.uploadLogo
);

// ✅ رفع شهادة التسجيل — يجب أن يكون قبل /:id
router.post('/me/certificate',
  protect,
  authorize('company', 'admin'),
  uploadCert.single('certificate'),
  ctrl.uploadCertificate
);

// ════════════════════════════════════════════════════════════
// /:id ROUTES — بعد /me
// ════════════════════════════════════════════════════════════
router.get('/:id', ctrl.getCompany);
router.post('/', protect, ctrl.createCompany);
router.patch('/:id', protect, authorize('company', 'admin'), ctrl.updateCompany);
router.get('/:id/members', protect, authorize('company', 'admin'), ctrl.getMembers);
router.post('/:id/members', protect, authorize('company', 'admin'), ctrl.inviteMember);
router.delete('/:id/members/:userId', protect, authorize('company', 'admin'), ctrl.removeMember);

module.exports = router;