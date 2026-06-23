'use strict';

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

// NOTE: underscored:true and timestamps:true are inherited from database.js define config
// DO NOT override them here — that breaks the global snake_case mapping

const CV = sequelize.define('CV', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:          { type: DataTypes.UUID, allowNull: false },
  title:           { type: DataTypes.STRING(255) },
  status:          { type: DataTypes.ENUM('uploaded','generated','analysed'), defaultValue: 'uploaded' },
  isPrimary:       { type: DataTypes.BOOLEAN, defaultValue: false },
  fileUrl:         { type: DataTypes.TEXT },
  fileKey:         { type: DataTypes.TEXT },         // Cloudflare R2 object key
  fileName:        { type: DataTypes.STRING(255) },
  fileSize:        { type: DataTypes.INTEGER },
  fileType:        { type: DataTypes.STRING(50) },
  storageKey:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 },
  rawText:         { type: DataTypes.TEXT },         // extracted CV text for AI
  parsedContent:   { type: DataTypes.JSONB },
  analysisData:    { type: DataTypes.JSONB },        // full ATS analysis result
  extractedSkills: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  atsScore:        { type: DataTypes.SMALLINT },
  qualityScore:    { type: DataTypes.SMALLINT },
  overallScore:    { type: DataTypes.SMALLINT },
  aiFeedback:      { type: DataTypes.JSONB },
  isAnalyzed:      { type: DataTypes.BOOLEAN, defaultValue: false },
  keywords:        { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  builderData:     { type: DataTypes.JSONB },
  language:        { type: DataTypes.STRING(10), defaultValue: 'ar' },
}, {
  tableName: 'cvs',
  paranoid:  true,   // ← ONLY addition: enables soft delete via deleted_at column
  indexes: [
    { fields: ['user_id'] },
    { fields: ['user_id', 'is_primary'] },
  ],
});

module.exports = CV;