'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:        { type: DataTypes.UUID, allowNull: false },
  title:         { type: DataTypes.STRING(255), allowNull: false },
  titleAr:       { type: DataTypes.STRING(255) },
  body:          { type: DataTypes.TEXT },
  bodyAr:        { type: DataTypes.TEXT },
  type:          { type: DataTypes.STRING(50) },
  channel:       { type: DataTypes.ENUM('in_app','email','push'), defaultValue: 'in_app' },
  referenceId:   { type: DataTypes.UUID },
  referenceType: { type: DataTypes.STRING(50) },
  isRead:        { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:        { type: DataTypes.DATE },
  sentAt:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'notifications',
  updatedAt: false,
  indexes: [{ fields: ['user_id', 'is_read', 'created_at'] }],
});

module.exports = Notification;
