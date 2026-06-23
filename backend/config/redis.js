// config/redis.js
'use strict';

const { createClient } = require('redis'); // ✅ لازم تستورديه

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('❌ Redis: too many reconnect attempts');
        return new Error('Too many Redis reconnect attempts');
      }
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on('error', (err) => console.error('❌ Redis error:', err.message));
redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('reconnecting', () => console.warn('⚠️  Redis reconnecting...'));

module.exports = redisClient;