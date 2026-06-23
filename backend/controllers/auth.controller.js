'use strict';
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');
const { Op } = require('sequelize');
const { User, OtpToken, RefreshToken, Wallet, Company } = require('../models');
const { generateAccessToken, generateRefreshToken, generateOTP, generateReferralCode } = require('../utils/generateToken');
const { sendMail } = require('../config/mailer');
const { otpEmailTemplate, welcomeEmailTemplate, resetPasswordTemplate } = require('../templates/emails');
const { success, error } = require('../utils/apiResponse');
const { saveGeoToProfile } = require('../middleware/geoSave.middleware');
const referralSvc = require('../services/referral.service');

/* ════════════════════════════════════════════════════════════
   SET AUTH COOKIES
   ✅ sameSite: 'none' عشان cross-origin (vercel ↔ render)
   ✅ secure: true  مطلوب مع sameSite: 'none'
════════════════════════════════════════════════════════════ */
const IS_PROD = process.env.NODE_ENV === 'production';

const setAuthCookies = (res, accessToken, refreshToken, rememberMe = false) => {
  const base = {
    httpOnly: true,
    secure:   IS_PROD,                    // ✅ true في production
    sameSite: IS_PROD ? 'none' : 'lax',  // ✅ 'none' عشان cross-origin
    path:     '/',
  };
  res.cookie('accessToken',  accessToken,  { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, {
    ...base,
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
  });
};

/* ════════════════════════════════════════════════════════════
   REGISTER
════════════════════════════════════════════════════════════ */
exports.register = async (req, res) => {
  const { fullName, email, password, role = 'user', referralCode } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) return error(res, 'البريد الإلكتروني مسجل مسبقاً', 409);

  const passwordHash = await bcrypt.hash(password, 12);

  let referredBy = null;
  if (referralCode) {
    const r = await User.findOne({ where: { referralCode } });
    if (r) referredBy = r.id;
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase(),
    passwordHash,
    role: ['user', 'company'].includes(role) ? role : 'user',
    status: 'pending',
    referralCode: generateReferralCode(),
    referredBy,
  });

  await Wallet.create({ userId: user.id });

  const otp = generateOTP(6);
  await OtpToken.create({
    userId:    user.id,
    token:     hashOtp(otp),
    purpose:   'email_verify',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendMail({
    to:      user.email,
    subject: 'تأكيد البريد الإلكتروني — TalexHub',
    html:    otpEmailTemplate({ name: user.fullName, otp, lang: 'en' }),
  });

  return success(res, { userId: user.id, email: user.email }, 'تم إنشاء الحساب، تحقق من بريدك', 201);
};

/* ════════════════════════════════════════════════════════════
   VERIFY OTP
════════════════════════════════════════════════════════════ */
exports.verifyOtp = async (req, res) => {
  const { userId, otp, purpose = 'email_verify' } = req.body;

  const record = await OtpToken.findOne({
    where: {
      userId,
      token:     hashOtp(otp),
      purpose,
      used:      false,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) return error(res, 'الرمز غير صحيح أو منتهي الصلاحية', 400);

  await record.update({ used: true });

  if (purpose === 'email_verify') {
    await User.update({ emailVerified: true, status: 'active' }, { where: { id: userId } });
    const user = await User.findByPk(userId);

    await sendMail({
      to:      user.email,
      subject: 'مرحباً بك في TalexHub 🎉',
      html:    welcomeEmailTemplate({ name: user.fullName, lang: 'en' }),
    });

    referralSvc.handleVerifiedReferral(userId).catch(() => {});
  }

  return success(res, {}, 'تم التحقق بنجاح');
};

/* ════════════════════════════════════════════════════════════
   RESEND OTP
════════════════════════════════════════════════════════════ */
exports.resendOtp = async (req, res) => {
  const { userId, purpose = 'email_verify' } = req.body;

  const user = await User.findByPk(userId);
  if (!user) return error(res, 'المستخدم غير موجود', 404);

  await OtpToken.update({ used: true }, { where: { userId, purpose, used: false } });

  const otp = generateOTP(6);
  await OtpToken.create({
    userId,
    token:     hashOtp(otp),
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendMail({
    to:      user.email,
    subject: 'رمز التحقق الجديد — TalexHub',
    html:    otpEmailTemplate({ name: user.fullName, otp, lang: 'en' }),
  });

  return success(res, {}, 'تم إرسال رمز جديد');
};

/* ════════════════════════════════════════════════════════════
   LOGIN
════════════════════════════════════════════════════════════ */
exports.login = async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase(), deletedAt: null } });
  if (!user) return error(res, 'البريد أو كلمة المرور غير صحيحة', 401);

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return error(res, 'الحساب مقفل مؤقتاً', 423);
  }

  if (!user.passwordHash && user.googleId) {
    return error(res, 'هذا الحساب مرتبط بـ Google', 400, { code: 'GOOGLE_ONLY' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    const failCount = user.failedLoginCount + 1;
    const upd = { failedLoginCount: failCount };
    if (failCount >= 5) upd.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    await user.update(upd);
    return error(res, 'البريد أو كلمة المرور غير صحيحة', 401);
  }

  if (user.status === 'pending') {
    return error(res, 'يرجى تفعيل حسابك أولاً', 403, { code: 'EMAIL_NOT_VERIFIED', userId: user.id });
  }

  if (user.status === 'suspended') return error(res, 'تم تعليق حسابك', 403);

  await user.update({
    failedLoginCount: 0,
    lockedUntil:      null,
    lastLoginAt:      new Date(),
    lastLoginIp:      req.ip,
  });

  const accessToken  = generateAccessToken(user.id, user.role);
  const refreshToken = await generateRefreshToken(user.id, req.ip, req.headers['user-agent'], rememberMe);

  setAuthCookies(res, accessToken, refreshToken, rememberMe);

  let companyStatus = null;
  if (user.role === 'company') {
    const company = await Company.findOne({ where: { ownerId: user.id } });
    companyStatus = company?.status || null;
  }

  return success(res, {
    user: {
      id:                user.id,
      fullName:          user.fullName,
      email:             user.email,
      role:              user.role,
      status:            user.status,
      avatarUrl:         user.avatarUrl,
      preferredLanguage: user.preferredLanguage,
      hasPassword:       !!user.passwordHash,
      googleLinked:      !!user.googleId,
    },
    companyStatus,
  }, 'تم تسجيل الدخول بنجاح');
};

/* ════════════════════════════════════════════════════════════
   GOOGLE CALLBACK
════════════════════════════════════════════════════════════ */
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);

    saveGeoToProfile(user, req);

    const accessToken  = generateAccessToken(user.id, user.role);
    const refreshToken = await generateRefreshToken(user.id, req.ip, req.headers['user-agent'], true);

    // ✅ بعث التوكنات في الـ URL — الفرونت يحفظهم في الكوكيز
    // هاد الحل الوحيد اللي يشتغل مع cross-origin redirect
    const params = new URLSearchParams({
      accessToken,
      refreshToken,
    });

    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${params.toString()}`);
  } catch {
    res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
  }
};

/* ════════════════════════════════════════════════════════════
   REFRESH TOKEN
════════════════════════════════════════════════════════════ */
exports.refreshToken = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (!rawToken) return error(res, 'Refresh token missing', 401);

  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const record = await RefreshToken.findOne({
    where: {
      tokenHash,
      revoked:   false,
      expiresAt: { [Op.gt]: new Date() },
    },
    include: [{ model: User, as: 'user' }],
  });

  if (!record) return error(res, 'Invalid or expired token', 401);

  const user = record.user;
  if (!user || user.status !== 'active') return error(res, 'Account inactive', 401);

  await record.update({ revoked: true });

  const wasRemember = (record.expiresAt - record.createdAt) > 7 * 24 * 60 * 60 * 1000;
  const newAccess   = generateAccessToken(user.id, user.role);
  const newRefresh  = await generateRefreshToken(user.id, req.ip, req.headers['user-agent'], wasRemember);

  setAuthCookies(res, newAccess, newRefresh, wasRemember);

  return success(res, {}, 'Token refreshed');
};

/* ════════════════════════════════════════════════════════════
   LOGOUT
════════════════════════════════════════════════════════════ */
exports.logout = async (req, res) => {
  const rawToken = req.cookies?.refreshToken;
  if (rawToken) {
    const h = crypto.createHash('sha256').update(rawToken).digest('hex');
    await RefreshToken.update({ revoked: true }, { where: { tokenHash: h } });
  }

  // ✅ نفس إعدادات الـ cookie عشان تتمسح صح
  const cookieOpts = {
    httpOnly: true,
    secure:   IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path:     '/',
  };
  res.clearCookie('accessToken',  cookieOpts);
  res.clearCookie('refreshToken', cookieOpts);

  return success(res, {}, 'تم تسجيل الخروج');
};

/* ════════════════════════════════════════════════════════════
   FORGOT PASSWORD
════════════════════════════════════════════════════════════ */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email: email.toLowerCase() } });
  if (!user) return success(res, {}, 'إذا كان البريد مسجلاً ستصلك رسالة');

  if (!user.passwordHash && user.googleId) {
    return error(res, 'هذا الحساب مرتبط بـ Google ولا يملك كلمة مرور', 400, { code: 'GOOGLE_ONLY' });
  }

  await OtpToken.update({ used: true }, { where: { userId: user.id, purpose: 'password_reset', used: false } });

  const otp = generateOTP(6);
  await OtpToken.create({
    userId:    user.id,
    token:     hashOtp(otp),
    purpose:   'password_reset',
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendMail({
    to:      user.email,
    subject: 'إعادة تعيين كلمة المرور — TalexHub',
    html:    resetPasswordTemplate({ name: user.fullName, otp, lang: 'en' }),
  });

  return success(res, { userId: user.id }, 'إذا كان البريد مسجلاً ستصلك رسالة');
};

/* ════════════════════════════════════════════════════════════
   RESET PASSWORD
════════════════════════════════════════════════════════════ */
exports.resetPassword = async (req, res) => {
  const { userId, otp, newPassword } = req.body;

  const record = await OtpToken.findOne({
    where: {
      userId,
      token:     hashOtp(otp),
      purpose:   'password_reset',
      used:      false,
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!record) return error(res, 'الرمز غير صحيح أو منتهي الصلاحية', 400);

  await record.update({ used: true });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await User.update(
    { passwordHash, failedLoginCount: 0, lockedUntil: null },
    { where: { id: userId } }
  );

  await RefreshToken.update({ revoked: true }, { where: { userId } });

  return success(res, {}, 'تم تغيير كلمة المرور بنجاح');
};

/* ════════════════════════════════════════════════════════════
   GET CURRENT USER
════════════════════════════════════════════════════════════ */
exports.getMe = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['passwordHash', 'twoFaSecret'] },
  });

  if (!user) return error(res, 'User not found', 404);

  if (user.planKey !== 'free' && user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
    const { Wallet, WalletTransaction } = require('../models');
    const wallet   = await Wallet.findOne({ where: { userId: user.id } });
    const oldPoints = wallet?.pointsBalance || 0;

    await user.update({ planKey: 'free', planExpiresAt: null, planBillingPeriod: null });

    if (wallet && oldPoints > 0) {
      await wallet.update({ pointsBalance: 0 });
      await WalletTransaction.create({
        walletId:      wallet.id,
        type:          'admin_adjustment',
        pointsDelta:   -oldPoints,
        cashDelta:     0,
        description:   'Plan expired — points reset',
        referenceType: 'PlanExpiry',
      });
    }

    await user.reload();
  }

  return success(res, { user }, 'OK');
};

// ✅ أضيفي هاد في auth.controller.js

exports.setCookies = async (req, res) => {
  const { accessToken, refreshToken } = req.body;

  if (!accessToken || !refreshToken) {
    return res.status(400).json({ success: false, message: 'Tokens missing' });
  }

  // ✅ تحقق إن التوكن صحيح قبل ما تحطه في كوكيز
  const jwt = require('jsonwebtoken');
  try {
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // ✅ حط التوكنات في httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken, true);

  return res.json({ success: true });
};
