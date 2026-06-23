'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserConnection = sequelize.define('UserConnection', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  followerId:  { type: DataTypes.UUID, allowNull: false },
  followingId: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'user_connections',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['follower_id', 'following_id'] },
    { fields: ['follower_id'] },
    { fields: ['following_id'] },
  ],
});

module.exports = UserConnection;
