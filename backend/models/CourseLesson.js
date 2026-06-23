'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseLesson = sequelize.define('CourseLesson', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  courseId:      { type: DataTypes.UUID, allowNull: false },
  title:         { type: DataTypes.STRING(255), allowNull: false },
  contentType:   { type: DataTypes.ENUM('video','pdf','article','quiz'), allowNull: false },
  fileUrl:       { type: DataTypes.TEXT },
  storageKey:    { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  durationSecs:  { type: DataTypes.INTEGER },
  sortOrder:     { type: DataTypes.SMALLINT, defaultValue: 0 },
  isFreePreview: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'course_lessons',
  updatedAt: false,
});

module.exports = CourseLesson;
