'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatTimeUsage = sequelize.define('ChatTimeUsage', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:       { type: DataTypes.UUID, allowNull: false },
  roomId:       { type: DataTypes.UUID, allowNull: false },
  weekStart:    { type: DataTypes.DATEONLY, allowNull: false },
  freeMinsUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
  paidMinsUsed: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'chat_time_usage',
  createdAt: false,
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['user_id', 'room_id', 'week_start'] }],
});

module.exports = ChatTimeUsage;
