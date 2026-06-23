'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseCategory = sequelize.define('CourseCategory', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:     { type: DataTypes.STRING(100), allowNull: false },
  nameAr:   { type: DataTypes.STRING(100) },
  slug:     { type: DataTypes.STRING(100), unique: true },
  parentId: { type: DataTypes.UUID },
  icon:     { type: DataTypes.STRING(50) },
}, {
  tableName:  'course_categories',
  timestamps: false,
});

module.exports = CourseCategory;
