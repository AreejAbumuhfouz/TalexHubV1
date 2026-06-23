

'use strict';
// frontend/src/pages/MainSite/AboutPage.jsx
// ════════════════════════════════════════════════════════════
// صفحة "عن المنصة" — احترافية ومحسّنة لـ SEO
// ════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useLangStore from '../../i18n';
import useThemeStore from '../../store/themeStore';
import {
  Target, Lightbulb, Heart, Globe, Award, TrendingUp,
  Zap, Shield, Star, ArrowRight, ArrowLeft,
  Building2, Sparkles, Brain, Cpu, FileText, Mic, Map,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════
//  SEO — Inject meta tags + JSON-LD into <head>
// ════════════════════════════════════════════════════════════
function SEOHead({ isAr }) {
  useEffect(() => {
    document.title = isAr
      ? 'عن TalexHub | منصة التوظيف الذكية لسوق العمل العربي'
      : 'About TalexHub | AI-Powered Career Platform for the Arab World';

    const setMeta = (attr, val, content) => {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, val); document.head.appendChild(el); }
      el.setAttribute('content', content);
    };

    setMeta('name', 'description',
      isAr
        ? 'TalexHub منصة توظيف ذكية مدعومة بالذكاء الاصطناعي للسوق العربي — تحليل السيرة الذاتية، توليد خطابات التقديم، تدريب المقابلات، والتقديم التلقائي.'
        : 'TalexHub is an AI-powered career platform for the Arab job market — CV analysis, cover letter generation, interview training, auto-apply, and more.'
    );
    setMeta('name', 'keywords',
      'TalexHub, AI jobs, Arab job market, CV analysis, cover letter AI, interview training, career platform, MENA jobs'
    );
    setMeta('name', 'author', 'TalexHub');
    setMeta('name', 'robots', 'index, follow');

    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'TalexHub');
    setMeta('property', 'og:title', isAr ? 'عن TalexHub' : 'About TalexHub');
    setMeta('property', 'og:description', isAr
      ? 'منصة التوظيف الذكية للسوق العربي — مدعومة بالذكاء الاصطناعي'
      : 'The AI-powered career platform for the Arab job market'
    );
    setMeta('property', 'og:url', 'https://TalexHub.com/about');
    setMeta('property', 'og:locale', isAr ? 'ar_AE' : 'en_US');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:site', '@TalexHub');
    setMeta('name', 'twitter:title', isAr ? 'عن TalexHub' : 'About TalexHub');

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = 'https://TalexHub.com/about';

    const addHreflang = (hl, href) => {
      if (!document.querySelector(`link[hreflang="${hl}"]`)) {
        const l = document.createElement('link'); l.rel = 'alternate'; l.hreflang = hl; l.href = href;
        document.head.appendChild(l);
      }
    };
    addHreflang('ar', 'https://TalexHub.com/about?lang=ar');
    addHreflang('en', 'https://TalexHub.com/about?lang=en');
    addHreflang('x-default', 'https://TalexHub.com/about');

    const existingLd = document.querySelector('#ld-about');
    if (existingLd) existingLd.remove();
    const script = document.createElement('script');
    script.id = 'ld-about';
    script.type = 'application/ld+json';
    script.text = JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': 'https://TalexHub.com/#organization',
        name: 'TalexHub',
        url: 'https://TalexHub.com',
        description: 'AI-powered career platform for the Arab job market',
        foundingDate: '2024',
        knowsLanguage: ['ar', 'en'],
      },
    ]);
    document.head.appendChild(script);

    return () => {
      const s = document.querySelector('#ld-about');
      if (s) s.remove();
    };
  }, [isAr]);

  return null;
}

// ════════════════════════════════════════════════════════════
//  ANIMATION HOOK
// ════════════════════════════════════════════════════════════
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVis(true); obs.disconnect(); }
    }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, vis];
}

function Reveal({ children, delay = 0, y = 32 }) {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'none' : `translateY(${y}px)`,
      transition: `opacity 0.72s cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 0.72s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const VALUES = [
  {
    icon: Lightbulb,
    ar: { title: 'الابتكار المستمر', desc: 'نستخدم أحدث تقنيات الذكاء الاصطناعي لنمنحك ميزة حقيقية في سوق عمل سريع التطور.' },
    en: { title: 'Continuous Innovation', desc: 'We leverage cutting-edge AI to give you a real edge in a fast-evolving job market.' },
  },
  {
    icon: Heart,
    ar: { title: 'المستخدم أولاً', desc: 'كل قرار نتخذه يبدأ بسؤال واحد: كيف نجعل تجربة الباحث عن عمل أفضل؟' },
    en: { title: 'User First', desc: 'Every decision starts with one question: how do we make the job seeker\'s experience better?' },
  },
  {
    icon: Shield,
    ar: { title: 'الشفافية والأمان', desc: 'أسعار واضحة، بلا رسوم مخفية، وحماية كاملة لبياناتك الشخصية والمهنية.' },
    en: { title: 'Transparency & Trust', desc: 'Clear pricing, no hidden fees, and full protection of your personal and professional data.' },
  },
  {
    icon: Globe,
    ar: { title: 'شمولية الوصول', desc: 'منصة مصممة لتصل لكل باحث عن عمل في العالم العربي بصرف النظر عن موقعه.' },
    en: { title: 'Inclusive Access', desc: 'Built to reach every job seeker across the Arab world, regardless of location.' },
  },
];

const FEATURES_HIGHLIGHTS = [
  { icon: FileText, ar: 'تحليل السيرة الذاتية ', en: 'AI CV Analysis' },
  // { icon: Cpu, ar: 'مولّد خطابات التقديم', en: 'Cover Letter Generator' },
  { icon: Mic, ar: 'تدريب المقابلات', en: 'Interview Training' },
  { icon: Map, ar: 'مخطط المسار المهني', en: 'Career Path Planner' },
  // { icon: Zap, ar: 'التقديم التلقائي', en: 'Auto-Apply' },
  { icon: Brain, ar: 'المساعد المهني', en: 'Career Assistant' },
];

const FAQ = [
  {
    ar: { q: 'ما هو TalexHub؟', a: 'TalexHub منصة توظيف ذكية مدعومة بالذكاء الاصطناعي، مصممة خصيصاً لسوق العمل العربي.' },
    en: { q: 'What is TalexHub?', a: 'TalexHub is an AI-powered job platform designed specifically for the Arab job market.' },
  },
  {
    ar: { q: 'هل TalexHub مجاني؟', a: 'نعم، لدينا خطة مجانية تمنحك وصولاً لميزات أساسية.' },
    en: { q: 'Is TalexHub free?', a: 'Yes, we offer a free plan with access to core features.' },
  },
  {
    ar: { q: 'هل يدعم TalexHub اللغة العربية؟', a: 'بالطبع. TalexHub مبني من الأساس ليكون ثنائي اللغة — عربية وإنجليزية.' },
    en: { q: 'Does TalexHub support Arabic?', a: 'Absolutely. TalexHub is built from the ground up to be bilingual — Arabic and English.' },
  },
];

// ════════════════════════════════════════════════════════════
//  SECTION HEADING COMPONENT
// ════════════════════════════════════════════════════════════
function SectionLabel({ label }) {
  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: 7, 
      padding: '6px 14px', 
      borderRadius: 8, 
      background: 'var(--bg-secondary)', 
      border: '1px solid var(--border)', 
      marginBottom: 18 
    }}>
      <span style={{ 
        fontSize: 11, 
        fontWeight: 700, 
        color: 'var(--text-secondary)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.07em', 
        fontFamily: 'var(--font-en)' 
      }}>
        {label}
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  DIVIDER
// ════════════════════════════════════════════════════════════
function Divider() {
  return <div style={{ height: 0, background: 'var(--border)', margin: '0 auto' }} />;
}

// ════════════════════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function AboutPage() {
  const { lang, dir } = useLangStore();
  const { theme } = useThemeStore();
  const isAr = lang === 'ar';
  const isDark = theme === 'dark';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const Arrow = isAr ? ArrowLeft : ArrowRight;
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div dir={dir} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, overflowX: 'hidden' }}>
      <SEOHead isAr={isAr} />
      <Header />

      <section
  aria-labelledby="about-hero-heading"
  style={{ paddingTop: 100, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}
>
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)`, backgroundSize: '36px 36px', opacity: 0.5 }} />
    <div style={{ position: 'absolute', top: -200, insetInlineEnd: -200, width: 700, height: 700, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', filter: 'blur(80px)' }} />
    <div style={{ position: 'absolute', bottom: -100, insetInlineStart: -100, width: 500, height: 500, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', filter: 'blur(60px)' }} />
  </div>

  <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(20px,5vw,60px)', position: 'relative', textAlign: 'center' }}>
    <Reveal>
      <h1 id="about-hero-heading" style={{
        fontSize: 'clamp(24px, 5.5vw, 64px)', fontWeight: 900,
        margin: '32px 0 20px', letterSpacing: '-0.04em', lineHeight: 1.2,
        fontFamily: font, color: 'var(--text-primary)',
      }}>
        {isAr ? (
          <>بنينا المنصة التي<br /><span style={{ color: 'var(--text-primary)' }}>تستحقها</span></>
        ) : (
          <>We Built the Platform<br /><span style={{ color: 'var(--text-primary)' }}>You Deserve</span></>
        )}
      </h1>
      <p style={{ fontSize: 'clamp(12px,1.8vw,16px)', color: 'var(--text-secondary)', lineHeight: 1.72, margin: '0 auto 32px', maxWidth: 650, fontFamily: font }}>
  {/* {isAr
    ? 'ولدت TalexHub من إحباط حقيقي، رأينا المواهب العربية تُهدر وقتها في عمليات توظيف متخلفة.'
    : 'TalexHub was born from real frustration. We saw Arab talent wasting time on outdated hiring processes.'} */}
    {isAr
    ? 'وُلد TalexHub من إحباط حقيقي، إذ رأينا المواهب العربية تضيع وقتها في عمليات توظيف عفا عليها الزمن.'
    : 'TalexHub was born from real frustration. We saw Arab talent wasting time on outdated hiring processes.'}
</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 15, fontWeight: 700, fontFamily: font, transition: 'opacity .2s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '.85'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
          {isAr ? 'ابدأ مجاناً' : 'Get Started Free'} <Arrow size={15} />
        </Link>
        <Link to="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 24px', borderRadius: 12, border: '1.5px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 600, fontFamily: font, transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          {isAr ? 'استكشف الميزات' : 'Explore Features'}
        </Link>
      </div>
    </Reveal>
  </div>
</section>

      <Divider />

      {/* MISSION & VISION */}
      <section aria-labelledby="mission-heading" style={{ padding: '88px clamp(20px,5vw,60px)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              icon: Target,
              label: { ar: 'رسالتنا', en: 'Mission' },
              title: { ar: 'ديمقراطة الوصول للفرص', en: 'Democratize Career Opportunities' },
              text: { ar: 'نجعل الأدوات التي كانت حكراً على الخبراء متاحةً لكل باحث عن عمل', en: 'Making tools once reserved for career experts available to every job seeker' },
            },
            {
              icon: Sparkles,
              label: { ar: 'رؤيتنا', en: 'Vision' },
              title: { ar: 'سوق عمل عربي عادل وذكي', en: 'A Fair and Smart Arab Job Market' },
              text: { ar: 'عالم يُقيَّم فيه الموهبة بكفاءتها الحقيقية', en: 'A world where talent is valued for its real capabilities' },
            },
            {
              icon: Award,
              label: { ar: 'وعدنا', en: 'Our Promise' },
              title: { ar: 'أدوات حقيقية لنتائج حقيقية', en: 'Real Tools for Real Results' },
              text: { ar: 'كل ميزة نبنيها مصممة لزيادة فرصك في الحصول على المقابلة', en: 'Every feature we build is designed to increase your chances of landing an interview' },
            },
          ].map((card, i) => {
            const CardIcon = card.icon;
            return (
              <Reveal key={i} delay={i * 100}>
                <div style={{ padding: '28px 26px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 20, height: '100%' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <CardIcon size={22} color="var(--text-secondary)" />
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontFamily: 'var(--font-en)' }}>
                    {isAr ? card.label.ar : card.label.en}
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px', color: 'var(--text-primary)', fontFamily: font, letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                    {isAr ? card.title.ar : card.title.en}
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7, fontFamily: font }}>
                    {isAr ? card.text.ar : card.text.en}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <Divider />

      {/* WHAT WE BUILD */}
      <section aria-labelledby="features-heading" style={{ padding: '88px clamp(20px,5vw,60px)', background: 'var(--bg-primary)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 id="features-heading" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.035em', fontFamily: font }}>
                {isAr ? 'أدوات AI متكاملة' : 'Integrated AI Tools'}
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
            {FEATURES_HIGHLIGHTS.map((f, i) => {
              const Ic = f.icon;
              return (
                <Reveal key={i} delay={i * 60}>
                  <Link to="/features" style={{ textDecoration: 'none', display: 'block', padding: '20px 18px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, textAlign: 'center', transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.transform = 'none'; }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Ic size={22} color="var(--text-secondary)" strokeWidth={1.8} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: font, lineHeight: 1.35 }}>
                      {isAr ? f.ar : f.en}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* VALUES */}
      <section aria-labelledby="values-heading" style={{ padding: '88px clamp(20px,5vw,60px)', maxWidth: 1200, margin: '0 auto' }}>
        <Reveal>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 id="values-heading" style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 900, margin: '0 0 14px', letterSpacing: '-0.035em', fontFamily: font }}>
              {isAr ? 'ما الذي يحرّكنا' : 'What Drives Us'}
            </h2>
          </div>
        </Reveal>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
          {VALUES.map((v, i) => {
            const Ic = v.icon;
            return (
              <Reveal key={i} delay={i * 80}>
                <div style={{ padding: '26px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 18, position: 'relative', overflow: 'hidden', transition: 'transform .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <Ic size={20} color="var(--text-secondary)" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)', fontFamily: font }}>
                    {isAr ? v.ar.title : v.en.title}
                  </h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65, fontFamily: font }}>
                    {isAr ? v.ar.desc : v.en.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>


      <Divider />

      {/* FINAL CTA */}
      <section aria-labelledby="cta-heading" style={{ padding: '100px clamp(20px,5vw,60px) 80px' }}>
        <Reveal>
          <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center' }}>
            <h2 id="cta-heading" style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.1, fontFamily: font }}>
              {isAr ? 'جاهز لتبدأ رحلتك المهنية؟' : 'Ready to Start Your Career Journey?'}
            </h2>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 13, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 15, fontWeight: 800, fontFamily: font, transition: 'opacity .2s' }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                {isAr ? 'ابدأ مجاناً الآن' : 'Start for Free Now'} <Arrow size={16} />
              </Link>
              <Link to="/company/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 13, border: '1.5px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 15, fontWeight: 600, fontFamily: font, transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {isAr ?' توظيف المواهب' : 'Hire Talent'}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}