'use strict';

// ════════════════════════════════════════════════════════════
// Referral Service — نظام الإحالات
// ════════════════════════════════════════════════════════════

const { User, Referral, sequelize } = require('../models');
const walletSvc = require('./wallet.service');
const logger    = require('../utils/logger');

const REFERRAL_POINTS = 50;

// ────────────────────────────────────────────────────────────
// يُستدعى من auth.controller عند verifyOtp (email_verify)
// ────────────────────────────────────────────────────────────
exports.handleVerifiedReferral = async (newUserId) => {
  try {
    const newUser = await User.findByPk(newUserId, {
      attributes: ['id', 'referredBy'],
    });

    if (!newUser?.referredBy) return; // لا توجد إحالة

    const referrerId = newUser.referredBy;

    // تحقق من عدم معالجة الإحالة مسبقاً
    const existing = await Referral.findOne({
      where: { referrerId, refereeId: newUserId },
    });
    if (existing) return;

    // احصل على رمز الإحالة
    const referrer = await User.findByPk(referrerId, { attributes: ['referralCode'] });
    if (!referrer) return;

    // سجّل الإحالة
    await Referral.create({
      referrerId,
      refereeId:     newUserId,
      referralCode:  referrer.referralCode,
      rewardGiven:   true,
      rewardGivenAt: new Date(),
    });

    // أضف النقاط
    await walletSvc.addPoints(
      referrerId,
      REFERRAL_POINTS,
      `إحالة ناجحة — مستخدم جديد انضم بواسطتك`,
      { type: 'referral_reward', referenceId: newUserId, referenceType: 'User' }
    );

    logger.info(`Referral: user ${referrerId} earned ${REFERRAL_POINTS}pts for referring ${newUserId}`);
  } catch (err) {
    logger.error('handleVerifiedReferral error:', err.message);
  }
};

// ────────────────────────────────────────────────────────────
// جلب إحالات المستخدم
// ────────────────────────────────────────────────────────────
exports.getMyReferrals = async (referrerId) => {
  const referrals = await Referral.findAll({
    where:   { referrerId },
    include: [{
      model:      User,
      as:         'referee',
      attributes: ['id', 'fullName', 'avatarUrl', 'createdAt'],
    }],
    order: [['createdAt', 'DESC']],
  });

  return referrals.map(r => ({
    id:          r.id,
    user:        r.referee,
    rewardGiven: r.rewardGiven,
    points:      r.rewardGiven ? REFERRAL_POINTS : 0,
    rewardedAt:  r.rewardGivenAt,
    createdAt:   r.createdAt,
  }));
};

// ────────────────────────────────────────────────────────────
// إجمالي الإحالات الناجحة
// ────────────────────────────────────────────────────────────
exports.getStats = async (referrerId) => {
  const total = await Referral.count({ where: { referrerId } });
  const rewarded = await Referral.count({ where: { referrerId, rewardGiven: true } });
  return { total, rewarded, totalPoints: rewarded * REFERRAL_POINTS };
};
