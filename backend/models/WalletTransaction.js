'use strict';
// backend/models/WalletTransaction.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  walletId:       { type: DataTypes.UUID, allowNull: false },
  type: {
    type: DataTypes.ENUM(
      'purchase',
      'refund',
      'referral_reward',
      'subscription_reward',   // نقاط عند الاشتراك بخطة
      'ai_usage',              // خصم عند استخدام AI
      'withdrawal',
      'admin_adjustment',
      'chat_time'
    ),
    allowNull: false,
  },
  pointsDelta:    { type: DataTypes.INTEGER, defaultValue: 0 },
  cashDelta:      { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
  description:    { type: DataTypes.TEXT },
  referenceId:    { type: DataTypes.UUID },
  referenceType:  { type: DataTypes.STRING(50) },
  paymentGateway: { type: DataTypes.STRING(50) },
  gatewayRef:     { type: DataTypes.STRING(255) },
  createdBy:      { type: DataTypes.UUID },
}, {
  tableName:  'wallet_transactions',
  updatedAt:  false,
  indexes:    [{ fields: ['wallet_id', 'created_at'] }],
});

module.exports = WalletTransaction;
