
'use strict';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, MapPin, Briefcase, Clock, DollarSign,
  Users, Eye, Bookmark, BookmarkCheck, X, Filter,
  ChevronLeft, ChevronRight, Globe, Building2,
  ExternalLink, Send, Lock, Sparkles, RefreshCw,
  CheckCircle, AlertCircle, SlidersHorizontal,
} from 'lucide-react';
import Header from '../../layout/Header';
import Footer from '../../layout/Footer';
import useLangStore from '../../i18n';
import useThemeStore from '../../store/themeStore';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const JOB_TYPES = [
  { v: 'all',        ar: 'الكل',         en: 'All'        },
  { v: 'full_time',  ar: 'دوام كامل',    en: 'Full Time'  },
  { v: 'remote',     ar: 'عن بُعد',      en: 'Remote'     },
  { v: 'part_time',  ar: 'دوام جزئي',   en: 'Part Time'  },
  { v: 'freelance',  ar: 'فريلانس',      en: 'Freelance'  },
  { v: 'internship', ar: 'تدريب',        en: 'Internship' },
];

const SORT_OPTIONS = [
  { v: 'newest',  ar: 'الأحدث',         en: 'Newest'       },
  { v: 'popular', ar: 'الأكثر مشاهدة', en: 'Most Viewed'  },
  { v: 'salary',  ar: 'الراتب',         en: 'Salary'       },
];

const COUNTRIES = [
  { v: '',   ar: 'كل الدول',       en: 'All Countries'   },
  { v: 'AE', ar: 'الإمارات 🇦🇪',   en: 'UAE 🇦🇪'         },
  { v: 'SA', ar: 'السعودية 🇸🇦',   en: 'Saudi Arabia 🇸🇦' },
  { v: 'KW', ar: 'الكويت 🇰🇼',    en: 'Kuwait 🇰🇼'      },
  { v: 'QA', ar: 'قطر 🇶🇦',       en: 'Qatar 🇶🇦'       },
  { v: 'BH', ar: 'البحرين 🇧🇭',   en: 'Bahrain 🇧🇭'     },
  { v: 'OM', ar: 'عُمان 🇴🇲',     en: 'Oman 🇴🇲'        },
  { v: 'JO', ar: 'الأردن 🇯🇴',    en: 'Jordan 🇯🇴'      },
  { v: 'EG', ar: 'مصر 🇪🇬',       en: 'Egypt 🇪🇬'       },
  { v: 'LB', ar: 'لبنان 🇱🇧',     en: 'Lebanon 🇱🇧'     },
];

const MOCK = [
  { id:'1', title:'Frontend Developer', titleAr:'مطور واجهات', jobType:'full_time', isRemote:false, locationCity:'Dubai', locationCityAr:'دبي', locationCountry:'AE', salaryMin:3000, salaryMax:5000, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:24, viewsCount:340, company:{ name:'TechCorp', logoUrl:null, industry:'Technology' }, skillsRequired:['React','TypeScript','CSS'] },
  { id:'2', title:'UI/UX Designer', titleAr:'مصمم واجهات', jobType:'full_time', isRemote:false, locationCity:'Riyadh', locationCityAr:'الرياض', locationCountry:'SA', salaryMin:2500, salaryMax:4000, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:18, viewsCount:210, company:{ name:'Creative Studio', logoUrl:null, industry:'Design' }, skillsRequired:['Figma','Adobe XD','Prototyping'] },
  { id:'3', title:'Backend Engineer', titleAr:'مهندس خلفيات', jobType:'remote', isRemote:true, locationCity:'Remote', locationCityAr:'عن بعد', locationCountry:null, salaryMin:4000, salaryMax:6000, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:41, viewsCount:580, company:{ name:'StartupX', logoUrl:null, industry:'SaaS' }, skillsRequired:['Node.js','PostgreSQL','Redis'] },
  { id:'4', title:'Data Scientist', titleAr:'عالم بيانات', jobType:'full_time', isRemote:false, locationCity:'Cairo', locationCityAr:'القاهرة', locationCountry:'EG', salaryMin:1800, salaryMax:3000, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:12, viewsCount:155, company:{ name:'DataCorp', logoUrl:null, industry:'Analytics' }, skillsRequired:['Python','ML','TensorFlow'] },
  { id:'5', title:'Product Manager', titleAr:'مدير منتج', jobType:'full_time', isRemote:false, locationCity:'Kuwait City', locationCityAr:'الكويت', locationCountry:'KW', salaryMin:4500, salaryMax:7000, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:9, viewsCount:98, company:{ name:'GrowthCo', logoUrl:null, industry:'E-commerce' }, skillsRequired:['Roadmapping','Agile','Analytics'] },
  { id:'6', title:'DevOps Engineer', titleAr:'مهندس DevOps', jobType:'remote', isRemote:true, locationCity:'Remote', locationCityAr:'عن بعد', locationCountry:null, salaryMin:3500, salaryMax:5500, salaryCurrency:'USD', salaryVisible:true, createdAt:new Date().toISOString(), applicationsCount:33, viewsCount:410, company:{ name:'CloudSys', logoUrl:null, industry:'Cloud' }, skillsRequired:['Docker','Kubernetes','AWS'] },
];

/* ── Helpers ─────────────────────────────────────────────── */
const timeAgo = (date, isAr) => {
  const d = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (d === 0) return isAr ? 'اليوم'     : 'Today';
  if (d === 1) return isAr ? 'أمس'       : 'Yesterday';
  if (d < 7)   return isAr ? `منذ ${d} أيام` : `${d}d ago`;
  return isAr ? `منذ ${Math.floor(d / 7)} أسابيع` : `${Math.floor(d / 7)}w ago`;
};

const fmtSalary = (min, max, cur) => {
  const f = n => n >= 1000 ? `${(n/1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : n;
  return `${f(min)}–${f(max)} ${cur}`;
};

const initials = name =>
  name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

const TYPE_COLORS = {
  full_time:  { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  remote:     { color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  part_time:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  freelance:  { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  internship: { color: '#EC4899', bg: 'rgba(236,72,153,0.1)'  },
};

/* ════════════════════════════════════════════════════════════
   JOB DETAIL MODAL
════════════════════════════════════════════════════════════ */
function JobDetailModal({ job, isAr, onClose, onApply, applying, applied, isAuthenticated }) {
  const navigate = useNavigate();
  const tc = TYPE_COLORS[job.jobType] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  const typeLabel = JOB_TYPES.find(t => t.v === job.jobType);
  const location = job.isRemote
    ? (isAr ? 'عن بُعد 🌐' : 'Remote 🌐')
    : [isAr ? (job.locationCityAr || job.locationCity) : job.locationCity, job.locationCountry].filter(Boolean).join(', ');

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', maxWidth: 640, maxHeight: '90vh', background: 'var(--bg-primary)', borderRadius: 22, border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>

        {/* Header */}
        <div style={{ padding: '22px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Company logo */}
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-primary)', overflow: 'hidden', flexShrink: 0 }}>
              {job.company?.logoUrl
                ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials(job.company?.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', lineHeight: 1.3 }}>
                {isAr && job.titleAr ? job.titleAr : job.title}
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 size={13} /> {job.company?.name}
                {job.company?.industry && <span>· {job.company.industry}</span>}
              </p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <X size={15} color="var(--text-secondary)" />
            </button>
          </div>

          {/* Quick meta */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, padding: '4px 11px', borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}30` }}>
              <Briefcase size={11} /> {isAr ? typeLabel?.ar : typeLabel?.en}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)', padding: '4px 11px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <MapPin size={11} /> {location}
            </span>
            {job.salaryVisible && job.salaryMin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#22C55E', fontWeight: 700, padding: '4px 11px', borderRadius: 99, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontFamily: 'var(--font-en)' }}>
                <DollarSign size={11} /> {fmtSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-secondary)', padding: '4px 11px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <Clock size={11} /> {timeAgo(job.createdAt, isAr)}
            </span>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Skills */}
          {job.skillsRequired?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={11} /> {isAr ? 'المهارات المطلوبة' : 'Required Skills'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {job.skillsRequired.map(s => (
                  <span key={s} style={{ fontSize: 12.5, fontWeight: 600, padding: '5px 13px', borderRadius: 99, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
                {isAr ? 'عن الوظيفة' : 'About the Role'}
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 10px' }}>
                {isAr ? 'المميزات' : 'Benefits'}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {job.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'var(--text-primary)' }}>
                    <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0 }} /> {b}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <Users size={13} /> {job.applicationsCount || 0} {isAr ? 'متقدم' : 'applicants'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)' }}>
              <Eye size={13} /> {job.viewsCount || 0} {isAr ? 'مشاهدة' : 'views'}
            </div>
          </div>

          {/* Auth warning */}
          {!isAuthenticated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, padding: '13px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <Lock size={16} color="#F59E0B" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                {isAr
                  ? 'سجّل دخولك للتقديم على هذه الوظيفة والوصول لكل الميزات'
                  : 'Log in to apply for this job and access all features'}
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
          {isAuthenticated ? (
            <>
              {applied ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', fontSize: 14, fontWeight: 700 }}>
                  <CheckCircle size={16} /> {isAr ? 'تم التقديم ✓' : 'Applied ✓'}
                </div>
              ) : (
                <button onClick={() => onApply(job)} disabled={applying}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 14, fontWeight: 700, cursor: applying ? 'default' : 'pointer', fontFamily: 'inherit', opacity: applying ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                  {applying ? <RefreshCw size={15} style={{ animation: 'jSpin .8s linear infinite' }} /> : <Send size={15} />}
                  {isAr ? 'تقدّم الآن' : 'Apply Now'}
                </button>
              )}
              {job.applicationUrl && (
                <a href={job.applicationUrl} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13.5, fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                  <ExternalLink size={14} /> {isAr ? 'الموقع' : 'Website'}
                </a>
              )}
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                {isAr ? 'تسجيل الدخول للتقديم' : 'Log in to Apply'}
              </button>
              <button onClick={() => navigate('/register')}
                style={{ padding: '12px 18px', borderRadius: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {isAr ? 'إنشاء حساب' : 'Sign Up'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   JOB CARD
════════════════════════════════════════════════════════════ */
function JobCard({ job, isAr, onOpen, onSave, saved, isAuthenticated }) {
  const navigate = useNavigate();
  const [hov, setHov] = useState(false);
  const tc = TYPE_COLORS[job.jobType] || { color: '#6B7280', bg: 'rgba(107,114,128,0.1)' };
  const typeLabel = JOB_TYPES.find(t => t.v === job.jobType);
  const location = job.isRemote
    ? (isAr ? 'عن بُعد 🌐' : 'Remote 🌐')
    : (isAr ? (job.locationCityAr || job.locationCity) : job.locationCity);

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) { navigate('/login'); return; }
    onOpen(job);
  };

  return (
    <div
      onClick={() => onOpen(job)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'var(--bg-secondary)',
        border: `1.5px solid ${hov ? 'var(--text-primary)' : 'var(--border)'}`,
        borderRadius: 18, padding: '20px',
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 10px 30px rgba(0,0,0,0.08)' : 'none',
        position: 'relative',
      }}>

      {/* Company logo + title */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', flexShrink: 0 }}>
          {job.company?.logoUrl
            ? <img src={job.company.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials(job.company?.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.35, margin: '0 0 3px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isAr && job.titleAr ? job.titleAr : job.title}
          </h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Building2 size={11} /> {job.company?.name}
          </p>
        </div>
        {/* Save button */}
        <button
          onClick={e => { e.stopPropagation(); if (!isAuthenticated) { navigate('/login'); return; } onSave(job.id); }}
          title={saved ? (isAr ? 'إلغاء الحفظ' : 'Unsave') : (isAr ? 'حفظ' : 'Save')}
          style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border)', background: saved ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
          {saved
            ? <BookmarkCheck size={14} color="var(--text-primary)" />
            : <Bookmark size={14} color="var(--text-secondary)" />}
        </button>
      </div>

      {/* Type + location */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: tc.bg, color: tc.color, border: `1px solid ${tc.color}25` }}>
          {isAr ? typeLabel?.ar : typeLabel?.en}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={11} /> {location}
        </span>
      </div>

      {/* Skills */}
      {job.skillsRequired?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {job.skillsRequired.slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 7, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {s}
            </span>
          ))}
          {job.skillsRequired.length > 3 && (
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>+{job.skillsRequired.length - 3}</span>
          )}
        </div>
      )}

      {/* Salary + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, marginTop: 'auto' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#22C55E', fontFamily: 'var(--font-en)' }}>
          {job.salaryVisible && job.salaryMin ? fmtSalary(job.salaryMin, job.salaryMax, job.salaryCurrency) : ''}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} /> {timeAgo(job.createdAt, isAr)}
        </span>
      </div>

      {/* CTA row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={handleApplyClick}
          style={{ flex: 1, padding: '9px', textAlign: 'center', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 13, fontWeight: 700, borderRadius: 11, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          {!isAuthenticated && <Lock size={12} />}
          {isAr ? 'تقدّم الآن' : 'Apply Now'}
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={11} /> {job.applicationsCount || 0}
        </span>
      </div>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px', animation: 'jPulse 1.5s infinite' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--bg-secondary)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 7, width: '70%' }} />
          <div style={{ height: 11, background: 'var(--bg-secondary)', borderRadius: 6, width: '45%' }} />
        </div>
      </div>
      <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 10, background: 'var(--bg-secondary)', borderRadius: 6, width: '60%', marginBottom: 16 }} />
      <div style={{ height: 38, background: 'var(--bg-secondary)', borderRadius: 11 }} />
    </div>
  );
}

/* ── Filter Sidebar ──────────────────────────────────────── */
function FilterPanel({ filters, onChange, isAr, counts }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 18, padding: '20px', position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: 22 }}>
      <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 7 }}>
        <SlidersHorizontal size={14} color="var(--text-secondary)" /> {isAr ? 'تصفية' : 'Filters'}
      </p>

      {/* Job type */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 11px' }}>
          {isAr ? 'نوع العمل' : 'Job Type'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {JOB_TYPES.map(t => (
            <label key={t.v} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="radio" name="jobType" value={t.v} checked={filters.type === t.v} onChange={() => onChange({ ...filters, type: t.v })}
                  style={{ accentColor: 'var(--text-primary)', width: 14, height: 14 }} />
                <span style={{ fontSize: 13, color: filters.type === t.v ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: filters.type === t.v ? 700 : 400 }}>
                  {isAr ? t.ar : t.en}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Country */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 11px' }}>
          {isAr ? 'الدولة' : 'Country'}
        </p>
        <select value={filters.country} onChange={e => onChange({ ...filters, country: e.target.value })}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
          {COUNTRIES.map(c => <option key={c.v} value={c.v}>{isAr ? c.ar : c.en}</option>)}
        </select>
      </div>

      {/* Remote only toggle */}
      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Globe size={13} color="var(--text-secondary)" /> {isAr ? 'عن بُعد فقط' : 'Remote only'}
        </span>
        <button onClick={() => onChange({ ...filters, remote: !filters.remote })}
          style={{ width: 42, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer', background: filters.remote ? 'var(--text-primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
          <span style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', insetInlineStart: filters.remote ? 20 : 2, transition: 'inset-inline-start 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </button>
      </label>

      {/* Reset */}
      <button onClick={() => onChange({ type: 'all', country: '', remote: false })}
        style={{ padding: '9px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', background: 'transparent', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
        {isAr ? '✕ مسح الفلاتر' : '✕ Clear Filters'}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════ */
export default function JobsPage() {
  const { lang, dir }       = useLangStore();
  const { theme }           = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const navigate            = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAr   = lang === 'ar';
  const isDark = theme === 'dark';

  const [jobs,        setJobs]        = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [search,      setSearch]      = useState(searchParams.get('q') || '');
  const [sort,        setSort]        = useState('newest');
  const [filters,     setFilters]     = useState({ type: 'all', country: '', remote: false });
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const [selected,    setSelected]    = useState(null);
  const [applying,    setApplying]    = useState(false);
  const [appliedIds,  setAppliedIds]  = useState(new Set());
  const [savedIds,    setSavedIds]    = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);
  const LIMIT = 9;

  /* ── Fetch jobs ── */
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page, limit: LIMIT, sort,
        ...(search      && { q: search }),
        ...(filters.type !== 'all' && { type: filters.type }),
        ...(filters.country        && { country: filters.country }),
        ...(filters.remote         && { remote: 'true' }),
      });
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data.data?.length ? data.data : (page === 1 ? MOCK : []));
      setTotal(data.pagination?.total || MOCK.length);
    } catch {
      setJobs(page === 1 ? MOCK : []);
      setTotal(MOCK.length);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort, filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  /* ── Autocomplete ── */
  useEffect(() => {
    clearTimeout(searchTimer.current);
    if (search.length < 2) { setSuggestions([]); return; }
    searchTimer.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/jobs/search/suggestions?q=${search}`);
        setSuggestions(data.data?.suggestions || []);
      } catch { setSuggestions([]); }
    }, 350);
    return () => clearTimeout(searchTimer.current);
  }, [search]);

  /* ── Apply ── */
  const handleApply = async (job) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setApplying(true);
    try {
      await api.post(`/jobs/${job.id}/apply`);
      setAppliedIds(prev => new Set([...prev, job.id]));
      toast.success(isAr ? 'تم التقديم بنجاح! ✓' : 'Application submitted! ✓');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('سبق') || msg?.includes('already')) {
        setAppliedIds(prev => new Set([...prev, job.id]));
        toast.error(isAr ? 'تقدمت على هذه الوظيفة مسبقاً' : 'Already applied to this job');
      } else {
        toast.error(msg || (isAr ? 'فشل التقديم' : 'Application failed'));
      }
    } finally {
      setApplying(false);
    }
  };

  /* ── Save toggle ── */
  const handleSave = (id) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast(isAr ? 'تم الإلغاء' : 'Removed', { icon: '🔖' }); }
      else { next.add(id); toast.success(isAr ? 'تم الحفظ' : 'Saved'); }
      return next;
    });
  };

  const totalPages = Math.ceil(total / LIMIT);
  const heroBg = isDark
    ? 'linear-gradient(160deg,#000 0%,#0d0d0d 60%,#000 100%)'
    : 'linear-gradient(160deg,#1A1A1E 0%,#2C2D31 60%,#1A1A1E 100%)';

  const hasActive = filters.type !== 'all' || filters.country || filters.remote || search;

  return (
    <div dir={dir} style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
      <style>{`
        @keyframes jPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
        @keyframes jSpin  { to{transform:rotate(360deg)} }
        .jobs-sidebar  { display: none !important; }
        .jobs-mob-filt { display: flex !important; }
        @media (min-width: 1024px) {
          .jobs-sidebar  { display: block !important; }
          .jobs-mob-filt { display: none !important; }
        }
      `}</style>

      <Header />

      {/* ════ HERO ════ */}
      <section style={{ background: heroBg, paddingTop: 112, paddingBottom: 48 }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          {/* <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: 18 }}>
            <Sparkles size={13} color="rgba(255,255,255,0.6)" />
            <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
              {isAr ? `${total.toLocaleString()} وظيفة متاحة` : `${total.toLocaleString()} jobs available`}
            </span>
          </div> */}
          <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {isAr ? 'ابحث عن وظيفتك المثالية' : 'Find Your Perfect Job'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 15, marginBottom: 28 }}>
            {isAr ? 'آلاف الفرص في قطاعات متنوعة بالمنطقة العربية' : 'Thousands of opportunities across industries in the Arab world'}
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', border: '2px solid transparent', transition: 'border-color 0.2s' }}
              onFocusWithin={e => e.currentTarget.style.borderColor = '#3B82F6'}>
              <span style={{ padding: '0 16px', color: '#6B6D76', display: 'flex' }}>
                <Search size={18} />
              </span>
              <input
                ref={searchRef}
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); setShowSugg(true); }}
                onFocus={() => setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 160)}
                placeholder={isAr ? 'وظيفة، مهارة، أو شركة...' : 'Job title, skill, or company...'}
                dir={dir}
                style={{ flex: 1, padding: '15px 0', border: 'none', outline: 'none', background: 'transparent', fontSize: 15, color: '#1A1A1E', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
              />
              {search && (
                <button onClick={() => { setSearch(''); setPage(1); setShowSugg(false); }} style={{ padding: '0 14px', background: 'none', border: 'none', cursor: 'pointer', color: '#6B6D76', display: 'flex' }}>
                  <X size={16} />
                </button>
              )}
              <button onClick={fetchJobs} style={{ margin: 6, padding: '10px 20px', borderRadius: 11, background: '#1A1A1E', color: '#fff', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                {isAr ? 'بحث' : 'Search'}
              </button>
            </div>

            {/* Autocomplete */}
            {showSugg && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, background: '#fff', borderRadius: 14, border: '1px solid #E0E2E8', zIndex: 30, overflow: 'hidden', boxShadow: '0 10px 32px rgba(0,0,0,0.1)' }}>
                {suggestions.map(s => (
                  <button key={s} onMouseDown={() => { setSearch(s); setShowSugg(false); setPage(1); }}
                    style={{ width: '100%', textAlign: dir === 'rtl' ? 'right' : 'left', padding: '11px 18px', fontSize: 13.5, color: '#1A1A1E', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.12s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F4F5F8'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Search size={13} color="#6B6D76" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Type chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {JOB_TYPES.map(t => (
              <button key={t.v} onClick={() => { setFilters(f => ({ ...f, type: t.v })); setPage(1); }}
                style={{ padding: '7px 16px', borderRadius: 99, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s', background: filters.type === t.v ? '#fff' : 'rgba(255,255,255,0.1)', color: filters.type === t.v ? '#1A1A1E' : 'rgba(255,255,255,0.7)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ════ MAIN CONTENT ════ */}
      <div style={{ maxWidth: 1220, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* Mobile filter button */}
        <div className="jobs-mob-filt" style={{ marginBottom: 16, gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {loading ? '...' : `${total.toLocaleString()} ${isAr ? 'نتيجة' : 'results'}`}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowFilters(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: `1px solid ${showFilters || hasActive ? 'var(--text-primary)' : 'var(--border)'}`, background: 'var(--bg-primary)', color: showFilters || hasActive ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: hasActive ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', position: 'relative' }}>
              <Filter size={13} /> {isAr ? 'فلترة' : 'Filter'}
              {hasActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', position: 'absolute', top: -2, insetInlineEnd: -2 }} />}
            </button>
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit' }}>
              {SORT_OPTIONS.map(s => <option key={s.v} value={s.v}>{isAr ? s.ar : s.en}</option>)}
            </select>
          </div>
        </div>

        {/* Mobile filter panel */}
        {showFilters && (
          <div className="jobs-mob-filt" style={{ marginBottom: 16 }}>
            <div style={{ width: '100%', background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '16px' }}>
              <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(1); }} isAr={isAr} />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* Desktop sidebar */}
          <div className="jobs-sidebar" style={{ width: 230, flexShrink: 0 }}>
            <FilterPanel filters={filters} onChange={f => { setFilters(f); setPage(1); }} isAr={isAr} />
          </div>

          {/* Jobs area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Sort bar (desktop) */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>
                {loading ? (isAr ? 'جاري البحث...' : 'Searching...') : `${total.toLocaleString()} ${isAr ? 'وظيفة' : 'jobs'}`}
                {hasActive && !loading && (
                  <button onClick={() => { setFilters({ type:'all', country:'', remote:false }); setSearch(''); setPage(1); }} style={{ marginInlineStart: 10, fontSize: 12, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    {isAr ? '✕ مسح' : '✕ Clear'}
                  </button>
                )}
              </p>
              <div className="jobs-sidebar" style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{isAr ? 'ترتيب:' : 'Sort:'}</span>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                  style={{ padding: '6px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer' }}>
                  {SORT_OPTIONS.map(s => <option key={s.v} value={s.v}>{isAr ? s.ar : s.en}</option>)}
                </select>
              </div>
            </div>

            {/* Auth banner (for non-logged-in users) */}
            {!isAuthenticated && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px', borderRadius: 14, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 20 }}>
                <Lock size={16} color="#3B82F6" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, flex: 1 }}>
                  {isAr
                    ? 'سجّل دخولك للتقديم على الوظائف وحفظ المفضّلة وتتبّع طلباتك'
                    : 'Log in to apply, save favourites, and track your applications'}
                </p>
                <Link to="/login" style={{ fontSize: 13, fontWeight: 700, color: '#3B82F6', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {isAr ? 'تسجيل الدخول ←' : 'Log in →'}
                </Link>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '72px 24px', background: 'var(--bg-primary)', borderRadius: 18, border: '1px solid var(--border)' }}>
                <Search size={48} color="var(--text-secondary)" style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{isAr ? 'لا توجد وظائف مطابقة' : 'No jobs found'}</p>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 20 }}>
                  {isAr ? 'جرّب تعديل معايير البحث' : 'Try adjusting your search filters'}
                </p>
                <button onClick={() => { setSearch(''); setFilters({ type:'all', country:'', remote:false }); setPage(1); }}
                  style={{ padding: '10px 22px', borderRadius: 11, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {isAr ? 'مسح الفلاتر' : 'Clear filters'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 18 }}>
                {jobs.map(job => (
                  <JobCard
                    key={job.id} job={job} isAr={isAr}
                    onOpen={setSelected}
                    onSave={handleSave}
                    saved={savedIds.has(job.id)}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !loading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 36 }}>
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                  style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page <= 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page <= 1 ? 0.4 : 1 }}>
                  {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 3, totalPages - 6)) + i;
                  if (p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ minWidth: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: p === page ? 'var(--text-primary)' : 'var(--bg-primary)', color: p === page ? 'var(--bg-primary)' : 'var(--text-primary)', cursor: 'pointer', fontSize: 13.5, fontWeight: p === page ? 700 : 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-en)' }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}
                  style={{ width: 38, height: 38, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page >= totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: page >= totalPages ? 0.4 : 1 }}>
                  {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Job detail modal */}
      {selected && (
        <JobDetailModal
          job={selected}
          isAr={isAr}
          onClose={() => setSelected(null)}
          onApply={handleApply}
          applying={applying}
          applied={appliedIds.has(selected.id)}
          isAuthenticated={isAuthenticated}
        />
      )}
    </div>
  );
}