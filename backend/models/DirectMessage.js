'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DirectMessage = sequelize.define('DirectMessage', {
  id:                   { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  senderId:             { type: DataTypes.UUID, allowNull: false },
  recipientId:          { type: DataTypes.UUID, allowNull: false },
  content:              { type: DataTypes.TEXT },
  mediaUrl:             { type: DataTypes.TEXT },
  mediaType:            { type: DataTypes.STRING(30) },
  isRead:               { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt:               { type: DataTypes.DATE },
  isDeletedBySender:    { type: DataTypes.BOOLEAN, defaultValue: false },
  isDeletedByRecipient: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'direct_messages',
  updatedAt: false,
  indexes: [
    { fields: ['sender_id', 'created_at'] },
    { fields: ['recipient_id', 'created_at'] },
  ],
});

module.exports = DirectMessage;
