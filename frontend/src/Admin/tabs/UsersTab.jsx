'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import AdminTable from '../components/AdminTable';
import AdminSearch from '../components/AdminSearch';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import AdminModal, { ConfirmModal } from '../components/AdminModal';
import { Avatar, Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum, fmt } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';
import AddUserModal from '../modals/AddUserModal';
import EditUserModal from '../modals/EditUserModal';
import UserDetailModal from '../modals/UserDetailModal';
import WalletModal from '../modals/WalletModal';
import BulkPointsModal from '../modals/BulkPointsModal';
import BulkPlanModal from '../modals/BulkPlanModal';
import ResetPasswordModal from '../modals/ResetPasswordModal';

const SectionHeader = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function UsersTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, setParams, reload, limit } = useAdminTable('/admin/users');
  const [search, setSearch]           = useState('');
  const [statusF, setStatusF]         = useState('');
  const [planF, setPlanF]             = useState('');
  const [roleF, setRoleF]             = useState('');
  const [addOpen, setAddOpen]         = useState(false);
  const [editUser, setEditUser]       = useState(null);
  const [detailId, setDetailId]       = useState(null);
  const [walletUser, setWalletUser]   = useState(null);
  const [resetUser, setResetUser]     = useState(null);
  const [bulkOpen, setBulkOpen]       = useState(false);
  const [bulkPlanOpen, setBulkPlanOpen] = useState(false);
  const [confirm, setConfirm]         = useState(null);
  const [confirmLoad, setConfirmLoad] = useState(false);

  useEffect(() => {
    setParams({ search:search||undefined, status:statusF||undefined, planKey:planF||undefined, role:roleF||undefined });
  }, [search, statusF, planF, roleF]);

  const doStatus = async () => {
    setConfirmLoad(true);
    try { await api.patch(`/admin/users/${confirm.id}/status`, { status:confirm.status }); reload(); } catch {}
    setConfirmLoad(false); setConfirm(null);
  };

  const cols = [
    { label:isAr?'المستخدم':'User', key:'fullName', render:r => (
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <Avatar src={r.avatarUrl} name={r.fullName} size={30} />
        <div><div style={{ fontWeight:500, fontSize:13 }}>{r.fullName}</div><div style={{ fontSize:11, color:'var(--text-secondary)' }}>{r.email}</div></div>
      </div>
    )},
    { label:isAr?'الدور':'Role',    key:'role',   render:r => <AdminBadge value={r.role} /> },
    { label:isAr?'الحالة':'Status', key:'status', render:r => <AdminBadge value={r.status} /> },
    { label:isAr?'الباقة':'Plan',   key:'planKey', render:r => <AdminBadge value={r.planKey} /> },
    { label:isAr?'الدولة':'Country', key:'locationCountry' },
    { label:isAr?'الانضمام':'Joined', key:'createdAt', render:r => fmt(r.createdAt||r.created_at) },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r => (
      <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
        <Btn size="sm" variant="ghost"   onClick={e=>{e.stopPropagation();setDetailId(r.id);}}><Icon name="eye" size={12}/></Btn>
        <Btn size="sm" variant="ghost"   onClick={e=>{e.stopPropagation();setEditUser(r);}}><Icon name="edit" size={12}/></Btn>
        <Btn size="sm" variant="info"    onClick={e=>{e.stopPropagation();setWalletUser(r);}}><Icon name="wallet" size={12}/></Btn>
        <Btn size="sm" variant="warning" onClick={e=>{e.stopPropagation();setResetUser(r);}}><Icon name="lock" size={12}/></Btn>
        {r.status!=='suspended'
          ? <Btn size="sm" variant="danger"  onClick={e=>{e.stopPropagation();setConfirm({id:r.id,status:'suspended',msg:`Suspend ${r.fullName}?`});}}><Icon name="ban" size={12}/></Btn>
          : <Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,status:'active',   msg:`Activate ${r.fullName}?`});}}><Icon name="check" size={12}/></Btn>
        }
      </div>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <AddUserModal    open={addOpen}      onClose={()=>setAddOpen(false)}      onSuccess={reload} lang={lang} />
      <EditUserModal   open={!!editUser}   onClose={()=>setEditUser(null)}      onSuccess={reload} user={editUser} lang={lang} />
      <UserDetailModal open={!!detailId}   onClose={()=>setDetailId(null)}      userId={detailId}  lang={lang} />
      <WalletModal     open={!!walletUser} onClose={()=>setWalletUser(null)}    onSuccess={reload} user={walletUser} lang={lang} />
      <BulkPointsModal open={bulkOpen}     onClose={()=>setBulkOpen(false)}     onSuccess={reload} lang={lang} />
      <BulkPlanModal   open={bulkPlanOpen} onClose={()=>setBulkPlanOpen(false)} onSuccess={reload} lang={lang} />
      <ResetPasswordModal open={!!resetUser} onClose={()=>setResetUser(null)}   onSuccess={reload} user={resetUser} lang={lang} />
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doStatus} message={confirm?.msg} loading={confirmLoad} danger />

      <SectionHeader title={`${isAr?'المستخدمون':'Users'} (${fmtNum(total)})`}>
        <AdminExportBtn type="users" params={{ status:statusF, planKey:planF, role:roleF }} />
        <Btn variant="ghost" onClick={()=>setBulkOpen(true)}><Icon name="points" size={13}/>{isAr?'نقاط جماعية':'Bulk Points'}</Btn>
        <Btn variant="ghost" onClick={()=>setBulkPlanOpen(true)}><Icon name="star" size={13}/>{isAr?'ترقية جماعية':'Bulk Plan'}</Btn>
        <Btn variant="primary" onClick={()=>setAddOpen(true)}><Icon name="plus" size={13}/>{isAr?'إضافة مستخدم':'Add User'}</Btn>
      </SectionHeader>

      <AdminSearch value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder={isAr?'ابحث...':'Search users...'} isRtl={isAr}
        filters={[
          { value:statusF, onChange:v=>{setStatusF(v);setPage(1);}, options:[{value:'',label:isAr?'كل الحالات':'All Status'},{value:'active',label:'Active'},{value:'pending',label:'Pending'},{value:'suspended',label:'Suspended'}] },
          { value:planF,   onChange:v=>{setPlanF(v);setPage(1);},   options:[{value:'',label:isAr?'كل الباقات':'All Plans'},{value:'free',label:'Free'},{value:'pro',label:'Pro'},{value:'elite',label:'Elite'}] },
          { value:roleF,   onChange:v=>{setRoleF(v);setPage(1);},   options:[{value:'',label:isAr?'كل الأدوار':'All Roles'},{value:'user',label:'User'},{value:'company',label:'Company'},{value:'admin',label:'Admin'},{value:'support',label:'Support'}] },
        ]} />

      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا يوجد مستخدمون':'No users found'} onRowClick={r=>setDetailId(r.id)} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}