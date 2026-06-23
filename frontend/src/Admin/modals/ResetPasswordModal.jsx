'use strict';
import { useState } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { C } from '../components/AdminTokens';

export default function ResetPasswordModal({ open, onClose, onSuccess, user, lang }) {
  const isAr = lang === 'ar';
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async () => {
    if (password.length < 8) { setError(isAr?'8 أحرف على الأقل':'Min 8 characters'); return; }
    setLoading(true); setError('');
    try { await api.patch(`/admin/users/${user.id}/reset-password`, { newPassword:password }); onSuccess?.(); onClose(); setPassword(''); }
    catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?`إعادة تعيين كلمة مرور: ${user?.fullName}`:`Reset Password: ${user?.fullName}`} width={380}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="danger" onClick={submit} loading={loading}><Icon name="lock" size={13}/>{isAr?'إعادة التعيين':'Reset'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <FormField label={isAr?'كلمة المرور الجديدة':'New Password'} required>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
          style={C.input} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
      </FormField>
    </AdminModal>
  );
}