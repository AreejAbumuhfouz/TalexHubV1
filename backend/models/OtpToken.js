'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OtpToken = sequelize.define('OtpToken', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
token: { type: DataTypes.STRING(64), allowNull: false },  // SHA-256 hex = 64 chars
  purpose:   { type: DataTypes.STRING(50), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  used:      { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'otp_tokens',
  updatedAt: false,
});

module.exports = OtpToken;
