'use strict';
// ════════════════════════════════════════════════════════════
// utils/isAr.js
// للتحقق إذا كان المستخدم يفضل اللغة العربية
// ════════════════════════════════════════════════════════════

/**
 * Check if user prefers Arabic language
 * @param {Object} req - Express request object
 * @returns {boolean} - true if Arabic, false otherwise
 */
const isAr = (req) => {
  // 1. Check user's saved preference
  if (req.user?.preferredLanguage === 'ar') return true;
  
  // 2. Check Accept-Language header
  const acceptLang = req.headers['accept-language'];
  if (acceptLang?.includes('ar')) return true;
  
  // 3. Check custom header
  if (req.headers['x-language'] === 'ar') return true;
  
  return false;
};

module.exports = isAr;