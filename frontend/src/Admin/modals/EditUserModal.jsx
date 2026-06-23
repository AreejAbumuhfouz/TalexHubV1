'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input  = ({ value, onChange, type = 'text', placeholder }) => (
  <input type={type} value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={C.input} onFocus={e => e.target.style.borderColor='var(--text-primary)'} onBlur={e => e.target.style.borderColor='var(--border)'} />
);
const Select = ({ value, onChange, children }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)} style={C.select}>{children}</select>
);
const Row = ({ children }) => <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>{children}</div>;

export default function EditUserModal({ open, onClose, onSuccess, user, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (user) setForm({ fullName: user.fullName||'', email: user.email||'', role: user.role||'user', planKey: user.planKey||'free', status: user.status||'active', phone: user.phone||'', locationCountry: user.locationCountry||'' });
  }, [user]);

  const submit = async () => {
    setLoading(true); setError('');
    try { await api.patch(`/admin/users/${user.id}`, form); onSuccess?.(); onClose(); }
    catch (e) { setError(e.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr ? 'تعديل المستخدم' : 'Edit User'}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'حفظ':'Save'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <Row><FormField label="Full Name" required><Input value={form.fullName} onChange={v=>upd('fullName',v)} /></FormField><FormField label="Email" required><Input type="email" value={form.email} onChange={v=>upd('email',v)} /></FormField></Row>
      <Row><FormField label="Phone"><Input value={form.phone} onChange={v=>upd('phone',v)} placeholder="+1234567890" /></FormField><FormField label="Country"><Input value={form.locationCountry} onChange={v=>upd('locationCountry',v)} placeholder="SA" /></FormField></Row>
      <Row>
        <FormField label="Role"><Select value={form.role} onChange={v=>upd('role',v)}><option value="user">User</option><option value="company">Company</option><option value="support">Support</option><option value="admin">Admin</option></Select></FormField>
        <FormField label="Plan"><Select value={form.planKey} onChange={v=>upd('planKey',v)}><option value="free">Free</option><option value="pro">Pro</option><option value="elite">Elite</option></Select></FormField>
      </Row>
      <FormField label="Status"><Select value={form.status} onChange={v=>upd('status',v)}><option value="active">Active</option><option value="pending">Pending</option><option value="suspended">Suspended</option></Select></FormField>
    </AdminModal>
  );
}