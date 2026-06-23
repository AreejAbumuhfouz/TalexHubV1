// 'use strict';
// import { useState, useEffect } from 'react';
// import api from '../../services/api';
// import AdminModal from '../components/AdminModal';
// import { FormField, Btn } from '../components/AdminUI';
// import { C } from '../components/AdminTokens';

// const Input    = ({ value, onChange, type='text', placeholder, disabled }) => (
//   <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
//     style={{ ...C.input,...(disabled?{opacity:0.6}:{}) }} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
// );
// const Select   = ({ value, onChange, children }) => (
//   <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
// );
// const Textarea = ({ value, onChange, placeholder, rows=4 }) => (
//   <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
//     style={C.textarea} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
// );
// const Row = ({ children, cols=2 }) => <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>{children}</div>;

// export default function AddJobModal({ open, onClose, onSuccess, lang }) {
//   const isAr = lang === 'ar';
//   const [form, setForm]           = useState({ title:'', titleAr:'', description:'', requirements:'', companyId:'', categoryId:'', jobType:'full_time', locationCountry:'', locationCity:'', isRemote:false, salaryMin:'', salaryMax:'', salaryCurrency:'USD', deadline:'', status:'active' });
//   const [companies, setCompanies] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading]     = useState(false);
//   const [error, setError]         = useState('');
//   const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

//   useEffect(() => {
//     if (open) {
//       api.get('/admin/companies-list').then(r=>setCompanies(r.data.data.companies||[])).catch(()=>{});
//       api.get('/admin/categories/jobs').then(r=>setCategories(r.data.data.categories||[])).catch(()=>{});
//     }
//   }, [open]);

//   const submit = async () => {
//     if (!form.title||!form.description||!form.companyId) { setError(isAr?'العنوان والوصف والشركة مطلوبة':'Title, description, company required'); return; }
//     setLoading(true); setError('');
//     try { await api.post('/admin/jobs', form); onSuccess?.(); onClose(); }
//     catch (e) { setError(e.response?.data?.message||'Error'); }
//     setLoading(false);
//   };

//   return (
//     <AdminModal open={open} onClose={onClose} title={isAr?'إضافة وظيفة جديدة':'Add New Job'} width={620}
//       footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'نشر':'Publish Job'}</Btn></>}>
//       {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
//       <Row><FormField label="Job Title" required><Input value={form.title} onChange={v=>upd('title',v)} placeholder="Senior Software Engineer" /></FormField><FormField label="Arabic Title"><Input value={form.titleAr} onChange={v=>upd('titleAr',v)} placeholder="مهندس برمجيات أول" /></FormField></Row>
//       <Row>
//         <FormField label="Company" required><Select value={form.companyId} onChange={v=>upd('companyId',v)}><option value="">Select company...</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
//         <FormField label="Category"><Select value={form.categoryId} onChange={v=>upd('categoryId',v)}><option value="">Select category...</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
//       </Row>
//       <FormField label="Description" required><Textarea value={form.description} onChange={v=>upd('description',v)} placeholder="Job description..." rows={4} /></FormField>
//       <FormField label="Requirements"><Textarea value={form.requirements} onChange={v=>upd('requirements',v)} placeholder="Requirements..." rows={3} /></FormField>
//       <Row cols={3}>
//         <FormField label="Type"><Select value={form.jobType} onChange={v=>upd('jobType',v)}><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="freelance">Freelance</option><option value="internship">Internship</option><option value="remote">Remote</option></Select></FormField>
//         <FormField label="Country"><Input value={form.locationCountry} onChange={v=>upd('locationCountry',v)} placeholder="SA" /></FormField>
//         <FormField label="City"><Input value={form.locationCity} onChange={v=>upd('locationCity',v)} placeholder="Riyadh" /></FormField>
//       </Row>
//       <Row cols={3}>
//         <FormField label="Salary Min"><Input type="number" value={form.salaryMin} onChange={v=>upd('salaryMin',v)} placeholder="3000" /></FormField>
//         <FormField label="Salary Max"><Input type="number" value={form.salaryMax} onChange={v=>upd('salaryMax',v)} placeholder="8000" /></FormField>
//         <FormField label="Currency"><Select value={form.salaryCurrency} onChange={v=>upd('salaryCurrency',v)}><option value="USD">USD</option><option value="SAR">SAR</option><option value="AED">AED</option><option value="EGP">EGP</option><option value="JOD">JOD</option></Select></FormField>
//       </Row>
//       <Row>
//         <FormField label="Deadline"><Input type="date" value={form.deadline} onChange={v=>upd('deadline',v)} /></FormField>
//         <FormField label="Status"><Select value={form.status} onChange={v=>upd('status',v)}><option value="active">Active (Live)</option><option value="draft">Draft</option><option value="closed">Closed</option></Select></FormField>
//       </Row>
//       <FormField label="Remote">
//         <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
//           <input type="checkbox" checked={form.isRemote} onChange={e=>upd('isRemote',e.target.checked)} style={{ accentColor:'var(--text-primary)', width:14, height:14 }} />
//           {isAr?'وظيفة عن بُعد':'Remote job'}
//         </label>
//       </FormField>
//     </AdminModal>
//   );
// }

'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input    = ({ value, onChange, type='text', placeholder, disabled }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
    style={{ ...C.input,...(disabled?{opacity:0.6}:{}) }} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Select   = ({ value, onChange, children }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
);
const Textarea = ({ value, onChange, placeholder, rows=4 }) => (
  <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={C.textarea} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Row = ({ children, cols=2 }) => <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>{children}</div>;

export default function AddJobModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]           = useState({ title:'', titleAr:'', description:'', requirements:'', companyId:'', categoryId:'', jobType:'full_time', locationCountry:'', locationCity:'', isRemote:false, salaryMin:'', salaryMax:'', salaryCurrency:'USD', deadline:'', status:'active', applicationEmail:'' });
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => {
    if (open) {
      api.get('/admin/companies-list').then(r=>setCompanies(r.data.data.companies||[])).catch(()=>{});
      api.get('/admin/categories/jobs').then(r=>setCategories(r.data.data.categories||[])).catch(()=>{});
    }
  }, [open]);

  const submit = async () => {
    if (!form.title||!form.description||!form.companyId) { setError(isAr?'العنوان والوصف والشركة مطلوبة':'Title, description, company required'); return; }
    if (form.applicationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicationEmail)) {
      setError(isAr ? 'صيغة إيميل استقبال الطلبات غير صحيحة' : 'Invalid application email format');
      return;
    }
    setLoading(true); setError('');
    try { await api.post('/admin/jobs', form); onSuccess?.(); onClose(); }
    catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'إضافة وظيفة جديدة':'Add New Job'} width={620}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'نشر':'Publish Job'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <Row><FormField label="Job Title" required><Input value={form.title} onChange={v=>upd('title',v)} placeholder="Senior Software Engineer" /></FormField><FormField label="Arabic Title"><Input value={form.titleAr} onChange={v=>upd('titleAr',v)} placeholder="مهندس برمجيات أول" /></FormField></Row>
      <Row>
        <FormField label="Company" required><Select value={form.companyId} onChange={v=>upd('companyId',v)}><option value="">Select company...</option>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
        <FormField label="Category"><Select value={form.categoryId} onChange={v=>upd('categoryId',v)}><option value="">Select category...</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
      </Row>
      <FormField label="Description" required><Textarea value={form.description} onChange={v=>upd('description',v)} placeholder="Job description..." rows={4} /></FormField>
      <FormField label="Requirements"><Textarea value={form.requirements} onChange={v=>upd('requirements',v)} placeholder="Requirements..." rows={3} /></FormField>
      <Row cols={3}>
        <FormField label="Type"><Select value={form.jobType} onChange={v=>upd('jobType',v)}><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="freelance">Freelance</option><option value="internship">Internship</option><option value="remote">Remote</option></Select></FormField>
        <FormField label="Country"><Input value={form.locationCountry} onChange={v=>upd('locationCountry',v)} placeholder="SA" /></FormField>
        <FormField label="City"><Input value={form.locationCity} onChange={v=>upd('locationCity',v)} placeholder="Riyadh" /></FormField>
      </Row>
      <Row cols={3}>
        <FormField label="Salary Min"><Input type="number" value={form.salaryMin} onChange={v=>upd('salaryMin',v)} placeholder="3000" /></FormField>
        <FormField label="Salary Max"><Input type="number" value={form.salaryMax} onChange={v=>upd('salaryMax',v)} placeholder="8000" /></FormField>
        <FormField label="Currency"><Select value={form.salaryCurrency} onChange={v=>upd('salaryCurrency',v)}><option value="USD">USD</option><option value="SAR">SAR</option><option value="AED">AED</option><option value="EGP">EGP</option><option value="JOD">JOD</option></Select></FormField>
      </Row>
      <Row>
        <FormField label="Deadline"><Input type="date" value={form.deadline} onChange={v=>upd('deadline',v)} /></FormField>
        <FormField label="Status"><Select value={form.status} onChange={v=>upd('status',v)}><option value="active">Active (Live)</option><option value="draft">Draft</option><option value="closed">Closed</option></Select></FormField>
      </Row>
      <Row>
        <FormField label={isAr ? 'إيميل استقبال الطلبات' : 'Application Email'}>
          <Input type="email" value={form.applicationEmail} onChange={v=>upd('applicationEmail',v)} placeholder="hr@company.com" />
        </FormField>
        <FormField label="Remote">
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, marginTop:8 }}>
            <input type="checkbox" checked={form.isRemote} onChange={e=>upd('isRemote',e.target.checked)} style={{ accentColor:'var(--text-primary)', width:14, height:14 }} />
            {isAr?'وظيفة عن بُعد':'Remote job'}
          </label>
        </FormField>
      </Row>
      <p style={{ fontSize:11, color:'var(--text-secondary)', margin:'4px 0 0' }}>
        {isAr
          ? 'إيميل استقبال الطلبات اختياري — إذا تُرك فارغاً، سيُستخدم إيميل صاحب الشركة تلقائياً عند التقديم التلقائي.'
          : 'Application email is optional — if left blank, the company owner\'s email will be used automatically for auto-apply.'}
      </p>
    </AdminModal>
  );
}