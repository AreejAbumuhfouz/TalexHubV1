'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wallet = sequelize.define('Wallet', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:        { type: DataTypes.UUID, allowNull: false, unique: true },
  pointsBalance: { type: DataTypes.INTEGER, defaultValue: 0 },
  cashBalance:   { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.00 },
  currency:      { type: DataTypes.STRING(10), defaultValue: 'USD' },
  isFrozen:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'wallets',
});

module.exports = Wallet;
