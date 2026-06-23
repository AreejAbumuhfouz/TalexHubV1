'use strict';
// ════════════════════════════════════════════════════════════
// backend/models/ContactMessage.js
// ════════════════════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const ContactMessage = sequelize.define('ContactMessage', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:    { type: DataTypes.UUID },  // null if not logged in

  // Sender info
  name:      { type: DataTypes.STRING(200), allowNull: false },
  email:     { type: DataTypes.STRING(300), allowNull: false },
  phone:     { type: DataTypes.STRING(30) },

  // Message
  subject:   { type: DataTypes.STRING(300), allowNull: false },
  category:  {
    type: DataTypes.ENUM('general', 'billing', 'technical', 'partnership', 'career', 'other'),
    defaultValue: 'general',
  },
  message:   { type: DataTypes.TEXT, allowNull: false },

  // Status
  status: {
    type: DataTypes.ENUM('new', 'read', 'replied', 'closed'),
    defaultValue: 'new',
  },

  // Admin reply
  replyText:   { type: DataTypes.TEXT },
  repliedBy:   { type: DataTypes.UUID },
  repliedAt:   { type: DataTypes.DATE },

  // Priority
  priority: {
    type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
    defaultValue: 'normal',
  },

  // Internal admin notes
  adminNote: { type: DataTypes.TEXT },
}, {
  tableName:  'contact_messages',
  indexes: [
    { fields: ['status'] },
    { fields: ['email']  },
    { fields: ['created_at'] },
  ],
});

module.exports = ContactMessage;
