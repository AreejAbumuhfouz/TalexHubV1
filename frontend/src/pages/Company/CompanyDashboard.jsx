// import { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   Briefcase, Users, TrendingUp, UserCheck,
//   ArrowUpRight, Plus, Clock, CheckCircle,
//   AlertCircle, ChevronRight, Activity,
//   Layers, BarChart2, Target, Settings,
//   Sparkles, Eye, Star,
// } from 'lucide-react';
// import CompanyLayout from './CompanyLayout';
// import useLangStore from '../../i18n';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// /* ══════════════════════════════════════════════════════════
//    HELPERS
// ══════════════════════════════════════════════════════════ */
// const timeAgo = (d, ar) => {
//   const x = Math.floor((Date.now() - new Date(d)) / 86400000);
//   if (x === 0) return ar ? 'اليوم' : 'Today';
//   if (x < 7)  return ar ? `منذ ${x} أيام` : `${x}d ago`;
//   return ar ? `منذ ${Math.floor(x/7)} أسابيع` : `${Math.floor(x/7)}w ago`;
// };

// const APP_STATUS = {
//   sent:        { ar: 'جديد',         en: 'New',         color: '#71717A' },
//   viewed:      { ar: 'شُوهد',        en: 'Reviewed',    color: '#3B82F6' },
//   shortlisted: { ar: 'مختصر',        en: 'Shortlisted', color: '#8B5CF6' },
//   interview:   { ar: 'مقابلة',       en: 'Interview',   color: '#F59E0B' },
//   accepted:    { ar: 'مقبول',        en: 'Accepted',    color: '#22C55E' },
//   rejected:    { ar: 'مرفوض',       en: 'Rejected',    color: '#EF4444' },
// };

// const JOB_STATUS = {
//   active:           { ar: 'نشط',         en: 'Active',   color: '#22C55E' },
//   pending_approval: { ar: 'قيد المراجعة', en: 'Pending',  color: '#F59E0B' },
//   closed:           { ar: 'مغلق',        en: 'Closed',   color: '#71717A' },
//   draft:            { ar: 'مسودة',       en: 'Draft',    color: '#71717A' },
// };

// const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';

// /* ── Stat Card ───────────────────────────────────────────── */
// function StatCard({ icon: Icon, value, label, sub, color, to, trend }) {
//   const inner = (
//     <div style={{ background: 'var(--bg-primary)', borderRadius: 16, padding: '18px 20px', border: '1px solid var(--border)', display: 'flex', gap: 14, transition: 'all 0.2s', cursor: to ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
//       onMouseEnter={e => { if (to) { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
//       onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
//       <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, width: 3, height: '100%', background: color, borderRadius: '99px 0 0 99px' }} />
//       <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//         <Icon size={20} color={color} strokeWidth={1.9} />
//       </div>
//       <div style={{ flex: 1 }}>
//         <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1, fontFamily: 'var(--font-en)' }}>{value ?? '—'}</p>
//         <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{label}</p>
//         {sub && <p style={{ fontSize: 11, color, fontWeight: 600, margin: '2px 0 0' }}>{sub}</p>}
//       </div>
//       {to && <ArrowUpRight size={15} color="var(--text-secondary)" style={{ flexShrink: 0, opacity: 0.4 }} />}
//     </div>
//   );
//   return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
// }

// /* ── Mini Funnel ─────────────────────────────────────────── */
// function MiniFunnel({ pipeline, isAr }) {
//   if (!pipeline) return null;
//   const stages = [
//     { key: 'sent', label: isAr ? 'تقدّموا' : 'Applied', color: '#71717A' },
//     { key: 'shortlisted', label: isAr ? 'مختصر' : 'Shortlisted', color: '#8B5CF6' },
//     { key: 'interview', label: isAr ? 'مقابلة' : 'Interview', color: '#F59E0B' },
//     { key: 'accepted', label: isAr ? 'قُبلوا' : 'Hired', color: '#22C55E' },
//   ];
//   const max = Math.max(...stages.map(s => pipeline[s.key] || 0), 1);
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//       {stages.map(s => {
//         const val = pipeline[s.key] || 0;
//         const pct = Math.round((val / max) * 100);
//         return (
//           <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <span style={{ width: 80, fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>{s.label}</span>
//             <div style={{ flex: 1, height: 22, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
//               <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 6, minWidth: val > 0 ? 4 : 0, transition: 'width 0.5s ease' }} />
//             </div>
//             <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'var(--font-en)', flexShrink: 0 }}>{val}</span>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ── Skeleton ────────────────────────────────────────────── */
// const Skel = ({ h = 80, r = 16 }) => (
//   <div style={{ height: h, borderRadius: r, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'cdPulse 1.5s ease-in-out infinite' }} />
// );

// /* ══════════════════════════════════════════════════════════
//    MAIN
// ══════════════════════════════════════════════════════════ */
// export default function CompanyDashboard() {
//   const { lang } = useLangStore();
//   const isAr = lang === 'ar';
//   const navigate = useNavigate();

//   const [data,     setData]     = useState(null);
//   const [overview, setOverview] = useState(null);
//   const [loading,  setLoading]  = useState(true);

//   const load = useCallback(async () => {
//     try {
//       const [statsRes, overviewRes] = await Promise.allSettled([
//         api.get('/companies/me/stats'),
//         api.get('/companies/analytics/overview', { params: { range: '30' } }),
//       ]);

//       if (statsRes.status === 'fulfilled') setData(statsRes.value.data.data);
//       else if (statsRes.reason?.response?.status === 404) { navigate('/company/register'); return; }

//       if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data);
//     } catch {
//       toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load');
//     } finally {
//       setLoading(false);
//     }
//   }, [isAr, navigate]);

//   useEffect(() => { load(); }, [load]);

//   if (loading) return (
//     <CompanyLayout title={isAr ? 'الرئيسية' : 'Overview'}>
//       <style>{'@keyframes cdPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
//         {[0,1,2,3].map(i => <Skel key={i} h={92} />)}
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
//         <Skel h={320} /><Skel h={320} /><Skel h={280} />
//       </div>
//     </CompanyLayout>
//   );

//   if (!data) return null;

//   const { company, stats = {}, recentApplicants = [], recentJobs = [] } = data;
//   const isPending  = company?.status === 'pending_review';
//   const isRejected = company?.status === 'rejected';

//   return (
//     <CompanyLayout title={isAr ? 'الرئيسية' : 'Overview'}>
//       <style>{'@keyframes cdPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

//       {/* ── Status banners ── */}
//       {isPending && (
//         <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 20 }}>
//           <Clock size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
//           <div>
//             <p style={{ fontSize: 13.5, fontWeight: 700, color: '#F59E0B', margin: '0 0 2px' }}>{isAr ? 'شركتك قيد المراجعة' : 'Company Under Review'}</p>
//             <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>{isAr ? 'سيتم التحقق خلال 24-48 ساعة. يمكنك نشر وظائف الآن.' : 'Verification takes 24-48 hours. You can post jobs meanwhile.'}</p>
//           </div>
//         </div>
//       )}
//       {isRejected && (
//         <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20 }}>
//           <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
//           <div>
//             <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EF4444', margin: '0 0 2px' }}>{isAr ? 'تم رفض طلب الشركة' : 'Company Application Rejected'}</p>
//             <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
//               {company.rejectionReason || (isAr ? 'يرجى التواصل مع الدعم للمزيد من التفاصيل.' : 'Please contact support for more details.')}
//             </p>
//           </div>
//         </div>
//       )}

//       {/* ── Company header ── */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'var(--bg-primary)', borderRadius: 18, border: '1px solid var(--border)', marginBottom: 20 }}>
//         <div style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
//           {company.logoUrl
//             ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//             : <Briefcase size={22} color="var(--text-secondary)" />
//           }
//         </div>
//         <div style={{ flex: 1, minWidth: 0 }}>
//           <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//             {company.name}
//           </h2>
//           <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
//             {[company.industry, company.locationCity, company.locationCountry].filter(Boolean).join(' · ')}
//           </p>
//         </div>
//         <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
//           <Link to="/company/analytics" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }}
//             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//             <BarChart2 size={13} /> {isAr ? 'التقارير' : 'Analytics'}
//           </Link>
//           <Link to="/company/pipeline" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }}
//             onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
//             onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
//             <Layers size={13} /> {isAr ? 'Pipeline' : 'Pipeline'}
//           </Link>
//           <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, transition: 'opacity 0.2s' }}
//             onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
//             onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
//             <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post Job'}
//           </Link>
//         </div>
//       </div>

//       {/* ── KPI Cards ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14, marginBottom: 20 }}>
//         <StatCard icon={Briefcase}  value={stats.activeJobs}      color="#3B82F6" to="/company/jobs"       label={isAr ? 'وظائف نشطة'       : 'Active Jobs'}       />
//         <StatCard icon={Users}      value={stats.totalApplicants} color="#8B5CF6" to="/company/applicants" label={isAr ? 'إجمالي المتقدمين' : 'Total Applicants'}  />
//         <StatCard icon={TrendingUp} value={stats.newApplicants}   color="#22C55E"                         label={isAr ? 'متقدمون هذا الأسبوع' : 'This Week'} sub={isAr ? 'آخر 7 أيام' : 'Last 7 days'} />
//         <StatCard icon={UserCheck}  value={stats.members}         color="#F59E0B" to="/company/members"    label={isAr ? 'أعضاء الفريق'      : 'Team Members'}     />
//         {overview && (
//           <>
//             <StatCard icon={Target}   value={`${overview.conversionRate}%`} color="#EF4444" label={isAr ? 'معدل التحويل' : 'Conversion Rate'} />
//             <StatCard icon={Star}     value={overview.shortlisted}          color="#8B5CF6" to="/company/pipeline" label={isAr ? 'في القائمة المختصرة' : 'Shortlisted'} />
//           </>
//         )}
//       </div>

//       {/* ── 3-column grid ── */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>

//         {/* Recent Applicants */}
//         <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
//             <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
//               <Activity size={14} color="var(--text-secondary)" /> {isAr ? 'آخر المتقدمين' : 'Recent Applicants'}
//             </h3>
//             <Link to="/company/applicants" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
//               onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
//               onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
//               {isAr ? 'الكل' : 'View all'} <ChevronRight size={13} />
//             </Link>
//           </div>
//           <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
//             {recentApplicants.length === 0 ? (
//               <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
//                 <Users size={28} style={{ opacity: 0.2, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
//                 <p style={{ fontSize: 13, margin: 0 }}>{isAr ? 'لا يوجد متقدمون بعد' : 'No applicants yet'}</p>
//               </div>
//             ) : recentApplicants.map((app, i) => {
//               const sc = APP_STATUS[app.status] || APP_STATUS.sent;
//               const name = app.user?.fullName || app.applicant?.fullName || '—';
//               const score = app.matchScore ? Math.round(parseFloat(app.matchScore)) : null;
//               return (
//                 <Link key={i} to={`/company/pipeline`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px', borderRadius: 11, background: 'var(--bg-secondary)', textDecoration: 'none', border: '1px solid transparent', transition: 'border-color 0.15s' }}
//                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
//                   onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
//                   <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
//                     {(app.user?.avatarUrl || app.applicant?.avatarUrl)
//                       ? <img src={app.user?.avatarUrl || app.applicant?.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                       : <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{name[0]?.toUpperCase()}</span>
//                     }
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
//                     <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>{app.job?.title} · {timeAgo(app.createdAt, isAr)}</p>
//                   </div>
//                   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
//                     <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${sc.color}15`, color: sc.color }}>{isAr ? sc.ar : sc.en}</span>
//                     {score !== null && <span style={{ fontSize: 9.5, fontWeight: 700, color: matchColor(score) }}>{score}%</span>}
//                   </div>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* Recent Jobs */}
//         <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
//             <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
//               <Briefcase size={14} color="var(--text-secondary)" /> {isAr ? 'الوظائف النشطة' : 'Active Jobs'}
//             </h3>
//             <Link to="/company/jobs" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
//               onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
//               onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
//               {isAr ? 'الكل' : 'View all'} <ChevronRight size={13} />
//             </Link>
//           </div>
//           <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
//             {recentJobs.length === 0 ? (
//               <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
//                 <Briefcase size={28} style={{ opacity: 0.2, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
//                 <p style={{ fontSize: 13, margin: '0 0 10px' }}>{isAr ? 'لم تنشر أي وظيفة بعد' : 'No jobs yet'}</p>
//                 <Link to="/company/jobs/new" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>+ {isAr ? 'نشر أول وظيفة' : 'Post first job'}</Link>
//               </div>
//             ) : recentJobs.map((job, i) => {
//               const s = JOB_STATUS[job.status] || JOB_STATUS.draft;
//               return (
//                 <Link key={i} to={`/company/applicants?jobId=${job.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px', borderRadius: 11, background: 'var(--bg-secondary)', textDecoration: 'none', border: '1px solid transparent', transition: 'border-color 0.15s' }}
//                   onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
//                   onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
//                   <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                     <Briefcase size={15} color={s.color} />
//                   </div>
//                   <div style={{ flex: 1, minWidth: 0 }}>
//                     <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
//                     <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
//                       <Users size={10} /> {job.applicationsCount || 0}
//                       <Eye size={10} /> {job.viewsCount || 0}
//                     </p>
//                   </div>
//                   <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}12`, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{isAr ? s.ar : s.en}</span>
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* Hiring Funnel */}
//         {overview && (
//           <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
//               <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
//                 <Target size={14} color="var(--text-secondary)" /> {isAr ? 'قمع التوظيف' : 'Hiring Funnel'}
//               </h3>
//               <Link to="/company/analytics" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
//                 onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
//                 onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
//                 {isAr ? 'التقارير' : 'Reports'} <ChevronRight size={13} />
//               </Link>
//             </div>
//             <div style={{ padding: '16px 18px' }}>
//               <MiniFunnel pipeline={overview.pipeline} isAr={isAr} />
//               <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
//                 <div style={{ textAlign: 'center' }}>
//                   <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.conversionRate}%</p>
//                   <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'معدل التحويل' : 'Conversion'}</p>
//                 </div>
//                 <div style={{ textAlign: 'center' }}>
//                   <p style={{ fontSize: 18, fontWeight: 900, color: '#22C55E', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.hired}</p>
//                   <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'تم التوظيف' : 'Hired'}</p>
//                 </div>
//                 <div style={{ textAlign: 'center' }}>
//                   <p style={{ fontSize: 18, fontWeight: 900, color: '#8B5CF6', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.shortlisted}</p>
//                   <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'مختصر' : 'Shortlisted'}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ── Quick Actions ── */}
//       <div style={{ marginTop: 16, background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '16px 20px' }}>
//         <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
//           {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
//         </h3>
//         <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//           {[
//             { to: '/company/jobs/new',   icon: Plus,      label: isAr ? 'نشر وظيفة'     : 'Post Job',        color: 'var(--text-primary)', bg: 'var(--text-primary)', text: 'var(--bg-primary)' },
//             { to: '/company/pipeline',   icon: Layers,    label: isAr ? 'عرض Pipeline'   : 'View Pipeline',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
//             { to: '/company/analytics',  icon: BarChart2, label: isAr ? 'التقارير'       : 'Analytics',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6' },
//             { to: '/company/members',    icon: UserCheck, label: isAr ? 'إدارة الفريق'   : 'Manage Team',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
//           ].map((a, i) => (
//             <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: a.bg || 'var(--bg-secondary)', color: a.text || a.color, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: `1px solid ${a.color}25`, transition: 'opacity 0.2s', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
//               onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
//               onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
//               <a.icon size={14} /> {a.label}
//             </Link>
//           ))}
//         </div>
//       </div>
//     </CompanyLayout>
//   );
// }


import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, TrendingUp, UserCheck,
  ArrowUpRight, Plus, Clock, CheckCircle,
  AlertCircle, ChevronRight, Activity,
  Layers, BarChart2, Target, Settings,
  Sparkles, Eye, Star, Upload, XCircle,
} from 'lucide-react';
import CompanyLayout, { useCompany } from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const timeAgo = (d, ar) => {
  const x = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (x === 0) return ar ? 'اليوم' : 'Today';
  if (x < 7)  return ar ? `منذ ${x} أيام` : `${x}d ago`;
  return ar ? `منذ ${Math.floor(x/7)} أسابيع` : `${Math.floor(x/7)}w ago`;
};

const APP_STATUS = {
  sent:        { ar: 'جديد',         en: 'New',         color: '#71717A' },
  viewed:      { ar: 'شُوهد',        en: 'Reviewed',    color: '#3B82F6' },
  shortlisted: { ar: 'مختصر',        en: 'Shortlisted', color: '#8B5CF6' },
  interview:   { ar: 'مقابلة',       en: 'Interview',   color: '#F59E0B' },
  accepted:    { ar: 'مقبول',        en: 'Accepted',    color: '#22C55E' },
  rejected:    { ar: 'مرفوض',       en: 'Rejected',    color: '#EF4444' },
};

const JOB_STATUS = {
  active:           { ar: 'نشط',         en: 'Active',   color: '#22C55E' },
  pending_approval: { ar: 'قيد المراجعة', en: 'Pending',  color: '#F59E0B' },
  closed:           { ar: 'مغلق',        en: 'Closed',   color: '#71717A' },
  draft:            { ar: 'مسودة',       en: 'Draft',    color: '#71717A' },
};

const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({ icon: Icon, value, label, sub, color, to, trend }) {
  const inner = (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 16, padding: '18px 20px', border: '1px solid var(--border)', display: 'flex', gap: 14, transition: 'all 0.2s', cursor: to ? 'pointer' : 'default', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { if (to) { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}>
      <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, width: 3, height: '100%', background: color, borderRadius: '99px 0 0 99px' }} />
      <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={20} color={color} strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1, fontFamily: 'var(--font-en)' }}>{value ?? '—'}</p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color, fontWeight: 600, margin: '2px 0 0' }}>{sub}</p>}
      </div>
      {to && <ArrowUpRight size={15} color="var(--text-secondary)" style={{ flexShrink: 0, opacity: 0.4 }} />}
    </div>
  );
  return to ? <Link to={to} style={{ textDecoration: 'none' }}>{inner}</Link> : inner;
}

/* ── Mini Funnel ─────────────────────────────────────────── */
function MiniFunnel({ pipeline, isAr }) {
  if (!pipeline) return null;
  const stages = [
    { key: 'sent', label: isAr ? 'تقدّموا' : 'Applied', color: '#71717A' },
    { key: 'shortlisted', label: isAr ? 'مختصر' : 'Shortlisted', color: '#8B5CF6' },
    { key: 'interview', label: isAr ? 'مقابلة' : 'Interview', color: '#F59E0B' },
    { key: 'accepted', label: isAr ? 'قُبلوا' : 'Hired', color: '#22C55E' },
  ];
  const max = Math.max(...stages.map(s => pipeline[s.key] || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {stages.map(s => {
        const val = pipeline[s.key] || 0;
        const pct = Math.round((val / max) * 100);
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 80, fontSize: 11.5, color: 'var(--text-secondary)', fontWeight: 500, flexShrink: 0 }}>{s.label}</span>
            <div style={{ flex: 1, height: 22, background: 'var(--bg-secondary)', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 6, minWidth: val > 0 ? 4 : 0, transition: 'width 0.5s ease' }} />
            </div>
            <span style={{ width: 28, fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', fontFamily: 'var(--font-en)', flexShrink: 0 }}>{val}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = ({ h = 80, r = 16 }) => (
  <div style={{ height: h, borderRadius: r, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'cdPulse 1.5s ease-in-out infinite' }} />
);

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
/* ── Certificate Banner ──────────────────────────────────── */
function CertBanner({ company, isAr }) {
  const { status, rejectionReason } = company || {};
  if (!status || status === 'active') return null;

  const cfg = {
    pending_documents: {
      bg: '#F59E0B', icon: <Upload size={15} color="#fff" />,
      text: isAr ? 'ارفع شهادة تسجيل شركتك لتفعيل حسابك ونشر الوظائف' : 'Upload your registration certificate to activate your account and post jobs',
      link: '/company/profile', linkText: isAr ? 'رفع الشهادة ←' : 'Upload Certificate →',
    },
    pending_review: {
      bg: '#3B82F6', icon: <Clock size={15} color="#fff" />,
      text: isAr ? 'شهادتك قيد المراجعة — سيصلك بريد عند الموافقة' : 'Your certificate is under review — you will receive an email upon approval',
      link: null, linkText: null,
    },
    rejected: {
      bg: '#EF4444', icon: <XCircle size={15} color="#fff" />,
      text: isAr
        ? `تم رفض طلبك${rejectionReason ? `: ${rejectionReason}` : ''} — ارفع وثائق جديدة`
        : `Application rejected${rejectionReason ? `: ${rejectionReason}` : ''} — upload new documents`,
      link: '/company/profile', linkText: isAr ? 'رفع وثائق جديدة ←' : 'Upload New Documents →',
    },
    suspended: {
      bg: '#EF4444', icon: <AlertCircle size={15} color="#fff" />,
      text: isAr ? 'حسابك موقوف — تواصل مع الدعم' : 'Account suspended — contact support',
      link: null, linkText: null,
    },
  }[status];

  if (!cfg) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      background: cfg.bg, borderRadius: 12, padding: '12px 16px', marginBottom: 20,
    }}>
      {cfg.icon}
      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, flex: 1 }}>{cfg.text}</span>
      {cfg.link && (
        <a href={cfg.link} style={{
          fontSize: 13, color: '#fff', fontWeight: 800,
          textDecoration: 'underline', whiteSpace: 'nowrap', flexShrink: 0,
        }}>
          {cfg.linkText}
        </a>
      )}
    </div>
  );
}

export default function CompanyDashboard() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [data,     setData]     = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    try {
      const [statsRes, overviewRes] = await Promise.allSettled([
        api.get('/companies/me/stats'),
        api.get('/companies/analytics/overview', { params: { range: '30' } }),
      ]);

      if (statsRes.status === 'fulfilled') setData(statsRes.value.data.data);
      else if (statsRes.reason?.response?.status === 404) { navigate('/company/register'); return; }

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data.data);
    } catch {
      toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [isAr, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <CompanyLayout title={isAr ? 'الرئيسية' : 'Overview'}>
      <style>{'@keyframes cdPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14, marginBottom: 20 }}>
        {[0,1,2,3].map(i => <Skel key={i} h={92} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        <Skel h={320} /><Skel h={320} /><Skel h={280} />
      </div>
    </CompanyLayout>
  );

  if (!data) return null;

  const { company, stats = {}, recentApplicants = [], recentJobs = [] } = data;
  const isPending  = company?.status === 'pending_review';
  const isRejected = company?.status === 'rejected';

  return (
    <CompanyLayout title={isAr ? 'الرئيسية' : 'Overview'}>
      <style>{'@keyframes cdPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      {/* ── Status banners ── */}
      {isPending && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', marginBottom: 20 }}>
          <Clock size={18} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#F59E0B', margin: '0 0 2px' }}>{isAr ? 'شركتك قيد المراجعة' : 'Company Under Review'}</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>{isAr ? 'سيتم التحقق خلال 24-48 ساعة. يمكنك نشر وظائف الآن.' : 'Verification takes 24-48 hours. You can post jobs meanwhile.'}</p>
          </div>
        </div>
      )}
      {isRejected && (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20 }}>
          <AlertCircle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EF4444', margin: '0 0 2px' }}>{isAr ? 'تم رفض طلب الشركة' : 'Company Application Rejected'}</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
              {company.rejectionReason || (isAr ? 'يرجى التواصل مع الدعم للمزيد من التفاصيل.' : 'Please contact support for more details.')}
            </p>
          </div>
        </div>
      )}

      {/* ── Company header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'var(--bg-primary)', borderRadius: 18, border: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {company.logoUrl
            ? <img src={company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Briefcase size={22} color="var(--text-secondary)" />
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {company.name}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            {[company.industry, company.locationCity, company.locationCountry].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <Link to="/company/analytics" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <BarChart2 size={13} /> {isAr ? 'التقارير' : 'Analytics'}
          </Link>
          <Link to="/company/pipeline" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <Layers size={13} /> {isAr ? 'Pipeline' : 'Pipeline'}
          </Link>
          <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, transition: 'opacity 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            <Plus size={13} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post Job'}
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(185px,1fr))', gap: 14, marginBottom: 20 }}>
        <StatCard icon={Briefcase}  value={stats.activeJobs}      color="#3B82F6" to="/company/jobs"       label={isAr ? 'وظائف نشطة'       : 'Active Jobs'}       />
        <StatCard icon={Users}      value={stats.totalApplicants} color="#8B5CF6" to="/company/applicants" label={isAr ? 'إجمالي المتقدمين' : 'Total Applicants'}  />
        <StatCard icon={TrendingUp} value={stats.newApplicants}   color="#22C55E"                         label={isAr ? 'متقدمون هذا الأسبوع' : 'This Week'} sub={isAr ? 'آخر 7 أيام' : 'Last 7 days'} />
        <StatCard icon={UserCheck}  value={stats.members}         color="#F59E0B" to="/company/members"    label={isAr ? 'أعضاء الفريق'      : 'Team Members'}     />
        {overview && (
          <>
            <StatCard icon={Target}   value={`${overview.conversionRate}%`} color="#EF4444" label={isAr ? 'معدل التحويل' : 'Conversion Rate'} />
            <StatCard icon={Star}     value={overview.shortlisted}          color="#8B5CF6" to="/company/pipeline" label={isAr ? 'في القائمة المختصرة' : 'Shortlisted'} />
          </>
        )}
      </div>

      {/* ── 3-column grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>

        {/* Recent Applicants */}
        <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Activity size={14} color="var(--text-secondary)" /> {isAr ? 'آخر المتقدمين' : 'Recent Applicants'}
            </h3>
            <Link to="/company/applicants" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {isAr ? 'الكل' : 'View all'} <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentApplicants.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                <Users size={28} style={{ opacity: 0.2, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, margin: 0 }}>{isAr ? 'لا يوجد متقدمون بعد' : 'No applicants yet'}</p>
              </div>
            ) : recentApplicants.map((app, i) => {
              const sc = APP_STATUS[app.status] || APP_STATUS.sent;
              const name = app.user?.fullName || app.applicant?.fullName || '—';
              const score = app.matchScore ? Math.round(parseFloat(app.matchScore)) : null;
              return (
                <Link key={i} to={`/company/pipeline`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px', borderRadius: 11, background: 'var(--bg-secondary)', textDecoration: 'none', border: '1px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                    {(app.user?.avatarUrl || app.applicant?.avatarUrl)
                      ? <img src={app.user?.avatarUrl || app.applicant?.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{name[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>{app.job?.title} · {timeAgo(app.createdAt, isAr)}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: `${sc.color}15`, color: sc.color }}>{isAr ? sc.ar : sc.en}</span>
                    {score !== null && <span style={{ fontSize: 9.5, fontWeight: 700, color: matchColor(score) }}>{score}%</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Jobs */}
        <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
              <Briefcase size={14} color="var(--text-secondary)" /> {isAr ? 'الوظائف النشطة' : 'Active Jobs'}
            </h3>
            <Link to="/company/jobs" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
              {isAr ? 'الكل' : 'View all'} <ChevronRight size={13} />
            </Link>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recentJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-secondary)' }}>
                <Briefcase size={28} style={{ opacity: 0.2, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                <p style={{ fontSize: 13, margin: '0 0 10px' }}>{isAr ? 'لم تنشر أي وظيفة بعد' : 'No jobs yet'}</p>
                <Link to="/company/jobs/new" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none' }}>+ {isAr ? 'نشر أول وظيفة' : 'Post first job'}</Link>
              </div>
            ) : recentJobs.map((job, i) => {
              const s = JOB_STATUS[job.status] || JOB_STATUS.draft;
              return (
                <Link key={i} to={`/company/applicants?jobId=${job.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px', borderRadius: 11, background: 'var(--bg-secondary)', textDecoration: 'none', border: '1px solid transparent', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={15} color={s.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Users size={10} /> {job.applicationsCount || 0}
                      <Eye size={10} /> {job.viewsCount || 0}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}12`, padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{isAr ? s.ar : s.en}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Hiring Funnel */}
        {overview && (
          <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Target size={14} color="var(--text-secondary)" /> {isAr ? 'قمع التوظيف' : 'Hiring Funnel'}
              </h3>
              <Link to="/company/analytics" style={{ fontSize: 12, color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                {isAr ? 'التقارير' : 'Reports'} <ChevronRight size={13} />
              </Link>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <MiniFunnel pipeline={overview.pipeline} isAr={isAr} />
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.conversionRate}%</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'معدل التحويل' : 'Conversion'}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#22C55E', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.hired}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'تم التوظيف' : 'Hired'}</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 18, fontWeight: 900, color: '#8B5CF6', margin: 0, fontFamily: 'var(--font-en)' }}>{overview.shortlisted}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{isAr ? 'مختصر' : 'Shortlisted'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginTop: 16, background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '16px 20px' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
        </h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { to: '/company/jobs/new',   icon: Plus,      label: isAr ? 'نشر وظيفة'     : 'Post Job',        color: 'var(--text-primary)', bg: 'var(--text-primary)', text: 'var(--bg-primary)' },
            { to: '/company/pipeline',   icon: Layers,    label: isAr ? 'عرض Pipeline'   : 'View Pipeline',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', text: '#3B82F6' },
            { to: '/company/analytics',  icon: BarChart2, label: isAr ? 'التقارير'       : 'Analytics',       color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', text: '#8B5CF6' },
            { to: '/company/members',    icon: UserCheck, label: isAr ? 'إدارة الفريق'   : 'Manage Team',     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', text: '#F59E0B' },
          ].map((a, i) => (
            <Link key={i} to={a.to} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 11, background: a.bg || 'var(--bg-secondary)', color: a.text || a.color, textDecoration: 'none', fontSize: 13, fontWeight: 700, border: `1px solid ${a.color}25`, transition: 'opacity 0.2s', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              <a.icon size={14} /> {a.label}
            </Link>
          ))}
        </div>
      </div>
    </CompanyLayout>
  );
}