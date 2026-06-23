'use strict';
/**
 * AddUserModal.jsx
 * Create a new user from admin.
 */

import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input  = ({ value, onChange, type = 'text', placeholder, disabled }) => (
  <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
    placeholder={placeholder} disabled={disabled}
    style={{ ...C.input, ...(disabled ? { opacity: 0.6 } : {}) }}
    onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
    onBlur={e  => e.target.style.borderColor = 'var(--border)'} />
);
const Select = ({ value, onChange, children }) => (
  <select value={value || ''} onChange={e => onChange(e.target.value)} style={C.select}>
    {children}
  </select>
);
const Row = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
);

export default function AddUserModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]       = useState({ fullName: '', email: '', password: '', role: 'user', planKey: 'free', status: 'active' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.fullName || !form.email || !form.password) {
      setError(isAr ? 'جميع الحقول مطلوبة' : 'All fields required');
      return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/admin/users', form);
      onSuccess?.();
      onClose();
      setForm({ fullName: '', email: '', password: '', role: 'user', planKey: 'free', status: 'active' });
    } catch (e) { setError(e.response?.data?.message || 'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose}
      title={isAr ? 'إضافة مستخدم جديد' : 'Add New User'}
      footer={<>
        <Btn variant="ghost" onClick={onClose}>{isAr ? 'إلغاء' : 'Cancel'}</Btn>
        <Btn variant="primary" onClick={submit} loading={loading}>{isAr ? 'إنشاء' : 'Create'}</Btn>
      </>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <Row>
        <FormField label={isAr ? 'الاسم الكامل' : 'Full Name'} required>
          <Input value={form.fullName} onChange={v => upd('fullName', v)} placeholder="John Smith" />
        </FormField>
        <FormField label={isAr ? 'البريد الإلكتروني' : 'Email'} required>
          <Input type="email" value={form.email} onChange={v => upd('email', v)} placeholder="user@example.com" />
        </FormField>
      </Row>
      <FormField label={isAr ? 'كلمة المرور' : 'Password'} required hint={isAr ? '8 أحرف على الأقل' : 'Min 8 characters'}>
        <Input type="password" value={form.password} onChange={v => upd('password', v)} placeholder="••••••••" />
      </FormField>
      <Row>
        <FormField label={isAr ? 'الدور' : 'Role'}>
          <Select value={form.role} onChange={v => upd('role', v)}>
            <option value="user">User</option>
            <option value="company">Company</option>
            <option value="support">Support</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
        <FormField label={isAr ? 'الباقة' : 'Plan'}>
          <Select value={form.planKey} onChange={v => upd('planKey', v)}>
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="elite">Elite</option>
          </Select>
        </FormField>
      </Row>
      <FormField label={isAr ? 'الحالة' : 'Status'}>
        <Select value={form.status} onChange={v => upd('status', v)}>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </Select>
      </FormField>
    </AdminModal>
  );
}