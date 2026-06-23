import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useLangStore from '../../i18n';
import { Spinner, Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { C } from '../components/AdminTokens';

/* ── translation strings ─────────────────────────────────── */
const T = {
  en: {
    title: 'Pricing Management', save: 'Save Changes', reset: 'Reset to Defaults',
    confirmReset: 'Reset all pricing to code defaults? This cannot be undone.',
    saved: 'Saved!', resetDone: 'Reset to defaults', saveFail: 'Save failed',
    tiers: 'Pricing Tiers', addTier: 'Add Tier', deleteTier: 'Delete Tier',
    tierId: 'Tier ID', tierLabel: 'Label', currency: 'Currency', symbol: 'Symbol',
    countries: 'Country Codes (comma-separated)', monthly: 'Monthly ($)', yearly: 'Yearly ($)',
    features: 'Plan Features', free: 'Free', pro: 'Pro', elite: 'Elite',
    cvUploads: 'CV Uploads', aiAnalysis: 'AI Analyses/mo', jobApplications: 'Job Applications/mo',
    training: 'Training Sessions', courses: 'Course Access', autoApply: 'Auto-Apply',
    cvBuilder: 'CV Builder', walletBonus: 'Wallet Bonus (pts)', prioritySupport: 'Priority Support',
    unlimited: 'Unlimited (-1)', plans: 'Plan Prices', tierCountries: 'Countries',
    preview: 'Live Preview',
  },
  ar: {
    title: 'إدارة التسعير', save: 'حفظ التغييرات', reset: 'إعادة للافتراضي',
    confirmReset: 'إعادة تعيين التسعير للقيم الافتراضية؟ لا يمكن التراجع.',
    saved: 'تم الحفظ!', resetDone: 'تم الإعادة للافتراضي', saveFail: 'فشل الحفظ',
    tiers: 'مناطق التسعير', addTier: 'إضافة منطقة', deleteTier: 'حذف',
    tierId: 'معرف المنطقة', tierLabel: 'الاسم', currency: 'العملة', symbol: 'الرمز',
    countries: 'رموز الدول (مفصولة بفاصلة)', monthly: 'شهري ($)', yearly: 'سنوي ($)',
    features: 'ميزات الخطط', free: 'مجاني', pro: 'احترافي', elite: 'نخبة',
    cvUploads: 'رفع السيرة', aiAnalysis: 'تحليل AI/شهر', jobApplications: 'طلبات وظائف/شهر',
    training: 'جلسات تدريب', courses: 'الدورات', autoApply: 'تقديم تلقائي',
    cvBuilder: 'منشئ السيرة', walletBonus: 'نقاط المحفظة', prioritySupport: 'دعم أولوية',
    unlimited: 'غير محدود (-1)', plans: 'أسعار الخطط', tierCountries: 'الدول',
    preview: 'معاينة مباشرة',
  },
};

const PLAN_KEYS = ['free', 'pro', 'elite'];
const BOOL_FEATURES  = ['courses', 'autoApply', 'cvBuilder', 'prioritySupport'];
const NUM_FEATURES   = ['cvUploads', 'aiAnalysis', 'jobApplications', 'training', 'walletBonus'];
const PLAN_COLORS    = { free: '#6B7280', pro: '#3B82F6', elite: '#8B5CF6' };

/* ── tiny input ──────────────────────────────────────────── */
function Field({ label, value, onChange, type = 'text', small, disabled, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{label}</label>
      <input
        type={type} value={value ?? ''} onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{ ...C.input, padding: small ? '6px 10px' : '8px 12px', fontSize: small ? 12 : 13, borderRadius: 8, opacity: disabled ? 0.5 : 1 }}
        onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
        onBlur={e  => e.target.style.borderColor = 'var(--border)'}
      />
      {hint && <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{hint}</span>}
    </div>
  );
}

/* ── checkbox row ────────────────────────────────────────── */
function CheckRow({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}>
      <span style={{ fontSize: 12.5, color: 'var(--text-primary)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 38, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: value ? '#22C55E' : 'var(--border)', position: 'relative', transition: 'background .2s', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: 2, left: value ? 20 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

/* ── tier card ───────────────────────────────────────────── */
function TierCard({ tierId, tier, onChange, onDelete, t, canDelete }) {
  const setField = (k, v) => onChange({ ...tier, [k]: v });
  const setPlan  = (plan, k, v) => onChange({ ...tier, plans: { ...tier.plans, [plan]: { ...tier.plans[plan], [k]: v } } });
  const setCountries = (v) => setField('countries', v.split(',').map(s => s.trim().toUpperCase()).filter(Boolean));

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7B72EE' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{tier.label || tierId}</span>
          <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>({tierId})</span>
        </div>
        {canDelete && (
          <button onClick={onDelete} style={{ padding: '4px 10px', borderRadius: 7, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
            {t.deleteTier}
          </button>
        )}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Meta row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10 }}>
          <Field label={t.tierLabel}  value={tier.label}    onChange={v => setField('label', v)} small />
          <Field label={t.currency}   value={tier.currency} onChange={v => setField('currency', v)} small />
          <Field label={t.symbol}     value={tier.symbol}   onChange={v => setField('symbol', v)} small />
        </div>

        {/* Countries */}
        <Field
          label={t.countries}
          value={(tier.countries || []).join(', ')}
          onChange={setCountries}
          hint={tierId === 'global' ? '(default — leave empty)' : undefined}
          small
        />

        {/* Plans pricing table */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{t.plans}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {PLAN_KEYS.map(pk => (
              <div key={pk} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${PLAN_COLORS[pk]}30` }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: PLAN_COLORS[pk], textTransform: 'uppercase', marginBottom: 8 }}>{pk}</div>
                <Field label={t.monthly} type="number" value={tier.plans?.[pk]?.monthly ?? ''} onChange={v => setPlan(pk, 'monthly', parseFloat(v) || 0)} small />
                <div style={{ marginTop: 8 }}>
                  <Field label={t.yearly}  type="number" value={tier.plans?.[pk]?.yearly  ?? ''} onChange={v => setPlan(pk, 'yearly',  parseFloat(v) || 0)} small />
                </div>
                {pk !== 'free' && tier.plans?.[pk]?.monthly > 0 && (
                  <div style={{ marginTop: 6, fontSize: 10, color: '#22C55E', fontWeight: 700 }}>
                    Save {Math.round((1 - tier.plans[pk].yearly / (tier.plans[pk].monthly * 12)) * 100)}% yearly
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── features editor ─────────────────────────────────────── */
function FeaturesEditor({ features, onChange, t }) {
  const set = (plan, k, v) => onChange({ ...features, [plan]: { ...features[plan], [k]: v } });

  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.features}</span>
      </div>
      <div style={{ padding: 16 }}>
        {/* Header row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
          <div />
          {PLAN_KEYS.map(pk => (
            <div key={pk} style={{ fontSize: 11, fontWeight: 800, color: PLAN_COLORS[pk], textAlign: 'center', textTransform: 'uppercase' }}>{t[pk]}</div>
          ))}
        </div>

        {/* Numeric features */}
        {NUM_FEATURES.map(fk => (
          <div key={fk} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>{t[fk]}</div>
            {PLAN_KEYS.map(pk => (
              <input key={pk} type="number" value={features[pk]?.[fk] ?? ''}
                onChange={e => set(pk, fk, parseInt(e.target.value) || 0)}
                placeholder="-1=∞"
                style={{ ...C.input, padding: '5px 8px', fontSize: 12, textAlign: 'center', borderRadius: 7 }}
                onFocus={e => e.target.style.borderColor = PLAN_COLORS[pk]}
                onBlur={e  => e.target.style.borderColor = 'var(--border)'}
              />
            ))}
          </div>
        ))}

        {/* Boolean features */}
        {BOOL_FEATURES.map(fk => (
          <div key={fk} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 8, padding: '6px 0', borderBottom: '0.5px solid var(--border)', alignItems: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t[fk]}</div>
            {PLAN_KEYS.map(pk => (
              <div key={pk} style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => set(pk, fk, !features[pk]?.[fk])} style={{
                  width: 34, height: 18, borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: features[pk]?.[fk] ? PLAN_COLORS[pk] : 'var(--border)', position: 'relative', transition: 'background .15s',
                }}>
                  <div style={{ position: 'absolute', top: 2, left: features[pk]?.[fk] ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── live preview card ───────────────────────────────────── */
function PreviewCard({ tierId, tier, features, isAr }) {
  if (!tier) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10 }}>
        {tier.label} — {(tier.countries || []).join(', ') || 'Default'}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PLAN_KEYS.map(pk => (
          <div key={pk} style={{ flex: '1 1 80px', background: 'var(--bg-primary)', borderRadius: 10, padding: '10px 12px', border: `1px solid ${PLAN_COLORS[pk]}40` }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: PLAN_COLORS[pk], marginBottom: 4, textTransform: 'uppercase' }}>{pk}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: 'var(--text-primary)' }}>
              {tier.symbol || '$'}{tier.plans?.[pk]?.monthly ?? 0}
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 400 }}>/mo</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
              {tier.symbol || '$'}{tier.plans?.[pk]?.yearly ?? 0}/yr
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN TAB
══════════════════════════════════════════════════════════ */
export default function PricingTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const t    = T[isAr ? 'ar' : 'en'];

  const [tiers,    setTiers]    = useState(null);
  const [features, setFeatures] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/pricing');
      setTiers(data.data.tiers);
      setFeatures(data.data.features);
    } catch { toast.error('Failed to load pricing'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/admin/pricing/tiers',    { tiers });
      await api.put('/admin/pricing/features', { features });
      toast.success(t.saved);
    } catch { toast.error(t.saveFail); }
    finally { setSaving(false); }
  };

  const reset = async () => {
    if (!window.confirm(t.confirmReset)) return;
    try {
      await api.post('/admin/pricing/reset');
      toast.success(t.resetDone);
      load();
    } catch { toast.error(t.saveFail); }
  };

  const addTier = () => {
    const id = `tier_${Date.now()}`;
    setTiers(prev => ({
      ...prev,
      [id]: {
        id, label: 'New Tier', currency: 'USD', symbol: '$', countries: [],
        plans: {
          free:  { monthly: 0,    yearly: 0    },
          pro:   { monthly: 9.99, yearly: 99   },
          elite: { monthly: 19.99,yearly: 199  },
        },
      },
    }));
  };

  const deleteTier = (id) => {
    if (Object.keys(tiers).length <= 1) { toast.error('Need at least one tier'); return; }
    setTiers(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={26} /></div>;

  return (
    <div style={{ direction: isAr ? 'rtl' : 'ltr', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Top bar ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{t.title}</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Btn variant="ghost" onClick={reset}>{t.reset}</Btn>
          <Btn variant="ghost" onClick={addTier}>
            <Icon name="plus" size={13} /> {t.addTier}
          </Btn>
          <Btn variant="primary" onClick={save} loading={saving}>{t.save}</Btn>
        </div>
      </div>

      {/* ── Tiers section ──────────────────────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>{t.tiers}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Object.entries(tiers || {}).map(([id, tier]) => (
            <TierCard
              key={id} tierId={id} tier={tier} t={t}
              onChange={updated => setTiers(prev => ({ ...prev, [id]: { ...updated, id } }))}
              onDelete={() => deleteTier(id)}
              canDelete={id !== 'global'}
            />
          ))}
        </div>
      </div>

      {/* ── Features section ───────────────────────────── */}
      {features && (
        <FeaturesEditor features={features} onChange={setFeatures} t={t} />
      )}

      {/* ── Live preview ───────────────────────────────── */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>{t.preview}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.entries(tiers || {}).map(([id, tier]) => (
            <PreviewCard key={id} tierId={id} tier={tier} features={features} isAr={isAr} />
          ))}
        </div>
      </div>

      {/* Sticky save bar */}
      <div style={{ position: 'sticky', bottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="primary" onClick={save} loading={saving} style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
          <Icon name="check" size={13} /> {t.save}
        </Btn>
      </div>
    </div>
  );
}