'use strict';
import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input = ({ value, onChange, type='text', placeholder }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={C.input} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Row = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;

export default function WalletModal({ open, onClose, onSuccess, user, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ pointsDelta:'', cashDelta:'', description:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/admin/wallets/adjust', { userId:user.id, pointsDelta:Number(form.pointsDelta)||0, cashDelta:Number(form.cashDelta)||0, description:form.description||'Admin adjustment' });
      onSuccess?.(); onClose();
      setForm({ pointsDelta:'', cashDelta:'', description:'' });
    } catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?`تعديل محفظة: ${user?.fullName}`:`Adjust Wallet: ${user?.fullName}`} width={420}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'تطبيق':'Apply'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <div style={{ background:'var(--bg-secondary)', borderRadius:8, padding:'10px 14px', marginBottom:14, fontSize:12, color:'var(--text-secondary)' }}>
        {isAr?'استخدم قيماً موجبة للإضافة وسالبة للخصم':'Use positive to add, negative to subtract'}
      </div>
      <Row>
        <FormField label={isAr?'النقاط':'Points Delta'} hint="e.g. 100 or -50"><Input type="number" value={form.pointsDelta} onChange={v=>upd('pointsDelta',v)} placeholder="0" /></FormField>
        <FormField label={isAr?'الرصيد ($)':'Cash Delta ($)'} hint="e.g. 10 or -5"><Input type="number" value={form.cashDelta} onChange={v=>upd('cashDelta',v)} placeholder="0" /></FormField>
      </Row>
      <FormField label={isAr?'السبب':'Description'}>
        <Input value={form.description} onChange={v=>upd('description',v)} placeholder={isAr?'سبب التعديل...':'Reason...'} />
      </FormField>
    </AdminModal>
  );
}