

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users, Search, ChevronDown, Sparkles, FileText,
  Check, X, ArrowUpRight, RefreshCw, Filter,
} from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── Status config ───────────────────────────────────────── */
const STATUSES = {
  sent:        { ar: 'مُرسَل',          en: 'Sent',        color: '#71717A', bg: 'rgba(113,113,122,0.1)',  border: 'rgba(113,113,122,0.2)'  },
  viewed:      { ar: 'تمت المشاهدة',    en: 'Viewed',      color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'   },
  shortlisted: { ar: 'قائمة مختصرة',   en: 'Shortlisted', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)'   },
  interview:   { ar: 'مقابلة',         en: 'Interview',   color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'   },
  accepted:    { ar: 'مقبول',          en: 'Accepted',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)'    },
  rejected:    { ar: 'مرفوض',         en: 'Rejected',    color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'    },
};

const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';
const timeAgo = (d, ar) => { const x = Math.floor((Date.now() - new Date(d)) / 86400000); return x === 0 ? (ar ? 'اليوم' : 'Today') : x < 7 ? (ar ? `${x}ي` : `${x}d`) : (ar ? `${Math.floor(x/7)}أ` : `${Math.floor(x/7)}w`); };

/* ── Status Dropdown ─────────────────────────────────────── */
function StatusDropdown({ current, onChange, isAr, loading }) {
  const [open, setOpen] = useState(false);
  const s = STATUSES[current] || STATUSES.sent;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 9, border: `1px solid ${s.border}`, background: s.bg, color: s.color, cursor: loading ? 'default' : 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit', opacity: loading ? 0.6 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
        {loading ? <RefreshCw size={11} style={{ animation: 'spin .8s linear infinite' }} /> : <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color, flexShrink: 0 }} />}
        {isAr ? s.ar : s.en}
        {!loading && <ChevronDown size={11} style={{ opacity: 0.7 }} />}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '110%', insetInlineEnd: 0, width: 175, background: 'var(--bg-primary)', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', border: '1px solid var(--border)', zIndex: 20, overflow: 'hidden', marginTop: 4 }}>
            {Object.entries(STATUSES).map(([key, cfg]) => (
              <button key={key} onClick={() => { onChange(key); setOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '9px 14px', background: key === current ? 'var(--bg-secondary)' : 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: cfg.color, fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left', transition: 'background 0.1s' }}
                onMouseEnter={e => { if (key !== current) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { if (key !== current) e.currentTarget.style.background = 'none'; }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                {isAr ? cfg.ar : cfg.en}
                {key === current && <Check size={12} style={{ marginInlineStart: 'auto' }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Applicant Card ──────────────────────────────────────── */
function ApplicantCard({ app, isAr, onStatusChange }) {
  const [updating, setUpdating] = useState(false);

  const update = async (status) => {
    if (status === app.status) return;
    setUpdating(true);
    try {
      await api.patch(`/applications/${app.id}/status`, { status });
      onStatusChange(app.id, status);
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    } catch {
      toast.error(isAr ? 'فشل التحديث' : 'Update failed');
    } finally {
      setUpdating(false);
    }
  };

  const name = (app.applicant || app.user)?.fullName || `${(app.applicant || app.user)?.firstName || ''} ${(app.applicant || app.user)?.lastName || ''}`.trim() || '—';
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', transition: 'border-color 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Header */}
      <div style={{ padding: '15px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Avatar */}
        <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {(app.applicant || app.user)?.avatarUrl
            ? <img src={(app.applicant || app.user)?.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{initial}</span>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{name}</p>
            {typeof app.matchScore === 'number' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: `${matchColor(app.matchScore)}15`, color: matchColor(app.matchScore), border: `1px solid ${matchColor(app.matchScore)}30` }}>
                <Sparkles size={10} /> {app.matchScore}%
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {(app.applicant || app.user)?.headline || (app.applicant || app.user)?.email || '—'}
            {(app.applicant || app.user)?.locationCity ? ` · ${(app.applicant || app.user)?.locationCity}` : ''}
          </p>
          {app.job?.title && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--border)' }}>
              {app.job.title}
            </span>
          )}
        </div>

        {/* Status dropdown */}
        <div style={{ flexShrink: 0 }}>
          <StatusDropdown current={app.status} onChange={update} isAr={isAr} loading={updating} />
        </div>
      </div>

      {/* Extra info row */}
      {(app.cv?.atsScore || app.createdAt) && (
        <div style={{ display: 'flex', gap: 14, padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          {app.cv?.atsScore && (
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FileText size={11} /> ATS: <strong style={{ color: matchColor(app.cv.atsScore) }}>{app.cv.atsScore}%</strong>
            </span>
          )}
          {app.createdAt && (
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              {timeAgo(app.createdAt, isAr)}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '11px 14px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {app.cv?.fileUrl && (
          <a href={app.cv.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12, fontWeight: 600, transition: 'all 0.2s', background: 'var(--bg-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            <FileText size={12} /> {isAr ? 'السيرة الذاتية' : 'View CV'} <ArrowUpRight size={11} />
          </a>
        )}

        <button onClick={() => update('shortlisted')} disabled={app.status === 'shortlisted'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, border: '1px solid rgba(139,92,246,0.25)', background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', fontSize: 12, fontWeight: 600, cursor: app.status === 'shortlisted' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: app.status === 'shortlisted' ? 0.5 : 1, transition: 'border-color 0.2s' }}
          onMouseEnter={e => { if (app.status !== 'shortlisted') e.currentTarget.style.borderColor = '#8B5CF6'; }}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'}>
          <Check size={12} /> {isAr ? 'قائمة مختصرة' : 'Shortlist'}
        </button>

        <button onClick={() => update('interview')} disabled={app.status === 'interview'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.06)', color: '#F59E0B', fontSize: 12, fontWeight: 600, cursor: app.status === 'interview' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: app.status === 'interview' ? 0.5 : 1, transition: 'border-color 0.2s' }}
          onMouseEnter={e => { if (app.status !== 'interview') e.currentTarget.style.borderColor = '#F59E0B'; }}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.25)'}>
          📅 {isAr ? 'مقابلة' : 'Interview'}
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={() => update('rejected')} disabled={app.status === 'rejected'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#EF4444', fontSize: 12, fontWeight: 600, cursor: app.status === 'rejected' ? 'default' : 'pointer', fontFamily: 'inherit', opacity: app.status === 'rejected' ? 0.5 : 1 }}>
          <X size={12} /> {isAr ? 'رفض' : 'Reject'}
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = () => <div style={{ height: 160, background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', animation: 'caPulse 1.5s ease-in-out infinite' }} />;

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanyApplicantsPage() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';
  const [searchParams] = useSearchParams();
  const jobIdFilter = searchParams.get('jobId');

  const [apps,    setApps]    = useState([]);
  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState('');
  const [status,  setStatus]  = useState('all');
  const [sort,    setSort]    = useState('score');
  const [jobId,   setJobId]   = useState(jobIdFilter || 'all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, limit: 50 };
      if (status !== 'all') params.status = status;
      if (jobId !== 'all') params.jobId = jobId;
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/companies/me/applicants', { params }),
        api.get('/companies/me/jobs'),
      ]);
      // Support both response shapes
      const appList = appsRes.data.data?.applications
                   || appsRes.data.data?.rows
                   || appsRes.data.data
                   || [];
      setApps(Array.isArray(appList) ? appList : []);
      setJobs(jobsRes.data.data?.jobs || []);
    } catch {
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [jobId, status, sort]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusChange = (id, s) => setApps(prev => prev.map(a => a.id === id ? { ...a, status: s } : a));

  const filtered = apps.filter(a => {
    if (!q) return true;
    const name  = a.user?.fullName?.toLowerCase() || '';
    const email = a.user?.email?.toLowerCase() || '';
    return name.includes(q.toLowerCase()) || email.includes(q.toLowerCase());
  });

  const counts = Object.keys(STATUSES).reduce((acc, k) => { acc[k] = apps.filter(a => a.status === k).length; return acc; }, {});

  return (
    <CompanyLayout title={isAr ? 'المتقدمون' : 'Applicants'}>
      <style>{'@keyframes caPulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes spin{to{transform:rotate(360deg)}}'}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>
          {isAr ? 'المتقدمون' : 'Applicants'}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          {isAr ? `${apps.length} متقدم` : `${apps.length} applicants`}
        </p>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        {/* Job filter */}
        <select value={jobId} onChange={e => setJobId(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', maxWidth: 220 }}>
          <option value="all">{isAr ? 'كل الوظائف' : 'All Jobs'}</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>

        {/* Status filter */}
        <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
          <option value="all">{isAr ? `كل الحالات (${apps.length})` : `All (${apps.length})`}</option>
          {Object.entries(STATUSES).map(([k, s]) => (
            <option key={k} value={k}>{isAr ? s.ar : s.en} ({counts[k] || 0})</option>
          ))}
        </select>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
          <option value="score">{isAr ? 'الأعلى مطابقة' : 'Best Match'}</option>
          <option value="newest">{isAr ? 'الأحدث' : 'Newest'}</option>
          <option value="oldest">{isAr ? 'الأقدم' : 'Oldest'}</option>
        </select>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 14px', transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'ابحث بالاسم...' : 'Search by name...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', padding: '10px 0', fontFamily: 'inherit' }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}><X size={14} /></button>}
        </div>
      </div>

      {/* Status chips summary */}
      {!loading && apps.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {Object.entries(STATUSES).filter(([k]) => counts[k] > 0).map(([k, s]) => (
            <button key={k} onClick={() => setStatus(status === k ? 'all' : k)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 600, background: status === k ? s.bg : 'transparent', color: s.color, border: `1px solid ${status === k ? s.border : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
              {isAr ? s.ar : s.en} ({counts[k]})
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 14 }}>
          {isAr ? `${filtered.length} متقدم` : `${filtered.length} applicant${filtered.length !== 1 ? 's' : ''}`}
          {q && (isAr ? ` لـ "${q}"` : ` for "${q}"`)}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {[0, 1, 2, 3].map(i => <Skel key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Users size={40} color="var(--text-secondary)" strokeWidth={1.2} style={{ marginBottom: 14, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {isAr ? 'لا يوجد متقدمون' : 'No applicants yet'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            {isAr ? 'انشر وظيفة لتبدأ في استقبال الطلبات' : 'Post a job to receive applications'}
          </p>
          <Link to="/company/jobs/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
            {isAr ? '+ نشر وظيفة' : '+ Post a Job'}
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 14 }}>
          {filtered.map(app => (
            <ApplicantCard key={app.id} app={app} isAr={isAr} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </CompanyLayout>
  );
}