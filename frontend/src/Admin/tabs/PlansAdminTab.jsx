'use strict';
// frontend/src/Admin/tabs/PlansAdminTab.jsx
// ════════════════════════════════════════════════════════════
// Plans admin — per-country pricing + feature limits
// Prices tab: table of all Arab countries, each with its own
//   Pro/Elite price in local currency
// Features tab: checkboxes + daily limits per plan
// ════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Save, Plus, Trash2, RefreshCw, RotateCcw, Check,
  X, Edit3, DollarSign, Info, AlertTriangle, Search,
  Sliders, Settings, ChevronDown, ChevronUp, Globe,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
//  ARAB COUNTRIES MASTER LIST
// ════════════════════════════════════════════════════════════
const ARAB_COUNTRIES = [
  // Gulf
  { cc: 'AE', name: 'UAE',              flag: '🇦🇪', currency: 'AED', symbol: 'AED', region: 'Gulf'        },
  { cc: 'SA', name: 'Saudi Arabia',     flag: '🇸🇦', currency: 'SAR', symbol: 'SAR', region: 'Gulf'        },
  { cc: 'KW', name: 'Kuwait',           flag: '🇰🇼', currency: 'KWD', symbol: 'KD',  region: 'Gulf'        },
  { cc: 'QA', name: 'Qatar',            flag: '🇶🇦', currency: 'QAR', symbol: 'QAR', region: 'Gulf'        },
  { cc: 'BH', name: 'Bahrain',          flag: '🇧🇭', currency: 'BHD', symbol: 'BD',  region: 'Gulf'        },
  { cc: 'OM', name: 'Oman',             flag: '🇴🇲', currency: 'OMR', symbol: 'OMR', region: 'Gulf'        },
  // Levant
  { cc: 'JO', name: 'Jordan',           flag: '🇯🇴', currency: 'JOD', symbol: 'JD',  region: 'Levant'      },
  { cc: 'LB', name: 'Lebanon',          flag: '🇱🇧', currency: 'USD', symbol: '$',   region: 'Levant'      },
  { cc: 'SY', name: 'Syria',            flag: '🇸🇾', currency: 'USD', symbol: '$',   region: 'Levant'      },
  { cc: 'PS', name: 'Palestine',        flag: '🇵🇸', currency: 'USD', symbol: '$',   region: 'Levant'      },
  { cc: 'IQ', name: 'Iraq',             flag: '🇮🇶', currency: 'IQD', symbol: 'IQD', region: 'Levant'      },
  // North Africa
  { cc: 'EG', name: 'Egypt',            flag: '🇪🇬', currency: 'EGP', symbol: 'EGP', region: 'North Africa' },
  { cc: 'MA', name: 'Morocco',          flag: '🇲🇦', currency: 'MAD', symbol: 'MAD', region: 'North Africa' },
  { cc: 'TN', name: 'Tunisia',          flag: '🇹🇳', currency: 'TND', symbol: 'TND', region: 'North Africa' },
  { cc: 'DZ', name: 'Algeria',          flag: '🇩🇿', currency: 'DZD', symbol: 'DZD', region: 'North Africa' },
  { cc: 'LY', name: 'Libya',            flag: '🇱🇾', currency: 'USD', symbol: '$',   region: 'North Africa' },
  { cc: 'SD', name: 'Sudan',            flag: '🇸🇩', currency: 'USD', symbol: '$',   region: 'North Africa' },
  // Other Arab
  { cc: 'YE', name: 'Yemen',            flag: '🇾🇪', currency: 'USD', symbol: '$',   region: 'Other'       },
  { cc: 'SO', name: 'Somalia',          flag: '🇸🇴', currency: 'USD', symbol: '$',   region: 'Other'       },
  { cc: 'MR', name: 'Mauritania',       flag: '🇲🇷', currency: 'USD', symbol: '$',   region: 'Other'       },
  { cc: 'DJ', name: 'Djibouti',         flag: '🇩🇯', currency: 'USD', symbol: '$',   region: 'Other'       },
  { cc: 'KM', name: 'Comoros',          flag: '🇰🇲', currency: 'USD', symbol: '$',   region: 'Other'       },
  // International
  { cc: '__',  name: 'International (Default)', flag: '🌍', currency: 'USD', symbol: '$', region: 'Global' },
];

const REGIONS = ['Gulf', 'Levant', 'North Africa', 'Other', 'Global'];

// ════════════════════════════════════════════════════════════
//  FEATURE DEFS
// ════════════════════════════════════════════════════════════
const FEATURE_DEFS = [
  { key: 'cvUploads',        en: 'CV Uploads',           ar: 'رفع السيرة',        type: 'daily',  icon: '📄' },
  { key: 'aiAnalysis',       en: 'AI CV Analysis',       ar: 'تحليل AI',           type: 'daily',  icon: '🔍' },
  { key: 'coverLetterDaily', en: 'Cover Letter',         ar: 'خطاب التقديم',       type: 'daily',  icon: '✉️' },
  { key: 'training',         en: 'AI Interview',         ar: 'مقابلات AI',          type: 'daily',  icon: '🎤' },
  { key: 'careerPathDaily',  en: 'Career Path',          ar: 'المسار المهني',       type: 'daily',  icon: '🗺️' },
  { key: 'autoApplyDaily',   en: 'Auto-Apply',           ar: 'تقديم تلقائي',        type: 'daily',  icon: '🤖' },
  { key: 'chatDaily',        en: 'Career Chat',          ar: 'المساعد المهني',      type: 'daily',  icon: '💬' },
  { key: 'jobApplications',  en: 'Job Applications',     ar: 'التقديم على وظائف',   type: 'total',  icon: '💼' },
  { key: 'walletBonus',      en: 'Wallet Points Bonus',  ar: 'نقاط المحفظة',        type: 'total',  icon: '⭐' },
  { key: 'cvBuilder',        en: 'CV Builder',           ar: 'منشئ السيرة',         type: 'bool',   icon: '🏗️' },
  { key: 'courses',          en: 'Courses Access',       ar: 'الوصول للدورات',      type: 'bool',   icon: '📚' },
  { key: 'autoApply',        en: 'Auto-Apply Feature',   ar: 'ميزة التقديم',        type: 'bool',   icon: '⚡' },
  { key: 'prioritySupport',  en: 'Priority Support',     ar: 'دعم أولوية',          type: 'bool',   icon: '🛡️' },
];

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════
function Toggle({ value, onChange, size = 'md' }) {
  const w = size === 'sm' ? 32 : 40, h = size === 'sm' ? 18 : 22, d = size === 'sm' ? 13 : 17;
  return (
    <div onClick={() => onChange(!value)} style={{ width:w, height:h, borderRadius:h, background: value ? '#22C55E' : 'var(--border)', cursor:'pointer', position:'relative', transition:'background .2s', flexShrink:0 }}>
      <div style={{ position:'absolute', top:(h-d)/2, width:d, height:d, borderRadius:'50%', background:'#fff', transition:'left .2s', left: value ? w-d-(h-d)/2 : (h-d)/2 }} />
    </div>
  );
}

function NumInput({ value, onChange }) {
  const isUnlimited = value === -1;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      <input type="number" min={-1} value={isUnlimited ? '' : (value || 0)} placeholder={isUnlimited ? '∞' : '0'} onChange={e => onChange(e.target.value === '' ? -1 : Math.max(-1, parseInt(e.target.value)||0))} style={{ width:58, padding:'5px 7px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:13, textAlign:'center', fontFamily:'var(--font-en)' }} />
      <button onClick={() => onChange(value === -1 ? 0 : -1)} title="Toggle unlimited" style={{ padding:'4px 6px', borderRadius:6, border:`1px solid ${isUnlimited ? '#22C55E' : 'var(--border)'}`, background: isUnlimited ? 'rgba(34,197,94,.1)' : 'transparent', cursor:'pointer', fontSize:10, fontWeight:700, color: isUnlimited ? '#22C55E' : 'var(--text-secondary)' }}>∞</button>
    </div>
  );
}

// Inline price cell editor
function PriceCell({ value, symbol, onChange }) {
  const [editing, setEditing] = useState(false);
  const [local,   setLocal]   = useState(value);

  useEffect(() => { setLocal(value); }, [value]);

  if (editing) return (
    <div style={{ display:'flex', alignItems:'center', gap:3 }}>
      <span style={{ fontSize:11, color:'var(--text-secondary)' }}>{symbol}</span>
      <input
        autoFocus type="number" min={0} step={0.01} value={local}
        onChange={e => setLocal(parseFloat(e.target.value)||0)}
        onBlur={() => { setEditing(false); onChange(local); }}
        onKeyDown={e => { if (e.key==='Enter') { setEditing(false); onChange(local); } if (e.key==='Escape') { setEditing(false); setLocal(value); } }}
        style={{ width:72, padding:'5px 7px', borderRadius:7, border:'1px solid var(--text-primary)', background:'var(--bg-secondary)', color:'var(--text-primary)', fontSize:13, fontFamily:'var(--font-en)', outline:'none' }}
      />
    </div>
  );

  return (
    <div onClick={() => setEditing(true)} style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:7, border:'1px solid transparent', cursor:'pointer', transition:'all .15s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-secondary)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.background='transparent'; }}>
      <span style={{ fontSize:11, color:'var(--text-secondary)', fontFamily:'var(--font-en)' }}>{symbol}</span>
      <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', fontFamily:'var(--font-en)' }}>{value}</span>
      <Edit3 size={10} color="var(--text-secondary)" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function PlansAdminTab({ lang }) {
  const [activeTab, setActiveTab] = useState('prices');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [dirty,     setDirty]     = useState(false);

  // Per-country prices — { CC: { pro: {monthly,yearly}, elite: {monthly,yearly}, currency, symbol } }
  const [countryPrices, setCountryPrices] = useState({});
  // Plan features
  const [features,      setFeatures]      = useState({});

  // UI
  const [search,        setSearch]        = useState('');
  const [expandedRegion,setExpandedRegion]= useState(new Set(REGIONS));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pricing');
      const d = data.data || {};
      setCountryPrices(d.countries || d.overrides || {});
      setFeatures(d.features || {});
    } catch {
      toast.error('Failed to load pricing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Update a country price ────────────────────────────
  const setPriceVal = (cc, plan, period, val) => {
    setCountryPrices(prev => ({
      ...prev,
      [cc]: {
        ...(prev[cc] || {}),
        [plan]: { ...(prev[cc]?.[plan] || {}), [period]: parseFloat(val) || 0 },
      },
    }));
    setDirty(true);
  };

  // ── Update a feature value ────────────────────────────
  const setFeat = (planKey, featureKey, val) => {
    setFeatures(prev => ({ ...prev, [planKey]: { ...(prev[planKey]||{}), [featureKey]: val } }));
    setDirty(true);
  };

  // ── Get current price for a country ──────────────────
  const getPrice = (cc, plan, period) => {
    return countryPrices[cc]?.[plan]?.[period] ?? null; // null = using default
  };

  // ── Save ──────────────────────────────────────────────
  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/admin/pricing/tiers',    { tiers: { countries: countryPrices } }),
        api.put('/admin/pricing/features', { features }),
      ]);
      setDirty(false);
      toast.success('✅ Pricing saved — live for all users');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!window.confirm('Reset all pricing to defaults?')) return;
    try {
      await api.post('/admin/pricing/reset');
      toast.success('↩️ Reset to defaults');
      await load(); setDirty(false);
    } catch { toast.error('Failed to reset'); }
  };

  // ── Filtered + grouped countries ─────────────────────
  const filteredCountries = useMemo(() => {
    const q = search.toLowerCase();
    return ARAB_COUNTRIES.filter(c =>
      !q || c.name.toLowerCase().includes(q) || c.cc.toLowerCase().includes(q) || c.currency.toLowerCase().includes(q)
    );
  }, [search]);

  const byRegion = useMemo(() => {
    const map = {};
    REGIONS.forEach(r => { map[r] = filteredCountries.filter(c => c.region === r); });
    return map;
  }, [filteredCountries]);

  const toggleRegion = (r) => {
    setExpandedRegion(prev => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:300 }}>
      <RefreshCw size={24} color="var(--text-secondary)" style={{ animation:'spin 1s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ maxWidth:1400, margin:'0 auto', fontFamily:'var(--font-en)' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none} }
        .ctr:hover { background: var(--bg-primary) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, margin:'0 0 4px', display:'flex', alignItems:'center', gap:10 }}>
            <Globe size={22} color="#3B82F6" /> Plans & Pricing Management
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', margin:0 }}>
            Per-country prices · Changes go live immediately
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {dirty && <span style={{ fontSize:12, padding:'6px 12px', borderRadius:9, background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.25)', color:'#F59E0B', fontWeight:700 }}>● Unsaved</span>}
          <button onClick={reset} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', borderRadius:10, background:'transparent', border:'1px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', fontSize:13 }}>
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={save} disabled={saving||!dirty} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 20px', borderRadius:10, background: dirty ? 'var(--text-primary)' : 'var(--border)', border:'none', color: dirty ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: dirty ? 'pointer' : 'not-allowed', fontSize:13, fontWeight:700 }}>
            {saving ? <RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'11px 15px', borderRadius:11, background:'rgba(59,130,246,.06)', border:'1px solid rgba(59,130,246,.15)', marginBottom:20 }}>
        <Info size={14} color="#3B82F6" style={{ flexShrink:0, marginTop:1 }} />
        <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>
          <strong style={{ color:'var(--text-primary)' }}>Click any price to edit inline.</strong> Users automatically see the price for their country based on IP. Gray prices = using default from code.
        </p>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:'flex', gap:2, marginBottom:20, borderBottom:'2px solid var(--border)' }}>
        {[
          { id:'prices',   icon:DollarSign, label:'Prices by Country' },
          { id:'features', icon:Sliders,    label:'Feature Limits'    },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer', fontSize:13, fontWeight: activeTab===tab.id ? 700 : 500, color: activeTab===tab.id ? 'var(--text-primary)' : 'var(--text-secondary)', borderBottom: activeTab===tab.id ? '2px solid var(--text-primary)' : '2px solid transparent', marginBottom:-2, transition:'all .15s' }}>
            <tab.icon size={14} />{tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          PRICES TAB
      ════════════════════════════════════════════════ */}
      {activeTab === 'prices' && (
        <>
          {/* Search */}
          <div style={{ position:'relative', maxWidth:340, marginBottom:20 }}>
            <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
            <input type="text" placeholder="Search country, code, or currency..." value={search} onChange={e => setSearch(e.target.value)} style={{ width:'100%', padding:'9px 12px 9px 34px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:13, boxSizing:'border-box' }} />
          </div>

          {/* Table with region groups */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {REGIONS.map(region => {
              const rows = byRegion[region];
              if (!rows?.length) return null;
              const isOpen = expandedRegion.has(region);

              return (
                <div key={region} style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden' }}>
                  {/* Region header */}
                  <button onClick={() => toggleRegion(region)} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', border:'none', background:'var(--bg-secondary)', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:15 }}>
                        {region==='Gulf'?'🛢️': region==='Levant'?'🌿': region==='North Africa'?'🌅': region==='Global'?'🌍':'🌐'}
                      </span>
                      <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{region}</span>
                      <span style={{ fontSize:12, color:'var(--text-secondary)', padding:'2px 8px', borderRadius:99, background:'var(--bg-primary)', border:'1px solid var(--border)' }}>{rows.length} countries</span>
                    </div>
                    {isOpen ? <ChevronUp size={15} color="var(--text-secondary)" /> : <ChevronDown size={15} color="var(--text-secondary)" />}
                  </button>

                  {isOpen && (
                    <div style={{ overflowX:'auto' }}>
                      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                        <thead>
                          <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--bg-secondary)' }}>
                            <th style={{ padding:'10px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', minWidth:200 }}>Country</th>
                            <th style={{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase' }}>Pro Monthly</th>
                            <th style={{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase' }}>Pro Yearly</th>
                            <th style={{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color:'#F59E0B', textTransform:'uppercase' }}>Elite Monthly</th>
                            <th style={{ padding:'10px 12px', textAlign:'right', fontSize:11, fontWeight:700, color:'#F59E0B', textTransform:'uppercase' }}>Elite Yearly</th>
                            <th style={{ padding:'10px 12px', textAlign:'center', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase' }}>Currency</th>
                            <th style={{ padding:'10px 12px', textAlign:'center', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase' }}>Overridden</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map((country, idx) => {
                            const cc       = country.cc;
                            const override = countryPrices[cc] || {};
                            const sym      = override.symbol || country.symbol;
                            const isOverridden = !!countryPrices[cc];

                            return (
                              <tr key={cc} className="ctr" style={{ borderBottom:'1px solid var(--border)', transition:'background .15s', background: idx%2===0 ? 'var(--bg-primary)' : 'transparent' }}>
                                {/* Country */}
                                <td style={{ padding:'10px 16px' }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                    <span style={{ fontSize:22 }}>{country.flag}</span>
                                    <div>
                                      <p style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{country.name}</p>
                                      <p style={{ fontSize:11, color:'var(--text-secondary)', margin:0, fontFamily:'var(--font-en)' }}>{cc} · {country.currency}</p>
                                    </div>
                                  </div>
                                </td>
                                {/* Pro Monthly */}
                                <td style={{ padding:'8px 12px', textAlign:'right' }}>
                                  <PriceCell
                                    value={getPrice(cc,'pro','monthly') ?? '—'}
                                    symbol={sym}
                                    onChange={v => setPriceVal(cc,'pro','monthly',v)}
                                  />
                                </td>
                                {/* Pro Yearly */}
                                <td style={{ padding:'8px 12px', textAlign:'right' }}>
                                  <PriceCell
                                    value={getPrice(cc,'pro','yearly') ?? '—'}
                                    symbol={sym}
                                    onChange={v => setPriceVal(cc,'pro','yearly',v)}
                                  />
                                </td>
                                {/* Elite Monthly */}
                                <td style={{ padding:'8px 12px', textAlign:'right' }}>
                                  <PriceCell
                                    value={getPrice(cc,'elite','monthly') ?? '—'}
                                    symbol={sym}
                                    onChange={v => setPriceVal(cc,'elite','monthly',v)}
                                  />
                                </td>
                                {/* Elite Yearly */}
                                <td style={{ padding:'8px 12px', textAlign:'right' }}>
                                  <PriceCell
                                    value={getPrice(cc,'elite','yearly') ?? '—'}
                                    symbol={sym}
                                    onChange={v => setPriceVal(cc,'elite','yearly',v)}
                                  />
                                </td>
                                {/* Currency override */}
                                <td style={{ padding:'8px 12px', textAlign:'center' }}>
                                  <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                                    <span style={{ fontSize:12, color:'var(--text-secondary)', fontFamily:'var(--font-en)' }}>{sym}</span>
                                    {sym !== country.symbol && (
                                      <button onClick={() => {
                                        setCountryPrices(prev => {
                                          const c = { ...prev[cc] }; delete c.symbol; delete c.currency;
                                          return { ...prev, [cc]: c };
                                        }); setDirty(true);
                                      }} style={{ background:'none', border:'none', cursor:'pointer', color:'#EF4444', padding:2 }}>
                                        <X size={10} />
                                      </button>
                                    )}
                                  </div>
                                </td>
                                {/* Override indicator */}
                                <td style={{ padding:'8px 12px', textAlign:'center' }}>
                                  {isOverridden ? (
                                    <div style={{ display:'flex', alignItems:'center', gap:5, justifyContent:'center' }}>
                                      <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'rgba(34,197,94,.1)', color:'#22C55E', fontWeight:700 }}>
                                        ✓ Custom
                                      </span>
                                      <button onClick={() => { setCountryPrices(prev => { const c={...prev}; delete c[cc]; return c; }); setDirty(true); }} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:2 }} title="Reset to default">
                                        <RotateCcw size={11} />
                                      </button>
                                    </div>
                                  ) : (
                                    <span style={{ fontSize:11, color:'var(--text-secondary)' }}>Default</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          FEATURES TAB
      ════════════════════════════════════════════════ */}
      {activeTab === 'features' && (
        <>
          <div style={{ display:'flex', alignItems:'flex-start', gap:9, padding:'11px 15px', borderRadius:11, background:'rgba(99,102,241,.05)', border:'1px solid rgba(99,102,241,.15)', marginBottom:18 }}>
            <Info size={14} color="#6366F1" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:0, lineHeight:1.5 }}>
              Numbers = daily limit per user. <code style={{ background:'var(--bg-secondary)', padding:'1px 5px', borderRadius:4 }}>-1</code> / ∞ = unlimited · <code style={{ background:'var(--bg-secondary)', padding:'1px 5px', borderRadius:4 }}>0</code> = blocked. Toggles = on/off.
            </p>
          </div>

          <div style={{ overflowX:'auto', borderRadius:16, border:'1px solid var(--border)' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr style={{ background:'var(--bg-secondary)', borderBottom:'2px solid var(--border)' }}>
                  <th style={{ padding:'14px 18px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', minWidth:220, position:'sticky', left:0, background:'var(--bg-secondary)', zIndex:2 }}>
                    Feature
                  </th>
                  {['free','pro','elite'].map(pk => (
                    <th key={pk} style={{ padding:'12px 16px', textAlign:'center', minWidth:160 }}>
                      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', textTransform:'capitalize' }}>{pk}</span>
                        <span style={{ fontSize:10, color:'var(--text-secondary)', fontWeight:400, textTransform:'none' }}>
                          {pk==='free'?'No charge':pk==='pro'?'Mid-tier':'Top-tier'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_DEFS.map((def, i) => (
                  <tr key={def.key} className="ctr" style={{ borderBottom:'1px solid var(--border)', background: i%2===0 ? 'var(--bg-primary)' : 'transparent', transition:'background .15s' }}>
                    <td style={{ padding:'12px 18px', position:'sticky', left:0, background: i%2===0 ? 'var(--bg-primary)' : 'var(--bg-secondary)', zIndex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                        <span style={{ fontSize:18 }}>{def.icon}</span>
                        <div>
                          <p style={{ fontSize:13, fontWeight:600, margin:0, color:'var(--text-primary)' }}>{def.en}</p>
                          <p style={{ fontSize:10, color:'var(--text-secondary)', margin:'2px 0 0', fontFamily:'monospace' }}>
                            {def.key} · {def.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    {['free','pro','elite'].map(pk => {
                      const val = features[pk]?.[def.key];
                      return (
                        <td key={pk} style={{ padding:'10px 16px', textAlign:'center', verticalAlign:'middle' }}>
                          {def.type === 'bool' ? (
                            <div style={{ display:'flex', justifyContent:'center' }}>
                              <Toggle size="sm" value={!!val} onChange={v => setFeat(pk, def.key, v)} />
                            </div>
                          ) : (
                            <div style={{ display:'flex', justifyContent:'center' }}>
                              <NumInput value={val === undefined ? 0 : val} onChange={v => setFeat(pk, def.key, v)} />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Sticky save bar ── */}
      {dirty && (
        <div style={{ position:'sticky', bottom:20, marginTop:20, padding:'13px 20px', borderRadius:13, background:'var(--bg-primary)', border:'1px solid var(--border)', boxShadow:'0 8px 32px rgba(0,0,0,0.15)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, animation:'fadeUp .2s ease' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <AlertTriangle size={15} color="#F59E0B" />
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>Unsaved changes</span>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>— Saving updates pricing for all users live</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={load} style={{ padding:'9px 18px', borderRadius:10, border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:13 }}>Discard</button>
            <button onClick={save} disabled={saving} style={{ display:'flex', alignItems:'center', gap:7, padding:'9px 22px', borderRadius:10, border:'none', background:'#22C55E', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700 }}>
              {saving ? <RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
