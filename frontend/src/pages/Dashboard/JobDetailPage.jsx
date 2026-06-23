

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Briefcase, Banknote, Wifi, Clock,
  Users, Eye, Send, CheckCircle2, Building2, Globe,
  Sparkles, Share2, Bookmark, Calendar, ChevronRight,
  RefreshCw, AlertCircle, Tag, Award,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

/* ─────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────── */

const JOB_TYPE = {
  full_time:  { en: 'Full-time',  ar: 'دوام كامل'  },
  part_time:  { en: 'Part-time',  ar: 'دوام جزئي'  },
  freelance:  { en: 'Freelance',  ar: 'مستقل'       },
  internship: { en: 'Internship', ar: 'تدريب'        },
  remote:     { en: 'Remote',     ar: 'عن بُعد'     },
};

const matchColor = (s) =>
  s >= 80 ? '#22C55E' : s >= 60 ? '#F59E0B' : s >= 40 ? '#3B82F6' : '#71717A';

const fmtSalary = (min, max, currency = 'USD') => {
  if (!min && !max) return null;
  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}k` : n;
  if (min && max) return `${fmt(min)}–${fmt(max)} ${currency}`;
  if (min) return `${fmt(min)}+ ${currency}`;
  return `Up to ${fmt(max)} ${currency}`;
};

const timeAgo = (date, isAr) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (diff === 0) return isAr ? 'اليوم' : 'Today';
  if (diff === 1) return isAr ? 'أمس'   : 'Yesterday';
  if (diff < 7)   return isAr ? `منذ ${diff} أيام`          : `${diff} days ago`;
  if (diff < 30)  return isAr ? `منذ ${Math.floor(diff/7)} أسابيع`  : `${Math.floor(diff/7)} weeks ago`;
  return isAr ? `منذ ${Math.floor(diff/30)} أشهر` : `${Math.floor(diff/30)} months ago`;
};

/* ─────────────────────────────────────────────────────────
   SKELETON
───────────────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {[{ h: 120 }, { h: 200 }, { h: 160 }, { h: 120 }].map((s, i) => (
        <div key={i} style={{ height: s.h, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 14 }} />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{
      background: 'var(--bg-primary)', border: '1px solid var(--border)',
      borderRadius: 14, padding: '20px 22px', marginBottom: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
      {children}
    </p>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────── */
export default function JobDetailPage() {
  const { id }       = useParams();
  const { lang }     = useLang();
  const { user }     = useAuthStore();
  const navigate     = useNavigate();
  const isAr         = lang === 'ar';
  const font         = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);

  const [job,          setJob]          = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [applying,     setApplying]     = useState(false);
  const [applied,      setApplied]      = useState(false);
  const [matchScore,   setMatchScore]   = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  /* ── Load job ── */
  useEffect(() => {
    setLoading(true);
    api.get(`/jobs/${id}`)
      .then(r => {
        const data = r.data.data;
        setJob(data.job || data);
        // Check if already applied
        if (data.userApplication) setApplied(true);
      })
      .catch(() => toast.error(isAr ? 'فشل تحميل الوظيفة' : 'Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Check if user already applied ── */
  useEffect(() => {
    if (!job || !user) return;
    api.get('/applications/me', { params: { limit: 200 } })
      .then(r => {
        const apps = r.data.data?.rows || r.data.data || [];
        setApplied(apps.some(a => a.jobId === job.id || a.job_id === job.id));
      })
      .catch(() => {});
  }, [job, user]);

  /* ── Get AI match score ── */
  useEffect(() => {
    if (!job || !user) return;
    setScoreLoading(true);
    // Try to get score from job's own matchScore field (returned by AI Matches endpoint)
    // Or call a dedicated scoring endpoint if available
    api.get(`/jobs/${id}/match-score`)
      .then(r => setMatchScore(Math.round(r.data.data?.score || 0)))
      .catch(() => setMatchScore(null))
      .finally(() => setScoreLoading(false));
  }, [job, user]);

  /* ── Apply ── */
  const handleApply = async () => {
    if (!user) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post(`/jobs/${id}/apply`, {});
      setApplied(true);
      toast.success(isAr ? '✅ تم التقديم بنجاح!' : '✅ Application sent!');
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('already') || msg.includes('تقدمت')) {
        setApplied(true);
        toast(isAr ? 'تقدمت لهذه الوظيفة سابقاً' : 'Already applied');
      } else {
        toast.error(msg || (isAr ? 'فشل التقديم' : 'Apply failed'));
      }
    } finally {
      setApplying(false);
    }
  };

  /* ── Share ── */
  const handleShare = async () => {
    // Build a clean public URL regardless of current path
    const publicUrl = `${window.location.origin}/jobs/${id}`;
    const shareData = { title: job?.title || 'Job Opportunity', url: publicUrl };

    // 1. Web Share API (mobile / desktop supported browsers)
    if (navigator.share && navigator.canShare?.(shareData)) {
      try { await navigator.share(shareData); return; } catch { /* user cancelled or failed */ }
    }

    // 2. Clipboard API (requires https or localhost)
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast.success(isAr ? '✓ تم نسخ الرابط' : '✓ Link copied');
        return;
      } catch { /* clipboard blocked */ }
    }

    // 3. Fallback: execCommand (works everywhere including http)
    try {
      const ta = document.createElement('textarea');
      ta.value = publicUrl;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.success(isAr ? '✓ تم نسخ الرابط' : '✓ Link copied');
    } catch {
      toast.error(isAr ? 'تعذّر نسخ الرابط' : 'Could not copy link');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <MobileTopBar title={isAr ? 'تفاصيل الوظيفة' : 'Job Details'} />
          <main style={{ flex: 1, padding: 'clamp(14px,3vw,26px)', overflowY: 'auto' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
              <Skeleton />
            </div>
          </main>
        </div>
        <MobileBottomNav />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      </div>
    );
  }

  if (!job) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🔍</p>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: font }}>{isAr ? 'الوظيفة غير موجودة' : 'Job not found'}</p>
          <Link to="/dashboard/jobs" style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            {isAr ? '← العودة للوظائف' : '← Back to Jobs'}
          </Link>
        </div>
      </div>
    );
  }

  const title      = isAr && job.titleAr ? job.titleAr : job.title;
  const desc       = isAr && job.descriptionAr ? job.descriptionAr : job.description;
  const typeLabel  = JOB_TYPE[job.jobType] || JOB_TYPE.full_time;
  const salary     = fmtSalary(job.salaryMin || job.salary_min, job.salaryMax || job.salary_max, job.salaryCurrency);
  const deadline   = job.deadline ? new Date(job.deadline) : null;
  const isExpired  = deadline && deadline < new Date();
 const reqLines = Array.isArray(job.requirements)
  ? job.requirements
  : (job.requirements || '').toString().split('\n').filter(Boolean);

const benLines = Array.isArray(job.benefits)
  ? job.benefits
  : (job.benefits || '').toString().split('\n').filter(Boolean);
  const skills     = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];
  const isRemote   = job.isRemote || job.is_remote;

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; } body { margin: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        @media(max-width:1024px) { .jd-main { padding-bottom: 80px !important; } }
        @media(max-width:860px)  { .jd-layout { grid-template-columns: 1fr !important; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <MobileTopBar title={isAr ? 'تفاصيل الوظيفة' : 'Job Details'} />

          <main className="jd-main" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px,3vw,26px)' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>

              {/* ── Breadcrumb ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Link to="/dashboard/jobs" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500, transition: 'color .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <ArrowLeft size={14} /> {isAr ? 'الوظائف' : 'Jobs'}
                </Link>
                <ChevronRight size={12} color="var(--text-secondary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{title}</span>
              </div>

              {/* ── Two-column layout ── */}
              <div className="jd-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 18, alignItems: 'start' }}>

                {/* ════ LEFT COLUMN ════ */}
                <div>

                  {/* ── Hero card ── */}
                  <Card>
                    {/* Company + title */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 13, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {job.company?.logoUrl
                          ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                          : <Building2 size={22} color="var(--text-secondary)" strokeWidth={1.4} />
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h1 style={{ fontSize: 'clamp(1rem,2.5vw,1.3rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.02em', color: 'var(--text-primary)', fontFamily: font, lineHeight: 1.3 }}>
                          {title}
                        </h1>
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                          {job.company?.name}
                          {job.company?.industry && <span style={{ color: 'var(--text-secondary)', opacity: .6 }}> · {job.company.industry}</span>}
                        </p>
                      </div>
                      {/* AI match badge */}
                      {/* {matchScore != null && (
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: `${matchColor(matchScore)}12`, border: `1px solid ${matchColor(matchScore)}30` }}>
                          <Sparkles size={12} color={matchColor(matchScore)} />
                          <span style={{ fontSize: 13, fontWeight: 800, color: matchColor(matchScore), fontFamily: 'var(--font-en)' }}>{matchScore}%</span>
                          <span style={{ fontSize: 11.5, color: matchColor(matchScore), fontFamily: font }}>
                            {matchScore >= 80 ? (isAr ? 'مطابقة ممتازة' : 'Excellent Match') : matchScore >= 60 ? (isAr ? 'مطابقة جيدة' : 'Good Match') : (isAr ? 'مطابقة معقولة' : 'Fair Match')}
                          </span>
                        </div>
                      )} */}
                    </div>

                    {/* Meta pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                      {(job.locationCity || job.location_city) && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 99 }}>
                          <MapPin size={12} /> {job.locationCity || job.location_city}
                          {(job.locationCountry || job.location_country) && <span style={{ opacity: .6 }}>, {job.locationCountry || job.location_country}</span>}
                        </span>
                      )}
                      {isRemote && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#22C55E', background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.2)', padding: '5px 12px', borderRadius: 99 }}>
                          <Wifi size={12} /> {isAr ? 'عن بُعد' : 'Remote'}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 99 }}>
                        <Briefcase size={12} /> {isAr ? typeLabel.ar : typeLabel.en}
                      </span>
                      {salary && job.salaryVisible !== false && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 99, fontFamily: 'var(--font-en)' }}>
                          <Banknote size={12} /> {salary}
                        </span>
                      )}
                      {job.category && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 99 }}>
                          <Tag size={12} /> {isAr && job.category?.nameAr ? job.category.nameAr : job.category?.name}
                        </span>
                      )}
                      {deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: isExpired ? '#EF4444' : '#F59E0B', background: isExpired ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)', border: `1px solid ${isExpired ? 'rgba(239,68,68,.2)' : 'rgba(245,158,11,.2)'}`, padding: '5px 12px', borderRadius: 99 }}>
                          <Calendar size={12} />
                          {isExpired ? (isAr ? 'انتهى الموعد' : 'Expired') : `${isAr ? 'آخر موعد:' : 'Deadline:'} ${deadline.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 9px', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          {isAr ? 'المهارات المطلوبة' : 'Required Skills'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {skills.map((s, i) => (
                            <span key={i} style={{ fontSize: 12.5, fontWeight: 600, padding: '4px 12px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 18, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Users size={13} /> {job.applicationsCount || 0} {isAr ? 'متقدم' : 'applicants'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Clock size={13} /> {timeAgo(job.createdAt || job.created_at, isAr)}
                      </span>
                    </div>
                  </Card>

                  {/* ── Job description ── */}
                  {desc && (
                    <Card>
                      <SectionTitle>{isAr ? 'وصف الوظيفة' : 'Job Description'}</SectionTitle>
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0, fontFamily: font }}>
                        {desc}
                      </p>
                    </Card>
                  )}

                  {/* ── Requirements ── */}
                  {reqLines.length > 0 && (
                    <Card>
                      <SectionTitle>{isAr ? 'المتطلبات' : 'Requirements'}</SectionTitle>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {reqLines.map((r, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, fontFamily: font }}>
                            <CheckCircle2 size={15} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* ── Benefits ── */}
                  {benLines.length > 0 && (
                    <Card>
                      <SectionTitle>{isAr ? 'المزايا والفوائد' : 'Benefits & Perks'}</SectionTitle>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {benLines.map((b, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.55, fontFamily: font }}>
                            <Award size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                            {b}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}

                  {/* ── About company ── */}
                  {job.company && (
                    <Card>
                      <SectionTitle>{isAr ? 'عن الشركة' : 'About the Company'}</SectionTitle>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 11, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {job.company.logoUrl
                            ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                            : <Building2 size={20} color="var(--text-secondary)" strokeWidth={1.4} />
                          }
                        </div>
                        <div>
                          <p style={{ fontSize: 14.5, fontWeight: 700, margin: '0 0 3px', color: 'var(--text-primary)', fontFamily: font }}>{job.company.name}</p>
                          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {job.company.industry && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.company.industry}</span>}
                            {job.company.companySize && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <Users size={11} /> {job.company.companySize} {isAr ? 'موظف' : 'employees'}
                              </span>
                            )}
                            {(job.company.locationCity || job.company.locationCountry) && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                                <MapPin size={11} /> {[job.company.locationCity, job.company.locationCountry].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {job.company.description && (
                        <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 14px', fontFamily: font }}>
                          {job.company.description}
                        </p>
                      )}
                      {job.company.website && (
                        <a href={job.company.website} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color .2s' }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          <Globe size={13} /> {job.company.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </Card>
                  )}
                </div>

                {/* ════ RIGHT SIDEBAR ════ */}
                <div style={{ position: 'sticky', top: 20 }}>

                  {/* ── Apply card ── */}
                  <Card style={{ marginBottom: 14 }}>
                    {isExpired ? (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <AlertCircle size={32} color="#EF4444" style={{ margin: '0 auto 8px', opacity: .6 }} />
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: '#EF4444', margin: '0 0 4px', fontFamily: font }}>{isAr ? 'انتهى الموعد' : 'Application Closed'}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>{isAr ? 'انتهى آخر موعد للتقديم' : 'This position is no longer accepting applications'}</p>
                      </div>
                    ) : applied ? (
                      <div style={{ textAlign: 'center', padding: '8px 0' }}>
                        <CheckCircle2 size={36} color="#22C55E" style={{ margin: '0 auto 10px' }} />
                        <p style={{ fontSize: 14.5, fontWeight: 800, color: '#22C55E', margin: '0 0 4px', fontFamily: font }}>{isAr ? 'تم التقديم!' : 'Applied!'}</p>
                        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>{isAr ? 'سيتواصل معك صاحب العمل قريباً' : 'The employer will reach out to you soon'}</p>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleApply}
                          disabled={applying}
                          style={{ width: '100%', padding: '13px', borderRadius: 11, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', cursor: applying ? 'not-allowed' : 'pointer', fontSize: 14.5, fontWeight: 800, fontFamily: font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, opacity: applying ? .7 : 1, transition: 'opacity .2s' }}
                          onMouseEnter={e => { if (!applying) e.currentTarget.style.opacity = '.88'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = applying ? '.7' : '1'; }}
                        >
                          {applying
                            ? <><RefreshCw size={15} style={{ animation: 'spin .8s linear infinite' }} /> {isAr ? 'جاري التقديم...' : 'Applying...'}</>
                            : <><Send size={15} strokeWidth={2.2} /> {isAr ? 'تقدّم الآن' : 'Apply Now'}</>
                          }
                        </button>
                        {!user && (
                          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>
                            <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{isAr ? 'سجّل دخولك' : 'Log in'}</Link>
                            {isAr ? ' للتقديم' : ' to apply'}
                          </p>
                        )}
                      </>
                    )}

                    {/* Share + Save */}
                    <div style={{ display: 'flex', gap: 8, marginTop: applied || isExpired ? 14 : 10 }}>
                      <button onClick={handleShare} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5, fontFamily: font, transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Share2 size={13} /> {isAr ? 'مشاركة' : 'Share'}
                      </button>
                      {/* <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px', borderRadius: 9, border: '1.5px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5, fontFamily: font, transition: 'all .15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                        <Bookmark size={13} /> {isAr ? 'حفظ' : 'Save'}
                      </button> */}
                    </div>
                  </Card>

                  {/* ── Quick info ── */}
                  <Card>
                    <SectionTitle>{isAr ? 'معلومات سريعة' : 'Quick Info'}</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { icon: <Briefcase size={14} />, label: isAr ? 'نوع العمل' : 'Job Type', value: isAr ? typeLabel.ar : typeLabel.en },
                        { icon: <MapPin size={14} />,    label: isAr ? 'الموقع'    : 'Location',  value: isRemote ? (isAr ? 'عن بُعد' : 'Remote') : [job.locationCity, job.locationCountry].filter(Boolean).join(', ') || '—' },
                        { icon: <Banknote size={14} />,  label: isAr ? 'الراتب'    : 'Salary',    value: salary && job.salaryVisible !== false ? salary : (isAr ? 'غير محدد' : 'Not specified') },
                        { icon: <Clock size={14} />,     label: isAr ? 'نُشر'      : 'Posted',    value: timeAgo(job.createdAt || job.created_at, isAr) },
                        { icon: <Users size={14} />,     label: isAr ? 'المتقدمون' : 'Applicants', value: `${job.applicationsCount || 0}` },
                        ...(deadline ? [{ icon: <Calendar size={14} />, label: isAr ? 'آخر موعد' : 'Deadline', value: deadline.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }] : []),
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{row.icon}</span>
                            {row.label}
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', fontFamily: font, textAlign: isAr ? 'left' : 'right', maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}