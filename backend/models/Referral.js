'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  referrerId:    { type: DataTypes.UUID, allowNull: false },
  refereeId:     { type: DataTypes.UUID, allowNull: false, unique: true },
  referralCode:  { type: DataTypes.STRING(20), allowNull: false },
  rewardGiven:   { type: DataTypes.BOOLEAN, defaultValue: false },
  rewardGivenAt: { type: DataTypes.DATE },
}, {
  tableName: 'referrals',
  updatedAt: false,
  indexes: [{ fields: ['referrer_id'] }],
});

module.exports = Referral;
