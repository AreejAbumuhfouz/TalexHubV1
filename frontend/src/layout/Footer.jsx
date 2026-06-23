
import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLangStore from '../i18n';
import useThemeStore from '../store/themeStore';
import api from '../services/api';
import LogoGold from '../assets/images/LogoGold.png';
import BlackLogo from '../assets/images/BlackLogo.png';
import { FaXTwitter, FaLinkedinIn, FaInstagram, FaFacebook } from 'react-icons/fa6';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

/* ── Data ────────────────────────────────────────────────── */
// const getColumns = (isAr) => ({
//   platform: {
//     title: isAr ? 'المنصة' : 'Platform',
//     links: [
//       { label: isAr ? 'عن المنصة'          : 'About Us',            to: '/about'   },
//       { label: isAr ? 'اتصل بنا'           : 'Contact',             to: '/support' },
//         ],
//   },
//   features: {
//     title: isAr ? 'المنصة' : 'Features',
//     links: [
//       { label: isAr ? 'عن المنصة'          : 'About Us',            to: '/about'   },
//       { label: isAr ? 'اتصل بنا'           : 'Contact',             to: '/support' },
//         ],
//   },
 
//   resources: {
//     title: isAr ? 'المساعدة' : 'Resources',
//     links: [
//       { label: isAr ? 'الدعم والمساعدة'  : 'Help Center',      to: '/support' },
//       { label: isAr ? 'سياسة الخصوصية'  : 'Privacy Policy',   to: '/privacy' },
//       { label: isAr ? 'الشروط والأحكام' : 'Terms of Service', to: '/terms'   },
//     ],
//   },
// });



const getColumns = (isAr) => ({
  platform: {
    title: isAr ? 'المنصة' : 'Platform',
    links: [

      { label: isAr ? 'الميزات' : 'Features', to: '/features' },
      { label: isAr ? 'عن المنصة' : 'About Us', to: '/about' },
      { label: isAr ? 'اتصل بنا' : 'Contact', to: '/support' },
      // { label: isAr ? 'المدونة' : 'Blog', to: '/blog' },
      // { label: isAr ? 'وظائف في TalexHub' : 'Careers', to: '/careers' },
    ],
  },
  features: {
    title: isAr ? 'الميزات' : 'Features',
    links: [
      { label: isAr ? 'تحليل السيرة الذاتية' : 'CV Analysis', to: '/features/cv-analysis' },
      // { label: isAr ? 'مولّد خطاب التقديم' : 'Cover Letter', to: '/features/cover-letter' },
      { label: isAr ? 'تدريب المقابلات' : 'Interview Training', to: '/features/ai-interview' },
      { label: isAr ? 'مخطط المسار المهني' : 'Career Path', to: '/features/career-path' },
      // { label: isAr ? 'التقديم التلقائي' : 'Auto-Apply', to: '/features/auto-apply' },
      { label: isAr ? 'منشئ السيرة الذاتية' : 'CV Builder', to: '/features/cv-builder' },
    ],
  },
  resources: {
    title: isAr ? 'المساعدة' : 'Resources',
    links: [
      // { label: isAr ? 'الدعم والمساعدة' : 'Help Center', to: '/support' },
      { label: isAr ? 'سياسة الخصوصية' : 'Privacy Policy', to: '/privacy' },
      { label: isAr ? 'الشروط والأحكام' : 'Terms of Service', to: '/terms' },
      { label: isAr ? 'سياسة الكوكيز' : 'Cookie Policy', to: '/cookies' },
      // { label: isAr ? 'الأسئلة الشائعة' : 'FAQ', to: '/faq' },
    ],
  },
});
const getStats = (isAr) => [];

const SOCIAL = [
  { icon: <FaFacebook size={14} />,   href: 'https://facebook.com/TalexHub',         label: 'Facebook'    },
  { icon: <FaInstagram size={14} />,  href: 'https://instagram.com/TalexHub',        label: 'Instagram'   },
  { icon: <FaXTwitter size={14} />,   href: 'https://twitter.com/TalexHub',          label: 'Twitter / X' },
  { icon: <FaLinkedinIn size={14} />, href: 'https://linkedin.com/company/TalexHub', label: 'LinkedIn'    },
];

const getLegal = (isAr) => [
  { label: isAr ? 'الشروط والأحكام' : 'Terms of Service', to: '/terms'   },
  { label: isAr ? 'سياسة الكوكيز'  : 'Cookie Policy',    to: '/cookies' },
];

/* ── Newsletter ──────────────────────────────────────────── */
function Newsletter({ isAr, dir }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const response = await api.post('/newsletter/subscribe', { 
        email, 
        source: 'footer' 
      });
      
      if (response.data.success) {
        setStatus('success');
        setMessage(isAr ? 'تم الاشتراك بنجاح في النشرة البريدية!' : 'Successfully subscribed to newsletter!');
        setEmail('');
        
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.message || 
        (isAr ? 'حدث خطأ. الرجاء المحاولة مرة أخرى.' : 'An error occurred. Please try again.')
      );
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      width: '100%',
      padding: '22px 26px',
      borderRadius: 16,
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Mail size={15} strokeWidth={1.8} color="var(--text-secondary)" />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? 'النشرة البريدية' : 'Newsletter'}
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {isAr
              ? 'احصل على أحدث الوظائف والنصائح المهنية أسبوعياً'
              : 'Get the latest jobs and career tips weekly'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flex: '1 1 280px', minWidth: 240 }}>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            placeholder={isAr ? 'بريدك الإلكتروني...' : 'Your email...'}
            dir={dir}
            style={{
              flex: 1,
              padding: '9px 13px',
              borderRadius: 9,
              border: `1px solid ${status === 'error' ? '#EF4444' : 'var(--border)'}`,
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: 13,
              outline: 'none',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
              transition: 'border-color var(--transition)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-400)'; }}
            onBlur={e => { 
              if (status !== 'error') {
                e.target.style.borderColor = 'var(--border)';
              }
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '9px 20px',
              borderRadius: 9,
              border: 'none',
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              fontWeight: 700,
              fontSize: 13,
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
              transition: 'opacity var(--transition), transform var(--transition)',
              opacity: status === 'loading' ? 0.7 : 1,
            }}
            onMouseEnter={e => { 
              if (status !== 'loading') {
                e.currentTarget.style.opacity = '0.8'; 
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => { 
              if (status !== 'loading') {
                e.currentTarget.style.opacity = '1';   
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {status === 'loading' 
              ? (isAr ? 'جاري...' : 'Subscribing...') 
              : (isAr ? 'اشترك' : 'Subscribe')}
          </button>
        </div>
      </div>
      
      {message && (
        <div style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 8,
          background: status === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${status === 'success' ? '#22C55E' : '#EF4444'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: status === 'success' ? '#22C55E' : '#EF4444',
        }}>
          {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          {message}
        </div>
      )}
    </form>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN FOOTER
════════════════════════════════════════════════════════════ */
export default function Footer() {
  const { dir, lang } = useLangStore();
  const isAr = lang === 'ar';
  const year = new Date().getFullYear();
  const columns = getColumns(isAr);
  const stats = getStats(isAr);
  const { theme } = useThemeStore();

  return (
    <footer
      dir={dir}
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px clamp(24px,5vw,48px) 0' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 40,
          alignItems: 'start',
        }}>
          <div>
            <Link to="/" aria-label="TalexHub Home"
              style={{ display: 'inline-block', textDecoration: 'none', marginBottom: 18 }}>
              <img
                src={theme === 'dark' ? LogoGold : BlackLogo}
                alt="TalexHub"
                style={{ height: 62, width: 'auto', objectFit: 'contain', display: 'block' }}
              />
            </Link>
            
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.75, maxWidth: 280, marginBottom: 20 }}>
              {isAr
                ? 'منصة التوظيف الذكية التي تربط المواهب العربية بأفضل الفرص.'
                : 'The smart recruitment platform connecting Arab talent with top opportunities.'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)', flexShrink: 0 }} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {Object.values(columns).map(col => (
            <div key={col.title}>
              <h3 style={{
                fontSize: 11, fontWeight: 600,
                color: 'var(--text-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 16,
              }}>
                {col.title}
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      style={{
                        fontSize: 13.5,
                        color: 'var(--text-secondary)',
                        textDecoration: 'none',
                        transition: 'color var(--transition)',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48 }}>
          <Newsletter isAr={isAr} dir={dir} />
        </div>

        <div style={{
          marginTop: 36,
          paddingTop: 22,
          paddingBottom: 30,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            © {year} TalexHub -{' '}
            {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
          </p>

          <nav aria-label="Legal links"
            style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {getLegal(isAr).map(link => (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  fontSize: 12.5,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'color var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div aria-label="Social media" style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {SOCIAL.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--accent-400)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}