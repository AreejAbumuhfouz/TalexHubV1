
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BookOpen, Search, Star, Users, Filter,
  RefreshCw, ChevronLeft, ChevronRight, X,
  Globe, Lock, CheckCircle,
  Download, FileText, ShoppingCart,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';
import { useSearchParams } from 'react-router-dom';

const LEVELS = [
  { key: '',             ar: 'كل المستويات', en: 'All Levels'   },
  { key: 'beginner',     ar: 'مبتدئ',        en: 'Beginner'     },
  { key: 'intermediate', ar: 'متوسط',        en: 'Intermediate' },
  { key: 'advanced',     ar: 'متقدم',        en: 'Advanced'     },
];
const LANGUAGES = [
  { key: '',   ar: 'كل اللغات',  en: 'All Languages' },
  { key: 'ar', ar: 'العربية',    en: 'Arabic'        },
  { key: 'en', ar: 'الإنجليزية', en: 'English'       },
];
const SORT_OPTIONS = [
  { key: 'popular', ar: 'الأكثر تحميلاً', en: 'Most Downloaded' },
  { key: 'rating',  ar: 'أعلى تقييم',     en: 'Top Rated'       },
  { key: 'newest',  ar: 'الأحدث',         en: 'Newest'          },
];
const LEVEL_COLOR = {
  beginner:     { bg: 'rgba(34,197,94,0.1)',  color: '#22C55E' },
  intermediate: { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
  advanced:     { bg: 'rgba(168,85,247,0.1)', color: '#A855F7' },
};

const fmtSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

/* ══════════════════════════════════════════════════════════
   COURSE CARD
══════════════════════════════════════════════════════════ */
function CourseCard({ course, isAr, font, onClick, enrolled }) {
  const lc    = LEVEL_COLOR[course.level] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
  const title = isAr && course.titleAr ? course.titleAr : course.title;
  const desc  = isAr && course.descriptionAr ? course.descriptionAr : course.description;

  return (
    <div
      onClick={() => onClick(course)}
      style={{
        background: 'var(--bg-primary)',
        border: `1.5px solid ${enrolled ? 'rgba(34,197,94,.3)' : 'var(--border)'}`,
        borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
        transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {enrolled && (
        <div style={{ position: 'absolute', top: 10, insetInlineStart: 10, zIndex: 2, display: 'flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: '#22C55E', color: '#fff', fontSize: 11, fontWeight: 700 }}>
          <CheckCircle size={10} /> {isAr ? 'مسجّل' : 'Enrolled'}
        </div>
      )}

      {/* Thumbnail */}
      <div style={{ width: '100%', height: 148, background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none'; }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <FileText size={36} color="var(--text-secondary)" style={{ opacity: 0.2 }} />
          </div>
        )}
        {/* Free badge */}
        {course.isFree && (
          <div style={{ position: 'absolute', top: 10, insetInlineEnd: 10, padding: '3px 10px', borderRadius: 99, background: '#22C55E', color: '#fff', fontSize: 11, fontWeight: 700 }}>
            FREE
          </div>
        )}
        {/* level */}
        {course.level && (
          <div style={{ position: 'absolute', bottom: 8, insetInlineStart: 8, padding: '2px 8px', borderRadius: 99, background: lc.bg, color: lc.color, fontSize: 10.5, fontWeight: 600, border: `1px solid ${lc.color}30` }}>
            {course.level}
          </div>
        )}
        {/* PDF size */}
        {course.pdfSize && (
          <div style={{ position: 'absolute', bottom: 8, insetInlineEnd: 8, padding: '2px 7px', borderRadius: 99, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 10, fontFamily: 'var(--font-en)' }}>
            {fmtSize(course.pdfSize)}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '13px 15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontWeight: 700, fontSize: 13.5, fontFamily: font, margin: '0 0 5px', color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </p>
        {desc && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.5, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
            {desc}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
          <FileText size={11} />
          <span style={{ fontFamily: 'var(--font-en)' }}>
            PDF {course.isFreeDownload ? (isAr ? '· تحميل مفتوح' : '· Open download') : (isAr ? '· يتطلب تسجيل' : '· Requires enrollment')}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 9, borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {course.ratingAvg > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
                <Star size={11} fill="#F59E0B" /> {Number(course.ratingAvg).toFixed(1)}
                <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontFamily: 'var(--font-en)' }}>({course.ratingCount || 0})</span>
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, fontFamily: 'var(--font-en)', color: course.isFree ? '#22C55E' : 'var(--text-primary)' }}>
            {course.isFree ? (isAr ? 'مجاني' : 'Free') : `$${Number(course.price || 0).toFixed(0)}`}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   COURSE DETAIL MODAL
══════════════════════════════════════════════════════════ */
function CourseDetailModal({ course, isAr, font, onClose, enrolledIds, onEnroll }) {
  const { user }    = useAuthStore();
  const enrolled    = enrolledIds.has(course.id);
  const canDownload = course.isFreeDownload || enrolled;
  const lc          = LEVEL_COLOR[course.level] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
  const title       = isAr && course.titleAr ? course.titleAr : course.title;
  const desc        = isAr && course.descriptionAr ? course.descriptionAr : course.description;

  const [enrolling,   setEnrolling]   = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* ── download PDF ── */
  const handleDownload = async () => {
    if (!user && !course.isFreeDownload) {
      toast.error(isAr ? 'سجّل دخولك أولاً' : 'Please log in first');
      return;
    }
    setDownloading(true);
    try {
      const { data } = await api.get(`/courses/${course.id}/download`);
      const { url, filename } = data.data;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `${title}.pdf`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(isAr ? 'بدأ التحميل!' : 'Download started!');
    } catch (err) {
      const msg = err.response?.data?.message;
      // not enrolled → prompt enroll
      if (err.response?.data?.code === 'NOT_ENROLLED') {
        toast.error(isAr ? 'سجّل في الكورس أولاً للتحميل' : 'Enroll first to download');
      } else {
        toast.error(msg || (isAr ? 'فشل التحميل' : 'Download failed'));
      }
    } finally {
      setDownloading(false);
    }
  };

  /* ── enroll ── */
  const handleEnroll = async () => {
    if (!user) { toast.error(isAr ? 'سجّل دخولك أولاً' : 'Please log in'); return; }
    setEnrolling(true);
    try {
      await api.post(`/courses/${course.id}/enroll`);
      onEnroll(course.id);
      toast.success(isAr ? 'تم التسجيل! يمكنك الآن تحميل الكورس.' : 'Enrolled! You can now download.');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('مسجّل') || msg.includes('already')) {
        onEnroll(course.id);
      } else {
        toast.error(msg || (isAr ? 'فشل التسجيل' : 'Enrollment failed'));
      }
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(2px)' }}
    >
      <div style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', background: 'var(--bg-primary)', borderRadius: 20, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>

        {/* Thumbnail */}
        <div style={{ position: 'relative', height: 180, background: 'var(--bg-secondary)', flexShrink: 0 }}>
          {course.thumbnailUrl
            ? <img src={course.thumbnailUrl} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={52} color="var(--text-secondary)" style={{ opacity: 0.15 }} />
              </div>
          }
          <button onClick={onClose} style={{ position: 'absolute', top: 12, insetInlineEnd: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} color="#fff" />
          </button>
          <div style={{ position: 'absolute', bottom: 12, insetInlineEnd: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(239,68,68,.9)', color: '#fff', fontSize: 11.5, fontWeight: 700 }}>
            <FileText size={11} /> PDF {course.pdfSize ? `· ${fmtSize(course.pdfSize)}` : ''}
          </div>
          {enrolled && (
            <div style={{ position: 'absolute', bottom: 12, insetInlineStart: 12, display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: 'rgba(34,197,94,.9)', color: '#fff', fontSize: 11.5, fontWeight: 700 }}>
              <CheckCircle size={11} /> {isAr ? 'مسجّل' : 'Enrolled'}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '18px 20px' }}>
          {/* badges */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 10, flexWrap: 'wrap' }}>
            {course.level && (
              <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: lc.bg, color: lc.color }}>{course.level}</span>
            )}
            {course.language && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11.5, background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                <Globe size={11} /> {course.language === 'ar' ? 'العربية' : 'English'}
              </span>
            )}
            {course.isFreeDownload && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 99, fontSize: 11.5, background: 'rgba(34,197,94,0.1)', color: '#22C55E', fontWeight: 600 }}>
                <Download size={11} /> {isAr ? 'تحميل مفتوح' : 'Open download'}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: font, margin: '0 0 8px', lineHeight: 1.4 }}>{title}</h2>

          {/* stats */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 16, flexWrap: 'wrap' }}>
            {course.ratingAvg > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>
                <Star size={13} fill="#F59E0B" /> {Number(course.ratingAvg).toFixed(1)} ({course.ratingCount || 0})
              </span>
            )}
            {course.downloadCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <Download size={13} /> {course.downloadCount.toLocaleString()} {isAr ? 'تحميل' : 'downloads'}
              </span>
            )}
            {course.enrolledCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <Users size={13} /> {course.enrolledCount.toLocaleString()} {isAr ? 'مسجّل' : 'enrolled'}
              </span>
            )}
          </div>

          {/* description */}
          {desc && (
            <p style={{ fontSize: 13.5, lineHeight: 1.75, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 16 }}>{desc}</p>
          )}

          {/* skills */}
          {course.skillsCovered?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em', display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle size={12} /> {isAr ? 'المهارات المكتسبة' : 'Skills covered'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {course.skillsCovered.map((s, i) => (
                  <span key={i} style={{ padding: '4px 11px', borderRadius: 99, fontSize: 12, background: 'rgba(34,197,94,0.08)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* access info box */}
          <div style={{ padding: '13px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            {course.isFreeDownload ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: font, color: 'var(--text-secondary)' }}>
                <Download size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                {isAr ? 'هذا الكورس متاح للتحميل للجميع بدون تسجيل' : 'This course is available for download without enrollment'}
              </div>
            ) : enrolled ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: font, color: 'var(--text-secondary)' }}>
                <CheckCircle size={16} color="#22C55E" style={{ flexShrink: 0 }} />
                {isAr ? 'أنت مسجّل — يمكنك تحميل الـ PDF مباشرة' : 'You are enrolled — download the PDF directly'}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: font, color: 'var(--text-secondary)' }}>
                <Lock size={16} style={{ flexShrink: 0 }} />
                {isAr ? 'سجّل في الكورس للوصول لملف الـ PDF' : 'Enroll to access the PDF file'}
              </div>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '13px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: 'var(--bg-primary)', gap: 12 }}>
          <div>
            <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-en)', margin: 0, color: course.isFree ? '#22C55E' : 'var(--text-primary)' }}>
              {course.isFree ? (isAr ? 'مجاني' : 'Free') : `$${Number(course.price || 0).toFixed(0)}`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {/* Enroll button — only if not enrolled and not open download */}
            {!enrolled && !course.isFreeDownload && (
              <button onClick={handleEnroll} disabled={enrolling} style={{
                padding: '11px 18px', borderRadius: 11,
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                cursor: enrolling ? 'default' : 'pointer',
                fontSize: 13, fontWeight: 600, fontFamily: font,
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'opacity .2s',
              }}>
                {enrolling
                  ? <RefreshCw size={13} style={{ animation: 'spin .8s linear infinite' }} />
                  : <ShoppingCart size={13} />
                }
                {course.isFree ? (isAr ? 'تسجيل مجاني' : 'Enroll free') : (isAr ? 'اشترك' : 'Enroll')}
              </button>
            )}

            {/* Download button */}
            {canDownload && (
              <button onClick={handleDownload} disabled={downloading} style={{
                padding: '11px 22px', borderRadius: 11,
                background: '#22C55E', color: '#fff', border: 'none',
                cursor: downloading ? 'default' : 'pointer',
                fontSize: 14, fontWeight: 700, fontFamily: font,
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'opacity .2s',
                opacity: downloading ? 0.7 : 1,
              }}>
                {downloading
                  ? <RefreshCw size={14} style={{ animation: 'spin .8s linear infinite' }} />
                  : <Download size={14} />
                }
                {isAr ? 'تحميل PDF' : 'Download PDF'}
              </button>
            )}

            {/* Not enrolled + not open → show download locked */}
            {!canDownload && !enrolled && (
              <button onClick={handleDownload} disabled={downloading} style={{
                padding: '11px 22px', borderRadius: 11,
                background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none',
                cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: font,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <Download size={14} />
                {isAr ? 'تحميل PDF' : 'Download PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CoursesPage() {
  const { user }  = useAuthStore();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses,     setCourses]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [activeTab,   setActiveTab]   = useState('all');
  const [myCourses,   setMyCourses]   = useState([]);
  const [myLoading,   setMyLoading]   = useState(false);

  const [search,     setSearch]     = useState(searchParams.get('search') || '');
  const [level,      setLevel]      = useState(searchParams.get('level')  || '');
  const [langFilter, setLangFilter] = useState(searchParams.get('lang')   || '');
  const [sort,       setSort]       = useState(searchParams.get('sort')   || 'popular');
  const [freeOnly,   setFreeOnly]   = useState(searchParams.get('free') === 'true');

  const [page,  setPage]  = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT      = 12;
  const totalPages = Math.ceil(total / LIMIT);
  const searchTimer = useRef(null);

  /* enrolled IDs */
  useEffect(() => {
    if (!user) return;
    api.get('/courses/my')
      .then(({ data }) => {
        const ids = new Set(
          (data.data || []).map(uc => uc.courseId || uc.course?.id).filter(Boolean)
        );
        setEnrolledIds(ids);
      })
      .catch(() => {});
  }, [user]);

  /* fetch all courses */
  const fetchCourses = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const params = { page: pg, limit: LIMIT };
      if (search)     params.search   = search;
      if (level)      params.level    = level;
      if (langFilter) params.language = langFilter;
      if (freeOnly)   params.free     = 'true';
      if (sort === 'popular') params.sortBy = 'popular';
      if (sort === 'rating')  params.sortBy = 'rating';
      if (sort === 'newest')  params.sortBy = 'newest';

      const { data } = await api.get('/courses', { params });
      setCourses(data.data || []);
      setTotal(data.pagination?.total || (data.data || []).length);
      setPage(pg);
    } catch {
      toast.error(isAr ? 'فشل تحميل الكورسات' : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [search, level, langFilter, freeOnly, sort]);

  /* fetch my courses */
  const fetchMyCourses = useCallback(async () => {
    if (!user) return;
    setMyLoading(true);
    try {
      const { data } = await api.get('/courses/my');
      setMyCourses(data.data || []);
    } catch {
      setMyCourses([]);
    } finally {
      setMyLoading(false);
    }
  }, [user]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchCourses(1), search ? 400 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [search, level, langFilter, freeOnly, sort]);

  useEffect(() => {
    if (activeTab === 'my') fetchMyCourses();
  }, [activeTab]);

  const resetFilters = () => {
    setSearch(''); setLevel(''); setLangFilter(''); setFreeOnly(false); setSort('popular');
    setSearchParams({}, { replace: true });
  };

  const handleEnroll = (courseId) => {
    setEnrolledIds(prev => new Set([...prev, courseId]));
    fetchMyCourses();
  };

  const hasActiveFilters = search || level || langFilter || freeOnly || sort !== 'popular';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MobileTopBar title={isAr ? 'الكورسات' : 'Courses'} />

        <main style={{ flex: 1, padding: 'clamp(14px,3vw,26px)', maxWidth: 1100, margin: '0 auto', width: '100%', boxSizing: 'border-box', paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ marginBottom: 22 }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 3px', fontFamily: font, display: 'flex', alignItems: 'center', gap: 9 }}>
              <BookOpen size={21} /> {isAr ? 'الكورسات' : 'Courses'}
            </h1>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
              {isAr ? 'كتب PDF · تحميل مباشر ' : 'PDF books · Direct download '}
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, padding: 5, width: 'fit-content' }}>
            {[{ key: 'all', ar: 'كل الكورسات', en: 'All Courses' }, { key: 'my', ar: 'كورساتي', en: 'My Courses' }].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: '7px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeTab === t.key ? 'var(--text-primary)' : 'transparent',
                color: activeTab === t.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: activeTab === t.key ? 700 : 500, fontFamily: font,
                transition: 'all .15s',
              }}>
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>

          {/* MY COURSES */}
          {activeTab === 'my' && (
            myLoading
              ? <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><RefreshCw size={26} color="var(--text-secondary)" style={{ animation: 'spin .8s linear infinite' }} /></div>
              : myCourses.length === 0
                ? (
                  <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--text-secondary)' }}>
                    <BookOpen size={48} style={{ margin: '0 auto 14px', opacity: .2 }} />
                    <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, marginBottom: 5 }}>{isAr ? 'لا توجد كورسات بعد' : 'No courses yet'}</p>
                    <button onClick={() => setActiveTab('all')} style={{ padding: '9px 22px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
                      {isAr ? 'تصفح الكورسات' : 'Browse Courses'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                    {myCourses.map(uc => {
                      const c = uc.course || uc;
                      if (!c?.id) return null;
                      return <CourseCard key={c.id} course={c} isAr={isAr} font={font} onClick={setSelected} enrolled />;
                    })}
                  </div>
                )
          )}

          {/* ALL COURSES */}
          {activeTab === 'all' && (
            <>
              {/* Search bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'var(--bg-primary)' }}
                  onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                  onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <Search size={15} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={isAr ? 'ابحث عن كورس...' : 'Search courses...'}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 14, outline: 'none', fontFamily: font }} />
                  {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 0 }}><X size={14} /></button>}
                </div>
                <button onClick={() => setShowFilters(p => !p)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 15px', borderRadius: 12,
                  border: `1.5px solid ${showFilters || hasActiveFilters ? 'var(--text-primary)' : 'var(--border)'}`,
                  background: 'var(--bg-primary)', cursor: 'pointer',
                  color: hasActiveFilters ? 'var(--text-primary)' : 'var(--text-secondary)',
                  fontSize: 13, fontFamily: font, fontWeight: hasActiveFilters ? 700 : 400,
                }}>
                  <Filter size={14} /> {isAr ? 'فلترة' : 'Filter'}
                  {hasActiveFilters && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444' }} />}
                </button>
                <button onClick={() => setFreeOnly(p => !p)} style={{
                  padding: '10px 15px', borderRadius: 12, fontSize: 13,
                  border: `1.5px solid ${freeOnly ? '#22C55E' : 'var(--border)'}`,
                  background: freeOnly ? 'rgba(34,197,94,.08)' : 'var(--bg-primary)',
                  color: freeOnly ? '#22C55E' : 'var(--text-secondary)',
                  cursor: 'pointer', fontFamily: font, fontWeight: freeOnly ? 700 : 400,
                }}>
                  {isAr ? 'مجاني فقط' : 'Free only'}
                </button>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: font }}>{isAr ? 'المستوى' : 'Level'}</label>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {LEVELS.map(l => (
                        <button key={l.key} onClick={() => setLevel(l.key)} style={{
                          padding: '5px 11px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontFamily: font,
                          border: `1.5px solid ${level === l.key ? 'var(--text-primary)' : 'var(--border)'}`,
                          background: level === l.key ? 'var(--text-primary)' : 'transparent',
                          color: level === l.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        }}>{isAr ? l.ar : l.en}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: font }}>{isAr ? 'اللغة' : 'Language'}</label>
                    <div style={{ display: 'flex', gap: 5 }}>
                      {LANGUAGES.map(l => (
                        <button key={l.key} onClick={() => setLangFilter(l.key)} style={{
                          padding: '5px 11px', borderRadius: 99, fontSize: 12, cursor: 'pointer', fontFamily: font,
                          border: `1.5px solid ${langFilter === l.key ? 'var(--text-primary)' : 'var(--border)'}`,
                          background: langFilter === l.key ? 'var(--text-primary)' : 'transparent',
                          color: langFilter === l.key ? 'var(--bg-primary)' : 'var(--text-secondary)',
                        }}>{isAr ? l.ar : l.en}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, fontFamily: font }}>{isAr ? 'ترتيب' : 'Sort'}</label>
                    <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '7px 11px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: font }}>
                      {SORT_OPTIONS.map(s => <option key={s.key} value={s.key}>{isAr ? s.ar : s.en}</option>)}
                    </select>
                  </div>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 9, border: '1px solid #EF4444', background: 'rgba(239,68,68,.05)', color: '#EF4444', cursor: 'pointer', fontSize: 12.5, fontFamily: font }}>
                      <X size={12} /> {isAr ? 'مسح' : 'Clear'}
                    </button>
                  )}
                </div>
              )}

              {/* Count */}
              {!loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>
                    {total > 0 ? `${total.toLocaleString()} ${isAr ? 'كورس' : 'courses'}` : (isAr ? 'لا توجد نتائج' : 'No results')}
                  </p>
                  {totalPages > 1 && (
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>
                      {isAr ? `${page} / ${totalPages}` : `Page ${page} of ${totalPages}`}
                    </p>
                  )}
                </div>
              )}

              {/* Grid */}
              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {[...Array(8)].map((_, i) => (
                    <div key={i} style={{ background: 'var(--bg-primary)', borderRadius: 16, height: 280, border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '72px 0', color: 'var(--text-secondary)' }}>
                  <BookOpen size={48} style={{ margin: '0 auto 14px', opacity: .2 }} />
                  <p style={{ fontFamily: font, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{isAr ? 'لا توجد كورسات' : 'No courses found'}</p>
                  {hasActiveFilters && (
                    <button onClick={resetFilters} style={{ padding: '9px 22px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font }}>
                      {isAr ? 'مسح الفلاتر' : 'Clear filters'}
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {courses.map((c, i) => (
                    <CourseCard key={c.id || i} course={c} isAr={isAr} font={font}
                      onClick={setSelected} enrolled={enrolledIds.has(c.id)} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 26 }}>
                  <button onClick={() => fetchCourses(page - 1)} disabled={page <= 1} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page <= 1 ? .4 : 1 }}>
                    {isAr ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={p} onClick={() => fetchCourses(p)} style={{ minWidth: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: p === page ? 'var(--text-primary)' : 'var(--bg-primary)', color: p === page ? 'var(--bg-primary)' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 700 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-en)' }}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => fetchCourses(page + 1)} disabled={page >= totalPages} style={{ width: 36, height: 36, borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page >= totalPages ? .4 : 1 }}>
                    {isAr ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {selected && (
        <CourseDetailModal
          course={selected} isAr={isAr} font={font}
          onClose={() => setSelected(null)}
          enrolledIds={enrolledIds}
          onEnroll={handleEnroll}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @media(max-width:640px){ main{padding:14px 10px!important} }
      `}</style>
    </div>
  );
}