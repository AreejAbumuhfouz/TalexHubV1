import { Sparkles, CheckCircle2, X, Plus, Loader2, FileText, Info } from 'lucide-react';

// ════════════════════════════════════════════════════════════
// SCORE RING
// ════════════════════════════════════════════════════════════
export function Ring({ score = 0, size = 80, strokeWidth = 8 }) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(Math.max(score, 0), 100);
  const color = pct >= 70 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      <text x={size/2} y={size/2} dominantBaseline="central" textAnchor="middle"
        style={{ fontSize: size > 60 ? 15 : 11, fontWeight: 800, fill: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}
        transform={`rotate(90,${size/2},${size/2})`}>{pct}</text>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// FIELD INPUT WRAPPER
// ════════════════════════════════════════════════════════════
export function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 10 }}>
      {label && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{label}</p>
          {hint && <span style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.6 }}>{hint}</span>}
        </div>
      )}
      <div style={{
        background: 'var(--bg-primary)', border: '1.5px solid var(--border)',
        borderRadius: 9, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.06)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {children}
      </div>
    </div>
  );
}

export const inp = {
  display: 'block', width: '100%', padding: '9px 12px',
  background: 'transparent', border: 'none', outline: 'none',
  fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit',
  boxSizing: 'border-box', lineHeight: 1.5,
};

// ════════════════════════════════════════════════════════════
// AI ENHANCE BUTTON — reusable
// ════════════════════════════════════════════════════════════
function AiBtn({ loading, isPro, onClick, isAr }) {
  return (
    <button
      onClick={onClick}
      disabled={loading || !isPro}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 6,
        border: '1px solid var(--border)',
        background: isPro ? 'var(--text-primary)' : 'var(--bg-secondary)',
        color: isPro ? 'var(--bg-primary)' : 'var(--text-secondary)',
        fontSize: 11, fontWeight: 600, cursor: isPro ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit', opacity: loading ? 0.7 : 1, flexShrink: 0,
      }}
    >
      {loading
        ? <Loader2 size={11} style={{ animation: 'spin 0.8s linear infinite' }} />
        : <Sparkles size={11} />}
      {isAr ? 'تحسين AI' : 'AI Enhance'}
      {!isPro && (
        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'var(--border)', color: 'var(--text-secondary)' }}>
          PRO
        </span>
      )}
    </button>
  );
}

// ════════════════════════════════════════════════════════════
// TEMPLATE SELECTOR
// ════════════════════════════════════════════════════════════
export function TemplateSelector({ selected, onSelect, isAr, templates }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
      {Object.values(templates).map(t => {
        const active = selected === t.id;
        return (
          <button key={t.id} onClick={() => onSelect(t.id)} style={{
            padding: '14px 10px', borderRadius: 12, cursor: 'pointer',
            border: `2px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
            background: active ? 'var(--text-primary)' : 'var(--bg-secondary)',
            transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
            textAlign: 'center', position: 'relative', overflow: 'hidden',
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; } }}
          >
            {active && (
              <div style={{ position: 'absolute', top: 6, insetInlineEnd: 6, width: 16, height: 16, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={11} color="var(--bg-primary)" />
              </div>
            )}
            <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
            <p style={{ fontSize: 11, fontWeight: 700, color: active ? 'var(--bg-primary)' : 'var(--text-primary)', margin: '0 0 2px' }}>
              {isAr ? t.nameAr : t.nameEn}
            </p>
            <p style={{ fontSize: 9.5, color: active ? 'rgba(255,255,255,0.55)' : 'var(--text-secondary)', margin: 0 }}>
              ATS {t.ats}%
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// ATS ANALYSIS PANEL
// ════════════════════════════════════════════════════════════
const SCORE_LABELS = {
  formatting: { ar: 'التنسيق',          en: 'Formatting' },
  keywords:   { ar: 'الكلمات المفتاحية', en: 'Keywords'   },
  experience: { ar: 'الخبرة',           en: 'Experience' },
  education:  { ar: 'التعليم',          en: 'Education'  },
  skills:     { ar: 'المهارات',         en: 'Skills'     },
  clarity:    { ar: 'الوضوح',           en: 'Clarity'    },
};

const PRIO_COLOR = { high: '#EF4444', medium: '#F59E0B', low: '#22C55E' };

export function ATSPanel({ analysis, isAr, isPro, onUpgrade }) {
    console.log('Analysis data received:', analysis);

  if (!analysis) return (
    <div style={{ textAlign: 'center', padding: '32px 16px' }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <FileText size={22} color="var(--text-secondary)" strokeWidth={1.5} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
        {isAr ? 'لا يوجد تحليل بعد' : 'No analysis yet'}
      </p>
      <p style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
        {isAr ? 'ارفع سيرتك أو احفظ لتظهر النتائج' : 'Upload or save your CV to see results'}
      </p>
    </div>
  );

  const score = analysis.overallScore || analysis.atsScore || 0;
  
  const scoreColor = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444';
  const verdict = score >= 80
    ? { ar: 'جاهز للتقديم ✓', en: 'Ready to Apply ✓' }
    : score >= 50
    ? { ar: 'يحتاج تحسين',   en: 'Needs Work'      }
    : { ar: 'يحتاج مراجعة',  en: 'Poor'            };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* Score block */}
      <div style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
        <Ring score={score} size={68} strokeWidth={7} />
        <div>
          <p style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-primary)', margin: '0 0 2px', fontFamily: 'var(--font-en)' }}>
            {score}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>/100</span>
          </p>
          <p style={{ fontSize: 11, color: scoreColor, fontWeight: 700, margin: 0 }}>
            {isAr ? verdict.ar : verdict.en}
          </p>
        </div>
      </div>

      {/* Score bars */}
      {analysis.scores && (
        <div style={{ marginBottom: 14 }}>
          {Object.entries(analysis.scores).map(([k, v]) => {
            const c = v >= 70 ? '#22C55E' : v >= 50 ? '#F59E0B' : '#EF4444';
            return (
              <div key={k} style={{ marginBottom: 7 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {isAr ? SCORE_LABELS[k]?.ar : SCORE_LABELS[k]?.en}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c, fontFamily: 'var(--font-en)' }}>{v}%</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v}%`, background: c, borderRadius: 99, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strengths */}
      {/* {analysis.strengths?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
            {isAr ? 'نقاط القوة' : 'Strengths'}
          </p>
          {analysis.strengths.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 5 }}>
              <CheckCircle2 size={12} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{s}</span>
            </div>
          ))}
        </div>
      )} */}

      {/* Missing keywords */}
      {analysis.missingKeywords?.length > 0 && (
        <div style={{ marginBottom: 12, padding: '10px 12px', background: 'rgba(245,158,11,0.05)', borderRadius: 10, border: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {isAr ? 'كلمات مفتاحية ناقصة' : 'Missing Keywords'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {analysis.missingKeywords.slice(0, 8).map((k, i) => (
              <span key={i} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 99, background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Improvements */}
      {/* {analysis.improvements?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 7 }}>
            {isAr ? 'توصيات التحسين' : 'Improvements'}
          </p>
          {analysis.improvements.slice(0, 5).map((imp, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', marginBottom: 6, borderInlineStart: `3px solid ${PRIO_COLOR[imp.priority] || '#ccc'}` }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px' }}>{imp.issue}</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>💡 {imp.fix}</p>
            </div>
          ))}
        </div>
      )} */}

      {/* ── tip box REMOVED (DeepSeek Pro upsell) ── */}

    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CV EDITOR
// ════════════════════════════════════════════════════════════
export function CVEditor({ data, onChange, isAr, isPro, onAiEnhance, aiLoading }) {
  // generic setter helpers
  const s      = (k, v) => onChange({ ...data, [k]: v });
  const setExp = (i, k, v) => { const a = [...(data.experiences || [])]; a[i] = { ...a[i], [k]: v }; onChange({ ...data, experiences: a }); };
  const addExp = ()        => onChange({ ...data, experiences: [...(data.experiences || []), { title: '', company: '', startDate: '', endDate: '', current: false, description: '' }] });
  const rmExp  = i         => onChange({ ...data, experiences: (data.experiences || []).filter((_, idx) => idx !== i) });
  const setEdu = (i, k, v) => { const a = [...(data.education || [])]; a[i] = { ...a[i], [k]: v }; onChange({ ...data, education: a }); };
  const addEdu = ()        => onChange({ ...data, education: [...(data.education || []), { institution: '', degree: '', field: '', year: '' }] });
  const rmEdu  = i         => onChange({ ...data, education: (data.education || []).filter((_, idx) => idx !== i) });

  // ── AI enhance dispatcher ────────────────────────────────
  // Calls the parent handler with extra context so it knows what to enhance
  const enhance = (section, extra = {}) => onAiEnhance({ section, ...extra });

  const SectionTitle = ({ children }) => (
    <p style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      {children}
      <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </p>
  );

  // shared box style for AI-enhanced textareas
  const aiBox = {
    background: 'var(--bg-primary)', border: '1.5px solid var(--border)',
    borderRadius: 9, overflow: 'hidden', marginBottom: 10,
    transition: 'border-color 0.2s',
  };

  return (
    <div>

      {/* ── Personal Info ── */}
      <SectionTitle>{isAr ? 'المعلومات الشخصية' : 'Personal Info'}</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 4 }}>
        <Field label={isAr ? 'الاسم الكامل *' : 'Full Name *'}>
          <input style={inp} value={data.fullName || ''} onChange={e => s('fullName', e.target.value)} placeholder={isAr ? 'محمد العمري' : 'John Doe'} />
        </Field>
        <Field label={isAr ? 'المسمى الوظيفي' : 'Headline'}>
          <input style={inp} value={data.headline || ''} onChange={e => s('headline', e.target.value)} placeholder={isAr ? 'مطور برمجيات' : 'Software Developer'} />
        </Field>
        <Field label={isAr ? 'البريد الإلكتروني' : 'Email'}>
          <input style={inp} type="email" value={data.email || ''} onChange={e => s('email', e.target.value)} placeholder="name@email.com" dir="ltr" />
        </Field>
        <Field label={isAr ? 'الهاتف' : 'Phone'}>
          <input style={inp} value={data.phone || ''} onChange={e => s('phone', e.target.value)} placeholder="+962 7x xxx xxxx" dir="ltr" />
        </Field>
        <Field label={isAr ? 'الموقع' : 'Location'}>
          <input style={inp} value={data.location || ''} onChange={e => s('location', e.target.value)} placeholder={isAr ? 'عمّان، الأردن' : 'Amman, Jordan'} />
        </Field>
        <Field label="LinkedIn">
          <input style={inp} value={data.linkedin || ''} onChange={e => s('linkedin', e.target.value)} placeholder="linkedin.com/in/username" dir="ltr" />
        </Field>
      </div>

      {/* ── Professional Summary ── */}
      <SectionTitle>{isAr ? 'الملخص المهني' : 'Professional Summary'}</SectionTitle>
      <div style={aiBox}
        onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px 2px' }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
            {isAr ? 'اكتب ملخصاً أو استخدم تحسين AI' : 'Write or use AI Enhance'}
          </span>
          <AiBtn
            loading={aiLoading?.section === 'summary'}
            isPro={isPro}
            isAr={isAr}
            onClick={() => enhance('summary', { targetRole: data.headline, userData: { headline: data.headline, experiences: data.experiences, skills: data.skills } })}
          />
        </div>
        <textarea
          rows={3}
          style={{ ...inp, resize: 'vertical', paddingTop: 4 }}
          value={data.summary || ''}
          onChange={e => s('summary', e.target.value)}
          placeholder={isAr
            ? 'مطور واجهات أمامية بخبرة 5 سنوات في بناء تطبيقات الويب...'
            : 'Frontend developer with 5 years building scalable web applications...'}
        />
      </div>

      {/* ── Work Experience ── */}
      <SectionTitle>{isAr ? 'الخبرات العملية' : 'Work Experience'}</SectionTitle>
      <div style={{ marginBottom: 4 }}>
        {(data.experiences || []).map((exp, i) => (
          <div key={i} style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isAr ? `الخبرة ${i + 1}` : `Experience ${i + 1}`}
              </span>
              <button onClick={() => rmExp(i)} style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={11} color="#EF4444" />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <Field label={isAr ? 'المسمى الوظيفي' : 'Job Title'}>
                <input style={inp} value={exp.title || ''} onChange={e => setExp(i, 'title', e.target.value)} placeholder={isAr ? 'مطور برمجيات' : 'Developer'} />
              </Field>
              <Field label={isAr ? 'الشركة' : 'Company'}>
                <input style={inp} value={exp.company || ''} onChange={e => setExp(i, 'company', e.target.value)} placeholder="Company Name" />
              </Field>
              <Field label={isAr ? 'تاريخ البداية' : 'Start Date'}>
                <input style={inp} type="month" value={exp.startDate || ''} onChange={e => setExp(i, 'startDate', e.target.value)} />
              </Field>
              <Field label={isAr ? 'تاريخ النهاية' : 'End Date'}>
                <input style={{ ...inp, opacity: exp.current ? 0.4 : 1 }} type="month" value={exp.endDate || ''} disabled={exp.current} onChange={e => setExp(i, 'endDate', e.target.value)} />
              </Field>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 8 }}>
              <input type="checkbox" checked={exp.current || false} onChange={e => setExp(i, 'current', e.target.checked)} style={{ accentColor: 'var(--text-primary)' }} />
              {isAr ? 'حتى الآن (وظيفتي الحالية)' : 'Present (current job)'}
            </label>

            {/* Description with AI Enhance */}
            <div style={aiBox}
              onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
              onBlurCapture={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px 2px' }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                  {isAr ? 'المهام والإنجازات' : 'Responsibilities & Achievements'}
                </span>
                <AiBtn
                  loading={aiLoading?.section === 'experience' && aiLoading?.index === i}
                  isPro={isPro}
                  isAr={isAr}
                  onClick={() => enhance('experience', {
                    index: i,
                    targetRole: data.headline,
                    userData: { title: exp.title, company: exp.company, description: exp.description, skills: data.skills },
                  })}
                />
              </div>
              <textarea
                rows={3}
                style={{ ...inp, resize: 'vertical', paddingTop: 4 }}
                value={exp.description || ''}
                onChange={e => setExp(i, 'description', e.target.value)}
                placeholder={isAr
                  ? '• طورت نظام دفع إلكتروني وفّر 40% من وقت المعالجة\n• قدت فريقاً من 5 مطورين لإنجاز المشروع قبل الموعد المحدد'
                  : '• Developed payment system saving 40% processing time\n• Led team of 5 developers to deliver project ahead of schedule'}
              />
            </div>
          </div>
        ))}

        <button onClick={addExp} style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'border-color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <Plus size={13} /> {isAr ? 'إضافة خبرة' : 'Add Experience'}
        </button>
      </div>

      {/* ── Education ── */}
      <SectionTitle>{isAr ? 'التعليم' : 'Education'}</SectionTitle>
      <div style={{ marginBottom: 4 }}>
        {(data.education || []).map((edu, i) => (
          <div key={i} style={{ background: 'var(--bg-primary)', border: '1.5px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {isAr ? `التعليم ${i + 1}` : `Education ${i + 1}`}
              </span>
              {(data.education || []).length > 1 && (
                <button onClick={() => rmEdu(i)} style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={11} color="#EF4444" />
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <Field label={isAr ? 'المؤسسة التعليمية' : 'Institution'}>
                <input style={inp} value={edu.institution || ''} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder={isAr ? 'جامعة الأردن' : 'University of...'} />
              </Field>
              <Field label={isAr ? 'الدرجة العلمية' : 'Degree'}>
                <input style={inp} value={edu.degree || ''} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder={isAr ? 'بكالوريوس' : 'Bachelor'} />
              </Field>
              <Field label={isAr ? 'التخصص' : 'Field of Study'}>
                <input style={inp} value={edu.field || ''} onChange={e => setEdu(i, 'field', e.target.value)} placeholder={isAr ? 'علوم الحاسوب' : 'Computer Science'} />
              </Field>
              <Field label={isAr ? 'سنة التخرج' : 'Graduation Year'}>
                <input style={inp} value={edu.year || ''} onChange={e => setEdu(i, 'year', e.target.value)} placeholder="2022" dir="ltr" />
              </Field>
            </div>
          </div>
        ))}
        <button onClick={addEdu} style={{ width: '100%', padding: '9px', borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12.5, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'border-color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <Plus size={13} /> {isAr ? 'إضافة تعليم' : 'Add Education'}
        </button>
      </div>

      {/* ── Skills & Certifications ── */}
      <SectionTitle>{isAr ? 'المهارات والشهادات' : 'Skills & Certifications'}</SectionTitle>

      {/* Skills — with AI Enhance */}
      <div style={aiBox}
        onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 12px 2px' }}>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
            {isAr ? 'المهارات (مفصولة بفاصلة)' : 'Skills (comma separated)'}
          </span>
          <AiBtn
            loading={aiLoading?.section === 'skills'}
            isPro={isPro}
            isAr={isAr}
            onClick={() => enhance('skills', {
              targetRole: data.headline,
              userData: { headline: data.headline, experiences: data.experiences, skills: data.skills },
            })}
          />
        </div>
        <input
          style={{ ...inp, paddingTop: 6 }}
          value={data.skills || ''}
          onChange={e => s('skills', e.target.value)}
          placeholder={isAr ? 'React، Node.js، PostgreSQL، Docker...' : 'React, Node.js, PostgreSQL, Docker...'}
        />
      </div>

      <Field label={isAr ? 'اللغات' : 'Languages'}>
        <input style={inp} value={data.languages || ''} onChange={e => s('languages', e.target.value)} placeholder={isAr ? 'العربية (أصلية) · الإنجليزية (متقدم)' : 'Arabic (Native) · English (Advanced)'} />
      </Field>

      <Field label={isAr ? 'الشهادات والدورات' : 'Certifications & Courses'} hint={isAr ? 'سطر لكل شهادة' : 'One per line'}>
        <textarea rows={3} style={{ ...inp, resize: 'vertical' }} value={data.certifications || ''} onChange={e => s('certifications', e.target.value)}
          placeholder={isAr
            ? 'AWS Solutions Architect 2024\nPMP Certified\nReact Advanced Course — Udemy'
            : 'AWS Solutions Architect 2024\nPMP Certified\nReact Advanced Course — Udemy'} />
      </Field>

      <div style={{ height: 16 }} />
    </div>
  );
}