import { useState } from 'react';
import {
  Globe, Lock, Sun, Moon, Monitor,
  CheckCircle2, Eye, EyeOff, Palette,
  ChevronRight, Bell, Loader2,
} from 'lucide-react';
import CompanyLayout from './CompanyLayout';
import useLangStore from '../../i18n';
import useAuthStore from '../../store/authStore';
import useThemeStore, { ACCENTS } from '../../store/themeStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

/* ── Section card ────────────────────────────────────────── */
function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div style={{ background: 'var(--bg-primary)', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color="var(--text-secondary)" strokeWidth={1.9} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {/* Body */}
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  );
}

/* ── Toggle option pill ──────────────────────────────────── */
function OptionPill({ value, current, onSelect, icon: Icon, label }) {
  const active = value === current;
  return (
    <button onClick={() => onSelect(value)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, border: `1.5px solid ${active ? 'var(--text-primary)' : 'var(--border)'}`, background: active ? 'var(--text-primary)' : 'transparent', color: active ? 'var(--bg-primary)' : 'var(--text-secondary)', fontSize: 13, fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s' }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
      {Icon && <Icon size={13} strokeWidth={active ? 2.5 : 1.9} style={{ flexShrink: 0 }} />}
      {label}
      {active && <CheckCircle2 size={13} style={{ marginInlineStart: 2, flexShrink: 0 }} />}
    </button>
  );
}

/* ── Accent swatch ───────────────────────────────────────── */
function AccentSwatch({ accent, current, onSelect, isAr }) {
  const active = accent.id === current;
  return (
    <button onClick={() => onSelect(accent.id)} title={isAr ? accent.labelAr : accent.label}
      style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid ${active ? 'var(--text-primary)' : 'transparent'}`, padding: 2, cursor: 'pointer', background: 'none', transition: 'all 0.18s', outline: 'none' }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: accent.dot, boxShadow: active ? `0 0 0 2px ${accent.dot}40` : 'none', transition: 'box-shadow 0.18s' }} />
    </button>
  );
}

/* ── Password input ──────────────────────────────────────── */
function PwdInput({ label, value, onChange, show, onToggleShow, error, isAr }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', borderRadius: 10, border: `1.5px solid ${error ? '#EF4444' : 'var(--border)'}`, background: 'var(--bg-secondary)', overflow: 'hidden', transition: 'border-color 0.2s' }}
        onFocusCapture={e => e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--text-primary)'}
        onBlurCapture={e => e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--border)'}>
        <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
          style={{ flex: 1, padding: '11px 14px', border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' }} dir="ltr" />
        <button onClick={onToggleShow} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}>
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: '#EF4444', margin: '4px 0 0' }}>⚠ {error}</p>}
    </div>
  );
}

/* ── Toggle row ──────────────────────────────────────────── */
function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
      <div>
        <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{sub}</p>}
      </div>
      <button onClick={() => onChange(!checked)} style={{ width: 44, height: 24, borderRadius: 99, border: 'none', cursor: 'pointer', background: checked ? 'var(--text-primary)' : 'var(--border)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <span style={{ position: 'absolute', top: 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s, right 0.2s', insetInlineStart: checked ? 20 : 2, boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════ */
export default function CompanySettingsPage() {
  const { lang, toggleLang, setLang } = useLangStore();
  const isAr = lang === 'ar';
  const { theme, setTheme, accent, setAccent } = useThemeStore();

  // Password state
  const [pwd, setPwd]     = useState({ current: '', newPwd: '', confirm: '' });
  const [errs, setErrs]   = useState({});
  const [show, setShow]   = useState({ current: false, newPwd: false, confirm: false });
  const [pwdLoading, setPwdLoading] = useState(false);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush,  setNotifPush]  = useState(true);

  const handleLang = (v) => {
    if (typeof setLang === 'function') setLang(v);
    else if (lang !== v) toggleLang();
  };

  const handlePassword = async () => {
    const e = {};
    if (!pwd.current) e.current = isAr ? 'مطلوب' : 'Required';
    if (pwd.newPwd.length < 8)          e.newPwd = isAr ? '8 أحرف على الأقل' : 'Min 8 characters';
    else if (!/[a-z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب حرف صغير'     : 'Needs lowercase';
    else if (!/[A-Z]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب حرف كبير'     : 'Needs uppercase';
    else if (!/[0-9]/.test(pwd.newPwd)) e.newPwd = isAr ? 'يجب رقم'          : 'Needs a number';
    if (pwd.newPwd !== pwd.confirm) e.confirm = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({});
    setPwdLoading(true);
    try {
      await api.patch('/users/me/password', { currentPassword: pwd.current, newPassword: pwd.newPwd });
      toast.success(isAr ? 'تم تغيير كلمة المرور ✓' : 'Password changed ✓');
      setPwd({ current: '', newPwd: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل التغيير' : 'Change failed'));
    } finally { setPwdLoading(false); }
  };

  const toggleShow = (k) => setShow(p => ({ ...p, [k]: !p[k] }));

  // Live theme preview colors
  const THEME_PREVIEW = {
    light:  { bg: '#FFFFFF', text: '#1A1A1E', sub: '#F4F5F8' },
    dark:   { bg: '#000000', text: '#F4F5F8', sub: '#2C2D31' },
    system: { bg: 'linear-gradient(135deg,#fff 50%,#000 50%)', text: '#888', sub: '#ccc' },
  };
  const prev = THEME_PREVIEW[theme] || THEME_PREVIEW.light;

  return (
    <CompanyLayout title={isAr ? 'الإعدادات' : 'Settings'}>
      <style>{'@keyframes csSpin{to{transform:rotate(360deg)}}'}</style>

      <div style={{ maxWidth: 640 }}>

        {/* ── Language ── */}
        <Section icon={Globe}
          title={isAr ? 'اللغة' : 'Language'}
          subtitle={isAr ? 'اختر لغة واجهة التطبيق' : 'Choose the app interface language'}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <OptionPill value="ar" current={lang} onSelect={handleLang} label="العربية " />
            <OptionPill value="en" current={lang} onSelect={handleLang} label="English " />
          </div>
        </Section>

        {/* ── Appearance ── */}
        <Section icon={Sun}
          title={isAr ? 'المظهر' : 'Appearance'}
          subtitle={isAr ? 'اختر مظهر التطبيق' : 'Light, dark, or system theme'}>

          {/* Theme options */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
            <OptionPill value="light"  current={theme} onSelect={setTheme} icon={Sun}     label={isAr ? 'فاتح' : 'Light'}  />
            <OptionPill value="dark"   current={theme} onSelect={setTheme} icon={Moon}    label={isAr ? 'داكن' : 'Dark'}   />
            <OptionPill value="system" current={theme} onSelect={setTheme} icon={Monitor} label={isAr ? 'تلقائي' : 'Auto'} />
          </div>

          {/* Live preview */}
          <div style={{ padding: '12px 14px', borderRadius: 11, background: typeof prev.bg === 'string' && prev.bg.includes('gradient') ? prev.bg : prev.bg, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: typeof prev.bg === 'string' && prev.bg.includes('gradient') ? '#888' : prev.sub, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, margin: 0, color: typeof prev.bg === 'string' && prev.bg.includes('gradient') ? '#888' : prev.text }}>{isAr ? 'معاينة المظهر' : 'Theme preview'}</p>
              <p style={{ fontSize: 11, margin: '1px 0 0', color: typeof prev.bg === 'string' && prev.bg.includes('gradient') ? '#aaa' : prev.text, opacity: 0.6 }}>{isAr ? 'هكذا سيبدو التطبيق' : 'This is how the app looks'}</p>
            </div>
            <div style={{ marginInlineStart: 'auto', width: 14, height: 14, borderRadius: '50%', background: theme === 'light' ? '#F59E0B' : theme === 'dark' ? '#8B5CF6' : '#22C55E' }} />
          </div>

          {/* Accent colors */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Palette size={14} color="var(--text-secondary)" />
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                {isAr ? 'لون التمييز' : 'Accent Color'}
              </p>
              <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginInlineStart: 4 }}>
                ({isAr ? ACCENTS.find(a => a.id === accent)?.labelAr : ACCENTS.find(a => a.id === accent)?.label})
              </span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              {ACCENTS.map(a => (
                <AccentSwatch key={a.id} accent={a} current={accent} onSelect={setAccent} isAr={isAr} />
              ))}
            </div>
            {/* Color labels */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {ACCENTS.map(a => (
                <button key={a.id} onClick={() => setAccent(a.id)} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, border: `1px solid ${a.id === accent ? 'var(--text-primary)' : 'var(--border)'}`, background: a.id === accent ? 'var(--text-primary)' : 'transparent', color: a.id === accent ? 'var(--bg-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {isAr ? a.labelAr : a.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Notifications ── */}
        <Section icon={Bell}
          title={isAr ? 'الإشعارات' : 'Notifications'}
          subtitle={isAr ? 'التحكم في أنواع الإشعارات' : 'Control what notifications you receive'}>
          <ToggleRow
            label={isAr ? 'إشعارات البريد الإلكتروني' : 'Email notifications'}
            sub={isAr ? 'استقبال تنبيهات عبر البريد' : 'Get alerts via email'}
            checked={notifEmail}
            onChange={setNotifEmail} />
          <ToggleRow
            label={isAr ? 'إشعارات داخل التطبيق' : 'In-app notifications'}
            sub={isAr ? 'تنبيهات الوظائف والمتقدمين' : 'Jobs and applicant alerts'}
            checked={notifPush}
            onChange={setNotifPush} />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => toast.success(isAr ? 'تم الحفظ ✓' : 'Saved ✓')}
              style={{ padding: '9px 20px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'حفظ' : 'Save'}
            </button>
          </div>
        </Section>

        {/* ── Password ── */}
        <Section icon={Lock}
          title={isAr ? 'كلمة المرور' : 'Password'}
          subtitle={isAr ? 'غيّر كلمة مرور حسابك' : 'Update your account password'}>
          <PwdInput label={isAr ? 'كلمة المرور الحالية' : 'Current password'} value={pwd.current} onChange={v => setPwd(p => ({ ...p, current: v }))} show={show.current} onToggleShow={() => toggleShow('current')} error={errs.current} isAr={isAr} />
          <PwdInput label={isAr ? 'كلمة المرور الجديدة' : 'New password'}     value={pwd.newPwd} onChange={v => setPwd(p => ({ ...p, newPwd: v }))} show={show.newPwd} onToggleShow={() => toggleShow('newPwd')}   error={errs.newPwd}  isAr={isAr} />
          <PwdInput label={isAr ? 'تأكيد كلمة المرور'  : 'Confirm password'}  value={pwd.confirm} onChange={v => setPwd(p => ({ ...p, confirm: v }))} show={show.confirm} onToggleShow={() => toggleShow('confirm')} error={errs.confirm} isAr={isAr} />

          {/* Password strength */}
          {pwd.newPwd && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                {[
                  pwd.newPwd.length >= 8,
                  /[a-z]/.test(pwd.newPwd),
                  /[A-Z]/.test(pwd.newPwd),
                  /[0-9]/.test(pwd.newPwd),
                  /[^a-zA-Z0-9]/.test(pwd.newPwd),
                ].map((ok, i) => (
                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: ok ? (i < 2 ? '#F59E0B' : i < 4 ? '#3B82F6' : '#22C55E') : 'var(--border)', transition: 'background 0.2s' }} />
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: 0 }}>
                {[/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].every(r => r.test(pwd.newPwd)) && pwd.newPwd.length >= 8
                  ? (isAr ? '✓ كلمة مرور قوية' : '✓ Strong password')
                  : (isAr ? 'أضف أحرفاً كبيرة وصغيرة وأرقاماً ورموزاً' : 'Add uppercase, lowercase, numbers & symbols')}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handlePassword} disabled={pwdLoading} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 10, background: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none', fontSize: 13.5, fontWeight: 700, cursor: pwdLoading ? 'default' : 'pointer', fontFamily: 'inherit', opacity: pwdLoading ? 0.7 : 1 }}>
              {pwdLoading && <Loader2 size={14} style={{ animation: 'csSpin .8s linear infinite' }} />}
              {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
            </button>
          </div>
        </Section>

      </div>
    </CompanyLayout>
  );
}