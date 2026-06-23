'use strict';
import { useState, useRef } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { C } from '../components/AdminTokens';

export default function BulkUploadJobsModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [file, setFile]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const reset = () => { setFile(null); setResult(null); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const pickFile = (f) => {
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError(isAr ? 'يرجى اختيار ملف CSV فقط' : 'Please select a CSV file only');
      return;
    }
    setError('');
    setResult(null);
    setFile(f);
  };

  const downloadTemplate = async () => {
    try {
      const res = await api.get('/admin/jobs/bulk-csv/template', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'jobs-bulk-upload-template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError(isAr ? 'فشل تحميل القالب' : 'Failed to download template');
    }
  };

  const submit = async () => {
    if (!file) { setError(isAr ? 'يرجى اختيار ملف CSV' : 'Please select a CSV file'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/jobs/bulk-csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      setResult(data.data);
      if (data.data?.created > 0) onSuccess?.();
    } catch (e) {
      setError(e.response?.data?.message || (isAr ? 'فشل الرفع' : 'Upload failed'));
    }
    setLoading(false);
  };

  return (
    <AdminModal
      open={open}
      onClose={handleClose}
      title={isAr ? 'رفع وظائف متعددة (CSV)' : 'Bulk Upload Jobs (CSV)'}
      width={640}
      footer={
        <>
          <Btn variant="ghost" onClick={handleClose}>{isAr ? 'إغلاق' : 'Close'}</Btn>
          {!result && (
            <Btn variant="primary" onClick={submit} loading={loading} disabled={!file}>
              <Icon name="upload" size={13} /> {isAr ? 'رفع ومعالجة' : 'Upload & Process'}
            </Btn>
          )}
        </>
      }
    >
      {/* Template download */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 10,
        border: '1px solid var(--border)', marginBottom: 16, gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 2px', color: 'var(--text-primary)' }}>
            {isAr ? 'حمّلي القالب أولاً' : 'Download the template first'}
          </p>
          <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>
            {isAr ? 'يحتوي على كل الأعمدة المطلوبة مع مثال جاهز' : 'Contains all required columns with a ready example'}
          </p>
        </div>
        <Btn variant="secondary" size="sm" onClick={downloadTemplate}>
          <Icon name="download" size={12} /> {isAr ? 'تحميل القالب' : 'Download Template'}
        </Btn>
      </div>

      {/* Required columns info */}
      <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'rgb(99,102,241)', margin: '0 0 6px' }}>
          {isAr ? 'الأعمدة المطلوبة' : 'Required columns'}
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
          <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>title</code>,{' '}
          <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>description</code>,{' '}
          <code style={{ background: 'var(--bg-secondary)', padding: '1px 5px', borderRadius: 4 }}>companyName</code>
          {' — '}
          {isAr
            ? 'يجب أن يطابق اسم الشركة شركة موجودة فعلياً بالنظام. الأعمدة الأخرى اختيارية. للقيم المتعددة (المتطلبات، المهارات) افصلي بـ |'
            : 'companyName must match an existing company exactly. Other columns are optional. For multi-value fields (requirements, skills) separate with |'}
        </p>
      </div>

      {/* Dropzone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files[0]); }}
        style={{
          padding: '28px 16px', borderRadius: 12, textAlign: 'center', cursor: 'pointer',
          border: `2px dashed ${dragOver ? 'rgb(99,102,241)' : 'var(--border)'}`,
          background: dragOver ? 'rgba(99,102,241,0.04)' : 'var(--bg-primary)',
          transition: 'all 0.15s', marginBottom: 14,
        }}
      >
        <input ref={inputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }}
          onChange={e => pickFile(e.target.files[0])} />
        <Icon name="upload" size={26} style={{ opacity: 0.4, marginBottom: 8 }} />
        {file ? (
          <>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>{file.name}</p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>{(file.size / 1024).toFixed(1)} KB — {isAr ? 'اضغطي للتغيير' : 'click to change'}</p>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 2px' }}>
              {isAr ? 'اسحبي ملف CSV هنا أو اضغطي للاختيار' : 'Drag a CSV file here or click to browse'}
            </p>
            <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>{isAr ? 'حد أقصى 5MB' : 'Max 5MB'}</p>
          </>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: 'var(--danger)', marginBottom: 14 }}>
          ⚠ {error}
        </div>
      )}

      {/* Result report */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: isAr ? 'الإجمالي' : 'Total',   value: result.total,   color: 'var(--text-primary)' },
              { label: isAr ? 'تم الإنشاء' : 'Created', value: result.created, color: '#22C55E' },
              { label: isAr ? 'تم التخطي' : 'Skipped',  value: result.skipped, color: result.skipped > 0 ? '#F59E0B' : 'var(--text-secondary)' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {result.errors?.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '8px 14px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase' }}>
                  {isAr ? 'تفاصيل الأخطاء' : 'Error details'}
                </p>
              </div>
              <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                {result.errors.map((e, i) => (
                  <div key={i} style={{ padding: '8px 14px', borderBottom: i < result.errors.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 12 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{isAr ? `سطر ${e.row}` : `Row ${e.row}`}</span>
                    <span style={{ color: 'var(--text-secondary)', marginInlineStart: 8 }}>{e.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.created > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8 }}>
              <Icon name="check" size={14} style={{ color: '#22C55E' }} />
              <span style={{ fontSize: 12.5, color: '#22C55E', fontWeight: 600 }}>
                {isAr ? `تم إنشاء ${result.created} وظيفة بنجاح` : `${result.created} jobs created successfully`}
              </span>
            </div>
          )}

          <Btn variant="secondary" size="sm" onClick={reset}>
            {isAr ? 'رفع ملف آخر' : 'Upload another file'}
          </Btn>
        </div>
      )}
    </AdminModal>
  );
}