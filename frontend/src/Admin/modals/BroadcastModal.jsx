'use strict';
import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { C } from '../components/AdminTokens';

const Input    = ({ value, onChange, placeholder }) => (
  <input value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={C.input} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Select   = ({ value, onChange, children }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
);
const Textarea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={C.textarea} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Row = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;

export default function BroadcastModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ title:'', titleAr:'', body:'', bodyAr:'', filterByPlan:'', filterByRole:'', targetUserId:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(null);
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    if (!form.title||!form.body) { setError(isAr?'العنوان والمحتوى مطلوبان':'Title and body required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/admin/notifications/broadcast', form);
      setSent(r.data.data.sent);
      setTimeout(() => { setSent(null); onSuccess?.(); onClose(); }, 2000);
    } catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'إرسال إشعار':'Broadcast Notification'} width={520}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}><Icon name="send" size={13}/>{isAr?'إرسال':'Send'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      {sent !== null && <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#16a34a', marginBottom:14 }}>✅ {isAr?`تم الإرسال لـ ${sent} مستخدم`:`Sent to ${sent} users`}</div>}
      <Row>
        <FormField label="Title (EN)" required><Input value={form.title} onChange={v=>upd('title',v)} placeholder="New feature!" /></FormField>
        <FormField label="Title (AR)"><Input value={form.titleAr} onChange={v=>upd('titleAr',v)} placeholder="ميزة جديدة!" /></FormField>
      </Row>
      <Row>
        <FormField label="Body (EN)" required><Textarea value={form.body} onChange={v=>upd('body',v)} placeholder="We just launched..." /></FormField>
        <FormField label="Body (AR)"><Textarea value={form.bodyAr} onChange={v=>upd('bodyAr',v)} placeholder="أطلقنا للتو..." /></FormField>
      </Row>
      <div style={{ padding:'12px 14px', background:'var(--bg-secondary)', borderRadius:8, marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>{isAr?'تصفية المستلمين (اختياري)':'Filter Recipients (optional)'}</div>
        <Row>
          <FormField label="By Plan"><Select value={form.filterByPlan} onChange={v=>upd('filterByPlan',v)}><option value="">{isAr?'الكل':'All Plans'}</option><option value="free">Free</option><option value="pro">Pro</option><option value="elite">Elite</option></Select></FormField>
          <FormField label="By Role"><Select value={form.filterByRole} onChange={v=>upd('filterByRole',v)}><option value="">{isAr?'الكل':'All Roles'}</option><option value="user">Users</option><option value="company">Companies</option></Select></FormField>
        </Row>
        <FormField label="Single User ID" hint={isAr?'للإرسال لشخص واحد فقط':'Send to one specific user'}>
          <Input value={form.targetUserId} onChange={v=>upd('targetUserId',v)} placeholder="user UUID..." />
        </FormField>
      </div>
    </AdminModal>
  );
}