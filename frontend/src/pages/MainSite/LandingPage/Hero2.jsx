import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';
import api from '../../../services/api';

/* ════════════════════════════════════════════════════════════
   Fallback match pairs (used if API fails / has no data)
   Each pair: a skill the candidate has, and the role the AI
   resolves it to, with a confidence score it "computes" live.
════════════════════════════════════════════════════════════ */
const FALLBACK_PAIRS_EN = [
  { skill: 'React + TypeScript, 3 yrs', role: 'Senior Frontend Engineer', score: 94 },
  { skill: 'SQL, dashboards, Python',   role: 'Data Analyst',             score: 91 },
  { skill: 'Figma, design systems',     role: 'Product Designer',         score: 96 },
  { skill: 'Node.js, AWS, Docker',      role: 'Backend Engineer',         score: 89 },
];
const FALLBACK_PAIRS_AR = [
  { skill: 'React وTypeScript، 3 سنوات', role: 'مهندس واجهات أمامية أول', score: 94 },
  { skill: 'SQL ولوحات بيانات وPython',  role: 'محلل بيانات',             score: 91 },
  { skill: 'Figma وأنظمة تصميم',         role: 'مصمم منتج',               score: 96 },
  { skill: 'Node.js وAWS وDocker',       role: 'مهندس باكند',             score: 89 },
];

/* ════════════════════════════════════════════════════════════
   MatchPanel — the signature element.
   Cycles: skill appears → scan sweep → role + score resolve →
   holds → fades to next pair. This is the product's actual
   mechanic (skills in, ranked role out), shown rather than
   told.
════════════════════════════════════════════════════════════ */
function MatchPanel({ pairs, isAr, isDark }) {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('scan'); // 'scan' -> 'resolved'
  const [animScore, setAnimScore] = useState(0);

  const current = pairs[idx];

  useEffect(() => {
    setPhase('scan');
    setAnimScore(0);
    const toResolved = setTimeout(() => setPhase('resolved'), 900);
    return () => clearTimeout(toResolved);
  }, [idx]);

  useEffect(() => {
    if (phase !== 'resolved') return;
    const target = current.score;
    const t0 = Date.now();
    const dur = 700;
    let raf;
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setAnimScore(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const advance = setTimeout(() => setIdx(i => (i + 1) % pairs.length), 2600);
    return () => { cancelAnimationFrame(raf); clearTimeout(advance); };
  }, [phase, current, pairs.length]);

  const matchClr = isDark ? '#34D399' : '#15803D';
  const matchBg  = isDark ? 'rgba(52,211,153,0.12)' : 'rgba(21,128,61,0.08)';
  const matchBd  = isDark ? 'rgba(52,211,153,0.35)' : 'rgba(21,128,61,0.25)';

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        width: '100%',
        maxWidth: 420,
        borderRadius: 16,
        border: '1px solid var(--border)',
        background: 'var(--bg-secondary, var(--bg-primary))',
        boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.04) inset' : '0 1px 0 rgba(0,0,0,0.02) inset',
        overflow: 'hidden',
      }}>
      {/* Header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 18px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: phase === 'resolved' ? matchClr : 'var(--text-secondary)',
            opacity: phase === 'resolved' ? 1 : 0.5,
            transition: 'background 0.3s ease',
          }} />
          <span style={{
            fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
            color: 'var(--text-secondary)', textTransform: isAr ? 'none' : 'uppercase',
            fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
          }}>
            {isAr ? 'مطابقة الذكاء الاصطناعي' : 'AI matching'}
          </span>
        </div>
        <span style={{
          fontSize: 11, color: 'var(--text-secondary)', opacity: 0.6,
          fontFamily: 'var(--font-en)', fontVariantNumeric: 'tabular-nums',
        }}>
          {String(idx + 1).padStart(2, '0')} / {String(pairs.length).padStart(2, '0')}
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 18px 24px' }}>
        {/* Skill row */}
        <div style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
            color: 'var(--text-secondary)', opacity: 0.65, marginBottom: 7,
            textTransform: isAr ? 'none' : 'uppercase',
            fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
          }}>
            {isAr ? 'مهاراتك' : 'Your skills'}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`skill-${idx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              style={{
                fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
                fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
              }}>
              {current.skill}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Scan / connector */}
        <div style={{ position: 'relative', height: 22, marginBottom: 14 }}>
          <div style={{
            position: 'absolute', top: '50%', left: 0, right: 0, height: 1,
            background: 'var(--border)', transform: 'translateY(-50%)',
          }} />
          <AnimatePresence>
            {phase === 'scan' && (
              <motion.div
                key={`scan-${idx}`}
                initial={{ left: '0%', opacity: 0 }}
                animate={{ left: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: '50%', width: 14, height: 14,
                  marginInlineStart: -7, marginTop: -7, borderRadius: '50%',
                  background: 'var(--text-primary)', opacity: 0.85,
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Role + score row */}
        <div style={{ minHeight: 56 }}>
          <AnimatePresence mode="wait">
            {phase === 'resolved' && (
              <motion.div
                key={`role-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em',
                    color: 'var(--text-secondary)', opacity: 0.65, marginBottom: 4,
                    textTransform: isAr ? 'none' : 'uppercase',
                    fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
                  }}>
                    {isAr ? 'أفضل تطابق' : 'Best match'}
                  </div>
                  <div style={{
                    fontSize: 17, fontWeight: 700, color: 'var(--text-primary)',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
                  }}>
                    {current.role}
                  </div>
                </div>
                <div style={{
                  flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 4,
                  padding: '7px 12px', borderRadius: 10,
                  background: matchBg, border: `1px solid ${matchBd}`,
                }}>
                  <span style={{
                    fontSize: 17, fontWeight: 800, color: matchClr,
                    fontFamily: 'var(--font-en)', fontVariantNumeric: 'tabular-nums',
                  }}>
                    {animScore}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: matchClr, fontFamily: 'var(--font-en)' }}>%</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HERO
════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr   = lang === 'ar';
  const isDark = theme === 'dark';

  const [pairs, setPairs] = useState(isAr ? FALLBACK_PAIRS_AR : FALLBACK_PAIRS_EN);

  /* Optionally pull admin-managed match examples from the API,
     falling back silently to the curated set above. */
  useEffect(() => {
    api.get('/public/hero-pills')
      .then(({ data }) => {
        const apiPills = data.data?.pills;
        if (Array.isArray(apiPills) && apiPills.length > 0) {
          const mapped = apiPills
            .filter(p => p.skill && p.role)
            .map(p => ({
              skill: isAr && p.skillAr ? p.skillAr : p.skill,
              role:  isAr && p.roleAr  ? p.roleAr  : p.role,
              score: typeof p.score === 'number' ? p.score : 90,
            }));
          if (mapped.length > 0) setPairs(mapped);
        }
      })
      .catch(() => {
        setPairs(isAr ? FALLBACK_PAIRS_AR : FALLBACK_PAIRS_EN);
      });
  }, [isAr]);

  const divClr = isDark
    ? 'linear-gradient(90deg,transparent,rgba(244,245,248,0.12),transparent)'
    : 'linear-gradient(90deg,transparent,rgba(26,26,30,0.10),transparent)';

  return (
    <section
      style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        overflow: 'hidden', background: 'var(--bg-primary)', paddingTop: 68,
      }}>
      <style>{`
        @keyframes heroFadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* Hairline grid — quiet structural texture, not decoration */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
        <defs>
          <pattern id="hGrid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M 64 0 L 0 0 0 64" fill="none" stroke={isDark ? 'rgba(244,245,248,0.045)' : 'rgba(26,26,30,0.045)'} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hGrid)" />
      </svg>

      <div
        dir={dir}
        style={{
          position: 'relative', zIndex: 10, maxWidth: 1180, width: '100%',
          margin: '0 auto', padding: '64px 24px',
          display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,420px)',
          gap: 56, alignItems: 'center',
        }}
        className="hero-grid">
        <style>{`
          @media (max-width: 880px) {
            .hero-grid { grid-template-columns: 1fr !important; }
            .hero-match-col { order: -1; margin: 0 auto 8px; }
          }
        `}</style>

        {/* ── Left: copy ── */}
        <div style={{ textAlign: isAr ? 'right' : 'left' }}>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 99, marginBottom: 22,
              border: '1px solid var(--border)', background: 'var(--bg-secondary, transparent)',
            }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-600)' }} />
            <span style={{
              fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
              {isAr ? 'يعمل بالذكاء الاصطناعي' : 'Powered by AI matching'}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.08 }}
            style={{
              fontSize: 'clamp(2.4rem,4.4vw,3.6rem)', fontWeight: 800,
              color: 'var(--text-primary)', lineHeight: 1.08, letterSpacing: '-0.03em',
              marginBottom: 20, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
            {isAr ? (
              <>مهاراتك تتحدث.<br />نحن نترجمها لفرصة.</>
            ) : (
              <>Your skills, read<br />by an AI that hires.</>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.16 }}
            style={{
              fontSize: 'clamp(15px,1.6vw,17px)', color: 'var(--text-secondary)',
              maxWidth: 460, lineHeight: 1.75, marginBottom: 34,
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
            {isAr
              ? 'ارفع سيرتك الذاتية، ودع الذكاء الاصطناعي يطابقها بدقة مع الوظائف الأنسب لك بناءً على خبرتك الفعلية.'
              : 'Upload your resume and let the AI score you against real openings — ranked by fit, not keywords.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1], delay: 0.24 }}
            style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40, justifyContent: isAr ? 'flex-end' : 'flex-start' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px',
              borderRadius: 11, fontSize: 14, fontWeight: 700, background: 'var(--text-primary)',
              color: 'var(--bg-primary)', textDecoration: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
              {isAr ? 'ابدأ مجاناً' : 'Get started free'}
            </Link>
            <Link to="/company/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px',
              borderRadius: 11, fontSize: 14, fontWeight: 600, background: 'transparent',
              border: '1.5px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'border-color 0.2s ease, color 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? 'أنا صاحب عمل' : "I'm hiring"}
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            style={{ maxWidth: 420, height: 1, background: divClr }} />
        </div>

        {/* ── Right: signature match panel ── */}
        <motion.div
          className="hero-match-col"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          style={{ display: 'flex', justifyContent: 'center' }}>
          <MatchPanel pairs={pairs} isAr={isAr} isDark={isDark} />
        </motion.div>
      </div>
    </section>
  );
}