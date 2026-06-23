'use strict';

const { sequelize } = require('../models');
const { success, error } = require('../utils/apiResponse');
const { sendMail } = require('../config/mailer');
const logger = require('../utils/logger');

// ════════════════════════════════════════════════════════════
// تهيئة جدول الـ waitlist — يُستدعى مرة واحدة عند بدء السيرفر
// عبر utils/ensureTables.js وليس داخل الـ request handler
// ════════════════════════════════════════════════════════════
exports.ensureWaitlistTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id         SERIAL PRIMARY KEY,
      email      VARCHAR(255) UNIQUE NOT NULL,
      lang       VARCHAR(10)  DEFAULT 'en',
      ip         VARCHAR(45),
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
};

// ════════════════════════════════════════════════════════════
// POST /api/v1/waitlist
// Body: { email, lang? }
// ════════════════════════════════════════════════════════════
exports.joinWaitlist = async (req, res) => {
  const { email, lang = 'en' } = req.body;

  if (!email || typeof email !== 'string')
    return error(res, 'البريد الإلكتروني مطلوب', 400);

  const cleaned = email.trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(cleaned))
    return error(res, 'صيغة البريد الإلكتروني غير صحيحة', 400);

  // التحقق من صحة lang لمنع أي injection
  const safeLang = ['ar', 'en'].includes(lang) ? lang : 'en';

  try {
    const [existing] = await sequelize.query(
      'SELECT id FROM waitlist WHERE email = :email',
      { replacements: { email: cleaned }, type: sequelize.QueryTypes.SELECT }
    );

    if (existing) {
      return success(res, {}, safeLang === 'ar'
        ? 'تم تسجيلك مسبقاً — ترقب إطلاقنا!'
        : "You're already on the list — stay tuned!");
    }

    // استخدام x-forwarded-for بحذر — فقط أول IP من القائمة
    const rawIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
    // تحقق بسيط من صيغة الـ IP (IPv4 / IPv6)
    const ipPattern = /^[\d.:a-fA-F]+$/;
    const ip = rawIp && ipPattern.test(rawIp) ? rawIp : null;

    await sequelize.query(
      'INSERT INTO waitlist (email, lang, ip) VALUES (:email, :lang, :ip)',
      { replacements: { email: cleaned, lang: safeLang, ip } }
    );

    sendMail({
      to: cleaned,
      subject: safeLang === 'ar' ? 'أنت على القائمة! 🎉 — TalexHub' : "You're on the list! 🎉 — TalexHub",
      html: waitlistEmailTemplate(cleaned, safeLang),
    }).catch(err => logger.error('Waitlist email failed:', err.message));

    logger.info(`Waitlist: new signup — ${cleaned} [${safeLang}]`);

    return success(res, { email: cleaned }, safeLang === 'ar'
      ? 'تم تسجيلك بنجاح — سنتواصل معك قريباً!'
      : "You're on the list — we'll reach out soon!");

  } catch (err) {
    logger.error('Waitlist error:', err.message);
    return error(res, 'حدث خطأ، يرجى المحاولة مجدداً', 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/waitlist  — admin: list all signups
// ════════════════════════════════════════════════════════════
exports.getWaitlist = async (req, res) => {
  try {
    const rows = await sequelize.query(
      'SELECT id, email, lang, ip, created_at FROM waitlist ORDER BY created_at DESC',
      { type: sequelize.QueryTypes.SELECT }
    );

    return success(res, {
      total: rows.length,
      waitlist: rows,
    });
  } catch (err) {
    logger.error('Get waitlist error:', err.message);
    return error(res, 'فشل جلب البيانات', 500);
  }
};

// ════════════════════════════════════════════════════════════
// DELETE /api/v1/waitlist/:email  — admin: remove entry
// ════════════════════════════════════════════════════════════
exports.removeFromWaitlist = async (req, res) => {
  const { email } = req.params;
  await sequelize.query(
    'DELETE FROM waitlist WHERE email = :email',
    { replacements: { email: email.toLowerCase() } }
  );
  return success(res, {}, 'تم الحذف');
};

// ════════════════════════════════════════════════════════════
// Email template
// ════════════════════════════════════════════════════════════
function waitlistEmailTemplate(email, lang) {
  const isAr = lang === 'ar';
  return `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:${isAr ? 'Tajawal, Arial' : 'DM Sans, Arial'},sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#000;border-radius:16px;overflow:hidden;max-width:100%;">
          <tr>
            <td style="padding:40px 40px 32px;border-bottom:1px solid rgba(255,255,255,0.08);">
              <span style="font-size:20px;color:#fff;">TalexHub</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="font-size:24px;font-weight:700;color:#fff;margin:0 0 16px;">
                ${isAr ? '🎉 أنت على القائمة!' : "🎉 You're on the list!"}
              </p>
              <p style="font-size:15px;color:rgba(255,255,255,0.55);line-height:1.8;margin:0 0 28px;">
                ${isAr
                  ? 'شكراً لتسجيلك — ستكون من أوائل من يحصل على وصول مبكر.'
                  : "Thanks for signing up — you'll be among the first to get early access."}
              </p>
              <p style="font-size:13px;color:rgba(255,255,255,0.3);margin:0;">${email}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px 36px;border-top:1px solid rgba(255,255,255,0.07);">
              <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">
                © 2025 TalexHub. ${isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
