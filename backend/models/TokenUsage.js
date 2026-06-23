
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenUsage = sequelize.define('TokenUsage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  feature: {
    type: DataTypes.ENUM('cv_analysis', 'cover_letter', 'interview', 'career_path', 'auto_apply', 'chat', 'test'),
    allowNull: false,
  },
  model: {
    type: DataTypes.STRING,
    defaultValue: 'deepseek-chat',
    allowNull: false,
  },
  inputTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  outputTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalTokens: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  estimatedCost: {
    type: DataTypes.DECIMAL(10, 6),
    defaultValue: 0,
  },
  promptPreview: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  responsePreview: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  duration: {
    type: DataTypes.INTEGER, // in milliseconds
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('success', 'failed', 'partial'),
    defaultValue: 'success',
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'token_usage',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['timestamp'] },
    { fields: ['feature'] },
    { fields: ['model'] },
    { fields: ['status'] },
  ],
});

module.exports = TokenUsage;