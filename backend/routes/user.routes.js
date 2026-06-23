'use strict';

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl     = require('../controllers/user.controller');

const imgUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);
    cb(ok ? null : new Error('صور JPEG/PNG/WebP فقط'), ok);
  },
});

router.get('/me',       protect, ctrl.getMe);
// router.get('/:id', protect, ctrl.getUserById);
router.get('/me/stats', protect, ctrl.getMyStats);
router.get('/me/notifications', protect, ctrl.getNotifications);
router.get('/presets/avatars',  protect, ctrl.getPresetAvatars);

router.patch('/me',
  protect,
  [
    body('fullName').optional().trim().isLength({ min: 2, max: 100 }),
    body('phone').optional().trim().isLength({ max: 50 }),
    body('headline').optional().trim().isLength({ max: 255 }),
    body('bio').optional().trim().isLength({ max: 2000 }),
    body('locationCountry').optional().trim().isLength({ max: 100 }),
    body('locationCity').optional().trim().isLength({ max: 100 }),
    body('linkedinUrl').optional().trim().isURL(),
    body('portfolioUrl').optional().trim().isURL(),
    body('preferredLanguage').optional().isIn(['ar', 'en']),
    body('desiredJobTitle').optional().trim().isLength({ max: 255 }),
    body('desiredSalaryMin').optional().isFloat({ min: 0 }),
    body('desiredSalaryMax').optional().isFloat({ min: 0 }),
    body('openToWork').optional().isBoolean(),
    body('discoverable').optional().isBoolean(),
  ],
  validate,
  ctrl.updateMe
);

router.patch('/me/password',
  protect,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  ],
  validate,
  ctrl.changePassword
);

router.post('/me/avatar',
  protect,
  imgUpload.single('avatar'),
  ctrl.uploadAvatar
);

// router.patch('/me/avatar/preset',
//   protect,
//   [body('presetId').notEmpty().isString()],
//   validate,
//   ctrl.setPresetAvatar
// );

router.patch('/me/avatar/preset',
  protect,
  [body('avatarUrl').notEmpty().isURL()],
  validate,
  ctrl.setPresetAvatar
);

router.delete('/me', protect, ctrl.deleteMe);
router.get('/:id', protect, ctrl.getUserById);

module.exports = router;
