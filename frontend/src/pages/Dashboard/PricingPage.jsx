

// 'use strict';
// // frontend/src/pages/Dashboard/PricingPage.jsx
// // ════════════════════════════════════════════════════════════
// // Professional pricing page with unified card sizes and theme support
// // ════════════════════════════════════════════════════════════

// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Check, Zap, Crown, Star, X, ChevronDown,
//   Clock, FileText, RefreshCw, ArrowRight, ArrowLeft,
//   Sparkles, Shield, Copy, Upload, AlertCircle, Circle,
// } from 'lucide-react';
// import useLang from '../../i18n';
// import useThemeStore from '../../store/themeStore';
// import useAuthStore from '../../store/authStore';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// // ════════════════════════════════════════════════════════════
// //  DESIGN TOKENS — Theme aware
// // ════════════════════════════════════════════════════════════
// const getThemeColors = (isDark) => ({
//   black:    isDark ? '#000000' : '#FFFFFF',
//   surface:  isDark ? '#0A0A0A' : '#F5F5F5',
//   card:     isDark ? '#111111' : '#FFFFFF',
//   border:   isDark ? '#222222' : '#E5E5E5',
//   borderHi: isDark ? '#333333' : '#D4D4D4',
//   textPri:  isDark ? '#F8F8F0' : '#1A1A1A',
//   textSec:  isDark ? '#6B6B6B' : '#737373',
//   gold:     '#D4A017',
//   goldSoft: '#F5C842',
// });

// // ════════════════════════════════════════════════════════════
// //  PLAN APPEARANCE MAP
// // ════════════════════════════════════════════════════════════
// const PLAN_STYLE = {
//   free: {
//     glow:    'rgba(107,114,128,0.18)',
//     color:   '#9CA3AF',
//     border:  '#2A2A2A',
//     Icon:    Star,
//     label:   { en: 'Free',  ar: 'مجاني'   },
//   },
//   pro: {
//     glow:    'rgba(212,160,23,0.22)',
//     color:   '#D4A017',
//     border:  '#D4A01755',
//     Icon:    Zap,
//     label:   { en: 'Pro',   ar: 'احترافي' },
//     popular: true,
//   },
//   elite: {
//     glow:    'rgba(139,92,246,0.22)',
//     color:   '#A78BFA',
//     border:  'rgba(139,92,246,0.45)',
//     Icon:    Crown,
//     label:   { en: 'Elite', ar: 'النخبة'  },
//   },
// };

// // ════════════════════════════════════════════════════════════
// //  FEATURE LABELS
// // ════════════════════════════════════════════════════════════
// const FEATURES_LIST = [
//   { key: 'cvUploads',         ar: 'رفع السيرة الذاتية',        en: 'CV Uploads' },
//   { key: 'aiAnalysis',        ar: 'تحليل AI للسيرة',            en: 'AI CV Analysis' },
//   { key: 'coverLetterDaily',  ar: 'خطاب التقديم',               en: 'Cover Letter' },
//   { key: 'training',          ar: 'مقابلة AI',                  en: 'AI Interview' },
//   { key: 'careerPathDaily',   ar: 'المسار المهني',              en: 'Career Path' },
//   { key: 'autoApplyDaily',    ar: 'التقديم التلقائي',           en: 'Auto-Apply' },
//   { key: 'chatDaily',         ar: 'المساعد المهني',             en: 'Career Chat' },
//   { key: 'jobApplications',   ar: 'التقديم على وظائف',          en: 'Job Applications' },
//   { key: 'cvBuilder',         ar: 'منشئ السيرة الذاتية',        en: 'CV Builder' },
//   { key: 'courses',           ar: 'الوصول للدورات',             en: 'Courses Access' },
//   { key: 'prioritySupport',   ar: 'دعم أولوية',                en: 'Priority Support' },
//   { key: 'walletBonus',       ar: 'نقاط المحفظة',              en: 'Wallet Points' },
// ];

// function fmtPrice(amount, symbol = '$') {
//   if (!amount) return `${symbol}0`;
//   return `${symbol}${Number(amount).toFixed(2)}`;
// }

// function getFeatureValue(features, key) {
//   const val = features?.[key];
//   if (val === undefined || val === false) return null;
//   if (val === true) return '✓';
//   if (typeof val === 'number' && val === -1) return '∞';
//   if (typeof val === 'number') return `${val}`;
//   return '✓';
// }

// // ════════════════════════════════════════════════════════════
// //  PLAN CARD COMPONENT — unified size
// // ════════════════════════════════════════════════════════════
// function PlanCard({ plan, isAr, billing, currentPlan, onSelect, delay = 0, isDark }) {
//   const [hovered, setHovered] = useState(false);
//   const colors = getThemeColors(isDark);
//   const style   = PLAN_STYLE[plan.key] || PLAN_STYLE.free;
//   const Icon    = style.Icon;
//   const price   = billing === 'yearly' ? plan.yearly : plan.monthly;
//   const isFree  = plan.key === 'free' || price === 0;
//   const isCurrent  = currentPlan === plan.key;
//   const isPopular  = style.popular;
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

//   return (
//     <div
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//       style={{
//         position: 'relative',
//         borderRadius: 24,
//         padding: '28px 24px 24px',
//         background: colors.card,
//         border: `1px solid ${hovered || isCurrent ? style.border : colors.border}`,
//         transform: hovered ? 'translateY(-4px)' : 'none',
//         transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.2s, box-shadow 0.3s',
//         boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3)` : 'none',
//         display: 'flex', flexDirection: 'column',
//         height: '100%',
//         minHeight: 580,
//       }}
//     >
//       {/* Popular ribbon */}
//       {isPopular && !isCurrent && (
//         <div style={{
//           position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
//           padding: '5px 18px', borderRadius: '0 0 12px 12px',
//           background: `linear-gradient(135deg, ${style.color}, ${style.color}CC)`,
//           fontSize: 10.5, fontWeight: 800, color: '#000', letterSpacing: '0.06em',
//           textTransform: 'uppercase', whiteSpace: 'nowrap',
//           fontFamily: 'var(--font-en)',
//         }}>
//           ⚡ {isAr ? 'الأكثر شعبية' : 'Most Popular'}
//         </div>
//       )}

//       {/* Current plan ribbon */}
//       {isCurrent && (
//         <div style={{
//           position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
//           padding: '5px 18px', borderRadius: '0 0 12px 12px',
//           background: '#22C55E', fontSize: 10.5, fontWeight: 800, color: '#000',
//           letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
//           fontFamily: 'var(--font-en)',
//         }}>
//           ✓ {isAr ? 'خطتك الحالية' : 'Current Plan'}
//         </div>
//       )}

//       {/* Header */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, marginTop: (isPopular || isCurrent) ? 12 : 0 }}>
//         <div style={{
//           width: 44, height: 44, borderRadius: 13,
//           background: `${style.color}15`,
//           border: `1px solid ${style.color}30`,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <Icon size={20} color={style.color} strokeWidth={1.8} />
//         </div>
//         <div>
//           <p style={{ fontSize: 18, fontWeight: 900, color: colors.textPri, margin: 0, letterSpacing: '-0.02em', fontFamily: font }}>
//             {plan.features?._nameAr && isAr ? plan.features._nameAr : (plan.features?._name || (isAr ? style.label.ar : style.label.en))}
//           </p>
//           <p style={{ fontSize: 11, color: colors.textSec, margin: '3px 0 0', fontFamily: font }}>
//             {isFree ? (isAr ? 'للبدء بدون التزام' : 'Start with no commitment') : (isAr ? 'ميزات متقدمة' : 'Advanced features')}
//           </p>
//         </div>
//       </div>

//       {/* Price */}
//       <div style={{ marginBottom: 24 }}>
//         {isFree ? (
//           <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
//             <span style={{ fontSize: 44, fontWeight: 900, color: colors.textPri, letterSpacing: '-0.04em', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
//               {isAr ? 'مجاني' : 'Free'}
//             </span>
//           </div>
//         ) : (
//           <>
//             <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
//               <span style={{ fontSize: 44, fontWeight: 900, color: style.color, letterSpacing: '-0.04em', fontFamily: 'var(--font-en)', lineHeight: 1 }}>
//                 {fmtPrice(price, plan.symbol || '$')}
//               </span>
//               <span style={{ fontSize: 13, color: colors.textSec, fontFamily: 'var(--font-en)', marginBottom: 4 }}>
//                 /{billing === 'yearly' ? (isAr ? 'سنة' : 'yr') : (isAr ? 'شهر' : 'mo')}
//               </span>
//             </div>
//             {billing === 'yearly' && plan.savings > 0 && (
//               <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
//                 <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-en)' }}>
//                   {isAr ? `وفّر ${plan.savings}%` : `Save ${plan.savings}%`}
//                 </span>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {/* Divider */}
//       <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${style.color}30, transparent)`, marginBottom: 20 }} />

//       {/* Features list - all features with status */}
//       <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
//         {FEATURES_LIST.map(({ key, ar, en }) => {
//           const val = getFeatureValue(plan.features, key);
//           const isIncluded = val !== null;
          
//           return (
//             <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//               <div style={{ width: 20, height: 20, borderRadius: '50%', background: isIncluded ? `${style.color}18` : colors.border, border: `1px solid ${isIncluded ? style.color + '35' : colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                 {isIncluded ? (
//                   <Check size={10} color={style.color} strokeWidth={3} />
//                 ) : (
//                   <Circle size={8} color={colors.textSec} strokeWidth={1.5} />
//                 )}
//               </div>
//               <span style={{ fontSize: 13, color: isIncluded ? colors.textPri : colors.textSec, fontFamily: font, flex: 1 }}>
//                 {isAr ? ar : en}
//                 {isIncluded && val !== '✓' && val !== '∞' && typeof plan.features?.[key] === 'number' && (
//                   <span style={{ color: style.color, fontWeight: 700, marginInlineStart: 6, fontFamily: 'var(--font-en)', fontSize: 12 }}>
//                     {val === -1 ? '∞' : `${val}${key.includes('Daily') ? '/day' : key.includes('Applications') ? '/mo' : ''}`}
//                   </span>
//                 )}
//                 {isIncluded && val === '∞' && (
//                   <span style={{ color: style.color, fontWeight: 700, marginInlineStart: 6, fontFamily: 'var(--font-en)', fontSize: 12 }}>
//                     ∞
//                   </span>
//                 )}
//               </span>
//             </div>
//           );
//         })}
//       </div>

//       {/* CTA button */}
//       <button
//         onClick={() => !isCurrent && !isFree && onSelect(plan)}
//         disabled={isCurrent || isFree}
//         style={{
//           width: '100%', padding: '14px',
//           borderRadius: 13, border: 'none',
//           cursor: isCurrent || isFree ? 'default' : 'pointer',
//           fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
//           fontFamily: font,
//           transition: 'all 0.2s',
//           background: isCurrent
//             ? 'rgba(34,197,94,0.1)'
//             : isFree
//             ? colors.border
//             : isPopular
//             ? `linear-gradient(135deg, ${style.color}, ${style.color}CC)`
//             : `${style.color}18`,
//           color: isCurrent
//             ? '#22C55E'
//             : isFree
//             ? colors.textSec
//             : isPopular
//             ? '#000'
//             : style.color,
//           border: isCurrent
//             ? '1px solid rgba(34,197,94,0.3)'
//             : isFree
//             ? `1px solid ${colors.border}`
//             : isPopular
//             ? 'none'
//             : `1px solid ${style.color}40`,
//         }}
//         onMouseEnter={e => { if (!isCurrent && !isFree) { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
//         onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
//       >
//         {isCurrent
//           ? `✓ ${isAr ? 'خطتك الحالية' : 'Current Plan'}`
//           : isFree
//           ? (isAr ? 'الخطة المجانية' : 'Free Plan')
//           : (isAr ? `ترقية للـ ${plan.features?._nameAr || style.label.ar}` : `Upgrade to ${plan.features?._name || style.label.en}`)}
//       </button>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// //  MAIN PAGE
// // ════════════════════════════════════════════════════════════
// export default function PricingPage() {
//   const { lang } = useLang();
//   const { theme } = useThemeStore();
//   const isAr = lang === 'ar';
//   const isDark = theme === 'dark';
//   const { user } = useAuthStore();
//   const navigate = useNavigate();
//   const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
//   const colors = getThemeColors(isDark);

//   const [collapsed, setCollapsed] = useState(false);
//   const [plans, setPlans] = useState([]);
//   const [allTiers, setAllTiers] = useState([]);
//   const [tierInfo, setTierInfo] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [billing, setBilling] = useState('monthly');
//   const [selected, setSelected] = useState(null);
//   const [myRequests, setMyRequests] = useState([]);
//   const [showRegion, setShowRegion] = useState(false);

//   const loadPlans = (override) => {
//     setLoading(true);
//     api.get('/plans', { params: override ? { country: override } : {} })
//       .then(({ data }) => {
//         const d = data.data || {};
//         setPlans(d.plans || []);
//         setAllTiers(d.allTiers || []);
//         setTierInfo({ id: d.tierId || d.tier, label: d.tierLabel, currency: d.currency, symbol: d.symbol });
//       }).catch(() => {}).finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     loadPlans();
//     if (user) api.get('/payments/my').then(({ data }) => setMyRequests(data.data || [])).catch(() => {});
//   }, [user]);

//   const pendingRequest = myRequests.find(r => r.status === 'pending');
//   const currentPlan = user?.planKey || 'free';

//   const handleSelect = (plan) => {
//     if (!user) { navigate('/login'); return; }
//     if (pendingRequest) { toast.error(isAr ? 'لديك طلب معلّق بالفعل' : 'You already have a pending request'); return; }
//     setSelected(plan);
//   };

//   return (
//     <div style={{ display: 'flex', minHeight: '100vh', background: colors.surface, color: colors.textPri, fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
//       <style>{`
//         @keyframes spin { to { transform: rotate(360deg); } }
//         @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
//         @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
//         @keyframes glowPulse {
//   0% { opacity: 0.6; box-shadow: 0 0 0px rgba(212,160,23,0); }
//   100% { opacity: 1; box-shadow: 0 0 8px rgba(212,160,23,0.3); }
// }
//         ::-webkit-scrollbar { width:5px; }
//         ::-webkit-scrollbar-thumb { background:#222; border-radius:99px; }
//         @media(max-width:1024px){ .pricing-main{ padding-bottom:80px!important; } }
//       `}</style>

//       <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//       <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//         <MobileTopBar title={isAr ? 'الأسعار' : 'Pricing'} />

//         <main className="pricing-main" style={{ flex: 1, padding: 'clamp(20px,3vw,40px)', overflowY: 'auto' }}>
//           <div style={{ maxWidth: 1100, margin: '0 auto' }}>

//             {/* Hero header */}
//             <div style={{ textAlign: 'center', marginBottom: 52, animation: 'fadeIn .6s ease' }}>
              
//               <h1 style={{ fontSize: 'clamp(30px,5vw,54px)', fontWeight: 900, margin: '0 0 16px', letterSpacing: '-0.04em', lineHeight: 1.05, color: colors.textPri, fontFamily: font }}>
//                 {isAr ? (
//                   <>استثمر في<br /><span style={{ color: colors.gold }}>مسيرتك المهنية</span></>
//                 ) : (
//                   <>Invest in Your<br /><span style={{ color: colors.gold }}>Career Growth</span></>
//                 )}
//               </h1>
//               <p style={{ fontSize: 'clamp(14px,1.8vw,17px)', color: colors.textSec, margin: '0 0 32px', lineHeight: 1.65, fontFamily: font }}>
//                 {isAr ? 'ابدأ مجاناً. ترقّى عندما تصبح جاهزاً.' : 'Start free. Upgrade when you\'re ready.'}
//               </p>

//               {/* Billing toggle */}
//               <div style={{ display: 'inline-flex', alignItems: 'center', background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 4, gap: 2 }}>
//                 {['monthly', 'yearly'].map(b => (
//                   <button key={b} onClick={() => setBilling(b)} style={{
//                     padding: '9px 22px', borderRadius: 11, border: 'none', fontSize: 13,
//                     fontWeight: billing === b ? 700 : 500,
//                     background: billing === b ? colors.borderHi : 'transparent',
//                     color: billing === b ? colors.textPri : colors.textSec,
//                     cursor: 'pointer', fontFamily: font, transition: 'all .18s',
//                   }}>
//                     {b === 'monthly' ? (isAr ? 'شهري' : 'Monthly') : (isAr ? 'سنوي' : 'Yearly')}
//                     {b === 'yearly' && (
//                       <span style={{ marginInlineStart: 8, fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 99, background: 'rgba(34,197,94,0.15)', color: '#22C55E', fontFamily: 'var(--font-en)' }}>
//                         -20%
//                       </span>
//                     )}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Pending banner */}
//             {pendingRequest && (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderRadius: 14, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 32, maxWidth: 680, marginInline: 'auto' }}>
//                 <Clock size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
//                 <div>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B', margin: '0 0 2px', fontFamily: font }}>
//                     {isAr ? 'طلبك قيد المراجعة' : 'Request Under Review'}
//                   </p>
//                   <p style={{ fontSize: 12, color: colors.textSec, margin: 0, fontFamily: font }}>
//                     {isAr ? `خطة ${pendingRequest.planKey} — سيتم التفعيل خلال ساعة` : `${pendingRequest.planKey} plan — activation within 1 hour`}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Plan cards grid - all same size */}
//             {loading ? (
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 1100, marginInline: 'auto' }}>
//                 {[0, 1, 2].map(i => <div key={i} style={{ height: 580, borderRadius: 24, background: colors.card, border: `1px solid ${colors.border}`, animation: 'glowPulse 1.5s infinite' }} />)}
//               </div>
//             ) : (
//               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, maxWidth: 1100, marginInline: 'auto', paddingBottom: 20 }}>
//                 {plans.map((plan, i) => (
//                   <PlanCard
//                     key={plan.key}
//                     plan={plan}
//                     isAr={isAr}
//                     billing={billing}
//                     currentPlan={currentPlan}
//                     onSelect={handleSelect}
//                     delay={i * 80}
//                     isDark={isDark}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Trust bar */}
            

//             <div style={{ height: 48 }} />
//           </div>
//         </main>
//       </div>

//       <MobileBottomNav />
//     </div>
//   );
// }


'use strict';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check, Zap, Crown, Star, X, Clock,
  Circle, Upload, Loader2, Copy, CheckCircle,
} from 'lucide-react';
import useLang from '../../i18n';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

const getThemeColors = (isDark) => ({
  surface:  isDark ? '#0A0A0A' : '#F5F5F5',
  card:     isDark ? '#111111' : '#FFFFFF',
  border:   isDark ? '#222222' : '#E5E5E5',
  borderHi: isDark ? '#333333' : '#D4D4D4',
  textPri:  isDark ? '#F8F8F0' : '#1A1A1A',
  textSec:  isDark ? '#6B6B6B' : '#737373',
  gold:     '#D4A017',
});

const PLAN_STYLE = {
  free:  { glow:'rgba(107,114,128,0.18)', color:'#9CA3AF', border:'#2A2A2A', Icon:Star,  label:{ en:'Free',  ar:'مجاني'   } },
  pro:   { glow:'rgba(212,160,23,0.22)',  color:'#D4A017', border:'#D4A01755', Icon:Zap,  label:{ en:'Pro',   ar:'احترافي' }, popular:true },
  elite: { glow:'rgba(139,92,246,0.22)',  color:'#A78BFA', border:'rgba(139,92,246,0.45)', Icon:Crown, label:{ en:'Elite', ar:'النخبة' } },
};

const FEATURES_LIST = [
  { key:'cvUploads',        ar:'رفع السيرة الذاتية',   en:'CV Uploads'       },
  { key:'aiAnalysis',       ar:'تحليل AI للسيرة',      en:'AI CV Analysis'   },
  { key:'coverLetterDaily', ar:'خطاب التقديم',          en:'Cover Letter'     },
  { key:'training',         ar:'مقابلة AI',             en:'AI Interview'     },
  { key:'careerPathDaily',  ar:'المسار المهني',         en:'Career Path'      },
  { key:'autoApplyDaily',   ar:'التقديم التلقائي',      en:'Auto-Apply'       },
  { key:'chatDaily',        ar:'المساعد المهني',        en:'Career Chat'      },
  { key:'jobApplications',  ar:'التقديم على وظائف',     en:'Job Applications' },
  { key:'cvBuilder',        ar:'منشئ السيرة الذاتية',   en:'CV Builder'       },
  { key:'courses',          ar:'الوصول للدورات',        en:'Courses Access'   },
  { key:'prioritySupport',  ar:'دعم أولوية',            en:'Priority Support' },
  { key:'walletBonus',      ar:'نقاط المحفظة',          en:'Wallet Points'    },
];

function fmtVal(features, key) {
  const v = features?.[key];
  if (v === undefined || v === false) return null;
  if (v === true)  return '✓';
  if (v === -1)    return '∞';
  return String(v);
}

/* ══════════════════════════════════════════════════════════
   PLAN CARD
══════════════════════════════════════════════════════════ */
function PlanCard({ plan, isAr, billing, currentPlan, onSelect, isDark }) {
  const [hovered, setHovered] = useState(false);
  const colors  = getThemeColors(isDark);
  const style   = PLAN_STYLE[plan.key] || PLAN_STYLE.free;
  const Icon    = style.Icon;
  const price   = billing==='yearly' ? plan.yearly : plan.monthly;
  const isFree  = plan.key==='free' || price===0;
  const isCurrent  = currentPlan===plan.key;
  const isPopular  = style.popular;
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  return (
    <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ position:'relative', borderRadius:24, padding:'28px 24px 24px', background:colors.card, border:`1px solid ${hovered||isCurrent?style.border:colors.border}`, transform:hovered?'translateY(-4px)':'none', transition:'transform 0.3s ease, border-color 0.2s, box-shadow 0.3s', boxShadow:hovered?'0 20px 40px rgba(0,0,0,0.3)':'none', display:'flex', flexDirection:'column', height:'100%', minHeight:580 }}>

      {isPopular && !isCurrent && (
        <div style={{ position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', padding:'5px 18px', borderRadius:'0 0 12px 12px', background:`linear-gradient(135deg,${style.color},${style.color}CC)`, fontSize:10.5, fontWeight:800, color:'#000', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', fontFamily:'var(--font-en)' }}>
          ⚡ {isAr?'الأكثر شعبية':'Most Popular'}
        </div>
      )}
      {isCurrent && (
        <div style={{ position:'absolute', top:-1, left:'50%', transform:'translateX(-50%)', padding:'5px 18px', borderRadius:'0 0 12px 12px', background:'#22C55E', fontSize:10.5, fontWeight:800, color:'#000', letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap', fontFamily:'var(--font-en)' }}>
          ✓ {isAr?'خطتك الحالية':'Current Plan'}
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, marginTop:(isPopular||isCurrent)?12:0 }}>
        <div style={{ width:44, height:44, borderRadius:13, background:`${style.color}15`, border:`1px solid ${style.color}30`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={20} color={style.color} strokeWidth={1.8}/>
        </div>
        <div>
          <p style={{ fontSize:18, fontWeight:900, color:colors.textPri, margin:0, letterSpacing:'-0.02em', fontFamily:font }}>
            {isAr ? style.label.ar : style.label.en}
          </p>
          <p style={{ fontSize:11, color:colors.textSec, margin:'3px 0 0', fontFamily:font }}>
            {isFree ? (isAr?'للبدء بدون التزام':'Start with no commitment') : (isAr?'ميزات متقدمة':'Advanced features')}
          </p>
        </div>
      </div>

      <div style={{ marginBottom:24 }}>
        {isFree ? (
          <span style={{ fontSize:44, fontWeight:900, color:colors.textPri, letterSpacing:'-0.04em', fontFamily:'var(--font-en)', lineHeight:1 }}>
            {isAr?'مجاني':'Free'}
          </span>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
              <span style={{ fontSize:44, fontWeight:900, color:style.color, letterSpacing:'-0.04em', fontFamily:'var(--font-en)', lineHeight:1 }}>
                {plan.symbol||'$'}{Number(price).toFixed(2)}
              </span>
              <span style={{ fontSize:13, color:colors.textSec, fontFamily:'var(--font-en)', marginBottom:4 }}>
                /{billing==='yearly'?(isAr?'سنة':'yr'):(isAr?'شهر':'mo')}
              </span>
            </div>
            {billing==='yearly' && plan.savings>0 && (
              <div style={{ marginTop:8, display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.2)' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#22C55E', fontFamily:'var(--font-en)' }}>
                  {isAr?`وفّر ${plan.savings}%`:`Save ${plan.savings}%`}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ height:1, background:`linear-gradient(90deg,transparent,${style.color}30,transparent)`, marginBottom:20 }}/>

      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12, marginBottom:24 }}>
        {FEATURES_LIST.map(({ key, ar, en }) => {
          const val = fmtVal(plan.features, key);
          const included = val !== null;
          return (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:20, height:20, borderRadius:'50%', background:included?`${style.color}18`:colors.border, border:`1px solid ${included?style.color+'35':colors.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {included ? <Check size={10} color={style.color} strokeWidth={3}/> : <Circle size={8} color={colors.textSec} strokeWidth={1.5}/>}
              </div>
              <span style={{ fontSize:13, color:included?colors.textPri:colors.textSec, fontFamily:font, flex:1 }}>
                {isAr ? ar : en}
                {included && val!=='✓' && (
                  <span style={{ color:style.color, fontWeight:700, marginInlineStart:6, fontFamily:'var(--font-en)', fontSize:12 }}>
                    {val}{key.includes('Daily')?'/day':key.includes('Applications')?'/mo':''}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <button onClick={() => !isCurrent && !isFree && onSelect(plan)} disabled={isCurrent||isFree}
        style={{ width:'100%', padding:'14px', borderRadius:13, border:'none', cursor:isCurrent||isFree?'default':'pointer', fontSize:14, fontWeight:800, fontFamily:font, transition:'all 0.2s', background:isCurrent?'rgba(34,197,94,0.1)':isFree?colors.border:isPopular?`linear-gradient(135deg,${style.color},${style.color}CC)`:`${style.color}18`, color:isCurrent?'#22C55E':isFree?colors.textSec:isPopular?'#000':style.color, border:isCurrent?'1px solid rgba(34,197,94,0.3)':isFree?`1px solid ${colors.border}`:isPopular?'none':`1px solid ${style.color}40` }}
        onMouseEnter={e=>{ if(!isCurrent&&!isFree){e.currentTarget.style.opacity='.88';e.currentTarget.style.transform='translateY(-1px)';} }}
        onMouseLeave={e=>{ e.currentTarget.style.opacity='1';e.currentTarget.style.transform='none'; }}>
        {isCurrent ? `✓ ${isAr?'خطتك الحالية':'Current Plan'}` : isFree ? (isAr?'الخطة المجانية':'Free Plan') : (isAr?`ترقية للـ ${style.label.ar}`:`Upgrade to ${style.label.en}`)}
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ✅ PAYMENT MODAL — CliQ bill upload
══════════════════════════════════════════════════════════ */
function PaymentModal({ plan, billing, onClose, isAr, isDark, user }) {
  const colors = getThemeColors(isDark);
  const font   = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const style  = PLAN_STYLE[plan.key] || PLAN_STYLE.pro;
  const price  = billing==='yearly' ? plan.yearly : plan.monthly;

  const [cliqInfo, setCliqInfo]     = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [notes, setNotes]           = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]             = useState(false);
  const [copied, setCopied]         = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    api.get('/settings/cliq-settings')
      .then(({ data }) => setCliqInfo(data.data || data))
      .catch(() => setCliqInfo(null))
      .finally(() => setLoadingInfo(false));
  }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
      toast.error(isAr ? 'صور أو PDF فقط' : 'Images or PDF only');
      return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error(isAr ? 'الحد الأقصى 10MB' : 'Max 10MB'); return; }
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  };

  const submit = async () => {
    if (!file) { toast.error(isAr ? 'يرجى رفع صورة الإيصال' : 'Please upload the receipt'); return; }
    if (!transactionRef.trim()) { toast.error(isAr ? 'يرجى إدخال رقم العملية' : 'Please enter transaction reference'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('receipt', file);
      fd.append('planKey', plan.key);
      fd.append('billingPeriod', billing);
      // ✅ backend requires senderName + transactionRef — fill from user + form
      fd.append('senderName', user?.fullName || 'User');
      fd.append('transactionRef', transactionRef.trim());
      fd.append('paymentMethod', 'cliq');
      if (notes.trim()) fd.append('notes', notes.trim());
      await api.post('/payments', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل إرسال الطلب' : 'Failed to submit'));
    } finally { setSubmitting(false); }
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(4px)' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:20, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', animation:'modalIn .25s ease' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:`1px solid ${colors.border}` }}>
          <div>
            <h2 style={{ fontSize:18, fontWeight:900, margin:0, color:colors.textPri, fontFamily:font }}>
              {isAr ? 'إتمام الدفع' : 'Complete Payment'}
            </h2>
            <p style={{ fontSize:12, color:colors.textSec, margin:'4px 0 0', fontFamily:font }}>
              {isAr ? `خطة ${style.label.ar} — ${plan.symbol||'$'}${Number(price).toFixed(2)}/${billing==='yearly'?'سنة':'شهر'}` : `${style.label.en} plan — ${plan.symbol||'$'}${Number(price).toFixed(2)}/${billing==='yearly'?'yr':'mo'}`}
            </p>
          </div>
          <button onClick={onClose} style={{ width:34, height:34, borderRadius:10, background:colors.border, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color={colors.textSec}/>
          </button>
        </div>

        <div style={{ padding:'24px' }}>
          {done ? (
            /* ── Success state ── */
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <CheckCircle size={36} color="#22C55E"/>
              </div>
              <h3 style={{ fontSize:20, fontWeight:800, color:colors.textPri, margin:'0 0 10px', fontFamily:font }}>
                {isAr ? 'تم إرسال طلبك ✓' : 'Request Submitted ✓'}
              </h3>
              <p style={{ fontSize:13.5, color:colors.textSec, margin:'0 0 24px', lineHeight:1.6, fontFamily:font }}>
                {isAr ? 'سيقوم فريقنا بمراجعة إيصالك وتفعيل خطتك خلال ساعة واحدة.' : 'Our team will review your receipt and activate your plan within 1 hour.'}
              </p>
              <button onClick={onClose} style={{ padding:'12px 32px', borderRadius:12, background:'#22C55E', border:'none', cursor:'pointer', fontSize:14, fontWeight:700, color:'#000', fontFamily:font }}>
                {isAr ? 'حسناً' : 'Got it'}
              </button>
            </div>
          ) : (
            <>
              {/* ── CliQ info ── */}
              {loadingInfo ? (
                <div style={{ textAlign:'center', padding:'20px 0', color:colors.textSec }}>
                  <Loader2 size={24} style={{ animation:'spin 0.8s linear infinite', margin:'0 auto' }}/>
                </div>
              ) : cliqInfo ? (
                <div style={{ background: isDark ? 'rgba(212,160,23,0.06)' : 'rgba(212,160,23,0.04)', border:'1px solid rgba(212,160,23,0.2)', borderRadius:14, padding:'16px', marginBottom:20 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:colors.gold, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:'var(--font-en)' }}>
                    CliQ Payment Info
                  </p>
                  {[
                    { label: isAr?'اسم المستلم':'Recipient Name', value: cliqInfo.accountName || cliqInfo.name },
                    { label: isAr?'رقم CliQ / الهاتف':'CliQ Alias / Phone', value: cliqInfo.cliqAlias || cliqInfo.phone || cliqInfo.alias },
                    { label: isAr?'البنك':'Bank', value: cliqInfo.bankName || cliqInfo.bank },
                    { label: isAr?'المبلغ المطلوب':'Amount', value: `${plan.symbol||'$'}${Number(price).toFixed(2)}` },
                  ].filter(r => r.value).map((row, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 0', borderBottom: i < 3 ? `1px solid rgba(212,160,23,0.1)` : 'none' }}>
                      <span style={{ fontSize:12, color:colors.textSec, fontFamily:font }}>{row.label}</span>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:colors.textPri, fontFamily:'var(--font-en)' }}>{row.value}</span>
                        <button onClick={()=>copy(row.value, i)} style={{ background:'none', border:'none', cursor:'pointer', color:copied===i?'#22C55E':colors.textSec, display:'flex', padding:2 }}>
                          {copied===i ? <Check size={13}/> : <Copy size={13}/>}
                        </button>
                      </div>
                    </div>
                  ))}
                  {cliqInfo.instructions && (
                    <p style={{ fontSize:11.5, color:colors.textSec, margin:'12px 0 0', lineHeight:1.5, fontFamily:font }}>
                      💡 {cliqInfo.instructions}
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)', marginBottom:20 }}>
                  <p style={{ fontSize:13, color:'#EF4444', margin:0, fontFamily:font }}>
                    {isAr ? 'تعذّر تحميل معلومات الدفع. يرجى التواصل مع الدعم.' : 'Could not load payment info. Please contact support.'}
                  </p>
                </div>
              )}

              {/* ── Upload receipt ── */}
              <div style={{ marginBottom:16 }}>
                <p style={{ fontSize:13, fontWeight:700, color:colors.textPri, margin:'0 0 10px', fontFamily:font }}>
                  {isAr ? '📎 ارفع إيصال الدفع' : '📎 Upload Payment Receipt'}
                </p>
                <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display:'none' }} onChange={e=>pickFile(e.target.files[0])}/>
                {file ? (
                  <div style={{ border:`1px solid ${colors.border}`, borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    {preview && <img src={preview} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:8, border:`1px solid ${colors.border}` }}/>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:600, color:colors.textPri, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</p>
                      <p style={{ fontSize:11, color:colors.textSec, margin:'2px 0 0' }}>{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={()=>{setFile(null);setPreview(null);}} style={{ background:'none', border:'none', cursor:'pointer', color:colors.textSec }}><X size={16}/></button>
                  </div>
                ) : (
                  <div onClick={()=>fileRef.current?.click()}
                    onDragOver={e=>{e.preventDefault();e.currentTarget.style.borderColor=colors.gold;}}
                    onDragLeave={e=>{e.currentTarget.style.borderColor=colors.border;}}
                    onDrop={e=>{e.preventDefault();e.currentTarget.style.borderColor=colors.border;pickFile(e.dataTransfer.files[0]);}}
                    style={{ border:`2px dashed ${colors.border}`, borderRadius:12, padding:'28px 16px', textAlign:'center', cursor:'pointer', transition:'border-color .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=colors.gold}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=colors.border}>
                    <Upload size={28} color={colors.textSec} style={{ margin:'0 auto 10px', display:'block', opacity:.5 }}/>
                    <p style={{ fontSize:13, fontWeight:600, color:colors.textPri, margin:'0 0 4px', fontFamily:font }}>
                      {isAr ? 'اضغط لاختيار الإيصال أو اسحبه هنا' : 'Click or drag receipt here'}
                    </p>
                    <p style={{ fontSize:11, color:colors.textSec, margin:0 }}>PNG, JPG, PDF · max 10MB</p>
                  </div>
                )}
              </div>

              {/* ── Transaction Ref (required) ── */}
              <div style={{ marginBottom:14 }}>
                <p style={{ fontSize:13, fontWeight:700, color:colors.textPri, margin:'0 0 8px', fontFamily:font }}>
                  {isAr ? '🔢 رقم العملية / Transaction ID *' : '🔢 Transaction Reference *'}
                </p>
                <input value={transactionRef} onChange={e=>setTransactionRef(e.target.value)}
                  placeholder={isAr ? 'مثال: TXN123456789' : 'e.g. TXN123456789'}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${colors.border}`, background:'transparent', color:colors.textPri, fontSize:13, fontFamily:'var(--font-en)', outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=colors.gold}
                  onBlur={e=>e.target.style.borderColor=colors.border}
                />
              </div>

              {/* ── Notes (optional) ── */}
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:13, fontWeight:700, color:colors.textPri, margin:'0 0 8px', fontFamily:font }}>
                  {isAr ? 'ملاحظات (اختياري)' : 'Notes (optional)'}
                </p>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                  placeholder={isAr ? 'وقت التحويل، أي ملاحظات إضافية...' : 'Transfer time, any additional notes...'}
                  style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:`1px solid ${colors.border}`, background:'transparent', color:colors.textPri, fontSize:13, fontFamily:font, resize:'vertical', outline:'none', boxSizing:'border-box' }}
                  onFocus={e=>e.target.style.borderColor=colors.gold}
                  onBlur={e=>e.target.style.borderColor=colors.border}
                />
              </div>

              {/* ── Submit ── */}
              <button onClick={submit} disabled={submitting||!file||!transactionRef.trim()}
                style={{ width:'100%', padding:'14px', borderRadius:13, border:'none', cursor:submitting||!file||!transactionRef.trim()?'not-allowed':'pointer', fontSize:14, fontWeight:800, fontFamily:font, background:(!file||!transactionRef.trim())?colors.border:`linear-gradient(135deg,${style.color},${style.color}CC)`, color:(!file||!transactionRef.trim())?colors.textSec:'#000', opacity:submitting?.7:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity .2s' }}>
                {submitting && <Loader2 size={16} style={{ animation:'spin .7s linear infinite' }}/>}
                {submitting ? (isAr?'جاري الإرسال...':'Submitting...') : (isAr?'إرسال طلب الترقية':'Submit Upgrade Request')}
              </button>

              <p style={{ fontSize:11, color:colors.textSec, textAlign:'center', margin:'12px 0 0', lineHeight:1.5, fontFamily:font }}>
                {isAr ? 'سيتم مراجعة طلبك وتفعيل خطتك خلال ساعة من الدفع.' : 'Your request will be reviewed and plan activated within 1 hour of payment.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function PricingPage() {
  const { lang }  = useLang();
  const { theme } = useThemeStore();
  const isAr      = lang==='ar';
  const isDark    = theme==='dark';
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const colors    = getThemeColors(isDark);

  const [collapsed, setCollapsed]   = useState(false);
  const [plans,     setPlans]       = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [billing,   setBilling]     = useState('monthly');
  const [selected,  setSelected]    = useState(null);   // plan to upgrade to
  const [myRequests,setMyRequests]  = useState([]);

  useEffect(() => {
    setLoading(true);
    api.get('/plans')
      .then(({ data }) => setPlans(data.data?.plans || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    if (user) api.get('/payments/my').then(({ data }) => setMyRequests(data.data || [])).catch(() => {});
  }, [user]);

  const pendingRequest = myRequests.find(r => r.status==='pending');
  const currentPlan   = user?.planKey || 'free';

  const handleSelect = (plan) => {
    if (!user) { navigate('/login'); return; }
    if (pendingRequest) { toast.error(isAr?'لديك طلب معلّق بالفعل':'You already have a pending request'); return; }
    setSelected(plan);
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:colors.surface, color:colors.textPri, fontFamily:font, direction:isAr?'rtl':'ltr' }}>
      <style>{`
        @keyframes spin { to{transform:rotate(360deg);} }
        @keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }
        @keyframes modalIn { from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none} }
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#222;border-radius:99px;}
        @media(max-width:1024px){.pricing-main{padding-bottom:80px!important;}}
      `}</style>

      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed}/>

      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <MobileTopBar title={isAr?'الأسعار':'Pricing'}/>

        <main className="pricing-main" style={{ flex:1, padding:'clamp(20px,3vw,40px)', overflowY:'auto' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>

            {/* Hero */}
            <div style={{ textAlign:'center', marginBottom:52 }}>
              <h1 style={{ fontSize:'clamp(30px,5vw,54px)', fontWeight:900, margin:'0 0 16px', letterSpacing:'-0.04em', lineHeight:1.05, color:colors.textPri, fontFamily:font }}>
                {isAr ? (<>استثمر في<br/><span style={{ color:colors.gold }}>مسيرتك المهنية</span></>) : (<>Invest in Your<br/><span style={{ color:colors.gold }}>Career Growth</span></>)}
              </h1>
              <p style={{ fontSize:'clamp(14px,1.8vw,17px)', color:colors.textSec, margin:'0 0 32px', lineHeight:1.65, fontFamily:font }}>
                {isAr?'ابدأ مجاناً. ترقّى عندما تصبح جاهزاً.':'Start free. Upgrade when you\'re ready.'}
              </p>

              {/* Billing toggle */}
              <div style={{ display:'inline-flex', alignItems:'center', background:colors.card, border:`1px solid ${colors.border}`, borderRadius:14, padding:4, gap:2 }}>
                {['monthly','yearly'].map(b => (
                  <button key={b} onClick={()=>setBilling(b)} style={{ padding:'9px 22px', borderRadius:11, border:'none', fontSize:13, fontWeight:billing===b?700:500, background:billing===b?colors.borderHi:'transparent', color:billing===b?colors.textPri:colors.textSec, cursor:'pointer', fontFamily:font, transition:'all .18s' }}>
                    {b==='monthly'?(isAr?'شهري':'Monthly'):(isAr?'سنوي':'Yearly')}
                    {b==='yearly' && <span style={{ marginInlineStart:8, fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:99, background:'rgba(34,197,94,0.15)', color:'#22C55E', fontFamily:'var(--font-en)' }}>-20%</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Pending banner */}
            {pendingRequest && (
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 18px', borderRadius:14, background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)', marginBottom:32, maxWidth:680, marginInline:'auto' }}>
                <Clock size={16} color="#F59E0B" style={{ flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#F59E0B', margin:'0 0 2px', fontFamily:font }}>{isAr?'طلبك قيد المراجعة':'Request Under Review'}</p>
                  <p style={{ fontSize:12, color:colors.textSec, margin:0, fontFamily:font }}>{isAr?`خطة ${pendingRequest.planKey} — سيتم التفعيل خلال ساعة`:`${pendingRequest.planKey} plan — activation within 1 hour`}</p>
                </div>
              </div>
            )}

            {/* Cards */}
            {loading ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24 }}>
                {[0,1,2].map(i => <div key={i} style={{ height:580, borderRadius:24, background:colors.card, border:`1px solid ${colors.border}`, animation:'pulse 1.5s infinite' }}/>)}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))', gap:24, paddingBottom:20 }}>
                {plans.map(plan => (
                  <PlanCard key={plan.key} plan={plan} isAr={isAr} billing={billing} currentPlan={currentPlan} onSelect={handleSelect} isDark={isDark}/>
                ))}
              </div>
            )}

            <div style={{ height:48 }}/>
          </div>
        </main>
      </div>

      <MobileBottomNav/>

      {/* ✅ Payment Modal */}
      {selected && (
        <PaymentModal
          plan={selected}
          billing={billing}
          onClose={() => setSelected(null)}
          isAr={isAr}
          isDark={isDark}
          user={user}
        />
      )}
    </div>
  );
}