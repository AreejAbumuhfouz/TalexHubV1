import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useLangStore from '../../i18n';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';

/* ── FAQ data ────────────────────────────────────────────── */
const FAQS_EN = [
  { id: 'f1', cat: 'features', q: 'How does AI job matching work?', a: 'Our AI analyses your CV, skills, and preferences to match you with the most relevant opportunities. It considers experience level, industry, location, and salary expectations.' },
  { id: 'f2', cat: 'pricing', q: 'Is TalexHub free for job seekers?', a: 'Yes — completely free for job seekers. Create a profile, upload your CV, and apply to unlimited jobs at no cost. Optional premium features are available.' },
  { id: 'f3', cat: 'account', q: 'How do I update my CV?', a: 'Go to your dashboard, click "CVs", then upload a new one. Our AI will automatically re-analyse it for better matches.' },
  { id: 'f4', cat: 'features', q: 'Can I apply to multiple jobs?', a: 'Yes. With auto-apply enabled, we apply to matching positions on your behalf daily — each with a personalised cover letter.' },
  { id: 'f5', cat: 'features', q: 'How do employers find my profile?', a: 'Employers search the talent database. Your privacy settings let you control visibility — you can stay anonymous until you choose otherwise.' },
  { id: 'f6', cat: 'account', q: 'What if I forget my password?', a: 'Click "Forgot Password" on the login page, enter your email, and we\'ll send a reset link. The link expires after 1 hour.' },
  { id: 'f7', cat: 'features', q: 'How long does CV analysis take?', a: 'Initial analysis takes under 2 minutes. Your profile is then continuously updated as new jobs become available.' },
  { id: 'f8', cat: 'security', q: 'Is my data secure?', a: 'Absolutely. We use AES-256 encryption. Your CV and personal info are never shared without your explicit consent. See our Privacy Policy for details.' },
];

const FAQS_AR = [
  { id: 'f1', cat: 'features', q: 'كيف يعمل مطابقة الوظائف؟', a: 'يحلل الذكاء الاصطناعي سيرتك ومهاراتك وتفضيلاتك لمطابقتك مع الفرص الأنسب. يأخذ في الاعتبار الخبرة والقطاع والموقع وتوقعات الراتب.' },
  { id: 'f2', cat: 'pricing', q: 'هل TalexHub مجانية للباحثين؟', a: 'نعم — مجانية بالكامل للباحثين عن عمل. أنشئ حساباً وارفع سيرتك وتقدم لوظائف غير محدودة بدون أي تكلفة.' },
  { id: 'f3', cat: 'account', q: 'كيف أحدث سيرتي الذاتية؟', a: 'انتقل إلى لوحة التحكم > السير الذاتية > تحميل سيرة جديدة. سيُعيد الذكاء الاصطناعي تحليلها تلقائياً.' },
  { id: 'f4', cat: 'features', q: 'هل يمكنني التقدم لعدة وظائف؟', a: 'نعم. مع التقديم التلقائي نتقدم نيابةً عنك يومياً مع رسالة تغطية مخصصة لكل وظيفة.' },
  { id: 'f5', cat: 'features', q: 'كيف يجد أصحاب العمل ملفي؟', a: 'يبحث أصحاب العمل في قاعدة المواهب. إعدادات الخصوصية تتيح لك التحكم الكامل — يمكنك البقاء مجهولاً حتى تختار غير ذلك.' },
  { id: 'f6', cat: 'account', q: 'ماذا لو نسيت كلمة المرور؟', a: 'انقر "نسيت كلمة المرور" في صفحة تسجيل الدخول، أدخل بريدك، وسنرسل رابط إعادة التعيين. صلاحيته ساعة واحدة.' },
  { id: 'f7', cat: 'features', q: 'كم يستغرق تحليل السيرة الذاتية؟', a: 'أقل من دقيقتين للتحليل الأولي. بعد ذلك يتم التحديث المستمر مع توفر وظائف جديدة.' },
  { id: 'f8', cat: 'security', q: 'هل بياناتي آمنة؟', a: 'نعم. نستخدم تشفيراً بمستوى البنوك AES-256. لا تُشارك معلوماتك أبداً بدون موافقتك الصريحة.' },
];

const CATS_EN = [{ id: 'all', label: 'All' }, { id: 'features', label: 'Features' }, { id: 'account', label: 'Account' }, { id: 'pricing', label: 'Pricing' }, { id: 'security', label: 'Security' }];
const CATS_AR = [{ id: 'all', label: 'الكل' }, { id: 'features', label: 'الميزات' }, { id: 'account', label: 'الحساب' }, { id: 'pricing', label: 'الأسعار' }, { id: 'security', label: 'الأمان' }];

/* ── FAQ accordion item ──────────────────────────────────── */
function FAQItem({ q, a, open, onToggle }) {
  const ref = useRef(null);
  const [h, setH] = useState(0);
  
  useEffect(() => {
    if (ref.current) setH(open ? ref.current.scrollHeight : 0);
  }, [open]);

  return (
    <div style={{ 
      border: '1px solid var(--border)', 
      borderRadius: 12, 
      overflow: 'hidden', 
      background: 'var(--bg-primary)',
      transition: 'box-shadow 0.2s' 
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
      <button 
        aria-expanded={open} 
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'start',
          gap: 12,
          fontFamily: 'inherit'
        }}>
        <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)' }}>{q}</span>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M5 7.5L10 12.5L15 7.5" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      <div style={{ height: `${h}px`, overflow: 'hidden', transition: 'height 0.28s ease' }}>
        <div ref={ref} style={{ padding: '0 22px 20px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
          {a}
        </div>
      </div>
    </div>
  );
}

/* ── Contact form ────────────────────────────────────────── */
function ContactForm({ isAr }) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  
  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 1400);
  };

  const fieldStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 9,
    border: '1.5px solid var(--border)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 13.5,
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  
  const onFocus = e => { e.target.style.borderColor = 'var(--accent-400)'; };
  const onBlur = e => { e.target.style.borderColor = 'var(--border)'; };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)' }} role="alert">
      <div style={{ fontSize: '3rem', marginBottom: 14 }}>✅</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        {isAr ? 'تم إرسال رسالتك!' : 'Message Sent!'}
      </h3>
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
        {isAr ? 'سنرد عليك خلال 24 ساعة.' : "We'll get back to you within 24 hours."}
      </p>
      <button onClick={() => setSent(false)}
        style={{ padding: '10px 24px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
        {isAr ? 'إرسال رسالة أخرى' : 'Send Another'}
      </button>
    </div>
  );

  const labelSt = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };

  return (
    <form onSubmit={onSubmit} style={{ background: 'var(--bg-primary)', borderRadius: 14, padding: '28px', border: '1px solid var(--border)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={labelSt}>{isAr ? 'الاسم *' : 'Name *'}</label>
          <input type="text" required value={form.name} onChange={e => upd('name', e.target.value)}
            placeholder={isAr ? 'أدخل اسمك' : 'Your name'} style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
        </div>
        <div>
          <label style={labelSt}>{isAr ? 'البريد الإلكتروني *' : 'Email *'}</label>
          <input type="email" required value={form.email} onChange={e => upd('email', e.target.value)}
            placeholder="you@example.com" dir="ltr" style={{ ...fieldStyle, direction: 'ltr', textAlign: 'left' }} onFocus={onFocus} onBlur={onBlur} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelSt}>{isAr ? 'الموضوع' : 'Subject'}</label>
        <select value={form.subject} onChange={e => upd('subject', e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }} onFocus={onFocus} onBlur={onBlur}>
          <option value="">{isAr ? 'اختر الموضوع' : 'Select a topic'}</option>
          <option value="account">{isAr ? 'مشكلة في الحساب' : 'Account Issue'}</option>
          <option value="billing">{isAr ? 'الفوترة والدفع' : 'Billing & Payment'}</option>
          <option value="technical">{isAr ? 'مشكلة تقنية' : 'Technical Issue'}</option>
          <option value="feature">{isAr ? 'طلب ميزة جديدة' : 'Feature Request'}</option>
          <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
        </select>
      </div>
      <div style={{ marginBottom: 18 }}>
        <label style={labelSt}>{isAr ? 'الرسالة *' : 'Message *'}</label>
        <textarea required rows={5} value={form.message} onChange={e => upd('message', e.target.value)}
          placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Write your message here...'} style={{ ...fieldStyle, resize: 'vertical', minHeight: 110 }} onFocus={onFocus} onBlur={onBlur} />
      </div>
      <button type="submit" disabled={loading}
        style={{ width: '100%', padding: '13px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, opacity: loading ? 0.7 : 1, transition: 'opacity 0.2s, transform 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
        onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.7' : '1'; e.currentTarget.style.transform = 'none'; }}>
        {loading && <span style={{ width: 15, height: 15, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%', animation: 'spSpin 0.8s linear infinite', display: 'inline-block' }} />}
        {loading ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message')}
      </button>
    </form>
  );
}

/* ── Support card ────────────────────────────────────────── */
function Card({ icon, title, desc, action }) {
  return (
    <div style={{ 
      padding: '28px 22px', 
      background: 'var(--bg-primary)', 
      borderRadius: 14, 
      border: '1px solid var(--border)', 
      textAlign: 'center', 
      transition: 'all 0.25s ease' 
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
      <div style={{ fontSize: '2.2rem', marginBottom: 14 }}>{icon}</div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>{desc}</p>
      {action && (
        <a href={action.href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {action.label} →
        </a>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN SUPPORT PAGE
════════════════════════════════════════════════════════════ */
export default function Support() {
  const { lang, dir } = useLangStore();
  const isAr = lang === 'ar';
  const faqs = isAr ? FAQS_AR : FAQS_EN;
  const cats = isAr ? CATS_AR : CATS_EN;

  const [activeCat, setActiveCat] = useState('all');
  const [openSet, setOpenSet] = useState(new Set());

  useEffect(() => {
    document.title = isAr ? 'الدعم والمساعدة — TalexHub' : 'Support Center — TalexHub';
  }, [isAr]);

  const toggle = id => setOpenSet(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filtered = activeCat === 'all' ? faqs : faqs.filter(f => f.cat === activeCat);

  const infoRow = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 };
  const infoLabel = { fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 };

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: 'var(--bg-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
      <style>{'@keyframes spSpin{to{transform:rotate(360deg)}}'}</style>
      <Header />

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '100px 32px 80px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 32, fontSize: 13, color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {isAr ? 'الدعم والمساعدة' : 'Support Center'}
          </span>
        </nav>

        {/* Header */}
        <div style={{ maxWidth: 800, margin: '0 auto 56px', textAlign: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.15 }}>
            {isAr ? 'كيف يمكننا مساعدتك؟' : 'How Can We Help You?'}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 540, margin: '0 auto' }}>
            {isAr
              ? 'تصفح الأسئلة الشائعة أو تواصل مع فريق الدعم. نحن هنا على مدار الساعة.'
              : "Browse our FAQs or reach out to our support team. We're here 24/7."}
          </p>
        </div>

        {/* Support cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 64 }}>
          <Card icon="📧" title={isAr ? 'البريد الإلكتروني' : 'Email Support'}
            desc={isAr ? 'أرسل لنا بريداً إلكترونياً وسنرد خلال 24 ساعة.' : "Send us an email and we'll respond within 24 hours."}
            action={{ label: isAr ? 'إرسال بريد' : 'Send Email', href: 'mailto:support@TalexHub.com' }} />
          <Card icon="💬" title={isAr ? 'الدردشة المباشرة' : 'Live Chat'}
            desc={isAr ? 'تحدث مع فريق الدعم مباشرة. الأحد — الخميس، 9 ص — 6 م.' : 'Chat live with support. Available Sun–Thu, 9 AM – 6 PM KSA.'} />
          <Card icon="📚" title={isAr ? 'قاعدة المعرفة' : 'Knowledge Base'}
            desc={isAr ? 'تصفح أدلة شاملة لإتقان استخدام TalexHub.' : 'Browse comprehensive guides to master TalexHub.'}
            action={{ label: isAr ? 'تصفح الأدلة' : 'Browse Guides', href: '#faq-section' }} />
        </div>

        {/* Contact section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 48, marginBottom: 64 }}>
          {/* Contact info */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 22 }}>
              {isAr ? 'معلومات الاتصال' : 'Contact Information'}
            </h2>
            <div style={{ background: 'var(--bg-primary)', borderRadius: 14, padding: '28px', border: '1px solid var(--border)' }}>
              <div style={infoRow}>
                <span style={{ fontSize: '1.4rem' }}>📧</span>
                <div>
                  <div style={infoLabel}>{isAr ? 'البريد الإلكتروني' : 'Email'}</div>
                  <a href="mailto:support@TalexHub.com" style={{ color: 'var(--text-secondary)', fontSize: 13.5, textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    support@TalexHub.com
                  </a>
                </div>
              </div>
              <div style={infoRow}>
                <span style={{ fontSize: '1.4rem' }}>📞</span>
                <div>
                  <div style={infoLabel}>{isAr ? 'الهاتف' : 'Phone'}</div>
                  <a href="tel:+966112345678" style={{ color: 'var(--text-secondary)', fontSize: 13.5, textDecoration: 'none', direction: 'ltr', display: 'inline-block', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                    +966 11 234 5678
                  </a>
                </div>
              </div>
              <div style={infoRow}>
                <span style={{ fontSize: '1.4rem' }}>📍</span>
                <div>
                  <div style={infoLabel}>{isAr ? 'العنوان' : 'Address'}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
                    {isAr ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: 'rgba(34,197,94,0.08)', borderRadius: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: '#22C55E', fontWeight: 500 }}>
                  {isAr ? 'الدعم متاح الآن' : 'Support Online Now'}
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 22 }}>
              {isAr ? 'أرسل لنا رسالة' : 'Send Us a Message'}
            </h2>
            <ContactForm isAr={isAr} />
          </div>
        </div>

        {/* FAQ section */}
        <div id="faq-section">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
              {isAr ? 'أجوبة على أكثر الأسئلة شيوعاً' : 'Answers to the most common questions'}
            </p>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }} role="tablist">
            {cats.map(c => (
              <button key={c.id} role="tab" aria-selected={activeCat === c.id} onClick={() => setActiveCat(c.id)}
                style={{
                  padding: '8px 20px',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: activeCat === c.id ? 600 : 500,
                  cursor: 'pointer',
                  background: activeCat === c.id ? 'var(--text-primary)' : 'var(--bg-primary)',
                  color: activeCat === c.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: `1px solid ${activeCat === c.id ? 'var(--text-primary)' : 'var(--border)'}`,
                  transition: 'all 0.2s',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={e => {
                  if (activeCat !== c.id) {
                    e.currentTarget.style.borderColor = 'var(--accent-400)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeCat !== c.id) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* FAQ list */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
            {filtered.map(faq => (
              <FAQItem key={faq.id} q={faq.q} a={faq.a} open={openSet.has(faq.id)} onToggle={() => toggle(faq.id)} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}