'use strict';
import { useState, useEffect } from 'react';
import {
  Settings, BarChart3, Users, Calendar, Clock,
  Map, Save, RefreshCw, AlertCircle, Search,
  Eye, ChevronLeft, ChevronRight, TrendingUp, X,
  Target, CheckCircle, XCircle,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CareerPathTab() {
  const [activeSubTab, setActiveSubTab] = useState('limits');

  const subTabs = [
    { id: 'limits',   label: 'Limits Configuration', icon: Settings  },
    { id: 'sessions', label: 'Sessions History',      icon: Map       },
    { id: 'analytics',label: 'Analytics & Stats',     icon: BarChart3 },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Target size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Career Path Management
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Manage AI career path limits, view generated paths, and track analytics
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex', gap: 8, borderBottom: '1px solid var(--border)',
        marginBottom: 24, overflowX: 'auto', scrollbarWidth: 'none',
      }}>
        {subTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'transparent', border: 'none',
            borderBottom: activeSubTab === tab.id ? '2px solid #F59E0B' : '2px solid transparent',
            color: activeSubTab === tab.id ? '#F59E0B' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontWeight: 600,
            transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}>
            <tab.icon size={16} />{tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ height: 'calc(100vh - 200px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {activeSubTab === 'limits'    && <LimitsSubTab    />}
        {activeSubTab === 'sessions'  && <SessionsSubTab  />}
        {activeSubTab === 'analytics' && <AnalyticsSubTab />}
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
  const [limits, setLimits] = useState({
    free:  { perDay: 0, perMonth: 0,  allowGeneration: false },
    pro:   { perDay: 1, perMonth: 5,  allowGeneration: true  },
    elite: { perDay: 3, perMonth: 15, allowGeneration: true  },
  });
  const [loading, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => { fetchLimits(); }, []);

  const fetchLimits = async () => {
    setFetching(true);
    try {
      const { data } = await api.get('/admin/career-path/limits');
      if (data.data?.limits) {
        const l = data.data.limits;
        setLimits({
          free:  { perDay: l.free?.perDay  ?? 0, perMonth: l.free?.perMonth  ?? 0,  allowGeneration: l.free?.allowGeneration  ?? false },
          pro:   { perDay: l.pro?.perDay   ?? 1, perMonth: l.pro?.perMonth   ?? 5,  allowGeneration: l.pro?.allowGeneration   ?? true  },
          elite: { perDay: l.elite?.perDay ?? 3, perMonth: l.elite?.perMonth ?? 15, allowGeneration: l.elite?.allowGeneration ?? true  },
        });
      }
    } catch { toast.error('Failed to load limits'); }
    finally  { setFetching(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/career-path/limits', { limits });
      toast.success('Career path limits updated ✅');
    } catch { toast.error('Failed to save limits'); }
    finally  { setSaving(false); }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset to defaults?')) return;
    try {
      await api.post('/admin/career-path/limits/reset');
      await fetchLimits();
      toast.success('Reset to defaults');
    } catch { toast.error('Reset failed'); }
  };

  const update = (plan, field, value) =>
    setLimits(p => ({ ...p, [plan]: { ...p[plan], [field]: field === 'allowGeneration' ? value : (parseInt(value) || 0) } }));

  const plans = [
    { key: 'free',  name: 'FREE',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
    { key: 'pro',   name: 'PRO',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
    { key: 'elite', name: 'ELITE', color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)'  },
  ];

  if (fetching) return (
    <div style={{ textAlign: 'center', padding: 60 }}>
      <RefreshCw size={32} className="spin" style={{ color: 'var(--text-secondary)' }} />
    </div>
  );

  return (
    <div>
      {/* Actions row */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <RefreshCw size={14} /> Reset
        </button>
        <button onClick={handleSave} disabled={loading} style={{ padding: '8px 24px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info */}
      <div style={{ marginBottom: 24, padding: '12px 16px', background: 'rgba(245,158,11,0.08)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <AlertCircle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#F59E0B' }}>Note:</strong> Changes take effect immediately.
          0 = unlimited. Daily limits reset at midnight UTC, monthly on the 1st.
        </div>
      </div>

      {/* Plan cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {plans.map(plan => {
          const d = limits[plan.key] || { perDay: 0, perMonth: 0, allowGeneration: false };
          return (
            <div key={plan.key} style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${plan.color}20`, overflow: 'hidden' }}>
              {/* Plan header */}
              <div style={{ padding: '14px 20px', background: plan.bg, borderBottom: `1px solid ${plan.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: plan.color }}>{plan.name}</h3>
                <button
                  onClick={() => update(plan.key, 'allowGeneration', !d.allowGeneration)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 14px', borderRadius: 20,
                    border: `1.5px solid ${d.allowGeneration ? '#22C55E' : '#EF4444'}`,
                    background: d.allowGeneration ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    color: d.allowGeneration ? '#22C55E' : '#EF4444', transition: 'all 0.2s',
                  }}
                >
                  {d.allowGeneration ? <CheckCircle size={13} /> : <XCircle size={13} />}
                  {d.allowGeneration ? 'Allow Generation' : 'Disabled Generation'}
                </button>
              </div>

              {/* Fields */}
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                  {[
                    { field: 'perDay',   icon: Calendar, label: 'Daily Limit',   desc: 'generations per day (0 = unlimited)'   },
                    { field: 'perMonth', icon: Clock,    label: 'Monthly Limit', desc: 'generations per month (0 = unlimited)' },
                  ].map(f => (
                    <div key={f.field} style={{ padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <f.icon size={12} /> {f.label}
                      </div>
                      <input
                        type="number" min={0} value={d[f.field]}
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
// SESSIONS SUBTAB
// ════════════════════════════════════════════════════════════
function SessionsSubTab() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => { fetchSessions(); }, [pagination.page]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/career-path/sessions', {
        params: { page: pagination.page, limit: pagination.limit },
      });
      if (data.data) {
        setSessions(data.data.sessions || []);
        setPagination(p => ({ ...p, total: data.data.pagination?.total || 0, totalPages: data.data.pagination?.totalPages || 1 }));
      }
    } catch { toast.error('Failed to load sessions'); }
    finally  { setLoading(false); }
  };

  const filtered = sessions.filter(s =>
    !search ||
    s.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.goal?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <Search size={14} color="var(--text-secondary)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user or goal..." style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 13 }} />
        </div>
        <button onClick={fetchSessions} style={{ padding: '8px 16px', borderRadius: 8, background: '#F59E0B', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
              <tr>
                {['User', 'Goal / Target Role', 'Plan', 'Current Skills', 'Missing Skills', 'Generated At', ''].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center' }}>
                  <RefreshCw size={24} className="spin" style={{ color: 'var(--text-secondary)' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>No sessions found</td></tr>
              ) : filtered.map(s => {
                const planColor = s.user?.planKey === 'elite' ? '#8B5CF6' : s.user?.planKey === 'pro' ? '#F59E0B' : '#6B7280';
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                          {s.user?.avatarUrl
                            ? <img src={s.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : (s.user?.fullName?.charAt(0) || '?')}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{s.user?.fullName || '—'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, maxWidth: 200 }}>
                      <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.goal || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${planColor}18`, color: planColor, fontWeight: 700, textTransform: 'uppercase' }}>
                        {s.user?.planKey || 'free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)' }}>
                      {(s.currentSkills || []).length} skills
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'rgba(239,68,68,0.1)', color: '#EF4444', fontWeight: 600 }}>
                        {(s.missingSkills || []).length} missing
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {s.generated_at ? new Date(s.generated_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setSelected(s)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Page {pagination.page} of {pagination.totalPages}</span>
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

      {selected && <SessionModal session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// SESSION DETAIL MODAL
// ════════════════════════════════════════════════════════════
function SessionModal({ session, onClose }) {
  let aiResult = {};
  try { aiResult = JSON.parse(session.aiNotes || '{}'); } catch {}

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: '100%', maxHeight: '80vh', overflow: 'auto', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-primary)', zIndex: 1 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Career Path Details</h3>
          <button onClick={onClose} style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              ['User',         `${session.user?.fullName || '—'} (${session.user?.email || '—'})`],
              ['Goal',         session.goal || '—'],
              ['Current Role', aiResult.currentRole || '—'],
              ['Target Role',  aiResult.targetRole  || '—'],
              ['Timeline',     aiResult.estimatedYears ? `${aiResult.estimatedYears} years` : '—'],
              ['Market Demand',aiResult.marketDemand || '—'],
              ['Generated',    session.generated_at ? new Date(session.generated_at).toLocaleString() : '—'],
              ['Plan',         session.user?.planKey || 'free'],
            ].map(([label, val]) => (
              <div key={label}>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{label}</label>
                <p style={{ fontSize: 13, marginTop: 4, wordBreak: 'break-word' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Current Skills */}
          {(session.currentSkills || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Current Skills ({session.currentSkills.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {session.currentSkills.map((s, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, background: 'rgba(34,197,94,0.1)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {(session.missingSkills || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Missing Skills ({session.missingSkills.length})</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {session.missingSkills.map((s, i) => (
                  <span key={i} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {aiResult.summary && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>AI Summary</label>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>{aiResult.summary}</p>
            </div>
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
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/career-path/stats');
      if (data.data) setStats(data.data);
    } catch { toast.error('Failed to load stats'); }
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
        <StatCard icon={<Target size={20} />}    label="Total Paths Generated" value={stats?.total      || 0} color="#F59E0B" />
        <StatCard icon={<Calendar size={20} />}  label="Today"                 value={stats?.todayCount || 0} color="#3B82F6" />
        <StatCard icon={<Clock size={20} />}     label="This Month"            value={stats?.monthCount || 0} color="#8B5CF6" />
        <StatCard icon={<TrendingUp size={20} />}label="Active Users"          value={(stats?.byPlan || []).reduce((s, p) => s + p.count, 0)} color="#22C55E" />
      </div>

      {/* By plan */}
      {(stats?.byPlan || []).length > 0 && (
        <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', marginBottom: 24 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} /> Paths Generated by Plan
          </h4>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
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

      {/* Summary info */}
      <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Quick Summary</h4>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
          <p>• <strong>{stats?.total || 0}</strong> total career paths have been generated on the platform.</p>
          <p>• <strong>{stats?.todayCount || 0}</strong> paths generated today.</p>
          <p>• <strong>{stats?.monthCount || 0}</strong> paths generated this month.</p>
        </div>
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