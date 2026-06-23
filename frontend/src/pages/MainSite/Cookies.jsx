

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';

/* ── Scroll progress ─────────────────────────────────────── */
function ScrollBar() {
  const ref = useRef(null);
  useEffect(() => {
    const fn = () => { if (!ref.current) return; ref.current.style.width = `${Math.min(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100,100)}%`; };
    window.addEventListener('scroll', fn, { passive:true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:2, background:'var(--border)', zIndex:2000 }}>
      <div ref={ref} style={{ height:'100%', width:0, background:'var(--text-primary)', transition:'width 0.1s linear' }} />
    </div>
  );
}

/* ── Active section tracking ─────────────────────────────── */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin:'-100px 0px -55% 0px', threshold:0.1 });
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids.join(',')]);
  return active;
}

/* ── TOC sidebar ─────────────────────────────────────────── */
function TOC({ items, active }) {
  const go = (e, id) => { e.preventDefault(); const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior:'smooth' }); };
  return (
    <nav aria-label="Table of Contents"
      style={{ position:'sticky', top:96, background:'var(--bg-secondary)', borderRadius:14, padding:'22px', border:'1px solid var(--border)', maxHeight:'calc(100vh - 120px)', overflowY:'auto' }}>
      <p style={{ fontSize:10.5, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:16, fontFamily:'var(--font-en)' }}>
        Contents
      </p>
      <ul style={{ listStyle:'none', padding:0, margin:0 }}>
        {items.map((item, i) => (
          <li key={item.id} style={{ marginBottom:2 }}>
            <a href={`#${item.id}`} onClick={e => go(e, item.id)} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'7px 10px', borderRadius:8, fontSize:13,
              color: active===item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: active===item.id ? 600 : 400,
              background: active===item.id ? 'var(--bg-tertiary)' : 'transparent',
              borderLeft:`3px solid ${active===item.id ? 'var(--text-primary)' : 'transparent'}`,
              textDecoration:'none', transition:'all 0.15s',
            }}>
              <span style={{ fontSize:10.5, color:'var(--text-secondary)', minWidth:20, textAlign:'center', fontFamily:'var(--font-en)' }}>{String(i+1).padStart(2,'0')}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ── Content section ─────────────────────────────────────── */
function Section({ id, title, children }) {
  return (
    <section id={id} style={{ marginBottom:24, padding:'clamp(22px,4vw,36px)', background:'var(--bg-primary)', borderRadius:14, border:'1px solid var(--border)' }}>
      <h2 style={{ fontSize:'clamp(1.1rem,2vw,1.4rem)', fontWeight:700, color:'var(--text-primary)', marginBottom:16, paddingBottom:12, borderBottom:'1px solid var(--border)', letterSpacing:'-0.01em' }}>
        {title}
      </h2>
      <div style={{ color:'var(--text-secondary)', lineHeight:1.9, fontSize:14.5 }}>
        {children}
      </div>
    </section>
  );
}

/* ── Info box ────────────────────────────────────────────── */
function InfoBox({ type='info', title, children }) {
  const map = {
    info:    { icon:'ℹ️', borderColor: '#3B82F6', bgColor: 'rgba(59,130,246,0.05)' },
    warning: { icon:'⚠️', borderColor: '#F59E0B', bgColor: 'rgba(245,158,11,0.05)' },
  };
  const s = map[type];
  return (
    <div role="alert" style={{ padding:'14px 18px', borderRadius:10, background:s.bgColor, borderLeft:`4px solid ${s.borderColor}`, marginBottom:18 }}>
      <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
        <span style={{ flexShrink:0 }}>{s.icon}</span>
        <div>
          {title && <h4 style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:4, fontSize:13.5 }}>{title}</h4>}
          <div style={{ color:'var(--text-secondary)', fontSize:13.5, lineHeight:1.75 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

const p = { margin:'0 0 10px', lineHeight:1.9 };
const ul = { paddingLeft:20, margin:'8px 0', lineHeight:2 };

/* ════════════════════════════════════════════════════════════
   MAIN COOKIE POLICY PAGE
════════════════════════════════════════════════════════════ */
export default function Cookies() {
  const [active, setActive] = useState('intro');

  const tocItems = [
    { id: 'intro', label: 'Introduction' },
    { id: 'what', label: 'What Are Cookies?' },
    { id: 'types', label: 'Types of Cookies' },
    { id: 'manage', label: 'Managing Cookies' },
    { id: 'updates', label: 'Policy Updates' },
   
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0.1 }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => { 
    document.title = 'Cookie Policy — TalexHub';
    window.scrollTo(0, 0);
  }, []);

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
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Cookie Policy</span>
        </nav>

        {/* Header */}
        <div style={{ maxWidth: 800, margin: '0 auto 48px', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 16 }}>
            Cookie Policy
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 550, margin: '0 auto 20px' }}>
            This policy explains how we use cookies and similar technologies on the TalexHub platform.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 50, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            Last Updated: July 1, 2026
          </div>
        </div>

        {/* Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48 }}>
          <aside>
            <TOC items={tocItems} active={active} />
          </aside>

          <div>
            <Section id="intro" title="1. Introduction">
              <p style={p}>TalexHub ("we", "us", "our") uses cookies and similar tracking technologies on our website and platform. This Cookie Policy explains what cookies are, how we use them, and your choices regarding their use.</p>
              <p style={p}>By continuing to browse or use our platform, you agree to our use of cookies as described in this policy. If you do not agree, you may adjust your browser settings or refrain from using our platform.</p>
            </Section>

            <Section id="what" title="2. What Are Cookies?">
              <p style={p}>Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They are widely used to make websites work more efficiently, enhance user experience, and provide information to website owners.</p>
              <p style={p}>Cookies do not typically contain any information that personally identifies a user, but personal information that we store about you may be linked to the information stored in and obtained from cookies.</p>
              <InfoBox type="info" title="Important Note">
                Cookies are safe. They cannot execute code, deliver viruses, or access your hard drive. They simply help websites remember your preferences and activity.
              </InfoBox>
            </Section>

            <Section id="types" title="3. Types of Cookies We Use">
              <p style={p}>We use the following categories of cookies on our platform:</p>
              
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Essential Cookies</h3>
                <p style={p}>These cookies are necessary for the platform to function properly. They enable core functionality such as security, network management, and accessibility. You cannot disable these cookies as our platform would not work correctly without them.</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Performance & Analytics Cookies</h3>
                <p style={p}>These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. This helps us improve the way our platform works, for example, by ensuring users find what they are looking for easily.</p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Functional Cookies</h3>
                <p style={p}>These cookies enable the platform to provide enhanced functionality and personalization, such as remembering your language preferences, theme settings, and login details.</p>
              </div>

              <div style={{ marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Advertising Cookies</h3>
                <p style={p}>These cookies are used to deliver advertisements that are relevant to you and your interests. They also help measure the effectiveness of advertising campaigns.</p>
              </div>
            </Section>

            <Section id="manage" title="4. Managing Cookies">
              <p style={p}>You have the right to decide whether to accept or reject cookies. You can manage your cookie preferences in several ways:</p>
              
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, marginTop: 14 }}>Browser Settings</h3>
              <p style={p}>Most web browsers allow you to control cookies through their settings preferences. You can set your browser to block or delete cookies. However, please note that if you disable cookies, some features of our platform may not function properly.</p>
              
              <p style={p}>Below are links to cookie management instructions for popular browsers:</p>
              <ul style={ul}>
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Google Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Mozilla Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Apple Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Microsoft Edge</a></li>
              </ul>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, marginTop: 14 }}>Cookie Consent Banner</h3>
              <p style={p}>Upon your first visit to our platform, a cookie consent banner will appear, allowing you to accept or reject non-essential cookies. You can change your preferences at any time by adjusting your browser settings.</p>

              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, marginTop: 14 }}>Third-Party Opt-Out</h3>
              <p style={p}>For advertising cookies, you may opt out of interest-based advertising through the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Digital Advertising Alliance</a> or <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)' }}>Your Online Choices</a>.</p>
              
              <InfoBox type="warning" title="Important">
                Disabling certain cookies may affect the functionality of our platform and your user experience. Essential cookies cannot be disabled as they are required for core platform operations.
              </InfoBox>
            </Section>

            <Section id="updates" title="5. Policy Updates">
              <p style={p}>We may update this Cookie Policy from time to time to reflect changes in technology, legal requirements, or our practices. Any updates will be posted on this page with an updated "Last Updated" date.</p>
              <p style={p}>We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies and related technologies. Your continued use of our platform after any changes constitutes acceptance of the updated policy.</p>
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
                By using TalexHub, you acknowledge that you have read and understood our Cookie Policy.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}