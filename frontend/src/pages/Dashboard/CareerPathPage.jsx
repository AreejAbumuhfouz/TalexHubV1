

import { useState, useEffect } from 'react';
import {
  Sparkles, Target, TrendingUp, BookOpen, Award,
  ChevronRight, RefreshCw, Lock, CheckCircle,
  Clock, Star, Zap, MapPin, DollarSign, BarChart2,
  ArrowRight, AlertCircle, Plus, Search, X, Filter, ArrowDown,
  TrendingDown, Brain, Globe,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLang from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';
import { Link } from 'react-router-dom';

const PRIORITY_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };
const DEMAND_COLOR   = { high: '#22C55E', medium: '#F59E0B', low: '#EF4444' };
const safeArr = (v) => Array.isArray(v) ? v : (v ? [v] : []);

const CURRENCY_MAP = {
  US: { symbol: '$',   label: 'USD' }, GB: { symbol: '£',    label: 'GBP' },
  AU: { symbol: 'A$',  label: 'AUD' }, CA: { symbol: 'C$',   label: 'CAD' },
  AE: { symbol: 'د.إ', label: 'AED' }, SA: { symbol: 'ر.س',  label: 'SAR' },
  EG: { symbol: 'ج.م', label: 'EGP' }, JO: { symbol: 'د.أ',  label: 'JOD' },
  KW: { symbol: 'د.ك', label: 'KWD' }, QA: { symbol: 'ر.ق',  label: 'QAR' },
  BH: { symbol: 'د.ب', label: 'BHD' }, OM: { symbol: 'ر.ع',  label: 'OMR' },
  IQ: { symbol: 'د.ع', label: 'IQD' }, LB: { symbol: 'ل.ل',  label: 'LBP' },
  MA: { symbol: 'د.م', label: 'MAD' }, TN: { symbol: 'د.ت',  label: 'TND' },
  DE: { symbol: '€',   label: 'EUR' }, FR: { symbol: '€',    label: 'EUR' },
  IT: { symbol: '€',   label: 'EUR' }, ES: { symbol: '€',    label: 'EUR' },
  TR: { symbol: '₺',   label: 'TRY' }, IN: { symbol: '₹',    label: 'INR' },
  PK: { symbol: '₨',   label: 'PKR' }, NG: { symbol: '₦',    label: 'NGN' },
};

function getCurrency() {
  const locale  = (typeof navigator !== 'undefined' && navigator.language) || 'en-US';
  const country = locale.split('-')[1]?.toUpperCase() || 'US';
  return { country, ...(CURRENCY_MAP[country] || { symbol: '$', label: 'USD' }) };
}

function withSymbol(value, symbol) {
  if (!value) return value;
  const str = String(value).trim();
  const currencyChars = /^[$£€₺₹₨₦A-Z]/;
  if (currencyChars.test(str) || str.startsWith('د') || str.startsWith('ر') || str.startsWith('ج') || str.startsWith('ل')) return str;
  return `${symbol} ${str}`;
}

function Badge({ label, color = '#6B7280', bg }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600, background: bg || `${color}18`, color, fontFamily: 'var(--font-en)' }}>{label}</span>
  );
}

function SkillTag({ label, missing = false }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 11px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: missing ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: missing ? '#EF4444' : '#22C55E', border: `1px solid ${missing ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}` }}>
      {missing ? <AlertCircle size={11} /> : <CheckCircle size={11} />}{label}
    </span>
  );
}

function UsageBar({ isAr, font, usage, limits, userPlan }) {
  const usedToday     = usage?.today     || 0;
  const usedMonth     = usage?.thisMonth || 0;
  const limitPerDay   = limits?.perDay   || 0;
  const limitPerMonth = limits?.perMonth || 0;
  const isAllowed     = limits?.allowGeneration !== false;
  const reachedDay    = limitPerDay   > 0 && usedToday  >= limitPerDay;
  const reachedMonth  = limitPerMonth > 0 && usedMonth  >= limitPerMonth;
  const isLimitReached = !isAllowed || reachedDay || reachedMonth;
  const planColor = userPlan === 'elite' ? '#A855F7' : userPlan === 'pro' ? '#F59E0B' : '#6B7280';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 14px', background: 'var(--bg-secondary)', borderRadius: 10, border: `1px solid ${isLimitReached ? 'rgba(239,68,68,0.35)' : 'var(--border)'}`, marginBottom: 16, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: planColor, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-en)' }}>{userPlan?.toUpperCase()}</span>
      <div style={{ width: 1, height: 14, background: 'var(--border)' }} />
      {[
        { label: isAr ? 'اليوم' : 'Today', used: usedToday, limit: limitPerDay, reached: reachedDay },
        { label: isAr ? 'الشهر' : 'Month', used: usedMonth, limit: limitPerMonth, reached: reachedMonth },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>{item.label}:</span>
          <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-en)', color: item.reached ? '#EF4444' : 'var(--text-primary)' }}>
            {item.used}/{item.limit === 0 ? '∞' : item.limit}
          </span>
          {item.limit > 0 && (
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((item.used / item.limit) * 100, 100)}%`, background: item.reached ? '#EF4444' : '#22C55E', borderRadius: 99, transition: 'width 0.3s ease' }} />
            </div>
          )}
        </div>
      ))}
      {isLimitReached && (
        <span style={{ fontSize: 11, color: '#EF4444', fontFamily: font, marginInlineStart: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertCircle size={12} /> {isAr ? 'تم الوصول للحد الأقصى' : 'Limit reached'}
        </span>
      )}
    </div>
  );
}

function AiImpactSection({ aiResult, isAr, font, aiLang }) {
  const positives = safeArr(aiResult?.aiImpact?.positive || aiResult?.aiOpportunities);
  const negatives = safeArr(aiResult?.aiImpact?.negative || aiResult?.aiThreats);
  const effectiveLang = aiLang || (isAr ? 'ar' : 'en');
  const defaultPos = effectiveLang === 'ar' ? ['زيادة الطلب على مهارات الذكاء الاصطناعي في هذا المجال','أدوات AI ستعزز إنتاجيتك وتفتح فرصاً جديدة','إمكانية أتمتة المهام الروتينية وتركيز وقتك على العمل الإبداعي'] : ['Growing demand for AI-augmented skills in this field','AI tools will boost your productivity and open new opportunities','Ability to automate routine tasks and focus on creative work'];
  const defaultNeg = effectiveLang === 'ar' ? ['بعض المهام الروتينية قد تُستبدل بالأتمتة','المنافسة ستزداد مع سهولة الدخول للمجال عبر أدوات AI','الحاجة لتحديث مهاراتك باستمرار مع تطور التقنية'] : ['Some routine tasks may be replaced by automation','Competition may increase as AI lowers entry barriers','Continuous upskilling required to stay relevant'];
  const showPos = positives.length > 0 ? positives : defaultPos;
  const showNeg = negatives.length > 0 ? negatives : defaultNeg;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: 'var(--bg-primary)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingUp size={18} color="#22C55E" /></div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, fontFamily: font, margin: 0, color: '#22C55E' }}>{isAr ? 'تأثير AI الإيجابي على مسارك' : 'Positive AI impact on your path'}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>{isAr ? 'كيف سيدعمك الذكاء الاصطناعي' : 'How AI will support your career'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {showPos.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <CheckCircle size={15} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-primary)', fontFamily: font, margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'var(--bg-primary)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><TrendingDown size={18} color="#EF4444" /></div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, fontFamily: font, margin: 0, color: '#EF4444' }}>{isAr ? 'تأثير AI السلبي على مسارك' : 'Risks to watch on your path'}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>{isAr ? 'مخاطر وتحديات يجب الاستعداد لها' : 'Challenges to prepare for'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {showNeg.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
              <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-primary)', fontFamily: font, margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(168,85,247,0.07)', border: '1px solid rgba(168,85,247,0.18)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Brain size={16} color="#A855F7" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.6, margin: 0 }}>
          {isAr ? 'ركّز على المهارات الإنسانية كالتفكير النقدي والإبداع والتواصل — فهذه لا يمكن أتمتتها بسهولة.' : 'Focus on human skills like critical thinking, creativity, and communication — these are hardest to automate.'}
        </p>
      </div>
    </div>
  );
}

function StageCard({ stage, index, total, isAr, font }) {
  const [open, setOpen] = useState(index === 0);
  const isLast = index === total - 1;
  const stageTitle  = stage.title || stage.stage || `${isAr ? 'مرحلة' : 'Stage'} ${index + 1}`;
  const stageDur    = stage.duration || stage.timeframe || '';
  const stageSkills = safeArr(stage.skills || stage.actions);
  const stageMiles  = safeArr(stage.milestones);
  const stageCerts  = safeArr(stage.certifications);
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 32, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: isLast ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--bg-primary)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-en)', boxShadow: isLast ? '0 0 0 4px rgba(245,158,11,0.18)' : open ? '0 0 0 4px rgba(255,255,255,0.06)' : 'none', transition: 'box-shadow 0.2s' }}>
          {isLast ? <Star size={14} /> : index + 1}
        </div>
        {!isLast && <div style={{ width: 2, flex: 1, margin: '4px 0', borderRadius: 2, background: open ? 'linear-gradient(to bottom, var(--text-primary), var(--border))' : 'var(--border)', transition: 'background 0.3s' }} />}
      </div>
      <div style={{ flex: 1, marginInlineStart: 14, marginBottom: 20 }}>
        <div onClick={() => setOpen(p => !p)} role="button" tabIndex={0} aria-expanded={open} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(p => !p); } }} style={{ background: 'var(--bg-primary)', border: `1px solid ${open ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s', outline: 'none' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 14px rgba(0,0,0,0.07)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14.5, fontFamily: font, margin: '0 0 3px', color: 'var(--text-primary)' }}>{stageTitle}</p>
              {stageDur && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', fontFamily: font }}><Clock size={12} /> {stageDur}</span>}
            </div>
            <ChevronRight size={16} color="var(--text-secondary)" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s', flexShrink: 0 }} />
          </div>
          {open && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
              {stage.description && <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 12 }}>{stage.description}</p>}
              {stageSkills.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAr ? 'الإجراءات والمهارات' : 'Actions & skills'}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stageSkills.map((s, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: font, lineHeight: 1.5 }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {stageMiles.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAr ? 'الإنجازات المستهدفة' : 'Target milestones'}</p>
                  {stageMiles.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginBottom: 5 }}>
                      <CheckCircle size={13} color="#22C55E" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: font }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
              {stageCerts.length > 0 && (
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{isAr ? 'شهادات موصى بها' : 'Recommended certificates'}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {stageCerts.map((c, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, fontSize: 12, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Award size={11} /> {typeof c === 'string' ? c : c.name || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ course, isAr, font, isFromDB = false }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 13 }}>
      <div style={{ width: 44, height: 44, borderRadius: 11, flexShrink: 0, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOpen size={18} color="var(--text-secondary)" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <p style={{ fontWeight: 700, fontSize: 13.5, fontFamily: font, margin: 0, color: 'var(--text-primary)' }}>
            {isAr && course.titleAr ? course.titleAr : (course.title || course.titleAr)}
          </p>
          {(course.free || course.isFree) && <Badge label={isAr ? 'مجاني' : 'Free'} color="#22C55E" />}
        </div>
        {course.provider && <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: '0 0 6px' }}>{course.provider}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {course.skillCovered && <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>{course.skillCovered}</span>}
          {course.durationHours && <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Clock size={11} />{course.durationHours}h</span>}
          {course.priority && <Badge label={course.priority} color={PRIORITY_COLOR[course.priority]} />}
          {isFromDB && course.ratingAvg > 0 && <span style={{ fontSize: 11.5, color: '#F59E0B', fontFamily: 'var(--font-en)', display: 'inline-flex', alignItems: 'center', gap: 2 }}><Star size={11} fill="#F59E0B" />{Number(course.ratingAvg).toFixed(1)}</span>}
        </div>
      </div>
      {isFromDB && (
        <Link to={`/courses/${course.id}`} style={{ padding: '7px 13px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 600, fontFamily: font, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
          {isAr ? 'ابدأ' : 'Start'} <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function PlatformCoursesModal({ isAr, font, missingSkills = [], onClose }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [level, setLevel]     = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = {};
        if (missingSkills.length > 0 && !showAll) params.skills = missingSkills.slice(0, 5).join(',');
        if (search) params.search = search;
        if (level)  params.level  = level;
        const { data } = await api.get('/courses', { params: { ...params, limit: 30 } });
        setCourses(data.data || []);
      } catch { toast.error(isAr ? 'فشل تحميل الدورات' : 'Failed to load courses'); }
      finally   { setLoading(false); }
    };
    load();
  }, [search, level, showAll]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const LEVELS = [
    { key: '', label: isAr ? 'كل المستويات' : 'All levels' },
    { key: 'beginner',     label: isAr ? 'مبتدئ' : 'Beginner'     },
    { key: 'intermediate', label: isAr ? 'متوسط' : 'Intermediate' },
    { key: 'advanced',     label: isAr ? 'متقدم' : 'Advanced'     },
  ];
  const LEVEL_C = { beginner: '#22C55E', intermediate: '#3B82F6', advanced: '#A855F7' };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(3px)' }}>
      <div style={{ width: '100%', maxWidth: 620, maxHeight: '88vh', background: 'var(--bg-primary)', borderRadius: 18, display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 16, fontFamily: font, margin: 0 }}>{isAr ? 'دورات المنصة' : 'Platform courses'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: '2px 0 0' }}>
              {showAll ? (isAr ? 'جميع الدورات المتاحة' : 'All available courses') : (isAr ? 'دورات مقترحة بناءً على مهاراتك المطلوبة' : 'Suggested based on your missing skills')}
            </p>
          </div>
          <button onClick={onClose} aria-label={isAr ? 'إغلاق' : 'Close'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6, display: 'flex', borderRadius: 8 }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
            <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={isAr ? 'ابحث...' : 'Search...'} style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: font }} />
          </div>
          <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 12.5, outline: 'none', fontFamily: font, cursor: 'pointer' }}>
            {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
          <button onClick={() => setShowAll(p => !p)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 13px', borderRadius: 10, border: `1.5px solid ${showAll ? 'var(--text-primary)' : 'var(--border)'}`, background: showAll ? 'var(--bg-secondary)' : 'transparent', cursor: 'pointer', color: showAll ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12.5, fontFamily: font, fontWeight: showAll ? 600 : 400, transition: 'all 0.15s' }}>
            <Filter size={13} /> {isAr ? 'الكل' : 'All'}
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <RefreshCw size={22} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
              <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontFamily: font, fontSize: 14, margin: '0 0 4px' }}>{isAr ? 'لا توجد دورات مطابقة' : 'No matching courses'}</p>
              <p style={{ fontFamily: font, fontSize: 12.5, opacity: 0.8, margin: 0 }}>{isAr ? 'جرّب تعديل البحث أو المستوى' : 'Try adjusting your search or level filter'}</p>
            </div>
          ) : courses.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: 13, border: '1px solid var(--border)', background: 'var(--bg-secondary)', transition: 'box-shadow 0.15s' }} onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)'; }} onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {c.thumbnailUrl ? <img src={c.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} /> : <BookOpen size={20} color="var(--text-secondary)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, fontFamily: font, margin: 0, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>{isAr && c.titleAr ? c.titleAr : c.title}</p>
                  {c.isFree && <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>{isAr ? 'مجاني' : 'Free'}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {c.level && <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 99, background: `${LEVEL_C[c.level] || '#6B7280'}15`, color: LEVEL_C[c.level] || '#6B7280', fontFamily: 'var(--font-en)', fontWeight: 600 }}>{c.level}</span>}
                  {c.ratingAvg > 0 && <span style={{ fontSize: 11.5, color: '#F59E0B', fontFamily: 'var(--font-en)' }}>★ {Number(c.ratingAvg).toFixed(1)}</span>}
                  {c.skillsCovered?.slice(0, 2).map((s, si) => <span key={si} style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>#{s}</span>)}
                </div>
              </div>
              <Link to={`/courses/${c.slug || c.id}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 12.5, fontWeight: 700, fontFamily: font, flexShrink: 0, whiteSpace: 'nowrap' }}>
                {isAr ? 'ابدأ' : 'Start'} <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CareerPathPage() {
  const { user }  = useAuthStore();
  const { lang }  = useLang();
  const isAr      = lang === 'ar';
  const font      = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const [collapsed, setCollapsed] = useState(false);

  const [pathData, setPathData]             = useState(null);
  const [aiResult, setAiResult]             = useState(null);
  const [matchedCourses, setMatchedCourses] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [generating, setGenerating]         = useState(false);
  const [targetRole, setTargetRole]         = useState('');
  const [hasAccess, setHasAccess]           = useState(false);
  const [activeSection, setActiveSection]   = useState('overview');
  const [showPlatformCourses, setShowPlatformCourses] = useState(false);
  const [aiLang, setAiLang]                 = useState(lang);
  const [limits, setLimits]                 = useState(null);
  const [usage,  setUsage]                  = useState({ today: 0, thisMonth: 0 });
  const userPlan = user?.planKey || 'free';

  const fetchLimits = async () => {
    try {
      const { data } = await api.get('/career-path/limits');
      if (data.data) { setLimits(data.data.limits); setUsage(data.data.usage || { today: 0, thisMonth: 0 }); }
    } 
     catch (err) {
        if (err?.response?.status !== 403) console.error(err);
      }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [settingsRes, pathRes] = await Promise.all([
          api.get('/career-path/settings'),
          api.get('/career-path').catch(() => ({ data: { data: null } })),
        ]);
        const free = settingsRes.data.data?.allowFreeCareerPath || false;
        setHasAccess(['pro', 'elite'].includes(userPlan) || free || ['admin', 'support'].includes(user?.role));
        await fetchLimits();
        if (pathRes.data.data) {
          setPathData(pathRes.data.data);
          try { const parsed = JSON.parse(pathRes.data.data.aiNotes || '{}'); setAiResult(parsed); } catch {}
        }
      } catch {}
      finally { setLoading(false); }
    };
    if (user) init();
    else setLoading(false);
  }, [user]);

  const isLimitReached = limits && (
    !limits.allowGeneration ||
    (limits.perDay   > 0 && usage.today    >= limits.perDay) ||
    (limits.perMonth > 0 && usage.thisMonth >= limits.perMonth)
  );

  const generate = async () => {
    if (isLimitReached) { toast.error(isAr ? 'لقد وصلت إلى الحد الأقصى. حاول غداً أو قم بالترقية.' : 'Limit reached. Try tomorrow or upgrade.'); return; }
    setGenerating(true);
    try {
      const { data } = await api.post('/career-path/generate', { targetRole: targetRole.trim() || undefined, lang: aiLang });
      setPathData(data.data);
      setAiResult(data.data.aiResult);
      setMatchedCourses(data.data.matchedCourses || []);
      await fetchLimits();
      toast.success(isAr ? 'تم إنشاء مسارك المهني!' : 'Career path generated!');
      setActiveSection('overview');
    } catch (err) {
        console.log('career path error:', JSON.stringify(err.response?.data));

      const msg = err.response?.data?.message;
      if (err.response?.data?.upgradeRequired) return; 
      else 
        // toast.error((typeof msg === 'object' ? (isAr ? msg.ar : msg.en) : msg) || (isAr ? 'حدث خطأ. حاول مرة أخرى' : 'Error. Please try again'));

if (!err.response?.data?.upgradeRequired) {
  toast.error( (isAr ? 'حدث خطأ. حاول مرة أخرى' : 'Error. Please try again'));
}    } finally { setGenerating(false); }
  };

  const sections = [
    { key: 'overview',     label: isAr ? 'نظرة عامة' : 'Overview',     icon: <Target size={13} />,   count: null },
    { key: 'stages',       label: isAr ? 'المراحل'    : 'Stages',       icon: <MapPin size={13} />,   count: safeArr(aiResult?.stages).length },
    { key: 'skills',       label: isAr ? 'المهارات'   : 'Skills',       icon: <Zap size={13} />,      count: safeArr(aiResult?.currentSkills).length + safeArr(aiResult?.missingSkills).length },
    { key: 'courses',      label: isAr ? 'الدورات'    : 'Courses',      icon: <BookOpen size={13} />, count: matchedCourses.length + safeArr(aiResult?.recommendedCourses).length },
    { key: 'certificates', label: isAr ? 'الشهادات'   : 'Certificates', icon: <Award size={13} />,    count: safeArr(aiResult?.certifications).length },
    { key: 'ai_impact',    label: isAr ? 'تأثير AI'   : 'AI impact',    icon: <Brain size={13} />,    count: null },
  ];

  // ── SHARED outer wrapper style ──────────────────────────
  const outerStyle = {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    direction: isAr ? 'rtl' : 'ltr',   // ✅ THE FIX — always applied
    fontFamily: font,
  };

  // ── Loading ─────────────────────────────────────────────
  if (loading) return (
    <div style={{ ...outerStyle, background: 'var(--bg-secondary)' }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-secondary)' }} />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── No access ───────────────────────────────────────────
  if (!hasAccess) return (
    <div style={{ ...outerStyle, background: 'var(--bg-secondary)' }}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MobileTopBar title={isAr ? 'المسار المهني' : 'Career Path'} />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Lock size={32} color="var(--text-secondary)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: font, marginBottom: 10 }}>{isAr ? 'مسار الحياة المهنية' : 'Career Path'}</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: font, lineHeight: 1.7, marginBottom: 24 }}>
              {isAr ? 'احصل على خارطة طريق مهنية مخصصة بالذكاء الاصطناعي تحدد مسارك من موقعك الحالي إلى هدفك المهني' : 'Get an AI-powered personalized roadmap that defines your path from your current position to your career goal'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                { icon: <Target size={16} color="#F59E0B" />, text: isAr ? 'تحليل مهاراتك الحالية' : 'Analyze your current skills' },
                { icon: <TrendingUp size={16} color="#22C55E" />, text: isAr ? 'خارطة طريق مرحلية واضحة' : 'Clear step-by-step roadmap' },
                { icon: <BookOpen size={16} color="#3B82F6" />, text: isAr ? 'دورات مقترحة لكل مرحلة' : 'Suggested courses per stage' },
                { icon: <Award size={16} color="#A855F7" />, text: isAr ? 'شهادات موصى بها' : 'Recommended certifications' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
                  {f.icon}
                  <span style={{ fontSize: 13.5, fontFamily: font, color: 'var(--text-primary)' }}>{f.text}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', textDecoration: 'none', fontSize: 14.5, fontWeight: 700, fontFamily: font }}>
              <Sparkles size={16} /> {isAr ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
            </Link>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );

  // ── Main page ───────────────────────────────────────────
  return (
    <div style={outerStyle}>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <MobileTopBar title={isAr ? 'المسار المهني' : 'Career Path'} />

        <main style={{ flex: 1, padding: '24px 20px', maxWidth: 780, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', fontFamily: font, display: 'flex', alignItems: 'center', gap: 9 }}>
                <Sparkles size={22} color="#F59E0B" /> {isAr ? 'مسارك المهني' : 'Your Career Path'}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                {isAr ? 'خارطة طريق مخصصة بالذكاء الاصطناعي بناءً على سيرتك الذاتية' : 'AI-powered personalized roadmap based on your CV'}
              </p>
            </div>

            {/* Generate controls */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <button
                onClick={() => setAiLang(p => p === 'ar' ? 'en' : 'ar')}
                aria-label={aiLang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 11.5, fontWeight: 600, fontFamily: 'var(--font-en)', transition: 'border-color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Globe size={13} /> {aiLang === 'ar' ? 'AR → EN' : 'EN → AR'}
              </button>
              <input
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder={isAr ? 'هدفك المهني (اختياري)...' : 'Target role (optional)...'}
                style={{ padding: '0 13px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: font, flex: '1 1 200px', minWidth: 160, height: 38 }}
                onKeyDown={e => e.key === 'Enter' && generate()}
              />
              <button
                onClick={generate}
                disabled={generating || !!isLimitReached}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '0 18px', height: 38, borderRadius: 10, border: 'none', background: (generating || isLimitReached) ? 'var(--bg-secondary)' : 'var(--text-primary)', color: (generating || isLimitReached) ? 'var(--text-secondary)' : 'var(--bg-primary)', cursor: (generating || isLimitReached) ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: font, transition: 'opacity 0.2s', opacity: isLimitReached ? 0.6 : 1, flexShrink: 0 }}
              >
                {generating
                  ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> {isAr ? 'جاري التحليل...' : 'Analyzing...'}</>
                  : <><Sparkles size={14} /> {aiResult ? (isAr ? 'إعادة التوليد' : 'Regenerate') : (isAr ? 'توليد المسار' : 'Generate Path')}</>
                }
              </button>
            </div>

            {limits && <div style={{ marginTop: 14 }}><UsageBar isAr={isAr} font={font} usage={usage} limits={limits} userPlan={userPlan} /></div>}

            {generating && (
              <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', gap: 9 }}>
                <RefreshCw size={14} color="#F59E0B" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: '#F59E0B', fontFamily: font, margin: 0 }}>
                  {isAr ? 'الذكاء الاصطناعي يحلل سيرتك الذاتية ويبني مسارك المهني... قد يستغرق حتى 30 ثانية' : 'AI is analyzing your CV and building your career path... may take up to 30 seconds'}
                </p>
              </div>
            )}
          </div>

          {/* Empty state */}
          {!aiResult && !generating && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: 18, border: '1px dashed var(--border)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Target size={36} color="var(--text-secondary)" style={{ opacity: 0.4 }} />
              </div>
              <p style={{ fontFamily: font, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{isAr ? 'لم يتم إنشاء مسار مهني بعد' : 'No career path generated yet'}</p>
              <p style={{ fontFamily: font, fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 auto 24px', maxWidth: 400 }}>
                {isAr ? 'اضغط "توليد المسار" وسيقوم الذكاء الاصطناعي بتحليل سيرتك الذاتية وإنشاء خارطة طريق مخصصة لك' : 'Click "Generate Path" and our AI will analyze your CV and create a personalized roadmap'}
              </p>
              <button onClick={generate} disabled={generating || !!isLimitReached} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, border: 'none', background: isLimitReached ? 'var(--bg-secondary)' : 'var(--text-primary)', color: isLimitReached ? 'var(--text-secondary)' : 'var(--bg-primary)', cursor: isLimitReached ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: font }}>
                <Sparkles size={16} /> {isAr ? 'توليد مساري المهني' : 'Generate My Career Path'}
              </button>
            </div>
          )}

          {/* Path content */}
          {aiResult && (
            <>
              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { icon: <MapPin size={16} />,    label: isAr ? 'الموقع الحالي' : 'Current',  value: aiResult.currentRole,   color: '#3B82F6' },
                  { icon: <Target size={16} />,    label: isAr ? 'الهدف'         : 'Target',   value: aiResult.targetRole,    color: '#F59E0B' },
                  { icon: <Clock size={16} />,     label: isAr ? 'المدة'          : 'Timeline', value: `${aiResult.estimatedYears || '?'} ${isAr ? 'سنوات' : 'years'}`, color: '#A855F7' },
                  { icon: <BarChart2 size={16} />, label: isAr ? 'الطلب'         : 'Demand',   value: isAr ? (aiResult.marketDemand === 'high' ? 'عالي' : aiResult.marketDemand === 'medium' ? 'متوسط' : 'منخفض') : aiResult.marketDemand, color: DEMAND_COLOR[aiResult.marketDemand] || '#6B7280' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, color: s.color }}>
                      {s.icon}
                      <span style={{ fontSize: 11.5, fontWeight: 600, fontFamily: font, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: font, margin: 0, color: 'var(--text-primary)', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.4 }}>
                      {s.value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {/* Salary range */}
              {aiResult.salaryRange && (() => {
                const { country: sCountry, symbol: sSym, label: sLabel } = getCurrency();
                return (
                  <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(168,85,247,0.06))', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 14, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DollarSign size={17} color="#22C55E" />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, margin: '0 0 2px' }}>
                        {isAr ? `نطاق الراتب المتوقع (${sLabel})` : `Expected salary range (${sLabel})`}
                      </p>
                      {typeof aiResult.salaryRange === 'string' ? (
                        <p style={{ fontSize: 13.5, fontFamily: 'var(--font-en)', margin: 0, color: '#22C55E', fontWeight: 700 }}>{withSymbol(aiResult.salaryRange, sSym)}</p>
                      ) : (
                        <p style={{ fontSize: 13.5, fontFamily: 'var(--font-en)', margin: 0, color: 'var(--text-primary)' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>{isAr ? 'الحالي: ' : 'Now: '}</span>
                          <span>{withSymbol(aiResult.salaryRange.current, sSym)}</span>
                          <ArrowDown size={13} style={{ margin: '0 6px', verticalAlign: 'middle', color: 'var(--text-secondary)' }} />
                          <span style={{ color: '#22C55E', fontWeight: 700 }}>{withSymbol(aiResult.salaryRange.target, sSym)}</span>
                        </p>
                      )}
                      <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: '4px 0 0', fontFamily: font, opacity: 0.75 }}>
                        * {isAr ? `تقديرات بناءً على سوق ${sCountry}` : `Estimates based on ${sCountry} market`}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Section tabs */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 3, scrollbarWidth: 'none' }}>
                {sections.map(s => (
                  <button key={s.key} onClick={() => setActiveSection(s.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 99, flexShrink: 0, border: `1.5px solid ${activeSection === s.key ? 'var(--text-primary)' : 'var(--border)'}`, background: activeSection === s.key ? 'var(--text-primary)' : 'var(--bg-primary)', color: activeSection === s.key ? 'var(--bg-primary)' : 'var(--text-secondary)', fontSize: 12.5, fontWeight: activeSection === s.key ? 700 : 500, cursor: 'pointer', fontFamily: font, transition: 'all 0.18s' }}>
                    {s.icon} {s.label}
                    {typeof s.count === 'number' && s.count > 0 && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, fontFamily: 'var(--font-en)', minWidth: 16, height: 16, borderRadius: 99, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', background: activeSection === s.key ? 'rgba(0,0,0,0.18)' : 'var(--bg-secondary)', color: activeSection === s.key ? 'var(--bg-primary)' : 'var(--text-secondary)' }}>{s.count}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {activeSection === 'overview' && (
                <div>
                  {aiResult.summary && (
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                      <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-primary)', fontFamily: font, margin: 0 }}>{aiResult.summary}</p>
                    </div>
                  )}
                  {aiResult.tips && (
                    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={13} /> {isAr ? 'نصائح سريعة' : 'Quick tips'}
                      </p>
                      {Array.isArray(aiResult.tips)
                        ? aiResult.tips.map((tip, i) => (
                            <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 10 }}>
                              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-en)', color: 'var(--text-secondary)' }}>{i + 1}</div>
                              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-primary)', fontFamily: font, margin: 0 }}>{tip}</p>
                            </div>
                          ))
                        : <p style={{ fontSize: 13.5, lineHeight: 1.7, color: 'var(--text-primary)', fontFamily: font, margin: 0 }}>{aiResult.tips}</p>
                      }
                    </div>
                  )}
                </div>
              )}

              {/* STAGES */}
              {activeSection === 'stages' && (
                <div>
                  {Array.isArray(aiResult.stages) && aiResult.stages.length > 0
                    ? aiResult.stages.map((stage, i) => <StageCard key={i} stage={stage} index={i} total={aiResult.stages.length} isAr={isAr} font={font} />)
                    : <p style={{ color: 'var(--text-secondary)', fontFamily: font, textAlign: 'center', padding: '40px 0' }}>{isAr ? 'لا توجد مراحل' : 'No stages available'}</p>
                  }
                </div>
              )}

              {/* SKILLS */}
              {activeSection === 'skills' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#22C55E', fontFamily: font, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}><CheckCircle size={13} /> {isAr ? 'مهاراتك الحالية' : 'Your current skills'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {safeArr(aiResult.currentSkills || pathData?.currentSkills).length > 0
                        ? safeArr(aiResult.currentSkills || pathData?.currentSkills).map((s, i) => <SkillTag key={i} label={s} />)
                        : <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>{isAr ? 'لا توجد مهارات مسجلة' : 'No skills on record yet'}</p>
                      }
                    </div>
                  </div>
                  <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#EF4444', fontFamily: font, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}><AlertCircle size={13} /> {isAr ? 'المهارات المطلوبة' : 'Missing skills to develop'}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {safeArr(aiResult.missingSkills || pathData?.missingSkills).length > 0
                        ? safeArr(aiResult.missingSkills || pathData?.missingSkills).map((s, i) => <SkillTag key={i} label={s} missing />)
                        : <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, margin: 0 }}>{isAr ? 'لا توجد مهارات مفقودة' : 'No missing skills identified'}</p>
                      }
                    </div>
                  </div>
                </div>
              )}

              {/* COURSES */}
              {activeSection === 'courses' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, margin: 0, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Star size={12} /> {isAr ? 'دورات المنصة المقترحة' : 'Platform suggested courses'}</p>
                    <button onClick={() => setShowPlatformCourses(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 13px', borderRadius: 9, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: font }}>
                      <Plus size={13} /> {isAr ? 'دورات المنصة' : 'Browse courses'}
                    </button>
                  </div>
                  {matchedCourses.length > 0
                    ? matchedCourses.map((c, i) => <CourseCard key={i} course={c} isAr={isAr} font={font} isFromDB />)
                    : (
                      <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14 }}>
                        <BookOpen size={28} color="var(--text-secondary)" style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: font, margin: '0 0 12px' }}>{isAr ? 'لا توجد دورات مطابقة على المنصة حالياً' : 'No matching platform courses yet'}</p>
                        <Link to="/courses" style={{ padding: '7px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontSize: 12.5, fontFamily: font, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>{isAr ? 'تصفح كل الدورات' : 'Browse all courses'}</Link>
                      </div>
                    )
                  }
                  {safeArr(aiResult.recommendedCourses).length > 0 && (
                    <>
                      <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', fontFamily: font, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}><Sparkles size={12} /> {isAr ? 'دورات خارجية موصى بها' : 'AI-recommended external courses'}</p>
                      {safeArr(aiResult.recommendedCourses).map((c, i) => {
                        const course = typeof c === 'string' ? { title: c } : c;
                        return <CourseCard key={i} course={course} isAr={isAr} font={font} />;
                      })}
                    </>
                  )}
                </div>
              )}

              {/* CERTIFICATES */}
              {activeSection === 'certificates' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {safeArr(aiResult.certifications).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontFamily: font, textAlign: 'center', padding: '40px 0' }}>{isAr ? 'لا توجد شهادات موصى بها' : 'No certifications recommended'}</p>
                  ) : safeArr(aiResult.certifications).map((cert, i) => {
                    const certName = typeof cert === 'string' ? cert : (cert.name || cert.title || String(cert));
                    const certProv = typeof cert === 'object' ? cert.provider  : null;
                    const certRel  = typeof cert === 'object' ? cert.relevance : null;
                    const certPri  = typeof cert === 'object' ? cert.priority  : null;
                    return (
                      <div key={i} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, padding: '15px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Award size={18} color="#F59E0B" /></div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                              <p style={{ fontWeight: 700, fontSize: 14, fontFamily: font, margin: 0 }}>{certName}</p>
                              {certPri && <Badge label={certPri} color={PRIORITY_COLOR[certPri]} />}
                            </div>
                            {certProv && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', fontFamily: font, margin: '0 0 5px' }}>{certProv}</p>}
                            {certRel  && <p style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: font, margin: 0, lineHeight: 1.6 }}>{certRel}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* AI IMPACT */}
              {activeSection === 'ai_impact' && (
                <AiImpactSection aiResult={aiResult} isAr={isAr} font={font} aiLang={aiLang} />
              )}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav />

      {showPlatformCourses && (
        <PlatformCoursesModal isAr={isAr} font={font} missingSkills={safeArr(aiResult?.missingSkills || pathData?.missingSkills)} onClose={() => setShowPlatformCourses(false)} />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) { main { padding: 14px 10px !important; } }
      `}</style>
    </div>
  );
}