import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import ar from './ar';
import en from './en';

const translations = { ar, en };

// ── Store ─────────────────────────────────────────────────────
const useLangStore = create(
  persist(
    (set, get) => ({
      lang: 'ar',               // 'ar' | 'en'
      dir:  'rtl',              // 'rtl' | 'ltr'

      setLang: (lang) => set({
        lang,
        dir: lang === 'ar' ? 'rtl' : 'ltr',
      }),

      toggleLang: () => {
        const next = get().lang === 'ar' ? 'en' : 'ar';
        set({ lang: next, dir: next === 'ar' ? 'rtl' : 'ltr' });
        // Apply to <html> element
        document.documentElement.setAttribute('lang', next);
        document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
      },

      t: (key) => {
        const { lang } = get();
        const keys = key.split('.');
        let val = translations[lang];
        for (const k of keys) {
          if (val == null) return key;
          val = val[k];
        }
        return val ?? key;
      },
    }),
    {
      name: 'lang-storage',
      partialize: (s) => ({ lang: s.lang, dir: s.dir }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('lang', state.lang);
          document.documentElement.setAttribute('dir', state.dir);
        }
      },
    }
  )
);

export default useLangStore;
