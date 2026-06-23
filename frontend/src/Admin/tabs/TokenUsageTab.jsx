// // frontend/src/pages/Admin/tabs/TokenUsageTab.jsx

// import { useState, useEffect, useCallback } from 'react';
// import { 
//   Database, Activity, DollarSign, TrendingUp, 
//   BarChart2, PieChart, AlertTriangle, CheckCircle,
//   RefreshCw, Cpu, Server, Wifi, TrendingDown,
//   Zap, Clock, Users, FileText, MessageSquare, Briefcase
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import useLangStore from '../../i18n';

// /* ════════════════════════════════════════════════════════════
//    STAT CARD COMPONENT
// ════════════════════════════════════════════════════════════ */
// function StatCard({ icon: Icon, label, value, sub, color, trend }) {
//   return (
//     <div style={{
//       background: 'var(--bg-primary)',
//       border: '1px solid var(--border)',
//       borderRadius: 16,
//       padding: '18px 16px',
//       transition: 'all 0.2s',
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
//         <div style={{
//           width: 40, height: 40, borderRadius: 12,
//           background: `${color}15`,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <Icon size={20} color={color} />
//         </div>
//         {trend !== undefined && (
//           <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: trend > 0 ? '#22C55E' : '#EF4444' }}>
//             {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
//             <span>{Math.abs(trend)}%</span>
//           </div>
//         )}
//       </div>
//       <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 4px' }}>{label}</p>
//       <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-en)' }}>{value}</p>
//       {sub && <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>{sub}</p>}
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    FEATURE CARD
// ════════════════════════════════════════════════════════════ */
// function FeatureCard({ feature, stats, totalTokens, isAr }) {
//   const featureNames = {
//     cv_analysis: { ar: 'تحليل السيرة الذاتية', en: 'CV Analysis', icon: '📄', color: '#3B82F6' },
//     cover_letter: { ar: 'خطاب التقديم', en: 'Cover Letter', icon: '✉️', color: '#8B5CF6' },
//     interview: { ar: 'مقابلة AI', en: 'AI Interview', icon: '🎤', color: '#F59E0B' },
//     career_path: { ar: 'المسار المهني', en: 'Career Path', icon: '🗺️', color: '#22C55E' },
//     auto_apply: { ar: 'تقديم تلقائي', en: 'Auto-Apply', icon: '🤖', color: '#EF4444' },
//     chat: { ar: 'محادثة', en: 'Chat', icon: '💬', color: '#06B6D4' },
//   };
  
//   const name = featureNames[feature] || { ar: feature, en: feature, icon: '🔧', color: '#6B7280' };
//   const percent = totalTokens > 0 ? (stats.tokens / totalTokens) * 100 : 0;
  
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', gap: 12,
//       padding: '12px 14px',
//       background: 'var(--bg-secondary)',
//       borderRadius: 12,
//       border: '1px solid var(--border)',
//       transition: 'all 0.15s',
//     }}
//     onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
//     onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
//       <span style={{ fontSize: 24 }}>{name.icon}</span>
//       <div style={{ flex: 1 }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//           <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
//             {isAr ? name.ar : name.en}
//           </span>
//           <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
//             {stats.count?.toLocaleString()} {isAr ? 'طلب' : 'reqs'}
//           </span>
//         </div>
//         <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
//           <div style={{ width: `${percent}%`, height: '100%', background: name.color, borderRadius: 3 }} />
//         </div>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
//             {(stats.tokens / 1000).toFixed(1)}K tokens
//           </span>
//           <span style={{ fontSize: 11, fontWeight: 600, color: name.color }}>
//             ${stats.cost?.toFixed(4) || '0.00'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    PRESSURE METER
// ════════════════════════════════════════════════════════════ */
// function PressureMeter({ pressure, isAr }) {
//   const getPressureConfig = () => {
//     switch (pressure?.pressureLevel) {
//       case 'critical':
//         return { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', icon: AlertTriangle, text: isAr ? 'حرج' : 'Critical' };
//       case 'high':
//         return { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Zap, text: isAr ? 'مرتفع' : 'High' };
//       case 'medium':
//         return { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)', icon: Activity, text: isAr ? 'متوسط' : 'Medium' };
//       default:
//         return { color: '#22C55E', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle, text: isAr ? 'منخفض' : 'Low' };
//     }
//   };
  
//   const config = getPressureConfig();
//   const Icon = config.icon;
//   const percent = pressure?.apiQuota?.percent || 0;
  
//   return (
//     <div style={{
//       background: 'var(--bg-primary)',
//       border: `1px solid ${config.color}30`,
//       borderRadius: 16,
//       padding: 20,
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
//         <div style={{
//           width: 48, height: 48, borderRadius: 14,
//           background: config.bg,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <Icon size={24} color={config.color} />
//         </div>
//         <div>
//           <p style={{ fontSize: 14, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
//             {isAr ? 'ضغط المنصة' : 'Platform Pressure'}: <span style={{ color: config.color }}>{config.text}</span>
//           </p>
//           <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
//             {pressure?.pressureMessage}
//           </p>
//         </div>
//       </div>
      
//       <div style={{ marginBottom: 16 }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
//           <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
//             {isAr ? 'استخدام حصة API' : 'API Quota Usage'}
//           </span>
//           <span style={{ fontSize: 12, fontWeight: 700, color: percent > 80 ? '#EF4444' : '#22C55E' }}>
//             {percent.toFixed(1)}%
//           </span>
//         </div>
//         <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
//           <div style={{
//             width: `${percent}%`,
//             height: '100%',
//             background: percent > 80 ? '#EF4444' : percent > 60 ? '#F59E0B' : '#22C55E',
//             borderRadius: 4,
//           }} />
//         </div>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
//             {isAr ? 'مستخدم' : 'Used'}: {(pressure?.apiQuota?.used / 1000000).toFixed(2)}M
//           </span>
//           <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
//             {isAr ? 'الحد' : 'Limit'}: {(pressure?.apiQuota?.limit / 1000000).toFixed(0)}M
//           </span>
//           <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>
//             {isAr ? 'متبقي' : 'Remaining'}: {(pressure?.apiQuota?.remaining / 1000000).toFixed(2)}M
//           </span>
//         </div>
//       </div>
      
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
//         <div>
//           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
//             {isAr ? 'إجمالي التوكنات' : 'Total Tokens'}
//           </p>
//           <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)' }}>
//             {(pressure?.totalTokens / 1000000).toFixed(2)}M
//           </p>
//         </div>
//         <div>
//           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
//             {isAr ? 'الطلبات' : 'Requests'}
//           </p>
//           <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)' }}>
//             {pressure?.totalRequests?.toLocaleString()}
//           </p>
//         </div>
//         <div>
//           <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>
//             {isAr ? 'المستخدمين النشطين' : 'Active Users'}
//           </p>
//           <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)' }}>
//             {pressure?.activeUsers?.toLocaleString()}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ════════════════════════════════════════════════════════════
//    MAIN TOKEN USAGE TAB
// ════════════════════════════════════════════════════════════ */
// export default function TokenUsageTab({ lang: langProp }) {
//   const { lang: storeLang } = useLangStore();
//   const lang = storeLang || langProp || 'en';
//   const isAr = lang === 'ar';
//   const [loading, setLoading] = useState(true);
//   const [summary, setSummary] = useState(null);
//   const [pressure, setPressure] = useState(null);
//   const [period, setPeriod] = useState('month');

//   const periods = [
//     { value: 'day', ar: 'اليوم', en: 'Today' },
//     { value: 'week', ar: 'أسبوع', en: 'Week' },
//     { value: 'month', ar: 'شهر', en: 'Month' },
//     { value: 'all', ar: 'الكل', en: 'All Time' },
//   ];

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     try {
//       const [summaryRes, pressureRes] = await Promise.all([
//         api.get('/token-usage/summary', { params: { period } }),
//         api.get('/token-usage/platform-metrics', { params: { days: period === 'day' ? 1 : period === 'week' ? 7 : 30 } }),
//       ]);
//       setSummary(summaryRes.data.data);
//       setPressure(pressureRes.data.data);
//     } catch (err) {
//       console.error('Failed to fetch token usage:', err);
//       toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   }, [period, isAr]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   if (loading) {
//     return (
//       <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
//         <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: 1400, margin: '0 auto' }}>
//       <style>{`
//         @keyframes spin {
//           to { transform: rotate(360deg); }
//         }
//       `}</style>

//       {/* Header */}
//       <div style={{ marginBottom: 24 }}>
//         <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
//           {isAr ? '📊 استخدام API' : '📊 API Usage'}
//         </h1>
//         <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
//           {isAr 
//             ? 'تتبع استهلاك توكنات DeepSeek وأداء المنصة'
//             : 'Track DeepSeek token consumption and platform performance'}
//         </p>
//       </div>

//       {/* Period Selector */}
//       <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
//         {periods.map(p => (
//           <button
//             key={p.value}
//             onClick={() => setPeriod(p.value)}
//             style={{
//               padding: '8px 20px',
//               borderRadius: 10,
//               border: `1.5px solid ${period === p.value ? 'var(--text-primary)' : 'var(--border)'}`,
//               background: period === p.value ? 'var(--text-primary)' : 'transparent',
//               color: period === p.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
//               cursor: 'pointer',
//               fontSize: 13,
//               fontWeight: 600,
//               fontFamily: 'inherit',
//             }}
//           >
//             {isAr ? p.ar : p.en}
//           </button>
//         ))}
//         <button
//           onClick={fetchData}
//           style={{
//             padding: '8px 16px',
//             borderRadius: 10,
//             border: '1px solid var(--border)',
//             background: 'var(--bg-primary)',
//             cursor: 'pointer',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 6,
//           }}
//         >
//           <RefreshCw size={14} /> {isAr ? 'تحديث' : 'Refresh'}
//         </button>
//       </div>

//       {/* Stats Grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
//         <StatCard
//           icon={Database}
//           label={isAr ? 'إجمالي التوكنات' : 'Total Tokens'}
//           value={(summary?.totalTokens / 1000).toFixed(1) + 'K'}
//           sub={isAr ? `~${(summary?.totalTokens * 0.75 / 1000).toFixed(1)}K كلمات` : `~${(summary?.totalTokens * 0.75 / 1000).toFixed(1)}K words`}
//           color="#8B5CF6"
//         />
//         <StatCard
//           icon={Activity}
//           label={isAr ? 'طلبات API' : 'API Requests'}
//           value={summary?.byFeature ? Object.values(summary.byFeature).reduce((sum, f) => sum + f.count, 0).toLocaleString() : '0'}
//           sub={isAr ? 'إجمالي الطلبات' : 'Total requests'}
//           color="#3B82F6"
//         />
//         <StatCard
//           icon={DollarSign}
//           label={isAr ? 'التكلفة التقديرية' : 'Estimated Cost'}
//           value={`$${summary?.totalCost?.toFixed(4) || '0.00'}`}
//           sub={isAr ? 'بسعر DeepSeek' : 'at DeepSeek rates'}
//           color="#22C55E"
//         />
//         <StatCard
//           icon={TrendingUp}
//           label={isAr ? 'المتبقي هذا الشهر' : 'Remaining (month)'}
//           value={`${(summary?.remainingTokens / 1000).toFixed(0)}K`}
//           sub={`${summary?.usagePercent?.toFixed(1)}% ${isAr ? 'مستخدم' : 'used'}`}
//           color="#F59E0B"
//           trend={summary?.usagePercent}
//         />
//       </div>

//       {/* Usage Progress */}
//       <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
//           <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
//             {isAr ? 'استخدام حصة الشهر' : 'Monthly Quota Usage'}
//           </span>
//           <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
//             {summary?.totalTokens?.toLocaleString()} / {summary?.limit?.monthlyTokens?.toLocaleString()} tokens
//           </span>
//         </div>
//         <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
//           <div style={{
//             width: `${summary?.usagePercent || 0}%`,
//             height: '100%',
//             background: summary?.usagePercent > 80 ? '#EF4444' : summary?.usagePercent > 60 ? '#F59E0B' : '#8B5CF6',
//             borderRadius: 5,
//             transition: 'width 0.5s ease',
//           }} />
//         </div>
//         {summary?.usagePercent > 80 && (
//           <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
//             <AlertTriangle size={16} color="#EF4444" />
//             <span style={{ fontSize: 12, color: '#EF4444' }}>
//               {isAr ? '⚠️ لقد تجاوزت 80% من حصتك الشهرية!' : '⚠️ You have exceeded 80% of your monthly quota!'}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Two Column Layout */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        
//         {/* Left: Feature Breakdown */}
//         <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
//             <PieChart size={18} color="var(--text-secondary)" />
//             <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
//               {isAr ? 'التوزيع حسب الميزة' : 'Distribution by Feature'}
//             </h3>
//           </div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//             {summary?.byFeature && Object.entries(summary.byFeature).map(([key, stats]) => (
//               <FeatureCard 
//                 key={key} 
//                 feature={key} 
//                 stats={stats} 
//                 totalTokens={summary.totalTokens}
//                 isAr={isAr} 
//               />
//             ))}
//           </div>
//         </div>

//         {/* Right: Platform Pressure */}
//         {pressure && (
//           <div>
//             <PressureMeter pressure={pressure} isAr={isAr} />
//           </div>
//         )}
//       </div>

//       {/* Daily Usage Chart */}
//       {pressure?.dailyTokens?.length > 0 && (
//         <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginTop: 24 }}>
//           <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: 'var(--text-primary)' }}>
//             {isAr ? '📈 الاستخدام اليومي' : '📈 Daily Usage'}
//           </h3>
//           <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 200 }}>
//             {pressure.dailyTokens.map((day, i) => {
//               const maxTokens = Math.max(...pressure.dailyTokens.map(d => d.tokens));
//               const height = (day.tokens / maxTokens) * 160;
//               return (
//                 <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
//                   <div style={{
//                     width: '100%',
//                     height: height,
//                     background: '#8B5CF6',
//                     borderRadius: 4,
//                     opacity: 0.7,
//                     transition: 'height 0.3s ease',
//                   }} />
//                   <span style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
//                     {new Date(day.date).toLocaleDateString(isAr ? 'ar' : 'en', { day: 'numeric', month: 'short' })}
//                   </span>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }