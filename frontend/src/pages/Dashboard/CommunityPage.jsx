
'use strict';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Heart, MessageSquare, Share2, Flag, Trash2, Send,
  RefreshCw, ImagePlus, Link2, X, ChevronDown,
  AlertTriangle, CheckCircle, MoreHorizontal,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

/* ══════════════════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════════════════ */
const CATS = [
  { key: 'all',            ar: 'الكل',           en: 'All'             },
  { key: 'career_tips',    ar: 'نصائح مهنية',    en: 'Career Tips'     },
  { key: 'company_review', ar: 'تقييم شركات',     en: 'Company Reviews' },
  { key: 'success_story',  ar: 'قصص نجاح',       en: 'Success Stories' },
  { key: 'general',        ar: 'عام',             en: 'General'         },
];

const CAT_COLOR = {
  career_tips:    '#3B82F6',
  job_search:     '#22C55E',
  company_review: '#F59E0B',
  success_story:  '#A855F7',
  general:        '#6B7280',
};

const REPORT_REASONS = {
  ar: ['محتوى مسيء أو مهين','معلومات مضللة','إعلان أو سبام','انتهاك الخصوصية','محتوى غير لائق','سبب آخر'],
  en: ['Offensive content','Misleading info','Advertisement / spam','Privacy violation','Inappropriate content','Other'],
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const timeAgo = (date, isAr) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)     return isAr ? 'الآن' : 'just now';
  if (diff < 3600)   return isAr ? `منذ ${Math.floor(diff/60)} د`       : `${Math.floor(diff/60)}m ago`;
  if (diff < 86400)  return isAr ? `منذ ${Math.floor(diff/3600)} س`     : `${Math.floor(diff/3600)}h ago`;
  if (diff < 604800) return isAr ? `منذ ${Math.floor(diff/86400)} أيام` : `${Math.floor(diff/86400)}d ago`;
  return isAr ? `منذ ${Math.floor(diff/604800)} أسابيع` : `${Math.floor(diff/604800)}w ago`;
};

const getDate = (post) => post.createdAt || post.created_at || null;
const isValidUrl = (s) => { try { new URL(s); return true; } catch { return false; } };

/* ══════════════════════════════════════════════════════════
   AVATAR
══════════════════════════════════════════════════════════ */
function Ava({ name, url, size = 38 }) {
  const init = (name || '?').trim().split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  if (url) return (
    <img src={url} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--border)' }} />
  );
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.33, fontWeight: 700, color: 'var(--bg-primary)', border: '2px solid var(--border)' }}>
      {init}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REPORT MODAL
══════════════════════════════════════════════════════════ */
function ReportModal({ postId, isAr, font, onClose }) {
  const [reason, setReason]   = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!reason) { toast.error(isAr ? 'اختر سبباً' : 'Choose a reason'); return; }
    setLoading(true);
    try {
      await api.post(`/community/${postId}/report`, { reason, details });
      setDone(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الإبلاغ' : 'Report failed'));
    } finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-primary)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} color="#EF4444" />
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, fontFamily: font, margin: 0 }}>
              {isAr ? 'الإبلاغ عن منشور' : 'Report Post'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        {done ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <CheckCircle size={48} color="#22C55E" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 700, fontSize: 15, fontFamily: font, marginBottom: 5 }}>{isAr ? 'تم إرسال البلاغ' : 'Report sent'}</p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font }}>{isAr ? 'سيتم مراجعته خلال 24 ساعة' : 'Will be reviewed within 24h'}</p>
          </div>
        ) : (
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 12 }}>{isAr ? 'ما سبب الإبلاغ؟' : 'Why are you reporting this?'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
              {(isAr ? REPORT_REASONS.ar : REPORT_REASONS.en).map((r, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', border: `1.5px solid ${reason === r ? '#EF4444' : 'var(--border)'}`, background: reason === r ? 'rgba(239,68,68,0.05)' : 'var(--bg-secondary)', transition: 'all 0.15s' }}>
                  <input type="radio" name="rr" value={r} checked={reason === r} onChange={() => setReason(r)} style={{ accentColor: '#EF4444', width: 15, height: 15, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontFamily: font }}>{r}</span>
                </label>
              ))}
            </div>
            <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder={isAr ? 'تفاصيل إضافية (اختياري)...' : 'Additional details (optional)...'} rows={3}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'none', fontSize: 13, outline: 'none', fontFamily: font, boxSizing: 'border-box', marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={onClose} style={{ padding: '8px 15px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button onClick={submit} disabled={loading || !reason} style={{ padding: '8px 18px', borderRadius: 9, border: 'none', background: reason ? '#EF4444' : 'var(--bg-secondary)', color: reason ? '#fff' : 'var(--text-secondary)', cursor: reason ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, fontFamily: font }}>
                {loading ? '...' : (isAr ? 'إرسال' : 'Send')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SHARE MODAL
══════════════════════════════════════════════════════════ */
function ShareModal({ post, isAr, font, onClose }) {
  const url = `${window.location.origin}/community?post=${post.id}`;
  const text = (post.content || '').slice(0, 100);
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'var(--bg-primary)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontWeight: 700, fontSize: 15, fontFamily: font, margin: 0 }}>{isAr ? 'مشاركة' : 'Share'}</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, display: 'flex' }}><X size={18} /></button>
        </div>
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <input readOnly value={url} style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, outline: 'none', fontFamily: 'var(--font-en)' }} />
            <button onClick={copy} style={{ padding: '9px 14px', borderRadius: 9, border: 'none', background: copied ? '#22C55E' : 'var(--text-primary)', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: font, whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
              {copied ? (isAr ? '✓ تم' : '✓ Copied') : (isAr ? 'نسخ' : 'Copy')}
            </button>
          </div>
          <div style={{ display: 'flex', gap: 7 }}>
            {[
              { label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}` },
              { label: 'LinkedIn', color: '#0A66C2', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
              { label: 'X',        color: '#1D9BF0', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: '9px 0', borderRadius: 9, background: s.color, color: '#fff', textAlign: 'center', textDecoration: 'none', fontSize: 12.5, fontWeight: 700 }}>
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   POST CARD
══════════════════════════════════════════════════════════ */
function PostCard({ post, isAr, currentUser, onDelete }) {
  const font    = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const cc      = CAT_COLOR[post.category] || CAT_COLOR.general;
  const catLbl  = CATS.find(c => c.key === post.category);
  const isOwner = currentUser?.id === post.userId;

  const LIKE_KEY = `liked_post_${post.id}`;
  const getStoredLike = () => { try { return localStorage.getItem(LIKE_KEY) === 'true'; } catch { return false; } };
  const initLiked = post.isLiked === true ? true : getStoredLike();

  const [liked,        setLiked]        = useState(initLiked);
  const [likesCount,   setLikesCount]   = useState(post.likesCount || 0);
  const [commCount,    setCommCount]    = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments,     setComments]     = useState([]);
  const [commInput,    setCommInput]    = useState('');
  const [loadingComm,  setLoadingComm]  = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [showMenu,     setShowMenu]     = useState(false);
  const [showReport,   setShowReport]   = useState(false);
  const [showShare,    setShowShare]    = useState(false);
  const [expanded,     setExpanded]     = useState(false);
  const [lightboxSrc,  setLightboxSrc]  = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (post.isLiked === true) { setLiked(true); try { localStorage.setItem(LIKE_KEY, 'true'); } catch {} }
  }, [post.isLiked]);

  useEffect(() => {
    const h = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleLike = async () => {
    if (!currentUser) { toast.error(isAr ? 'سجّل دخولك أولاً' : 'Please log in'); return; }
    const prev = liked; const next = !prev;
    setLiked(next); setLikesCount(c => prev ? Math.max(0, c - 1) : c + 1);
    try { localStorage.setItem(LIKE_KEY, String(next)); } catch {}
    try {
      const { data } = await api.post(`/community/${post.id}/like`);
      setLiked(data.data.liked); setLikesCount(data.data.likesCount);
      try { localStorage.setItem(LIKE_KEY, String(data.data.liked)); } catch {}
    } catch {
      setLiked(prev); setLikesCount(c => prev ? c + 1 : Math.max(0, c - 1));
      try { localStorage.setItem(LIKE_KEY, String(prev)); } catch {}
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComm(true);
      try { const { data } = await api.get(`/community/${post.id}/comments`); setComments(data.data || []); }
      catch { toast.error(isAr ? 'فشل تحميل التعليقات' : 'Failed to load comments'); }
      finally { setLoadingComm(false); }
    }
    setShowComments(p => !p);
  };

  const submitComment = async () => {
    if (!commInput.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/community/${post.id}/comments`, { content: commInput });
      setComments(c => [...c, data.data]); setCommInput(''); setCommCount(c => c + 1);
    } catch { toast.error(isAr ? 'فشل إضافة التعليق' : 'Failed to add comment'); }
    finally { setSubmitting(false); }
  };

  const LONG = 320;
  const isLong = (post.content || '').length > LONG;

  // ✅ FIX: handle string, array, or null mediaUrls
  const rawMedia = post.mediaUrls ?? post.media_urls ?? [];
  const allMedia = Array.isArray(rawMedia)
    ? rawMedia
    : typeof rawMedia === 'string' && rawMedia.trim()
      ? rawMedia.startsWith('[')
        ? (() => { try { return JSON.parse(rawMedia); } catch { return [rawMedia]; } })()
        : [rawMedia]
      : [];

  // ✅ FIX: image = ends with image extension OR is from our R2 upload bucket (not external URLs)
  const isUploadedImage = (u) => {
    if (!u) return false;
    // Only treat as image if it ends with image extension
    return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(u);
  };
  const imgMedia = allMedia.filter(isUploadedImage);
  const urlMedia = allMedia.filter(u => u && !isUploadedImage(u));

  return (
    <>
      <article style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', marginBottom: 12, transition: 'box-shadow 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.07)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>

        {/* Author */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 13 }}>
          <Ava name={post.author?.fullName} url={post.author?.avatarUrl} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 14, fontFamily: font }}>{post.author?.fullName || '—'}</span>
              {['admin','moderator'].includes(post.author?.role) && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: '#3B82F6', fontFamily: 'var(--font-en)' }}>Moderator</span>
              )}
              {catLbl && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 99, background: `${cc}18`, color: cc, fontFamily: font }}>
                  {isAr ? catLbl.ar : catLbl.en}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span>{timeAgo(getDate(post), isAr)}</span>
              {post.author?.headline && <><span style={{ opacity: 0.35 }}>·</span><span style={{ fontFamily: font, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{post.author.headline}</span></>}
            </div>
          </div>

          {/* Menu */}
          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setShowMenu(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px 6px', borderRadius: 7, display: 'flex' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
              <MoreHorizontal size={17} />
            </button>
            {showMenu && (
              <div style={{ position: 'absolute', [isAr ? 'left' : 'right']: 0, top: '110%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 11, padding: '5px 0', minWidth: 150, zIndex: 50, boxShadow: '0 8px 28px rgba(0,0,0,0.15)' }}>
                {[
                  { icon: <Share2 size={14} />, label: isAr ? 'مشاركة' : 'Share', onClick: () => { setShowMenu(false); setShowShare(true); } },
                  !isOwner && { icon: <Flag size={14} />, label: isAr ? 'إبلاغ' : 'Report', onClick: () => { setShowMenu(false); setShowReport(true); }, color: '#EF4444' },
                  isOwner && { icon: <Trash2 size={14} />, label: isAr ? 'حذف' : 'Delete', onClick: () => { setShowMenu(false); onDelete(post.id); }, color: '#EF4444' },
                ].filter(Boolean).map((item, i) => (
                  <button key={i} onClick={item.onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', border: 'none', background: 'transparent', cursor: 'pointer', color: item.color || 'var(--text-primary)', fontFamily: font, fontSize: 13, transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                    {item.icon}{item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <>
            <p style={{ fontSize: 14.5, lineHeight: 1.75, color: 'var(--text-primary)', fontFamily: font, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: '0 0 12px' }}>
              {isLong && !expanded ? post.content.slice(0, LONG) + '...' : post.content}
            </p>
            {isLong && (
              <button onClick={() => setExpanded(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12.5, fontFamily: font, padding: '2px 0', display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10 }}>
                {expanded ? (isAr ? 'عرض أقل' : 'Show less') : (isAr ? 'عرض المزيد' : 'Show more')}
                <ChevronDown size={13} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
            )}
          </>
        )}

        {/* Images */}
        {imgMedia.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: imgMedia.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 5, marginBottom: 12, borderRadius: 12, overflow: 'hidden' }}>
            {imgMedia.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt="" onClick={() => setLightboxSrc(src)}
                style={{ width: '100%', height: imgMedia.length === 1 ? 320 : imgMedia.length === 2 ? 220 : 160, objectFit: 'cover', display: 'block', borderRadius: imgMedia.length === 1 ? 12 : 0, cursor: 'zoom-in', userSelect: 'none', transition: 'opacity 0.15s' }}
                onMouseEnter={e => { e.target.style.opacity = '0.92'; }}
                onMouseLeave={e => { e.target.style.opacity = '1'; }}
                onError={e => { e.target.style.display = 'none'; }}
              />
            ))}
          </div>
        )}

        {/* URL links — ✅ enhanced display */}
        {urlMedia.length > 0 && urlMedia.map((url, i) => {
          let hostname = "";
          try { hostname = new URL(url).hostname.replace("www.", ""); } catch {}
          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 15px", borderRadius: 12, border: "1px solid var(--border)", background: "var(--bg-secondary)", textDecoration: "none", color: "var(--text-primary)", marginBottom: 10, transition: "border-color .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--text-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg-primary)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Link2 size={16} color="var(--text-secondary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 11.5, color: "var(--text-secondary)", margin: "0 0 2px", fontFamily: "var(--font-en)", fontWeight: 600, textTransform: "lowercase" }}>{hostname || "link"}</p>
                <p style={{ fontSize: 13, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--font-en)" }}>{url}</p>
              </div>
              <span style={{ fontSize: 13, color: "var(--text-secondary)", flexShrink: 0 }}>↗</span>
            </a>
          );
        })}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {post.tags.map(t => <span key={t} style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>#{t}</span>)}
          </div>
        )}

        {/* Action bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, paddingTop: 11, borderTop: '1px solid var(--border)' }}>
          <ActBtn onClick={handleLike} active={liked} activeColor="#EF4444"
            icon={<Heart size={15} fill={liked ? '#EF4444' : 'none'} color={liked ? '#EF4444' : 'currentColor'} />}
            label={likesCount > 0 ? String(likesCount) : (isAr ? 'إعجاب' : 'Like')} />
          <ActBtn onClick={toggleComments} active={showComments}
            icon={<MessageSquare size={15} />}
            label={commCount > 0 ? String(commCount) : (isAr ? 'تعليق' : 'Comment')} />
          <ActBtn onClick={() => setShowShare(true)}
            icon={<Share2 size={15} />}
            label={isAr ? 'مشاركة' : 'Share'} />
        </div>

        {/* Comments */}
        {showComments && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            {loadingComm ? (
              <div style={{ textAlign: 'center', padding: 12 }}><RefreshCw size={16} style={{ animation: 'cspin 1s linear infinite', color: 'var(--text-secondary)' }} /></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                {comments.length === 0 && (
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font, textAlign: 'center' }}>
                    {isAr ? 'لا توجد تعليقات بعد' : 'No comments yet'}
                  </p>
                )}
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 9 }}>
                    <Ava name={c.author?.fullName} url={c.author?.avatarUrl} size={30} />
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '8px 12px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontWeight: 700, fontSize: 12.5, fontFamily: font }}>{c.author?.fullName}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>{timeAgo(c.createdAt || c.created_at, isAr)}</span>
                      </div>
                      <p style={{ fontSize: 13, margin: '3px 0 0', fontFamily: font, lineHeight: 1.6 }}>{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {currentUser && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Ava name={currentUser.fullName} url={currentUser.avatarUrl} size={30} />
                <div style={{ flex: 1, display: 'flex', gap: 6 }}>
                  <input value={commInput} onChange={e => setCommInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submitComment()}
                    placeholder={isAr ? 'أضف تعليقاً...' : 'Add a comment...'}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: font }}
                    onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                  />
                  <button onClick={submitComment} disabled={submitting || !commInput.trim()}
                    style={{ width: 34, height: 34, borderRadius: 8, flexShrink: 0, background: commInput.trim() ? 'var(--text-primary)' : 'var(--bg-secondary)', border: 'none', cursor: commInput.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', color: commInput.trim() ? 'var(--bg-primary)' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {showReport && <ReportModal postId={post.id} isAr={isAr} font={font} onClose={() => setShowReport(false)} />}
      {showShare  && <ShareModal  post={post}      isAr={isAr} font={font} onClose={() => setShowShare(false)} />}

      {/* Lightbox */}
      {lightboxSrc && (
        <div onClick={() => setLightboxSrc(null)} style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, cursor: 'zoom-out' }}>
          <button onClick={() => setLightboxSrc(null)} style={{ position: 'absolute', top: 16, right: 16, width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
            <X size={20} color="#fff" />
          </button>
          <img src={lightboxSrc} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 80px rgba(0,0,0,0.5)', cursor: 'default', userSelect: 'none', animation: 'lbIn 0.18s ease' }} />
        </div>
      )}
    </>
  );
}

function ActBtn({ onClick, icon, label, active, activeColor = 'var(--text-primary)' }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 8, border: 'none', background: h ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', color: active ? activeColor : 'var(--text-secondary)', fontSize: 12.5, fontWeight: active ? 600 : 400, transition: 'all 0.15s', fontFamily: 'var(--font-en)' }}>
      {icon}<span>{label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   COMPOSER MODAL — ✅ ALL FEATURES VISIBLE AT ONCE
══════════════════════════════════════════════════════════ */
function ComposerModal({ user, isAr, font, onPost, onClose }) {
  const [content,      setContent]      = useState('');
  const [category,     setCategory]     = useState('general');
  const [tags,         setTags]         = useState('');
  const [imgFiles,     setImgFiles]     = useState([]);
  const [imgPreviews,  setImgPreviews]  = useState([]);
  const [linkUrl,      setLinkUrl]      = useState('');
  const [posting,      setPosting]      = useState(false);
  const fileRef  = useRef(null);
  const textRef  = useRef(null);

  useEffect(() => {
    setTimeout(() => textRef.current?.focus(), 80);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // ✅ canPost — no mode dependency
  const canPost = content.trim() || imgFiles.length > 0 || isValidUrl(linkUrl.trim());

  const MAX_IMG = 5 * 1024 * 1024;

  const addImages = (files) => {
    const arr = Array.from(files);
    const rem = 4 - imgFiles.length;
    const oversized = arr.filter(f => f.size > MAX_IMG);
    const valid     = arr.filter(f => f.size <= MAX_IMG && f.type.startsWith('image/')).slice(0, rem);
    oversized.forEach(f => toast.error(`${f.name} — ${isAr ? 'تجاوزت 5MB' : 'exceeds 5MB'}`));
    if (!valid.length) return;
    setImgFiles(p => [...p, ...valid]);
    setImgPreviews(p => [...p, ...valid.map(f => URL.createObjectURL(f))]);
  };

  const removeImg = (i) => {
    URL.revokeObjectURL(imgPreviews[i]);
    setImgFiles(p => p.filter((_, j) => j !== i));
    setImgPreviews(p => p.filter((_, j) => j !== i));
  };

  const submit = async () => {
    if (!canPost) return;
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append('content', content.trim());
      fd.append('category', category);
      tags.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean).forEach(t => fd.append('tags', t));
      imgFiles.forEach(f => fd.append('images', f));
      // ✅ no mode check — always include link if valid
      // ✅ append URL — try both field names for backend compatibility
      // if (isValidUrl(linkUrl.trim())) {
      //   fd.append('mediaUrls', linkUrl.trim());
      //   // fd.append('linkUrl', linkUrl.trim());
      // }
      if (isValidUrl(linkUrl.trim())) {
  fd.append('mediaUrls', linkUrl.trim());
}

      const { data } = await api.post('/community', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      // ✅ merge local URL into post data in case backend strips it
      const postData = data.data;
      if (isValidUrl(linkUrl.trim()) && (!postData.mediaUrls || postData.mediaUrls.length === 0)) {
        postData.mediaUrls = [linkUrl.trim()];
      }
      onPost({ ...postData, isLiked: false });
      imgPreviews.forEach(u => URL.revokeObjectURL(u));
      onClose();
      toast.success(isAr ? 'تم النشر! ⏱ يُحذف بعد 7 أيام' : 'Posted! ⏱ Auto-deleted in 7 days');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل النشر' : 'Post failed'));
    } finally { setPosting(false); }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backdropFilter: 'blur(2px)' }}
    >
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '92vh', background: 'var(--bg-primary)', borderRadius: 16, display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 16, fontFamily: font, margin: 0, color: 'var(--text-primary)' }}>
            {isAr ? 'إنشاء منشور' : 'Create a post'}
          </p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, borderRadius: 8, display: 'flex', transition: 'background 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <X size={20} />
          </button>
        </div>

        {/* Author row */}
        <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Ava name={user.fullName} url={user.avatarUrl} size={44} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14.5, fontFamily: font, margin: '0 0 4px', color: 'var(--text-primary)' }}>{user.fullName}</p>
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ padding: '3px 10px 3px 8px', borderRadius: 20, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12, outline: 'none', fontFamily: font, cursor: 'pointer', fontWeight: 500 }}>
              {CATS.slice(1).map(c => <option key={c.key} value={c.key}>{isAr ? c.ar : c.en}</option>)}
            </select>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>

          {/* ✅ Text area — always visible */}
          <textarea
            ref={textRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={isAr ? 'عن ماذا تريد أن تتحدث؟' : 'What do you want to talk about?'}
            style={{ width: '100%', minHeight: 100, padding: '8px 0', border: 'none', background: 'transparent', color: 'var(--text-primary)', resize: 'none', fontSize: 15.5, outline: 'none', fontFamily: font, lineHeight: 1.7, boxSizing: 'border-box' }}
          />

          {/* ✅ IMAGE ZONE — always visible */}
          <div style={{ marginBottom: 12 }}>
            {imgPreviews.length === 0 ? (
              /* Drop zone */
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                onDrop={e => { e.preventDefault(); addImages(e.dataTransfer.files); e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                style={{ border: '1.5px dashed var(--border)', borderRadius: 12, padding: '18px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <ImagePlus size={20} color="var(--text-secondary)" />
                <div style={{ textAlign: isAr ? 'right' : 'left' }}>
                  <p style={{ fontSize: 13.5, fontFamily: font, color: 'var(--text-primary)', margin: '0 0 2px', fontWeight: 600 }}>
                    {isAr ? 'اضغط لإضافة صور' : 'Click or drag photos here'}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
                    JPG, PNG, WebP, GIF · max 5MB · up to 4
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: imgPreviews.length === 1 ? '1fr' : 'repeat(2, 1fr)', gap: 4, borderRadius: 12, overflow: 'hidden' }}>
                  {imgPreviews.map((src, i) => (
                    <div key={i} style={{ position: 'relative', background: '#000' }}>
                      <img src={src} alt="" style={{ width: '100%', height: imgPreviews.length === 1 ? 240 : 140, objectFit: 'cover', display: 'block', opacity: 0.95 }} />
                      <button onClick={() => removeImg(i)} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(0,0,0,0.65)', border: '2px solid rgba(255,255,255,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <X size={13} color="#fff" />
                      </button>
                    </div>
                  ))}
                </div>
                {imgFiles.length < 4 && (
                  <button onClick={() => fileRef.current?.click()} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: '1px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: font, transition: 'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                    <ImagePlus size={14} /> {isAr ? 'إضافة المزيد' : 'Add more photos'} ({4 - imgFiles.length} {isAr ? 'متبقية' : 'left'})
                  </button>
                )}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { addImages(e.target.files); e.target.value = ''; }} />
          </div>

          {/* ✅ LINK ZONE — always visible */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', borderRadius: 11, border: `1.5px solid ${isValidUrl(linkUrl.trim()) ? '#22C55E' : 'var(--border)'}`, background: 'var(--bg-secondary)', transition: 'border-color .2s' }}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
              onBlurCapture={e => { e.currentTarget.style.borderColor = isValidUrl(linkUrl.trim()) ? '#22C55E' : 'var(--border)'; }}>
              <Link2 size={15} color={isValidUrl(linkUrl.trim()) ? '#22C55E' : 'var(--text-secondary)'} style={{ flexShrink: 0 }} />
              <input
                value={linkUrl}
                onChange={e => setLinkUrl(e.target.value)}
                placeholder={isAr ? 'أضف رابطاً (اختياري)...' : 'Add a link (optional)...'}
                dir="ltr"
                style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13.5, outline: 'none', fontFamily: 'var(--font-en)' }}
              />
              {linkUrl && (
                <button onClick={() => setLinkUrl('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}>
                  <X size={13} />
                </button>
              )}
              {isValidUrl(linkUrl.trim()) && (
                <span style={{ fontSize: 10, fontWeight: 700, color: '#22C55E', flexShrink: 0, fontFamily: 'var(--font-en)' }}>✓</span>
              )}
            </div>
          </div>

          {/* ✅ TAGS — always visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: font }}>#</span>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder={isAr ? 'وسوم (اختياري): hr, tech, leadership...' : 'Tags (optional): hr, tech, leadership...'}
              style={{ flex: 1, border: 'none', background: 'transparent', color: 'var(--text-secondary)', fontSize: 12.5, outline: 'none', fontFamily: 'var(--font-en)' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-primary)' }}>
          {/* What's included indicators */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => fileRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 9, border: 'none', background: imgFiles.length > 0 ? 'rgba(99,102,241,.12)' : 'var(--bg-secondary)', cursor: 'pointer', color: imgFiles.length > 0 ? '#6366f1' : 'var(--text-secondary)', fontSize: 12.5, fontFamily: font, fontWeight: imgFiles.length > 0 ? 700 : 400, transition: 'all 0.15s' }}>
              <ImagePlus size={15} />
              {imgFiles.length > 0
                ? <span>{imgFiles.length} {isAr ? 'صور' : 'photo' + (imgFiles.length > 1 ? 's' : '')}</span>
                : <span className="hide-xs">{isAr ? 'صور' : 'Photos'}</span>
              }
            </button>

            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font, whiteSpace: 'nowrap' }}>
              ⏱ {isAr ? 'يُحذف بعد 7 أيام' : 'Auto-deleted in 7d'}
            </span>
          </div>

          <button
            onClick={submit}
            disabled={posting || !canPost}
            style={{ padding: '10px 28px', borderRadius: 22, border: 'none', background: canPost ? 'var(--text-primary)' : 'var(--bg-secondary)', color: canPost ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: canPost ? 'pointer' : 'default', fontSize: 14, fontWeight: 700, fontFamily: font, transition: 'all 0.2s', minWidth: 90, opacity: posting ? .7 : 1 }}
            onMouseEnter={e => { if (canPost) e.currentTarget.style.opacity = '.88'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
          >
            {posting ? '...' : (isAr ? 'نشر' : 'Post')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Trigger bar ── */
function Composer({ user, isAr, font, onPost }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Ava name={user.fullName} url={user.avatarUrl} size={40} />
        <button
          onClick={() => setOpen(true)}
          style={{ flex: 1, padding: '10px 16px', borderRadius: 22, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: 14, fontFamily: font, cursor: 'text', textAlign: isAr ? 'right' : 'left', transition: 'border-color 0.15s, background 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
        >
          {isAr ? 'شارك شيئاً مع المجتمع المهني...' : 'Share with the professional community...'}
        </button>
        {/* Quick photo button */}
        <button onClick={() => setOpen(true)} style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-secondary)', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
          <ImagePlus size={16} />
        </button>
      </div>
      {open && <ComposerModal user={user} isAr={isAr} font={font} onPost={onPost} onClose={() => setOpen(false)} />}
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   FLOATING POST BUTTON
══════════════════════════════════════════════════════════ */
function FloatingPostBtn({ isAr, font, onOpen }) {
  const STORAGE_KEY = 'fab_community_pos';
  const DEFAULT_POS = { bottom: 88, right: 20 };
  const getInitPos = () => { try { const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); if (s && typeof s.bottom === 'number') return s; } catch {} return DEFAULT_POS; };

  const [pos,       setPos]       = useState(getInitPos);
  const [dragging,  setDragging]  = useState(false);
  const [hasDragged,setHasDragged]= useState(false);
  const dragRef = useRef(null);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    dragRef.current = { startX: t.clientX, startY: t.clientY, origBottom: pos.bottom, origRight: pos.right, moved: false };
    setDragging(true);
  };
  const onTouchMove = (e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - dragRef.current.startX;
    const dy = t.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
    const W = window.innerWidth; const H = window.innerHeight; const S = 56;
    setPos({ right: Math.max(8, Math.min(W - S - 8, dragRef.current.origRight - dx)), bottom: Math.max(8, Math.min(H - S - 8, dragRef.current.origBottom + dy)) });
    e.preventDefault();
  };
  const onTouchEnd = () => {
    setDragging(false);
    if (dragRef.current?.moved) { setHasDragged(true); try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pos)); } catch {} }
    dragRef.current = null;
  };
  const onMouseDown = (e) => {
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origBottom: pos.bottom, origRight: pos.right, moved: false };
    setDragging(true);
    const onMove = (ev) => {
      const dx = ev.clientX - dragRef.current.startX; const dy = ev.clientY - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      const W = window.innerWidth; const H = window.innerHeight; const S = 56;
      setPos({ right: Math.max(8, Math.min(W - S - 8, dragRef.current.origRight - dx)), bottom: Math.max(8, Math.min(H - S - 8, dragRef.current.origBottom + dy)) });
    };
    const onUp = () => {
      setDragging(false);
      if (dragRef.current?.moved) { setHasDragged(true); setPos(prev => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prev)); } catch {} return prev; }); }
      else onOpen();
      dragRef.current = null;
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };
  const handleClick = () => { if (!hasDragged) onOpen(); setHasDragged(false); };

  return (
    <button className="fab-btn" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onClick={handleClick}
      style={{ position: 'fixed', bottom: pos.bottom, right: pos.right, width: 56, height: 56, borderRadius: '50%', background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: dragging ? 'grabbing' : 'grab', zIndex: 900, alignItems: 'center', justifyContent: 'center', boxShadow: dragging ? '0 12px 40px rgba(0,0,0,0.35)' : '0 4px 20px rgba(0,0,0,0.25)', transition: dragging ? 'none' : 'box-shadow 0.2s', animation: 'fabIn 0.3s ease', userSelect: 'none', touchAction: 'none' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CommunityPage() {
  const { user }  = useAuthStore();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);

  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [category,      setCategory]      = useState('all');
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(false);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [composerOpen,  setComposerOpen]  = useState(false);

  const fetchPosts = useCallback(async (cat, pg, append = false) => {
    if (!append) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.get('/community', { params: { category: cat === 'all' ? undefined : cat, page: pg, limit: 15 } });
      const items = data.data || [];
      setPosts(prev => append ? [...prev, ...items] : items);
      setHasMore(items.length === 15);
    } catch { toast.error(isAr ? 'فشل تحميل المنشورات' : 'Failed to load posts'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [isAr]);

  useEffect(() => { setPage(1); fetchPosts(category, 1, false); }, [category]);

  const loadMore = () => { const n = page + 1; setPage(n); fetchPosts(category, n, true); };
  const handleNewPost = (p) => setPosts(prev => [p, ...prev]);
  const handleDelete  = async (id) => {
    if (!window.confirm(isAr ? 'حذف هذا المنشور؟' : 'Delete this post?')) return;
    try { await api.delete(`/community/${id}`); setPosts(prev => prev.filter(p => p.id !== id)); toast.success(isAr ? 'تم الحذف' : 'Deleted'); }
    catch { toast.error(isAr ? 'فشل الحذف' : 'Delete failed'); }
  };

  return (
 
<div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', direction: isAr ? 'rtl' : 'ltr', fontFamily: font }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MobileTopBar title={isAr ? 'المجتمع' : 'Community'} />

        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 680, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Composer */}
          {user
            ? <Composer user={user} isAr={isAr} font={font} onPost={handleNewPost} />
            : (
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '13px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={17} color="var(--text-secondary)" />
                </div>
                <p style={{ flex: 1, fontSize: 14, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>
                  {isAr ? 'سجّل دخولك للمشاركة في المجتمع' : 'Log in to participate in the community'}
                </p>
              </div>
            )
          }

          {/* Category filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, overflowX: 'auto', paddingBottom: 3, scrollbarWidth: 'none' }}>
            {CATS.map(c => {
              const active = category === c.key;
              const cc = CAT_COLOR[c.key] || '#6B7280';
              return (
                <button key={c.key} onClick={() => setCategory(c.key)} style={{ padding: '6px 14px', borderRadius: 99, flexShrink: 0, border: `1.5px solid ${active ? cc : 'var(--border)'}`, background: active ? `${cc}18` : 'var(--bg-primary)', color: active ? cc : 'var(--text-secondary)', fontSize: 12.5, fontWeight: active ? 700 : 400, cursor: 'pointer', fontFamily: font, transition: 'all 0.18s' }}>
                  {isAr ? c.ar : c.en}
                </button>
              );
            })}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <RefreshCw size={26} style={{ animation: 'cspin 1s linear infinite', color: 'var(--text-secondary)' }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-secondary)' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 14px', opacity: 0.2 }} />
              <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{isAr ? 'لا توجد منشورات بعد' : 'No posts yet'}</p>
              <p style={{ fontFamily: font, fontSize: 13, opacity: 0.6 }}>{isAr ? 'كن أول من يشارك!' : 'Be the first to share!'}</p>
            </div>
          ) : (
            <>
              {posts.map(post => <PostCard key={post.id} post={post} isAr={isAr} currentUser={user} onDelete={handleDelete} />)}
              {hasMore && (
                <button onClick={loadMore} disabled={loadingMore}
                  style={{ width: '100%', padding: '11px', borderRadius: 12, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  {loadingMore ? <><RefreshCw size={14} style={{ animation: 'cspin 1s linear infinite' }} /> {isAr ? 'جاري التحميل...' : 'Loading...'}</> : (isAr ? 'تحميل المزيد' : 'Load more')}
                </button>
              )}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {user && <FloatingPostBtn isAr={isAr} font={font} onOpen={() => setComposerOpen(true)} />}
      {composerOpen && <ComposerModal user={user} isAr={isAr} font={font} onPost={handleNewPost} onClose={() => setComposerOpen(false)} />}

      <style>{`
        @keyframes cspin { to { transform: rotate(360deg); } }
        @keyframes lbIn  { from { opacity: 0; transform: scale(0.93); } to { opacity: 1; transform: scale(1); } }
        @keyframes fabIn { from { opacity: 0; transform: scale(0.7); } to { opacity: 1; transform: scale(1); } }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
        @media (max-width: 640px) { main { padding: 14px 10px 80px !important; } }
        @media (max-width: 400px) { .hide-xs { display: none !important; } }
        .fab-btn { display: none !important; }
        @media (max-width: 1024px) { .fab-btn { display: flex !important; } }
      `}</style>
    </div>
  );
}