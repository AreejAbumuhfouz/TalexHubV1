
// // // 'use strict';
// // // import { useState, useEffect } from 'react';
// // // import {
// // //   Settings, BarChart3, Users, Calendar, Clock,
// // //   Save, RefreshCw, AlertCircle, Search,
// // //   Eye, ChevronLeft, ChevronRight, FileText,
// // //   CheckCircle, XCircle, Trash2, X, Shield,
// // //   TrendingUp, Crown, Lock,
// // // } from 'lucide-react';
// // // import api from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // // ════════════════════════════════════════════════════════════
// // // // MAIN TAB
// // // // ════════════════════════════════════════════════════════════
// // // export default function CVAdminTab() {
// // //   const [activeSubTab, setActiveSubTab] = useState('limits');

// // //   const subTabs = [
// // //     { id: 'limits',    label: 'Plan Limits',     icon: Settings  },
// // //     { id: 'cvs',       label: 'All CVs',         icon: FileText  },
// // //     { id: 'analytics', label: 'Analytics',       icon: BarChart3 },
// // //   ];

// // //   return (
// // //     <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
// // //       {/* Header */}
// // //       <div style={{ marginBottom: 32 }}>
// // //         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
// // //           <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// // //             <FileText size={24} color="#fff" />
// // //           </div>
// // //           <div>
// // //             <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>CV Management</h1>
// // //             <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
// // //               Control CV plan limits, templates, AI access, and view user CVs
// // //             </p>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Sub Tabs */}
// // //       <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
// // //         {subTabs.map(tab => (
// // //           <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
// // //             display: 'flex', alignItems: 'center', gap: 8,
// // //             padding: '10px 20px', background: 'transparent', border: 'none',
// // //             borderBottom: activeSubTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
// // //             color: activeSubTab === tab.id ? '#6366F1' : 'var(--text-secondary)',
// // //             cursor: 'pointer', fontSize: 13, fontWeight: 600,
// // //             transition: 'all 0.2s', whiteSpace: 'nowrap',
// // //           }}>
// // //             <tab.icon size={16} /> {tab.label}
// // //           </button>
// // //         ))}
// // //       </div>

// // //       {/* Content */}
// // //       <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
// // //         {activeSubTab === 'limits'    && <LimitsSubTab    />}
// // //         {activeSubTab === 'cvs'       && <CVsSubTab       />}
// // //         {activeSubTab === 'analytics' && <AnalyticsSubTab />}
// // //       </div>

// // //       <style>{`
// // //         @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
// // //         .spin { animation: spin 1s linear infinite; }
// // //       `}</style>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // LIMITS SUBTAB
// // // // ════════════════════════════════════════════════════════════
// // // function LimitsSubTab() {
// // //   const [config, setConfig] = useState({
// // //     free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
// // //     pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
// // //     elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
// // //   });
// // //   const [saving,   setSaving]   = useState(false);
// // //   const [fetching, setFetching] = useState(true);

// // //   useEffect(() => { fetchConfig(); }, []);

// // //   const fetchConfig = async () => {
// // //     setFetching(true);
// // //     try {
// // //       const { data } = await api.get('/admin/cv-config');
// // //       if (data.data?.config) setConfig(data.data.config);
// // //     } catch { toast.error('Failed to load CV config'); }
// // //     finally  { setFetching(false); }
// // //   };

// // //   const handleSave = async () => {
// // //     setSaving(true);
// // //     try {
// // //       await api.put('/admin/cv-config', { config });
// // //       toast.success('CV plan config updated ✅');
// // //     } catch { toast.error('Failed to save config'); }
// // //     finally  { setSaving(false); }
// // //   };

// // //   const update = (plan, field, value) =>
// // //     setConfig(p => ({
// // //       ...p,
// // //       [plan]: {
// // //         ...p[plan],
// // //         [field]: field === 'useAI' ? value : (parseInt(value) || 0),
// // //       },
// // //     }));

// // //   const plans = [
// // //     { key: 'free',  name: 'FREE',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
// // //     { key: 'pro',   name: 'PRO',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
// // //     { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
// // //   ];

// // //   const TOTAL_TEMPLATES = 8;

// // //   if (fetching) return (
// // //     <div style={{ textAlign: 'center', padding: 60 }}>
// // //       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
// // //     </div>
// // //   );

// // //   return (
// // //     <div>
// // //       {/* Actions */}
// // //       <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
// // //         <button onClick={fetchConfig} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
// // //           <RefreshCw size={14} /> Refresh
// // //         </button>
// // //         <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
// // //           <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
// // //         </button>
// // //       </div>

// // //       {/* Info */}
// // //       <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
// // //         <AlertCircle size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
// // //         <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
// // //           <strong style={{ color: '#6366F1' }}>Note:</strong> Changes take effect immediately (60s cache).
// // //           <strong> templatesAllowed</strong> = first N templates shown to user (max {TOTAL_TEMPLATES}).
// // //           <strong> useAI</strong> = AI analysis vs algorithm.
// // //           <strong> maxCVs</strong> = number of CVs per user (default 1 for all).
// // //         </div>
// // //       </div>

// // //       {/* Plan cards */}
// // //       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
// // //         {plans.map(plan => {
// // //           const d = config[plan.key] || {};
// // //           return (
// // //             <div key={plan.key} style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${plan.color}20`, overflow: 'hidden' }}>
// // //               {/* Plan header */}
// // //               <div style={{ padding: '14px 20px', background: plan.bg, borderBottom: `1px solid ${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
// // //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// // //                   {plan.key === 'elite' ? <Crown size={18} color={plan.color} /> : plan.key === 'pro' ? <Crown size={18} color={plan.color} /> : <Shield size={18} color={plan.color} />}
// // //                   <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>{plan.name}</h3>
// // //                 </div>
// // //                 {/* useAI toggle */}
// // //                 <button
// // //                   onClick={() => update(plan.key, 'useAI', !d.useAI)}
// // //                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${d.useAI ? '#22C55E' : '#EF4444'}`, background: d.useAI ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: d.useAI ? '#22C55E' : '#EF4444', transition: 'all 0.2s' }}>
// // //                   {d.useAI ? <CheckCircle size={13} /> : <XCircle size={13} />}
// // //                   {d.useAI ? 'AI Analysis ON' : 'Algorithm Only'}
// // //                 </button>
// // //               </div>

// // //               {/* Fields */}
// // //               <div style={{ padding: 20 }}>
// // //                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
// // //                   {[
// // //                     { field: 'maxCVs',           icon: FileText,  label: 'Max CVs',            desc: 'CVs per user'              },
// // //                     { field: 'analysisPerDay',   icon: Calendar,  label: 'Analysis / Day',     desc: 'analyses per day'          },
// // //                     { field: 'analysisPerMonth', icon: Clock,     label: 'Analysis / Month',   desc: 'analyses per month'        },
// // //                     { field: 'templatesAllowed', icon: Lock,      label: 'Templates Allowed',  desc: `first N of ${TOTAL_TEMPLATES} templates` },
// // //                   ].map(f => (
// // //                     <div key={f.field} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
// // //                       <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
// // //                         <f.icon size={12} /> {f.label}
// // //                       </div>
// // //                       <input
// // //                         type="number" min={1}
// // //                         max={f.field === 'templatesAllowed' ? TOTAL_TEMPLATES : undefined}
// // //                         value={d[f.field] ?? 0}
// // //                         onChange={e => update(plan.key, f.field, e.target.value)}
// // //                         style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
// // //                         onFocus={e => e.target.style.borderColor = plan.color}
// // //                         onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
// // //                       />
// // //                       <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>{f.desc}</div>
// // //                     </div>
// // //                   ))}
// // //                 </div>
// // //               </div>
// // //             </div>
// // //           );
// // //         })}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // CVs SUBTAB — all user CVs
// // // // ════════════════════════════════════════════════════════════
// // // function CVsSubTab() {
// // //   const [cvs,        setCvs]        = useState([]);
// // //   const [loading,    setLoading]    = useState(true);
// // //   const [selected,   setSelected]   = useState(null);
// // //   const [search,     setSearch]     = useState('');
// // //   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

// // //   useEffect(() => { fetchCVs(); }, [pagination.page]);

// // //   const fetchCVs = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const { data } = await api.get('/admin/cvs', {
// // //         params: { page: pagination.page, limit: pagination.limit, search },
// // //       });
// // //       if (data.data) {
// // //         setCvs(data.data.cvs || []);
// // //         setPagination(p => ({ ...p, total: data.data.pagination?.total || 0, totalPages: data.data.pagination?.totalPages || 1 }));
// // //       }
// // //     } catch { toast.error('Failed to load CVs'); }
// // //     finally  { setLoading(false); }
// // //   };

// // //   const handleDelete = async (id) => {
// // //     if (!confirm('Delete this CV permanently?')) return;
// // //     try {
// // //       await api.delete(`/admin/cvs/${id}`);
// // //       setCvs(p => p.filter(c => c.id !== id));
// // //       toast.success('CV deleted');
// // //     } catch { toast.error('Delete failed'); }
// // //   };

// // //   const filtered = cvs.filter(c =>
// // //     !search ||
// // //     c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
// // //     c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
// // //     c.title?.toLowerCase().includes(search.toLowerCase())
// // //   );

// // //   return (
// // //     <div>
// // //       {/* Search */}
// // //       <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
// // //         <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
// // //           <Search size={14} color="var(--text-secondary)" />
// // //           <input
// // //             value={search} onChange={e => setSearch(e.target.value)}
// // //             onKeyDown={e => e.key === 'Enter' && fetchCVs()}
// // //             placeholder="Search by user or title..."
// // //             style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13 }}
// // //           />
// // //         </div>
// // //         <button onClick={fetchCVs} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366F1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
// // //           <RefreshCw size={14} /> Refresh
// // //         </button>
// // //       </div>

// // //       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
// // //         <div style={{ overflowX: 'auto' }}>
// // //           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// // //             <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
// // //               <tr>
// // //                 {['User', 'CV Title', 'Language', 'ATS Score', 'Plan', 'Status', 'Created', ''].map(h => (
// // //                   <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
// // //                 ))}
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {loading ? (
// // //                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
// // //                   <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
// // //                 </td></tr>
// // //               ) : filtered.length === 0 ? (
// // //                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No CVs found</td></tr>
// // //               ) : filtered.map(cv => {
// // //                 const planColor = cv.user?.planKey === 'elite' ? '#8B5CF6' : cv.user?.planKey === 'pro' ? '#F59E0B' : '#6B7280';
// // //                 // const score = cv.atsScore || cv.overallScore;
// // //                 const rawAnalysis = cv.analysisData || cv.analysis_data || {};
// // // const score = rawAnalysis.overallScore || rawAnalysis.atsScore || cv.atsScore || cv.overallScore;
// // //                 const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
// // //                 return (
// // //                   <tr key={cv.id} style={{ borderBottom: '1px solid var(--border)' }}>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// // //                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
// // //                           {cv.user?.avatarUrl
// // //                             ? <img src={cv.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// // //                             : (cv.user?.fullName?.charAt(0) || '?')}
// // //                         </div>
// // //                         <div>
// // //                           <div style={{ fontSize: 13, fontWeight: 600 }}>{cv.user?.fullName || '—'}</div>
// // //                           <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cv.user?.email}</div>
// // //                         </div>
// // //                       </div>
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 180 }}>
// // //                       <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || 'Untitled'}</div>
// // //                       {cv.isPrimary && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 700 }}>★ Primary</span>}
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: 600 }}>
// // //                         {cv.language === 'ar' ? '🇸🇦 AR' : '🇬🇧 EN'}
// // //                       </span>
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       {score ? (
// // //                         <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
// // //                       ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>}
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${planColor}18`, color: planColor, fontWeight: 700, textTransform: 'uppercase' }}>
// // //                         {cv.user?.planKey || 'free'}
// // //                       </span>
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: cv.isAnalyzed ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: cv.isAnalyzed ? '#22C55E' : '#6B7280', fontWeight: 600 }}>
// // //                         {cv.isAnalyzed ? '✓ Analyzed' : 'Pending'}
// // //                       </span>
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
// // //                       {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : '—'}
// // //                     </td>
// // //                     <td style={{ padding: '12px 16px' }}>
// // //                       <div style={{ display: 'flex', gap: 6 }}>
// // //                         <button onClick={() => setSelected(cv)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
// // //                           <Eye size={12} /> View
// // //                         </button>
// // //                         <button onClick={() => handleDelete(cv.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
// // //                           <Trash2 size={12} />
// // //                         </button>
// // //                       </div>
// // //                     </td>
// // //                   </tr>
// // //                 );
// // //               })}
// // //             </tbody>
// // //           </table>
// // //         </div>

// // //         {pagination.totalPages > 1 && (
// // //           <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// // //             <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} — {pagination.total} total</span>
// // //             <div style={{ display: 'flex', gap: 8 }}>
// // //               <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
// // //                 <ChevronLeft size={14} /> Prev
// // //               </button>
// // //               <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
// // //                 Next <ChevronRight size={14} />
// // //               </button>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {selected && <CVDetailModal cv={selected} onClose={() => setSelected(null)} />}
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // CV DETAIL MODAL
// // // // ════════════════════════════════════════════════════════════
// // // function CVDetailModal({ cv, onClose }) {
// // //   // const analysis = cv.analysisData || cv.aiFeedback || {};
// // //   const analysis = cv.analysis_data || cv.analysisData || cv.aiFeedback || {};

// // //   const builder  = cv.builderData  || {};
// // //   // const score    = cv.atsScore || cv.overallScore || analysis.overallScore;
// // //   const score    = analysis.overallScore || analysis.atsScore || cv.ats_score || cv.atsScore;

// // //   const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

// // //   return (
// // //     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
// // //       <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
// // //         {/* Header */}
// // //         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
// // //           <div>
// // //             <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{cv.title || 'CV Details'}</h3>
// // //             <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{cv.user?.fullName} · {cv.user?.email}</p>
// // //           </div>
// // //           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// // //             {score && <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{score}%</span>}
// // //             <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
// // //           </div>
// // //         </div>

// // //         <div style={{ padding: 24 }}>
// // //           {/* Meta */}
// // //           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
// // //             {[
// // //               ['Language',  cv.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'],
// // //               ['Template',  builder.template || cv.template || '—'],
// // //               ['Status',    cv.isAnalyzed ? '✓ Analyzed' : 'Not Analyzed'],
// // //               ['Plan',      cv.user?.planKey || 'free'],
// // //               ['File Type', cv.fileType || '—'],
// // //               ['Created',   cv.createdAt ? new Date(cv.createdAt).toLocaleString() : '—'],
// // //             ].map(([label, val]) => (
// // //               <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
// // //                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
// // //                 <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           {/* ATS Scores — handles both algorithm and AI analysis structures */}
// // //           {(() => {
// // //             const scores = analysis.scores || analysis.breakdown || analysis.categories;
// // //             if (!scores) return null;
// // //             return (
// // //               <div style={{ marginBottom: 20 }}>
// // //                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>ATS Breakdown</div>
// // //                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
// // //                   {Object.entries(scores).map(([key, val]) => {
// // //                     const numVal = typeof val === 'object' ? (val.score || val.value || 0) : (val || 0);
// // //                     return (
// // //                       <div key={key} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
// // //                         <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', marginBottom: 4 }}>{key}</div>
// // //                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// // //                           <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
// // //                             <div style={{ height: '100%', width: `${numVal}%`, background: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
// // //                           </div>
// // //                           <span style={{ fontSize: 12, fontWeight: 700, color: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', minWidth: 28 }}>{numVal}%</span>
// // //                         </div>
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               </div>
// // //             );
// // //           })()}

// // //           {/* Improvements — handles both algorithm and AI formats */}
// // //           {(() => {
// // //             const items = analysis.improvements || analysis.suggestions || analysis.recommendations || [];
// // //             if (!items.length) return null;
// // //             return (
// // //               <div style={{ marginBottom: 16 }}>
// // //                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Improvements Needed</div>
// // //                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// // //                   {items.map((imp, i) => {
// // //                     const priority = imp.priority || imp.type || 'medium';
// // //                     const issue    = imp.issue || imp.suggestion || imp.text || (typeof imp === 'string' ? imp : '');
// // //                     const fix      = imp.fix || imp.action || imp.recommendation || '';
// // //                     return (
// // //                       <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: priority === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${priority === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, fontSize: 12 }}>
// // //                         <span style={{ fontWeight: 700, color: priority === 'high' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase', fontSize: 10 }}>{priority}</span>
// // //                         <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>{issue}</span>
// // //                         {fix && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>→ {fix}</div>}
// // //                       </div>
// // //                     );
// // //                   })}
// // //                 </div>
// // //               </div>
// // //             );
// // //           })()}

// // //           {/* Download link */}
// // //           {cv.fileUrl && (
// // //             <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
// // //               <FileText size={14} /> View CV File
// // //             </a>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // ════════════════════════════════════════════════════════════
// // // // ANALYTICS SUBTAB
// // // // ════════════════════════════════════════════════════════════
// // // function AnalyticsSubTab() {
// // //   const [stats,   setStats]   = useState(null);
// // //   const [loading, setLoading] = useState(true);

// // //   useEffect(() => { fetchStats(); }, []);

// // //   const fetchStats = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const { data } = await api.get('/admin/cv-stats');
// // //       if (data.data) setStats(data.data);
// // //     } catch { toast.error('Failed to load CV stats'); }
// // //     finally  { setLoading(false); }
// // //   };

// // //   if (loading) return (
// // //     <div style={{ textAlign: 'center', padding: 60 }}>
// // //       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
// // //     </div>
// // //   );

// // //   return (
// // //     <div>
// // //       {/* Stat cards */}
// // //       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
// // //         <StatCard icon={<FileText size={20} />}    label="Total CVs"        value={stats?.total        || 0} color="#6366F1" />
// // //         <StatCard icon={<Calendar size={20} />}    label="Uploaded Today"   value={stats?.todayCount   || 0} color="#3B82F6" />
// // //         <StatCard icon={<Clock size={20} />}       label="This Month"       value={stats?.monthCount   || 0} color="#8B5CF6" />
// // //         <StatCard icon={<TrendingUp size={20} />}  label="Avg ATS Score"    value={`${stats?.avgScore  || 0}%`} color="#22C55E" />
// // //         <StatCard icon={<CheckCircle size={20} />} label="Analyzed"         value={stats?.analyzedCount || 0} color="#F59E0B" />
// // //         <StatCard icon={<Users size={20} />}       label="Unique Users"     value={stats?.uniqueUsers  || 0} color="#EF4444" />
// // //       </div>

// // //       {/* By plan */}
// // //       {(stats?.byPlan || []).length > 0 && (
// // //         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
// // //           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
// // //             <Users size={16} /> CVs by Plan
// // //           </h4>
// // //           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
// // //             {stats.byPlan.map(item => {
// // //               const color = item.planKey === 'elite' ? '#8B5CF6' : item.planKey === 'pro' ? '#F59E0B' : '#6B7280';
// // //               return (
// // //                 <div key={item.planKey} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: `1px solid ${color}20` }}>
// // //                   <div style={{ fontSize: 32, fontWeight: 900, color }}>{item.count}</div>
// // //                   <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{item.planKey || 'free'}</div>
// // //                 </div>
// // //               );
// // //             })}
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* By language */}
// // //       {(stats?.byLanguage || []).length > 0 && (
// // //         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
// // //           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>CVs by Language</h4>
// // //           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
// // //             {stats.byLanguage.map(item => (
// // //               <div key={item.language} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
// // //                 <div style={{ fontSize: 32, fontWeight: 900 }}>{item.count}</div>
// // //                 <div style={{ fontSize: 14, marginTop: 4 }}>{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>
// // //       )}

// // //       <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
// // //         <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Summary</h4>
// // //         <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
// // //           <p>• <strong>{stats?.total || 0}</strong> total CVs on the platform.</p>
// // //           <p>• <strong>{stats?.analyzedCount || 0}</strong> CVs have been analyzed.</p>
// // //           <p>• Average ATS score: <strong>{stats?.avgScore || 0}%</strong>.</p>
// // //           <p>• <strong>{stats?.todayCount || 0}</strong> CVs uploaded today.</p>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // function StatCard({ icon, label, value, color }) {
// // //   return (
// // //     <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
// // //       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
// // //         <div style={{ color }}>{icon}</div>
// // //         <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
// // //       </div>
// // //       <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
// // //     </div>
// // //   );
// // // }

// // 'use strict';
// // import { useState, useEffect } from 'react';
// // import {
// //   Settings, BarChart3, Users, Calendar, Clock,
// //   Save, RefreshCw, AlertCircle, Search,
// //   Eye, ChevronLeft, ChevronRight, FileText,
// //   CheckCircle, XCircle, Trash2, X, Shield,
// //   TrendingUp, Crown, Lock, Zap, Send, Mail,
// // } from 'lucide-react';
// // import api from '../../services/api';
// // import toast from 'react-hot-toast';

// // // ════════════════════════════════════════════════════════════
// // // MAIN TAB
// // // ════════════════════════════════════════════════════════════
// // export default function CVAdminTab() {
// //   const [activeSubTab, setActiveSubTab] = useState('limits');

// //   const subTabs = [
// //     { id: 'limits',     label: 'Plan Limits',    icon: Settings  },
// //     { id: 'cvs',        label: 'All CVs',        icon: FileText  },
// //     { id: 'analytics',  label: 'Analytics',      icon: BarChart3 },
// //     { id: 'autoapply',  label: 'Auto-Apply',     icon: Zap       },
// //   ];

// //   return (
// //     <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
// //       {/* Header */}
// //       <div style={{ marginBottom: 32 }}>
// //         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
// //           <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// //             <FileText size={24} color="#fff" />
// //           </div>
// //           <div>
// //             <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>CV Management</h1>
// //             <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
// //               Control CV plan limits, templates, AI access, and view user CVs
// //             </p>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Sub Tabs */}
// //       <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
// //         {subTabs.map(tab => (
// //           <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
// //             display: 'flex', alignItems: 'center', gap: 8,
// //             padding: '10px 20px', background: 'transparent', border: 'none',
// //             borderBottom: activeSubTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
// //             color: activeSubTab === tab.id ? '#6366F1' : 'var(--text-secondary)',
// //             cursor: 'pointer', fontSize: 13, fontWeight: 600,
// //             transition: 'all 0.2s', whiteSpace: 'nowrap',
// //           }}>
// //             <tab.icon size={16} /> {tab.label}
// //           </button>
// //         ))}
// //       </div>

// //       {/* Content */}
// //       <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
// //         {activeSubTab === 'limits'    && <LimitsSubTab      />}
// //         {activeSubTab === 'cvs'       && <CVsSubTab         />}
// //         {activeSubTab === 'analytics' && <AnalyticsSubTab   />}
// //         {activeSubTab === 'autoapply' && <AutoApplyAdminTab />}
// //       </div>

// //       <style>{`
// //         @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
// //         .spin { animation: spin 1s linear infinite; }
// //       `}</style>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // LIMITS SUBTAB
// // // ════════════════════════════════════════════════════════════
// // function LimitsSubTab() {
// //   const [config, setConfig] = useState({
// //     free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
// //     pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
// //     elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
// //   });
// //   const [saving,   setSaving]   = useState(false);
// //   const [fetching, setFetching] = useState(true);

// //   useEffect(() => { fetchConfig(); }, []);

// //   const fetchConfig = async () => {
// //     setFetching(true);
// //     try {
// //       const { data } = await api.get('/admin/cv-config');
// //       if (data.data?.config) setConfig(data.data.config);
// //     } catch { toast.error('Failed to load CV config'); }
// //     finally  { setFetching(false); }
// //   };

// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       await api.put('/admin/cv-config', { config });
// //       toast.success('CV plan config updated ✅');
// //     } catch { toast.error('Failed to save config'); }
// //     finally  { setSaving(false); }
// //   };

// //   const update = (plan, field, value) =>
// //     setConfig(p => ({
// //       ...p,
// //       [plan]: {
// //         ...p[plan],
// //         [field]: field === 'useAI' ? value : (parseInt(value) || 0),
// //       },
// //     }));

// //   const plans = [
// //     { key: 'free',  name: 'FREE',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
// //     { key: 'pro',   name: 'PRO',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
// //     { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
// //   ];

// //   const TOTAL_TEMPLATES = 8;

// //   if (fetching) return (
// //     <div style={{ textAlign: 'center', padding: 60 }}>
// //       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
// //     </div>
// //   );

// //   return (
// //     <div>
// //       {/* Actions */}
// //       <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
// //         <button onClick={fetchConfig} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
// //           <RefreshCw size={14} /> Refresh
// //         </button>
// //         <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
// //           <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
// //         </button>
// //       </div>

// //       {/* Info */}
// //       <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
// //         <AlertCircle size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
// //         <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
// //           <strong style={{ color: '#6366F1' }}>Note:</strong> Changes take effect immediately (60s cache).
// //           <strong> templatesAllowed</strong> = first N templates shown to user (max {TOTAL_TEMPLATES}).
// //           <strong> useAI</strong> = AI analysis vs algorithm.
// //           <strong> maxCVs</strong> = number of CVs per user (default 1 for all).
// //         </div>
// //       </div>

// //       {/* Plan cards */}
// //       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
// //         {plans.map(plan => {
// //           const d = config[plan.key] || {};
// //           return (
// //             <div key={plan.key} style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${plan.color}20`, overflow: 'hidden' }}>
// //               {/* Plan header */}
// //               <div style={{ padding: '14px 20px', background: plan.bg, borderBottom: `1px solid ${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
// //                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //                   {plan.key === 'elite' ? <Crown size={18} color={plan.color} /> : plan.key === 'pro' ? <Crown size={18} color={plan.color} /> : <Shield size={18} color={plan.color} />}
// //                   <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>{plan.name}</h3>
// //                 </div>
// //                 {/* useAI toggle */}
// //                 <button
// //                   onClick={() => update(plan.key, 'useAI', !d.useAI)}
// //                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${d.useAI ? '#22C55E' : '#EF4444'}`, background: d.useAI ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: d.useAI ? '#22C55E' : '#EF4444', transition: 'all 0.2s' }}>
// //                   {d.useAI ? <CheckCircle size={13} /> : <XCircle size={13} />}
// //                   {d.useAI ? 'AI Analysis ON' : 'Algorithm Only'}
// //                 </button>
// //               </div>

// //               {/* Fields */}
// //               <div style={{ padding: 20 }}>
// //                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
// //                   {[
// //                     { field: 'maxCVs',           icon: FileText,  label: 'Max CVs',            desc: 'CVs per user'              },
// //                     { field: 'analysisPerDay',   icon: Calendar,  label: 'Analysis / Day',     desc: 'analyses per day'          },
// //                     { field: 'analysisPerMonth', icon: Clock,     label: 'Analysis / Month',   desc: 'analyses per month'        },
// //                     { field: 'templatesAllowed', icon: Lock,      label: 'Templates Allowed',  desc: `first N of ${TOTAL_TEMPLATES} templates` },
// //                   ].map(f => (
// //                     <div key={f.field} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
// //                       <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
// //                         <f.icon size={12} /> {f.label}
// //                       </div>
// //                       <input
// //                         type="number" min={1}
// //                         max={f.field === 'templatesAllowed' ? TOTAL_TEMPLATES : undefined}
// //                         value={d[f.field] ?? 0}
// //                         onChange={e => update(plan.key, f.field, e.target.value)}
// //                         style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
// //                         onFocus={e => e.target.style.borderColor = plan.color}
// //                         onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
// //                       />
// //                       <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>{f.desc}</div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // CVs SUBTAB — all user CVs
// // // ════════════════════════════════════════════════════════════
// // function CVsSubTab() {
// //   const [cvs,        setCvs]        = useState([]);
// //   const [loading,    setLoading]    = useState(true);
// //   const [selected,   setSelected]   = useState(null);
// //   const [search,     setSearch]     = useState('');
// //   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

// //   useEffect(() => { fetchCVs(); }, [pagination.page]);

// //   const fetchCVs = async () => {
// //     setLoading(true);
// //     try {
// //       const { data } = await api.get('/admin/cvs', {
// //         params: { page: pagination.page, limit: pagination.limit, search },
// //       });
// //       if (data.data) {
// //         setCvs(data.data.cvs || []);
// //         setPagination(p => ({ ...p, total: data.data.pagination?.total || 0, totalPages: data.data.pagination?.totalPages || 1 }));
// //       }
// //     } catch { toast.error('Failed to load CVs'); }
// //     finally  { setLoading(false); }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!confirm('Delete this CV permanently?')) return;
// //     try {
// //       await api.delete(`/admin/cvs/${id}`);
// //       setCvs(p => p.filter(c => c.id !== id));
// //       toast.success('CV deleted');
// //     } catch { toast.error('Delete failed'); }
// //   };

// //   const filtered = cvs.filter(c =>
// //     !search ||
// //     c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
// //     c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
// //     c.title?.toLowerCase().includes(search.toLowerCase())
// //   );

// //   return (
// //     <div>
// //       {/* Search */}
// //       <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
// //         <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
// //           <Search size={14} color="var(--text-secondary)" />
// //           <input
// //             value={search} onChange={e => setSearch(e.target.value)}
// //             onKeyDown={e => e.key === 'Enter' && fetchCVs()}
// //             placeholder="Search by user or title..."
// //             style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13 }}
// //           />
// //         </div>
// //         <button onClick={fetchCVs} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366F1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
// //           <RefreshCw size={14} /> Refresh
// //         </button>
// //       </div>

// //       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
// //         <div style={{ overflowX: 'auto' }}>
// //           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //             <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
// //               <tr>
// //                 {['User', 'CV Title', 'Language', 'ATS Score', 'Plan', 'Status', 'Created', ''].map(h => (
// //                   <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
// //                 ))}
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {loading ? (
// //                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
// //                   <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
// //                 </td></tr>
// //               ) : filtered.length === 0 ? (
// //                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No CVs found</td></tr>
// //               ) : filtered.map(cv => {
// //                 const planColor = cv.user?.planKey === 'elite' ? '#8B5CF6' : cv.user?.planKey === 'pro' ? '#F59E0B' : '#6B7280';
// //                 const score = cv.atsScore || cv.overallScore;
// //                 const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
// //                 return (
// //                   <tr key={cv.id} style={{ borderBottom: '1px solid var(--border)' }}>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
// //                           {cv.user?.avatarUrl
// //                             ? <img src={cv.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                             : (cv.user?.fullName?.charAt(0) || '?')}
// //                         </div>
// //                         <div>
// //                           <div style={{ fontSize: 13, fontWeight: 600 }}>{cv.user?.fullName || '—'}</div>
// //                           <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cv.user?.email}</div>
// //                         </div>
// //                       </div>
// //                     </td>
// //                     <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 180 }}>
// //                       <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || 'Untitled'}</div>
// //                       {cv.isPrimary && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 700 }}>★ Primary</span>}
// //                     </td>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: 600 }}>
// //                         {cv.language === 'ar' ? '🇸🇦 AR' : '🇬🇧 EN'}
// //                       </span>
// //                     </td>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       {score ? (
// //                         <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
// //                       ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>}
// //                     </td>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${planColor}18`, color: planColor, fontWeight: 700, textTransform: 'uppercase' }}>
// //                         {cv.user?.planKey || 'free'}
// //                       </span>
// //                     </td>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: cv.isAnalyzed ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: cv.isAnalyzed ? '#22C55E' : '#6B7280', fontWeight: 600 }}>
// //                         {cv.isAnalyzed ? '✓ Analyzed' : 'Pending'}
// //                       </span>
// //                     </td>
// //                     <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
// //                       {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : '—'}
// //                     </td>
// //                     <td style={{ padding: '12px 16px' }}>
// //                       <div style={{ display: 'flex', gap: 6 }}>
// //                         <button onClick={() => setSelected(cv)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
// //                           <Eye size={12} /> View
// //                         </button>
// //                         <button onClick={() => handleDelete(cv.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
// //                           <Trash2 size={12} />
// //                         </button>
// //                       </div>
// //                     </td>
// //                   </tr>
// //                 );
// //               })}
// //             </tbody>
// //           </table>
// //         </div>

// //         {pagination.totalPages > 1 && (
// //           <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
// //             <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} — {pagination.total} total</span>
// //             <div style={{ display: 'flex', gap: 8 }}>
// //               <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
// //                 <ChevronLeft size={14} /> Prev
// //               </button>
// //               <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
// //                 Next <ChevronRight size={14} />
// //               </button>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {selected && <CVDetailModal cv={selected} onClose={() => setSelected(null)} />}
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // CV DETAIL MODAL
// // // ════════════════════════════════════════════════════════════
// // function CVDetailModal({ cv, onClose }) {
// //   const analysis = cv.analysisData || cv.aiFeedback || {};
// //   const builder  = cv.builderData  || {};
// //   const score    = cv.atsScore || cv.overallScore || analysis.overallScore;
// //   const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

// //   return (
// //     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
// //       <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
// //         {/* Header */}
// //         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
// //           <div>
// //             <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{cv.title || 'CV Details'}</h3>
// //             <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{cv.user?.fullName} · {cv.user?.email}</p>
// //           </div>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
// //             {score && <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{score}%</span>}
// //             <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
// //           </div>
// //         </div>

// //         <div style={{ padding: 24 }}>
// //           {/* Meta */}
// //           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
// //             {[
// //               ['Language',  cv.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'],
// //               ['Template',  builder.template || cv.template || '—'],
// //               ['Status',    cv.isAnalyzed ? '✓ Analyzed' : 'Not Analyzed'],
// //               ['Plan',      cv.user?.planKey || 'free'],
// //               ['File Type', cv.fileType || '—'],
// //               ['Created',   cv.createdAt ? new Date(cv.createdAt).toLocaleString() : '—'],
// //             ].map(([label, val]) => (
// //               <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
// //                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
// //                 <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* ATS Scores — handles both algorithm and AI analysis structures */}
// //           {(() => {
// //             const scores = analysis.scores || analysis.breakdown || analysis.categories;
// //             if (!scores) return null;
// //             return (
// //               <div style={{ marginBottom: 20 }}>
// //                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>ATS Breakdown</div>
// //                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
// //                   {Object.entries(scores).map(([key, val]) => {
// //                     const numVal = typeof val === 'object' ? (val.score || val.value || 0) : (val || 0);
// //                     return (
// //                       <div key={key} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
// //                         <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', marginBottom: 4 }}>{key}</div>
// //                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                           <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
// //                             <div style={{ height: '100%', width: `${numVal}%`, background: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
// //                           </div>
// //                           <span style={{ fontSize: 12, fontWeight: 700, color: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', minWidth: 28 }}>{numVal}%</span>
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             );
// //           })()}

// //           {/* Improvements — handles both algorithm and AI formats */}
// //           {(() => {
// //             const items = analysis.improvements || analysis.suggestions || analysis.recommendations || [];
// //             if (!items.length) return null;
// //             return (
// //               <div style={{ marginBottom: 16 }}>
// //                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Improvements Needed</div>
// //                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //                   {items.map((imp, i) => {
// //                     const priority = imp.priority || imp.type || 'medium';
// //                     const issue    = imp.issue || imp.suggestion || imp.text || (typeof imp === 'string' ? imp : '');
// //                     const fix      = imp.fix || imp.action || imp.recommendation || '';
// //                     return (
// //                       <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: priority === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${priority === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, fontSize: 12 }}>
// //                         <span style={{ fontWeight: 700, color: priority === 'high' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase', fontSize: 10 }}>{priority}</span>
// //                         <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>{issue}</span>
// //                         {fix && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>→ {fix}</div>}
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               </div>
// //             );
// //           })()}

// //           {/* Download link */}
// //           {cv.fileUrl && (
// //             <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
// //               <FileText size={14} /> View CV File
// //             </a>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // // ════════════════════════════════════════════════════════════
// // // ANALYTICS SUBTAB
// // // ════════════════════════════════════════════════════════════
// // function AnalyticsSubTab() {
// //   const [stats,   setStats]   = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => { fetchStats(); }, []);

// //   const fetchStats = async () => {
// //     setLoading(true);
// //     try {
// //       const { data } = await api.get('/admin/cv-stats');
// //       if (data.data) setStats(data.data);
// //     } catch { toast.error('Failed to load CV stats'); }
// //     finally  { setLoading(false); }
// //   };

// //   if (loading) return (
// //     <div style={{ textAlign: 'center', padding: 60 }}>
// //       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
// //     </div>
// //   );

// //   return (
// //     <div>
// //       {/* Stat cards */}
// //       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
// //         <StatCard icon={<FileText size={20} />}    label="Total CVs"        value={stats?.total        || 0} color="#6366F1" />
// //         <StatCard icon={<Calendar size={20} />}    label="Uploaded Today"   value={stats?.todayCount   || 0} color="#3B82F6" />
// //         <StatCard icon={<Clock size={20} />}       label="This Month"       value={stats?.monthCount   || 0} color="#8B5CF6" />
// //         <StatCard icon={<TrendingUp size={20} />}  label="Avg ATS Score"    value={`${stats?.avgScore  || 0}%`} color="#22C55E" />
// //         <StatCard icon={<CheckCircle size={20} />} label="Analyzed"         value={stats?.analyzedCount || 0} color="#F59E0B" />
// //         <StatCard icon={<Users size={20} />}       label="Unique Users"     value={stats?.uniqueUsers  || 0} color="#EF4444" />
// //       </div>

// //       {/* By plan */}
// //       {(stats?.byPlan || []).length > 0 && (
// //         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
// //           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
// //             <Users size={16} /> CVs by Plan
// //           </h4>
// //           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
// //             {stats.byPlan.map(item => {
// //               const color = item.planKey === 'elite' ? '#8B5CF6' : item.planKey === 'pro' ? '#F59E0B' : '#6B7280';
// //               return (
// //                 <div key={item.planKey} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: `1px solid ${color}20` }}>
// //                   <div style={{ fontSize: 32, fontWeight: 900, color }}>{item.count}</div>
// //                   <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{item.planKey || 'free'}</div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         </div>
// //       )}

// //       {/* By language */}
// //       {(stats?.byLanguage || []).length > 0 && (
// //         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
// //           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>CVs by Language</h4>
// //           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
// //             {stats.byLanguage.map(item => (
// //               <div key={item.language} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
// //                 <div style={{ fontSize: 32, fontWeight: 900 }}>{item.count}</div>
// //                 <div style={{ fontSize: 14, marginTop: 4 }}>{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       )}

// //       <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
// //         <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Summary</h4>
// //         <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
// //           <p>• <strong>{stats?.total || 0}</strong> total CVs on the platform.</p>
// //           <p>• <strong>{stats?.analyzedCount || 0}</strong> CVs have been analyzed.</p>
// //           <p>• Average ATS score: <strong>{stats?.avgScore || 0}%</strong>.</p>
// //           <p>• <strong>{stats?.todayCount || 0}</strong> CVs uploaded today.</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }


// // // ════════════════════════════════════════════════════════════
// // // AUTO-APPLY ADMIN TAB
// // // ════════════════════════════════════════════════════════════
// // function AutoApplyAdminTab() {
// //   const [globalSettings, setGlobalSettings] = useState({
// //     matchThreshold: 65,
// //     pro:   { dailyLimit: 15, monthlyLimit: 30  },
// //     elite: { dailyLimit: 20, monthlyLimit: 100 },
// //   });
// //   const [userStats,  setUserStats]  = useState([]);
// //   const [recentApps, setRecentApps] = useState([]);
// //   const [loading,    setLoading]    = useState(true);
// //   const [saving,     setSaving]     = useState(false);

// //   useEffect(() => { fetchAll(); }, []);

// //   const fetchAll = async () => {
// //     setLoading(true);
// //     try {
// //       const [settingsRes, appsRes] = await Promise.allSettled([
// //         api.get('/admin/settings').catch(() => null),
// //         api.get('/admin/applications?isAutoApplied=true&limit=20').catch(() => null),
// //       ]);

// //       // Try to get auto-apply settings
// //       if (settingsRes.value?.data?.data) {
// //         const s = settingsRes.value.data.data;
// //         const threshold = s.find?.(x => x.key === 'autoApply.matchThreshold')?.value;
// //         const proDaily  = s.find?.(x => x.key === 'autoApply.dailyLimit.pro')?.value;
// //         const proMonth  = s.find?.(x => x.key === 'autoApply.monthlyLimit.pro')?.value;
// //         const eliteDaily = s.find?.(x => x.key === 'autoApply.dailyLimit.elite')?.value;
// //         const eliteMonth = s.find?.(x => x.key === 'autoApply.monthlyLimit.elite')?.value;
// //         setGlobalSettings({
// //           matchThreshold: parseInt(threshold) || 65,
// //           pro:   { dailyLimit: parseInt(proDaily)  || 15, monthlyLimit: parseInt(proMonth)  || 30  },
// //           elite: { dailyLimit: parseInt(eliteDaily) || 20, monthlyLimit: parseInt(eliteMonth) || 100 },
// //         });
// //       }

// //       if (appsRes.value?.data?.data) {
// //         const apps = appsRes.value.data.data?.applications || appsRes.value.data.data || [];
// //         setRecentApps(Array.isArray(apps) ? apps.slice(0, 20) : []);
// //       }
// //     } catch {}
// //     finally { setLoading(false); }
// //   };

// //   const handleSaveGlobal = async () => {
// //     setSaving(true);
// //     try {
// //       const updates = [
// //         { key: 'autoApply.matchThreshold',       value: String(globalSettings.matchThreshold) },
// //         { key: 'autoApply.dailyLimit.pro',        value: String(globalSettings.pro.dailyLimit)    },
// //         { key: 'autoApply.monthlyLimit.pro',      value: String(globalSettings.pro.monthlyLimit)  },
// //         { key: 'autoApply.dailyLimit.elite',      value: String(globalSettings.elite.dailyLimit)  },
// //         { key: 'autoApply.monthlyLimit.elite',    value: String(globalSettings.elite.monthlyLimit) },
// //       ];
// //       await Promise.all(updates.map(u => api.post('/admin/settings', u)));
// //       toast.success('Auto-apply settings saved ✅');
// //     } catch { toast.error('Failed to save settings'); }
// //     finally { setSaving(false); }
// //   };

// //   if (loading) return (
// //     <div style={{ textAlign: 'center', padding: 60 }}>
// //       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
// //     </div>
// //   );

// //   return (
// //     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

// //       {/* Global Settings */}
// //       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
// //         <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //             <Zap size={16} color="#6366F1" />
// //             <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Global Auto-Apply Settings</h3>
// //           </div>
// //           <button onClick={handleSaveGlobal} disabled={saving}
// //             style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
// //             <Save size={13} /> {saving ? 'Saving...' : 'Save All'}
// //           </button>
// //         </div>
// //         <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

// //           {/* Match Threshold */}
// //           <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
// //             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
// //               <div>
// //                 <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Global Match Threshold</p>
// //                 <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Minimum AI match score to auto-apply (overrideable per user)</p>
// //               </div>
// //               <span style={{ fontSize: 22, fontWeight: 900, color: '#6366F1', fontFamily: 'monospace' }}>{globalSettings.matchThreshold}%</span>
// //             </div>
// //             <input type="range" min={40} max={90} step={5}
// //               value={globalSettings.matchThreshold}
// //               onChange={e => setGlobalSettings(p => ({ ...p, matchThreshold: parseInt(e.target.value) }))}
// //               style={{ width: '100%', accentColor: '#6366F1' }} />
// //             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
// //               <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More jobs (40%)</span>
// //               <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More precise (90%)</span>
// //             </div>
// //           </div>

// //           {/* Per-plan limits */}
// //           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
// //             {[
// //               { key: 'pro',   label: 'PRO',   color: '#F59E0B' },
// //               { key: 'elite', label: 'ELITE', color: '#8B5CF6' },
// //             ].map(plan => (
// //               <div key={plan.key} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: `1.5px solid ${plan.color}30` }}>
// //                 <p style={{ fontSize: 13, fontWeight: 800, color: plan.color, margin: '0 0 12px', textTransform: 'uppercase' }}>{plan.label} Plan Limits</p>
// //                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
// //                   {[
// //                     { field: 'dailyLimit',   label: 'Daily Limit',   icon: Calendar },
// //                     { field: 'monthlyLimit', label: 'Monthly Limit', icon: Clock    },
// //                   ].map(f => (
// //                     <div key={f.field}>
// //                       <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
// //                         <f.icon size={11} /> {f.label}
// //                       </label>
// //                       <input type="number" min={1}
// //                         value={globalSettings[plan.key][f.field]}
// //                         onChange={e => setGlobalSettings(p => ({ ...p, [plan.key]: { ...p[plan.key], [f.field]: parseInt(e.target.value)||1 } }))}
// //                         style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
// //                         onFocus={e => e.target.style.borderColor = plan.color}
// //                         onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
// //                       />
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Recent Auto-Applications */}
// //       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
// //         <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //             <Send size={16} color="#22C55E" />
// //             <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Auto-Applications</h3>
// //           </div>
// //           <button onClick={fetchAll} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
// //             <RefreshCw size={12} /> Refresh
// //           </button>
// //         </div>

// //         {recentApps.length === 0 ? (
// //           <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
// //             No auto-applications yet
// //           </div>
// //         ) : (
// //           <div style={{ overflowX: 'auto' }}>
// //             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
// //               <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
// //                 <tr>
// //                   {['User', 'Job', 'Company', 'Match Score', 'Status', 'Email Sent', 'Date'].map(h => (
// //                     <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
// //                   ))}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {recentApps.map((app, i) => {
// //                   const statusColor = { sent:'#6366F1', viewed:'#F59E0B', shortlisted:'#22C55E', interview:'#3B82F6', accepted:'#10B981', rejected:'#EF4444' }[app.status] || '#6B7280';
// //                   return (
// //                     <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
// //                       <td style={{ padding: '10px 14px', fontSize: 12 }}>
// //                         <div style={{ fontWeight: 600 }}>{app.user?.fullName || '—'}</div>
// //                         <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{app.user?.email}</div>
// //                       </td>
// //                       <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title || '—'}</td>
// //                       <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{app.job?.company?.name || '—'}</td>
// //                       <td style={{ padding: '10px 14px' }}>
// //                         <span style={{ fontSize: 13, fontWeight: 800, color: (app.matchScore||0) >= 75 ? '#22C55E' : (app.matchScore||0) >= 60 ? '#F59E0B' : '#EF4444' }}>
// //                           {app.matchScore ? `${Math.round(app.matchScore)}%` : '—'}
// //                         </span>
// //                       </td>
// //                       <td style={{ padding: '10px 14px' }}>
// //                         <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${statusColor}18`, color: statusColor, fontWeight: 700, textTransform: 'capitalize' }}>{app.status}</span>
// //                       </td>
// //                       <td style={{ padding: '10px 14px' }}>
// //                         {app.emailSentAt
// //                           ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22C55E' }}><Mail size={11} /> Sent</span>
// //                           : <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>—</span>}
// //                       </td>
// //                       <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
// //                         {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
// //                       </td>
// //                     </tr>
// //                   );
// //                 })}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //     </div>
// //   );
// // }

// // function StatCard({ icon, label, value, color }) {
// //   return (
// //     <div style={{ padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
// //       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
// //         <div style={{ color }}>{icon}</div>
// //         <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
// //       </div>
// //       <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{value}</div>
// //     </div>
// //   );
// // }

// 'use strict';
// import { useState, useEffect } from 'react';
// import {
//   Settings, BarChart3, Users, Calendar, Clock,
//   Save, RefreshCw, AlertCircle, Search,
//   Eye, ChevronLeft, ChevronRight, FileText,
//   CheckCircle, XCircle, Trash2, X, Shield,
//   TrendingUp, Crown, Lock, Zap, Send, Mail,
// } from 'lucide-react';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// // ════════════════════════════════════════════════════════════
// // MAIN TAB
// // ════════════════════════════════════════════════════════════
// export default function CVAdminTab() {
//   const [activeSubTab, setActiveSubTab] = useState('limits');

//   const subTabs = [
//     { id: 'limits',     label: 'Plan Limits',    icon: Settings  },
//     { id: 'cvs',        label: 'All CVs',        icon: FileText  },
//     { id: 'analytics',  label: 'Analytics',      icon: BarChart3 },
//     { id: 'autoapply',  label: 'Auto-Apply',     icon: Zap       },
//   ];

//   return (
//     <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
//       {/* Header */}
//       <div style={{ marginBottom: 32 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
//           <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <FileText size={24} color="#fff" />
//           </div>
//           <div>
//             <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>CV Management</h1>
//             <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
//               Control CV plan limits, templates, AI access, and view user CVs
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Sub Tabs */}
//       <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
//         {subTabs.map(tab => (
//           <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
//             display: 'flex', alignItems: 'center', gap: 8,
//             padding: '10px 20px', background: 'transparent', border: 'none',
//             borderBottom: activeSubTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
//             color: activeSubTab === tab.id ? '#6366F1' : 'var(--text-secondary)',
//             cursor: 'pointer', fontSize: 13, fontWeight: 600,
//             transition: 'all 0.2s', whiteSpace: 'nowrap',
//           }}>
//             <tab.icon size={16} /> {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Content */}
//       <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
//         {activeSubTab === 'limits'    && <LimitsSubTab      />}
//         {activeSubTab === 'cvs'       && <CVsSubTab         />}
//         {activeSubTab === 'analytics' && <AnalyticsSubTab   />}
//         {activeSubTab === 'autoapply' && <AutoApplyAdminTab />}
//       </div>

//       <style>{`
//         @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
//         .spin { animation: spin 1s linear infinite; }
//       `}</style>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // LIMITS SUBTAB
// // ════════════════════════════════════════════════════════════
// function LimitsSubTab() {
//   const [config, setConfig] = useState({
//     free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
//     pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
//     elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
//   });
//   const [saving,   setSaving]   = useState(false);
//   const [fetching, setFetching] = useState(true);

//   useEffect(() => { fetchConfig(); }, []);

//   const fetchConfig = async () => {
//     setFetching(true);
//     try {
//       const { data } = await api.get('/admin/cv-config');
//       if (data.data?.config) setConfig(data.data.config);
//     } catch { toast.error('Failed to load CV config'); }
//     finally  { setFetching(false); }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       await api.put('/admin/cv-config', { config });
//       toast.success('CV plan config updated ✅');
//     } catch { toast.error('Failed to save config'); }
//     finally  { setSaving(false); }
//   };

//   const update = (plan, field, value) =>
//     setConfig(p => ({
//       ...p,
//       [plan]: {
//         ...p[plan],
//         [field]: field === 'useAI' ? value : (parseInt(value) || 0),
//       },
//     }));

//   const plans = [
//     { key: 'free',  name: 'FREE',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
//     { key: 'pro',   name: 'PRO',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
//     { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
//   ];

//   const TOTAL_TEMPLATES = 8;

//   if (fetching) return (
//     <div style={{ textAlign: 'center', padding: 60 }}>
//       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
//     </div>
//   );

//   return (
//     <div>
//       {/* Actions */}
//       <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
//         <button onClick={fetchConfig} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
//           <RefreshCw size={14} /> Refresh
//         </button>
//         <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
//           <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
//         </button>
//       </div>

//       {/* Info */}
//       <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
//         <AlertCircle size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
//         <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
//           <strong style={{ color: '#6366F1' }}>Note:</strong> Changes take effect immediately (60s cache).
//           <strong> templatesAllowed</strong> = first N templates shown to user (max {TOTAL_TEMPLATES}).
//           <strong> useAI</strong> = AI analysis vs algorithm.
//           <strong> maxCVs</strong> = number of CVs per user (default 1 for all).
//         </div>
//       </div>

//       {/* Plan cards */}
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//         {plans.map(plan => {
//           const d = config[plan.key] || {};
//           return (
//             <div key={plan.key} style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${plan.color}20`, overflow: 'hidden' }}>
//               {/* Plan header */}
//               <div style={{ padding: '14px 20px', background: plan.bg, borderBottom: `1px solid ${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                   {plan.key === 'elite' ? <Crown size={18} color={plan.color} /> : plan.key === 'pro' ? <Crown size={18} color={plan.color} /> : <Shield size={18} color={plan.color} />}
//                   <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>{plan.name}</h3>
//                 </div>
//                 {/* useAI toggle */}
//                 <button
//                   onClick={() => update(plan.key, 'useAI', !d.useAI)}
//                   style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${d.useAI ? '#22C55E' : '#EF4444'}`, background: d.useAI ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: d.useAI ? '#22C55E' : '#EF4444', transition: 'all 0.2s' }}>
//                   {d.useAI ? <CheckCircle size={13} /> : <XCircle size={13} />}
//                   {d.useAI ? 'AI Analysis ON' : 'Algorithm Only'}
//                 </button>
//               </div>

//               {/* Fields */}
//               <div style={{ padding: 20 }}>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
//                   {[
//                     { field: 'maxCVs',           icon: FileText,  label: 'Max CVs',            desc: 'CVs per user'              },
//                     { field: 'analysisPerDay',   icon: Calendar,  label: 'Analysis / Day',     desc: 'analyses per day'          },
//                     { field: 'analysisPerMonth', icon: Clock,     label: 'Analysis / Month',   desc: 'analyses per month'        },
//                     { field: 'templatesAllowed', icon: Lock,      label: 'Templates Allowed',  desc: `first N of ${TOTAL_TEMPLATES} templates` },
//                   ].map(f => (
//                     <div key={f.field} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
//                       <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
//                         <f.icon size={12} /> {f.label}
//                       </div>
//                       <input
//                         type="number" min={1}
//                         max={f.field === 'templatesAllowed' ? TOTAL_TEMPLATES : undefined}
//                         value={d[f.field] ?? 0}
//                         onChange={e => update(plan.key, f.field, e.target.value)}
//                         style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
//                         onFocus={e => e.target.style.borderColor = plan.color}
//                         onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
//                       />
//                       <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>{f.desc}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // CVs SUBTAB — all user CVs
// // ════════════════════════════════════════════════════════════
// function CVsSubTab() {
//   const [cvs,        setCvs]        = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [selected,   setSelected]   = useState(null);
//   const [search,     setSearch]     = useState('');
//   const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

//   useEffect(() => { fetchCVs(); }, [pagination.page]);

//   const fetchCVs = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/admin/cvs', {
//         params: { page: pagination.page, limit: pagination.limit, search },
//       });
//       if (data.data) {
//         setCvs(data.data.cvs || []);
//         setPagination(p => ({ ...p, total: data.data.pagination?.total || 0, totalPages: data.data.pagination?.totalPages || 1 }));
//       }
//     } catch { toast.error('Failed to load CVs'); }
//     finally  { setLoading(false); }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this CV permanently?')) return;
//     try {
//       await api.delete(`/admin/cvs/${id}`);
//       setCvs(p => p.filter(c => c.id !== id));
//       toast.success('CV deleted');
//     } catch { toast.error('Delete failed'); }
//   };

//   const filtered = cvs.filter(c =>
//     !search ||
//     c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
//     c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
//     c.title?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div>
//       {/* Search */}
//       <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
//         <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
//           <Search size={14} color="var(--text-secondary)" />
//           <input
//             value={search} onChange={e => setSearch(e.target.value)}
//             onKeyDown={e => e.key === 'Enter' && fetchCVs()}
//             placeholder="Search by user or title..."
//             style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13 }}
//           />
//         </div>
//         <button onClick={fetchCVs} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366F1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
//           <RefreshCw size={14} /> Refresh
//         </button>
//       </div>

//       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
//         <div style={{ overflowX: 'auto' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//             <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
//               <tr>
//                 {['User', 'CV Title', 'Language', 'ATS Score', 'Plan', 'Status', 'Created', ''].map(h => (
//                   <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
//                   <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
//                 </td></tr>
//               ) : filtered.length === 0 ? (
//                 <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No CVs found</td></tr>
//               ) : filtered.map(cv => {
//                 const planColor = cv.user?.planKey === 'elite' ? '#8B5CF6' : cv.user?.planKey === 'pro' ? '#F59E0B' : '#6B7280';
//                 const score = cv.atsScore || cv.overallScore;
//                 const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
//                 return (
//                   <tr key={cv.id} style={{ borderBottom: '1px solid var(--border)' }}>
//                     <td style={{ padding: '12px 16px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                         <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
//                           {cv.user?.avatarUrl
//                             ? <img src={cv.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                             : (cv.user?.fullName?.charAt(0) || '?')}
//                         </div>
//                         <div>
//                           <div style={{ fontSize: 13, fontWeight: 600 }}>{cv.user?.fullName || '—'}</div>
//                           <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cv.user?.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 180 }}>
//                       <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || 'Untitled'}</div>
//                       {cv.isPrimary && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 700 }}>★ Primary</span>}
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: 600 }}>
//                         {cv.language === 'ar' ? '🇸🇦 AR' : '🇬🇧 EN'}
//                       </span>
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       {score ? (
//                         <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
//                       ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>}
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${planColor}18`, color: planColor, fontWeight: 700, textTransform: 'uppercase' }}>
//                         {cv.user?.planKey || 'free'}
//                       </span>
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: cv.isAnalyzed ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: cv.isAnalyzed ? '#22C55E' : '#6B7280', fontWeight: 600 }}>
//                         {cv.isAnalyzed ? '✓ Analyzed' : 'Pending'}
//                       </span>
//                     </td>
//                     <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
//                       {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : '—'}
//                     </td>
//                     <td style={{ padding: '12px 16px' }}>
//                       <div style={{ display: 'flex', gap: 6 }}>
//                         <button onClick={() => setSelected(cv)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
//                           <Eye size={12} /> View
//                         </button>
//                         <button onClick={() => handleDelete(cv.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
//                           <Trash2 size={12} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {pagination.totalPages > 1 && (
//           <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} — {pagination.total} total</span>
//             <div style={{ display: 'flex', gap: 8 }}>
//               <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
//                 <ChevronLeft size={14} /> Prev
//               </button>
//               <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
//                 Next <ChevronRight size={14} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {selected && <CVDetailModal cv={selected} onClose={() => setSelected(null)} />}
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // CV DETAIL MODAL
// // ════════════════════════════════════════════════════════════
// function CVDetailModal({ cv, onClose }) {
//   const analysis = cv.analysisData || cv.aiFeedback || {};
//   const builder  = cv.builderData  || {};
//   const score    = cv.atsScore || cv.overallScore || analysis.overallScore;
//   const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

//   return (
//     <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
//       <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
//         {/* Header */}
//         <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
//           <div>
//             <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{cv.title || 'CV Details'}</h3>
//             <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{cv.user?.fullName} · {cv.user?.email}</p>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             {score && <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{score}%</span>}
//             <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
//           </div>
//         </div>

//         <div style={{ padding: 24 }}>
//           {/* Meta */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
//             {[
//               ['Language',  cv.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'],
//               ['Template',  builder.template || cv.template || '—'],
//               ['Status',    cv.isAnalyzed ? '✓ Analyzed' : 'Not Analyzed'],
//               ['Plan',      cv.user?.planKey || 'free'],
//               ['File Type', cv.fileType || '—'],
//               ['Created',   cv.createdAt ? new Date(cv.createdAt).toLocaleString() : '—'],
//             ].map(([label, val]) => (
//               <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
//                 <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
//                 <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
//               </div>
//             ))}
//           </div>

//           {/* ATS Scores — handles both algorithm and AI analysis structures */}
//           {(() => {
//             const scores = analysis.scores || analysis.breakdown || analysis.categories;
//             if (!scores) return null;
//             return (
//               <div style={{ marginBottom: 20 }}>
//                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>ATS Breakdown</div>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
//                   {Object.entries(scores).map(([key, val]) => {
//                     const numVal = typeof val === 'object' ? (val.score || val.value || 0) : (val || 0);
//                     return (
//                       <div key={key} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
//                         <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', marginBottom: 4 }}>{key}</div>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                           <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
//                             <div style={{ height: '100%', width: `${numVal}%`, background: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
//                           </div>
//                           <span style={{ fontSize: 12, fontWeight: 700, color: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', minWidth: 28 }}>{numVal}%</span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })()}

//           {/* Improvements — handles both algorithm and AI formats */}
//           {(() => {
//             const items = analysis.improvements || analysis.suggestions || analysis.recommendations || [];
//             if (!items.length) return null;
//             return (
//               <div style={{ marginBottom: 16 }}>
//                 <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Improvements Needed</div>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                   {items.map((imp, i) => {
//                     const priority = imp.priority || imp.type || 'medium';
//                     const issue    = imp.issue || imp.suggestion || imp.text || (typeof imp === 'string' ? imp : '');
//                     const fix      = imp.fix || imp.action || imp.recommendation || '';
//                     return (
//                       <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: priority === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${priority === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, fontSize: 12 }}>
//                         <span style={{ fontWeight: 700, color: priority === 'high' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase', fontSize: 10 }}>{priority}</span>
//                         <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>{issue}</span>
//                         {fix && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>→ {fix}</div>}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })()}

//           {/* Download link */}
//           {cv.fileUrl && (
//             <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
//               <FileText size={14} /> View CV File
//             </a>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ════════════════════════════════════════════════════════════
// // ANALYTICS SUBTAB
// // ════════════════════════════════════════════════════════════
// function AnalyticsSubTab() {
//   const [stats,   setStats]   = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => { fetchStats(); }, []);

//   const fetchStats = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/admin/cv-stats');
//       if (data.data) setStats(data.data);
//     } catch { toast.error('Failed to load CV stats'); }
//     finally  { setLoading(false); }
//   };

//   if (loading) return (
//     <div style={{ textAlign: 'center', padding: 60 }}>
//       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
//     </div>
//   );

//   return (
//     <div>
//       {/* Stat cards */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
//         <StatCard icon={<FileText size={20} />}    label="Total CVs"        value={stats?.total        || 0} color="#6366F1" />
//         <StatCard icon={<Calendar size={20} />}    label="Uploaded Today"   value={stats?.todayCount   || 0} color="#3B82F6" />
//         <StatCard icon={<Clock size={20} />}       label="This Month"       value={stats?.monthCount   || 0} color="#8B5CF6" />
//         <StatCard icon={<TrendingUp size={20} />}  label="Avg ATS Score"    value={`${stats?.avgScore  || 0}%`} color="#22C55E" />
//         <StatCard icon={<CheckCircle size={20} />} label="Analyzed"         value={stats?.analyzedCount || 0} color="#F59E0B" />
//         <StatCard icon={<Users size={20} />}       label="Unique Users"     value={stats?.uniqueUsers  || 0} color="#EF4444" />
//       </div>

//       {/* By plan */}
//       {(stats?.byPlan || []).length > 0 && (
//         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
//           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
//             <Users size={16} /> CVs by Plan
//           </h4>
//           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
//             {stats.byPlan.map(item => {
//               const color = item.planKey === 'elite' ? '#8B5CF6' : item.planKey === 'pro' ? '#F59E0B' : '#6B7280';
//               return (
//                 <div key={item.planKey} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: `1px solid ${color}20` }}>
//                   <div style={{ fontSize: 32, fontWeight: 900, color }}>{item.count}</div>
//                   <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{item.planKey || 'free'}</div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* By language */}
//       {(stats?.byLanguage || []).length > 0 && (
//         <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
//           <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>CVs by Language</h4>
//           <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
//             {stats.byLanguage.map(item => (
//               <div key={item.language} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
//                 <div style={{ fontSize: 32, fontWeight: 900 }}>{item.count}</div>
//                 <div style={{ fontSize: 14, marginTop: 4 }}>{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
//         <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Summary</h4>
//         <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
//           <p>• <strong>{stats?.total || 0}</strong> total CVs on the platform.</p>
//           <p>• <strong>{stats?.analyzedCount || 0}</strong> CVs have been analyzed.</p>
//           <p>• Average ATS score: <strong>{stats?.avgScore || 0}%</strong>.</p>
//           <p>• <strong>{stats?.todayCount || 0}</strong> CVs uploaded today.</p>
//         </div>
//       </div>
//     </div>
//   );
// }


// // ════════════════════════════════════════════════════════════
// // AUTO-APPLY ADMIN TAB
// // ════════════════════════════════════════════════════════════
// function AutoApplyAdminTab() {
//   const [globalSettings, setGlobalSettings] = useState({
//     matchThreshold: 65,
//     pro:   { dailyLimit: 15, monthlyLimit: 30  },
//     elite: { dailyLimit: 20, monthlyLimit: 100 },
//   });
//   const [userStats,  setUserStats]  = useState([]);
//   const [autoApplyStats, setAutoApplyStats] = useState(null);
//   const [recentApps, setRecentApps] = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [saving,     setSaving]     = useState(false);

//   useEffect(() => { fetchAll(); }, []);

//   const fetchAll = async () => {
//     setLoading(true);
//     try {
//       const [settingsRes, appsRes] = await Promise.allSettled([
//         api.get('/admin/settings').catch(() => null), // ✅ /admin/settings exists
//         api.get('/admin/auto-apply/applications?limit=20').catch(() => null),
//       ]);

//       // Try to get auto-apply settings
//       if (settingsRes.value?.data?.data) {
//         const s = settingsRes.value.data.data;
//         const threshold = s.find?.(x => x.key === 'autoApply.matchThreshold')?.value;
//         const proDaily  = s.find?.(x => x.key === 'autoApply.dailyLimit.pro')?.value;
//         const proMonth  = s.find?.(x => x.key === 'autoApply.monthlyLimit.pro')?.value;
//         const eliteDaily = s.find?.(x => x.key === 'autoApply.dailyLimit.elite')?.value;
//         const eliteMonth = s.find?.(x => x.key === 'autoApply.monthlyLimit.elite')?.value;
//         setGlobalSettings({
//           matchThreshold: parseInt(threshold) || 65,
//           pro:   { dailyLimit: parseInt(proDaily)  || 15, monthlyLimit: parseInt(proMonth)  || 30  },
//           elite: { dailyLimit: parseInt(eliteDaily) || 20, monthlyLimit: parseInt(eliteMonth) || 100 },
//         });
//       }

//       if (appsRes.value?.data?.data) {
//         const apps = appsRes.value.data.data?.applications || [];
//         setRecentApps(Array.isArray(apps) ? apps : []);
//         // Also update stats if available
//         if (appsRes.value.data.data?.stats) {
//           setAutoApplyStats(appsRes.value.data.data.stats);
//         }
//       }
//     } catch {}
//     finally { setLoading(false); }
//   };

//   const handleSaveGlobal = async () => {
//     setSaving(true);
//     try {
//       const updates = [
//         { key: 'autoApply.matchThreshold',       value: String(globalSettings.matchThreshold) },
//         { key: 'autoApply.dailyLimit.pro',        value: String(globalSettings.pro.dailyLimit)    },
//         { key: 'autoApply.monthlyLimit.pro',      value: String(globalSettings.pro.monthlyLimit)  },
//         { key: 'autoApply.dailyLimit.elite',      value: String(globalSettings.elite.dailyLimit)  },
//         { key: 'autoApply.monthlyLimit.elite',    value: String(globalSettings.elite.monthlyLimit) },
//       ];
//       await Promise.all(updates.map(u => api.post('/admin/settings', u)));
//       toast.success('Auto-apply settings saved ✅');
//     } catch { toast.error('Failed to save settings'); }
//     finally { setSaving(false); }
//   };

//   if (loading) return (
//     <div style={{ textAlign: 'center', padding: 60 }}>
//       <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
//     </div>
//   );

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

//       {/* Global Settings */}
//       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
//         <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <Zap size={16} color="#6366F1" />
//             <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Global Auto-Apply Settings</h3>
//           </div>
//           <button onClick={handleSaveGlobal} disabled={saving}
//             style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
//             <Save size={13} /> {saving ? 'Saving...' : 'Save All'}
//           </button>
//         </div>
//         <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

//           {/* Match Threshold */}
//           <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
//               <div>
//                 <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Global Match Threshold</p>
//                 <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Minimum AI match score to auto-apply (overrideable per user)</p>
//               </div>
//               <span style={{ fontSize: 22, fontWeight: 900, color: '#6366F1', fontFamily: 'monospace' }}>{globalSettings.matchThreshold}%</span>
//             </div>
//             <input type="range" min={40} max={90} step={5}
//               value={globalSettings.matchThreshold}
//               onChange={e => setGlobalSettings(p => ({ ...p, matchThreshold: parseInt(e.target.value) }))}
//               style={{ width: '100%', accentColor: '#6366F1' }} />
//             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
//               <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More jobs (40%)</span>
//               <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More precise (90%)</span>
//             </div>
//           </div>

//           {/* Per-plan limits */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
//             {[
//               { key: 'pro',   label: 'PRO',   color: '#F59E0B' },
//               { key: 'elite', label: 'ELITE', color: '#8B5CF6' },
//             ].map(plan => (
//               <div key={plan.key} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: `1.5px solid ${plan.color}30` }}>
//                 <p style={{ fontSize: 13, fontWeight: 800, color: plan.color, margin: '0 0 12px', textTransform: 'uppercase' }}>{plan.label} Plan Limits</p>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
//                   {[
//                     { field: 'dailyLimit',   label: 'Daily Limit',   icon: Calendar },
//                     { field: 'monthlyLimit', label: 'Monthly Limit', icon: Clock    },
//                   ].map(f => (
//                     <div key={f.field}>
//                       <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
//                         <f.icon size={11} /> {f.label}
//                       </label>
//                       <input type="number" min={1}
//                         value={globalSettings[plan.key][f.field]}
//                         onChange={e => setGlobalSettings(p => ({ ...p, [plan.key]: { ...p[plan.key], [f.field]: parseInt(e.target.value)||1 } }))}
//                         style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
//                         onFocus={e => e.target.style.borderColor = plan.color}
//                         onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Auto-Apply Stats */}
//       {autoApplyStats && (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
//           {[
//             { label: 'Total Auto-Applied', value: autoApplyStats.total      || 0, color: '#6366F1' },
//             { label: 'Emails Sent',        value: autoApplyStats.emailsSent || 0, color: '#22C55E' },
//             { label: 'Responses',          value: autoApplyStats.responded  || 0, color: '#3B82F6' },
//             { label: 'Response Rate',      value: `${autoApplyStats.responseRate||0}%`, color: '#F59E0B' },
//             { label: 'Avg Match Score',    value: `${autoApplyStats.avgScore||0}%`, color: '#8B5CF6' },
//           ].map((s,i) => (
//             <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
//               <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
//               <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Recent Auto-Applications */}
//       <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
//         <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <Send size={16} color="#22C55E" />
//             <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Auto-Applications</h3>
//           </div>
//           <button onClick={fetchAll} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
//             <RefreshCw size={12} /> Refresh
//           </button>
//         </div>

//         {recentApps.length === 0 ? (
//           <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
//             No auto-applications yet
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
//                 <tr>
//                   {['User', 'Job', 'Company', 'Match Score', 'Status', 'Email Sent', 'Date'].map(h => (
//                     <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {recentApps.map((app, i) => {
//                   const statusColor = { sent:'#6366F1', viewed:'#F59E0B', shortlisted:'#22C55E', interview:'#3B82F6', accepted:'#10B981', rejected:'#EF4444' }[app.status] || '#6B7280';
//                   return (
//                     <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
//                       <td style={{ padding: '10px 14px', fontSize: 12 }}>
//                         <div style={{ fontWeight: 600 }}>{app.user?.fullName || '—'}</div>
//                         <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{app.user?.email}</div>
//                       </td>
//                       <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title || '—'}</td>
//                       <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{app.job?.company?.name || '—'}</td>
//                       <td style={{ padding: '10px 14px' }}>
//                         <span style={{ fontSize: 13, fontWeight: 800, color: (app.matchScore||0) >= 75 ? '#22C55E' : (app.matchScore||0) >= 60 ? '#F59E0B' : '#EF4444' }}>
//                           {app.matchScore ? `${Math.round(app.matchScore)}%` : '—'}
//                         </span>
//                       </td>
//                       <td style={{ padding: '10px 14px' }}>
//                         <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${statusColor}18`, color: statusColor, fontWeight: 700, textTransform: 'capitalize' }}>{app.status}</span>
//                       </td>
//                       <td style={{ padding: '10px 14px' }}>
//                         {app.emailSentAt
//                           ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22C55E' }}><Mail size={11} /> Sent</span>
//                           : <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>—</span>}
//                       </td>
//                       <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
//                         {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

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
  Settings, BarChart3, Users, Calendar, Clock,
  Save, RefreshCw, AlertCircle, Search,
  Eye, ChevronLeft, ChevronRight, FileText,
  CheckCircle, XCircle, Trash2, X, Shield,
  TrendingUp, Crown, Lock, Zap, Send, Mail,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
// MAIN TAB
// ════════════════════════════════════════════════════════════
export default function CVAdminTab() {
  const [activeSubTab, setActiveSubTab] = useState('limits');

  const subTabs = [
    { id: 'limits',     label: 'Plan Limits',    icon: Settings  },
    { id: 'cvs',        label: 'All CVs',        icon: FileText  },
    { id: 'analytics',  label: 'Analytics',      icon: BarChart3 },
    { id: 'autoapply',  label: 'Auto-Apply',     icon: Zap       },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>CV Management</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Control CV plan limits, templates, AI access, and view user CVs
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border)', marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'transparent', border: 'none',
            borderBottom: activeSubTab === tab.id ? '2px solid #6366F1' : '2px solid transparent',
            color: activeSubTab === tab.id ? '#6366F1' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ height: 'calc(100vh - 220px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {activeSubTab === 'limits'    && <LimitsSubTab      />}
        {activeSubTab === 'cvs'       && <CVsSubTab         />}
        {activeSubTab === 'analytics' && <AnalyticsSubTab   />}
        {activeSubTab === 'autoapply' && <AutoApplyAdminTab />}
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// LIMITS SUBTAB
// ════════════════════════════════════════════════════════════
function LimitsSubTab() {
  const [config, setConfig] = useState({
    free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
    pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
    elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
  });
  const [saving,   setSaving]   = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchConfig(); }, []);

  const fetchConfig = async () => {
    setFetching(true);
    try {
      const { data } = await api.get('/admin/cv-config');
      if (data.data?.config) setConfig(data.data.config);
    } catch { toast.error('Failed to load CV config'); }
    finally  { setFetching(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/cv-config', { config });
      toast.success('CV plan config updated ✅');
    } catch { toast.error('Failed to save config'); }
    finally  { setSaving(false); }
  };

  const update = (plan, field, value) =>
    setConfig(p => ({
      ...p,
      [plan]: {
        ...p[plan],
        [field]: field === 'useAI' ? value : (parseInt(value) || 0),
      },
    }));

  const plans = [
    { key: 'free',  name: 'FREE',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
    { key: 'pro',   name: 'PRO',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
    { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
  ];

  const TOTAL_TEMPLATES = 8;

  if (fetching) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  return (
    <div>
      {/* Actions */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={fetchConfig} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Refresh
        </button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
          <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info */}
      <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <AlertCircle size={14} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: '#6366F1' }}>Note:</strong> Changes take effect immediately (60s cache).
          <strong> templatesAllowed</strong> = first N templates shown to user (max {TOTAL_TEMPLATES}).
          <strong> useAI</strong> = AI analysis vs algorithm.
          <strong> maxCVs</strong> = number of CVs per user (default 1 for all).
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {plans.map(plan => {
          const d = config[plan.key] || {};
          return (
            <div key={plan.key} style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${plan.color}20`, overflow: 'hidden' }}>
              {/* Plan header */}
              <div style={{ padding: '14px 20px', background: plan.bg, borderBottom: `1px solid ${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {plan.key === 'elite' ? <Crown size={18} color={plan.color} /> : plan.key === 'pro' ? <Crown size={18} color={plan.color} /> : <Shield size={18} color={plan.color} />}
                  <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>{plan.name}</h3>
                </div>
                {/* useAI toggle */}
                <button
                  onClick={() => update(plan.key, 'useAI', !d.useAI)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, border: `1.5px solid ${d.useAI ? '#22C55E' : '#EF4444'}`, background: d.useAI ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: d.useAI ? '#22C55E' : '#EF4444', transition: 'all 0.2s' }}>
                  {d.useAI ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  {d.useAI ? 'AI Analysis ON' : 'Algorithm Only'}
                </button>
              </div>

              {/* Fields */}
              <div style={{ padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  {[
                    { field: 'maxCVs',           icon: FileText,  label: 'Max CVs',            desc: 'CVs per user'              },
                    { field: 'analysisPerDay',   icon: Calendar,  label: 'Analysis / Day',     desc: 'analyses per day'          },
                    { field: 'analysisPerMonth', icon: Clock,     label: 'Analysis / Month',   desc: 'analyses per month'        },
                    { field: 'templatesAllowed', icon: Lock,      label: 'Templates Allowed',  desc: `first N of ${TOTAL_TEMPLATES} templates` },
                  ].map(f => (
                    <div key={f.field} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <f.icon size={12} /> {f.label}
                      </div>
                      <input
                        type="number" min={1}
                        max={f.field === 'templatesAllowed' ? TOTAL_TEMPLATES : undefined}
                        value={d[f.field] ?? 0}
                        onChange={e => update(plan.key, f.field, e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = plan.color}
                        onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
                      />
                      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 }}>{f.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CVs SUBTAB — all user CVs
// ════════════════════════════════════════════════════════════
function CVsSubTab() {
  const [cvs,        setCvs]        = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => { fetchCVs(); }, [pagination.page]);

  const fetchCVs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cvs', {
        params: { page: pagination.page, limit: pagination.limit, search },
      });
      if (data.data) {
        setCvs(data.data.cvs || []);
        setPagination(p => ({ ...p, total: data.data.pagination?.total || 0, totalPages: data.data.pagination?.totalPages || 1 }));
      }
    } catch { toast.error('Failed to load CVs'); }
    finally  { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this CV permanently?')) return;
    try {
      await api.delete(`/admin/cvs/${id}`);
      setCvs(p => p.filter(c => c.id !== id));
      toast.success('CV deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = cvs.filter(c =>
    !search ||
    c.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    c.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <Search size={14} color="var(--text-secondary)" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCVs()}
            placeholder="Search by user or title..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13 }}
          />
        </div>
        <button onClick={fetchCVs} style={{ padding: '8px 16px', borderRadius: 8, background: '#6366F1', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['User', 'CV Title', 'Language', 'ATS Score', 'Plan', 'Status', 'Created', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center' }}>
                  <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No CVs found</td></tr>
              ) : filtered.map(cv => {
                const planColor = cv.user?.planKey === 'elite' ? '#8B5CF6' : cv.user?.planKey === 'pro' ? '#F59E0B' : '#6B7280';
                const score = cv.atsScore || cv.overallScore;
                const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';
                return (
                  <tr key={cv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                          {cv.user?.avatarUrl
                            ? <img src={cv.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (cv.user?.fullName?.charAt(0) || '?')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{cv.user?.fullName || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{cv.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || 'Untitled'}</div>
                      {cv.isPrimary && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 700 }}>★ Primary</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontWeight: 600 }}>
                        {cv.language === 'ar' ? '🇸🇦 AR' : '🇬🇧 EN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {score ? (
                        <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
                      ) : <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>—</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${planColor}18`, color: planColor, fontWeight: 700, textTransform: 'uppercase' }}>
                        {cv.user?.planKey || 'free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: cv.isAnalyzed ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)', color: cv.isAnalyzed ? '#22C55E' : '#6B7280', fontWeight: 600 }}>
                        {cv.isAnalyzed ? '✓ Analyzed' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {cv.createdAt ? new Date(cv.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setSelected(cv)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} /> View
                        </button>
                        <button onClick={() => handleDelete(cv.id)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages} — {pagination.total} total</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))} disabled={pagination.page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                <ChevronLeft size={14} /> Prev
              </button>
              <button onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))} disabled={pagination.page === pagination.totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: pagination.page === pagination.totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: 4 }}>
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && <CVDetailModal cv={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CV DETAIL MODAL
// ════════════════════════════════════════════════════════════
function CVDetailModal({ cv, onClose }) {
  const analysis = cv.analysisData || cv.aiFeedback || {};
  const builder  = cv.builderData  || {};
  const score    = cv.atsScore || cv.overallScore || analysis.overallScore;
  const scoreColor = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 720, width: '100%', maxHeight: '85vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{cv.title || 'CV Details'}</h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{cv.user?.fullName} · {cv.user?.email}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {score && <span style={{ fontSize: 20, fontWeight: 900, color: scoreColor }}>{score}%</span>}
            <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 20 }}>
            {[
              ['Language',  cv.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'],
              ['Template',  builder.template || cv.template || '—'],
              ['Status',    cv.isAnalyzed ? '✓ Analyzed' : 'Not Analyzed'],
              ['Plan',      cv.user?.planKey || 'free'],
              ['File Type', cv.fileType || '—'],
              ['Created',   cv.createdAt ? new Date(cv.createdAt).toLocaleString() : '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* ATS Scores — handles both algorithm and AI analysis structures */}
          {(() => {
            const scores = analysis.scores || analysis.breakdown || analysis.categories;
            if (!scores) return null;
            return (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>ATS Breakdown</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {Object.entries(scores).map(([key, val]) => {
                    const numVal = typeof val === 'object' ? (val.score || val.value || 0) : (val || 0);
                    return (
                      <div key={key} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'capitalize', marginBottom: 4 }}>{key}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${numVal}%`, background: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: numVal >= 70 ? '#22C55E' : numVal >= 50 ? '#F59E0B' : '#EF4444', minWidth: 28 }}>{numVal}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Improvements — handles both algorithm and AI formats */}
          {(() => {
            const items = analysis.improvements || analysis.suggestions || analysis.recommendations || [];
            if (!items.length) return null;
            return (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>Improvements Needed</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((imp, i) => {
                    const priority = imp.priority || imp.type || 'medium';
                    const issue    = imp.issue || imp.suggestion || imp.text || (typeof imp === 'string' ? imp : '');
                    const fix      = imp.fix || imp.action || imp.recommendation || '';
                    return (
                      <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: priority === 'high' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${priority === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`, fontSize: 12 }}>
                        <span style={{ fontWeight: 700, color: priority === 'high' ? '#EF4444' : '#F59E0B', textTransform: 'uppercase', fontSize: 10 }}>{priority}</span>
                        <span style={{ color: 'var(--text-primary)', marginLeft: 8 }}>{issue}</span>
                        {fix && <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>→ {fix}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Download link */}
          {cv.fileUrl && (
            <a href={cv.fileUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, background: '#6366F1', color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
              <FileText size={14} /> View CV File
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ANALYTICS SUBTAB
// ════════════════════════════════════════════════════════════
function AnalyticsSubTab() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/cv-stats');
      if (data.data) setStats(data.data);
    } catch { toast.error('Failed to load CV stats'); }
    finally  { setLoading(false); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<FileText size={20} />}    label="Total CVs"        value={stats?.total        || 0} color="#6366F1" />
        <StatCard icon={<Calendar size={20} />}    label="Uploaded Today"   value={stats?.todayCount   || 0} color="#3B82F6" />
        <StatCard icon={<Clock size={20} />}       label="This Month"       value={stats?.monthCount   || 0} color="#8B5CF6" />
        <StatCard icon={<TrendingUp size={20} />}  label="Avg ATS Score"    value={`${stats?.avgScore  || 0}%`} color="#22C55E" />
        <StatCard icon={<CheckCircle size={20} />} label="Analyzed"         value={stats?.analyzedCount || 0} color="#F59E0B" />
        <StatCard icon={<Users size={20} />}       label="Unique Users"     value={stats?.uniqueUsers  || 0} color="#EF4444" />
      </div>

      {/* By plan */}
      {(stats?.byPlan || []).length > 0 && (
        <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> CVs by Plan
          </h4>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {stats.byPlan.map(item => {
              const color = item.planKey === 'elite' ? '#8B5CF6' : item.planKey === 'pro' ? '#F59E0B' : '#6B7280';
              return (
                <div key={item.planKey} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: `1px solid ${color}20` }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color }}>{item.count}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{item.planKey || 'free'}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* By language */}
      {(stats?.byLanguage || []).length > 0 && (
        <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 20 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>CVs by Language</h4>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {stats.byLanguage.map(item => (
              <div key={item.language} style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{item.count}</div>
                <div style={{ fontSize: 14, marginTop: 4 }}>{item.language === 'ar' ? '🇸🇦 Arabic' : '🇬🇧 English'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Summary</h4>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
          <p>• <strong>{stats?.total || 0}</strong> total CVs on the platform.</p>
          <p>• <strong>{stats?.analyzedCount || 0}</strong> CVs have been analyzed.</p>
          <p>• Average ATS score: <strong>{stats?.avgScore || 0}%</strong>.</p>
          <p>• <strong>{stats?.todayCount || 0}</strong> CVs uploaded today.</p>
        </div>
      </div>
    </div>
  );
}


// ════════════════════════════════════════════════════════════
// AUTO-APPLY ADMIN TAB
// ════════════════════════════════════════════════════════════
function AutoApplyAdminTab() {
  const [globalSettings, setGlobalSettings] = useState({
    matchThreshold: 65,
    pro:   { dailyLimit: 15, monthlyLimit: 30  },
    elite: { dailyLimit: 20, monthlyLimit: 100 },
  });
  const [userStats,  setUserStats]  = useState([]);
  const [autoApplyStats, setAutoApplyStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [settingsRes, appsRes] = await Promise.allSettled([
        api.get('/admin/settings').catch(() => null), // ✅ /admin/settings exists
        api.get('/admin/auto-apply/applications?limit=20').catch(() => null),
      ]);

      // ✅ FIXED: GET /admin/settings returns { settings: { key: value, ... } } — an object, not an array.
      const s = settingsRes.value?.data?.data?.settings || {};
      setGlobalSettings({
        matchThreshold: parseInt(s['autoApply.matchThreshold']) || 65,
        pro:   { dailyLimit: parseInt(s['autoApply.dailyLimit.pro'])   || 15, monthlyLimit: parseInt(s['autoApply.monthlyLimit.pro'])   || 30  },
        elite: { dailyLimit: parseInt(s['autoApply.dailyLimit.elite']) || 20, monthlyLimit: parseInt(s['autoApply.monthlyLimit.elite']) || 100 },
      });

      if (appsRes.value?.data?.data) {
        const apps = appsRes.value.data.data?.applications || [];
        setRecentApps(Array.isArray(apps) ? apps : []);
        // Also update stats if available
        if (appsRes.value.data.data?.stats) {
          setAutoApplyStats(appsRes.value.data.data.stats);
        }
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleSaveGlobal = async () => {
    setSaving(true);
    try {
      // ✅ Use bulkUpdate — single request, matches POST /admin/settings/bulk { settings: {...} }
      await api.post('/admin/settings/bulk', {
        settings: {
          'autoApply.matchThreshold':    String(globalSettings.matchThreshold),
          'autoApply.dailyLimit.pro':    String(globalSettings.pro.dailyLimit),
          'autoApply.monthlyLimit.pro':  String(globalSettings.pro.monthlyLimit),
          'autoApply.dailyLimit.elite':  String(globalSettings.elite.dailyLimit),
          'autoApply.monthlyLimit.elite':String(globalSettings.elite.monthlyLimit),
        },
      });
      toast.success('Auto-apply settings saved ✅');
      await fetchAll(); // ✅ re-fetch to confirm the save actually persisted
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Global Settings */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={16} color="#6366F1" />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Global Auto-Apply Settings</h3>
          </div>
          <button onClick={handleSaveGlobal} disabled={saving}
            style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1 }}>
            <Save size={13} /> {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Match Threshold */}
          <div style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Global Match Threshold</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Minimum AI match score to auto-apply (overrideable per user)</p>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#6366F1', fontFamily: 'monospace' }}>{globalSettings.matchThreshold}%</span>
            </div>
            <input type="range" min={40} max={90} step={5}
              value={globalSettings.matchThreshold}
              onChange={e => setGlobalSettings(p => ({ ...p, matchThreshold: parseInt(e.target.value) }))}
              style={{ width: '100%', accentColor: '#6366F1' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More jobs (40%)</span>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>More precise (90%)</span>
            </div>
          </div>

          {/* Per-plan limits */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { key: 'pro',   label: 'PRO',   color: '#F59E0B' },
              { key: 'elite', label: 'ELITE', color: '#8B5CF6' },
            ].map(plan => (
              <div key={plan.key} style={{ padding: 16, background: 'var(--bg-primary)', borderRadius: 10, border: `1.5px solid ${plan.color}30` }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: plan.color, margin: '0 0 12px', textTransform: 'uppercase' }}>{plan.label} Plan Limits</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { field: 'dailyLimit',   label: 'Daily Limit',   icon: Calendar },
                    { field: 'monthlyLimit', label: 'Monthly Limit', icon: Clock    },
                  ].map(f => (
                    <div key={f.field}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        <f.icon size={11} /> {f.label}
                      </label>
                      <input type="number" min={1}
                        value={globalSettings[plan.key][f.field]}
                        onChange={e => setGlobalSettings(p => ({ ...p, [plan.key]: { ...p[plan.key], [f.field]: parseInt(e.target.value)||1 } }))}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${plan.color}30`, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => e.target.style.borderColor = plan.color}
                        onBlur={e  => e.target.style.borderColor = `${plan.color}30`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto-Apply Stats */}
      {autoApplyStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12 }}>
          {[
            { label: 'Total Auto-Applied', value: autoApplyStats.total      || 0, color: '#6366F1' },
            { label: 'Emails Sent',        value: autoApplyStats.emailsSent || 0, color: '#22C55E' },
            { label: 'Responses',          value: autoApplyStats.responded  || 0, color: '#3B82F6' },
            { label: 'Response Rate',      value: `${autoApplyStats.responseRate||0}%`, color: '#F59E0B' },
            { label: 'Avg Match Score',    value: `${autoApplyStats.avgScore||0}%`, color: '#8B5CF6' },
          ].map((s,i) => (
            <div key={i} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Auto-Applications */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Send size={16} color="#22C55E" />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Recent Auto-Applications</h3>
          </div>
          <button onClick={fetchAll} style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-secondary)' }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {recentApps.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
            No auto-applications yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  {['User', 'Job', 'Company', 'Match Score', 'Status', 'Email Sent', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app, i) => {
                  const statusColor = { sent:'#6366F1', viewed:'#F59E0B', shortlisted:'#22C55E', interview:'#3B82F6', accepted:'#10B981', rejected:'#EF4444' }[app.status] || '#6B7280';
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 14px', fontSize: 12 }}>
                        <div style={{ fontWeight: 600 }}>{app.user?.fullName || '—'}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{app.user?.email}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title || '—'}</td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)' }}>{app.job?.company?.name || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: (app.matchScore||0) >= 75 ? '#22C55E' : (app.matchScore||0) >= 60 ? '#F59E0B' : '#EF4444' }}>
                          {app.matchScore ? `${Math.round(app.matchScore)}%` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${statusColor}18`, color: statusColor, fontWeight: 700, textTransform: 'capitalize' }}>{app.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {app.emailSentAt
                          ? <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#22C55E' }}><Mail size={11} /> Sent</span>
                          : <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>—</span>}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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