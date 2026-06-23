'use strict';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import AdminModal from '../components/AdminModal';
import { FormField, Btn } from '../components/AdminUI';
import { C } from '../components/AdminTokens';

const Input  = ({ value, onChange, type='text', placeholder }) => (
  <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
    style={C.input} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Select = ({ value, onChange, children }) => (
  <select value={value||''} onChange={e=>onChange(e.target.value)} style={C.select}>{children}</select>
);
const Textarea = ({ value, onChange, placeholder, rows=2 }) => (
  <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows}
    style={C.textarea} onFocus={e=>e.target.style.borderColor='var(--text-primary)'} onBlur={e=>e.target.style.borderColor='var(--border)'} />
);
const Row = ({ children, cols=2 }) => <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:12 }}>{children}</div>;

export default function AddRoomModal({ open, onClose, onSuccess, lang }) {
  const isAr = lang === 'ar';
  const [form, setForm]           = useState({ name:'', nameAr:'', description:'', roomType:'text', accessType:'public', maxMembers:500, categoryId:'', freeMinutesPerWeek:60 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const upd = (k, v) => setForm(f => ({ ...f, [k]:v }));

  useEffect(() => {
    if (open) api.get('/admin/categories/chat').then(r=>setCategories(r.data.data.categories||[])).catch(()=>{});
  }, [open]);

  const submit = async () => {
    if (!form.name) { setError(isAr?'اسم الغرفة مطلوب':'Room name required'); return; }
    setLoading(true); setError('');
    try { await api.post('/admin/chat-rooms', form); onSuccess?.(); onClose(); }
    catch (e) { setError(e.response?.data?.message||'Error'); }
    setLoading(false);
  };

  return (
    <AdminModal open={open} onClose={onClose} title={isAr?'إضافة غرفة دردشة':'Add Chat Room'} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>{isAr?'إلغاء':'Cancel'}</Btn><Btn variant="primary" onClick={submit} loading={loading}>{isAr?'إنشاء':'Create'}</Btn></>}>
      {error && <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'var(--danger)', marginBottom:14 }}>⚠ {error}</div>}
      <Row><FormField label="Room Name (EN)" required><Input value={form.name} onChange={v=>upd('name',v)} placeholder="Tech Careers" /></FormField><FormField label="Room Name (AR)"><Input value={form.nameAr} onChange={v=>upd('nameAr',v)} placeholder="المهن التقنية" /></FormField></Row>
      <FormField label="Description"><Textarea value={form.description} onChange={v=>upd('description',v)} placeholder="About this room..." /></FormField>
      <Row cols={3}>
        <FormField label="Type"><Select value={form.roomType} onChange={v=>upd('roomType',v)}><option value="text">Text</option><option value="voice">Voice</option><option value="mixed">Mixed</option></Select></FormField>
        <FormField label="Access"><Select value={form.accessType} onChange={v=>upd('accessType',v)}><option value="public">Public</option><option value="private">Private</option><option value="paid">Paid</option></Select></FormField>
        <FormField label="Max Members"><Input type="number" value={form.maxMembers} onChange={v=>upd('maxMembers',Number(v))} /></FormField>
      </Row>
      <Row>
        <FormField label="Category"><Select value={form.categoryId} onChange={v=>upd('categoryId',v)}><option value="">None</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</Select></FormField>
        <FormField label="Free Minutes/Week"><Input type="number" value={form.freeMinutesPerWeek} onChange={v=>upd('freeMinutesPerWeek',Number(v))} /></FormField>
      </Row>
    </AdminModal>
  );
}