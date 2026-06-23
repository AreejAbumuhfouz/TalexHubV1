// // // 'use strict';
// // // // frontend/src/pages/Company/CompanyLayout.jsx

// // // import { useState } from 'react';
// // // import CompanySidebar, { CompanyTopBar, CompanyBottomNav } from './CompanySidebar';
// // // import useLangStore from '../../i18n';

// // // export default function CompanyLayout({ children, title }) {
// // //   const [collapsed, setCollapsed] = useState(false);
// // //   const { lang } = useLangStore();
// // //   const isAr = lang === 'ar';

// // //   return (
// // //     <>
// // //       <style>{`
// // //         @media (max-width: 1023px) {
// // //           .co-page-main { padding-bottom: 80px !important; }
// // //         }
// // //         * { box-sizing: border-box; }
// // //         ::-webkit-scrollbar { width: 5px; }
// // //         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
// // //       `}</style>

// // //       <div style={{
// // //         display: 'flex', minHeight: '100vh',
// // //         background: 'var(--bg-secondary)',
// // //         direction: isAr ? 'rtl' : 'ltr',
// // //         fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
// // //       }}>
// // //         <CompanySidebar collapsed={collapsed} setCollapsed={setCollapsed} />

// // //         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
// // //           <CompanyTopBar title={title} />

// // //           <main
// // //             className="co-page-main"
// // //             style={{
// // //               flex: 1, overflowY: 'auto',
// // //               padding: 'clamp(16px, 3vw, 28px)',
// // //               maxWidth: 1140,
// // //               width: '100%',
// // //               margin: '0 auto',
// // //             }}
// // //           >
// // //             {children}
// // //           </main>
// // //         </div>
// // //       </div>

// // //       <CompanyBottomNav />
// // //     </>
// // //   );
// // // }


// // 'use strict';
// // // frontend/src/pages/Company/CompanyLayout.jsx

// // import { useState, useEffect, createContext, useContext } from 'react';
// // import CompanySidebar, { CompanyTopBar, CompanyBottomNav } from './CompanySidebar';
// // import useLangStore from '../../i18n';
// // import api from '../../services/api';

// // /* ── Company context — يوفر status لكل الصفحات ── */
// // export const CompanyContext = createContext({ company: null, refetch: () => {} });
// // export const useCompany = () => useContext(CompanyContext);

// // export default function CompanyLayout({ children, title }) {
// //   const [collapsed, setCollapsed] = useState(false);
// //   const { lang } = useLangStore();
// //   const isAr = lang === 'ar';
// //   const [company, setCompany] = useState(null);

// //   const fetchCompany = () => {
// //     api.get('/companies/me')
// //       .then(r => setCompany(r.data.data.company))
// //       .catch(() => {});
// //   };

// //   useEffect(() => { fetchCompany(); }, []);

// //   return (
// //     <CompanyContext.Provider value={{ company, refetch: fetchCompany }}>
// //       <style>{`
// //         @media (max-width: 1023px) {
// //           .co-page-main { padding-bottom: 80px !important; }
// //         }
// //         * { box-sizing: border-box; }
// //         ::-webkit-scrollbar { width: 5px; }
// //         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
// //       `}</style>

// //       <div style={{
// //         display: 'flex', minHeight: '100vh',
// //         background: 'var(--bg-secondary)',
// //         direction: isAr ? 'rtl' : 'ltr',
// //         fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
// //       }}>
// //         <CompanySidebar collapsed={collapsed} setCollapsed={setCollapsed} />

// //         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
// //           <CompanyTopBar title={title} />

// //           {/* Status banner — يظهر في كل الصفحات لو مش active */}
// //           {company && company.status !== 'active' && (
// //             <GlobalStatusBar company={company} isAr={isAr} />
// //           )}

// //           <main
// //             className="co-page-main"
// //             style={{
// //               flex: 1, overflowY: 'auto',
// //               padding: 'clamp(16px, 3vw, 28px)',
// //               maxWidth: 1140,
// //               width: '100%',
// //               margin: '0 auto',
// //             }}
// //           >
// //             {children}
// //           </main>
// //         </div>
// //       </div>

// //       <CompanyBottomNav />
// //     </CompanyContext.Provider>
// //   );
// // }

// // /* ── Global status bar يظهر أعلى كل صفحة ── */
// // function GlobalStatusBar({ company, isAr }) {
// //   const { status, rejectionReason } = company;

// //   const cfg = {
// //     pending_documents: {
// //       bg: '#F59E0B', text: isAr
// //         ? '⚠ حسابك غير مفعّل — اذهب لملف الشركة لرفع شهادة التسجيل'
// //         : '⚠ Account not active — Go to Company Profile to upload your registration certificate',
// //       link: '/company/profile',
// //       linkText: isAr ? 'رفع الشهادة ←' : 'Upload Certificate →',
// //     },
// //     pending_review: {
// //       bg: '#3B82F6', text: isAr
// //         ? '⏳ طلبك قيد المراجعة — سيصلك بريد عند الموافقة'
// //         : '⏳ Your application is under review — you will receive an email upon approval',
// //       link: null, linkText: null,
// //     },
// //     rejected: {
// //       bg: '#EF4444', text: isAr
// //         ? `❌ تم رفض طلبك${rejectionReason ? `: ${rejectionReason}` : ''} — ارفع وثائق جديدة`
// //         : `❌ Application rejected${rejectionReason ? `: ${rejectionReason}` : ''} — upload new documents`,
// //       link: '/company/profile',
// //       linkText: isAr ? 'رفع وثائق جديدة ←' : 'Upload New Documents →',
// //     },
// //     suspended: {
// //       bg: '#EF4444', text: isAr
// //         ? '🚫 حسابك موقوف — تواصل مع الدعم'
// //         : '🚫 Your account is suspended — contact support',
// //       link: null, linkText: null,
// //     },
// //   }[status];

// //   if (!cfg) return null;

// //   return (
// //     <div style={{
// //       background: cfg.bg, padding: '10px 24px',
// //       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
// //       flexWrap: 'wrap',
// //     }}>
// //       <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{cfg.text}</span>
// //       {cfg.link && (
// //         <a href={cfg.link} style={{
// //           fontSize: 12.5, color: '#fff', fontWeight: 800,
// //           textDecoration: 'underline', whiteSpace: 'nowrap',
// //         }}>
// //           {cfg.linkText}
// //         </a>
// //       )}
// //     </div>
// //   );
// // }

// 'use strict';
// // frontend/src/pages/Company/CompanyLayout.jsx

// import { useState, useEffect, createContext, useContext } from 'react';
// import CompanySidebar, { CompanyTopBar, CompanyBottomNav } from './CompanySidebar';
// import useLangStore from '../../i18n';
// import api from '../../services/api';

// /* ── Company context — يوفر status لكل الصفحات ── */
// export const CompanyContext = createContext({ company: null, loading: true, error: false, refetch: () => {} });
// export const useCompany = () => useContext(CompanyContext);

// export default function CompanyLayout({ children, title }) {
//   const [collapsed, setCollapsed] = useState(false);
//   const { lang } = useLangStore();
//   const isAr = lang === 'ar';
//   const [company, setCompany] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState(false);

//   // const fetchCompany = () => {
//   //   setLoading(true);
//   //   setError(false);
//   //   api.get('/companies/me')
//   //     .then(r => { setCompany(r.data.data.company); setLoading(false); })
//   //     .catch((err) => {
//   //       console.error('[CompanyLayout] failed to fetch company:', err.message);
//   //       setError(true);
//   //       setLoading(false);
//   //     });
//   // };
// // في CompanyLayout.jsx
// const fetchCompany = () => {
//   setLoading(true);
//   setError(false);
//   api.get('/companies/me')
//     .then(r => { 
//       console.log('📦 API Response:', r.data); // 🔍 أضف هذا للتحقق
      
//       // ✅ طريقة آمنة للوصول للبيانات
//       const companyData = r.data?.data?.company || r.data?.company || null;
      
//       if (companyData) {
//         console.log('✅ Company found:', companyData.name);
//         setCompany(companyData);
//       } else {
//         console.log('❌ No company data in response');
//         setCompany(null);
//         setError(true);
//       }
//       setLoading(false);
//     })
//     .catch((err) => {
//       console.error('[CompanyLayout] failed to fetch company:', err.message);
//       console.error('Response:', err.response?.data);
//       setError(true);
//       setLoading(false);
//     });
// };
//   useEffect(() => { fetchCompany(); }, []);

//   return (
//     <CompanyContext.Provider value={{ company, loading, error, refetch: fetchCompany }}>
//       <style>{`
//         @media (max-width: 1023px) {
//           .co-page-main { padding-bottom: 80px !important; }
//         }
//         * { box-sizing: border-box; }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
//       `}</style>

//       <div style={{
//         display: 'flex', minHeight: '100vh',
//         background: 'var(--bg-secondary)',
//         direction: isAr ? 'rtl' : 'ltr',
//         fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
//       }}>
//         <CompanySidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//           <CompanyTopBar title={title} />

//           {/* Status banner — يظهر في كل الصفحات لو مش active */}
//           {company && company.status !== 'active' && (
//             <GlobalStatusBar company={company} isAr={isAr} />
//           )}

//           <main
//             className="co-page-main"
//             style={{
//               flex: 1, overflowY: 'auto',
//               padding: 'clamp(16px, 3vw, 28px)',
//               maxWidth: 1140,
//               width: '100%',
//               margin: '0 auto',
//             }}
//           >
//             {children}
//           </main>
//         </div>
//       </div>

//       <CompanyBottomNav />
//     </CompanyContext.Provider>
//   );
// }

// /* ── Global status bar يظهر أعلى كل صفحة ── */
// function GlobalStatusBar({ company, isAr }) {
//   const { status, rejectionReason } = company;

//   const cfg = {
//     pending_documents: {
//       bg: '#F59E0B', text: isAr
//         ? '⚠ حسابك غير مفعّل — اذهب لملف الشركة لرفع شهادة التسجيل'
//         : '⚠ Account not active — Go to Company Profile to upload your registration certificate',
//       link: '/company/profile',
//       linkText: isAr ? 'رفع الشهادة ←' : 'Upload Certificate →',
//     },
//     pending_review: {
//       bg: '#3B82F6', text: isAr
//         ? '⏳ طلبك قيد المراجعة — سيصلك بريد عند الموافقة'
//         : '⏳ Your application is under review — you will receive an email upon approval',
//       link: null, linkText: null,
//     },
//     rejected: {
//       bg: '#EF4444', text: isAr
//         ? `❌ تم رفض طلبك${rejectionReason ? `: ${rejectionReason}` : ''} — ارفع وثائق جديدة`
//         : `❌ Application rejected${rejectionReason ? `: ${rejectionReason}` : ''} — upload new documents`,
//       link: '/company/profile',
//       linkText: isAr ? 'رفع وثائق جديدة ←' : 'Upload New Documents →',
//     },
//     suspended: {
//       bg: '#EF4444', text: isAr
//         ? '🚫 حسابك موقوف — تواصل مع الدعم'
//         : '🚫 Your account is suspended — contact support',
//       link: null, linkText: null,
//     },
//   }[status];

//   if (!cfg) return null;

//   return (
//     <div style={{
//       background: cfg.bg, padding: '10px 24px',
//       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
//       flexWrap: 'wrap',
//     }}>
//       <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{cfg.text}</span>
//       {cfg.link && (
//         <a href={cfg.link} style={{
//           fontSize: 12.5, color: '#fff', fontWeight: 800,
//           textDecoration: 'underline', whiteSpace: 'nowrap',
//         }}>
//           {cfg.linkText}
//         </a>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // LockedPage — يُستخدم داخل الصفحات المحمية (dashboard, jobs, etc.)
// // بعد فتح <CompanyLayout> مباشرة، لو company.status !== 'active'
// // مثال الاستخدام:
// //   const { company } = useCompany();
// //   if (company && company.status !== 'active') return <LockedPage isAr={isAr} />;
// // ════════════════════════════════════════════════════════════
// export function LockedPage({ isAr }) {
//   return (
//     <div style={{
//       minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
//       padding: 24,
//     }}>
//       <div style={{ textAlign: 'center', maxWidth: 420 }}>
//         <div style={{
//           width: 64, height: 64, borderRadius: '50%',
//           background: 'var(--bg-secondary)', border: '1px solid var(--border)',
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//           margin: '0 auto 18px', fontSize: 26,
//         }}>
//           🔒
//         </div>
//         <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
//           {isAr ? 'بانتظار موافقة الإدارة' : 'Pending Admin Approval'}
//         </h2>
//         <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
//           {isAr
//             ? 'سيتم فتح هذه الصفحة بعد رفع شهادة التسجيل وموافقة فريقنا على حسابك.'
//             : 'This page will unlock once you upload your registration certificate and our team approves your account.'}
//         </p>
//         <a href="/company/profile" style={{
//           display: 'inline-block', padding: '11px 26px', borderRadius: 10,
//           background: 'var(--text-primary)', color: 'var(--bg-primary)',
//           textDecoration: 'none', fontSize: 13.5, fontWeight: 700,
//         }}>
//           {isAr ? 'اذهب لملف الشركة ←' : 'Go to Company Profile →'}
//         </a>
//       </div>
//     </div>
//   );
// }
'use strict';
// frontend/src/pages/Company/CompanyLayout.jsx

import { useState, useEffect, createContext, useContext, useCallback, useMemo } from 'react';
//                                              ↑↑↑ أضف useCallback و useMemo
import CompanySidebar, { CompanyTopBar, CompanyBottomNav } from './CompanySidebar';
import useLangStore from '../../i18n';
import api from '../../services/api';

/* ── Company context ── */
export const CompanyContext = createContext({ 
  company: null, 
  loading: true, 
  error: false, 
  refetch: () => {} 
});
export const useCompany = () => useContext(CompanyContext);

export default function CompanyLayout({ children, title }) {
  const [collapsed, setCollapsed] = useState(false);
  const { lang } = useLangStore();
  const isAr = lang === 'ar';
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 🔥 استخدم useCallback هنا
  const fetchCompany = useCallback(() => {
    console.log('🔄 Fetching company data...');
    setLoading(true);
    setError(false);
    setErrorMessage('');
    
    api.get('/companies/me')
      .then(r => { 
        console.log('📦 API Response:', r.data);
        
        let companyData = null;
        if (r.data?.data?.company) {
          companyData = r.data.data.company;
        } else if (r.data?.company) {
          companyData = r.data.company;
        } else if (r.data?.data) {
          companyData = r.data.data;
        }
        
        console.log('📦 Extracted company:', companyData);
        
        if (companyData && Object.keys(companyData).length > 0) {
          console.log('✅ Company found:', companyData.name);
          setCompany(companyData);
          setError(false);
        } else {
          console.warn('⚠️ No company data found');
          setCompany(null);
          setError(true);
          setErrorMessage(isAr ? 'لا توجد شركة مرتبطة' : 'No company linked');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ [CompanyLayout] failed to fetch company:', err);
        setError(true);
        setErrorMessage(
          err.response?.data?.message || 
          err.message || 
          (isAr ? 'فشل تحميل بيانات الشركة' : 'Failed to load company data')
        );
        setLoading(false);
      });
  }, [isAr]); // 🔥 أضف isAr كـ dependency

  // 🔥 استخدم useMemo لقيمة الـ Context
  const contextValue = useMemo(() => ({
    company,
    loading,
    error,
    refetch: fetchCompany
  }), [company, loading, error, fetchCompany]);

  useEffect(() => { 
    fetchCompany(); 
  }, [fetchCompany]);

  // Timeout
  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      console.warn('⏰ Loading timeout!');
      setError(true);
      setErrorMessage(isAr ? 'انتهت مهلة التحميل' : 'Loading timeout');
      setLoading(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, [loading, isAr]);

  // مراقبة التغييرات
  useEffect(() => {
    console.log('🔄 CompanyContext updated:', { 
      companyName: company?.name, 
      companyStatus: company?.status,
      loading, 
      error,
      hasCompany: !!company 
    });
  }, [company, loading, error]);

  return (
    <CompanyContext.Provider value={contextValue}>
      <style>{`
        @media (max-width: 1023px) {
          .co-page-main { padding-bottom: 80px !important; }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
      `}</style>

      <div style={{
        display: 'flex', minHeight: '100vh',
        background: 'var(--bg-secondary)',
        direction: isAr ? 'rtl' : 'ltr',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
      }}>
        <CompanySidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <CompanyTopBar title={title} />

          {error && !loading && (
            <div style={{
              background: '#EF4444',
              padding: '12px 24px',
              textAlign: 'center',
              color: 'white',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}>
              <span>⚠️ {errorMessage || (isAr ? 'حدث خطأ في تحميل البيانات' : 'Error loading data')}</span>
              <button 
                onClick={fetchCompany}
                style={{
                  background: 'white',
                  color: '#EF4444',
                  border: 'none',
                  padding: '4px 16px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                {isAr ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </div>
          )}

          {company && company.status !== 'active' && (
            <GlobalStatusBar company={company} isAr={isAr} />
          )}

          <main
            className="co-page-main"
            style={{
              flex: 1, overflowY: 'auto',
              padding: 'clamp(16px, 3vw, 28px)',
              maxWidth: 1140,
              width: '100%',
              margin: '0 auto',
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <CompanyBottomNav />
    </CompanyContext.Provider>
  );
}

// ... باقي الكود (GlobalStatusBar, LockedPage) كما هو ...

/* ── Global status bar ── */
function GlobalStatusBar({ company, isAr }) {
  const { status, rejectionReason } = company;

  const cfg = {
    pending_documents: {
      bg: '#F59E0B', 
      text: isAr
        ? '⚠ حسابك غير مفعّل — اذهب لملف الشركة لرفع شهادة التسجيل'
        : '⚠ Account not active — Go to Company Profile to upload your registration certificate',
      link: '/company/profile',
      linkText: isAr ? 'رفع الشهادة ←' : 'Upload Certificate →',
    },
    pending_review: {
      bg: '#3B82F6', 
      text: isAr
        ? '⏳ طلبك قيد المراجعة — سيصلك بريد عند الموافقة'
        : '⏳ Your application is under review — you will receive an email upon approval',
      link: null, 
      linkText: null,
    },
    rejected: {
      bg: '#EF4444', 
      text: isAr
        ? `❌ تم رفض طلبك${rejectionReason ? `: ${rejectionReason}` : ''} — ارفع وثائق جديدة`
        : `❌ Application rejected${rejectionReason ? `: ${rejectionReason}` : ''} — upload new documents`,
      link: '/company/profile',
      linkText: isAr ? 'رفع وثائق جديدة ←' : 'Upload New Documents →',
    },
    suspended: {
      bg: '#EF4444', 
      text: isAr
        ? '🚫 حسابك موقوف — تواصل مع الدعم'
        : '🚫 Your account is suspended — contact support',
      link: null, 
      linkText: null,
    },
  }[status];

  if (!cfg) return null;

  return (
    <div style={{
      background: cfg.bg, 
      padding: '10px 24px',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      gap: 16,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 12.5, color: '#fff', fontWeight: 600 }}>{cfg.text}</span>
      {cfg.link && (
        <a href={cfg.link} style={{
          fontSize: 12.5, 
          color: '#fff', 
          fontWeight: 800,
          textDecoration: 'underline', 
          whiteSpace: 'nowrap',
        }}>
          {cfg.linkText}
        </a>
      )}
    </div>
  );
}

/* ── LockedPage ── */
export function LockedPage({ isAr }) {
  return (
    <div style={{
      minHeight: '60vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 18px', fontSize: 26,
        }}>
          🔒
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {isAr ? 'بانتظار موافقة الإدارة' : 'Pending Admin Approval'}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          {isAr
            ? 'سيتم فتح هذه الصفحة بعد رفع شهادة التسجيل وموافقة فريقنا على حسابك.'
            : 'This page will unlock once you upload your registration certificate and our team approves your account.'}
        </p>
        <a href="/company/profile" style={{
          display: 'inline-block', 
          padding: '11px 26px', 
          borderRadius: 10,
          background: 'var(--text-primary)', 
          color: 'var(--bg-primary)',
          textDecoration: 'none', 
          fontSize: 13.5, 
          fontWeight: 700,
        }}>
          {isAr ? 'اذهب لملف الشركة ←' : 'Go to Company Profile →'}
        </a>
      </div>
    </div>
  );
}