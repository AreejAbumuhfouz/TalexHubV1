'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobCategory = sequelize.define('JobCategory', {
  id:        { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  nameAr:    { type: DataTypes.STRING(100) },
  slug:      { type: DataTypes.STRING(100), unique: true },
  parentId:  { type: DataTypes.UUID },
  icon:      { type: DataTypes.STRING(50) },
  sortOrder: { type: DataTypes.SMALLINT, defaultValue: 0 },
}, {
  tableName:  'job_categories',
  timestamps: false,
});

module.exports = JobCategory;
