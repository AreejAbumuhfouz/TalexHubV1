
'use strict';

const passport            = require('passport');
const GoogleStrategy      = require('passport-google-oauth20').Strategy;
const crypto              = require('crypto');
const { User, Wallet }    = require('../models');
const { generateReferralCode } = require('../utils/generateToken');
const { sendMail }        = require('./mailer');
const { welcomeGoogleTemplate } = require('../templates/emails');

// ── Validate URL helper ─────────────────────────
const isValidUrl = (url) => {
  if (!url) return true; // null/undefined acceptable
  try {
    const parsed = new URL(url);
    return ['https:', 'http:'].includes(parsed.protocol) && url.length < 500;
  } catch {
    return false;
  }
};

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
    scope:        ['profile', 'email'],
    // ✅ CSRF Protection
    state:        true,
    passReqToCallback: false,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email    = profile.emails?.[0]?.value?.toLowerCase().trim();
      const googleId = profile.id;
      const fullName = (profile.displayName || 'مستخدم جديد').slice(0, 100);
      const avatar   = isValidUrl(profile.photos?.[0]?.value) 
                        ? profile.photos[0].value 
                        : null;

      // ── Validate email ──────────────────────
      if (!email || !email.includes('@')) {
        return done(null, false, { 
          message: 'لم يتم الحصول على بريد إلكتروني صالح من Google' 
        });
      }

      // ── Validate Google ID ──────────────────
      if (!googleId) {
        return done(null, false, { 
          message: 'تعذر التحقق من حساب Google' 
        });
      }

      // ── Find existing user ──────────────────
      let user = await User.findOne({ where: { email } });

      if (user) {
        const updates = {};

        // ✅ If Google ID already linked to ANOTHER account → security risk
        const googleLinkedUser = await User.findOne({ 
          where: { googleId, id: { [require('sequelize').Op.ne]: user.id } } 
        });

        if (googleLinkedUser) {
          console.error(`⚠️ Google ID ${googleId} linked to multiple accounts`);
          return done(null, false, { 
            message: 'خطأ في المصادقة. يرجى التواصل مع الدعم.' 
          });
        }

        // Link Google ID if not linked
        if (!user.googleId) {
          updates.googleId = googleId;
        } else if (user.googleId !== googleId) {
          // Different Google account trying to login
          return done(null, false, { 
            message: 'هذا الإيميل مرتبط بحساب Google آخر' 
          });
        }

        // ✅ Only set avatar if user doesn't have one
        if (!user.avatarUrl && avatar) {
          updates.avatarUrl = avatar;
        }

        // ✅ Activate pending accounts ONLY if they registered via Google originally
        // (Don't bypass email verification for accounts created with password)
        if (user.status === 'pending' && user.passwordHash === null) {
          updates.status        = 'active';
          updates.emailVerified = true;
        }
        // ✅ If account was created with password, keep emailVerified as is
        else if (user.status === 'pending' && user.passwordHash) {
          updates.status = 'active'; // Activate but keep email unverified
        }

        // Update last login
        updates.lastLoginAt = new Date();

        if (Object.keys(updates).length > 0) {
          await user.update(updates);
        }

      } else {
        // ── New user ──────────────────────────
        user = await User.create({
          email,
          fullName,
          googleId,
          avatarUrl:     avatar,
          emailVerified: true,
          status:        'active',
          role:          'user',
          referralCode:  generateReferralCode(),
          passwordHash:  null,
          lastLoginAt:   new Date(),
        });

        // Create wallet
        await Wallet.create({ userId: user.id });

        // Send welcome email (fire and forget)
        sendMail({
          to:      email,
          subject: `🎉 مرحباً بك في TalexHub، ${fullName}!`,
          html:    welcomeGoogleTemplate({ name: fullName }),
        }).catch((err) => {
          console.error('Welcome email failed:', err.message);
        });
      }

      return done(null, user);
    } catch (err) {
      console.error('Google Strategy Error:', err);
      return done(err, null);
    }
  }
));

module.exports = passport;