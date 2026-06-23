'use strict';
const router    = require('express').Router();
const rateLimit = require('express-rate-limit');
const { body }  = require('express-validator');
const validate  = require('../middleware/validate');
const ctrl      = require('../controllers/Company/companyRegister.controller');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { success: false, message: 'محاولات كثيرة، حاول بعد 15 دقيقة' },
});

// POST /auth/register-company/init
router.post('/init', limiter, [
  body('fullName').trim().notEmpty().isLength({ min: 2, max: 100 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('companyName').trim().notEmpty().isLength({ min: 2, max: 255 }),
  body('industry').optional().trim(),
  body('companySize').optional().trim(),
  body('website').optional().trim(),
  body('locationCountry').optional().trim(),
  body('locationCity').optional().trim(),
  body('description').optional().trim(),
], validate, ctrl.initRegister);

// POST /auth/register-company/verify
router.post('/verify', limiter, [
  body('sessionId').notEmpty().isUUID(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric(),
], validate, ctrl.verifyAndLogin);

// POST /auth/register-company/resend
router.post('/resend', limiter, [
  body('sessionId').notEmpty().isUUID(),
  body('email').trim().isEmail().normalizeEmail(),
], validate, ctrl.resendOtp);

module.exports = router;