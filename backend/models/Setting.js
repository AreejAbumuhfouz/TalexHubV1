'use strict';
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Setting = sequelize.define('Setting', {
  key:   { type: DataTypes.STRING(100), primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false, defaultValue: 'false' },
}, {
  tableName: 'settings',
  createdAt: false,
  updatedAt: 'updated_at',
});

module.exports = Setting;