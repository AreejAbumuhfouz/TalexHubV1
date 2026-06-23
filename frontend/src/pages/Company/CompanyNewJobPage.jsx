// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import {
//   Briefcase, MapPin, DollarSign, Tag, Globe, Mail,
//   Link2, ChevronLeft, Loader2, Plus, X, CheckCircle,
//   AlertCircle, Users, FileText, Sparkles,
// } from 'lucide-react';
// import CompanyLayout from './CompanyLayout';
// import useLangStore from '../../i18n';
// import api from '../../services/api';
// import toast from 'react-hot-toast';

// /* ══════════════════════════════════════════════════════════
//    CONFIG
// ══════════════════════════════════════════════════════════ */
// const JOB_TYPES = [
//   { v:'full_time',  ar:'دوام كامل',  en:'Full-time'  },
//   { v:'part_time',  ar:'دوام جزئي',  en:'Part-time'  },
//   { v:'freelance',  ar:'فريلانس',    en:'Freelance'  },
//   { v:'internship', ar:'تدريب',      en:'Internship' },
//   { v:'remote',     ar:'عن بُعد',   en:'Remote'     },
// ];

// const EXP = [
//   { v:'any',    ar:'أي خبرة',           en:'Any experience'   },
//   { v:'entry',  ar:'مبتدئ (0-2 سنة)',    en:'Entry (0-2 yrs)'  },
//   { v:'mid',    ar:'متوسط (2-5 سنوات)',  en:'Mid (2-5 yrs)'    },
//   { v:'senior', ar:'خبير (5-10 سنوات)', en:'Senior (5-10 yrs)'},
//   { v:'lead',   ar:'قيادي (+10 سنوات)', en:'Lead (10+ yrs)'   },
// ];

// const CURRENCIES = ['USD','SAR','AED','KWD','EGP','JOD','EUR','GBP'];

// const COUNTRIES = ['Saudi Arabia','UAE','Kuwait','Qatar','Bahrain','Oman','Jordan','Egypt','Iraq','Lebanon','Morocco','Tunisia','Algeria','Libya','Palestine','Other'];

// /* ── Field wrapper ───────────────────────────────────────── */
// const Field = ({ label, required, error, hint, children }) => (
//   <div style={{ marginBottom: 18 }}>
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
//       <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
//         {label}{required && <span style={{ color: '#EF4444', marginInlineStart: 3 }}>*</span>}
//       </label>
//       {hint && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{hint}</span>}
//     </div>
//     {children}
//     {error && <p style={{ fontSize: 11.5, color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11}/> {error}</p>}
//   </div>
// );

// /* ── Input style ─────────────────────────────────────────── */
// const inp = (err) => ({
//   width: '100%', padding: '10px 13px', borderRadius: 10,
//   border: `1.5px solid ${err ? '#EF4444' : 'var(--border)'}`,
//   background: 'var(--bg-secondary)', color: 'var(--text-primary)',
//   fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
//   transition: 'border-color 0.2s', boxSizing: 'border-box',
// });

// /* ── Toggle row ──────────────────────────────────────────── */
// const Toggle = ({ label, subtitle, value, onChange }) => (
//   <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', marginBottom: 12 }} onClick={() => onChange(!value)}>
//     <div style={{ flex: 1 }}>
//       <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
//       {subtitle && <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>}
//     </div>
//     <div style={{ width: 42, height: 23, borderRadius: 12, background: value ? 'var(--text-primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
//       <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: value ? 22 : 3 }} />
//     </div>
//   </div>
// );

// /* ══════════════════════════════════════════════════════════
//    SECTION WRAPPER
// ══════════════════════════════════════════════════════════ */
// function Section({ title, icon: Icon, children }) {
//   return (
//     <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
//       <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
//         <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//           <Icon size={14} color="var(--text-secondary)" strokeWidth={1.8} />
//         </div>
//         <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
//       </div>
//       <div style={{ padding: '20px' }}>{children}</div>
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    MAIN PAGE
// ══════════════════════════════════════════════════════════ */
// export default function CompanyNewJobPage() {
//   const { lang } = useLangStore();
//   const isAr = lang === 'ar';
//   const navigate = useNavigate();

//   const [saving,     setSaving]     = useState(false);
//   const [errors,     setErrors]     = useState({});
//   const [skillInput, setSkillInput] = useState('');
//   const [form, setForm] = useState({
//     title:'', titleAr:'', description:'', descriptionAr:'',
//     requirements:'', benefits:'', jobType:'full_time', experience:'any',
//     locationCountry:'', locationCity:'', isRemote:false,
//     salaryMin:'', salaryMax:'', salaryCurrency:'USD', salaryVisible:true,
//     easyApply:true, applicationEmail:'', applicationUrl:'',
//     deadline:'', skillsRequired:[], keywords:[],
//   });

//   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

//   const addSkill = (e) => {
//     e.preventDefault();
//     const s = skillInput.trim();
//     if (!s || form.skillsRequired.includes(s)) { setSkillInput(''); return; }
//     set('skillsRequired', [...form.skillsRequired, s]);
//     setSkillInput('');
//   };

//   const validate = () => {
//     const e = {};
//     if (!form.title.trim())       e.title       = isAr ? 'العنوان مطلوب' : 'Title required';
//     if (!form.description.trim()) e.description = isAr ? 'الوصف مطلوب'  : 'Description required';
//     if (form.salaryMin && form.salaryMax && parseFloat(form.salaryMin) > parseFloat(form.salaryMax))
//       e.salaryMin = isAr ? 'الحد الأدنى أكبر من الأعلى' : 'Min > Max';
//     return e;
//   };

//   const submit = async (draft = false) => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setErrors({});
//     setSaving(true);
//     try {
//       await api.post('/jobs', {
//         ...form,
//         status:    draft ? 'draft' : undefined,
//         salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
//         salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
//         deadline:  form.deadline  || null,
//         applicationEmail: form.applicationEmail || null,
//         applicationUrl:   form.applicationUrl   || null,
//       });
//       toast.success(isAr ? (draft ? 'تم الحفظ كمسودة' : 'تم الإرسال للمراجعة') : (draft ? 'Saved as draft' : 'Submitted for review'));
//       navigate('/company/jobs');
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل الإرسال' : 'Failed'));
//     } finally { setSaving(false); }
//   };

//   const checks = [
//     { label: isAr ? 'العنوان' : 'Title',       done: !!form.title.trim() },
//     { label: isAr ? 'الوصف'  : 'Description',  done: !!form.description.trim() },
//     { label: isAr ? 'نوع الوظيفة' : 'Job Type', done: !!form.jobType },
//     { label: isAr ? 'المهارات' : 'Skills',      done: form.skillsRequired.length > 0 },
//   ];

//   return (
//     <CompanyLayout title={isAr ? 'نشر وظيفة جديدة' : 'Post a New Job'}>
//       {/* Breadcrumb */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
//         <Link to="/company/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
//           <ChevronLeft size={15} /> {isAr ? 'الوظائف' : 'Jobs'}
//         </Link>
//         <span style={{ color: 'var(--border)' }}>/</span>
//         <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'نشر وظيفة جديدة' : 'Post a New Job'}</h1>
//       </div>

//       <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 290px', gap: 14, alignItems: 'flex-start' }}>
//         {/* ── LEFT ── */}
//         <div>
//           {/* Basic */}
//           <Section title={isAr ? 'المعلومات الأساسية' : 'Basic Information'} icon={Briefcase}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//               <Field label={isAr ? 'المسمى (إنجليزي)' : 'Job Title (English)'} required error={errors.title}>
//                 <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Frontend Developer"
//                   style={inp(errors.title)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.title ? '#EF4444' : 'var(--border)'} />
//               </Field>
//               <Field label={isAr ? 'المسمى (عربي)' : 'Job Title (Arabic)'}>
//                 <input value={form.titleAr} onChange={e => set('titleAr', e.target.value)} placeholder="مثال: مطور واجهات أمامية" dir="rtl"
//                   style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//               </Field>
//             </div>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//               <Field label={isAr ? 'نوع الوظيفة' : 'Job Type'} required>
//                 <select value={form.jobType} onChange={e => set('jobType', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
//                   {JOB_TYPES.map(t => <option key={t.v} value={t.v}>{isAr ? t.ar : t.en}</option>)}
//                 </select>
//               </Field>
//               <Field label={isAr ? 'مستوى الخبرة' : 'Experience'}>
//                 <select value={form.experience} onChange={e => set('experience', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
//                   {EXP.map(t => <option key={t.v} value={t.v}>{isAr ? t.ar : t.en}</option>)}
//                 </select>
//               </Field>
//             </div>
//             <Field label={isAr ? 'وصف الوظيفة' : 'Job Description'} required error={errors.description} hint={`${form.description.length}/5000`}>
//               <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={7} maxLength={5000}
//                 placeholder={isAr ? 'اكتب وصفاً تفصيلياً للوظيفة والمسؤوليات...' : 'Describe the role, responsibilities, and what success looks like...'}
//                 style={{ ...inp(errors.description), resize: 'vertical', lineHeight: 1.7 }}
//                 onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.description ? '#EF4444' : 'var(--border)'} />
//             </Field>
//             <Field label={isAr ? 'المتطلبات' : 'Requirements'} hint={isAr ? 'اختياري' : 'Optional'}>
//               <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={4}
//                 placeholder={isAr ? 'المؤهلات والخبرات المطلوبة...' : 'Required qualifications and skills...'}
//                 style={{ ...inp(false), resize: 'vertical', lineHeight: 1.7 }}
//                 onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//             </Field>
//             <Field label={isAr ? 'المزايا والفوائد' : 'Benefits'} hint={isAr ? 'اختياري' : 'Optional'}>
//               <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)} rows={3}
//                 placeholder={isAr ? 'تأمين صحي، إجازات، عمل مرن...' : 'Health insurance, PTO, remote...'}
//                 style={{ ...inp(false), resize: 'vertical', lineHeight: 1.7 }}
//                 onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//             </Field>
//           </Section>

//           {/* Location */}
//           <Section title={isAr ? 'الموقع' : 'Location'} icon={MapPin}>
//             <Toggle label={isAr ? 'وظيفة عن بُعد' : 'Remote Position'} subtitle={isAr ? 'مفتوحة لجميع المناطق' : 'Open to all locations'} value={form.isRemote} onChange={v => set('isRemote', v)} />
//             {!form.isRemote && (
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//                 <Field label={isAr ? 'الدولة' : 'Country'}>
//                   <select value={form.locationCountry} onChange={e => set('locationCountry', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
//                     <option value="">{isAr ? 'اختر الدولة' : 'Select country'}</option>
//                     {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
//                   </select>
//                 </Field>
//                 <Field label={isAr ? 'المدينة' : 'City'}>
//                   <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)} placeholder={isAr ? 'الرياض' : 'Dubai'}
//                     style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//                 </Field>
//               </div>
//             )}
//           </Section>

//           {/* Salary */}
//           <Section title={isAr ? 'الراتب' : 'Compensation'} icon={DollarSign}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 14, marginBottom: 12 }}>
//               <Field label={isAr ? 'الحد الأدنى' : 'Minimum'} error={errors.salaryMin}>
//                 <input type="number" min="0" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="0"
//                   style={inp(errors.salaryMin)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.salaryMin ? '#EF4444' : 'var(--border)'} />
//               </Field>
//               <Field label={isAr ? 'الحد الأعلى' : 'Maximum'}>
//                 <input type="number" min="0" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="0"
//                   style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//               </Field>
//               <Field label={isAr ? 'العملة' : 'Currency'}>
//                 <select value={form.salaryCurrency} onChange={e => set('salaryCurrency', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
//                   {CURRENCIES.map(c => <option key={c}>{c}</option>)}
//                 </select>
//               </Field>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => set('salaryVisible', !form.salaryVisible)}>
//               <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${form.salaryVisible ? 'var(--text-primary)' : 'var(--border)'}`, background: form.salaryVisible ? 'var(--text-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//                 {form.salaryVisible && <CheckCircle size={11} color="var(--bg-primary)" />}
//               </div>
//               <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{isAr ? 'إظهار الراتب للمتقدمين' : 'Show salary to applicants'}</span>
//             </div>
//           </Section>

//           {/* Skills */}
//           <Section title={isAr ? 'المهارات المطلوبة' : 'Required Skills'} icon={Tag}>
//             <form onSubmit={addSkill} style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
//               <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder={isAr ? 'مثال: React, Python, SQL...' : 'e.g. React, Python, SQL...'}
//                 style={{ ...inp(false), flex: 1 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//               <button type="submit" style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
//                 <Plus size={14} /> {isAr ? 'أضف' : 'Add'}
//               </button>
//             </form>
//             {form.skillsRequired.length > 0
//               ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
//                   {form.skillsRequired.map(s => (
//                     <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
//                       {s}
//                       <button onClick={() => set('skillsRequired', form.skillsRequired.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex' }}><X size={11} /></button>
//                     </span>
//                   ))}
//                 </div>
//               : <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
//                   {isAr ? 'لم تُضف مهارات — المهارات تحسّن مطابقة المرشحين بالذكاء الاصطناعي' : 'No skills yet — skills improve AI candidate matching'}
//                 </p>
//             }
//           </Section>

//           {/* Apply settings */}
//           <Section title={isAr ? 'إعدادات التقديم' : 'Application Settings'} icon={Users}>
//             <Toggle label={isAr ? 'التقديم السريع (Easy Apply)' : 'Easy Apply'} subtitle={isAr ? 'المتقدمون يتقدمون مباشرة من TalexHub' : 'Candidates apply directly on TalexHub'} value={form.easyApply} onChange={v => set('easyApply', v)} />
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
//               <Field label={isAr ? 'بريد الاستقبال' : 'Application Email'} hint={isAr ? 'اختياري' : 'Optional'}>
//                 <div style={{ position: 'relative' }}>
//                   <Mail size={13} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                   <input type="email" value={form.applicationEmail} onChange={e => set('applicationEmail', e.target.value)} placeholder="hr@company.com"
//                     style={{ ...inp(false), paddingInlineStart: 35 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//                 </div>
//               </Field>
//               <Field label={isAr ? 'رابط التقديم الخارجي' : 'External Apply URL'} hint={isAr ? 'اختياري' : 'Optional'}>
//                 <div style={{ position: 'relative' }}>
//                   <Link2 size={13} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)' }} />
//                   <input type="url" value={form.applicationUrl} onChange={e => set('applicationUrl', e.target.value)} placeholder="https://..."
//                     style={{ ...inp(false), paddingInlineStart: 35 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//                 </div>
//               </Field>
//             </div>
//             <Field label={isAr ? 'تاريخ انتهاء التقديم' : 'Application Deadline'} hint={isAr ? 'اختياري' : 'Optional'}>
//               <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]}
//                 style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
//             </Field>
//           </Section>
//         </div>

//         {/* ── RIGHT sticky panel ── */}
//         <div style={{ position: 'sticky', top: 20 }}>
//           <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
//             <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'نشر الوظيفة' : 'Publish Job'}</h3>

//             {/* AI note */}
//             <div style={{ padding: '10px 13px', borderRadius: 11, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: 8 }}>
//               <Sparkles size={14} color="#8B5CF6" style={{ flexShrink: 0, marginTop: 1 }} />
//               <p style={{ fontSize: 12, color: '#8B5CF6', margin: 0, lineHeight: 1.5 }}>
//                 {isAr ? 'AI TalexHub سيطابق وظيفتك مع أفضل المرشحين تلقائياً' : 'TalexHub AI will automatically match your job to the best candidates'}
//               </p>
//             </div>

//             {/* Checklist */}
//             <div style={{ padding: '12px 14px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 7 }}>
//               {checks.map((c, i) => (
//                 <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                   {c.done
//                     ? <CheckCircle size={14} color="#22C55E" />
//                     : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--border)' }} />
//                   }
//                   <span style={{ fontSize: 12.5, color: c.done ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: c.done ? 600 : 400 }}>{c.label}</span>
//                 </div>
//               ))}
//             </div>

//             <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
//               {isAr ? 'بعد الإرسال ستخضع للمراجعة قبل النشر (24 ساعة عادةً).' : 'After submission, your job will be reviewed before going live (usually 24h).'}
//             </p>

//             <button onClick={() => submit(false)} disabled={saving}
//               style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
//               {saving ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> {isAr ? 'جارٍ الإرسال...' : 'Submitting...'}</> : (isAr ? '🚀 إرسال للمراجعة' : '🚀 Submit for Review')}
//             </button>

//             <button onClick={() => submit(true)} disabled={saving}
//               style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
//               {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
//             </button>
//           </div>
//         </div>
//       </div>

//       <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
//     </CompanyLayout>
//   );
// }


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, DollarSign, Tag, Globe, Mail,
  Link2, ChevronLeft, Loader2, Plus, X, CheckCircle,
  AlertCircle, Users, FileText, Sparkles,
} from 'lucide-react';
import CompanyLayout, { useCompany } from './CompanyLayout';
import useLangStore from '../../i18n';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ══════════════════════════════════════════════════════════
   CONFIG
══════════════════════════════════════════════════════════ */
const JOB_TYPES = [
  { v:'full_time',  ar:'دوام كامل',  en:'Full-time'  },
  { v:'part_time',  ar:'دوام جزئي',  en:'Part-time'  },
  { v:'freelance',  ar:'فريلانس',    en:'Freelance'  },
  { v:'internship', ar:'تدريب',      en:'Internship' },
  { v:'remote',     ar:'عن بُعد',   en:'Remote'     },
];

const EXP = [
  { v:'any',    ar:'أي خبرة',           en:'Any experience'   },
  { v:'entry',  ar:'مبتدئ (0-2 سنة)',    en:'Entry (0-2 yrs)'  },
  { v:'mid',    ar:'متوسط (2-5 سنوات)',  en:'Mid (2-5 yrs)'    },
  { v:'senior', ar:'خبير (5-10 سنوات)', en:'Senior (5-10 yrs)'},
  { v:'lead',   ar:'قيادي (+10 سنوات)', en:'Lead (10+ yrs)'   },
];

const CURRENCIES = ['USD','SAR','AED','KWD','EGP','JOD','EUR','GBP'];

const COUNTRIES = ['Saudi Arabia','UAE','Kuwait','Qatar','Bahrain','Oman','Jordan','Egypt','Iraq','Lebanon','Morocco','Tunisia','Algeria','Libya','Palestine','Other'];

/* ── Field wrapper ───────────────────────────────────────── */
const Field = ({ label, required, error, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
        {label}{required && <span style={{ color: '#EF4444', marginInlineStart: 3 }}>*</span>}
      </label>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{hint}</span>}
    </div>
    {children}
    {error && <p style={{ fontSize: 11.5, color: '#EF4444', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={11}/> {error}</p>}
  </div>
);

/* ── Input style ─────────────────────────────────────────── */
const inp = (err) => ({
  width: '100%', padding: '10px 13px', borderRadius: 10,
  border: `1.5px solid ${err ? '#EF4444' : 'var(--border)'}`,
  background: 'var(--bg-secondary)', color: 'var(--text-primary)',
  fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.2s', boxSizing: 'border-box',
});

/* ── Toggle row ──────────────────────────────────────────── */
const Toggle = ({ label, subtitle, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 15px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', marginBottom: 12 }} onClick={() => onChange(!value)}>
    <div style={{ flex: 1 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
      {subtitle && <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>}
    </div>
    <div style={{ width: 42, height: 23, borderRadius: 12, background: value ? 'var(--text-primary)' : 'var(--border)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ width: 17, height: 17, borderRadius: '50%', background: 'white', position: 'absolute', top: 3, transition: 'left 0.2s', left: value ? 22 : 3 }} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   SECTION WRAPPER
══════════════════════════════════════════════════════════ */
function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color="var(--text-secondary)" strokeWidth={1.8} />
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '20px' }}>{children}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanyNewJobPage() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';
  const navigate = useNavigate();

  const [saving,     setSaving]     = useState(false);
  const [errors,     setErrors]     = useState({});
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title:'', titleAr:'', description:'', descriptionAr:'',
    requirements:'', benefits:'', jobType:'full_time', experience:'any',
    locationCountry:'', locationCity:'', isRemote:false,
    salaryMin:'', salaryMax:'', salaryCurrency:'USD', salaryVisible:true,
    easyApply:true, applicationEmail:'', applicationUrl:'',
    deadline:'', skillsRequired:[], keywords:[],
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim();
    if (!s || form.skillsRequired.includes(s)) { setSkillInput(''); return; }
    set('skillsRequired', [...form.skillsRequired, s]);
    setSkillInput('');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = isAr ? 'العنوان مطلوب' : 'Title required';
    if (!form.description.trim()) e.description = isAr ? 'الوصف مطلوب'  : 'Description required';
    if (form.salaryMin && form.salaryMax && parseFloat(form.salaryMin) > parseFloat(form.salaryMax))
      e.salaryMin = isAr ? 'الحد الأدنى أكبر من الأعلى' : 'Min > Max';
    return e;
  };

  const submit = async (draft = false) => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setSaving(true);
    try {
      await api.post('/jobs', {
        ...form,
        status:    draft ? 'draft' : undefined,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : null,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : null,
        deadline:  form.deadline  || null,
        applicationEmail: form.applicationEmail || null,
        applicationUrl:   form.applicationUrl   || null,
      });
      toast.success(isAr ? (draft ? 'تم الحفظ كمسودة' : 'تم الإرسال للمراجعة') : (draft ? 'Saved as draft' : 'Submitted for review'));
      navigate('/company/jobs');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الإرسال' : 'Failed'));
    } finally { setSaving(false); }
  };

  const checks = [
    { label: isAr ? 'العنوان' : 'Title',       done: !!form.title.trim() },
    { label: isAr ? 'الوصف'  : 'Description',  done: !!form.description.trim() },
    { label: isAr ? 'نوع الوظيفة' : 'Job Type', done: !!form.jobType },
    { label: isAr ? 'المهارات' : 'Skills',      done: form.skillsRequired.length > 0 },
  ];

  // Lock if not active
  if (company && company.status !== 'active') {
    return (
      <CompanyLayout>
        <div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
            {_isAr ? 'غير متاح حالياً' : 'Not Available Yet'}
          </h2>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            {_isAr
              ? 'لا يمكنك نشر وظائف حتى تتم الموافقة على حسابك. ارفع شهادة التسجيل من ملف الشركة.'
              : 'You cannot post jobs until your account is approved. Upload your registration certificate from Company Profile.'}
          </p>
          <a href="/company/profile" style={{
            display: 'inline-block', padding: '12px 28px', borderRadius: 10,
            background: 'var(--text-primary)', color: 'var(--bg-primary)',
            textDecoration: 'none', fontSize: 14, fontWeight: 700,
          }}>
            {_isAr ? 'اذهب لملف الشركة ←' : 'Go to Company Profile →'}
          </a>
        </div>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout title={isAr ? 'نشر وظيفة جديدة' : 'Post a New Job'}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
        <Link to="/company/jobs" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 600 }}>
          <ChevronLeft size={15} /> {isAr ? 'الوظائف' : 'Jobs'}
        </Link>
        <span style={{ color: 'var(--border)' }}>/</span>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'نشر وظيفة جديدة' : 'Post a New Job'}</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 290px', gap: 14, alignItems: 'flex-start' }}>
        {/* ── LEFT ── */}
        <div>
          {/* Basic */}
          <Section title={isAr ? 'المعلومات الأساسية' : 'Basic Information'} icon={Briefcase}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={isAr ? 'المسمى (إنجليزي)' : 'Job Title (English)'} required error={errors.title}>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Senior Frontend Developer"
                  style={inp(errors.title)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.title ? '#EF4444' : 'var(--border)'} />
              </Field>
              <Field label={isAr ? 'المسمى (عربي)' : 'Job Title (Arabic)'}>
                <input value={form.titleAr} onChange={e => set('titleAr', e.target.value)} placeholder="مثال: مطور واجهات أمامية" dir="rtl"
                  style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </Field>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={isAr ? 'نوع الوظيفة' : 'Job Type'} required>
                <select value={form.jobType} onChange={e => set('jobType', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                  {JOB_TYPES.map(t => <option key={t.v} value={t.v}>{isAr ? t.ar : t.en}</option>)}
                </select>
              </Field>
              <Field label={isAr ? 'مستوى الخبرة' : 'Experience'}>
                <select value={form.experience} onChange={e => set('experience', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                  {EXP.map(t => <option key={t.v} value={t.v}>{isAr ? t.ar : t.en}</option>)}
                </select>
              </Field>
            </div>
            <Field label={isAr ? 'وصف الوظيفة' : 'Job Description'} required error={errors.description} hint={`${form.description.length}/5000`}>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={7} maxLength={5000}
                placeholder={isAr ? 'اكتب وصفاً تفصيلياً للوظيفة والمسؤوليات...' : 'Describe the role, responsibilities, and what success looks like...'}
                style={{ ...inp(errors.description), resize: 'vertical', lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.description ? '#EF4444' : 'var(--border)'} />
            </Field>
            <Field label={isAr ? 'المتطلبات' : 'Requirements'} hint={isAr ? 'اختياري' : 'Optional'}>
              <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={4}
                placeholder={isAr ? 'المؤهلات والخبرات المطلوبة...' : 'Required qualifications and skills...'}
                style={{ ...inp(false), resize: 'vertical', lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
            <Field label={isAr ? 'المزايا والفوائد' : 'Benefits'} hint={isAr ? 'اختياري' : 'Optional'}>
              <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)} rows={3}
                placeholder={isAr ? 'تأمين صحي، إجازات، عمل مرن...' : 'Health insurance, PTO, remote...'}
                style={{ ...inp(false), resize: 'vertical', lineHeight: 1.7 }}
                onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
          </Section>

          {/* Location */}
          <Section title={isAr ? 'الموقع' : 'Location'} icon={MapPin}>
            <Toggle label={isAr ? 'وظيفة عن بُعد' : 'Remote Position'} subtitle={isAr ? 'مفتوحة لجميع المناطق' : 'Open to all locations'} value={form.isRemote} onChange={v => set('isRemote', v)} />
            {!form.isRemote && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <Field label={isAr ? 'الدولة' : 'Country'}>
                  <select value={form.locationCountry} onChange={e => set('locationCountry', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                    <option value="">{isAr ? 'اختر الدولة' : 'Select country'}</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label={isAr ? 'المدينة' : 'City'}>
                  <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)} placeholder={isAr ? 'الرياض' : 'Dubai'}
                    style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </Field>
              </div>
            )}
          </Section>

          {/* Salary */}
          <Section title={isAr ? 'الراتب' : 'Compensation'} icon={DollarSign}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px', gap: 14, marginBottom: 12 }}>
              <Field label={isAr ? 'الحد الأدنى' : 'Minimum'} error={errors.salaryMin}>
                <input type="number" min="0" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="0"
                  style={inp(errors.salaryMin)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = errors.salaryMin ? '#EF4444' : 'var(--border)'} />
              </Field>
              <Field label={isAr ? 'الحد الأعلى' : 'Maximum'}>
                <input type="number" min="0" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="0"
                  style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              </Field>
              <Field label={isAr ? 'العملة' : 'Currency'}>
                <select value={form.salaryCurrency} onChange={e => set('salaryCurrency', e.target.value)} style={{ ...inp(false), cursor: 'pointer' }}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => set('salaryVisible', !form.salaryVisible)}>
              <div style={{ width: 17, height: 17, borderRadius: 4, border: `2px solid ${form.salaryVisible ? 'var(--text-primary)' : 'var(--border)'}`, background: form.salaryVisible ? 'var(--text-primary)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.salaryVisible && <CheckCircle size={11} color="var(--bg-primary)" />}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{isAr ? 'إظهار الراتب للمتقدمين' : 'Show salary to applicants'}</span>
            </div>
          </Section>

          {/* Skills */}
          <Section title={isAr ? 'المهارات المطلوبة' : 'Required Skills'} icon={Tag}>
            <form onSubmit={addSkill} style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder={isAr ? 'مثال: React, Python, SQL...' : 'e.g. React, Python, SQL...'}
                style={{ ...inp(false), flex: 1 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
              <button type="submit" style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                <Plus size={14} /> {isAr ? 'أضف' : 'Add'}
              </button>
            </form>
            {form.skillsRequired.length > 0
              ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                  {form.skillsRequired.map(s => (
                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 99, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {s}
                      <button onClick={() => set('skillsRequired', form.skillsRequired.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex' }}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              : <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'لم تُضف مهارات — المهارات تحسّن مطابقة المرشحين بالذكاء الاصطناعي' : 'No skills yet — skills improve AI candidate matching'}
                </p>
            }
          </Section>

          {/* Apply settings */}
          <Section title={isAr ? 'إعدادات التقديم' : 'Application Settings'} icon={Users}>
            <Toggle label={isAr ? 'التقديم السريع (Easy Apply)' : 'Easy Apply'} subtitle={isAr ? 'المتقدمون يتقدمون مباشرة من TalexHub' : 'Candidates apply directly on TalexHub'} value={form.easyApply} onChange={v => set('easyApply', v)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label={isAr ? 'بريد الاستقبال' : 'Application Email'} hint={isAr ? 'اختياري' : 'Optional'}>
                <div style={{ position: 'relative' }}>
                  <Mail size={13} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="email" value={form.applicationEmail} onChange={e => set('applicationEmail', e.target.value)} placeholder="hr@company.com"
                    style={{ ...inp(false), paddingInlineStart: 35 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </Field>
              <Field label={isAr ? 'رابط التقديم الخارجي' : 'External Apply URL'} hint={isAr ? 'اختياري' : 'Optional'}>
                <div style={{ position: 'relative' }}>
                  <Link2 size={13} color="var(--text-secondary)" style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input type="url" value={form.applicationUrl} onChange={e => set('applicationUrl', e.target.value)} placeholder="https://..."
                    style={{ ...inp(false), paddingInlineStart: 35 }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
                </div>
              </Field>
            </div>
            <Field label={isAr ? 'تاريخ انتهاء التقديم' : 'Application Deadline'} hint={isAr ? 'اختياري' : 'Optional'}>
              <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]}
                style={inp(false)} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </Field>
          </Section>
        </div>

        {/* ── RIGHT sticky panel ── */}
        <div style={{ position: 'sticky', top: 20 }}>
          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{isAr ? 'نشر الوظيفة' : 'Publish Job'}</h3>

            {/* AI note */}
            <div style={{ padding: '10px 13px', borderRadius: 11, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', gap: 8 }}>
              <Sparkles size={14} color="#8B5CF6" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: '#8B5CF6', margin: 0, lineHeight: 1.5 }}>
                {isAr ? 'AI TalexHub سيطابق وظيفتك مع أفضل المرشحين تلقائياً' : 'TalexHub AI will automatically match your job to the best candidates'}
              </p>
            </div>

            {/* Checklist */}
            <div style={{ padding: '12px 14px', borderRadius: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {c.done
                    ? <CheckCircle size={14} color="#22C55E" />
                    : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1.5px solid var(--border)' }} />
                  }
                  <span style={{ fontSize: 12.5, color: c.done ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: c.done ? 600 : 400 }}>{c.label}</span>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
              {isAr ? 'بعد الإرسال ستخضع للمراجعة قبل النشر (24 ساعة عادةً).' : 'After submission, your job will be reviewed before going live (usually 24h).'}
            </p>

            <button onClick={() => submit(false)} disabled={saving}
              style={{ width: '100%', padding: '13px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 14, fontWeight: 800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {saving ? <><Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> {isAr ? 'جارٍ الإرسال...' : 'Submitting...'}</> : (isAr ? '🚀 إرسال للمراجعة' : '🚀 Submit for Review')}
            </button>

            <button onClick={() => submit(true)} disabled={saving}
              style={{ width: '100%', padding: '10px', borderRadius: 12, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {isAr ? 'حفظ كمسودة' : 'Save as Draft'}
            </button>
          </div>
        </div>
      </div>

      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </CompanyLayout>
  );
}