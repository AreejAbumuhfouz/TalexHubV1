import { useState } from 'react';
import { X, Layers, Timer, Users } from 'lucide-react';
import useAuthStore from '../../../store/authStore.js';
import api from '../../../services/api.js';
import toast from 'react-hot-toast';
import { DEFAULT_PLANS, getErr } from './utils';

export default function CreateRoomModal({ isAr, font, plans, onClose, onCreate }) {
  const { user } = useAuthStore();
  const planKey = user?.planKey || 'free';
  const cfg = plans[planKey] || DEFAULT_PLANS[planKey];
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const inp = { width: '100%', padding: '10px 14px', borderRadius: 11, border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13.5, outline: 'none', fontFamily: 'var(--font-en)', boxSizing: 'border-box', transition: 'border-color .15s' };

  const submit = async () => {
    if (!name.trim()) { toast.error(isAr ? 'اسم الغرفة مطلوب' : 'Room name required'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/chat/rooms', { name: name.trim(), nameAr: nameAr.trim(), description: desc.trim(), roomType: 'mixed' });
      onCreate(data.data); onClose(); toast.success(isAr ? '✅ تم إنشاء الغرفة' : '✅ Room created');
    } catch (err) { toast.error(getErr(err, isAr)); }
    finally { setLoading(false); }
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-primary)', borderRadius: 20, overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 32px 80px rgba(0,0,0,.35)' }}>
        <div style={{ padding: '18px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontWeight: 800, fontSize: 16, fontFamily: font, margin: '0 0 5px' }}>{isAr ? 'غرفة جديدة' : 'New Room'}</p>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text-secondary)', fontFamily: font }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Layers size={10} /> {cfg.stages} {isAr ? 'منصة' : 'stages'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Timer size={10} /> {cfg.durationMinutes}{isAr ? 'د' : 'm'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Users size={10} /> {cfg.capacity}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
        </div>
        <div style={{ padding: '16px 22px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: isAr ? 'الاسم (إنجليزي) *' : 'Name (English) *', val: name, set: setName, ph: 'e.g. Career Café', dir: 'ltr' },
            { label: isAr ? 'الاسم (عربي)' : 'Name (Arabic)', val: nameAr, set: setNameAr, ph: 'مثال: نقاش المسار', dir: 'rtl' },
          ].map((f, i) => (
            <div key={i}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, fontFamily: font }}>{f.label}</label>
              <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} dir={f.dir} style={inp}
                onFocus={e => { e.target.style.borderColor = '#818CF8'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
            </div>
          ))}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, fontFamily: font }}>{isAr ? 'وصف (اختياري)' : 'Description (optional)'}</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ ...inp, resize: 'none', fontFamily: font }}
              onFocus={e => { e.target.style.borderColor = '#818CF8'; }} onBlur={e => { e.target.style.borderColor = 'var(--border)'; }} />
          </div>
          <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: 11, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 13, fontFamily: font }}>{isAr ? 'إلغاء' : 'Cancel'}</button>
            <button onClick={submit} disabled={loading || !name.trim()} style={{ padding: '9px 24px', borderRadius: 11, border: 'none', background: name.trim() ? '#818CF8' : 'var(--bg-secondary)', color: name.trim() ? '#fff' : 'var(--text-secondary)', cursor: name.trim() ? 'pointer' : 'default', fontSize: 13, fontWeight: 700, fontFamily: font }}>
              {loading ? '...' : (isAr ? 'إنشاء' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}