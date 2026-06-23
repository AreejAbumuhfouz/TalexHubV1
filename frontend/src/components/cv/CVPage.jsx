

import { useState, useEffect, useRef } from 'react';
import {
  Upload, Sparkles, Download, Save, Loader2,
  CheckCircle2, Eye, PenLine, Shield, FileText, RefreshCw, AlertCircle,
  Send, Zap, Building2, Star, ChevronLeft, ChevronRight as ChevronRightIcon,
  Plus, Trash2, Crown, Lock,
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import useLang from '../../i18n';
import useAuthStore from '../../store/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from '../../pages/Dashboard/DashboardSidebar';
import { TEMPLATES, renderTemplate } from './cv-templates';
import { CVEditor, ATSPanel } from './CVComponents';
import DownloadCVModal from './DownloadCVModal';
import AutoApplyTab from './AutoApplyTab';

// ─────────────────────────────────────────────────────────────
// Template Icon
// ─────────────────────────────────────────────────────────────
function TplIcon({ t, active, size = 18 }) {
  const Icon = LucideIcons[t.icon] || LucideIcons.FileText;
  const isDark = t.theme === 'dark';
  return (
    <div style={{ width: size + 18, height: size + 18, borderRadius: 9, background: active ? 'rgba(255,255,255,0.15)' : isDark ? 'var(--text-primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', flexShrink: 0 }}>
      <Icon size={size} color={active ? 'var(--bg-primary)' : isDark ? 'var(--bg-primary)' : 'var(--text-primary)'} strokeWidth={1.5} />
    </div>
  );
}

function TplIconSmall({ t, active }) {
  const Icon = LucideIcons[t.icon] || LucideIcons.FileText;
  const isDark = t.theme === 'dark';
  return <Icon size={13} color={active ? 'var(--bg-primary)' : isDark ? 'var(--text-primary)' : 'var(--text-secondary)'} strokeWidth={1.5} />;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const emptyCV = (user = {}) => ({
  fullName:       user.fullName    || '',
  headline:       user.headline    || '',
  email:          user.email       || '',
  phone:          user.phone       || '',
  location:       [user.locationCity, user.locationCountry].filter(Boolean).join(', '),
  linkedin:       user.linkedinUrl || '',
  summary:        '',
  skills:         '',
  languages:      '',
  certifications: '',
  experiences:    [{ title:'', company:'', startDate:'', endDate:'', current:false, description:'' }],
  education:      [{ institution:'', degree:'', field:'', year:'' }],
});

// Local ATS algorithm
function runLocalATS(cvData) {
  const text = [cvData.summary, cvData.skills, cvData.languages, cvData.certifications,
    ...(cvData.experiences||[]).map(e=>`${e.title} ${e.company} ${e.description}`),
    ...(cvData.education||[]).map(e=>`${e.institution} ${e.degree} ${e.field}`),
  ].join(' ').toLowerCase();
  const KEYWORDS = ['javascript','python','react','node','sql','api','git','agile','scrum','management','analysis','design','communication','leadership','project','typescript','docker','aws','rest','html','css','testing'];
  const found    = KEYWORDS.filter(k => text.includes(k));
  const keywords = Math.min(100, Math.round((found.length/8)*100));
  const skillWords = (cvData.skills||'').split(/[,\n|•]+/).filter(s=>s.trim().length>1);
  const skills   = Math.min(100, skillWords.length*8);
  const summaryLen = (cvData.summary||'').split(' ').filter(Boolean).length;
  const clarity  = Math.min(100,(summaryLen>=40?40:summaryLen)+(cvData.headline?.trim()?20:0)+(cvData.linkedin?.trim()?15:0)+(cvData.location?.trim()?15:0)+(cvData.phone?.trim()?10:0));
  const hasEdu   = (cvData.education||[]).some(e=>e.institution||e.degree);
  const education = Math.min(100,(hasEdu?50:0)+((cvData.education||[]).filter(e=>e.institution&&e.degree&&e.year).length)*25);
  const expItems = (cvData.experiences||[]).filter(e=>e.title&&e.company);
  const experience = Math.min(100,expItems.length*20+expItems.filter(e=>(e.description||'').split(' ').length>10).length*15);
  const fields   = ['fullName','email','phone','location','headline','summary','skills','linkedin'];
  const formatting = Math.round((fields.filter(f=>(cvData[f]||'').toString().trim().length>0).length/fields.length)*100);
  const scores   = {skills,clarity,keywords,education,experience,formatting};
  const overall  = Math.round(Object.values(scores).reduce((a,b)=>a+b,0)/Object.keys(scores).length);
  return { overallScore: overall, scores, missingKeywords: KEYWORDS.filter(k=>!text.includes(k)).slice(0,6), suggestions: [] };
}

// ════════════════════════════════════════════════════════════
// USAGE BAR — compact
// ════════════════════════════════════════════════════════════
function UsageBar({ isAr, usage, planConfig }) {
  if (!planConfig) return null;
  const { analysisPerDay, analysisPerMonth } = planConfig;
  const { today = 0, thisMonth = 0 } = usage || {};
  const reachedDay   = analysisPerDay   > 0 && today     >= analysisPerDay;
  const reachedMonth = analysisPerMonth > 0 && thisMonth >= analysisPerMonth;
  const isLimited    = reachedDay || reachedMonth;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 13px', background: 'var(--bg-secondary)', borderRadius: 9, border: `1px solid ${isLimited ? '#EF444430' : 'var(--border)'}`, marginBottom: 2, flexWrap: 'wrap' }}>
      {[
        { label: isAr ? 'اليوم' : 'Today',  used: today,     limit: analysisPerDay,   reached: reachedDay   },
        { label: isAr ? 'الشهر' : 'Month',  used: thisMonth, limit: analysisPerMonth, reached: reachedMonth },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>{item.label}:</span>
          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: 'var(--font-en)', color: item.reached ? '#EF4444' : 'var(--text-primary)' }}>
            {item.used}/{item.limit === 0 ? '∞' : item.limit}
          </span>
          {item.limit > 0 && (
            <div style={{ width: 38, height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((item.used/item.limit)*100,100)}%`, background: item.reached ? '#EF4444' : '#22C55E', borderRadius: 99 }} />
            </div>
          )}
        </div>
      ))}
      {isLimited && <span style={{ fontSize: 10.5, color: '#EF4444', marginLeft: 'auto' }}>⚠️ {isAr ? 'تم الوصول للحد' : 'Limit reached'}</span>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CV NAVIGATOR — switch between multiple CVs
// ════════════════════════════════════════════════════════════
function CVNavigator({ cvs, activeCvId, onSelect, onDelete, onSetPrimary, isAr, font, canAdd, onAdd }) {
  if (cvs.length <= 1 && !canAdd) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 14, overflowX: 'auto', scrollbarWidth: 'none' }}>
      <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: font }}>{isAr ? 'سيرك الذاتية:' : 'My CVs:'}</span>
      {cvs.map((cv, i) => {
        const active = cv.id === activeCvId;
        return (
          <div key={cv.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 8, border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`, background: active ? 'var(--text-primary)' : 'var(--bg-primary)', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }} onClick={() => onSelect(cv)}>
            <FileText size={11} color={active ? 'var(--bg-primary)' : 'var(--text-secondary)'} />
            <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? 'var(--bg-primary)' : 'var(--text-primary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cv.title || `CV ${i+1}`}</span>
            {cv.isPrimary && <span style={{ fontSize: 8.5, padding: '1px 5px', borderRadius: 4, background: active ? 'rgba(255,255,255,0.2)' : 'rgba(34,197,94,0.15)', color: active ? 'var(--bg-primary)' : '#16A34A', fontWeight: 700 }}>★</span>}
          </div>
        );
      })}
      {canAdd && (
        <button onClick={onAdd} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 8, border: '1.5px dashed var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 11, flexShrink: 0 }}>
          <Plus size={11} /> {isAr ? 'إضافة' : 'Add'}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN CVPage
// ════════════════════════════════════════════════════════════
export default function CVPage() {
  const { lang } = useLang();
  const { user } = useAuthStore();
  const isAr     = lang === 'ar';
  const font     = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const planKey  = user?.planKey || 'free';
  const isPro    = ['pro','elite'].includes(planKey);
  const isElite  = planKey === 'elite';
  const isAdmin  = ['admin','support'].includes(user?.role);

  const [collapsed,    setCollapsed]   = useState(false);
  const [step,         setStep]        = useState('choose'); // 'choose' | 'edit'
  const [template,     setTemplate]    = useState('classic');
  const [cvData,       setCvData]      = useState(() => emptyCV(user));
  const [cvId,         setCvId]        = useState(null);
  const [allCVs,       setAllCVs]      = useState([]);
  const [analysis,     setAnalysis]    = useState(null);
  const [tab,          setTab]         = useState('edit');
  const [uploading,    setUploading]   = useState(false);
  const [saving,       setSaving]      = useState(false);
  const [analyzing,    setAnalyzing]   = useState(false);
  const [aiLoading,    setAiLoading]   = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [planConfig,   setPlanConfig]  = useState(null);
  const [usage,        setUsage]       = useState({ today: 0, thisMonth: 0, cvCount: 0 });
  const [tplTooltip,   setTplTooltip]  = useState(null);
  const [barTooltip,   setBarTooltip]  = useState(null);

  const fileRef   = useRef(null);
  const pageTitle = isAr ? 'سيرتي الذاتية' : 'My CV';

  // ── Compute allowed templates ──────────────────────────────
  const templatesAllowed = planConfig?.templatesAllowed || (isPro ? (isElite ? 6 : 4) : 2);
  const allTemplatesList = Object.values(TEMPLATES);
  const visibleTemplates = isAdmin ? allTemplatesList : allTemplatesList.slice(0, templatesAllowed);

  // ── Compute limits ─────────────────────────────────────────
  const analysisLimitReached =
    (planConfig?.analysisPerDay   > 0 && usage.today     >= planConfig.analysisPerDay) ||
    (planConfig?.analysisPerMonth > 0 && usage.thisMonth >= planConfig.analysisPerMonth);

  const maxCVs    = planConfig?.maxCVs || 1;
  const canAddCV  = (usage.cvCount || allCVs.length) < maxCVs;

  // ── Fetch limits + CVs ─────────────────────────────────────
  const fetchLimits = async () => {
    try {
      const { data } = await api.get('/cvs/limits');
      if (data.data) {
        setPlanConfig(data.data.planConfig);
        setUsage(data.data.usage || { today: 0, thisMonth: 0, cvCount: 0 });
      }
    } catch {}
  };

  const fetchCVs = async () => {
    try {
      const { data } = await api.get('/cvs');
      const cvs = data.data?.cvs || [];
      setAllCVs(cvs);
      if (data.data?.planConfig) setPlanConfig(data.data.planConfig);
      if (cvs.length > 0) {
        const primary = cvs.find(c => c.isPrimary) || cvs[0];
        loadCV(primary);
      }
    } catch {}
  };

  useEffect(() => {
    fetchLimits();
    fetchCVs();
  }, []);

  const loadCV = (cv) => {
    setCvId(cv.id);
    if (cv.builderData) {
      setCvData({ ...emptyCV(user), ...cv.builderData });
      if (cv.builderData.template) setTemplate(cv.builderData.template);
    }
    if (cv.analysisData || cv.aiFeedback) setAnalysis(cv.analysisData || cv.aiFeedback);
    setStep('edit');
  };

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = async (file) => {
    if (!file) return;
    if (!['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error(isAr ? 'PDF أو DOCX فقط' : 'PDF or DOCX only'); return;
    }
    if (file.size > 10*1024*1024) { toast.error(isAr ? 'الحد الأقصى 10MB' : 'Max 10MB'); return; }
    if (!canAddCV && !cvId) { toast.error(isAr ? `وصلت للحد الأقصى (${maxCVs} سيرة)` : `CV limit reached (${maxCVs})`); return; }

    setUploading(true);
    const fd = new FormData();
    fd.append('cv', file);
    fd.append('title', file.name.replace(/\.[^.]+$/, ''));
    fd.append('template', template);
    try {
      const { data } = await api.post('/cvs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const cv = data.data.cv;
      setCvId(cv.id);
      // ✅ Use detected language from backend
      const detectedLang = data.data.detectedLanguage || 'en';
      if (data.data.parsedData) setCvData(prev => ({ ...prev, ...data.data.parsedData }));
      if (data.data.planConfig) setPlanConfig(data.data.planConfig);
      const localAnalysis = runLocalATS({ ...emptyCV(user), ...(data.data.parsedData || {}) });
      setAnalysis(data.data.analysis || localAnalysis);
      await fetchCVs();
      await fetchLimits();
      setStep('edit');
      toast.success((isAr ? 'تم رفع السيرة ✓ — لغة مكتشفة: ' : 'CV uploaded ✓ — detected: ') + (detectedLang === 'ar' ? 'عربي 🇸🇦' : 'English 🇬🇧'));
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error((typeof msg === 'object' ? (isAr ? msg.ar : msg.en) : msg) || (isAr ? 'فشل الرفع' : 'Upload failed'));
    } finally { setUploading(false); }
  };

  // ── Save ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!cvData.fullName?.trim()) { toast.error(isAr ? 'يرجى إدخال الاسم الكامل' : 'Please enter your full name'); return; }
    setSaving(true);
    try {
      let id = cvId;
      const html    = renderTemplate(cvData, template, lang);
      const payload = { title: cvData.fullName || 'My CV', builderData: { ...cvData, template }, template, language: lang, html };
      if (!id) {
        const r = await api.post('/cvs/save', payload);
        id = r.data?.data?.cv?.id || r.data?.data?.id;
        if (id) setCvId(id);
        if (r.data?.data?.planConfig) setPlanConfig(r.data.data.planConfig);
      } else {
        await api.patch(`/cvs/${id}`, payload).catch(async e => {
          if (e.response?.status === 404 || e.response?.status === 405) {
            const r = await api.post('/cvs/save', payload);
            id = r.data?.data?.cv?.id || r.data?.data?.id;
            if (id) setCvId(id);
          } else throw e;
        });
      }
      await fetchCVs();
      toast.success(isAr ? 'تم الحفظ ✓' : 'Saved ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
    } finally { setSaving(false); }
  };

  // ── Analyze ────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!cvId) { toast.error(isAr ? 'احفظ السيرة أولاً' : 'Save your CV first'); return; }
    if (analysisLimitReached) { toast.error(isAr ? 'وصلت للحد اليومي أو الشهري' : 'Daily or monthly limit reached'); return; }
    setAnalyzing(true);
    try {
      if (isPro || isAdmin) {
        // Pro/Elite: use AI re-analyze
        const { data } = await api.post(`/cvs/${cvId}/re-analyze`);
        setAnalysis(data.data?.analysis || data.data);
        toast.success(isAr ? 'تم التحليل بالذكاء الاصطناعي ✓' : 'AI analysis complete ✓');
      } else {
        // Free: local algorithm
        const localResult = runLocalATS(cvData);
        setAnalysis(localResult);
        api.post(`/cvs/${cvId}/analyze-free`, { localAnalysis: localResult }).catch(() => {});
        toast.success(isAr ? 'تم التحليل ✓' : 'Analysis complete ✓');
      }
      await fetchLimits();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 429) {
        toast.error((typeof msg === 'object' ? (isAr ? msg.ar : msg.en) : msg) || (isAr ? 'وصلت للحد الأقصى' : 'Limit reached'));
      } else {
        toast.error(isAr ? 'فشل التحليل' : 'Analysis failed');
      }
    } finally { setAnalyzing(false); }
  };

  // ── AI Enhance (Pro/Elite) ─────────────────────────────────
  const handleAiEnhance = async ({ section, index, targetRole, userData }) => {
    if (!isPro && !isAdmin) { toast.error(isAr ? 'تحسين AI للباقة Pro فقط' : 'AI Enhance requires Pro'); return; }
    setAiLoading({ section, index });
    try {
      const { data } = await api.post('/cvs/build', { section, language: lang, targetRole: targetRole || cvData.headline, userData: userData || { headline: cvData.headline, experiences: cvData.experiences, skills: cvData.skills } });
      const content = data.data.content;
      if (section === 'summary') { setCvData(prev => ({ ...prev, summary: content })); toast.success(isAr ? 'تم تحسين الملخص ✨' : 'Summary enhanced ✨'); }
      else if (section === 'experience' && index !== undefined) { const exps = [...(cvData.experiences||[])]; exps[index] = { ...exps[index], description: content }; setCvData(prev => ({ ...prev, experiences: exps })); toast.success(isAr ? `تم تحسين الخبرة ${index+1} ✨` : `Experience ${index+1} enhanced ✨`); }
      else if (section === 'skills') { setCvData(prev => ({ ...prev, skills: content })); toast.success(isAr ? 'تم تحسين المهارات ✨' : 'Skills enhanced ✨'); }
    } catch { toast.error(isAr ? 'فشل التحسين' : 'Enhancement failed'); }
    finally { setAiLoading(null); }
  };

  // ── Delete CV ──────────────────────────────────────────────
  const handleDeleteCV = async (id) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذه السيرة؟' : 'Delete this CV?')) return;
    try {
      await api.delete(`/cvs/${id}`);
      const remaining = allCVs.filter(c => c.id !== id);
      setAllCVs(remaining);
      if (id === cvId) {
        if (remaining.length > 0) loadCV(remaining[0]);
        else { setCvId(null); setCvData(emptyCV(user)); setAnalysis(null); setStep('choose'); }
      }
      await fetchLimits();
      toast.success(isAr ? 'تم الحذف' : 'Deleted');
    } catch { toast.error(isAr ? 'فشل الحذف' : 'Delete failed'); }
  };

  const isBusy = saving || analyzing;

  const TABS = [
    { id: 'edit',    Icon: PenLine, label: isAr ? 'تحرير'  : 'Edit'    },
    { id: 'preview', Icon: Eye,     label: isAr ? 'معاينة' : 'Preview' },
    ...(isPro || isAdmin ? [{ id: 'auto-apply', Icon: Zap, label: isAr ? 'التقديم التلقائي' : 'Auto-Apply', badge: isElite ? 'Elite' : 'Pro' }] : []),
  ];

  return (
    <>
      <style>{`
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(12px); } to { opacity:1;transform:none; } }
        *{box-sizing:border-box} body{margin:0}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:99px}
        .cv-wrap{display:flex;min-height:100vh}
        .cv-content{flex:1;min-width:0;display:flex;flex-direction:column}
        .cv-main{flex:1;overflow-y:auto;padding:clamp(12px,3vw,24px);animation:fadeUp 0.3s ease}
        .cv-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px}
        .cv-header-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .cv-editor-layout{display:flex;gap:14px;align-items:flex-start}
        .cv-ats-col{width:272px;flex-shrink:0}
        .cv-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
        .cv-tpl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .cv-tab-btn{display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;border:none;cursor:pointer;font-size:12px;font-family:inherit;transition:all 0.2s;white-space:nowrap}
        @media(max-width:1024px){.cv-main{padding-bottom:80px!important}.cv-ats-col{width:240px!important}}
        @media(max-width:860px){.cv-editor-layout{flex-direction:column!important}.cv-ats-col{width:100%!important}.cv-tpl-grid{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:600px){.cv-action-grid{grid-template-columns:1fr!important}.cv-header{flex-direction:column;align-items:flex-start}.cv-header-actions{width:100%;justify-content:flex-end}.cv-tpl-grid{grid-template-columns:repeat(2,1fr)!important}}
      `}</style>

      <div className="cv-wrap" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
        <div className="cv-content">
          <MobileTopBar title={pageTitle} />
          <main className="cv-main">

            {/* ── Header ── */}
            <div className="cv-header">
              <div>
                <h1 style={{ fontSize: 'clamp(1rem,2.5vw,1.35rem)', fontWeight: 900, margin: '0 0 3px', letterSpacing: '-0.03em' }}>{pageTitle}</h1>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                  {isAr
                    ? `${maxCVs === 1 ? 'سيرة ذاتية واحدة' : `حتى ${maxCVs} سيرة`} · ${templatesAllowed} قوالب · ${isPro ? 'تحليل AI' : 'خوارزمية'}`
                    : `${maxCVs === 1 ? 'One CV' : `Up to ${maxCVs} CVs`} · ${templatesAllowed} templates · ${isPro ? 'AI analysis' : 'Algorithm'}`}
                </p>
              </div>

              {step === 'edit' && (
                <div className="cv-header-actions">
                  {/* Analysis badge */}
                  {/* <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '5px 10px', borderRadius: 8, fontWeight: 600, whiteSpace: 'nowrap', background: analysisLimitReached ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${analysisLimitReached ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, color: analysisLimitReached ? '#DC2626' : '#16A34A' }}>
                    {analysisLimitReached ? <AlertCircle size={11} /> : <CheckCircle2 size={11} />}
                    {isPro
                      ? (isAr ? `${planConfig?.analysisPerDay || 3}/يوم AI ✨` : `${planConfig?.analysisPerDay || 3}/day AI ✨`)
                      : (isAr ? `${usage.today || 0}/${planConfig?.analysisPerDay || 1} اليوم` : `${usage.today || 0}/${planConfig?.analysisPerDay || 1} today`)}
                  </div> */}

                  {/* Analyze */}
                  <button onClick={handleAnalyze} disabled={isBusy || analysisLimitReached || !cvId}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: (isBusy||analysisLimitReached||!cvId) ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: font, opacity: (isBusy||analysisLimitReached||!cvId) ? 0.6 : 1, transition: 'all 0.2s' }}>
                    {analyzing ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : isPro ? <Sparkles size={13} /> : <FileText size={13} strokeWidth={2} />}
                    {isAr ? (isPro ? 'تحليل AI' : 'تحليل ATS') : (isPro ? 'AI Analyze' : 'ATS Analyze')}
                  </button>

                  {/* Save */}
                  <button onClick={handleSave} disabled={isBusy}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap', border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: isBusy ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: font, opacity: isBusy ? 0.6 : 1, transition: 'all 0.2s' }}>
                    {saving ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Save size={13} strokeWidth={2} />}
                    {isAr ? 'حفظ' : 'Save'}
                  </button>

                  {/* Download */}
                  <button onClick={() => setShowDownload(true)} disabled={isBusy}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, whiteSpace: 'nowrap', border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', cursor: isBusy ? 'not-allowed' : 'pointer', fontSize: 12.5, fontWeight: 700, fontFamily: font, opacity: isBusy ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <Download size={13} strokeWidth={2} />
                    {isAr ? 'تحميل PDF' : 'Download PDF'}
                  </button>

                  {/* Delete current CV */}
                  {cvId && allCVs.length > 0 && (
                    <button onClick={() => handleDeleteCV(cvId)}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 11px', borderRadius: 10, border: '1.5px solid rgba(239,68,68,0.3)', background: 'transparent', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontFamily: font, transition: 'all 0.2s' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── CV Navigator (multiple CVs) ── */}
            {step === 'edit' && allCVs.length > 0 && (
              <CVNavigator
                cvs={allCVs}
                activeCvId={cvId}
                onSelect={loadCV}
                onDelete={handleDeleteCV}
                onSetPrimary={async (id) => { await api.patch(`/cvs/${id}/primary`); fetchCVs(); }}
                isAr={isAr}
                font={font}
                canAdd={canAddCV}
                onAdd={() => { setCvId(null); setCvData(emptyCV(user)); setAnalysis(null); setStep('choose'); }}
              />
            )}

            {/* ── Usage bar ── */}
            {/* {step === 'edit' && planConfig && (
              <UsageBar isAr={isAr} usage={usage} planConfig={planConfig} />
            )} */}

            {/* ════ STEP: CHOOSE ════ */}
            {step === 'choose' && (
              <div style={{ maxWidth: 720, margin: '0 auto', animation: 'fadeUp 0.3s ease' }}>

                {/* Plan badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                  {isElite ? <Crown size={14} color="#8B5CF6" /> : isPro ? <Crown size={14} color="#F59E0B" /> : <Shield size={14} color="#6B7280" />}
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: isElite ? '#8B5CF6' : isPro ? '#F59E0B' : '#6B7280', textTransform: 'uppercase' }}>{planKey}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>
                    {isAr
                      ? `${templatesAllowed} قوالب · ${isPro ? 'تحليل AI ' : 'خوارزمية'} · ${maxCVs} سيرة ذاتية`
                      : `${templatesAllowed} templates · ${isPro ? 'AI analysis ' : 'Algorithm'} · ${maxCVs} CV${maxCVs > 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Templates */}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 16, padding: 20, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: font }}>{isAr ? '① اختر القالب' : '① Choose Template'}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0, fontFamily: font }}>
                        {isAr ? `${visibleTemplates.length} قوالب — ATS 100%` : `${visibleTemplates.length} templates — ATS 100%`}
                        {!isPro && !isAdmin && <span style={{ color: '#F59E0B', marginInlineStart: 6 }}>({isAr ? 'Pro يفتح المزيد' : 'Pro unlocks more'})</span>}
                      </p>
                    </div>
                    {/* <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, padding: '3px 10px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#16A34A', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600 }}>
                      <CheckCircle2 size={11} /> {isAr ? 'مجاني' : 'Free'}
                    </span> */}
                  </div>

                  <div className="cv-tpl-grid">
                    {allTemplatesList.map((t, idx) => {
                      const active  = template === t.id;
                      const locked  = idx >= templatesAllowed && !isAdmin;
                      return (
                        <div key={t.id} style={{ position: 'relative' }}>
                          <button
                            onClick={() => !locked && setTemplate(t.id)}
                            onMouseEnter={() => setTplTooltip(t.id)}
                            onMouseLeave={() => setTplTooltip(null)}
                            style={{ width: '100%', padding: '12px 8px', borderRadius: 12, cursor: locked ? 'not-allowed' : 'pointer', border: `2px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`, background: active ? 'var(--text-primary)' : locked ? 'var(--bg-secondary)' : 'var(--bg-primary)', transition: 'all 0.2s', textAlign: 'center', position: 'relative', opacity: locked ? 0.5 : 1 }}
                          >
                            {active && <div style={{ position: 'absolute', top: 5, insetInlineEnd: 5, width: 15, height: 15, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={10} color="var(--bg-primary)" /></div>}
                            {locked && <div style={{ position: 'absolute', top: 5, insetInlineStart: 5 }}><Lock size={10} color="#F59E0B" /></div>}
                            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 8px' }}><TplIcon t={t} active={active} size={18} /></div>
                            <p style={{ fontSize: 10.5, fontWeight: 700, color: active ? 'var(--bg-primary)' : 'var(--text-primary)', margin: '0 0 2px', fontFamily: font }}>{isAr ? t.nameAr : t.nameEn}</p>
                            <p style={{ fontSize: 9, color: active ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)', margin: 0 }}>ATS {t.ats}%</p>
                          </button>
                          {tplTooltip === t.id && (
                            <div style={{ position: 'absolute', bottom: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 10.5, fontWeight: 600, padding: '6px 11px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
                              <div style={{ fontWeight: 700, marginBottom: 2 }}>{isAr ? t.nameAr : t.nameEn}{locked ? ' 🔒 Pro' : ''}</div>
                              <div style={{ fontSize: 9.5, opacity: 0.75 }}>{isAr ? t.descAr : t.descEn}</div>
                              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid var(--text-primary)' }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Start options */}
                <p style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px', fontFamily: font }}>{isAr ? '② كيف تريد البدء؟' : '② How do you want to start?'}</p>
                <div className="cv-action-grid">
                  {/* Upload */}
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                    onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; handleUpload(e.dataTransfer.files[0]); }}
                    style={{ padding: '24px 16px', borderRadius: 14, border: '2px dashed var(--border)', background: 'var(--bg-primary)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: 'none' }} onChange={e => handleUpload(e.target.files[0])} />
                    <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      {uploading ? <Loader2 size={20} color="var(--text-secondary)" style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={20} color="var(--text-secondary)" strokeWidth={1.5} />}
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 5px', fontFamily: font }}>{isAr ? 'رفع CV موجود' : 'Upload Existing CV'}</p>
                    <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 6px', lineHeight: 1.6, fontFamily: font }}>
                      {isAr ? 'اكتشاف اللغة تلقائياً 🔍' : 'Auto language detection 🔍'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0 0 10px', fontFamily: font }}>
                      {isPro ? (isAr ? 'تحليل AI عميق' : 'Deep AI analysis') : (isAr ? 'تحليل فوري بالخوارزمية' : 'Instant algorithm analysis')}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {['PDF', 'DOCX'].map(f => <span key={f} style={{ fontSize: 9.5, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontWeight: 600 }}>{f}</span>)}
                    </div>
                  </div>

              
                           
                  <button
                    onClick={() => {
                      if (!isPro && !isAdmin) {
                        toast.error(isAr ? 'الإنشاء من الصفر بمساعدة AI متاح للباقة Pro فقط' : 'Create from Scratch with AI is available on Pro plans only');
                        window.location.href = '/pricing';
                        return;
                      }
                      setCvData(emptyCV(user));
                      setCvId(null);
                      setAnalysis(null);
                      setTab('edit');
                      setStep('edit');
                    }}
                    style={{
                      padding: '24px 16px', borderRadius: 14, border: 'none',
                      background: (isPro || isAdmin) ? 'rgb(47, 43, 43)' : 'var(--bg-secondary)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      position: 'relative',
                      opacity: (isPro || isAdmin) ? 1 : 0.85,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = (isPro || isAdmin) ? '0.88' : '0.85'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = (isPro || isAdmin) ? '1' : '0.85'; e.currentTarget.style.transform = 'none'; }}
                  >
                    {!isPro && !isAdmin && (
                      <div style={{ position: 'absolute', top: 10, insetInlineEnd: 10 }}>
                        <Lock size={13} color="#F59E0B" />
                      </div>
                    )}
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: (isPro || isAdmin) ? 'rgba(255,255,255,0.12)' : 'var(--bg-primary)',
                      border: (isPro || isAdmin) ? 'none' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                    }}>
                      <PenLine size={20} color={(isPro || isAdmin) ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)'} strokeWidth={1.5} />
                    </div>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: (isPro || isAdmin) ? '#fff' : 'var(--text-primary)', margin: '0 0 5px', fontFamily: font }}>
                      {isAr ? 'إنشاء من الصفر' : 'Create from Scratch'}
                    </p>
                    <p style={{ fontSize: 11.5, color: (isPro || isAdmin) ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.6, fontFamily: font }}>
                      {isAr ? 'مع مساعدة AI ✨' : 'With AI assistance ✨'}
                    </p>
                    <span style={{
                      fontSize: 10.5, padding: '3px 12px', borderRadius: 99, fontWeight: 600, fontFamily: font,
                      background: (isPro || isAdmin) ? 'rgba(255,255,255,0.15)' : 'rgba(245,158,11,0.12)',
                      color: (isPro || isAdmin) ? 'rgba(255,255,255,0.8)' : '#F59E0B',
                    }}>
                      {(isPro || isAdmin)
                        ? (isAr ? 'ابدأ الآن ←' : 'Start Now →')
                        : (isAr ? 'يتطلب Pro 🔒' : 'Requires Pro 🔒')}
                    </span>
                  </button>
                </div>

                {/* Feature tags */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  {[
                    { Icon: Shield,       ar: 'بياناتك آمنة',           en: 'Your data is secure'  },
                    { Icon: RefreshCw,    ar: 'عدّل في أي وقت',          en: 'Edit anytime'          },
                    { Icon: Download,     ar: 'تحميل PDF مجاني',          en: 'Free PDF download'     },
                    { Icon: CheckCircle2, ar: 'متوافق مع ATS 100%',      en: 'ATS 100% compatible'   },
                    ...(isPro ? [{ Icon: Sparkles, ar: 'تحليل AI ✨', en: 'AI analysis ✨' }] : []),
                  ].map(({ Icon, ar, en }, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)', padding: '4px 9px', borderRadius: 7, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontFamily: font }}>
                      <Icon size={11} strokeWidth={2} /> {isAr ? ar : en}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ════ STEP: EDIT ════ */}
            {step === 'edit' && (
              <div style={{ animation: 'fadeUp 0.3s ease' }}>
                {/* Tab bar + Template switcher */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 3, background: 'var(--bg-secondary)', borderRadius: 10, padding: 3, border: '1px solid var(--border)' }}>
                    {TABS.map(t => (
                      <button key={t.id} className="cv-tab-btn" onClick={() => setTab(t.id)}
                        style={{ fontWeight: tab===t.id?700:500, background: tab===t.id?'var(--text-primary)':'transparent', color: tab===t.id?'var(--bg-primary)':'var(--text-secondary)' }}>
                        <t.Icon size={12} strokeWidth={2} /> {t.label}
                        {t.badge && <span style={{ fontSize: 8.5, padding: '1px 5px', borderRadius: 4, background: tab===t.id?'rgba(255,255,255,0.2)':'rgba(99,102,241,0.12)', color: tab===t.id?'#fff':'rgb(99,102,241)', fontWeight: 700, marginInlineStart: 2 }}>{t.badge}</span>}
                      </button>
                    ))}
                  </div>

                  {step === 'edit' && planConfig && (
              <UsageBar isAr={isAr} usage={usage} planConfig={planConfig} />
            )}

                  {tab !== 'auto-apply' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontFamily: font }}>{isAr ? 'القالب:' : 'Template:'}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {allTemplatesList.map((t, idx) => {
                          const active = template === t.id;
                          const locked = idx >= templatesAllowed && !isAdmin;
                          return (
                            <div key={t.id} style={{ position: 'relative' }}>
                              <button
                                onClick={() => !locked && setTemplate(t.id)}
                                onMouseEnter={() => setBarTooltip(t.id)}
                                onMouseLeave={() => setBarTooltip(null)}
                                style={{ width: 30, height: 30, borderRadius: 7, border: `2px solid ${active?'var(--text-primary)':'var(--border)'}`, background: active?'var(--text-primary)':'var(--bg-secondary)', cursor: locked?'not-allowed':'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', opacity: locked?0.4:1 }}>
                                {locked ? <Lock size={11} color="var(--text-secondary)" /> : <TplIconSmall t={t} active={active} />}
                              </button>
                              {barTooltip === t.id && (
                                <div style={{ position: 'absolute', bottom: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 10.5, fontWeight: 600, padding: '5px 10px', borderRadius: 7, whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
                                  {isAr ? t.nameAr : t.nameEn}{locked ? ' 🔒' : ''}
                                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid var(--text-primary)' }} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {tab === 'auto-apply' && (
                  <AutoApplyTab
                    isAr={isAr}
                    isPro={isPro}
                    isElite={isElite}
                    cvId={cvId}
                    cvData={cvData}
                    lang={lang}
                    planConfig={planConfig}
                    user={user}
                  />
                )}

                {tab !== 'auto-apply' && (
                  <div className="cv-editor-layout">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {tab === 'edit' ? (
                        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: 'clamp(14px,2vw,20px)' }}>
                          <CVEditor data={cvData} onChange={setCvData} isAr={isAr} isPro={isPro} onAiEnhance={handleAiEnhance} aiLoading={aiLoading} />
                        </div>
                      ) : (
                        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
                          <div style={{ padding: '8px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Eye size={12} color="var(--text-secondary)" />
                            <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: font }}>
                              {isAr ? `معاينة — قالب ${TEMPLATES[template]?.nameAr}` : `Preview — ${TEMPLATES[template]?.nameEn}`}
                            </span>
                          </div>
                          <iframe srcDoc={renderTemplate(cvData, template, lang)} style={{ width: '100%', height: 1000, border: 'none', display: 'block' }} title="CV Preview" />
                        </div>
                      )}
                    </div>

                    {/* ATS Panel */}
                    <div className="cv-ats-col">
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0, fontFamily: font }}>
                            {isAr ? 'تحليل ATS' : 'ATS Analysis'}
                          </p>
                          {isPro && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(99,102,241,0.1)', color: 'rgb(99,102,241)', fontWeight: 700 }}>AI</span>}
                        </div>
                        <ATSPanel analysis={analysis} isAr={isAr} isPro={isPro} onUpgrade={() => window.location.href = '/pricing'} />
                      </div>

                      {/* Daily usage */}
                      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 14, padding: 14 }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontFamily: font }}>
                          {isAr ? 'الاستخدام' : 'Usage'}
                        </p>
                        {planConfig && [
                          { label: isAr ? 'تحليل اليوم' : 'Today',  used: usage.today,     limit: planConfig.analysisPerDay   },
                          { label: isAr ? 'تحليل الشهر' : 'Month',  used: usage.thisMonth, limit: planConfig.analysisPerMonth },
                          { label: isAr ? 'سيرك الذاتية' : 'CVs',   used: usage.cvCount || allCVs.length, limit: planConfig.maxCVs },
                        ].map((item, i) => (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-primary)', fontFamily: font }}>{item.label}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-en)', color: (item.used >= item.limit && item.limit > 0) ? '#EF4444' : '#22C55E' }}>{item.used}/{item.limit === 0 ? '∞' : item.limit}</span>
                            </div>
                            {item.limit > 0 && (
                              <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.min((item.used/item.limit)*100,100)}%`, background: item.used >= item.limit ? '#EF4444' : '#22C55E', borderRadius: 99, transition: 'width 0.5s' }} />
                              </div>
                            )}
                          </div>
                        ))}
                        {!isPro && (
                          <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, fontSize: 11, color: 'rgb(99,102,241)', fontWeight: 700, textDecoration: 'none', fontFamily: font }}>
                            <Sparkles size={11} /> {isAr ? 'ترقية للـ Pro' : 'Upgrade to Pro'}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            

            <div style={{ height: 28 }} />
          </main>
        </div>
      </div>

      <MobileBottomNav />
      {showDownload && (
        <DownloadCVModal html={renderTemplate(cvData, template, lang)} defaultName={cvData.fullName || (isAr ? 'سيرتي الذاتية' : 'My CV')} isAr={isAr} cvId={cvId} onClose={() => setShowDownload(false)} />
      )}
    </>
  );
}