

'use strict';
// frontend/src/pages/MainSite/Features/FeaturesPage.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Mail, Mic, Map, Zap, Layout, MessageCircle,
  ArrowRight, ArrowLeft, Check, Star, Crown,
  ChevronRight, Sparkles,
} from 'lucide-react';
import useLangStore from '../../../i18n';
import Header from '../../../layout/Header';
import { FEATURES_DATA } from '../../../data/featuresData';
import Footer from '../../../layout/Footer';

// ── Icon map ─────────────────────────────────────────────
const ICON_MAP = { FileText, Mail, Mic, Map, Zap, Layout, MessageCircle };

function FeatureIcon({ name, size = 24, color }) {
  const Ic = ICON_MAP[name];
  return Ic ? <Ic size={size} color={color} strokeWidth={1.8} /> : null;
}

// ── Plan badge ───────────────────────────────────────────
function PlanBadge({ plan, isAr, font }) {
  if (plan === 'free') return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-en)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <Check size={9} /> {isAr ? 'مجاني' : 'Free'}
    </span>
  );
  return (
    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-en)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <Crown size={9} /> Pro
    </span>
  );
}

// ── Feature card ─────────────────────────────────────────
function FeatureCard({ feature, isAr, font }) {
  const [hovered, setHovered] = useState(false);
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <Link
      to={`/features/${feature.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: hovered ? 'var(--bg-secondary)' : 'var(--bg-primary)',
        border: `1.5px solid ${hovered ? 'var(--text-primary)' : 'var(--border)'}`,
        borderRadius: 20,
        padding: '26px 24px',
        height: '100%',
        transition: 'all .25s cubic-bezier(0.4,0,0.2,1)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.08)' : 'none',
      }}>
        {/* Glow spot - removed colorful, using subtle neutral */}
        {hovered && (
          <div style={{
            position: 'absolute', top: -40, insetInlineEnd: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'var(--bg-tertiary)', pointerEvents: 'none',
          }} />
        )}

        <div style={{ position: 'relative' }}>
          {/* Icon + badge row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'var(--bg-secondary)',
              border: `1px solid var(--border)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'transform .25s',
              transform: hovered ? 'scale(1.08)' : 'scale(1)',
              flexShrink: 0,
            }}>
              <FeatureIcon name={feature.icon} size={24} color="var(--text-secondary)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              {/* <PlanBadge plan={feature.plan} isAr={isAr} font={font} /> */}
              {feature.badge && (
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: font }}>
                  {isAr ? feature.badge.ar : feature.badge.en}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 17, fontWeight: 800, margin: '0 0 8px',
            color: 'var(--text-primary)', fontFamily: font,
            lineHeight: 1.3,
          }}>
            {isAr ? feature.title.ar : feature.title.en}
          </h3>

          {/* Tagline */}
          <p style={{
            fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px',
            fontFamily: font, lineHeight: 1.55,
          }}>
            {isAr ? feature.tagline.ar : feature.tagline.en}
          </p>

          {/* Benefits preview (first 3) */}
          <div style={{ marginBottom: 18 }}>
            {feature.benefits.slice(0, 3).map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={10} color="var(--text-secondary)" strokeWidth={2.5} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font }}>
                  {isAr ? b.ar : b.en}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, fontFamily: font,
            transition: 'gap .2s',
          }}>
            {isAr ? 'استكشف الميزة' : 'Explore feature'}
            <Arrow size={14} style={{ transition: 'transform .2s', transform: hovered ? (isAr ? 'translateX(-4px)' : 'translateX(4px)') : 'none' }} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function FeaturesPage() {
  const { lang, dir } = useLangStore();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  useEffect(() => {
    document.title = isAr ? 'الميزات — TalexHub' : 'Features — TalexHub';
    window.scrollTo(0, 0);
  }, [isAr]);

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', direction: dir, fontFamily: font }}>
      <Header />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 120, paddingBottom: 72, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* bg decoration */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 500, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--text-primary)04, transparent)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)', position: 'relative' }}>
          <h1 style={{ fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, margin: '0 0 18px', letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: font, color: 'var(--text-primary)' }}>
            {isAr ? 'كل أدوات مسيرتك المهنية' : 'Every Tool Your Career Needs'}
          </h1>

          <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'var(--text-secondary)', margin: '0 0 36px', lineHeight: 1.65, fontFamily: font }}>
            {isAr
              ? 'منصة TalexHub تجمع قوة الذكاء الاصطناعي مع خبرة التوظيف في سوق العمل العربي لتمنحك ميزة تنافسية حقيقية'
              : 'TalexHub combines AI power with MENA hiring expertise to give you a real competitive edge in your job search'
            }
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: font, transition: 'opacity .2s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              {isAr ? 'ابدأ مجاناً' : 'Start for Free'}
              {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,4vw,32px) 100px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 'clamp(24px,3.5vw,38px)', fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.025em', fontFamily: font }}>
            {isAr ? 'استكشف جميع ميزاتنا' : 'Explore All Features'}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
            {isAr ? 'من تحليل السيرة إلى التقديم التلقائي، كل شيء في مكان واحد' : 'From CV analysis to auto-apply — everything in one place'}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: 20 }}>
          {FEATURES_DATA.map(f => (
            <FeatureCard key={f.slug} feature={f} isAr={isAr} font={font} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}