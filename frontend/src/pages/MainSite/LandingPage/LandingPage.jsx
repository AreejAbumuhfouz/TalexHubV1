import { useEffect } from 'react';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';
import Header from '../../../layout/Header';
import Footer from '../../../layout/Footer';
import Hero         from './Hero';
// import Hero3         from './Hero3';
// import Hero2         from './Hero2';
// import Stats        from './stats';
import Features     from './Features';
import Process      from './Process';
// import Testimonials from './testimonials';
import CTA          from './cta';

/* ── Full SEO — meta + JSON-LD for AI crawlers & Google ── */
function SEO({ isAr }) {
  useEffect(() => {
    /* Title */
    document.title = isAr
      ? 'TalexHub | منصة التوظيف الذكية للعالم العربي'
      : 'TalexHub | The Smart AI Recruitment Platform for the Arab World';

    const desc = isAr
      ? 'TalexHub — منصة التوظيف الذكية للعالم العربي. نحلل سيرتك، نطابقك مع أفضل الفرص، ونتقدم عنك تلقائياً بقوة الذكاء الاصطناعي.'
      : 'TalexHub — The smart AI-powered recruitment platform for the Arab world. We analyse your CV, match you with top opportunities, and auto-apply on your behalf.';

    const setMeta = (name, val, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) {
        el = document.createElement('meta');
        prop ? el.setAttribute('property', name) : el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', val);
    };

    /* Standard */
    setMeta('description', desc);
    setMeta('robots', 'index, follow');
    setMeta('viewport', 'width=device-width, initial-scale=1');

    /* Open Graph */
    setMeta('og:type',        'website',                                  true);
    setMeta('og:url',         'https://TalexHub.com/',                    true);
    setMeta('og:title',       isAr ? 'TalexHub | منصة التوظيف الذكية' : 'TalexHub | Smart AI Recruitment', true);
    setMeta('og:description', desc,                                        true);
    setMeta('og:image',       'https://TalexHub.com/og-image.png',        true);
    setMeta('og:locale',      isAr ? 'ar_AR' : 'en_US',                   true);
    setMeta('og:site_name',   'TalexHub',                                  true);

    /* Twitter */
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:site',        '@TalexHub');
    setMeta('twitter:title',       isAr ? 'TalexHub | منصة التوظيف الذكية' : 'TalexHub | Smart AI Recruitment');
    setMeta('twitter:description', desc);
    setMeta('twitter:image',       'https://TalexHub.com/og-image.png');

    /* Canonical */
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) { canon = document.createElement('link'); canon.setAttribute('rel','canonical'); document.head.appendChild(canon); }
    canon.setAttribute('href', 'https://TalexHub.com/');

    /* Alternate hreflang */
    ['ar','en'].forEach(l => {
      const id = `hreflang-${l}`;
      let el = document.getElementById(id);
      if (!el) { el = document.createElement('link'); el.id = id; el.setAttribute('rel','alternate'); document.head.appendChild(el); }
      el.setAttribute('hreflang', l);
      el.setAttribute('href', `https://TalexHub.com${l === 'ar' ? '/' : '/en/'}`);
    });
  }, [isAr]);

  /* JSON-LD — WebSite + Organization for Google & AI crawlers */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://TalexHub.com/#website',
        url: 'https://TalexHub.com',
        name: 'TalexHub',
        description: 'Smart AI-powered recruitment platform for the Arab world',
        inLanguage: isAr ? 'ar' : 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: 'https://TalexHub.com/jobs?q={search_term_string}' },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://TalexHub.com/#organization',
        name: 'TalexHub',
        url: 'https://TalexHub.com',
        logo: { '@type': 'ImageObject', url: 'https://TalexHub.com/logo.png', width: 200, height: 200 },
        sameAs: [
          'https://twitter.com/TalexHub',
          'https://linkedin.com/company/TalexHub',
          'https://instagram.com/TalexHub',
        ],
        contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'support@TalexHub.com' },
      },
      {
        '@type': 'WebPage',
        '@id': 'https://TalexHub.com/#webpage',
        url: 'https://TalexHub.com',
        name: isAr ? 'TalexHub | منصة التوظيف الذكية' : 'TalexHub | Smart AI Recruitment Platform',
        isPartOf: { '@id': 'https://TalexHub.com/#website' },
        about: { '@id': 'https://TalexHub.com/#organization' },
        description: isAr
          ? 'منصة التوظيف الذكية للعالم العربي'
          : 'Smart AI-powered recruitment platform for the Arab world',
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://TalexHub.com' }] },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

/* ════════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr = lang === 'ar';

  return (
    <div dir={dir} style={{
      minHeight:'100vh',
      background:'var(--bg-primary)',
      color:'var(--text-primary)',
      fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
    }}>
      <SEO isAr={isAr} />
      <Header />

      <main id="main-content">
        <Hero />
        {/* <Hero2 /> */}
        {/* <Hero3 /> */}
        {/* <Stats /> */}
        <Features />
        <Process />
        {/* <Testimonials /> */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
