'use strict';
// frontend/src/Admin/tabs/AIFeaturesTab.jsx
// ════════════════════════════════════════════════════════════
// لوحة تحكم كاملة لكل ميزة AI على حدة:
//   - تفعيل/تعطيل الميزة
//   - System Prompt قابل للتعديل
//   - User Prompt Template
//   - Max Tokens, Temperature, Model
//   - Daily limits per plan (Free/Pro/Elite)
//   - صلاحيات الوصول per plan
// ════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react';
import {
  Save, RefreshCw, RotateCcw, ChevronDown, ChevronRight,
  Zap, Settings, Users, Lock, Unlock, AlertTriangle,
  CheckCircle, Copy, Eye, EyeOff, Info, ToggleLeft,
  Sliders, FileText, Crown, Star,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

// ════════════════════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════════════════════

const FEATURE_META = {
  cv_analysis:  { icon: '📄', label: 'CV Analysis',    color: '#3B82F6', desc: 'ATS analysis of uploaded CVs' },
  cover_letter: { icon: '✉️', label: 'Cover Letter',   color: '#8B5CF6', desc: 'Personalized cover letter generation' },
  interview:    { icon: '🎤', label: 'AI Interview',   color: '#F59E0B', desc: 'Question generation & answer scoring' },
  career_path:  { icon: '🗺️', label: 'Career Path',   color: '#22C55E', desc: 'Full career roadmap generation' },
  auto_apply:   { icon: '🤖', label: 'Auto-Apply',     color: '#EF4444', desc: 'Cover letter for auto-apply jobs' },
  chat:         { icon: '💬', label: 'Career Chat',    color: '#06B6D4', desc: 'Conversational career assistant' },
  skill_gap:    { icon: '📊', label: 'Skill Gap',      color: '#F97316', desc: 'Skill gap analysis & learning paths' },
};

const MODELS = [
  { id: 'deepseek-chat',     name: 'DeepSeek Chat V3',    badge: 'Recommended', badgeColor: '#22C55E', costIn: 0.27, costOut: 1.10 },
  { id: 'deepseek-reasoner', name: 'DeepSeek R1',         badge: 'Powerful',    badgeColor: '#8B5CF6', costIn: 0.55, costOut: 2.19 },
  { id: 'deepseek-chat-v2.5',name: 'DeepSeek V2.5',       badge: 'Economy',     badgeColor: '#F59E0B', costIn: 0.14, costOut: 0.28 },
];

const PLAN_COLORS = { free: '#6B7280', pro: '#8B5CF6', elite: '#F59E0B' };

function fmtCost(n) { return `$${(n || 0).toFixed(2)}`; }

// ════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════════════════════

function Toggle({ value, onChange, size = 'md' }) {
  const w = size === 'sm' ? 36 : 44;
  const h = size === 'sm' ? 20 : 24;
  const d = size === 'sm' ? 14 : 18;
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: w, height: h, borderRadius: h, cursor: 'pointer',
        background: value ? '#22C55E' : 'var(--border)',
        position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: (h - d) / 2,
        width: d, height: d, borderRadius: '50%', background: '#fff',
        transition: 'left .2s',
        left: value ? w - d - (h - d) / 2 : (h - d) / 2,
      }} />
    </div>
  );
}

function Slider({ value, onChange, min = 0, max = 100, step = 1, label, unit = '' }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-en)', color: 'var(--text-primary)' }}>
          {value.toLocaleString()}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: '100%', accentColor: 'var(--text-primary)', cursor: 'pointer', height: 4 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{min.toLocaleString()}{unit}</span>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{max.toLocaleString()}{unit}</span>
      </div>
    </div>
  );
}

// ── Plan limit row ──────────────────────────────────────
function PlanRow({ plan, config, onChange }) {
  const enabledKey = `${plan}Users`;
  const limitKey   = `dailyLimit${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
  const color      = PLAN_COLORS[plan];
  const PIcon      = plan === 'elite' ? Zap : plan === 'pro' ? Crown : Star;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 8 }}>
      {/* Plan badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 80 }}>
        <PIcon size={14} color={color} />
        <span style={{ fontSize: 13, fontWeight: 700, color, textTransform: 'capitalize' }}>{plan}</span>
      </div>

      {/* Enable access */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <Toggle
          size="sm"
          value={!!config[enabledKey]}
          onChange={v => onChange(enabledKey, v)}
        />
        <span style={{ fontSize: 12, color: config[enabledKey] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
          {config[enabledKey] ? 'Access enabled' : 'No access'}
        </span>
      </div>

      {/* Daily limit */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Daily limit:</span>
        <input
          type="number"
          min={0}
          value={config[limitKey] || 0}
          onChange={e => onChange(limitKey, +e.target.value)}
          disabled={!config[enabledKey]}
          style={{
            width: 70, padding: '5px 8px', borderRadius: 7,
            border: '1px solid var(--border)', background: 'var(--bg-primary)',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-en)',
            opacity: config[enabledKey] ? 1 : 0.4,
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>/ day</span>
        {config[limitKey] === 0 && config[enabledKey] && (
          <span style={{ fontSize: 10, color: '#22C55E', fontWeight: 700 }}>∞ Unlimited</span>
        )}
      </div>
    </div>
  );
}

// ── Single feature card ─────────────────────────────────
function FeatureCard({ featureKey, config, onSave, onReset, saving, resetting }) {
  const meta      = FEATURE_META[featureKey] || {};
  const [expanded, setExpanded]     = useState(false);
  const [local,    setLocal]        = useState({ ...config });
  const [tab,      setTab]          = useState('general'); // general | prompts | limits
  const [showSys,  setShowSys]      = useState(true);
  const isDirty = JSON.stringify(local) !== JSON.stringify(config);

  // sync if parent changes (after save/reset)
  useEffect(() => { setLocal({ ...config }); }, [config]);

  const set = (key, val) => setLocal(s => ({ ...s, [key]: val }));
  const selectedModel = MODELS.find(m => m.id === local.model) || MODELS[0];

  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: `1px solid ${expanded ? meta.color + '50' : 'var(--border)'}`,
      borderRadius: 16, overflow: 'hidden',
      transition: 'border-color .2s',
      boxShadow: expanded ? `0 0 0 1px ${meta.color}20` : 'none',
    }}>
      {/* ── Header ── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, userSelect: 'none' }}
      >
        {/* Icon + toggle */}
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${meta.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
          {meta.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{meta.label}</span>
            {/* Enabled badge */}
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 99, fontWeight: 700,
              background: local.enabled ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.1)',
              color:      local.enabled ? '#22C55E'             : '#EF4444',
            }}>
              {local.enabled ? 'Enabled' : 'Disabled'}
            </span>
            {isDirty && <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(245,158,11,.12)', color: '#F59E0B', fontWeight: 700 }}>● Unsaved</span>}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{meta.desc}</span>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', display: 'none', '@media(minWidth:768px)': { display: 'block' } }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-en)', fontWeight: 700, color: 'var(--text-primary)' }}>{(local.maxTokens || 0).toLocaleString()}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>max tok</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-en)', fontWeight: 700, color: 'var(--text-primary)' }}>{local.temperature}</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>temp</div>
          </div>

          {/* Enable toggle — stops propagation */}
          <div onClick={e => { e.stopPropagation(); set('enabled', !local.enabled); }} style={{ padding: 4 }}>
            <Toggle value={!!local.enabled} onChange={v => set('enabled', v)} />
          </div>

          {expanded ? <ChevronDown size={16} color="var(--text-secondary)" /> : <ChevronRight size={16} color="var(--text-secondary)" />}
        </div>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', animation: 'fadeUp .15s ease' }}>

          {/* Sub-tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            {[
              { id: 'general', label: '⚙️ General',  },
              { id: 'prompts', label: '📝 Prompts',   },
              { id: 'limits',  label: '🔒 Access & Limits', },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
                fontSize: 12, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderBottom: tab === t.id ? `2px solid ${meta.color}` : '2px solid transparent',
                transition: 'all .15s',
              }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: '20px 20px' }}>

            {/* ── GENERAL TAB ── */}
            {tab === 'general' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                <div>
                  {/* Enable toggle large */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '12px 14px', borderRadius: 10, background: local.enabled ? 'rgba(34,197,94,.05)' : 'rgba(239,68,68,.04)', border: `1px solid ${local.enabled ? 'rgba(34,197,94,.25)' : 'rgba(239,68,68,.2)'}` }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px' }}>Feature Status</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                        {local.enabled ? '🟢 This feature is active and available to users' : '🔴 Feature is disabled — all plans blocked'}
                      </p>
                    </div>
                    <Toggle value={!!local.enabled} onChange={v => set('enabled', v)} />
                  </div>

                  {/* Model */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>AI Model</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {MODELS.map(m => (
                        <div key={m.id} onClick={() => set('model', m.id)} style={{
                          padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                          border: `2px solid ${local.model === m.id ? meta.color : 'var(--border)'}`,
                          background: local.model === m.id ? `${meta.color}08` : 'var(--bg-secondary)',
                          transition: 'all .15s',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${local.model === m.id ? meta.color : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {local.model === m.id && <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                              <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: `${m.badgeColor}18`, color: m.badgeColor, fontWeight: 700 }}>{m.badge}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                              <span style={{ color: '#3B82F6' }}>in: ${m.costIn}/1M</span>
                              <span style={{ color: '#8B5CF6' }}>out: ${m.costOut}/1M</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {/* Max Tokens slider */}
                  <div style={{ marginBottom: 24 }}>
                    <Slider
                      label="Max Output Tokens"
                      value={local.maxTokens || 1000}
                      onChange={v => set('maxTokens', v)}
                      min={100} max={4000} step={50}
                    />
                    <div style={{ marginTop: 8, padding: '7px 10px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        Est. cost per call: {' '}
                        <strong style={{ color: '#8B5CF6', fontFamily: 'var(--font-en)' }}>
                          ~${((local.maxTokens || 1000) / 1000000 * (selectedModel?.costOut || 1.10)).toFixed(5)}
                        </strong>
                        {' '} (output only)
                      </span>
                    </div>
                  </div>

                  {/* Temperature slider */}
                  <div style={{ marginBottom: 24 }}>
                    <Slider
                      label="Temperature"
                      value={local.temperature || 0.3}
                      onChange={v => set('temperature', v)}
                      min={0} max={1} step={0.05}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-secondary)' }}>
                      <span>🎯 Precise & deterministic</span>
                      <span>🎨 Creative & varied</span>
                    </div>
                    <div style={{ marginTop: 8, padding: '7px 10px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {local.temperature <= 0.2 ? '✅ Best for JSON output / structured data' :
                       local.temperature <= 0.5 ? '✅ Good balance for professional writing' :
                       local.temperature <= 0.7 ? '⚡ Creative but may drift from format' :
                       '⚠️ High creativity — may produce unpredictable output'}
                    </div>
                  </div>

                  {/* JSON mode */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px' }}>JSON Mode</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>Force structured JSON output from AI</p>
                    </div>
                    <Toggle size="sm" value={!!local.jsonMode} onChange={v => set('jsonMode', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── PROMPTS TAB ── */}
            {tab === 'prompts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* System Prompt */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Settings size={14} />System Prompt
                    </label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {(local.systemPrompt || '').length} chars
                      </span>
                      <button
                        onClick={() => navigator.clipboard.writeText(local.systemPrompt || '').then(() => toast.success('Copied!'))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 }}
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(99,102,241,.06)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(99,102,241,.2)', borderBottom: 'none' }}>
                    <span style={{ fontSize: 11, color: '#6366F1', fontWeight: 600 }}>
                      🤖 This is the role/persona given to the AI before every request
                    </span>
                  </div>
                  <textarea
                    value={local.systemPrompt || ''}
                    onChange={e => set('systemPrompt', e.target.value)}
                    rows={8}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '0 0 10px 10px',
                      border: '1px solid rgba(99,102,241,.2)', borderTop: 'none',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      fontSize: 13, fontFamily: 'monospace', resize: 'vertical',
                      lineHeight: 1.6, boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* User Prompt Template */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 7 }}>
                      <FileText size={14} />User Prompt Template
                    </label>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      {(local.userPromptTemplate || '').length} chars
                    </span>
                  </div>
                  <div style={{ padding: '8px 12px', background: 'rgba(245,158,11,.06)', borderRadius: '8px 8px 0 0', border: '1px solid rgba(245,158,11,.2)', borderBottom: 'none' }}>
                    <span style={{ fontSize: 11, color: '#F59E0B', fontWeight: 600 }}>
                      📝 Template for user message — use {`{{variable}}`} placeholders (e.g. {`{{cvText}}`}, {`{{jobTitle}}`})
                    </span>
                  </div>
                  <textarea
                    value={local.userPromptTemplate || ''}
                    onChange={e => set('userPromptTemplate', e.target.value)}
                    rows={8}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '0 0 10px 10px',
                      border: '1px solid rgba(245,158,11,.2)', borderTop: 'none',
                      background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                      fontSize: 13, fontFamily: 'monospace', resize: 'vertical',
                      lineHeight: 1.6, boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Available variables hint */}
                <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-secondary)' }}>📌 Available template variables:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {['cvText', 'jobTitle', 'jobDescription', 'companyName', 'language', 'targetRole', 'currentSkills', 'yearsExperience', 'question', 'answer', 'message', 'count', 'difficulty'].map(v => (
                      <code key={v} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: '#6366F1' }}>
                        {`{{${v}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── LIMITS TAB ── */}
            {tab === 'limits' && (
              <div>
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, background: 'rgba(59,130,246,.06)', border: '1px solid rgba(59,130,246,.2)' }}>
                  <p style={{ fontSize: 12, color: '#3B82F6', fontWeight: 600, margin: 0 }}>
                    ℹ️ Set 0 for unlimited. Disable access to block the feature completely for that plan.
                  </p>
                </div>

                {['free', 'pro', 'elite'].map(plan => (
                  <PlanRow
                    key={plan}
                    plan={plan}
                    config={local}
                    onChange={(key, val) => set(key, val)}
                  />
                ))}

                {/* Cost estimate */}
                <div style={{ marginTop: 16, padding: '14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, fontWeight: 700, margin: '0 0 10px', color: 'var(--text-secondary)' }}>
                    💰 Daily cost estimate (if all limits hit):
                  </p>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {['free', 'pro', 'elite'].map(plan => {
                      const lkey = `dailyLimit${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
                      const limit = local[lkey] || 0;
                      const estCost = limit * ((local.maxTokens || 1000) / 1000000) * (selectedModel?.costOut || 1.10);
                      return (
                        <div key={plan} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, color: PLAN_COLORS[plan], fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' }}>{plan}</div>
                          <div style={{ fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-en)', color: 'var(--text-primary)' }}>
                            {limit === 0 ? '∞' : `~$${(estCost).toFixed(4)}`}
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{limit === 0 ? 'unlimited' : `${limit} calls`}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Footer actions ── */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)' }}>
            <button
              onClick={() => onReset(featureKey)}
              disabled={resetting === featureKey}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {resetting === featureKey
                ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                : <RotateCcw size={13} />}
              Reset to defaults
            </button>

            <div style={{ display: 'flex', gap: 8 }}>
              {isDirty && (
                <button
                  onClick={() => setLocal({ ...config })}
                  style={{ padding: '8px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12 }}
                >
                  Discard
                </button>
              )}
              <button
                onClick={() => onSave(featureKey, local)}
                disabled={saving === featureKey || !isDirty}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 20px', borderRadius: 9, border: 'none',
                  background: isDirty ? meta.color : 'var(--border)',
                  color: isDirty ? '#fff' : 'var(--text-secondary)',
                  cursor: isDirty ? 'pointer' : 'not-allowed',
                  fontSize: 13, fontWeight: 700, transition: 'all .15s',
                }}
              >
                {saving === featureKey
                  ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Save size={13} />}
                {saving === featureKey ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function AIFeaturesTab({ lang }) {
  const [features,   setFeatures]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(null); // featureKey
  const [resetting,  setResetting]  = useState(null);
  const [savingAll,  setSavingAll]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/ai-features');
      setFeatures(data.data || {});
    } catch {
      toast.error('Failed to load AI feature settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (featureKey, localData) => {
    setSaving(featureKey);
    try {
      const { data } = await api.put(`/ai-features/${featureKey}`, localData);
      setFeatures(s => ({ ...s, [featureKey]: data.data }));
      toast.success(`✅ "${FEATURE_META[featureKey]?.label}" settings saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const handleReset = async (featureKey) => {
    if (!window.confirm(`Reset "${FEATURE_META[featureKey]?.label}" to default settings?`)) return;
    setResetting(featureKey);
    try {
      const { data } = await api.post(`/ai-features/${featureKey}/reset`);
      setFeatures(s => ({ ...s, [featureKey]: data.data }));
      toast.success(`↩️ "${FEATURE_META[featureKey]?.label}" reset to defaults`);
    } catch {
      toast.error('Failed to reset');
    } finally {
      setResetting(null);
    }
  };

  const handleSaveAll = async () => {
    setSavingAll(true);
    try {
      await api.put('/ai-features', features);
      toast.success('✅ All feature settings saved');
    } catch {
      toast.error('Failed to save all settings');
    } finally {
      setSavingAll(false);
    }
  };

  const enabledCount  = Object.values(features).filter(f => f.enabled).length;
  const disabledCount = Object.keys(features).length - enabledCount;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-en)' }}>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none} }
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Sliders size={22} color="#8B5CF6" />AI Features Control
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Configure prompts, tokens, models, and access for each AI feature individually
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(34,197,94,.1)', color: '#22C55E', fontWeight: 700 }}>
              ✅ {enabledCount} enabled
            </span>
            {disabledCount > 0 && (
              <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20, background: 'rgba(239,68,68,.1)', color: '#EF4444', fontWeight: 700 }}>
                ❌ {disabledCount} disabled
              </span>
            )}
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13 }}>
            <RefreshCw size={14} />Refresh
          </button>
          <button onClick={handleSaveAll} disabled={savingAll} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: 'var(--text-primary)', border: 'none', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: savingAll ? .7 : 1 }}>
            {savingAll ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={14} />}
            Save All
          </button>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.2)', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Info size={16} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#6366F1', margin: '0 0 3px' }}>How this works</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
            Changes to prompts and settings are saved to the database and used immediately for all new AI requests.
            The AI service reads these settings dynamically — no code deployment needed.
          </p>
        </div>
      </div>

      {/* ── Feature cards ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 76, borderRadius: 16, background: 'var(--bg-secondary)', animation: 'pulse 1.5s infinite', border: '1px solid var(--border)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(features).map(([featureKey, config]) => (
            <FeatureCard
              key={featureKey}
              featureKey={featureKey}
              config={config}
              onSave={handleSave}
              onReset={handleReset}
              saving={saving}
              resetting={resetting}
            />
          ))}
        </div>
      )}

      <div style={{ height: 40 }} />
    </div>
  );
}
