

'use strict';
// ════════════════════════════════════════════════════════════
// utils/detectCountry.js
// يستخدم في pricing, payment, و أي مكان يحتاج لمعرفة بلد المستخدم
// ════════════════════════════════════════════════════════════

/**
 * Detect user's country from various sources in order of priority
 * @param {Object} req - Express request object
 * @returns {string} - Country code (2 letters, uppercase) or 'USA' as default
 */
const detectCountry = (req) => {
  // 1. Cloudflare header (most reliable for production)
  const cf = req.headers['cf-ipcountry'];
  if (cf && cf !== 'XX' && cf.length === 2) return cf.toUpperCase();
  
  // 2. Custom country header (for testing or proxied requests)
  const xcc = req.headers['x-country-code'];
  if (xcc && xcc.length === 2) return xcc.toUpperCase();
  
  // 3. User's saved location from profile
  if (req.user?.locationCountry && req.user.locationCountry.length === 2) {
    return req.user.locationCountry.toUpperCase();
  }
  
  // 4. Query parameter (for debugging/testing)
  if (req.query?.country && req.query.country.length === 2) {
    return req.query.country.toUpperCase();
  }
  
  // 5. Default to USA (for international visitors)
  return 'USA';
};

module.exports = detectCountry;