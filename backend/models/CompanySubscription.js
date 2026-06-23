'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanySubscription = sequelize.define('CompanySubscription', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:  { type: DataTypes.UUID, allowNull: false },
  planId:     { type: DataTypes.UUID, allowNull: false },
  status:     { type: DataTypes.ENUM('active','expired','cancelled'), defaultValue: 'active' },
  startedAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  expiresAt:  { type: DataTypes.DATE, allowNull: false },
  autoRenew:  { type: DataTypes.BOOLEAN, defaultValue: true },
  paymentRef: { type: DataTypes.STRING(255) },
}, {
  tableName: 'company_subscriptions',
  updatedAt: false,
});

module.exports = CompanySubscription;
