'use strict';
// ════════════════════════════════════════════════════════════
// models/PaymentRequest.js
// ════════════════════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const PaymentRequest = sequelize.define('PaymentRequest', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },

  // الخطة المطلوبة
  planKey:     { type: DataTypes.STRING(20), allowNull: false },   // 'pro' | 'elite'
  billingPeriod: { type: DataTypes.STRING(20), defaultValue: 'monthly' }, // monthly | yearly
  amount:      { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency:    { type: DataTypes.STRING(10), defaultValue: 'USD' },

  // طريقة الدفع
  paymentMethod: { type: DataTypes.STRING(30), defaultValue: 'cliq' }, // cliq | bank | other

  // بيانات CliQ التي أدخلها المستخدم
  senderName:    { type: DataTypes.STRING(200) },
  senderPhone:   { type: DataTypes.STRING(30) },
  transactionRef: { type: DataTypes.STRING(200) }, // رقم العملية من CliQ

  // إيصال الدفع (رابط الصورة في R2)
  receiptUrl:   { type: DataTypes.TEXT },
  receiptKey:   { type: DataTypes.TEXT },

  // الحالة
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },

  // الأدمن الذي راجع الطلب
  reviewedBy:  { type: DataTypes.UUID },
  reviewedAt:  { type: DataTypes.DATE },
  rejectionReason: { type: DataTypes.TEXT },

  // ملاحظات المستخدم
  notes:       { type: DataTypes.TEXT },
}, {
  tableName: 'payment_requests',
});

module.exports = PaymentRequest;
