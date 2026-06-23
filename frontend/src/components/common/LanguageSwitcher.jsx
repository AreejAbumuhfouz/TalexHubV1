
import useLangStore from '../../i18n';

/**
 * LanguageSwitcher — fully on design system CSS variables
 * Props:
 *   variant  'default' | 'ghost' | 'pill'
 */
export default function LanguageSwitcher({ variant = 'default' }) {
  const { lang, toggleLang } = useLangStore();
  const isAr = lang === 'ar';

  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '8px 8px', borderRadius: 10,
    cursor: 'pointer', fontSize: 12, fontWeight: 700,
    fontFamily: 'var(--font-en)',
    transition: 'all var(--transition)',
    letterSpacing: '0.04em',
    border: 'none', outline: 'none',
  };

  const variants = {
    default: {
      ...base,
      border: '1.5px solid var(--border)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
    },
    ghost: {
      ...base,
      border: '1.5px solid rgba(255,255,255,0.22)',
      background: 'rgba(255,255,255,0.08)',
      color: 'var(--text-primary)',
    },
    pill: {
      ...base,
      padding: '6px 12px', borderRadius: 99,
      border: '1.5px solid var(--border)',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
    },
  };

  const style = variants[variant] || variants.default;

  return (
    <button
      onClick={toggleLang}
      style={style}
      title={isAr ? 'Switch to English' : 'التبديل للعربية'}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent-400)';
        e.currentTarget.style.background  = 'var(--bg-tertiary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = style.border?.replace('1px solid ', '') || 'var(--border)';
        e.currentTarget.style.background  = style.background;
      }}
    >
      {isAr ? 'EN' : 'AR'}
    </button>
  );
}