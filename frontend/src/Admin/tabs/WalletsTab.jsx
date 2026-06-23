'use strict';
import { useState } from 'react';
import AdminTable from '../components/AdminTable';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';
import WalletModal from '../modals/WalletModal';
import BulkPointsModal from '../modals/BulkPointsModal';
import useLangStore from '../../i18n';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function WalletsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, reload, limit } = useAdminTable('/admin/wallets');
  const [bulkOpen, setBulkOpen]     = useState(false);
  const [walletUser, setWalletUser] = useState(null);

  const cols = [
    { label:isAr?'المستخدم':'User', key:'user', render:r=>(
      <div><div style={{ fontWeight:500, fontSize:13 }}>{r.user?.fullName||'—'}</div><div style={{ fontSize:11, color:'var(--text-secondary)' }}>{r.user?.email||''}</div></div>
    )},
    { label:isAr?'النقاط':'Points', key:'pointsBalance', render:r=><span style={{ fontWeight:600, color:'#7B72EE' }}>{fmtNum(r.pointsBalance)}</span> },
    { label:isAr?'الرصيد':'Cash',   key:'cashBalance',   render:r=><span style={{ fontWeight:600, color:'#22C55E' }}>${Number(r.cashBalance||0).toFixed(2)}</span> },
    { label:isAr?'مجمدة':'Frozen', key:'isFrozen', render:r=>r.isFrozen?<AdminBadge value="suspended"/>:<AdminBadge value="active"/> },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <Btn size="sm" variant="info" onClick={e=>{e.stopPropagation();setWalletUser(r.user?{...r.user,walletId:r.id}:null);}}>
        <Icon name="edit" size={12}/>{isAr?'تعديل':'Adjust'}
      </Btn>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <BulkPointsModal open={bulkOpen} onClose={()=>setBulkOpen(false)} onSuccess={reload} lang={lang} />
      {walletUser&&<WalletModal open={!!walletUser} onClose={()=>setWalletUser(null)} onSuccess={reload} user={walletUser} lang={lang} />}
      <SH title={`${isAr?'المحافظ':'Wallets'} (${fmtNum(total)})`}>
        <AdminExportBtn type="wallets" />
        <AdminExportBtn type="transactions" label={isAr?'تصدير المعاملات':'Export Transactions'} />
        <Btn variant="primary" onClick={()=>setBulkOpen(true)}><Icon name="points" size={13}/>{isAr?'نقاط جماعية':'Bulk Points'}</Btn>
      </SH>
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد محافظ':'No wallets'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}