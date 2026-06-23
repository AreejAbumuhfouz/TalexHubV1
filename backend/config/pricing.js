

'use strict';
// backend/config/pricing.js
// ════════════════════════════════════════════════════════════
// Per-country pricing — every Arab country has its own price
// in its own currency. Admin can override from DB.
// ════════════════════════════════════════════════════════════

// ── All Arab countries with local prices ─────────────────
// monthly/yearly prices are in LOCAL CURRENCY
// usdRate = approx 1 USD = X local currency (for admin display)
const COUNTRY_PRICING = {
  // ── Gulf ─────────────────────────────────────────────────
  AE: { name: 'UAE',          currency: 'AED', symbol: 'AED', usdRate: 3.67,
        pro: { monthly: 36,  yearly: 360  }, elite: { monthly: 73,  yearly: 720  } },
  SA: { name: 'Saudi Arabia', currency: 'SAR', symbol: 'SAR', usdRate: 3.75,
        pro: { monthly: 37,  yearly: 370  }, elite: { monthly: 74,  yearly: 740  } },
  KW: { name: 'Kuwait',       currency: 'KWD', symbol: 'KD',  usdRate: 0.31,
        pro: { monthly: 3,   yearly: 30   }, elite: { monthly: 6,   yearly: 60   } },
  QA: { name: 'Qatar',        currency: 'QAR', symbol: 'QAR', usdRate: 3.64,
        pro: { monthly: 36,  yearly: 360  }, elite: { monthly: 72,  yearly: 720  } },
  BH: { name: 'Bahrain',      currency: 'BHD', symbol: 'BD',  usdRate: 0.38,
        pro: { monthly: 3.5, yearly: 35   }, elite: { monthly: 7,   yearly: 70   } },
  OM: { name: 'Oman',         currency: 'OMR', symbol: 'OMR', usdRate: 0.38,
        pro: { monthly: 3.5, yearly: 35   }, elite: { monthly: 7,   yearly: 70   } },

  // ── Levant ───────────────────────────────────────────────
  JO: { name: 'Jordan',       currency: 'JOD', symbol: 'JD',  usdRate: 0.71,
        pro: { monthly: 4,   yearly: 40   }, elite: { monthly: 7,   yearly: 70   } },
  LB: { name: 'Lebanon',      currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 3.99,yearly: 39   }, elite: { monthly: 7.99,yearly: 79   } },
  SY: { name: 'Syria',        currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 2.99,yearly: 29   }, elite: { monthly: 5.99,yearly: 59   } },
  PS: { name: 'Palestine',    currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 2.99,yearly: 29   }, elite: { monthly: 5.99,yearly: 59   } },
  IQ: { name: 'Iraq',         currency: 'IQD', symbol: 'IQD', usdRate: 1310,
        pro: { monthly: 7900,yearly: 79000}, elite: { monthly: 13900,yearly: 139000} },

  // ── North Africa ─────────────────────────────────────────
  EG: { name: 'Egypt',        currency: 'EGP', symbol: 'EGP', usdRate: 48,
        pro: { monthly: 149, yearly: 1490 }, elite: { monthly: 299, yearly: 2990 } },
  MA: { name: 'Morocco',      currency: 'MAD', symbol: 'MAD', usdRate: 10,
        pro: { monthly: 59,  yearly: 590  }, elite: { monthly: 99,  yearly: 990  } },
  TN: { name: 'Tunisia',      currency: 'TND', symbol: 'TND', usdRate: 3.1,
        pro: { monthly: 12,  yearly: 120  }, elite: { monthly: 24,  yearly: 240  } },
  DZ: { name: 'Algeria',      currency: 'DZD', symbol: 'DZD', usdRate: 134,
        pro: { monthly: 799, yearly: 7990 }, elite: { monthly: 1299,yearly: 12990} },
  LY: { name: 'Libya',        currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 4.99,yearly: 49   }, elite: { monthly: 9.99,yearly: 99   } },
  SD: { name: 'Sudan',        currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },

  // ── Other Arab ───────────────────────────────────────────
  YE: { name: 'Yemen',        currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },
  SO: { name: 'Somalia',      currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },
  MR: { name: 'Mauritania',   currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },
  DJ: { name: 'Djibouti',     currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },
  KM: { name: 'Comoros',      currency: 'USD', symbol: '$',   usdRate: 1,
        pro: { monthly: 1.99,yearly: 19   }, elite: { monthly: 3.99,yearly: 39   } },

  // ── NEW: USA and International ───────────────────────────
  USA: { name: 'United States', currency: 'USD', symbol: '$', usdRate: 1,
        pro: { monthly: 7.99, yearly: 79.99 }, 
        elite: { monthly: 14.99, yearly: 149.99 } },
  UK: { name: 'United Kingdom', currency: 'GBP', symbol: '£', usdRate: 0.79,
        pro: { monthly: 6.99, yearly: 69.99 }, 
        elite: { monthly: 12.99, yearly: 129.99 } },
  EU: { name: 'Europe', currency: 'EUR', symbol: '€', usdRate: 0.92,
        pro: { monthly: 7.99, yearly: 79.99 }, 
        elite: { monthly: 14.99, yearly: 149.99 } },
  CA: { name: 'Canada', currency: 'CAD', symbol: 'C$', usdRate: 1.37,
        pro: { monthly: 9.99, yearly: 99.99 }, 
        elite: { monthly: 18.99, yearly: 189.99 } },
  AU: { name: 'Australia', currency: 'AUD', symbol: 'A$', usdRate: 1.51,
        pro: { monthly: 11.99, yearly: 119.99 }, 
        elite: { monthly: 21.99, yearly: 219.99 } },
};

// ── Default (for unknown country) ─────────────────────────
const DEFAULT_PRICING = {
  name: 'International', currency: 'USD', symbol: '$', usdRate: 1,
  pro:   { monthly: 7.99, yearly: 79.99 },
  elite: { monthly: 14.99, yearly: 149.99 },
};

// ── Free plan is always free everywhere ──────────────────
const FREE_PLAN = { monthly: 0, yearly: 0 };

// ── Plan features (override from DB via pricing.features key) ──
const PLAN_FEATURES = {
  free:  { cvUploads:1, aiAnalysis:1,  coverLetterDaily:1, training:1,  careerPathDaily:0, autoApplyDaily:0, chatDaily:10, jobApplications:5,   cvBuilder:false, courses:false, autoApply:false, prioritySupport:false, walletBonus:0    },
  pro:   { cvUploads:5, aiAnalysis:10, coverLetterDaily:10, training:5, careerPathDaily:3, autoApplyDaily:20, chatDaily:50, jobApplications:100, cvBuilder:true,  courses:true,  autoApply:true,  prioritySupport:false, walletBonus:1000 },
  elite: { cvUploads:-1,aiAnalysis:-1, coverLetterDaily:-1, training:-1, careerPathDaily:-1, autoApplyDaily:-1, chatDaily:-1, jobApplications:-1, cvBuilder:true,  courses:true,  autoApply:true,  prioritySupport:true,  walletBonus:3000 },
};

// ── Country code → pricing object ────────────────────────
function getPricingForCountry(cc) {
  return COUNTRY_PRICING[(cc || '').toUpperCase()] || DEFAULT_PRICING;
}

// ── Build full plans array for a country ─────────────────
function buildPlansForCountry(cc, featuresOverride) {
  const cp   = getPricingForCountry(cc);
  const feat = featuresOverride || PLAN_FEATURES;
  return [
    {
      key: 'free', name: 'Free', nameAr: 'مجاني',
      ...FREE_PLAN, monthly: 0, yearly: 0,
      currency: cp.currency, symbol: cp.symbol,
      features: feat.free || PLAN_FEATURES.free,
      savings: 0,
    },
    {
      key: 'pro', name: 'Pro', nameAr: 'احترافي',
      ...cp.pro,
      currency: cp.currency, symbol: cp.symbol,
      features: feat.pro || PLAN_FEATURES.pro,
      savings: cp.pro.monthly > 0 ? Math.round((1 - cp.pro.yearly / (cp.pro.monthly * 12)) * 100) : 0,
    },
    {
      key: 'elite', name: 'Elite', nameAr: 'النخبة',
      ...cp.elite,
      currency: cp.currency, symbol: cp.symbol,
      features: feat.elite || PLAN_FEATURES.elite,
      savings: cp.elite.monthly > 0 ? Math.round((1 - cp.elite.yearly / (cp.elite.monthly * 12)) * 100) : 0,
    },
  ];
}

// ── Legacy TIERS support (for admin backward compat) ─────
const TIERS = { global: { id: 'global', label: 'Global', currency: 'USD', symbol: '$', countries: [], plans: { free: FREE_PLAN, pro: DEFAULT_PRICING.pro, elite: DEFAULT_PRICING.elite } } };

const getTierForCountry = (cc) => {
  const cp = getPricingForCountry(cc);
  return {
    id:       cc || 'global',
    label:    cp.name,
    currency: cp.currency,
    symbol:   cp.symbol,
    plans:    { free: FREE_PLAN, pro: cp.pro, elite: cp.elite },
    countries: [cc],
  };
};

module.exports = {
  COUNTRY_PRICING,
  DEFAULT_PRICING,
  FREE_PLAN,
  PLAN_FEATURES,
  getPricingForCountry,
  buildPlansForCountry,
  TIERS,
  getTierForCountry,
};