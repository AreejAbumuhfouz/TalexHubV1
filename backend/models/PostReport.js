// 'use strict';

// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const PostReport = sequelize.define('PostReport', {
//   id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   reporterId: { type: DataTypes.UUID, allowNull: false },
//   postId:     { type: DataTypes.UUID },
//   commentId:  { type: DataTypes.UUID },
//   reason:     { type: DataTypes.STRING(100) },
//   details:    { type: DataTypes.TEXT },
//   resolved:   { type: DataTypes.BOOLEAN, defaultValue: false },
//   resolvedBy: { type: DataTypes.UUID },
// }, {
//   tableName: 'post_reports',
//   updatedAt: false,
// });

// module.exports = PostReport;
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostReport = sequelize.define('PostReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  commentId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reportedUserId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {  // ✅ Changed from 'details' to match your controller
    type: DataTypes.TEXT,
    allowNull: true,
  },
  reportType: {
    type: DataTypes.STRING(50),
    defaultValue: 'room',  // ✅ Changed to 'room' for chat rooms
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  resolutionAction: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  resolutionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
  },
  priority: {
    type: DataTypes.STRING(20),
    defaultValue: 'medium',
  },
}, {
  tableName: 'post_reports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = PostReport;