'use strict';

const cron   = require('node-cron');
const logger = require('../utils/logger');
const { Op }    = require('sequelize');
const { User, Wallet, WalletTransaction } = require('../models');
const { deleteExpiredJobs } = require('../services/matching.service');
const pointsCfg = require('../config/pointsConfig');

// ════════════════════════════════════════════════════════════
// Cron Jobs — runs on server startup
// ════════════════════════════════════════════════════════════

// ── 1. PLAN EXPIRY — runs every day at 1:00 AM ───────────
// Checks all users whose plan has expired and:
//   a) Downgrades them to 'free'
//   b) Resets their wallet points to 0
//   c) Records a wallet transaction for the reset
cron.schedule('0 1 * * *', async () => {
  logger.info('🔄 [PlanExpiry] Checking expired plans...');
  try {
    const now = new Date();

    // Find all non-free users whose plan has expired
    const expiredUsers = await User.findAll({
      where: {
        planKey:       { [Op.ne]: 'free' },
        planExpiresAt: { [Op.lt]: now },
        deletedAt:     null,
      },
      attributes: ['id', 'fullName', 'email', 'planKey', 'planExpiresAt'],
    });

    if (expiredUsers.length === 0) {
      logger.info('✅ [PlanExpiry] No expired plans found');
      return;
    }

    logger.info(`⚠️ [PlanExpiry] Found ${expiredUsers.length} expired plan(s)`);

    for (const user of expiredUsers) {
      try {
        // 1. Downgrade to free
        await User.update(
          { planKey: 'free', planExpiresAt: null, planBillingPeriod: null },
          { where: { id: user.id } }
        );

        // 2. Find wallet
        const wallet = await Wallet.findOne({ where: { userId: user.id } });
        if (wallet && wallet.pointsBalance > 0) {
          const oldPoints = wallet.pointsBalance;

          // 3. Zero out points
          await wallet.update({ pointsBalance: 0 });

          // 4. Record the reset transaction
          await WalletTransaction.create({
            walletId:      wallet.id,
            type:          'admin_adjustment',
            pointsDelta:   -oldPoints,
            cashDelta:     0,
            description:   `Plan expired (${user.planKey}) — points reset to 0`,
            referenceType: 'PlanExpiry',
          });

          logger.info(`  ↓ ${user.email}: ${user.planKey} → free | -${oldPoints} pts`);
        } else {
          logger.info(`  ↓ ${user.email}: ${user.planKey} → free (no points to reset)`);
        }
      } catch (userErr) {
        logger.error(`  ❌ Failed to expire plan for ${user.email}:`, userErr.message);
      }
    }

    logger.info(`✅ [PlanExpiry] Done — ${expiredUsers.length} plan(s) expired`);
  } catch (err) {
    logger.error('❌ [PlanExpiry] Cron failed:', err.message);
  }
});

// ── 2. Delete expired jobs every Sunday at 3:00 AM ───────
cron.schedule('0 3 * * 0', async () => {
  logger.info('🧹 Running weekly job cleanup...');
  try {
    const count = await deleteExpiredJobs();
    logger.info(`✅ Expired jobs cleaned: ${count}`);
  } catch (err) {
    logger.error('❌ Job cleanup failed:', err);
  }
});

logger.info('⏰ Cron jobs registered');

// ── تنظيف منشورات المجتمع المُبلَّغ عنها والمخفية — يومياً الساعة 2:00 AM ──
// نحذف فقط المنشورات المخفية أو التي مضى عليها +90 يوم (وليست مثبتة)
// لا نحذف المنشورات النشطة العادية — هذا قرار تجاري خاطئ
cron.schedule('0 2 * * *', async () => {
  logger.info('🧹 Running daily community cleanup...');
  try {
    const { CommunityPost } = require('../models');
    const { Op } = require('sequelize');
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // حذف المنشورات المخفية التي مضى عليها +30 يوم
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const hiddenCount = await CommunityPost.destroy({
      where: {
        isHidden:  true,
        updatedAt: { [Op.lt]: thirtyDaysAgo },
        isPinned:  false,
      },
      force: true,
    });

    // حذف المنشورات العادية القديمة جداً (+90 يوم)
    const oldCount = await CommunityPost.destroy({
      where: {
        createdAt: { [Op.lt]: ninetyDaysAgo },
        isPinned:  false,
        isHidden:  false,
      },
      force: true,
    });

    logger.info(`✅ Community cleanup: ${hiddenCount} hidden + ${oldCount} old posts deleted`);
  } catch (err) {
    logger.error('❌ Community cleanup failed:', err);
  }
});