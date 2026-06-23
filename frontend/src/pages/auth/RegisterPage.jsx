import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import useAuthStore from '../../store/authStore';
import useLangStore from '../../i18n';
import OtpInput from '../../components/auth/OtpInput';
import LogoGold from '../../assets/images/LogoGold.png';

const VITE_API_URL = import.meta.env.VITE_API_URL;

/* ── Password strength ── */
function PasswordStrength({ password, isAr }) {
  if (!password) return null;
  const checks = [
    password.length >= 8,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E'];
  const labels = isAr
    ? ['ضعيف', 'متوسط', 'جيد', 'قوي ✓']
    : ['Weak', 'Fair', 'Good', 'Strong ✓'];
  const hints = [];
  if (!checks[0]) hints.push(isAr ? '8 أحرف' : '8 chars');
  if (!checks[1]) hints.push(isAr ? 'حرف صغير' : 'lowercase');
  if (!checks[2]) hints.push(isAr ? 'حرف كبير' : 'uppercase');
  if (!checks[3]) hints.push(isAr ? 'رقم' : 'number');
  return (
    <div style={{ marginTop: 5 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? colors[score - 1] : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: 11, color: colors[score - 1] || 'var(--text-secondary)' }}>
        {labels[score - 1] || ''}
        {hints.length > 0 && score > 0 ? ` — ${isAr ? 'يحتاج:' : 'needs:'} ${hints.join(', ')}` : ''}
      </p>
    </div>
  );
}

/* ── Google button ── */
function GoogleBtn({ label }) {
  return (
    <button type="button"
      onClick={() => { window.location.href = `${VITE_API_URL}/auth/google`; }}
      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--bg-primary)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-ar)', marginBottom: 8, transition: 'border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
        <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  );
}

/* ── Field ── */
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.2s, background 0.2s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--accent-400)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)';     e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
        <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '9px 14px 2px' }}>{label}</span>
        {children}
      </div>
      {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

const inp = { display: 'block', width: '100%', padding: '2px 14px 9px', background: 'transparent', border: 'none', outline: 'none', fontSize: 13.5, color: 'var(--text-primary)', fontFamily: 'var(--font-en)' };

/* ── Submit button ── */
function SubmitBtn({ loading, loadingLabel, label, disabled, onClick }) {
  return (
    <button type={onClick ? 'button' : 'submit'} onClick={onClick} disabled={disabled || loading}
      style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-ar)', cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled || loading ? 0.65 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'opacity 0.2s, transform 0.2s' }}
      onMouseEnter={e => { if (!disabled && !loading) { e.currentTarget.style.opacity = '0.82'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity = disabled || loading ? '0.65' : '1'; e.currentTarget.style.transform = 'none'; }}>
      {loading
        ? <><span style={{ width: 15, height: 15, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--bg-primary)', borderRadius: '50%', animation: 'rgSpin 0.8s linear infinite', display: 'inline-block', flexShrink: 0 }} />{loadingLabel}</>
        : label}
    </button>
  );
}

/* ── OTP screen ── */
function OtpScreen({ email, userId, isAr, onSuccess }) {
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [otp,      setOtp]  = useState('');
  const [error,    setErr]  = useState('');
  const [countdown, setCD]  = useState(0);

  const verify = async () => {
    if (otp.length !== 6) return;
    setErr('');
    const r = await verifyOtp(userId, otp, 'email_verify');
    if (r.success) {
      toast.success(isAr ? 'تم تفعيل حسابك! 🎉' : 'Account activated! 🎉');
      onSuccess();
    } else {
      setErr(r.message || (isAr ? 'الرمز غير صحيح' : 'Invalid code'));
    }
  };

  const resend = async () => {
    if (countdown > 0) return;
    const r = await resendOtp(userId, 'email_verify');
    if (r.success) {
      toast.success(isAr ? 'تم إرسال رمز جديد' : 'New code sent');
      setCD(60);
      const iv = setInterval(() => setCD(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
    } else {
      toast.error(isAr ? 'فشل الإرسال' : 'Failed to resend');
    }
  };

  return (
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-secondary)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>
        📧
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
        {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {isAr ? 'أرسلنا رمز التحقق إلى' : 'We sent a 6-digit code to'}
      </p>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 28, direction: 'ltr' }}>
        {email}
      </p>

      <OtpInput value={otp} onChange={setOtp} length={6} hasError={!!error} />

      {error && (
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, fontSize: 13, color: 'var(--danger)' }}>
          ⚠ {error}
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <SubmitBtn
          label={isAr ? 'تفعيل الحساب ✓' : 'Activate Account ✓'}
          loading={isLoading}
          loadingLabel={isAr ? 'جاري التحقق...' : 'Verifying...'}
          disabled={otp.length !== 6}
          onClick={verify}
        />
      </div>

      <p style={{ marginTop: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
        {isAr ? 'لم يصلك الرمز؟ ' : "Didn't receive it? "}
        {countdown > 0
          ? <span style={{ color: 'var(--text-secondary)' }}>{isAr ? `إعادة الإرسال خلال ${countdown}ث` : `Resend in ${countdown}s`}</span>
          : <button type="button" onClick={resend} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-ar)' }}>
              {isAr ? 'إعادة إرسال' : 'Resend'}
            </button>
        }
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   REGISTER PAGE
══════════════════════════════════════════════════════════ */
export default function RegisterPage() {
  const [params]          = useSearchParams();
  const navigate          = useNavigate();
  const { lang, dir }     = useLangStore();
  const isAr              = lang === 'ar';
  const type              = params.get('type') || 'jobseeker';
  const isEmployer        = type === 'employer';
  const role              = isEmployer ? 'company' : 'user';

  const { register: doRegister, isLoading } = useAuthStore();
//   const { isAuthenticated } = useAuthStore();
// if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // ── State ──────────────────────────────────────────────
  const [step,     setStep]     = useState('form'); // 'form' | 'otp'
  const [userId,   setUserId]   = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [form,     setForm]     = useState({
    fullName: '', email: '', password: '', confirmPass: '',
    terms: false, companyName: '', companySize: '',
  });

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Validation ─────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2)
      e.fullName = isAr ? 'الاسم يجب أن يكون حرفين على الأقل' : 'Name must be at least 2 characters';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      e.email = isAr ? 'البريد غير صحيح' : 'Invalid email';
    if (form.password.length < 8)
      e.password = isAr ? 'كلمة المرور 8 أحرف على الأقل' : 'Min 8 characters';
    else if (!/[a-z]/.test(form.password))
      e.password = isAr ? 'يجب أن تحتوي على حرف صغير' : 'Must contain a lowercase letter';
    else if (!/[A-Z]/.test(form.password))
      e.password = isAr ? 'يجب أن تحتوي على حرف كبير' : 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(form.password))
      e.password = isAr ? 'يجب أن تحتوي على رقم' : 'Must contain a number';
    if (form.password !== form.confirmPass)
      e.confirmPass = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    if (!form.terms)
      e.terms = isAr ? 'يجب الموافقة على الشروط' : 'You must agree to the terms';
    if (isEmployer && !form.companyName.trim())
      e.companyName = isAr ? 'اسم الشركة مطلوب' : 'Company name is required';
    return e;
  };

  // ── Submit ─────────────────────────────────────────────
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const errs = validate();
  //   if (Object.keys(errs).length > 0) { setErrors(errs); return; }
  //   setErrors({});

  //   const payload = {
  //     fullName: form.fullName.trim(),
  //     email:    form.email.toLowerCase(),
  //     password: form.password,
  //     role,
  //     ...(isEmployer && { companyName: form.companyName, companySize: form.companySize }),
  //   };

  //   const r = await doRegister(payload);

  //   if (r.success) {
  //     // Store email + userId then switch to OTP screen
  //     setRegEmail(r.email || form.email.toLowerCase());
  //     setUserId(r.userId);
  //     setStep('otp');                         // ← this triggers OTP screen
  //   } else {
  //     toast.error(r.message || (isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again'));
  //   }
  // };
const handleSubmit = async (e) => {
  e.preventDefault();
  const errs = validate();
  if (Object.keys(errs).length > 0) { setErrors(errs); return; }
  setErrors({});

  const payload = {
    fullName: form.fullName.trim(),
    email:    form.email.toLowerCase(),
    password: form.password,
    role,
    ...(isEmployer && { companyName: form.companyName, companySize: form.companySize }),
  };

  const r = await doRegister(payload);

  if (r.success) {
    // ✅ FIX: guard against missing userId before switching to OTP screen
    if (!r.userId) {
      toast.error(isAr ? 'خطأ في الخادم، حاول مرة أخرى' : 'Server error, please try again');
      return;
    }
    setRegEmail(r.email || form.email.toLowerCase());
    setUserId(r.userId);
    setStep('otp');
  } else {
    toast.error(r.message || (isAr ? 'حدث خطأ، حاول مرة أخرى' : 'Something went wrong, please try again'));
  }
};
  const eyePos = isAr ? { left: 12 } : { right: 12 };

  // ══════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════
  return (
    <>
      <style>{'@keyframes rgSpin { to { transform: rotate(360deg); } }'}</style>

      <div dir={dir} style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px clamp(24px,5vw,52px)', minHeight: '100vh' }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', marginBottom: 28 }}>
            <img src={LogoGold} alt="TalexHub" style={{ height: 38, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', padding: '8px 0 40px' }}>

            {/* ── OTP screen ── */}
            {step === 'otp' && (
              <OtpScreen
                email={regEmail}
                userId={userId}
                isAr={isAr}
                onSuccess={() => {
                  navigate('/login?registered=1', { replace: true });
                }}
              />
            )}

            {/* ── Registration form ── */}
            {step === 'form' && (
              <div style={{ width: '100%' }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', textAlign: 'center', marginBottom: 6, letterSpacing: '-0.02em' }}>
                  {isAr
                    ? (isEmployer ? 'إنشاء حساب صاحب عمل' : 'إنشاء حسابك مجاناً')
                    : (isEmployer ? 'Create Employer Account' : 'Create Free Account')}
                </h1>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 22 }}>
                  {isAr ? 'لديك حساب؟ ' : 'Have an account? '}
                  <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
                    {isAr ? 'سجّل الدخول' : 'Sign in'}
                  </Link>
                </p>

                <GoogleBtn label={isAr ? 'المتابعة بحساب Google' : 'Continue with Google'} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{isAr ? 'أو بالبريد الإلكتروني' : 'or with email'}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                <form onSubmit={handleSubmit} noValidate>

                  {/* Full name */}
                  <Field label={isAr ? 'الاسم الكامل' : 'Full Name'} error={errors.fullName}>
                    <input type="text" value={form.fullName} onChange={e => upd('fullName', e.target.value)}
                      placeholder={isAr ? 'محمد أحمد' : 'John Smith'} style={inp} />
                  </Field>

                  {/* Employer fields */}
                  {isEmployer && (
                    <Field label={isAr ? 'اسم الشركة' : 'Company Name'} error={errors.companyName}>
                      <input type="text" value={form.companyName} onChange={e => upd('companyName', e.target.value)}
                        placeholder={isAr ? 'شركة التقنية المتقدمة' : 'Tech Co.'} style={inp} />
                    </Field>
                  )}
                  {isEmployer && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                        <span style={{ display: 'block', fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', padding: '9px 14px 2px' }}>
                          {isAr ? 'حجم الشركة' : 'Company Size'}
                        </span>
                        <select value={form.companySize} onChange={e => upd('companySize', e.target.value)}
                          style={{ ...inp, cursor: 'pointer', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                          <option value="">{isAr ? 'اختر الحجم' : 'Select size'}</option>
                          {['1-10', '11-50', '51-200', '201-500', '500+'].map(v => (
                            <option key={v} value={v}>{v} {isAr ? 'موظف' : 'employees'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <Field label={isAr ? 'البريد الإلكتروني' : 'Email'} error={errors.email}>
                    <input type="email" value={form.email} dir="ltr" onChange={e => upd('email', e.target.value)}
                      placeholder="you@example.com" style={{ ...inp, textAlign: 'left', direction: 'ltr' }} />
                  </Field>

                  {/* Password */}
                  <Field label={isAr ? 'كلمة المرور' : 'Password'} error={errors.password}>
                    <div style={{ position: 'relative' }}>
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => upd('password', e.target.value)}
                        placeholder={isAr ? '8 أحرف على الأقل' : 'Min 8 chars (e.g. TestPass1)'}
                        style={{ ...inp, paddingInlineEnd: 40 }} />
                      <button type="button" onClick={() => setShowPass(s => !s)}
                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', ...eyePos }}>
                        {showPass ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
                      </button>
                    </div>
                  </Field>
                  <div style={{ marginTop: -8, marginBottom: 12 }}>
                    <PasswordStrength password={form.password} isAr={isAr} />
                  </div>

                  {/* Confirm password */}
                  <Field label={isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'} error={errors.confirmPass}>
                    <div style={{ position: 'relative' }}>
                      <input type={showConf ? 'text' : 'password'} value={form.confirmPass} onChange={e => upd('confirmPass', e.target.value)}
                        placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
                        style={{ ...inp, paddingInlineEnd: 40 }} />
                      <button type="button" onClick={() => setShowConf(s => !s)}
                        style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 0, display: 'flex', alignItems: 'center', ...eyePos }}>
                        {showConf ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
                      </button>
                    </div>
                  </Field>

                  {/* Terms */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.terms} onChange={e => upd('terms', e.target.checked)}
                        style={{ width: 14, height: 14, marginTop: 3, accentColor: 'var(--text-primary)', cursor: 'pointer', flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        {isAr ? 'أوافق على ' : 'I agree to the '}
                        <Link to="/terms"   target="_blank" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>{isAr ? 'شروط الاستخدام' : 'Terms'}</Link>
                        {isAr ? ' و' : ' and '}
                        <Link to="/privacy" target="_blank" style={{ color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
                      </span>
                    </label>
                    {errors.terms && <p style={{ marginTop: 4, fontSize: 12, color: 'var(--danger)' }}>⚠ {errors.terms}</p>}
                  </div>

                  <SubmitBtn
                    loading={isLoading}
                    loadingLabel={isAr ? 'جاري الإنشاء...' : 'Creating...'}
                    label={isAr
                      ? (isEmployer ? 'إنشاء حساب الشركة' : 'إنشاء حسابي مجاناً')
                      : (isEmployer ? 'Create Company Account' : 'Create Free Account')}
                  />
                </form>

                {/* Switch type */}
                <div style={{ marginTop: 14, textAlign: 'center' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    {isEmployer
                      ? (isAr ? 'لست صاحب عمل؟ ' : 'Not hiring? ')
                      : (isAr ? 'لست باحثاً عن عمل؟ ' : 'Not a job seeker? ')}
                  </span>
                  <Link to={isEmployer ? '/company/register' : '/company/register'}
                    style={{ fontSize: 12.5, color: 'var(--text-primary)', fontWeight: 700, textDecoration: 'none' }}>
                    {isEmployer
                      ? (isAr ? 'سجّل كباحث عن عمل' : 'Register as Job Seeker')
                      : (isAr ? 'سجّل كصاحب عمل'    : 'Register as Employer')}
                  </Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}