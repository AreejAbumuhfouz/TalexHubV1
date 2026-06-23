import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, RefreshCw, GripVertical, Info } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import useLangStore from '../../i18n';

/* ── Position presets (x,y) ─────────────────────────────── */
const PRESETS = [
  { x: 0.07, y: 0.20 }, { x: 0.72, y: 0.13 }, { x: 0.80, y: 0.27 },
  { x: 0.82, y: 0.50 }, { x: 0.04, y: 0.82 }, { x: 0.02, y: 0.38 },
  { x: 0.61, y: 0.20 }, { x: 0.17, y: 0.49 }, { x: 0.66, y: 0.33 },
  { x: 0.88, y: 0.58 }, { x: 0.73, y: 0.82 }, { x: 0.36, y: 0.10 },
];

const EMPTY_PILL = () => ({
  text:   '',  
  textAr: '',   
  x: 0.5,
  y: 0.5,
  _id: Math.random().toString(36).slice(2),
});

const INP = {
  padding: '8px 11px', borderRadius: 9, border: '1px solid var(--border)',
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  fontSize: 13, outline: 'none', fontFamily: 'inherit',
  width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s',
};

export default function HeroPillsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';

  const [pills,   setPills]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  /* ── Load ── */
  useEffect(() => {
    api.get('/admin/hero-pills')
      .then(({ data }) => {
        const p = data.data?.pills || [];
        setPills(p.map((item, i) => ({ ...item, _id: item._id || `${i}` })));
      })
      .catch(() => setPills([]))
      .finally(() => setLoading(false));
  }, []);

  /* ── Helpers ── */
  const add = () => {
    if (pills.length >= 12) { toast.error(isAr ? 'الحد الأقصى 12 pill' : 'Max 12 pills'); return; }
    const preset = PRESETS[pills.length % PRESETS.length];
    setPills(p => [...p, { ...EMPTY_PILL(), ...preset }]);
  };

  const remove = (id) => setPills(p => p.filter(x => x._id !== id));

  const update = (id, field, val) =>
    setPills(p => p.map(x => x._id === id ? { ...x, [field]: val } : x));

  const applyPreset = (id, idx) => {
    const preset = PRESETS[idx % PRESETS.length];
    setPills(p => p.map(x => x._id === id ? { ...x, ...preset } : x));
  };

  /* ── Save ── */
  const save = async () => {
    // Validate
    for (const p of pills) {
      if (!p.text.trim())   { toast.error(isAr ? 'كل pill تحتاج نص EN' : 'Every pill needs EN text'); return; }
      if (!p.textAr.trim()) { toast.error(isAr ? 'كل pill تحتاج نص AR' : 'Every pill needs AR text'); return; }
    }
    setSaving(true);
    try {
      // Strip the _id helper field before sending
      const toSend = pills.map(({ _id, ...rest }) => rest);
      await api.post('/admin/hero-pills', { pills: toSend });
      toast.success(isAr ? 'تم الحفظ ✓' : 'Saved ✓');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  /* ── Reset to DB auto ── */
  const resetToAuto = async () => {
    if (!window.confirm(isAr ? 'حذف الـ pills اليدوية والرجوع للتلقائي من الداتابيز؟' : 'Reset to auto-generated pills from DB?')) return;
    try {
      await api.post('/admin/hero-pills', { pills: [] });
      setPills([]);
      toast.success(isAr ? 'تم الإعادة — سيظهر التلقائي' : 'Reset — auto pills will show');
    } catch { toast.error(isAr ? 'فشل' : 'Failed'); }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <RefreshCw size={22} style={{ animation: 'hpSpin .8s linear infinite', color: 'var(--text-secondary)' }} />
      <style>{'@keyframes hpSpin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  return (
    <div style={{ maxWidth: 800 }}>
      <style>{'@keyframes hpSpin{to{transform:rotate(360deg)}}'}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
          {isAr ? 'Pills الصفحة الرئيسية' : 'Hero Pills'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
          {isAr
            ? 'الكلمات الطائرة في خلفية الصفحة الرئيسية — تظهر على سطح المكتب فقط. عند النقر عليها تفتح صفحة الوظائف بالبحث المناسب.'
            : 'Floating pills in the hero background — visible on desktop only. Clicking opens jobs search for that term.'}
        </p>
      </div>

      {/* Info banner */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 12, background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 22 }}>
        <Info size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          {isAr
            ? 'لو تركت القائمة فارغة، ستظهر تلقائياً أكثر عناوين الوظائف تكراراً من الداتابيز.'
            : 'If left empty, top job titles from the database will show automatically.'}
        </p>
      </div>

      {/* Pills list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {pills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)', background: 'var(--bg-primary)', borderRadius: 14, border: '1px dashed var(--border)' }}>
            <p style={{ fontSize: 14, margin: '0 0 12px' }}>{isAr ? 'لا توجد pills يدوية' : 'No manual pills'}</p>
            <p style={{ fontSize: 12.5, margin: 0, opacity: 0.7 }}>{isAr ? 'سيُعرض التلقائي من قاعدة البيانات' : 'Auto pills from database will be shown'}</p>
          </div>
        )}

        {pills.map((pill, idx) => (
          <div key={pill._id} style={{ background: 'var(--bg-primary)', borderRadius: 14, border: '1px solid var(--border)', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <GripVertical size={16} color="var(--text-secondary)" style={{ flexShrink: 0, opacity: 0.4 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 9px', borderRadius: 99, border: '1px solid var(--border)', flexShrink: 0 }}>#{idx + 1}</span>
              <div style={{ flex: 1 }} />
              <button onClick={() => remove(pill._id)}
                style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={13} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              {/* EN text */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🇬🇧 English
                </label>
                <input
                  value={pill.text}
                  onChange={e => update(pill._id, 'text', e.target.value)}
                  placeholder="React Developer"
                  style={INP}
                  onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              {/* AR text */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🇸🇦 عربي
                </label>
                <input
                  value={pill.textAr}
                  onChange={e => update(pill._id, 'textAr', e.target.value)}
                  placeholder="مطور React"
                  style={{ ...INP, textAlign: 'right', direction: 'rtl' }}
                  onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Position */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  X {isAr ? '(أفقي %)' : '(horizontal %)'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={pill.x}
                    onChange={e => update(pill._id, 'x', parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', width: 38, textAlign: 'center', fontFamily: 'var(--font-en)' }}>
                    {Math.round(pill.x * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Y {isAr ? '(عمودي %)' : '(vertical %)'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="range" min="0" max="1" step="0.01"
                    value={pill.y}
                    onChange={e => update(pill._id, 'y', parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--text-primary)' }}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', width: 38, textAlign: 'center', fontFamily: 'var(--font-en)' }}>
                    {Math.round(pill.y * 100)}%
                  </span>
                </div>
              </div>
              {/* Quick preset button */}
              <button
                onClick={() => applyPreset(pill._id, idx)}
                title={isAr ? 'تطبيق الموقع الافتراضي' : 'Apply default position'}
                style={{ padding: '7px 12px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                {isAr ? 'افتراضي' : 'Default pos'}
              </button>
            </div>

            {/* Mini preview */}
            <div style={{ marginTop: 10, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {isAr ? 'معاينة:' : 'Preview:'}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 99, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>
                  {pill.text || '—'}
                </span>
                <span style={{ fontSize: 11.5, padding: '3px 10px', borderRadius: 99, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', direction: 'rtl' }}>
                  {pill.textAr || '—'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={add} disabled={pills.length >= 12}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: pills.length >= 12 ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: pills.length >= 12 ? 0.5 : 1, transition: 'border-color 0.2s' }}
          onMouseEnter={e => { if (pills.length < 12) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          <Plus size={14} /> {isAr ? 'إضافة pill' : 'Add pill'}
          <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginInlineStart: 4 }}>({pills.length}/12)</span>
        </button>

        <div style={{ flex: 1 }} />

        <button onClick={resetToAuto}
          style={{ padding: '9px 16px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {isAr ? 'إعادة للتلقائي' : 'Reset to auto'}
        </button>

        <button onClick={save} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 24px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
          {saving
            ? <><RefreshCw size={14} style={{ animation: 'hpSpin .8s linear infinite' }} /> {isAr ? 'جاري...' : 'Saving...'}</>
            : <><Save size={14} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>}
        </button>
      </div>
    </div>
  );
}
