import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';
import api from '../../../services/api';

/* ════════════════════════════════════════════════════════════
   Fallback platform stats (used if API has no data)
════════════════════════════════════════════════════════════ */
const FALLBACK_STATS_EN = [
  { value: 48000, suffix: '+', label: 'Candidates matched' },
  { value: 1200,  suffix: '+', label: 'Companies hiring' },
  { value: 96,    suffix: '%', label: 'Match accuracy' },
  { value: 3,     suffix: ' days', label: 'Avg. time to match' },
];
const FALLBACK_STATS_AR = [
  { value: 48000, suffix: '+', label: 'مرشح تمت مطابقتهم' },
  { value: 1200,  suffix: '+', label: 'شركة توظف الآن' },
  { value: 96,    suffix: '%', label: 'دقة المطابقة' },
  { value: 3,     suffix: ' أيام', label: 'متوسط وقت المطابقة' },
];

/* ── Single ledger row with count-up, triggered on view ── */
function LedgerRow({ value, suffix, label, isAr, delay, isLast }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now() + delay;
        const dur = 1100;
        const tick = () => {
          const now = Date.now();
          if (now < t0) { requestAnimationFrame(tick); return; }
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * value));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value, delay]);

  return (
    <div
      ref={ref}
      style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        padding: '16px 0', borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}>
      <span style={{
        fontSize: 13.5, color: 'var(--text-secondary)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 21, fontWeight: 700, color: 'var(--text-primary)',
        fontFamily: 'var(--font-en)', fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.01em', whiteSpace: 'nowrap',
      }}>
        {val.toLocaleString()}{suffix}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HERO — global platform register
════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr   = lang === 'ar';
  const isDark = theme === 'dark';

  const [stats, setStats] = useState(isAr ? FALLBACK_STATS_AR : FALLBACK_STATS_EN);

  /* Optional: pull admin-managed stats from API, fall back silently */
  useEffect(() => {
    api.get('/public/hero-pills')
      .then(({ data }) => {
        const apiPills = data.data?.pills;
        if (Array.isArray(apiPills) && apiPills.length > 0) {
          const mapped = apiPills
            .filter(p => typeof p.value === 'number' && (p.label || p.labelAr))
            .map(p => ({
              value: p.value,
              suffix: p.suffix || '',
              label: isAr && p.labelAr ? p.labelAr : p.label,
            }));
          if (mapped.length > 0) setStats(mapped);
        }
      })
      .catch(() => {
        setStats(isAr ? FALLBACK_STATS_AR : FALLBACK_STATS_EN);
      });
  }, [isAr]);

  return (
    <section
      style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'var(--bg-primary)', paddingTop: 68, overflow: 'hidden',
      }}>
      {/* faint structural rule across the top, global-platform-style */}
      <div style={{ position: 'absolute', top: 68, left: 0, right: 0, height: 1, background: 'var(--border)', opacity: 0.6 }} />

      <div
        dir={dir}
        style={{
          position: 'relative', zIndex: 1, maxWidth: 1180, width: '100%',
          margin: '0 auto', padding: '72px 24px',
          display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1px) minmax(0,0.85fr)',
          gap: 0, alignItems: 'start',
        }}
        className="hero-grid">
        <style>{`
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
            .hero-rule { display: none !important; }
            .hero-ledger { padding-inline-start: 0 !important; }
          }
        `}</style>

        {/* ── Left: text rail with left border ── */}
        <div style={{
          borderInlineStart: '2px solid var(--text-primary)',
          paddingInlineStart: 24,
          textAlign: isAr ? 'right' : 'left',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
              color: 'var(--text-secondary)', marginBottom: 18,
              textTransform: isAr ? 'none' : 'uppercase',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
            {isAr ? 'منصة توظيف عالمية مدعومة بالذكاء الاصطناعي' : 'AI-powered hiring, worldwide'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
            style={{
              fontSize: 'clamp(2.2rem,4vw,3.25rem)', fontWeight: 700,
              color: 'var(--text-primary)', lineHeight: 1.15, letterSpacing: '-0.025em',
              marginBottom: 22, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
            {isAr ? (
              <>مهاراتك تتحدث.<br />نحن نترجمها لفرصة.</>
            ) : (
              <>Your skills, read<br />by an AI that hires.</>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.16 }}
            style={{
              fontSize: 'clamp(15px,1.5vw,16.5px)', color: 'var(--text-secondary)',
              maxWidth: 480, lineHeight: 1.8, marginBottom: 36,
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
            {isAr
              ? 'ارفع سيرتك الذاتية، ودع الذكاء الاصطناعي يطابقها بدقة مع الوظائف الأنسب لك بناءً على خبرتك الفعلية.'
              : 'Upload your resume and let the AI score you against real openings — ranked by fit, not keywords.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.24 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
              borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'var(--text-primary)',
              color: 'var(--bg-primary)', textDecoration: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'opacity 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              {isAr ? 'ابدأ مجاناً' : 'Get started free'}
            </Link>
            <Link to="/company/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
              borderRadius: 8, fontSize: 14, fontWeight: 600, background: 'transparent',
              border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? 'أنا صاحب عمل' : "I'm hiring"}
            </Link>
          </motion.div>
        </div>

        {/* ── Center: vertical rule ── */}
        <div className="hero-rule" style={{ width: 1, background: 'var(--border)', height: '100%', justifySelf: 'center' }} />

        {/* ── Right: stat ledger — signature element ── */}
        <motion.div
          className="hero-ledger"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ paddingInlineStart: 40, paddingTop: 4 }}>
          <div style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.08em',
            color: 'var(--text-secondary)', opacity: 0.7, marginBottom: 4,
            textTransform: isAr ? 'none' : 'uppercase',
            fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
          }}>
            {isAr ? 'على المنصة' : 'On the platform'}
          </div>
          <div>
            {stats.map((s, i) => (
              <LedgerRow
                key={i}
                value={s.value}
                suffix={s.suffix}
                label={s.label}
                isAr={isAr}
                delay={i * 120}
                isLast={i === stats.length - 1}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* faint structural rule across the bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'var(--border)', opacity: 0.6 }} />
    </section>
  );
}