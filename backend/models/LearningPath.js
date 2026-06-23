'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningPath = sequelize.define('LearningPath', {
  id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:             { type: DataTypes.UUID, allowNull: false },
  goal:               { type: DataTypes.TEXT },
  currentSkills:      { type: DataTypes.ARRAY(DataTypes.TEXT) },
  missingSkills:      { type: DataTypes.ARRAY(DataTypes.TEXT) },
  recommendedCourses: { type: DataTypes.ARRAY(DataTypes.UUID) },
  aiNotes:            { type: DataTypes.TEXT },
  generatedAt:        { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'learning_paths',
  createdAt: 'generated_at',
  updatedAt: 'updated_at',
});
LearningPath.associate = (models) => {
  LearningPath.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = LearningPath;