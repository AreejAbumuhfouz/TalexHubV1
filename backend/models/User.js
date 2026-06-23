

'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:                { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email:             { type: DataTypes.STRING(255), allowNull: false, unique: true },
  emailVerified:     { type: DataTypes.BOOLEAN, defaultValue: false },
  passwordHash:      { type: DataTypes.TEXT },
  role:              { type: DataTypes.ENUM('user','company','admin','support','moderator','account manager'), defaultValue: 'user' },
  status:            { type: DataTypes.ENUM('pending','active','suspended','deleted'), defaultValue: 'pending' },
  fullName:          { type: DataTypes.STRING(255) },
  phone:             { type: DataTypes.STRING(50) },
  phoneVerified:     { type: DataTypes.BOOLEAN, defaultValue: false },
  avatarUrl:         { type: DataTypes.TEXT },
  avatarKey:         { type: DataTypes.STRING, allowNull: true },
  headline:          { type: DataTypes.STRING(255) },
  bio:               { type: DataTypes.TEXT },
  locationCountry:   { type: DataTypes.STRING(100) },
  locationCity:      { type: DataTypes.STRING(100) },
  dateOfBirth:       { type: DataTypes.DATEONLY },
  gender:            { type: DataTypes.STRING(20) },
  nationality:       { type: DataTypes.STRING(100) },
  linkedinUrl:       { type: DataTypes.STRING(500) },
  portfolioUrl:      { type: DataTypes.STRING(500) },
  preferredLanguage: { type: DataTypes.STRING(10), defaultValue: 'ar' },
  desiredJobTitle:   { type: DataTypes.STRING(255) },
  
  // ✅ FIXED — ARRAY → TEXT مع getter/setter
 // ✅ FIXED — ARRAY → TEXT مع getter/setter
desiredIndustries: {
  type: DataTypes.TEXT,
  defaultValue: '[]',
  get() { try { return JSON.parse(this.getDataValue('desiredIndustries') || '[]'); } catch { return []; } },
  set(val) { this.setDataValue('desiredIndustries', JSON.stringify(val || [])); },
},
desiredLocations: {
  type: DataTypes.TEXT,

  defaultValue: '[]',
  get() { try { return JSON.parse(this.getDataValue('desiredLocations') || '[]'); } catch { return []; } },
  set(val) { this.setDataValue('desiredLocations', JSON.stringify(val || [])); },
},
desiredJobTypes: {
  type: DataTypes.TEXT,
  defaultValue: '[]',
  get() { try { return JSON.parse(this.getDataValue('desiredJobTypes') || '[]'); } catch { return []; } },
  set(val) { this.setDataValue('desiredJobTypes', JSON.stringify(val || [])); },
},
  
  desiredSalaryMin:  { type: DataTypes.DECIMAL(12, 2) },
  desiredSalaryMax:  { type: DataTypes.DECIMAL(12, 2) },
  openToWork:        { type: DataTypes.BOOLEAN, defaultValue: true },
  discoverable:      { type: DataTypes.BOOLEAN, defaultValue: true },
  autoApplyEnabled:  { type: DataTypes.BOOLEAN, defaultValue: false },
  twoFaEnabled:      { type: DataTypes.BOOLEAN, defaultValue: false },
  twoFaSecret:       { type: DataTypes.TEXT },
  lastLoginAt:       { type: DataTypes.DATE },
  lastLoginIp:       { type: DataTypes.INET },
  failedLoginCount:  { type: DataTypes.SMALLINT, defaultValue: 0 },
  lockedUntil:       { type: DataTypes.DATE },
  referralCode:      { type: DataTypes.STRING(20), unique: true },
  googleId:          { type: DataTypes.STRING(100), unique: true, allowNull: true },
  referredBy:        { type: DataTypes.UUID },
  planKey:           { type: DataTypes.STRING(20), defaultValue: 'free' },
  planExpiresAt:     { type: DataTypes.DATE, allowNull: true },
  planBillingPeriod: { type: DataTypes.STRING(10), allowNull: true },
  deletedAt:         { type: DataTypes.DATE },

  // ══════════════════════════════════════════════════════
  // CHAT ROOM SUSPENSION
  // ══════════════════════════════════════════════════════
  chatSuspendedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'تاريخ انتهاء التعليق من الغرف الصوتية — null = غير معلق',
  },
  chatSuspensionReason: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'سبب التعليق من الغرف الصوتية (يكتبه الأدمن)',
  },
  totalReportsAgainst: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'إجمالي عدد البلاغات المقدمة ضد هذا المستخدم',
  },
  totalReportsSubmitted: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'إجمالي عدد البلاغات اللي قدمها المستخدم',
  },

}, {
  tableName: 'users',
  paranoid:  true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['email'] },
    { fields: ['role', 'status'] },
    { fields: ['referral_code'] },
    { fields: ['google_id'] },
    { fields: ['chat_suspended_until'] },
  ],
});

// ════════════════════════════════════════════════════════════
// HOOKS
// ════════════════════════════════════════════════════════════
User.beforeCreate(async (user) => {
  if (!user.referralCode) {
    const crypto = require('crypto');
    user.referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  if (user.email) user.email = user.email.toLowerCase().trim();
});

User.beforeUpdate(async (user) => {
  if (user.changed('email') && user.email) {
    user.email = user.email.toLowerCase().trim();
  }
});

// ════════════════════════════════════════════════════════════
// INSTANCE METHODS
// ════════════════════════════════════════════════════════════
User.prototype.isChatSuspended = function() {
  if (!this.chatSuspendedUntil) return false;
  return new Date(this.chatSuspendedUntil) > new Date();
};

User.prototype.canJoinChatRooms = function() {
  if (this.status === 'suspended' || this.status === 'deleted') return false;
  return !this.isChatSuspended();
};

User.prototype.canCreateChatRoom = function() {
  if (!this.canJoinChatRooms()) return false;
  const planKey = this.planKey || 'free';
  const canCreate = { free: false, pro: true, elite: true };
  return canCreate[planKey] || false;
};

module.exports = User;