// // // import { useState, useEffect, useRef, useCallback } from 'react';
// // // import { Camera, Save, Globe, Mail, Phone, MapPin, Building2, Loader2 } from 'lucide-react';
// // // import CompanyLayout from './CompanyLayout';
// // // import useLangStore from '../../i18n';
// // // import useAuthStore from '../../store/authStore';
// // // import api from '../../services/api';
// // // import toast from 'react-hot-toast';

// // // const INDUSTRIES = [
// // //   'Information Technology', 'Telecommunications', 'Education', 'Healthcare',
// // //   'Finance & Business', 'Manufacturing', 'Construction & Real Estate',
// // //   'Retail', 'Hospitality & Tourism', 'Media & Communications', 'Other',
// // // ];
// // // const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

// // // /* ── Preset avatars (same as user profile) ───────────────── */
// // // function AvatarPicker({ current, onSelect, isAr }) {
// // //   const [presets, setPresets] = useState([]);
// // //   const [loading, setLoading] = useState(false);
// // //   const [tab, setTab]         = useState('preset'); // preset | upload

// // //   useEffect(() => {
// // //     api.get('/users/presets/avatars')
// // //       .then(({ data }) => setPresets(data.data?.avatars || []))
// // //       .catch(() => {});
// // //   }, []);

// // //   return (
// // //     <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
// // //       {/* Tabs */}
// // //       <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 10, padding: 4, width: 'fit-content', border: '1px solid var(--border)' }}>
// // //         {[
// // //           { key: 'preset', ar: 'اختيار صورة', en: 'Choose Avatar' },
// // //           { key: 'upload', ar: 'رفع صورة',    en: 'Upload Logo'  },
// // //         ].map(t => (
// // //           <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '6px 14px', borderRadius: 7, border: 'none', fontSize: 12.5, fontWeight: tab === t.key ? 700 : 500, background: tab === t.key ? 'var(--bg-primary)' : 'transparent', color: tab === t.key ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
// // //             {isAr ? t.ar : t.en}
// // //           </button>
// // //         ))}
// // //       </div>

// // //       {/* Preset grid */}
// // //       {tab === 'preset' && (
// // //         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(52px,1fr))', gap: 10 }}>
// // //           {presets.length === 0
// // //             ? <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', gridColumn: '1/-1', margin: 0 }}>{isAr ? 'لا توجد صور متاحة' : 'No presets available'}</p>
// // //             : presets.map((p, i) => (
// // //               <button key={i} onClick={() => onSelect(p.url || p)} style={{ padding: 2, borderRadius: '50%', border: `2.5px solid ${current === (p.url || p) ? 'var(--text-primary)' : 'transparent'}`, cursor: 'pointer', background: 'none', transition: 'border-color 0.15s' }}>
// // //                 <img src={p.url || p} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
// // //               </button>
// // //             ))
// // //           }
// // //         </div>
// // //       )}

// // //       {/* Upload */}
// // //       {tab === 'upload' && <UploadTab onUploaded={onSelect} isAr={isAr} />}
// // //     </div>
// // //   );
// // // }

// // // function UploadTab({ onUploaded, isAr }) {
// // //   const fileRef = useRef();
// // //   const [uploading, setUploading] = useState(false);
// // //   const [drag, setDrag] = useState(false);

// // //   const handleFile = async (file) => {
// // //     if (!file) return;
// // //     if (!/image\/(jpeg|jpg|png|webp)/.test(file.type)) { toast.error(isAr ? 'صور JPEG/PNG فقط' : 'JPEG/PNG only'); return; }
// // //     if (file.size > 5 * 1024 * 1024) { toast.error(isAr ? 'الحد الأقصى 5MB' : 'Max 5MB'); return; }
// // //     setUploading(true);
// // //     try {
// // //       const fd = new FormData();
// // //       fd.append('avatar', file);
// // //       const { data } = await api.post('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
// // //       onUploaded(data.data?.avatarUrl);
// // //       toast.success(isAr ? 'تم رفع الصورة ✓' : 'Uploaded ✓');
// // //     } catch { toast.error(isAr ? 'فشل الرفع' : 'Upload failed'); }
// // //     finally { setUploading(false); }
// // //   };

// // //   return (
// // //     <div onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}
// // //       onClick={() => fileRef.current?.click()}
// // //       style={{ border: `2px dashed ${drag ? 'var(--text-primary)' : 'var(--border)'}`, borderRadius: 12, padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: drag ? 'var(--bg-secondary)' : 'transparent' }}>
// // //       <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
// // //       {uploading
// // //         ? <Loader2 size={24} color="var(--text-secondary)" style={{ animation: 'spin .8s linear infinite', margin: '0 auto 8px' }} />
// // //         : <Camera size={24} color="var(--text-secondary)" style={{ opacity: 0.4, margin: '0 auto 8px' }} />}
// // //       <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
// // //         {uploading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'اسحب أو اضغط للرفع · JPEG/PNG · 5MB' : 'Drop or click to upload · JPEG/PNG · 5MB')}
// // //       </p>
// // //     </div>
// // //   );
// // // }

// // // /* ── Input helpers ───────────────────────────────────────── */
// // // const inp = {
// // //   width: '100%', padding: '10px 13px', borderRadius: 10,
// // //   border: '1px solid var(--border)', background: 'var(--bg-secondary)',
// // //   color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
// // //   fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s',
// // // };

// // // function Field({ label, icon: Icon, children }) {
// // //   return (
// // //     <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
// // //       <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
// // //         {Icon && <Icon size={11} />} {label}
// // //       </label>
// // //       {children}
// // //     </div>
// // //   );
// // // }

// // // /* ══════════════════════════════════════════════════════════
// // //    MAIN PAGE
// // // ══════════════════════════════════════════════════════════ */
// // // export default function CompanyProfilePage() {
// // //   const { lang }          = useLangStore();
// // //   const isAr              = lang === 'ar';
// // //   const { user, updateUser } = useAuthStore();

// // //   const [company,  setCompany]  = useState(null);
// // //   const [loading,  setLoading]  = useState(true);
// // //   const [saving,   setSaving]   = useState(false);
// // //   const [form,     setForm]     = useState({});
// // //   const [avatarSrc,setAvatarSrc]= useState(null);
// // //   const [showPicker,setShowPicker]= useState(false);

// // //   const fetch = useCallback(async () => {
// // //     try {
// // //       const { data } = await api.get('/companies/me/stats');
// // //       const c = data.data.company;
// // //       setCompany(c);
// // //       setAvatarSrc(c.logoUrl || null);
// // //       setForm({
// // //         name:            c.name            || '',
// // //         industry:        c.industry        || '',
// // //         companySize:     c.companySize     || '',
// // //         website:         c.website         || '',
// // //         emailDomain:     c.emailDomain     || '',
// // //         description:     c.description     || '',
// // //         locationCountry: c.locationCountry || '',
// // //         locationCity:    c.locationCity    || '',
// // //         foundedYear:     c.foundedYear     || '',
// // //       });
// // //     } catch { toast.error(isAr ? 'فشل تحميل البيانات' : 'Failed to load'); }
// // //     finally   { setLoading(false); }
// // //   }, [isAr]);

// // //   useEffect(() => { fetch(); }, [fetch]);

// // //   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

// // //   const handleAvatarSelect = async (url) => {
// // //     setAvatarSrc(url);
// // //     setShowPicker(false);
// // //     // Update company logo via /users/me/avatar (already updates user avatarUrl)
// // //     // also update company logoUrl
// // //     try {
// // //       if (company) await api.patch(`/companies/${company.id}`, {});
// // //       updateUser({ avatarUrl: url });
// // //     } catch {}
// // //   };

// // //   const handleSave = async () => {
// // //     if (!form.name) return toast.error(isAr ? 'اسم الشركة مطلوب' : 'Company name required');
// // //     setSaving(true);
// // //     try {
// // //       await api.patch(`/companies/${company.id}`, form);
// // //       toast.success(isAr ? 'تم حفظ التغييرات ✓' : 'Saved ✓');
// // //     } catch (err) {
// // //       toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
// // //     } finally { setSaving(false); }
// // //   };

// // //   if (loading) return (
// // //     <CompanyLayout title={isAr ? 'ملف الشركة' : 'Company Profile'}>
// // //       <div style={{ display: 'grid', gap: 14 }}>
// // //         {[140, 280, 200].map((h, i) => <div key={i} style={{ height: h, borderRadius: 16, background: 'var(--bg-primary)', border: '1px solid var(--border)', animation: 'cpPulse 1.5s infinite' }} />)}
// // //       </div>
// // //       <style>{'@keyframes cpPulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes spin{to{transform:rotate(360deg)}}'}</style>
// // //     </CompanyLayout>
// // //   );

// // //   return (
// // //     <CompanyLayout title={isAr ? 'ملف الشركة' : 'Company Profile'}>
// // //       <style>{'@keyframes cpPulse{0%,100%{opacity:1}50%{opacity:.4}} @keyframes spin{to{transform:rotate(360deg)}}'}</style>

// // //       <div style={{ maxWidth: 720, display: 'grid', gap: 18 }}>

// // //         {/* ── Avatar / Logo section ── */}
// // //         <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '22px 24px' }}>
// // //           <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
// // //             <Camera size={14} color="var(--text-secondary)" /> {isAr ? 'صورة / شعار الشركة' : 'Company Logo / Avatar'}
// // //           </h2>

// // //           <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: showPicker ? 20 : 0 }}>
// // //             {/* Avatar preview */}
// // //             <div style={{ position: 'relative', flexShrink: 0 }}>
// // //               <div style={{ width: 80, height: 80, borderRadius: '50%', border: '2px solid var(--border)', background: 'var(--bg-secondary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
// // //                 {avatarSrc
// // //                   ? <img src={avatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// // //                   : <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>{company?.name?.[0]?.toUpperCase() || 'C'}</span>}
// // //               </div>
// // //               <button onClick={() => setShowPicker(p => !p)} style={{ position: 'absolute', bottom: -4, insetInlineEnd: -4, width: 28, height: 28, borderRadius: '50%', background: 'var(--text-primary)', border: '2px solid var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
// // //                 <Camera size={13} color="var(--bg-primary)" />
// // //               </button>
// // //             </div>
// // //             <div>
// // //               <p style={{ fontSize: 13.5, fontWeight: 700, margin: '0 0 4px' }}>{company?.name}</p>
// // //               <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 10px' }}>{company?.industry || (isAr ? 'لا يوجد قطاع' : 'No industry set')}</p>
// // //               <button onClick={() => setShowPicker(p => !p)} style={{ padding: '7px 16px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-secondary)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-primary)', transition: 'border-color 0.2s' }}
// // //                 onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
// // //                 onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
// // //                 {isAr ? (showPicker ? 'إغلاق' : 'تغيير الصورة') : (showPicker ? 'Close' : 'Change image')}
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Picker */}
// // //           {showPicker && (
// // //             <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
// // //               <AvatarPicker current={avatarSrc} onSelect={handleAvatarSelect} isAr={isAr} />
// // //             </div>
// // //           )}
// // //         </div>

// // //         {/* ── Company info ── */}
// // //         <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '22px 24px' }}>
// // //           <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
// // //             <Building2 size={14} color="var(--text-secondary)" /> {isAr ? 'معلومات الشركة' : 'Company Info'}
// // //           </h2>
// // //           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16 }}>
// // //             <Field label={isAr ? 'اسم الشركة' : 'Company name'}>
// // //               <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} placeholder={isAr ? 'اسم الشركة...' : 'Company name...'} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //             <Field label={isAr ? 'القطاع' : 'Industry'} icon={Building2}>
// // //               <select value={form.industry} onChange={e => set('industry', e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
// // //                 <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
// // //                 {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
// // //               </select>
// // //             </Field>
// // //             <Field label={isAr ? 'حجم الشركة' : 'Size'}>
// // //               <select value={form.companySize} onChange={e => set('companySize', e.target.value)} style={{ ...inp, cursor: 'pointer' }} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'}>
// // //                 <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
// // //                 {SIZES.map(s => <option key={s} value={s}>{s} {isAr ? 'موظف' : 'employees'}</option>)}
// // //               </select>
// // //             </Field>
// // //             <Field label={isAr ? 'سنة التأسيس' : 'Founded year'}>
// // //               <input type="number" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)} style={inp} placeholder="2020" min="1900" max={new Date().getFullYear()} dir="ltr" onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //           </div>
// // //           <div style={{ marginTop: 16 }}>
// // //             <Field label={isAr ? 'وصف الشركة' : 'Description'}>
// // //               <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.7 }} placeholder={isAr ? 'اكتب نبذة عن شركتك...' : 'Tell candidates about your company...'} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //           </div>
// // //         </div>

// // //         {/* ── Contact & Location ── */}
// // //         <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', padding: '22px 24px' }}>
// // //           <h2 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: 7 }}>
// // //             <MapPin size={14} color="var(--text-secondary)" /> {isAr ? 'التواصل والموقع' : 'Contact & Location'}
// // //           </h2>
// // //           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
// // //             <Field label={isAr ? 'الموقع الإلكتروني' : 'Website'} icon={Globe}>
// // //               <input value={form.website} onChange={e => set('website', e.target.value)} style={inp} placeholder="https://company.com" type="url" onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //             <Field label={isAr ? 'نطاق البريد' : 'Email domain'} icon={Mail}>
// // //               <input value={form.emailDomain} onChange={e => set('emailDomain', e.target.value)} style={inp} placeholder="company.com" dir="ltr" onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //             <Field label={isAr ? 'الدولة' : 'Country'} icon={Globe}>
// // //               <input value={form.locationCountry} onChange={e => set('locationCountry', e.target.value)} style={inp} placeholder={isAr ? 'السعودية...' : 'Saudi Arabia...'} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //             <Field label={isAr ? 'المدينة' : 'City'} icon={MapPin}>
// // //               <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)} style={inp} placeholder={isAr ? 'الرياض...' : 'Riyadh...'} onFocus={e => e.target.style.borderColor = 'var(--text-primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
// // //             </Field>
// // //           </div>
// // //         </div>

// // //         {/* ── Save ── */}
// // //         <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
// // //           <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 12, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s' }}>
// // //             {saving ? <Loader2 size={15} style={{ animation: 'spin .8s linear infinite' }} /> : <Save size={15} />}
// // //             {saving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التغييرات' : 'Save Changes')}
// // //           </button>
// // //         </div>
// // //       </div>
// // //     </CompanyLayout>
// // //   );
// // // }
// // // frontend/src/pages/Company/CompanyProfilePage.jsx

// // import { useState, useEffect, useRef } from 'react';
// // import {
// //   Camera, Save, Building2, Loader2,
// //   Upload, FileCheck, Clock, XCircle, CheckCircle, AlertCircle,
// // } from 'lucide-react';
// // import CompanyLayout, { useCompany } from './CompanyLayout';
// // import useLangStore from '../../i18n';
// // import api from '../../services/api';
// // import toast from 'react-hot-toast';

// // const INDUSTRIES = [
// //   'Information Technology','Telecommunications','Education','Healthcare',
// //   'Finance & Business','Manufacturing','Construction & Real Estate',
// //   'Retail','Hospitality & Tourism','Media & Communications','Other',
// // ];
// // const SIZES = ['1-10','11-50','51-200','201-500','500+'];

// // /* ── Field ───────────────────────────────────────────────── */
// // function Field({ label, error, children, required }) {
// //   return (
// //     <div style={{ marginBottom: 14 }}>
// //       <div style={{
// //         background: 'var(--bg-secondary)',
// //         border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
// //         borderRadius: 10, overflow: 'hidden',
// //         transition: 'border-color 0.2s, background 0.2s',
// //       }}
// //         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
// //         onBlurCapture={e  => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
// //       >
// //         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>
// //           {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
// //         </span>
// //         {children}
// //       </div>
// //       {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>⚠ {error}</p>}
// //     </div>
// //   );
// // }

// // const inp = {
// //   display: 'block', width: '100%', padding: '2px 14px 9px',
// //   background: 'transparent', border: 'none', outline: 'none',
// //   fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'inherit',
// //   boxSizing: 'border-box',
// // };

// // /* ── Certificate Section ─────────────────────────────────── */
// // function CertificateSection({ company, isAr, onSuccess }) {
// //   const [file,    setFile]    = useState(null);
// //   const [preview, setPreview] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const fileRef = useRef();

// //   const status = company?.status;

// //   const statusInfo = {
// //     pending_documents: {
// //       icon: <Upload size={16} color="#F59E0B" />,
// //       color: '#F59E0B',
// //       bg: 'rgba(245,158,11,0.08)',
// //       border: 'rgba(245,158,11,0.25)',
// //       label: isAr ? 'مطلوب: رفع شهادة التسجيل' : 'Required: Upload Registration Certificate',
// //       desc: isAr
// //         ? 'ارفع شهادة تسجيل شركتك (PDF أو صورة) لإرسالها للمراجعة وتفعيل حسابك.'
// //         : 'Upload your company registration certificate (PDF or image) to submit for review and activate your account.',
// //     },
// //     pending_review: {
// //       icon: <Clock size={16} color="#3B82F6" />,
// //       color: '#3B82F6',
// //       bg: 'rgba(59,130,246,0.08)',
// //       border: 'rgba(59,130,246,0.25)',
// //       label: isAr ? 'الشهادة قيد المراجعة' : 'Certificate Under Review',
// //       desc: isAr
// //         ? 'تم استلام شهادتك وجاري مراجعتها. يمكنك رفع شهادة جديدة لو أردت تحديثها.'
// //         : 'Your certificate has been received and is under review. You can upload a new one to replace it.',
// //     },
// //     active: {
// //       icon: <CheckCircle size={16} color="#22C55E" />,
// //       color: '#22C55E',
// //       bg: 'rgba(34,197,94,0.08)',
// //       border: 'rgba(34,197,94,0.25)',
// //       label: isAr ? 'الحساب مفعّل ✓' : 'Account Active ✓',
// //       desc: isAr
// //         ? 'حسابك مفعّل ويمكنك نشر الوظائف. يمكنك تحديث الشهادة في أي وقت.'
// //         : 'Your account is active and you can post jobs. You can update your certificate anytime.',
// //     },
// //     rejected: {
// //       icon: <XCircle size={16} color="#EF4444" />,
// //       color: '#EF4444',
// //       bg: 'rgba(239,68,68,0.08)',
// //       border: 'rgba(239,68,68,0.25)',
// //       label: isAr ? 'تم رفض الطلب' : 'Application Rejected',
// //       desc: company?.rejectionReason
// //         ? (isAr ? `السبب: ${company.rejectionReason}` : `Reason: ${company.rejectionReason}`)
// //         : (isAr ? 'ارفع وثائق صحيحة وحاول مجدداً.' : 'Please upload valid documents and try again.'),
// //     },
// //     suspended: {
// //       icon: <AlertCircle size={16} color="#EF4444" />,
// //       color: '#EF4444',
// //       bg: 'rgba(239,68,68,0.08)',
// //       border: 'rgba(239,68,68,0.25)',
// //       label: isAr ? 'الحساب موقوف' : 'Account Suspended',
// //       desc: isAr ? 'تواصل مع الدعم.' : 'Please contact support.',
// //     },
// //   }[status] || {};

// //   const showUpload = ['pending_documents', 'pending_review', 'active', 'rejected'].includes(status);

// //   const handleFile = (f) => {
// //     if (!f) return;
// //     if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(f.type)) {
// //       toast.error(isAr ? 'فقط PDF أو صورة' : 'Only PDF or image allowed');
// //       return;
// //     }
// //     if (f.size > 10 * 1024 * 1024) {
// //       toast.error(isAr ? 'الحد الأقصى 10MB' : 'Max 10MB');
// //       return;
// //     }
// //     setFile(f);
// //     if (f.type.startsWith('image/')) {
// //       const r = new FileReader();
// //       r.onload = e => setPreview(e.target.result);
// //       r.readAsDataURL(f);
// //     } else setPreview('pdf');
// //   };

// //   const handleUpload = async () => {
// //     if (!file) return;
// //     setLoading(true);
// //     try {
// //       const fd = new FormData();
// //       fd.append('certificate', file);
// //       await api.post('/companies/me/certificate', fd, {
// //         headers: { 'Content-Type': 'multipart/form-data' },
// //       });
// //       toast.success(isAr ? 'تم رفع الشهادة! جاري المراجعة...' : 'Certificate uploaded! Under review...');
// //       setFile(null); setPreview(null);
// //       onSuccess?.();
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || (isAr ? 'فشل الرفع' : 'Upload failed'));
// //     } finally { setLoading(false); }
// //   };

// //   return (
// //     <div style={{
// //       background: 'var(--bg-primary)', border: '1px solid var(--border)',
// //       borderRadius: 16, padding: 24, marginBottom: 16,
// //     }}>
// //       <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
// //         <FileCheck size={16} /> {isAr ? 'شهادة التسجيل' : 'Registration Certificate'}
// //       </h2>

// //       {/* Status indicator */}
// //       <div style={{
// //         display: 'flex', alignItems: 'flex-start', gap: 10,
// //         background: statusInfo.bg, border: `1px solid ${statusInfo.border}`,
// //         borderRadius: 10, padding: '12px 14px', marginBottom: showUpload ? 16 : 0,
// //       }}>
// //         <div style={{ marginTop: 1, flexShrink: 0 }}>{statusInfo.icon}</div>
// //         <div>
// //           <p style={{ fontSize: 13, fontWeight: 700, color: statusInfo.color, margin: '0 0 3px' }}>
// //             {statusInfo.label}
// //           </p>
// //           <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
// //             {statusInfo.desc}
// //           </p>
// //           {/* Show current certificate link */}
// //           {company?.tradeLicenseUrl && (
// //             <a
// //               href={company.tradeLicenseUrl}
// //               target="_blank"
// //               rel="noreferrer"
// //               style={{ fontSize: 12, color: statusInfo.color, marginTop: 6, display: 'inline-block', textDecoration: 'underline' }}
// //             >
// //               {isAr ? 'عرض الشهادة الحالية ↗' : 'View current certificate ↗'}
// //             </a>
// //           )}
// //         </div>
// //       </div>

// //       {/* Upload area */}
// //       {showUpload && (
// //         <>
// //           <div
// //             onClick={() => fileRef.current?.click()}
// //             onDragOver={e => e.preventDefault()}
// //             onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
// //             style={{
// //               border: `2px dashed ${file ? 'var(--text-primary)' : 'var(--border)'}`,
// //               borderRadius: 10, padding: '20px', textAlign: 'center',
// //               cursor: 'pointer', background: 'var(--bg-secondary)',
// //               transition: 'all 0.2s',
// //             }}
// //             onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
// //             onMouseLeave={e => e.currentTarget.style.borderColor = file ? 'var(--text-primary)' : 'var(--border)'}
// //           >
// //             <input ref={fileRef} type="file" style={{ display: 'none' }}
// //               accept=".pdf,.jpg,.jpeg,.png,.webp"
// //               onChange={e => handleFile(e.target.files[0])} />

// //             {preview === 'pdf' ? (
// //               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
// //                 <FileCheck size={20} color="#22C55E" />
// //                 <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{file?.name}</span>
// //               </div>
// //             ) : preview ? (
// //               <img src={preview} alt="preview" style={{ maxHeight: 100, borderRadius: 8, objectFit: 'contain' }} />
// //             ) : (
// //               <>
// //                 <Upload size={20} color="var(--text-secondary)" style={{ marginBottom: 6 }} />
// //                 <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
// //                   {isAr ? 'اسحب الملف هنا أو اضغط للاختيار' : 'Drag & drop or click to select'}
// //                 </p>
// //                 <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', opacity: 0.7 }}>
// //                   PDF {isAr ? 'أو صورة' : 'or image'} — {isAr ? 'حتى' : 'up to'} 10MB
// //                 </p>
// //               </>
// //             )}
// //           </div>

// //           {file && (
// //             <button onClick={handleUpload} disabled={loading}
// //               style={{
// //                 marginTop: 10, width: '100%', padding: '12px',
// //                 borderRadius: 10, background: 'var(--text-primary)',
// //                 color: 'var(--bg-primary)', border: 'none',
// //                 cursor: loading ? 'not-allowed' : 'pointer',
// //                 fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
// //                 opacity: loading ? 0.7 : 1,
// //                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
// //               }}>
// //               {loading && <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />}
// //               {loading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع الشهادة ✓' : 'Upload Certificate ✓')}
// //             </button>
// //           )}
// //         </>
// //       )}
// //     </div>
// //   );
// // }

// // /* ══════════════════════════════════════════════════════════
// //    MAIN
// // ══════════════════════════════════════════════════════════ */
// // export default function CompanyProfilePage() {
// //   const { lang }        = useLangStore();
// //   const isAr            = lang === 'ar';
// //   const { company, refetch } = useCompany();

// //   const [loading,  setLoading]  = useState(true);
// //   const [saving,   setSaving]   = useState(false);
// //   const [logoFile, setLogoFile] = useState(null);
// //   const [logoPreview, setLogoPreview] = useState(null);
// //   const logoRef = useRef();

// //   const [form, setForm] = useState({
// //     name: '', industry: '', companySize: '', website: '',
// //     locationCountry: '', locationCity: '', description: '',
// //     phone: '', foundedYear: '',
// //   });

// //   useEffect(() => {
// //     if (!company) return;
// //     setForm({
// //       name:            company.name            || '',
// //       industry:        company.industry        || '',
// //       companySize:     company.companySize     || '',
// //       website:         company.website         || '',
// //       locationCountry: company.locationCountry || '',
// //       locationCity:    company.locationCity    || '',
// //       description:     company.description     || '',
// //       phone:           company.phone           || '',
// //       foundedYear:     company.foundedYear     || '',
// //     });
// //     setLoading(false);
// //   }, [company]);

// //   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

// //   const handleLogoChange = (f) => {
// //     if (!f) return;
// //     setLogoFile(f);
// //     const r = new FileReader();
// //     r.onload = e => setLogoPreview(e.target.result);
// //     r.readAsDataURL(f);
// //   };

// //   const handleSave = async () => {
// //     setSaving(true);
// //     try {
// //       if (logoFile) {
// //         const fd = new FormData();
// //         fd.append('logo', logoFile);
// //         await api.post(`/companies/${company.id}/logo`, fd, {
// //           headers: { 'Content-Type': 'multipart/form-data' },
// //         });
// //       }
// //       await api.patch(`/companies/${company.id}`, form);
// //       toast.success(isAr ? 'تم حفظ التغييرات ✓' : 'Changes saved ✓');
// //       refetch();
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
// //     } finally { setSaving(false); }
// //   };

// //   return (
// //     <CompanyLayout>
// //       <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
// //       <div style={{ maxWidth: 700, margin: '0 auto' }}>

// //         <div style={{ marginBottom: 20 }}>
// //           <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
// //             {isAr ? 'ملف الشركة' : 'Company Profile'}
// //           </h1>
// //           <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
// //             {isAr ? 'اكتمل ملفك لجذب أفضل المواهب' : 'Complete your profile to attract top talent'}
// //           </p>
// //         </div>

// //         {/* ── Certificate Section ── */}
// //         <CertificateSection company={company} isAr={isAr} onSuccess={refetch} />

// //         {/* ── Profile Form ── */}
// //         <div style={{
// //           background: 'var(--bg-primary)', border: '1px solid var(--border)',
// //           borderRadius: 16, padding: 24,
// //         }}>
// //           <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>
// //             🏢 {isAr ? 'معلومات الشركة' : 'Company Information'}
// //           </h2>

// //           {/* Logo */}
// //           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
// //             <div style={{ position: 'relative', flexShrink: 0 }}>
// //               <div style={{
// //                 width: 72, height: 72, borderRadius: 14,
// //                 background: 'var(--bg-secondary)', border: '2px solid var(--border)',
// //                 overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               }}>
// //                 {(logoPreview || company?.logoUrl)
// //                   ? <img src={logoPreview || company.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
// //                   : <Building2 size={28} color="var(--text-secondary)" strokeWidth={1.5} />
// //                 }
// //               </div>
// //               <button onClick={() => logoRef.current?.click()} style={{
// //                 position: 'absolute', bottom: -4, insetInlineEnd: -4,
// //                 width: 24, height: 24, borderRadius: '50%',
// //                 background: 'var(--text-primary)', color: 'var(--bg-primary)',
// //                 border: 'none', cursor: 'pointer',
// //                 display: 'flex', alignItems: 'center', justifyContent: 'center',
// //               }}>
// //                 <Camera size={12} />
// //               </button>
// //               <input ref={logoRef} type="file" style={{ display: 'none' }}
// //                 accept="image/jpeg,image/png,image/webp"
// //                 onChange={e => handleLogoChange(e.target.files[0])} />
// //             </div>
// //             <div>
// //               <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
// //                 {company?.name || '—'}
// //               </p>
// //               <span style={{
// //                 fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
// //                 background: {
// //                   active:            'rgba(34,197,94,0.12)',
// //                   pending_review:    'rgba(59,130,246,0.12)',
// //                   pending_documents: 'rgba(245,158,11,0.12)',
// //                   rejected:          'rgba(239,68,68,0.12)',
// //                   suspended:         'rgba(239,68,68,0.12)',
// //                 }[company?.status] || 'var(--bg-secondary)',
// //                 color: {
// //                   active:            '#22C55E',
// //                   pending_review:    '#3B82F6',
// //                   pending_documents: '#F59E0B',
// //                   rejected:          '#EF4444',
// //                   suspended:         '#EF4444',
// //                 }[company?.status] || 'var(--text-secondary)',
// //               }}>
// //                 {{
// //                   active:            isAr ? 'مفعّل'           : 'Active',
// //                   pending_review:    isAr ? 'قيد المراجعة'    : 'Under Review',
// //                   pending_documents: isAr ? 'بانتظار الوثائق' : 'Pending Documents',
// //                   rejected:          isAr ? 'مرفوض'            : 'Rejected',
// //                   suspended:         isAr ? 'موقوف'            : 'Suspended',
// //                 }[company?.status]}
// //               </span>
// //             </div>
// //           </div>

// //           {/* Fields */}
// //           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
// //             <div style={{ gridColumn: '1/-1' }}>
// //               <Field label={isAr ? 'اسم الشركة' : 'Company Name'} required>
// //                 <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
// //               </Field>
// //             </div>

// //             <Field label={isAr ? 'القطاع' : 'Industry'}>
// //               <select value={form.industry} onChange={e => set('industry', e.target.value)}
// //                 style={{ ...inp, cursor: 'pointer' }}>
// //                 <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
// //                 {INDUSTRIES.map(v => <option key={v} value={v}>{v}</option>)}
// //               </select>
// //             </Field>

// //             <Field label={isAr ? 'حجم الشركة' : 'Company Size'}>
// //               <select value={form.companySize} onChange={e => set('companySize', e.target.value)}
// //                 style={{ ...inp, cursor: 'pointer' }}>
// //                 <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
// //                 {SIZES.map(v => <option key={v} value={v}>{v}</option>)}
// //               </select>
// //             </Field>

// //             <Field label={isAr ? 'الدولة' : 'Country'}>
// //               <input value={form.locationCountry} onChange={e => set('locationCountry', e.target.value)}
// //                 placeholder={isAr ? 'الأردن' : 'Jordan'} style={inp} />
// //             </Field>

// //             <Field label={isAr ? 'المدينة' : 'City'}>
// //               <input value={form.locationCity} onChange={e => set('locationCity', e.target.value)}
// //                 placeholder={isAr ? 'عمّان' : 'Amman'} style={inp} />
// //             </Field>

// //             <Field label={isAr ? 'الموقع الإلكتروني' : 'Website'}>
// //               <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
// //                 placeholder="https://company.com" dir="ltr"
// //                 style={{ ...inp, direction: 'ltr', textAlign: 'left' }} />
// //             </Field>

// //             <Field label={isAr ? 'رقم الهاتف' : 'Phone'}>
// //               <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
// //                 placeholder="+962 7x xxx xxxx" dir="ltr"
// //                 style={{ ...inp, direction: 'ltr', textAlign: 'left' }} />
// //             </Field>

// //             <div style={{ gridColumn: '1/-1' }}>
// //               <Field label={isAr ? 'نبذة عن الشركة' : 'About the Company'}>
// //                 <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
// //                   placeholder={isAr ? 'اكتب وصفاً مختصراً...' : 'Briefly describe your company...'}
// //                   style={{ ...inp, resize: 'vertical', paddingTop: 6, lineHeight: 1.7 }} />
// //               </Field>
// //             </div>
// //           </div>

// //           <button onClick={handleSave} disabled={saving}
// //             style={{
// //               width: '100%', padding: '13px', borderRadius: 10,
// //               background: 'var(--text-primary)', color: 'var(--bg-primary)',
// //               border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
// //               fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
// //               opacity: saving ? 0.7 : 1,
// //               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
// //               transition: 'opacity 0.2s',
// //             }}
// //             onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
// //             onMouseLeave={e => { e.currentTarget.style.opacity = saving ? '0.7' : '1'; }}>
// //             {saving
// //               ? <><Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> {isAr ? 'جاري الحفظ...' : 'Saving...'}</>
// //               : <><Save size={15} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
// //             }
// //           </button>
// //         </div>
// //       </div>
// //     </CompanyLayout>
// //   );
// // }

// // frontend/src/pages/Company/CompanyProfilePage.jsx

// import { useState, useEffect, useRef, useMemo } from 'react';
// import {
//   Camera, Save, Building2, Loader2,
//   Upload, FileCheck, Clock, XCircle, CheckCircle, AlertCircle,
//   Search, ChevronDown, X, Globe2,
// } from 'lucide-react';
// import CompanyLayout, { useCompany } from './CompanyLayout';
// import useLangStore from '../../i18n';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import { COUNTRIES } from '../../data/countriesData';

// const INDUSTRIES = [
//   'Information Technology','Telecommunications','Education','Healthcare',
//   'Finance & Business','Manufacturing','Construction & Real Estate',
//   'Retail','Hospitality & Tourism','Media & Communications','Other',
// ];
// const SIZES = ['1-10','11-50','51-200','201-500','500+'];

// /* ═══════════════════════════════════════════════════════════
//    SEARCHABLE SELECT — قائمة منسدلة مع بحث (للدول والمدن)
// ═══════════════════════════════════════════════════════════ */
// function SearchableSelect({ label, value, onChange, options, placeholder, disabled, required, error }) {
//   const [open,  setOpen]  = useState(false);
//   const [query, setQuery] = useState('');
//   const wrapRef = useRef();
//   const inputRef = useRef();

//   useEffect(() => {
//     const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
//     document.addEventListener('mousedown', close);
//     return () => document.removeEventListener('mousedown', close);
//   }, []);

//   const filtered = useMemo(() => {
//     if (!query.trim()) return options;
//     const q = query.toLowerCase();
//     return options.filter(o => o.toLowerCase().includes(q));
//   }, [query, options]);

//   const handleSelect = (val) => {
//     onChange(val);
//     setQuery('');
//     setOpen(false);
//   };

//   return (
//     <div style={{ marginBottom: 14, position: 'relative' }} ref={wrapRef}>
//       <div
//         onClick={() => { if (!disabled) { setOpen(o => !o); setTimeout(() => inputRef.current?.focus(), 50); } }}
//         style={{
//           background: 'var(--bg-secondary)',
//           border: `1.5px solid ${error ? '#EF4444' : open ? 'var(--text-primary)' : 'var(--border)'}`,
//           borderRadius: 10, overflow: 'hidden', cursor: disabled ? 'not-allowed' : 'pointer',
//           opacity: disabled ? 0.6 : 1, transition: 'border-color 0.2s',
//         }}
//       >
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>
//           {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
//         </span>
//         <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px 9px', gap: 8 }}>
//           <span style={{ flex: 1, fontSize: 13.5, color: value ? 'var(--text-primary)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//             {value || placeholder}
//           </span>
//           {value && !disabled && (
//             <X
//               size={14}
//               color="var(--text-secondary)"
//               onClick={(e) => { e.stopPropagation(); onChange(''); }}
//               style={{ cursor: 'pointer', flexShrink: 0 }}
//             />
//           )}
//           <ChevronDown size={14} color="var(--text-secondary)" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
//         </div>
//       </div>

//       {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>⚠ {error}</p>}

//       {open && !disabled && (
//         <div style={{
//           position: 'absolute', top: 'calc(100% + 4px)', insetInlineStart: 0, insetInlineEnd: 0,
//           background: 'var(--bg-primary)', border: '1.5px solid var(--border)',
//           borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
//           zIndex: 100, maxHeight: 260, display: 'flex', flexDirection: 'column',
//           overflow: 'hidden',
//         }}>
//           {/* Search input */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
//             <Search size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
//             <input
//               ref={inputRef}
//               value={query}
//               onChange={e => setQuery(e.target.value)}
//               placeholder={placeholder}
//               autoFocus
//               style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', fontFamily: 'inherit' }}
//             />
//           </div>

//           {/* Options list */}
//           <div style={{ overflowY: 'auto', maxHeight: 210 }}>
//             {filtered.length === 0 && (
//               <p style={{ padding: '14px', fontSize: 12.5, color: 'var(--text-secondary)', textAlign: 'center', margin: 0 }}>
//                 لا توجد نتائج
//               </p>
//             )}
//             {filtered.map(opt => (
//               <div
//                 key={opt}
//                 onClick={() => handleSelect(opt)}
//                 style={{
//                   padding: '9px 14px', fontSize: 13, cursor: 'pointer',
//                   color: opt === value ? 'var(--text-primary)' : 'var(--text-secondary)',
//                   fontWeight: opt === value ? 700 : 500,
//                   background: opt === value ? 'var(--bg-secondary)' : 'transparent',
//                   transition: 'background 0.12s',
//                 }}
//                 onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
//                 onMouseLeave={e => e.currentTarget.style.background = opt === value ? 'var(--bg-secondary)' : 'transparent'}
//               >
//                 {opt}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ── Field ───────────────────────────────────────────────── */
// function Field({ label, error, children, required }) {
//   return (
//     <div style={{ marginBottom: 14 }}>
//       <div style={{
//         background: 'var(--bg-secondary)',
//         border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
//         borderRadius: 10, overflow: 'hidden',
//         transition: 'border-color 0.2s, background 0.2s',
//       }}
//         onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
//         onBlurCapture={e  => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
//       >
//         <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '8px 14px 2px' }}>
//           {label}{required && <span style={{ color: '#EF4444' }}> *</span>}
//         </span>
//         {children}
//       </div>
//       {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>⚠ {error}</p>}
//     </div>
//   );
// }

// const inp = {
//   display: 'block', width: '100%', padding: '2px 14px 9px',
//   background: 'transparent', border: 'none', outline: 'none',
//   fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'inherit',
//   boxSizing: 'border-box',
// };

// /* ── Certificate Section ─────────────────────────────────── */
// function CertificateSection({ company, isAr, onSuccess }) {
//   const [file,    setFile]    = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const fileRef = useRef();

//   const status = company?.status;

//   const statusInfo = {
//     pending_documents: {
//       icon: <Upload size={16} color="#F59E0B" />,
//       color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)',
//       label: isAr ? 'مطلوب: رفع شهادة التسجيل' : 'Required: Upload Registration Certificate',
//       desc: isAr
//         ? 'ارفع شهادة تسجيل شركتك (PDF أو صورة) لإرسالها للمراجعة وتفعيل حسابك.'
//         : 'Upload your company registration certificate (PDF or image) to submit for review and activate your account.',
//     },
//     pending_review: {
//       icon: <Clock size={16} color="#3B82F6" />,
//       color: '#3B82F6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)',
//       label: isAr ? 'الشهادة قيد المراجعة' : 'Certificate Under Review',
//       desc: isAr
//         ? 'تم استلام شهادتك وجاري مراجعتها. يمكنك رفع شهادة جديدة لو أردت تحديثها.'
//         : 'Your certificate has been received and is under review. You can upload a new one to replace it.',
//     },
//     active: {
//       icon: <CheckCircle size={16} color="#22C55E" />,
//       color: '#22C55E', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)',
//       label: isAr ? 'الحساب مفعّل ✓' : 'Account Active ✓',
//       desc: isAr
//         ? 'حسابك مفعّل ويمكنك نشر الوظائف. يمكنك تحديث الشهادة في أي وقت.'
//         : 'Your account is active and you can post jobs. You can update your certificate anytime.',
//     },
//     rejected: {
//       icon: <XCircle size={16} color="#EF4444" />,
//       color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
//       label: isAr ? 'تم رفض الطلب' : 'Application Rejected',
//       desc: company?.rejectionReason
//         ? (isAr ? `السبب: ${company.rejectionReason}` : `Reason: ${company.rejectionReason}`)
//         : (isAr ? 'ارفع وثائق صحيحة وحاول مجدداً.' : 'Please upload valid documents and try again.'),
//     },
//     suspended: {
//       icon: <AlertCircle size={16} color="#EF4444" />,
//       color: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
//       label: isAr ? 'الحساب موقوف' : 'Account Suspended',
//       desc: isAr ? 'تواصل مع الدعم.' : 'Please contact support.',
//     },
//   }[status] || {};

//   const showUpload = ['pending_documents', 'pending_review', 'active', 'rejected'].includes(status);

//   const handleFile = (f) => {
//     if (!f) return;
//     if (!['application/pdf','image/jpeg','image/png','image/webp'].includes(f.type)) {
//       toast.error(isAr ? 'فقط PDF أو صورة' : 'Only PDF or image allowed');
//       return;
//     }
//     if (f.size > 10 * 1024 * 1024) {
//       toast.error(isAr ? 'الحد الأقصى 10MB' : 'Max 10MB');
//       return;
//     }
//     setFile(f);
//     if (f.type.startsWith('image/')) {
//       const r = new FileReader();
//       r.onload = e => setPreview(e.target.result);
//       r.readAsDataURL(f);
//     } else setPreview('pdf');
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setLoading(true);
//     try {
//       const fd = new FormData();
//       fd.append('certificate', file);
//       await api.post('/companies/me/certificate', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       toast.success(isAr ? 'تم رفع الشهادة! جاري المراجعة...' : 'Certificate uploaded! Under review...');
//       setFile(null); setPreview(null);
//       onSuccess?.();
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل الرفع' : 'Upload failed'));
//     } finally { setLoading(false); }
//   };

//   return (
//     <div style={{
//       background: 'var(--bg-primary)', border: '1px solid var(--border)',
//       borderRadius: 16, padding: 24, marginBottom: 16,
//     }}>
//       <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
//         <FileCheck size={16} /> {isAr ? 'شهادة التسجيل' : 'Registration Certificate'}
//       </h2>

//       <div style={{
//         display: 'flex', alignItems: 'flex-start', gap: 10,
//         background: statusInfo.bg, border: `1px solid ${statusInfo.border}`,
//         borderRadius: 10, padding: '12px 14px', marginBottom: showUpload ? 16 : 0,
//       }}>
//         <div style={{ marginTop: 1, flexShrink: 0 }}>{statusInfo.icon}</div>
//         <div>
//           <p style={{ fontSize: 13, fontWeight: 700, color: statusInfo.color, margin: '0 0 3px' }}>
//             {statusInfo.label}
//           </p>
//           <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
//             {statusInfo.desc}
//           </p>
//           {company?.tradeLicenseUrl && (
//             <a href={company.tradeLicenseUrl} target="_blank" rel="noreferrer"
//               style={{ fontSize: 12, color: statusInfo.color, marginTop: 6, display: 'inline-block', textDecoration: 'underline' }}>
//               {isAr ? 'عرض الشهادة الحالية ↗' : 'View current certificate ↗'}
//             </a>
//           )}
//         </div>
//       </div>

//       {showUpload && (
//         <>
//           <div
//             onClick={() => fileRef.current?.click()}
//             onDragOver={e => e.preventDefault()}
//             onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
//             style={{
//               border: `2px dashed ${file ? 'var(--text-primary)' : 'var(--border)'}`,
//               borderRadius: 10, padding: '20px', textAlign: 'center',
//               cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-primary)'}
//             onMouseLeave={e => e.currentTarget.style.borderColor = file ? 'var(--text-primary)' : 'var(--border)'}
//           >
//             <input ref={fileRef} type="file" style={{ display: 'none' }}
//               accept=".pdf,.jpg,.jpeg,.png,.webp"
//               onChange={e => handleFile(e.target.files[0])} />

//             {preview === 'pdf' ? (
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
//                 <FileCheck size={20} color="#22C55E" />
//                 <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{file?.name}</span>
//               </div>
//             ) : preview ? (
//               <img src={preview} alt="preview" style={{ maxHeight: 100, borderRadius: 8, objectFit: 'contain' }} />
//             ) : (
//               <>
//                 <Upload size={20} color="var(--text-secondary)" style={{ marginBottom: 6 }} />
//                 <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>
//                   {isAr ? 'اسحب الملف هنا أو اضغط للاختيار' : 'Drag & drop or click to select'}
//                 </p>
//                 <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0', opacity: 0.7 }}>
//                   PDF {isAr ? 'أو صورة' : 'or image'} — {isAr ? 'حتى' : 'up to'} 10MB
//                 </p>
//               </>
//             )}
//           </div>

//           {file && (
//             <button onClick={handleUpload} disabled={loading}
//               style={{
//                 marginTop: 10, width: '100%', padding: '12px',
//                 borderRadius: 10, background: 'var(--text-primary)',
//                 color: 'var(--bg-primary)', border: 'none',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: 13.5, fontWeight: 700, fontFamily: 'inherit',
//                 opacity: loading ? 0.7 : 1,
//                 display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//               }}>
//               {loading && <Loader2 size={14} style={{ animation: 'spin .7s linear infinite' }} />}
//               {loading ? (isAr ? 'جاري الرفع...' : 'Uploading...') : (isAr ? 'رفع الشهادة ✓' : 'Upload Certificate ✓')}
//             </button>
//           )}
//         </>
//       )}
//     </div>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    MAIN
// ══════════════════════════════════════════════════════════ */
// export default function CompanyProfilePage() {
//   const { lang }        = useLangStore();
//   const isAr             = lang === 'ar';
//   const { company, loading: companyLoading, error: companyError, refetch } = useCompany();

//   const [saving,   setSaving]   = useState(false);
//   const [logoFile, setLogoFile] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const logoRef = useRef();

//   const [form, setForm] = useState({
//     name: '', industry: '', companySize: '', website: '',
//     locationCountry: '', locationCity: '', description: '',
//     phone: '', foundedYear: '',
//   });

//   useEffect(() => {
//     if (!company) return;
//     setForm({
//       name:            company.name            || '',
//       industry:        company.industry        || '',
//       companySize:     company.companySize     || '',
//       website:         company.website         || '',
//       locationCountry: company.locationCountry || '',
//       locationCity:    company.locationCity    || '',
//       description:     company.description     || '',
//       phone:           company.phone           || '',
//       foundedYear:     company.foundedYear     || '',
//     });
//   }, [company]);

//   const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

//   // قائمة الدول حسب اللغة
//   const countryNames = useMemo(() => COUNTRIES.map(c => isAr ? c.ar : c.en), [isAr]);

//   // المدن المتاحة للدولة المختارة حالياً
//   const cityOptions = useMemo(() => {
//     const found = COUNTRIES.find(c => c.en === form.locationCountry || c.ar === form.locationCountry);
//     return found ? found.cities : [];
//   }, [form.locationCountry]);

//   // لما تتغير الدولة، نفضي المدينة لو ما عادت موجودة بقائمة المدن الجديدة
//   const handleCountryChange = (val) => {
//     set('locationCountry', val);
//     const found = COUNTRIES.find(c => c.en === val || c.ar === val);
//     if (!found || !found.cities.includes(form.locationCity)) {
//       set('locationCity', '');
//     }
//   };

//   const handleLogoChange = (f) => {
//     if (!f) return;
//     if (!['image/jpeg','image/png','image/webp'].includes(f.type)) {
//       toast.error(isAr ? 'فقط JPEG أو PNG أو WebP' : 'Only JPEG, PNG or WebP allowed');
//       return;
//     }
//     if (f.size > 5 * 1024 * 1024) {
//       toast.error(isAr ? 'الحد الأقصى 5MB' : 'Max 5MB');
//       return;
//     }
//     setLogoFile(f);
//     const r = new FileReader();
//     r.onload = e => setLogoPreview(e.target.result);
//     r.readAsDataURL(f);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       // 1) رفع الشعار أولاً لو تغيّر
//       if (logoFile) {
//         const fd = new FormData();
//         fd.append('logo', logoFile);
//         await api.post('/companies/me/logo', fd, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         setLogoFile(null);
//       }
//       // 2) حفظ بيانات الشركة
//       await api.patch(`/companies/${company.id}`, form);
//       toast.success(isAr ? 'تم حفظ التغييرات ✓' : 'Changes saved ✓');
//       refetch();
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل الحفظ' : 'Save failed'));
//     } finally { setSaving(false); }
//   };

//   // لسا بيحمّل بيانات الشركة
//   if (companyLoading) {
//     return (
//       <CompanyLayout>
//         <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
//           <Loader2 size={26} style={{ animation: 'spin .7s linear infinite' }} color="var(--text-secondary)" />
//         </div>
//       </CompanyLayout>
//     );
//   }

//   // فشل تحميل بيانات الشركة من السيرفر
//   if (companyError) {
//     return (
//       <CompanyLayout>
//         <div style={{ textAlign: 'center', padding: 60 }}>
//           <p style={{ fontSize: 14, color: '#EF4444', marginBottom: 14 }}>
//             {isAr ? 'فشل تحميل بيانات الشركة' : 'Failed to load company data'}
//           </p>
//           <button onClick={refetch} style={{
//             padding: '10px 24px', borderRadius: 10, background: 'var(--text-primary)',
//             color: 'var(--bg-primary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
//           }}>
//             {isAr ? 'إعادة المحاولة' : 'Retry'}
//           </button>
//         </div>
//       </CompanyLayout>
//     );
//   }

//   // انتهى التحميل بدون خطأ، لكن لا توجد شركة مرتبطة بهذا الحساب
//   if (!company) {
//     return (
//       <CompanyLayout>
//         <div style={{ textAlign: 'center', padding: 60 }}>
//           <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
//             {isAr ? 'لا توجد شركة مرتبطة بحسابك' : 'No company linked to your account'}
//           </p>
//         </div>
//       </CompanyLayout>
//     );
//   }

//   return (
//     <CompanyLayout>
//       <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
//       <div style={{ maxWidth: 700, margin: '0 auto' }}>

//         <div style={{ marginBottom: 20 }}>
//           <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
//             {isAr ? 'ملف الشركة' : 'Company Profile'}
//           </h1>
//           <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
//             {isAr ? 'اكتمل ملفك لجذب أفضل المواهب' : 'Complete your profile to attract top talent'}
//           </p>
//         </div>

//         {/* ── Certificate Section ── */}
//         <CertificateSection company={company} isAr={isAr} onSuccess={refetch} />

//         {/* ── Profile Form ── */}
//         <div style={{
//           background: 'var(--bg-primary)', border: '1px solid var(--border)',
//           borderRadius: 16, padding: 24,
//         }}>
//           <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px' }}>
//             🏢 {isAr ? 'معلومات الشركة' : 'Company Information'}
//           </h2>

//           {/* Logo */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
//             <div style={{ position: 'relative', flexShrink: 0 }}>
//               <div style={{
//                 width: 80, height: 80, borderRadius: 16,
//                 background: 'var(--bg-secondary)', border: '2px solid var(--border)',
//                 overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
//               }}>
//                 {(logoPreview || company?.logoUrl)
//                   ? <img src={logoPreview || company.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
//                   : <Building2 size={30} color="var(--text-secondary)" strokeWidth={1.5} />
//                 }
//               </div>
//               <button onClick={() => logoRef.current?.click()} style={{
//                 position: 'absolute', bottom: -4, insetInlineEnd: -4,
//                 width: 26, height: 26, borderRadius: '50%',
//                 background: 'var(--text-primary)', color: 'var(--bg-primary)',
//                 border: 'none', cursor: 'pointer',
//                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//               }}>
//                 <Camera size={13} />
//               </button>
//               <input ref={logoRef} type="file" style={{ display: 'none' }}
//                 accept="image/jpeg,image/png,image/webp"
//                 onChange={e => handleLogoChange(e.target.files[0])} />
//             </div>
//             <div>
//               <p style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
//                 {company?.name || '—'}
//               </p>
//               <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
//                 {isAr ? 'اضغط على أيقونة الكاميرا لتغيير الشعار' : 'Click the camera icon to change logo'}
//               </p>
//               <span style={{
//                 fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
//                 background: {
//                   active:            'rgba(34,197,94,0.12)',
//                   pending_review:    'rgba(59,130,246,0.12)',
//                   pending_documents: 'rgba(245,158,11,0.12)',
//                   rejected:          'rgba(239,68,68,0.12)',
//                   suspended:         'rgba(239,68,68,0.12)',
//                 }[company?.status] || 'var(--bg-secondary)',
//                 color: {
//                   active:            '#22C55E',
//                   pending_review:    '#3B82F6',
//                   pending_documents: '#F59E0B',
//                   rejected:          '#EF4444',
//                   suspended:         '#EF4444',
//                 }[company?.status] || 'var(--text-secondary)',
//               }}>
//                 {{
//                   active:            isAr ? 'مفعّل'           : 'Active',
//                   pending_review:    isAr ? 'قيد المراجعة'    : 'Under Review',
//                   pending_documents: isAr ? 'بانتظار الوثائق' : 'Pending Documents',
//                   rejected:          isAr ? 'مرفوض'            : 'Rejected',
//                   suspended:         isAr ? 'موقوف'            : 'Suspended',
//                 }[company?.status]}
//               </span>
//             </div>
//           </div>

//           {/* Fields */}
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
//             <div style={{ gridColumn: '1/-1' }}>
//               <Field label={isAr ? 'اسم الشركة' : 'Company Name'} required>
//                 <input value={form.name} onChange={e => set('name', e.target.value)} style={inp} />
//               </Field>
//             </div>

//             <Field label={isAr ? 'القطاع' : 'Industry'}>
//               <select value={form.industry} onChange={e => set('industry', e.target.value)}
//                 style={{ ...inp, cursor: 'pointer' }}>
//                 <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
//                 {INDUSTRIES.map(v => <option key={v} value={v}>{v}</option>)}
//               </select>
//             </Field>

//             <Field label={isAr ? 'حجم الشركة' : 'Company Size'}>
//               <select value={form.companySize} onChange={e => set('companySize', e.target.value)}
//                 style={{ ...inp, cursor: 'pointer' }}>
//                 <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
//                 {SIZES.map(v => <option key={v} value={v}>{v}</option>)}
//               </select>
//             </Field>

//             {/* الدولة — قائمة بحث */}
//             <SearchableSelect
//               label={isAr ? 'الدولة' : 'Country'}
//               value={form.locationCountry}
//               onChange={handleCountryChange}
//               options={countryNames}
//               placeholder={isAr ? 'ابحث عن دولة...' : 'Search country...'}
//             />

//             {/* المدينة — قائمة بحث مرتبطة بالدولة */}
//             <SearchableSelect
//               label={isAr ? 'المدينة' : 'City'}
//               value={form.locationCity}
//               onChange={(v) => set('locationCity', v)}
//               options={cityOptions}
//               placeholder={
//                 !form.locationCountry
//                   ? (isAr ? 'اختر الدولة أولاً' : 'Select country first')
//                   : (isAr ? 'ابحث عن مدينة...' : 'Search city...')
//               }
//               disabled={!form.locationCountry || cityOptions.length === 0}
//             />

//             <Field label={isAr ? 'الموقع الإلكتروني' : 'Website'}>
//               <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
//                 placeholder="https://company.com" dir="ltr"
//                 style={{ ...inp, direction: 'ltr', textAlign: 'left' }} />
//             </Field>

//             <Field label={isAr ? 'رقم الهاتف' : 'Phone'}>
//               <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
//                 placeholder="+962 7x xxx xxxx" dir="ltr"
//                 style={{ ...inp, direction: 'ltr', textAlign: 'left' }} />
//             </Field>

//             <Field label={isAr ? 'سنة التأسيس' : 'Founded Year'}>
//               <input type="number" value={form.foundedYear} onChange={e => set('foundedYear', e.target.value)}
//                 placeholder="2015" min="1900" max={new Date().getFullYear()} style={inp} />
//             </Field>

//             {/* البريد الإلكتروني للدومين — للعرض فقط */}
//             <Field label={isAr ? 'دومين البريد' : 'Email Domain'}>
//               <input value={company?.emailDomain || ''} readOnly dir="ltr"
//                 style={{ ...inp, direction: 'ltr', textAlign: 'left', opacity: 0.6, cursor: 'not-allowed' }} />
//             </Field>

//             <div style={{ gridColumn: '1/-1' }}>
//               <Field label={isAr ? 'نبذة عن الشركة' : 'About the Company'}>
//                 <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
//                   placeholder={isAr ? 'اكتب وصفاً مختصراً...' : 'Briefly describe your company...'}
//                   style={{ ...inp, resize: 'vertical', paddingTop: 6, lineHeight: 1.7 }} />
//               </Field>
//             </div>
//           </div>

//           <button onClick={handleSave} disabled={saving}
//             style={{
//               width: '100%', padding: '13px', borderRadius: 10,
//               background: 'var(--text-primary)', color: 'var(--bg-primary)',
//               border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
//               fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
//               opacity: saving ? 0.7 : 1,
//               display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
//               transition: 'opacity 0.2s',
//             }}
//             onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = '0.85'; }}
//             onMouseLeave={e => { e.currentTarget.style.opacity = saving ? '0.7' : '1'; }}>
//             {saving
//               ? <><Loader2 size={15} style={{ animation: 'spin .7s linear infinite' }} /> {isAr ? 'جاري الحفظ...' : 'Saving...'}</>
//               : <><Save size={15} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>
//             }
//           </button>
//         </div>
//       </div>
//     </CompanyLayout>
//   );
// }