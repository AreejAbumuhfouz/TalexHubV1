'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  jobId:         { type: DataTypes.UUID, allowNull: false },
  userId:        { type: DataTypes.UUID, allowNull: false },
  cvId:          { type: DataTypes.UUID },
  status:        { type: DataTypes.ENUM('sent','viewed','shortlisted','interview','accepted','rejected'), defaultValue: 'sent' },
  matchScore:    { type: DataTypes.DECIMAL(5, 2) },
  aiSummary:     { type: DataTypes.TEXT },
  isAutoApplied: { type: DataTypes.BOOLEAN, defaultValue: false },
  applyMethod:   { type: DataTypes.STRING(50) },
  emailSentAt:   { type: DataTypes.DATE },
  emailOpenedAt: { type: DataTypes.DATE },
  coverLetter:   { type: DataTypes.TEXT },
  companyNote:   { type: DataTypes.TEXT },
  interviewAt:   { type: DataTypes.DATE },
  offerSalary:   { type: DataTypes.DECIMAL(12, 2) },
}, {
  tableName: 'job_applications',
  indexes: [
    { fields: ['job_id'] },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { unique: true, fields: ['job_id', 'user_id'] },
  ],
});

module.exports = JobApplication;
