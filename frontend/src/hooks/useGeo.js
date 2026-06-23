import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';

// ── Country data ──────────────────────────────────────────
const COUNTRY_TIER = {
  AE:'gulf', SA:'gulf', KW:'gulf', QA:'gulf', BH:'gulf', OM:'gulf',
  JO:'mena', EG:'mena', IQ:'mena', LB:'mena', SY:'mena', PS:'mena',
  MA:'mena', TN:'mena', DZ:'mena', LY:'mena',
  YE:'affordable', SD:'affordable', SO:'affordable',
  MR:'affordable', DJ:'affordable', KM:'affordable',
};

export const COUNTRY_NAMES = {
  AE:{ar:'الإمارات',en:'UAE'}, SA:{ar:'السعودية',en:'Saudi Arabia'},
  KW:{ar:'الكويت',en:'Kuwait'}, QA:{ar:'قطر',en:'Qatar'},
  BH:{ar:'البحرين',en:'Bahrain'}, OM:{ar:'عُمان',en:'Oman'},
  JO:{ar:'الأردن',en:'Jordan'}, EG:{ar:'مصر',en:'Egypt'},
  IQ:{ar:'العراق',en:'Iraq'}, LB:{ar:'لبنان',en:'Lebanon'},
  MA:{ar:'المغرب',en:'Morocco'}, TN:{ar:'تونس',en:'Tunisia'},
  DZ:{ar:'الجزائر',en:'Algeria'}, LY:{ar:'ليبيا',en:'Libya'},
  PS:{ar:'فلسطين',en:'Palestine'}, SY:{ar:'سوريا',en:'Syria'},
  YE:{ar:'اليمن',en:'Yemen'}, SD:{ar:'السودان',en:'Sudan'},
  US:{ar:'الولايات المتحدة',en:'United States'},
  GB:{ar:'المملكة المتحدة',en:'United Kingdom'},
  DE:{ar:'ألمانيا',en:'Germany'}, FR:{ar:'فرنسا',en:'France'},
  CA:{ar:'كندا',en:'Canada'}, AU:{ar:'أستراليا',en:'Australia'},
  TR:{ar:'تركيا',en:'Turkey'}, IN:{ar:'الهند',en:'India'},
  PK:{ar:'باكستان',en:'Pakistan'},
};

export const COUNTRY_FLAGS = {
  AE:'🇦🇪', SA:'🇸🇦', KW:'🇰🇼', QA:'🇶🇦', BH:'🇧🇭', OM:'🇴🇲',
  JO:'🇯🇴', EG:'🇪🇬', IQ:'🇮🇶', LB:'🇱🇧', MA:'🇲🇦', TN:'🇹🇳',
  DZ:'🇩🇿', LY:'🇱🇾', PS:'🇵🇸', SY:'🇸🇾', YE:'🇾🇪', SD:'🇸🇩',
  US:'🇺🇸', GB:'🇬🇧', DE:'🇩🇪', FR:'🇫🇷', CA:'🇨🇦', AU:'🇦🇺',
  TR:'🇹🇷', IN:'🇮🇳', PK:'🇵🇰',
};

export const TIER_LABELS = {
  gulf:       { ar:'منطقة الخليج',       en:'Gulf Region'    },
  mena:       { ar:'منطقة الشرق الأوسط', en:'MENA Region'    },
  affordable: { ar:'دول أخرى',           en:'Other Countries' },
  global:     { ar:'عالمي',              en:'Global'          },
};

// ── Timezone → country ─────────────────────────────────────
const TZ_MAP = {
  'Asia/Dubai':'AE','Asia/Riyadh':'SA','Asia/Kuwait':'KW',
  'Asia/Qatar':'QA','Asia/Bahrain':'BH','Asia/Muscat':'OM',
  'Asia/Amman':'JO','Africa/Cairo':'EG','Asia/Baghdad':'IQ',
  'Asia/Beirut':'LB','Africa/Casablanca':'MA','Africa/Tunis':'TN',
  'Africa/Algiers':'DZ','Africa/Tripoli':'LY','Asia/Hebron':'PS',
  'Asia/Damascus':'SY','Asia/Aden':'YE','Africa/Khartoum':'SD',
  'America/New_York':'US','America/Los_Angeles':'US','America/Chicago':'US',
  'Europe/London':'GB','Europe/Berlin':'DE','Europe/Paris':'FR',
  'America/Toronto':'CA','Australia/Sydney':'AU',
  'Asia/Istanbul':'TR','Asia/Kolkata':'IN','Asia/Karachi':'PK',
};

const fromTZ = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TZ_MAP[tz] || null;
  } catch { return null; }
};

let cachedCountry = null;

export default function useGeo() {
  const { user } = useAuthStore();
  const [state, setState] = useState({ country: null, tier: null, loading: true });

  useEffect(() => {
    const resolve = (cc) => {
      if (!cc || cc.length !== 2) return false;
      const country = cc.toUpperCase();
      const tier    = COUNTRY_TIER[country] || 'global';
      cachedCountry = country;
      setState({ country, tier, loading: false });
      return true;
    };

    // 1. Session cache
    if (cachedCountry) { resolve(cachedCountry); return; }

    // 2. Saved in user profile
    if (user?.locationCountry) { resolve(user.locationCountry); return; }

    // 3. Timezone — instant, no network
    const tzCC = fromTZ();
    if (tzCC) resolve(tzCC); // show immediately, may upgrade below

    // 4. Cloudflare /cdn-cgi/trace — BEST FREE SOURCE, no CORS issues
    fetch('https://www.cloudflare.com/cdn-cgi/trace', {
      signal: AbortSignal.timeout(3000)
    })
      .then(r => r.text())
      .then(text => {
        // Response format: "loc=JO\nip=1.2.3.4\n..."
        const m = text.match(/loc=([A-Z]{2})/);
        return m?.[1] || null;
      })
      .then(cc => {
        if (cc) { resolve(cc); return; }
        // 5. ipinfo.io fallback
        return fetch('https://ipinfo.io/json', { signal: AbortSignal.timeout(3000) })
          .then(r => r.json())
          .then(d => d?.country || null)
          .then(cc2 => {
            if (cc2) resolve(cc2);
            else if (!tzCC) resolve('AE');
          });
      })
      .catch(() => {
        if (!tzCC) resolve('AE');
      });

  }, [user?.locationCountry]);

  const country = state.country || 'AE';
  const tier    = state.tier    || 'gulf';

  return {
    country,
    tier,
    loading:     state.loading,
    countryFlag: COUNTRY_FLAGS[country] || '🌍',
    countryName: (lang) => COUNTRY_NAMES[country]?.[lang] || country,
    tierLabel:   (lang) => TIER_LABELS[tier]?.[lang] || tier,
    allCountries: COUNTRY_NAMES,
    allFlags:     COUNTRY_FLAGS,
  };
}