'use strict';

// ════════════════════════════════════════════════════════════
// Wallet Service — منطق المحفظة المركزي
// كل عملية تعديل رصيد تمر من هنا لضمان الاتساق
// ════════════════════════════════════════════════════════════

const { Wallet, WalletTransaction, sequelize } = require('../models');
const logger = require('../utils/logger');

// ────────────────────────────────────────────────────────────
// جلب أو إنشاء محفظة المستخدم
// ────────────────────────────────────────────────────────────
exports.getOrCreate = async (userId) => {
  let wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) wallet = await Wallet.create({ userId });
  return wallet;
};

// ────────────────────────────────────────────────────────────
// إضافة نقاط (مكافأة إحالة، إنجاز، إلخ)
// ────────────────────────────────────────────────────────────
exports.addPoints = async (userId, points, description, options = {}) => {
  if (!Number.isInteger(points) || points <= 0)
    throw new Error('points must be a positive integer');

  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.isFrozen) throw new Error('Wallet is frozen');

    await wallet.increment('pointsBalance', { by: points, transaction: t });

    await WalletTransaction.create({
      walletId:      wallet.id,
      type:          options.type || 'referral_reward',
      pointsDelta:   points,
      cashDelta:     0,
      description,
      referenceId:   options.referenceId   || null,
      referenceType: options.referenceType || null,
      createdBy:     options.createdBy     || null,
    }, { transaction: t });

    await t.commit();
    logger.info(`Wallet: +${points}pts → user ${userId} (${description})`);
    return await Wallet.findOne({ where: { userId } });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// خصم نقاط (شراء ميزة، وقت محادثة)
// ────────────────────────────────────────────────────────────
exports.deductPoints = async (userId, points, description, options = {}) => {
  if (!Number.isInteger(points) || points <= 0)
    throw new Error('points must be a positive integer');

  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet)              throw new Error('Wallet not found');
    if (wallet.isFrozen)      throw new Error('Wallet is frozen');
    if (wallet.pointsBalance < points) throw new Error('رصيد النقاط غير كافٍ');

    await wallet.decrement('pointsBalance', { by: points, transaction: t });

    await WalletTransaction.create({
      walletId:      wallet.id,
      type:          options.type || 'purchase',
      pointsDelta:   -points,
      cashDelta:     0,
      description,
      referenceId:   options.referenceId   || null,
      referenceType: options.referenceType || null,
      createdBy:     options.createdBy     || null,
    }, { transaction: t });

    await t.commit();
    logger.info(`Wallet: -${points}pts → user ${userId} (${description})`);
    return await Wallet.findOne({ where: { userId } });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// إضافة رصيد نقدي (بعد موافقة الأدمن على الدفع)
// يُستدعى من payment.controller فقط بعد approve
// ────────────────────────────────────────────────────────────
exports.creditCash = async (userId, amount, description, options = {}) => {
  const val = parseFloat(amount);
  if (isNaN(val) || val <= 0) throw new Error('amount must be positive');

  const t = await sequelize.transaction();
  try {
    const wallet = await Wallet.findOne({ where: { userId }, transaction: t, lock: t.LOCK.UPDATE });
    if (!wallet)          throw new Error('Wallet not found');
    if (wallet.isFrozen)  throw new Error('Wallet is frozen');

    await wallet.increment('cashBalance', { by: val, transaction: t });

    await WalletTransaction.create({
      walletId:      wallet.id,
      type:          'admin_adjustment',
      pointsDelta:   0,
      cashDelta:     val,
      description,
      referenceId:   options.referenceId   || null,
      referenceType: options.referenceType || null,
      createdBy:     options.createdBy     || null,
      paymentGateway: options.paymentGateway || null,
      gatewayRef:     options.gatewayRef     || null,
    }, { transaction: t });

    await t.commit();
    logger.info(`Wallet: +$${val} cash → user ${userId} (${description})`);
    return await Wallet.findOne({ where: { userId } });
  } catch (err) {
    await t.rollback();
    throw err;
  }
};

// ────────────────────────────────────────────────────────────
// تجميد / فك تجميد المحفظة (للأدمن)
// ────────────────────────────────────────────────────────────
exports.setFrozen = async (userId, frozen) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) throw new Error('Wallet not found');
  await wallet.update({ isFrozen: frozen });
  return wallet;
};

// ────────────────────────────────────────────────────────────
// جلب ملخص المحفظة
// ────────────────────────────────────────────────────────────
exports.getSummary = async (userId) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) return { pointsBalance: 0, cashBalance: 0, currency: 'USD', isFrozen: false };
  return {
    pointsBalance: wallet.pointsBalance,
    cashBalance:   parseFloat(wallet.cashBalance),
    currency:      wallet.currency,
    isFrozen:      wallet.isFrozen,
  };
};
