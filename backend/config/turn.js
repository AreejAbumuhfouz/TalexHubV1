'use strict';

// ════════════════════════════════════════════════════════════
// TURN/STUN Servers Configuration
// ════════════════════════════════════════════════════════════

const getIceServers = () => {
  const servers = [];

  // Google STUN (مجاني — دايمًا شغال)
  servers.push({
    urls: [
      'stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
    ],
  });

  // Cloudflare TURN (مجاني — سجّلي في Cloudflare Calls)
  if (process.env.CF_TURN_ID && process.env.CF_TURN_TOKEN) {
    servers.push({
      urls: `turn:turn.cloudflare.com:3478?transport=udp`,
      username: process.env.CF_TURN_ID,
      credential: process.env.CF_TURN_TOKEN,
    });
  }

  // Twilio TURN (احتياطي — عليه رصيد مجاني)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    // Twilio TURN بيتم إنشاؤه dynamically
    // هنستخدم endpoint مخصص
    servers.push({
      urls: 'turn:global.turn.twilio.com:3478?transport=udp',
      username: 'twilio',
      credential: 'twilio',
    });
  }

  // Open Relay TURN (للتطوير فقط — متستخدميهاش في production)
  if (process.env.NODE_ENV === 'development') {
    servers.push({
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    });
    servers.push({
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    });
  }

  return servers;
};

module.exports = { getIceServers };