'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:           { type: DataTypes.STRING(100), allowNull: false },
  nameAr:         { type: DataTypes.STRING(100) },
  description:    { type: DataTypes.TEXT },
  price:          { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency:       { type: DataTypes.STRING(10), defaultValue: 'USD' },
  billingPeriod:  { type: DataTypes.STRING(20), defaultValue: 'monthly' },
  maxJobs:        { type: DataTypes.INTEGER, defaultValue: 5 },
  maxTeamMembers: { type: DataTypes.INTEGER, defaultValue: 1 },
  features:       { type: DataTypes.JSONB, defaultValue: [] },
  isActive:       { type: DataTypes.BOOLEAN, defaultValue: true },
  sortOrder:      { type: DataTypes.SMALLINT, defaultValue: 0 },
}, {
  tableName: 'subscription_plans',
  updatedAt: false,
});

module.exports = SubscriptionPlan;
