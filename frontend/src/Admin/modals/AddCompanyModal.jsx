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

export default function AddCompanyModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ name:'', emailDomain:'', ownerId:'', industry:'', website:'', locationCountry:'', companySize:'', status:'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  const submit = async () => {
    if (!form.name||!form.emailDomain||!form.ownerId) { setError(isAr?'الاسم والنطاق ومعرف المالك مطلوبة':'Name, email domain and owner ID required'); return; }
    setLoading(true); setError('');
    try { await api.post('/admin/companies', form); onSuccess?.(); onClose(); }
    catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'إضافة شركة':'Add Company'} width={520}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'إنشاء':'Create'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <Row><FormField label="Company Name" required><Input value={form.name} onChange={v=>upd('name',v)} placeholder="Tech Co." /></FormField><FormField label="Email Domain" required hint="e.g. techco.com"><Input value={form.emailDomain} onChange={v=>upd('emailDomain',v)} placeholder="techco.com" /></FormField></Row>
      <FormField label="Owner User ID" required hint="Paste the user UUID"><Input value={form.ownerId} onChange={v=>upd('ownerId',v)} placeholder="uuid..." /></FormField>
      <Row>
        <FormField label="Industry"><Input value={form.industry} onChange={v=>upd('industry',v)} placeholder="Technology" /></FormField>
        <FormField label="Size"><Select value={form.companySize} onChange={v=>upd('companySize',v)}><option value="">Select size</option>{['1-10','11-50','51-200','201-500','500+'].map(s=><option key={s} value={s}>{s} employees</option>)}</Select></FormField>
      </Row>
      <Row>
        <FormField label="Website"><Input value={form.website} onChange={v=>upd('website',v)} placeholder="https://..." /></FormField>
        <FormField label="Country"><Input value={form.locationCountry} onChange={v=>upd('locationCountry',v)} placeholder="SA" /></FormField>
      </Row>
      <FormField label="Status"><Select value={form.status} onChange={v=>upd('status',v)}><option value="active">Active</option><option value="pending_review">Pending Review</option></Select></FormField>
    </AdminModal>
  );
}