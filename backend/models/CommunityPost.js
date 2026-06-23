'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommunityPost = sequelize.define('CommunityPost', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:        { type: DataTypes.UUID, allowNull: false },
  category:      { type: DataTypes.ENUM('career_tips','job_search','company_review','general','success_story'), defaultValue: 'general' },
  content:       { type: DataTypes.TEXT, allowNull: false },
  mediaUrls:     { type: DataTypes.ARRAY(DataTypes.TEXT) },
  tags:          { type: DataTypes.ARRAY(DataTypes.TEXT) },
  isPinned:      { type: DataTypes.BOOLEAN, defaultValue: false },
  isHidden:      { type: DataTypes.BOOLEAN, defaultValue: false },
  likesCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
  commentsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  viewsCount:    { type: DataTypes.INTEGER, defaultValue: 0 },
  deletedAt:     { type: DataTypes.DATE },
}, {
  tableName: 'community_posts',
  paranoid:  true,
  indexes: [{ fields: ['user_id'] }, { fields: ['category'] }, { fields: ['created_at'] }],
});

module.exports = CommunityPost;
