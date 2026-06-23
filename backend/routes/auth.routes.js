

'use strict';
const express   = require('express');
const router    = express.Router();
const rateLimit = require('express-rate-limit');
const { body }  = require('express-validator');
const passport  = require('../config/passport');
const validate  = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_AUTH_MAX) || 10,
  message: { success: false, message: 'محاولات كثيرة، حاول بعد 15 دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
});
const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { success: false, message: 'حاول بعد دقيقة' },
});

const registerRules = [
  body('fullName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('role').optional().isIn(['user', 'company']),
];

const loginRules = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('rememberMe').optional().isBoolean(),
];

// ✅ FIX: purpose field added to both validators
const verifyOtpRules = [
  body('userId').notEmpty().isUUID(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('purpose').optional().isIn(['email_verify', 'reset_password']),
];

const resendOtpRules = [
  body('userId').notEmpty().isUUID(),
  body('purpose').optional().isIn(['email_verify', 'reset_password']),
];

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'محاولات تجديد كثيرة، حاول لاحقاً' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register',        authLimiter, registerRules,   validate, ctrl.register);
router.post('/verify-otp',      authLimiter, verifyOtpRules,  validate, ctrl.verifyOtp);
router.post('/resend-otp',      otpLimiter,  resendOtpRules,  validate, ctrl.resendOtp);
router.post('/login',           authLimiter, loginRules,      validate, ctrl.login);
router.post('/refresh',         refreshLimiter, ctrl.refreshToken);
router.post('/logout',          protect, ctrl.logout);
router.post('/forgot-password', authLimiter,
  [body('email').trim().isEmail().normalizeEmail()], validate, ctrl.forgotPassword);
router.post('/reset-password',  authLimiter, [
  body('userId').notEmpty().isUUID(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
  body('newPassword').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
], validate, ctrl.resetPassword);

router.get('/me', protect, ctrl.getMe);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  ctrl.googleCallback);
router.post('/set-cookies', ctrl.setCookies);
module.exports = router;
