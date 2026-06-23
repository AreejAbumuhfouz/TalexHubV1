'use strict';
import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input  = ({ value, onChange, type='text', placeholder }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={C.input} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Select = ({ value, onChange, children }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
);
const Row = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;

export default function BulkPointsModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ points:'', filterByPlan:'', filterByRole:'', description:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    if (!form.points) { setError(isAr?'يجب تحديد عدد النقاط':'Points required'); return; }
    setLoading(true); setError('');
    try {
      const r = await api.post('/admin/wallets/bulk-points', { points:Number(form.points), filterByPlan:form.filterByPlan||undefined, filterByRole:form.filterByRole||undefined, description:form.description||'Bulk admin points' });
      alert(r.data.message); onSuccess?.(); onClose();
    } catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'إضافة نقاط جماعية':'Bulk Add Points'} width={420}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'إضافة':'Add Points'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <FormField label={isAr?'عدد النقاط':'Points to Add'} required>
        <Input type="number" value={form.points} onChange={v=>upd('points',v)} placeholder="e.g. 100" />
      </FormField>
      <Row>
        <FormField label={isAr?'تصفية بالباقة':'Filter by Plan'} hint={isAr?'اتركه فارغاً للكل':'Empty = all'}>
          <Select value={form.filterByPlan} onChange={v=>upd('filterByPlan',v)}><option value="">{isAr?'الكل':'All Plans'}</option><option value="free">Free</option><option value="pro">Pro</option><option value="elite">Elite</option></Select>
        </FormField>
        <FormField label={isAr?'تصفية بالدور':'Filter by Role'}>
          <Select value={form.filterByRole} onChange={v=>upd('filterByRole',v)}><option value="">{isAr?'الكل':'All Roles'}</option><option value="user">User</option><option value="company">Company</option></Select>
        </FormField>
      </Row>
      <FormField label={isAr?'السبب':'Description'}>
        <Input value={form.description} onChange={v=>upd('description',v)} placeholder={isAr?'سبب الإضافة...':'Reason...'} />
      </FormField>
    </AdminModal>
  );
}