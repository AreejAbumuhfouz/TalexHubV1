'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:     { type: DataTypes.UUID, allowNull: false },
  tokenHash:  { type: DataTypes.TEXT, allowNull: false, unique: true },
  deviceInfo: { type: DataTypes.TEXT },
  ipAddress:  { type: DataTypes.INET },
  expiresAt:  { type: DataTypes.DATE, allowNull: false },
  revoked:    { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'refresh_tokens',
  updatedAt: false,
});

module.exports = RefreshToken;
