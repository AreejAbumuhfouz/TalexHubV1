import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';

/* ── Scroll Progress Bar ─────────────────────────────────── */
function useScrollProgress(ref) {
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      ref.current.style.width = `${Math.min(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100, 100)}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

function ScrollBar() {
  const ref = useRef(null);
  useScrollProgress(ref);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: 2, background: 'var(--border)', zIndex: 2000 }}>
      <div ref={ref} style={{ height: '100%', width: 0, background: 'var(--text-primary)', transition: 'width 0.1s linear' }} />
    </div>
  );
}

/* ── TOC sidebar ─────────────────────────────────────────── */
function TOC({ items, active }) {
  const go = (e, id) => { 
    e.preventDefault(); 
    const el = document.getElementById(id); 
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' }); 
  };
  
  return (
    <nav aria-label="Table of Contents"
      style={{ 
        position: 'sticky', 
        top: 96, 
        background: 'var(--bg-secondary)', 
        borderRadius: 14, 
        padding: '22px', 
        border: '1px solid var(--border)', 
        maxHeight: 'calc(100vh - 120px)', 
        overflowY: 'auto' 
      }}>
      <p style={{ 
        fontSize: 10.5, 
        fontWeight: 700, 
        color: 'var(--text-secondary)', 
        textTransform: 'uppercase', 
        letterSpacing: '0.08em', 
        marginBottom: 16, 
        fontFamily: 'var(--font-en)' 
      }}>
        Contents
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((item, i) => (
          <li key={item.id} style={{ marginBottom: 2 }}>
            <a 
              href={`#${item.id}`} 
              onClick={e => go(e, item.id)} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 10px',
                borderRadius: 8,
                fontSize: 13,
                color: active === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: active === item.id ? 600 : 400,
                background: active === item.id ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: `3px solid ${active === item.id ? 'var(--text-primary)' : 'transparent'}`,
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ 
                fontSize: 10.5, 
                color: 'var(--text-secondary)', 
                minWidth: 20, 
                textAlign: 'center', 
                fontFamily: 'var(--font-en)' 
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ── Section Component ───────────────────────────────────── */
function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 24, padding: 'clamp(22px,4vw,36px)', background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)' }}>
      <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: 14.5 }}>
        {children}
      </div>
    </section>
  );
}

function Badge({ label }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 99, marginBottom: 28 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{label}</span>
    </div>
  );
}

/* ── useActiveSection hook ───────────────────────────────── */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-100px 0px -55% 0px', threshold: 0.1 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids.join(',')]);
  return active;
}

/* ════════════════════════════════════════════════════════════
   MAIN PRIVACY POLICY PAGE
════════════════════════════════════════════════════════════ */
export default function Privacy() {
  const tocItems = [
    { id: 'information', label: 'Information We Collect' },
    { id: 'usage', label: 'How We Use Your Data' },
    { id: 'sharing', label: 'Data Sharing' },
    { id: 'cookies', label: 'Cookies & Tracking' },
    { id: 'security', label: 'Data Security' },
    { id: 'rights', label: 'Your Rights' },
    { id: 'retention', label: 'Data Retention' },
    { id: 'updates', label: 'Policy Updates' },
  ];

  const active = useActiveSection(tocItems.map(t => t.id));

  useEffect(() => {
    document.title = 'Privacy Policy — TalexHub';
    window.scrollTo(0, 0);
  }, []);

  const p = { margin: '0 0 10px', lineHeight: 1.9 };
  const ul = { paddingLeft: 20, margin: '8px 0', lineHeight: 2 };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: 'var(--font-en)' }}>
      <ScrollBar />
      <Header />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            Home
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            Privacy Policy
          </span>
        </nav>

        {/* Header */}
        <div style={{ maxWidth: 800, margin: '0 auto 48px', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 550, margin: '0 auto 20px' }}>
            At TalexHub we are committed to protecting your privacy and personal data. This policy explains how we collect, use, and safeguard your information.
          </p>
          <Badge label="Last Updated: July 1, 2026" />
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48 }}>
          {/* Sidebar */}
          <aside>
            <TOC items={tocItems} active={active} />
          </aside>

          {/* Content */}
          <div>
            <Section id="information" title="1. Information We Collect">
              <p style={p}>We collect the following information to provide and improve our services:</p>
              <ul style={ul}>
                <li><strong style={{ color: 'var(--text-primary)' }}>Personal Information:</strong> Name, email address, phone number, and job title.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Profile Data:</strong> Resume/CV, skills, experience, and educational qualifications.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Usage Data:</strong> Activity logs, search preferences, and platform interactions.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Technical Data:</strong> IP address, browser type, operating system, and device information.</li>
              </ul>
            </Section>

            <Section id="usage" title="2. How We Use Your Data">
              <p style={p}>We use your data for the following purposes:</p>
              <ul style={ul}>
                <li>Matching your CV with relevant job opportunities using AI technology.</li>
                <li>Providing personalized job recommendations and improving user experience.</li>
                <li>Communicating with you about job opportunities and platform updates.</li>
                <li>Analyzing usage data to improve our services and products.</li>
              </ul>
            </Section>

            <Section id="sharing" title="3. Data Sharing & Disclosure">
              <p style={p}>We never sell your personal data. We share your data only in the following cases:</p>
              <ul style={ul}>
                <li><strong style={{ color: 'var(--text-primary)' }}>With Your Consent:</strong> When applying for a job, we share your CV with the employer.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Service Providers:</strong> Trusted partners who help us operate the platform.</li>
                <li><strong style={{ color: 'var(--text-primary)' }}>Legal Compliance:</strong> When required by law or to protect our rights.</li>
              </ul>
            </Section>

            <Section id="cookies" title="4. Cookies & Tracking">
              <p style={p}>
                We use cookies to enhance your experience. Manage them through our{' '}
                <Link to="/cookies" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                  Cookie Policy page
                </Link>
                {' '}or your browser preferences.
              </p>
            </Section>

            <Section id="security" title="5. Data Security">
              <p style={p}>We implement technical and organizational security measures to protect your data from unauthorized access. We use SSL encryption, firewalls, and strict access controls to ensure your information remains secure.</p>
            </Section>

            <Section id="rights" title="6. Your Rights">
              <p style={p}>You have the following rights regarding your data:</p>
              <ul style={ul}>
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data</li>
                <li>Restrict data processing</li>
                <li>Data portability</li>
                <li>Object to processing</li>
              </ul>
              <p style={p}>To exercise any of these rights, please contact us at privacy@TalexHub.com.</p>
            </Section>

            <Section id="retention" title="7. Data Retention">
              <p style={p}>We retain your data as long as your account is active or as needed to provide our services. You can request deletion at any time through your account settings or by contacting our support team.</p>
            </Section>

            <Section id="updates" title="8. Policy Updates">
              <p style={p}>We may update this policy from time to time. We will notify you of any material changes via email or through a notice on the platform. Please review this policy periodically.</p>
            </Section>

            {/* Footer note */}
            <div style={{ 
              marginTop: 48, 
              padding: '24px 28px', 
              background: 'var(--bg-secondary)', 
              borderRadius: 14, 
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                By using TalexHub, you acknowledge that you have read and understood our Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}