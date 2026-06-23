import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Accent palettes ─────────────────────────────────────── */
export const ACCENTS = [
  {
    id:    'mono',
    label: 'Default',
    labelAr: 'افتراضي',
    dot:   '#1A1A1E',
    vars:  {
      '--accent-50':  '#F4F5F8',
      '--accent-100': '#E0E2E8',
      '--accent-400': '#6B6D76',
      '--accent-600': '#1A1A1E',
      '--accent-800': '#000000',
    },
  },
  {
    id:    'blue',
    label: 'Blue',
    labelAr: 'أزرق',
    dot:   '#2563EB',
    vars:  {
      '--accent-50':  '#EFF6FF',
      '--accent-100': '#DBEAFE',
      '--accent-400': '#3B82F6',
      '--accent-600': '#2563EB',
      '--accent-800': '#1D4ED8',
    },
  },
  {
    id:    'gold',
    label: 'Gold',
    labelAr: 'ذهبي',
    dot:   '#BD8E50',
    vars:  {
      '--accent-50':  '#FFFBEB',
      '--accent-100': '#FEF3C7',
      '--accent-400': '#F59E0B',
      '--accent-600': '#BD8E50',
      '--accent-800': '#92400E',
    },
  },
  {
    id:    'green',
    label: 'Green',
    labelAr: 'أخضر',
    dot:   '#16A34A',
    vars:  {
      '--accent-50':  '#F0FDF4',
      '--accent-100': '#DCFCE7',
      '--accent-400': '#22C55E',
      '--accent-600': '#16A34A',
      '--accent-800': '#14532D',
    },
  },
  {
    id:    'purple',
    label: 'Purple',
    labelAr: 'بنفسجي',
    dot:   '#7C3AED',
    vars:  {
      '--accent-50':  '#F5F3FF',
      '--accent-100': '#EDE9FE',
      '--accent-400': '#8B5CF6',
      '--accent-600': '#7C3AED',
      '--accent-800': '#5B21B6',
    },
  },
  {
    id:    'rose',
    label: 'Rose',
    labelAr: 'وردي',
    dot:   '#E11D48',
    vars:  {
      '--accent-50':  '#FFF1F2',
      '--accent-100': '#FFE4E6',
      '--accent-400': '#FB7185',
      '--accent-600': '#E11D48',
      '--accent-800': '#9F1239',
    },
  },
];

/* ── Apply theme + accent to DOM ─────────────────────────── */
const applyTheme = (theme) => {
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
};

const applyAccent = (accentId) => {
  const palette = ACCENTS.find(a => a.id === accentId) || ACCENTS[0];
  const root    = document.documentElement;
  Object.entries(palette.vars).forEach(([k, v]) => root.style.setProperty(k, v));
};

/* ── Store ───────────────────────────────────────────────── */
const useThemeStore = create(
  persist(
    (set, get) => ({
      theme:  'light',
      accent: 'mono',

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ theme: next });
      },

      setAccent: (accentId) => {
        applyAccent(accentId);
        set({ accent: accentId });
      },

      // Call once on app mount
      init: () => {
        applyTheme(get().theme);
        applyAccent(get().accent);

        // Watch system preference changes
        if (get().theme === 'system') {
          window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            applyTheme('system');
          });
        }
      },
    }),
    { name: 'TalexHub-theme' }
  )
);

export default useThemeStore;
