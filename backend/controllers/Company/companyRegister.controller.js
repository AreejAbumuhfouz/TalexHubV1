// 'use strict';
// // ════════════════════════════════════════════════════════════
// // backend/controllers/companyRegister.controller.js
// //
// // الترتيب الصح:
// // STEP 1 /init    → تحقق من الإيميل فقط → احفظ OTP مؤقت → أرسل إيميل
// // STEP 2 /verify  → تحقق OTP → احفظ المستخدم + الشركة → auto-login
// // ════════════════════════════════════════════════════════════

// const bcrypt  = require('bcryptjs');
// const crypto  = require('crypto');
// const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

// const { Op } = require('sequelize');
// const { sequelize, User, OtpToken, Company, CompanyMember, Wallet } = require('../../models');
// const {
//   generateAccessToken,
//   generateRefreshToken,
//   generateOTP,
//   generateReferralCode,
// } = require('../../utils/generateToken');
// const { sendMail }       = require('../../config/mailer');
// const { otpEmailTemplate, welcomeEmailTemplate } = require('../../templates/emails');
// const { success, error } = require('../../utils/apiResponse');

// /* ── Cookie helper ───────────────────────────────────────── */
// const setAuthCookies = (res, accessToken, refreshToken) => {
//   const base = {
//     httpOnly: true,
//     secure:   process.env.NODE_ENV === 'production',
//     sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//     path:     '/',
//   };
//   res.cookie('accessToken',  accessToken,  { ...base, maxAge: 15 * 60 * 1000 });
//   res.cookie('refreshToken', refreshToken, { ...base, maxAge: 24 * 60 * 60 * 1000 });
// };

// // ════════════════════════════════════════════════════════════
// // STEP 1 — POST /auth/register-company/init
// // فقط: تحقق إيميل → احفظ OTP مؤقت في جدول منفصل → أرسل إيميل
// // لا يُحفظ أي مستخدم أو شركة هنا
// // ════════════════════════════════════════════════════════════
// exports.initRegister = async (req, res) => {
//   try {
//     const { fullName, email, password, companyName, industry, companySize,
//             website, locationCountry, locationCity, description } = req.body;

//     if (!email || !fullName || !password || !companyName) {
//       return error(res, 'جميع الحقول المطلوبة يجب ملؤها', 400);
//     }

//     // ── 1. تحقق من الإيميل — هل مسجّل مسبقاً؟ ──
//     const existing = await User.findOne({
//       where: { email: email.toLowerCase() },
//     });
//     if (existing) return error(res, 'البريد الإلكتروني مسجّل مسبقاً', 409);

//     // ── 2. احفظ OTP مؤقت مع بيانات التسجيل ──
//     // نستخدم جدول otp_tokens مع purpose خاص
//     // ونخزّن البيانات كـ JSON في حقل token منفصل (pending_register)
//     const otp        = generateOTP(6);
//     const sessionId  = crypto.randomUUID(); // يُعاد للـ frontend كـ userId مؤقت
//     const otpId      = crypto.randomUUID();

//     // نحفظ بيانات التسجيل كـ JSON في جدول مؤقت
//     // نستخدم sequelize.query لأن الجدول ليس له موديل
//     // لكن أسهل: نحفظها في Redis أو نستخدم OtpToken مع meta
//     // الحل الأبسط: جدول pending_registrations مؤقت
//     // لكن بما أنه ما في موديل — نستخدم OtpToken بطريقة ذكية:
//     // نحفظ OTP مع token = hash(otp) وnotes = JSON(بيانات)
//     // لكن OtpToken ما عنده حقل notes —
//     // الحل النهائي: نستخدم purpose = 'company_register' ونخزّن البيانات
//     // في جدول مؤقت بـ raw SQL

//     // أنشئ جدول مؤقت لو ما موجود
//     await sequelize.query(`
//       CREATE TABLE IF NOT EXISTS pending_company_registrations (
//         id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//         session_id  UUID NOT NULL UNIQUE,
//         email       TEXT NOT NULL,
//         otp_hash    TEXT NOT NULL,
//         data        JSONB NOT NULL,
//         expires_at  TIMESTAMPTZ NOT NULL,
//         created_at  TIMESTAMPTZ DEFAULT NOW()
//       )
//     `);

//     // احذف أي pending قديم لنفس الإيميل
//     await sequelize.query(
//       `DELETE FROM pending_company_registrations WHERE email = :email`,
//       { replacements: { email: email.toLowerCase() } }
//     );

//     const passwordHash = await bcrypt.hash(password, 12);

//     const registrationData = {
//       fullName, email: email.toLowerCase(), passwordHash,
//       companyName, industry, companySize,
//       website, locationCountry, locationCity, description,
//     };

//     await sequelize.query(`
//       INSERT INTO pending_company_registrations
//         (id, session_id, email, otp_hash, data, expires_at)
//       VALUES
//         (:id, :sessionId, :email, :otpHash, :data::jsonb, :expiresAt)
//     `, {
//       replacements: {
//         id:        crypto.randomUUID(),
//         sessionId,
//         email:     email.toLowerCase(),
//         otpHash:   hashOtp(otp),
//         data:      JSON.stringify(registrationData),
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقائق
//       },
//     });

//     // ── 3. أرسل OTP (لو فشل الإيميل نرجع الـ sessionId مع تحذير) ──
//     let mailSent = true;
//     try {
//       await sendMail({
//         to:      email.toLowerCase(),
//         subject: 'تأكيد بريدك الإلكتروني — TalexHub',
//         html:    otpEmailTemplate({ name: fullName, otp }),
//       });
//     } catch (mailErr) {
//       mailSent = false;
//       console.error('[register-company/init] Mail error:', mailErr.message);
//     }

//     // للتطوير فقط: اطبع الـ OTP في اللوج لو الإيميل فشل
//     if (!mailSent) {
//       console.log(`[DEV] OTP for ${email}: ${otp}`);
//     }

//     return success(res,
//       { sessionId, email: email.toLowerCase(), mailSent },
//       mailSent
//         ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
//         : 'تم إنشاء الجلسة — تحقق من لوج السيرفر للرمز (وضع التطوير)',
//       201
//     );

//   } catch (err) {
//     console.error('[register-company/init]', err.message);
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// // STEP 2 — POST /auth/register-company/verify
// // بعد التحقق من OTP → احفظ المستخدم + الشركة → auto-login
// // Body: { sessionId, otp }
// // ════════════════════════════════════════════════════════════
// exports.verifyAndLogin = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { sessionId, otp } = req.body;

//     if (!sessionId || !otp) {
//       await t.rollback();
//       return error(res, 'البيانات ناقصة', 400);
//     }

//     // ── 1. تحقق من الـ OTP والـ session ──
//     const [rows] = await sequelize.query(`
//       SELECT * FROM pending_company_registrations
//       WHERE session_id = :sessionId
//         AND otp_hash   = :otpHash
//         AND expires_at > NOW()
//       LIMIT 1
//     `, {
//       replacements: { sessionId, otpHash: hashOtp(otp) },
//       transaction: t,
//     });

//     if (!rows.length) {
//       await t.rollback();
//       return error(res, 'الرمز غير صحيح أو منتهي الصلاحية', 400);
//     }

//     const pending = rows[0];
//     const data    = typeof pending.data === 'string'
//       ? JSON.parse(pending.data)
//       : pending.data;

//     // ── 2. تحقق ثاني من الإيميل (حماية من race condition) ──
//     const existing = await User.findOne({
//       where: { email: data.email },
//       transaction: t,
//     });
//     if (existing) {
//       await t.rollback();
//       return error(res, 'البريد الإلكتروني مسجّل مسبقاً', 409);
//     }

//     // ── 3. احفظ المستخدم بـ raw SQL ──
//     const userId       = crypto.randomUUID();
//     const referralCode = generateReferralCode();

//     await sequelize.query(`
//       INSERT INTO users (
//         id, email, email_verified, password_hash, role, status,
//         full_name, referral_code, preferred_language,
//         desired_industries, desired_locations, desired_job_types,
//         open_to_work, discoverable, auto_apply_enabled,
//         two_fa_enabled, failed_login_count,
//         total_reports_against, total_reports_submitted,
//         created_at, updated_at
//       ) VALUES (
//         :id, :email, true, :passwordHash, 'company', 'active',
//         :fullName, :referralCode, 'ar',
//         '[]', '[]', '[]',
//         true, true, false,
//         false, 0, 0, 0,
//         NOW(), NOW()
//       )
//     `, {
//       replacements: {
//         id: userId, email: data.email,
//         passwordHash: data.passwordHash,
//         fullName: data.fullName, referralCode,
//       },
//       transaction: t,
//     });

//     // ── 4. محفظة ──
//     await sequelize.query(`
//       INSERT INTO wallets (id, user_id, points_balance, cash_balance, currency, is_frozen, created_at, updated_at)
//       VALUES (:id, :userId, 0, 0, 'USD', false, NOW(), NOW())
//     `, {
//       replacements: { id: crypto.randomUUID(), userId },
//       transaction: t,
//     });

//     // ── 5. الشركة ──
//     const companyId = crypto.randomUUID();
//     const slug = data.companyName.toLowerCase()
//       .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
//       + '-' + Date.now().toString(36);

//     await sequelize.query(`
//       INSERT INTO companies (
//         id, owner_id, name, slug, status,
//         industry, company_size, website,
//         location_country, location_city, description,
//         email_domain, total_jobs_posted, total_hires,
//         deleted_at, created_at, updated_at
//       ) VALUES (
//         :id, :ownerId, :name, :slug, 'pending_review',
//         :industry, :companySize, :website,
//         :locationCountry, :locationCity, :description,
//         :emailDomain, 0, 0,
//         NULL, NOW(), NOW()
//       )
//     `, {
//       replacements: {
//         id: companyId, ownerId: userId,
//         name: data.companyName, slug,
//         industry:        data.industry        || null,
//         companySize:     data.companySize     || null,
//         website:         data.website         || null,
//         locationCountry: data.locationCountry || null,
//         locationCity:    data.locationCity    || null,
//         description:     data.description     || null,
//         emailDomain:     data.email.split('@')[1] || 'company.com',
//       },
//       transaction: t,
//     });

//     // ── 6. عضوية ──
//     await sequelize.query(`
//       INSERT INTO company_members (id, company_id, user_id, role, invited_at, accepted_at)
//       VALUES (:id, :companyId, :userId, 'admin', NOW(), NOW())
//     `, {
//       replacements: { id: crypto.randomUUID(), companyId, userId },
//       transaction: t,
//     });

//     // ── 7. احذف الـ pending record ──
//     await sequelize.query(
//       `DELETE FROM pending_company_registrations WHERE session_id = :sessionId`,
//       { replacements: { sessionId }, transaction: t }
//     );

//     // ── 8. commit ──
//     await t.commit();

//     // ── 9. إرسال ترحيب (fire & forget) ──
//     sendMail({
//       to:      data.email,
//       subject: 'مرحباً بك في TalexHub 🎉',
//       html:    welcomeEmailTemplate({ name: data.fullName }),
//     }).catch(e => console.error('Welcome mail error:', e.message));

//     // ── 10. Auto-login ──
//     const user = await User.findByPk(userId);
//     const accessToken  = generateAccessToken(userId, 'company');
//     const refreshToken = await generateRefreshToken(
//       userId, req.ip, req.headers['user-agent'], false
//     );
//     setAuthCookies(res, accessToken, refreshToken);

//     return success(res, {
//       user: {
//         id:        userId,
//         fullName:  data.fullName,
//         email:     data.email,
//         role:      'company',
//         status:    'active',
//         avatarUrl: null,
//       },
//       company: { id: companyId, name: data.companyName, status: 'pending_review' },
//     }, 'تم التسجيل وتسجيل الدخول بنجاح');

//   } catch (err) {
//     await t.rollback().catch(() => {});
//     console.error('[register-company/verify]', err.message, err.stack);
//     return error(res, err.message, 500);
//   }
// };

// // ════════════════════════════════════════════════════════════
// // RESEND — POST /auth/register-company/resend
// // يرسل OTP جديد بدون إنشاء session جديد
// // Body: { sessionId, email }
// // ════════════════════════════════════════════════════════════
// exports.resendOtp = async (req, res) => {
//   try {
//     const { sessionId, email } = req.body;

//     const [rows] = await sequelize.query(`
//       SELECT * FROM pending_company_registrations
//       WHERE session_id = :sessionId AND email = :email AND expires_at > NOW()
//       LIMIT 1
//     `, { replacements: { sessionId, email: email.toLowerCase() } });

//     if (!rows.length) return error(res, 'الجلسة منتهية، أعد التسجيل من البداية', 400);

//     const pending = rows[0];
//     const data    = typeof pending.data === 'string' ? JSON.parse(pending.data) : pending.data;

//     const otp = generateOTP(6);

//     // تحديث الـ OTP والـ expires_at
//     await sequelize.query(`
//       UPDATE pending_company_registrations
//       SET otp_hash = :otpHash, expires_at = :expiresAt
//       WHERE session_id = :sessionId
//     `, {
//       replacements: {
//         sessionId,
//         otpHash:   hashOtp(otp),
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//       },
//     });

//     await sendMail({
//       to:      email.toLowerCase(),
//       subject: 'رمز التحقق الجديد — TalexHub',
//       html:    otpEmailTemplate({ name: data.fullName, otp }),
//     });

//     return success(res, {}, 'تم إرسال رمز جديد');

//   } catch (err) {
//     console.error('[register-company/resend]', err.message);
//     return error(res, err.message, 500);
//   }
// };

'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/companyRegister.controller.js
//
// الترتيب الصح:
// STEP 1 /init    → تحقق من الإيميل فقط → احفظ OTP مؤقت → أرسل إيميل
// STEP 2 /verify  → تحقق OTP → احفظ المستخدم + الشركة → auto-login
// ════════════════════════════════════════════════════════════

const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const { Op } = require('sequelize');
const { sequelize, User, OtpToken, Company, CompanyMember, Wallet } = require('../../models');
const {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateReferralCode,
} = require('../../utils/generateToken');
const { sendMail }       = require('../../config/mailer');
const { otpEmailTemplate, welcomeEmailTemplate } = require('../../templates/emails');
const { success, error } = require('../../utils/apiResponse');

/* ── Cookie helper ───────────────────────────────────────── */
const setAuthCookies = (res, accessToken, refreshToken) => {
  const base = {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path:     '/',
  };
  res.cookie('accessToken',  accessToken,  { ...base, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 24 * 60 * 60 * 1000 });
};

// ════════════════════════════════════════════════════════════
// STEP 1 — POST /auth/register-company/init
// فقط: تحقق إيميل → احفظ OTP مؤقت في جدول منفصل → أرسل إيميل
// لا يُحفظ أي مستخدم أو شركة هنا
// ════════════════════════════════════════════════════════════
exports.initRegister = async (req, res) => {
  try {
    const { fullName, email, password, companyName, industry, companySize,
            website, locationCountry, locationCity, description } = req.body;

    if (!email || !fullName || !password || !companyName) {
      return error(res, 'جميع الحقول المطلوبة يجب ملؤها', 400);
    }

    // ── 1. تحقق من الإيميل — هل مسجّل مسبقاً؟ ──
    const existing = await User.findOne({
      where: { email: email.toLowerCase() },
    });
    if (existing) return error(res, 'البريد الإلكتروني مسجّل مسبقاً', 409);

    // ── 2. احفظ OTP مؤقت مع بيانات التسجيل ──
    // نستخدم جدول otp_tokens مع purpose خاص
    // ونخزّن البيانات كـ JSON في حقل token منفصل (pending_register)
    const otp        = generateOTP(6);
    const sessionId  = crypto.randomUUID(); // يُعاد للـ frontend كـ userId مؤقت
    const otpId      = crypto.randomUUID();

    // نحفظ بيانات التسجيل كـ JSON في جدول مؤقت
    // نستخدم sequelize.query لأن الجدول ليس له موديل
    // لكن أسهل: نحفظها في Redis أو نستخدم OtpToken مع meta
    // الحل الأبسط: جدول pending_registrations مؤقت
    // لكن بما أنه ما في موديل — نستخدم OtpToken بطريقة ذكية:
    // نحفظ OTP مع token = hash(otp) وnotes = JSON(بيانات)
    // لكن OtpToken ما عنده حقل notes —
    // الحل النهائي: نستخدم purpose = 'company_register' ونخزّن البيانات
    // في جدول مؤقت بـ raw SQL

    // أنشئ جدول مؤقت لو ما موجود
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS pending_company_registrations (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id  UUID NOT NULL UNIQUE,
        email       TEXT NOT NULL,
        otp_hash    TEXT NOT NULL,
        data        JSONB NOT NULL,
        expires_at  TIMESTAMPTZ NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // احذف أي pending قديم لنفس الإيميل
    await sequelize.query(
      `DELETE FROM pending_company_registrations WHERE email = :email`,
      { replacements: { email: email.toLowerCase() } }
    );

    const passwordHash = await bcrypt.hash(password, 12);

    const registrationData = {
      fullName, email: email.toLowerCase(), passwordHash,
      companyName, industry, companySize,
      website, locationCountry, locationCity, description,
    };

    await sequelize.query(`
      INSERT INTO pending_company_registrations
        (id, session_id, email, otp_hash, data, expires_at)
      VALUES
        (:id, :sessionId, :email, :otpHash, :data::jsonb, :expiresAt)
    `, {
      replacements: {
        id:        crypto.randomUUID(),
        sessionId,
        email:     email.toLowerCase(),
        otpHash:   hashOtp(otp),
        data:      JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 دقائق
      },
    });

    // ── 3. أرسل OTP (لو فشل الإيميل نرجع الـ sessionId مع تحذير) ──
    let mailSent = true;
    try {
      await sendMail({
        to:      email.toLowerCase(),
        subject: 'تأكيد بريدك الإلكتروني — TalexHub',
        html:    otpEmailTemplate({ name: fullName, otp, lang: 'en' }),
      });
    } catch (mailErr) {
      mailSent = false;
      console.error('[register-company/init] Mail error:', mailErr.message);
    }

    // للتطوير فقط: اطبع الـ OTP في اللوج لو الإيميل فشل
    if (!mailSent) {
      console.log(`[DEV] OTP for ${email}: ${otp}`);
    }

    return success(res,
      { sessionId, email: email.toLowerCase(), mailSent },
      mailSent
        ? 'تم إرسال رمز التحقق إلى بريدك الإلكتروني'
        : 'تم إنشاء الجلسة — تحقق من لوج السيرفر للرمز (وضع التطوير)',
      201
    );

  } catch (err) {
    console.error('[register-company/init]', err.message);
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// STEP 2 — POST /auth/register-company/verify
// بعد التحقق من OTP → احفظ المستخدم + الشركة → auto-login
// Body: { sessionId, otp }
// ════════════════════════════════════════════════════════════
exports.verifyAndLogin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId, otp } = req.body;

    if (!sessionId || !otp) {
      await t.rollback();
      return error(res, 'البيانات ناقصة', 400);
    }

    // ── 1. تحقق من الـ OTP والـ session ──
    const [rows] = await sequelize.query(`
      SELECT * FROM pending_company_registrations
      WHERE session_id = :sessionId
        AND otp_hash   = :otpHash
        AND expires_at > NOW()
      LIMIT 1
    `, {
      replacements: { sessionId, otpHash: hashOtp(otp) },
      transaction: t,
    });

    if (!rows.length) {
      await t.rollback();
      return error(res, 'الرمز غير صحيح أو منتهي الصلاحية', 400);
    }

    const pending = rows[0];
    const data    = typeof pending.data === 'string'
      ? JSON.parse(pending.data)
      : pending.data;

    // ── 2. تحقق ثاني من الإيميل (حماية من race condition) ──
    const existing = await User.findOne({
      where: { email: data.email },
      transaction: t,
    });
    if (existing) {
      await t.rollback();
      return error(res, 'البريد الإلكتروني مسجّل مسبقاً', 409);
    }

    // ── 3. احفظ المستخدم بـ raw SQL ──
    const userId       = crypto.randomUUID();
    const referralCode = generateReferralCode();

    await sequelize.query(`
      INSERT INTO users (
        id, email, email_verified, password_hash, role, status,
        full_name, referral_code, preferred_language,
        desired_industries, desired_locations, desired_job_types,
        open_to_work, discoverable, auto_apply_enabled,
        two_fa_enabled, failed_login_count,
        total_reports_against, total_reports_submitted,
        created_at, updated_at
      ) VALUES (
        :id, :email, true, :passwordHash, 'company', 'active',
        :fullName, :referralCode, 'ar',
        '[]', '[]', '[]',
        true, true, false,
        false, 0, 0, 0,
        NOW(), NOW()
      )
    `, {
      replacements: {
        id: userId, email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName, referralCode,
      },
      transaction: t,
    });

    // ── 4. محفظة ──
    await sequelize.query(`
      INSERT INTO wallets (id, user_id, points_balance, cash_balance, currency, is_frozen, created_at, updated_at)
      VALUES (:id, :userId, 0, 0, 'USD', false, NOW(), NOW())
    `, {
      replacements: { id: crypto.randomUUID(), userId },
      transaction: t,
    });

    // ── 5. الشركة ──
    const companyId = crypto.randomUUID();
    const slug = data.companyName.toLowerCase()
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      + '-' + Date.now().toString(36);

    await sequelize.query(`
      INSERT INTO companies (
        id, owner_id, name, slug, status,
        industry, company_size, website,
        location_country, location_city, description,
        email_domain, total_jobs_posted, total_hires,
        deleted_at, created_at, updated_at
      ) VALUES (
        :id, :ownerId, :name, :slug, 'pending_review',
        :industry, :companySize, :website,
        :locationCountry, :locationCity, :description,
        :emailDomain, 0, 0,
        NULL, NOW(), NOW()
      )
    `, {
      replacements: {
        id: companyId, ownerId: userId,
        name: data.companyName, slug,
        industry:        data.industry        || null,
        companySize:     data.companySize     || null,
        website:         data.website         || null,
        locationCountry: data.locationCountry || null,
        locationCity:    data.locationCity    || null,
        description:     data.description     || null,
        emailDomain:     data.email.split('@')[1] || 'company.com',
      },
      transaction: t,
    });

    // ── 6. عضوية ──
    await sequelize.query(`
      INSERT INTO company_members (id, company_id, user_id, role, invited_at, accepted_at)
      VALUES (:id, :companyId, :userId, 'admin', NOW(), NOW())
    `, {
      replacements: { id: crypto.randomUUID(), companyId, userId },
      transaction: t,
    });

    // ── 7. احذف الـ pending record ──
    await sequelize.query(
      `DELETE FROM pending_company_registrations WHERE session_id = :sessionId`,
      { replacements: { sessionId }, transaction: t }
    );

    // ── 8. commit ──
    await t.commit();

    // ── 9. إرسال ترحيب (fire & forget) ──
    sendMail({
      to:      data.email,
      subject: 'مرحباً بك في TalexHub 🎉',
      html:    welcomeEmailTemplate({ name: data.fullName, lang: 'en' }),
    }).catch(e => console.error('Welcome mail error:', e.message));

    // ── 10. Auto-login ──
    const user = await User.findByPk(userId);
    const accessToken  = generateAccessToken(userId, 'company');
    const refreshToken = await generateRefreshToken(
      userId, req.ip, req.headers['user-agent'], false
    );
    setAuthCookies(res, accessToken, refreshToken);

    return success(res, {
      user: {
        id:        userId,
        fullName:  data.fullName,
        email:     data.email,
        role:      'company',
        status:    'active',
        avatarUrl: null,
      },
      company: { id: companyId, name: data.companyName, status: 'pending_review' },
    }, 'تم التسجيل وتسجيل الدخول بنجاح');

  } catch (err) {
    await t.rollback().catch(() => {});
    console.error('[register-company/verify]', err.message, err.stack);
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// RESEND — POST /auth/register-company/resend
// يرسل OTP جديد بدون إنشاء session جديد
// Body: { sessionId, email }
// ════════════════════════════════════════════════════════════
exports.resendOtp = async (req, res) => {
  try {
    const { sessionId, email } = req.body;

    const [rows] = await sequelize.query(`
      SELECT * FROM pending_company_registrations
      WHERE session_id = :sessionId AND email = :email AND expires_at > NOW()
      LIMIT 1
    `, { replacements: { sessionId, email: email.toLowerCase() } });

    if (!rows.length) return error(res, 'الجلسة منتهية، أعد التسجيل من البداية', 400);

    const pending = rows[0];
    const data    = typeof pending.data === 'string' ? JSON.parse(pending.data) : pending.data;

    const otp = generateOTP(6);

    // تحديث الـ OTP والـ expires_at
    await sequelize.query(`
      UPDATE pending_company_registrations
      SET otp_hash = :otpHash, expires_at = :expiresAt
      WHERE session_id = :sessionId
    `, {
      replacements: {
        sessionId,
        otpHash:   hashOtp(otp),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendMail({
      to:      email.toLowerCase(),
      subject: 'رمز التحقق الجديد — TalexHub',
      html:    otpEmailTemplate({ name: data.fullName, otp, lang: 'en' }),
    });

    return success(res, {}, 'تم إرسال رمز جديد');

  } catch (err) {
    console.error('[register-company/resend]', err.message);
    return error(res, err.message, 500);
  }
};