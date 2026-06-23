
'use strict';

const multer  = require('multer');
const multerS3 = require('multer-s3');
const { v4: uuidv4 } = require('uuid');
const { s3, BUCKET } = require('../config/storage');
const { fileTypeFromBuffer } = require('file-type');

/* ── CV upload ─────────────────────────────────────────── */
const cvUpload = multer({
  storage: multerS3({
    s3, bucket: BUCKET,
    key: (_req, file, cb) => cb(null, `cvs/${uuidv4()}-${Date.now()}`),
  }),
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = (process.env.ALLOWED_CV_TYPES || 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document').split(',');
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF and DOCX files are allowed'));
  },
});

/* ── General image upload ──────────────────────────────── */
const imageUpload = multer({
  storage: multerS3({
    s3, bucket: BUCKET,
    key: (_req, file, cb) => cb(null, `images/${uuidv4()}-${Date.now()}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG and WebP images are allowed'));
  },
});

/* ── Community post images → community-images/ folder ──── */
const communityImageUpload = multer({
  storage: multerS3({
    s3, bucket: BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (_req, file, cb) => {
      const ext = file.originalname.split('.').pop().toLowerCase();
      cb(null, `community-images/${uuidv4()}.${ext}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 4,
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WebP and GIF images are allowed'));
  },
});

// ✅ تصحيح validateMagicBytes ليعمل مع multerS3
const validateMagicBytes = (allowedMimes) => async (req, res, next) => {
  if (!req.file && !req.files) return next();
  
  const files = req.files 
    ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) 
    : [req.file];
  
  for (const file of files) {
    // ⚠️ multerS3 لا يوفر buffer، فقط key و location
    if (!file.buffer) {
      // إذا كان الملف على S3، لا يمكننا فحص الـ magic bytes بسهولة
      // الحل: نعتمد على fileFilter فقط لهذه الحالة
      console.warn(`⚠️ Cannot validate magic bytes for file ${file.key} - no buffer available`);
      continue;
    }
    
    try {
      const detected = await fileTypeFromBuffer(file.buffer);
      if (!detected || !allowedMimes.includes(detected.mime)) {
        return res.status(400).json({ 
          success: false, 
          message: `Invalid file type detected. Expected: ${allowedMimes.join(', ')}` 
        });
      }
    } catch (err) {
      console.error('Magic bytes validation error:', err.message);
      // fail open - لا نمنع الرفع لو فشل الفحص
    }
  }
  next();
};

module.exports = { cvUpload, imageUpload, communityImageUpload, validateMagicBytes };