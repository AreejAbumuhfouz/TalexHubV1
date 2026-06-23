// 'use strict';

// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const ChatRoom = sequelize.define('ChatRoom', {
//   id:                 { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   categoryId:         { type: DataTypes.UUID },
//   createdBy:          { type: DataTypes.UUID },
//   name:               { type: DataTypes.STRING(255), allowNull: false },
//   nameAr:             { type: DataTypes.STRING(255) },
//   description:        { type: DataTypes.TEXT },
//   roomType:           { type: DataTypes.ENUM('text','voice','mixed'), defaultValue: 'text' },
//   accessType:         { type: DataTypes.ENUM('public','private','paid'), defaultValue: 'public' },
//   maxMembers:         { type: DataTypes.INTEGER, defaultValue: 500 },
//   freeMinutesPerWeek: { type: DataTypes.INTEGER, defaultValue: 60 },
//   paidPricePerHour:   { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
//   isPremium:          { type: DataTypes.BOOLEAN, defaultValue: false },
//   pricePerAccess:     { type: DataTypes.DECIMAL(8, 2), defaultValue: 0 },
//   isActive:           { type: DataTypes.BOOLEAN, defaultValue: true },
// }, {
//   tableName: 'chat_rooms',
// });

// module.exports = ChatRoom;

'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nameAr: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  roomType: {
    type: DataTypes.STRING(20),
    defaultValue: 'mixed',
  },
  accessType: {
    type: DataTypes.STRING(20),
    defaultValue: 'public',
  },
  maxMembers: {
    type: DataTypes.INTEGER,
    defaultValue: 500,
  },
  memberCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  maxStages: {
    type: DataTypes.INTEGER,
    defaultValue: 3,
  },
  stage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  planKey: {
    type: DataTypes.STRING(20),
    defaultValue: 'free',
  },
  creatorPlanKey: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  isPremium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  pricePerAccess: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  paidPricePerHour: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  freeMinutesPerWeek: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  closedReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active',
  },
  reportsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // ✅ FIXED — ARRAY → TEXT with JSON
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const raw = this.getDataValue('tags');
      if (!raw) return [];
      try {
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        return [];
      }
    },
    set(val) {
      this.setDataValue('tags', JSON.stringify(val || []));
    },
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'ar',
  },
  roomIcon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  allowRaiseHand: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  allowChat: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  recordingEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'chat_rooms',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['category_id'] },
    { fields: ['created_by'] },
    { fields: ['is_active'] },
    { fields: ['plan_key'] },
    { fields: ['status'] },
    { fields: ['expires_at'] },
  ],
});
ChatRoom.associate = (models) => {
  ChatRoom.belongsTo(models.User, { 
    as: 'creator',  // This matches what the error expects
    foreignKey: 'createdBy',
    targetKey: 'id'
  });
};
module.exports = ChatRoom;