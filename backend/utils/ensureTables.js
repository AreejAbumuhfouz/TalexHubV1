'use strict';
const { sequelize } = require('../models');

const ensureTables = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS waitlist (
      id         SERIAL PRIMARY KEY,
      email      VARCHAR(255) UNIQUE NOT NULL,
      lang       VARCHAR(10)  DEFAULT 'en',
      ip         VARCHAR(45),
      created_at TIMESTAMPTZ  DEFAULT NOW()
    );
  `);
};

module.exports = ensureTables;