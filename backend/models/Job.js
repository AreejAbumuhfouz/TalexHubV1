
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Job = sequelize.define('Job', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  postedBy: {
    type: DataTypes.UUID,
  },
  categoryId: {
    type: DataTypes.UUID,
  },
  
  // ✅ FIXED — ENUM → STRING
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
  },
  
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  titleAr: {
    type: DataTypes.STRING(255),
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  descriptionAr: {
    type: DataTypes.TEXT,
  },
  
  // ✅ FIXED — ARRAY → TEXT مع getter/setter
  requirements: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('requirements') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('requirements', JSON.stringify(val || [])); },
  },
  benefits: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('benefits') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('benefits', JSON.stringify(val || [])); },
  },
  skillsRequired: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('skillsRequired') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('skillsRequired', JSON.stringify(val || [])); },
  },
  keywords: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('keywords') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('keywords', JSON.stringify(val || [])); },
  },
  
  // ✅ FIXED — ENUM → STRING
  jobType: {
    type: DataTypes.STRING(20),
    defaultValue: 'full_time',
  },
  
  locationCountry: {
    type: DataTypes.STRING(100),
  },
  locationCity: {
    type: DataTypes.STRING(100),
  },
  isRemote: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  salaryMin: {
    type: DataTypes.DECIMAL(12, 2),
  },
  salaryMax: {
    type: DataTypes.DECIMAL(12, 2),
  },
  salaryCurrency: {
    type: DataTypes.STRING(10),
    defaultValue: 'USD',
  },
  salaryVisible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  easyApply: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  applicationEmail: {
    type: DataTypes.STRING(255),
  },
  applicationUrl: {
    type: DataTypes.STRING(500),
  },
  deadline: {
    type: DataTypes.DATEONLY,
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  applicationsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  rejectionReason: {
    type: DataTypes.TEXT,
  },
  slug: {
    type: DataTypes.STRING(500),
    unique: true,
  },
  closedAt: {
    type: DataTypes.DATE,
  },
  deletedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'jobs',
  paranoid: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['status'] },
    { fields: ['category_id'] },
    { fields: ['created_at'] },
  ],
});

module.exports = Job;