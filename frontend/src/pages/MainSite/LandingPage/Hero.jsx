


import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';
import api from '../../../services/api';

/* ── Fallback pills (used if API fails) ──────────────────── */
const FALLBACK_AR = [];
const FALLBACK_EN = [];

/* ── Network Canvas ─────────────────────────────────────── */
function NetworkCanvas({ tags, hovIdx, w, h, isDark }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !w || !h) return;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    const rgb = isDark ? '244,245,248' : '26,26,30';
    const pts = tags.map(t => ({ x: t.x * w, y: t.y * h }));
    const MAX = 260;
    pts.forEach((a, i) => {
      pts.forEach((b, j) => {
        if (j <= i) return;
        const d = Math.hypot(b.x - a.x, b.y - a.y);
        if (d > MAX) return;
        const hov = i === hovIdx || j === hovIdx;
        const ratio = 1 - d / MAX;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${rgb},${(hov ? 0.5 : 0.08) * ratio})`;
        ctx.lineWidth = hov ? 1.2 : 0.5;
        ctx.stroke();
        if (hov && d < MAX * 0.7) {
          [a, b].forEach(p => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb},${ratio * 0.6})`; ctx.fill();
          });
        }
      });
    });
    pts.forEach((p, i) => {
      const hov = i === hovIdx;
      if (hov) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.06)`; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.85)`; ctx.fill();
      } else {
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},${hovIdx !== null ? 0.12 : 0.28})`; ctx.fill();
      }
    });
  }, [tags, hovIdx, w, h, isDark]);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />;
}

/* ── Typewriter ─────────────────────────────────────────── */
function Typewriter({ words, speed = 65, pause = 2600 }) {
  const [txt, setTxt] = useState('');
  const [wIdx, setWIdx] = useState(0);
  const [cIdx, setCIdx] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[wIdx]; let timer;
    if (!del && cIdx < word.length)        timer = setTimeout(() => setCIdx(c => c + 1), speed);
    else if (!del && cIdx === word.length) timer = setTimeout(() => setDel(true), pause);
    else if (del && cIdx > 0)              timer = setTimeout(() => setCIdx(c => c - 1), speed / 2);
    else { setDel(false); setWIdx(i => (i + 1) % words.length); }
    setTxt(word.substring(0, cIdx));
    return () => clearTimeout(timer);
  }, [cIdx, del, wIdx, words, speed, pause]);
  return (
    <span>
      {txt}
      <span style={{ display: 'inline-block', width: 3, height: '0.82em', background: 'var(--text-primary)', borderRadius: 2, verticalAlign: 'middle', marginInline: 2, animation: 'heroBlink 1s step-end infinite' }} />
    </span>
  );
}

/* ── StatCounter ─────────────────────────────────────────── */
function StatCounter({ to, suffix, label, delay }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now() + delay; const dur = 1400;
        const tick = () => {
          const now = Date.now();
          if (now < t0) { requestAnimationFrame(tick); return; }
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, delay]);
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(1.4rem,3vw,2.1rem)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1, fontFamily: 'var(--font-en)' }}>
        {val.toLocaleString()}{suffix}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 5, fontFamily: 'var(--font-en)' }}>
        {label}
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
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';

  const secRef   = useRef(null);
  const [dims,    setDims]  = useState({ w: 0, h: 0 });
  const [hovIdx,  setHov]   = useState(null);
  const [ready,   setReady] = useState(false);
  const [mousePos,setMouse] = useState({ x: 0.5, y: 0.5 });
  const [isDesktop, setIsDesktop] = useState(false);

  // Pills state — api or fallback
  const [pills, setPills] = useState(isAr ? FALLBACK_AR : FALLBACK_EN);

  /* ── Detect desktop (≥1024px) ── */
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Fetch pills from API (admin-managed or auto from DB) ── */
  useEffect(() => {
    api.get('/public/hero-pills')
      .then(({ data }) => {
        const apiPills = data.data?.pills;
        if (Array.isArray(apiPills) && apiPills.length > 0) {
          setPills(apiPills);
        }
      })
      .catch(() => {
        setPills(isAr ? FALLBACK_AR : FALLBACK_EN);
      });
  }, []);

  /* ── Measure section ── */
  useEffect(() => {
    const measure = () => {
      if (secRef.current) setDims({ w: secRef.current.offsetWidth, h: secRef.current.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (secRef.current) ro.observe(secRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!secRef.current) return;
    const r = secRef.current.getBoundingClientRect();
    setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
  }, []);

  /* ── Hover only — no navigation ── */
  const handlePillHover = useCallback((index) => {
    setHov(index);
  }, []);

  const handlePillLeave = useCallback(() => {
    setHov(null);
  }, []);

  const wordsAr = ['مستقبلك المهني', 'وظيفتك المثالية', 'مسارك الجديد', 'فرصتك القادمة'];
  const wordsEn = ['Your Dream Job', 'Your Next Career', 'Your New Chapter', 'Your Opportunity'];

  const glowRgb  = isDark ? '244,245,248' : '26,26,30';
  const ringClr  = isDark ? 'rgba(244,245,248,0.05)' : 'rgba(26,26,30,0.05)';
  const tagBg    = isDark ? 'rgba(44,45,49,0.88)' : 'rgba(240,241,246,0.88)';
  const tagBgH   = isDark ? 'rgba(53,54,59,0.98)' : 'rgba(255,255,255,0.98)';
  const tagBord  = isDark ? 'rgba(68,69,74,0.7)'  : 'rgba(220,222,228,0.9)';
  const underClr = isDark ? 'rgba(244,245,248,0.4)' : 'rgba(26,26,30,0.35)';
  const edgeFade = isDark
    ? 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.55))'
    : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.55))';
  const divClr = isDark
    ? 'linear-gradient(90deg,transparent,rgba(244,245,248,0.12),transparent)'
    : 'linear-gradient(90deg,transparent,rgba(26,26,30,0.10),transparent)';

  return (
    <section
      ref={secRef}
      onMouseMove={onMouseMove}
      style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg-primary)', paddingTop: 68 }}>
      <style>{`
        @keyframes heroBlink  { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes heroFA     { 0%{transform:translateY(0)} 100%{transform:translateY(-13px)} }
        @keyframes heroFB     { 0%{transform:translateY(0)} 100%{transform:translateY(-8px)}  }
        @keyframes heroFC     { 0%{transform:translateY(0)} 100%{transform:translateY(-18px)} }
        @keyframes heroPulse  { 0%{transform:translate(-50%,-50%) scale(1);opacity:.28} 100%{transform:translate(-50%,-50%) scale(1.6);opacity:0} }
        @keyframes heroGrid   { 0%,100%{opacity:.03} 50%{opacity:.06} }
        @keyframes heroScroll { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        @keyframes heroScan   { 0%{top:-2px} 100%{top:100%} }
      `}</style>

      {/* Grid */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, animation: 'heroGrid 5s ease-in-out infinite' }}>
        <defs>
          <pattern id="hGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke={isDark ? 'rgba(244,245,248,0.05)' : 'rgba(26,26,30,0.05)'} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hGrid)" />
      </svg>

      {/* Glows */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: `${8 + mousePos.y * 4}%`, right: `${10 + mousePos.x * 4}%`, width: 560, height: 560, borderRadius: '50%', background: `radial-gradient(circle, rgba(${glowRgb},0.07) 0%, transparent 68%)`, filter: 'blur(70px)', transition: 'top 0.9s ease, right 0.9s ease' }} />
        <div style={{ position: 'absolute', bottom: '6%', left: '8%', width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, rgba(${glowRgb},0.04) 0%, transparent 70%)`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', top: `${38 - mousePos.y * 3}%`, left: `${42 - mousePos.x * 2}%`, width: 680, height: 380, borderRadius: '50%', background: `radial-gradient(ellipse, rgba(${glowRgb},0.03) 0%, transparent 65%)`, filter: 'blur(55px)', transition: 'top 0.9s ease, left 0.9s ease' }} />
      </div>

      {/* Pulse rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: 600 + i * 220, height: 600 + i * 220, border: `1px solid ${ringClr}`, borderRadius: '50%', pointerEvents: 'none', zIndex: 0, animation: `heroPulse ${3.5 + i * 1.2}s ease-out ${i * 1.1}s infinite` }} />
      ))}

      {/* ── Network + Pills — DESKTOP ONLY (Hover only, no click) ── */}
      {isDesktop && (
        <>
          <NetworkCanvas tags={pills} hovIdx={hovIdx} w={dims.w} h={dims.h} isDark={isDark} />
          {pills.map((pill, i) => {
            const isHov  = hovIdx === i;
            const dimmed = hovIdx !== null && !isHov;
            const floatKF = ['heroFA', 'heroFB', 'heroFC'][i % 3];
            const dur   = (3.4 + (i % 5) * 0.6).toFixed(1);
            const delay = ((i * 0.37) % 3.5).toFixed(1);
            const nudgeX = ((i * 41 + 7) % 3 - 1) * 9;
            const label = isAr && pill.textAr ? pill.textAr : pill.text;
            return (
              <div
                key={i}
                onMouseEnter={() => handlePillHover(i)}
                onMouseLeave={handlePillLeave}
                title={isAr ? `بحث: ${label}` : `Search: ${label}`}
                style={{
                  position: 'absolute',
                  left: `${pill.x * 100}%`,
                  top: `${pill.y * 100}%`,
                  zIndex: isHov ? 15 : 2,
                  cursor: 'pointer',
                  opacity: ready ? (isHov ? 1 : dimmed ? 0.10 : 0.55) : 0,
                  transition: `opacity 0.35s ease ${i * 0.03}s`,
                  animation: ready ? `${floatKF} ${dur}s ease-in-out ${delay}s infinite alternate` : 'none',
                }}>
                <div style={{
                  padding: isHov ? '10px 18px' : '7px 14px',
                  borderRadius: 10,
                  background: isHov ? tagBgH : tagBg,
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                  border: `1px solid ${isHov ? 'var(--accent-600)' : tagBord}`,
                  boxShadow: isHov ? '0 8px 28px rgba(0,0,0,0.12)' : '0 2px 10px rgba(0,0,0,0.07)',
                  fontSize: isHov ? 13.5 : 12,
                  fontWeight: isHov ? 700 : 400,
                  color: isDark ? '#FFFFFF' : (isHov ? 'var(--accent-600)' : 'var(--text-secondary)'),
                  fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  transform: isHov ? `translate(${nudgeX}px,-6px) scale(1.1)` : 'none',
                  transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                }}>
                  {isHov && <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: isDark ? '#FFFFFF' : 'var(--accent-600)', marginInlineEnd: 8, verticalAlign: 'middle' }} />}

                  {label}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Center content */}
      <div dir={dir} style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: 'clamp(80px,12vw,140px) 24px clamp(60px,8vw,100px)', maxWidth: 760, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1], delay: 0.15 }}
          style={{ fontSize: 'clamp(2.4rem,6vw,5rem)', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
          {isAr ? (
            <>
              اكتشف{' '}
              <span style={{ position: 'relative', display: 'inline-block', minWidth: `${Math.max(...wordsAr.map(w => w.length))}ch`, textAlign: 'center' }}>
                <span>مسارك الجديد</span>
                <svg style={{ position: 'absolute', bottom: -8, insetInlineStart: 0, width: '100%', overflow: 'visible' }} viewBox="0 0 400 6" preserveAspectRatio="none">
                  <path d="M2 4 Q100 1 200 3.5 Q300 6 398 2" stroke={underClr} strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.62em', letterSpacing: '-0.01em' }}>بقوة الذكاء الاصطناعي</span>
            </>
          ) : (
            <>
              Discover{' '}
              <span style={{ position: 'relative', display: 'inline-block', minWidth: `${Math.max(...wordsEn.map(w => w.length))}ch`, textAlign: 'center' }}>
                <span>Your New Chapter </span>
                <svg style={{ position: 'absolute', bottom: -8, insetInlineStart: 0, width: '100%', overflow: 'visible' }} viewBox="0 0 500 6" preserveAspectRatio="none">
                  <path d="M2 4 Q125 1 250 3.5 Q375 6 498 2" stroke={underClr} strokeWidth="2" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '0.62em', letterSpacing: '-0.01em' }}>Powered by AI</span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ fontSize: 'clamp(15px,2vw,17px)', color: 'var(--text-secondary)', maxWidth: 500, lineHeight: 1.9, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', fontWeight: 400, marginBottom: 44 }}>
          {isAr
            ? 'ذكاء اصطناعي يحلل مهاراتك ويوصي بأفضل الوظائف المناسبة لك'
            : 'AI that analyzes your skills and recommends the best jobs for you'}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1], delay: 0.45 }}
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 52 }}>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'all 0.22s ease' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
            {isAr ? 'ابدأ مجاناً' : 'Get Started Free'}
          </Link>
          <Link to="/company/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px', borderRadius: 12, fontSize: 14, fontWeight: 600, background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'all 0.22s ease' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'none'; }}>
            {isAr ? 'أنا صاحب عمل' : "I'm Hiring"}
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1], delay: 0.6 }}
          style={{ width: '100%', maxWidth: 380, height: 1, background: divClr, marginBottom: 36 }} />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1], delay: 0.72 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 28, width: '100%', maxWidth: 520 }}>
          {/* Stats removed */}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div style={{ position: 'absolute', bottom: 28, left: '50%', animation: 'heroScroll 2s ease-in-out 2.5s infinite', opacity: 0.3, zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ width: 22, height: 36, border: '1.5px solid var(--border)', borderRadius: 99, display: 'flex', justifyContent: 'center', paddingTop: 6 }}>
          <div style={{ width: 4, height: 8, borderRadius: 99, background: 'var(--text-secondary)', animation: 'heroScan 1.6s ease-in-out infinite' }} />
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 100, background: edgeFade, pointerEvents: 'none', zIndex: 5 }} />
    </section>
  );
}