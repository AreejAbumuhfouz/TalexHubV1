import { useState } from 'react';

export default function ReportDialog({ isAr, font, onClose, onSubmit }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = [
    { key: 'offensive', ar: 'محتوى مسيء', en: 'Offensive content' },
    { key: 'misleading', ar: 'معلومات مضللة', en: 'Misleading info' },
    { key: 'spam', ar: 'إعلان / سبام', en: 'Advertisement / spam' },
    { key: 'privacy', ar: 'انتهاك خصوصية', en: 'Privacy violation' },
    { key: 'inappropriate', ar: 'محتوى غير لائق', en: 'Inappropriate content' },
    { key: 'other', ar: 'أخرى', en: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!reason) return;
    setLoading(true);
    await onSubmit({ reason, description: details });
    setLoading(false);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: 'var(--bg-primary)', borderRadius: 18, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 24px 60px rgba(0,0,0,.3)' }}>
        <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontWeight: 800, fontSize: 16, fontFamily: font, margin: 0 }}>{isAr ? 'الإبلاغ عن الغرفة' : 'Report Room'}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: font, margin: '4px 0 0' }}>{isAr ? 'ما سبب الإبلاغ؟' : 'Why are you reporting this?'}</p>
        </div>
        <div style={{ padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reasons.map(r => (
            <button key={r.key} onClick={() => setReason(r.key)} style={{
              width: '100%', padding: '10px 14px', borderRadius: 10, border: `1.5px solid ${reason === r.key ? '#818CF8' : 'var(--border)'}`,
              background: reason === r.key ? 'rgba(129,140,248,.08)' : 'transparent', cursor: 'pointer',
              color: reason === r.key ? '#818CF8' : 'var(--text-primary)', fontSize: 13, fontFamily: font, textAlign: 'start', transition: 'all .15s',
            }}>{isAr ? r.ar : r.en}</button>
          ))}
          <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder={isAr ? 'تفاصيل إضافية (اختياري)...' : 'Additional details (optional)...'}
            rows={2} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontFamily: font, resize: 'none', outline: 'none', marginTop: 4, boxSizing: 'border-box' }} />
        </div>
        <div style={{ padding: '14px 22px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          <button onClick={handleSubmit} disabled={!reason || loading} style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: reason ? '#EF4444' : 'var(--bg-secondary)', color: reason ? '#fff' : 'var(--text-secondary)', cursor: reason ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, fontFamily: font }}>
            {loading ? '...' : (isAr ? 'إرسال' : 'Send')}
          </button>
        </div>
      </div>
    </div>
  );
}