'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CompanyMember = sequelize.define('CompanyMember', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  companyId:  { type: DataTypes.UUID, allowNull: false },
  userId:     { type: DataTypes.UUID, allowNull: false },
  role:       { type: DataTypes.STRING(50), defaultValue: 'hr' },
  invitedAt:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  acceptedAt: { type: DataTypes.DATE },
}, {
  tableName:  'company_members',
  timestamps: false,
});

module.exports = CompanyMember;
