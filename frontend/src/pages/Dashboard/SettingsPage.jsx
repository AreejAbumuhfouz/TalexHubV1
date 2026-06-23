

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   Globe, Bell, Lock, Trash2,
//   AlertTriangle, Sun, Moon, Monitor,
//   CheckCircle2,
// } from 'lucide-react';
// import useLang from '../../i18n';
// import useAuthStore from '../../store/authStore';
// import useThemeStore from '../../store/themeStore';
// import api from '../../services/api';
// import toast from 'react-hot-toast';
// import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

// /* ── reusable Field ─────────────────────────────────────── */
// function Field({ label, error, children }) {
//   return (
//     <div style={{ marginBottom: 14 }}>
//       <div
//         style={{
//           background: 'var(--bg-secondary)',
//           border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
//           borderRadius: 10, overflow: 'hidden',
//           transition: 'border-color 0.2s, background 0.2s',
//         }}
//         onFocusCapture={e => {
//           e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--text-primary)';
//           e.currentTarget.style.background = 'var(--bg-primary)';
//         }}
//         onBlurCapture={e => {
//           e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)';
//           e.currentTarget.style.background = 'var(--bg-secondary)';
//         }}
//       >
//         <span style={{
//           display: 'block', fontSize: 10.5, fontWeight: 600,
//           color: 'var(--text-secondary)', padding: '9px 14px 2px',
//         }}>
//           {label}
//         </span>
//         {children}
//       </div>
//       {error && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>⚠ {error}</p>}
//     </div>
//   );
// }

// const inp = (isAr) => ({
//   display: 'block', width: '100%', padding: '2px 14px 9px',
//   background: 'transparent', border: 'none', outline: 'none',
//   fontSize: 13.5, color: 'var(--text-primary)',
//   fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
// });

// /* ── Btn ────────────────────────────────────────────────── */
// function Btn({ label, loading, loadingLabel, onClick, disabled, danger, secondary, isAr }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled || loading}
//       style={{
//         padding: '11px 22px', borderRadius: 10,
//         border: secondary ? '1.5px solid var(--border)' : 'none',
//         background: danger ? '#EF4444' : secondary ? 'var(--bg-secondary)' : 'var(--text-primary)',
//         color: danger ? '#fff' : secondary ? 'var(--text-secondary)' : 'var(--bg-primary)',
//         fontSize: 13.5, fontWeight: 700,
//         cursor: disabled || loading ? 'not-allowed' : 'pointer',
//         opacity: disabled || loading ? 0.65 : 1,
//         display: 'inline-flex', alignItems: 'center', gap: 7,
//         transition: 'opacity 0.2s, transform 0.2s',
//         fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
//       }}
//       onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
//       onMouseLeave={e => { e.currentTarget.style.opacity = disabled || loading ? '0.65' : '1'; e.currentTarget.style.transform = 'none'; }}
//     >
//       {loading
//         ? <>
//             <span style={{
//               width: 14, height: 14,
//               border: '2px solid rgba(255,255,255,0.3)',
//               borderTopColor: danger ? '#fff' : secondary ? 'var(--text-secondary)' : 'var(--bg-primary)',
//               borderRadius: '50%', animation: 'settSpin 0.7s linear infinite',
//               display: 'inline-block', flexShrink: 0,
//             }} />
//             {loadingLabel}
//           </>
//         : label}
//     </button>
//   );
// }

// /* ── Section card ───────────────────────────────────────── */
// function Section({ icon: Icon, title, danger, children }) {
//   return (
//     <div style={{
//       background: 'var(--bg-secondary)',
//       border: `1px solid ${danger ? '#FECACA' : 'var(--border)'}`,
//       borderRadius: 14,
//       marginBottom: 16,
//       overflow: 'hidden',
//     }}>
//       <div style={{
//         display: 'flex', alignItems: 'center', gap: 10,
//         padding: '16px 20px',
//         borderBottom: `1px solid ${danger ? '#FEE2E2' : 'var(--border)'}`,
//         background: danger ? '#FEF2F2' : 'var(--bg-primary)',
//       }}>
//         <div style={{
//           width: 32, height: 32, borderRadius: 8, flexShrink: 0,
//           background: danger ? '#FEE2E2' : 'var(--bg-secondary)',
//           border: `1px solid ${danger ? '#FECACA' : 'var(--border)'}`,
//           display: 'flex', alignItems: 'center', justifyContent: 'center',
//         }}>
//           <Icon size={15} color={danger ? '#EF4444' : 'var(--text-secondary)'} strokeWidth={1.9} />
//         </div>
//         <h3 style={{
//           fontSize: 13.5, fontWeight: 700,
//           color: danger ? '#EF4444' : 'var(--text-primary)',
//           margin: 0,
//         }}>
//           {title}
//         </h3>
//       </div>
//       <div style={{ padding: '20px' }}>
//         {children}
//       </div>
//     </div>
//   );
// }

// /* ── Toggle row ─────────────────────────────────────────── */
// function Toggle({ label, sub, checked, onChange }) {
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '13px 0',
//       borderBottom: '1px solid var(--border)',
//     }}>
//       <div style={{ paddingInlineEnd: 16 }}>
//         <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
//         {sub && <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '3px 0 0' }}>{sub}</p>}
//       </div>
//       <button
//         type="button"
//         role="switch"
//         aria-checked={checked}
//         onClick={() => onChange(!checked)}
//         style={{
//           width: 42, height: 24, borderRadius: 99, flexShrink: 0,
//           background: checked ? 'var(--text-primary)' : 'var(--border)',
//           border: 'none', cursor: 'pointer', position: 'relative',
//           transition: 'background 0.2s',
//         }}
//       >
//         <span style={{
//           position: 'absolute', top: 3,
//           width: 18, height: 18, borderRadius: '50%',
//           background: '#fff',
//           transition: 'inset-inline-start 0.2s',
//           insetInlineStart: checked ? 21 : 3,
//           boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
//         }} />
//       </button>
//     </div>
//   );
// }

// /* ── Theme option button ────────────────────────────────── */
// function ThemeOption({ value, current, onSelect, icon: Icon, label }) {
//   const active = current === value;
//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(value)}
//       style={{
//         flex: 1, display: 'flex', flexDirection: 'column',
//         alignItems: 'center', gap: 8,
//         padding: '14px 10px', borderRadius: 12,
//         background: active ? 'var(--text-primary)' : 'var(--bg-primary)',
//         border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
//         cursor: 'pointer', transition: 'all 0.2s ease',
//       }}
//       onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//       onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
//     >
//       <Icon
//         size={18}
//         color={active ? 'var(--bg-primary)' : 'var(--text-secondary)'}
//         strokeWidth={1.9}
//       />
//       <span style={{
//         fontSize: 12, fontWeight: active ? 700 : 500,
//         color: active ? 'var(--bg-primary)' : 'var(--text-secondary)',
//       }}>
//         {label}
//       </span>
//       {active && (
//         <CheckCircle2 size={13} color="var(--bg-primary)" />
//       )}
//     </button>
//   );
// }

// /* ── Language option button ─────────────────────────────── */
// function LangOption({ value, current, onSelect, flag, label, sub }) {
//   const active = current === value;
//   return (
//     <button
//       type="button"
//       onClick={() => onSelect(value)}
//       style={{
//         flex: 1, display: 'flex', flexDirection: 'column',
//         alignItems: 'center', gap: 6,
//         padding: '14px 10px', borderRadius: 12,
//         background: active ? 'var(--text-primary)' : 'var(--bg-primary)',
//         border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`,
//         cursor: 'pointer', transition: 'all 0.2s ease',
//       }}
//       onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
//       onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
//     >
//       <span style={{ fontSize: 22 }}>{flag}</span>
//       <span style={{
//         fontSize: 13, fontWeight: active ? 700 : 500,
//         color: active ? 'var(--bg-primary)' : 'var(--text-primary)',
//       }}>
//         {label}
//       </span>
//       <span style={{
//         fontSize: 11,
//         color: active ? 'rgba(255,255,255,0.6)' : 'var(--text-secondary)',
//       }}>
//         {sub}
//       </span>
//       {active && <CheckCircle2 size={13} color="var(--bg-primary)" />}
//     </button>
//   );
// }

// /* ══════════════════════════════════════════════════════════
//    SETTINGS PAGE
// ══════════════════════════════════════════════════════════ */
// export default function SettingsPage() {
//   const { lang, setLang, toggle: toggleLang } = useLang();
//   const isAr = lang === 'ar';
//   const navigate = useNavigate();
//   const { logout } = useAuthStore();
//   const { theme, setTheme } = useThemeStore();

//   /* password */
//   const [pwd, setPwd]             = useState({ current: '', newPwd: '', confirm: '' });
//   const [pwdErrors, setPwdErrors] = useState({});
//   const [showPwd, setShowPwd]     = useState(false);
//   const [pwdLoading, setPwdLoading] = useState(false);

//   /* prefs */
//   const [notifEmail, setNotifEmail] = useState(true);
//   const [notifPush,  setNotifPush]  = useState(true);
//   const [openToWork, setOpenToWork] = useState(true);
//   const [prefsLoading, setPrefsLoading] = useState(false);

//   /* delete */
//   const [showDelete,    setShowDelete]    = useState(false);
//   const [deleteConfirm, setDeleteConfirm] = useState('');
//   const [deleting,      setDeleting]      = useState(false);

//   const [collapsed, setCollapsed] = useState(false);
//   const pageTitle = isAr ? 'الإعدادات' : 'Settings';

//   /* ── handlers ── */
//   const handlePasswordChange = async () => {
//     const e = {};
//     if (!pwd.current) e.current = isAr ? 'مطلوب' : 'Required';
//     if (pwd.newPwd.length < 8) e.newPwd = isAr ? '8 أحرف على الأقل' : 'Min 8 characters';
//     else if (!/[a-z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب أن تحتوي على حرف صغير' : 'Needs a lowercase letter';
//     else if (!/[A-Z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب أن تحتوي على حرف كبير' : 'Needs an uppercase letter';
//     else if (!/[0-9]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب أن تحتوي على رقم' : 'Needs a number';
//     if (pwd.newPwd !== pwd.confirm) e.confirm = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
//     if (Object.keys(e).length) { setPwdErrors(e); return; }
//     setPwdErrors({});
//     setPwdLoading(true);
//     try {
//       await api.patch('/users/me/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
//       toast.success(isAr ? 'تم تغيير كلمة المرور ✓' : 'Password changed ✓');
//       setPwd({ current: '', newPwd: '', confirm: '' });
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل التغيير' : 'Change failed'));
//     } finally { setPwdLoading(false); }
//   };

//   const handleSavePrefs = async () => {
//     setPrefsLoading(true);
//     try {
//       await api.patch('/users/me', { openToWork, discoverable: notifEmail });
//       toast.success(isAr ? 'تم حفظ التفضيلات ✓' : 'Preferences saved ✓');
//     } catch { toast.error(isAr ? 'فشل الحفظ' : 'Save failed'); }
//     finally { setPrefsLoading(false); }
//   };

//   const handleDelete = async () => {
//     const word = isAr ? 'احذف حسابي' : 'delete my account';
//     if (deleteConfirm !== word) {
//       toast.error(isAr ? `اكتب "${word}" للتأكيد` : `Type "${word}" to confirm`); return;
//     }
//     setDeleting(true);
//     try {
//       await api.delete('/users/me');
//       toast.success(isAr ? 'تم حذف الحساب' : 'Account deleted');
//       await logout();
//       navigate('/');
//     } catch (err) {
//       toast.error(err.response?.data?.message || (isAr ? 'فشل الحذف' : 'Delete failed'));
//     } finally { setDeleting(false); }
//   };

//   const handleLangSelect = (value) => {
//     if (typeof setLang === 'function') setLang(value);
//     else if (lang !== value) toggleLang();
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes settSpin { to { transform: rotate(360deg); } }
//         @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
//         * { box-sizing: border-box; }
//         body { margin: 0; }
//         ::-webkit-scrollbar { width: 5px; }
//         ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
//         @media (max-width: 1024px) { .sett-main-scroll { padding-bottom: 72px !important; } }
//       `}</style>

//       <div style={{
//         display: 'flex', minHeight: '100vh',
//         background: 'var(--bg-primary)',
//         color: 'var(--text-primary)',
//         fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
//         direction: isAr ? 'rtl' : 'ltr',
//       }}>
//         <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

//         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
//           <MobileTopBar title={pageTitle} />

//           <main
//             className="sett-main-scroll"
//             style={{ flex: 1, overflowY: 'auto', padding: 'clamp(14px,3vw,26px)' }}
//             role="main"
//             aria-label={pageTitle}
//           >
//             {/* Page heading */}
//             <div style={{ marginBottom: 20, animation: 'fadeUp 0.3s ease' }}>
//               <h1 style={{
//                 fontSize: 'clamp(1.1rem,2.5vw,1.35rem)',
//                 fontWeight: 900, color: 'var(--text-primary)',
//                 margin: '0 0 4px', letterSpacing: '-0.025em',
//                 fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
//               }}>
//                 {isAr ? 'الإعدادات' : 'Settings'}
//               </h1>
//               <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
//                 {isAr ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
//               </p>
//             </div>

//             <div style={{ maxWidth: 620 }}>

//               {/* ── Language ── */}
//               <Section icon={Globe} title={isAr ? 'اللغة' : 'Language'}>
//                 <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
//                   {isAr ? 'اختر لغة التطبيق' : 'Choose your preferred language'}
//                 </p>
//                 <div style={{ display: 'flex', gap: 10 }}>
//                   <LangOption
//                     value="en" current={lang}
//                     onSelect={handleLangSelect}
//                      label="English"
//                   />
//                   <LangOption
//                     value="ar" current={lang}
//                     onSelect={handleLangSelect}
//                      label="العربية" 
//                   />
//                 </div>
//               </Section>

//               {/* ── Theme ── */}
//               <Section icon={Sun} title={isAr ? 'المظهر' : 'Appearance'}>
//                 <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '0 0 14px' }}>
//                   {isAr ? 'اختر مظهر التطبيق' : 'Choose your preferred theme'}
//                 </p>
//                 <div style={{ display: 'flex', gap: 10 }}>
//                   <ThemeOption
//                     value="light" current={theme}
//                     onSelect={setTheme}
//                     icon={Sun}
//                     label={isAr ? 'فاتح' : 'Light'}
//                   />
//                   <ThemeOption
//                     value="dark" current={theme}
//                     onSelect={setTheme}
//                     icon={Moon}
//                     label={isAr ? 'داكن' : 'Dark'}
//                   />
//                   {/* <ThemeOption
//                     value="system" current={theme}
//                     onSelect={setTheme}
//                     icon={Monitor}
//                     label={isAr ? 'تلقائي' : 'System'}
//                   /> */}
//                 </div>

//                 {/* Live preview strip */}
//                 <div style={{
//                   marginTop: 14, padding: '12px 14px', borderRadius: 10,
//                   background: 'var(--bg-primary)', border: '1px solid var(--border)',
//                   display: 'flex', alignItems: 'center', gap: 10,
//                 }}>
//                   <div style={{
//                     width: 28, height: 28, borderRadius: 8,
//                     background: 'var(--text-primary)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     flexShrink: 0,
//                   }}>
//                     {theme === 'dark'
//                       ? <Moon size={13} color="var(--bg-primary)" />
//                       : theme === 'system'
//                       ? <Monitor size={13} color="var(--bg-primary)" />
//                       : <Sun size={13} color="var(--bg-primary)" />}
//                   </div>
//                   <div>
//                     <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
//                       {isAr
//                         ? theme === 'dark' ? 'الوضع الداكن مفعّل' : theme === 'system' ? 'يتبع النظام' : 'الوضع الفاتح مفعّل'
//                         : theme === 'dark' ? 'Dark mode enabled' : theme === 'system' ? 'Following system preference' : 'Light mode enabled'}
//                     </p>
//                     <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: 0 }}>
//                       {isAr ? 'التغيير فوري ويُحفظ تلقائياً' : 'Changes apply instantly and save automatically'}
//                     </p>
//                   </div>
//                 </div>
//               </Section>

//               {/* ── Notifications & Visibility ── */}
//               {/* <Section icon={Bell} title={isAr ? 'الإشعارات والظهور' : 'Notifications & Visibility'}>
//                 <Toggle
//                   label={isAr ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
//                   sub={isAr ? 'استقبال التحديثات عبر البريد' : 'Receive updates and alerts via email'}
//                   checked={notifEmail} onChange={setNotifEmail}
//                 />
//                 <Toggle
//                   label={isAr ? 'الإشعارات الفورية' : 'Push Notifications'}
//                   sub={isAr ? 'إشعارات داخل التطبيق' : 'In-app notifications'}
//                   checked={notifPush} onChange={setNotifPush}
//                 />
//                 <Toggle
//                   label={isAr ? 'مفتوح للفرص الوظيفية' : 'Open to Work'}
//                   sub={isAr ? 'اجعل ملفك مرئياً للشركات' : 'Make your profile visible to hiring companies'}
//                   checked={openToWork} onChange={setOpenToWork}
//                 />
//                 <div style={{ marginTop: 16 }}>
//                   <Btn
//                     isAr={isAr}
//                     label={isAr ? 'حفظ التفضيلات' : 'Save Preferences'}
//                     loadingLabel={isAr ? 'جاري الحفظ...' : 'Saving...'}
//                     loading={prefsLoading}
//                     onClick={handleSavePrefs}
//                   />
//                 </div>
//               </Section> */}

//               {/* ── Password ── */}
//               <Section icon={Lock} title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}>
//                 <Field label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} error={pwdErrors.current}>
//                   <input
//                     type={showPwd ? 'text' : 'password'}
//                     value={pwd.current}
//                     onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
//                     style={inp(isAr)}
//                   />
//                 </Field>
//                 <Field label={isAr ? 'كلمة المرور الجديدة' : 'New Password'} error={pwdErrors.newPwd}>
//                   <input
//                     type={showPwd ? 'text' : 'password'}
//                     value={pwd.newPwd}
//                     onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
//                     placeholder={isAr ? '8 أحرف على الأقل' : 'Min 8 chars (e.g. TestPass1)'}
//                     style={inp(isAr)}
//                   />
//                 </Field>
//                 <Field label={isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} error={pwdErrors.confirm}>
//                   <input
//                     type={showPwd ? 'text' : 'password'}
//                     value={pwd.confirm}
//                     onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
//                     placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
//                     style={inp(isAr)}
//                   />
//                 </Field>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
//                   <label style={{
//                     display: 'flex', alignItems: 'center', gap: 7,
//                     fontSize: 12.5, color: 'var(--text-secondary)',
//                     cursor: 'pointer', userSelect: 'none',
//                   }}>
//                     <input
//                       type="checkbox"
//                       checked={showPwd}
//                       onChange={e => setShowPwd(e.target.checked)}
//                       style={{ accentColor: 'var(--text-primary)', width: 14, height: 14, cursor: 'pointer' }}
//                     />
//                     {isAr ? 'إظهار كلمات المرور' : 'Show passwords'}
//                   </label>
//                   <Btn
//                     isAr={isAr}
//                     label={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
//                     loadingLabel={isAr ? 'جاري التغيير...' : 'Changing...'}
//                     loading={pwdLoading}
//                     onClick={handlePasswordChange}
//                   />
//                 </div>
//               </Section>

//               {/* ── Danger zone ── */}
//               <Section icon={Trash2} title={isAr ? 'منطقة الخطر' : 'Danger Zone'} danger>
//                 {!showDelete ? (
//                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
//                     <div>
//                       <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px' }}>
//                         {isAr ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
//                       </p>
//                       <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
//                         {isAr ? 'لا يمكن التراجع عن هذا الإجراء' : 'This action cannot be undone'}
//                       </p>
//                     </div>
//                     <Btn isAr={isAr} label={isAr ? 'حذف حسابي' : 'Delete My Account'} danger onClick={() => setShowDelete(true)} />
//                   </div>
//                 ) : (
//                   <div style={{ animation: 'fadeUp 0.25s ease' }}>
//                     <div style={{
//                       background: '#FEF2F2', border: '1.5px solid #FECACA',
//                       borderRadius: 10, padding: '11px 14px', marginBottom: 16,
//                       display: 'flex', gap: 10, alignItems: 'flex-start',
//                     }}>
//                       <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
//                       <p style={{ fontSize: 12.5, color: '#EF4444', margin: 0, lineHeight: 1.6 }}>
//                         {isAr
//                           ? 'سيتم حذف حسابك وجميع بياناتك بشكل نهائي ولا يمكن استعادتها.'
//                           : 'Your account and all data will be permanently deleted and cannot be recovered.'}
//                       </p>
//                     </div>
//                     <Field label={isAr ? `اكتب: "احذف حسابي" للتأكيد` : `Type: "delete my account" to confirm`}>
//                       <input
//                         value={deleteConfirm}
//                         onChange={e => setDeleteConfirm(e.target.value)}
//                         placeholder={isAr ? 'احذف حسابي' : 'delete my account'}
//                         style={{ ...inp(isAr), color: '#EF4444' }}
//                         dir={isAr ? 'rtl' : 'ltr'}
//                       />
//                     </Field>
//                     <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
//                       <Btn
//                         isAr={isAr}
//                         label={isAr ? 'إلغاء' : 'Cancel'}
//                         secondary
//                         onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
//                       />
//                       <Btn
//                         isAr={isAr}
//                         label={isAr ? 'حذف الحساب نهائياً' : 'Delete Account'}
//                         loadingLabel={isAr ? 'جاري الحذف...' : 'Deleting...'}
//                         loading={deleting}
//                         danger
//                         disabled={deleteConfirm !== (isAr ? 'احذف حسابي' : 'delete my account')}
//                         onClick={handleDelete}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </Section>

//             </div>
//             <div style={{ height: 20 }} />
//           </main>
//         </div>
//       </div>

//       <MobileBottomNav />
//     </>
//   );
// }

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Lock, Trash2, AlertTriangle, Sun, Moon,
  CheckCircle2, Eye, EyeOff, ChevronRight, ShieldAlert,
} from 'lucide-react';
import useLang from '../../i18n';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DashboardSidebar, { MobileTopBar, MobileBottomNav } from './DashboardSidebar';

/* ══════════════════════════════════════════════════════════
   PASSWORD STRENGTH
══════════════════════════════════════════════════════════ */
function pwdStrength(p) {
  if (!p) return 0;
  let s = 0;
  if (p.length >= 8)            s++;
  if (/[a-z]/.test(p))          s++;
  if (/[A-Z]/.test(p))          s++;
  if (/[0-9]/.test(p))          s++;
  if (/[^a-zA-Z0-9]/.test(p))   s++;
  return s; // 0-5
}

const STRENGTH_COLOR = ['#EF4444', '#EF4444', '#F59E0B', '#F59E0B', '#22C55E', '#22C55E'];
const STRENGTH_LABEL = {
  ar: ['', 'ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية'],
  en: ['',  'Very weak',  'Weak',   'Fair',    'Good',  'Strong'],
};

function StrengthMeter({ value, isAr }) {
  if (!value) return null;
  const score = pwdStrength(value);
  const color = STRENGTH_COLOR[score] || '#6B7280';
  const label = STRENGTH_LABEL[isAr ? 'ar' : 'en'][score] || '';
  return (
    <div style={{ padding: '6px 14px 10px' }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= score ? color : 'var(--border)', transition: 'background 0.25s' }} />
        ))}
      </div>
      {label && (
        <span style={{ fontSize: 11, fontWeight: 600, color, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>{label}</span>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   FIELD  (floating-label style)
══════════════════════════════════════════════════════════ */
function Field({ label, error, children, extra }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          background: 'var(--bg-secondary)', borderRadius: 11, overflow: 'hidden',
          border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`,
          transition: 'border-color 0.18s, background 0.18s',
        }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
        onBlurCapture={e => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}
      >
        <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)', padding: '9px 14px 1px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </span>
        {children}
        {extra}
      </div>
      {error && (
        <p style={{ fontSize: 11.5, color: '#EF4444', margin: '5px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
          <AlertTriangle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

const inputStyle = (isAr) => ({
  display: 'block', width: '100%', padding: '2px 14px 10px',
  background: 'transparent', border: 'none', outline: 'none',
  fontSize: 14, color: 'var(--text-primary)',
  fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
  boxSizing: 'border-box',
});

/* ══════════════════════════════════════════════════════════
   SECTION — stepped timeline layout
══════════════════════════════════════════════════════════ */
function Section({ id, icon: Icon, title, sub, danger, children, last }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: last ? 0 : 8 }}>
      {/* Left accent line + icon node */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 40, flexShrink: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 11, flexShrink: 0,
          background: danger ? 'rgba(239,68,68,0.08)' : 'var(--bg-secondary)',
          border: `1.5px solid ${danger ? 'rgba(239,68,68,0.25)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={15} color={danger ? '#EF4444' : 'var(--text-secondary)'} strokeWidth={1.9} />
        </div>
        {!last && <div style={{ width: 1.5, flex: 1, background: 'var(--border)', margin: '6px 0', borderRadius: 99 }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1, marginInlineStart: 14, paddingBottom: last ? 0 : 24 }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: danger ? '#EF4444' : 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px', fontFamily: 'var(--font-en)' }}>
            {id}
          </p>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: danger ? '#EF4444' : 'var(--text-primary)', margin: '0 0 3px' }}>
            {title}
          </h3>
          {sub && <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0 }}>{sub}</p>}
        </div>
        <div style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
          borderRadius: 14, padding: '18px 20px',
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   OPTION CARD  (Language & Theme)
══════════════════════════════════════════════════════════ */
function OptionCard({ active, onClick, children, accentColor }) {
  const color = accentColor || 'var(--text-primary)';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        padding: '16px 12px', borderRadius: 12, cursor: 'pointer', outline: 'none',
        background: active ? `${color}10` : 'var(--bg-primary)',
        border: `2px solid ${active ? color : 'var(--border)'}`,
        transition: 'all 0.18s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = 'var(--text-secondary)'; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = 'var(--border)'; }}
    >
      {active && (
        <div style={{ position: 'absolute', top: 8, insetInlineEnd: 8 }}>
          <CheckCircle2 size={14} color={color} />
        </div>
      )}
      {children}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   PRIMARY BUTTON
══════════════════════════════════════════════════════════ */
function Btn({ label, loadingLabel, loading, onClick, disabled, danger, secondary, isAr, small }) {
  const bg     = danger ? '#EF4444' : secondary ? 'transparent' : 'var(--text-primary)';
  const color  = danger ? '#fff'    : secondary ? 'var(--text-secondary)' : 'var(--bg-primary)';
  const border = secondary ? '1.5px solid var(--border)' : 'none';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        padding: small ? '8px 16px' : '11px 22px', borderRadius: 10, border,
        background: (disabled && !secondary) ? 'var(--bg-secondary)' : bg,
        color: (disabled && !secondary) ? 'var(--text-secondary)' : color,
        fontSize: small ? 12.5 : 13.5, fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        display: 'inline-flex', alignItems: 'center', gap: 7,
        transition: 'opacity 0.18s, transform 0.15s',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.opacity = '0.84'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = loading ? '0.7' : '1'; e.currentTarget.style.transform = 'none'; }}
    >
      {loading ? (
        <>
          <span style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: danger ? '#fff' : secondary ? 'var(--text-secondary)' : 'var(--bg-primary)', borderRadius: '50%', animation: 'settSpin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
          {loadingLabel}
        </>
      ) : label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const { lang, setLang, toggle: toggleLang } = useLang();
  const isAr   = lang === 'ar';
  const font   = isAr ? 'var(--font-ar)' : 'var(--font-en)';
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);

  /* ── password ── */
  const [pwd, setPwd]               = useState({ current: '', newPwd: '', confirm: '' });
  const [pwdErrors, setPwdErrors]   = useState({});
  const [showPwd, setShowPwd]       = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  /* ── delete ── */
  const [showDelete,    setShowDelete]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting,      setDeleting]      = useState(false);

  const handleLangSelect = useCallback((value) => {
    if (typeof setLang === 'function') setLang(value);
    else if (lang !== value) toggleLang();
  }, [lang, setLang, toggleLang]);

  const handlePasswordChange = async () => {
    const e = {};
    if (!pwd.current)              e.current = isAr ? 'مطلوب'              : 'Required';
    if (pwd.newPwd.length < 8)     e.newPwd  = isAr ? '8 أحرف على الأقل'  : 'Min 8 characters';
    else if (!/[a-z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'أضف حرفاً صغيراً' : 'Add a lowercase letter';
    else if (!/[A-Z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'أضف حرفاً كبيراً' : 'Add an uppercase letter';
    else if (!/[0-9]/.test(pwd.newPwd)) e.newPwd = isAr ? 'أضف رقماً'         : 'Add a number';
    if (pwd.newPwd !== pwd.confirm) e.confirm = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    if (Object.keys(e).length) { setPwdErrors(e); return; }
    setPwdErrors({});
    setPwdLoading(true);
    try {
      await api.patch('/users/me/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success(isAr ? 'تم تغيير كلمة المرور ✓' : 'Password changed ✓');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل التغيير' : 'Change failed'));
    } finally { setPwdLoading(false); }
  };

  const handleDelete = async () => {
    const word = isAr ? 'احذف حسابي' : 'delete my account';
    if (deleteConfirm !== word) { toast.error(isAr ? `اكتب "${word}" للتأكيد` : `Type "${word}" to confirm`); return; }
    setDeleting(true);
    try {
      await api.delete('/users/me');
      toast.success(isAr ? 'تم حذف الحساب' : 'Account deleted');
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل الحذف' : 'Delete failed'));
    } finally { setDeleting(false); }
  };

  const CONFIRM_WORD = isAr ? 'احذف حسابي' : 'delete my account';

  return (
    <>
      <style>{`
        @keyframes settSpin { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }
        @media (max-width: 1024px) { .sett-main { padding-bottom: 82px !important; } }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: font, direction: isAr ? 'rtl' : 'ltr' }}>
        <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <MobileTopBar title={isAr ? 'الإعدادات' : 'Settings'} />

          <main className="sett-main" style={{ flex: 1, overflowY: 'auto', padding: 'clamp(16px,3vw,28px)' }}>
            <div style={{ maxWidth: 580, margin: '0 auto' }}>

              {/* ── Page heading ── */}
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 'clamp(1.15rem,2.8vw,1.4rem)', fontWeight: 900, margin: '0 0 4px', letterSpacing: '-0.03em' }}>
                  {isAr ? 'الإعدادات' : 'Settings'}
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'إدارة حسابك وتفضيلاتك' : 'Manage your account and preferences'}
                </p>
              </div>

              {/* ════════ 01 — LANGUAGE ════════ */}
              <Section
                id="01"
                icon={Globe}
                title={isAr ? 'اللغة' : 'Language'}
                sub={isAr ? 'اختر لغة الواجهة' : 'Choose your interface language'}
              >
                <div style={{ display: 'flex', gap: 10 }}>
                  <OptionCard active={lang === 'en'} onClick={() => handleLangSelect('en')} accentColor="#818CF8">
                    {/* <span style={{ fontSize: 26 }}>🇺🇸</span> */}
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: lang === 'en' ? '#818CF8' : 'var(--text-primary)', fontFamily: 'var(--font-en)' }}>English</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-en)' }}>Left to right</span>
                  </OptionCard>
                  <OptionCard active={lang === 'ar'} onClick={() => handleLangSelect('ar')} accentColor="#F59E0B">
                    {/* <span style={{ fontSize: 26 }}></span> */}
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: lang === 'ar' ? '#F59E0B' : 'var(--text-primary)', fontFamily: 'var(--font-ar)' }}>العربية</span>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-ar)' }}>من اليمين لليسار</span>
                  </OptionCard>
                </div>
              </Section>

              {/* ════════ 02 — THEME ════════ */}
              <Section
                id="02"
                icon={Sun}
                title={isAr ? 'المظهر' : 'Appearance'}
                sub={isAr ? 'اختر مظهر التطبيق' : 'Choose your preferred theme'}
              >
                <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                  <OptionCard active={theme === 'light'} onClick={() => setTheme('light')} accentColor="#F59E0B">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: theme === 'light' ? 'rgba(245,158,11,0.12)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                      <Sun size={18} color={theme === 'light' ? '#F59E0B' : 'var(--text-secondary)'} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme === 'light' ? '#F59E0B' : 'var(--text-primary)' }}>
                      {isAr ? 'فاتح' : 'Light'}
                    </span>
                  </OptionCard>
                  <OptionCard active={theme === 'dark'} onClick={() => setTheme('dark')} accentColor="#818CF8">
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: theme === 'dark' ? 'rgba(129,140,248,0.12)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                      <Moon size={18} color={theme === 'dark' ? '#818CF8' : 'var(--text-secondary)'} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme === 'dark' ? '#818CF8' : 'var(--text-primary)' }}>
                      {isAr ? 'داكن' : 'Dark'}
                    </span>
                  </OptionCard>
                </div>

                {/* Live preview strip */}
                <div style={{ padding: '11px 14px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {theme === 'dark'
                      ? <Moon size={13} color="var(--bg-primary)" />
                      : <Sun size={13} color="var(--bg-primary)" />}
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {isAr
                        ? theme === 'dark' ? 'الوضع الداكن مفعّل' : 'الوضع الفاتح مفعّل'
                        : theme === 'dark' ? 'Dark mode enabled'   : 'Light mode enabled'}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '1px 0 0' }}>
                      {isAr ? 'التغيير فوري ويُحفظ تلقائياً' : 'Changes apply instantly and save automatically'}
                    </p>
                  </div>
                </div>
              </Section>

              {/* ════════ 03 — PASSWORD ════════ */}
              <Section
                id="03"
                icon={Lock}
                title={isAr ? 'كلمة المرور' : 'Password'}
                sub={isAr ? 'غيّر كلمة مرورك بشكل دوري لحماية حسابك' : 'Change your password periodically to keep your account secure'}
              >
                {/* Current password */}
                <Field label={isAr ? 'كلمة المرور الحالية' : 'Current Password'} error={pwdErrors.current}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={pwd.current}
                      onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
                      style={{ ...inputStyle(isAr), flex: 1 }}
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0 12px 0 0', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </Field>

                {/* New password + strength */}
                <Field
                  label={isAr ? 'كلمة المرور الجديدة' : 'New Password'}
                  error={pwdErrors.newPwd}
                  extra={<StrengthMeter value={pwd.newPwd} isAr={isAr} />}
                >
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwd.newPwd}
                    onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                    placeholder={isAr ? 'حرف كبير + صغير + رقم...' : 'Uppercase + lowercase + number…'}
                    style={inputStyle(isAr)}
                  />
                </Field>

                {/* Confirm */}
                <Field label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} error={pwdErrors.confirm}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={pwd.confirm}
                      onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                      placeholder={isAr ? 'أعد كتابة كلمة المرور الجديدة' : 'Re-enter your new password'}
                      style={{ ...inputStyle(isAr), flex: 1 }}
                    />
                    {pwd.confirm && pwd.confirm === pwd.newPwd && (
                      <CheckCircle2 size={15} color="#22C55E" style={{ flexShrink: 0, marginInlineEnd: 12 }} />
                    )}
                  </div>
                </Field>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)}
                      style={{ accentColor: 'var(--text-primary)', width: 14, height: 14, cursor: 'pointer' }} />
                    {isAr ? 'إظهار كلمة المرور' : 'Show password'}
                  </label>
                  <Btn
                    isAr={isAr}
                    label={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                    loadingLabel={isAr ? 'جاري التغيير...' : 'Changing...'}
                    loading={pwdLoading}
                    onClick={handlePasswordChange}
                  />
                </div>
              </Section>

              {/* ════════ 04 — DANGER ZONE ════════ */}
              <Section
                id="04"
                icon={ShieldAlert}
                title={isAr ? 'منطقة الخطر' : 'Danger Zone'}
                sub={isAr ? 'إجراءات لا يمكن التراجع عنها' : 'Irreversible actions — proceed with caution'}
                danger
                last
              >
                {!showDelete ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 3px' }}>
                        {isAr ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>
                        {isAr ? 'سيُحذف حسابك وجميع بياناتك بلا رجعة' : 'Your account and all data will be erased permanently'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDelete(true)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 99, border: '1.5px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: font, transition: 'all 0.18s', whiteSpace: 'nowrap' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = '#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
                    >
                      <Trash2 size={14} /> {isAr ? 'حذف حسابي' : 'Delete my account'}
                      <ChevronRight size={13} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
                    </button>
                  </div>
                ) : (
                  <div style={{ animation: 'fadeDown 0.22s ease' }}>
                    {/* Warning */}
                    <div style={{ background: 'rgba(239,68,68,0.06)', border: '1.5px solid rgba(239,68,68,0.22)', borderRadius: 11, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <AlertTriangle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: '#EF4444', margin: 0, lineHeight: 1.6, fontFamily: font }}>
                        {isAr
                          ? 'سيتم حذف حسابك وجميع بياناتك بشكل نهائي ولا يمكن استعادتها — سيرتك الذاتية، تقدماتك، نقاطك، كل شيء.'
                          : 'Your account and all associated data — CV, applications, points, everything — will be permanently deleted and cannot be recovered.'}
                      </p>
                    </div>

                    {/* Confirm input */}
                    <Field label={isAr ? `اكتب: "${CONFIRM_WORD}" للتأكيد` : `Type: "${CONFIRM_WORD}" to confirm`}>
                      <input
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder={CONFIRM_WORD}
                        dir={isAr ? 'rtl' : 'ltr'}
                        style={{ ...inputStyle(isAr), color: '#EF4444', fontWeight: 600 }}
                        autoComplete="off"
                      />
                    </Field>

                    {/* Match indicator */}
                    {deleteConfirm.length > 0 && (
                      <p style={{ fontSize: 12, marginBottom: 14, marginTop: -6, display: 'flex', alignItems: 'center', gap: 5, color: deleteConfirm === CONFIRM_WORD ? '#22C55E' : '#EF4444', fontFamily: font }}>
                        {deleteConfirm === CONFIRM_WORD
                          ? <><CheckCircle2 size={12} /> {isAr ? 'مطابق — يمكنك المتابعة' : 'Match confirmed — you may proceed'}</>
                          : <><AlertTriangle size={12} /> {isAr ? 'غير مطابق بعد' : 'Not matching yet'}</>
                        }
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                      <Btn
                        isAr={isAr}
                        label={isAr ? 'إلغاء' : 'Cancel'}
                        secondary small
                        onClick={() => { setShowDelete(false); setDeleteConfirm(''); }}
                      />
                      <Btn
                        isAr={isAr}
                        label={isAr ? 'حذف الحساب نهائياً' : 'Delete Account Permanently'}
                        loadingLabel={isAr ? 'جاري الحذف...' : 'Deleting...'}
                        loading={deleting}
                        danger small
                        disabled={deleteConfirm !== CONFIRM_WORD}
                        onClick={handleDelete}
                      />
                    </div>
                  </div>
                )}
              </Section>

              <div style={{ height: 24 }} />
            </div>
          </main>
        </div>
      </div>

      <MobileBottomNav />
    </>
  );
}