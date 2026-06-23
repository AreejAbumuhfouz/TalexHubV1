
'use strict';

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
  logging: false,
  pool: {
    max: 100,
    min: 10,
    acquire: 60000,
    idle: 30000,
    evict: 1000,
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production'
      ? { require: true, rejectUnauthorized: false }
      : false,
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 120000,
    query_timeout: 60000,
    connectionTimeoutMillis: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: false,
    paranoid: false,
  },
  retry: {
    max: 5,
  },
});

// ✅ إضافة معالج للأخطاء
sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL (Neon) connected successfully'))
  .catch(err => console.error('❌ PostgreSQL connection failed:', err.message));

module.exports = sequelize;