
import { useState, useEffect } from 'react';
import {
  Zap, Save, Loader2, CheckCircle2,
  Building2, Send, Calendar, TrendingUp, Crown, ChevronRight,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { TEMPLATES } from './cv-templates';

// ─────────────────────────────────────────────────────────────
// Template Icon
// ─────────────────────────────────────────────────────────────
function TplIcon({ t, active, size = 16 }) {
  const Icon = LucideIcons[t.icon] || LucideIcons.FileText;
  const isDark = t.theme === 'dark';
  return (
    <div style={{ width: size+16, height: size+16, borderRadius: 8, background: active ? 'rgba(99,102,241,0.15)' : isDark ? 'var(--text-primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1.5px solid ${active ? 'rgb(99,102,241)' : 'var(--border)'}`, flexShrink: 0 }}>
      <Icon size={size} color={active ? 'rgb(99,102,241)' : isDark ? 'var(--bg-primary)' : 'var(--text-primary)'} strokeWidth={1.5} />
    </div>
  );
}

const COVER_LANGS = [
  { id: 'ar',   label: 'العربية', flag: '🇸🇦', desc: 'خطاب تقديم باللغة العربية' },
  { id: 'en',   label: 'English', flag: '🇬🇧', desc: 'Professional English cover letter' },
  { id: 'auto', label: 'Auto',    flag: '🤖', desc: 'Match the job language automatically' },
];

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────
export default function AutoApplyTab({ isAr, isPro, isElite, planConfig, user }) {
  const canUse = isPro || isElite;
  const font   = isAr ? 'var(--font-ar)' : 'var(--font-en)';

  const [settings,   setSettings]   = useState({ enabled: false, template: 'classic', coverLetterLang: 'auto' });
  const [saving,     setSaving]     = useState(false);
  const [running,    setRunning]    = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [stats,      setStats]      = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [tooltip,    setTooltip]    = useState(null);

  const templatesAllowed = planConfig?.templatesAllowed || (isElite ? 6 : 4);
  const allTemplates     = Object.values(TEMPLATES);

  // ✅ Check if daily or monthly limit reached
  const dailyReached   = stats && stats.dailyLimit   > 0 && stats.usedToday     >= stats.dailyLimit;
  const monthlyReached = stats && stats.monthlyLimit > 0 && stats.usedThisMonth >= stats.monthlyLimit;
  const limitReached   = dailyReached || monthlyReached;

  useEffect(() => {
    if (!canUse) { setLoading(false); return; }
    fetchSettings();
    fetchStats();
    fetchRecentApps();
  }, [canUse]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/auto-apply/settings');
      if (data.data) setSettings(p => ({ ...p, ...data.data }));
    } catch {}
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/auto-apply/stats');
      if (data.data) setStats(data.data);
    } catch {}
  };

  const fetchRecentApps = async () => {
    try {
      const { data } = await api.get('/applications/me', { params: { limit: 20 } });
      const apps = data.data?.rows || data.data?.applications || data.data || [];
      const auto = apps
        .filter(a => a.isAutoApplied)
        .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
        .slice(0, 5);
      setRecentApps(auto);
    } catch { setRecentApps([]); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/auto-apply/settings', settings);
      toast.success(isAr ? 'تم حفظ الإعدادات ✓' : 'Settings saved ✓');
    } catch { toast.error(isAr ? 'فشل الحفظ' : 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleRunNow = async () => {
    if (!settings.enabled) { toast.error(isAr ? 'فعّل التقديم التلقائي أولاً' : 'Enable auto-apply first'); return; }
    if (limitReached) { toast.error(dailyReached ? (isAr?'وصلت للحد اليومي':'Daily limit reached') : (isAr?'وصلت للحد الشهري':'Monthly limit reached')); return; }
    setRunning(true);
    try {
      const { data } = await api.post('/auto-apply/run', {
        coverLetterLang: settings.coverLetterLang,
        template:        settings.template,
      });
      const applied = data.data?.applied?.length || 0;
      const reason  = data.data?.reason;

      if (reason === 'daily_limit_reached')   { toast.error(isAr ? 'وصلت للحد اليومي' : 'Daily limit reached'); }
      else if (reason === 'monthly_limit_reached') { toast.error(isAr ? 'وصلت للحد الشهري' : 'Monthly limit reached'); }
      else if (reason === 'no_cv')            { toast.error(isAr ? 'لا توجد سيرة ذاتية' : 'No CV found'); }
      else if (applied > 0)                   { toast.success(isAr ? `✅ تم التقديم على ${applied} وظيفة` : `✅ Applied to ${applied} jobs`); }
      else                                    { toast.success(isAr ? 'ℹ️ لا توجد وظائف مناسبة حالياً' : 'ℹ️ No matching jobs found'); }

      await fetchStats();
      await fetchRecentApps();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(typeof msg === 'object' ? (isAr ? msg.ar : msg.en) : msg || (isAr ? 'فشل التشغيل' : 'Run failed'));
    } finally { setRunning(false); }
  };

  // ── Upgrade wall ──────────────────────────────────────────
  if (!canUse) return (
    <div style={{ padding: '48px 24px', textAlign: 'center', maxWidth: 420, margin: '0 auto', fontFamily: font }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Zap size={28} color="rgb(99,102,241)" strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
        {isAr ? 'التقديم التلقائي — Pro & Elite فقط' : 'Auto-Apply — Pro & Elite only'}
      </p>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 24px', lineHeight: 1.7 }}>
        {isAr ? 'دع الذكاء الاصطناعي يقدّم على الوظائف المناسبة تلقائياً' : 'Let AI automatically apply to matching jobs based on your profile and CV'}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        {(isAr
          ? ['خطاب تقديم AI','مطابقة ذكية','إرسال تلقائي','تتبع فوري']
          : ['AI Cover Letter','Smart Matching','Auto Send','Live Tracking']
        ).map((f,i) => (
          <span key={i} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', color: 'rgb(99,102,241)', border: '1px solid rgba(99,102,241,0.2)', fontWeight: 600 }}>{f}</span>
        ))}
      </div>
      <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 12, background: 'rgb(99,102,241)', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 700, fontFamily: font }}>
        <Crown size={14} /> {isAr ? 'ترقية للـ Pro' : 'Upgrade to Pro'} <ChevronRight size={14} />
      </a>
    </div>
  );

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 48 }}>
      <Loader2 size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--text-secondary)' }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: font }}>

      {/* Stats Row */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: 10 }}>
          {[
            { label: isAr ? 'هذا الشهر' : 'This Month', value: `${stats.usedThisMonth||0}/${stats.monthlyLimit||30}`, Icon: Calendar,    color: '#6366F1' },
            { label: isAr ? 'اليوم'      : 'Today',      value: `${stats.usedToday||0}/${stats.dailyLimit||5}`,         Icon: Zap,          color: '#F59E0B' },
            { label: isAr ? 'إجمالي'     : 'Total',      value: stats.totalApplied || 0,                                Icon: Send,         color: '#22C55E' },
            { label: isAr ? 'نسبة الرد'  : 'Response',   value: `${stats.responseRate||0}%`,                            Icon: TrendingUp,   color: '#3B82F6' },
          ].map((s,i) => (
            <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <s.Icon size={13} color={s.color} />
                <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 600 }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Card */}
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>

        {/* Toggle */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
              {isAr ? 'تفعيل التقديم التلقائي' : 'Enable Auto-Apply'}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>
              {isAr ? 'يقدّم AI تلقائياً على الوظائف المناسبة لملفك' : 'AI automatically applies to jobs matching your profile'}
            </p>
          </div>
          <button onClick={() => setSettings(p => ({ ...p, enabled: !p.enabled }))}
            style={{ width: 48, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', background: settings.enabled ? '#22C55E' : 'var(--border)', transition: 'all 0.2s', position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.enabled ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </button>
        </div>

        {/* Settings body */}
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18, opacity: settings.enabled ? 1 : 0.5, pointerEvents: settings.enabled ? 'auto' : 'none', transition: 'opacity 0.2s' }}>

          {/* ① Template */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
              {isAr ? '① قالب السيرة الذاتية' : '① CV Template'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {allTemplates.map((t, idx) => {
                const active = settings.template === t.id;
                const locked = idx >= templatesAllowed;
                return (
                  <div key={t.id} style={{ position: 'relative' }}>
                    <button
                      onClick={async () => {
                        if (locked) return;
                        setSettings(p => ({ ...p, template: t.id }));
                        try {
                          await api.patch('/cvs/template', { template: t.id });
                          toast.success(isAr ? '✓ تم تحديث القالب وحفظه' : '✓ Template updated & saved');
                        } catch {
                          toast.error(isAr ? 'فشل تحديث القالب' : 'Failed to update template');
                        }
                      }}
                      onMouseEnter={() => setTooltip(t.id)}
                      onMouseLeave={() => setTooltip(null)}
                      style={{ width: '100%', padding: '10px 6px', borderRadius: 10, cursor: locked ? 'not-allowed' : 'pointer', border: `2px solid ${active ? 'rgb(99,102,241)' : 'var(--border)'}`, background: active ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)', transition: 'all 0.15s', textAlign: 'center', opacity: locked ? 0.4 : 1, position: 'relative' }}
                    >
                      {active && <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'rgb(99,102,241)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={9} color="#fff" /></div>}
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}><TplIcon t={t} active={active} size={14} /></div>
                      <p style={{ fontSize: 9.5, fontWeight: 700, color: active ? 'rgb(99,102,241)' : 'var(--text-primary)', margin: 0 }}>{isAr ? t.nameAr : t.nameEn}</p>
                    </button>
                    {tooltip === t.id && (
                      <div style={{ position: 'absolute', bottom: 'calc(100%+6px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 10, fontWeight: 600, padding: '5px 9px', borderRadius: 7, whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none' }}>
                        {isAr ? t.nameAr : t.nameEn}{locked ? ' 🔒' : ''}
                        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--text-primary)' }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ② Cover Letter Language */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
              {isAr ? '② لغة خطاب التقديم' : '② Cover Letter Language'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {COVER_LANGS.map(l => {
                const active = settings.coverLetterLang === l.id;
                return (
                  <button key={l.id} onClick={() => setSettings(p => ({ ...p, coverLetterLang: l.id }))}
                    style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${active ? 'rgb(99,102,241)' : 'var(--border)'}`, background: active ? 'rgba(99,102,241,0.08)' : 'var(--bg-primary)', transition: 'all 0.15s', textAlign: isAr ? 'right' : 'left' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{l.flag}</div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: active ? 'rgb(99,102,241)' : 'var(--text-primary)', margin: '0 0 2px' }}>{l.label}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{l.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
              {isAr ? 'ملخص الإعدادات' : 'Settings Summary'}
            </p>
            {[
              { label: isAr ? 'القالب'      : 'Template',      value: isAr ? TEMPLATES[settings.template]?.nameAr : TEMPLATES[settings.template]?.nameEn },
              { label: isAr ? 'لغة الخطاب'  : 'Cover Letter',  value: COVER_LANGS.find(l => l.id === settings.coverLetterLang)?.label },
              { label: isAr ? 'الحد اليومي' : 'Daily Limit',   value: stats ? `${stats.usedToday}/${stats.dailyLimit}` : '—' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{item.label}</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Limit warning */}
        {limitReached && (
          <div style={{ margin: '0 18px 14px', padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={14} color="#EF4444" />
            <span style={{ fontSize: 12, color: '#EF4444', fontWeight: 600 }}>
              {dailyReached
                ? (isAr ? `وصلت للحد اليومي (${stats.usedToday}/${stats.dailyLimit}) — حاول غداً` : `Daily limit reached (${stats.usedToday}/${stats.dailyLimit}) — try again tomorrow`)
                : (isAr ? `وصلت للحد الشهري (${stats.usedThisMonth}/${stats.monthlyLimit})` : `Monthly limit reached (${stats.usedThisMonth}/${stats.monthlyLimit})`)}
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ padding: '14px 18px', borderTop: limitReached ? 'none' : '1px solid var(--border)', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontWeight: 700, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: font }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={14} />}
            {isAr ? 'حفظ الإعدادات' : 'Save Settings'}
          </button>
          <button onClick={handleRunNow} disabled={running || !settings.enabled || limitReached}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 20px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, cursor: (running||!settings.enabled||limitReached) ? 'not-allowed' : 'pointer', opacity: (running||!settings.enabled||limitReached) ? 0.5 : 1, fontFamily: font }}
            title={limitReached ? (dailyReached ? (isAr?'وصلت للحد اليومي':'Daily limit reached') : (isAr?'وصلت للحد الشهري':'Monthly limit reached')) : ''}>
            {running ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={14} />}
            {limitReached ? (dailyReached ? (isAr ? 'الحد اليومي ممتلئ' : 'Daily Limit Full') : (isAr ? 'الحد الشهري ممتلئ' : 'Monthly Limit Full')) : (isAr ? 'تشغيل الآن' : 'Run Now')}
          </button>
        </div>
      </div>

      {/* Recent Applications */}
      {recentApps.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
              {isAr ? 'آخر التقديمات التلقائية' : 'Recent Auto-Applications'}
            </p>
            <a href="/dashboard/applications" style={{ fontSize: 11, color: 'rgb(99,102,241)', fontWeight: 600, textDecoration: 'none' }}>
              {isAr ? 'عرض الكل ←' : 'View all →'}
            </a>
          </div>
          {recentApps.map((app, i) => {
            const statusColor = { sent:'#6366F1', viewed:'#F59E0B', shortlisted:'#22C55E', interview:'#3B82F6', accepted:'#10B981', rejected:'#EF4444' }[app.status] || '#6B7280';
            return (
              <div key={app.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: i < recentApps.length-1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={16} color="var(--text-secondary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.job?.title || '—'}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>{app.job?.company?.name || '—'}{app.matchScore ? ` · ${Math.round(app.matchScore)}% match` : ''}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 99, background: `${statusColor}18`, color: statusColor, fontWeight: 700, textTransform: 'capitalize' }}>{app.status}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {recentApps.length === 0 && settings.enabled && (
        <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14 }}>
          <Zap size={28} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px' }}>
            {isAr ? 'لا توجد تقديمات تلقائية بعد' : 'No auto-applications yet'}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>
            {isAr ? 'اضغط "تشغيل الآن" أو انتظر الجدولة التلقائية' : 'Click "Run Now" or wait for the auto-schedule'}
          </p>
        </div>
      )}

    </div>
  );
}