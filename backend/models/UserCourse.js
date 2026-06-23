'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserCourse = sequelize.define('UserCourse', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  courseId:    { type: DataTypes.UUID, allowNull: false },
  progressPct: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0 },
  completed:   { type: DataTypes.BOOLEAN, defaultValue: false },
  completedAt: { type: DataTypes.DATE },
  paymentRef:  { type: DataTypes.STRING(255) },
  enrolledAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'user_courses',
  updatedAt: false,
  indexes: [{ unique: true, fields: ['user_id', 'course_id'] }],
});

module.exports = UserCourse;
