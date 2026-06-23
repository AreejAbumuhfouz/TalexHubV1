'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  actorId:    { type: DataTypes.UUID, allowNull: false },
  action:     { type: DataTypes.STRING(100), allowNull: false },
  entityType: { type: DataTypes.STRING(50) },
  entityId:   { type: DataTypes.UUID },
  oldValue:   { type: DataTypes.JSONB },
  newValue:   { type: DataTypes.JSONB },
  ipAddress:  { type: DataTypes.INET },
  userAgent:  { type: DataTypes.TEXT },
}, {
  tableName: 'audit_logs',
  updatedAt: false,
  indexes: [
    { fields: ['actor_id', 'created_at'] },
    { fields: ['entity_type', 'entity_id'] },
  ],
});

module.exports = AuditLog;
