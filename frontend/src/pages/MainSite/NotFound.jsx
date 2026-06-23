import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useLangStore from '../../i18n';
import useThemeStore from '../../store/themeStore';
import LogoGold from '../../assets/images/LogoGold.png';

export default function NotFound() {
  const { lang, dir }  = useLangStore();
  const { theme }      = useThemeStore();
  const navigate       = useNavigate();
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';
  const [count, setCount] = useState(8);

  /* Auto-redirect countdown */
  useEffect(() => {
    if (count <= 0) { navigate('/'); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  /* SEO */
  useEffect(() => {
    document.title = isAr ? 'الصفحة غير موجودة — TalexHub' : 'Page Not Found — TalexHub';
  }, [isAr]);

  const links = [
    { to: '/',         ar: 'الرئيسية',        en: 'Home'      },
    { to: '/jobs',     ar: 'تصفح الوظائف',    en: 'Browse Jobs' },
    { to: '/pricing',  ar: 'الأسعار',          en: 'Pricing'   },
    { to: '/support',  ar: 'الدعم',            en: 'Support'   },
  ];

  return (
    <div dir={dir} style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes nf_float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes nf_ring  {
          0%  { transform:translate(-50%,-50%) scale(1);   opacity:.12; }
          100%{ transform:translate(-50%,-50%) scale(1.7); opacity:0;   }
        }
        @keyframes nf_grid  { 0%,100%{opacity:.025} 50%{opacity:.05} }
      `}</style>

      {/* Subtle grid bg */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', animation:'nf_grid 5s ease-in-out infinite' }}>
        <defs>
          <pattern id="nfGrid" width="52" height="52" patternUnits="userSpaceOnUse">
            <path d="M 52 0 L 0 0 0 52" fill="none"
              stroke={isDark ? 'rgba(244,245,248,0.06)' : 'rgba(26,26,30,0.05)'}
              strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#nfGrid)" />
      </svg>

      {/* Pulse rings behind logo */}
      {[0,1].map(i => (
        <div key={i} style={{
          position: 'absolute', top: '42%', left: '50%',
          width: 280 + i * 160, height: 280 + i * 160,
          border: `1px solid ${isDark ? 'rgba(244,245,248,0.06)' : 'rgba(26,26,30,0.06)'}`,
          borderRadius: '50%', pointerEvents: 'none',
          animation: `nf_ring ${3 + i * 1.3}s ease-out ${i * 0.9}s infinite`,
        }} />
      ))}

      {/* Logo */}
      <Link to="/" style={{ textDecoration: 'none', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <img
          src={LogoGold}
          alt="TalexHub"
          style={{ height: 48, width: 'auto', objectFit: 'contain', animation: 'nf_float 3.5s ease-in-out infinite' }}
        />
      </Link>

      {/* 404 number */}
      <div style={{
        fontSize: 'clamp(6rem, 20vw, 12rem)',
        fontWeight: 800,
        color: 'var(--bg-tertiary)',
        letterSpacing: '-0.06em',
        lineHeight: 1,
        fontFamily: 'var(--font-en)',
        userSelect: 'none',
        position: 'relative', zIndex: 1,
        marginBottom: 4,
      }}>
        404
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(1.3rem, 3vw, 2rem)',
        fontWeight: 700, letterSpacing: '-0.02em',
        color: 'var(--text-primary)',
        marginBottom: 12, textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 15, color: 'var(--text-secondary)',
        maxWidth: 380, textAlign: 'center', lineHeight: 1.8,
        marginBottom: 36, position: 'relative', zIndex: 1,
      }}>
        {isAr
          ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها. سيتم توجيهك للرئيسية خلال لحظات.'
          : 'The page you\'re looking for doesn\'t exist or has been moved. You\'ll be redirected shortly.'}
      </p>

      {/* Primary CTA */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48, position: 'relative', zIndex: 1 }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 28px', borderRadius: 10,
          background: 'var(--text-primary)', color: 'var(--bg-primary)',
          fontSize: 14, fontWeight: 700, textDecoration: 'none',
          fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
          transition: 'opacity 0.2s, transform 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1';    e.currentTarget.style.transform = 'none'; }}>
          {isAr ? '← الرئيسية' : 'Go Home →'}
        </Link>
        <button onClick={() => navigate(-1)} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '11px 24px', borderRadius: 10,
          background: 'transparent', border: '1.5px solid var(--border)',
          color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
          cursor: 'pointer',
          fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
          transition: 'border-color 0.2s, color 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';      e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          {isAr ? 'رجوع' : 'Go Back'}
        </button>
      </div>

      {/* Quick links */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-en)' }}>
          {isAr ? 'روابط مفيدة' : 'Quick Links'}
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding: '7px 16px', borderRadius: 99,
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-secondary)',
              fontSize: 13, fontWeight: 500, textDecoration: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
              transition: 'all 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';      e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
              {isAr ? l.ar : l.en}
            </Link>
          ))}
        </div>
      </div>

      {/* Countdown */}
      <p style={{
        position: 'absolute', bottom: 28,
        fontSize: 12, color: 'var(--text-secondary)',
        fontFamily: 'var(--font-en)',
      }}>
        {isAr
          ? `توجيه تلقائي خلال ${count} ثانية`
          : `Auto-redirecting in ${count}s`}
      </p>
    </div>
  );
}