// // 'use strict';
// // import { useState } from 'react';
// // import api from '../../services/api';
// // import useLangStore from '../../i18n';
// // import AdminTable from '../components/AdminTable';
// // import AdminPagination from '../components/AdminPagination';
// // import AdminBadge from '../components/AdminBadge';
// // import AdminExportBtn from '../components/AdminExportBtn';
// // import { ConfirmModal } from '../components/AdminModal';
// // import { Btn } from '../components/AdminUI';
// // import { Icon } from '../components/AdminIcons';
// // import { fmtNum, fmt } from '../components/AdminTokens';
// // import useAdminTable from '../components/useAdminTable';

// // const SH = ({ title, children }) => (
// //   <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
// //     <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
// //     <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
// //   </div>
// // );

// // // Status badge component
// // const StatusBadge = ({ status }) => {
// //   const getStatusConfig = () => {
// //     switch(status) {
// //       case 'active':
// //         return { label: 'Active', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
// //       case 'unsubscribed':
// //         return { label: 'Unsubscribed', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
// //       case 'bounced':
// //         return { label: 'Bounced', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
// //       default:
// //         return { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
// //     }
// //   };
  
// //   const config = getStatusConfig();
// //   return (
// //     <span style={{
// //       display: 'inline-block',
// //       padding: '2px 10px',
// //       borderRadius: 99,
// //       fontSize: 11,
// //       fontWeight: 600,
// //       background: config.bg,
// //       color: config.color,
// //       textTransform: 'capitalize'
// //     }}>
// //       {config.label}
// //     </span>
// //   );
// // };

// // // Source badge component
// // const SourceBadge = ({ source }) => {
// //   const getSourceConfig = () => {
// //     switch(source) {
// //       case 'footer':
// //         return { label: 'Footer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
// //       case 'homepage':
// //         return { label: 'Homepage', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
// //       case 'popup':
// //         return { label: 'Popup', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
// //       case 'other':
// //         return { label: 'Other', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
// //       default:
// //         return { label: source, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
// //     }
// //   };
  
// //   const config = getSourceConfig();
// //   return (
// //     <span style={{
// //       display: 'inline-block',
// //       padding: '2px 10px',
// //       borderRadius: 99,
// //       fontSize: 11,
// //       fontWeight: 600,
// //       background: config.bg,
// //       color: config.color,
// //       textTransform: 'capitalize'
// //     }}>
// //       {config.label}
// //     </span>
// //   );
// // };

// // // Status filter component
// // const StatusFilter = ({ currentStatus, onStatusChange, isAr }) => {
// //   const statuses = [
// //     { value: 'all', label: isAr ? 'الكل' : 'All' },
// //     { value: 'active', label: isAr ? 'نشط' : 'Active' },
// //     { value: 'unsubscribed', label: isAr ? 'ملغي' : 'Unsubscribed' },
// //     { value: 'bounced', label: isAr ? 'مرتد' : 'Bounced' }
// //   ];
  
// //   return (
// //     <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
// //       <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
// //         {isAr ? 'الحالة:' : 'Status:'}
// //       </span>
// //       <div style={{ display: 'flex', gap: 6 }}>
// //         {statuses.map(s => (
// //           <button
// //             key={s.value}
// //             onClick={() => onStatusChange(s.value)}
// //             style={{
// //               padding: '4px 12px',
// //               borderRadius: 6,
// //               fontSize: 12,
// //               fontWeight: currentStatus === s.value ? 600 : 400,
// //               background: currentStatus === s.value ? 'var(--text-primary)' : 'var(--bg-secondary)',
// //               color: currentStatus === s.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
// //               border: `1px solid ${currentStatus === s.value ? 'var(--text-primary)' : 'var(--border)'}`,
// //               cursor: 'pointer',
// //               transition: 'all 0.2s',
// //             }}
// //             onMouseEnter={e => {
// //               if (currentStatus !== s.value) {
// //                 e.currentTarget.style.borderColor = 'var(--text-primary)';
// //                 e.currentTarget.style.color = 'var(--text-primary)';
// //               }
// //             }}
// //             onMouseLeave={e => {
// //               if (currentStatus !== s.value) {
// //                 e.currentTarget.style.borderColor = 'var(--border)';
// //                 e.currentTarget.style.color = 'var(--text-secondary)';
// //               }
// //             }}
// //           >
// //             {s.label}
// //           </button>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // };

// // export default function NewsletterTab({ lang: langProp }) {
// //   const { lang: storeLang } = useLangStore();
// //   const lang = storeLang || langProp || 'en';
// //   const isAr = lang === 'ar';
// //   const [statusFilter, setStatusFilter] = useState('all');
  
// //   const { rows, total, page, setPage, loading, reload, limit } = useAdminTable(
// //     `/admin/newsletter?status=${statusFilter}`
// //   );
  
// //   const [confirm, setConfirm] = useState(null);
// //   const [cLoad, setCLoad] = useState(false);

// //   const doDelete = async () => {
// //     setCLoad(true);
// //     try { 
// //       await api.delete(`newsletter/subscribers/${confirm.id}`); 
// //       reload(); 
// //     } catch {}
// //     setCLoad(false); 
// //     setConfirm(null);
// //   };

// //   const cols = [
// //     { label: '#', key: 'id', width: 70, render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</span> },
// //     { label: isAr ? 'البريد الإلكتروني' : 'Email', key: 'email', render: r => (
// //       <span style={{ fontWeight: 500, fontSize: 13 }}>{r.email}</span>
// //     )},
// //     { label: isAr ? 'الحالة' : 'Status', key: 'status', render: r => <StatusBadge status={r.status} /> },
// //     { label: isAr ? 'المصدر' : 'Source', key: 'source', render: r => <SourceBadge source={r.source} /> },
// //     { label: 'IP', key: 'ipAddress', render: r => (
// //       <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
// //         {r.ipAddress || '—'}
// //       </span>
// //     )},
// //     { label: isAr ? 'تاريخ الاشتراك' : 'Subscribed', key: 'subscribedAt', render: r => fmt(r.subscribedAt) },
// //     { label: isAr ? 'تاريخ الإلغاء' : 'Unsubscribed', key: 'unsubscribedAt', render: r => r.unsubscribedAt ? fmt(r.unsubscribedAt) : '—' },
// //     { label: isAr ? 'إجراءات' : 'Actions', key: '_', width: 80, render: r => (
// //       <Btn 
// //         size="sm" 
// //         variant="danger" 
// //         onClick={e => {
// //           e.stopPropagation();
// //           setConfirm({
// //             id: r.id,
// //             email: r.email,
// //             msg: isAr ? `هل أنت متأكد من حذف ${r.email} من قائمة النشرة البريدية؟` : `Are you sure you want to remove ${r.email} from newsletter list?`
// //           });
// //         }}
// //       >
// //         <Icon name="trash" size={12} />
// //       </Btn>
// //     )},
// //   ];

// //   // Stats cards
// //   const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, today: 0 });
// //   const [statsLoading, setStatsLoading] = useState(true);

// //   useState(() => {
// //     const fetchStats = async () => {
// //       try {
// //         const { data } = await api.get('/newsletter/subscribers');
// //         if (data.success) {
// //           setStats(data.data);
// //         }
// //       } catch (error) {
// //         console.error('Failed to fetch stats:', error);
// //       } finally {
// //         setStatsLoading(false);
// //       }
// //     };
// //     fetchStats();
// //   }, []);

// //   const StatCard = ({ label, value, color }) => (
// //     <div style={{
// //       flex: 1,
// //       padding: '16px 20px',
// //       background: 'var(--bg-secondary)',
// //       border: '1px solid var(--border)',
// //       borderRadius: 12,
// //       minWidth: 120,
// //     }}>
// //       <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
// //         {label}
// //       </div>
// //       <div style={{ fontSize: 28, fontWeight: 800, color: color || 'var(--text-primary)' }}>
// //         {statsLoading ? '...' : fmtNum(value)}
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
// //       <ConfirmModal 
// //         open={!!confirm} 
// //         onClose={() => setConfirm(null)} 
// //         onConfirm={doDelete} 
// //         message={confirm?.msg} 
// //         loading={cLoad} 
// //         danger 
// //       />
      
// //       {/* Stats Cards */}
// //       <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
// //         <StatCard 
// //           label={isAr ? 'إجمالي المشتركين' : 'Total Subscribers'} 
// //           value={stats.total} 
// //           color="#8B5CF6"
// //         />
// //         <StatCard 
// //           label={isAr ? 'نشط' : 'Active'} 
// //           value={stats.active} 
// //           color="#22C55E"
// //         />
// //         <StatCard 
// //           label={isAr ? 'ملغي' : 'Unsubscribed'} 
// //           value={stats.unsubscribed} 
// //           color="#EF4444"
// //         />
// //         <StatCard 
// //           label={isAr ? 'اليوم' : 'Today'} 
// //           value={stats.today} 
// //           color="#F59E0B"
// //         />
// //       </div>
      
// //       {/* Header with Export */}
// //       <SH title={`${isAr ? 'المشتركين في النشرة البريدية' : 'Newsletter Subscribers'} (${fmtNum(total)})`}>
// //         <div style={{ display: 'flex', gap: 8 }}>
// //           <StatusFilter 
// //             currentStatus={statusFilter} 
// //             onStatusChange={(status) => {
// //               setStatusFilter(status);
// //               setPage(1);
// //             }} 
// //             isAr={isAr} 
// //           />
// //           <AdminExportBtn type="newsletter" filters={{ status: statusFilter }} />
// //         </div>
// //       </SH>
      
// //       {/* Table */}
// //       <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
// //         <AdminTable 
// //           columns={cols} 
// //           rows={rows} 
// //           loading={loading} 
// //           isRtl={isAr} 
// //           empty={isAr ? 'لا يوجد مشتركين' : 'No subscribers found'} 
// //         />
// //         <AdminPagination 
// //           page={page} 
// //           total={total} 
// //           limit={limit} 
// //           onPage={setPage} 
// //           isRtl={isAr} 
// //         />
// //       </div>
// //     </div>
// //   );
// // }

// 'use strict';
// import { useState, useEffect } from 'react';
// import api from '../../services/api';
// import useLangStore from '../../i18n';
// import AdminTable from '../components/AdminTable';
// import AdminPagination from '../components/AdminPagination';
// import AdminBadge from '../components/AdminBadge';
// import AdminExportBtn from '../components/AdminExportBtn';
// import { ConfirmModal } from '../components/AdminModal';
// import { Btn } from '../components/AdminUI';
// import { Icon } from '../components/AdminIcons';
// import { fmtNum, fmt } from '../components/AdminTokens';
// import useAdminTable from '../components/useAdminTable';

// const SH = ({ title, children }) => (
//   <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
//     <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
//     <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
//   </div>
// );

// // Status badge component
// const StatusBadge = ({ status }) => {
//   const getStatusConfig = () => {
//     switch(status) {
//       case 'active':
//         return { label: 'Active', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
//       case 'unsubscribed':
//         return { label: 'Unsubscribed', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
//       case 'bounced':
//         return { label: 'Bounced', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
//       default:
//         return { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
//     }
//   };
  
//   const config = getStatusConfig();
//   return (
//     <span style={{
//       display: 'inline-block',
//       padding: '2px 10px',
//       borderRadius: 99,
//       fontSize: 11,
//       fontWeight: 600,
//       background: config.bg,
//       color: config.color,
//       textTransform: 'capitalize'
//     }}>
//       {config.label}
//     </span>
//   );
// };

// // Source badge component
// const SourceBadge = ({ source }) => {
//   const getSourceConfig = () => {
//     switch(source) {
//       case 'footer':
//         return { label: 'Footer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
//       case 'homepage':
//         return { label: 'Homepage', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
//       case 'popup':
//         return { label: 'Popup', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
//       case 'other':
//         return { label: 'Other', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
//       default:
//         return { label: source, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
//     }
//   };
  
//   const config = getSourceConfig();
//   return (
//     <span style={{
//       display: 'inline-block',
//       padding: '2px 10px',
//       borderRadius: 99,
//       fontSize: 11,
//       fontWeight: 600,
//       background: config.bg,
//       color: config.color,
//       textTransform: 'capitalize'
//     }}>
//       {config.label}
//     </span>
//   );
// };

// // Status filter component
// const StatusFilter = ({ currentStatus, onStatusChange, isAr }) => {
//   const statuses = [
//     { value: 'all', label: isAr ? 'الكل' : 'All' },
//     { value: 'active', label: isAr ? 'نشط' : 'Active' },
//     { value: 'unsubscribed', label: isAr ? 'ملغي' : 'Unsubscribed' },
//     { value: 'bounced', label: isAr ? 'مرتد' : 'Bounced' }
//   ];
  
//   return (
//     <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//       <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
//         {isAr ? 'الحالة:' : 'Status:'}
//       </span>
//       <div style={{ display: 'flex', gap: 6 }}>
//         {statuses.map(s => (
//           <button
//             key={s.value}
//             onClick={() => onStatusChange(s.value)}
//             style={{
//               padding: '4px 12px',
//               borderRadius: 6,
//               fontSize: 12,
//               fontWeight: currentStatus === s.value ? 600 : 400,
//               background: currentStatus === s.value ? 'var(--text-primary)' : 'var(--bg-secondary)',
//               color: currentStatus === s.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
//               border: `1px solid ${currentStatus === s.value ? 'var(--text-primary)' : 'var(--border)'}`,
//               cursor: 'pointer',
//               transition: 'all 0.2s',
//             }}
//             onMouseEnter={e => {
//               if (currentStatus !== s.value) {
//                 e.currentTarget.style.borderColor = 'var(--text-primary)';
//                 e.currentTarget.style.color = 'var(--text-primary)';
//               }
//             }}
//             onMouseLeave={e => {
//               if (currentStatus !== s.value) {
//                 e.currentTarget.style.borderColor = 'var(--border)';
//                 e.currentTarget.style.color = 'var(--text-secondary)';
//               }
//             }}
//           >
//             {s.label}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default function NewsletterTab({ lang: langProp }) {
//   const { lang: storeLang } = useLangStore();
//   const lang = storeLang || langProp || 'en';
//   const isAr = lang === 'ar';
//   const [statusFilter, setStatusFilter] = useState('all');
  
//   const { rows, total, page, setPage, loading, reload, limit } = useAdminTable(
//     `/newsletter/subscribers?status=${statusFilter}`
//   );
  
//   const [confirm, setConfirm] = useState(null);
//   const [cLoad, setCLoad] = useState(false);

//   const doDelete = async () => {
//     setCLoad(true);
//     try { 
//       await api.delete(`/newsletter/subscribers/${confirm.id}`); 
//       reload(); 
//     } catch {}
//     setCLoad(false); 
//     setConfirm(null);
//   };

//   const cols = [
//     { label: '#', key: 'id', width: 70, render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</span> },
//     { label: isAr ? 'البريد الإلكتروني' : 'Email', key: 'email', render: r => (
//       <span style={{ fontWeight: 500, fontSize: 13 }}>{r.email}</span>
//     )},
//     { label: isAr ? 'الحالة' : 'Status', key: 'status', render: r => <StatusBadge status={r.status} /> },
//     { label: isAr ? 'المصدر' : 'Source', key: 'source', render: r => <SourceBadge source={r.source} /> },
//     { label: 'IP', key: 'ipAddress', render: r => (
//       <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
//         {r.ipAddress || '—'}
//       </span>
//     )},
//     { label: isAr ? 'تاريخ الاشتراك' : 'Subscribed', key: 'subscribedAt', render: r => fmt(r.subscribedAt) },
//     { label: isAr ? 'تاريخ الإلغاء' : 'Unsubscribed', key: 'unsubscribedAt', render: r => r.unsubscribedAt ? fmt(r.unsubscribedAt) : '—' },
//     { label: isAr ? 'إجراءات' : 'Actions', key: '_', width: 80, render: r => (
//       <Btn 
//         size="sm" 
//         variant="danger" 
//         onClick={e => {
//           e.stopPropagation();
//           setConfirm({
//             id: r.id,
//             email: r.email,
//             msg: isAr ? `هل أنت متأكد من حذف ${r.email} من قائمة النشرة البريدية؟` : `Are you sure you want to remove ${r.email} from newsletter list?`
//           });
//         }}
//       >
//         <Icon name="trash" size={12} />
//       </Btn>
//     )},
//   ];

//   // Stats cards
//   const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, today: 0 });
//   const [statsLoading, setStatsLoading] = useState(true);

//   useEffect(() => {
//     const fetchStats = async () => {
//       try {
//         const { data } = await api.get('/newsletter/stats');
//         if (data.success) {
//           setStats(data.data);
//         }
//       } catch (error) {
//         console.error('Failed to fetch stats:', error);
//       } finally {
//         setStatsLoading(false);
//       }
//     };
//     fetchStats();
//   }, []);

//   const StatCard = ({ label, value, color }) => (
//     <div style={{
//       flex: 1,
//       padding: '16px 20px',
//       background: 'var(--bg-secondary)',
//       border: '1px solid var(--border)',
//       borderRadius: 12,
//       minWidth: 120,
//     }}>
//       <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
//         {label}
//       </div>
//       <div style={{ fontSize: 28, fontWeight: 800, color: color || 'var(--text-primary)' }}>
//         {statsLoading ? '...' : fmtNum(value)}
//       </div>
//     </div>
//   );

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//       <ConfirmModal 
//         open={!!confirm} 
//         onClose={() => setConfirm(null)} 
//         onConfirm={doDelete} 
//         message={confirm?.msg} 
//         loading={cLoad} 
//         danger 
//       />
      
//       {/* Stats Cards */}
//       <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
//         <StatCard 
//           label={isAr ? 'إجمالي المشتركين' : 'Total Subscribers'} 
//           value={stats.total} 
//           color="#8B5CF6"
//         />
//         <StatCard 
//           label={isAr ? 'نشط' : 'Active'} 
//           value={stats.active} 
//           color="#22C55E"
//         />
//         <StatCard 
//           label={isAr ? 'ملغي' : 'Unsubscribed'} 
//           value={stats.unsubscribed} 
//           color="#EF4444"
//         />
//         <StatCard 
//           label={isAr ? 'اليوم' : 'Today'} 
//           value={stats.today} 
//           color="#F59E0B"
//         />
//       </div>
      
//       {/* Header with Export */}
//       <SH title={`${isAr ? 'المشتركين في النشرة البريدية' : 'Newsletter Subscribers'} (${fmtNum(total)})`}>
//         <div style={{ display: 'flex', gap: 8 }}>
//           <StatusFilter 
//             currentStatus={statusFilter} 
//             onStatusChange={(status) => {
//               setStatusFilter(status);
//               setPage(1);
//             }} 
//             isAr={isAr} 
//           />
//           <AdminExportBtn type="newsletter" filters={{ status: statusFilter }} />
//         </div>
//       </SH>
      
//       {/* Table */}
//       <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
//         <AdminTable 
//           columns={cols} 
//           rows={rows} 
//           loading={loading} 
//           isRtl={isAr} 
//           empty={isAr ? 'لا يوجد مشتركين' : 'No subscribers found'} 
//         />
//         <AdminPagination 
//           page={page} 
//           total={total} 
//           limit={limit} 
//           onPage={setPage} 
//           isRtl={isAr} 
//         />
//       </div>
//     </div>
//   );
// }

'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import AdminTable from '../components/AdminTable';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { ConfirmModal } from '../components/AdminModal';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum, fmt } from '../components/AdminTokens';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

// Status badge component
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch(status) {
      case 'active':
        return { label: 'Active', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' };
      case 'unsubscribed':
        return { label: 'Unsubscribed', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
      case 'bounced':
        return { label: 'Bounced', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
      default:
        return { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
    }
  };
  
  const config = getStatusConfig();
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      textTransform: 'capitalize'
    }}>
      {config.label}
    </span>
  );
};

// Source badge component
const SourceBadge = ({ source }) => {
  const getSourceConfig = () => {
    switch(source) {
      case 'footer':
        return { label: 'Footer', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' };
      case 'homepage':
        return { label: 'Homepage', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      case 'popup':
        return { label: 'Popup', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
      case 'other':
        return { label: 'Other', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
      default:
        return { label: source, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
    }
  };
  
  const config = getSourceConfig();
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 11,
      fontWeight: 600,
      background: config.bg,
      color: config.color,
      textTransform: 'capitalize'
    }}>
      {config.label}
    </span>
  );
};

// Status filter component
const StatusFilter = ({ currentStatus, onStatusChange, isAr }) => {
  const statuses = [
    { value: 'all', label: isAr ? 'الكل' : 'All' },
    { value: 'active', label: isAr ? 'نشط' : 'Active' },
    { value: 'unsubscribed', label: isAr ? 'ملغي' : 'Unsubscribed' },
    { value: 'bounced', label: isAr ? 'مرتد' : 'Bounced' }
  ];
  
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
        {isAr ? 'الحالة:' : 'Status:'}
      </span>
      <div style={{ display: 'flex', gap: 6 }}>
        {statuses.map(s => (
          <button
            key={s.value}
            onClick={() => onStatusChange(s.value)}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: currentStatus === s.value ? 600 : 400,
              background: currentStatus === s.value ? 'var(--text-primary)' : 'var(--bg-secondary)',
              color: currentStatus === s.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: `1px solid ${currentStatus === s.value ? 'var(--text-primary)' : 'var(--border)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              if (currentStatus !== s.value) {
                e.currentTarget.style.borderColor = 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={e => {
              if (currentStatus !== s.value) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function NewsletterTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const [statusFilter, setStatusFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(50);
  
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, today: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch subscribers
  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/newsletter/subscribers?status=${statusFilter}&page=${page}&limit=${limit}`);
      if (data.success) {
        setRows(data.data.subscribers || []);
        setTotal(data.data.pagination?.total || 0);
      } else {
        setRows([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const { data } = await api.get('/newsletter/stats');
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [statusFilter, page, limit]);

  useEffect(() => {
    fetchStats();
  }, []);

  const reload = () => {
    fetchSubscribers();
    fetchStats();
  };

  const doDelete = async () => {
    setCLoad(true);
    try { 
      await api.delete(`/newsletter/subscribers/${confirm.id}`); 
      reload(); 
    } catch {}
    setCLoad(false); 
    setConfirm(null);
  };

  const cols = [
    { label: '#', key: 'id', width: 70, render: r => <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.id}</span> },
    { label: isAr ? 'البريد الإلكتروني' : 'Email', key: 'email', render: r => (
      <span style={{ fontWeight: 500, fontSize: 13 }}>{r.email}</span>
    )},
    { label: isAr ? 'الحالة' : 'Status', key: 'status', render: r => <StatusBadge status={r.status} /> },
    { label: isAr ? 'المصدر' : 'Source', key: 'source', render: r => <SourceBadge source={r.source} /> },
    { label: 'IP', key: 'ipAddress', render: r => (
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-secondary)' }}>
        {r.ipAddress || '—'}
      </span>
    )},
    { label: isAr ? 'تاريخ الاشتراك' : 'Subscribed', key: 'subscribedAt', render: r => fmt(r.subscribedAt) },
    { label: isAr ? 'تاريخ الإلغاء' : 'Unsubscribed', key: 'unsubscribedAt', render: r => r.unsubscribedAt ? fmt(r.unsubscribedAt) : '—' },
    { label: isAr ? 'إجراءات' : 'Actions', key: '_', width: 80, render: r => (
      <Btn 
        size="sm" 
        variant="danger" 
        onClick={e => {
          e.stopPropagation();
          setConfirm({
            id: r.id,
            email: r.email,
            msg: isAr ? `هل أنت متأكد من حذف ${r.email} من قائمة النشرة البريدية؟` : `Are you sure you want to remove ${r.email} from newsletter list?`
          });
        }}
      >
        <Icon name="trash" size={12} />
      </Btn>
    )},
  ];

  const StatCard = ({ label, value, color }) => (
    <div style={{
      flex: 1,
      padding: '16px 20px',
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      minWidth: 120,
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || 'var(--text-primary)' }}>
        {statsLoading ? '...' : fmtNum(value)}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ConfirmModal 
        open={!!confirm} 
        onClose={() => setConfirm(null)} 
        onConfirm={doDelete} 
        message={confirm?.msg} 
        loading={cLoad} 
        danger 
      />
      
      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <StatCard 
          label={isAr ? 'إجمالي المشتركين' : 'Total Subscribers'} 
          value={stats.total} 
          color="#8B5CF6"
        />
        <StatCard 
          label={isAr ? 'نشط' : 'Active'} 
          value={stats.active} 
          color="#22C55E"
        />
        <StatCard 
          label={isAr ? 'ملغي' : 'Unsubscribed'} 
          value={stats.unsubscribed} 
          color="#EF4444"
        />
        <StatCard 
          label={isAr ? 'اليوم' : 'Today'} 
          value={stats.today} 
          color="#F59E0B"
        />
      </div>
      
      {/* Header with Export */}
      <SH title={`${isAr ? 'المشتركين في النشرة البريدية' : 'Newsletter Subscribers'} (${fmtNum(total)})`}>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatusFilter 
            currentStatus={statusFilter} 
            onStatusChange={(status) => {
              setStatusFilter(status);
              setPage(1);
            }} 
            isAr={isAr} 
          />
          <AdminExportBtn type="newsletter" filters={{ status: statusFilter }} />
        </div>
      </SH>
      
      {/* Table */}
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable 
          columns={cols} 
          rows={rows} 
          loading={loading} 
          isRtl={isAr} 
          empty={isAr ? 'لا يوجد مشتركين' : 'No subscribers found'} 
        />
        <AdminPagination 
          page={page} 
          total={total} 
          limit={limit} 
          onPage={setPage} 
          isRtl={isAr} 
        />
      </div>
    </div>
  );
}