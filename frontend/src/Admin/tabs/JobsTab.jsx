// 'use strict';
// import { useState, useEffect } from 'react';
// import api from '../../services/api';
// import useLangStore from '../../i18n';
// import AdminTable from '../components/AdminTable';
// import AdminSearch from '../components/AdminSearch';
// import AdminPagination from '../components/AdminPagination';
// import AdminBadge from '../components/AdminBadge';
// import AdminExportBtn from '../components/AdminExportBtn';
// import { ConfirmModal } from '../components/AdminModal';
// import { Btn } from '../components/AdminUI';
// import { Icon } from '../components/AdminIcons';
// import { fmtNum, fmt } from '../components/AdminTokens';
// import useAdminTable from '../components/useAdminTable';
// import AddJobModal from '../modals/AddJobModal';

// const SH = ({ title, children }) => (
//   <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
//     <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
//     <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
//   </div>
// );

// export default function JobsTab({ lang: langProp }) {
//   const { lang: storeLang } = useLangStore();
//   const lang = storeLang || langProp || 'en';
//   const isAr = lang === 'ar';
//   const { rows, total, page, setPage, loading, setParams, reload, limit } = useAdminTable('/admin/jobs');
//   const [search, setSearch]   = useState('');
//   const [statusF, setStatusF] = useState('');
//   const [addOpen, setAddOpen] = useState(false);
//   const [confirm, setConfirm] = useState(null);
//   const [cLoad, setCLoad]     = useState(false);

//   useEffect(() => { setParams({ search:search||undefined, status:statusF||undefined }); }, [search, statusF]);

//   const doAction = async () => {
//     setCLoad(true);
//     try {
//       if (confirm.action==='approve') await api.patch(`/admin/jobs/${confirm.id}/approve`);
//       else if (confirm.action==='reject') await api.patch(`/admin/jobs/${confirm.id}/reject`);
//       else await api.delete(`/admin/jobs/${confirm.id}`);
//       reload();
//     } catch {}
//     setCLoad(false); setConfirm(null);
//   };

//   const cols = [
//     { label:isAr?'الوظيفة':'Job', key:'title', render:r=><span style={{ fontWeight:500 }}>{r.title}</span> },
//     { label:isAr?'الشركة':'Company', key:'company', render:r=>r.company?.name||'—' },
//     { label:isAr?'النوع':'Type', key:'jobType', render:r=><AdminBadge value={r.jobType}/> },
//     { label:isAr?'الحالة':'Status', key:'status', render:r=><AdminBadge value={r.status}/> },
//     { label:isAr?'الطلبات':'Apps', key:'applicationsCount', render:r=>fmtNum(r.applicationsCount)||'0' },
//     { label:isAr?'النشر':'Posted', key:'createdAt', render:r=>fmt(r.createdAt) },
//     { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
//       <div style={{ display:'flex', gap:5 }}>
//         {r.status==='pending_approval'&&<><Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'approve',msg:`Approve "${r.title}"?`});}}><Icon name="check" size={12}/></Btn><Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'reject',msg:`Reject "${r.title}"?`});}}><Icon name="x" size={12}/></Btn></>}
//         <Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'delete',msg:`Delete "${r.title}"?`});}}><Icon name="trash" size={12}/></Btn>
//       </div>
//     )},
//   ];

//   return (
//     <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
//       <AddJobModal open={addOpen} onClose={()=>setAddOpen(false)} onSuccess={reload} lang={lang} />
//       <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doAction} message={confirm?.msg} loading={cLoad} danger />
//       <SH title={`${isAr?'الوظائف':'Jobs'} (${fmtNum(total)})`}>
//         <AdminExportBtn type="jobs" params={{ status:statusF }} />
//         <Btn variant="primary" onClick={()=>setAddOpen(true)}><Icon name="plus" size={13}/>{isAr?'إضافة وظيفة':'Add Job'}</Btn>
//       </SH>
//       <AdminSearch value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder={isAr?'ابحث...':'Search jobs...'} isRtl={isAr}
//         filters={[{ value:statusF, onChange:v=>{setStatusF(v);setPage(1);}, options:[{value:'',label:'All'},{value:'active',label:'Active'},{value:'pending_approval',label:'Pending'},{value:'draft',label:'Draft'},{value:'closed',label:'Closed'},{value:'archived',label:'Archived'}] }]} />
//       <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
//         <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد وظائف':'No jobs'} />
//         <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
//       </div>
//     </div>
//   );
// }

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
import AddJobModal from '../modals/AddJobModal';
import BulkUploadJobsModal from '../modals/BulkUploadJobsModal';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function JobsTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, setParams, reload, limit } = useAdminTable('/admin/jobs');
  const [search, setSearch]   = useState('');
  const [statusF, setStatusF] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad]     = useState(false);

  useEffect(() => { setParams({ search:search||undefined, status:statusF||undefined }); }, [search, statusF]);

  const doAction = async () => {
    setCLoad(true);
    try {
      if (confirm.action==='approve') await api.patch(`/admin/jobs/${confirm.id}/approve`);
      else if (confirm.action==='reject') await api.patch(`/admin/jobs/${confirm.id}/reject`);
      else await api.delete(`/admin/jobs/${confirm.id}`);
      reload();
    } catch {}
    setCLoad(false); setConfirm(null);
  };

  const cols = [
    { label:isAr?'الوظيفة':'Job', key:'title', render:r=><span style={{ fontWeight:500 }}>{r.title}</span> },
    { label:isAr?'الشركة':'Company', key:'company', render:r=>r.company?.name||'—' },
    { label:isAr?'النوع':'Type', key:'jobType', render:r=><AdminBadge value={r.jobType}/> },
    { label:isAr?'الحالة':'Status', key:'status', render:r=><AdminBadge value={r.status}/> },
    { label:isAr?'الطلبات':'Apps', key:'applicationsCount', render:r=>fmtNum(r.applicationsCount)||'0' },
    { label:isAr?'النشر':'Posted', key:'createdAt', render:r=>fmt(r.createdAt) },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <div style={{ display:'flex', gap:5 }}>
        {r.status==='pending_approval'&&<><Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'approve',msg:`Approve "${r.title}"?`});}}><Icon name="check" size={12}/></Btn><Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'reject',msg:`Reject "${r.title}"?`});}}><Icon name="x" size={12}/></Btn></>}
        <Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'delete',msg:`Delete "${r.title}"?`});}}><Icon name="trash" size={12}/></Btn>
      </div>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <AddJobModal open={addOpen} onClose={()=>setAddOpen(false)} onSuccess={reload} lang={lang} />
      <BulkUploadJobsModal open={bulkOpen} onClose={()=>setBulkOpen(false)} onSuccess={reload} lang={lang} />
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doAction} message={confirm?.msg} loading={cLoad} danger />
      <SH title={`${isAr?'الوظائف':'Jobs'} (${fmtNum(total)})`}>
        <AdminExportBtn type="jobs" params={{ status:statusF }} />
        <Btn variant="secondary" onClick={()=>setBulkOpen(true)}><Icon name="upload" size={13}/>{isAr?'رفع متعدد (CSV)':'Bulk Upload (CSV)'}</Btn>
        <Btn variant="primary" onClick={()=>setAddOpen(true)}><Icon name="plus" size={13}/>{isAr?'إضافة وظيفة':'Add Job'}</Btn>
      </SH>
      <AdminSearch value={search} onChange={v=>{setSearch(v);setPage(1);}} placeholder={isAr?'ابحث...':'Search jobs...'} isRtl={isAr}
        filters={[{ value:statusF, onChange:v=>{setStatusF(v);setPage(1);}, options:[{value:'',label:'All'},{value:'active',label:'Active'},{value:'pending_approval',label:'Pending'},{value:'draft',label:'Draft'},{value:'closed',label:'Closed'},{value:'archived',label:'Archived'}] }]} />
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد وظائف':'No jobs'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}