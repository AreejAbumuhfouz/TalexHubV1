'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatMessage = sequelize.define('ChatMessage', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  roomId:    { type: DataTypes.UUID, allowNull: false },
  senderId:  { type: DataTypes.UUID, allowNull: false },
  content:   { type: DataTypes.TEXT },
  mediaUrl:  { type: DataTypes.TEXT },
  mediaType: { type: DataTypes.STRING(30) },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'chat_messages',
  updatedAt: false,
  indexes: [{ fields: ['room_id', 'created_at'] }],
});

module.exports = ChatMessage;
