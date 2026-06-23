'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Newsletter = sequelize.define('Newsletter', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'unsubscribed', 'bounced'),
    defaultValue: 'active'
  },
  subscribedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'subscribed_at'
  },
  unsubscribedAt: {
    type: DataTypes.DATE,
    field: 'unsubscribed_at',
    allowNull: true
  },
  source: {
    type: DataTypes.ENUM('homepage', 'footer', 'popup', 'other'),
    defaultValue: 'footer'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    field: 'ip_address',
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    field: 'user_agent',
    allowNull: true
  }
}, {
  tableName: 'newsletter_subscribers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['email'] },
    { fields: ['status'] },
    { fields: ['subscribed_at'] }
  ]
});

module.exports = Newsletter;