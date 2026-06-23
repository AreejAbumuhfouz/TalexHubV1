

// import { useState, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   FileText, Briefcase, Brain, BookOpen, Wallet,
//   ArrowUpRight, TrendingUp, ChevronRight, Sparkles, Circle, Users, Mic, Zap, Star,
//   Clock, Target, Send, Eye, UserCheck, XCircle,
//   BarChart2, Award, Activity, ArrowRight,
// } from 'lucide-react';
// import useAuthStore from '../../store/authStore';
// import useLang from '../../i18n';
// import api from '../../services/api';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// /* ════════════════════════════════════════════════════════
//    ANIMATED COUNTER
// ════════════════════════════════════════════════════════ */
// function Counter({ to, prefix = '', suffix = '' }) {
//   const [val, setVal] = useState(0);
//   const ref = useRef(null);
//   useEffect(() => {
//     if (!to) return;
//     const obs = new IntersectionObserver(([e]) => {
//       if (!e.isIntersecting) return;
//       let start = 0;
//       const tick = () => {
//         start += 16;
//         const p = Math.min(start / 900, 1);
//         const ease = 1 - Math.pow(1 - p, 3);
//         setVal(Math.round(ease * to));
//         if (p < 1) requestAnimationFrame(tick);
//       };
//       requestAnimationFrame(tick);
//       obs.disconnect();
//     });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, [to]);
//   return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
// }

// /* ════════════════════════════════════════════════════════
//    FADE IN
// ════════════════════════════════════════════════════════ */
// function Fade({ children, delay = 0, y = 16 }) {
//   const ref = useRef(null);
//   const [vis, setVis] = useState(false);
//   useEffect(() => {
//     const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 });
//     if (ref.current) obs.observe(ref.current);
//     return () => obs.disconnect();
//   }, []);
//   return (
//     <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : `translateY(${y}px)`, transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms` }}>
//       {children}
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════
//    ATS SCORE RING
// ════════════════════════════════════════════════════════ */
// function ScoreRing({ score = 0, size = 76 }) {
//   const pct = Math.min(Math.max(score, 0), 100);
//   const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';
//   const r = (size - 10) / 2;
//   const circ = 2 * Math.PI * r;
//   const dash = (pct / 100) * circ;
//   return (
//     <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
//       <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={9} />
//       <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
//         strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
//         style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.34,1.56,.64,1)' }} />
//       <text x={size/2} y={size/2} dominantBaseline="central" textAnchor="middle"
//         style={{ fontSize: 15, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}
//         transform={`rotate(90,${size/2},${size/2})`}>{pct}%</text>
//     </svg>
//   );
// }

// /* ════════════════════════════════════════════════════════
//    MINI FUNNEL BAR (application status)
// ════════════════════════════════════════════════════════ */
// function FunnelBar({ label, count, total, color, icon: Icon }) {
//   const pct = total ? Math.round((count / total) * 100) : 0;
//   return (
//     <div style={{ marginBottom: 10 }}>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
//           <Icon size={13} color={color} /> {label}
//         </div>
//         <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{count}</span>
//           <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{pct}%</span>
//         </div>
//       </div>
//       <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
//         <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(.34,1.56,.64,1)' }} />
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════
//    STATUS PILL
// ════════════════════════════════════════════════════════ */
// const STATUS = {
//   sent:        { en: 'Sent',        ar: 'مُرسَل',       color: '#6B7280', bg: 'rgba(107,114,128,.1)' },
//   viewed:      { en: 'Viewed',      ar: 'شوهد',          color: '#3B82F6', bg: 'rgba(59,130,246,.1)'  },
//   shortlisted: { en: 'Shortlisted', ar: 'قائمة مختصرة', color: '#8B5CF6', bg: 'rgba(139,92,246,.1)'  },
//   interview:   { en: 'Interview',   ar: 'مقابلة',        color: '#F59E0B', bg: 'rgba(245,158,11,.1)'  },
//   accepted:    { en: 'Accepted ✓',  ar: 'مقبول ✓',      color: '#22C55E', bg: 'rgba(34,197,94,.1)'   },
//   rejected:    { en: 'Rejected',    ar: 'مرفوض',         color: '#EF4444', bg: 'rgba(239,68,68,.1)'   },
// };

// /* ════════════════════════════════════════════════════════
//    QUICK ACTION CARD
// ════════════════════════════════════════════════════════ */
// function QuickAction({ to, icon: Icon, labelAr, labelEn, isAr, font, accent }) {
//   return (
//     <Link to={to} style={{
//       display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
//       padding: '16px 10px', borderRadius: 14,
//       background: accent ? '#6366f1' : 'var(--bg-primary)',
//       border: `1px solid ${accent ? '#6366f1' : 'var(--border)'}`,
//       textDecoration: 'none', transition: 'all .2s', textAlign: 'center',
//     }}
//       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '.9'; }}
//       onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}>
//       <div style={{ width: 40, height: 40, borderRadius: 11, background: accent ? 'rgba(255,255,255,.15)' : 'var(--bg-secondary)', border: `1px solid ${accent ? 'rgba(255,255,255,.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <Icon size={18} color={accent ? '#fff' : 'var(--text-primary)'} strokeWidth={1.9} />
//       </div>
//       <span style={{ fontSize: 11.5, fontWeight: 600, color: accent ? '#fff' : 'var(--text-secondary)', lineHeight: 1.3, fontFamily: font }}>
//         {isAr ? labelAr : labelEn}
//       </span>
//     </Link>
//   );
// }

// /* ════════════════════════════════════════════════════════
//    SKELETON BLOCK
// ════════════════════════════════════════════════════════ */
// const Skel = ({ h = 90, r = 14 }) => (
//   <div style={{ background: 'var(--bg-secondary)', borderRadius: r, height: h, animation: 'dbPulse 1.5s ease-in-out infinite', border: '1px solid var(--border)' }} />
// );

// /* ════════════════════════════════════════════════════════
//    GREETING
// ════════════════════════════════════════════════════════ */
// const greet = (isAr) => {
//   const h = new Date().getHours();
//   if (isAr) return h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
//   return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
// };

// /* ════════════════════════════════════════════════════════
//    MAIN PAGE
// ════════════════════════════════════════════════════════ */
// export default function DashboardPage() {
//   const { lang }  = useLang();
//   const { user }  = useAuthStore();
//   const isAr      = lang === 'ar';
//   const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const isPro     = ['pro', 'elite'].includes(user?.planKey || 'free');
//   const [collapsed, setCollapsed] = useState(false);
//   const [stats,     setStats]     = useState(null);
//   const [loading,   setLoading]   = useState(true);

//   useEffect(() => {
//     api.get('/users/me/stats')
    
//       .then(r => setStats(r.data.data))
//       .catch(() => setStats({ cvCount: 0, applicationCount: 0, trainingCount: 0, coursesCount: 0, pointsBalance: 0, cashBalance: '0.00', topCV: null, recentApplications: [], appsByStatus: {}, newAppsThisWeek: 0, avgTrainingScore: null, trainingSessions: [] }))
//       .finally(() => setLoading(false));
//   }, []);


//   const firstName  = (user?.fullName || '').split(' ')[0] || (isAr ? 'مرحباً' : 'Welcome');
//   const totalApps  = stats?.applicationCount || 0;
//   const by         = stats?.appsByStatus || {};
//   // Compute avgTrainingScore client-side if API returns 0
// const sessions = stats?.trainingSessions || [];
// const computedAvg = sessions.length
//   ? Math.round(sessions.reduce((sum, s) => sum + parseFloat(s.score ?? s.overallScore ?? s.totalScore ?? s.percentage ?? s.result ?? 0), 0) / sessions.length)
//   : null;
// const avgScore = stats?.avgTrainingScore || computedAvg || 0;

//   // Profile completion
//   const profileFields = [
//     { done: !!user?.fullName,        ar: 'الاسم الكامل',   en: 'Full name'   },
//     { done: !!user?.headline,        ar: 'المسمى المهني',  en: 'Headline'    },
//     { done: !!user?.bio,             ar: 'نبذة شخصية',     en: 'Bio'         },
//     { done: !!user?.locationCountry, ar: 'الموقع',         en: 'Location'    },
//     { done: !!user?.phone,           ar: 'رقم الهاتف',     en: 'Phone'       },
//     { done: !!user?.linkedinUrl,     ar: 'LinkedIn',        en: 'LinkedIn'    },
//     { done: (stats?.cvCount||0) > 0, ar: 'سيرة ذاتية',    en: 'CV uploaded' },
//   ];
//   const done       = profileFields.filter(f => f.done).length;
//   const profPct    = Math.round((done / profileFields.length) * 100);
//   const missing    = profileFields.filter(f => !f.done);

//   return (
//     <>
//       <style>{`
//         @keyframes dbPulse { 0%,100%{opacity:1}50%{opacity:.45} }
//         * { box-sizing: border-box; } body { margin: 0; }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
//         .db-g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
//         .db-g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
//         .db-g2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
//         .db-qa { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
//         .db-main { overflow-y:auto; flex:1; }
//         @media(max-width:1200px){.db-g4{grid-template-columns:repeat(2,1fr)}.db-qa{grid-template-columns:repeat(3,1fr)}}
//         // @media(max-width:900px){.db-g3{grid-template-columns:1fr 1fr}.db-g2{grid-template-columns:1fr}}
//         @media(max-width:900px){.db-g3{grid-template-columns:1fr 1fr}.db-g2{grid-template-columns:1fr}}
// @media(max-width:640px){.db-g3{grid-template-columns:1fr}}
//         // @media(max-width:640px){.db-g4{grid-template-columns:1fr 1fr}.db-qa{grid-template-columns:repeat(3,1fr)}.db-main{padding:14px 12px!important;padding-bottom:72px!important}}
//         @media(max-width:1024px){.db-main{padding-bottom:80px!important}}
//       `}</style>

//       <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
//         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
//           <MobileTopBar title={isAr ? 'الرئيسية' : 'Dashboard'} />

//           <main className="db-main" style={{ padding: 'clamp(16px,2.5vw,28px)' }}>

//             {/* ══════════════════════════════════════════════
//                 HERO BANNER
//             ══════════════════════════════════════════════ */}
//             <Fade delay={0}>
//               <div style={{ borderRadius: 18, marginBottom: 20, overflow: 'hidden', position: 'relative', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
//                 {/* Subtle grid pattern */}
//                 <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: .5, pointerEvents: 'none' }} />
//                 {/* Glow accent */}
//                 <div style={{ position: 'absolute', top: -60, insetInlineEnd: -60, width: 260, height: 260, borderRadius: '50%', background: isPro ? 'radial-gradient(circle, rgba(99,102,241,.18), transparent 65%)' : 'radial-gradient(circle, rgba(34,197,94,.14), transparent 65%)', pointerEvents: 'none' }} />

//                 <div style={{ position: 'relative', padding: 'clamp(20px,3vw,28px)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
//                   <div>
//                     <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 7px', fontWeight: 500 }}>{greet(isAr)} 👋</p>
//                     <h1 style={{ fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 8px', lineHeight: 1.15 }}>{firstName}</h1>
//                     <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 16px', lineHeight: 1.6, maxWidth: 380 }}>
//                       {user?.headline || (isAr ? 'أكمل ملفك الشخصي لفتح كامل المميزات' : 'Complete your profile to unlock all features')}
//                     </p>

//                     {/* Plan + open to work */}
//                     <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
//                       <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, padding: '4px 11px', borderRadius: 99, fontWeight: 700, background: isPro ? 'rgba(99,102,241,.12)' : 'var(--bg-primary)', color: isPro ? 'rgb(99,102,241)' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
//                         {isPro ? <><Zap size={11} /> Pro</> : <><Star size={11} /> Free</>}
//                       </span>
                      
//                       {isPro && (
//                         <Link to="/dashboard/cvs" style={{
//                           display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5,
//                           padding: '4px 11px', borderRadius: 99, fontWeight: 700,
//                           textDecoration: 'none',
//                           background: user?.autoApplyEnabled ? 'rgba(34,197,94,.1)' : 'var(--bg-primary)',
//                           color: user?.autoApplyEnabled ? '#22C55E' : 'var(--text-secondary)',
//                           border: `1px solid ${user?.autoApplyEnabled ? 'rgba(34,197,94,.2)' : 'var(--border)'}`,
//                         }}>
//                           <Zap size={11} />
//                           {user?.autoApplyEnabled
//                             ? (isAr ? 'التقديم التلقائي نشط' : 'Auto-Apply active')
//                             : (isAr ? 'التقديم التلقائي متوقف' : 'Auto-Apply off')}
//                         </Link>
//                       )}
//                     </div>
//                   </div>

//                   {/* Hero CTA buttons */}
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-end' }}>
//                     <Link to="/dashboard/cvs" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 20px', borderRadius: 11, textDecoration: 'none', background: '#6366f1', color: '#fff', fontSize: 13.5, fontWeight: 700, transition: 'opacity .2s', whiteSpace: 'nowrap', boxShadow: '0 4px 14px rgba(99,102,241,.35)' }}
//                       onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
//                       onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
//                       <Sparkles size={14} strokeWidth={2.5} />
//                       {isAr ? 'تحليل AI للـ CV' : 'AI CV Analysis'}
//                     </Link>
//                     <Link to="/dashboard/jobs" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', borderRadius: 11, textDecoration: 'none', background: 'transparent', border: '1.5px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, transition: 'border-color .2s', whiteSpace: 'nowrap' }}
//                       onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//                       onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
//                       <Briefcase size={14} strokeWidth={1.8} />
//                       {isAr ? 'تصفح الوظائف' : 'Browse Jobs'}
//                     </Link>
//                     {!isPro && (
//                       <Link to="/pricing" style={{ fontSize: 11.5, color: '#818cf8', fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
//                         {isAr ? 'ترقية إلى Pro →' : 'Upgrade to Pro →'}
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 4 BIG STAT CARDS
//             ══════════════════════════════════════════════ */}
//             <Fade delay={60}>
//               <div className="db-g4" style={{ marginBottom: 18 }}>
//                 {[
//                   { icon: Briefcase, value: stats?.applicationCount || 0, label: isAr ? 'طلب وظيفة'  : 'Applications', to: '/dashboard/jobs', color: '#3B82F6', sub: stats?.newAppsThisWeek ? `+${stats.newAppsThisWeek} ${isAr ? 'هذا الأسبوع' : 'this week'}` : null, subColor: '#22C55E' },
//                   { icon: FileText,  value: stats?.cvCount || 0,           label: isAr ? 'سيرة ذاتية' : 'CVs',          to: '/dashboard/cvs',  color: '#8B5CF6' },
//                   { icon: Brain,     value: stats?.trainingCount || 0,     label: isAr ? 'جلسة تدريب' : 'Interviews',   to: '/interview',      color: '#F59E0B', sub: stats?.avgTrainingScore ? `${isAr ? 'متوسط' : 'Avg'} ${stats.avgTrainingScore}%` : null, subColor: '#F59E0B' },
//                   { icon: BookOpen,  value: stats?.coursesCount || 0,      label: isAr ? 'دورة مسجّل' : 'Courses',      to: '/courses',        color: '#6366f1', accent: true },
//                 ].map((c, i) => {
//                   const Icon = c.icon;
//                   const inner = (
//                     <div key={i} style={{
//                       background: c.accent ? '#6366f1' : 'var(--bg-secondary)',
//                       borderRadius: 14, padding: '18px 16px',
//                       border: c.accent ? '1px solid #6366f1' : '1px solid var(--border)',
//                       display: 'flex', flexDirection: 'column', gap: 14,
//                       transition: 'transform .2s, border-color .2s, opacity .2s', cursor: 'pointer',
//                     }}
//                       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '.9'; }}
//                       onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <div style={{ width: 38, height: 38, borderRadius: 10, background: c.accent ? 'rgba(255,255,255,.15)' : 'var(--bg-primary)', border: `1px solid ${c.accent ? 'rgba(255,255,255,.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                           <Icon size={17} color={c.accent ? '#fff' : c.color} strokeWidth={2} />
//                         </div>
//                         <ArrowUpRight size={14} color={c.accent ? 'rgba(255,255,255,.55)' : 'var(--text-secondary)'} />
//                       </div>
//                       <div>
//                         <div style={{ fontSize: 28, fontWeight: 900, color: c.accent ? '#fff' : 'var(--text-primary)', letterSpacing: '-0.04em', lineHeight: 1, fontFamily: 'var(--font-en)' }}>
//                           {loading ? '—' : <Counter to={typeof c.value === 'number' ? c.value : 0} />}
//                         </div>
//                         {/* <div style={{ fontSize: 12, color: c.accent ? 'rgba(255,255,255,.7)' : 'var(--text-secondary)', marginTop: 4, fontWeight: 500, fontFamily: font }}>
//                           {c.label}
//                         </div> */}
//                         {/* {c.sub && <span style={{ fontSize: 11, color: c.accent ? 'rgba(255,255,255,.8)' : c.subColor, marginTop: 3, fontWeight: 600, fontFamily: 'var(--font-en)' }}>{c.sub}</span>} */}
//                       </div>
//                       <div style={{
//   display: 'flex',
//   alignItems: 'center',
//   gap: 6,
//   marginTop: 4,
//   flexWrap: 'wrap'
// }}>
//   <div style={{
//     fontSize: 12,
//     color: c.accent ? 'rgba(255,255,255,.7)' : 'var(--text-secondary)',
//     fontWeight: 500,
//     fontFamily: font
//   }}>
//     {c.label}
//   </div>

//   {c.sub && (
//     <span style={{
//       fontSize: 11,
//       color: c.accent ? 'rgba(255,255,255,.8)' : c.subColor,
//       fontWeight: 600,
//       fontFamily: 'var(--font-en)'
//     }}>
//       {c.sub}
//     </span>
//   )}
// </div>
//                     </div>
//                   );
//                   return <Link key={i} to={c.to} style={{ textDecoration: 'none' }}>{inner}</Link>;
//                 })}
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 QUICK ACTIONS
//             ══════════════════════════════════════════════ */}
//             <Fade delay={120}>
//               <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 18px 14px', marginBottom: 18 }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//                   <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
//                 </div>
//                 <div className="db-qa">
//                   <QuickAction to="/dashboard/cvs"  icon={Sparkles}  labelAr="تحليل AI"       labelEn="AI Analysis"    isAr={isAr} font={font} accent />
//                   <QuickAction to="/dashboard/jobs"  icon={Briefcase} labelAr="تصفح وظائف"     labelEn="Find Jobs"      isAr={isAr} font={font} />
//                   <QuickAction to="/interview"       icon={Brain}     labelAr="مقابلة AI"       labelEn="AI Interview"   isAr={isAr} font={font} />
//                   <QuickAction to="/courses"         icon={BookOpen}  labelAr="الدورات"          labelEn="Courses"        isAr={isAr} font={font} />
//                   <QuickAction to="/rooms"           icon={Mic}       labelAr="الغرف الصوتية"   labelEn="Voice Rooms"    isAr={isAr} font={font} />
//                   <QuickAction to="/wallet"          icon={Wallet}    labelAr="المحفظة"          labelEn="Wallet"         isAr={isAr} font={font} />
//                 </div>
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 ROW: CV SCORE + PROFILE COMPLETION
//             ══════════════════════════════════════════════ */}
//             <Fade delay={180}>
//               <div className="db-g2" style={{ marginBottom: 18 }}>

//                 {/* CV Score */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'درجة السيرة الذاتية' : 'CV Score'}</h2>
//                     <Link to="/dashboard/cvs" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'عرض' : 'View'} <ChevronRight size={12} /></Link>
//                   </div>
//                   {loading ? <Skel h={80} /> : stats?.topCV ? (
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
//                       {/* <ScoreRing score={stats.topCV.ats_score || stats.topCV.atsScore || 0} /> */}
//                       <ScoreRing score={
//   isPro
//     ? (stats.topCV.aiScore || stats.topCV.ats_score || stats.topCV.atsScore || 0)
//     : (stats.topCV.atsScore || stats.topCV.ats_score || 0)
// } />
//                       <div style={{ flex: 1, minWidth: 0 }}>
//                         <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{stats.topCV.title}</p>
//                         <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', fontFamily: font }}>ATS Score</p>
//                         {(stats.topCV.ats_score || 0) >= 80 ? (
//                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: 'rgba(34,197,94,.1)', color: '#22C55E', padding: '4px 11px', borderRadius: 99, fontWeight: 700, border: '1px solid rgba(34,197,94,.2)' }}>
//                             <Circle size={11} /> {isAr ? 'جاهز للتقديم' : 'Ready to Apply'}
//                           </span>
//                         ) : (
//                           <Link to="/dashboard/cvs" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, background: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '4px 11px', borderRadius: 99, fontWeight: 700, textDecoration: 'none', border: '1px solid var(--border)' }}>
//                             <TrendingUp size={11} /> {isAr ? 'حسّن سيرتك' : 'Improve CV'}
//                           </Link>
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     <div style={{ textAlign: 'center', padding: '18px 0' }}>
//                       <FileText size={36} color="var(--text-secondary)" style={{ opacity: .2, margin: '0 auto 10px' }} />
//                       <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 12px', fontFamily: font }}>{isAr ? 'لم ترفع سيرة ذاتية بعد' : 'No CV uploaded yet'}</p>
//                       <Link to="/dashboard/cvs" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
//                         {isAr ? 'رفع سيرتي الذاتية →' : 'Upload My CV →'}
//                       </Link>
//                     </div>
//                   )}
//                 </div>

//                 {/* Profile Completion */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'اكتمال الملف' : 'Profile'}</h2>
//                     <Link to="/profile" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'تعديل' : 'Edit'} <ChevronRight size={12} /></Link>
//                   </div>
//                   {/* Progress arc */}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
//                     <div style={{ position: 'relative', flexShrink: 0 }}>
//                       <svg width={64} height={64} style={{ transform: 'rotate(-90deg)' }}>
//                         <circle cx={32} cy={32} r={26} fill="none" stroke="var(--bg-primary)" strokeWidth={7} />
//                         <circle cx={32} cy={32} r={26} fill="none" stroke={profPct === 100 ? '#22C55E' : 'var(--text-primary)'} strokeWidth={7}
//                           strokeDasharray={`${(profPct / 100) * 2 * Math.PI * 26} ${2 * Math.PI * 26}`} strokeLinecap="round"
//                           style={{ transition: 'stroke-dasharray 1s ease' }} />
//                       </svg>
//                       <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: profPct === 100 ? '#22C55E' : 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{profPct}%</span>
//                     </div>
//                     <div style={{ flex: 1 }}>
//                       {profPct === 100 ? (
//                         <p style={{ fontSize: 13, fontWeight: 700, color: '#22C55E', fontFamily: font, margin: 0 }}>✓ {isAr ? 'مكتمل!' : 'Complete!'}</p>
//                       ) : (
//                         <>
//                           <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 2px', fontFamily: font }}>{isAr ? `${missing.length} خطوات متبقية` : `${missing.length} steps left`}</p>
//                           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, opacity: .7, fontFamily: font }}>{isAr ? 'أكمل ملفك لفرص أفضل' : 'Complete for better matches'}</p>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                   {/* Missing items */}
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                     {missing.slice(0, 4).map((f, i) => (
//                       <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font }}>
//                         <Circle size={12} color="var(--border)" strokeWidth={2} style={{ flexShrink: 0 }} />
//                         {isAr ? f.ar : f.en}
//                       </div>
//                     ))}
//                     {profPct < 100 && (
//                       <Link to="/profile" style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 9, background: 'var(--bg-primary)', border: '1.5px solid var(--border)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', transition: 'border-color .2s, background .2s' }}
//                         onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.color = '#6366f1'; }}
//                         onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}>
//                         <ArrowRight size={13} /> {isAr ? 'أكمل ملفك' : 'Complete Profile'}
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 ROW: APPLICATION FUNNEL + RECENT APPS
//             ══════════════════════════════════════════════ */}
//             <Fade delay={240}>
//               <div className="db-g2" style={{ marginBottom: 18 }}>

//                 {/* Application Funnel */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'مسار الطلبات' : 'Application Funnel'}</h2>
//                     <Link to="/dashboard/jobs" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'عرض الكل' : 'All'} <ChevronRight size={12} /></Link>
//                   </div>
//                   {loading ? <Skel h={140} /> : totalApps === 0 ? (
//                     <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
//                       <BarChart2 size={32} style={{ opacity: .2, margin: '0 auto 8px' }} />
//                       <p style={{ fontSize: 12.5, fontFamily: font }}>{isAr ? 'لم تتقدم لأي وظيفة بعد' : 'No applications yet'}</p>
//                     </div>
//                   ) : (
//                     <>
//                       <FunnelBar label={isAr ? 'مُرسَل'         : 'Sent'}        count={by.sent        || 0} total={totalApps} color="#6B7280" icon={Send}      />
//                       <FunnelBar label={isAr ? 'شوهد'            : 'Viewed'}      count={by.viewed      || 0} total={totalApps} color="#3B82F6" icon={Eye}       />
//                       <FunnelBar label={isAr ? 'قائمة مختصرة'   : 'Shortlisted'} count={by.shortlisted || 0} total={totalApps} color="#8B5CF6" icon={Award}     />
//                       <FunnelBar label={isAr ? 'مقابلة'          : 'Interview'}   count={by.interview   || 0} total={totalApps} color="#F59E0B" icon={UserCheck}  />
//                       <FunnelBar label={isAr ? 'مقبول'           : 'Accepted'}    count={by.accepted    || 0} total={totalApps} color="#22C55E" icon={Circle} />
//                     </>
//                   )}
//                 </div>

//                 {/* Recent Applications */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'آخر الطلبات' : 'Recent Applications'}</h2>
//                     <Link to="/dashboard/jobs" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'عرض الكل' : 'All'} <ChevronRight size={12} /></Link>
//                   </div>
//                   {loading ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(4)].map((_, i) => <Skel key={i} h={48} r={10} />)}</div>
//                   ) : !stats?.recentApplications?.length ? (
//                     <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
//                       <Briefcase size={32} style={{ opacity: .2, margin: '0 auto 8px' }} />
//                       <p style={{ fontSize: 12.5, fontFamily: font }}>{isAr ? 'لا طلبات حديثة' : 'No recent applications'}</p>
//                       <Link to="/dashboard/jobs" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
//                         {isAr ? 'تصفح الوظائف →' : 'Browse Jobs →'}
//                       </Link>
//                     </div>
//                   ) : (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
//                       {stats.recentApplications.map((app, i) => {
//                         const s = STATUS[app.status] || STATUS.sent;
//                         return (
//                           <div key={app.id || i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 11, background: 'var(--bg-primary)', border: '1px solid var(--border)', transition: 'border-color .15s' }}
//                             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//                             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
//                             {/* Company logo or fallback */}
//                             <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
//                               {app.company?.logoUrl
//                                 ? <img src={app.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display='none'; }} />
//                                 : <Briefcase size={14} color="var(--text-secondary)" strokeWidth={1.8} />
//                               }
//                             </div>
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                               <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)', fontFamily: font }}>
//                                 {app.jobTitle || (isAr ? 'وظيفة' : 'Job')}
//                               </p>
//                               {app.company?.name && <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0', fontFamily: font }}>{app.company.name}</p>}
//                             </div>
//                             <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: s.bg, color: s.color, flexShrink: 0, whiteSpace: 'nowrap', fontFamily: font }}>
//                               {isAr ? s.ar : s.en}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 ROW: AI INTERVIEW SCORE + WALLET
//             ══════════════════════════════════════════════ */}
//             <Fade delay={300}>
//               <div className="db-g3" style={{ marginBottom: 18 }}>

//                 {/* AI Interview History */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'تدريب المقابلة' : 'AI Interviews'}</h2>
//                     <Link to="/interview" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'ابدأ' : 'Start'} <ChevronRight size={12} /></Link>
//                   </div>
//                   {loading ? <Skel h={80} /> : stats?.trainingSessions?.length ? (
//                     <>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//                         {/* <ScoreRing score={stats.avgTrainingScore || 0} size={68} /> */}
//                         <div>
//                           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 2px', fontFamily: font }}>{isAr ? 'متوسط الأداء' : 'Avg Score'}</p>
//                           {/* <p style={{ fontSize: 22, fontWeight: 900, margin: 0, fontFamily: 'var(--font-en)', letterSpacing: '-0.03em' }}>{stats.avgTrainingScore || 0}%</p> */}
//                            <ScoreRing score={stats.avgTrainingScore || 0} size={68} />

//                           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{stats.trainingSessions.length} {isAr ? 'جلسة' : 'sessions'}</p>
//                         </div>
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
//                         {stats.trainingSessions.slice(0, 3).map((t, i) => {
//                           // const pct = parseFloat(t.score || 0);
//                           const pct = parseFloat(t.score ?? t.overallScore ?? t.totalScore ?? t.percentage ?? t.result ?? 0);
//                           const c = pct >= 80 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444';
//                           return (
//                             <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                               <div style={{ flex: 1, height: 4, background: 'var(--bg-primary)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
//                                 <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 99 }} />
//                               </div>
//                               <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: 'var(--font-en)', width: 32, textAlign: 'end' }}>{Math.round(pct)}%</span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </>
//                   ) : (
//                     <div style={{ textAlign: 'center', padding: '16px 0' }}>
//                       <Brain size={32} color="var(--text-secondary)" style={{ opacity: .2, margin: '0 auto 8px' }} />
//                       <p style={{ fontSize: 12.5, fontFamily: font, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{isAr ? 'لم تبدأ أي مقابلة بعد' : 'No interviews yet'}</p>
//                       <Link to="/interview" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>
//                         {isAr ? 'ابدأ مقابلة →' : 'Start Interview →'}
//                       </Link>
//                     </div>
//                   )}
//                 </div>

                
// {/* Wallet */}
// <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)' }}>
//   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'المحفظة' : 'Wallet'}</h2>
//     <Link to="/wallet" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'عرض' : 'View'} <ChevronRight size={12} /></Link>
//   </div>
//   {loading ? <Skel h={100} /> : (
//     <>
//       {/* Points display */}
//       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: '16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
//         <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//           <Star size={20} color="#F59E0B" strokeWidth={2} />
//         </div>
//         <div style={{ flex: 1 }}>
//           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: font }}>
//             {isAr ? 'رصيد النقاط' : 'Points Balance'}
//           </p>
//           <p style={{ fontSize: 26, fontWeight: 900, margin: 0, letterSpacing: '-0.04em', fontFamily: 'var(--font-en)', color: '#F59E0B', lineHeight: 1 }}>
//             {(stats?.pointsBalance || 0).toLocaleString()}
//             <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginInlineStart: 5 }}>pts</span>
//           </p>
//         </div>
//       </div>

//       {/* Add points CTA */}
//       <Link to="/wallet" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px', borderRadius: 10, background: '#6366f1', textDecoration: 'none', transition: 'opacity .2s' }}
//         onMouseEnter={e => { e.currentTarget.style.opacity = '.85'; }}
//         onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
//         <Wallet size={13} color="#fff" />
//         <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff', fontFamily: font }}>
//           {isAr ? 'شحن النقاط' : 'Add Points'}
//         </span>
//       </Link>
//     </>
//   )}
// </div>
//                 {/* Activity / Join community CTA */}
//                 <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//                     <h2 style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'المجتمع' : 'Community'}</h2>
//                     <Link to="/community" style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>{isAr ? 'انضم' : 'Join'} <ChevronRight size={12} /></Link>
//                   </div>
//                   <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
//                     {[
//                       { to: '/community', icon: Users, ar: 'شبكة المهنيين', en: 'Professional Network', sub: isAr ? 'تواصل مع محترفين' : 'Connect with pros' },
//                       { to: '/rooms',     icon: Mic,   ar: 'الغرف الصوتية', en: 'Voice Rooms',          sub: isAr ? 'انضم لغرفة الآن'  : 'Join a room now'  },
//                     ].map((item, i) => {
//                       const Icon = item.icon;
//                       return (
//                         <Link key={i} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 11, background: 'var(--bg-primary)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'all .2s' }}
//                           onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
//                           onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
//                           <div style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                             <Icon size={16} color="var(--text-primary)" strokeWidth={1.8} />
//                           </div>
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? item.ar : item.en}</p>
//                             <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0', fontFamily: font }}>{item.sub}</p>
//                           </div>
//                           <ArrowRight size={14} color="var(--text-secondary)" />
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </div>
//             </Fade>

//             {/* ══════════════════════════════════════════════
//                 UPGRADE BANNER — free users only
//             ══════════════════════════════════════════════ */}
//             {!isPro && !loading && (
//               <Fade delay={360}>
//                 <div style={{ borderRadius: 16, padding: '20px 24px', marginBottom: 18, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
//                   <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '22px 22px', opacity: .4, pointerEvents: 'none' }} />
//                   <div style={{ position: 'relative' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
//                       <Zap size={16} color="rgb(99,102,241)" />
//                       <span style={{ fontSize: 13, fontWeight: 800, color: 'rgb(99,102,241)', fontFamily: font }}>{isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}</span>
//                     </div>
//                     <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: font }}>
//                       {isAr ? 'افتح كامل إمكانيات المنصة' : 'Unlock the full platform'}
//                     </p>
//                     <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//                       {isAr ? 'تحليل AI متقدم، إنشاء غرف، تقدم تلقائي ومزيد' : 'Advanced AI, room creation, auto-apply & more'}
//                     </p>
//                   </div>
//                   <Link to="/pricing" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '11px 22px', borderRadius: 11, background: '#6366f1', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: font, whiteSpace: 'nowrap', transition: 'opacity .2s', position: 'relative', boxShadow: '0 4px 14px rgba(99,102,241,.4)' }}
//                     onMouseEnter={e => { e.currentTarget.style.opacity = '.88'; }}
//                     onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
//                     <Zap size={14} /> {isAr ? 'ترقية الآن' : 'Upgrade Now'}
//                   </Link>
//                 </div>
//               </Fade>
//             )}

//             <div style={{ height: 8 }} />
//           </main>
//         </div>
//       </div>

//       <MobileBottomNav />
//     </>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Briefcase, Brain, BookOpen, Wallet,
  ArrowUpRight, TrendingUp, ChevronRight, Sparkles, Circle, Users, Mic, Zap, Star,
  Send, Eye, UserCheck, BarChart2, Award, ArrowRight,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

function Counter({ to }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!to) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let start = 0;
      const tick = () => {
        start += 16;
        const p = Math.min(start / 900, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(ease * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.disconnect();
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}</span>;
}

function Fade({ children, delay = 0 }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.05 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(16px)', transition: `opacity .55s ease ${delay}ms, transform .55s ease ${delay}ms` }}>
      {children}
    </div>
  );
}

function ScoreRing({ score = 0, size = 76 }) {
  const pct = Math.min(Math.max(score, 0), 100);
  const color = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth={9} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.34,1.56,.64,1)' }} />
      <text x={size/2} y={size/2} dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: 15, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}
        transform={`rotate(90,${size/2},${size/2})`}>{pct}%</text>
    </svg>
  );
}

function FunnelBar({ label, count, total, color, icon: Icon }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
          <Icon size={13} color={color} /> {label}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{count}</span>
          <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{pct}%</span>
        </div>
      </div>
      <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(.34,1.56,.64,1)' }} />
      </div>
    </div>
  );
}

const STATUS = {
  sent:        { en: 'Sent',        ar: 'مُرسَل',       color: '#6B7280', bg: 'rgba(107,114,128,.1)' },
  viewed:      { en: 'Viewed',      ar: 'شوهد',          color: '#3B82F6', bg: 'rgba(59,130,246,.1)'  },
  shortlisted: { en: 'Shortlisted', ar: 'قائمة مختصرة', color: '#8B5CF6', bg: 'rgba(139,92,246,.1)'  },
  interview:   { en: 'Interview',   ar: 'مقابلة',        color: '#F59E0B', bg: 'rgba(245,158,11,.1)'  },
  accepted:    { en: 'Accepted ✓',  ar: 'مقبول ✓',      color: '#22C55E', bg: 'rgba(34,197,94,.1)'   },
  rejected:    { en: 'Rejected',    ar: 'مرفوض',         color: '#EF4444', bg: 'rgba(239,68,68,.1)'   },
};

function QuickAction({ to, icon: Icon, labelAr, labelEn, isAr, font, accent }) {
  return (
    <Link to={to} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, padding: '16px 10px', borderRadius: 14, background: accent ? '#6366f1' : 'var(--bg-primary)', border: `1px solid ${accent ? '#6366f1' : 'var(--border)'}`, textDecoration: 'none', transition: 'all .2s', textAlign: 'center' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '.9'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.opacity = '1'; }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: accent ? 'rgba(255,255,255,.15)' : 'var(--bg-secondary)', border: `1px solid ${accent ? 'rgba(255,255,255,.2)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={accent ? '#fff' : 'var(--text-primary)'} strokeWidth={1.9} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: accent ? '#fff' : 'var(--text-secondary)', lineHeight: 1.3, fontFamily: font }}>
        {isAr ? labelAr : labelEn}
      </span>
    </Link>
  );
}

const Skel = ({ h = 90, r = 14 }) => (
  <div style={{ background: 'var(--bg-secondary)', borderRadius: r, height: h, animation: 'dbPulse 1.5s ease-in-out infinite', border: '1px solid var(--border)' }} />
);

const greet = (isAr) => {
  const h = new Date().getHours();
  if (isAr) return h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور';
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

export default function DashboardPage() {
  const { lang }  = useLang();
  const { user }  = useAuthStore();
  const isAr      = lang === 'ar';
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const isPro     = ['pro', 'elite'].includes(user?.planKey || 'free');
  const [collapsed, setCollapsed] = useState(false);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    api.get('/users/me/stats')
      .then(r => setStats(r.data.data))
      .catch(() => setStats({ cvCount: 0, applicationCount: 0, trainingCount: 0, coursesCount: 0, pointsBalance: 0, topCV: null, recentApplications: [], appsByStatus: {}, newAppsThisWeek: 0, avgTrainingScore: null, trainingSessions: [] }))
      .finally(() => setLoading(false));
  }, []);

  const firstName = (user?.fullName || '').split(' ')[0] || (isAr ? 'مرحباً' : 'Welcome');
  const totalApps = stats?.applicationCount || 0;
  const by        = stats?.appsByStatus || {};

  const sessions    = stats?.trainingSessions || [];
  const computedAvg = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + parseFloat(s.score ?? s.overallScore ?? s.totalScore ?? s.percentage ?? s.result ?? 0), 0) / sessions.length)
    : null;

  const profileFields = [
    { done: !!user?.fullName,        ar: 'الاسم الكامل',  en: 'Full name'   },
    { done: !!user?.headline,        ar: 'المسمى المهني', en: 'Headline'    },
    { done: !!user?.bio,             ar: 'نبذة شخصية',    en: 'Bio'         },
    { done: !!user?.locationCountry, ar: 'الموقع',        en: 'Location'    },
    { done: !!user?.phone,           ar: 'رقم الهاتف',    en: 'Phone'       },
    { done: !!user?.linkedinUrl,     ar: 'LinkedIn',       en: 'LinkedIn'    },
    { done: (stats?.cvCount||0) > 0, ar: 'سيرة ذاتية',   en: 'CV uploaded' },
  ];
  const done    = profileFields.filter(f => f.done).length;
  const profPct = Math.round((done / profileFields.length) * 100);
  const missing = profileFields.filter(f => !f.done);

  return (
    <>
      <style>{`
        @keyframes dbPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        * { box-sizing:border-box; } body { margin:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:var(--border); border-radius:99px; }
        .db-g4 { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .db-g3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        .db-g2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .db-qa { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
        .db-main { overflow-y:auto; flex:1; }
        @media(max-width:1200px){.db-g4{grid-template-columns:repeat(2,1fr)}.db-qa{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:900px){.db-g3{grid-template-columns:1fr 1fr}.db-g2{grid-template-columns:1fr}}
        @media(max-width:640px){.db-g3{grid-template-columns:1fr}}
        @media(max-width:1024px){.db-main{padding-bottom:80px!important}}
      `}</style>

      <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg-primary)', color:'var(--text-primary)', fontFamily:font, direction:isAr?'rtl':'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>
          <MobileTopBar title={isAr ? 'الرئيسية' : 'Dashboard'} />

          <main className="db-main" style={{ padding:'clamp(16px,2.5vw,28px)' }}>

            {/* HERO BANNER */}
            <Fade delay={0}>
              <div style={{ borderRadius:18, marginBottom:20, overflow:'hidden', position:'relative', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize:'28px 28px', opacity:.5, pointerEvents:'none' }} />
                <div style={{ position:'absolute', top:-60, insetInlineEnd:-60, width:260, height:260, borderRadius:'50%', background: isPro ? 'radial-gradient(circle, rgba(99,102,241,.18), transparent 65%)' : 'radial-gradient(circle, rgba(34,197,94,.14), transparent 65%)', pointerEvents:'none' }} />

                <div style={{ position:'relative', padding:'clamp(20px,3vw,28px)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
                  <div>
                    <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:'0 0 7px', fontWeight:500 }}>{greet(isAr)} 👋</p>
                    <h1 style={{ fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:900, letterSpacing:'-0.03em', margin:'0 0 8px', lineHeight:1.15 }}>{firstName}</h1>
                    <p style={{ fontSize:13.5, color:'var(--text-secondary)', margin:'0 0 16px', lineHeight:1.6, maxWidth:380 }}>
                      {user?.headline || (isAr ? 'أكمل ملفك الشخصي لفتح كامل المميزات' : 'Complete your profile to unlock all features')}
                    </p>

                    {/* Plan badge + Auto-Apply status */}
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                      <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, padding:'4px 11px', borderRadius:99, fontWeight:700, background: isPro ? 'rgba(99,102,241,.12)' : 'var(--bg-primary)', color: isPro ? 'rgb(99,102,241)' : 'var(--text-secondary)', border:'1px solid var(--border)' }}>
                        {isPro ? <><Zap size={11} /> Pro</> : <><Star size={11} /> Free</>}
                      </span>

                      {/* ✅ Auto-Apply badge — Pro/Elite only, reads from user.autoApplyEnabled */}
                      {isPro && (
                        <Link to="/dashboard/cvs" style={{
                          display:'flex', alignItems:'center', gap:5, fontSize:11.5,
                          padding:'4px 11px', borderRadius:99, fontWeight:700, textDecoration:'none',
                          background: user?.autoApplyEnabled ? 'rgba(34,197,94,.1)' : 'var(--bg-primary)',
                          color: user?.autoApplyEnabled ? '#22C55E' : 'var(--text-secondary)',
                          border: `1px solid ${user?.autoApplyEnabled ? 'rgba(34,197,94,.2)' : 'var(--border)'}`,
                        }}>
                          <Zap size={11} />
                          {user?.autoApplyEnabled
                            ? (isAr ? 'التقديم التلقائي نشط' : 'Auto-Apply active')
                            : (isAr ? 'التقديم التلقائي متوقف' : 'Auto-Apply off')}
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Hero CTAs */}
                  <div style={{ display:'flex', flexDirection:'column', gap:9, alignItems:'flex-end' }}>
                    <Link to="/dashboard/cvs" style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 20px', borderRadius:11, textDecoration:'none', background:'#6366f1', color:'#fff', fontSize:13.5, fontWeight:700, transition:'opacity .2s', whiteSpace:'nowrap', boxShadow:'0 4px 14px rgba(99,102,241,.35)' }}
                      onMouseEnter={e => e.currentTarget.style.opacity='.88'}
                      onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                      <Sparkles size={14} strokeWidth={2.5} />
                      {isAr ? 'تحليل AI للـ CV' : 'AI CV Analysis'}
                    </Link>
                    <Link to="/dashboard/jobs" style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', borderRadius:11, textDecoration:'none', background:'transparent', border:'1.5px solid var(--border)', color:'var(--text-primary)', fontSize:13, fontWeight:600, transition:'border-color .2s', whiteSpace:'nowrap' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor='var(--text-primary)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                      <Briefcase size={14} strokeWidth={1.8} />
                      {isAr ? 'تصفح الوظائف' : 'Browse Jobs'}
                    </Link>
                    {!isPro && (
                      <Link to="/pricing" style={{ fontSize:11.5, color:'#818cf8', fontWeight:700, textDecoration:'none', textAlign:'center' }}>
                        {isAr ? 'ترقية إلى Pro →' : 'Upgrade to Pro →'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Fade>

            {/* 4 STAT CARDS */}
            <Fade delay={60}>
              <div className="db-g4" style={{ marginBottom:18 }}>
                {[
                  { icon:Briefcase, value:stats?.applicationCount||0, label:isAr?'طلب وظيفة':'Applications',  to:'/dashboard/jobs', color:'#3B82F6', sub:stats?.newAppsThisWeek?`+${stats.newAppsThisWeek} ${isAr?'هذا الأسبوع':'this week'}`:null, subColor:'#22C55E' },
                  { icon:FileText,  value:stats?.cvCount||0,           label:isAr?'سيرة ذاتية':'CVs',          to:'/dashboard/cvs',  color:'#8B5CF6' },
                  { icon:Brain,     value:stats?.trainingCount||0,     label:isAr?'جلسة تدريب':'Interviews',   to:'/interview',      color:'#F59E0B', sub:stats?.avgTrainingScore?`${isAr?'متوسط':'Avg'} ${stats.avgTrainingScore}%`:null, subColor:'#F59E0B' },
                  { icon:BookOpen,  value:stats?.coursesCount||0,      label:isAr?'دورة مسجّل':'Courses',      to:'/courses',        color:'#6366f1', accent:true },
                ].map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <Link key={i} to={c.to} style={{ textDecoration:'none' }}>
                      <div style={{ background:c.accent?'#6366f1':'var(--bg-secondary)', borderRadius:14, padding:'18px 16px', border:c.accent?'1px solid #6366f1':'1px solid var(--border)', display:'flex', flexDirection:'column', gap:14, transition:'transform .2s, opacity .2s', cursor:'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.opacity='.9'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.opacity='1'; }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <div style={{ width:38, height:38, borderRadius:10, background:c.accent?'rgba(255,255,255,.15)':'var(--bg-primary)', border:`1px solid ${c.accent?'rgba(255,255,255,.2)':'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Icon size={17} color={c.accent?'#fff':c.color} strokeWidth={2} />
                          </div>
                          <ArrowUpRight size={14} color={c.accent?'rgba(255,255,255,.55)':'var(--text-secondary)'} />
                        </div>
                        <div>
                          <div style={{ fontSize:28, fontWeight:900, color:c.accent?'#fff':'var(--text-primary)', letterSpacing:'-0.04em', lineHeight:1, fontFamily:'var(--font-en)' }}>
                            {loading ? '—' : <Counter to={c.value} />}
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                          <span style={{ fontSize:12, color:c.accent?'rgba(255,255,255,.7)':'var(--text-secondary)', fontWeight:500, fontFamily:font }}>{c.label}</span>
                          {c.sub && <span style={{ fontSize:11, color:c.accent?'rgba(255,255,255,.8)':c.subColor, fontWeight:600, fontFamily:'var(--font-en)' }}>{c.sub}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Fade>

            {/* QUICK ACTIONS */}
            <Fade delay={120}>
              <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:16, padding:'18px 18px 14px', marginBottom:18 }}>
                <h2 style={{ fontSize:13.5, fontWeight:700, margin:'0 0 14px', fontFamily:font }}>{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
                <div className="db-qa">
                  <QuickAction to="/dashboard/cvs"  icon={Sparkles}  labelAr="تحليل AI"       labelEn="AI Analysis"  isAr={isAr} font={font} accent />
                  <QuickAction to="/dashboard/jobs"  icon={Briefcase} labelAr="تصفح وظائف"     labelEn="Find Jobs"    isAr={isAr} font={font} />
                  <QuickAction to="/interview"       icon={Brain}     labelAr="مقابلة AI"       labelEn="AI Interview" isAr={isAr} font={font} />
                  <QuickAction to="/courses"         icon={BookOpen}  labelAr="الدورات"          labelEn="Courses"      isAr={isAr} font={font} />
                  <QuickAction to="/rooms"           icon={Mic}       labelAr="الغرف الصوتية"   labelEn="Voice Rooms"  isAr={isAr} font={font} />
                  <QuickAction to="/wallet"          icon={Wallet}    labelAr="المحفظة"          labelEn="Wallet"       isAr={isAr} font={font} />
                </div>
              </div>
            </Fade>

            {/* CV SCORE + PROFILE */}
            <Fade delay={180}>
              <div className="db-g2" style={{ marginBottom:18 }}>
                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'درجة السيرة الذاتية' : 'CV Score'}</h2>
                    <Link to="/dashboard/cvs" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'عرض':'View'} <ChevronRight size={12} /></Link>
                  </div>
                  {loading ? <Skel h={80} /> : stats?.topCV ? (
                    <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                      <ScoreRing score={isPro ? (stats.topCV.aiScore||stats.topCV.ats_score||stats.topCV.atsScore||0) : (stats.topCV.atsScore||stats.topCV.ats_score||0)} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:14, fontWeight:700, margin:'0 0 3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-primary)' }}>{stats.topCV.title}</p>
                        <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 12px', fontFamily:font }}>ATS Score</p>
                        {(stats.topCV.ats_score||0) >= 80 ? (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, background:'rgba(34,197,94,.1)', color:'#22C55E', padding:'4px 11px', borderRadius:99, fontWeight:700, border:'1px solid rgba(34,197,94,.2)' }}>
                            <Circle size={11} /> {isAr ? 'جاهز للتقديم' : 'Ready to Apply'}
                          </span>
                        ) : (
                          <Link to="/dashboard/cvs" style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11.5, background:'var(--bg-primary)', color:'var(--text-primary)', padding:'4px 11px', borderRadius:99, fontWeight:700, textDecoration:'none', border:'1px solid var(--border)' }}>
                            <TrendingUp size={11} /> {isAr ? 'حسّن سيرتك' : 'Improve CV'}
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', padding:'18px 0' }}>
                      <FileText size={36} color="var(--text-secondary)" style={{ opacity:.2, margin:'0 auto 10px' }} />
                      <p style={{ fontSize:13, color:'var(--text-secondary)', margin:'0 0 12px', fontFamily:font }}>{isAr ? 'لم ترفع سيرة ذاتية بعد' : 'No CV uploaded yet'}</p>
                      <Link to="/dashboard/cvs" style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', textDecoration:'none' }}>
                        {isAr ? 'رفع سيرتي الذاتية →' : 'Upload My CV →'}
                      </Link>
                    </div>
                  )}
                </div>

                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'اكتمال الملف' : 'Profile'}</h2>
                    <Link to="/profile" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'تعديل':'Edit'} <ChevronRight size={12} /></Link>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <svg width={64} height={64} style={{ transform:'rotate(-90deg)' }}>
                        <circle cx={32} cy={32} r={26} fill="none" stroke="var(--bg-primary)" strokeWidth={7} />
                        <circle cx={32} cy={32} r={26} fill="none" stroke={profPct===100?'#22C55E':'var(--text-primary)'} strokeWidth={7}
                          strokeDasharray={`${(profPct/100)*2*Math.PI*26} ${2*Math.PI*26}`} strokeLinecap="round"
                          style={{ transition:'stroke-dasharray 1s ease' }} />
                      </svg>
                      <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:profPct===100?'#22C55E':'var(--text-primary)', fontFamily:'var(--font-en)' }}>{profPct}%</span>
                    </div>
                    <div style={{ flex:1 }}>
                      {profPct === 100 ? (
                        <p style={{ fontSize:13, fontWeight:700, color:'#22C55E', fontFamily:font, margin:0 }}>✓ {isAr?'مكتمل!':'Complete!'}</p>
                      ) : (
                        <>
                          <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:'0 0 2px', fontFamily:font }}>{isAr?`${missing.length} خطوات متبقية`:`${missing.length} steps left`}</p>
                          <p style={{ fontSize:11.5, color:'var(--text-secondary)', margin:0, opacity:.7, fontFamily:font }}>{isAr?'أكمل ملفك لفرص أفضل':'Complete for better matches'}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {missing.slice(0,4).map((f,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12.5, color:'var(--text-secondary)', fontFamily:font }}>
                        <Circle size={12} color="var(--border)" strokeWidth={2} style={{ flexShrink:0 }} />
                        {isAr ? f.ar : f.en}
                      </div>
                    ))}
                    {profPct < 100 && (
                      <Link to="/profile" style={{ marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'8px', borderRadius:9, background:'var(--bg-primary)', border:'1.5px solid var(--border)', color:'var(--text-primary)', fontSize:12.5, fontWeight:700, textDecoration:'none', transition:'border-color .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#6366f1'; e.currentTarget.style.color='#6366f1'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-primary)'; }}>
                        <ArrowRight size={13} /> {isAr ? 'أكمل ملفك' : 'Complete Profile'}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Fade>

            {/* APPLICATION FUNNEL + RECENT */}
            <Fade delay={240}>
              <div className="db-g2" style={{ marginBottom:18 }}>
                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'مسار الطلبات' : 'Application Funnel'}</h2>
                    <Link to="/dashboard/jobs" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'عرض الكل':'All'} <ChevronRight size={12} /></Link>
                  </div>
                  {loading ? <Skel h={140} /> : totalApps === 0 ? (
                    <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-secondary)' }}>
                      <BarChart2 size={32} style={{ opacity:.2, margin:'0 auto 8px' }} />
                      <p style={{ fontSize:12.5, fontFamily:font }}>{isAr ? 'لم تتقدم لأي وظيفة بعد' : 'No applications yet'}</p>
                    </div>
                  ) : (
                    <>
                      <FunnelBar label={isAr?'مُرسَل':'Sent'}        count={by.sent||0}        total={totalApps} color="#6B7280" icon={Send}      />
                      <FunnelBar label={isAr?'شوهد':'Viewed'}         count={by.viewed||0}       total={totalApps} color="#3B82F6" icon={Eye}       />
                      <FunnelBar label={isAr?'قائمة مختصرة':'Shortlisted'} count={by.shortlisted||0} total={totalApps} color="#8B5CF6" icon={Award}     />
                      <FunnelBar label={isAr?'مقابلة':'Interview'}     count={by.interview||0}   total={totalApps} color="#F59E0B" icon={UserCheck}  />
                      <FunnelBar label={isAr?'مقبول':'Accepted'}       count={by.accepted||0}    total={totalApps} color="#22C55E" icon={Circle} />
                    </>
                  )}
                </div>

                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'آخر الطلبات' : 'Recent Applications'}</h2>
                    <Link to="/dashboard/jobs" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'عرض الكل':'All'} <ChevronRight size={12} /></Link>
                  </div>
                  {loading ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{[...Array(4)].map((_,i) => <Skel key={i} h={48} r={10} />)}</div>
                  ) : !stats?.recentApplications?.length ? (
                    <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-secondary)' }}>
                      <Briefcase size={32} style={{ opacity:.2, margin:'0 auto 8px' }} />
                      <p style={{ fontSize:12.5, fontFamily:font }}>{isAr ? 'لا طلبات حديثة' : 'No recent applications'}</p>
                      <Link to="/dashboard/jobs" style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', textDecoration:'none' }}>
                        {isAr ? 'تصفح الوظائف →' : 'Browse Jobs →'}
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                      {stats.recentApplications.map((app,i) => {
                        const s = STATUS[app.status] || STATUS.sent;
                        return (
                          <div key={app.id||i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:11, background:'var(--bg-primary)', border:'1px solid var(--border)', transition:'border-color .15s' }}
                            onMouseEnter={e => e.currentTarget.style.borderColor='var(--text-primary)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
                            <div style={{ width:32, height:32, borderRadius:8, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, overflow:'hidden' }}>
                              {app.company?.logoUrl
                                ? <img src={app.company.logoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; }} />
                                : <Briefcase size={14} color="var(--text-secondary)" strokeWidth={1.8} />
                              }
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <p style={{ fontSize:13, fontWeight:600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:'var(--text-primary)', fontFamily:font }}>
                                {app.jobTitle || (isAr ? 'وظيفة' : 'Job')}
                              </p>
                              {app.company?.name && <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'1px 0 0', fontFamily:font }}>{app.company.name}</p>}
                            </div>
                            <span style={{ fontSize:11.5, fontWeight:700, padding:'3px 9px', borderRadius:99, background:s.bg, color:s.color, flexShrink:0, whiteSpace:'nowrap', fontFamily:font }}>
                              {isAr ? s.ar : s.en}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </Fade>

            {/* AI INTERVIEWS + WALLET + COMMUNITY */}
            <Fade delay={300}>
              <div className="db-g3" style={{ marginBottom:18 }}>
                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'تدريب المقابلة' : 'AI Interviews'}</h2>
                    <Link to="/interview" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'ابدأ':'Start'} <ChevronRight size={12} /></Link>
                  </div>
                  {loading ? <Skel h={80} /> : sessions.length ? (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                        <ScoreRing score={stats?.avgTrainingScore || computedAvg || 0} size={68} />
                        <div>
                          <p style={{ fontSize:11.5, color:'var(--text-secondary)', margin:'0 0 2px', fontFamily:font }}>{isAr ? 'متوسط الأداء' : 'Avg Score'}</p>
                          <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'2px 0 0' }}>{sessions.length} {isAr ? 'جلسة' : 'sessions'}</p>
                        </div>
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        {sessions.slice(0,3).map((t,i) => {
                          const pct = parseFloat(t.score ?? t.overallScore ?? t.totalScore ?? t.percentage ?? t.result ?? 0);
                          const c = pct >= 80 ? '#22C55E' : pct >= 60 ? '#F59E0B' : '#EF4444';
                          return (
                            <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1, height:4, background:'var(--bg-primary)', borderRadius:99, overflow:'hidden', border:'1px solid var(--border)' }}>
                                <div style={{ height:'100%', width:`${pct}%`, background:c, borderRadius:99 }} />
                              </div>
                              <span style={{ fontSize:11, fontWeight:700, color:c, fontFamily:'var(--font-en)', width:32, textAlign:'end' }}>{Math.round(pct)}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign:'center', padding:'16px 0' }}>
                      <Brain size={32} color="var(--text-secondary)" style={{ opacity:.2, margin:'0 auto 8px' }} />
                      <p style={{ fontSize:12.5, fontFamily:font, color:'var(--text-secondary)', margin:'0 0 10px' }}>{isAr ? 'لم تبدأ أي مقابلة بعد' : 'No interviews yet'}</p>
                      <Link to="/interview" style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', textDecoration:'none' }}>
                        {isAr ? 'ابدأ مقابلة →' : 'Start Interview →'}
                      </Link>
                    </div>
                  )}
                </div>

                {/* WALLET */}
                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'المحفظة' : 'Wallet'}</h2>
                    <Link to="/wallet" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'عرض':'View'} <ChevronRight size={12} /></Link>
                  </div>
                  {loading ? <Skel h={100} /> : (
                    <>
                      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:13, padding:'16px', marginBottom:12, display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:44, height:44, borderRadius:12, background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Star size={20} color="#F59E0B" strokeWidth={2} />
                        </div>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'.07em', fontFamily:font }}>{isAr ? 'رصيد النقاط' : 'Points Balance'}</p>
                          <p style={{ fontSize:26, fontWeight:900, margin:0, letterSpacing:'-0.04em', fontFamily:'var(--font-en)', color:'#F59E0B', lineHeight:1 }}>
                            {(stats?.pointsBalance||0).toLocaleString()}
                            <span style={{ fontSize:12, fontWeight:500, color:'var(--text-secondary)', marginInlineStart:5 }}>pts</span>
                          </p>
                        </div>
                      </div>
                      <Link to="/wallet" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', borderRadius:10, background:'#6366f1', textDecoration:'none', transition:'opacity .2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='.85'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                        <Wallet size={13} color="#fff" />
                        <span style={{ fontSize:12.5, fontWeight:700, color:'#fff', fontFamily:font }}>{isAr ? 'شحن النقاط' : 'Add Points'}</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* COMMUNITY */}
                <div style={{ background:'var(--bg-secondary)', borderRadius:16, padding:'20px', border:'1px solid var(--border)', display:'flex', flexDirection:'column' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                    <h2 style={{ fontSize:13.5, fontWeight:700, margin:0, fontFamily:font }}>{isAr ? 'المجتمع' : 'Community'}</h2>
                    <Link to="/community" style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:600, textDecoration:'none', display:'flex', alignItems:'center', gap:3 }}>{isAr?'انضم':'Join'} <ChevronRight size={12} /></Link>
                  </div>
                  <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      { to:'/community', icon:Users, ar:'شبكة المهنيين', en:'Professional Network', sub:isAr?'تواصل مع محترفين':'Connect with pros' },
                      { to:'/rooms',     icon:Mic,   ar:'الغرف الصوتية', en:'Voice Rooms',          sub:isAr?'انضم لغرفة الآن':'Join a room now'  },
                    ].map((item,i) => {
                      const Icon = item.icon;
                      return (
                        <Link key={i} to={item.to} style={{ display:'flex', alignItems:'center', gap:11, padding:'11px 13px', borderRadius:11, background:'var(--bg-primary)', border:'1px solid var(--border)', textDecoration:'none', transition:'all .2s' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currentTarget.style.transform='translateX(2px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}>
                          <div style={{ width:34, height:34, borderRadius:9, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <Icon size={16} color="var(--text-primary)" strokeWidth={1.8} />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:600, margin:0, color:'var(--text-primary)', fontFamily:font }}>{isAr ? item.ar : item.en}</p>
                            <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'1px 0 0', fontFamily:font }}>{item.sub}</p>
                          </div>
                          <ArrowRight size={14} color="var(--text-secondary)" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Fade>

            {/* UPGRADE BANNER — free only */}
            {!isPro && !loading && (
              <Fade delay={360}>
                <div style={{ borderRadius:16, padding:'20px 24px', marginBottom:18, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize:'22px 22px', opacity:.4, pointerEvents:'none' }} />
                  <div style={{ position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                      <Zap size={16} color="rgb(99,102,241)" />
                      <span style={{ fontSize:13, fontWeight:800, color:'rgb(99,102,241)', fontFamily:font }}>{isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}</span>
                    </div>
                    <p style={{ fontSize:13.5, fontWeight:600, color:'var(--text-primary)', margin:'0 0 4px', fontFamily:font }}>{isAr ? 'افتح كامل إمكانيات المنصة' : 'Unlock the full platform'}</p>
                    <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:0, fontFamily:font }}>{isAr ? 'تحليل AI متقدم، إنشاء غرف، تقدم تلقائي ومزيد' : 'Advanced AI, room creation, auto-apply & more'}</p>
                  </div>
                  <Link to="/pricing" style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 22px', borderRadius:11, background:'#6366f1', color:'#fff', textDecoration:'none', fontSize:13.5, fontWeight:700, fontFamily:font, whiteSpace:'nowrap', transition:'opacity .2s', position:'relative', boxShadow:'0 4px 14px rgba(99,102,241,.4)' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    <Zap size={14} /> {isAr ? 'ترقية الآن' : 'Upgrade Now'}
                  </Link>
                </div>
              </Fade>
            )}

            <div style={{ height:8 }} />
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}