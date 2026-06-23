import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers, Search, X, Star, MessageSquare,
  Calendar, Download, CheckCircle, Eye,
  UserCheck, XCircle, Sparkles, Loader2,
  MapPin, Mail, FileText, ChevronRight,
  MoreHorizontal, Clock,
} from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════ */
const STAGES = [
  { key: 'sent',        ar: 'طلبات جديدة',     en: 'Applied',      icon: FileText,  color: '#71717A', bg: 'rgba(113,113,122,0.07)', border: 'rgba(113,113,122,0.18)' },
  { key: 'viewed',      ar: 'تمت المراجعة',    en: 'Reviewed',     icon: Eye,       color: '#3B82F6', bg: 'rgba(59,130,246,0.07)',  border: 'rgba(59,130,246,0.2)'   },
  { key: 'shortlisted', ar: 'القائمة المختصرة', en: 'Shortlisted',  icon: Star,      color: '#8B5CF6', bg: 'rgba(139,92,246,0.07)', border: 'rgba(139,92,246,0.2)'   },
  { key: 'interview',   ar: 'مقابلة',           en: 'Interview',    icon: Calendar,  color: '#F59E0B', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)'   },
  { key: 'accepted',    ar: 'تم القبول',        en: 'Hired',        icon: UserCheck, color: '#22C55E', bg: 'rgba(34,197,94,0.07)',  border: 'rgba(34,197,94,0.2)'    },
  { key: 'rejected',    ar: 'مرفوض',            en: 'Rejected',     icon: XCircle,   color: '#EF4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)'    },
];

const matchColor = s => s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#EF4444';
const timeAgo = (d, ar) => {
  const x = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (x === 0) return ar ? 'اليوم' : 'Today';
  if (x < 7)  return ar ? `${x} أيام` : `${x}d`;
  return ar ? `${Math.floor(x/7)}أ` : `${Math.floor(x/7)}w`;
};

/* ══════════════════════════════════════════════════════════
   APPLICANT CARD
══════════════════════════════════════════════════════════ */
function Card({ app, isAr, onMove, onSelect, selected }) {
  const [moving, setMoving] = useState(false);
  const stage = STAGES.find(s => s.key === app.status) || STAGES[0];
  const score = app.matchScore ? Math.round(parseFloat(app.matchScore)) : null;
  const name  = app.user?.fullName || '—';

  const moveTo = async (newStatus) => {
    if (moving || newStatus === app.status) return;
    setMoving(true);
    try {
      await api.patch(`/applications/${app.id}/status`, { status: newStatus });
      onMove(app.id, newStatus);
    } catch { toast.error(isAr ? 'فشل التحديث' : 'Failed'); }
    finally { setMoving(false); }
  };

  const NEXT_STAGES = STAGES.filter(s => s.key !== app.status && s.key !== 'rejected').slice(0, 2);

  return (
    <div onClick={() => onSelect(app)}
      style={{ background: 'var(--bg-primary)', border: `1.5px solid ${selected ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: 13, padding: '13px', cursor: 'pointer', transition: 'all 0.15s', position: 'relative', userSelect: 'none' }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = 'var(--border)'; }}>

      {/* Top */}
      <div style={{ display: 'flex', gap: 9, marginBottom: 9 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {app.user?.avatarUrl
            ? <img src={app.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{name[0]?.toUpperCase()}</span>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.user?.headline || app.job?.title || '—'}
          </p>
        </div>
        {score !== null && (
          <div style={{ flexShrink: 0, width: 34, height: 34, borderRadius: 9, background: `${matchColor(score)}15`, border: `1.5px solid ${matchColor(score)}35`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: matchColor(score), lineHeight: 1 }}>{score}</span>
            <span style={{ fontSize: 7.5, color: matchColor(score), opacity: 0.7 }}>%</span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 9 }}>
        {app.user?.locationCity && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-secondary)' }}>
            <MapPin size={10} /> {app.user.locationCity}
          </span>
        )}
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginInlineStart: 'auto' }}>{timeAgo(app.createdAt, isAr)}</span>
      </div>

      {/* Interview date */}
      {app.interviewAt && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 7, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: 9 }}>
          <Calendar size={10} color="#F59E0B" />
          <span style={{ fontSize: 10.5, color: '#F59E0B', fontWeight: 600 }}>
            {new Date(app.interviewAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Move buttons */}
      <div style={{ display: 'flex', gap: 4 }}>
        {NEXT_STAGES.map(s => (
          <button key={s.key} onClick={e => { e.stopPropagation(); moveTo(s.key); }} disabled={moving}
            style={{ flex: 1, padding: '5px 4px', borderRadius: 7, border: `1px solid ${s.border}`, background: s.bg, color: s.color, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: moving ? 0.5 : 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            → {isAr ? s.ar.split(' ')[0] : s.en}
          </button>
        ))}
        {app.status !== 'rejected' && (
          <button onClick={e => { e.stopPropagation(); moveTo('rejected'); }} disabled={moving}
            style={{ padding: '5px 7px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', cursor: 'pointer', fontFamily: 'inherit', opacity: moving ? 0.5 : 1 }}>
            <X size={10} />
          </button>
        )}
      </div>

      {moving && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={18} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DETAIL PANEL
══════════════════════════════════════════════════════════ */
function Detail({ app, isAr, onClose, onMove }) {
  const [note,       setNote]       = useState(app.companyNote || '');
  const [interview,  setInterview]  = useState(app.interviewAt ? new Date(app.interviewAt).toISOString().slice(0,16) : '');
  const [saving,     setSaving]     = useState(false);
  const score = app.matchScore ? Math.round(parseFloat(app.matchScore)) : null;

  const save = async (newStatus) => {
    setSaving(true);
    try {
      await api.patch(`/applications/${app.id}/status`, {
        status:      newStatus || app.status,
        companyNote: note      || undefined,
        interviewAt: interview || undefined,
      });
      onMove(app.id, newStatus || app.status);
      toast.success(isAr ? 'تم الحفظ' : 'Saved');
    } catch { toast.error(isAr ? 'فشل الحفظ' : 'Failed'); }
    finally  { setSaving(false); }
  };

  const inp = { width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ width: 320, flexShrink: 0, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxHeight: 'calc(100vh - 130px)', position: 'sticky', top: 20 }}>
      {/* Header */}
      <div style={{ padding: '15px 17px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
          {app.user?.avatarUrl
            ? <img src={app.user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{(app.user?.fullName||'?')[0].toUpperCase()}</div>
          }
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{app.user?.fullName}</p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 8 }}><X size={16} /></button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '15px 17px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Score */}
        {score !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 12, background: `${matchColor(score)}0D`, border: `1px solid ${matchColor(score)}25` }}>
            <Sparkles size={16} color={matchColor(score)} />
            <div>
              <p style={{ fontSize: 10.5, color: 'var(--text-secondary)', margin: '0 0 1px' }}>{isAr ? 'نقاط المطابقة AI' : 'AI Match Score'}</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: matchColor(score), margin: 0 }}>{score}<span style={{ fontSize: 12 }}>%</span></p>
            </div>
          </div>
        )}

        {/* Contact */}
        {app.user?.email && (
          <a href={`mailto:${app.user.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)', textDecoration: 'none' }}>
            <Mail size={13} /> {app.user.email}
          </a>
        )}
        {app.user?.locationCity && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-secondary)' }}>
            <MapPin size={13} /> {app.user.locationCity}{app.user.locationCountry ? `, ${app.user.locationCountry}` : ''}
          </span>
        )}

        {/* Cover letter */}
        {app.coverLetter && (
          <div>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{isAr ? 'رسالة التغطية' : 'Cover Letter'}</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-primary)', lineHeight: 1.7, margin: 0, padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              {app.coverLetter.length > 280 ? app.coverLetter.slice(0, 280) + '…' : app.coverLetter}
            </p>
          </div>
        )}

        {/* Interview */}
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{isAr ? 'موعد المقابلة' : 'Interview Date'}</p>
          <input type="datetime-local" value={interview} onChange={e => setInterview(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>

        {/* Notes */}
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{isAr ? 'ملاحظات' : 'Notes'}</p>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder={isAr ? 'أضف ملاحظة...' : 'Add a note...'} style={{ ...inp, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>

        {/* Stage buttons */}
        <div>
          <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{isAr ? 'نقل إلى' : 'Move to'}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {STAGES.map(s => (
              <button key={s.key} onClick={() => save(s.key)} disabled={saving || s.key === app.status}
                style={{ padding: '8px', borderRadius: 9, border: `1.5px solid ${s.key === app.status ? s.color : s.border}`, background: s.key === app.status ? s.bg : 'transparent', color: s.color, fontSize: 11, fontWeight: 700, cursor: s.key === app.status ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1 }}>
                {isAr ? s.ar : s.en}{s.key === app.status ? ' ✓' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 17px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <button onClick={() => save()} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle size={14} />}
          {isAr ? 'حفظ' : 'Save'}
        </button>
        {app.cv?.fileUrl && (
          <a href={app.cv.fileUrl} target="_blank" rel="noreferrer" style={{ padding: '10px 13px', borderRadius: 11, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600 }}>
            <Download size={13} /> CV
          </a>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PIPELINE COLUMN
══════════════════════════════════════════════════════════ */
function Column({ stage, cards, isAr, onMove, onSelect, selectedId }) {
  const Icon = stage.icon;
  return (
    <div style={{ width: 272, flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 150px)' }}>
      <div style={{ padding: '11px 13px', borderRadius: '13px 13px 0 0', background: stage.bg, border: `1px solid ${stage.border}`, borderBottom: 'none', display: 'flex', alignItems: 'center', gap: 7 }}>
        <Icon size={13} color={stage.color} strokeWidth={2} />
        <span style={{ fontSize: 12.5, fontWeight: 700, color: stage.color, flex: 1 }}>{isAr ? stage.ar : stage.en}</span>
        <span style={{ fontSize: 10.5, fontWeight: 800, background: `${stage.color}20`, color: stage.color, padding: '2px 7px', borderRadius: 99, border: `1px solid ${stage.color}30` }}>{cards.length}</span>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: 9, borderLeft: `1px solid ${stage.border}`, borderRight: `1px solid ${stage.border}`, borderBottom: `1px solid ${stage.border}`, borderRadius: '0 0 13px 13px', background: 'var(--bg-secondary)', minHeight: 180, scrollbarWidth: 'thin' }}>
        {cards.length === 0
          ? <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-secondary)', opacity: 0.4 }}>
              <Icon size={22} strokeWidth={1.2} style={{ marginBottom: 7 }} />
              <p style={{ fontSize: 11.5, margin: 0 }}>{isAr ? 'فارغ' : 'Empty'}</p>
            </div>
          : cards.map(app => (
              <Card key={app.id} app={app} isAr={isAr} onMove={onMove} onSelect={onSelect} selected={selectedId === app.id} />
            ))
        }
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanyPipelinePage() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';

  const [columns,  setColumns]  = useState({});
  const [jobs,     setJobs]     = useState([]);
  const [jobId,    setJobId]    = useState('all');
  const [q,        setQ]        = useState('');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (jobId !== 'all') params.jobId = jobId;
      const [pRes, jRes] = await Promise.all([
        api.get('/companies/analytics/pipeline', { params }),
        api.get('/companies/me/jobs'),
      ]);
      setColumns(pRes.data.data?.columns || {});
      setJobs(jRes.data.data?.jobs || []);
    } catch { toast.error(isAr ? 'فشل التحميل' : 'Load failed'); }
    finally { setLoading(false); }
  }, [jobId, isAr]);

  useEffect(() => { load(); }, [load]);

  const handleMove = (appId, newStatus) => {
    setColumns(prev => {
      const next = {};
      let moved = null;
      for (const [k, cards] of Object.entries(prev)) {
        const idx = cards.findIndex(a => a.id === appId);
        if (idx !== -1) { moved = { ...cards[idx], status: newStatus }; next[k] = cards.filter(a => a.id !== appId); }
        else next[k] = cards;
      }
      if (moved && next[newStatus]) next[newStatus] = [moved, ...next[newStatus]];
      if (selected?.id === appId) setSelected(p => p ? { ...p, status: newStatus } : p);
      return next;
    });
  };

  const filtered = q.trim()
    ? Object.fromEntries(Object.entries(columns).map(([k, cards]) => [k, cards.filter(a => {
        const low = q.toLowerCase();
        return a.user?.fullName?.toLowerCase().includes(low) || a.user?.email?.toLowerCase().includes(low) || a.job?.title?.toLowerCase().includes(low);
      })]))
    : columns;

  const total = Object.values(filtered).reduce((s, c) => s + c.length, 0);

  return (
    <CompanyLayout title={isAr ? 'خط التوظيف' : 'Hiring Pipeline'}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Layers size={19} /> {isAr ? 'خط التوظيف' : 'Hiring Pipeline'}
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
            {loading ? '...' : `${total} ${isAr ? 'مرشح' : 'candidates'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <select value={jobId} onChange={e => { setJobId(e.target.value); setSelected(null); }} style={{ padding: '8px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none', maxWidth: 200 }}>
            <option value="all">{isAr ? 'كل الوظائف' : 'All Jobs'}</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', minWidth: 190 }}>
            <Search size={13} color="var(--text-secondary)" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'بحث...' : 'Search...'} style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', padding: '8px 0', fontFamily: 'inherit', width: 140 }} />
            {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0 }}><X size={12} /></button>}
          </div>
          <Link to="/company/jobs/new" style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 15px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            + {isAr ? 'وظيفة' : 'New Job'}
          </Link>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 14 }}>
          {STAGES.map(s => (
            <div key={s.key} style={{ width: 272, flexShrink: 0 }}>
              <div style={{ height: 42, borderRadius: '13px 13px 0 0', background: s.bg, border: `1px solid ${s.border}`, borderBottom: 'none' }} />
              <div style={{ background: 'var(--bg-secondary)', border: `1px solid ${s.border}`, borderTop: 'none', borderRadius: '0 0 13px 13px', minHeight: 220, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[1,2,3].map(i => <div key={i} style={{ height: 120, borderRadius: 11, background: 'var(--bg-primary)', animation: `plPulse 1.5s infinite ${i*0.15}s` }} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, overflowX: 'auto', display: 'flex', gap: 14, paddingBottom: 14 }}>
            {STAGES.map(s => (
              <Column key={s.key} stage={s} cards={filtered[s.key] || []} isAr={isAr} onMove={handleMove} onSelect={setSelected} selectedId={selected?.id} />
            ))}
          </div>
          {selected && <Detail app={selected} isAr={isAr} onClose={() => setSelected(null)} onMove={handleMove} />}
        </div>
      )}

      <style>{`@keyframes plPulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </CompanyLayout>
  );
}
