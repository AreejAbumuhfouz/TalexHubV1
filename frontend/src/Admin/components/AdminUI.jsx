'use strict';
/**
 * AdminUI.jsx
 * Reusable UI primitives: Btn, Spinner, Avatar, Toggle, FormField, AdminStyles
 * Import: import { Btn, Spinner, Avatar, Toggle, FormField, AdminStyles } from './AdminUI';
 */

import { C } from './AdminTokens';
import { Icon } from './AdminIcons';

/* ── Spinner ─────────────────────────────────────────────── */
export const Spinner = ({ size = 16 }) => (
  <span style={{
    width: size, height: size,
    border: `2px solid var(--border)`,
    borderTopColor: 'var(--text-primary)',
    borderRadius: '50%',
    animation: 'adSpin 0.8s linear infinite',
    display: 'inline-block',
    flexShrink: 0,
  }} />
);

/* ── Button ──────────────────────────────────────────────── */
export const Btn = ({ children, variant = 'ghost', onClick, disabled, loading, size = 'md', type = 'button', style: extra = {} }) => {
  const variants = {
    primary: C.btnPrimary, danger: C.btnDanger, success: C.btnSuccess,
    warning: C.btnWarning, ghost: C.btnGhost, info: C.btnInfo,
  };
  const sizes = {
    sm: { padding: '5px 11px', fontSize: 12 },
    md: { padding: '9px 16px', fontSize: 13 },
    lg: { padding: '12px 22px', fontSize: 14 },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      style={{ ...C.btn, ...variants[variant], ...sizes[size], opacity: disabled || loading ? 0.6 : 1, ...extra }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.82'; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '1'; }}>
      {loading && <Spinner size={13} />}
      {children}
    </button>
  );
};

/* ── Avatar ──────────────────────────────────────────────── */
export const Avatar = ({ src, name, size = 32 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
    overflow: 'hidden', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    {src
      ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      : <span style={{ fontSize: size * 0.38, fontWeight: 700, color: 'var(--text-secondary)' }}>
          {(name || '?')[0]?.toUpperCase()}
        </span>
    }
  </div>
);

/* ── Toggle switch ───────────────────────────────────────── */
export const Toggle = ({ value, onChange, label, description }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
      {description && <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{description}</div>}
    </div>
    <button onClick={() => onChange(!value)} style={{
      width: 42, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
      position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      background: value ? 'var(--text-primary)' : 'var(--border)',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: value ? 22 : 2,
        width: 18, height: 18, borderRadius: '50%',
        background: value ? 'var(--bg-primary)' : 'var(--bg-secondary)',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  </div>
);

/* ── Form field wrapper ──────────────────────────────────── */
export const FormField = ({ label, error, required, children, hint }) => (
  <div style={{ marginBottom: 14 }}>
    {label && (
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}{required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
      </label>
    )}
    {children}
    {hint  && <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{hint}</p>}
    {error && <p style={{ fontSize: 11, color: 'var(--danger)',          marginTop: 4 }}>⚠ {error}</p>}
  </div>
);

/* ── Plan bar chart ──────────────────────────────────────── */
export const PlanChart = ({ data, total }) => {
  const colors = { free: '#6b7280', pro: '#7B72EE', elite: '#F59E0B' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {(data || []).map(p => {
        const pct   = total ? Math.round((p.count / total) * 100) : 0;
        const color = colors[p.planKey] || '#6b7280';
        return (
          <div key={p.planKey} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 52, fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{p.planKey}</span>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: 64, fontSize: 11, color: 'var(--text-secondary)', textAlign: 'right' }}>{(p.count || 0).toLocaleString()} ({pct}%)</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Global keyframes (inject once at root) ──────────────── */
export const AdminStyles = () => (
  <style>{`
    @keyframes adSpin    { to { transform: rotate(360deg); } }
    @keyframes adSlideUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
    @keyframes adFadeIn  { from { opacity:0; } to { opacity:1; } }
  `}</style>
);