
'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId:    { type: DataTypes.UUID, allowNull: false },
  postId:    { type: DataTypes.UUID },
  commentId: { type: DataTypes.UUID },
}, {
  tableName: 'post_likes',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'post_id'] },
    { unique: true, fields: ['user_id', 'comment_id'] },
  ],
});

module.exports = PostLike;