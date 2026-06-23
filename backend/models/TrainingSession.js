'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrainingSession = sequelize.define('TrainingSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  jobId: { type: DataTypes.UUID, field: 'job_id' },
  title: { type: DataTypes.STRING(255) },
  questions: { type: DataTypes.JSONB },
  answers: { type: DataTypes.JSONB },
  overallScore: { type: DataTypes.DECIMAL(5, 2), field: 'overall_score' },
  aiFeedback: { type: DataTypes.TEXT, field: 'ai_feedback' },
  durationSecs: { type: DataTypes.INTEGER, field: 'duration_secs' },
  audioUrl: { type: DataTypes.TEXT, field: 'audio_url' },
  transcript: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(20), defaultValue: 'in_progress' },
  startedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: 'started_at' },
  completedAt: { type: DataTypes.DATE, field: 'completed_at' },
}, { tableName: 'training_sessions', timestamps: true, createdAt: 'created_at', updatedAt: false });



module.exports = TrainingSession;
