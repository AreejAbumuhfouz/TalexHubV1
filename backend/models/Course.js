// 'use strict';
// // ════════════════════════════════════════════════════════════
// // models/Course.js
// // ════════════════════════════════════════════════════════════

// const { DataTypes } = require('sequelize');
// const sequelize     = require('../config/database');

// const Course = sequelize.define('Course', {

//   // ── Identity ───────────────────────────────────────────────
//   id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
//   createdBy:  { type: DataTypes.UUID },
//   categoryId: { type: DataTypes.UUID },

//   // ── Content ────────────────────────────────────────────────
//   title:         { type: DataTypes.STRING(255), allowNull: false },
//   titleAr:       { type: DataTypes.STRING(255) },
//   description:   { type: DataTypes.TEXT },
//   descriptionAr: { type: DataTypes.TEXT },
//   thumbnailUrl:  { type: DataTypes.TEXT },
//   slug:          { type: DataTypes.STRING(500), unique: true },

//   // ── Classification ─────────────────────────────────────────
//   language:      { type: DataTypes.STRING(10),  defaultValue: 'ar' },
//   level:         { type: DataTypes.STRING(20),  defaultValue: 'beginner' },
//   tags:          { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
//   skillsCovered: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },

//   // ── Pricing ────────────────────────────────────────────────
//   price:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
//   currency:    { type: DataTypes.STRING(10),      defaultValue: 'USD' },
//   isFree:      { type: DataTypes.BOOLEAN,          defaultValue: false },
//   discountPct: { type: DataTypes.DECIMAL(5, 2),   defaultValue: 0 },

//   // ── PDF (Cloudflare R2) ────────────────────────────────────
//   pdfKey:          { type: DataTypes.TEXT },            // مفتاح R2: courses/uuid.pdf
//   pdfUrl:          { type: DataTypes.TEXT },            // رابط عام (لو الـ bucket public)
//   pdfSize:         { type: DataTypes.BIGINT },          // حجم الملف بالـ bytes
//   pdfName:         { type: DataTypes.STRING(500) },     // اسم الملف الأصلي
//   isFreeDownload:  { type: DataTypes.BOOLEAN, defaultValue: false }, // تحميل بدون تسجيل

//   // ── Status ─────────────────────────────────────────────────
//   status: {
//     type: DataTypes.ENUM('draft', 'published', 'archived'),
//     defaultValue: 'draft',
//   },

//   // ── Stats ──────────────────────────────────────────────────
//   enrolledCount: { type: DataTypes.INTEGER,       defaultValue: 0 },
//   downloadCount: { type: DataTypes.INTEGER,       defaultValue: 0 },
//   ratingAvg:     { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
//   ratingCount:   { type: DataTypes.INTEGER,       defaultValue: 0 },

// }, {
//   tableName: 'courses',
//   indexes: [
//     { fields: ['status'] },
//     { fields: ['category_id'] },
//     { fields: ['is_free'] },
//     { fields: ['language'] },
//     { fields: ['slug'], unique: true },
//   ],
// });

// module.exports = Course;
'use strict';
// ════════════════════════════════════════════════════════════
// models/Course.js
// ════════════════════════════════════════════════════════════

const { DataTypes } = require('sequelize');
const sequelize     = require('../config/database');

const Course = sequelize.define('Course', {

  // ── Identity ───────────────────────────────────────────────
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  createdBy:  { type: DataTypes.UUID },
  categoryId: { type: DataTypes.UUID },

  // ── Content ────────────────────────────────────────────────
  title:         { type: DataTypes.STRING(255), allowNull: false },
  titleAr:       { type: DataTypes.STRING(255) },
  description:   { type: DataTypes.TEXT },
  descriptionAr: { type: DataTypes.TEXT },
  thumbnailUrl:  { type: DataTypes.TEXT },
  slug:          { type: DataTypes.STRING(500), unique: true },

  // ── Classification ─────────────────────────────────────────
  language: { type: DataTypes.STRING(10), defaultValue: 'ar' },
  level:    { type: DataTypes.STRING(20), defaultValue: 'beginner' },

  // ✅ FIXED — ARRAY → TEXT مع getter/setter
  tags: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('tags') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('tags', JSON.stringify(val || [])); },
  },
  skillsCovered: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() { try { return JSON.parse(this.getDataValue('skillsCovered') || '[]'); } catch { return []; } },
    set(val) { this.setDataValue('skillsCovered', JSON.stringify(val || [])); },
  },

  // ── Pricing ────────────────────────────────────────────────
  price:       { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  currency:    { type: DataTypes.STRING(10),      defaultValue: 'USD' },
  isFree:      { type: DataTypes.BOOLEAN,          defaultValue: false },
  discountPct: { type: DataTypes.DECIMAL(5, 2),   defaultValue: 0 },

  // ── PDF (Cloudflare R2) ────────────────────────────────────
  pdfKey:         { type: DataTypes.TEXT },
  pdfUrl:         { type: DataTypes.TEXT },
  pdfSize:        { type: DataTypes.BIGINT },
  pdfName:        { type: DataTypes.STRING(500) },
  isFreeDownload: { type: DataTypes.BOOLEAN, defaultValue: false },

  // ── Status ─────────────────────────────────────────────────
  // ✅ FIXED — ENUM → STRING
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'draft',
  },

  // ── Stats ──────────────────────────────────────────────────
  enrolledCount: { type: DataTypes.INTEGER,       defaultValue: 0 },
  downloadCount: { type: DataTypes.INTEGER,       defaultValue: 0 },
  ratingAvg:     { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
  ratingCount:   { type: DataTypes.INTEGER,       defaultValue: 0 },

}, {
  tableName: 'courses',
  indexes: [
    { fields: ['status'] },
    { fields: ['category_id'] },
    { fields: ['is_free'] },
    { fields: ['language'] },
    { fields: ['slug'], unique: true },
  ],
});

module.exports = Course;