import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, Users, ToggleLeft, ToggleRight,
  Trash2, Clock, Search, Eye, X, Edit3, RefreshCw,
} from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── Status config ───────────────────────────────────────── */
const STATUS = {
  active:           { ar: 'نشط',           en: 'Active',   color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)'  },
  draft:            { ar: 'مسودة',          en: 'Draft',    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
  closed:           { ar: 'مغلق',          en: 'Closed',   color: '#71717A', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)' },
  pending_approval: { ar: 'قيد المراجعة',  en: 'Pending',  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.25)' },
  rejected:         { ar: 'مرفوض',         en: 'Rejected', color: '#EF4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'  },
};

const timeAgo = (date, isAr) => {
  if (!date) return '—';
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return isAr ? 'اليوم' : 'Today';
  if (d < 7)   return isAr ? `منذ ${d} أيام` : `${d}d ago`;
  return isAr ? `منذ ${Math.floor(d / 7)} أسابيع` : `${Math.floor(d / 7)}w ago`;
};

/* ── Job Card ────────────────────────────────────────────── */
function JobCard({ job, isAr, onToggle, onDelete, onEdit, onRepost }) {
  const s = STATUS[job.status] || STATUS.draft;
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(isAr ? 'هل تريد حذف هذه الوظيفة؟' : 'Delete this job?')) return;
    setDeleting(true);
    try {
      await api.delete(`/jobs/${job.id}`);
      onDelete(job.id);
      toast.success(isAr ? 'تم الحذف' : 'Deleted');
    } catch {
      toast.error(isAr ? 'فشل الحذف' : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(job);
    setToggling(false);
  };

  const isActive = job.status === 'active';

  return (
    <div style={{
      background: 'var(--bg-primary)', borderRadius: 14,
      border: '1px solid var(--border)',
      transition: 'all 0.2s', overflow: 'hidden',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>

      {/* Top */}
      <div style={{ padding: '16px 18px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{ width: 42, height: 42, borderRadius: 11, background: `${s.color}12`, border: `1px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Briefcase size={17} color={s.color} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
              {isAr && job.titleAr ? job.titleAr : job.title}
            </p>
            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: 'nowrap' }}>
              {isAr ? s.ar : s.en}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} /> {timeAgo(job.createdAt || job.created_at, isAr)}
            </span>
            {job.jobType && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {job.jobType.replace(/_/g, ' ')}
              </span>
            )}
            {job.locationCity && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                📍 {job.locationCity}
              </span>
            )}
            {job.salaryMin && (
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>
                ${job.salaryMin.toLocaleString()}{job.salaryMax ? `–${job.salaryMax.toLocaleString()}` : '+'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {[
          { icon: Users, val: job.applicationsCount || 0, ar: 'متقدم',    en: 'Applied' },
          { icon: Eye,   val: job.viewsCount || 0,        ar: 'مشاهدة',   en: 'Views'   },
        ].map(({ icon: Icon, val, ar, en }, i) => (
          <div key={i} style={{ flex: 1, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderInlineEnd: i === 0 ? '1px solid var(--border)' : 'none' }}>
            <Icon size={14} color="var(--text-secondary)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{val}</span>
            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{isAr ? ar : en}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Link to={`/company/applicants?jobId=${job.id}`} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, transition: 'all 0.2s', background: 'var(--bg-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <Users size={13} /> {isAr ? 'المتقدمون' : 'Applicants'}
        </Link>

        <button onClick={() => onEdit(job)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.06)', color: '#3B82F6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; }}>
          <Edit3 size={13} /> {isAr ? 'تعديل' : 'Edit'}
        </button>

        {job.status === 'closed' && (
          <button onClick={() => onRepost(job)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', color: '#8B5CF6', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.06)'; }}>
            <RefreshCw size={13} /> {isAr ? 'إعادة نشر' : 'Repost'}
          </button>
        )}

        <button onClick={handleToggle} disabled={toggling} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, border: `1px solid ${isActive ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}`, background: isActive ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', color: isActive ? '#EF4444' : '#22C55E', fontSize: 12.5, fontWeight: 600, cursor: toggling ? 'default' : 'pointer', fontFamily: 'inherit', opacity: toggling ? 0.6 : 1, transition: 'all 0.2s' }}>
          {isActive
            ? <><ToggleRight size={13} /> {isAr ? 'إغلاق' : 'Close'}</>
            : <><ToggleLeft size={13} />  {isAr ? 'تفعيل' : 'Activate'}</>
          }
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={handleDelete} disabled={deleting} style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deleting ? 0.5 : 1, transition: 'all 0.2s' }}
          onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; }}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}>
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = () => <div style={{ height: 188, background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', animation: 'cjPulse 1.5s ease-in-out infinite' }} />;

const FILTERS = [
  { id: 'all',    ar: 'الكل',    en: 'All'     },
  { id: 'active', ar: 'نشطة',   en: 'Active'  },
  { id: 'draft',  ar: 'مسودات', en: 'Drafts'  },
  { id: 'closed', ar: 'مغلقة',  en: 'Closed'  },
];

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanyJobsPage() {
  const { lang } = useLangStore();
  const navigate = useNavigate();
  const isAr = lang === 'ar';
  const title = isAr ? 'الوظائف' : 'Jobs';

  const [jobs,    setJobs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState('');
  const [filter,  setFilter]  = useState('all');

  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get('/companies/me/jobs');
      setJobs(data.data?.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleEdit = (job) => {
    // Navigate to edit page or open modal
    // For now navigate to new job page with job data prefilled
    navigate(`/company/jobs/edit/${job.id}`);
  };

  const handleRepost = async (job) => {
    try {
      await api.patch(`/jobs/${job.id}`, { status: 'active' });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'active' } : j));
      toast.success(isAr ? 'تم إعادة نشر الوظيفة' : 'Job reposted successfully');
    } catch {
      toast.error(isAr ? 'فشل إعادة النشر' : 'Repost failed');
    }
  };

  const handleToggle = async (job) => {
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await api.patch(`/jobs/${job.id}`, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: newStatus } : j));
      toast.success(isAr ? 'تم تحديث حالة الوظيفة' : 'Status updated');
    } catch {
      toast.error(isAr ? 'فشل التحديث' : 'Update failed');
    }
  };

  const handleDelete = (id) => setJobs(prev => prev.filter(j => j.id !== id));

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.id] = f.id === 'all' ? jobs.length : jobs.filter(j => j.status === f.id).length;
    return acc;
  }, {});

  const filtered = jobs.filter(j => {
    const matchFilter = filter === 'all' || j.status === filter;
    const matchQ      = !q || j.title?.toLowerCase().includes(q.toLowerCase()) || j.titleAr?.includes(q);
    return matchFilter && matchQ;
  });

  const postJobBtn = (
    <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700, transition: 'all 0.2s', flexShrink: 0 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
      <Plus size={14} strokeWidth={2.5} /> {isAr ? 'وظيفة جديدة' : 'New Job'}
    </Link>
  );

  return (
    <CompanyLayout title={title} actions={postJobBtn}>
      <style>{'@keyframes cjPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px' }}>{title}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {isAr ? `${jobs.length} وظيفة مسجلة` : `${jobs.length} jobs posted`}
          </p>
        </div>
        <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, transition: 'opacity 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          <Plus size={15} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة جديدة' : 'Post New Job'}
        </Link>
      </div>

      {/* Filter tabs + Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 11, padding: 4 }}>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              padding: '7px 13px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 12.5, fontWeight: filter === f.id ? 700 : 500,
              background: filter === f.id ? 'var(--text-primary)' : 'transparent',
              color: filter === f.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
              fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
            }}>
              {isAr ? f.ar : f.en} ({counts[f.id]})
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 14px', transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'ابحث في وظائفك...' : 'Search your jobs...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', padding: '10px 0', fontFamily: 'inherit' }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}><X size={14} /></button>}
        </div>
      </div>

      {/* Jobs grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {[0, 1, 2].map(i => <Skel key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)' }}>
          <Briefcase size={40} color="var(--text-secondary)" strokeWidth={1.2} style={{ marginBottom: 14, opacity: 0.3 }} />
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            {q ? (isAr ? 'لا توجد نتائج' : 'No results found') : (isAr ? 'لم تنشر أي وظيفة بعد' : 'No jobs posted yet')}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
            {isAr ? 'ابدأ بنشر وظيفتك الأولى لاستقبال المتقدمين' : 'Post your first job to start receiving applications'}
          </p>
          {!q && (
            <Link to="/company/jobs/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13.5, fontWeight: 700 }}>
              <Plus size={14} strokeWidth={2.5} /> {isAr ? 'نشر وظيفة' : 'Post a Job'}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: 14 }}>
          {filtered.map(job => (
            <JobCard key={job.id} job={job} isAr={isAr} onToggle={handleToggle} onDelete={handleDelete} onEdit={handleEdit} onRepost={handleRepost} />
          ))}
        </div>
      )}
    </CompanyLayout>
  );
}
