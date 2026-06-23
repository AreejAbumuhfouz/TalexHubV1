

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { Link } from 'react-router-dom';
// import {
//   Search, MapPin, Clock, Sparkles, Send,
//   CheckCircle2, Building2, Banknote, Wifi, ArrowUpRight,
//   X, Filter, RefreshCw, Bot, ChevronRight, ChevronLeft,
//   BarChart2, Info, Zap, AlertTriangle,
//   Shield, Briefcase, Users,
// } from 'lucide-react';
// import useAuthStore from '../../store/authStore';
// import useLang from '../../i18n';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// /* ═══════════════════════════════════════════════════════════
//    HELPERS
// ═══════════════════════════════════════════════════════════ */
// const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';
// const matchBg    = s => s >= 80 ? 'rgba(34,197,94,.1)' : s >= 60 ? 'rgba(245,158,11,.1)' : s >= 40 ? 'rgba(59,130,246,.1)' : 'rgba(113,113,122,.1)';
// const matchLabel = (s, ar) => s >= 80 ? (ar ? 'ممتاز' : 'Excellent') : s >= 60 ? (ar ? 'جيد' : 'Good') : s >= 40 ? (ar ? 'معقول' : 'Fair') : (ar ? 'منخفض' : 'Low');

// const fmtSalary = (min, max, cur = 'USD') => {
//   if (!min && !max) return null;
//   const f = n => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
//   if (min && max) return `${f(min)}–${f(max)} ${cur}`;
//   return min ? `${f(min)}+ ${cur}` : `Up to ${f(max)} ${cur}`;
// };

// const timeAgo = (d, ar) => {
//   const x = Math.floor((Date.now() - new Date(d)) / 86400000);
//   if (x === 0) return ar ? 'اليوم' : 'Today';
//   if (x === 1) return ar ? 'أمس'   : '1d ago';
//   if (x < 7)   return ar ? `${x}د` : `${x}d ago`;
//   if (x < 30)  return ar ? `${Math.floor(x / 7)}أ` : `${Math.floor(x / 7)}w ago`;
//   return ar ? `${Math.floor(x / 30)}ش` : `${Math.floor(x / 30)}mo`;
// };

// const JOB_TYPES = [
//   { key: '',           ar: 'الكل',     en: 'All'       },
//   { key: 'full_time',  ar: 'كامل',     en: 'Full-time' },
//   { key: 'part_time',  ar: 'جزئي',     en: 'Part-time' },
//   { key: 'freelance',  ar: 'فريلانس',  en: 'Freelance' },
//   { key: 'internship', ar: 'تدريب',    en: 'Intern'    },
//   { key: 'remote',     ar: 'بُعد',     en: 'Remote'    },
// ];

// const STATUS_MAP = {
//   sent:        { ar: 'مُرسَل',    en: 'Sent',        c: '#6B7280', bg: 'rgba(107,114,128,.12)' },
//   viewed:      { ar: 'شوهد',       en: 'Viewed',      c: '#3B82F6', bg: 'rgba(59,130,246,.12)'  },
//   shortlisted: { ar: 'مختصر',      en: 'Shortlisted', c: '#8B5CF6', bg: 'rgba(139,92,246,.12)'  },
//   interview:   { ar: 'مقابلة',     en: 'Interview',   c: '#F59E0B', bg: 'rgba(245,158,11,.12)'  },
//   accepted:    { ar: 'مقبول ✓',   en: 'Accepted ✓',  c: '#22C55E', bg: 'rgba(34,197,94,.12)'   },
//   rejected:    { ar: 'مرفوض',      en: 'Rejected',    c: '#EF4444', bg: 'rgba(239,68,68,.12)'   },
// };

// /* ═══════════════════════════════════════════════════════════
//    CONSENT MODAL
// ═══════════════════════════════════════════════════════════ */
// function ConsentModal({ isAr, font, onAccept, onDecline }) {
//   return (
//     <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
//       <div style={{ background: 'var(--bg-primary)', borderRadius: 20, border: '1px solid var(--border)', padding: '28px 26px', maxWidth: 430, width: '100%', direction: isAr ? 'rtl' : 'ltr', fontFamily: font }}>
//         <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
//           <Shield size={23} color="#8B5CF6" strokeWidth={1.8} />
//         </div>
//         <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
//           {isAr ? 'تفعيل التقديم التلقائي' : 'Enable AI Auto-Apply'}
//         </h2>
//         <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.7 }}>
//           {isAr
//             ? 'بتفعيل هذه الميزة، أنت توافق على أن TalexHub سيُرسل سيرتك الذاتية تلقائياً للشركات المناسبة ضمن الحدود المحددة من قِبل المشرف.'
//             : 'By enabling this, you agree TalexHub will automatically send your CV to matching companies within the limits set by the admin.'}
//         </p>
//         <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
//           {[
//             { i: '🎯', ar: 'يتقدم فقط للوظائف المتوافقة حسب معايير المشرف',  en: 'Only applies to jobs meeting the admin-set match score'   },
//             { i: '✉️', ar: 'AI يكتب خطاب تقديم مخصص لكل وظيفة',             en: 'AI writes a personalized cover letter per job'  },
//             { i: '📅', ar: 'الحد اليومي والشهري يُحدد من قِبل المشرف',       en: 'Daily and monthly limits are set by the admin'  },
//             { i: '⏹️', ar: 'يمكنك إيقاف التقديم التلقائي في أي وقت',        en: 'You can disable auto-apply anytime'             },
//           ].map((f, i) => (
//             <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
//               <span style={{ flexShrink: 0 }}>{f.i}</span>
//               <span>{isAr ? f.ar : f.en}</span>
//             </div>
//           ))}
//         </div>
//         <div style={{ display: 'flex', gap: 10 }}>
//           <button onClick={onDecline} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: font }}>
//             {isAr ? 'إلغاء' : 'Cancel'}
//           </button>
//           <button onClick={onAccept} style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
//             <Bot size={15} /> {isAr ? 'أوافق وأفعّل' : 'Accept & Enable'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    JOB CARD
// ═══════════════════════════════════════════════════════════ */
// function JobCard({ job, isAr, font, onApply, applied, applying, isPro }) {
//   const salary   = fmtSalary(job.salary_min || job.salaryMin, job.salary_max || job.salaryMax, job.salaryCurrency);
//   const score    = job.matchScore != null ? Math.round(job.matchScore) : null;
//   const title    = isAr && job.titleAr ? job.titleAr : job.title;
//   const isActive = applying === job.id;
//   const showScore = isPro && score != null;

//   return (
//     <div
//       style={{ background: 'var(--bg-primary)', border: `1.5px solid ${showScore && score >= 80 ? 'rgba(34,197,94,.22)' : 'var(--border)'}`, borderRadius: 16, padding: '16px 16px 14px', position: 'relative', transition: 'transform .2s,box-shadow .2s,border-color .2s', display: 'flex', flexDirection: 'column', gap: 12 }}
//       onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
//       onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
//     >
//       {showScore && (
//         <div style={{ position: 'absolute', top: 13, insetInlineEnd: 13, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: matchBg(score), border: `1px solid ${matchColor(score)}30` }}>
//           <Sparkles size={10} color={matchColor(score)} />
//           <span style={{ fontSize: 11, fontWeight: 700, color: matchColor(score) }}>{score}% {matchLabel(score, isAr)}</span>
//         </div>
//       )}

//       <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, paddingInlineEnd: showScore ? 100 : 0 }}>
//         <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
//           {job.company?.logoUrl
//             ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
//             : <Building2 size={17} color="var(--text-secondary)" strokeWidth={1.5} />}
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font }}>{title}</p>
//           <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{job.company?.name}</p>
//         </div>
//       </div>

//       <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
//         {job.locationCity && (
//           <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
//             <MapPin size={9} /> {job.locationCity}
//           </span>
//         )}
//         {(job.is_remote || job.isRemote) && (
//           <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#22C55E', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', padding: '3px 8px', borderRadius: 99 }}>
//             <Wifi size={9} /> {isAr ? 'بُعد' : 'Remote'}
//           </span>
//         )}
//         {job.jobType && (
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
//             {job.jobType.replace(/_/g, '-')}
//           </span>
//         )}
//         {salary && job.salaryVisible !== false && (
//           <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
//             <Banknote size={9} /> {salary}
//           </span>
//         )}
//       </div>

//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
//             <Clock size={10} /> {timeAgo(job.created_at || job.createdAt, isAr)}
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
//             <Users size={10} /> {job.applicationsCount || 0}
//           </span>
//         </div>
//         <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
//           <Link to={`/dashboard/jobs/${job.id}`}
//             style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, padding: '6px 10px', borderRadius: 8, border: '1px solid transparent', transition: 'all .15s' }}
//             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//             onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//             {isAr ? 'تفاصيل' : 'Details'} <ArrowUpRight size={11} />
//           </Link>
//           {applied ? (
//             <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#22C55E', padding: '7px 13px', borderRadius: 9, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.22)' }}>
//               <CheckCircle2 size={12} /> {isAr ? 'تم التقديم' : 'Applied'}
//             </span>
//           ) : (
//             <button onClick={() => onApply(job)} disabled={isActive}
//               style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: isActive ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: font, opacity: isActive ? .7 : 1, transition: 'opacity .2s' }}>
//               {isActive ? <RefreshCw size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <Send size={11} strokeWidth={2} />}
//               {isAr ? 'تقدّم' : 'Apply'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    AUTO-APPLY PANEL — unified with /auto-apply/* (same backend
//    as the CV → Auto-Apply tab). NO localStorage anywhere —
//    all state (enabled, template, language, stats) is fetched
//    fresh from the server on every mount.
// ═══════════════════════════════════════════════════════════ */
// function AutoApplyPanel({ isAr, font, user, onApplied, autoEnabled, onToggle }) {
//   const isPro = ['pro', 'elite'].includes(user?.planKey);
//   const [stats,    setStats]    = useState(null);
//   const [settings, setSettings] = useState(null);
//   const [running,  setRunning]  = useState(false);
//   const [showInfo, setInfo]     = useState(false);

//   useEffect(() => {
//     if (!isPro) return;
//     api.get('/auto-apply/stats').then(r => setStats(r.data.data)).catch(() => {});
//     api.get('/auto-apply/settings').then(r => setSettings(r.data.data)).catch(() => {});
//   }, [isPro, autoEnabled]);

//   const dailyReached   = stats && stats.dailyLimit   > 0 && stats.usedToday     >= stats.dailyLimit;
//   const monthlyReached = stats && stats.monthlyLimit > 0 && stats.usedThisMonth >= stats.monthlyLimit;
//   const limitReached   = dailyReached || monthlyReached;

//   const run = async () => {
//     if (!autoEnabled) { toast.error(isAr ? 'فعّل التقديم التلقائي أولاً' : 'Enable auto-apply first'); return; }
//     if (limitReached)  { toast.error(dailyReached ? (isAr ? 'وصلت للحد اليومي' : 'Daily limit reached') : (isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached')); return; }
//     setRunning(true);
//     try {
//       const { data } = await api.post('/auto-apply/run', { maxBatch: 5 });
//       const r = data.data;
//       if (r.reason === 'plan_insufficient')          toast.error(isAr ? 'Pro مطلوب' : 'Pro required');
//       else if (r.reason === 'monthly_limit_reached')  toast.error(isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached');
//       else if (r.reason === 'daily_limit_reached')    toast.error(isAr ? 'وصلت للحد اليومي' : 'Daily limit reached');
//       else if (r.reason === 'no_cv')                  toast.error(isAr ? 'ارفع سيرتك أولاً' : 'Upload CV first');
//       else if (r.applied?.length > 0) {
//         toast.success(isAr ? `🤖 تم التقديم تلقائياً على ${r.applied.length} وظيفة` : `🤖 Auto-applied to ${r.applied.length} jobs`);
//         onApplied(r.applied.map(a => a.jobId));
//       } else {
//         toast.success(isAr ? 'لا توجد وظائف مناسبة حالياً' : 'No matching jobs found right now');
//       }
//       api.get('/auto-apply/stats').then(x => setStats(x.data.data)).catch(() => {});
//     } catch (e) {
//       toast.error(e.response?.data?.message || (isAr ? 'فشل' : 'Failed'));
//     } finally { setRunning(false); }
//   };

//   if (!isPro) return (
//     <div style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
//         <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//           <Bot size={16} color="var(--text-secondary)" strokeWidth={1.8} />
//         </div>
//         <div>
//           <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6 }}>
//             {isAr ? 'التقديم التلقائي' : 'AI Auto-Apply'}
//             <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', color: '#F59E0B' }}>PRO</span>
//           </p>
//           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>{isAr ? 'حصري للمشتركين Pro' : 'Pro subscribers only'}</p>
//         </div>
//       </div>
//       <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.65, fontFamily: font }}>
//         {isAr ? 'دع AI يتقدم نيابةً عنك على أفضل الوظائف المتوافقة مع خطاب تقديم مخصص.' : 'Let AI apply on your behalf to the best matching jobs with a personalized cover letter.'}
//       </p>
//       <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>
//         <Zap size={13} /> {isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
//       </Link>
//     </div>
//   );

//   const dayPct = stats ? Math.min((stats.usedToday / stats.dailyLimit) * 100, 100) : 0;
//   const monPct = stats ? Math.min((stats.usedThisMonth / stats.monthlyLimit) * 100, 100) : 0;

//   return (
//     <div style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
//         <div style={{ width: 34, height: 34, borderRadius: 10, background: autoEnabled ? 'rgba(139,92,246,.12)' : 'var(--bg-secondary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
//           <Bot size={16} color={autoEnabled ? '#8B5CF6' : 'var(--text-primary)'} strokeWidth={1.8} />
//         </div>
//         <div style={{ flex: 1 }}>
//           <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'التقديم التلقائي' : 'AI Auto-Apply'}</p>
//           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//             {settings?.template ? (isAr ? `قالب: ${settings.template}` : `Template: ${settings.template}`) : (isAr ? 'AI يبحث ويتقدم تلقائياً' : 'AI finds & applies automatically')}
//           </p>
//         </div>
//         <button onClick={() => setInfo(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
//           <Info size={14} />
//         </button>
//       </div>

//       <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 11, background: autoEnabled ? 'rgba(139,92,246,.07)' : 'var(--bg-secondary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.25)' : 'var(--border)'}`, cursor: 'pointer', marginBottom: 12, transition: 'all .2s' }}>
//         <div style={{ flex: 1 }}>
//           <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1px', fontFamily: font }}>{isAr ? 'التشغيل التلقائي' : 'Auto-run'}</p>
//           <p style={{ fontSize: 11, color: autoEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//             {autoEnabled ? (isAr ? '✓ نشط' : '✓ Active') : (isAr ? 'غير نشط' : 'Disabled')}
//           </p>
//         </div>
//         <div style={{ width: 42, height: 23, borderRadius: 12, background: autoEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
//           <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: autoEnabled ? 22 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
//         </div>
//       </div>

//       {showInfo && (
//         <div style={{ padding: '11px 13px', borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, fontFamily: font }}>
//           {isAr
//             ? 'يتقدم AI على الوظائف المتوافقة حسب معايير المشرف، مع خطاب مخصص. لتغيير القالب أو لغة الخطاب، افتحي إعدادات التقديم التلقائي في صفحة السيرة الذاتية.'
//             : 'AI applies to matching jobs per admin-set criteria, with a custom cover letter. To change the CV template or cover letter language, open Auto-Apply settings on the CV page.'}
//           <div style={{ marginTop: 8 }}>
//             <Link to="/dashboard/cvs" style={{ fontSize: 11.5, color: '#8B5CF6', fontWeight: 700, textDecoration: 'none' }}>
//               {isAr ? 'فتح إعدادات السيرة الذاتية →' : 'Open CV settings →'}
//             </Link>
//           </div>
//         </div>
//       )}

//       {stats && (
//         <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
//           {[
//             { label: isAr ? 'اليوم' : 'Today', used: stats.usedToday,     limit: stats.dailyLimit,   pct: dayPct, atLimit: dailyReached   },
//             { label: isAr ? 'الشهر' : 'Month', used: stats.usedThisMonth, limit: stats.monthlyLimit, pct: monPct, atLimit: monthlyReached },
//           ].map((b, i) => (
//             <div key={i}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//                 <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>{b.label}</span>
//                 <span style={{ fontSize: 11, fontWeight: 700, color: b.atLimit ? '#EF4444' : 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{b.used}/{b.limit}</span>
//               </div>
//               <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
//                 <div style={{ height: '100%', width: `${b.pct}%`, background: b.atLimit ? '#EF4444' : '#8B5CF6', borderRadius: 99, transition: 'width .5s' }} />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {limitReached && (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', marginBottom: 12 }}>
//           <AlertTriangle size={13} color="#EF4444" />
//           <p style={{ flex: 1, margin: 0, fontSize: 11.5, fontWeight: 600, color: '#EF4444', fontFamily: font }}>
//             {dailyReached ? (isAr ? 'وصلت للحد اليومي — حاولي غداً' : 'Daily limit reached — try tomorrow') : (isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached')}
//           </p>
//         </div>
//       )}

//       <button onClick={run} disabled={running || !autoEnabled || limitReached}
//         style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 9, border: 'none', background: (limitReached || !autoEnabled) ? 'var(--bg-secondary)' : '#8B5CF6', color: (limitReached || !autoEnabled) ? 'var(--text-secondary)' : 'white', cursor: (running || !autoEnabled || limitReached) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font, transition: 'opacity .15s' }}
//         onMouseEnter={e => { if (!running && autoEnabled && !limitReached) e.currentTarget.style.opacity = '.88'; }}
//         onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
//         {running
//           ? <><RefreshCw size={13} style={{ animation: 'spin .8s linear infinite' }} /> {isAr ? 'جارٍ...' : 'Running...'}</>
//           : limitReached
//           ? <>{dailyReached ? (isAr ? 'الحد اليومي ممتلئ' : 'Daily limit full') : (isAr ? 'الحد الشهري ممتلئ' : 'Monthly limit full')}</>
//           : <><Bot size={13} /> {isAr ? 'تشغيل الآن' : 'Run Now'}</>}
//       </button>

//       {autoEnabled && !limitReached && (
//         <p style={{ fontSize: 10.5, color: '#8B5CF6', margin: '8px 0 0', textAlign: 'center', fontFamily: font }}>
//           {isAr ? '⚡ تعمل تلقائياً وفق جدولة الخادم' : '⚡ Runs automatically on the server schedule'}
//         </p>
//       )}
//     </div>
//   );
// }

// /* ═══════════════════════════════════════════════════════════
//    APPLICATION ROW
// ═══════════════════════════════════════════════════════════ */
// function AppRow({ app, isAr, font }) {
//   const job   = app.job || {};
//   const s     = STATUS_MAP[app.status] || STATUS_MAP.sent;
//   const title = isAr && job.titleAr ? job.titleAr : job.title;
//   return (
//     <div
//       style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, transition: 'border-color .15s' }}
//       onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
//       onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
//     >
//       <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
//         {job.company?.logoUrl
//           ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
//           : <Building2 size={14} color="var(--text-secondary)" strokeWidth={1.5} />}
//       </div>
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font, color: 'var(--text-primary)' }}>{title || '—'}</p>
//         <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
//           <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>{job.company?.name}</span>
//           {app.isAutoApplied && (
//             <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: '#8B5CF6', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', padding: '1px 6px', borderRadius: 99 }}>
//               <Bot size={9} /> {isAr ? 'تلقائي' : 'Auto'}
//             </span>
//           )}
//         </div>
//       </div>
//       {app.matchScore != null && (
//         <span style={{ fontSize: 12, fontWeight: 700, color: matchColor(app.matchScore), fontFamily: 'var(--font-en)', flexShrink: 0 }}>
//           {Math.round(app.matchScore)}%
//         </span>
//       )}
//       <span style={{ padding: '4px 11px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.c, flexShrink: 0, fontFamily: font, whiteSpace: 'nowrap' }}>
//         {isAr ? s.ar : s.en}
//       </span>
//       <Link to={`/dashboard/jobs/${app.jobId || app.job_id}`}
//         style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, padding: '4px 8px', borderRadius: 7, border: '1px solid transparent', transition: 'all .15s' }}
//         onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//         onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//         <ArrowUpRight size={11} />
//       </Link>
//     </div>
//   );
// }

// /* ─── Empty state ─── */
// const Empty = ({ icon, title, desc, action, isAr, font }) => (
//   <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
//     <div style={{ opacity: .15, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
//     <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px', fontFamily: font }}>{title}</p>
//     <p style={{ fontSize: 12.5, margin: '0 0 16px', fontFamily: font }}>{desc}</p>
//     {action}
//   </div>
// );

// /* ─── Skeleton ─── */
// const Skel = () => (
//   <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', height: 160, animation: 'glowPulse 1.5s ease-in-out infinite' }} />
// );

// /* ═══════════════════════════════════════════════════════════
//    MAIN
// ═══════════════════════════════════════════════════════════ */
// export default function UserJobsPage() {
//   const { lang } = useLang();
//   const isAr = lang === 'ar';
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const { user, updateUser } = useAuthStore();
//   const isPro = ['pro', 'elite'].includes(user?.planKey);
//   const [collapsed, setCollapsed] = useState(false);

//   const [tab,        setTab]      = useState('matched');
//   const [jobs,       setJobs]     = useState([]);
//   const [browseJobs, setBrowse]   = useState([]);
//   const [appliedJobs,setApplied]  = useState([]);
//   const [loading,    setLoading]  = useState(true);
//   const [applying,   setApplying] = useState(null);
//   const [appliedIds, setIds]      = useState(new Set());

//   // ✅ No localStorage — autoEnabled comes straight from the user record
//   const [autoEnabled, setAutoEnabled] = useState(user?.autoApplyEnabled ?? false);
//   const [showConsent, setConsent] = useState(false);

//   // ── Browse filters ──────────────────────────────────────
//   const [q,          setQ]         = useState('');
//   const [type,       setType]      = useState('');
//   const [remote,     setRemote]    = useState(false);
//   const [page,       setPage]      = useState(1);
//   const [total,      setTotal]     = useState(0);
//   const [showFilter, setShowFilter] = useState(false);

//   // ── Applications filters + pagination ──────────────────
//   const [appSearch,  setAppSearch] = useState('');
//   const [appStatus,  setAppStatus] = useState('');
//   const [appPage,    setAppPage]   = useState(1);
//   const [appTotal,   setAppTotal]  = useState(0);
//   const APP_LIMIT = 10;

//   const LIMIT = 12;
//   const timer    = useRef(null);
//   const appTimer = useRef(null);

//   // ✅ Keep autoEnabled in sync with the user object whenever it changes
//   useEffect(() => {
//     if (user?.autoApplyEnabled !== undefined) {
//       setAutoEnabled(user.autoApplyEnabled);
//     }
//   }, [user?.autoApplyEnabled]);

//   // ── Loaders ─────────────────────────────────────────────
//   const loadMatched = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/jobs', { params: { sort: 'matched', limit: 20 } });
//       setJobs(data.data || []);
//     } catch { setJobs([]); } finally { setLoading(false); }
//   }, []);

//   const loadBrowse = useCallback(async (pg = 1) => {
//     setLoading(true);
//     try {
//       const params = { page: pg, limit: LIMIT, sort: 'newest' };
//       if (q)      params.q      = q;
//       if (type)   params.type   = type;
//       if (remote) params.remote = 'true';
//       const { data } = await api.get('/jobs', { params });
//       const items = data.data || [];
//       setBrowse(pg === 1 ? items : prev => [...prev, ...items]);
//       setTotal(data.pagination?.total || items.length);
//       setPage(pg);
//     } catch { if (pg === 1) setBrowse([]); } finally { setLoading(false); }
//   }, [q, type, remote]);

//   const loadApplied = useCallback(async (pg = 1, reset = true) => {
//     setLoading(true);
//     try {
//       const params = { page: pg, limit: APP_LIMIT };
//       if (appSearch) params.q      = appSearch;
//       if (appStatus) params.status = appStatus;
//       const { data } = await api.get('/applications/me', { params });
//       const apps = data.data?.rows || data.data || [];
//       setApplied(prev => reset ? apps : [...prev, ...apps]);
//       setAppTotal(data.pagination?.total || data.data?.count || apps.length);
//       setAppPage(pg);
//       setIds(prev => new Set([...prev, ...apps.map(a => a.jobId || a.job_id).filter(Boolean)]));
//     } catch { if (reset) setApplied([]); }
//     finally { setLoading(false); }
//   }, [appSearch, appStatus]);

//   // Fetch applied IDs once on mount (for "Applied" badges on cards)
//   useEffect(() => {
//     api.get('/applications/me', { params: { limit: 200, fields: 'jobId' } })
//       .then(r => {
//         const apps = r.data?.data?.rows || r.data?.data || [];
//         setIds(new Set(apps.map(a => a.jobId || a.job_id).filter(Boolean)));
//       }).catch(() => {});
//   }, []);

//   // Tab switch
//   useEffect(() => {
//     if (tab === 'matched') loadMatched();
//     if (tab === 'browse')  { setPage(1); setBrowse([]); }
//     if (tab === 'applied') { setAppPage(1); loadApplied(1, true); }
//   }, [tab]);

//   // Browse debounce
//   useEffect(() => {
//     if (tab !== 'browse') return;
//     clearTimeout(timer.current);
//     timer.current = setTimeout(() => { setPage(1); loadBrowse(1); }, q ? 400 : 0);
//     return () => clearTimeout(timer.current);
//   }, [q, type, remote, tab]);

//   // Applications search/filter debounce
//   useEffect(() => {
//     if (tab !== 'applied') return;
//     clearTimeout(appTimer.current);
//     appTimer.current = setTimeout(() => loadApplied(1, true), appSearch ? 400 : 0);
//     return () => clearTimeout(appTimer.current);
//   }, [appSearch, appStatus, tab]);

//   const handleApply = async (job) => {
//     if (!user) { toast.error(isAr ? 'سجّل دخولك' : 'Please log in'); return; }
//     setApplying(job.id);
//     try {
//       await api.post(`/jobs/${job.id}/apply`, {});
//       setIds(prev => new Set([...prev, job.id]));
//       toast.success(isAr ? 'تم التقديم بنجاح ✓' : 'Applied successfully ✓');
//     } catch (err) {
//       const msg = err.response?.data?.message || '';
//       if (msg.includes('تقدمت') || msg.includes('already')) setIds(prev => new Set([...prev, job.id]));
//       else if (err.response?.data?.upgradeRequired) toast.error(isAr ? 'ارقِ خطتك' : 'Please upgrade');
//       else toast.error(msg || (isAr ? 'فشل التقديم' : 'Apply failed'));
//     } finally { setApplying(null); }
//   };

//   const handleAutoApplied = (ids) => {
//     setIds(prev => new Set([...prev, ...ids]));
//     if (tab === 'applied') loadApplied(1, true);
//   };

//   // ✅ Enable/disable now hits the single source of truth: /auto-apply/settings
//   const toggleAutoApply = async () => {
//     if (!isPro) { toast.error(isAr ? 'Pro مطلوب' : 'Pro required'); return; }
//     if (!autoEnabled) { setConsent(true); return; }
//     try {
//       await api.post('/auto-apply/settings', { enabled: false });
//       setAutoEnabled(false);
//       updateUser({ autoApplyEnabled: false });
//       toast.success(isAr ? 'تم الإيقاف' : 'Auto-apply disabled');
//     } catch { toast.error(isAr ? 'فشل' : 'Failed'); }
//   };

//   const acceptConsent = async () => {
//     setConsent(false);
//     try {
//       // Fetch existing settings first so we don't wipe template/language choices
//       let existing = {};
//       try { const r = await api.get('/auto-apply/settings'); existing = r.data?.data || {}; } catch {}
//       await api.post('/auto-apply/settings', { ...existing, enabled: true });
//       await api.patch('/users/me', { openToWork: true });
//       setAutoEnabled(true);
//       updateUser({ autoApplyEnabled: true, openToWork: true });
//       toast.success(isAr ? 'تم تفعيل التقديم التلقائي ✓' : 'Auto-apply enabled ✓');
//     } catch { toast.error(isAr ? 'فشل التفعيل' : 'Enable failed'); }
//   };

//   const TABS = [
//     { k: 'matched', ar: 'وظائف مقترحة', en: 'AI Matches'      },
//     { k: 'browse',  ar: 'تصفح الكل',    en: 'Browse All'       },
//     { k: 'applied', ar: 'طلباتي',       en: 'My Applications'  },
//   ];

//   const totalAppPages = Math.ceil(appTotal / APP_LIMIT);
//   const curJobs       = tab === 'matched' ? jobs : browseJobs;

//   return (
//     <>
//       <style>{`
//         @keyframes spin  { to { transform: rotate(360deg); } }
//         @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
//         @keyframes glowPulse { 0%{opacity:.6} 100%{opacity:1} }
//         * { box-sizing: border-box; } body { margin: 0; }
//         ::-webkit-scrollbar { width: 4px; height: 4px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
//         @media(max-width:1023px) { .jb-layout{grid-template-columns:1fr!important} .jb-sidebar{display:none!important} .jb-main{padding-bottom:80px!important} }
//         @media(max-width:599px)  { .jb-grid{grid-template-columns:1fr!important} }
//       `}</style>

//       {showConsent && <ConsentModal isAr={isAr} font={font} onAccept={acceptConsent} onDecline={() => setConsent(false)} />}

//       <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
//         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//           <MobileTopBar title={isAr ? 'الوظائف' : 'Jobs'} />

//           <main className="jb-main" style={{ flex: 1, padding: 'clamp(12px,3vw,24px)', overflowY: 'auto' }}>
//             <div style={{ maxWidth: 1080, margin: '0 auto' }}>

//               {/* Header */}
//               <div style={{ marginBottom: 18 }}>
//                 <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 3px', letterSpacing: '-0.02em', fontFamily: font }}>{isAr ? 'الوظائف' : 'Jobs'}</h1>
//                 <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//                   {isAr ? 'وظائف مقترحة بالذكاء الاصطناعي · تقديم يدوي أو تلقائي' : 'AI-matched jobs · manual or auto-apply'}
//                 </p>
//               </div>

//               <div className="jb-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, alignItems: 'start' }}>

//                 {/* ════ LEFT ════ */}
//                 <div>
//                   {/* Tabs */}
//                   <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: 5, gap: 4, marginBottom: 16 }}>
//                     {TABS.map(t => (
//                       <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none', background: tab === t.k ? 'var(--text-primary)' : 'transparent', color: tab === t.k ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.k ? 700 : 500, fontFamily: font, transition: 'all .15s', whiteSpace: 'nowrap' }}>
//                         {isAr ? t.ar : t.en}
//                         {t.k === 'applied' && appTotal > 0 && (
//                           <span style={{ marginInlineStart: 5, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: tab === t.k ? 'rgba(255,255,255,.2)' : 'var(--bg-secondary)', color: tab === t.k ? 'var(--bg-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
//                             {appTotal}
//                           </span>
//                         )}
//                       </button>
//                     ))}
//                   </div>

//                   {/* Mobile auto-apply toggle */}
//                   {isPro && (
//                     <div className="jb-mobile-toggle" style={{ display: 'none', marginBottom: 14 }}>
//                       <style>{`.jb-mobile-toggle{display:none!important}@media(max-width:1023px){.jb-mobile-toggle{display:flex!important}}`}</style>
//                       <div onClick={toggleAutoApply} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 15px', borderRadius: 13, background: autoEnabled ? 'rgba(139,92,246,.08)' : 'var(--bg-primary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.25)' : 'var(--border)'}`, cursor: 'pointer', width: '100%', transition: 'all .2s' }}>
//                         <Bot size={16} color={autoEnabled ? '#8B5CF6' : 'var(--text-secondary)'} />
//                         <div style={{ flex: 1 }}>
//                           <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: font }}>{isAr ? 'التقديم التلقائي' : 'Auto-Apply'}</p>
//                           <p style={{ fontSize: 11, color: autoEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font }}>{autoEnabled ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Disabled')}</p>
//                         </div>
//                         <div style={{ width: 40, height: 22, borderRadius: 11, background: autoEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', flexShrink: 0 }}>
//                           <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: autoEnabled ? 21 : 3, transition: 'left .2s' }} />
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* ── Browse filters ── */}
//                   {tab === 'browse' && (
//                     <div style={{ marginBottom: 14 }}>
//                       <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
//                         <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', transition: 'border-color .2s' }}
//                           onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
//                           onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
//                           <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//                           <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'بحث...' : 'Search jobs...'} dir={isAr ? 'rtl' : 'ltr'}
//                             style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: font }} />
//                           {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={12} /></button>}
//                         </div>
//                         <button onClick={() => setShowFilter(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 13px', borderRadius: 11, border: `1.5px solid ${showFilter || type || remote ? 'var(--text-primary)' : 'var(--border)'}`, background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12.5, fontFamily: font, color: showFilter || type || remote ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all .15s' }}>
//                           <Filter size={12} /> {isAr ? 'فلترة' : 'Filter'}
//                           {(type || remote) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', display: 'inline-block' }} />}
//                         </button>
//                       </div>
//                       {showFilter && (
//                         <div style={{ padding: '12px 14px', borderRadius: 11, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 6 }}>
//                           <div>
//                             <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: font }}>{isAr ? 'النوع' : 'Type'}</p>
//                             <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
//                               {JOB_TYPES.map(t => (
//                                 <button key={t.key} onClick={() => setType(t.key)} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, border: `1.5px solid ${type === t.key ? 'var(--text-primary)' : 'var(--border)'}`, background: type === t.key ? 'var(--text-primary)' : 'transparent', color: type === t.key ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: font, transition: 'all .15s' }}>
//                                   {isAr ? t.ar : t.en}
//                                 </button>
//                               ))}
//                             </div>
//                           </div>
//                           <button onClick={() => setRemote(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, border: `1.5px solid ${remote ? 'var(--text-primary)' : 'var(--border)'}`, background: remote ? 'var(--bg-secondary)' : 'transparent', color: remote ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontFamily: font }}>
//                             <Wifi size={11} /> {isAr ? 'بُعد فقط' : 'Remote only'} {remote && <CheckCircle2 size={11} />}
//                           </button>
//                           {(type || remote) && (
//                             <button onClick={() => { setType(''); setRemote(false); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: font }}>
//                               <X size={11} /> {isAr ? 'مسح' : 'Clear'}
//                             </button>
//                           )}
//                         </div>
//                       )}
//                       {!loading && <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '6px 0 0', fontFamily: font }}>{total.toLocaleString()} {isAr ? 'وظيفة' : 'jobs'}</p>}
//                     </div>
//                   )}

//                   {/* ══════════════════════════════════════
//                       CONTENT
//                   ══════════════════════════════════════ */}

//                   {/* ── My Applications tab ── */}
//                   {tab === 'applied' && (
//                     <>
//                       {/* Search + Status filter row */}
//                       <div style={{ marginBottom: 14 }}>
//                         <div style={{ display: 'flex', gap: 8, marginBottom: 9, flexWrap: 'wrap' }}>

//                           {/* Search */}
//                           <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', transition: 'border-color .2s' }}
//                             onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
//                             onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
//                             <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//                             <input
//                               value={appSearch} onChange={e => setAppSearch(e.target.value)}
//                               placeholder={isAr ? 'ابحث في طلباتك...' : 'Search applications...'}
//                               style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: font }}
//                             />
//                             {appSearch && (
//                               <button onClick={() => setAppSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
//                                 <X size={12} />
//                               </button>
//                             )}
//                           </div>

//                           {/* Status select */}
//                           <select
//                             value={appStatus} onChange={e => { setAppStatus(e.target.value); }}
//                             style={{ padding: '9px 13px', borderRadius: 11, border: `1.5px solid ${appStatus ? 'var(--text-primary)' : 'var(--border)'}`, background: 'var(--bg-primary)', color: appStatus ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontFamily: font, outline: 'none', cursor: 'pointer', minWidth: 130 }}
//                           >
//                             <option value="">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
//                             {Object.entries(STATUS_MAP).map(([key, val]) => (
//                               <option key={key} value={key}>{isAr ? val.ar : val.en}</option>
//                             ))}
//                           </select>

//                           {/* Clear */}
//                           {(appSearch || appStatus) && (
//                             <button
//                               onClick={() => { setAppSearch(''); setAppStatus(''); }}
//                               style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', borderRadius: 11, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.05)', color: '#EF4444', cursor: 'pointer', fontSize: 12.5, fontFamily: font, whiteSpace: 'nowrap' }}>
//                               <X size={11} /> {isAr ? 'مسح' : 'Clear'}
//                             </button>
//                           )}
//                         </div>

//                         {/* Result count */}
//                         {!loading && (
//                           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//                             {appTotal.toLocaleString()} {isAr ? 'طلب' : 'applications'}
//                             {appTotal > APP_LIMIT && (
//                               <span style={{ marginInlineStart: 8, opacity: 0.6 }}>
//                                 · {isAr ? `صفحة ${appPage} من ${totalAppPages}` : `Page ${appPage} of ${totalAppPages}`}
//                               </span>
//                             )}
//                           </p>
//                         )}
//                       </div>

//                       {/* List or states */}
//                       {loading ? (
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                           {[...Array(4)].map((_, i) => (
//                             <div key={i} style={{ height: 62, borderRadius: 13, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
//                           ))}
//                         </div>
//                       ) : appliedJobs.length === 0 ? (
//                         <Empty
//                           icon={<Send size={40} />}
//                           title={appSearch || appStatus ? (isAr ? 'لا توجد نتائج' : 'No results') : (isAr ? 'لم تتقدم بعد' : 'No applications yet')}
//                           desc={appSearch || appStatus ? (isAr ? 'جرّب تغيير الفلاتر' : 'Try changing your filters') : (isAr ? 'تصفح الوظائف وتقدم الآن' : 'Browse jobs and start applying')}
//                           isAr={isAr} font={font}
//                           action={!(appSearch || appStatus) && (
//                             <button onClick={() => setTab('browse')} style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
//                               {isAr ? 'تصفح الوظائف' : 'Browse Jobs'}
//                             </button>
//                           )}
//                         />
//                       ) : (
//                         <>
//                           <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                             {appliedJobs.map(app => (
//                               <AppRow key={app.id} app={app} isAr={isAr} font={font} />
//                             ))}
//                           </div>

//                           {/* Pagination */}
//                           {totalAppPages > 1 && (
//                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 20 }}>
//                               {/* Prev */}
//                               <button
//                                 onClick={() => loadApplied(appPage - 1, true)}
//                                 disabled={appPage <= 1}
//                                 style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: appPage <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appPage <= 1 ? .3 : 1, transition: 'opacity .15s' }}
//                               >
//                                 {isAr ? <ChevronRight size={14} color="var(--text-secondary)" /> : <ChevronLeft size={14} color="var(--text-secondary)" />}
//                               </button>

//                               {/* Page numbers */}
//                               {Array.from({ length: Math.min(totalAppPages, 5) }, (_, i) => {
//                                 const p = totalAppPages <= 5
//                                   ? i + 1
//                                   : Math.max(1, Math.min(appPage - 2, totalAppPages - 4)) + i;
//                                 return (
//                                   <button key={p} onClick={() => loadApplied(p, true)} style={{ minWidth: 34, height: 34, borderRadius: 9, border: `1px solid ${p === appPage ? 'transparent' : 'var(--border)'}`, background: p === appPage ? 'var(--text-primary)' : 'var(--bg-primary)', color: p === appPage ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: p === appPage ? 700 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-en)', transition: 'all .12s' }}>
//                                     {p}
//                                   </button>
//                                 );
//                               })}

//                               {/* Next */}
//                               <button
//                                 onClick={() => loadApplied(appPage + 1, true)}
//                                 disabled={appPage >= totalAppPages}
//                                 style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: appPage >= totalAppPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appPage >= totalAppPages ? .3 : 1, transition: 'opacity .15s' }}
//                               >
//                                 {isAr ? <ChevronLeft size={14} color="var(--text-secondary)" /> : <ChevronRight size={14} color="var(--text-secondary)" />}
//                               </button>
//                             </div>
//                           )}
//                         </>
//                       )}
//                     </>
//                   )}

//                   {/* ── Matched + Browse tabs ── */}
//                   {tab !== 'applied' && (
//                     loading ? (
//                       <div className="jb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                         {[...Array(6)].map((_, i) => <Skel key={i} />)}
//                       </div>
//                     ) : curJobs.length === 0 ? (
//                       <Empty
//                         icon={<Briefcase size={40} />}
//                         title={isAr ? 'لا توجد وظائف' : 'No jobs found'}
//                         desc={isAr ? 'أكمل ملفك للحصول على اقتراحات مخصصة' : 'Complete your profile to get AI-matched jobs'}
//                         isAr={isAr} font={font}
//                         action={<Link to="/profile" style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>{isAr ? 'أكمل ملفك' : 'Complete Profile'}</Link>}
//                       />
//                     ) : (
//                       <>
//                         <div className="jb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                           {curJobs.map(job => (
//                             <JobCard key={job.id} job={job} isAr={isAr} font={font} onApply={handleApply} applied={appliedIds.has(job.id)} applying={applying} isPro={isPro} />
//                           ))}
//                         </div>
//                         {tab === 'browse' && page < Math.ceil(total / LIMIT) && (
//                           <div style={{ textAlign: 'center', marginTop: 16 }}>
//                             <button onClick={() => loadBrowse(page + 1)} style={{ padding: '10px 22px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, display: 'inline-flex', alignItems: 'center', gap: 6 }}
//                               onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//                               onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//                               <ChevronRight size={13} /> {isAr ? 'تحميل المزيد' : 'Load more'}
//                             </button>
//                           </div>
//                         )}
//                       </>
//                     )
//                   )}
//                 </div>

//                 {/* ════ RIGHT SIDEBAR ════ */}
//                 <div className="jb-sidebar" style={{ position: 'sticky', top: 20 }}>
//                   <AutoApplyPanel isAr={isAr} font={font} user={user} onApplied={handleAutoApplied} autoEnabled={autoEnabled} onToggle={toggleAutoApply} />

//                   {/* Stats card */}
//                   {appliedJobs.length > 0 && (
//                     <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
//                       <p style={{ fontSize: 12.5, fontWeight: 700, fontFamily: font, margin: '0 0 11px' }}>{isAr ? 'إحصائياتي' : 'My Stats'}</p>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
//                         {[
//                           { label: isAr ? 'إجمالي'   : 'Total',      val: appTotal },
//                           { label: isAr ? 'نشط'       : 'Active',     val: appliedJobs.filter(a => !['rejected', 'accepted'].includes(a.status)).length },
//                           { label: isAr ? 'مقابلات'  : 'Interviews', val: appliedJobs.filter(a => a.status === 'interview').length },
//                           { label: isAr ? 'تلقائي'   : 'Auto',       val: appliedJobs.filter(a => a.isAutoApplied).length },
//                         ].map((s, i) => (
//                           <div key={i} style={{ padding: '10px', borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }}>
//                             <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{s.val}</div>
//                             <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font, marginTop: 2 }}>{s.label}</div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>

//       <MobileBottomNav />
//     </>
//   );
// }

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Clock, Sparkles, Send,
  CheckCircle2, Building2, Banknote, Wifi, ArrowUpRight,
  X, Filter, RefreshCw, Bot, ChevronRight, ChevronLeft,
  BarChart2, Info, Zap, AlertTriangle,
  Shield, Briefcase, Users,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';
const matchBg    = s => s >= 80 ? 'rgba(34,197,94,.1)' : s >= 60 ? 'rgba(245,158,11,.1)' : s >= 40 ? 'rgba(59,130,246,.1)' : 'rgba(113,113,122,.1)';
const matchLabel = (s, ar) => s >= 80 ? (ar ? 'ممتاز' : 'Excellent') : s >= 60 ? (ar ? 'جيد' : 'Good') : s >= 40 ? (ar ? 'معقول' : 'Fair') : (ar ? 'منخفض' : 'Low');

const fmtSalary = (min, max, cur = 'USD') => {
  if (!min && !max) return null;
  const f = n => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
  if (min && max) return `${f(min)}–${f(max)} ${cur}`;
  return min ? `${f(min)}+ ${cur}` : `Up to ${f(max)} ${cur}`;
};

const timeAgo = (d, ar) => {
  const x = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (x === 0) return ar ? 'اليوم' : 'Today';
  if (x === 1) return ar ? 'أمس'   : '1d ago';
  if (x < 7)   return ar ? `${x}د` : `${x}d ago`;
  if (x < 30)  return ar ? `${Math.floor(x / 7)}أ` : `${Math.floor(x / 7)}w ago`;
  return ar ? `${Math.floor(x / 30)}ش` : `${Math.floor(x / 30)}mo`;
};

const JOB_TYPES = [
  { key: '',           ar: 'الكل',     en: 'All'       },
  { key: 'full_time',  ar: 'كامل',     en: 'Full-time' },
  { key: 'part_time',  ar: 'جزئي',     en: 'Part-time' },
  { key: 'freelance',  ar: 'فريلانس',  en: 'Freelance' },
  { key: 'internship', ar: 'تدريب',    en: 'Intern'    },
  { key: 'remote',     ar: 'بُعد',     en: 'Remote'    },
];

const STATUS_MAP = {
  sent:        { ar: 'مُرسَل',    en: 'Sent',        c: '#6B7280', bg: 'rgba(107,114,128,.12)' },
  viewed:      { ar: 'شوهد',       en: 'Viewed',      c: '#3B82F6', bg: 'rgba(59,130,246,.12)'  },
  shortlisted: { ar: 'مختصر',      en: 'Shortlisted', c: '#8B5CF6', bg: 'rgba(139,92,246,.12)'  },
  interview:   { ar: 'مقابلة',     en: 'Interview',   c: '#F59E0B', bg: 'rgba(245,158,11,.12)'  },
  accepted:    { ar: 'مقبول ✓',   en: 'Accepted ✓',  c: '#22C55E', bg: 'rgba(34,197,94,.12)'   },
  rejected:    { ar: 'مرفوض',      en: 'Rejected',    c: '#EF4444', bg: 'rgba(239,68,68,.12)'   },
};

/* ═══════════════════════════════════════════════════════════
   CONSENT MODAL
═══════════════════════════════════════════════════════════ */
function ConsentModal({ isAr, font, onAccept, onDecline }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 20, border: '1px solid var(--border)', padding: '28px 26px', maxWidth: 430, width: '100%', direction: isAr ? 'rtl' : 'ltr', fontFamily: font }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(139,92,246,.12)', border: '1px solid rgba(139,92,246,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
          <Shield size={23} color="#8B5CF6" strokeWidth={1.8} />
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          {isAr ? 'تفعيل التقديم التلقائي' : 'Enable AI Auto-Apply'}
        </h2>
        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 18px', lineHeight: 1.7 }}>
          {isAr
            ? 'بتفعيل هذه الميزة، أنت توافق على أن TalexHub سيُرسل سيرتك الذاتية تلقائياً للشركات المناسبة ضمن الحدود المحددة من قِبل المشرف.'
            : 'By enabling this, you agree TalexHub will automatically send your CV to matching companies within the limits set by the admin.'}
        </p>
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
          {[
            { i: '🎯', ar: 'يتقدم فقط للوظائف المتوافقة حسب معايير المشرف',  en: 'Only applies to jobs meeting the admin-set match score'   },
            { i: '✉️', ar: 'AI يكتب خطاب تقديم مخصص لكل وظيفة',             en: 'AI writes a personalized cover letter per job'  },
            { i: '📅', ar: 'الحد اليومي والشهري يُحدد من قِبل المشرف',       en: 'Daily and monthly limits are set by the admin'  },
            { i: '⏹️', ar: 'يمكنك إيقاف التقديم التلقائي في أي وقت',        en: 'You can disable auto-apply anytime'             },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 12.5, color: 'var(--text-secondary)', padding: '5px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ flexShrink: 0 }}>{f.i}</span>
              <span>{isAr ? f.ar : f.en}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onDecline} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: font }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={onAccept} style={{ flex: 2, padding: '11px', borderRadius: 11, border: 'none', background: '#8B5CF6', color: 'white', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <Bot size={15} /> {isAr ? 'أوافق وأفعّل' : 'Accept & Enable'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   JOB CARD
═══════════════════════════════════════════════════════════ */
function JobCard({ job, isAr, font, onApply, applied, applying, isPro }) {
  const salary   = fmtSalary(job.salary_min || job.salaryMin, job.salary_max || job.salaryMax, job.salaryCurrency);
  const score    = job.matchScore != null ? Math.round(job.matchScore) : null;
  const title    = isAr && job.titleAr ? job.titleAr : job.title;
  const isActive = applying === job.id;
  const showScore = isPro && score != null;

  return (
    <div
      style={{ background: 'var(--bg-primary)', border: `1.5px solid ${showScore && score >= 80 ? 'rgba(34,197,94,.22)' : 'var(--border)'}`, borderRadius: 16, padding: '16px 16px 14px', position: 'relative', transition: 'transform .2s,box-shadow .2s,border-color .2s', display: 'flex', flexDirection: 'column', gap: 12 }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {showScore && (
        <div style={{ position: 'absolute', top: 13, insetInlineEnd: 13, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: matchBg(score), border: `1px solid ${matchColor(score)}30` }}>
          <Sparkles size={10} color={matchColor(score)} />
          <span style={{ fontSize: 11, fontWeight: 700, color: matchColor(score) }}>{score}% {matchLabel(score, isAr)}</span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, paddingInlineEnd: showScore ? 100 : 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {job.company?.logoUrl
            ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
            : <Building2 size={17} color="var(--text-secondary)" strokeWidth={1.5} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font }}>{title}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{job.company?.name}</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
        {job.locationCity && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
            <MapPin size={9} /> {job.locationCity}
          </span>
        )}
        {(job.is_remote || job.isRemote) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: '#22C55E', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', padding: '3px 8px', borderRadius: 99 }}>
            <Wifi size={9} /> {isAr ? 'بُعد' : 'Remote'}
          </span>
        )}
        {job.jobType && (
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
            {job.jobType.replace(/_/g, '-')}
          </span>
        )}
        {salary && job.salaryVisible !== false && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '3px 8px', borderRadius: 99 }}>
            <Banknote size={9} /> {salary}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} /> {timeAgo(job.created_at || job.createdAt, isAr)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
            <Users size={10} /> {job.applicationsCount || 0}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          <Link to={`/dashboard/jobs/${job.id}`}
            style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, padding: '6px 10px', borderRadius: 8, border: '1px solid transparent', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            {isAr ? 'تفاصيل' : 'Details'} <ArrowUpRight size={11} />
          </Link>
          {applied ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#22C55E', padding: '7px 13px', borderRadius: 9, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.22)' }}>
              <CheckCircle2 size={12} /> {isAr ? 'تم التقديم' : 'Applied'}
            </span>
          ) : (
            <button onClick={() => onApply(job)} disabled={isActive}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: isActive ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: font, opacity: isActive ? .7 : 1, transition: 'opacity .2s' }}>
              {isActive ? <RefreshCw size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <Send size={11} strokeWidth={2} />}
              {isAr ? 'تقدّم' : 'Apply'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AUTO-APPLY PANEL — unified with /auto-apply/* (same backend
   as the CV → Auto-Apply tab). NO localStorage anywhere —
   all state (enabled, template, language, stats) is fetched
   fresh from the server on every mount.
═══════════════════════════════════════════════════════════ */
function AutoApplyPanel({ isAr, font, user, onApplied, autoEnabled, onToggle }) {
  const isPro = ['pro', 'elite'].includes(user?.planKey);
  const [stats,    setStats]    = useState(null);
  const [settings, setSettings] = useState(null);
  const [running,  setRunning]  = useState(false);
  const [showInfo, setInfo]     = useState(false);

  useEffect(() => {
    if (!isPro) return;
    api.get('/auto-apply/stats').then(r => setStats(r.data.data)).catch(() => {});
    api.get('/auto-apply/settings').then(r => setSettings(r.data.data)).catch(() => {});
  }, [isPro, autoEnabled]);

  const dailyReached   = stats && stats.dailyLimit   > 0 && stats.usedToday     >= stats.dailyLimit;
  const monthlyReached = stats && stats.monthlyLimit > 0 && stats.usedThisMonth >= stats.monthlyLimit;
  const limitReached   = dailyReached || monthlyReached;

  const run = async () => {
    if (!autoEnabled) { toast.error(isAr ? 'فعّل التقديم التلقائي أولاً' : 'Enable auto-apply first'); return; }
    if (limitReached)  { toast.error(dailyReached ? (isAr ? 'وصلت للحد اليومي' : 'Daily limit reached') : (isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached')); return; }
    setRunning(true);
    try {
      const { data } = await api.post('/auto-apply/run', { maxBatch: 5 });
      const r = data.data;
      if (r.reason === 'plan_insufficient')          toast.error(isAr ? 'Pro مطلوب' : 'Pro required');
      else if (r.reason === 'monthly_limit_reached')  toast.error(isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached');
      else if (r.reason === 'daily_limit_reached')    toast.error(isAr ? 'وصلت للحد اليومي' : 'Daily limit reached');
      else if (r.reason === 'no_cv')                  toast.error(isAr ? 'ارفع سيرتك أولاً' : 'Upload CV first');
      else if (r.applied?.length > 0) {
        toast.success(isAr ? `🤖 تم التقديم تلقائياً على ${r.applied.length} وظيفة` : `🤖 Auto-applied to ${r.applied.length} jobs`);
        onApplied(r.applied.map(a => a.jobId));
      } else {
        toast.success(isAr ? 'لا توجد وظائف مناسبة حالياً' : 'No matching jobs found right now');
      }
      api.get('/auto-apply/stats').then(x => setStats(x.data.data)).catch(() => {});
    } catch (e) {
      toast.error(e.response?.data?.message || (isAr ? 'فشل' : 'Failed'));
    } finally { setRunning(false); }
  };

  if (!isPro) return (
    <div style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={16} color="var(--text-secondary)" strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font, display: 'flex', alignItems: 'center', gap: 6 }}>
            {isAr ? 'التقديم التلقائي' : 'AI Auto-Apply'}
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.3)', color: '#F59E0B' }}>PRO</span>
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>{isAr ? 'حصري للمشتركين Pro' : 'Pro subscribers only'}</p>
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.65, fontFamily: font }}>
        {isAr ? 'دع AI يتقدم نيابةً عنك على أفضل الوظائف المتوافقة مع خطاب تقديم مخصص.' : 'Let AI apply on your behalf to the best matching jobs with a personalized cover letter.'}
      </p>
      <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>
        <Zap size={13} /> {isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
      </Link>
    </div>
  );

  const dayPct = stats ? Math.min((stats.usedToday / stats.dailyLimit) * 100, 100) : 0;
  const monPct = stats ? Math.min((stats.usedThisMonth / stats.monthlyLimit) * 100, 100) : 0;

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: autoEnabled ? 'rgba(139,92,246,.12)' : 'var(--bg-secondary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .2s' }}>
          <Bot size={16} color={autoEnabled ? '#8B5CF6' : 'var(--text-primary)'} strokeWidth={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, fontFamily: font }}>{isAr ? 'التقديم التلقائي' : 'AI Auto-Apply'}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
            {settings?.template ? (isAr ? `قالب: ${settings.template}` : `Template: ${settings.template}`) : (isAr ? 'AI يبحث ويتقدم تلقائياً' : 'AI finds & applies automatically')}
          </p>
        </div>
        <button onClick={() => setInfo(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
          <Info size={14} />
        </button>
      </div>

      <div onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 11, background: autoEnabled ? 'rgba(139,92,246,.07)' : 'var(--bg-secondary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.25)' : 'var(--border)'}`, cursor: 'pointer', marginBottom: 12, transition: 'all .2s' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1px', fontFamily: font }}>{isAr ? 'التشغيل التلقائي' : 'Auto-run'}</p>
          <p style={{ fontSize: 11, color: autoEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font }}>
            {autoEnabled ? (isAr ? '✓ نشط' : '✓ Active') : (isAr ? 'غير نشط' : 'Disabled')}
          </p>
        </div>
        <div style={{ width: 42, height: 23, borderRadius: 12, background: autoEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
          <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: autoEnabled ? 22 : 3, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
        </div>
      </div>

      {showInfo && (
        <div style={{ padding: '11px 13px', borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.65, fontFamily: font }}>
          {isAr
            ? 'يتقدم AI على الوظائف المتوافقة حسب معايير المشرف، مع خطاب مخصص. لتغيير القالب أو لغة الخطاب، افتحي إعدادات التقديم التلقائي في صفحة السيرة الذاتية.'
            : 'AI applies to matching jobs per admin-set criteria, with a custom cover letter. To change the CV template or cover letter language, open Auto-Apply settings on the CV page.'}
          <div style={{ marginTop: 8 }}>
            <Link to="/dashboard/cv" style={{ fontSize: 11.5, color: '#8B5CF6', fontWeight: 700, textDecoration: 'none' }}>
              {isAr ? 'فتح إعدادات السيرة الذاتية →' : 'Open CV settings →'}
            </Link>
          </div>
        </div>
      )}

      {stats && (
        <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: isAr ? 'اليوم' : 'Today', used: stats.usedToday,     limit: stats.dailyLimit,   pct: dayPct, atLimit: dailyReached   },
            { label: isAr ? 'الشهر' : 'Month', used: stats.usedThisMonth, limit: stats.monthlyLimit, pct: monPct, atLimit: monthlyReached },
          ].map((b, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>{b.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: b.atLimit ? '#EF4444' : 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{b.used}/{b.limit}</span>
              </div>
              <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${b.pct}%`, background: b.atLimit ? '#EF4444' : '#8B5CF6', borderRadius: 99, transition: 'width .5s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {limitReached && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 9, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', marginBottom: 12 }}>
          <AlertTriangle size={13} color="#EF4444" />
          <p style={{ flex: 1, margin: 0, fontSize: 11.5, fontWeight: 600, color: '#EF4444', fontFamily: font }}>
            {dailyReached ? (isAr ? 'وصلت للحد اليومي — حاولي غداً' : 'Daily limit reached — try tomorrow') : (isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached')}
          </p>
        </div>
      )}

      <button onClick={run} disabled={running || !autoEnabled || limitReached}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px', borderRadius: 9, border: 'none', background: (limitReached || !autoEnabled) ? 'var(--bg-secondary)' : '#8B5CF6', color: (limitReached || !autoEnabled) ? 'var(--text-secondary)' : 'white', cursor: (running || !autoEnabled || limitReached) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font, transition: 'opacity .15s' }}
        onMouseEnter={e => { if (!running && autoEnabled && !limitReached) e.currentTarget.style.opacity = '.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
        {running
          ? <><RefreshCw size={13} style={{ animation: 'spin .8s linear infinite' }} /> {isAr ? 'جارٍ...' : 'Running...'}</>
          : limitReached
          ? <>{dailyReached ? (isAr ? 'الحد اليومي ممتلئ' : 'Daily limit full') : (isAr ? 'الحد الشهري ممتلئ' : 'Monthly limit full')}</>
          : <><Bot size={13} /> {isAr ? 'تشغيل الآن' : 'Run Now'}</>}
      </button>

      {autoEnabled && !limitReached && (
        <p style={{ fontSize: 10.5, color: '#8B5CF6', margin: '8px 0 0', textAlign: 'center', fontFamily: font }}>
          {isAr ? '⚡ تعمل تلقائياً وفق جدولة الخادم' : '⚡ Runs automatically on the server schedule'}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   APPLICATION ROW
═══════════════════════════════════════════════════════════ */
function AppRow({ app, isAr, font }) {
  const job   = app.job || {};
  const s     = STATUS_MAP[app.status] || STATUS_MAP.sent;
  const title = isAr && job.titleAr ? job.titleAr : job.title;
  return (
    <div
      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, transition: 'border-color .15s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-secondary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {job.company?.logoUrl
          ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          : <Building2 size={14} color="var(--text-secondary)" strokeWidth={1.5} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font, color: 'var(--text-primary)' }}>{title || '—'}</p>
        <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>{job.company?.name}</span>
          {app.isAutoApplied && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, color: '#8B5CF6', background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.2)', padding: '1px 6px', borderRadius: 99 }}>
              <Bot size={9} /> {isAr ? 'تلقائي' : 'Auto'}
            </span>
          )}
        </div>
      </div>
      {app.matchScore != null && (
        <span style={{ fontSize: 12, fontWeight: 700, color: matchColor(app.matchScore), fontFamily: 'var(--font-en)', flexShrink: 0 }}>
          {Math.round(app.matchScore)}%
        </span>
      )}
      <span style={{ padding: '4px 11px', borderRadius: 99, fontSize: 11.5, fontWeight: 700, background: s.bg, color: s.c, flexShrink: 0, fontFamily: font, whiteSpace: 'nowrap' }}>
        {isAr ? s.ar : s.en}
      </span>
      <Link to={`/dashboard/jobs/${app.jobId || app.job_id}`}
        style={{ fontSize: 11, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0, padding: '4px 8px', borderRadius: 7, border: '1px solid transparent', transition: 'all .15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        <ArrowUpRight size={11} />
      </Link>
    </div>
  );
}

/* ─── Empty state ─── */
const Empty = ({ icon, title, desc, action, isAr, font }) => (
  <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-secondary)' }}>
    <div style={{ opacity: .15, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px', fontFamily: font }}>{title}</p>
    <p style={{ fontSize: 12.5, margin: '0 0 16px', fontFamily: font }}>{desc}</p>
    {action}
  </div>
);

/* ─── Skeleton ─── */
const Skel = () => (
  <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', height: 160, animation: 'glowPulse 1.5s ease-in-out infinite' }} />
);

/* ═══════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function UserJobsPage() {
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const { user, updateUser } = useAuthStore();
  const isPro = ['pro', 'elite'].includes(user?.planKey);
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Free users start on browse — matched tab only for Pro
  const [tab,        setTab]      = useState(isPro ? 'matched' : 'browse');
  const [jobs,       setJobs]     = useState([]);
  const [browseJobs, setBrowse]   = useState([]);
  const [appliedJobs,setApplied]  = useState([]);
  const [loading,    setLoading]  = useState(true);
  const [applying,   setApplying] = useState(null);
  const [appliedIds, setIds]      = useState(new Set());

  // ✅ No localStorage — autoEnabled comes straight from the user record
  const [autoEnabled, setAutoEnabled] = useState(user?.autoApplyEnabled ?? false);
  const [showConsent, setConsent] = useState(false);

  // ── Browse filters ──────────────────────────────────────
  const [q,          setQ]         = useState('');
  const [type,       setType]      = useState('');
  const [remote,     setRemote]    = useState(false);
  const [page,       setPage]      = useState(1);
  const [total,      setTotal]     = useState(0);
  const [showFilter, setShowFilter] = useState(false);

  // ── Applications filters + pagination ──────────────────
  const [appSearch,  setAppSearch] = useState('');
  const [appStatus,  setAppStatus] = useState('');
  const [appPage,    setAppPage]   = useState(1);
  const [appTotal,   setAppTotal]  = useState(0);
  const APP_LIMIT = 10;

  const LIMIT = 12;
  const timer    = useRef(null);
  const appTimer = useRef(null);

  // ✅ Keep autoEnabled in sync with the user object whenever it changes
  useEffect(() => {
    if (user?.autoApplyEnabled !== undefined) {
      setAutoEnabled(user.autoApplyEnabled);
    }
  }, [user?.autoApplyEnabled]);

  // ── Loaders ─────────────────────────────────────────────
  const loadMatched = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/jobs', { params: { sort: 'matched', limit: 20 } });
      setJobs(data.data || []);
    } catch { setJobs([]); } finally { setLoading(false); }
  }, []);

  const loadBrowse = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: LIMIT, sort: 'newest' };
      if (q)      params.q      = q;
      if (type)   params.type   = type;
      if (remote) params.remote = 'true';
      const { data } = await api.get('/jobs', { params });
      const items = data.data || [];
      setBrowse(pg === 1 ? items : prev => [...prev, ...items]);
      setTotal(data.pagination?.total || items.length);
      setPage(pg);
    } catch { if (pg === 1) setBrowse([]); } finally { setLoading(false); }
  }, [q, type, remote]);

  const loadApplied = useCallback(async (pg = 1, reset = true) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: APP_LIMIT };
      if (appSearch) params.q      = appSearch;
      if (appStatus) params.status = appStatus;
      const { data } = await api.get('/applications/me', { params });
      const apps = data.data?.rows || data.data || [];
      setApplied(prev => reset ? apps : [...prev, ...apps]);
      setAppTotal(data.pagination?.total || data.data?.count || apps.length);
      setAppPage(pg);
      setIds(prev => new Set([...prev, ...apps.map(a => a.jobId || a.job_id).filter(Boolean)]));
    } catch { if (reset) setApplied([]); }
    finally { setLoading(false); }
  }, [appSearch, appStatus]);

  // Fetch applied IDs once on mount (for "Applied" badges on cards)
  useEffect(() => {
    api.get('/applications/me', { params: { limit: 200, fields: 'jobId' } })
      .then(r => {
        const apps = r.data?.data?.rows || r.data?.data || [];
        setIds(new Set(apps.map(a => a.jobId || a.job_id).filter(Boolean)));
      }).catch(() => {});
  }, []);

  // Tab switch
  useEffect(() => {
    if (tab === 'matched') loadMatched();
    if (tab === 'browse')  { setPage(1); setBrowse([]); }
    if (tab === 'applied') { setAppPage(1); loadApplied(1, true); }
  }, [tab]);

  // Browse debounce
  useEffect(() => {
    if (tab !== 'browse') return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { setPage(1); loadBrowse(1); }, q ? 400 : 0);
    return () => clearTimeout(timer.current);
  }, [q, type, remote, tab]);

  // Applications search/filter debounce
  useEffect(() => {
    if (tab !== 'applied') return;
    clearTimeout(appTimer.current);
    appTimer.current = setTimeout(() => loadApplied(1, true), appSearch ? 400 : 0);
    return () => clearTimeout(appTimer.current);
  }, [appSearch, appStatus, tab]);

  const handleApply = async (job) => {
    if (!user) { toast.error(isAr ? 'سجّل دخولك' : 'Please log in'); return; }
    setApplying(job.id);
    try {
      await api.post(`/jobs/${job.id}/apply`, {});
      setIds(prev => new Set([...prev, job.id]));
      toast.success(isAr ? 'تم التقديم بنجاح ✓' : 'Applied successfully ✓');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('تقدمت') || msg.includes('already')) setIds(prev => new Set([...prev, job.id]));
      else if (err.response?.data?.upgradeRequired) toast.error(isAr ? 'ارقِ خطتك' : 'Please upgrade');
      else toast.error(msg || (isAr ? 'فشل التقديم' : 'Apply failed'));
    } finally { setApplying(null); }
  };

  const handleAutoApplied = (ids) => {
    setIds(prev => new Set([...prev, ...ids]));
    if (tab === 'applied') loadApplied(1, true);
  };

  // ✅ Enable/disable now hits the single source of truth: /auto-apply/settings
  const toggleAutoApply = async () => {
    if (!isPro) { toast.error(isAr ? 'Pro مطلوب' : 'Pro required'); return; }
    if (!autoEnabled) { setConsent(true); return; }
    try {
      await api.post('/auto-apply/settings', { enabled: false });
      setAutoEnabled(false);
      updateUser({ autoApplyEnabled: false });
      toast.success(isAr ? 'تم الإيقاف' : 'Auto-apply disabled');
    } catch { toast.error(isAr ? 'فشل' : 'Failed'); }
  };

  const acceptConsent = async () => {
    setConsent(false);
    try {
      // Fetch existing settings first so we don't wipe template/language choices
      let existing = {};
      try { const r = await api.get('/auto-apply/settings'); existing = r.data?.data || {}; } catch {}
      await api.post('/auto-apply/settings', { ...existing, enabled: true });
      await api.patch('/users/me', { openToWork: true });
      setAutoEnabled(true);
      updateUser({ autoApplyEnabled: true, openToWork: true });
      toast.success(isAr ? 'تم تفعيل التقديم التلقائي ✓' : 'Auto-apply enabled ✓');
    } catch { toast.error(isAr ? 'فشل التفعيل' : 'Enable failed'); }
  };

  // ✅ AI Matches tab only for Pro/Elite
  const TABS = [
    ...(isPro ? [{ k: 'matched', ar: 'وظائف مقترحة', en: 'AI Matches' }] : []),
    { k: 'browse',  ar: 'تصفح الكل',    en: 'Browse All'       },
    { k: 'applied', ar: 'طلباتي',       en: 'My Applications'  },
  ];

  const totalAppPages = Math.ceil(appTotal / APP_LIMIT);
  const curJobs       = tab === 'matched' ? jobs : browseJobs;

  return (
    <>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes glowPulse { 0%{opacity:.6} 100%{opacity:1} }
        * { box-sizing: border-box; } body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        @media(max-width:1023px) { .jb-layout{grid-template-columns:1fr!important} .jb-sidebar{display:none!important} .jb-main{padding-bottom:80px!important} }
        @media(max-width:599px)  { .jb-grid{grid-template-columns:1fr!important} }
      `}</style>

      {showConsent && <ConsentModal isAr={isAr} font={font} onAccept={acceptConsent} onDecline={() => setConsent(false)} />}

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <MobileTopBar title={isAr ? 'الوظائف' : 'Jobs'} />

          <main className="jb-main" style={{ flex: 1, padding: 'clamp(12px,3vw,24px)', overflowY: 'auto' }}>
            <div style={{ maxWidth: 1080, margin: '0 auto' }}>

              {/* Header */}
              <div style={{ marginBottom: 18 }}>
                <h1 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 3px', letterSpacing: '-0.02em', fontFamily: font }}>{isAr ? 'الوظائف' : 'Jobs'}</h1>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                  {isAr ? 'وظائف مقترحة بالذكاء الاصطناعي · تقديم يدوي أو تلقائي' : 'AI-matched jobs · manual or auto-apply'}
                </p>
              </div>

              <div className="jb-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, alignItems: 'start' }}>

                {/* ════ LEFT ════ */}
                <div>
                  {/* Tabs */}
                  <div style={{ display: 'flex', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: 5, gap: 4, marginBottom: 16 }}>
                    {TABS.map(t => (
                      <button key={t.k} onClick={() => setTab(t.k)} style={{ flex: 1, padding: '8px 10px', borderRadius: 9, border: 'none', background: tab === t.k ? 'var(--text-primary)' : 'transparent', color: tab === t.k ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: tab === t.k ? 700 : 500, fontFamily: font, transition: 'all .15s', whiteSpace: 'nowrap' }}>
                        {isAr ? t.ar : t.en}
                        {t.k === 'applied' && appTotal > 0 && (
                          <span style={{ marginInlineStart: 5, fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 99, background: tab === t.k ? 'rgba(255,255,255,.2)' : 'var(--bg-secondary)', color: tab === t.k ? 'var(--bg-primary)' : 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                            {appTotal}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Mobile auto-apply toggle */}
                  {isPro && (
                    <div className="jb-mobile-toggle" style={{ display: 'none', marginBottom: 14 }}>
                      <style>{`.jb-mobile-toggle{display:none!important}@media(max-width:1023px){.jb-mobile-toggle{display:flex!important}}`}</style>
                      <div onClick={toggleAutoApply} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 15px', borderRadius: 13, background: autoEnabled ? 'rgba(139,92,246,.08)' : 'var(--bg-primary)', border: `1px solid ${autoEnabled ? 'rgba(139,92,246,.25)' : 'var(--border)'}`, cursor: 'pointer', width: '100%', transition: 'all .2s' }}>
                        <Bot size={16} color={autoEnabled ? '#8B5CF6' : 'var(--text-secondary)'} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontFamily: font }}>{isAr ? 'التقديم التلقائي' : 'Auto-Apply'}</p>
                          <p style={{ fontSize: 11, color: autoEnabled ? '#8B5CF6' : 'var(--text-secondary)', margin: 0, fontFamily: font }}>{autoEnabled ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Disabled')}</p>
                        </div>
                        <div style={{ width: 40, height: 22, borderRadius: 11, background: autoEnabled ? '#8B5CF6' : 'var(--border)', position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, left: autoEnabled ? 21 : 3, transition: 'left .2s' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Browse filters ── */}
                  {tab === 'browse' && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 9 }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', transition: 'border-color .2s' }}
                          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                          onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
                          <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'بحث...' : 'Search jobs...'} dir={isAr ? 'rtl' : 'ltr'}
                            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: font }} />
                          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}><X size={12} /></button>}
                        </div>
                        <button onClick={() => setShowFilter(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 13px', borderRadius: 11, border: `1.5px solid ${showFilter || type || remote ? 'var(--text-primary)' : 'var(--border)'}`, background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12.5, fontFamily: font, color: showFilter || type || remote ? 'var(--text-primary)' : 'var(--text-secondary)', transition: 'all .15s' }}>
                          <Filter size={12} /> {isAr ? 'فلترة' : 'Filter'}
                          {(type || remote) && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-primary)', display: 'inline-block' }} />}
                        </button>
                      </div>
                      {showFilter && (
                        <div style={{ padding: '12px 14px', borderRadius: 11, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 6 }}>
                          <div>
                            <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: font }}>{isAr ? 'النوع' : 'Type'}</p>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {JOB_TYPES.map(t => (
                                <button key={t.key} onClick={() => setType(t.key)} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11.5, border: `1.5px solid ${type === t.key ? 'var(--text-primary)' : 'var(--border)'}`, background: type === t.key ? 'var(--text-primary)' : 'transparent', color: type === t.key ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: font, transition: 'all .15s' }}>
                                  {isAr ? t.ar : t.en}
                                </button>
                              ))}
                            </div>
                          </div>
                          <button onClick={() => setRemote(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9, border: `1.5px solid ${remote ? 'var(--text-primary)' : 'var(--border)'}`, background: remote ? 'var(--bg-secondary)' : 'transparent', color: remote ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontFamily: font }}>
                            <Wifi size={11} /> {isAr ? 'بُعد فقط' : 'Remote only'} {remote && <CheckCircle2 size={11} />}
                          </button>
                          {(type || remote) && (
                            <button onClick={() => { setType(''); setRemote(false); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: font }}>
                              <X size={11} /> {isAr ? 'مسح' : 'Clear'}
                            </button>
                          )}
                        </div>
                      )}
                      {!loading && <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '6px 0 0', fontFamily: font }}>{total.toLocaleString()} {isAr ? 'وظيفة' : 'jobs'}</p>}
                    </div>
                  )}

                  {/* ══════════════════════════════════════
                      CONTENT
                  ══════════════════════════════════════ */}

                  {/* ── My Applications tab ── */}
                  {tab === 'applied' && (
                    <>
                      {/* Search + Status filter row */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 9, flexWrap: 'wrap' }}>

                          {/* Search */}
                          <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', transition: 'border-color .2s' }}
                            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                            onBlurCapture={e  => e.currentTarget.style.borderColor = 'var(--border)'}>
                            <Search size={13} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                            <input
                              value={appSearch} onChange={e => setAppSearch(e.target.value)}
                              placeholder={isAr ? 'ابحث في طلباتك...' : 'Search applications...'}
                              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: font }}
                            />
                            {appSearch && (
                              <button onClick={() => setAppSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}>
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Status select */}
                          <select
                            value={appStatus} onChange={e => { setAppStatus(e.target.value); }}
                            style={{ padding: '9px 13px', borderRadius: 11, border: `1.5px solid ${appStatus ? 'var(--text-primary)' : 'var(--border)'}`, background: 'var(--bg-primary)', color: appStatus ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontFamily: font, outline: 'none', cursor: 'pointer', minWidth: 130 }}
                          >
                            <option value="">{isAr ? 'كل الحالات' : 'All Statuses'}</option>
                            {Object.entries(STATUS_MAP).map(([key, val]) => (
                              <option key={key} value={key}>{isAr ? val.ar : val.en}</option>
                            ))}
                          </select>

                          {/* Clear */}
                          {(appSearch || appStatus) && (
                            <button
                              onClick={() => { setAppSearch(''); setAppStatus(''); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', borderRadius: 11, border: '1px solid rgba(239,68,68,.3)', background: 'rgba(239,68,68,.05)', color: '#EF4444', cursor: 'pointer', fontSize: 12.5, fontFamily: font, whiteSpace: 'nowrap' }}>
                              <X size={11} /> {isAr ? 'مسح' : 'Clear'}
                            </button>
                          )}
                        </div>

                        {/* Result count */}
                        {!loading && (
                          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                            {appTotal.toLocaleString()} {isAr ? 'طلب' : 'applications'}
                            {appTotal > APP_LIMIT && (
                              <span style={{ marginInlineStart: 8, opacity: 0.6 }}>
                                · {isAr ? `صفحة ${appPage} من ${totalAppPages}` : `Page ${appPage} of ${totalAppPages}`}
                              </span>
                            )}
                          </p>
                        )}
                      </div>

                      {/* List or states */}
                      {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ height: 62, borderRadius: 13, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
                          ))}
                        </div>
                      ) : appliedJobs.length === 0 ? (
                        <Empty
                          icon={<Send size={40} />}
                          title={appSearch || appStatus ? (isAr ? 'لا توجد نتائج' : 'No results') : (isAr ? 'لم تتقدم بعد' : 'No applications yet')}
                          desc={appSearch || appStatus ? (isAr ? 'جرّب تغيير الفلاتر' : 'Try changing your filters') : (isAr ? 'تصفح الوظائف وتقدم الآن' : 'Browse jobs and start applying')}
                          isAr={isAr} font={font}
                          action={!(appSearch || appStatus) && (
                            <button onClick={() => setTab('browse')} style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
                              {isAr ? 'تصفح الوظائف' : 'Browse Jobs'}
                            </button>
                          )}
                        />
                      ) : (
                        <>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {appliedJobs.map(app => (
                              <AppRow key={app.id} app={app} isAr={isAr} font={font} />
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalAppPages > 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 20 }}>
                              {/* Prev */}
                              <button
                                onClick={() => loadApplied(appPage - 1, true)}
                                disabled={appPage <= 1}
                                style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: appPage <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appPage <= 1 ? .3 : 1, transition: 'opacity .15s' }}
                              >
                                {isAr ? <ChevronRight size={14} color="var(--text-secondary)" /> : <ChevronLeft size={14} color="var(--text-secondary)" />}
                              </button>

                              {/* Page numbers */}
                              {Array.from({ length: Math.min(totalAppPages, 5) }, (_, i) => {
                                const p = totalAppPages <= 5
                                  ? i + 1
                                  : Math.max(1, Math.min(appPage - 2, totalAppPages - 4)) + i;
                                return (
                                  <button key={p} onClick={() => loadApplied(p, true)} style={{ minWidth: 34, height: 34, borderRadius: 9, border: `1px solid ${p === appPage ? 'transparent' : 'var(--border)'}`, background: p === appPage ? 'var(--text-primary)' : 'var(--bg-primary)', color: p === appPage ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontWeight: p === appPage ? 700 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-en)', transition: 'all .12s' }}>
                                    {p}
                                  </button>
                                );
                              })}

                              {/* Next */}
                              <button
                                onClick={() => loadApplied(appPage + 1, true)}
                                disabled={appPage >= totalAppPages}
                                style={{ width: 34, height: 34, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: appPage >= totalAppPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appPage >= totalAppPages ? .3 : 1, transition: 'opacity .15s' }}
                              >
                                {isAr ? <ChevronLeft size={14} color="var(--text-secondary)" /> : <ChevronRight size={14} color="var(--text-secondary)" />}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {/* ── Matched + Browse tabs ── */}
                  {tab !== 'applied' && (
                    loading ? (
                      <div className="jb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {[...Array(6)].map((_, i) => <Skel key={i} />)}
                      </div>
                    ) : curJobs.length === 0 ? (
                      <Empty
                        icon={<Briefcase size={40} />}
                        title={isAr ? 'لا توجد وظائف' : 'No jobs found'}
                        desc={isAr ? 'أكمل ملفك للحصول على اقتراحات مخصصة' : 'Complete your profile to get AI-matched jobs'}
                        isAr={isAr} font={font}
                        action={<Link to="/profile" style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, fontFamily: font }}>{isAr ? 'أكمل ملفك' : 'Complete Profile'}</Link>}
                      />
                    ) : (
                      <>
                        <div className="jb-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          {curJobs.map(job => (
                            <JobCard key={job.id} job={job} isAr={isAr} font={font} onApply={handleApply} applied={appliedIds.has(job.id)} applying={applying} isPro={isPro} />
                          ))}
                        </div>
                        {tab === 'browse' && page < Math.ceil(total / LIMIT) && (
                          <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <button onClick={() => loadBrowse(page + 1)} style={{ padding: '10px 22px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                              <ChevronRight size={13} /> {isAr ? 'تحميل المزيد' : 'Load more'}
                            </button>
                          </div>
                        )}
                      </>
                    )
                  )}
                </div>

                {/* ════ RIGHT SIDEBAR ════ */}
                <div className="jb-sidebar" style={{ position: 'sticky', top: 20 }}>
                  <AutoApplyPanel isAr={isAr} font={font} user={user} onApplied={handleAutoApplied} autoEnabled={autoEnabled} onToggle={toggleAutoApply} />

                  {/* Stats card */}
                  {appliedJobs.length > 0 && (
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
                      <p style={{ fontSize: 12.5, fontWeight: 700, fontFamily: font, margin: '0 0 11px' }}>{isAr ? 'إحصائياتي' : 'My Stats'}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        {[
                          { label: isAr ? 'إجمالي'   : 'Total',      val: appTotal },
                          { label: isAr ? 'نشط'       : 'Active',     val: appliedJobs.filter(a => !['rejected', 'accepted'].includes(a.status)).length },
                          { label: isAr ? 'مقابلات'  : 'Interviews', val: appliedJobs.filter(a => a.status === 'interview').length },
                          { label: isAr ? 'تلقائي'   : 'Auto',       val: appliedJobs.filter(a => a.isAutoApplied).length },
                        ].map((s, i) => (
                          <div key={i} style={{ padding: '10px', borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                            <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{s.val}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font, marginTop: 2 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}