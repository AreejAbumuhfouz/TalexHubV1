import { useState, useEffect, useCallback } from 'react';
import {
  Mail, X, RefreshCw, Search, Eye,
  CheckCircle, MessageSquare, Clock,
  ChevronDown, Trash2, Flag, Send,
  Reply, ArrowLeft,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useLangStore from '../../i18n';

/* ── Config ──────────────────────────────────────────────── */
const STATUS_CFG = {
  new:     { ar: 'جديد',         en: 'New',     color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  read:    { ar: 'مقروء',        en: 'Read',    color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
  replied: { ar: 'تم الرد',     en: 'Replied', color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  closed:  { ar: 'مغلق',        en: 'Closed',  color: '#71717A', bg: 'rgba(113,113,122,0.1)' },
};
const PRIO_CFG = {
  low:    { ar: 'منخفضة', en: 'Low',    color: '#6B7280' },
  normal: { ar: 'عادية',  en: 'Normal', color: '#3B82F6' },
  high:   { ar: 'عالية',  en: 'High',   color: '#F59E0B' },
  urgent: { ar: 'عاجل',   en: 'Urgent', color: '#EF4444' },
};
const CAT_CFG = {
  general:     { ar: 'عام',       en: 'General'     },
  billing:     { ar: 'الدفع',     en: 'Billing'     },
  technical:   { ar: 'تقني',      en: 'Technical'   },
  partnership: { ar: 'شراكة',     en: 'Partnership' },
  career:      { ar: 'مهني',      en: 'Career'      },
  other:       { ar: 'أخرى',      en: 'Other'       },
};

const timeAgo = (d, ar) => {
  const x = Math.floor((Date.now() - new Date(d)) / 60000);
  if (x < 1)    return ar ? 'الآن'        : 'Just now';
  if (x < 60)   return ar ? `${x}د`       : `${x}m`;
  if (x < 1440) return ar ? `${Math.floor(x/60)}س` : `${Math.floor(x/60)}h`;
  return ar ? `${Math.floor(x/1440)}ي` : `${Math.floor(x/1440)}d`;
};

/* ── Reply Modal ─────────────────────────────────────────── */
function ReplyModal({ msg, onClose, onDone, lang }) {
  const isAr = lang === 'ar';
  const [reply, setReply]     = useState('');
  const [note,  setNote]      = useState(msg.adminNote || '');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!reply.trim()) { toast.error(isAr ? 'الرد مطلوب' : 'Reply required'); return; }
    setSending(true);
    try {
      await api.patch(`/contact/${msg.id}/reply`, { replyText: reply, adminNote: note });
      toast.success(isAr ? 'تم الرد بنجاح ✓' : 'Reply sent ✓');
      onDone();
    } catch { toast.error(isAr ? 'فشل الرد' : 'Reply failed'); }
    finally { setSending(false); }
  };

  const INP = { width: '100%', padding: '11px 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13.5, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s', resize: 'vertical' };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}>
      <div style={{ width: '100%', maxWidth: 560, background: 'var(--bg-primary)', borderRadius: 18, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Reply size={16} color="var(--text-secondary)" />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isAr ? `الرد على: ${msg.name}` : `Reply to: ${msg.name}`}
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>

        {/* Original message snippet */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isAr ? 'الرسالة الأصلية' : 'Original message'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {msg.message}
          </p>
        </div>

        {/* Reply form */}
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
              {isAr ? 'نص الرد *' : 'Reply text *'}
            </label>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={5} style={INP}
              placeholder={isAr ? 'اكتب ردك هنا...' : 'Write your reply here...'}
              onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
          <div>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 7 }}>
              {isAr ? 'ملاحظة داخلية (اختياري)' : 'Internal note (optional)'}
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...INP, borderStyle: 'dashed' }}
              placeholder={isAr ? 'ملاحظة خاصة لفريق الدعم...' : 'Private note for the team...'}
              onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 18px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button onClick={submit} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13, fontWeight: 700, cursor: sending ? 'default' : 'pointer', fontFamily: 'inherit', opacity: sending ? 0.7 : 1 }}>
            {sending ? <RefreshCw size={13} style={{ animation: 'ctSpin .8s linear infinite' }} /> : <Send size={13} />}
            {isAr ? 'إرسال الرد' : 'Send Reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Message Detail ──────────────────────────────────────── */
function MessageDetail({ msgId, onBack, onUpdated, lang }) {
  const isAr = lang === 'ar';
  const [msg,      setMsg]      = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showReply,setReply]    = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/contact/${msgId}`)
      .then(({ data }) => setMsg(data.data))
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  }, [msgId]);

  const handleClose = async () => {
    try {
      await api.patch(`/contact/${msg.id}/status`, { status: 'closed' });
      setMsg(p => ({ ...p, status: 'closed' }));
      toast.success(isAr ? 'تم الإغلاق' : 'Closed');
      onUpdated();
    } catch { toast.error('فشل'); }
  };

  const handleDelete = async () => {
    if (!window.confirm(isAr ? 'حذف هذه الرسالة؟' : 'Delete this message?')) return;
    setDeleting(true);
    try {
      await api.delete(`/contact/${msg.id}`);
      toast.success(isAr ? 'تم الحذف' : 'Deleted');
      onBack(); onUpdated();
    } catch { toast.error('فشل الحذف'); }
    finally { setDeleting(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <RefreshCw size={22} style={{ animation: 'ctSpin .8s linear infinite', color: 'var(--text-secondary)' }} />
    </div>
  );
  if (!msg) return null;

  const sc = STATUS_CFG[msg.status] || STATUS_CFG.new;
  const pc = PRIO_CFG[msg.priority] || PRIO_CFG.normal;
  const cc = CAT_CFG[msg.category]  || CAT_CFG.general;

  return (
    <div>
      <style>{'@keyframes ctSpin{to{transform:rotate(360deg)}}'}</style>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, fontFamily: 'inherit', padding: 0 }}>
          <ArrowLeft size={15} /> {isAr ? 'رجوع' : 'Back'}
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          {msg.status !== 'replied' && msg.status !== 'closed' && (
            <button onClick={() => setReply(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              <Reply size={14} /> {isAr ? 'رد' : 'Reply'}
            </button>
          )}
          {msg.status !== 'closed' && (
            <button onClick={handleClose} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <CheckCircle size={14} /> {isAr ? 'إغلاق' : 'Close'}
            </button>
          )}
          <button onClick={handleDelete} disabled={deleting} style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {deleting ? <RefreshCw size={13} style={{ animation: 'ctSpin .8s linear infinite' }} /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* Message card */}
      <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
        {/* Header */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              {msg.sender?.avatarUrl
                ? <img src={msg.sender.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 16, fontWeight: 800 }}>{msg.name[0]?.toUpperCase()}</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{msg.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: sc.bg, color: sc.color }}>{isAr ? sc.ar : sc.en}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 99, background: `${pc.color}15`, color: pc.color }}>{isAr ? pc.ar : pc.en}</span>
                <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 99, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {isAr ? cc.ar : cc.en}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <a href={`mailto:${msg.email}`} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontFamily: 'var(--font-en)' }}>{msg.email}</a>
                {msg.phone && <span style={{ fontFamily: 'var(--font-en)' }}>{msg.phone}</span>}
                <span>{new Date(msg.createdAt).toLocaleString(isAr ? 'ar-JO' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 16, fontWeight: 800, margin: '14px 0 0', color: 'var(--text-primary)' }}>{msg.subject}</p>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          <p style={{ fontSize: 14.5, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{msg.message}</p>
        </div>

        {/* Internal note */}
        {msg.adminNote && (
          <div style={{ padding: '14px 22px', borderTop: '1px dashed var(--border)', background: 'rgba(245,158,11,0.04)' }}>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#F59E0B', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Flag size={11} /> {isAr ? 'ملاحظة داخلية' : 'Internal note'}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{msg.adminNote}</p>
          </div>
        )}
      </div>

      {/* Reply card */}
      {msg.replyText && (
        <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid rgba(34,197,94,0.25)', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: 'rgba(34,197,94,0.06)', borderBottom: '1px solid rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Reply size={14} color="#22C55E" />
            <p style={{ fontSize: 13, fontWeight: 700, color: '#22C55E', margin: 0 }}>
              {isAr
                ? `تم الرد بواسطة ${msg.replier?.fullName || 'فريق الدعم'} — ${new Date(msg.repliedAt).toLocaleDateString(isAr ? 'ar-JO' : 'en-US')}`
                : `Replied by ${msg.replier?.fullName || 'Support'} — ${new Date(msg.repliedAt).toLocaleDateString()}`}
            </p>
          </div>
          <div style={{ padding: '18px 20px' }}>
            <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>{msg.replyText}</p>
          </div>
        </div>
      )}

      {showReply && (
        <ReplyModal msg={msg} lang={lang}
          onClose={() => setReply(false)}
          onDone={() => {
            setReply(false);
            setMsg(p => ({ ...p, status: 'replied' }));
            onUpdated();
          }} />
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
const Skel = () => <div style={{ height: 78, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'ctSpin 0s, ctPulse 1.5s infinite' }} />;

/* ════════════════════════════════════════════════════════════
   MAIN TAB
════════════════════════════════════════════════════════════ */
export default function ContactTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';

  const [messages, setMessages]   = useState([]);
  const [stats,    setStats]      = useState(null);
  const [loading,  setLoading]    = useState(true);
  const [statusF,  setStatusF]    = useState('all');
  const [q,        setQ]          = useState('');
  const [selected, setSelected]   = useState(null); // message id for detail view

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (statusF !== 'all') params.status = statusF;
      if (q) params.search = q;
      const [msgRes, statRes] = await Promise.all([
        api.get('/contact', { params }),
        api.get('/contact/stats'),
      ]);
      setMessages(msgRes.data.data?.rows || msgRes.data.data || []);
      setStats(statRes.data.data);
    } catch { setMessages([]); }
    finally { setLoading(false); }
  }, [statusF, q]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── If showing detail ── */
  if (selected) return (
    <MessageDetail
      msgId={selected}
      lang={lang}
      onBack={() => setSelected(null)}
      onUpdated={fetchAll}
    />
  );

  return (
    <div>
      <style>{'@keyframes ctSpin{to{transform:rotate(360deg)}} @keyframes ctPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10, marginBottom: 20 }}>
          {[
            { label: isAr ? 'الكل'      : 'Total',   value: stats.total,   color: '#3B82F6' },
            { label: isAr ? 'جديد'      : 'New',     value: stats.new,     color: '#EF4444' },
            { label: isAr ? 'معلّق'     : 'Pending', value: stats.pending, color: '#F59E0B' },
            { label: isAr ? 'تم الرد'  : 'Replied', value: stats.replied, color: '#22C55E' },
            { label: isAr ? 'مغلق'     : 'Closed',  value: stats.closed,  color: '#6B7280' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', padding: '12px 14px' }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: s.color, margin: '0 0 2px', fontFamily: 'var(--font-en)' }}>{s.value ?? 0}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, border: '1px solid var(--border)' }}>
          {['all', 'new', 'read', 'replied', 'closed'].map(s => {
            const sc = STATUS_CFG[s];
            return (
              <button key={s} onClick={() => setStatusF(s)} style={{ padding: '6px 12px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: statusF === s ? 700 : 500, background: statusF === s ? 'var(--bg-primary)' : 'transparent', color: statusF === s ? (sc?.color || 'var(--text-primary)') : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', boxShadow: statusF === s ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                {s === 'all' ? (isAr ? 'الكل' : 'All') : (isAr ? sc?.ar : sc?.en)}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ flex: 1, minWidth: 180, display: 'flex', alignItems: 'center', gap: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '0 12px', transition: 'border-color 0.2s' }}
          onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
          onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Search size={13} color="var(--text-secondary)" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={isAr ? 'بحث...' : 'Search...'}
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: 'var(--text-primary)', padding: '9px 0', fontFamily: 'inherit' }} />
          {q && <button onClick={() => setQ('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}><X size={13} /></button>}
        </div>

        <button onClick={fetchAll} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw size={14} color="var(--text-secondary)" />
        </button>
      </div>

      {/* Message list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[0,1,2,3].map(i => <Skel key={i} />)}
        </div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '52px 0', color: 'var(--text-secondary)' }}>
          <Mail size={36} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{isAr ? 'لا توجد رسائل' : 'No messages'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {messages.map(msg => {
            const sc = STATUS_CFG[msg.status] || STATUS_CFG.new;
            const pc = PRIO_CFG[msg.priority] || PRIO_CFG.normal;
            const cc = CAT_CFG[msg.category]  || CAT_CFG.general;
            const isNew = msg.status === 'new';

            return (
              <div key={msg.id} onClick={() => setSelected(msg.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 13, padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 12, border: `1px solid ${isNew ? 'rgba(59,130,246,0.25)' : 'var(--border)'}`, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = isNew ? 'rgba(59,130,246,0.25)' : 'var(--border)'}>

                {/* Unread dot */}
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: isNew ? '#3B82F6' : 'transparent', flexShrink: 0, marginTop: 6 }} />

                {/* Avatar */}
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                  {msg.sender?.avatarUrl
                    ? <img src={msg.sender.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 14, fontWeight: 800 }}>{msg.name[0]?.toUpperCase()}</span>}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 13.5, fontWeight: isNew ? 800 : 600, color: 'var(--text-primary)', margin: 0 }}>{msg.name}</p>
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: sc.bg, color: sc.color }}>{isAr ? sc.ar : sc.en}</span>
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{isAr ? cc.ar : cc.en}</span>
                    {msg.priority !== 'normal' && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: pc.color }}>● {isAr ? pc.ar : pc.en}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: isNew ? 700 : 500, color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.subject}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg.message}</p>
                </div>

                {/* Time */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{timeAgo(msg.createdAt, isAr)}</span>
                  <Eye size={14} color="var(--text-secondary)" style={{ opacity: 0.4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
