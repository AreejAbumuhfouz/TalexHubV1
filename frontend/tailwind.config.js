/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
        sans:   ['Tajawal', 'Cairo', 'sans-serif'],
        mono:   ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        navy: {
          950: '#05112A', 900: '#0A1E3D', 800: '#0F2744',
          700: '#1A3C6E', 600: '#1E4A87', 500: '#2E75B6',
          400: '#4A90D9', 300: '#7BB3E8', 100: '#C8DFFF', 50: '#EBF3FB',
        },
        gold: { 600: '#E5BE00', 500: '#FFD700', 400: '#FFE033', 100: '#FFF9DB' },
        brand: {
          bg:      '#F0F4F8',
          surface: '#FFFFFF',
          border:  '#E2E8F0',
        },
      },
      boxShadow: {
        card:    '0 4px 16px rgba(10,30,61,0.08), 0 2px 6px rgba(10,30,61,0.05)',
        'card-hover': '0 12px 40px rgba(10,30,61,0.12), 0 4px 12px rgba(10,30,61,0.07)',
        button:  '0 4px 14px rgba(26,60,110,0.3)',
        glow:    '0 0 32px rgba(46,117,182,0.25)',
        gold:    '0 0 24px rgba(255,215,0,0.3)',
        'inner-glow': 'inset 0 2px 8px rgba(46,117,182,0.1)',
      },
      borderRadius: {
        '4xl': '2rem', '5xl': '2.5rem',
      },
      backgroundImage: {
        'mesh':   'radial-gradient(at 20% 50%, rgba(46,117,182,0.4) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(255,215,0,0.1) 0px, transparent 50%), radial-gradient(at 60% 80%, rgba(26,60,110,0.6) 0px, transparent 50%)',
        'navy-gradient': 'linear-gradient(135deg, #05112A 0%, #0F2744 50%, #1A3C6E 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
};
