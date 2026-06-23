'use strict';
// frontend/src/pages/MainSite/Features/FeatureDetailPage.jsx

import { useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Mail, Mic, Map, Zap, Layout, MessageCircle,
  ArrowRight, ArrowLeft, Check, CheckCircle2, ChevronRight,
  Crown, Star, Sparkles, ArrowUpRight, Clock,
} from 'lucide-react';
import useLangStore from '../../../i18n';
import Header from '../../../layout/Header';
import { FEATURES_DATA } from '../../../data/featuresData';
import Footer from '../../../layout/Footer';
const ICON_MAP = { FileText, Mail, Mic, Map, Zap, Layout, MessageCircle };
function FeatureIcon({ name, size = 28, color }) {
  const Ic = ICON_MAP[name];
  return Ic ? <Ic size={size} color={color} strokeWidth={1.8} /> : null;
}

export default function FeatureDetailPage() {
  const { slug }       = useParams();
  const navigate       = useNavigate();
  const { lang, dir }  = useLangStore();
  const isAr           = lang === 'ar';
  const font           = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const Arrow          = isAr ? ArrowLeft : ArrowRight;

  const feature = FEATURES_DATA.find(f => f.slug === slug);
  const index   = FEATURES_DATA.findIndex(f => f.slug === slug);
  const prev    = index > 0                        ? FEATURES_DATA[index - 1] : null;
  const next    = index < FEATURES_DATA.length - 1 ? FEATURES_DATA[index + 1] : null;

  useEffect(() => {
    if (!feature) { navigate('/features', { replace: true }); return; }
    document.title = `${isAr ? feature.title.ar : feature.title.en} — TalexHub`;
    window.scrollTo(0, 0);
  }, [feature, isAr, navigate]);

  if (!feature) return null;

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', direction: dir, fontFamily: font }}>
      <Header />

      {/* ── Hero ── */}
      <section style={{ paddingTop: 100, paddingBottom: 60, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-secondary)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', insetInlineEnd: '-10%', top: '-20%', width: '50vw', height: '50vw', maxWidth: 600, borderRadius: '50%', background: 'var(--border)', opacity: 0.3, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', position: 'relative' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28, flexWrap: 'wrap' }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: font }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight size={12} color="var(--text-secondary)" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
            <Link to="/features" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: font }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? 'الميزات' : 'Features'}
            </Link>
            <ChevronRight size={12} color="var(--text-secondary)" style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: font }}>
              {isAr ? feature.title.ar : feature.title.en}
            </span>
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 52, alignItems: 'center' }}>
            {/* Left — text */}
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <FeatureIcon name={feature.icon} size={13} color="var(--text-secondary)" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: font }}>
                    {isAr ? feature.title.ar : feature.title.en}
                  </span>
                </div>
                {/* {feature.plan === 'free' ? (
                  <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-en)' }}>
                    <Check size={11} strokeWidth={2.5} /> {isAr ? 'مجاني' : 'Free'}
                  </span>
                ) : (
                  <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-en)' }}>
                    <Crown size={11} /> Pro
                  </span>
                )} */}
                {feature.badge && (
                  <span style={{ fontSize: 12, padding: '6px 12px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: font }}>
                    {isAr ? feature.badge.ar : feature.badge.en}
                  </span>
                )}
              </div>

              <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.03em', lineHeight: 1.1, fontFamily: font }}>
                {isAr ? feature.title.ar : feature.title.en}
              </h1>

              <p style={{ fontSize: 'clamp(15px,1.8vw,18px)', color: 'var(--text-secondary)', margin: '0 0 28px', lineHeight: 1.65, fontFamily: font }}>
                {isAr ? feature.tagline.ar : feature.tagline.en}
              </p>

              {/* CTA buttons - REMOVED Try for Free */}
              {/* No buttons here */}
            </div>

            {/* Right — feature icon display */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 220, height: 220,
                borderRadius: 40,
                background: 'var(--bg-secondary)',
                border: `2px solid var(--border)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                boxShadow: 'none',
              }}>
                <div style={{ position: 'absolute', inset: -20, borderRadius: 60, border: `1px solid var(--border)`, animation: 'ringPulse 3s ease-in-out infinite', opacity: 0.5 }} />
                <div style={{ position: 'absolute', inset: -40, borderRadius: 80, border: `1px solid var(--border)`, animation: 'ringPulse 3s ease-in-out infinite .5s', opacity: 0.3 }} />
                <FeatureIcon name={feature.icon} size={80} color="var(--text-secondary)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Description + Benefits ── */}
      <section style={{ maxWidth: 1100, margin: '48px auto', padding: '0 clamp(16px,4vw,40px) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, paddingBottom: 80, borderBottom: '1px solid var(--border)' }}>

          {/* Description */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 18 }}>
              <Sparkles size={12} color="var(--text-secondary)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-en)' }}>
                {isAr ? 'نبذة عن الميزة' : 'About'}
              </span>
            </div>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.75, fontFamily: font }}>
              {isAr ? feature.description.ar : feature.description.en}
            </p>
          </div>

          {/* Benefits */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 18 }}>
              <CheckCircle2 size={12} color="var(--text-secondary)" />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-en)' }}>
                {isAr ? 'ما ستحصل عليه' : 'What you get'}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {feature.benefits.map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Check size={11} color="var(--text-secondary)" strokeWidth={2.5} />
                  </div>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: font, lineHeight: 1.5 }}>
                    {isAr ? b.ar : b.en}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px clamp(16px,4vw,40px) 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 16 }}>
            <Clock size={12} color="var(--text-secondary)" />
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-en)' }}>
              {isAr ? 'كيف تعمل' : 'How it works'}
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', fontFamily: font }}>
            {isAr ? `ابدأ مع ${feature.title.ar} في 4 خطوات` : `Get started in 4 steps`}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
          {feature.howItWorks.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '28px 20px', background: 'var(--bg-secondary)', borderRadius: 16, border: '1px solid var(--border)', position: 'relative' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--bg-tertiary)', border: `2px solid var(--border)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 18, fontWeight: 900, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)',
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: font, lineHeight: 1.4 }}>
                {isAr ? step.ar : step.en}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner - REMOVED ── */}
      {/* No CTA banner */}

      {/* ── Other features ── */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '80px clamp(16px,4vw,40px) 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 32px', fontFamily: font }}>
          {isAr ? 'ميزات أخرى قد تهمك' : 'Explore More Features'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 16 }}>
          {FEATURES_DATA.filter(f => f.slug !== slug).slice(0, 4).map(f => (
            <Link key={f.slug} to={`/features/${f.slug}`} style={{ textDecoration: 'none', padding: '16px 20px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <FeatureIcon name={f.icon} size={18} color="var(--text-secondary)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, margin: 0, fontFamily: font, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isAr ? f.title.ar : f.title.en}
                </p>
                {/* <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', fontFamily: font }}>
                  {f.plan === 'free' ? (isAr ? 'مجاني' : 'Free') : 'Pro'}
                </p> */}
              </div>
            </Link>
          ))}
        </div>

        {/* Prev / Next */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, flexWrap: 'wrap', gap: 16 }}>
          {prev ? (
            <Link to={`/features/${prev.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, fontFamily: font, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
              {isAr ? prev.title.ar : prev.title.en}
            </Link>
          ) : <div />}
          {next && (
            <Link to={`/features/${next.slug}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 10, border: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: 13, fontFamily: font, transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {isAr ? next.title.ar : next.title.en}
              {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </Link>
          )}
        </div>
      </section>
      <Footer />

      <style>{`
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.04); opacity: .6; }
        }
      `}</style>
    </div>
  );
}