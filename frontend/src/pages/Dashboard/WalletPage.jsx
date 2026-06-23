

// 'use strict';
// // frontend/src/pages/Dashboard/WalletPage.jsx

// import { useState, useEffect, useCallback } from 'react';
// import {
//   Star, Zap, Crown, ArrowDownLeft, ArrowUpRight,
//   Clock, RefreshCw, Gift, ChevronRight, AlertCircle,
//   TrendingUp, Calendar, Award, Sparkles, Lock,
//   ShieldCheck, CheckCircle, Activity,
// } from 'lucide-react';
// import { Link } from 'react-router-dom';
// import useAuthStore from '../../store/authStore';
// import useLang from '../../i18n';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// // ─── Config ──────────────────────────────────────────────────
// const PLAN_CONFIG = {
//   free:  { color: '#6B7280', bg: 'rgba(107,114,128,.12)', glow: 'rgba(107,114,128,.06)',  icon: Star,   arName: 'مجاني',   enName: 'Free'  },
//   pro:   { color: '#818CF8', bg: 'rgba(129,140,248,.12)', glow: 'rgba(129,140,248,.06)',  icon: Crown,  arName: 'Pro',     enName: 'Pro'   },
//   elite: { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  glow: 'rgba(245,158,11,.06)',   icon: Zap,    arName: 'Elite',   enName: 'Elite' },
// };

// const TX_CONFIG = {
//   subscription_reward: { arLabel: 'مكافأة اشتراك',  enLabel: 'Subscription Bonus', icon: Gift,        color: '#818CF8', gain: true  },
//   ai_usage:            { arLabel: 'استخدام AI',       enLabel: 'AI Usage',           icon: Sparkles,    color: '#EF4444', gain: false },
//   referral_reward:     { arLabel: 'مكافأة إحالة',    enLabel: 'Referral Bonus',     icon: Star,        color: '#F59E0B', gain: true  },
//   admin_adjustment:    { arLabel: 'تعديل إداري',      enLabel: 'Admin Adjustment',   icon: ShieldCheck, color: '#3B82F6', gain: null  },
//   purchase:            { arLabel: 'شراء',              enLabel: 'Purchase',           icon: ArrowUpRight,color: '#EF4444', gain: false },
//   refund:              { arLabel: 'استرداد',           enLabel: 'Refund',             icon: ArrowDownLeft,color: '#22C55E',gain: true  },
//   chat_time:           { arLabel: 'وقت محادثة',       enLabel: 'Chat Time',          icon: Clock,       color: '#EF4444', gain: false },
//   default:             { arLabel: 'معاملة',             enLabel: 'Transaction',        icon: Activity,    color: '#6B7280', gain: null  },
// };

// const FEATURE_NAMES = {
//   cv_analysis:  { ar: 'تحليل السيرة الذاتية', en: 'CV Analysis'  },
//   cover_letter: { ar: 'خطاب التقديم',          en: 'Cover Letter' },
//   interview:    { ar: 'مقابلة AI',              en: 'AI Interview' },
//   career_path:  { ar: 'المسار المهني',          en: 'Career Path'  },
//   auto_apply:   { ar: 'التقديم التلقائي',       en: 'Auto-Apply'   },
//   chat:         { ar: 'محادثة مهنية',           en: 'Career Chat'  },
//   skill_gap:    { ar: 'فجوة المهارات',          en: 'Skill Gap'    },
// };

// const fmtDate = (d, isAr) => {
//   if (!d) return '—';
//   return new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
// };
// const fmtDateTime = (d, isAr) => {
//   if (!d) return '—';
//   return new Date(d).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
// };
// const daysLeft = (expiresAt) => {
//   if (!expiresAt) return null;
//   const diff = new Date(expiresAt) - new Date();
//   return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
// };

// // ════════════════════════════════════════════════════════════
// // HERO BALANCE CARD
// // ════════════════════════════════════════════════════════════
// function BalanceCard({ user, wallet, isAr, font }) {
//   const planKey  = user?.planKey || 'free';
//   const plan     = PLAN_CONFIG[planKey] || PLAN_CONFIG.free;
//   const PlanIcon = plan.icon;
//   const pts      = parseInt(wallet?.pointsBalance || 0);
//   const expires  = user?.planExpiresAt;
//   const days     = daysLeft(expires);

//   // urgency color for expiry
//   const urgency  = days === null ? null : days <= 3 ? '#EF4444' : days <= 7 ? '#F59E0B' : '#22C55E';

//   return (
//     <div style={{
//       borderRadius: 20, padding: '28px 26px',
//       background: 'var(--bg-secondary)',
//       border: `1px solid ${plan.color}25`,
//       position: 'relative', overflow: 'hidden',
//       marginBottom: 12,
//     }}>
//       {/* Background glow */}
//       <div style={{
//         position: 'absolute', inset: 0, pointerEvents: 'none',
//         background: `radial-gradient(ellipse 60% 50% at 80% 20%, ${plan.glow}, transparent)`,
//       }} />
//       {/* Dot grid */}
//       <div style={{
//         position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35,
//         backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)',
//         backgroundSize: '24px 24px',
//       }} />

//       <div style={{ position: 'relative' }}>
//         {/* Top row: plan badge + expiry */}
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 10 }}>
//           {/* Plan pill */}
//           <div style={{
//             display: 'inline-flex', alignItems: 'center', gap: 7,
//             padding: '6px 14px', borderRadius: 99,
//             background: plan.bg, border: `1px solid ${plan.color}30`,
//           }}>
//             <PlanIcon size={13} color={plan.color} />
//             <span style={{ fontSize: 12.5, fontWeight: 800, color: plan.color, fontFamily: font, letterSpacing: '0.02em' }}>
//               {isAr ? plan.arName : plan.enName}
//             </span>
//           </div>

//           {/* Expiry */}
//           {planKey !== 'free' && expires && (
//             <div style={{
//               display: 'flex', alignItems: 'center', gap: 6,
//               padding: '5px 12px', borderRadius: 99,
//               background: `${urgency}12`, border: `1px solid ${urgency}30`,
//             }}>
//               <Calendar size={11} color={urgency} />
//               <span style={{ fontSize: 11.5, fontWeight: 700, color: urgency, fontFamily: 'var(--font-en)' }}>
//                 {days === 0 ? (isAr ? 'ينتهي اليوم' : 'Expires today') : isAr ? `${days} يوم متبقٍ` : `${days}d left`}
//               </span>
//               <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
//                 · {fmtDate(expires, isAr)}
//               </span>
//             </div>
//           )}

//           {planKey === 'free' && (
//             <Link to="/pricing" style={{ textDecoration: 'none' }}>
//               <span style={{ fontSize: 12, fontWeight: 700, color: '#818CF8', padding: '5px 12px', borderRadius: 99, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.2)' }}>
//                 {isAr ? 'ترقية ←' : 'Upgrade →'}
//               </span>
//             </Link>
//           )}
//         </div>

//         {/* Points number */}
//         <div style={{ marginBottom: 6 }}>
//           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 6px', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
//             {isAr ? 'رصيد النقاط' : 'Points Balance'}
//           </p>
//           <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
//             <span style={{
//               fontSize: 'clamp(3rem,8vw,4.5rem)', fontWeight: 900,
//               color: 'var(--text-primary)', letterSpacing: '-0.05em',
//               fontFamily: 'var(--font-en)', lineHeight: 1,
//             }}>
//               {pts.toLocaleString()}
//             </span>
//             <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontFamily: font, fontWeight: 500 }}>
//               {isAr ? 'نقطة' : 'pts'}
//             </span>
//           </div>
//         </div>

//         {/* Status line */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
//           {pts > 0 ? (
//             <><CheckCircle size={13} color="#22C55E" />
//             <span style={{ fontSize: 12.5, color: '#22C55E', fontWeight: 600, fontFamily: font }}>
//               {isAr ? 'النقاط نشطة' : 'Points active'}
//             </span></>
//           ) : (
//             <><Lock size={13} color="#EF4444" />
//             <span style={{ fontSize: 12.5, color: '#EF4444', fontWeight: 600, fontFamily: font }}>
//               {isAr ? 'لا نقاط متبقية' : 'No points remaining'}
//             </span></>
//           )}
//           {planKey !== 'free' && pts === 0 && (
//             <Link to="/pricing" style={{ marginInlineStart: 8, fontSize: 12, color: '#818CF8', fontWeight: 700, textDecoration: 'none' }}>
//               {isAr ? 'جدّد الآن →' : 'Renew →'}
//             </Link>
//           )}
//         </div>

//         {/* Low-points warning */}
//         {pts > 0 && pts < 50 && planKey !== 'free' && (
//           <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 10, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
//             <AlertCircle size={13} color="#F59E0B" style={{ flexShrink: 0 }} />
//             <span style={{ fontSize: 12, color: '#F59E0B', fontFamily: font }}>
//               {isAr ? 'نقاطك منخفضة — جدّد اشتراكك للحصول على المزيد' : 'Points running low — renew to get more'}
//             </span>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // STATS ROW
// // ════════════════════════════════════════════════════════════
// function StatsRow({ wallet, txs, isAr, font }) {
//   const spent  = txs.filter(t => (t.pointsDelta || 0) < 0).reduce((s, t) => s + Math.abs(t.pointsDelta || 0), 0);
//   const earned = txs.filter(t => (t.pointsDelta || 0) > 0).reduce((s, t) => s + (t.pointsDelta || 0), 0);
//   const aiUsed = txs.filter(t => t.rawType === 'ai_usage').length;

//   const items = [
//     { icon: ArrowUpRight, color: '#EF4444', label: isAr ? 'نقاط مُستخدمة' : 'Points spent',    value: spent.toLocaleString(),  unit: isAr ? 'نقطة' : 'pts' },
//     { icon: TrendingUp,   color: '#22C55E', label: isAr ? 'نقاط مكتسبة'  : 'Points earned',   value: earned.toLocaleString(), unit: isAr ? 'نقطة' : 'pts' },
//     { icon: Sparkles,     color: '#818CF8', label: isAr ? 'عمليات AI'     : 'AI operations',  value: aiUsed.toString(),       unit: isAr ? 'عملية' : 'ops' },
//   ];

//   return (
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
//       {items.map((item, i) => {
//         const Ic = item.icon;
//         return (
//           <div key={i} style={{
//             background: 'var(--bg-secondary)', border: '1px solid var(--border)',
//             borderRadius: 14, padding: '14px 16px',
//           }}>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
//               <div style={{ width: 28, height: 28, borderRadius: 8, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//                 <Ic size={13} color={item.color} />
//               </div>
//               <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.3 }}>{item.label}</span>
//             </div>
//             <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
//               {item.value}
//               <span style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', marginInlineStart: 4, fontFamily: font }}>{item.unit}</span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // TRANSACTION ROW
// // ════════════════════════════════════════════════════════════
// function TxRow({ tx, isAr, font, isLast }) {
//   const cfg    = TX_CONFIG[tx.rawType] || TX_CONFIG.default;
//   const TxIcon = cfg.icon;
//   const pts    = tx.pointsDelta || 0;
//   const isGain = pts > 0;

//   // Detect AI feature name from description
//   const desc = (tx.description || '').toLowerCase();
//   let featureName = null;
//   for (const [key, names] of Object.entries(FEATURE_NAMES)) {
//     if (desc.includes(key) || desc.includes(names.en.toLowerCase())) {
//       featureName = isAr ? names.ar : names.en;
//       break;
//     }
//   }

//   const displayLabel = featureName || (isAr ? cfg.arLabel : cfg.enLabel);

//   return (
//     <div
//       style={{
//         display: 'flex', alignItems: 'center', gap: 14,
//         padding: '14px 20px',
//         borderBottom: isLast ? 'none' : '1px solid var(--border)',
//         transition: 'background .12s',
//       }}
//       onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-primary)'; }}
//       onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
//     >
//       {/* Icon */}
//       <div style={{
//         width: 42, height: 42, borderRadius: 12, flexShrink: 0,
//         background: `${cfg.color}10`, border: `1px solid ${cfg.color}18`,
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//       }}>
//         <TxIcon size={17} color={cfg.color} strokeWidth={1.8} />
//       </div>

//       {/* Label + time */}
//       <div style={{ flex: 1, minWidth: 0 }}>
//         <p style={{
//           fontSize: 13.5, fontWeight: 600, margin: '0 0 4px',
//           fontFamily: font, color: 'var(--text-primary)',
//           overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
//         }}>
//           {displayLabel}
//         </p>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
//             {fmtDateTime(tx.createdAt, isAr)}
//           </span>
//           {tx.rawType === 'ai_usage' && (
//             <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(239,68,68,.07)', color: '#EF4444', fontWeight: 700 }}>AI</span>
//           )}
//           {tx.rawType === 'subscription_reward' && (
//             <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(129,140,248,.08)', color: '#818CF8', fontWeight: 700 }}>
//               {isAr ? 'اشتراك' : 'Plan'}
//             </span>
//           )}
//           {tx.rawType === 'referral_reward' && (
//             <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 99, background: 'rgba(245,158,11,.08)', color: '#F59E0B', fontWeight: 700 }}>
//               {isAr ? 'إحالة' : 'Referral'}
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Points delta */}
//       {pts !== 0 && (
//         <div style={{ textAlign: 'end', flexShrink: 0 }}>
//           <span style={{
//             fontSize: 16, fontWeight: 800,
//             color: isGain ? '#22C55E' : '#EF4444',
//             fontFamily: 'var(--font-en)',
//           }}>
//             {isGain ? '+' : ''}{pts.toLocaleString()}
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginInlineStart: 4, fontFamily: font }}>
//             {isAr ? 'نقطة' : 'pts'}
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // EXPIRY RENEWAL BANNER
// // ════════════════════════════════════════════════════════════
// function RenewalBanner({ user, isAr, font }) {
//   const days = daysLeft(user?.planExpiresAt);
//   if (!user || user.planKey === 'free' || days === null || days > 7) return null;
//   return (
//     <div style={{
//       marginBottom: 12, padding: '14px 18px', borderRadius: 14,
//       background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.18)',
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//         <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
//         <div>
//           <p style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', margin: '0 0 2px', fontFamily: font }}>
//             {isAr ? 'خطتك تنتهي قريباً' : 'Your plan expires soon'}
//           </p>
//           <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//             {isAr
//               ? 'عند الانتهاء ستُصفَّر نقاطك وتعود للخطة المجانية'
//               : 'Points reset to 0 when your plan expires'}
//           </p>
//         </div>
//       </div>
//       <Link to="/pricing" style={{ textDecoration: 'none' }}>
//         <button style={{
//           padding: '8px 18px', borderRadius: 9, border: 'none',
//           background: '#EF4444', color: '#fff', fontWeight: 700,
//           fontSize: 13, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap',
//         }}>
//           {isAr ? 'جدّد الآن' : 'Renew Now'}
//         </button>
//       </Link>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // MAIN PAGE
// // ════════════════════════════════════════════════════════════
// export default function WalletPage() {
//   const { lang } = useLang();
//   const { user } = useAuthStore();
//   const isAr     = lang === 'ar';
//   const font     = isAr ? 'var(--font-ar)' : 'var(--font-en)';

//   const [collapsed, setCollapsed] = useState(false);
//   const [wallet,    setWallet]    = useState(null);
//   const [txs,       setTxs]       = useState([]);
//   const [loading,   setLoading]   = useState(true);
//   const [txLoading, setTxLoading] = useState(false);
//   const [page,      setPage]      = useState(1);
//   const [hasMore,   setHasMore]   = useState(true);
//   const [filter,    setFilter]    = useState('all');

//   const FILTERS = [
//     { key: 'all',   ar: 'الكل',       en: 'All'      },
//     { key: 'ai',    ar: 'استخدام AI', en: 'AI Usage' },
//     { key: 'gains', ar: 'المكاسب',    en: 'Gains'    },
//   ];

//   // ── Load wallet ──────────────────────────────────────────
//   const loadWallet = useCallback(async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/wallet/me');
//       setWallet(data.data);
//     } catch {
//       setWallet({ pointsBalance: 0, cashBalance: 0, currency: 'USD' });
//     } finally { setLoading(false); }
//   }, []);

//   // ── Load transactions ────────────────────────────────────
//   const loadTxs = useCallback(async (pg = 1, reset = false) => {
//     setTxLoading(true);
//     try {
//       const params = { page: pg, limit: 15 };
//       if (filter === 'ai')    params.type = 'ai_usage';
//       if (filter === 'gains') params.type = 'gains';

//       const { data } = await api.get('/wallet/transactions', { params });
//       const list = Array.isArray(data.data) ? data.data : (data.data?.rows || []);
//       const mapped = list.map(t => ({
//         ...t,
//         rawType:     t.rawType || t.type,
//         pointsDelta: parseInt(t.pointsDelta || t.pointsAmount || 0),
//         cashDelta:   parseFloat(t.cashDelta || t.amount || 0),
//       }));
//       setTxs(prev => reset ? mapped : [...prev, ...mapped]);
//       setHasMore(list.length === 15);
//     } catch { if (reset) setTxs([]); }
//     finally { setTxLoading(false); }
//   }, [filter]);

//   useEffect(() => { loadWallet(); }, [loadWallet]);
//   useEffect(() => { setPage(1); loadTxs(1, true); }, [filter, loadTxs]);

//   const loadMore = () => { const next = page + 1; setPage(next); loadTxs(next, false); };

//   // ─── Skeleton ───────────────────────────────────────────
//   const Skel = ({ h = 80, r = 16 }) => (
//     <div style={{ height: h, borderRadius: r, background: 'var(--bg-secondary)', animation: 'wPulse 1.5s ease-in-out infinite', border: '1px solid var(--border)' }} />
//   );

//   return (
//     <>
//       <style>{`
//         * { box-sizing: border-box; }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
//         @keyframes spin    { to { transform: rotate(360deg); } }
//         @keyframes wPulse  { 0%,100%{opacity:1} 50%{opacity:.45} }
//         @media(max-width:1024px){ .wlt-main { padding-bottom: 80px !important; } }
//         @media(max-width:600px){ .wlt-stats { grid-template-columns: 1fr 1fr !important; } }
//       `}</style>

//       <div style={{
//         display: 'flex', minHeight: '100vh',
//         background: 'var(--bg-primary)', color: 'var(--text-primary)',
//         fontFamily: font, direction: isAr ? 'rtl' : 'ltr',
//       }}>
//         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//           <MobileTopBar title={isAr ? 'نقاطي' : 'My Points'} />

//           <main className="wlt-main" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)' }}>
//             <div style={{ maxWidth: 620, margin: '0 auto' }}>

//               {/* ── Page heading ── */}
//               <div style={{ marginBottom: 22 }}>
//                 <h1 style={{
//                   fontSize: 'clamp(1.1rem,3vw,1.45rem)',
//                   fontWeight: 900, margin: '0 0 4px',
//                   letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 9,
//                 }}>
//                   <Star size={20} color="#F59E0B" fill="#F59E0B" strokeWidth={0} />
//                   {isAr ? 'نقاطي' : 'My Points'}
//                 </h1>
//                 <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//                   {isAr
//                     ? 'نقاطك تُخصم تلقائياً عند استخدام ميزات الذكاء الاصطناعي'
//                     : 'Points are deducted automatically when you use AI features'}
//                 </p>
//               </div>

//               {/* ── Balance card ── */}
//               {loading
//                 ? <Skel h={220} r={20} />
//                 : <BalanceCard user={user} wallet={wallet} isAr={isAr} font={font} />
//               }

//               {/* ── Stats row ── */}
//               {!loading && (
//                 <div className="wlt-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 12 }}>
//                   <StatsRow wallet={wallet} txs={txs} isAr={isAr} font={font} />
//                 </div>
//               )}

//               {/* ── Renewal banner ── */}
//               <RenewalBanner user={user} isAr={isAr} font={font} />

//               {/* ── Upgrade CTA (free users) ── */}
//               {!loading && user?.planKey === 'free' && (
//                 <div style={{
//                   marginBottom: 12, padding: '18px 20px', borderRadius: 16,
//                   background: 'linear-gradient(135deg, rgba(129,140,248,.08), rgba(245,158,11,.05))',
//                   border: '1px solid rgba(129,140,248,.18)',
//                   display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap',
//                 }}>
//                   <div>
//                     <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px', fontFamily: font }}>
//                       {isAr ? '✨ اشترك في Pro' : '✨ Upgrade to Pro'}
//                     </p>
//                     <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
//                       {isAr ? 'احصل على نقاط فور الاشتراك وابدأ استخدام AI' : 'Get points instantly and start using AI features'}
//                     </p>
//                   </div>
//                   <Link to="/pricing" style={{ textDecoration: 'none' }}>
//                     <button style={{
//                       padding: '10px 22px', borderRadius: 11, border: 'none',
//                       background: '#818CF8', color: '#fff', fontWeight: 700,
//                       fontSize: 13.5, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap',
//                     }}>
//                       {isAr ? 'عرض الخطط' : 'View Plans'}
//                     </button>
//                   </Link>
//                 </div>
//               )}

//               {/* ── Activity log ── */}
//               <div style={{
//                 background: 'var(--bg-secondary)', border: '1px solid var(--border)',
//                 borderRadius: 16, overflow: 'hidden',
//               }}>
//                 {/* Header + filter tabs */}
//                 <div style={{
//                   padding: '14px 20px', borderBottom: '1px solid var(--border)',
//                   display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                   flexWrap: 'wrap', gap: 10,
//                 }}>
//                   <p style={{ fontSize: 13.5, fontWeight: 700, fontFamily: font, margin: 0 }}>
//                     {isAr ? 'سجل النشاط' : 'Activity'}
//                   </p>
//                   <div style={{ display: 'flex', gap: 5 }}>
//                     {FILTERS.map(f => (
//                       <button key={f.key} onClick={() => setFilter(f.key)} style={{
//                         padding: '5px 13px', borderRadius: 8, fontSize: 12,
//                         fontWeight: filter === f.key ? 700 : 500, cursor: 'pointer', fontFamily: font,
//                         border: `1px solid ${filter === f.key ? 'var(--text-primary)' : 'var(--border)'}`,
//                         background: filter === f.key ? 'var(--text-primary)' : 'transparent',
//                         color: filter === f.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
//                         transition: 'all .12s',
//                       }}>
//                         {isAr ? f.ar : f.en}
//                       </button>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Tx list */}
//                 {txLoading && txs.length === 0 ? (
//                   <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
//                     <RefreshCw size={22} color="var(--text-secondary)" style={{ animation: 'spin 1s linear infinite' }} />
//                   </div>
//                 ) : txs.length === 0 ? (
//                   <div style={{ textAlign: 'center', padding: '52px 20px', color: 'var(--text-secondary)' }}>
//                     <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
//                       <Activity size={22} color="var(--text-secondary)" strokeWidth={1.5} style={{ opacity: 0.4 }} />
//                     </div>
//                     <p style={{ fontFamily: font, fontSize: 13.5, fontWeight: 600, margin: '0 0 5px' }}>
//                       {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
//                     </p>
//                     <p style={{ fontFamily: font, fontSize: 12, opacity: 0.5, margin: 0 }}>
//                       {isAr ? 'استخدم ميزات AI لرؤية نشاطك هنا' : 'Use AI features to see your activity here'}
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     {txs.map((tx, i) => (
//                       <TxRow
//                         key={tx.id || i} tx={tx} isAr={isAr} font={font}
//                         isLast={i === txs.length - 1 && !hasMore}
//                       />
//                     ))}
//                     {hasMore && (
//                       <div style={{ padding: '13px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
//                         <button
//                           onClick={loadMore} disabled={txLoading}
//                           style={{
//                             padding: '8px 22px', borderRadius: 9,
//                             border: '1px solid var(--border)', background: 'transparent',
//                             color: 'var(--text-secondary)', cursor: 'pointer',
//                             fontSize: 13, fontFamily: font,
//                             display: 'inline-flex', alignItems: 'center', gap: 7,
//                           }}>
//                           {txLoading
//                             ? <RefreshCw size={12} style={{ animation: 'spin .8s linear infinite' }} />
//                             : <ChevronRight size={12} />}
//                           {isAr ? 'تحميل المزيد' : 'Load more'}
//                         </button>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               {/* Frozen wallet warning */}
//               {wallet?.isFrozen && (
//                 <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 11, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
//                   <Lock size={15} color="#EF4444" style={{ flexShrink: 0 }} />
//                   <p style={{ fontSize: 13, color: '#EF4444', margin: 0, fontFamily: font }}>
//                     {isAr ? 'محفظتك مجمدة مؤقتاً. تواصل مع الدعم.' : 'Your wallet is temporarily frozen. Contact support.'}
//                   </p>
//                 </div>
//               )}

//               <div style={{ height: 24 }} />
//             </div>
//           </main>
//         </div>
//       </div>

//       <MobileBottomNav />
//     </>
//   );
// }

'use strict';
// frontend/src/pages/Dashboard/WalletPage.jsx

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Star, Zap, Crown, ArrowDownLeft, ArrowUpRight,
  Clock, RefreshCw, Gift, ChevronRight, AlertCircle,
  TrendingUp, Calendar, Award, Sparkles, Lock,
  ShieldCheck, CheckCircle, Activity, Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// ─── Config ──────────────────────────────────────────────────
const PLAN_CONFIG = {
  free:  { color: '#6B7280', bg: 'rgba(107,114,128,.12)', glow: 'rgba(107,114,128,.04)',  icon: Star,   arName: 'مجاني',   enName: 'Free'  },
  pro:   { color: '#818CF8', bg: 'rgba(129,140,248,.12)', glow: 'rgba(129,140,248,.07)',  icon: Crown,  arName: 'Pro',     enName: 'Pro'   },
  elite: { color: '#F59E0B', bg: 'rgba(245,158,11,.12)',  glow: 'rgba(245,158,11,.08)',   icon: Zap,    arName: 'Elite',   enName: 'Elite' },
};

const TX_CONFIG = {
  subscription_reward: { arLabel: 'مكافأة اشتراك',  enLabel: 'Subscription Bonus', icon: Gift,         color: '#818CF8', gain: true  },
  ai_usage:            { arLabel: 'استخدام AI',       enLabel: 'AI Usage',           icon: Sparkles,     color: '#EF4444', gain: false },
  referral_reward:     { arLabel: 'مكافأة إحالة',    enLabel: 'Referral Bonus',     icon: Star,         color: '#F59E0B', gain: true  },
  admin_adjustment:    { arLabel: 'تعديل إداري',      enLabel: 'Admin Adjustment',   icon: ShieldCheck,  color: '#3B82F6', gain: null  },
  purchase:            { arLabel: 'شراء',              enLabel: 'Purchase',           icon: ArrowUpRight, color: '#EF4444', gain: false },
  refund:              { arLabel: 'استرداد',           enLabel: 'Refund',             icon: ArrowDownLeft,color: '#22C55E', gain: true  },
  chat_time:           { arLabel: 'وقت محادثة',       enLabel: 'Chat Time',          icon: Clock,        color: '#EF4444', gain: false },
  default:             { arLabel: 'معاملة',             enLabel: 'Transaction',        icon: Activity,     color: '#6B7280', gain: null  },
};

const FEATURE_NAMES = {
  cv_analysis:  { ar: 'تحليل السيرة الذاتية', en: 'CV Analysis'  },
  cover_letter: { ar: 'خطاب التقديم',          en: 'Cover Letter' },
  interview:    { ar: 'مقابلة AI',              en: 'AI Interview' },
  career_path:  { ar: 'المسار المهني',          en: 'Career Path'  },
  auto_apply:   { ar: 'التقديم التلقائي',       en: 'Auto-Apply'   },
  chat:         { ar: 'محادثة مهنية',           en: 'Career Chat'  },
  skill_gap:    { ar: 'فجوة المهارات',          en: 'Skill Gap'    },
};

const fmtDate = (d, isAr) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const fmtDateTime = (d, isAr) => {
  if (!d) return '—';
  return new Date(d).toLocaleString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const daysLeft = (expiresAt) => {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ─── Count-up hook ───────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setVal(Math.round(eased * target));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return val;
}

// ════════════════════════════════════════════════════════════
// SKELETON
// ════════════════════════════════════════════════════════════
function Skel({ h = 80, r = 14 }) {
  return (
    <div style={{ height: h, borderRadius: r, background: 'var(--bg-secondary)', animation: 'wPulse 1.6s ease-in-out infinite', border: '1px solid var(--border)' }} />
  );
}

// ════════════════════════════════════════════════════════════
// HERO BALANCE CARD
// ════════════════════════════════════════════════════════════
function BalanceCard({ user, wallet, isAr, font }) {
  const planKey  = user?.planKey || 'free';
  const plan     = PLAN_CONFIG[planKey] || PLAN_CONFIG.free;
  const PlanIcon = plan.icon;
  const pts      = parseInt(wallet?.pointsBalance || 0);
  const animated = useCountUp(pts);
  const expires  = user?.planExpiresAt;
  const days     = daysLeft(expires);
  const urgency  = days === null ? null : days <= 3 ? '#EF4444' : days <= 7 ? '#F59E0B' : '#22C55E';

  // Progress ring: show percentage of a theoretical "full" balance (visual only)
  const ringMax  = Math.max(pts, 500);
  const pct      = pts / ringMax;
  const R = 22; const C = 2 * Math.PI * R;

  return (
    <div style={{
      borderRadius: 22, padding: '26px 24px 22px',
      background: 'var(--bg-secondary)',
      border: `1px solid ${plan.color}28`,
      position: 'relative', overflow: 'hidden',
      marginBottom: 14,
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 60% at 90% 10%, ${plan.glow}, transparent 70%)` }} />
      {/* Fine dot grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.22, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />

      <div style={{ position: 'relative' }}>
        {/* ── Top row: plan pill + expiry ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 13px', borderRadius: 99, background: plan.bg, border: `1px solid ${plan.color}28` }}>
            <PlanIcon size={12} color={plan.color} />
            <span style={{ fontSize: 12, fontWeight: 800, color: plan.color, fontFamily: 'var(--font-en)', letterSpacing: '0.04em' }}>
              {isAr ? plan.arName : plan.enName}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {planKey !== 'free' && expires && urgency && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, background: `${urgency}12`, border: `1px solid ${urgency}28` }}>
                <Calendar size={11} color={urgency} />
                <span style={{ fontSize: 11.5, fontWeight: 700, color: urgency, fontFamily: 'var(--font-en)' }}>
                  {days === 0 ? (isAr ? 'ينتهي اليوم' : 'Today') : isAr ? `${days} يوم` : `${days}d`}
                </span>
              </div>
            )}
            {planKey === 'free' && (
              <Link to="/pricing" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#818CF8', padding: '5px 12px', borderRadius: 99, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.22)', cursor: 'pointer' }}>
                  {isAr ? 'ترقية ←' : 'Upgrade →'}
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* ── Balance hero ── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 8px', fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isAr ? 'رصيد النقاط' : 'Points Balance'}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontSize: 'clamp(2.8rem,9vw,4.2rem)', fontWeight: 900, lineHeight: 1,
                color: pts === 0 ? 'var(--text-secondary)' : 'var(--text-primary)',
                fontFamily: 'var(--font-en)', letterSpacing: '-0.04em',
                transition: 'color 0.3s',
              }}>
                {animated.toLocaleString()}
              </span>
              <span style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: font, fontWeight: 500, paddingBottom: 4 }}>
                {isAr ? 'نقطة' : 'pts'}
              </span>
            </div>

            {/* Status line */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
              {pts > 0 ? (
                <>
                  <CheckCircle size={12} color="#22C55E" />
                  <span style={{ fontSize: 12, color: '#22C55E', fontWeight: 600, fontFamily: font }}>
                    {isAr ? 'النقاط نشطة' : 'Active'}
                  </span>
                </>
              ) : (
                <>
                  <Lock size={12} color="#EF4444" />
                  <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600, fontFamily: font }}>
                    {isAr ? 'لا نقاط' : 'Empty'}
                  </span>
                  {planKey !== 'free' && (
                    <Link to="/pricing" style={{ marginInlineStart: 6, fontSize: 12, color: '#818CF8', fontWeight: 700, textDecoration: 'none' }}>
                      {isAr ? 'جدّد ←' : 'Renew →'}
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Progress ring */}
          <svg width={56} height={56} viewBox="0 0 56 56" style={{ flexShrink: 0, opacity: pts === 0 ? 0.25 : 1, transition: 'opacity 0.4s' }}>
            <circle cx={28} cy={28} r={R} fill="none" stroke="var(--border)" strokeWidth={4} />
            <circle
              cx={28} cy={28} r={R} fill="none"
              stroke={plan.color} strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - pct)}
              transform="rotate(-90 28 28)"
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
            />
            <PlanIcon x={16} y={16} size={24} color={plan.color} />
          </svg>
        </div>

        {/* Low-points warning */}
        {pts > 0 && pts < 50 && planKey !== 'free' && (
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 13px', borderRadius: 10, background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
            <AlertCircle size={13} color="#F59E0B" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#F59E0B', fontFamily: font }}>
              {isAr ? 'نقاطك تكاد تنتهي' : 'Points running low'}
              {' · '}
              <Link to="/pricing" style={{ color: '#F59E0B', fontWeight: 700, textDecoration: 'underline' }}>
                {isAr ? 'جدّد الاشتراك' : 'Renew'}
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// STATS STRIP  (three inline tiles, no nested grid bug)
// ════════════════════════════════════════════════════════════
function StatTile({ icon: Ic, color, label, value, unit }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: '13px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic size={13} color={color} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.3 }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
        {value}
        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginInlineStart: 4 }}>{unit}</span>
      </div>
    </div>
  );
}

function StatsStrip({ txs, isAr, font }) {
  const spent  = txs.filter(t => (t.pointsDelta || 0) < 0).reduce((s, t) => s + Math.abs(t.pointsDelta || 0), 0);
  const earned = txs.filter(t => (t.pointsDelta || 0) > 0).reduce((s, t) => s + (t.pointsDelta || 0), 0);
  const aiUsed = txs.filter(t => t.rawType === 'ai_usage').length;
  return (
    <>
      <StatTile icon={ArrowUpRight} color="#EF4444" label={isAr ? 'نقاط مُستخدمة' : 'Points spent'}   value={spent.toLocaleString()}  unit={isAr ? 'نقطة' : 'pts'} />
      <StatTile icon={TrendingUp}   color="#22C55E" label={isAr ? 'نقاط مكتسبة'  : 'Points earned'}  value={earned.toLocaleString()} unit={isAr ? 'نقطة' : 'pts'} />
      <StatTile icon={Sparkles}     color="#818CF8" label={isAr ? 'عمليات AI'     : 'AI operations'} value={aiUsed.toString()}       unit={isAr ? 'عملية' : 'ops'} />
    </>
  );
}

// ════════════════════════════════════════════════════════════
// RENEWAL BANNER
// ════════════════════════════════════════════════════════════
function RenewalBanner({ user, isAr, font }) {
  const days = daysLeft(user?.planExpiresAt);
  if (!user || user.planKey === 'free' || days === null || days > 7) return null;
  return (
    <div style={{
      marginBottom: 14, padding: '13px 18px', borderRadius: 13,
      background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#EF4444', margin: '0 0 2px', fontFamily: font }}>
            {isAr ? 'خطتك تنتهي قريباً' : 'Your plan expires soon'}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
            {isAr ? 'عند الانتهاء ستُصفَّر نقاطك وتعود للخطة المجانية' : 'Points reset to 0 when your plan expires'}
          </p>
        </div>
      </div>
      <Link to="/pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <button style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: '#EF4444', color: '#fff', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap' }}>
          {isAr ? 'جدّد الآن' : 'Renew Now'}
        </button>
      </Link>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TRANSACTION ROW
// ════════════════════════════════════════════════════════════
function TxRow({ tx, isAr, font, isLast, planColor }) {
  const cfg    = TX_CONFIG[tx.rawType] || TX_CONFIG.default;
  const TxIcon = cfg.icon;
  const pts    = tx.pointsDelta || 0;
  const isGain = pts > 0;

  const desc = (tx.description || '').toLowerCase();
  let featureName = null;
  for (const [key, names] of Object.entries(FEATURE_NAMES)) {
    if (desc.includes(key) || desc.includes(names.en.toLowerCase())) {
      featureName = isAr ? names.ar : names.en;
      break;
    }
  }
  const displayLabel = featureName || (isAr ? cfg.arLabel : cfg.enLabel);

  return (
    <div
      role="listitem"
      style={{
        display: 'flex', alignItems: 'center', gap: 13,
        padding: '13px 18px',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        borderInlineStart: `2.5px solid transparent`,
        transition: 'background .12s, border-inline-start-color .12s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-primary)';
        e.currentTarget.style.borderInlineStartColor = planColor || cfg.color;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.borderInlineStartColor = 'transparent';
      }}
    >
      {/* Icon */}
      <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: `${cfg.color}10`, border: `1px solid ${cfg.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <TxIcon size={16} color={cfg.color} strokeWidth={1.8} />
      </div>

      {/* Label + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13.5, fontWeight: 600, margin: '0 0 3px', fontFamily: font, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayLabel}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
            {fmtDateTime(tx.createdAt, isAr)}
          </span>
          {tx.rawType === 'ai_usage' && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 5, background: 'rgba(239,68,68,.08)', color: '#EF4444', fontWeight: 700, fontFamily: 'var(--font-en)' }}>AI</span>
          )}
          {tx.rawType === 'subscription_reward' && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 5, background: 'rgba(129,140,248,.08)', color: '#818CF8', fontWeight: 700, fontFamily: 'var(--font-en)' }}>
              {isAr ? 'اشتراك' : 'Plan'}
            </span>
          )}
          {tx.rawType === 'referral_reward' && (
            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 5, background: 'rgba(245,158,11,.08)', color: '#F59E0B', fontWeight: 700, fontFamily: 'var(--font-en)' }}>
              {isAr ? 'إحالة' : 'Referral'}
            </span>
          )}
        </div>
      </div>

      {/* Points delta */}
      {pts !== 0 && (
        <div style={{ textAlign: 'end', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: isGain ? '#22C55E' : '#EF4444', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
            {isGain ? '+' : ''}{pts.toLocaleString()}
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontFamily: font, marginTop: 2 }}>
            {isAr ? 'نقطة' : 'pts'}
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// DIVIDER — the single signature design element:
// a hairline with a centered gold gradient, physically divides
// the "your wealth" top half from the "history" bottom half
// ════════════════════════════════════════════════════════════
function GoldDivider() {
  return (
    <div style={{ position: 'relative', height: 1, margin: '18px 0' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'var(--border)' }} />
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 0, width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, #F59E0B80, transparent)' }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function WalletPage() {
  const { lang } = useLang();
  const { user } = useAuthStore();
  const isAr     = lang === 'ar';
  const font     = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const planKey  = user?.planKey || 'free';
  const planColor = PLAN_CONFIG[planKey]?.color || '#6B7280';

  const [collapsed, setCollapsed] = useState(false);
  const [wallet,    setWallet]    = useState(null);
  const [txs,       setTxs]       = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [page,      setPage]      = useState(1);
  const [hasMore,   setHasMore]   = useState(true);
  const [filter,    setFilter]    = useState('all');

  const FILTERS = [
    { key: 'all',   ar: 'الكل',       en: 'All'      },
    { key: 'ai',    ar: 'استخدام AI', en: 'AI Usage' },
    { key: 'gains', ar: 'المكاسب',    en: 'Gains'    },
  ];

  const loadWallet = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/wallet/me');
      setWallet(data.data);
    } catch {
      setWallet({ pointsBalance: 0, cashBalance: 0, currency: 'USD' });
    } finally { setLoading(false); }
  }, []);

  const loadTxs = useCallback(async (pg = 1, reset = false) => {
    setTxLoading(true);
    try {
      const params = { page: pg, limit: 15 };
      if (filter === 'ai')    params.type = 'ai_usage';
      if (filter === 'gains') params.type = 'gains';
      const { data } = await api.get('/wallet/transactions', { params });
      const list = Array.isArray(data.data) ? data.data : (data.data?.rows || []);
      const mapped = list.map(t => ({
        ...t,
        rawType:     t.rawType || t.type,
        pointsDelta: parseInt(t.pointsDelta || t.pointsAmount || 0),
        cashDelta:   parseFloat(t.cashDelta || t.amount || 0),
      }));
      setTxs(prev => reset ? mapped : [...prev, ...mapped]);
      setHasMore(list.length === 15);
    } catch { if (reset) setTxs([]); }
    finally { setTxLoading(false); }
  }, [filter]);

  useEffect(() => { loadWallet(); }, [loadWallet]);
  useEffect(() => { setPage(1); loadTxs(1, true); }, [filter, loadTxs]);

  const loadMore = () => { const next = page + 1; setPage(next); loadTxs(next, false); };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes wPulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @media(max-width:1024px){ .wlt-main { padding-bottom: 88px !important; } }
        @media(max-width:560px) { .wlt-stats { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:560px) { .wlt-stats .wlt-stat-3rd { display: none; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <MobileTopBar title={isAr ? 'نقاطي' : 'My Points'} />

          <main className="wlt-main" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)' }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>

              {/* ── Page heading ── */}
              <div style={{ marginBottom: 20 }}>
                <h1 style={{ fontSize: 'clamp(1.1rem,3vw,1.4rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 9 }}>
                  <Wallet size={20} color="#F59E0B" />
                  {isAr ? 'نقاطي' : 'My Points'}
                </h1>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'نقاطك تُخصم تلقائياً عند استخدام ميزات الذكاء الاصطناعي' : 'Points are deducted automatically when you use AI features'}
                </p>
              </div>

              {/* ── Balance card ── */}
              {loading ? <Skel h={210} r={22} /> : <BalanceCard user={user} wallet={wallet} isAr={isAr} font={font} />}

              {/* ── Stats grid ── */}
              {!loading && (
                <div className="wlt-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  <StatsStrip txs={txs} isAr={isAr} font={font} />
                </div>
              )}
              {loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                  <Skel h={78} /><Skel h={78} /><Skel h={78} />
                </div>
              )}

              {/* ── Renewal banner ── */}
              <RenewalBanner user={user} isAr={isAr} font={font} />

              {/* ── Upgrade CTA (free users) ── */}
              {!loading && planKey === 'free' && (
                <div style={{ marginBottom: 14, padding: '16px 20px', borderRadius: 16, background: 'linear-gradient(135deg, rgba(129,140,248,.08), rgba(245,158,11,.05))', border: '1px solid rgba(129,140,248,.18)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', fontFamily: font }}>
                      {isAr ? 'اشترك في Pro للحصول على نقاط' : 'Upgrade to Pro for points'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                      {isAr ? 'ابدأ استخدام ميزات AI فوراً بعد الاشتراك' : 'Start using AI features right after subscribing'}
                    </p>
                  </div>
                  <Link to="/pricing" style={{ textDecoration: 'none', flexShrink: 0 }}>
                    <button style={{ padding: '9px 20px', borderRadius: 10, border: 'none', background: '#818CF8', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: font, whiteSpace: 'nowrap' }}>
                      {isAr ? 'عرض الخطط' : 'View Plans'}
                    </button>
                  </Link>
                </div>
              )}

              {/* ── Divider ── */}
              <GoldDivider />

              {/* ── Activity log ── */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, fontFamily: font, margin: 0 }}>
                    {isAr ? 'سجل النشاط' : 'Activity'}
                  </p>
                  {/* Filter tabs */}
                  <div style={{ display: 'flex', gap: 5 }} role="tablist" aria-label={isAr ? 'تصفية' : 'Filter'}>
                    {FILTERS.map(f => (
                      <button
                        key={f.key}
                        role="tab"
                        aria-selected={filter === f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                          padding: '5px 12px', borderRadius: 8, fontSize: 12,
                          fontWeight: filter === f.key ? 700 : 500, cursor: 'pointer', fontFamily: font,
                          border: `1px solid ${filter === f.key ? 'var(--text-primary)' : 'var(--border)'}`,
                          background: filter === f.key ? 'var(--text-primary)' : 'transparent',
                          color: filter === f.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                          transition: 'all .14s', outline: 'none',
                        }}
                      >
                        {isAr ? f.ar : f.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction list */}
                {txLoading && txs.length === 0 ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '52px 0' }}>
                    <RefreshCw size={22} color="var(--text-secondary)" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                ) : txs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '52px 20px' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                      <Activity size={22} color="var(--text-secondary)" strokeWidth={1.5} style={{ opacity: 0.35 }} />
                    </div>
                    <p style={{ fontFamily: font, fontSize: 13.5, fontWeight: 600, margin: '0 0 5px', color: 'var(--text-primary)' }}>
                      {isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}
                    </p>
                    <p style={{ fontFamily: font, fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                      {isAr ? 'استخدم ميزات AI لرؤية سجل نشاطك هنا' : 'Use AI features to see your activity here'}
                    </p>
                  </div>
                ) : (
                  <div role="list">
                    {txs.map((tx, i) => (
                      <TxRow
                        key={tx.id || i} tx={tx} isAr={isAr} font={font}
                        isLast={i === txs.length - 1 && !hasMore}
                        planColor={planColor}
                      />
                    ))}
                    {hasMore && (
                      <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
                        <button
                          onClick={loadMore}
                          disabled={txLoading}
                          style={{ padding: '8px 22px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: txLoading ? 'not-allowed' : 'pointer', fontSize: 12.5, fontFamily: font, display: 'inline-flex', alignItems: 'center', gap: 7, opacity: txLoading ? 0.6 : 1 }}
                        >
                          {txLoading
                            ? <RefreshCw size={12} style={{ animation: 'spin .8s linear infinite' }} />
                            : <ChevronRight size={12} />}
                          {isAr ? 'تحميل المزيد' : 'Load more'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Frozen wallet */}
              {wallet?.isFrozen && (
                <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 11, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Lock size={15} color="#EF4444" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 13, color: '#EF4444', margin: 0, fontFamily: font }}>
                    {isAr ? 'محفظتك مجمدة مؤقتاً. تواصل مع الدعم.' : 'Your wallet is temporarily frozen. Contact support.'}
                  </p>
                </div>
              )}

              <div style={{ height: 28 }} />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}