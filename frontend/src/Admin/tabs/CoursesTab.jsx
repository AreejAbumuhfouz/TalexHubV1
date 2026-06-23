'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import useLangStore from '../../i18n';
import AdminTable from '../components/AdminTable';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { ConfirmModal } from '../components/AdminModal';
import { Btn } from '../components/AdminUI';
import { Icon } from '../components/AdminIcons';
import { fmtNum, fmt, C } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';
import AddCourseModal from '../modals/AddCourseModal';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function CoursesTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, setParams, reload, limit } = useAdminTable('/admin/courses');
  const [statusF, setStatusF] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad]     = useState(false);

  useEffect(() => { setParams({ status:statusF||undefined }); }, [statusF]);

  const doAction = async () => {
    setCLoad(true);
    try {
      if (confirm.action==='delete') await api.delete(`/admin/courses/${confirm.id}`);
      else await api.patch(`/admin/courses/${confirm.id}/status`, { status:confirm.action });
      reload();
    } catch {}
    setCLoad(false); setConfirm(null);
  };

  const cols = [
    { label:isAr?'الدورة':'Course', key:'title', render:r=><span style={{ fontWeight:500 }}>{r.title}</span> },
    { label:isAr?'الفئة':'Category', key:'category', render:r=>r.category?.name||'—' },
    { label:isAr?'الحالة':'Status', key:'status', render:r=><AdminBadge value={r.status}/> },
    { label:isAr?'السعر':'Price', key:'price', render:r=>r.isFree?<AdminBadge value="free"/>:`$${r.price}` },
    { label:isAr?'المسجلون':'Enrolled', key:'enrolledCount', render:r=>fmtNum(r.enrolledCount) },
    { label:isAr?'التقييم':'Rating', key:'ratingAvg', render:r=>r.ratingAvg?`⭐ ${Number(r.ratingAvg).toFixed(1)}`:'—' },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <div style={{ display:'flex', gap:5 }}>
        {r.status!=='published'&&<Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'published',msg:`Publish "${r.title}"?`});}}><Icon name="check" size={12}/></Btn>}
        {r.status==='published'&&<Btn size="sm" variant="ghost" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'archived',msg:`Archive "${r.title}"?`});}}><Icon name="ban" size={12}/></Btn>}
        <Btn size="sm" variant="danger" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'delete',msg:`Delete "${r.title}"?`});}}><Icon name="trash" size={12}/></Btn>
      </div>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <AddCourseModal open={addOpen} onClose={()=>setAddOpen(false)} onSuccess={reload} lang={lang} />
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doAction} message={confirm?.msg} loading={cLoad} danger />
      <SH title={`${isAr?'الدورات':'Courses'} (${fmtNum(total)})`}>
        <AdminExportBtn type="courses" />
        <Btn variant="primary" onClick={()=>setAddOpen(true)}><Icon name="plus" size={13}/>{isAr?'إضافة دورة':'Add Course'}</Btn>
      </SH>
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} style={{ ...C.select, width:'auto', minWidth:140 }}>
          <option value="">All Status</option><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
        </select>
      </div>
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد دورات':'No courses'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}