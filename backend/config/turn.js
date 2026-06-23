// 'use strict';

// // ════════════════════════════════════════════════════════════
// // TURN/STUN Servers Configuration
// // ════════════════════════════════════════════════════════════

// const getIceServers = () => {
//   const servers = [];

//   // Google STUN (مجاني — دايمًا شغال)
//   servers.push({
//     urls: [
//       'stun:stun.l.google.com:19302',
//       'stun:stun1.l.google.com:19302',
//     ],
//   });

//   // Cloudflare TURN (مجاني — سجّلي في Cloudflare Calls)
//   if (process.env.CF_TURN_ID && process.env.CF_TURN_TOKEN) {
//     servers.push({
//       urls: `turn:turn.cloudflare.com:3478?transport=udp`,
//       username: process.env.CF_TURN_ID,
//       credential: process.env.CF_TURN_TOKEN,
//     });
//   }

//   // Twilio TURN (احتياطي — عليه رصيد مجاني)
//   if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
//     // Twilio TURN بيتم إنشاؤه dynamically
//     // هنستخدم endpoint مخصص
//     servers.push({
//       urls: 'turn:global.turn.twilio.com:3478?transport=udp',
//       username: 'twilio',
//       credential: 'twilio',
//     });
//   }

//   // Open Relay TURN (للتطوير فقط — متستخدميهاش في production)
//   if (process.env.NODE_ENV === 'development') {
//     servers.push({
//       urls: 'turn:openrelay.metered.ca:443',
//       username: 'openrelayproject',
//       credential: 'openrelayproject',
//     });
//     servers.push({
//       urls: 'turn:openrelay.metered.ca:443?transport=tcp',
//       username: 'openrelayproject',
//       credential: 'openrelayproject',
//     });
//   }

//   return servers;
// };

// module.exports = { getIceServers };

'use strict';

/**
 * ╔══════════════════════════════════════════════════════╗
 * ║         config/redis.js — نسخة بدون Redis           ║
 * ║   نفس الـ interface القديم حتى ما تكسر أي كود       ║
 * ╚══════════════════════════════════════════════════════╝
 */

const { memCache } = require('../utils/memCache');

/**
 * ✅ Fake Redis Client
 * يحاكي أوامر Redis الأساسية اللي بتستخدمها في مشروعك
 * بدون أي اتصال خارجي
 */
const redisClient = {

  // ── الأوامر الأساسية ──────────────────────────────────

  /** GET key */
  get: (key) => {
    const val = memCache.get(key);
    return Promise.resolve(val !== null ? JSON.stringify(val) : null);
  },

  /** SET key value [EX seconds] */
  set: (key, value, options) => {
    const ttl = options?.EX ?? options?.ex ?? null;
    try {
      memCache.set(key, JSON.parse(value), ttl);
    } catch {
      memCache.set(key, value, ttl);
    }
    return Promise.resolve('OK');
  },

  /** DEL key */
  del: (key) => {
    memCache.del(key);
    return Promise.resolve(1);
  },

  /** EXISTS key */
  exists: (key) => Promise.resolve(memCache.has(key) ? 1 : 0),

  /** EXPIRE key seconds */
  expire: (key, seconds) => {
    const val = memCache.get(key);
    if (val !== null) memCache.set(key, val, seconds);
    return Promise.resolve(1);
  },

  /** TTL key — returns -1 (not tracked externally) */
  ttl: (_key) => Promise.resolve(-1),

  /** PING */
  ping: () => Promise.resolve('PONG'),

  /** FLUSHALL */
  flushAll: () => {
    memCache.flush();
    return Promise.resolve('OK');
  },

  // ── Hash Commands ─────────────────────────────────────

  /** HSET key field value */
  hSet: (key, field, value) => {
    const hash = memCache.get(key) || {};
    hash[field] = value;
    memCache.set(key, hash);
    return Promise.resolve(1);
  },

  /** HGET key field */
  hGet: (key, field) => {
    const hash = memCache.get(key);
    return Promise.resolve(hash ? hash[field] ?? null : null);
  },

  /** HGETALL key */
  hGetAll: (key) => Promise.resolve(memCache.get(key) || {}),

  /** HDEL key field */
  hDel: (key, field) => {
    const hash = memCache.get(key);
    if (hash) {
      delete hash[field];
      memCache.set(key, hash);
    }
    return Promise.resolve(1);
  },

  // ── Lifecycle ─────────────────────────────────────────

  /** connect() — لا شيء يتعمل */
  connect: () => {
    console.log('✅ Cache ready (in-memory — no Redis needed)');
    return Promise.resolve();
  },

  /** quit() — لا شيء يتوقف */
  quit: () => {
    console.log('✅ Cache closed (in-memory)');
    return Promise.resolve();
  },

  /** disconnect() */
  disconnect: () => Promise.resolve(),

  // ── Events — بيقبل .on() بدون ما يكسر الكود ──────────
  on: (_event, _cb) => redisClient,

  // ── isReady flag ─────────────────────────────────────
  isReady: true,
};

module.exports = redisClient;