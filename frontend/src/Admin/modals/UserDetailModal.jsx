'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import AdminBadge from '../components/AdminBadge';
import { Btn, Spinner } from '../components/AdminUI';
import { fmt } from '../components/AdminTokens';

export default function UserDetailModal({ open, onClose, userId, lang }) {
  const isAr = lang === 'ar';
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      api.get(`/admin/users/${userId}`).then(r => setUser(r.data.data.user)).catch(()=>{}).finally(()=>setLoading(false));
    }
  }, [open, userId]);

  const Row2 = ({ label, value }) => (
    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
      <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{label}</span>
      <span style={{ color:'var(--text-primary)', fontWeight:600 }}>{value||'—'}</span>
    </div>
  );

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'تفاصيل المستخدم':'User Details'} width={560}
      footer={<Btn variant="ghost" onClick={onClose}>{isAr?'إغلاق':'Close'}</Btn>}>
      {loading ? <div style={{ textAlign:'center', padding:40 }}><Spinner size={24} /></div>
      : user ? (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, padding:14, background:'var(--bg-secondary)', borderRadius:10 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--bg-tertiary)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'var(--text-secondary)', flexShrink:0 }}>
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%' }} /> : user.fullName?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)' }}>{user.fullName}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{user.email}</div>
              <div style={{ display:'flex', gap:6, marginTop:4 }}>
                <AdminBadge value={user.role} /><AdminBadge value={user.status} /><AdminBadge value={user.planKey} />
              </div>
            </div>
          </div>
          <Row2 label="ID"             value={user.id} />
          <Row2 label="Phone"          value={user.phone} />
          <Row2 label="Country"        value={user.locationCountry} />
          <Row2 label="Email Verified" value={user.emailVerified ? '✅ Yes' : '❌ No'} />
          <Row2 label="Last Login"     value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : '—'} />
          <Row2 label="Joined"         value={fmt(user.createdAt || user.created_at)} />
          {user.wallet && (
            <div style={{ marginTop:16, padding:14, background:'var(--bg-secondary)', borderRadius:10 }}>
              <div style={{ fontSize:11, fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:10 }}>Wallet</div>
              <div style={{ display:'flex', gap:24 }}>
                <div><span style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{user.wallet.pointsBalance}</span><div style={{ fontSize:11, color:'var(--text-secondary)' }}>Points</div></div>
                <div><span style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>${user.wallet.cashBalance}</span><div style={{ fontSize:11, color:'var(--text-secondary)' }}>Cash</div></div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </AdminModal>
  );
}