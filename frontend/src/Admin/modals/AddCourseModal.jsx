'use strict';
import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

/* ── inputs ─────────────────────────────────────────────── */
const Input = ({ value, onChange, type = 'text', placeholder, disabled }) => (
  <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} disabled={disabled}
    style={{ ...C.input, ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
    onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
);
const Select = ({ value, onChange, children }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)} style={C.select}>{children}</select>
);
const Textarea = ({ value, onChange, placeholder, rows = 3 }) => (
  <textarea value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} rows={rows} style={C.textarea}
    onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
    onBlur={e => e.target.style.borderColor = 'var(--border)'} />
);
const Row = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 12 }}>{children}</div>
);

/* ── PDF drop zone ───────────────────────────────────────── */
function PdfDropZone({ file, onFile, isAr }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  const validate = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') {
      alert(isAr ? 'يُسمح بملفات PDF فقط' : 'PDF files only');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      alert(isAr ? 'الحد الأقصى 50 MB' : 'Max 50 MB');
      return;
    }
    onFile(f);
  };

  const fmt = b => b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

  if (file) return (
    <div style={{ border: '1.5px solid #22C55E', borderRadius: 10, padding: '13px 16px', background: 'rgba(34,197,94,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>{file.name}</p>
        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'var(--text-secondary)' }}>{fmt(file.size)}</p>
      </div>
      <button onClick={() => onFile(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
    </div>
  );

  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); validate(e.dataTransfer.files[0]); }}
      style={{
        border: `2px dashed ${drag ? 'var(--text-primary)' : 'var(--border)'}`,
        borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
        background: drag ? 'var(--bg-secondary)' : 'transparent', transition: 'all .2s',
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
      onMouseLeave={e => !drag && (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <input ref={ref} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }}
        onChange={e => validate(e.target.files[0])} />
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.35 }}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/>
      </svg>
      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
        {isAr ? 'اسحب الـ PDF هنا أو اضغط للاختيار' : 'Drop PDF here or click to browse'}
      </p>
      <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>
        {isAr ? 'PDF فقط · حد أقصى 50 MB' : 'PDF only · Max 50 MB'}
      </p>
    </div>
  );
}

/* ── upload progress ─────────────────────────────────────── */
function Progress({ pct }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>جاري الرفع...</span>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 5, borderRadius: 99, background: 'var(--bg-secondary)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--text-primary)', borderRadius: 99, transition: 'width .2s' }} />
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN — AddCourseModal
══════════════════════════════════════════════════════════ */
export default function AddCourseModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';

  const EMPTY = {
    title: '', titleAr: '', description: '', descriptionAr: '',
    categoryId: '', price: 0, isFree: false, isFreeDownload: false,
    level: 'beginner', language: 'ar', status: 'published',
  };

  const [form,       setForm]       = useState(EMPTY);
  const [pdfFile,    setPdfFile]    = useState(null);
  const [categories, setCategories] = useState([]);
  const [uploading,  setUploading]  = useState(false);
  const [pct,        setPct]        = useState(0);
  const [done,       setDone]       = useState(false);
  const [err,        setErr]        = useState('');

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY); setPdfFile(null);
    setUploading(false); setPct(0); setDone(false); setErr('');
    api.get('/admin/categories/courses')
      .then(r => setCategories(r.data?.data?.categories || r.data?.data || []))
      .catch(() => {});
  }, [open]);

  const submit = async () => {
    if (!form.title)       return setErr(isAr ? 'العنوان مطلوب'       : 'Title required');
    if (!form.description) return setErr(isAr ? 'الوصف مطلوب'         : 'Description required');
    if (!pdfFile)          return setErr(isAr ? 'ملف PDF مطلوب'        : 'PDF file required');

    setUploading(true); setErr(''); setPct(0);

    // أرسل كل شيء مرة واحدة — PDF + بيانات في multipart/form-data
    const fd = new FormData();
    fd.append('pdf',            pdfFile);
    fd.append('title',          form.title);
    fd.append('titleAr',        form.titleAr        || '');
    fd.append('description',    form.description);
    fd.append('descriptionAr',  form.descriptionAr  || '');
    fd.append('categoryId',     form.categoryId     || '');
    fd.append('price',          form.isFree ? '0' : String(form.price));
    fd.append('isFree',         String(form.isFree));
    fd.append('isFreeDownload', String(form.isFreeDownload));
    fd.append('level',          form.level);
    fd.append('language',       form.language);
    fd.append('status',         form.status);

    try {
      await api.post('/admin/courses', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setPct(Math.round((e.loaded * 100) / e.total)),
      });
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 700);
    } catch (e) {
      setErr(e.response?.data?.message || (isAr ? 'فشل الرفع' : 'Upload failed'));
    }
    setUploading(false);
  };

  return (
    <AdminModal
      open={open} onClose={onClose} width={560}
      title={isAr ? 'إضافة كورس / كتاب PDF' : 'Add Course / PDF Book'}
      footer={
        <>
          <Btn variant="ghost" onClick={onClose} disabled={uploading}>
            {isAr ? 'إلغاء' : 'Cancel'}
          </Btn>
          <Btn variant="primary" onClick={submit} loading={uploading} disabled={done}>
            {done
              ? (isAr ? '✓ تم' : '✓ Done')
              : (isAr ? 'رفع ونشر' : 'Upload & Save')}
          </Btn>
        </>
      }
    >
      {err && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 14 }}>
          ⚠ {err}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── PDF (أول شيء — الأهم) ── */}
        <FormField label={isAr ? 'ملف الـ PDF *' : 'PDF File *'}>
          <PdfDropZone file={pdfFile} onFile={setPdfFile} isAr={isAr} />
        </FormField>

        {/* ── العناوين ── */}
        <Row>
          <FormField label="Title (EN)" required>
            <Input value={form.title} onChange={v => upd('title', v)} placeholder="Course title" />
          </FormField>
          <FormField label="العنوان (AR)">
            <Input value={form.titleAr} onChange={v => upd('titleAr', v)} placeholder="اسم الكورس" />
          </FormField>
        </Row>

        {/* ── الوصف ── */}
        <FormField label={isAr ? 'الوصف (EN)' : 'Description'} required>
          <Textarea value={form.description} onChange={v => upd('description', v)} placeholder="What will students learn?" />
        </FormField>
        <FormField label="الوصف (AR)">
          <Textarea value={form.descriptionAr} onChange={v => upd('descriptionAr', v)} placeholder="ماذا سيتعلم الطلاب؟" />
        </FormField>

        {/* ── الإعدادات ── */}
        <Row cols={3}>
          <FormField label={isAr ? 'الفئة' : 'Category'}>
            <Select value={form.categoryId} onChange={v => upd('categoryId', v)}>
              <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{isAr && c.nameAr ? c.nameAr : c.name}</option>
              ))}
            </Select>
          </FormField>
          <FormField label={isAr ? 'المستوى' : 'Level'}>
            <Select value={form.level} onChange={v => upd('level', v)}>
              <option value="beginner">{isAr ? 'مبتدئ' : 'Beginner'}</option>
              <option value="intermediate">{isAr ? 'متوسط' : 'Intermediate'}</option>
              <option value="advanced">{isAr ? 'متقدم' : 'Advanced'}</option>
            </Select>
          </FormField>
          <FormField label={isAr ? 'اللغة' : 'Language'}>
            <Select value={form.language} onChange={v => upd('language', v)}>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </Select>
          </FormField>
        </Row>

        {/* ── السعر والحالة ── */}
        <Row>
          <FormField label={isAr ? 'السعر ($)' : 'Price ($)'}>
            <Input type="number" value={form.price} onChange={v => upd('price', v)}
              disabled={form.isFree} placeholder="0" />
          </FormField>
          <FormField label={isAr ? 'الحالة' : 'Status'}>
            <Select value={form.status} onChange={v => upd('status', v)}>
              <option value="published">{isAr ? 'منشور' : 'Published'}</option>
              <option value="draft">{isAr ? 'مسودة' : 'Draft'}</option>
            </Select>
          </FormField>
        </Row>

        {/* ── checkboxes ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={form.isFree}
              onChange={e => { upd('isFree', e.target.checked); if (e.target.checked) upd('price', 0); }}
              style={{ accentColor: 'var(--text-primary)', width: 15, height: 15 }} />
            {isAr ? 'كورس مجاني (بدون رسوم)' : 'Free course (no charge)'}
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)' }}>
            <input type="checkbox" checked={form.isFreeDownload}
              onChange={e => upd('isFreeDownload', e.target.checked)}
              style={{ accentColor: 'var(--text-primary)', width: 15, height: 15 }} />
            {isAr ? 'تحميل مفتوح (بدون تسجيل في الكورس)' : 'Open download (no enrollment needed)'}
          </label>
        </div>

        {/* ── progress ── */}
        {uploading && <Progress pct={pct} />}
        {done && (
          <div style={{ textAlign: 'center', color: '#22C55E', fontWeight: 700, fontSize: 14, padding: '4px 0' }}>
            ✓ {isAr ? 'تم الرفع بنجاح!' : 'Uploaded successfully!'}
          </div>
        )}
      </div>
    </AdminModal>
  );
}
