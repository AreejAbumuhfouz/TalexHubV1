
'use strict';

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { AlertCircle } from 'lucide-react';
import useAuthStore  from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import useLangStore  from '../../i18n';
import OtpInput from '../../components/auth/OtpInput';
import LogoGold  from '../../assets/images/LogoGold.png';
import LogoBlack from '../../assets/images/BlackLogo.png';

const VITE_API_URL = import.meta.env.VITE_API_URL;

const T = {
  en: {
    title:'Welcome Back', subtitle:"Sign in to find your perfect job",
    noAccount:"Don't have an account?", signUp:'Sign Up',
    google:'Continue with Google', or:'or with email',
    emailLabel:'Email', emailPh:'you@example.com',
    passLabel:'Password', passPh:'••••••••',
    remember:'Remember me', forgot:'Forgot Password?',
    login:'Sign In', logging:'Signing in...',
    resetTitle:'Reset Password', resetSub:"Enter your email and we'll send a code",
    sendCode:'Send Code', sending:'Sending...',
    otpTitle:'Enter Verification Code', otpSub:'We sent a 6-digit code to',
    next:'Next →', resend:'Resend Code',
    newPassTitle:'New Password', newPassLbl:'New Password', newPassPh:'At least 8 characters',
    confLbl:'Confirm Password', confPh:'Re-enter password',
    save:'Save Password', saving:'Saving...',
    doneTitle:'Password Changed!', doneSub:'You can now sign in with your new password',
    backToLogin:'Sign In →', back:'← Back',
    verifyTitle:'Verify Email', verifySub:'We sent a code to',
    confirm:'Activate Account ✓', confirming:'Verifying...',
    sentOk:'Sent!',
    emailErr:'Invalid email', passErr:'Password is required',
    minPass:'Min 8 characters', noMatch:'Passwords do not match',
    welcome:'Welcome back! 👋', loginFail:'Login failed',
    googleFail:'Google login failed, please try again',
    activated:'Email verified! 🎉', resendFail:'Failed to resend',
    registered:'Account created! Please sign in 🎉',
    resendIn:'Resend in', didntReceive:"Didn't receive it?",
  },
  ar: {
    title:'مرحباً بعودتك', subtitle:'سجّل دخولك للعثور على وظيفتك المثالية',
    noAccount:'ليس لديك حساب؟', signUp:'إنشاء حساب',
    google:'المتابعة بحساب Google', or:'أو بالبريد الإلكتروني',
    emailLabel:'البريد الإلكتروني', emailPh:'you@example.com',
    passLabel:'كلمة المرور', passPh:'••••••••',
    remember:'تذكرني', forgot:'نسيت كلمة المرور؟',
    login:'تسجيل الدخول', logging:'جاري تسجيل الدخول...',
    resetTitle:'إعادة تعيين كلمة المرور', resetSub:'أدخل بريدك وسنرسل لك رمز التحقق',
    sendCode:'إرسال الرمز', sending:'جاري الإرسال...',
    otpTitle:'أدخل رمز التحقق', otpSub:'أرسلنا رمزاً مكوناً من 6 أرقام إلى',
    next:'التالي ←', resend:'إعادة إرسال الرمز',
    newPassTitle:'كلمة المرور الجديدة', newPassLbl:'كلمة المرور الجديدة', newPassPh:'8 أحرف على الأقل',
    confLbl:'تأكيد كلمة المرور', confPh:'أعد كتابة كلمة المرور',
    save:'حفظ كلمة المرور', saving:'جاري الحفظ...',
    doneTitle:'تم تغيير كلمة المرور!', doneSub:'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
    backToLogin:'تسجيل الدخول ←', back:'← رجوع',
    verifyTitle:'تفعيل البريد الإلكتروني', verifySub:'أرسلنا رمزاً إلى',
    confirm:'تفعيل الحساب ✓', confirming:'جاري التحقق...',
    sentOk:'تم الإرسال!',
    emailErr:'البريد الإلكتروني غير صحيح', passErr:'كلمة المرور مطلوبة',
    minPass:'كلمة المرور يجب أن تكون 8 أحرف على الأقل', noMatch:'كلمتا المرور غير متطابقتين',
    welcome:'مرحباً بعودتك! 👋', loginFail:'فشل تسجيل الدخول',
    googleFail:'فشل تسجيل الدخول بـ Google، حاول مرة أخرى',
    activated:'تم تفعيل البريد! 🎉', resendFail:'فشل إعادة الإرسال',
    registered:'تم إنشاء حسابك! سجّل الدخول الآن 🎉',
    resendIn:'إعادة الإرسال خلال', didntReceive:'لم يصلك الرمز؟',
  },
};

const inp = {
  display:'block', width:'100%', padding:'2px 14px 9px',
  background:'transparent', border:'none', outline:'none',
  fontSize:13.5, color:'var(--text-primary)', fontFamily:'inherit',
};

const ERR_MAP = {
  'البريد أو كلمة المرور غير صحيحة':          { en:'Incorrect email or password',              ar:'البريد أو كلمة المرور غير صحيحة'           },
  'الحساب موقوف':                              { en:'Your account has been suspended',          ar:'الحساب موقوف'                               },
  'الحساب محذوف':                              { en:'This account no longer exists',            ar:'الحساب محذوف'                               },
  'البريد الإلكتروني مسجل مسبقاً':            { en:'Email already registered',                 ar:'البريد الإلكتروني مسجل مسبقاً'             },
  'البريد الإلكتروني مسجّل مسبقاً':           { en:'Email already registered',                 ar:'البريد الإلكتروني مسجّل مسبقاً'            },
  'الرمز غير صحيح أو منتهي الصلاحية':         { en:'Invalid or expired code',                  ar:'الرمز غير صحيح أو منتهي الصلاحية'          },
  'إذا كان البريد مسجلاً ستصلك رسالة':        { en:'If this email is registered, you will receive a code', ar:'إذا كان البريد مسجلاً ستصلك رسالة' },
  'تم تغيير كلمة المرور بنجاح':               { en:'Password changed successfully!',           ar:'تم تغيير كلمة المرور بنجاح'                },
  'المستخدم غير موجود':                        { en:'No account found with this email',         ar:'المستخدم غير موجود'                         },
  'البريد الإلكتروني غير مفعّل':              { en:'Please verify your email first',           ar:'البريد الإلكتروني غير مفعّل'               },
  'الحساب مقفل مؤقتاً':                        { en:'Your account has been temporarily locked',  ar:'الحساب مقفل مؤقتاً'                         },
  'الحساب مقفل':                               { en:'Your account has been locked',              ar:'الحساب مقفل'                                 },
  'تجاوزت الحد المسموح من المحاولات':          { en:'Too many attempts, please try again later', ar:'تجاوزت الحد المسموح من المحاولات'            },
  'كلمة المرور غير صحيحة':                     { en:'Incorrect password',                        ar:'كلمة المرور غير صحيحة'                       },
  'البريد الإلكتروني غير مسجل':               { en:'No account found with this email',          ar:'البريد الإلكتروني غير مسجل'                  },
  'انتهت صلاحية الجلسة':                       { en:'Your session has expired, please sign in again', ar:'انتهت صلاحية الجلسة'                   },
};

const translateErr = (msg, lang) => {
  if (!msg) return msg;
  return ERR_MAP[msg]?.[lang] || msg;
};

/* ── Inline error banner (replaces toast for auth errors) ── */
function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '11px 14px',
      marginBottom: 16,
      borderRadius: 10,
      background: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.22)',
    }}>
      <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{message}</span>
    </div>
  );
}

function GoogleBtn({ label }) {
  return (
    <button type="button"
      onClick={() => { window.location.href = `${VITE_API_URL}/auth/google`; }}
      style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'12px', borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-primary)', fontSize:14, fontWeight:600, color:'var(--text-primary)', cursor:'pointer', fontFamily:'inherit', marginBottom:8, transition:'border-color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-400)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
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

function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ background:'var(--bg-secondary)', border:`1.5px solid ${error?'var(--danger)':'var(--border)'}`, borderRadius:10, overflow:'hidden', transition:'border-color 0.2s, background 0.2s' }}
        onFocusCapture={e => { e.currentTarget.style.borderColor=error?'var(--danger)':'var(--accent-400)'; e.currentTarget.style.background='var(--bg-primary)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor=error?'var(--danger)':'var(--border)'; e.currentTarget.style.background='var(--bg-secondary)'; }}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'9px 14px 2px' }}>
          {label}
        </span>
        {children}
      </div>
      {error && <p style={{ fontSize:12, color:'var(--danger)', marginTop:4 }}>⚠ {error}</p>}
    </div>
  );
}

function SubmitBtn({ loading, loadingLabel, label, disabled, onClick }) {
  return (
    <button type={onClick?'button':'submit'} onClick={onClick} disabled={disabled||loading}
      style={{ width:'100%', padding:'13px', borderRadius:10, border:'none', background:'var(--text-primary)', color:'var(--bg-primary)', fontSize:14, fontWeight:700, fontFamily:'inherit', cursor:disabled||loading?'not-allowed':'pointer', opacity:disabled||loading?0.65:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity 0.2s, transform 0.2s' }}
      onMouseEnter={e => { if (!disabled&&!loading) { e.currentTarget.style.opacity='0.82'; e.currentTarget.style.transform='translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.opacity=disabled||loading?'0.65':'1'; e.currentTarget.style.transform='none'; }}>
      {loading
        ? <><span style={{ width:15, height:15, border:'2.5px solid rgba(255,255,255,0.3)', borderTopColor:'var(--bg-primary)', borderRadius:'50%', animation:'lpSpin 0.8s linear infinite', display:'inline-block', flexShrink:0 }} />{loadingLabel}</>
        : label}
    </button>
  );
}

function IconRing({ emoji }) {
  return (
    <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--bg-secondary)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 16px' }}>
      {emoji}
    </div>
  );
}

function BackBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', cursor:'pointer', fontSize:13, color:'var(--text-secondary)', fontFamily:'inherit', marginBottom:22, padding:0, transition:'color 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.color='var(--text-primary)'; }}
      onMouseLeave={e => { e.currentTarget.style.color='var(--text-secondary)'; }}>
      {label}
    </button>
  );
}

function OrDivider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, margin:'14px 0' }}>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
      <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{label}</span>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   LOGIN FORM
══════════════════════════════════════════ */
function LoginForm({ t, isAr, onForgot, onUnverified }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [authErr,  setAuthErr]  = useState('');
  const [loading,  setLoading]  = useState(false);   // ← local, reliable
  const [form,     setForm]     = useState({ email:'', password:'', rememberMe:false });
  const from = location.state?.from?.pathname || '/dashboard';
  const upd  = (k, v) => { setForm(f => ({ ...f, [k]:v })); setAuthErr(''); };

  const validate = () => {
    const e = {};
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = t.emailErr;
    if (!form.password) e.password = t.passErr;
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setAuthErr('');
    setLoading(true);

    let r = null;
    try {
      r = await login(form.email, form.password, form.rememberMe);
    } catch (ex) {
      // authStore threw instead of returning { success:false }
      r = { success: false, message: ex?.response?.data?.message || ex?.message || t.loginFail };
    }

    setLoading(false);

    if (!r) { setAuthErr(t.loginFail); return; }

    if (r.success) {
      toast.success(t.welcome);
      const role = useAuthStore.getState().user?.role;
      const dest = role === 'company'
                 ? (r.companyStatus === 'active' ? '/company/dashboard' : '/company/profile')
                 : role === 'admin' || role === 'support' ? '/admin'
                 : from;
      navigate(dest, { replace:true });
    } else if (r.code === 'EMAIL_NOT_VERIFIED') {
      onUnverified({ userId:r.userId, email:form.email });
    } else {
      setAuthErr(translateErr(r.message, isAr ? 'ar' : 'en') || t.loginFail);
    }
  };

  const eyePos = isAr ? { left:12 } : { right:12 };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width:'100%' }}>
      <GoogleBtn label={t.google} />
      <OrDivider label={t.or} />

      {/* ── Inline auth error banner ── */}
      <ErrorBanner message={authErr} />

      <Field label={t.emailLabel} error={errors.email}>
        <input type="email" value={form.email} onChange={e => upd('email', e.target.value)}
          placeholder={t.emailPh} dir="ltr" autoComplete="email"
          style={{ ...inp, textAlign:'left', direction:'ltr' }} />
      </Field>

      <Field label={t.passLabel} error={errors.password}>
        <div style={{ position:'relative' }}>
          <input type={showPass?'text':'password'} value={form.password} onChange={e => upd('password', e.target.value)}
            placeholder={t.passPh} autoComplete="current-password"
            style={{ ...inp, paddingInlineEnd:40 }} />
          <button type="button" onClick={() => setShowPass(s => !s)}
            style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', padding:0, display:'flex', alignItems:'center', ...eyePos }}>
            {showPass ? <HiOutlineEye size={16} /> : <HiOutlineEyeOff size={16} />}
          </button>
        </div>
      </Field>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'4px 0 20px' }}>
        <label style={{ display:'flex', alignItems:'center', gap:7, fontSize:13, color:'var(--text-secondary)', cursor:'pointer' }}>
          <input type="checkbox" checked={form.rememberMe} onChange={e => upd('rememberMe', e.target.checked)}
            style={{ accentColor:'var(--text-primary)', width:14, height:14, cursor:'pointer' }} />
          {t.remember}
        </label>
        <button type="button" onClick={onForgot}
          style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', transition:'color 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-secondary)'; }}>
          {t.forgot}
        </button>
      </div>

      <SubmitBtn loading={loading} loadingLabel={t.logging} label={t.login} />
    </form>
  );
}

/* ══════════════════════════════════════════
   FORGOT FLOW
══════════════════════════════════════════ */
function ForgotFlow({ t, onBack, lang }) {
  const { forgotPassword, resetPassword } = useAuthStore();
  const [step,    setStep]   = useState('email');
  const [email,   setEmail]  = useState('');
  const [userId,  setUID]    = useState(null);
  const [otp,     setOtp]    = useState('');
  const [pass,    setPass]   = useState('');
  const [conf,    setConf]   = useState('');
  const [err,     setErr]    = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const r = await forgotPassword(email);
      if (r.success) { setUID(r.userId); setStep('otp'); }
      else setErr(translateErr(r.message, lang) || 'Error');
    } finally { setLoading(false); }
  };

  const doReset = async () => {
    setErr('');
    if (pass.length < 8) { setErr(t.minPass); return; }
    if (pass !== conf)   { setErr(t.noMatch); return; }
    setLoading(true);
    try {
      const r = await resetPassword(userId, otp, pass);
      if (r.success) setStep('done');
      else { setErr(translateErr(r.message, lang) || 'Error'); setStep('otp'); setOtp(''); }
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setErr(''); setLoading(true);
    try {
      const r = await forgotPassword(email);
      if (r.success) { setUID(r.userId); setOtp(''); toast.success(t.sentOk || 'Code resent!'); }
      else setErr(translateErr(r.message, lang) || 'Failed to resend');
    } finally { setLoading(false); }
  };

  const head = { fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8, letterSpacing:'-0.02em' };
  const sub  = { fontSize:13, color:'var(--text-secondary)' };

  return (
    <div style={{ width:'100%' }}>
      <BackBtn label={t.back} onClick={onBack} />

      {step === 'email' && (
        <>
          <div style={{ textAlign:'center', marginBottom:22 }}>
            <IconRing emoji="🔐" />
            <h2 style={head}>{t.resetTitle}</h2>
            <p style={sub}>{t.resetSub}</p>
          </div>
          <form onSubmit={sendOtp} style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <ErrorBanner message={err} />
            <Field label={t.emailLabel}>
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }}
                placeholder={t.emailPh} required dir="ltr"
                style={{ ...inp, textAlign:'left', direction:'ltr' }} />
            </Field>
            <SubmitBtn loading={loading} loadingLabel={t.sending} label={t.sendCode} />
          </form>
        </>
      )}

      {step === 'otp' && (
        <div style={{ textAlign:'center' }}>
          <IconRing emoji="📧" />
          <h2 style={head}>{t.otpTitle}</h2>
          <p style={{ ...sub, marginBottom:6 }}>{t.otpSub}</p>
          <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:24, direction:'ltr' }}>{email}</p>
          <OtpInput value={otp} onChange={setOtp} length={6} hasError={!!err} />
          <ErrorBanner message={err} />
          <div style={{ marginTop:12 }}>
            <SubmitBtn label={t.next} disabled={otp.length !== 6}
              onClick={() => { if (otp.length === 6) { setErr(''); setStep('newpass'); } }} />
          </div>
          <p style={{ marginTop:14, fontSize:13, color:'var(--text-secondary)' }}>
            {t.didntReceive || "Didn't receive it?"}{' '}
            <button type="button" onClick={handleResend}
              style={{ background:'none', border:'none', color:'var(--text-primary)', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
              {t.resend}
            </button>
          </p>
          <p style={{ marginTop:6, fontSize:12, color:'var(--text-secondary)' }}>
            <button type="button" onClick={() => setStep('email')}
              style={{ background:'none', border:'none', color:'var(--text-secondary)', cursor:'pointer', fontSize:12, fontFamily:'inherit', textDecoration:'underline' }}>
              ← {t.back}
            </button>
          </p>
        </div>
      )}

      {step === 'newpass' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ textAlign:'center', marginBottom:6 }}>
            <IconRing emoji="🔑" />
            <h2 style={head}>{t.newPassTitle}</h2>
          </div>
          <ErrorBanner message={err} />
          <Field label={t.newPassLbl}>
            <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(''); }}
              placeholder={t.newPassPh} style={inp} />
          </Field>
          <Field label={t.confLbl}>
            <input type="password" value={conf} onChange={e => { setConf(e.target.value); setErr(''); }}
              placeholder={t.confPh} style={inp} />
          </Field>
          <SubmitBtn loading={loading} loadingLabel={t.saving} label={t.save} onClick={doReset} />
        </div>
      )}

      {step === 'done' && (
        <div style={{ textAlign:'center' }}>
          <IconRing emoji="✅" />
          <h2 style={{ ...head, margin:'14px 0 8px' }}>{t.doneTitle}</h2>
          <p style={{ ...sub, marginBottom:22 }}>{t.doneSub}</p>
          <SubmitBtn label={t.backToLogin} onClick={onBack} />
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   VERIFY FLOW
══════════════════════════════════════════ */
function VerifyFlow({ t, unverified, onBack, lang }) {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, isLoading } = useAuthStore();
  const [otp,      setOtp]  = useState('');
  const [err,      setErr]  = useState('');
  const [countdown, setCD]  = useState(0);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setErr('');
    const r = await verifyOtp(unverified.userId, otp, 'email_verify');
    if (r.success) { toast.success(t.activated); navigate('/dashboard', { replace:true }); }
    else setErr(translateErr(r.message, lang) || 'Error');
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    const r = await resendOtp(unverified.userId, 'email_verify');
    if (r.success) {
      toast.success(t.sentOk);
      setCD(60);
      const iv = setInterval(() => setCD(c => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; }), 1000);
    } else {
      // toast.error(t.resendFail);
    }
  };

  return (
    <div style={{ width:'100%', textAlign:'center' }}>
      <BackBtn label={t.back} onClick={onBack} />
      <IconRing emoji="📧" />
      <h2 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8, letterSpacing:'-0.02em' }}>
        {t.verifyTitle}
      </h2>
      <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>{t.otpSub}</p>
      <p style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', marginBottom:28, direction:'ltr' }}>
        {unverified.email}
      </p>
      <OtpInput value={otp} onChange={v => { setOtp(v); setErr(''); }} length={6} hasError={!!err} />
      <ErrorBanner message={err} />
      <div style={{ marginTop:12 }}>
        <SubmitBtn loading={isLoading} loadingLabel={t.confirming} label={t.confirm} disabled={otp.length !== 6} onClick={handleVerify} />
      </div>
      <p style={{ marginTop:16, fontSize:13, color:'var(--text-secondary)' }}>
        {t.didntReceive}{' '}
        {countdown > 0
          ? <span>{t.resendIn} {countdown}s</span>
          : <button type="button" onClick={handleResend}
              style={{ background:'none', border:'none', color:'var(--text-primary)', fontWeight:700, cursor:'pointer', fontSize:13, fontFamily:'inherit' }}>
              {t.resend}
            </button>
        }
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function LoginPage() {
  const [params]                    = useSearchParams();
  const [view,       setView]       = useState('login');
  const [unverified, setUnverified] = useState(null);
  const { lang, dir }               = useLangStore();
  const { theme }                   = useThemeStore();
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';
  const t     = T[lang];

  // Pick logo based on theme
  const logo = isDark ? LogoGold : LogoBlack;

  useEffect(() => {
    document.title = isAr ? 'تسجيل الدخول — TalexHub' : 'Sign In — TalexHub';
    if (params.get('error') === 'google_failed') 
      // toast.error(t.googleFail)
    ;
    if (params.get('registered') === '1')      
        // toast.success(t.registered)
      ;
  }, [lang]);

  return (
    <>
      <style>{'@keyframes lpSpin { to { transform: rotate(360deg); } }'}</style>

      <div dir={dir} style={{
        minHeight: '100vh',
        display: 'flex',
        background: 'var(--bg-primary)',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '60px clamp(24px,5vw,52px)',
          minHeight: '100vh',
        }}>

          {/* Logo — gold in dark mode, black in light mode */}
          <Link to="/" style={{ textDecoration:'none', marginBottom:2 }}>
            <img
              src={logo}
              alt="TalexHub"
              style={{ height:80, width:'auto', objectFit:'contain' }}
            />
          </Link>

          <div style={{
            width: '100%',
            maxWidth: 420,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            padding: '8px 0 40px',
          }}>

            {view === 'login' && (
              <div style={{ width:'100%' }}>
                <h1 style={{ fontSize:26, fontWeight:700, color:'var(--text-primary)', textAlign:'center', marginBottom:6, letterSpacing:'-0.02em' }}>
                  {t.title}
                </h1>
                <p style={{ fontSize:13.5, color:'var(--text-secondary)', textAlign:'center', marginBottom:22 }}>
                  {t.noAccount}{' '}
                  <Link to="/register" style={{ color:'var(--text-primary)', fontWeight:700, textDecoration:'none' }}>
                    {t.signUp}
                  </Link>
                </p>
                <LoginForm
                  t={t} isAr={isAr}
                  onForgot={() => setView('forgot')}
                  onUnverified={d => { setUnverified(d); setView('verify'); }}
                />
              </div>
            )}

            {view === 'forgot' && <ForgotFlow t={t} lang={lang} onBack={() => setView('login')} />}

            {view === 'verify' && unverified && (
              <VerifyFlow t={t} lang={lang} unverified={unverified} onBack={() => setView('login')} />
            )}

          </div>
        </div>
      </div>
    </>
  );
}