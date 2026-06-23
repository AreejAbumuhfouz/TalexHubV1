

// import { useState, useEffect, useRef } from 'react';
// import api from '../../services/api';
// import useLangStore from '../../i18n';
// import { fmt, fmtNum } from '../components/AdminTokens';
// import { Spinner } from '../components/AdminUI';
// import { Icon } from '../components/AdminIcons';

// /* ── tiny chart (canvas sparkline) ──────────────────────── */
// function Sparkline({ data = [], color = '#7B72EE', height = 40 }) {
//   const ref = useRef();
//   useEffect(() => {
//     const canvas = ref.current;
//     if (!canvas || !data.length) return;
//     const ctx    = canvas.getContext('2d');
//     const W = canvas.width, H = canvas.height;
//     ctx.clearRect(0, 0, W, H);
//     const vals   = data.map(d => Number(d.count) || 0);
//     const max    = Math.max(...vals, 1);
//     const step   = W / (vals.length - 1 || 1);
//     ctx.beginPath();
//     vals.forEach((v, i) => {
//       const x = i * step;
//       const y = H - (v / max) * (H - 4) - 2;
//       i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
//     });
//     ctx.strokeStyle = color;
//     ctx.lineWidth   = 2;
//     ctx.lineJoin    = 'round';
//     ctx.stroke();
//     // fill
//     ctx.lineTo((vals.length - 1) * step, H);
//     ctx.lineTo(0, H);
//     ctx.closePath();
//     const grad = ctx.createLinearGradient(0, 0, 0, H);
//     grad.addColorStop(0, color + '40');
//     grad.addColorStop(1, color + '00');
//     ctx.fillStyle = grad;
//     ctx.fill();
//   }, [data, color]);
//   return <canvas ref={ref} width={120} height={height} style={{ display: 'block' }} />;
// }

// /* ── stat card ───────────────────────────────────────────── */
// function StatCard({ label, value, sub, icon, color, trend, spark, onClick }) {
//   const [hov, setHov] = useState(false);
//   return (
//     <div onClick={onClick}
//       onMouseEnter={() => setHov(true)}
//       onMouseLeave={() => setHov(false)}
//       style={{
//         background: 'var(--bg-primary)', borderRadius: 14,
//         border: `1px solid ${hov && onClick ? color + '60' : 'var(--border)'}`,
//         padding: '16px 18px', cursor: onClick ? 'pointer' : 'default',
//         transition: 'border-color 0.2s, box-shadow 0.2s',
//         boxShadow: hov && onClick ? `0 4px 20px ${color}18` : 'none',
//         display: 'flex', flexDirection: 'column', gap: 10,
//       }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.4 }}>
//           {label}
//         </span>
//         <div style={{ width: 32, height: 32, borderRadius: 9, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//           <Icon name={icon} size={15} color={color} />
//         </div>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
//         <div>
//           <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
//             {value ?? <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>—</span>}
//           </div>
//           {sub && (
//             <div style={{ fontSize: 11, color: trend > 0 ? '#22C55E' : trend < 0 ? '#EF4444' : 'var(--text-secondary)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
//               {trend > 0 && '↑'}{trend < 0 && '↓'}{sub}
//             </div>
//           )}
//         </div>
//         {spark && <Sparkline data={spark} color={color} />}
//       </div>
//     </div>
//   );
// }

// /* ── plan bar ────────────────────────────────────────────── */
// function PlanBar({ data = [], total }) {
//   const cfg = {
//     free:  { color: '#6B7280', label: 'Free'  },
//     pro:   { color: '#7B72EE', label: 'Pro'   },
//     elite: { color: '#F59E0B', label: 'Elite' },
//   };
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//       {data.map(p => {
//         const c   = cfg[p.planKey] || { color: '#6B7280', label: p.planKey };
//         const pct = total ? Math.round((p.count / total) * 100) : 0;
//         return (
//           <div key={p.planKey}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//               <span style={{ fontSize: 12, fontWeight: 700, color: c.color, textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.label}</span>
//               <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{(Number(p.count)||0).toLocaleString()} ({pct}%)</span>
//             </div>
//             <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
//               <div style={{ width: `${pct}%`, height: '100%', background: c.color, borderRadius: 4, transition: 'width .7s ease' }} />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ── role badge ──────────────────────────────────────────── */
// const ROLE_CLR = {
//   admin:    '#EF4444', support: '#7B72EE', company: '#3B82F6',
//   user:     '#6B7280', moderator: '#EC4899',
// };

// /* ── live pulse ──────────────────────────────────────────── */
// function Pulse({ color = '#22C55E' }) {
//   return (
//     <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
//       <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, opacity: 0.4, animation: 'ovPulse 1.5s ease-out infinite' }} />
//       <span style={{ position: 'relative', borderRadius: '50%', width: 10, height: 10, background: color, display: 'block' }} />
//     </span>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    MAIN OVERVIEW TAB
// ══════════════════════════════════════════════════════════ */
// export default function OverviewTab({ lang: langProp }) {
//   const { lang: storeLang } = useLangStore();
//   const lang = storeLang || langProp || 'en';
//   const isAr = lang === 'ar';
//   const [stats,   setStats]   = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [online,  setOnline]  = useState(0);

//   const load = () => {
//     setLoading(true);
//     api.get('/admin/stats')
//       .then(r => {
//         setStats(r.data.data);
//         setOnline(r.data.data?.onlineCount || 0);
//       })
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     load();
//     // refresh online count every 30 s
//     const t = setInterval(() => {
//       api.get('/admin/stats').then(r => setOnline(r.data.data?.onlineCount || 0)).catch(() => {});
//     }, 30_000);
//     return () => clearInterval(t);
//   }, []);

//   if (loading) return (
//     <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
//       <Spinner size={28} />
//     </div>
//   );

//   const s = stats || {};

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//       <style>{`
//         @keyframes ovPulse {
//           0%   { transform: scale(1);   opacity: 0.4; }
//           70%  { transform: scale(2.2); opacity: 0;   }
//           100% { transform: scale(1);   opacity: 0;   }
//         }
//       `}</style>

//       {/* ── Live visitors banner ────────────────────────── */}
//       <div style={{
//         background: 'var(--bg-primary)', border: '1px solid var(--border)',
//         borderRadius: 14, padding: '14px 20px',
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
//       }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <Pulse />
//           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//             {isAr ? 'الزوار المتصلون الآن' : 'Live Connected Users'}
//           </span>
//           <span style={{ fontSize: 22, fontWeight: 900, color: '#22C55E', marginLeft: 4 }}>
//             {online.toLocaleString()}
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
//             {isAr ? '(يتجدد كل 30 ثانية)' : '(refreshes every 30s)'}
//           </span>
//         </div>
//         <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{isAr ? 'اليوم' : 'Today'}</div>
//             <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>+{(s.newToday||0).toLocaleString()}</div>
//           </div>
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>{isAr ? 'هذا الأسبوع' : 'This Week'}</div>
//             <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>+{(s.newThisWeek||0).toLocaleString()}</div>
//           </div>
//           {s.pendingPayments > 0 && (
//             <div style={{ textAlign: 'center', background: 'rgba(245,158,11,0.1)', borderRadius: 10, padding: '4px 12px', border: '1px solid rgba(245,158,11,0.3)' }}>
//               <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 2 }}>{isAr ? 'دفعات معلقة' : 'Pending Payments'}</div>
//               <div style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>{s.pendingPayments}</div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* ── Primary stat cards ──────────────────────────── */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
//         <StatCard
//           label={isAr ? 'إجمالي المستخدمين' : 'Total Users'}
//           value={fmtNum(s.totalUsers)}
//           sub={isAr ? `${s.activeUsers||0} نشط (30 يوم)` : `${s.activeUsers||0} active (30d)`}
//           trend={1} icon="users" color="#7B72EE"
//           // spark={s.signupTrend}
//         />
//         <StatCard
//           label={isAr ? 'تسجيلات جديدة ٧ أيام' : 'New This Week'}
//           value={`+${fmtNum(s.newThisWeek)}`}
//           sub={isAr ? `+${s.newToday||0} اليوم` : `+${s.newToday||0} today`}
//           trend={1} icon="trend" color="#22C55E"
//         />
//         <StatCard
//           label={isAr ? 'الإيرادات الكلية' : 'Total Revenue'}
//           value={`$${(s.totalRevenue||0).toLocaleString('en-US',{minimumFractionDigits:0,maximumFractionDigits:0})}`}
//           sub={isAr ? 'طلبات مقبولة' : 'Approved requests'}
//           icon="wallet" color="#F59E0B"
//         />
//         <StatCard
//           label={isAr ? 'الشركات' : 'Companies'}
//           value={fmtNum(s.totalCompanies)}
//           sub={s.pendingCompanies ? (isAr ? `${s.pendingCompanies} معلقة` : `${s.pendingCompanies} pending`) : null}
//           trend={s.pendingCompanies > 0 ? -1 : 0}
//           icon="companies" color="#3B82F6"
//         />
//         <StatCard
//           label={isAr ? 'الوظائف النشطة' : 'Active Jobs'}
//           value={fmtNum(s.totalJobs)}
//           sub={s.pendingJobs ? (isAr ? `${s.pendingJobs} بانتظار الموافقة` : `${s.pendingJobs} pending`) : null}
//           icon="jobs" color="#EC4899"
//         />
//         <StatCard
//           label={isAr ? 'الطلبات المقدمة' : 'Applications'}
//           value={fmtNum(s.totalApplications)}
//           icon="audit" color="#14B8A6"
//         />
//         <StatCard
//           label={isAr ? 'السير الذاتية' : 'CVs Uploaded'}
//           value={fmtNum(s.totalCVs)}
//           icon="courses" color="#8B5CF6"
//         />
//         <StatCard
//           label={isAr ? 'الدورات المنشورة' : 'Courses'}
//           value={fmtNum(s.totalCourses)}
//           icon="courses" color="#0EA5E9"
//         />
//         <StatCard
//           label={isAr ? 'غرف الدردشة' : 'Chat Rooms'}
//           value={fmtNum(s.totalChatRooms)}
//           icon="chat" color="#F97316"
//         />
//       </div>

//       {/* ── Charts row ──────────────────────────────────── */}
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

//         {/* Plan distribution */}
//         <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
//             {isAr ? 'توزيع الباقات' : 'Plan Distribution'}
//           </div>
//           <PlanBar data={s.planBreakdown || []} total={s.totalUsers} />
//         </div>

//         {/* Role distribution */}
//         <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
//           <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
//             {isAr ? 'توزيع الأدوار' : 'Role Distribution'}
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
//             {(s.roleBreakdown || []).map(r => {
//               const clr = ROLE_CLR[r.role] || '#6B7280';
//               const pct = s.totalUsers ? Math.round((r.count / s.totalUsers) * 100) : 0;
//               return (
//                 <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                   <span style={{ width: 10, height: 10, borderRadius: 3, background: clr, flexShrink: 0 }} />
//                   <span style={{ fontSize: 12, fontWeight: 600, color: clr, minWidth: 74, textTransform: 'capitalize' }}>{r.role}</span>
//                   <div style={{ flex: 1, height: 5, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
//                     <div style={{ width: `${pct}%`, height: '100%', background: clr, borderRadius: 3, transition: 'width .7s ease' }} />
//                   </div>
//                   <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 54, textAlign: 'right' }}>
//                     {(Number(r.count)||0).toLocaleString()} ({pct}%)
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ── Signup trend sparkline (7 days) ─────────────── */}
//       {(s.signupTrend || []).length > 1 && (
//         <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
//             <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//               {isAr ? 'تسجيلات آخر ٧ أيام' : 'Signups — last 7 days'}
//             </span>
//             <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
//               {isAr ? 'مجموع' : 'Total'}: {(s.newThisWeek||0).toLocaleString()}
//             </span>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
//             {(s.signupTrend || []).map((d, i) => {
//               const vals = s.signupTrend.map(x => Number(x.count) || 0);
//               const max  = Math.max(...vals, 1);
//               const h    = Math.max(4, Math.round((Number(d.count) / max) * 80));
//               const date = new Date(d.day);
//               const label = date.toLocaleDateString(isAr ? 'ar-JO' : 'en-US', { weekday: 'short' });
//               return (
//                 <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
//                   <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 700 }}>{Number(d.count)||0}</span>
//                   <div style={{ width: '100%', height: h, background: '#7B72EE', borderRadius: '4px 4px 0 0', transition: 'height .5s ease' }} />
//                   <span style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center' }}>{label}</span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* ── Recent activity log ─────────────────────────── */}
//       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
//         <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
//             {isAr ? 'آخر النشاطات' : 'Recent Activity'}
//           </span>
//           <button onClick={load} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
//             <Icon name="refresh" size={12} /> {isAr ? 'تحديث' : 'Refresh'}
//           </button>
//         </div>
//         {(s.recentActivity || []).length === 0 ? (
//           <div style={{ padding: '32px 18px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
//             {isAr ? 'لا يوجد نشاط حديث' : 'No recent activity'}
//           </div>
//         ) : (
//           (s.recentActivity || []).map((a, i) => (
//             <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, gap: 12 }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
//                 <span style={{ padding: '3px 8px', borderRadius: 5, background: 'var(--bg-secondary)', fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
//                   {a.action}
//                 </span>
//                 <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                   {a['actor.email'] || a.actor?.email || '—'}
//                 </span>
//               </div>
//               <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>{fmt(a.createdAt)}</span>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import { fmt, fmtNum } from '../components/AdminTokens';
import { Spinner } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { StatCardSkeleton } from '../components/AdminSkeleton';

/* ── tiny chart (canvas sparkline) ──────────────────────── */
function Sparkline({ data = [], color = '#7B72EE', height = 40 }) {
  const ref = useRef();
  
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !data.length) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    
    ctx.clearRect(0, 0, W, H);
    
    const vals = data.map(d => Number(d.count) || 0);
    const max = Math.max(...vals, 1);
    const step = W / (vals.length - 1 || 1);
    
    ctx.beginPath();
    vals.forEach((v, i) => {
      const x = i * step;
      const y = H - (v / max) * (H - 4) - 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // Fill area under line
    ctx.lineTo((vals.length - 1) * step, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
  }, [data, color]);
  
  return <canvas ref={ref} width={120} height={height} style={{ display: 'block' }} />;
}

/* ── stat card ───────────────────────────────────────────── */
function StatCard({ label, value, sub, icon, color, trend, spark, onClick }) {
  const [hov, setHov] = useState(false);
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-primary)',
        borderRadius: 14,
        border: `1px solid ${hov && onClick ? color + '60' : 'var(--border)'}`,
        padding: '16px 18px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        boxShadow: hov && onClick ? `0 4px 20px ${color}18` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          lineHeight: 1.4,
        }}>
          {label}
        </span>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: color + '18',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon name={icon} size={15} color={color} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
            {value ?? <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>—</span>}
          </div>
          {sub && (
            <div style={{
              fontSize: 11,
              color: trend > 0 ? '#22C55E' : trend < 0 ? '#EF4444' : 'var(--text-secondary)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              {trend > 0 && '↑'}
              {trend < 0 && '↓'}
              {sub}
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} color={color} />}
      </div>
    </div>
  );
}

/* ── plan bar ────────────────────────────────────────────── */
function PlanBar({ data = [], total }) {
  const cfg = {
    free:  { color: '#6B7280', label: 'Free' },
    pro:   { color: '#7B72EE', label: 'Pro' },
    elite: { color: '#F59E0B', label: 'Elite' },
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(p => {
        const c = cfg[p.planKey] || { color: '#6B7280', label: p.planKey };
        const pct = total ? Math.round((p.count / total) * 100) : 0;
        
        return (
          <div key={p.planKey}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: c.color,
                textTransform: 'uppercase',
                letterSpacing: '.05em',
              }}>
                {c.label}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {(Number(p.count) || 0).toLocaleString()} ({pct}%)
              </span>
            </div>
            <div style={{
              height: 6,
              background: 'var(--bg-secondary)',
              borderRadius: 4,
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: c.color,
                borderRadius: 4,
                transition: 'width .7s ease',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── role badge colors ──────────────────────────────────── */
const ROLE_CLR = {
  admin:     '#EF4444',
  support:   '#7B72EE',
  company:   '#3B82F6',
  user:      '#6B7280',
  moderator:'#EC4899',
};

/* ── live pulse animation ───────────────────────────────── */
function Pulse({ color = '#22C55E' }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
      <span style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: color,
        opacity: 0.4,
        animation: 'ovPulse 1.5s ease-out infinite',
      }} />
      <span style={{
        position: 'relative',
        borderRadius: '50%',
        width: 10,
        height: 10,
        background: color,
        display: 'block',
      }} />
    </span>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN OVERVIEW TAB
══════════════════════════════════════════════════════════ */
export default function OverviewTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(0);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // ── Load stats ────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setError(null);
      const r = await api.get('/admin/stats');
      setStats(r.data.data);
      setOnline(r.data.data?.onlineCount || 0);
    } catch (err) {
      console.error('Failed to load stats:', err);
      if (err.response?.status === 429) {
        setError(isAr ? 'طلبات كثيرة، جاري إعادة المحاولة...' : 'Rate limited, retrying...');
        // Retry after 3 seconds
        setTimeout(() => load(), 3000);
        return;
      }
      setError(isAr ? 'فشل تحميل الإحصائيات' : 'Failed to load statistics');
    }
  }, [isAr]);

  // ── Initial load ──────────────────────────────────────
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  // ── Live online counter with visibility awareness ─────
  useEffect(() => {
    const startPolling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        api.get('/admin/stats')
          .then(r => setOnline(r.data.data?.onlineCount || 0))
          .catch(() => {}); // Silent fail for polling
      }, 30_000);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
        // Refresh immediately when tab becomes visible
        api.get('/admin/stats')
          .then(r => setOnline(r.data.data?.onlineCount || 0))
          .catch(() => {});
      }
    };

    // Start initial polling
    startPolling();
    
    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // ── Error state ───────────────────────────────────────
  if (error && !stats) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 8 }}>{error}</div>
        <button
          onClick={() => { setLoading(true); load().finally(() => setLoading(false)); }}
          style={{
            padding: '10px 24px',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {isAr ? 'إعادة المحاولة' : 'Retry'}
        </button>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Skeleton banner */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '14px 20px',
          height: 60,
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <div style={{ width: 200, height: 14, background: 'var(--bg-secondary)', borderRadius: 4 }} />
        </div>

        {/* Skeleton cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        {/* Skeleton charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '18px 20px',
            height: 200,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ width: 120, height: 14, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 20 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ width: '100%', height: 24, background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 12 }} />
            ))}
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            padding: '18px 20px',
            height: 200,
            animation: 'pulse 1.5s ease-in-out infinite',
          }}>
            <div style={{ width: 120, height: 14, background: 'var(--bg-secondary)', borderRadius: 4, marginBottom: 20 }} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ width: '100%', height: 20, background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 10 }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── No data state ─────────────────────────────────────
  if (!stats) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {isAr ? 'لا توجد بيانات حالياً' : 'No data available yet'}
        </div>
        <button
          onClick={load}
          style={{
            marginTop: 16,
            padding: '10px 24px',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {isAr ? 'تحديث' : 'Refresh'}
        </button>
      </div>
    );
  }

  const s = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes ovPulse {
          0%   { transform: scale(1);   opacity: 0.4; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(1);   opacity: 0;   }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
      `}</style>

      {/* ── Live visitors banner ────────────────────────── */}
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Pulse />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {isAr ? 'الزوار المتصلون الآن' : 'Live Connected Users'}
          </span>
          <span style={{ fontSize: 22, fontWeight: 900, color: '#22C55E', marginLeft: 4 }}>
            {online.toLocaleString()}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {isAr ? '(يتجدد كل 30 ثانية)' : '(refreshes every 30s)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
              {isAr ? 'اليوم' : 'Today'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              +{(s.newToday || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>
              {isAr ? 'هذا الأسبوع' : 'This Week'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              +{(s.newThisWeek || 0).toLocaleString()}
            </div>
          </div>
          {s.pendingPayments > 0 && (
            <div style={{
              textAlign: 'center',
              background: 'rgba(245,158,11,0.1)',
              borderRadius: 10,
              padding: '4px 12px',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              <div style={{ fontSize: 11, color: '#F59E0B', marginBottom: 2 }}>
                {isAr ? 'دفعات معلقة' : 'Pending Payments'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#F59E0B' }}>
                {s.pendingPayments}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Error toast ──────────────────────────────────── */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: 13,
          color: '#EF4444',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => { setError(null); load(); }}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: '#EF4444',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 12,
              textDecoration: 'underline',
            }}
          >
            {isAr ? 'إعادة المحاولة' : 'Retry'}
          </button>
        </div>
      )}

      {/* ── Primary stat cards ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
        <StatCard
          label={isAr ? 'إجمالي المستخدمين' : 'Total Users'}
          value={fmtNum(s.totalUsers)}
          sub={isAr ? `${s.activeUsers || 0} نشط (30 يوم)` : `${s.activeUsers || 0} active (30d)`}
          trend={1}
          icon="users"
          color="#7B72EE"
        />
        <StatCard
          label={isAr ? 'تسجيلات جديدة ٧ أيام' : 'New This Week'}
          value={`+${fmtNum(s.newThisWeek)}`}
          sub={isAr ? `+${s.newToday || 0} اليوم` : `+${s.newToday || 0} today`}
          trend={1}
          icon="trend"
          color="#22C55E"
        />
        <StatCard
          label={isAr ? 'الإيرادات الكلية' : 'Total Revenue'}
          value={`$${(s.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          sub={isAr ? 'طلبات مقبولة' : 'Approved requests'}
          icon="wallet"
          color="#F59E0B"
        />
        <StatCard
          label={isAr ? 'الشركات' : 'Companies'}
          value={fmtNum(s.totalCompanies)}
          sub={s.pendingCompanies ? (isAr ? `${s.pendingCompanies} معلقة` : `${s.pendingCompanies} pending`) : null}
          trend={s.pendingCompanies > 0 ? -1 : 0}
          icon="companies"
          color="#3B82F6"
          onClick={s.pendingCompanies > 0 ? () => {
            // Navigate to companies tab with pending filter
            window.dispatchEvent(new CustomEvent('admin-nav', { detail: { tab: 'companies', filter: 'pending' } }));
          } : undefined}
        />
        <StatCard
          label={isAr ? 'الوظائف النشطة' : 'Active Jobs'}
          value={fmtNum(s.totalJobs)}
          sub={s.pendingJobs ? (isAr ? `${s.pendingJobs} بانتظار الموافقة` : `${s.pendingJobs} pending`) : null}
          icon="jobs"
          color="#EC4899"
        />
        <StatCard
          label={isAr ? 'الطلبات المقدمة' : 'Applications'}
          value={fmtNum(s.totalApplications)}
          icon="audit"
          color="#14B8A6"
        />
        <StatCard
          label={isAr ? 'السير الذاتية' : 'CVs Uploaded'}
          value={fmtNum(s.totalCVs)}
          icon="courses"
          color="#8B5CF6"
        />
        <StatCard
          label={isAr ? 'الدورات المنشورة' : 'Courses'}
          value={fmtNum(s.totalCourses)}
          icon="courses"
          color="#0EA5E9"
        />
        <StatCard
          label={isAr ? 'غرف الدردشة' : 'Chat Rooms'}
          value={fmtNum(s.totalChatRooms)}
          icon="chat"
          color="#F97316"
        />
      </div>

      {/* ── Charts row ──────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

        {/* Plan distribution */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            {isAr ? 'توزيع الباقات' : 'Plan Distribution'}
          </div>
          {(s.planBreakdown || []).length > 0 ? (
            <PlanBar data={s.planBreakdown} total={s.totalUsers} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 13 }}>
              {isAr ? 'لا توجد بيانات' : 'No data available'}
            </div>
          )}
        </div>

        {/* Role distribution */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '18px 20px',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            {isAr ? 'توزيع الأدوار' : 'Role Distribution'}
          </div>
          {(s.roleBreakdown || []).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {(s.roleBreakdown || []).map(r => {
                const clr = ROLE_CLR[r.role] || '#6B7280';
                const pct = s.totalUsers ? Math.round((r.count / s.totalUsers) * 100) : 0;
                
                return (
                  <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: clr, flexShrink: 0 }} />
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: clr,
                      minWidth: 74,
                      textTransform: 'capitalize',
                    }}>
                      {r.role}
                    </span>
                    <div style={{
                      flex: 1,
                      height: 5,
                      background: 'var(--bg-secondary)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: clr,
                        borderRadius: 3,
                        transition: 'width .7s ease',
                      }} />
                    </div>
                    <span style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      minWidth: 54,
                      textAlign: 'right',
                    }}>
                      {(Number(r.count) || 0).toLocaleString()} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)', fontSize: 13 }}>
              {isAr ? 'لا توجد بيانات' : 'No data available'}
            </div>
          )}
        </div>
      </div>

      {/* ── Signup trend (7 days) ───────────────────────── */}
      {(s.signupTrend || []).length > 1 && (
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: '18px 20px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {isAr ? 'تسجيلات آخر ٧ أيام' : 'Signups — last 7 days'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {isAr ? 'مجموع' : 'Total'}: {(s.newThisWeek || 0).toLocaleString()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
            {(s.signupTrend || []).map((d, i) => {
              const vals = s.signupTrend.map(x => Number(x.count) || 0);
              const max = Math.max(...vals, 1);
              const h = Math.max(4, Math.round((Number(d.count) / max) * 80));
              const date = new Date(d.day);
              const label = date.toLocaleDateString(isAr ? 'ar-JO' : 'en-US', { weekday: 'short' });
              
              return (
                <div key={i} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <span style={{ fontSize: 10, color: 'var(--text-primary)', fontWeight: 700 }}>
                    {Number(d.count) || 0}
                  </span>
                  <div style={{
                    width: '100%',
                    height: h,
                    background: '#7B72EE',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height .5s ease',
                  }} />
                  <span style={{ fontSize: 9, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent activity log ─────────────────────────── */}
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            {isAr ? 'آخر النشاطات' : 'Recent Activity'}
          </span>
          <button
            onClick={load}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
            }}
          >
            <Icon name="refresh" size={12} />
            {isAr ? 'تحديث' : 'Refresh'}
          </button>
        </div>
        
        {(s.recentActivity || []).length === 0 ? (
          <div style={{
            padding: '32px 18px',
            textAlign: 'center',
            color: 'var(--text-secondary)',
            fontSize: 13,
          }}>
            {isAr ? 'لا يوجد نشاط حديث' : 'No recent activity'}
          </div>
        ) : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {(s.recentActivity || []).map((a, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 18px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: 12,
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 5,
                    background: 'var(--bg-secondary)',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}>
                    {a.action}
                  </span>
                  <span style={{
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {a['actor.email'] || a.actor?.email || '—'}
                  </span>
                </div>
                <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {fmt(a.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}