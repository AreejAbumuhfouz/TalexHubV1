'use strict';

// ════════════════════════════════════════════════════════════
// Settings Service — reads/writes from DB settings table
// Usage:
//   const { getSetting, setSetting } = require('./settings.service');
//   const val = await getSetting('allow_free_room_create'); // 'true' | 'false'
//   await setSetting('allow_free_room_create', 'true');
// ════════════════════════════════════════════════════════════

const { Setting } = require('../models');

// Simple in-memory cache — avoids DB hit on every request
const cache = new Map();
const CACHE_TTL = 30 * 1000; // 30 seconds

// const getSetting = async (key, defaultValue = 'false') => {
//   const cached = cache.get(key);
//   if (cached && Date.now() - cached.ts < CACHE_TTL) {
//     return cached.value;
//   }

//   try {
//     const row = await Setting.findByPk(key);
//     const value = row ? row.value : defaultValue;
//     cache.set(key, { value, ts: Date.now() });
//     return value;
//   } catch {
//     return defaultValue;
//   }
// };

// const setSetting = async (key, value) => {
//   await Setting.upsert({ key, value: String(value) });
//   // invalidate cache
//   cache.delete(key);
// };
const getSetting = async (key, defaultValue = null) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.value;
  }

  try {
    const row = await Setting.findByPk(key);
    if (!row) {
      cache.set(key, { value: defaultValue, ts: Date.now() });
      return defaultValue;
    }
    // ✅ Try to parse JSON, fall back to raw string
    let value;
    try { value = JSON.parse(row.value); }
    catch { value = row.value; }
    cache.set(key, { value, ts: Date.now() });
    return value;
  } catch {
    return defaultValue;
  }
};
const setSetting = async (key, value) => {
  const stored = typeof value === 'string' ? value : JSON.stringify(value);
  await Setting.upsert({ key, value: stored });
  cache.delete(key);
};

const getSettingBool = async (key, defaultValue = false) => {
  const val = await getSetting(key, String(defaultValue));
  return val === 'true';
};

module.exports = { getSetting, setSetting, getSettingBool };