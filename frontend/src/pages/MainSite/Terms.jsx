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
function Section({ id, number, title, children }) {
  return (
    <section id={id} style={{ marginBottom: 32 }}>
      <div style={{ 
        background: 'var(--bg-primary)', 
        borderRadius: 12, 
        padding: '32px 36px',
        border: '1px solid var(--border)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}>
        <h2 style={{ 
          fontSize: '1.35rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          marginBottom: 20, 
          paddingBottom: 12, 
          borderBottom: '2px solid var(--border)',
          letterSpacing: '-0.01em',
          fontFamily: 'var(--font-en)'
        }}>
          {number}. {title}
        </h2>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: 14.5, fontFamily: 'var(--font-en)' }}>
          {children}
        </div>
      </div>
    </section>
  );
}

/* ── Warning Box ─────────────────────────────────────────── */
function WarnBox({ type = 'info', title, children }) {
  const config = {
    info: { icon: 'ℹ️', borderColor: '#3B82F6', bgColor: 'rgba(59,130,246,0.05)' },
    warning: { icon: '⚠️', borderColor: '#F59E0B', bgColor: 'rgba(245,158,11,0.05)' },
    danger: { icon: '🚫', borderColor: '#EF4444', bgColor: 'rgba(239,68,68,0.05)' }
  };
  const { icon, borderColor, bgColor } = config[type];

  return (
    <div style={{ 
      padding: '18px 22px', 
      borderRadius: 10, 
      background: bgColor, 
      borderLeft: `4px solid ${borderColor}`,
      marginBottom: 20
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.1rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          {title && (
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6, fontSize: 13.5, fontFamily: 'var(--font-en)' }}>
              {title}
            </h4>
          )}
          <div style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.7 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────────── */
const p = { margin: '0 0 14px', lineHeight: 1.8 };
const ul = { paddingLeft: 24, margin: '10px 0 14px', lineHeight: 1.8 };
const ol = { paddingLeft: 24, margin: '10px 0 14px', lineHeight: 1.8 };

/* ════════════════════════════════════════════════════════════
   MAIN TERMS PAGE
════════════════════════════════════════════════════════════ */
export default function Terms() {
  const [agreed, setAgreed] = useState(false);

  const tocItems = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'accounts', label: 'Account Responsibilities' },
    { id: 'acceptable-use', label: 'Acceptable Use' },
    { id: 'intellectual-property', label: 'Intellectual Property' },
    { id: 'user-content', label: 'User Content' },
    { id: 'payments', label: 'Payments & Subscriptions' },
    { id: 'termination', label: 'Termination' },
    { id: 'liability', label: 'Limitation of Liability' },
    { id: 'indemnification', label: 'Indemnification' },
    { id: 'disputes', label: 'Dispute Resolution' },
    { id: 'changes', label: 'Changes to Terms' },
  ];

  const [active, setActive] = useState(tocItems[0].id);

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
    document.title = 'Terms & Conditions | TalexHub';
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <ScrollBar />
      <Header />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 32px 80px' }}>
        {/* Document Header */}
        <div style={{ 
          maxWidth: 800, 
          margin: '0 auto 48px', 
          textAlign: 'center',
          borderBottom: '1px solid var(--border)',
          paddingBottom: 32
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 3rem)', 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.02em', 
            marginBottom: 16,
            fontFamily: 'var(--font-en)'
          }}>
            Terms & Conditions
          </h1>
          <p style={{ 
            fontSize: 15, 
            color: 'var(--text-secondary)', 
            lineHeight: 1.7, 
            maxWidth: 550, 
            margin: '0 auto 20px',
            fontFamily: 'var(--font-en)'
          }}>
            Please read these Terms carefully before using TalexHub. By using the platform, you agree to be bound by these Terms.
          </p>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 8, 
            padding: '5px 14px', 
            background: 'var(--bg-secondary)', 
            border: '1px solid var(--border)', 
            borderRadius: 50,
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-en)'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
            Effective: July 1, 2026
          </div>
        </div>

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 48 }}>
          {/* Sidebar */}
          <aside>
            <TOC items={tocItems} active={active} />
          </aside>

          {/* Content */}
          <div>
            <Section id="introduction" number="1" title="Introduction">
              <p style={p}>Welcome to TalexHub ("the Platform"). These Terms & Conditions govern your use of the TalexHub platform, including the website, mobile application, and all related services (collectively, the "Service").</p>
              <p style={p}>By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with any part of these Terms, you must not use the Service.</p>
              <p style={p}>These Terms constitute a legally binding agreement between you ("User", "you", or "your") and TalexHub ("we", "us", "our", or "the Company").</p>
            </Section>

            <Section id="definitions" number="2" title="Definitions">
              <p style={p}><strong style={{ color: 'var(--text-primary)' }}>"User"</strong> — Any individual or entity that accesses or uses the Platform, including job seekers, employers, and recruiters.</p>
              <p style={p}><strong style={{ color: 'var(--text-primary)' }}>"Content"</strong> — All information, data, text, images, resumes, job postings, and other materials uploaded, posted, or transmitted through the Platform.</p>
              <p style={p}><strong style={{ color: 'var(--text-primary)' }}>"Employer"</strong> — Any company, organization, or individual that posts job opportunities, searches for candidates, or uses recruitment services on the Platform.</p>
              <p style={p}><strong style={{ color: 'var(--text-primary)' }}>"Job Seeker"</strong> — Any individual who uses the Platform to search for employment opportunities, upload resumes, or apply for jobs.</p>
              <p style={p}><strong style={{ color: 'var(--text-primary)' }}>"AI Services"</strong> — Any artificial intelligence powered features including CV analysis, cover letter generation, interview training, career path planning, and auto-apply functionality.</p>
            </Section>

            <Section id="eligibility" number="3" title="Eligibility">
              <p style={p}>To use the Service, you represent and warrant that:</p>
              <ul style={ul}>
                <li>You are at least 18 years of age;</li>
                <li>You are capable of entering into a legally binding contract;</li>
                <li>You are not prohibited from using the Service under applicable laws;</li>
                <li>All information you provide is accurate, current, and complete;</li>
                <li>You will maintain and update your information as necessary;</li>
                <li>You have not been previously suspended or removed from the Service.</li>
              </ul>
              <WarnBox type="info" title="Age Requirement">
                TalexHub is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors.
              </WarnBox>
            </Section>

            <Section id="accounts" number="4" title="Account Responsibilities">
              <p style={p}>When creating an account on TalexHub, you agree to:</p>
              <ol style={ol}>
                <li>Provide accurate, complete, and current information;</li>
                <li>Maintain the confidentiality and security of your login credentials;</li>
                <li>Accept full responsibility for all activities that occur under your account;</li>
                <li>Notify us immediately of any unauthorized use or security breach;</li>
                <li>Not share your account credentials with any third party;</li>
                <li>Not create multiple accounts for fraudulent purposes.</li>
              </ol>
              <WarnBox type="danger" title="Security Alert">
                Never share your password with anyone. TalexHub will never ask for your password via email, phone, or any other channel. If you receive such a request, please report it to security@TalexHub.com immediately.
              </WarnBox>
            </Section>

            <Section id="acceptable-use" number="5" title="Acceptable Use">
              <p style={p}>You agree NOT to engage in any of the following prohibited activities:</p>
              <ul style={ul}>
                <li>Violating any applicable laws, regulations, or industry standards;</li>
                <li>Impersonating any person or entity or misrepresenting your affiliation;</li>
                <li>Posting false, misleading, or fraudulent job opportunities or applications;</li>
                <li>Uploading content that is unlawful, harmful, defamatory, obscene, or discriminatory;</li>
                <li>Attempting to gain unauthorized access to the Platform, servers, or systems;</li>
                <li>Using the Platform to send spam, unsolicited messages, or bulk communications;</li>
                <li>Uploading viruses, malware, or any malicious code;</li>
                <li>Scraping, crawling, or collecting user data without authorization;</li>
                <li>Interfering with or disrupting the integrity or performance of the Service;</li>
                <li>Reverse engineering, decompiling, or disassembling any part of the Platform.</li>
              </ul>
            </Section>

            <Section id="intellectual-property" number="6" title="Intellectual Property">
              <p style={p}>All intellectual property rights in the Platform, its content, and its technology are owned by TalexHub or its licensors. This includes:</p>
              <ul style={ul}>
                <li>Trademarks, service marks, and the TalexHub logo;</li>
                <li>Software code, algorithms, and proprietary AI models;</li>
                <li>Design, layout, graphics, and user interface;</li>
                <li>Text, documentation, and educational materials;</li>
                <li>Patents, copyrights, and trade secrets.</li>
              </ul>
              <p style={p}>You are granted a limited, non-exclusive, non-transferable license to access and use the Service for your personal or business purposes. You may not reproduce, distribute, modify, or create derivative works without our express written consent.</p>
            </Section>

            <Section id="user-content" number="7" title="User Content">
              <p style={p}>By uploading, submitting, or posting Content on the Platform, you grant TalexHub a worldwide, non-exclusive, royalty-free license to use, store, process, and display such Content in connection with providing and improving the Service.</p>
              <p style={p}>You represent and warrant that:</p>
              <ul style={ul}>
                <li>You own or have the necessary rights to the Content you submit;</li>
                <li>Your Content does not infringe on any third-party rights;</li>
                <li>Your Content complies with these Terms and applicable laws.</li>
              </ul>
              <p style={p}>TalexHub reserves the right to remove any Content that violates these Terms, without prior notice.</p>
            </Section>

            <Section id="payments" number="8" title="Payments & Subscriptions">
              <p style={p}>Certain features of the Service may require payment. By subscribing to a paid plan, you agree to the following:</p>
              <ul style={ul}>
                <li>All fees are billed in advance on a monthly or annual basis;</li>
                <li>Fees are non-refundable except as required by law;</li>
                <li>We reserve the right to change our fees with 30 days prior notice;</li>
                <li>You are responsible for all applicable taxes;</li>
                <li>Failure to pay may result in suspension or termination of your account;</li>
                <li>Auto-renewal is enabled by default; you may cancel anytime in your account settings.</li>
              </ul>
              <WarnBox type="info" title="Points System">
                TalexHub operates on a points-based system for AI feature usage. Each paid plan includes a monthly points allocation. Points are non-transferable and expire at the end of each billing cycle unless rolled over per your plan terms.
              </WarnBox>
            </Section>

            <Section id="termination" number="9" title="Termination">
              <p style={p}>TalexHub reserves the right to suspend or terminate your account at any time, without liability, for any reason, including but not limited to:</p>
              <ul style={ul}>
                <li>Violation of these Terms or any applicable laws;</li>
                <li>Fraudulent, abusive, or harmful conduct;</li>
                <li>Non-payment of fees;</li>
                <li>Extended periods of inactivity.</li>
              </ul>
              <p style={p}>You may terminate your account at any time through your account settings or by contacting support@TalexHub.com. Upon termination, your right to use the Service will immediately cease, and we may delete your Content.</p>
            </Section>

            <Section id="liability" number="10" title="Limitation of Liability">
              <WarnBox type="warning" title="Important Legal Notice">
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
              </WarnBox>
              <p style={p}>TalexHub and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:</p>
              <ul style={ul}>
                <li>Loss of profits, revenue, or business opportunities;</li>
                <li>Loss of data, goodwill, or reputation;</li>
                <li>Costs of procuring substitute goods or services;</li>
                <li>Personal injury or property damage;</li>
                <li>Any other damages arising from your use of or inability to use the Service.</li>
              </ul>
              <p style={p}>Our total cumulative liability to you for any claim arising from these Terms or your use of the Service shall not exceed the amount you paid to us, if any, in the past 12 months.</p>
            </Section>

            <Section id="indemnification" number="11" title="Indemnification">
              <p style={p}>You agree to indemnify, defend, and hold harmless TalexHub, its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from:</p>
              <ul style={ul}>
                <li>Your use of the Service;</li>
                <li>Your violation of these Terms;</li>
                <li>Your violation of any third-party rights, including intellectual property or privacy rights;</li>
                <li>Any Content you submit, post, or transmit through the Service.</li>
              </ul>
            </Section>

            <Section id="disputes" number="12" title="Dispute Resolution">
              <p style={p}>These Terms shall be governed by and construed in accordance with the laws of the Kingdom of Saudi Arabia, without regard to its conflict of law principles.</p>
              <p style={p}>Any dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be first attempted to be resolved through good-faith negotiations. If the dispute cannot be resolved within 30 days, it shall be submitted to binding arbitration in Riyadh, Saudi Arabia, in accordance with the rules of the Saudi Center for Commercial Arbitration (SCCA).</p>
              <p style={p}>You agree that any arbitration or legal proceeding shall be conducted on an individual basis only, and not as a class, consolidated, or representative action.</p>
            </Section>

            <Section id="changes" number="13" title="Changes to Terms">
              <p style={p}>We reserve the right to modify or update these Terms at any time. When we make material changes, we will notify you through:</p>
              <ul style={ul}>
                <li>Email sent to your registered address;</li>
                <li>A prominent notice on the Platform;</li>
                <li>Updating the "Effective Date" at the top of these Terms.</li>
              </ul>
              <p style={p}>Your continued use of the Service after any changes constitutes your acceptance of the revised Terms. If you do not agree to the changes, you must stop using the Service and terminate your account.</p>
            </Section>

            {/* Acceptance Footer */}
            <div style={{ 
              marginTop: 48, 
              padding: '32px 40px', 
              background: 'var(--bg-secondary)', 
              borderRadius: 16, 
              textAlign: 'center',
              border: '1px solid var(--border)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, fontFamily: 'var(--font-en)' }}>
                Acknowledgment of Terms
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13.5, marginBottom: 24, lineHeight: 1.7, maxWidth: 450, marginLeft: 'auto', marginRight: 'auto' }}>
                By using TalexHub, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
              </p>
              <button 
                onClick={() => setAgreed(true)} 
                style={{
                  padding: '12px 32px',
                  borderRadius: 10,
                  border: 'none',
                  background: agreed ? '#22C55E' : 'var(--text-primary)',
                  color: agreed ? '#fff' : 'var(--bg-primary)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: agreed ? 'default' : 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-en)',
                  opacity: agreed ? 0.7 : 1
                }}
              >
                {agreed ? '✓ Terms Accepted' : 'I Agree to the Terms & Conditions'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}