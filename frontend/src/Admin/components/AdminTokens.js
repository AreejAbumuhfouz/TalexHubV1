'use strict';

/**
 * AdminTokens.js
 * Shared style tokens — mirrors your CSS vars exactly.
 * Import: import { C, TABS_CONFIG, fmt, fmtNum, fmtDateTime } from './AdminTokens';
 */

export const C = {
  card: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 12,
  },
  input: {
    width: '100%',
    padding: '9px 14px',
    background: 'var(--bg-secondary)',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    display: 'block',
  },
  select: {
    width: '100%',
    padding: '9px 14px',
    background: 'var(--bg-secondary)',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
    appearance: 'none',
  },
  textarea: {
    width: '100%',
    padding: '9px 14px',
    background: 'var(--bg-secondary)',
    border: '1.5px solid var(--border)',
    borderRadius: 8,
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: 90,
  },
  btn: {
    padding: '9px 18px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'opacity 0.15s, transform 0.1s',
    whiteSpace: 'nowrap',
  },
  btnPrimary: {
    background: 'var(--text-primary)',
    color: 'var(--bg-primary)',
  },
  btnDanger: {
    background: 'rgba(239,68,68,0.1)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  btnSuccess: {
    background: 'rgba(34,197,94,0.1)',
    color: '#22C55E',
    border: '1px solid rgba(34,197,94,0.25)',
  },
  btnWarning: {
    background: 'rgba(245,158,11,0.1)',
    color: '#F59E0B',
    border: '1px solid rgba(245,158,11,0.25)',
  },
  btnGhost: {
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  },
  btnInfo: {
    background: 'rgba(123,114,238,0.1)',
    color: '#7B72EE',
    border: '1px solid rgba(123,114,238,0.25)',
  },
  th: {
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '11px 14px',
    fontSize: 13,
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--border)',
  },
};

export const STATUS_COLORS = {
  active: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  approved: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  published: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  open: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  pending: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
  pending_review: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
  pending_approval: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
  draft: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  suspended: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
  archived: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  deleted: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  closed: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  free: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  pro: { bg: 'rgba(123,114,238,0.12)', color: '#7B72EE' },
  elite: { bg: 'rgba(245,158,11,0.12)', color: '#b45309' },
  admin: { bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
  support: { bg: 'rgba(123,114,238,0.12)', color: '#7B72EE' },
  company: { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
  user: { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' },
  resolved: { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
};

// ── Tab Configuration ──────────────────────────────────────────
export const TABS_CONFIG = [
  // Main Dashboard
  { id: 'overview', label: { en: 'Overview', ar: 'نظرة عامة' }, icon: 'dashboard' },
  {
    id: 'deepseek-usage',
    label: { en: 'DeepSeek Usage', ar: 'استخدام DeepSeek' },
    icon: 'database',
  },
  { id: 'plans', label: { en: 'Plans & Pricing', ar: 'الخطط والتسعير' }, icon: 'wallet' },

  // Core Entities
  { id: 'users', label: { en: 'Users', ar: 'المستخدمون' }, icon: 'users' },
  { id: 'companies', label: { en: 'Companies', ar: 'الشركات' }, icon: 'companies' },
  { id: 'jobs', label: { en: 'Jobs', ar: 'الوظائف' }, icon: 'jobs' },

  // Revenue & Requests
  { id: 'payments', label: { en: 'Payments', ar: 'المدفوعات' }, icon: 'payments' },
  { id: 'wallets', label: { en: 'Wallets', ar: 'المحافظ' }, icon: 'wallet' },

  // Content
  { id: 'courses', label: { en: 'Courses', ar: 'الدورات' }, icon: 'courses' },
  { id: 'chatrooms', label: { en: 'Chat Rooms', ar: 'غرف الدردشة' }, icon: 'chat' },

  // Community & Support
  { id: 'moderation', label: { en: 'Moderation', ar: 'الإشراف' }, icon: 'moderation' },
  { id: 'contact', label: { en: 'Contact', ar: 'تواصل معنا' }, icon: 'contact' },
  { id: 'notifications', label: { en: 'Notifications', ar: 'الإشعارات' }, icon: 'bell' },

  // Growth
  { id: 'waitlist', label: { en: 'Waitlist', ar: 'قائمة الانتظار' }, icon: 'waitlist' },
  { id: 'newsletter', label: { en: 'Newsletter', ar: 'النشرة البريدية' }, icon: 'newsletter' },
  { id: 'reports', label: { en: 'Reports', ar: 'التقارير' }, icon: 'reports' },

  // System
  { id: 'hero-pills', label: { en: 'Hero Pills', ar: 'شعارات الصفحة' }, icon: 'hero' },
  { id: 'audit', label: { en: 'Audit Log', ar: 'سجل النشاطات' }, icon: 'audit' },
  { id: 'pricing', label: { en: 'Pricing', ar: 'التسعير' }, icon: 'payments' },
  { id: 'settings', label: { en: 'Settings', ar: 'الإعدادات' }, icon: 'settings' },
  { id: 'badwords', label: { en: 'Bad Words', ar: 'الكلمات الممنوعة' }, icon: 'ban' },

  // AI & Career
  { id: 'interview', label: { en: 'AI Interview', ar: 'مقابلة الذكاء الاصطناعي' }, icon: 'interview' },
  { id: 'career-path', label: { en: 'Career Path', ar: 'مسار مهني' }, icon: 'path' },
  { id: 'cv-management', label: { en: 'CV Management', ar: 'إدارة السيرة الذاتية' }, icon: 'file' },
];

// ── Date Formatters ──────────────────────────────────────────

/** Date only (YYYY-MM-DD) */
export const fmt = (date, lang = 'en') =>
  date
    ? new Date(date).toLocaleDateString(
        lang === 'ar' ? 'ar-JO' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    : '—';

/** Full date with time */
export const fmtDateTime = (date, lang = 'en') =>
  date
    ? new Date(date).toLocaleString(
        lang === 'ar' ? 'ar-JO' : 'en-US',
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      )
    : '—';

/** Time only */
export const fmtTime = (date, lang = 'en') =>
  date
    ? new Date(date).toLocaleTimeString(
        lang === 'ar' ? 'ar-JO' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      )
    : '—';

/** Relative time (e.g., "2 hours ago") */
export const fmtRelative = (date, lang = 'en') => {
  if (!date) return '—';
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return lang === 'ar' ? 'الآن' : 'just now';
  if (diffMins < 60) {
    return lang === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins} min ago`;
  }
  if (diffHours < 24) {
    return lang === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours} hours ago`;
  }
  if (diffDays < 7) {
    return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
  }
  return fmt(date, lang);
};

/** Number formatter */
export const fmtNum = (num) => (num != null ? Number(num).toLocaleString() : '—');

/** Currency formatter */
export const fmtCurrency = (amount, currency = 'USD', lang = 'en') => {
  if (amount == null) return '—';
  return new Intl.NumberFormat(lang === 'ar' ? 'ar-JO' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/** Percentage formatter */
export const fmtPercent = (value) => {
  if (value == null) return '—';
  return `${Math.round(value * 100)}%`;
};

/** Truncate text */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '—';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};