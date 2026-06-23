// 'use strict';
// import { useState, useEffect } from 'react';
// import { 
//   Settings, MessageSquare, BarChart3, Users, Calendar, Clock, 
//   Brain, Save, RefreshCw, AlertCircle, Edit2, Check, X, 
//   Infinity, Search, Eye, Trophy, ChevronLeft, ChevronRight,
//   TrendingUp, User, Filter, Download, Activity, Award
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// export default function InterviewTab() {
//   const [activeSubTab, setActiveSubTab] = useState('limits');
//   const [loading, setLoading] = useState(false);

//   const subTabs = [
//     { id: 'limits', label: 'Limits Configuration', icon: Settings },
//     { id: 'sessions', label: 'Sessions History', icon: MessageSquare },
//     { id: 'analytics', label: 'Analytics & Stats', icon: BarChart3 },
//   ];

//   return (
//     <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ marginBottom: 32 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
//           <div style={{
//             width: 48,
//             height: 48,
//             borderRadius: 12,
//             background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}>
//             <Brain size={24} color="#fff" />
//           </div>
//           <div>
//             <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
//               Interview Training Management
//             </h1>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
//               Manage AI interview limits, view sessions, and track analytics
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Sub Tabs */}
//       <div style={{
//         display: 'flex',
//         gap: 8,
//         borderBottom: '1px solid var(--border)',
//         marginBottom: 24,
//         overflowX: 'auto'
//       }}>
//         {subTabs.map(tab => (
//           <button
//             key={tab.id}
//             onClick={() => setActiveSubTab(tab.id)}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 8,
//               padding: '10px 20px',
//               background: 'transparent',
//               border: 'none',
//               borderBottom: activeSubTab === tab.id ? '2px solid #8B5CF6' : '2px solid transparent',
//               color: activeSubTab === tab.id ? '#8B5CF6' : 'var(--text-secondary)',
//               cursor: 'pointer',
//               fontSize: 13,
//               fontWeight: 600,
//               transition: 'all 0.2s',
//               whiteSpace: 'nowrap'
//             }}
//           >
//             <tab.icon size={16} />
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       {activeSubTab === 'limits' && <LimitsSubTab />}
//       {activeSubTab === 'sessions' && <SessionsSubTab />}
//       {activeSubTab === 'analytics' && <AnalyticsSubTab />}
//     </div>
//   );
// }

// // ============================================
// // LIMITS SUBTAB
// // ============================================
// function LimitsSubTab() {
//   const [limits, setLimits] = useState({
//     free: { perDay: 3, perMonth: 12, questionsPerInterview: 5, duration: 0, capacity: 0 },
//     pro: { perDay: 6, perMonth: 18, questionsPerInterview: 8, duration: 60, capacity: 20 },
//     elite: { perDay: 0, perMonth: 0, questionsPerInterview: 8, duration: 30, capacity: 0 }
//   });
//   const [editing, setEditing] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     fetchLimits();
//   }, []);

//   const fetchLimits = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/admin/training/limits');
//       if (data.data?.limits) {
//         setLimits(data.data.limits);
//       }
//     } catch (err) {
//       toast.error('Failed to load limits');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveLimits = async () => {
//     setSaving(true);
//     try {
//       await api.put('/admin/training/limits', { limits });
//       toast.success('Interview limits updated successfully');
//       setEditing(null);
//     } catch (err) {
//       toast.error('Failed to update limits');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const updateLimit = (plan, field, value) => {
//     setLimits(prev => ({
//       ...prev,
//       [plan]: { ...prev[plan], [field]: parseInt(value) || 0 }
//     }));
//   };

//   const plans = [
//     { key: 'free', name: 'FREE', color: '#6B7280', bg: 'rgba(107,114,128,0.08)', icon: '🔓' },
//     { key: 'pro', name: 'PRO', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', icon: '⭐' },
//     { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: '👑' }
//   ];

//   const fields = [
//     { key: 'perDay', label: 'Daily Limit', icon: Calendar, unit: 'interviews', help: '0 = unlimited' },
//     { key: 'perMonth', label: 'Monthly Limit', icon: Clock, unit: 'interviews', help: '0 = unlimited' },
//     { key: 'questionsPerInterview', label: 'Questions', icon: MessageSquare, unit: 'questions', help: 'Max per interview' },
//     { key: 'duration', label: 'Duration', icon: Clock, unit: 'min', help: '0 = unlimited' },
//     { key: 'capacity', label: 'Capacity', icon: Users, unit: 'users', help: '0 = unlimited' }
//   ];

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: 60 }}>
//         <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Info Box */}
//       <div style={{
//         marginBottom: 24,
//         padding: '14px 18px',
//         background: 'rgba(59,130,246,0.08)',
//         borderRadius: 12,
//         border: '1px solid rgba(59,130,246,0.2)',
//         display: 'flex',
//         alignItems: 'flex-start',
//         gap: 10
//       }}>
//         <AlertCircle size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
//         <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
//           <strong style={{ color: '#3B82F6' }}>Note:</strong> Changes take effect immediately. 
//           0 means unlimited. Daily limits reset at midnight UTC, monthly on the 1st.
//         </div>
//       </div>

//       {/* Limits Cards */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//         {plans.map(plan => (
//           <div
//             key={plan.key}
//             style={{
//               background: 'var(--bg-secondary)',
//               borderRadius: 14,
//               border: `1px solid ${plan.color}20`,
//               overflow: 'hidden'
//             }}
//           >
//             {/* Plan Header */}
//             <div style={{
//               padding: '16px 20px',
//               background: plan.bg,
//               borderBottom: `1px solid ${plan.color}20`,
//               display: 'flex',
//               alignItems: 'center',
//               gap: 10
//             }}>
//               <span style={{ fontSize: 20 }}>{plan.icon}</span>
//               <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: plan.color }}>
//                 {plan.name} Plan
//               </h3>
//             </div>

//             {/* Fields Grid */}
//             <div style={{ padding: '20px' }}>
//               <div style={{
//                 display: 'grid',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
//                 gap: 14
//               }}>
//                 {fields.map(field => {
//                   const value = limits[plan.key]?.[field.key] ?? 0;
//                   const isEditingField = editing === `${plan.key}-${field.key}`;
                  
//                   return (
//                     <div key={field.key} style={{
//                       padding: '12px 14px',
//                       background: 'var(--bg-primary)',
//                       borderRadius: 10,
//                       border: '1px solid var(--border)'
//                     }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
//                         <field.icon size={12} color="var(--text-secondary)" />
//                         <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
//                           {field.label}
//                         </span>
//                       </div>
                      
//                       {isEditingField ? (
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                           <input
//                             type="number"
//                             value={value}
//                             onChange={(e) => updateLimit(plan.key, field.key, e.target.value)}
//                             style={{
//                               width: 80,
//                               padding: '6px 10px',
//                               borderRadius: 6,
//                               border: `1px solid ${plan.color}`,
//                               background: 'var(--bg-primary)',
//                               color: 'var(--text-primary)',
//                               fontSize: 13,
//                               fontWeight: 600,
//                               outline: 'none'
//                             }}
//                             autoFocus
//                           />
//                           <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{field.unit}</span>
//                           <button onClick={() => setEditing(null)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#22C55E' }}>
//                             <Check size={14} />
//                           </button>
//                           <button onClick={() => { setEditing(null); fetchLimits(); }} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
//                             <X size={14} />
//                           </button>
//                         </div>
//                       ) : (
//                         <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
//                           <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
//                             <span style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-en)', color: value === 0 ? plan.color : 'var(--text-primary)' }}>
//                               {value === 0 ? <Infinity size={16} /> : value}
//                             </span>
//                             {value !== 0 && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{field.unit}</span>}
//                           </div>
//                           <button onClick={() => setEditing(`${plan.key}-${field.key}`)} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', opacity: 0.5 }}>
//                             <Edit2 size={12} />
//                           </button>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Actions */}
//       <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
//         <button onClick={fetchLimits} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
//           <RefreshCw size={14} /> Reset
//         </button>
//         <button onClick={handleSaveLimits} disabled={saving} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
//           <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
//         </button>
//       </div>

//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         .spin {
//           animation: spin 1s linear infinite;
//         }
//       `}</style>
//     </div>
//   );
// }

// // ============================================
// // SESSIONS SUBTAB
// // ============================================
// // ============================================
// // SESSIONS SUBTAB - الجزء المصحح
// // ============================================
// function SessionsSubTab() {
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedSession, setSelectedSession] = useState(null);
//   const [filters, setFilters] = useState({ userId: '', status: '', fromDate: '', toDate: '' });
//   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

//   useEffect(() => {
//     fetchSessions();
//   }, [pagination.page, filters.status, filters.fromDate, filters.toDate]);

//   const fetchSessions = async () => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams({ 
//         page: pagination.page, 
//         limit: pagination.limit, 
//         ...(filters.userId && { userId: filters.userId }), 
//         ...(filters.status && { status: filters.status }), 
//         ...(filters.fromDate && { fromDate: filters.fromDate }), 
//         ...(filters.toDate && { toDate: filters.toDate }) 
//       });
//       const { data } = await api.get(`/admin/training/sessions?${params}`);
//       if (data.data) {
//         setSessions(data.data.sessions);
//         setPagination(prev => ({ ...prev, total: data.data.total, totalPages: data.data.totalPages }));
//       }
//     } catch (err) {
//       toast.error('Failed to load sessions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusStyle = (status) => {
//     if (status === 'completed') return { bg: 'rgba(34,197,94,0.1)', color: '#22C55E' };
//     return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
//   };

//   const getScoreColor = (score) => {
//     if (score >= 80) return '#22C55E';
//     if (score >= 60) return '#F59E0B';
//     return '#EF4444';
//   };

//   return (
//     <div>
//       {/* Filters */}
//       <div style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
//           <input type="text" placeholder="User ID" value={filters.userId} onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
//           <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
//             <option value="">All Status</option>
//             <option value="completed">Completed</option>
//             <option value="in_progress">In Progress</option>
//           </select>
//           <input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
//           <input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
//           <button onClick={fetchSessions} style={{ padding: '8px 16px', borderRadius: 8, background: '#3B82F6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 13 }}>
//             <Search size={14} /> Search
//           </button>
//         </div>
//       </div>

//       {/* Table */}
//       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
//         <div style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
//           <style>{`
//             div::-webkit-scrollbar {
//               display: none;
//             }
//           `}</style>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
//               <tr>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>ID</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>User</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Job Title</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Score</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Date</th>
//                 <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="7" style={{ padding: '60px', textAlign: 'center' }}>
//                     <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
//                   </td>
//                 </tr>
//               ) : sessions.length === 0 ? (
//                 <tr>
//                   <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
//                     No sessions found
//                   </td>
//                 </tr>
//               ) : (
//                 sessions.map(session => {
//                   const user = session.user || {};
//                   const statusStyle = getStatusStyle(session.status);
//                   return (
//                     <tr key={session.id} style={{ borderBottom: '1px solid var(--border)' }}>
//                       <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-en)' }}>#{session.id}</td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <div><span style={{ fontSize: 13, fontWeight: 500 }}>{user.name || user.email?.split('@')[0] || 'N/A'}</span></div>
//                         <div><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.email || ''}</span></div>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: 13 }}>{session.title || session.jobTitle}</td>
//                       <td style={{ padding: '12px 16px' }}>
//                         {session.overallScore ? (
//                           <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: `${getScoreColor(session.overallScore)}20`, color: getScoreColor(session.overallScore), fontWeight: 700, fontSize: 12 }}>{session.overallScore}%</span>
//                         ) : '—'}
//                       </td>
//                       <td style={{ padding: '12px 16px' }}>
//                         <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>{session.status}</span>
//                       </td>
//                       <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(session.startedAt).toLocaleDateString()}</td>
//                       <td style={{ padding: '12px 16px', textAlign: 'center' }}>
//                         <button onClick={() => setSelectedSession(session)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11 }}>
//                           <Eye size={12} /> View
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
//             <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages}</span>
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button 
//                 onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} 
//                 disabled={pagination.page === 1} 
//                 style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}
//               >
//                 <ChevronLeft size={14} /> Prev
//               </button>
//               <button 
//                 onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} 
//                 disabled={pagination.page === pagination.totalPages} 
//                 style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1 }}
//               >
//                 Next <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Session Details Modal */}
//       {selectedSession && (
//         <SessionDetailsModal session={selectedSession} onClose={() => setSelectedSession(null)} />
//       )}
//     </div>
//   );
// }

// // ============================================
// // SESSION DETAILS MODAL
// // ============================================
// function SessionDetailsModal({ session, onClose }) {
//   const user = session.User || {};
  
//   return (
//     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
//       <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
//         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//           <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Session Details #{session.id}</h3>
//           <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
//         </div>
//         <div style={{ padding: '24px' }}>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User</label><p style={{ fontSize: 14, marginTop: 4 }}>{user.name || 'N/A'} ({user.email || 'N/A'})</p></div>
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Job Title</label><p style={{ fontSize: 14, marginTop: 4 }}>{session.title || session.jobTitle}</p></div>
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall Score</label><p style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: session.overallScore >= 80 ? '#22C55E' : session.overallScore >= 60 ? '#F59E0B' : '#EF4444' }}>{session.overallScore || 0}%</p></div>
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label><p style={{ fontSize: 14, marginTop: 4 }}>{session.status}</p></div>
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Started</label><p style={{ fontSize: 14, marginTop: 4 }}>{new Date(session.startedAt).toLocaleString()}</p></div>
//             {session.completedAt && <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed</label><p style={{ fontSize: 14, marginTop: 4 }}>{new Date(session.completedAt).toLocaleString()}</p></div>}
//           </div>
          
//           {session.questions && session.questions.length > 0 && (
//             <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Questions & Answers</label>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {session.questions.map((q, i) => (
//                   <div key={i} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
//                     <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Q{i+1}: {typeof q === 'string' ? q : q.question}</p>
//                     {session.answers && session.answers[i] && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>A: {typeof session.answers[i] === 'string' ? session.answers[i] : session.answers[i]?.a || session.answers[i]?.answer}</p>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // ANALYTICS SUBTAB
// // ============================================
// function AnalyticsSubTab() {
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userStats, setUserStats] = useState([]);
//   const [selectedUser, setSelectedUser] = useState('');

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const [statsRes, userStatsRes] = await Promise.all([
//         api.get('/admin/training/stats/global'),
//         api.get('/admin/training/stats/users')
//       ]);
//       if (statsRes.data?.data) setStats(statsRes.data.data);
//       if (userStatsRes.data?.data) setUserStats(userStatsRes.data.data);
//     } catch (err) {
//       toast.error('Failed to load analytics');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: 60 }}>
//         <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Stats Cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
//         <StatCard icon={<MessageSquare size={20} />} label="Total Sessions" value={stats?.totalSessions || 0} color="#3B82F6" />
//         <StatCard icon={<Award size={20} />} label="Completion Rate" value={`${stats?.completionRate || 0}%`} color="#22C55E" />
//         <StatCard icon={<Calendar size={20} />} label="Today" value={stats?.todaySessions || 0} color="#F59E0B" />
//         <StatCard icon={<Clock size={20} />} label="This Month" value={stats?.monthSessions || 0} color="#8B5CF6" />
//         <StatCard icon={<TrendingUp size={20} />} label="Avg Score" value={`${stats?.averageScore || 0}%`} color="#EF4444" />
//       </div>

//       {/* Usage by Plan */}
//       {stats?.usageByPlan && stats.usageByPlan.length > 0 && (
//         <div style={{ marginBottom: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
//           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Sessions by Plan</h4>
//           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
//             {stats.usageByPlan.map(item => (
//               <div key={item.plan} style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: 28, fontWeight: 800, color: item.plan === 'pro' ? '#F59E0B' : item.plan === 'elite' ? '#8B5CF6' : '#6B7280' }}>{item.count}</div>
//                 <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{item.plan}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* User Stats Table */}
//       {userStats.length > 0 && (
//         <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
//           <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
//             <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} /> Daily Usage Statistics</h4>
//           </div>
//           <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
//                 <tr><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Date</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Sessions</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Avg Score</th></tr>
//               </thead>
//               <tbody>
//                 {userStats.map((stat, i) => (
//                   <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
//                     <td style={{ padding: '10px 16px', fontSize: 13 }}>{stat.date}</td>
//                     <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{stat.count}</td>
//                     <td style={{ padding: '10px 16px', fontSize: 13 }}>{parseFloat(stat.avgScore).toFixed(1)}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function StatCard({ icon, label, value, color }) {
//   return (
//     <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
//         <div style={{ color }}>{icon}</div>
//         <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
//       </div>
//       <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
//     </div>
//   );
// }

'use strict';
import { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, BarChart3, Users, Calendar, Clock, 
  Brain, Save, RefreshCw, AlertCircle, Edit2, Check, X, 
  Search, Eye, Trophy, ChevronLeft, ChevronRight,
  TrendingUp, Award
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function InterviewTab() {
  const [activeSubTab, setActiveSubTab] = useState('limits');

  const subTabs = [
    { id: 'limits', label: 'Limits Configuration', icon: Settings },
    { id: 'sessions', label: 'Sessions History', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics & Stats', icon: BarChart3 },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Interview Training Management
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Manage AI interview limits, view sessions, and track analytics
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border)',
        marginBottom: 24,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeSubTab === tab.id ? '2px solid #8B5CF6' : '2px solid transparent',
              color: activeSubTab === tab.id ? '#8B5CF6' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 600,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {activeSubTab === 'limits' && <LimitsSubTab />}
        {activeSubTab === 'sessions' && <SessionsSubTab />}
        {activeSubTab === 'analytics' && <AnalyticsSubTab />}
      </div>
    </div>
  );
}


// ============================================
// LIMITS SUBTAB - النسخة المتوافقة
// ============================================
function LimitsSubTab() {
  const [limits, setLimits] = useState({
    free: { perDay: 0, perMonth: 0, allowCreation: false },
    pro: { perDay: 3, perMonth: 18, allowCreation: true },
    elite: { perDay: 5, perMonth: 24, allowCreation: true }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/training/limits');
      if (data.data?.limits) {
        const fetchedLimits = data.data.limits;
        // دمج البيانات المستلمة مع القيم الافتراضية لتجنب missing fields
        setLimits({
          free: { 
            perDay: fetchedLimits.free?.perDay ?? 0, 
            perMonth: fetchedLimits.free?.perMonth ?? 0, 
            allowCreation: fetchedLimits.free?.allowCreation ?? false 
          },
          pro: { 
            perDay: fetchedLimits.pro?.perDay ?? 3, 
            perMonth: fetchedLimits.pro?.perMonth ?? 18, 
            allowCreation: fetchedLimits.pro?.allowCreation ?? true 
          },
          elite: { 
            perDay: fetchedLimits.elite?.perDay ?? 5, 
            perMonth: fetchedLimits.elite?.perMonth ?? 24, 
            allowCreation: fetchedLimits.elite?.allowCreation ?? true 
          }
        });
      }
    } catch (err) {
      toast.error('Failed to load limits');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLimits = async () => {
    setSaving(true);
    try {
      await api.put('/admin/training/limits', { limits });
      toast.success('Interview limits updated successfully');
    } catch (err) {
      toast.error('Failed to update limits');
    } finally {
      setSaving(false);
    }
  };

  const updateAllowCreation = (plan, value) => {
    setLimits(prev => ({
      ...prev,
      [plan]: { ...prev[plan], allowCreation: value }
    }));
  };

  const updateLimitValue = (plan, field, value) => {
    setLimits(prev => ({
      ...prev,
      [plan]: { ...prev[plan], [field]: parseInt(value) || 0 }
    }));
  };

  const resetToDefault = () => {
    setLimits({
      free: { perDay: 0, perMonth: 0, allowCreation: false },
      pro: { perDay: 3, perMonth: 18, allowCreation: true },
      elite: { perDay: 5, perMonth: 24, allowCreation: true }
    });
  };

  const plans = [
    { key: 'free', name: 'FREE', color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
    { key: 'pro', name: 'PRO', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
    { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)' }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Header with buttons */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button 
          onClick={resetToDefault} 
          style={{ 
            padding: '8px 16px', 
            borderRadius: 8, 
            border: '1px solid var(--border)', 
            background: 'var(--bg-primary)', 
            color: 'var(--text-secondary)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            fontSize: 13, 
            fontWeight: 500 
          }}
        >
          <RefreshCw size={14} /> Reset
        </button>
        <button 
          onClick={handleSaveLimits} 
          disabled={saving} 
          style={{ 
            padding: '8px 24px', 
            borderRadius: 8, 
            border: 'none', 
            background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)', 
            color: '#fff', 
            cursor: saving ? 'not-allowed' : 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6, 
            fontSize: 13, 
            fontWeight: 600, 
            opacity: saving ? 0.7 : 1 
          }}
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info Box */}
      <div style={{
        marginBottom: 24,
        padding: '12px 16px',
        background: 'rgba(59,130,246,0.08)',
        borderRadius: 10,
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10
      }}>
        <AlertCircle size={14} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#3B82F6' }}>Note:</strong> Changes take effect immediately. 0 means unlimited. 
          Daily limits reset at midnight UTC, monthly on the 1st.
        </div>
      </div>

      {/* Plans Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {plans.map(plan => {
          const planData = limits[plan.key] || { perDay: 0, perMonth: 0, allowCreation: false };
          
          return (
            <div
              key={plan.key}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: 12,
                border: `1px solid ${plan.color}20`,
                overflow: 'hidden'
              }}
            >
              {/* Plan Header with Allow Creation Toggle */}
              <div style={{
                padding: '14px 20px',
                background: plan.bg,
                borderBottom: `1px solid ${plan.color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>
                    {plan.name}
                  </h3>
                </div>
                
                {/* Allow Creation Toggle Button - مع التحقق من وجود allowCreation */}
                <button
                  onClick={() => updateAllowCreation(plan.key, !planData.allowCreation)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1.5px solid ${planData.allowCreation ? '#22C55E' : '#EF4444'}`,
                    background: planData.allowCreation ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600,
                    color: planData.allowCreation ? '#22C55E' : '#EF4444',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{planData.allowCreation ? '✓' : '✗'}</span>
                  {planData.allowCreation ? 'Allow Creation' : 'Disabled Creation'}
                </button>
              </div>

              {/* Fields - فقط Daily Limit و Monthly Limit */}
              <div style={{ padding: '20px' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 20
                }}>
                  {/* Daily Limit */}
                  <div style={{
                    padding: '14px 16px',
                    background: 'var(--bg-primary)',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: 'var(--text-secondary)', 
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 6 }} />
                      Daily Limit
                    </div>
                    <input
                      type="number"
                      value={planData.perDay}
                      onChange={(e) => updateLimitValue(plan.key, 'perDay', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${plan.color}30`,
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = plan.color}
                      onBlur={(e) => e.target.style.borderColor = `${plan.color}30`}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>
                      interviews per day (0 = unlimited)
                    </div>
                  </div>

                  {/* Monthly Limit */}
                  <div style={{
                    padding: '14px 16px',
                    background: 'var(--bg-primary)',
                    borderRadius: 10,
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      color: 'var(--text-secondary)', 
                      marginBottom: 8,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: 6 }} />
                      Monthly Limit
                    </div>
                    <input
                      type="number"
                      value={planData.perMonth}
                      onChange={(e) => updateLimitValue(plan.key, 'perMonth', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: `1.5px solid ${plan.color}30`,
                        background: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = plan.color}
                      onBlur={(e) => e.target.style.borderColor = `${plan.color}30`}
                    />
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>
                      interviews per month (0 = unlimited)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        input:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
// ============================================
// SESSIONS SUBTAB
// ============================================
function SessionsSubTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [filters, setFilters] = useState({ userId: '', status: '', fromDate: '', toDate: '' });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchSessions();
  }, [pagination.page, filters.status, filters.fromDate, filters.toDate]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ 
        page: pagination.page, 
        limit: pagination.limit, 
        ...(filters.userId && { userId: filters.userId }), 
        ...(filters.status && { status: filters.status }), 
        ...(filters.fromDate && { fromDate: filters.fromDate }), 
        ...(filters.toDate && { toDate: filters.toDate }) 
      });
      const { data } = await api.get(`/admin/training/sessions?${params}`);
      if (data.data) {
        setSessions(data.data.sessions);
        setPagination(prev => ({ ...prev, total: data.data.total, totalPages: data.data.totalPages }));
      }
    } catch (err) {
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'completed') return { bg: 'rgba(34,197,94,0.1)', color: '#22C55E' };
    return { bg: 'rgba(245,158,11,0.1)', color: '#F59E0B' };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#22C55E';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <input type="text" placeholder="User ID" value={filters.userId} onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
          <select value={filters.status} onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }}>
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
          </select>
          <input type="date" value={filters.fromDate} onChange={(e) => setFilters(prev => ({ ...prev, fromDate: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
          <input type="date" value={filters.toDate} onChange={(e) => setFilters(prev => ({ ...prev, toDate: e.target.value }))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13 }} />
          <button onClick={fetchSessions} style={{ padding: '8px 16px', borderRadius: 8, background: '#3B82F6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', fontSize: 13 }}>
            <Search size={14} /> Search
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Job Title</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Score</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px', textAlign: 'center' }}>
                    <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No sessions found
                  </td>
                </tr>
              ) : (
                sessions.map(session => {
                  const user = session.user || {};
                  const statusStyle = getStatusStyle(session.status);
                  return (
                    <tr key={session.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 12, fontFamily: 'var(--font-en)' }}>#{session.id}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div><span style={{ fontSize: 13, fontWeight: 500 }}>{user.name || user.email?.split('@')[0] || 'N/A'}</span></div>
                        <div><span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{user.email || ''}</span></div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{session.title || session.jobTitle}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {session.overall_score ? (
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, background: `${getScoreColor(session.overall_score)}20`, color: getScoreColor(session.overall_score), fontWeight: 700, fontSize: 12 }}>{session.overall_score}%</span>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusStyle.bg, color: statusStyle.color }}>{session.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(session.created_at || session.startedAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button onClick={() => setSelectedSession(session)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11 }}>
                          <Eye size={12} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1 }}><ChevronLeft size={14} /> Prev</button>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))} disabled={pagination.page === pagination.totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1 }}>Next <ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      {selectedSession && (
        <SessionDetailsModal session={selectedSession} onClose={() => setSelectedSession(null)} />
      )}
    </div>
  );
}

// ============================================
// SESSION DETAILS MODAL
// ============================================
function SessionDetailsModal({ session, onClose }) {
  const user = session.user || {};
  
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Session Details #{session.id}</h3>
          <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>User</label><p style={{ fontSize: 14, marginTop: 4 }}>{user.name || user.email?.split('@')[0] || 'N/A'} ({user.email || 'N/A'})</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Job Title</label><p style={{ fontSize: 14, marginTop: 4 }}>{session.title || session.jobTitle}</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall Score</label><p style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: (session.overall_score || 0) >= 80 ? '#22C55E' : (session.overall_score || 0) >= 60 ? '#F59E0B' : '#EF4444' }}>{session.overall_score || 0}%</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</label><p style={{ fontSize: 14, marginTop: 4 }}>{session.status}</p></div>
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Started</label><p style={{ fontSize: 14, marginTop: 4 }}>{new Date(session.created_at || session.startedAt).toLocaleString()}</p></div>
            {session.completedAt && <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completed</label><p style={{ fontSize: 14, marginTop: 4 }}>{new Date(session.completedAt).toLocaleString()}</p></div>}
          </div>
          
          {session.questions && session.questions.length > 0 && (
            <div><label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 12, display: 'block' }}>Questions & Answers</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {session.questions.map((q, i) => (
                  <div key={i} style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Q{i+1}: {typeof q === 'string' ? q : q.question}</p>
                    {session.answers && session.answers[i] && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>A: {typeof session.answers[i] === 'string' ? session.answers[i] : session.answers[i]?.a || session.answers[i]?.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// ANALYTICS SUBTAB
// ============================================
function AnalyticsSubTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [statsRes, userStatsRes] = await Promise.all([
        api.get('/admin/training/stats/global'),
        api.get('/admin/training/stats/users')
      ]);
      if (statsRes.data?.data) setStats(statsRes.data.data);
      if (userStatsRes.data?.data) setUserStats(userStatsRes.data.data);
    } catch (err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<MessageSquare size={20} />} label="Total Sessions" value={stats?.totalSessions || 0} color="#3B82F6" />
        <StatCard icon={<Award size={20} />} label="Completion Rate" value={`${stats?.completionRate || 0}%`} color="#22C55E" />
        <StatCard icon={<Calendar size={20} />} label="Today" value={stats?.todaySessions || 0} color="#F59E0B" />
        <StatCard icon={<Clock size={20} />} label="This Month" value={stats?.monthSessions || 0} color="#8B5CF6" />
        <StatCard icon={<TrendingUp size={20} />} label="Avg Score" value={`${stats?.averageScore || 0}%`} color="#EF4444" />
      </div>

      {stats?.usageByPlan && stats.usageByPlan.length > 0 && (
        <div style={{ marginBottom: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Sessions by Plan</h4>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {stats.usageByPlan.map(item => (
              <div key={item.plan} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: item.plan === 'pro' ? '#F59E0B' : item.plan === 'elite' ? '#8B5CF6' : '#6B7280' }}>{item.count}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{item.plan}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userStats.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-primary)' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} /> Daily Usage Statistics</h4>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-secondary)' }}>
                <tr><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Date</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Sessions</th><th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12 }}>Avg Score</th></tr>
              </thead>
              <tbody>
                {userStats.map((stat, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{stat.date}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>{stat.count}</td>
                    <td style={{ padding: '10px 16px', fontSize: 13 }}>{parseFloat(stat.avgScore).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ color }}>{icon}</div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}