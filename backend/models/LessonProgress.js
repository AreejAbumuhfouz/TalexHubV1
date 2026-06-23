'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LessonProgress = sequelize.define('LessonProgress', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:      { type: DataTypes.UUID, allowNull: false },
  lessonId:    { type: DataTypes.UUID, allowNull: false },
  completed:   { type: DataTypes.BOOLEAN, defaultValue: false },
  watchedSecs: { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'lesson_progress',
  createdAt: false,
  updatedAt: 'updated_at',
  indexes: [{ unique: true, fields: ['user_id', 'lesson_id'] }],
});

module.exports = LessonProgress;
