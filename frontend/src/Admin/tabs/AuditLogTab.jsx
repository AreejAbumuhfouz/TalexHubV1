'use strict';
import { useState, useEffect } from 'react';
import AdminTable from '../components/AdminTable';
import AdminPagination from '../components/AdminPagination';
import AdminBadge from '../components/AdminBadge';
import AdminExportBtn from '../components/AdminExportBtn';
import { fmtNum, fmt, C } from '../components/AdminTokens';
import useAdminTable from '../components/useAdminTable';
import useLangStore from '../../i18n';

const SH = ({ title, children }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10, marginBottom:16 }}>
    <h2 style={{ fontSize:15, fontWeight:600, color:'var(--text-primary)', margin:0 }}>{title}</h2>
    <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>{children}</div>
  </div>
);

export default function AuditTab({ lang: langProp }) {
  const { lang: storeLang } = useLangStore();
  const lang = storeLang || langProp || 'en';
  const isAr = lang === 'ar';
  const { rows, total, page, setPage, loading, setParams, limit } = useAdminTable('/admin/audit-logs', 50);
  const [actionF, setActionF] = useState('');
  const [typeF, setTypeF]     = useState('');

  useEffect(() => { setParams({ action:actionF||undefined, entityType:typeF||undefined }); }, [actionF, typeF]);

  const cols = [
    { label:isAr?'الإجراء':'Action', key:'action', render:r=><span style={{ fontFamily:'monospace', fontSize:11, background:'var(--bg-tertiary)', padding:'2px 7px', borderRadius:4, color:'var(--text-primary)' }}>{r.action}</span> },
    { label:isAr?'بواسطة':'Actor', key:'actor', render:r=><div><div style={{ fontSize:12,fontWeight:500 }}>{r.actor?.fullName||'—'}</div><div style={{ fontSize:11,color:'var(--text-secondary)' }}>{r.actor?.email||''}</div></div> },
    { label:isAr?'النوع':'Entity', key:'entityType', render:r=>r.entityType?<AdminBadge value={r.entityType}/>:'—' },
    { label:isAr?'التفاصيل':'Details', key:'newValue', render:r=>{ try { const v=typeof r.newValue==='string'?JSON.parse(r.newValue):r.newValue; return <span style={{ fontSize:11,color:'var(--text-secondary)',fontFamily:'monospace' }}>{JSON.stringify(v).slice(0,50)}</span>; } catch { return '—'; } } },
    { label:isAr?'الوقت':'Time', key:'createdAt', render:r=><span style={{ fontSize:12,color:'var(--text-secondary)' }}>{fmt(r.createdAt)}</span> },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <SH title={`${isAr?'سجل النشاطات':'Audit Log'} (${fmtNum(total)})`}>
        <AdminExportBtn type="audit" params={{ action:actionF, entityType:typeF }} />
      </SH>
      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <input value={actionF} onChange={e=>{setActionF(e.target.value);setPage(1);}} placeholder={isAr?'تصفية بالإجراء...':'Filter by action...'}
          style={{ ...C.input, width:200 }} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
        <select value={typeF} onChange={e=>{setTypeF(e.target.value);setPage(1);}} style={{ ...C.select, width:'auto', minWidth:140 }}>
          <option value="">All Entities</option><option value="User">User</option><option value="Company">Company</option><option value="Job">Job</option><option value="Course">Course</option><option value="Wallet">Wallet</option><option value="Setting">Setting</option><option value="Export">Export</option>
        </select>
      </div>
      <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
        <AdminTable columns={cols} rows={rows} loading={loading} isRtl={isAr} empty={isAr?'لا توجد سجلات':'No logs'} />
        <AdminPagination page={page} total={total} limit={limit} onPage={setPage} isRtl={isAr} />
      </div>
    </div>
  );
}