'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostComment = sequelize.define('PostComment', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  postId:     { type: DataTypes.UUID, allowNull: false },
  userId:     { type: DataTypes.UUID, allowNull: false },
  parentId:   { type: DataTypes.UUID },
  content:    { type: DataTypes.TEXT, allowNull: false },
  likesCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  isHidden:   { type: DataTypes.BOOLEAN, defaultValue: false },
  deletedAt:  { type: DataTypes.DATE },
}, {
  tableName: 'post_comments',
  paranoid:  true,
});

module.exports = PostComment;
