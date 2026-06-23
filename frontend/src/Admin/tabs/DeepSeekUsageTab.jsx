'use strict';
// frontend/src/Admin/tabs/DeepSeekUsageTab.jsx

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, BarChart3, Database, RefreshCw, Bell, Clock,
  Cpu, Settings, Send, Plus, Key, Eye, EyeOff, Copy,
  CheckCircle, AlertTriangle, FileText, Search, Filter,
  ChevronLeft, ChevronRight, X, Mail, PieChart, Users,
  Zap, LayoutDashboard, ShieldCheck, ArrowDown, ArrowUp,
  Info, Save, Trash2, ToggleLeft, ToggleRight,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useLangStore from '../../i18n';

// ════════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════════

const FEATURES = [
  { value: 'cv_analysis',  en: 'CV Analysis',  icon: '📄', color: '#3B82F6' },
  { value: 'cover_letter', en: 'Cover Letter', icon: '✉️', color: '#8B5CF6' },
  { value: 'interview',    en: 'AI Interview', icon: '🎤', color: '#F59E0B' },
  { value: 'career_path',  en: 'Career Path',  icon: '🗺️', color: '#22C55E' },
  { value: 'auto_apply',   en: 'Auto-Apply',   icon: '🤖', color: '#EF4444' },
  { value: 'chat',         en: 'Chat',         icon: '💬', color: '#06B6D4' },
];

const PERIODS = [
  { value: 'day',   en: 'Today' },
  { value: 'week',  en: 'Week'  },
  { value: 'month', en: 'Month' },
  { value: 'year',  en: 'Year'  },
];

// ── DeepSeek Models with full description & pricing ──────
const DEEPSEEK_MODELS = [
  {
    id:          'deepseek-v4-flash',
    name:        'DeepSeek V4 Flash',
    badge:       'Recommended',
    badgeColor:  '#22C55E',
    inputPrice:  0.14,   // per 1M tokens
    outputPrice: 0.28,
    description: 'Best for general tasks: cover letters, CV analysis, career advice, and chat. Fastest and most cost-effective.',
    useCases:    ['CV Analysis', 'Cover Letter', 'Chat', 'Career Path', 'Auto-Apply'],
    speed:       'Fastest',
    quality:     'High',
  },
  {
    id:          'deepseek-v4-pro',
    name:        'DeepSeek V4 Pro',
    badge:       'Most Powerful',
    badgeColor:  '#8B5CF6',
    inputPrice:  1.74,
    outputPrice: 3.48,
    description: 'Largest and most capable model. Best for complex reasoning, deep analysis, and advanced planning.',
    useCases:    ['Skill Gap Analysis', 'Complex Reasoning', 'Detailed Planning'],
    speed:       'Slower',
    quality:     'Highest',
  },
];

// ════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════

const fmtNum  = (n, dec = 0) => (n || 0).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
// const fmtCost = (n) => `$${(n || 0).toFixed(4)}`;
const fmtCost = (n) => {
  // Convert to number if it's a string
  const num = typeof n === 'string' ? parseFloat(n) : n;
  // Check if it's a valid number
  if (isNaN(num) || num === null || num === undefined) return '$0.00';
  return `$${num.toFixed(4)}`;
};
const fmtK    = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n || 0);
const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════════════════════

function StatusDot({ status }) {
  const c = { success: '#22C55E', failed: '#EF4444', partial: '#F59E0B' };
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: c[status] || '#6B7280', marginRight: 6, flexShrink: 0 }} />;
}

function Toggle({ value, onChange, disabled }) {
  return (
    <div
      onClick={() => !disabled && onChange(!value)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? '#22C55E' : 'var(--border)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: 3, width: 18, height: 18,
        borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s', left: value ? 23 : 3,
      }} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  TOKEN CARD — Input / Output / Total — bilingual, themed
// ════════════════════════════════════════════════════════════
function TokenCard({ usage, loading, isAr }) {
  const font = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const inp  = usage?.totalInputTokens  || 0;
  const out  = usage?.totalOutputTokens || 0;
  const tot  = usage?.totalTokens       || 0;

  // Percentage bars
  const inPct  = tot > 0 ? Math.round((inp / tot) * 100) : 0;
  const outPct = tot > 0 ? Math.round((out / tot) * 100) : 0;

  return (
    <div style={{
      background: 'var(--bg-primary)', border: '1px solid var(--border)',
      borderRadius: 18, padding: 20, position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle bg glow */}
      <div style={{ position: 'absolute', bottom: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(245,158,11,0.06)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={18} color="#F59E0B" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
              {isAr ? 'التوكنات المستهلكة' : 'Tokens Used'}
            </p>
          </div>
        </div>
        <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B', fontWeight: 700, fontFamily: 'var(--font-en)' }}>
          AI
        </div>
      </div>

      {/* Total — big number */}
      {loading ? (
        <div style={{ height: 38, width: 100, background: 'var(--bg-secondary)', borderRadius: 8, animation: 'pulse 1.5s infinite', marginBottom: 14 }} />
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)', letterSpacing: '-0.04em', lineHeight: 1 }}>
              {fmtK(tot)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 2 }}>
              {isAr ? 'توكن إجمالي' : 'total tokens'}
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--border), transparent)', marginBottom: 14 }} />

      {/* Input row */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDown size={10} color="#3B82F6" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', fontFamily: font }}>
              {isAr ? 'إدخال' : 'Input'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>
              {loading ? '—' : fmtK(inp)}
            </span>
            {!loading && tot > 0 && (
              <span style={{ fontSize: 10, color: '#3B82F6', fontFamily: 'var(--font-en)', fontWeight: 700 }}>
                {inPct}%
              </span>
            )}
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: loading ? '0%' : `${inPct}%`, background: 'linear-gradient(90deg, #3B82F6, #60A5FA)', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
      </div>

      {/* Output row */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUp size={10} color="#8B5CF6" strokeWidth={2.5} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8B5CF6', fontFamily: font }}>
              {isAr ? 'إخراج' : 'Output'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>
              {loading ? '—' : fmtK(out)}
            </span>
            {!loading && tot > 0 && (
              <span style={{ fontSize: 10, color: '#8B5CF6', fontFamily: 'var(--font-en)', fontWeight: 700 }}>
                {outPct}%
              </span>
            )}
          </div>
        </div>
        <div style={{ height: 5, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: loading ? '0%' : `${outPct}%`, background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1) 0.1s' }} />
        </div>
      </div>
    </div>
  );
}

// Model selector card
function ModelCard({ model, selected, onSelect }) {
  const isSelected = selected === model.id;
  return (
    <div
      onClick={() => onSelect(model.id)}
      style={{
        border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border)'}`,
        borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
        background: isSelected ? 'var(--bg-secondary)' : 'transparent',
        transition: 'all .15s', position: 'relative',
      }}
    >
      {/* Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: 'var(--text-primary)' }}>{model.name}</p>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 99, background: `${model.badgeColor}18`, color: model.badgeColor, fontWeight: 700 }}>{model.badge}</span>
        </div>
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? 'var(--text-primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {isSelected && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-primary)' }} />}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>{model.description}</p>

      {/* Pricing row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 7, background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.12)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#3B82F6', fontWeight: 700, marginBottom: 2 }}>INPUT / 1M tok</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#3B82F6', fontFamily: 'var(--font-en)' }}>${model.inputPrice.toFixed(2)}</div>
        </div>
        <div style={{ flex: 1, padding: '6px 8px', borderRadius: 7, background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.12)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#8B5CF6', fontWeight: 700, marginBottom: 2 }}>OUTPUT / 1M tok</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#8B5CF6', fontFamily: 'var(--font-en)' }}>${model.outputPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Use cases + speed/quality */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {model.useCases.map(u => (
          <span key={u} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{u}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>⚡ Speed: <strong style={{ color: 'var(--text-primary)' }}>{model.speed}</strong></span>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>🎯 Quality: <strong style={{ color: 'var(--text-primary)' }}>{model.quality}</strong></span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function DeepSeekUsageTab({ lang: langProp }) {
  // Read from Zustand store directly so language updates instantly on toggle
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';

  // ── Tabs & period ────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [period,    setPeriod]    = useState('month');

  // ── Dashboard data ───────────────────────────────────────
  const [loading,   setLoading]   = useState(true);
  const [dashboard, setDashboard] = useState(null);

  // ── Logs ─────────────────────────────────────────────────
  const [logs,     setLogs]     = useState([]);
  const [logsLoad, setLogsLoad] = useState(false);
  const [logPage,  setLogPage]  = useState(1);
  const [logMeta,  setLogMeta]  = useState({ total: 0, totalPages: 1 });
  const [selLog,   setSelLog]   = useState(null);
  const [filters,  setFilters]  = useState({
    startDate: '', endDate: '', feature: '', model: '', status: '', userName: '',
  });

  // ── Settings ─────────────────────────────────────────────
  const [apiSettings, setApiSettings] = useState({
    apiKey:      '',
    activeModel: 'deepseek-chat',
    rateLimit:   { maxRequestsPerMinute: 60, maxTokensPerMinute: 100000 },
    logging:     { enabled: true, logPrompts: true, logResponses: false, retentionDays: 90 },
  });
  const [alertSettings, setAlertSettings] = useState({
    enabled:          false,
    balanceThreshold: 2,
    tokenThreshold:   500000,
    requestThreshold: 1000,
    costThreshold:    5,
    alertFrequency:   'daily',
    recipients:       [],
    alertTypes:       ['low_balance', 'high_usage', 'high_cost'],
  });
  const [newEmail,   setNewEmail]   = useState('');
  const [showKey,    setShowKey]    = useState(false);
  const [savingApi,  setSavingApi]  = useState(false);
  const [savingAlert, setSavingAlert] = useState(false);
  const [sending,    setSending]    = useState(false);
  const [keyTest,    setKeyTest]    = useState(null);
  const [testingKey, setTestingKey] = useState(false);
  const [clearing,   setClearing]   = useState(false);

  // ── Fetch dashboard ──────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/usage/dashboard', { params: { period } });
      setDashboard(data.data);
      if (data.data?.alertSettings) setAlertSettings(s => ({ ...s, ...data.data.alertSettings }));
      if (data.data?.apiSettings)   setApiSettings(s => ({ ...s, ...data.data.apiSettings }));
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // ── Fetch logs ───────────────────────────────────────────
  const fetchLogs = useCallback(async (pg = 1) => {
    setLogsLoad(true);
    try {
      const params = { page: pg, limit: 50 };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate)   params.endDate   = filters.endDate;
      if (filters.feature)   params.feature   = filters.feature;
      if (filters.model)     params.model      = filters.model;
      if (filters.status)    params.status     = filters.status;
      if (filters.userName)  params.userName   = filters.userName;

      const { data } = await api.get('/usage/logs', { params });
      setLogs(data.data?.logs || []);
      setLogMeta(data.data?.pagination || { total: 0, totalPages: 1 });
    } catch {
      toast.error('Failed to load logs');
    } finally {
      setLogsLoad(false);
    }
  }, [filters]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
  useEffect(() => { if (activeTab === 'logs') fetchLogs(1); }, [activeTab]);

  // ── Save API Settings ────────────────────────────────────
  // const saveApiSettings = async () => {
  //   setSavingApi(true);
  //   try {
  //     await api.put('/usage/api-settings', apiSettings);
  //     toast.success('✅ API settings saved');
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || 'Failed to save');
  //   } finally {
  //     setSavingApi(false);
  //   }
  // };

  // بعد حفظ الإعدادات، أعد جلبها
// const saveApiSettings = async () => {
//   setSavingApi(true);
//   try {
//     await api.put('/usage/api-settings', apiSettings);
//     toast.success('✅ API settings saved');
    
//     // ← أضف هذا: أعد جلب الإعدادات المحفوظة
//     const { data } = await api.get('/usage/api-settings');
//     if (data.data) {
//       setApiSettings(prev => ({
//         ...prev,
//         ...data.data,
//         activeModel: data.data.activeModel || prev.activeModel
//       }));
//     }

//   } catch (err) {
//     toast.error(err.response?.data?.message || 'Failed to save');
//   } finally {
//     setSavingApi(false);
//   }
// };
// بعد حفظ الإعدادات، أعد جلبها
const saveApiSettings = async () => {
  setSavingApi(true);
  try {
    await api.put('/usage/api-settings', apiSettings);
    toast.success('✅ API settings saved');
    
    // أعد جلب الإعدادات المحفوظة
    const { data } = await api.get('/usage/api-settings');
    if (data.data) {
      setApiSettings(prev => ({
        ...prev,
        ...data.data,
        activeModel: data.data.activeModel || prev.activeModel
      }));
      // ✅ استخدم data.data هنا بدلاً من settings
      console.log('Active model from DB:', data.data.activeModel);
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to save');
  } finally {
    setSavingApi(false);
  }
};

  // ── Save Alert Settings ──────────────────────────────────
  const saveAlertSettings = async () => {
    setSavingAlert(true);
    try {
      await api.put('/usage/alerts/settings', alertSettings);
      toast.success('✅ Alert settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSavingAlert(false);
    }
  };

  // ── Send / Test Alert ────────────────────────────────────
  const sendAlert = async (force = false) => {
    setSending(true);
    try {
      const { data } = await api.post('/usage/alerts/check', { force });
      if (data.data?.sent) toast.success(`✅ Alert sent to: ${data.data.recipients?.join(', ')}`);
      else toast(`ℹ️ ${data.message || 'No alerts triggered'}`, { icon: 'ℹ️' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send alert');
    } finally {
      setSending(false);
    }
  };

  // ── Test API Key ─────────────────────────────────────────
  const testKey = async () => {
    if (!apiSettings.apiKey) return;
    setTestingKey(true);
    setKeyTest(null);
    try {
      const { data } = await api.post('/usage/test-api-key', { apiKey: apiSettings.apiKey });
      setKeyTest({ ok: true, msg: `✅ Valid key — ${data.data?.models?.length || 0} models available` });
    } catch (err) {
      setKeyTest({ ok: false, msg: `❌ ${err.response?.data?.message || 'Invalid key'}` });
    } finally {
      setTestingKey(false);
    }
  };

  // ── Clear old logs ───────────────────────────────────────
  const clearLogs = async () => {
    if (!window.confirm('Clear logs older than 90 days?')) return;
    setClearing(true);
    try {
      const { data } = await api.delete('/usage/logs/clear', { data: { days: 90 } });
      toast.success(`🗑️ Cleared ${data.data?.deletedCount || 0} old logs`);
      fetchLogs(1);
    } catch {
      toast.error('Failed to clear logs');
    } finally {
      setClearing(false);
    }
  };

  // ── Alert recipients ─────────────────────────────────────
  const addRecipient = () => {
    const email = newEmail.trim();
    if (!email || alertSettings.recipients.includes(email)) return;
    setAlertSettings(s => ({ ...s, recipients: [...s.recipients, email] }));
    setNewEmail('');
  };
  const removeRecipient = (e) => setAlertSettings(s => ({ ...s, recipients: s.recipients.filter(r => r !== e) }));
  const toggleAlertType = (type) => setAlertSettings(s => ({
    ...s,
    alertTypes: s.alertTypes.includes(type) ? s.alertTypes.filter(t => t !== type) : [...s.alertTypes, type],
  }));

  // ── Derived ──────────────────────────────────────────────
  const balance   = dashboard?.balance   || {};
  const usage     = dashboard?.usage     || {};
  const userUsage = dashboard?.userUsage || [];

  // ════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', fontFamily: 'var(--font-en)' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.5} }
        @keyframes fadeUp{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
        .ds-row:hover { background: var(--bg-secondary) !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Cpu size={22} color="#8B5CF6" />DeepSeek API Management
          </h1>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Balance · Tokens · Logs · Alerts</p>
        </div>
        {/* <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => sendAlert(false)} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, background: '#3B82F6', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: sending ? .7 : 1 }}>
            {sending ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
            Send Alert
          </button>
          <button onClick={() => sendAlert(true)} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            <Bell size={14} />Test Alert
          </button>
          <button onClick={fetchDashboard} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <RefreshCw size={14} />Refresh
          </button>
        </div> */}
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '2px solid var(--border)' }}>
        {[
          { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
          { id: 'logs',     icon: FileText,        label: 'Logs'     },
          { id: 'settings', icon: Settings,        label: 'Settings' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
            color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab.id ? '2px solid var(--text-primary)' : '2px solid transparent',
            marginBottom: -2, transition: 'all .15s',
          }}>
            <tab.icon size={15} />{tab.label}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════ */}
      {activeTab === 'overview' && (
        <>
          {/* Period */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {PERIODS.map(p => (
              <button key={p.value} onClick={() => setPeriod(p.value)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${period === p.value ? 'var(--text-primary)' : 'var(--border)'}`,
                background: period === p.value ? 'var(--text-primary)' : 'transparent',
                color: period === p.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
              }}>
                {p.en}
              </button>
            ))}
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14, marginBottom: 20 }}>

            {/* Balance */}
            <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: 18, padding: 20, border: '1px solid rgba(212,160,23,.3)' }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(212,160,23,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <DollarSign size={20} color="#D4A017" />
              </div>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 4px' }}>API Balance</p>
              {loading
                ? <div style={{ height: 30, width: 80, background: 'rgba(255,255,255,.1)', borderRadius: 6, animation: 'pulse 1.5s infinite', marginBottom: 10 }} />
                : <p style={{ fontSize: 26, fontWeight: 800, color: '#D4A017', margin: '0 0 10px', fontFamily: 'var(--font-en)' }}>${(balance.toppedUp || 0).toFixed(2)}</p>
              }
              <div style={{ borderTop: '1px solid rgba(212,160,23,.2)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: '#888' }}>Monthly spend</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#EF4444', fontFamily: 'var(--font-en)' }}>-${(balance.monthlyExpenses || 0).toFixed(2)}</span>
              </div>
              {(balance.toppedUp || 0) < (alertSettings.balanceThreshold || 2) && (
                <div style={{ marginTop: 10, padding: '6px 10px', borderRadius: 8, background: 'rgba(239,68,68,.15)', fontSize: 11, color: '#EF4444', fontWeight: 600 }}>
                  ⚠️ Low balance — top up recommended
                </div>
              )}
            </div>

            {/* Requests */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#3B82F615', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <BarChart3 size={20} color="#3B82F6" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Total Requests</p>
              {loading
                ? <div style={{ height: 30, width: 80, background: 'var(--bg-secondary)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                : <p style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: 'var(--text-primary)' }}>{fmtNum(usage.totalRequests)}</p>
              }
              <p style={{ fontSize: 11, color: '#EF4444', margin: '4px 0 0', fontFamily: 'var(--font-en)' }}>{usage.failedCount || 0} failed</p>
            </div>

            {/* Tokens — with Input/Output breakdown */}
            <TokenCard usage={usage} loading={loading} isAr={isAr} />

            {/* Cost */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#22C55E15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <DollarSign size={20} color="#22C55E" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Est. Cost</p>
              {loading
                ? <div style={{ height: 30, width: 80, background: 'var(--bg-secondary)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                : <p style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: '#22C55E' }}>{fmtCost(usage.totalCost)}</p>
              }
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{PERIODS.find(p => p.value === period)?.en} period</p>
            </div>

            {/* Success rate */}
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#8B5CF615', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <ShieldCheck size={20} color="#8B5CF6" />
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px' }}>Success Rate</p>
              {loading
                ? <div style={{ height: 30, width: 80, background: 'var(--bg-secondary)', borderRadius: 6, animation: 'pulse 1.5s infinite' }} />
                : <p style={{ fontSize: 26, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: 'var(--text-primary)' }}>{usage.successRate || 100}%</p>
              }
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{fmtNum(usage.totalRequests)} total</p>
            </div>
          </div>

          {/* Feature breakdown */}
          {!loading && usage.featureBreakdown && (
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <PieChart size={18} color="var(--text-secondary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Usage Breakdown by Feature</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
                {FEATURES.map(f => {
                  const s = usage.featureBreakdown[f.value] || { count: 0, tokens: 0, cost: 0, percentage: 0 };
                  return (
                    <div key={f.value} style={{ padding: '14px 16px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{f.icon}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{f.en}</span>
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{s.count} req</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, marginBottom: 8, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${s.percentage || 0}%`, background: f.color, borderRadius: 3, transition: 'width .5s ease' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)' }}>
                        <span style={{ fontFamily: 'var(--font-en)' }}>{fmtK(s.tokens)} tokens ({s.percentage || 0}%)</span>
                        <span style={{ color: f.color, fontWeight: 700, fontFamily: 'var(--font-en)' }}>{fmtCost(s.cost)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User usage */}
          {!loading && userUsage.length > 0 && (
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Users size={18} color="var(--text-secondary)" />
                <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Usage by User</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['User', 'Requests', 'Input Tok', 'Output Tok', 'Total Tok', 'Cost', 'Plan'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: h === 'User' ? 'left' : 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userUsage.map((u, i) => (
                      <tr key={u.userId || i} className="ds-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                              {u.user?.fullName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{u.user?.fullName || '—'}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{u.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 13 }}>{fmtNum(u.requestCount)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 13, color: '#3B82F6' }}>{fmtK(u.inputTokens)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 13, color: '#8B5CF6' }}>{fmtK(u.outputTokens)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 13, fontWeight: 700 }}>{fmtK(u.totalTokens)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 13, color: '#22C55E', fontWeight: 700 }}>{fmtCost(u.totalCost)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: u.user?.planKey === 'elite' ? 'rgba(245,158,11,.1)' : u.user?.planKey === 'pro' ? 'rgba(139,92,246,.1)' : 'rgba(107,114,128,.1)', color: u.user?.planKey === 'elite' ? '#F59E0B' : u.user?.planKey === 'pro' ? '#8B5CF6' : '#6B7280', fontWeight: 700 }}>
                            {u.user?.planKey || 'free'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <a href="https://platform.deepseek.com/topup" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: '#D4A017', color: '#000', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                💰 Top Up Balance
              </a>
              <a href="https://platform.deepseek.com/usage" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                📊 View on DeepSeek
              </a>
            </div>
            {dashboard?.timestamp && (
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} /> Updated: {fmtDate(dashboard.timestamp)}
              </span>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          LOGS TAB
      ════════════════════════════════════════════════ */}
      {activeTab === 'logs' && (
        <>
          {/* Filters */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Filter size={14} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Search Filters</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={clearLogs} disabled={clearing} style={{ fontSize: 12, color: '#EF4444', background: 'none', border: '1px solid rgba(239,68,68,.3)', borderRadius: 7, padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Trash2 size={11} />{clearing ? 'Clearing...' : 'Clear Old (90d)'}
                </button>
                <button onClick={() => { setFilters({ startDate: '', endDate: '', feature: '', model: '', status: '', userName: '' }); }} style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Clear filters
                </button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(145px,1fr))', gap: 10 }}>
              {/* User name search — NEW */}
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search by user name or email..."
                  value={filters.userName}
                  onChange={e => setFilters(s => ({ ...s, userName: e.target.value }))}
                  style={{ width: '100%', padding: '8px 10px 8px 32px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12, boxSizing: 'border-box' }}
                />
              </div>
              <input type="date" value={filters.startDate} onChange={e => setFilters(s => ({ ...s, startDate: e.target.value }))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 }} />
              <input type="date" value={filters.endDate}   onChange={e => setFilters(s => ({ ...s, endDate:   e.target.value }))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 }} />
              <select value={filters.feature} onChange={e => setFilters(s => ({ ...s, feature: e.target.value }))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 }}>
                <option value="">All features</option>
                {FEATURES.map(f => <option key={f.value} value={f.value}>{f.icon} {f.en}</option>)}
              </select>
              <select value={filters.model} onChange={e => setFilters(s => ({ ...s, model: e.target.value }))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 }}>
                <option value="">All models</option>
                {DEEPSEEK_MODELS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <select value={filters.status} onChange={e => setFilters(s => ({ ...s, status: e.target.value }))} style={{ padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 }}>
                <option value="">All status</option>
                <option value="success">✅ Success</option>
                <option value="failed">❌ Failed</option>
                <option value="partial">⚠️ Partial</option>
              </select>
              <button onClick={() => { setLogPage(1); fetchLogs(1); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'var(--text-primary)', border: 'none', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                <Search size={13} />Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Usage Logs</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{fmtNum(logMeta.total)} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'User', 'Feature', 'Model', 'Input Tok', 'Output Tok', 'Total Tok', 'Cost', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 10px', textAlign: ['Input Tok','Output Tok','Total Tok','Cost'].includes(h) ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logsLoad ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40 }}>
                      <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
                    </td></tr>
                  ) : logs.length === 0 ? (
                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: 52, color: 'var(--text-secondary)' }}>
                      <Database size={30} style={{ margin: '0 auto 10px', opacity: .2 }} />
                      <p style={{ margin: 0, fontSize: 13 }}>No logs found</p>
                    </td></tr>
                  ) : logs.map(log => {
                    const feat = FEATURES.find(f => f.value === log.feature);
                    return (
                      <tr key={log.id} className="ds-row" style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}>
                        <td style={{ padding: '10px 10px', fontSize: 12, whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{fmtDate(log.timestamp)}</td>
                        <td style={{ padding: '10px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  {log.user?.avatarUrl ? (
    <img src={log.user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  ) : (
    <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--bg-primary)' }}>
      {log.user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
    </span>
  )}
</div>
                            
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{log.user?.fullName || log.userName || '—'}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{log.user?.email || log.userEmail || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${feat?.color || '#6B7280'}15`, color: feat?.color || '#6B7280', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {feat?.icon} {feat?.en || log.feature}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px', fontSize: 11 }}>
                          <span style={{ padding: '2px 7px', background: 'var(--bg-secondary)', borderRadius: 5, fontFamily: 'var(--font-en)', whiteSpace: 'nowrap' }}>{log.model}</span>
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 12, color: '#3B82F6', fontWeight: 600 }}>{fmtNum(log.inputTokens)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 12, color: '#8B5CF6', fontWeight: 600 }}>{fmtNum(log.outputTokens)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 12, fontWeight: 700 }}>{fmtNum(log.totalTokens)}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'right', fontFamily: 'var(--font-en)', fontSize: 12, color: '#22C55E', fontWeight: 700 }}>{fmtCost(log.estimatedCost)}</td>
                        <td style={{ padding: '10px 10px', whiteSpace: 'nowrap' }}>
                          <StatusDot status={log.status} />
                          <span style={{ fontSize: 11 }}>{log.status}</span>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <button onClick={() => setSelLog(log)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 6 }}>
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logMeta.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderTop: '1px solid var(--border)' }}>
                <button onClick={() => { const p = Math.max(1, logPage - 1); setLogPage(p); fetchLogs(p); }} disabled={logPage === 1} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: logPage === 1 ? 'not-allowed' : 'pointer', opacity: logPage === 1 ? .5 : 1 }}>
                  <ChevronLeft size={14} />
                </button>
                <span style={{ fontSize: 13, fontFamily: 'var(--font-en)' }}>{logPage} / {logMeta.totalPages}</span>
                <button onClick={() => { const p = Math.min(logMeta.totalPages, logPage + 1); setLogPage(p); fetchLogs(p); }} disabled={logPage === logMeta.totalPages} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: logPage === logMeta.totalPages ? 'not-allowed' : 'pointer', opacity: logPage === logMeta.totalPages ? .5 : 1 }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════
          SETTINGS TAB
      ════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(420px,1fr))', gap: 20 }}>

          {/* ── API Settings ── */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <Key size={18} color="#8B5CF6" />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>API Settings</h3>
            </div>

            {/* API Key */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>API Key</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-secondary)' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiSettings.apiKey || ''}
                    onChange={e => setApiSettings(s => ({ ...s, apiKey: e.target.value }))}
                    placeholder="sk-..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'monospace' }}
                  />
                  <button onClick={() => setShowKey(!showKey)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 }}>
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(apiSettings.apiKey); toast.success('Copied!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 }}>
                    <Copy size={14} />
                  </button>
                </div>
                <button onClick={testKey} disabled={testingKey || !apiSettings.apiKey} style={{ padding: '9px 16px', borderRadius: 10, background: '#3B82F6', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, opacity: !apiSettings.apiKey ? .5 : 1 }}>
                  {testingKey ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={13} />}
                  Test
                </button>
              </div>
              {keyTest && (
                <p style={{ fontSize: 12, marginTop: 7, color: keyTest.ok ? '#22C55E' : '#EF4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {keyTest.ok ? <CheckCircle size={12} /> : <AlertTriangle size={12} />} {keyTest.msg}
                </p>
              )}
            </div>

            {/* Model selector — full cards */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>
                Active Model <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--text-secondary)' }}>— click to change</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {DEEPSEEK_MODELS.map(model => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    selected={apiSettings.activeModel}
                    onSelect={id => setApiSettings(s => ({ ...s, activeModel: id }))}
                  />
                ))}
              </div>
            </div>

            {/* Rate Limits */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Rate Limits</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <input type="number" value={apiSettings.rateLimit?.maxRequestsPerMinute || 60} onChange={e => setApiSettings(s => ({ ...s, rateLimit: { ...s.rateLimit, maxRequestsPerMinute: +e.target.value } }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Requests / minute</p>
                </div>
                <div>
                  <input type="number" value={apiSettings.rateLimit?.maxTokensPerMinute || 100000} onChange={e => setApiSettings(s => ({ ...s, rateLimit: { ...s.rateLimit, maxTokensPerMinute: +e.target.value } }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '4px 0 0' }}>Tokens / minute</p>
                </div>
              </div>
            </div>

            {/* Logging */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 10 }}>Logging</label>
              {[
                { key: 'enabled',      label: 'Enable Logging', desc: 'Record all API calls to the logs table' },
                { key: 'logPrompts',   label: 'Log Prompts',    desc: 'Store prompt previews (first 500 chars)' },
                { key: 'logResponses', label: 'Log Responses',  desc: 'Store AI response text (uses more storage)' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{item.desc}</p>
                  </div>
                  <Toggle value={!!apiSettings.logging?.[item.key]} onChange={v => setApiSettings(s => ({ ...s, logging: { ...s.logging, [item.key]: v } }))} />
                </div>
              ))}
              <div style={{ marginTop: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Log Retention (days)</label>
                <input type="number" value={apiSettings.logging?.retentionDays || 90} onChange={e => setApiSettings(s => ({ ...s, logging: { ...s.logging, retentionDays: +e.target.value } }))} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            </div>

            <button onClick={saveApiSettings} disabled={savingApi} style={{ width: '100%', padding: 13, borderRadius: 11, background: 'var(--text-primary)', border: 'none', color: 'var(--bg-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: savingApi ? .7 : 1 }}>
              <Save size={15} />{savingApi ? 'Saving...' : 'Save API Settings'}
            </button>
          </div>

          {/* ── Alert Settings ── */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 22, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <Bell size={18} color="#F59E0B" />
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Alert Settings</h3>
            </div>

            {/* Enable toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '12px 14px', background: alertSettings.enabled ? 'rgba(34,197,94,.06)' : 'var(--bg-secondary)', borderRadius: 12, border: `1px solid ${alertSettings.enabled ? 'rgba(34,197,94,.25)' : 'var(--border)'}`, transition: 'all .2s' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Enable Alerts</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                  {alertSettings.enabled ? '🟢 Alerts are active — will send emails when thresholds are exceeded' : '⚫ Alerts are disabled'}
                </p>
              </div>
              <Toggle value={alertSettings.enabled} onChange={v => setAlertSettings(s => ({ ...s, enabled: v }))} />
            </div>

            {/* Thresholds */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Thresholds</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'balanceThreshold', label: 'Balance ($)', icon: '💰', desc: 'Alert when balance drops below' },
                  { key: 'tokenThreshold',   label: 'Tokens',      icon: '⚡', desc: 'Alert when tokens exceed' },
                  { key: 'requestThreshold', label: 'Requests',    icon: '📊', desc: 'Alert when requests exceed' },
                  { key: 'costThreshold',    label: 'Cost ($)',     icon: '💸', desc: 'Alert when cost exceeds' },
                ].map(f => (
                  <div key={f.key} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>{f.icon} {f.label}</label>
                    <input
                      type="number"
                      value={alertSettings[f.key] || 0}
                      onChange={e => setAlertSettings(s => ({ ...s, [f.key]: +e.target.value }))}
                      style={{ width: '100%', padding: '6px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, boxSizing: 'border-box' }}
                    />
                    <p style={{ fontSize: 9, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Alert Frequency</label>
              <select
                value={alertSettings.alertFrequency}
                onChange={e => setAlertSettings(s => ({ ...s, alertFrequency: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
              >
                <option value="hourly">Every hour (max 1 alert/hour)</option>
                <option value="daily">Daily (max 1 alert/day)</option>
                <option value="weekly">Weekly (max 1 alert/week)</option>
              </select>
            </div>

            {/* Alert types */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Alert Types</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { value: 'low_balance', label: 'Low Balance', color: '#EF4444' },
                  { value: 'high_usage',  label: 'High Usage',  color: '#F59E0B' },
                  { value: 'high_cost',   label: 'High Cost',   color: '#EF4444' },
                ].map(t => {
                  const active = alertSettings.alertTypes?.includes(t.value);
                  return (
                    <button key={t.value} onClick={() => toggleAlertType(t.value)} style={{
                      padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .15s',
                      background: active ? t.color : 'transparent',
                      border: `1.5px solid ${active ? t.color : 'var(--border)'}`,
                      color: active ? '#fff' : 'var(--text-secondary)',
                    }}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recipients */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Email Recipients</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addRecipient(); }}
                  placeholder="admin@example.com"
                  style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 }}
                />
                <button onClick={addRecipient} style={{ padding: '8px 16px', borderRadius: 8, background: '#3B82F6', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
                  <Plus size={14} />Add
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {(alertSettings.recipients || []).map(email => (
                  <div key={email} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: 'var(--bg-secondary)', borderRadius: 20, fontSize: 12, border: '1px solid var(--border)' }}>
                    <Mail size={11} />{email}
                    <button onClick={() => removeRecipient(email)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-secondary)' }}><X size={11} /></button>
                  </div>
                ))}
                {!(alertSettings.recipients || []).length && (
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>No recipients — add an email above</p>
                )}
              </div>
            </div>

            {alertSettings.lastAlertSentAt && (
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} />Last alert sent: {fmtDate(alertSettings.lastAlertSentAt)}
              </p>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={saveAlertSettings} disabled={savingAlert} style={{ flex: 2, padding: 13, borderRadius: 11, background: 'var(--text-primary)', border: 'none', color: 'var(--bg-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: savingAlert ? .7 : 1 }}>
                <Save size={14} />{savingAlert ? 'Saving...' : 'Save Alert Settings'}
              </button>
              <button onClick={() => sendAlert(true)} disabled={sending} style={{ flex: 1, padding: 13, borderRadius: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Send size={13} />Test
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Log Detail Modal ── */}
      {selLog && (
        <div onClick={() => setSelLog(null)} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 580, width: '100%', maxHeight: '85vh', background: 'var(--bg-primary)', borderRadius: 20, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', animation: 'fadeUp .2s ease' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
              <span style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} />Log Details</span>
              <button onClick={() => setSelLog(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
              {/* Token detail */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.2)', textAlign: 'center' }}>
                  <ArrowDown size={12} color="#3B82F6" style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: 10, color: '#3B82F6', fontWeight: 700, margin: '0 0 4px' }}>INPUT</p>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: '#3B82F6' }}>{fmtNum(selLog.inputTokens)}</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', textAlign: 'center' }}>
                  <ArrowUp size={12} color="#8B5CF6" style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: 10, color: '#8B5CF6', fontWeight: 700, margin: '0 0 4px' }}>OUTPUT</p>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: '#8B5CF6' }}>{fmtNum(selLog.outputTokens)}</p>
                </div>
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }}>
                  <Zap size={12} color="#F59E0B" style={{ margin: '0 auto 4px' }} />
                  <p style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700, margin: '0 0 4px' }}>TOTAL</p>
                  <p style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: 'var(--font-en)', color: 'var(--text-primary)' }}>{fmtNum(selLog.totalTokens)}</p>
                </div>
              </div>

              {[
                ['Date',     fmtDate(selLog.timestamp)],
                ['User',     `${selLog.user?.fullName || selLog.userName || '—'} (${selLog.user?.email || selLog.userEmail || '—'})`],
                ['Feature',  selLog.feature?.replace(/_/g, ' ')],
                ['Model',    selLog.model],
                ['Cost',     null],
                ['Status',   null],
                ['Duration', selLog.metadata?.duration ? `${selLog.metadata.duration}ms` : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>{label}</p>
                  {label === 'Cost'
                    ? <p style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#22C55E', fontFamily: 'var(--font-en)' }}>{fmtCost(selLog.estimatedCost)}</p>
                    : label === 'Status'
                    ? <p style={{ fontSize: 13, margin: 0, display: 'flex', alignItems: 'center' }}><StatusDot status={selLog.status} />{selLog.status}</p>
                    : <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{val}</p>
                  }
                </div>
              ))}
              {selLog.promptPreview && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '.05em' }}>Prompt Preview</p>
                  <div style={{ padding: 12, background: 'var(--bg-secondary)', borderRadius: 8, fontSize: 12, maxHeight: 140, overflowY: 'auto', border: '1px solid var(--border)', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {selLog.promptPreview}
                  </div>
                </div>
              )}
              {selLog.errorMessage && (
                <div>
                  <p style={{ fontSize: 10, color: '#EF4444', margin: '0 0 4px', textTransform: 'uppercase' }}>Error</p>
                  <div style={{ padding: 12, background: 'rgba(239,68,68,.06)', borderRadius: 8, fontSize: 12, border: '1px solid rgba(239,68,68,.2)', color: '#EF4444' }}>{selLog.errorMessage}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
