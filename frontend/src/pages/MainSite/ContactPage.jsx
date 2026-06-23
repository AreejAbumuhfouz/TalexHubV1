'use strict';

import { useEffect, useRef, useState } from 'react';
import {
  Mail, Phone, MapPin, Send, CheckCircle2,
  Headphones, Globe, Instagram, Linkedin, Twitter,
  AlertCircle, RefreshCw, MessageSquare, ArrowUpRight,
  Facebook,
} from 'lucide-react';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useLangStore from '../../i18n';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import image from '../../assets/images/LocationImage.jpeg';

/* ═══════════════════════════════════════════
   ANIMATION HOOK
═══════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */
const CATEGORIES = [
  { v: 'general',     ar: 'استفسار عام',      en: 'General Inquiry'   },
  { v: 'technical',   ar: 'مشكلة تقنية',       en: 'Technical Issue'   },
  { v: 'billing',     ar: 'الاشتراك والدفع',    en: 'Billing & Payment' },
  { v: 'career',      ar: 'نصيحة مهنية',        en: 'Career Advice'     },
  { v: 'partnership', ar: 'شراكة وتعاون',       en: 'Partnership'       },
  { v: 'other',       ar: 'أخرى',               en: 'Other'             },
];

const INFO_ROWS = (isAr) => [
  { icon: Mail,       label: isAr ? 'البريد الإلكتروني' : 'Email',         value: 'hello@TalexHub.com',                      href: 'mailto:hello@TalexHub.com' },
  { icon: Phone,      label: isAr ? 'الهاتف'            : 'Phone',         value: '+962 79 000 0000',                         href: 'tel:+96279000000'          },
  { icon: MapPin,     label: isAr ? 'الموقع'            : 'Location',      value: isAr ? 'عمّان، الأردن' : 'Amman, Jordan', href: 'https://maps.google.com'   },
  { icon: Headphones, label: isAr ? 'وقت الدعم'         : 'Support Hours', value: isAr ? 'الأحد – الخميس، 9ص – 6م' : 'Sun – Thu, 9am – 6pm'              },
];

const SOCIALS = [
  { icon: Facebook,  href: 'https://facebook.com/TalexHub',         label: 'Facebook',  color: '#1877F2' },
  { icon: Instagram, href: 'https://instagram.com/TalexHub',        label: 'Instagram', color: '#E1306C' },
  { icon: Twitter,   href: 'https://twitter.com/TalexHub',          label: 'Twitter',   color: '#414243' },
  { icon: Linkedin,  href: 'https://linkedin.com/company/TalexHub', label: 'LinkedIn',  color: '#0A66C2' },
];

/* ═══════════════════════════════════════════
   FIELD WRAPPER
═══════════════════════════════════════════ */
function Field({ label, required, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontSize: 11, fontWeight: 700,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontFamily: 'var(--font-en)',
      }}>
        {label} {required && <span style={{ color: 'var(--text-primary)' }}>*</span>}
      </label>
      {children}
      {error && (
        <p style={{ fontSize: 12, color: '#EF4444', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputStyle = (hasError) => ({
  width: '100%',
  padding: '11px 14px',
  borderRadius: 10,
  border: `1px solid ${hasError ? '#EF4444' : 'var(--border)'}`,
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
});

/* ═══════════════════════════════════════════
   CONTACT FORM
═══════════════════════════════════════════ */
function ContactForm({ isAr, font }) {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name:     user?.fullName || '',
    email:    user?.email    || '',
    phone:    '',
    subject:  '',
    category: 'general',
    message:  '',
  });
  const [errs,      setErrs]      = useState({});
  const [sending,   setSending]   = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errs[k]) setErrs(p => ({ ...p, [k]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = isAr ? 'الاسم مطلوب' : 'Name required';
    if (!form.email.trim())
      e.email = isAr ? 'البريد مطلوب' : 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = isAr ? 'بريد غير صالح' : 'Invalid email';
    if (!form.subject.trim())
      e.subject = isAr ? 'الموضوع مطلوب' : 'Subject required';
    if (form.message.trim().length < 10)
      e.message = isAr ? 'الرسالة قصيرة جداً' : 'Message too short (min 10 chars)';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    try {
      await api.post('/contact', form);
      setSubmitted(true);
      toast.success(isAr ? 'تم الإرسال بنجاح!' : 'Message sent!');
    } catch (err) {
      if (err.response?.status === 429)
        toast.error(isAr ? 'تجاوزت الحد المسموح (3 رسائل / 24 ساعة)' : 'Rate limit: max 3 messages per day');
      else
        toast.error(err.response?.data?.message || (isAr ? 'فشل الإرسال' : 'Failed to send'));
    } finally {
      setSending(false);
    }
  };

  /* ── Success ── */
  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '52px 24px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <CheckCircle2 size={32} color="var(--text-primary)" />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px', fontFamily: font }}>
        {isAr ? 'تم إرسال رسالتك ✓' : 'Message Sent ✓'}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, margin: '0 0 28px', maxWidth: 340, marginInline: 'auto', fontFamily: font }}>
        {isAr
          ? 'شكراً لتواصلك معنا. سيتم الرد على رسالتك خلال 24 ساعة.'
          : "Thanks for reaching out. We'll reply within 24 hours."}
      </p>
      <button
        onClick={() => { setSubmitted(false); setForm(p => ({ ...p, subject: '', message: '' })); }}
        style={{
          padding: '13px 28px', borderRadius: 12,
          border: '1.5px solid var(--border)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: 15, fontWeight: 600,
          cursor: 'pointer', fontFamily: font,
          transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
      </button>
    </div>
  );

  const onFocus = (hasErr) => (e) => {
    e.target.style.borderColor = hasErr ? '#EF4444' : 'var(--text-primary)';
    e.target.style.boxShadow   = hasErr ? '0 0 0 3px rgba(239,68,68,0.08)' : 'none';
  };
  const onBlur = (hasErr) => (e) => {
    e.target.style.borderColor = hasErr ? '#EF4444' : 'var(--border)';
    e.target.style.boxShadow   = 'none';
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Name + Email */}
      <div className="cp-grid-2">
        <Field label={isAr ? 'الاسم الكامل' : 'Full Name'} required error={errs.name}>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            style={inputStyle(!!errs.name)}
            placeholder={isAr ? 'اسمك الكامل...' : 'Your full name...'}
            onFocus={onFocus(!!errs.name)} onBlur={onBlur(!!errs.name)} />
        </Field>
        <Field label={isAr ? 'البريد الإلكتروني' : 'Email Address'} required error={errs.email}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            style={inputStyle(!!errs.email)} dir="ltr"
            placeholder="you@example.com"
            onFocus={onFocus(!!errs.email)} onBlur={onBlur(!!errs.email)} />
        </Field>
      </div>

      {/* Phone + Category */}
      <div className="cp-grid-2">
        <Field label={isAr ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
            style={inputStyle(false)} dir="ltr"
            placeholder="+962 7x xxx xxxx"
            onFocus={onFocus(false)} onBlur={onBlur(false)} />
        </Field>
        <Field label={isAr ? 'التصنيف' : 'Category'}>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            style={{ ...inputStyle(false), cursor: 'pointer', appearance: 'none' }}
            onFocus={onFocus(false)} onBlur={onBlur(false)}>
            {CATEGORIES.map(c => (
              <option key={c.v} value={c.v}>{isAr ? c.ar : c.en}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Subject */}
      <Field label={isAr ? 'الموضوع' : 'Subject'} required error={errs.subject}>
        <input value={form.subject} onChange={e => set('subject', e.target.value)}
          style={inputStyle(!!errs.subject)}
          placeholder={isAr ? 'موضوع رسالتك...' : 'What is this about?'}
          onFocus={onFocus(!!errs.subject)} onBlur={onBlur(!!errs.subject)} />
      </Field>

      {/* Message */}
      <Field label={isAr ? 'رسالتك' : 'Your Message'} required error={errs.message}>
        <textarea value={form.message} onChange={e => set('message', e.target.value)}
          rows={5}
          style={{ ...inputStyle(!!errs.message), resize: 'vertical', lineHeight: 1.7 }}
          placeholder={isAr ? 'اكتب رسالتك هنا (10 أحرف على الأقل)...' : 'Write your message here (min 10 chars)...'}
          onFocus={onFocus(!!errs.message)} onBlur={onBlur(!!errs.message)} />
        <p style={{
          fontSize: 11.5, color: 'var(--text-secondary)',
          margin: '-2px 0 0',
          textAlign: isAr ? 'left' : 'right',
          fontFamily: 'var(--font-en)',
        }}>
          {form.message.length} / 1000
        </p>
      </Field>

      {/* Submit */}
      <button type="submit" disabled={sending}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          padding: '13px 28px', borderRadius: 12,
          background: 'var(--text-primary)', color: 'var(--bg-primary)',
          border: 'none', fontSize: 15, fontWeight: 700,
          cursor: sending ? 'default' : 'pointer',
          fontFamily: font,
          opacity: sending ? 0.75 : 1,
          transition: 'opacity .2s',
          width: '100%',
        }}
        onMouseEnter={e => { if (!sending) e.currentTarget.style.opacity = '.85'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
        {sending
          ? <><RefreshCw size={15} style={{ animation: 'cpSpin .8s linear infinite' }} /> {isAr ? 'جاري الإرسال...' : 'Sending...'}</>
          : <><Send size={15} /> {isAr ? 'إرسال الرسالة' : 'Send Message'}</>}
      </button>

      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', textAlign: 'center', margin: '-4px 0 0', fontFamily: font }}>
        {isAr ? 'بإرسالك توافق على سياسة الخصوصية' : 'By sending, you agree to our Privacy Policy'}
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function ContactPage() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';
  const font  = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const infoRows = INFO_ROWS(isAr);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div dir={dir} style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: font,
      overflowX: 'hidden',
    }}>

      {/* ── Global responsive styles ── */}
      <style>{`
        @keyframes cpSpin { to { transform: rotate(360deg); } }

        /* 2-col form grid → 1-col on mobile */
        .cp-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        /* main two-col layout */
        .cp-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 28px;
          align-items: start;
        }

        /* info rows grid inside contact-info card */
        .cp-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        @media (max-width: 768px) {
          .cp-grid-2 {
            grid-template-columns: 1fr;
          }
          .cp-layout {
            grid-template-columns: 1fr;
          }
          .cp-info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Header />

      {/* ══════════════════════════════════
          HERO — identical to AboutPage
      ══════════════════════════════════ */}
      <section
        aria-labelledby="contact-hero-heading"
        style={{ paddingTop: 100, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)',
            backgroundSize: '36px 36px',
            opacity: 0.5,
          }} />
          <div style={{
            position: 'absolute', top: -200, insetInlineEnd: -200,
            width: 700, height: 700, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            filter: 'blur(80px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -100, insetInlineStart: -100,
            width: 500, height: 500, borderRadius: '50%',
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            filter: 'blur(60px)',
          }} />
        </div>

        <div style={{
          maxWidth: 900, margin: '0 auto',
          padding: '0 clamp(20px,5vw,60px)',
          position: 'relative', textAlign: 'center',
        }}>
          <Reveal>
            

            <h1 id="contact-hero-heading" style={{
              fontSize: 'clamp(24px,5.5vw,64px)',
              fontWeight: 900,
              margin: '32px 0 20px',
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              fontFamily: font,
              color: 'var(--text-primary)',
            }}>
              {isAr ? 'كيف يمكننا مساعدتك؟' : 'How Can We Help You?'}
            </h1>

            <p style={{
              fontSize: 'clamp(12px,1.8vw,16px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.72,
              margin: '0 auto',
              maxWidth: 650,
              fontFamily: font,
            }}>
              {isAr
                ? 'فريقنا جاهز للإجابة على استفساراتك ومساعدتك في الحصول على أفضل تجربة على منصة TalexHub.'
                : 'Our team is ready to answer your questions and help you get the most out of TalexHub.'}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <section style={{ padding: 'clamp(48px,8vw,88px) clamp(16px,5vw,60px)', maxWidth: 1200, margin: '0 auto' }}>
        <div className="cp-layout">

          {/* ── LEFT: Form ── */}
          <Reveal>
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              padding: 'clamp(20px,4vw,40px)',
            }}>
              <div style={{ marginBottom: 28 }}>
                <h2 style={{
                  fontSize: 'clamp(17px,3vw,20px)',
                  fontWeight: 800,
                  margin: '0 0 6px',
                  letterSpacing: '-0.02em',
                  fontFamily: font,
                }}>
                  {isAr ? 'أرسل رسالة' : 'Send a Message'}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                  {isAr ? 'يصلنا بريدك وسنرد في أقرب وقت' : "Fill in the form and we'll get back to you"}
                </p>
              </div>
              <ContactForm isAr={isAr} font={font} />
            </div>
          </Reveal>

          {/* ── RIGHT: Image + Info + Socials ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Map Image */}
            <Reveal delay={80}>
              <div style={{
                borderRadius: 18,
                overflow: 'hidden',
                border: '1px solid var(--border)',
                position: 'relative',
                aspectRatio: '16/10',
                background: 'var(--bg-secondary)',
              }}>
                <img
                  src={image}
                  alt={isAr ? 'خريطة منطقة العمل' : 'Coverage map'}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'cover', objectPosition: 'center',
                    display: 'block',
                    opacity: 0.9,
                    transition: 'opacity 0.3s, transform 0.5s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1.025)'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1)'; }}
                />
               
              </div>
            </Reveal>


            {/* Socials */}
            <Reveal delay={160}>
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 18,
                padding: 'clamp(14px,3vw,18px) clamp(16px,3vw,22px)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                gap: 14, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: font }}>
                  {isAr ? 'تابعنا' : 'Follow us'}
                </span>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SOCIALS.map((s, i) => {
                    const SIcon = s.icon;
                    return (
                      <a key={i} href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        title={s.label}
                        style={{
                          width: 40, height: 40, borderRadius: 10,
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = s.color;
                          e.currentTarget.style.background  = `${s.color}14`;
                          e.currentTarget.style.transform   = 'translateY(-2px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background  = 'var(--bg-primary)';
                          e.currentTarget.style.transform   = 'translateY(0)';
                        }}>
                        <SIcon size={16} color={s.color} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}