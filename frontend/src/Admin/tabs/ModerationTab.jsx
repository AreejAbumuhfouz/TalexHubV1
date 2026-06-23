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

export default function ModerationTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, reload, limit } = useAdminTable('/admin/reported-posts');
  const [confirm, setConfirm] = useState(null);
  const [cLoad, setCLoad]     = useState(false);

  const doAction = async () => {
    setCLoad(true);
    try {
      if (confirm.action==='hide')    await api.patch(`/admin/posts/${confirm.postId}/hide`);
      else if (confirm.action==='delete') await api.delete(`/admin/posts/${confirm.postId}`);
      else await api.patch(`/admin/reports/${confirm.id}/resolve`);
      reload();
    } catch {}
    setCLoad(false); setConfirm(null);
  };

  const cols = [
    { label:isAr?'المنشور':'Post', key:'post', render:r=><span style={{ fontSize:12,color:'var(--text-secondary)' }}>{(r.post?.content||'—').slice(0,60)}...</span> },
    { label:isAr?'السبب':'Reason', key:'reason', render:r=><AdminBadge value={r.reason||'report'} custom={{ bg:'rgba(239,68,68,0.1)',color:'#EF4444' }}/> },
    { label:isAr?'التفاصيل':'Details', key:'details', render:r=>r.details||'—' },
    { label:isAr?'التاريخ':'Date', key:'createdAt', render:r=>fmt(r.createdAt) },
    { label:isAr?'إجراءات':'Actions', key:'_', render:r=>(
      <div style={{ display:'flex', gap:5 }}>
        <Btn size="sm" variant="warning" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,postId:r.postId,action:'hide',   msg:'Hide this post?'});}}><Icon name="eye" size={12}/></Btn>
        <Btn size="sm" variant="danger"  onClick={e=>{e.stopPropagation();setConfirm({id:r.id,postId:r.postId,action:'delete', msg:'Delete this post permanently?'});}}><Icon name="trash" size={12}/></Btn>
        <Btn size="sm" variant="success" onClick={e=>{e.stopPropagation();setConfirm({id:r.id,action:'resolve',msg:'Mark as resolved?'});}}><Icon name="check" size={12}/></Btn>
      </div>
    )},
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <ConfirmModal open={!!confirm} onClose={()=>setConfirm(null)} onConfirm={doAction} message={confirm?.msg} loading={cLoad} danger />
      <SH title={`${isAr?'المنشورات المبلغ عنها':'Reported Posts'} (${fmtNum(total)})`}>
        <AdminExportBtn type="reports" />
      </SH>
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد بلاغات':'No reports'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}