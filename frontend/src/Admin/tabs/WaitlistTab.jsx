'use strict';
import { useState } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import AdminTable from '../components/AdminTable';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { ConfirmModal } from '../components/AdminModal';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum, fmt } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function WaitlistTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, reload, limit } = useAdminTable('/admin/waitlist');
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad]     = useState(false);

  const doDelete = async () => {
    setCLoad(true);
    try { await api.delete(`/admin/waitlist/${confirm.email}`); reload(); } catch {}
    setCLoad(false); setConfirm(null);
  };

  const cols = [
    { label:'#', key:'id', width:60 },
    { label:isAr?'البريد':'Email', key:'email', render:r=><span style={{ fontWeight:500 }}>{r.email}</span> },
    { label:isAr?'اللغة':'Lang', key:'lang', render:r=><AdminBadge value={r.lang||'en'}/> },
    { label:'IP', key:'ip', render:r=><span style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)' }}>{r.ip||'—'}</span> },
    { label:isAr?'التسجيل':'Signed Up', key:'created_at', render:r=>fmt(r.created_at) },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({email:r.email,msg:`Remove ${r.email} from waitlist?`});}}><Icon name="trash" size={12}/></Btn>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doDelete} message={confirm?.msg} loading={cLoad} danger />
      <SH title={`${isAr?'قائمة الانتظار':'Waitlist'} (${fmtNum(total)})`}>
        <AdminExportBtn type="waitlist" />
      </SH>
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'قائمة الانتظار فارغة':'Waitlist is empty'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}