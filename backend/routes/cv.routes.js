

'use strict';

const express      = require('express');
const router       = express.Router();
const multer       = require('multer');
const { param, body } = require('express-validator');
const validate     = require('../middleware/validate');
const { protect }  = require('../middleware/auth');
const ctrl         = require('../controllers/cv.controller');

// ── Multer: memory storage ─────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('PDF و DOCX فقط مسموح'));
  },
});

// ── Collection ─────────────────────────────────────────────
router.get('/',     protect, ctrl.getMyCVs);
router.get('/limits', protect, ctrl.getLimits); // ✅ قبل /:id

router.post('/upload',
  protect,
  // ✅ أزلنا checkFeature — الـ controller يتحقق من الـ limits بنفسه
  upload.single('cv'),
  ctrl.uploadAndAnalyze
);
router.patch('/template', protect, ctrl.updateTemplate);

router.post('/build',
  protect,
  // ✅ أزلنا checkFeature — الـ controller يتحقق من planConfig.useAI
  [body('section').notEmpty().isString().isLength({ max: 50 })],
  validate,
  ctrl.buildSection
);

router.post('/generate-pdf',
  protect,
  [body('html').notEmpty().isString()],
  validate,
  ctrl.generatePDF
);

router.post('/save',
  protect,
  [body('title').optional().trim().isLength({ max: 255 })],
  validate,
  ctrl.saveCV
);

// ── Single CV ──────────────────────────────────────────────
router.get('/:id',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.getCV
);

router.patch('/:id',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.updateCV
);

router.delete('/:id',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.deleteCV
);

router.get('/:id/download',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.downloadCV
);

router.patch('/:id/primary',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.setPrimary
);

router.post('/:id/re-analyze',
  protect,
  // ✅ أزلنا checkFeature — الـ controller يتحقق من planConfig.useAI والـ limits
  [param('id').isUUID()],
  validate,
  ctrl.reAnalyze
);

router.post('/:id/analyze-free',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.analyzeFree
);

module.exports = router;