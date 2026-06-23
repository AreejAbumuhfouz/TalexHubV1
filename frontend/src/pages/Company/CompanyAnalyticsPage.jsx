import { useState, useEffect, useCallback } from 'react';
import {
  BarChart2, Users, Briefcase, UserCheck, Target,
  TrendingUp, ArrowUp, ArrowDown, Minus, Sparkles,
  Clock, Star, Award, Eye,
} from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const fmtNum = n => (typeof n === 'number' && n >= 1000) ? `${(n/1000).toFixed(1)}k` : String(n ?? '—');

function GrowthBadge({ value, isAr }) {
  if (value === null || value === undefined) return null;
  const up = value > 0, flat = value === 0;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: flat ? 'var(--text-secondary)' : up ? '#22C55E' : '#EF4444', background: flat ? 'var(--bg-secondary)' : up ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 7px', borderRadius: 99, border: `1px solid ${flat ? 'var(--border)' : up ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
      {flat ? <Minus size={10}/> : up ? <ArrowUp size={10}/> : <ArrowDown size={10}/>}
      {Math.abs(value)}% <span style={{ fontWeight: 400, opacity: 0.7 }}>{isAr ? 'vs السابق' : 'vs prev'}</span>
    </span>
  );
}

/* ── Mini sparkline SVG ─────────────────────────────────── */
function Spark({ data, color = '#22C55E', h = 38 }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.count);
  const max  = Math.max(...vals) || 1;
  const w = 100;
  const pts = vals.map((v, i) => `${(i/(vals.length-1))*w},${h - (v/max)*h}`).join(' ');
  const id = `sg${color.replace('#','')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── KPI Card ────────────────────────────────────────────── */
function KpiCard({ icon: Icon, label, value, growth, color, spark, isAr }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, insetInlineEnd: 0, width: 70, height: 70, borderRadius: '0 16px 0 70px', background: `${color}07` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: `${color}14`, border: `1px solid ${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={17} color={color} strokeWidth={1.8} />
        </div>
        {spark && <Spark data={spark} color={color} />}
      </div>
      <div>
        <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 3px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 5px', lineHeight: 1, fontFamily: 'var(--font-en)' }}>{value}</p>
        <GrowthBadge value={growth} isAr={isAr} />
      </div>
    </div>
  );
}

/* ── Funnel ──────────────────────────────────────────────── */
function Funnel({ pipeline, isAr }) {
  const stages = [
    { key: 'sent',        ar: 'تقدّموا',    en: 'Applied',     color: '#71717A' },
    { key: 'viewed',      ar: 'شُوهدوا',    en: 'Reviewed',    color: '#3B82F6' },
    { key: 'shortlisted', ar: 'مختصر',      en: 'Shortlisted', color: '#8B5CF6' },
    { key: 'interview',   ar: 'مقابلة',     en: 'Interviewed', color: '#F59E0B' },
    { key: 'accepted',    ar: 'قُبلوا',     en: 'Hired',       color: '#22C55E' },
  ];
  const max = Math.max(...stages.map(s => pipeline?.[s.key] || 0), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {stages.map((s, i) => {
        const val  = pipeline?.[s.key] || 0;
        const pct  = Math.round((val/max)*100);
        const prev = i > 0 ? (pipeline?.[stages[i-1].key] || 0) : null;
        const conv = prev > 0 ? Math.round((val/prev)*100) : null;
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 88, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, flexShrink: 0 }}>{isAr ? s.ar : s.en}</span>
            <div style={{ flex: 1, height: 26, background: 'var(--bg-secondary)', borderRadius: 7, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: s.color, borderRadius: 7, opacity: 0.82, transition: 'width 0.6s ease', minWidth: val > 0 ? 4 : 0 }} />
            </div>
            <span style={{ width: 32, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-en)', textAlign: 'center', flexShrink: 0 }}>{val}</span>
            <span style={{ width: 40, fontSize: 11, color: conv ? (conv > 50 ? '#22C55E' : conv > 25 ? '#F59E0B' : '#EF4444') : 'transparent', fontWeight: 700, flexShrink: 0, fontFamily: 'var(--font-en)' }}>
              {conv !== null ? `${conv}%↓` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bar Chart ───────────────────────────────────────────── */
function BarChart({ data, isAr }) {
  if (!data?.length) return <div style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>{isAr ? 'لا توجد بيانات' : 'No data yet'}</div>;
  const show = data.slice(-30);
  const max  = Math.max(...show.map(d => d.count), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 110, overflowX: 'auto' }}>
      {show.map((d, i) => {
        const h = Math.max(((d.count/max)*100), d.count > 0 ? 4 : 1);
        const date = new Date(d.date);
        const label = date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
        return (
          <div key={i} title={`${label}: ${d.count}`} style={{ flex: 1, minWidth: 7, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'default' }}>
            <div style={{ width: '100%', height: `${h}%`, borderRadius: '3px 3px 0 0', background: d.count > 0 ? 'var(--text-primary)' : 'var(--border)', opacity: d.count > 0 ? 0.85 : 0.3, minHeight: 2 }} />
          </div>
        );
      })}
    </div>
  );
}

/* ── Top Jobs ────────────────────────────────────────────── */
function TopJobs({ jobs, isAr }) {
  const S = { active: { ar: 'نشط', en: 'Active', c: '#22C55E' }, pending_approval: { ar: 'مراجعة', en: 'Pending', c: '#F59E0B' }, closed: { ar: 'مغلق', en: 'Closed', c: '#71717A' } };
  if (!jobs?.length) return <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)', fontSize: 13 }}>{isAr ? 'لم تنشر أي وظيفة' : 'No jobs posted yet'}</div>;
  const maxApps = Math.max(...jobs.map(j => j.applicationsCount || 0), 1);
  return (
    <div>
      {jobs.map((job, i) => {
        const s = S[job.status] || S.closed;
        const apps = job.applicationsCount || 0, views = job.viewsCount || 0;
        const ctr = views > 0 ? Math.round((apps/views)*100) : 0;
        return (
          <div key={job.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < jobs.length-1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--text-secondary)', flexShrink: 0, fontFamily: 'var(--font-en)' }}>{i+1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={10}/> {views}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10}/> {apps}</span>
                {views > 0 && <span style={{ fontSize: 11, color: ctr > 5 ? '#22C55E' : 'var(--text-secondary)' }}>CTR {ctr}%</span>}
              </div>
            </div>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: s.c, background: `${s.c}15`, padding: '2px 8px', borderRadius: 99, border: `1px solid ${s.c}25`, flexShrink: 0 }}>{isAr ? s.ar : s.en}</span>
            <div style={{ width: 55, height: 5, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
              <div style={{ height: '100%', width: `${(apps/maxApps)*100}%`, background: s.c, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
export default function CompanyAnalyticsPage() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';

  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topJobs,  setTopJobs]  = useState([]);
  const [range,    setRange]    = useState('30');
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ovR, tlR, tjR] = await Promise.allSettled([
        api.get('/companies/analytics/overview',              { params: { range } }),
        api.get('/companies/analytics/applicants-over-time', { params: { range } }),
        api.get('/companies/analytics/top-jobs'),
      ]);
      if (ovR.status === 'fulfilled') setOverview(ovR.value.data.data);
      if (tlR.status === 'fulfilled') setTimeline(tlR.value.data.data?.data || []);
      if (tjR.status === 'fulfilled') setTopJobs(tjR.value.data.data?.jobs || []);
    } catch {} finally { setLoading(false); }
  }, [range]);

  useEffect(() => { load(); }, [load]);

  const Skel = ({ h = 160 }) => (
    <div style={{ height: h, borderRadius: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'anlPulse 1.5s infinite' }} />
  );

  return (
    <CompanyLayout title={isAr ? 'التقارير والتحليلات' : 'Analytics'}>
      <style>{'@keyframes anlPulse{0%,100%{opacity:1}50%{opacity:.4}}'}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={19} /> {isAr ? 'التقارير والتحليلات' : 'Analytics & Reports'}
          </h1>
          <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>{isAr ? 'نظرة شاملة على أداء التوظيف' : 'A complete view of your hiring performance'}</p>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[{v:'7',ar:'7 أيام',en:'7d'},{v:'30',ar:'30 يوم',en:'30d'},{v:'90',ar:'90 يوم',en:'90d'}].map(r => (
            <button key={r.v} onClick={() => setRange(r.v)} style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid var(--border)', background: range===r.v ? 'var(--text-primary)' : 'var(--bg-primary)', color: range===r.v ? 'var(--bg-primary)' : 'var(--text-secondary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {isAr ? r.ar : r.en}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>{[0,1,2,3].map(i => <Skel key={i} h={150} />)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 12 }}><Skel h={260}/><Skel h={260}/></div>
          <Skel h={240} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
            <KpiCard icon={Users}     label={isAr ? 'إجمالي المتقدمين' : 'Total Applicants'} value={fmtNum(overview?.totalApplicants)} growth={overview?.applicantGrowth} color="#3B82F6" spark={timeline} isAr={isAr} />
            <KpiCard icon={Briefcase} label={isAr ? 'وظائف نشطة'       : 'Active Jobs'}       value={fmtNum(overview?.activeJobs)}      color="#22C55E" isAr={isAr} />
            <KpiCard icon={UserCheck} label={isAr ? 'تم التوظيف'        : 'Total Hired'}       value={fmtNum(overview?.hired)}           color="#8B5CF6" isAr={isAr} />
            <KpiCard icon={Target}    label={isAr ? 'معدل التحويل'      : 'Conversion Rate'}   value={`${overview?.conversionRate ?? 0}%`} color="#F59E0B" isAr={isAr} />
          </div>

          {/* Timeline + Funnel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={14} color="var(--text-secondary)" /> {isAr ? 'المتقدمون عبر الزمن' : 'Applicants Over Time'}
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 16px' }}>{isAr ? `آخر ${range} يوم` : `Last ${range} days`}</p>
              <BarChart data={timeline} isAr={isAr} />
            </div>
            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
              <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Target size={14} color="var(--text-secondary)" /> {isAr ? 'قمع التوظيف' : 'Hiring Funnel'}
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 16px' }}>{isAr ? 'تتبع تقدم المرشحين' : 'Track candidate progression'}</p>
              {overview && <Funnel pipeline={overview.pipeline} isAr={isAr} />}
            </div>
          </div>

          {/* Top Jobs */}
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px' }}>
            <h3 style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={14} color="var(--text-secondary)" /> {isAr ? 'أفضل الوظائف أداءً' : 'Top Performing Jobs'}
            </h3>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 16px' }}>{isAr ? 'الوظائف الأكثر جذباً' : 'Most applications received'}</p>
            <TopJobs jobs={topJobs} isAr={isAr} />
          </div>

          {/* Summary row */}
          {overview && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
              {[
                { icon: Users,    label: isAr ? 'متقدمون جدد'     : 'New Applicants', value: overview.newApplicants,  color: '#3B82F6' },
                { icon: Star,     label: isAr ? 'في القائمة المختصرة' : 'Shortlisted', value: overview.shortlisted,   color: '#8B5CF6' },
                { icon: Clock,    label: isAr ? 'في المقابلات'    : 'Interviewing',    value: overview.interviewed,   color: '#F59E0B' },
                { icon: Sparkles, label: isAr ? 'متوسط التطابق'   : 'Avg Match Score', value: overview.avgMatchScore ? `${overview.avgMatchScore}%` : '—', color: '#22C55E' },
              ].map((stat, i) => (
                <div key={i} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 13, padding: '15px 17px', display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: `${stat.color}14`, border: `1px solid ${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <stat.icon size={15} color={stat.color} strokeWidth={1.8} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 2px' }}>{stat.label}</p>
                    <p style={{ fontSize: 19, fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1, fontFamily: 'var(--font-en)' }}>{fmtNum(stat.value) || stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CompanyLayout>
  );
}
