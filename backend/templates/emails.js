

'use strict';

const APP      = process.env.APP_NAME    || 'TalexHub';
const BASE_URL = process.env.FRONTEND_URL || 'https://TalexHub.com';

/* ─────────────────────────────────────────────────────────────
   LOGO
   Replace the src below with your CDN/hosted URL, e.g.:
   const LOGO_URL = 'https://TalexHub.com/assets/LogoGold.png';
   Or keep as hosted path — email clients need a public URL,
   local file paths won't work in emails.
───────────────────────────────────────────────────────────── */
const LOGO_URL = `${BASE_URL}/assets/LogoGold.png`;

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  (mirrors RegisterPage CSS variables)
───────────────────────────────────────────────────────────── */
const T = {
  bgPage:      '#F4F4F5',   // --bg-primary (light)
  bgCard:      '#FFFFFF',   // --bg-secondary
  bgField:     '#F9F9F9',
  border:      '#E4E4E7',   // --border
  accent:      '#1A1A1E',   // --text-primary / button bg
  accentGold:  '#D4A017',   // gold from logo
  textPrimary: '#1A1A1E',
  textSec:     '#71717A',
  danger:      '#EF4444',
  success:     '#22C55E',
  warning:     '#F97316',
  radius:      '10px',
  radiusLg:    '14px',
};

/* ─────────────────────────────────────────────────────────────
   i18n strings
───────────────────────────────────────────────────────────── */
const i18n = {
  ar: {
    dir: 'rtl', lang: 'ar',
    greeting:     (name) => `مرحباً <strong style="color:${T.textPrimary}">${name}</strong>`,
    otpTitle:     'تفعيل حسابك',
    otpBody:      'لتفعيل حسابك في <strong>TalexHub</strong>، استخدم رمز التحقق التالي:',
    otpValid:     'صالح لمدة 10 دقائق فقط',
    otpWarn:      '⚠ لا تشارك هذا الرمز مع أحد. فريقنا لن يطلبه منك أبداً.',
    welcomeTitle: 'مرحباً بك في TalexHub! 🎉',
    welcomeBody:  'تم تفعيل حسابك بنجاح. ابدأ رحلتك المهنية الآن.',
    welcomeBtn:   'اذهب إلى لوحة التحكم ←',
    googleTitle:  'تم إنشاء حسابك عبر Google',
    googleBody:   'أهلاً بك! تم ربط حسابك بـ Google بنجاح.',
    googleBtn:    'اذهب إلى لوحة التحكم ←',
    resetTitle:   'إعادة تعيين كلمة المرور',
    resetBody:    'تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. استخدم الرمز التالي:',
    resetValid:   'صالح لمدة 10 دقائق فقط',
    resetWarn:    '⚠ إذا لم تطلب هذا، تجاهل الرسالة وحسابك بأمان.',
    footer:       'هذه رسالة تلقائية، لا تردّ عليها.',
    rights:       'جميع الحقوق محفوظة',
  },
  en: {
    dir: 'ltr', lang: 'en',
    greeting:     (name) => `Hello <strong style="color:${T.textPrimary}">${name}</strong>`,
    otpTitle:     'Activate Your Account',
    otpBody:      'To activate your <strong>TalexHub</strong> account, use the verification code below:',
    otpValid:     'Valid for 10 minutes only',
    otpWarn:      '⚠ Never share this code. Our team will never ask for it.',
    welcomeTitle: 'Welcome to TalexHub! ',
    welcomeBody:  'Your account has been activated. Start your career journey now.',
    welcomeBtn:   'Go to Dashboard →',
    googleTitle:  'Account Created via Google',
    googleBody:   'Welcome! Your account has been linked with Google successfully.',
    googleBtn:    'Go to Dashboard →',
    resetTitle:   'Reset Your Password',
    resetBody:    'We received a request to reset your password. Use the code below:',
    resetValid:   'Valid for 10 minutes only',
    resetWarn:    '⚠ If you didn\'t request this, you can safely ignore this email.',
    footer:       'This is an automated message, please do not reply.',
    rights:       'All rights reserved',
  },
};

/* ─────────────────────────────────────────────────────────────
   BASE WRAPPER  — full email shell
───────────────────────────────────────────────────────────── */
const wrap = (body, t) => `<!DOCTYPE html>
<html lang="${t.lang}" dir="${t.dir}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${APP}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: ${T.bgPage};
      font-family: ${t.dir === 'rtl'
        ? "'Tahoma','Arial',sans-serif"
        : "'Helvetica Neue','Arial',sans-serif"};
      font-size: 14px;
      color: ${T.textPrimary};
      padding: 32px 16px;
    }
    .card {
      max-width: 480px;
      margin: 0 auto;
      background: ${T.bgCard};
      border-radius: ${T.radiusLg};
      border: 1.5px solid ${T.border};
      overflow: hidden;
    }
    /* ── Header ── */
    .header {
      background: ${T.accent};
      padding: 28px 36px;
      text-align: center;
    }
    .header img {
      height: 40px;
      width: auto;
      object-fit: contain;
    }
    /* ── Body ── */
    .body {
      padding: 32px 36px;
      line-height: 1.75;
      color: ${T.textPrimary};
    }
    .body p { margin-bottom: 12px; }
    /* ── OTP box ── */
    .otp-box {
      background: ${T.bgField};
      border: 1.5px solid ${T.border};
      border-radius: ${T.radius};
      text-align: center;
      padding: 24px 20px;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 42px;
      font-weight: 900;
      color: ${T.textPrimary};
      letter-spacing: 14px;
      font-family: 'Courier New', monospace;
      display: block;
    }
    .otp-valid {
      font-size: 12px;
      color: ${T.textSec};
      margin-top: 8px;
    }
    /* ── Warning box ── */
    .warn {
      background: #FFF8EC;
      border: 1.5px solid #F6D860;
      border-radius: ${T.radius};
      padding: 12px 16px;
      font-size: 12.5px;
      color: #92610A;
      margin-top: 16px;
      line-height: 1.6;
    }
    /* ── CTA button ── */
    .btn-wrap { text-align: center; margin: 24px 0 8px; }
    .btn {
      display: inline-block;
      background: ${T.accent};
      color: #ffffff !important;
      padding: 13px 32px;
      border-radius: ${T.radius};
      text-decoration: none;
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    /* ── Divider ── */
    .divider {
      height: 1px;
      background: ${T.border};
      margin: 24px 0;
    }
    /* ── Footer ── */
    .footer {
      background: ${T.bgField};
      border-top: 1.5px solid ${T.border};
      padding: 18px 36px;
      text-align: center;
      font-size: 11.5px;
      color: ${T.textSec};
      line-height: 1.7;
    }
    .footer a { color: ${T.textSec}; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="card">

    <!-- Header -->
    <div class="header">
      <img src="${LOGO_URL}" alt="${APP}" />
    </div>

    <!-- Body -->
    <div class="body">
      ${body}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>${t.footer}</p>
      <p style="margin-top:6px">© ${new Date().getFullYear()} <strong>${APP}</strong> — ${t.rights}</p>
    </div>

  </div>
</body>
</html>`;

/* ─────────────────────────────────────────────────────────────
   TEMPLATES
   Each accepts { name, otp?, lang? }
   lang defaults to 'ar' — pass lang:'en' for English
───────────────────────────────────────────────────────────── */

/**
 * OTP / Email verification
 * @param {{ name: string, otp: string, lang?: 'ar'|'en' }} opts
 */
const otpEmailTemplate = ({ name, otp, lang = 'ar' }) => {
  const t = i18n[lang] || i18n.ar;
  return wrap(`
    <p>${t.greeting(name)},</p>
    <p>${t.otpBody}</p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p class="otp-valid">${t.otpValid}</p>
    </div>

    <div class="warn">${t.otpWarn}</div>
  `, t);
};

/**
 * Welcome email — sent after OTP verified
 * @param {{ name: string, lang?: 'ar'|'en' }} opts
 */
const welcomeEmailTemplate = ({ name, lang = 'ar' }) => {
  const t = i18n[lang] || i18n.ar;
  return wrap(`
    <p>${t.greeting(name)},</p>
    <p>${t.welcomeBody}</p>

    <div class="divider"></div>

    <div class="btn-wrap">
      <a href="${BASE_URL}/dashboard" class="btn">${t.welcomeBtn}</a>
    </div>
  `, t);
};

/**
 * Google OAuth welcome
 * @param {{ name: string, lang?: 'ar'|'en' }} opts
 */
const welcomeGoogleTemplate = ({ name, lang = 'ar' }) => {
  const t = i18n[lang] || i18n.ar;
  return wrap(`
    <p>${t.greeting(name)},</p>
    <p>${t.googleBody}</p>

    <div class="divider"></div>

    <div class="btn-wrap">
      <a href="${BASE_URL}/dashboard" class="btn">${t.googleBtn}</a>
    </div>
  `, t);
};

/**
 * Reset password OTP
 * @param {{ name: string, otp: string, lang?: 'ar'|'en' }} opts
 */
const resetPasswordTemplate = ({ name, otp, lang = 'ar' }) => {
  const t = i18n[lang] || i18n.ar;
  return wrap(`
    <p>${t.greeting(name)},</p>
    <p>${t.resetBody}</p>

    <div class="otp-box">
      <span class="otp-code">${otp}</span>
      <p class="otp-valid">${t.resetValid}</p>
    </div>

    <div class="warn">${t.resetWarn}</div>
  `, t);
};

module.exports = {
  otpEmailTemplate,
  welcomeEmailTemplate,
  welcomeGoogleTemplate,
  resetPasswordTemplate,
};