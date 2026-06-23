'use strict';
// frontend/src/Admin/tabs/PointsAdminTab.jsx
// ════════════════════════════════════════════════════════════
// لوحة تحكم كاملة لنظام النقاط:
//  - Config: نسبة التحويل، نقاط الاشتراك، إعدادات الخصم
//  - Users: جميع المستخدمين مع نقاطهم وتوكناتهم وتكلفتهم
//  - تعديل نقاط مستخدم معين + bulk adjust
// ════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  Star, Settings, Users, RefreshCw, Save, Plus, Minus,
  Search, ChevronLeft, ChevronRight, DollarSign, Zap,
  BarChart3, TrendingUp, AlertTriangle, CheckCircle,
  Crown, Edit3, X, Info, ArrowDown, ArrowUp, Filter,
  Gift, Database,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
const fmtNum  = n => (parseInt(n) || 0).toLocaleString('en-US');
const fmtCost = n => `$${(parseFloat(n) || 0).toFixed(4)}`;
const fmtK    = n => { const v = parseInt(n)||0; return v>=1000000 ? `${(v/1000000).toFixed(1)}M` : v>=1000 ? `${(v/1000).toFixed(1)}K` : String(v); };

const PLAN_COLORS = { free: '#6B7280', pro: '#8B5CF6', elite: '#F59E0B' };
const PLAN_ICONS  = { free: Star, pro: Crown, elite: Zap };

function Toggle({ value, onChange }) {
  return (
    <div onClick={() => onChange(!value)} style={{ width:44, height:24, borderRadius:12, background: value ? '#22C55E' : 'var(--border)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .2s', left: value ? 23 : 3 }} />
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────
function StatCard({ icon: Icon, color, title, value, sub, loading }) {
  return (
    <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
      <div style={{ width:42, height:42, borderRadius:12, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
        <Icon size={20} color={color} />
      </div>
      <p style={{ fontSize:12, color:'var(--text-secondary)', margin:'0 0 4px' }}>{title}</p>
      {loading
        ? <div style={{ height:30, width:80, background:'var(--bg-secondary)', borderRadius:6, animation:'pulse 1.5s infinite' }} />
        : <p style={{ fontSize:26, fontWeight:800, margin:0, fontFamily:'var(--font-en)', color:'var(--text-primary)' }}>{value}</p>
      }
      {sub && <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'4px 0 0' }}>{sub}</p>}
    </div>
  );
}

// ── Adjust Modal ─────────────────────────────────────────
function AdjustModal({ user, onClose, onSave }) {
  const [points,  setPoints]  = useState(100);
  const [action,  setAction]  = useState('add');
  const [desc,    setDesc]    = useState('');
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.post(`/points-admin/adjust/${user.id}`, { points, action, description: desc || undefined });
      toast.success(data.message || 'Points adjusted');
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const preview = action === 'add'    ? user.points + points
                : action === 'deduct' ? Math.max(0, user.points - points)
                : points;

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ maxWidth:440, width:'100%', background:'var(--bg-primary)', borderRadius:20, overflow:'hidden', border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,.3)', animation:'fadeUp .2s ease' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <Edit3 size={15} />
            <span style={{ fontSize:14, fontWeight:700 }}>Adjust Points — {user.fullName}</span>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={16} /></button>
        </div>

        <div style={{ padding:22 }}>
          {/* Current */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18, padding:'10px 14px', borderRadius:10, background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
            <span style={{ fontSize:13, color:'var(--text-secondary)' }}>Current points</span>
            <span style={{ fontSize:16, fontWeight:800, fontFamily:'var(--font-en)', color:'var(--text-primary)' }}>{fmtNum(user.points)}</span>
          </div>

          {/* Action */}
          <div style={{ display:'flex', gap:8, marginBottom:16 }}>
            {[
              { id:'add',    label:'Add',    color:'#22C55E', icon: Plus  },
              { id:'deduct', label:'Deduct', color:'#EF4444', icon: Minus },
              { id:'set',    label:'Set to', color:'#3B82F6', icon: Edit3 },
            ].map(a => {
              const Ic = a.icon;
              return (
                <button key={a.id} onClick={() => setAction(a.id)} style={{ flex:1, padding:'9px 0', borderRadius:10, border:`2px solid ${action===a.id ? a.color : 'var(--border)'}`, background: action===a.id ? `${a.color}12` : 'transparent', cursor:'pointer', fontSize:12, fontWeight:700, color: action===a.id ? a.color : 'var(--text-secondary)', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                  <Ic size={13} />{a.label}
                </button>
              );
            })}
          </div>

          {/* Amount */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Amount (points)</label>
            <input type="number" min={1} value={points} onChange={e => setPoints(Math.max(1, +e.target.value))} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:15, fontWeight:700, fontFamily:'var(--font-en)', boxSizing:'border-box' }} />
            <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'5px 0 0' }}>= {fmtK(points * 1000)} tokens at current ratio</p>
          </div>

          {/* Description */}
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Note (optional)</label>
            <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Reason for adjustment..." style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:13, boxSizing:'border-box' }} />
          </div>

          {/* Preview */}
          <div style={{ marginBottom:20, padding:'10px 14px', borderRadius:10, background:'rgba(34,197,94,.06)', border:'1px solid rgba(34,197,94,.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>After adjustment:</span>
              <span style={{ fontSize:16, fontWeight:800, fontFamily:'var(--font-en)', color:'#22C55E' }}>{fmtNum(preview)} pts</span>
            </div>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose} style={{ flex:1, padding:11, borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13 }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex:2, padding:11, borderRadius:10, border:'none', background:'var(--text-primary)', color:'var(--bg-primary)', cursor:'pointer', fontSize:13, fontWeight:700, opacity: saving ? .7 : 1 }}>
              {saving ? 'Saving...' : 'Save Adjustment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════
export default function PointsAdminTab({ lang }) {
  const [tab,        setTab]        = useState('overview'); // overview | users | config
  const [summary,    setSummary]    = useState(null);
  const [config,     setConfig]     = useState(null);
  const [users,      setUsers]      = useState([]);
  const [userMeta,   setUserMeta]   = useState({ total:0, totalPages:1 });
  const [loading,    setLoading]    = useState(true);
  const [usersLoad,  setUsersLoad]  = useState(false);
  const [savingCfg,  setSavingCfg]  = useState(false);
  const [adjustUser, setAdjustUser] = useState(null);
  const [userPage,   setUserPage]   = useState(1);
  const [search,     setSearch]     = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [sortBy,     setSortBy]     = useState('points_desc');

  // ── Bulk modal ───────────────────────────────────────
  const [bulkOpen,   setBulkOpen]   = useState(false);
  const [bulkPts,    setBulkPts]    = useState(500);
  const [bulkPlan,   setBulkPlan]   = useState('');
  const [bulkDesc,   setBulkDesc]   = useState('');
  const [bulkSaving, setBulkSaving] = useState(false);

  // ── Load ─────────────────────────────────────────────
  const loadSummary = useCallback(async () => {
    try {
      const [s, c] = await Promise.all([
        api.get('/points-admin/summary'),
        api.get('/points-admin/config'),
      ]);
      setSummary(s.data.data);
      setConfig(c.data.data);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async (pg = 1) => {
    setUsersLoad(true);
    try {
      const params = { page: pg, limit: 20, sortBy };
      if (search)     params.search  = search;
      if (planFilter) params.planKey = planFilter;
      const { data } = await api.get('/points-admin/users', { params });
      setUsers(data.data || []);
      setUserMeta(data.pagination || { total:0, totalPages:1 });
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoad(false); }
  }, [search, planFilter, sortBy]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { if (tab === 'users') loadUsers(1); }, [tab, loadUsers]);

  // ── Save config ──────────────────────────────────────
  const saveConfig = async () => {
    setSavingCfg(true);
    try {
      const { data } = await api.put('/points-admin/config', config);
      setConfig(data.data);
      toast.success('✅ Points config saved');
    } catch { toast.error('Failed to save'); }
    finally { setSavingCfg(false); }
  };

  // ── Bulk adjust ──────────────────────────────────────
  const bulkAdjust = async () => {
    setBulkSaving(true);
    try {
      const { data } = await api.post('/points-admin/bulk-adjust', { points: bulkPts, planKey: bulkPlan || undefined, description: bulkDesc || undefined });
      toast.success(data.message || 'Done');
      setBulkOpen(false);
      loadUsers(userPage);
      loadSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setBulkSaving(false);
    }
  };

  const setConfigVal = (path, val) => {
    setConfig(prev => {
      const parts = path.split('.');
      const copy  = { ...prev };
      let ref     = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        ref[parts[i]] = { ...ref[parts[i]] };
        ref = ref[parts[i]];
      }
      ref[parts[parts.length - 1]] = val;
      return copy;
    });
  };

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth:1300, margin:'0 auto', fontFamily:'var(--font-en)' }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes pulse  { 0%,100%{opacity:1}50%{opacity:.5} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none} }
        .pts-row:hover { background: var(--bg-secondary) !important; }
      `}</style>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px', display:'flex', alignItems:'center', gap:10 }}>
            <Star size={22} color="#F59E0B" />Points System Control
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>
            Admin view: tokens & cost — User view: points
          </p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setBulkOpen(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, background:'#8B5CF6', border:'none', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>
            <Gift size={14} />Bulk Grant Points
          </button>
          <button onClick={loadSummary} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, background:'transparent', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer' }}>
            <RefreshCw size={14} />Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, marginBottom:24, borderBottom:'2px solid var(--border)' }}>
        {[
          { id:'overview', icon:BarChart3, label:'Overview'    },
          { id:'users',    icon:Users,     label:'Users'       },
          { id:'config',   icon:Settings,  label:'Configuration'},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display:'flex', alignItems:'center', gap:7, padding:'10px 18px',
            border:'none', background:'transparent', cursor:'pointer', fontSize:13,
            fontWeight: tab===t.id ? 700 : 500,
            color: tab===t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: tab===t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
            marginBottom:-2, transition:'all .15s',
          }}>
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ════════ OVERVIEW ════════ */}
      {tab === 'overview' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, marginBottom:24 }}>
            <StatCard icon={Star}      color="#F59E0B" title="Total Points (all users)"   value={fmtNum(summary?.totalPoints)}       sub="distributed" loading={loading} />
            <StatCard icon={Users}     color="#3B82F6" title="Active Wallets"             value={fmtNum(summary?.totalWallets)}      sub="users with wallets" loading={loading} />
            <StatCard icon={Zap}       color="#8B5CF6" title="Tokens Used (30d)"          value={fmtK(summary?.totalTokens30d)}      sub="all features" loading={loading} />
            <StatCard icon={DollarSign} color="#22C55E" title="API Cost (30d)"            value={fmtCost(summary?.totalCost30d)}     sub="estimated" loading={loading} />
            <StatCard icon={BarChart3} color="#F97316" title="AI Requests (30d)"          value={fmtNum(summary?.totalRequests30d)}  sub="all users" loading={loading} />
          </div>

          {/* Ratio info */}
          {config && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:14, marginBottom:24 }}>
              {/* Conversion rate */}
              <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
                <p style={{ fontSize:13, fontWeight:700, margin:'0 0 14px', display:'flex', alignItems:'center', gap:7 }}>
                  <TrendingUp size={15} color="#3B82F6" />Token ↔ Points Ratio
                </p>
                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:12 }}>
                  <div style={{ textAlign:'center', flex:1, padding:'12px', background:'rgba(139,92,246,.08)', borderRadius:10, border:'1px solid rgba(139,92,246,.2)' }}>
                    <div style={{ fontSize:28, fontWeight:900, color:'#8B5CF6', fontFamily:'var(--font-en)' }}>1</div>
                    <div style={{ fontSize:11, color:'#8B5CF6', fontWeight:700 }}>POINT</div>
                  </div>
                  <div style={{ fontSize:20, color:'var(--text-secondary)' }}>＝</div>
                  <div style={{ textAlign:'center', flex:1, padding:'12px', background:'rgba(59,130,246,.08)', borderRadius:10, border:'1px solid rgba(59,130,246,.2)' }}>
                    <div style={{ fontSize:24, fontWeight:900, color:'#3B82F6', fontFamily:'var(--font-en)' }}>{fmtK(config.tokensPerPoint)}</div>
                    <div style={{ fontSize:11, color:'#3B82F6', fontWeight:700 }}>TOKENS</div>
                  </div>
                </div>
                <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0 }}>
                  Deduction: {config.deductionEnabled ? '🟢 Active' : '⚫ Disabled'} &nbsp;|&nbsp;
                  Block on 0: {config.blockOnZeroPoints ? '🔴 Yes' : '🟢 No'}
                </p>
              </div>

              {/* Subscription bonuses */}
              <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:16, padding:20 }}>
                <p style={{ fontSize:13, fontWeight:700, margin:'0 0 14px', display:'flex', alignItems:'center', gap:7 }}>
                  <Gift size={15} color="#22C55E" />Subscription Bonuses
                </p>
                {['free','pro','elite'].map(plan => {
                  const PIcon = PLAN_ICONS[plan];
                  const pts   = config.subscriptionBonus?.[plan] || 0;
                  const toks  = pts * (config.tokensPerPoint || 1000);
                  return (
                    <div key={plan} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, padding:'8px 12px', borderRadius:9, background:`${PLAN_COLORS[plan]}10`, border:`1px solid ${PLAN_COLORS[plan]}20` }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <PIcon size={14} color={PLAN_COLORS[plan]} />
                        <span style={{ fontSize:13, fontWeight:700, color:PLAN_COLORS[plan], textTransform:'capitalize' }}>{plan}</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, fontWeight:800, fontFamily:'var(--font-en)', color:'var(--text-primary)' }}>{fmtNum(pts)} pts</div>
                        <div style={{ fontSize:10, color:'var(--text-secondary)' }}>= {fmtK(toks)} tokens</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════ USERS TAB ════════ */}
      {tab === 'users' && (
        <>
          {/* Search + filters */}
          <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ flex:1, minWidth:200, position:'relative' }}>
              <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key==='Enter') { setUserPage(1); loadUsers(1); } }}
                style={{ width:'100%', padding:'9px 9px 9px 32px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:13, boxSizing:'border-box' }}
              />
            </div>
            <select value={planFilter} onChange={e => { setPlanFilter(e.target.value); setUserPage(1); }} style={{ padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:13 }}>
              <option value="">All plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
            <select value={sortBy} onChange={e => { setSortBy(e.target.value); setUserPage(1); }} style={{ padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:13 }}>
              <option value="points_desc">Most points</option>
              <option value="points_asc">Least points</option>
              <option value="name_asc">Name A–Z</option>
            </select>
            <button onClick={() => { setUserPage(1); loadUsers(1); }} style={{ padding:'9px 18px', borderRadius:10, background:'var(--text-primary)', border:'none', color:'var(--bg-primary)', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:7 }}>
              <Search size={13} />Search
            </button>
          </div>

          {/* Table */}
          <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, fontWeight:700 }}>Users & Points</span>
              <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{fmtNum(userMeta.total)} users</span>
            </div>

            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'var(--bg-secondary)', borderBottom:'1px solid var(--border)' }}>
                    {['User','Plan','Points','Token Balance','AI Requests','Tokens Used','Cost','Actions'].map(h => (
                      <th key={h} style={{ padding:'11px 10px', textAlign:['Points','Token Balance','AI Requests','Tokens Used','Cost'].includes(h)?'right':'left', fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoad ? (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:40 }}>
                      <RefreshCw size={22} style={{ animation:'spin 1s linear infinite', color:'var(--text-secondary)' }} />
                    </td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign:'center', padding:52, color:'var(--text-secondary)' }}>
                      <Database size={28} style={{ margin:'0 auto 10px', opacity:.2 }} />
                      <p style={{ margin:0, fontSize:13 }}>No users found</p>
                    </td></tr>
                  ) : users.map(u => {
                    const PIcon = PLAN_ICONS[u.planKey] || Star;
                    return (
                      <tr key={u.id} className="pts-row" style={{ borderBottom:'1px solid var(--border)', transition:'background .15s' }}>
                        <td style={{ padding:'11px 10px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>
                              {u.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div style={{ fontSize:13, fontWeight:600 }}>{u.fullName}</div>
                              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:'11px 10px' }}>
                          <span style={{ fontSize:11, padding:'3px 9px', borderRadius:20, background:`${PLAN_COLORS[u.planKey]}15`, color:PLAN_COLORS[u.planKey], fontWeight:700, display:'flex', alignItems:'center', gap:4, width:'fit-content' }}>
                            <PIcon size={11} />{u.planKey}
                          </span>
                        </td>
                        <td style={{ padding:'11px 10px', textAlign:'right' }}>
                          <div style={{ fontSize:15, fontWeight:800, fontFamily:'var(--font-en)', color:'#F59E0B' }}>{fmtNum(u.points)}</div>
                          <div style={{ fontSize:10, color:'var(--text-secondary)' }}>pts</div>
                        </td>
                        <td style={{ padding:'11px 10px', textAlign:'right' }}>
                          <div style={{ fontSize:13, fontWeight:700, fontFamily:'var(--font-en)', color:'#3B82F6' }}>{fmtK(u.tokenBalance)}</div>
                          <div style={{ fontSize:10, color:'var(--text-secondary)' }}>tokens</div>
                        </td>
                        <td style={{ padding:'11px 10px', textAlign:'right', fontFamily:'var(--font-en)', fontSize:13 }}>{fmtNum(u.usage.requestCount)}</td>
                        <td style={{ padding:'11px 10px', textAlign:'right' }}>
                          <div style={{ fontSize:13, fontFamily:'var(--font-en)' }}>
                            <span style={{ color:'#3B82F6' }}>{fmtK(u.usage.inputTokens)}</span>
                            <span style={{ color:'var(--text-secondary)', margin:'0 3px' }}>+</span>
                            <span style={{ color:'#8B5CF6' }}>{fmtK(u.usage.outputTokens)}</span>
                          </div>
                          <div style={{ fontSize:10, color:'var(--text-secondary)' }}>{fmtK(u.usage.totalTokens)} total</div>
                        </td>
                        <td style={{ padding:'11px 10px', textAlign:'right', fontFamily:'var(--font-en)', fontSize:13, color:'#22C55E', fontWeight:700 }}>
                          {fmtCost(u.usage.totalCost)}
                        </td>
                        <td style={{ padding:'11px 10px' }}>
                          <button onClick={() => setAdjustUser(u)} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
                            <Edit3 size={12} />Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {userMeta.totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:14, borderTop:'1px solid var(--border)' }}>
                <button onClick={() => { const p = Math.max(1, userPage-1); setUserPage(p); loadUsers(p); }} disabled={userPage===1} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', cursor: userPage===1?'not-allowed':'pointer', opacity: userPage===1?.5:1 }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize:13, fontFamily:'var(--font-en)' }}>{userPage} / {userMeta.totalPages}</span>
                <button onClick={() => { const p = Math.min(userMeta.totalPages, userPage+1); setUserPage(p); loadUsers(p); }} disabled={userPage===userMeta.totalPages} style={{ padding:'6px 12px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', cursor: userPage===userMeta.totalPages?'not-allowed':'pointer', opacity: userPage===userMeta.totalPages?.5:1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════ CONFIG TAB ════════ */}
      {tab === 'config' && config && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(380px,1fr))', gap:20 }}>

          {/* Conversion Ratio */}
          <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:18, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
              <TrendingUp size={17} color="#3B82F6" />
              <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Token ↔ Points Conversion</h3>
            </div>

            <div style={{ marginBottom:20 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>
                Tokens per Point (admin: tokens / user: 1 point)
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={config.tokensPerPoint}
                onChange={e => setConfigVal('tokensPerPoint', +e.target.value)}
                style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:16, fontWeight:800, fontFamily:'var(--font-en)', boxSizing:'border-box' }}
              />
              <div style={{ marginTop:10, padding:'10px 14px', borderRadius:10, background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.18)' }}>
                <p style={{ fontSize:12, color:'#3B82F6', margin:'0 0 4px', fontWeight:700 }}>Example:</p>
                <p style={{ fontSize:12, color:'var(--text-secondary)', margin:0 }}>
                  Pro plan gives {fmtNum(config.subscriptionBonus?.pro || 0)} points = {fmtK((config.subscriptionBonus?.pro || 0) * config.tokensPerPoint)} tokens
                </p>
              </div>
            </div>

            {/* Deduction controls */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { key:'deductionEnabled',  label:'Enable point deduction', desc:'Deduct points from wallet on every AI call' },
                { key:'blockOnZeroPoints', label:'Block when points = 0',   desc:'Prevent AI usage when user runs out of points' },
              ].map(item => (
                <div key={item.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', background:'var(--bg-secondary)', borderRadius:11, border:'1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, margin:'0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0 }}>{item.desc}</p>
                  </div>
                  <Toggle value={!!config[item.key]} onChange={v => setConfigVal(item.key, v)} />
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Bonuses */}
          <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:18, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:20, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
              <Gift size={17} color="#22C55E" />
              <h3 style={{ fontSize:15, fontWeight:700, margin:0 }}>Subscription Point Bonuses</h3>
            </div>

            <div style={{ marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(99,102,241,.05)', border:'1px solid rgba(99,102,241,.15)' }}>
              <p style={{ fontSize:12, color:'#6366F1', margin:0 }}>
                ℹ️ Points granted automatically when a user subscribes to a plan. Points = token budget.
              </p>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {['free','pro','elite'].map(plan => {
                const PIcon = PLAN_ICONS[plan];
                const pts   = config.subscriptionBonus?.[plan] || 0;
                const toks  = pts * (config.tokensPerPoint || 1000);
                return (
                  <div key={plan} style={{ padding:'14px 16px', borderRadius:12, background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <PIcon size={15} color={PLAN_COLORS[plan]} />
                        <span style={{ fontSize:13, fontWeight:700, color:PLAN_COLORS[plan], textTransform:'capitalize' }}>{plan} Plan</span>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:11, color:'var(--text-secondary)' }}>= {fmtK(toks)} tokens</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <input
                        type="number"
                        min={0}
                        value={pts}
                        onChange={e => setConfigVal(`subscriptionBonus.${plan}`, +e.target.value)}
                        style={{ flex:1, padding:'9px 12px', borderRadius:9, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:15, fontWeight:800, fontFamily:'var(--font-en)' }}
                      />
                      <span style={{ fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>points</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={saveConfig} disabled={savingCfg} style={{ width:'100%', marginTop:20, padding:13, borderRadius:11, background:'var(--text-primary)', border:'none', color:'var(--bg-primary)', fontWeight:700, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: savingCfg?.7:1 }}>
              <Save size={15} />{savingCfg ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}

      {/* ── Adjust Modal ── */}
      {adjustUser && (
        <AdjustModal
          user={adjustUser}
          onClose={() => setAdjustUser(null)}
          onSave={() => { loadUsers(userPage); loadSummary(); }}
        />
      )}

      {/* ── Bulk Modal ── */}
      {bulkOpen && (
        <div onClick={() => setBulkOpen(false)} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.65)', display:'flex', alignItems:'center', justifyContent:'center', padding:20, backdropFilter:'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth:420, width:'100%', background:'var(--bg-primary)', borderRadius:20, overflow:'hidden', border:'1px solid var(--border)', animation:'fadeUp .2s ease' }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                <Gift size={15} color="#8B5CF6" />
                <span style={{ fontSize:14, fontWeight:700 }}>Bulk Grant Points</span>
              </div>
              <button onClick={() => setBulkOpen(false)} style={{ background:'none', border:'none', cursor:'pointer' }}><X size={16} /></button>
            </div>
            <div style={{ padding:22 }}>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Points to grant</label>
                <input type="number" min={1} value={bulkPts} onChange={e => setBulkPts(+e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:15, fontWeight:800, fontFamily:'var(--font-en)', boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Filter by plan (optional)</label>
                <select value={bulkPlan} onChange={e => setBulkPlan(e.target.value)} style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:13 }}>
                  <option value="">All plans</option>
                  <option value="free">Free only</option>
                  <option value="pro">Pro only</option>
                  <option value="elite">Elite only</option>
                </select>
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:6 }}>Note (optional)</label>
                <input type="text" value={bulkDesc} onChange={e => setBulkDesc(e.target.value)} placeholder="e.g. Ramadan bonus" style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:13, boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setBulkOpen(false)} style={{ flex:1, padding:11, borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13 }}>Cancel</button>
                <button onClick={bulkAdjust} disabled={bulkSaving} style={{ flex:2, padding:11, borderRadius:10, border:'none', background:'#8B5CF6', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, opacity: bulkSaving?.7:1 }}>
                  {bulkSaving ? 'Granting...' : `Grant ${fmtNum(bulkPts)} pts to ${bulkPlan || 'all'} users`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
