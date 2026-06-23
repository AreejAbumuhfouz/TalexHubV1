'use strict';
import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Select = ({ value, onChange, children }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
);
const Row = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;

export default function BulkPlanModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ planKey:'pro', filterByPlan:'', filterByRole:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    setLoading(true); setError('');
    try { const r = await api.patch('/admin/plans/bulk', form); alert(r.data.message); onSuccess?.(); onClose(); }
    catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'تحديث الباقات جماعياً':'Bulk Update Plans'} width={420}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="warning" onClick={submit} loading={loading}>{isAr?'تطبيق':'Apply'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:8, padding:'10px 14px', fontSize:12, color:'#b45309', marginBottom:14 }}>
        ⚠ {isAr?'هذا الإجراء سيؤثر على عدد كبير من المستخدمين':'This action will affect many users'}
      </div>
      <FormField label={isAr?'الباقة الجديدة':'New Plan'} required>
        <Select value={form.planKey} onChange={v=>upd('planKey',v)}><option value="free">Free</option><option value="pro">Pro</option><option value="elite">Elite</option></Select>
      </FormField>
      <Row>
        <FormField label={isAr?'تصفية بالباقة الحالية':'Only users on plan'} hint={isAr?'فارغ = الكل':'Empty = all'}>
          <Select value={form.filterByPlan} onChange={v=>upd('filterByPlan',v)}><option value="">{isAr?'الكل':'All'}</option><option value="free">Free only</option><option value="pro">Pro only</option></Select>
        </FormField>
        <FormField label={isAr?'تصفية بالدور':'Only role'}>
          <Select value={form.filterByRole} onChange={v=>upd('filterByRole',v)}><option value="">{isAr?'الكل':'All'}</option><option value="user">Users</option><option value="company">Companies</option></Select>
        </FormField>
      </Row>
    </AdminModal>
  );
}