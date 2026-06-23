import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useLangStore from '../i18n';
import useThemeStore from '../store/themeStore';
import LanguageSwitcher from '../components/common/LanguageSwitcher';
import ThemeToggle from '../components/common/ThemeToggle';
import LogoGold from '../assets/images/LogoGold.png';
import BlackLogo from '../assets/images/BlackLogo.png';
import {
  LayoutDashboard, FileText, Briefcase, Wallet, Settings,
  Users, ShieldCheck, BarChart2, Building2, UserCircle,
  ClipboardList, ChevronDown,
  FileText as FileTextIcon, Mail, Mic, Map, Zap, Layout, MessageCircle,
  Check, Crown, Sparkles, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { FEATURES_DATA } from '../data/featuresData';

const ICON_MAP = { FileText: FileTextIcon, Mail, Mic, Map, Zap, Layout, MessageCircle };
function FeatIcon({ name, size = 16, color }) {
  const Ic = ICON_MAP[name];
  return Ic ? <Ic size={size} color={color} strokeWidth={1.8} /> : null;
}

/* ── Nav links ───────────────────────────────────────────── */
const getNavLinks = (isAr) => [
  { to: '/', label: isAr ? 'الرئيسية' : 'Home' },
  { to: '/about', label: isAr ? 'عن المنصة' : 'About' },
  { to: '/contact', label: isAr ? 'تواصل معنا' : 'Contact' },
];
function useClickOutside(ref, handler) {
  useEffect(() => {
    const fn = (e) => { if (!ref.current?.contains(e.target)) handler(e); };
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn);
    return () => {
      document.removeEventListener('mousedown', fn);
      document.removeEventListener('touchstart', fn);
    };
  }, [ref, handler]);
}

function useIsDesktop() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    setOk(mq.matches);
    const fn = (e) => setOk(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return ok;
}
/* ── Features Mega Dropdown ─────────────────────────────── */
// function FeaturesDropdown({ isOpen, onClose, isAr, dir }) {
//   const ref = useRef(null);
//   useClickOutside(ref, onClose);
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   if (!isOpen) return null;

//   const featured = FEATURES_DATA.slice(0, 4);

//   return (
//     <div ref={ref}
    
//       style={{
//         // transform: 'translateX(-50%)',
//     position: 'absolute',
//     top: 'calc(100% + 14px)',
//     // left: '50%',
//     width: 'min(480px, 90vw)',
//     background: 'var(--bg-primary)',
//     border: '1px solid var(--border)',
//     borderRadius: 20,
//     boxShadow: '0 24px 64px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
//     overflow: 'hidden',
//     zIndex: 300,
//     animation: 'ddFade 0.18s cubic-bezier(0.4,0,0.2,1)',
//     direction: dir,
//   }}
//     >
//       {/* Header */}
//       <div style={{ padding: '12px 12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
//             {/* <Sparkles size={14} color="#F59E0B" /> */}
//             <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>
//               {isAr ? 'ميزات TalexHub' : 'TalexHub Features'}
//             </span>
//           </div>
//           <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//             {isAr ? 'أدوات AI لتطوير مسيرتك المهنية' : 'AI-powered tools for your career'}
//           </p>
//         </div>
//         <Link to="/features" onClick={onClose}
//           style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', textDecoration: 'none', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, transition: 'all .15s' }}
//           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//           {isAr ? 'كل الميزات' : 'All Features'}
//           {isAr ? <ArrowLeft size={11} /> : <ArrowRight size={11} />}
//         </Link>
//       </div>

//       {/* Grid */}
//       <div style={{ padding: '14px 16px 18px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2}}>
//         {featured.map(f => (
//           <Link key={f.slug} to={`/features/${f.slug}`} onClick={onClose} style={{ textDecoration: 'none', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 4, transition: 'all .15s', border: '1px solid transparent' }}
//             onMouseEnter={e => { e.currentTarget.style.background = `${f.color}08`; e.currentTarget.style.borderColor = `${f.color}25`; }}
//             onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}>
//             {/* Icon */}
//             <div style={{ width: 36, height: 36, borderRadius: 10, background: `${f.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
//               <FeatIcon name={f.icon} size={17} color={f.color} />
//             </div>
//             <div style={{ minWidth: 0 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
//                 <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//                   {isAr ? f.title.ar : f.title.en}
//                 </span>
                
//               </div>
//               <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: font, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
//                 {isAr ? f.tagline.ar : f.tagline.en}
//               </p>
//             </div>
//           </Link>
//         ))}
//       </div>

//     </div>
//   );
// }
// ════════════════════════════════════════════════════════════
// استبدل فقط function FeaturesDropdown في Header.jsx
// Responsive: 3×2 grid على الشاشات الكبيرة، 2×3 على الصغيرة
// ════════════════════════════════════════════════════════════

// function FeaturesDropdown({ isOpen, onClose, isAr, dir }) {
//   const ref = useRef(null);
//   // Exclude the trigger button from outside-click
//   useClickOutside(ref, onClose);
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   if (!isOpen) return null;

//   const featured = FEATURES_DATA.slice(0, 6);

//   return (
//     <>
//       <style>{`
//         @keyframes ddFade {
//           from { opacity:0; transform:translateY(-6px) scale(.98); }
//           to   { opacity:1; transform:none; }
//         }
//         /* Wide: 3 columns | Narrow: 2 columns */
//         .feat-dd-grid { grid-template-columns: repeat(3,1fr); }
//         @media(max-width:520px){ .feat-dd-grid{ grid-template-columns: repeat(2,1fr); } }
//         /* Positioning: LTR→left-aligned, RTL→right-aligned, mobile→centered */
//         .feat-dd-wrap { left:0; }
//         [dir="rtl"] .feat-dd-wrap { left:auto; right:0; }
//         @media(max-width:640px){
//           .feat-dd-wrap {
//             left:50% !important;
//             right:auto !important;
//             transform:translateX(-50%) !important;
//             width: calc(100vw - 24px) !important;
//           }
//         }
//         .feat-dd-item { border:1px solid transparent; transition: background .15s, border-color .15s; }
//       `}</style>

//       <div
//         ref={ref}
//         className="feat-dd-wrap"
//         style={{
//           position: 'absolute',
//           top: 'calc(100% + 12px)',
//           width: 540,
//           maxWidth: 'min(540px, calc(100vw - 24px))',
//           background: 'var(--bg-primary)',
//           border: '1px solid var(--border)',
//           borderRadius: 18,
//           boxShadow: '0 20px 56px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
//           overflow: 'hidden',
//           zIndex: 300,
//           animation: 'ddFade 0.18s cubic-bezier(0.4,0,0.2,1)',
//           direction: dir,
//         }}
//       >
//         {/* ── Header ── */}
//         <div style={{
//           padding: '14px 18px',
//           borderBottom: '1px solid var(--border)',
//           background: 'var(--bg-secondary)',
//           display: 'flex', alignItems: 'center',
//           justifyContent: 'space-between', gap: 12,
//         }}>
//           <div>
//             <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', fontFamily: font }}>
//               {isAr ? 'ميزات TalexHub' : 'TalexHub Features'}
//             </p>
//             <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//               {isAr ? 'أدوات AI لتطوير مسيرتك المهنية' : 'AI-powered tools for your career'}
//             </p>
//           </div>
//           <Link
//             to="/features"
//             onClick={onClose}
//             style={{
//               display: 'inline-flex', alignItems: 'center', gap: 5,
//               padding: '7px 14px', borderRadius: 9,
//               background: 'var(--bg-primary)', border: '1px solid var(--border)',
//               textDecoration: 'none', fontSize: 12, fontWeight: 600,
//               color: 'var(--text-secondary)', fontFamily: font,
//               transition: 'all .15s', whiteSpace: 'nowrap', flexShrink: 0,
//             }}
//             onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currentTarget.style.color='var(--text-primary)'; }}
//             onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}
//           >
//             {isAr ? 'كل الميزات' : 'All Features'}
//             {isAr ? <ArrowLeft size={11} /> : <ArrowRight size={11} />}
//           </Link>
//         </div>

//         {/* ── Features grid ── */}
//         <div className="feat-dd-grid" style={{ padding: '12px 12px 14px', display: 'grid', gap: 4 }}>
//           {featured.map(f => (
//             <Link
//               key={f.slug}
//               to={`/features/${f.slug}`}
//               onClick={onClose}
//               className="feat-dd-item"
//               style={{
//                 textDecoration: 'none',
//                 borderRadius: 12,
//                 padding: '11px 12px',
//                 display: 'flex', alignItems: 'flex-start', gap: 10,
//               }}
//               onMouseEnter={e => {
//                 e.currentTarget.style.background = `${f.color}08`;
//                 e.currentTarget.style.borderColor = `${f.color}30`;
//               }}
//               onMouseLeave={e => {
//                 e.currentTarget.style.background = 'transparent';
//                 e.currentTarget.style.borderColor = 'transparent';
//               }}
//             >
//               {/* Icon bubble */}
//               <div style={{
//                 width: 34, height: 34, borderRadius: 9,
//                 background: `${f.color}12`, flexShrink: 0,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                 marginTop: 1,
//               }}>
//                 <FeatIcon name={f.icon} size={16} color={f.color} />
//               </div>

//               {/* Text */}
//               <div style={{ minWidth: 0, flex: 1 }}>
//                 <p style={{
//                   fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)',
//                   fontFamily: font, margin: '0 0 3px',
//                   overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//                 }}>
//                   {isAr ? f.title.ar : f.title.en}
//                 </p>
//                 <p style={{
//                   fontSize: 11, color: 'var(--text-secondary)', margin: 0,
//                   fontFamily: font, lineHeight: 1.4,
//                   overflow: 'hidden',
//                   display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
//                 }}>
//                   {isAr ? f.tagline.ar : f.tagline.en}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </div>

//         {/* ── Footer ── */}
//         <div style={{
//           padding: '10px 18px',
//           borderTop: '1px solid var(--border)',
//           background: 'var(--bg-secondary)',
//           display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//           gap: 10,
//         }}>
//           <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>
//             {isAr ? '٦ ميزات مدعومة بالذكاء الاصطناعي' : '6 AI-powered features'}
//           </span>
//           <Link
//             to="/register"
//             onClick={onClose}
//             style={{
//               display: 'inline-flex', alignItems: 'center', gap: 6,
//               padding: '6px 14px', borderRadius: 8,
//               background: 'var(--text-primary)', color: 'var(--bg-primary)',
//               textDecoration: 'none', fontSize: 12, fontWeight: 700,
//               fontFamily: font, flexShrink: 0,
//             }}
//           >
//             {isAr ? 'ابدأ مجاناً' : 'Get Started'}
//             {isAr ? <ArrowLeft size={10} /> : <ArrowRight size={10} />}
//           </Link>
//         </div>
//       </div>
//     </>
//   );
// }

// ════════════════════════════════════════════════════════════
// FeaturesDropdown — 2 columns × 3 rows, monochromatic design, no footer
// ════════════════════════════════════════════════════════════

function FeaturesDropdown({ isOpen, onClose, isAr, dir }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  if (!isOpen) return null;

  const featured = FEATURES_DATA.slice(0, 6);

  return (
    <>
      <style>{`
        @keyframes ddFade {
          from { opacity:0; transform:translateY(-6px) scale(.98); }
          to   { opacity:1; transform:none; }
        }
        .feat-dd-wrap { left:0; }
        [dir="rtl"] .feat-dd-wrap { left:auto; right:0; }
        @media(max-width:640px){
          .feat-dd-wrap {
            left:50% !important;
            right:auto !important;
            transform:translateX(-50%) !important;
            width: calc(100vw - 24px) !important;
          }
        }
      `}</style>

      <div
        ref={ref}
        className="feat-dd-wrap"
        style={{
          position: 'absolute',
          top: 'calc(100% + 12px)',
          width: 560,
          maxWidth: 'min(560px, calc(100vw - 24px))',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 18,
          boxShadow: '0 20px 56px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          zIndex: 300,
          animation: 'ddFade 0.18s cubic-bezier(0.4,0,0.2,1)',
          direction: dir,
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-secondary)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: font }}>
            {isAr ? 'ميزات TalexHub' : 'TalexHub Features'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
            {isAr ? 'أدوات AI لتطوير مسيرتك المهنية' : 'AI-powered tools for your career'}
          </p>
        </div>

        {/* Features grid — 2 columns, 3 rows, UNIFORM SIZE */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: 12, 
          padding: '16px',
          background: 'var(--bg-primary)',
        }}>
          {featured.map((f, index) => (
            <Link
              key={f.slug}
              to={`/features/${f.slug}`}
              onClick={onClose}
              style={{
                textDecoration: 'none',
                borderRadius: 12,
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 10,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                minHeight: 130,
                height: 130,
                width: '100%',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.background = 'var(--bg-tertiary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Icon — same size for all */}
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FeatIcon name={f.icon} size={22} color="var(--text-secondary)" />
              </div>

              {/* Title */}
              <p style={{
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--text-primary)',
                fontFamily: font,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}>
                {isAr ? f.title.ar : f.title.en}
              </p>

              {/* Tagline - fixed height to ensure equal size */}
              <p style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                margin: 0,
                fontFamily: font,
                lineHeight: 1.4,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                height: 30,
              }}>
                {isAr ? f.tagline.ar : f.tagline.en}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Role-based dropdown items ───────────────────────────── */
const getDropdownItems = (role, isAr) => {
  if (role === 'admin' || role === 'support') return [
    { to: '/admin', icon: BarChart2, label: isAr ? 'لوحة التحكم' : 'Admin Dashboard' },
    { to: '/admin/users', icon: Users, label: isAr ? 'المستخدمون' : 'Users' },
    { to: '/admin/companies', icon: Building2, label: isAr ? 'الشركات' : 'Companies' },
    { to: '/admin/jobs', icon: Briefcase, label: isAr ? 'الوظائف' : 'Jobs' },
    { to: '/admin/courses', icon: ClipboardList, label: isAr ? 'الكورسات' : 'Courses' },
  ];

  if (role === 'company') return [
    { to: '/company/dashboard', icon: Building2, label: isAr ? 'لوحة الشركة' : 'Company Dashboard' },
    { to: '/company/jobs', icon: Briefcase, label: isAr ? 'الوظائف' : 'Jobs' },
    { to: '/company/applicants', icon: Users, label: isAr ? 'المتقدمون' : 'Applicants' },
    // { to: '/company/members',   icon: UserCircle,     label: isAr ? 'الفريق'        : 'Team'              },
    { to: '/company/profile', icon: Settings, label: isAr ? 'ملف الشركة' : 'Company Profile' },
    // { to: '/dashboard',         icon: LayoutDashboard,label: isAr ? 'حسابي الشخصي' : 'Personal Account'  },
  ];

  // default: regular user
  return [
    { to: '/dashboard', icon: LayoutDashboard, label: isAr ? 'الرئيسية' : 'Home' },
    { to: '/dashboard/cvs', icon: FileText, label: isAr ? 'سيرتي الذاتية' : 'My CVs' },
    { to: '/dashboard/jobs', icon: Briefcase, label: isAr ? 'وظائفي' : 'My Jobs' },
    { to: '/dashboard/wallet', icon: Wallet, label: isAr ? 'المحفظة' : 'Wallet' },
    { to: '/dashboard/settings', icon: Settings, label: isAr ? 'الإعدادات' : 'Settings' },
  ];
};

/* ── Role badge config ───────────────────────────────────── */
const getRoleBadge = (role, isAr) => {
  if (role === 'admin' || role === 'support') return {
    label: isAr ? 'أدمن' : 'Admin',
    color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)',
  };
  if (role === 'company') return {
    label: isAr ? 'شركة' : 'Company',
    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)',
  };
  return null;
};

/* ── Hooks ───────────────────────────────────────────────── */
function useScrolled(threshold = 30) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', fn, { passive: true });
    fn();
    return () => window.removeEventListener('scroll', fn);
  }, [threshold]);
  return scrolled;
}


/* ════════════════════════════════════════════════════════════
   PROFILE DROPDOWN  — role-aware
════════════════════════════════════════════════════════════ */
function ProfileDropdown({ user, isOpen, onClose, dir, isAr }) {
  const ref = useRef(null);
  useClickOutside(ref, (e) => {
    if (excludeRef?.current?.contains(e.target)) return; // ← يتجاهل الزر
    onClose(e);
  });
  if (!isOpen) return null;

  const role = user?.role || 'user';
  const items = getDropdownItems(role, isAr);
  const badge = getRoleBadge(role, isAr);

  const roleIcon = role === 'admin' || role === 'support'
    ? <ShieldCheck size={11} />
    : role === 'company'
      ? <Building2 size={11} />
      : null;

  return (
    <div ref={ref} role="menu"
      style={{
        position: 'absolute',
        top: 'calc(100% + 10px)',
        [dir === 'rtl' ? 'left' : 'right']: 0,
        width: 260,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        zIndex: 200,
        animation: 'ddFade 0.18s cubic-bezier(0.4,0,0.2,1)',
      }}>

      {/* ── User header ── */}
      <div style={{ padding: '15px 18px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* Avatar */}
          <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--text-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 800, fontSize: 15 }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.fullName?.charAt(0)?.toUpperCase() || 'U'
            }
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.fullName}
              </p>
              
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav items ── */}
      <div style={{ padding: '6px 0' }}>
        {items.map((item, i) => {
          const Icon = item.icon;
          // separator before "Personal Account" in company role
          const needsDivider = role === 'company' && item.to === '/dashboard';
          return (
            <div key={item.to}>
              {needsDivider && <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />}
              <Link to={item.to} role="menuitem" onClick={onClose}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', transition: 'background 0.15s', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Icon size={14} strokeWidth={1.8} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                {item.label}
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── Logout ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
        <button
          onClick={() => { useAuthStore.getState().logout(); onClose(); }}
          role="menuitem"
          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 18px', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 600, color: 'var(--danger)', cursor: 'pointer', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {isAr ? 'تسجيل الخروج' : 'Sign out'}
        </button>
      </div>
    </div>
  );
}

/* ── Sign-up dropdown ────────────────────────────────────── */
function SignupDropdown({ isOpen, onClose, isAr }) {
  const ref = useRef(null);
  useClickOutside(ref, onClose);
  if (!isOpen) return null;
  return (
    <div ref={ref} role="menu"
      style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 185, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.12)', overflow: 'hidden', zIndex: 200, animation: 'ddFade 0.18s cubic-bezier(0.4,0,0.2,1)' }}>
      <div style={{ padding: '8px 0' }}>
        {[
          { to: '/register', label: isAr ? 'أبحث عن وظيفة' : 'Find a Job' },
          { to: '/company/register', label: isAr ? 'توظيف المواهب' : 'Hire Talent' },
        ].map(o => (
          <Link key={o.to} to={o.to} role="menuitem" onClick={onClose}
            style={{ display: 'block', padding: '11px 18px', textDecoration: 'none', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            {o.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ── Hamburger ───────────────────────────────────────────── */
function Hamburger({ open }) {
  return (
    <div style={{ width: 18, height: 13, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          display: 'block', width: '100%', height: 1.5, borderRadius: 2, background: 'var(--text-primary)', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)', transformOrigin: 'center',
          transform: open ? i === 0 ? 'rotate(45deg) translate(4px, 4px)' : i === 1 ? 'scaleX(0)' : 'rotate(-45deg) translate(4px, -4px)' : 'none',
          opacity: open && i === 1 ? 0 : 1,
        }} />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN HEADER
════════════════════════════════════════════════════════════ */
export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { t, dir, lang } = useLangStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const isAr = lang === 'ar';
  const scrolled = useScrolled(30);
  const isDesktop = useIsDesktop();
  const role = user?.role || 'user';

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const featuresRef   = useRef(null);
const profileBtnRef = useRef(null);

  const navLinks = getNavLinks(isAr);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); setSignupOpen(false); setFeaturesOpen(false); }, [location.pathname]);
  useEffect(() => { if (isDesktop) setMobileOpen(false); }, [isDesktop]);
  useEffect(() => { document.body.style.overflow = mobileOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [mobileOpen]);

  const isActive = useCallback((to) => location.pathname === to || location.pathname.startsWith(to + '/'), [location.pathname]);

  // Label shown in the button next to user's first name
  const dashboardTo = role === 'admin' || role === 'support'
    ? '/admin'
    : role === 'company'
      ? '/company/dashboard'
      : '/dashboard';

  const badge = getRoleBadge(role, isAr);

  return (
    <>
      <style>{`
        @keyframes ddFade { from{opacity:0;transform:translateY(-6px) scale(.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes overlayIn { from{opacity:0} to{opacity:1} }
        .hdr-desktop{display:none!important} .hdr-mobile{  display:flex!important}
        @media(min-width:1024px){.hdr-desktop{display:flex!important} .hdr-mobile{display:none!important}}
      `}</style>

      <header role="banner" style={{ position: 'fixed', top: 0, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 1000, height: 72, display: 'flex', alignItems: 'center', background: scrolled ? 'var(--bg-primary)' : 'transparent', backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none', WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none', borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent', boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.04)' : 'none', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)', direction: dir }}>
        <div style={{ maxWidth: 1280, width: '100%', margin: '0 auto', padding: '12px  clamp(16px,4vw,32px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          
          <Link to="/" aria-label="TalexHub Home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0, zIndex: 10 }}>
  <img 
    src={theme === 'dark' ? LogoGold : BlackLogo} 
    alt="TalexHub" 
    style={{ height: 60, width: 'auto', objectFit: 'contain', display: 'block' }} 
  />
</Link>

          {/* Desktop nav */}
          


          {/* Desktop nav */}
<nav aria-label="Main navigation" className="hdr-desktop" style={{ alignItems: 'center', gap: 2 }}>
  {/* Home link */}
  <Link to="/" aria-current={isActive('/') ? 'page' : undefined}
    style={{ position: 'relative', padding: '7px 14px', borderRadius: 9, fontSize: 13.5, fontWeight: isActive('/') ? 600 : 500, color: isActive('/') ? 'var(--text-primary)' : 'var(--text-secondary)', background: isActive('/') ? 'var(--bg-secondary)' : 'transparent', textDecoration: 'none', transition: 'all var(--transition)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', letterSpacing: '-0.01em' }}
    onMouseEnter={e => { if (!isActive('/')) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; } }}
    onMouseLeave={e => { if (!isActive('/')) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}>
    {isAr ? 'الرئيسية' : 'Home'}
    {isActive('/') && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: 'var(--text-primary)' }} />}
  </Link>

  {/* ── Features dropdown button (SECOND) ── */}
  <div ref={featuresRef} style={{ position: 'relative' }}>
    <button
      onClick={() => { setFeaturesOpen(p => !p); setProfileOpen(false); setSignupOpen(false); }}
      aria-expanded={featuresOpen}
      aria-haspopup="true"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 9, border: 'none',
        background: featuresOpen ? 'var(--bg-secondary)' : 'transparent',
        color: featuresOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontSize: 13.5, fontWeight: featuresOpen ? 600 : 500,
        cursor: 'pointer', transition: 'all var(--transition)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        letterSpacing: '-0.01em',
      }}
      onMouseEnter={e => { if (!featuresOpen) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; } }}
      onMouseLeave={e => { if (!featuresOpen) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}
    >
      {isAr ? 'الميزات' : 'Features'}
      <ChevronDown size={13} style={{ transition: 'transform .22s', transform: featuresOpen ? 'rotate(180deg)' : 'none' }} />
    </button>
    <FeaturesDropdown isOpen={featuresOpen} onClose={() => setFeaturesOpen(false)} isAr={isAr} dir={dir} />
  </div>

  {/* About and Contact links */}
  {navLinks.slice(1).map(link => {
    const active = isActive(link.to);
    return (
      <Link key={link.to} to={link.to} aria-current={active ? 'page' : undefined}
        style={{ position: 'relative', padding: '7px 14px', borderRadius: 9, fontSize: 13.5, fontWeight: active ? 600 : 500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', background: active ? 'var(--bg-secondary)' : 'transparent', textDecoration: 'none', transition: 'all var(--transition)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', letterSpacing: '-0.01em' }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; } }}>
        {link.label}
        {active && <span style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 3, height: 3, borderRadius: '50%', background: 'var(--text-primary)' }} />}
      </Link>
    );
  })}
</nav>

          {/* Desktop right */}
          <div className="hdr-desktop" style={{ alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <LanguageSwitcher variant="default" />
            <ThemeToggle scrolled={scrolled} />
            <div style={{ width: 1, height: 22, background: 'var(--border)' }} />

            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() =>
                
                setProfileOpen(p => !p)}
                
                aria-expanded={profileOpen} aria-haspopup="true"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 5px', borderRadius: 50, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', transition: 'all var(--transition)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

                  {/* Avatar */}
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--text-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {user?.avatarUrl
                      ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : user?.fullName?.charAt(0)?.toUpperCase() || 'U'
                    }
                  </div>

                  {/* Name */}
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.fullName?.split(' ')[0] || 'User'}
                  </span>

                  

                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true"
                    style={{ transition: 'transform 0.22s', transform: profileOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
                    <path d="M2 4L6 8L10 4" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <ProfileDropdown user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} dir={dir} isAr={isAr} />
              </div>
            ) : (
              <>
                <Link to="/login"
                  style={{ padding: '8px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all var(--transition)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.borderRadius = '9px'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}>
                  {isAr ? 'تسجيل الدخول' : 'Login'}
                </Link>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setSignupOpen(p => !p)} aria-expanded={signupOpen} aria-haspopup="true"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '8px 18px', borderRadius: 9, border: 'none', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'all var(--transition)' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}>
                    {isAr ? 'ابدأ الآن' : 'Get Started'}
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ transition: 'transform 0.22s', transform: signupOpen ? 'rotate(180deg)' : 'none' }}>
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <SignupDropdown isOpen={signupOpen} onClose={() => setSignupOpen(false)} isAr={isAr} />
                </div>
              </>
            )}
          </div>

          {/* Mobile controls */}
          <div className="hdr-mobile" style={{ alignItems: 'center', gap: 8 }}>
            <ThemeToggle scrolled={scrolled} size={36} />
            <LanguageSwitcher variant="default" />
            <button onClick={() => setMobileOpen(p => !p)} aria-expanded={mobileOpen} aria-label={mobileOpen ? (isAr ? 'إغلاق' : 'Close') : (isAr ? 'فتح' : 'Open')}
              style={{ width: 38, height: 38, borderRadius: 9, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all var(--transition)' }}>
              <Hamburger open={mobileOpen} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} aria-hidden="true"
          style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', animation: 'overlayIn 0.2s ease' }} />
      )}

      {/* Mobile drawer */}
      <div role="dialog" aria-label={isAr ? 'القائمة الرئيسية' : 'Main navigation'}
        style={{ position: 'fixed', top: 68, insetInlineStart: 0, insetInlineEnd: 0, zIndex: 999, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', transform: mobileOpen ? 'translateY(0)' : 'translateY(-6px)', opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'all' : 'none', transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)', direction: dir, maxHeight: 'calc(100vh - 68px)', overflowY: 'auto' }}>

        {/* Nav links */}
        <nav style={{ padding: '10px 16px' }}>
          {navLinks.map(link => {
            const active = isActive(link.to);
            return (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} aria-current={active ? 'page' : undefined}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: active ? 700 : 500, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', background: active ? 'var(--bg-secondary)' : 'transparent', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition: 'all var(--transition)', marginBottom: 2 }}>
                {link.label}
                {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--text-primary)' }} />}
              </Link>
            );
          })}

          {/* Features in mobile — section */}
          {/* <div style={{ marginTop: 6, marginBottom: 6 }}>
            <Link to="/features" onClick={() => setMobileOpen(false)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 14px', borderRadius: 10, textDecoration: 'none', fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)', background: 'transparent', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', marginBottom: 4 }}>
              {isAr ? 'جميع الميزات' : 'All Features'}
              {isAr ? <ArrowLeft size={13} color="var(--text-secondary)" /> : <ArrowRight size={13} color="var(--text-secondary)" />}
            </Link>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, paddingInline: 4 }}>
              {FEATURES_DATA.slice(0, 4).map(f => (
                <Link key={f.slug} to={`/features/${f.slug}`} onClick={() => setMobileOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', background: 'var(--bg-secondary)', border: '1px solid var(--border)', transition: 'all .15s' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FeatIcon name={f.icon} size={14} color={f.color} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isAr ? f.title.ar : f.title.en}
                  </span>
                </Link>
              ))}
            </div>
          </div> */}
          {/* Features in mobile — simple version */}
<div style={{ marginTop: 8, marginBottom: 8 }}>
  <Link 
    to="/features" 
    onClick={() => setMobileOpen(false)}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '12px 16px', 
      borderRadius: 12, 
      textDecoration: 'none', 
      fontSize: 14, 
      fontWeight: 600, 
      color: 'var(--text-primary)', 
      background: 'var(--bg-secondary)', 
      fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', 
      marginBottom: 12,
      border: '1px solid var(--border)',
    }}>
    <span>{isAr ? 'جميع الميزات' : 'All Features'}</span>
    {isAr ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
  </Link>
  
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(2, 1fr)', 
    gap: 10,
  }}>
    {FEATURES_DATA.slice(0, 6).map(f => (
      <Link 
        key={f.slug} 
        to={`/features/${f.slug}`} 
        onClick={() => setMobileOpen(false)}
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 8, 
          padding: '14px 8px', 
          borderRadius: 12, 
          textDecoration: 'none', 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border)', 
          transition: 'all .2s',
        }}
      >
        <div style={{ 
          width: 36, 
          height: 36, 
          borderRadius: 10, 
          background: 'var(--bg-primary)', 
          border: '1px solid var(--border)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          flexShrink: 0 
        }}>
          <FeatIcon name={f.icon} size={16} color="var(--text-secondary)" />
        </div>
        <span style={{ 
          fontSize: 12, 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        }}>
          {isAr ? f.title.ar : f.title.en}
        </span>
      </Link>
    ))}
  </div>
</div>
        </nav>

        {/* Role-based dashboard link + logout */}
        <div style={{ padding: '14px 16px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {isAuthenticated ? (
            <>
              <Link to={dashboardTo} onClick={() => setMobileOpen(false)}
                style={{ padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', textAlign: 'center', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {role === 'admin' || role === 'support'
                  ? <><ShieldCheck size={15} /> {isAr ? 'لوحة الأدمن' : 'Admin Panel'}</>
                  : role === 'company'
                    ? <><Building2 size={15} /> {isAr ? 'لوحة الشركة' : 'Company Dashboard'}</>
                    : <><LayoutDashboard size={15} /> {isAr ? 'لوحة التحكم' : 'Dashboard'}</>
                }
              </Link>
              <button onClick={() => { useAuthStore.getState().logout(); setMobileOpen(false); }}
                style={{ padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1.5px solid var(--border)', color: 'var(--danger)', background: 'transparent', cursor: 'pointer', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                {isAr ? 'تسجيل الخروج' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}
                style={{ padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 600, border: '1.5px solid var(--border)', color: 'var(--text-secondary)', background: 'transparent', textDecoration: 'none', textAlign: 'center', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                {isAr ? 'تسجيل الدخول' : 'Login'}
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}
                style={{ padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', textAlign: 'center', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                {isAr ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}