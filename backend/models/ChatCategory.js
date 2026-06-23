'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatCategory = sequelize.define('ChatCategory', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  nameAr:      { type: DataTypes.STRING(100) },
  description: { type: DataTypes.TEXT },
  icon:        { type: DataTypes.STRING(50) },
  sortOrder:   { type: DataTypes.SMALLINT, defaultValue: 0 },
  createdBy:   { type: DataTypes.UUID },
}, {
  tableName: 'chat_categories',
  updatedAt: false,
});

module.exports = ChatCategory;
