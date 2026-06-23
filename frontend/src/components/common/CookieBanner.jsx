'use strict';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useLang from '../../i18n';

const STORAGE_KEY = 'talex_cookie_consent';

// ── خيارات الكوكيز ────────────────────────────────────────
const COOKIE_CATEGORIES = {
  necessary: {
    ar: 'ضرورية',
    en: 'Necessary',
    descAr: 'مطلوبة لتشغيل الموقع، لا يمكن تعطيلها.',
    descEn: 'Required for the website to function. Cannot be disabled.',
    locked: true,
    default: true,
  },
  analytics: {
    ar: 'إحصائيات',
    en: 'Analytics',
    descAr: 'تساعدنا على فهم كيفية استخدامك للموقع.',
    descEn: 'Help us understand how you use the site.',
    locked: false,
    default: false,
  },
  marketing: {
    ar: 'تسويق',
    en: 'Marketing',
    descAr: 'تُستخدم لتقديم إعلانات ذات صلة باهتماماتك.',
    descEn: 'Used to show ads relevant to your interests.',
    locked: false,
    default: false,
  },
};

export default function CookieBanner() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const font  = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  const [visible,    setVisible]    = useState(false);
  const [expanded,   setExpanded]   = useState(false); // Manage Preferences view
  const [animOut,    setAnimOut]    = useState(false);
  const [prefs, setPrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  // تحقق من وجود موافقة مسبقة
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      // تأخير بسيط حتى يتحمّل الصفحة أولاً
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = (choices) => {
    setAnimOut(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...choices,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      setVisible(false);
      setAnimOut(false);
    }, 350);
  };

  const acceptAll = () => {
    dismiss({ necessary: true, analytics: true, marketing: true, decision: 'all' });
  };

  const rejectAll = () => {
    dismiss({ necessary: true, analytics: false, marketing: false, decision: 'necessary' });
  };

  const savePrefs = () => {
    dismiss({ ...prefs, decision: 'custom' });
  };

  const togglePref = (key) => {
    if (COOKIE_CATEGORIES[key].locked) return;
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookieSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(24px); }
        }
        .cookie-banner {
          animation: ${animOut ? 'cookieSlideDown' : 'cookieSlideUp'} 0.35s cubic-bezier(0.4,0,0.2,1) both;
        }
        .cookie-toggle {
          width: 40px; height: 22px; border-radius: 11px;
          border: none; cursor: pointer; position: relative;
          transition: background 0.2s ease; flex-shrink: 0;
        }
        .cookie-toggle-thumb {
          position: absolute; top: 3px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #fff; transition: left 0.2s ease, right 0.2s ease;
        }
        .cookie-category:not(:last-child) {
          border-bottom: 1px solid var(--border);
        }
      `}</style>

      {/* Overlay subtle */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
        }}
        onClick={rejectAll}
        aria-hidden="true"
      />

      {/* Banner */}
      <div
        className="cookie-banner"
        role="dialog"
        aria-modal="true"
        aria-label={isAr ? 'إشعار ملفات تعريف الارتباط' : 'Cookie consent notice'}
        style={{
          position: 'fixed',
          bottom: 20,
          [isAr ? 'right' : 'left']: 20,
          zIndex: 9999,
          width: 'min(440px, calc(100vw - 40px))',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
          overflow: 'hidden',
          direction: isAr ? 'rtl' : 'ltr',
          fontFamily: font,
        }}
      >
        {/* ── الرأس ── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          {/* أيقونة الكوكيز */}
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: 'var(--text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
          }}>
            🍪
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 800, margin: '0 0 2px', color: 'var(--text-primary)', fontFamily: font }}>
              {isAr ? 'نستخدم ملفات تعريف الارتباط' : 'We use cookies'}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
              {isAr ? 'لتحسين تجربتك على TalexHub' : 'To improve your experience on TalexHub'}
            </p>
          </div>
        </div>

        {/* ── المحتوى الرئيسي ── */}
        <div style={{ padding: '16px 20px' }}>
          {!expanded ? (
            /* ── العرض المبسّط ── */
            <>
              <p style={{
                fontSize: 13, lineHeight: 1.65,
                color: 'var(--text-secondary)', margin: '0 0 16px',
                fontFamily: font,
              }}>
                {isAr
                  ? 'نحن وشركاؤنا نستخدم ملفات تعريف الارتباط لضمان عمل الموقع بشكل صحيح، وتحليل الأداء، وتخصيص المحتوى. يمكنك قبول الكل أو إدارة تفضيلاتك.'
                  : 'We and our partners use cookies to ensure the website works correctly, analyze performance, and personalize content. You can accept all or manage your preferences.'
                }
              </p>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 16px', fontFamily: font }}>
                {isAr ? 'لمعرفة المزيد، راجع ' : 'Learn more in our '}
                <Link
                  to="/cookies"
                  style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; }}
                  onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; }}
                >
                  {isAr ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
                </Link>
                {isAr ? '.' : '.'}
              </p>

              {/* أزرار الإجراءات */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* قبول الكل */}
                <button
                  onClick={acceptAll}
                  style={{
                    width: '100%', padding: '11px',
                    borderRadius: 11, border: 'none',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    fontSize: 13.5, fontWeight: 700,
                    fontFamily: font, cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {isAr ? '✓ قبول الكل' : '✓ Accept All'}
                </button>

                {/* صف: رفض + إدارة */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={rejectAll}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: 11,
                      border: '1.5px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: font, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    {isAr ? 'الضرورية فقط' : 'Necessary Only'}
                  </button>
                  <button
                    onClick={() => setExpanded(true)}
                    style={{
                      flex: 1, padding: '10px',
                      borderRadius: 11,
                      border: '1.5px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600,
                      fontFamily: font, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                  >
                    ⚙ {isAr ? 'إدارة التفضيلات' : 'Manage Prefs'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ── عرض إدارة التفضيلات ── */
            <>
              <button
                onClick={() => setExpanded(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontSize: 12.5,
                  fontFamily: font, padding: '0 0 12px',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {isAr ? '→ رجوع' : '← Back'}
              </button>

              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px', fontFamily: font }}>
                {isAr
                  ? 'اختر أنواع ملفات تعريف الارتباط التي تسمح بها:'
                  : 'Choose which cookie types you allow:'
                }
              </p>

              {/* قائمة الفئات */}
              <div style={{
                border: '1px solid var(--border)', borderRadius: 12,
                overflow: 'hidden', marginBottom: 14,
              }}>
                {Object.entries(COOKIE_CATEGORIES).map(([key, cat]) => (
                  <div
                    key={key}
                    className="cookie-category"
                    style={{
                      padding: '12px 14px',
                      display: 'flex', alignItems: 'flex-start',
                      gap: 12, background: 'var(--bg-secondary)',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
                          {isAr ? cat.ar : cat.en}
                        </span>
                        {cat.locked && (
                          <span style={{
                            fontSize: 10, padding: '1px 6px', borderRadius: 99,
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            fontFamily: 'var(--font-en)',
                          }}>
                            {isAr ? 'إلزامي' : 'Required'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.5 }}>
                        {isAr ? cat.descAr : cat.descEn}
                      </p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => togglePref(key)}
                      disabled={cat.locked}
                      className="cookie-toggle"
                      aria-checked={prefs[key]}
                      role="switch"
                      aria-label={isAr ? cat.ar : cat.en}
                      style={{
                        background: prefs[key] ? 'var(--text-primary)' : 'var(--border)',
                        opacity: cat.locked ? 0.5 : 1,
                        cursor: cat.locked ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <div
                        className="cookie-toggle-thumb"
                        style={{
                          [isAr ? 'right' : 'left']: prefs[key] ? '21px' : '3px',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>

              {/* أزرار الحفظ */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={acceptAll}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: 10, border: 'none',
                    background: 'var(--text-primary)',
                    color: 'var(--bg-primary)',
                    fontSize: 12.5, fontWeight: 700,
                    fontFamily: font, cursor: 'pointer',
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {isAr ? 'قبول الكل' : 'Accept All'}
                </button>
                <button
                  onClick={savePrefs}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: 12.5, fontWeight: 700,
                    fontFamily: font, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {isAr ? 'حفظ التفضيلات' : 'Save Preferences'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* شريط سفلي: نص صغير */}
        <div style={{
          padding: '8px 20px 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          {[
            { to: '/privacy', ar: 'الخصوصية',  en: 'Privacy' },
            { to: '/terms',   ar: 'الشروط',     en: 'Terms'   },
            { to: '/cookies', ar: 'الكوكيز',    en: 'Cookies' },
          ].map((link, i, arr) => (
            <span key={link.to} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Link
                to={link.to}
                style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: font }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {isAr ? link.ar : link.en}
              </Link>
              {i < arr.length - 1 && <span style={{ color: 'var(--border)', fontSize: 11 }}>·</span>}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * Helper hook — استخدمه في أي مكان لقراءة موافقة المستخدم
 *
 * @example
 * const { analytics, marketing } = useCookieConsent();
 * if (analytics) initGoogleAnalytics();
 */
export function useCookieConsent() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return { necessary: true, analytics: false, marketing: false };
  try { return JSON.parse(saved); }
  catch { return { necessary: true, analytics: false, marketing: false }; }
}
