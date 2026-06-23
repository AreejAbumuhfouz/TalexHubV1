'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import AdminTable from '../components/AdminTable';
import AdminSearch from '../components/AdminSearch';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { ConfirmModal } from '../components/AdminModal';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum, fmt } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';
import AddCompanyModal from '../modals/AddCompanyModal';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function CompaniesTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, setParams, reload, limit } = useAdminTable('/admin/companies');
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad]     = useState(false);

  useEffect(() => { setParams({ search:search||undefined, status:statusF||undefined }); }, [search, statusF]);

  const doAction = async () => {
    setCLoad(true);
    try {
      if (confirm.action==='approve') await api.patch(`/admin/companies/${confirm.id}/approve`);
      else await api.patch(`/admin/companies/${confirm.id}/reject`, { reason:'Admin rejection' });
      reload();
    } catch {}
    setCLoad(false); setConfirm(null);
  };

  const cols = [
    { label:isAr?'الشركة':'Company', key:'name', render:r=><span style={{ fontWeight:500 }}>{r.name}</span> },
    { label:isAr?'المالك':'Owner', key:'owner', render:r=><div><div style={{ fontSize:12,fontWeight:500 }}>{r.owner?.fullName||'—'}</div><div style={{ fontSize:11,color:'var(--text-secondary)' }}>{r.owner?.email||''}</div></div> },
    { label:isAr?'الصناعة':'Industry', key:'industry', render:r=>r.industry||'—' },
    { label:isAr?'الحالة':'Status', key:'status', render:r=><AdminBadge value={r.status}/> },
    { label:isAr?'الوظائف':'Jobs', key:'totalJobsPosted', render:r=>fmtNum(r.totalJobsPosted)||'0' },
    { label:isAr?'الانضمام':'Joined', key:'createdAt', render:r=>fmt(r.createdAt) },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <div style={{ display:'flex', gap:5 }}>
        {r.status==='pending_review'&&<><Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'approve',msg:`Approve ${r.name}?`});}}><Icon name="check" size={12}/></Btn><Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'reject',msg:`Reject ${r.name}?`});}}><Icon name="x" size={12}/></Btn></>}
        {r.status==='active'&&<Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'reject',msg:`Suspend ${r.name}?`});}}><Icon name="ban" size={12}/></Btn>}
      </div>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <AddCompanyModal open={addOpen} onClose={()=>setAddOpen(false)} onSuccess={reload} lang={lang} />
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doAction} message={confirm?.msg} loading={cLoad} danger />
      <SH title={`${isAr?'الشركات':'Companies'} (${fmtNum(total)})`}>
        <AdminExportBtn type="companies" params={{ status:statusF }} />
        <Btn variant="primary" onClick={()=>setAddOpen(true)}><Icon name="plus" size={13}/>{isAr?'إضافة شركة':'Add Company'}</Btn>
      </SH>
      <AdminSearch value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder={isAr?'ابحث...':'Search companies...'} isRtl={isAr}
        filters={[{ value:statusF, onChange:v=>{setStatusF(v);setPage(1);}, options:[{value:'',label:'All'},{value:'active',label:'Active'},{value:'pending_review',label:'Pending'},{value:'rejected',label:'Rejected'}] }]} />
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد شركات':'No companies'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}