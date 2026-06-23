'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Company = sequelize.define('Company', {
  id:                     { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ownerId:                { type: DataTypes.UUID, allowNull: false },
  status:                 { type: DataTypes.ENUM('pending_review','active','suspended','rejected'), defaultValue: 'pending_review' },
  name:                   { type: DataTypes.STRING(255), allowNull: false },
  slug:                   { type: DataTypes.STRING(255), unique: true },
  logoUrl:                { type: DataTypes.TEXT },
  coverUrl:               { type: DataTypes.TEXT },
  website:                { type: DataTypes.STRING(500) },
  emailDomain:            { type: DataTypes.STRING(255), allowNull: false },
  applicationEmailFormat: { type: DataTypes.STRING(100), defaultValue: 'jobs' },
  industry:               { type: DataTypes.STRING(100) },
  companySize:            { type: DataTypes.STRING(50) },
  foundedYear:            { type: DataTypes.SMALLINT },
  description:            { type: DataTypes.TEXT },
  locationCountry:        { type: DataTypes.STRING(100) },
  locationCity:           { type: DataTypes.STRING(100) },
  address:                { type: DataTypes.TEXT },
  tradeLicenseUrl:        { type: DataTypes.TEXT },
  reviewedBy:             { type: DataTypes.UUID },
  reviewedAt:             { type: DataTypes.DATE },
  rejectionReason:        { type: DataTypes.TEXT },
  totalJobsPosted:        { type: DataTypes.INTEGER, defaultValue: 0 },
  totalHires:             { type: DataTypes.INTEGER, defaultValue: 0 },
  deletedAt:              { type: DataTypes.DATE },
}, {
  tableName: 'companies',
  paranoid:  true,
});

module.exports = Company;
