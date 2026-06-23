import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import useLangStore from '../../i18n';
import api from '../../services/api';
import LogoGold from '../../assets/images/LogoGold.png';

/* ── Config ──────────────────────────────────────────────── */
const INDUSTRIES = [
  { ar:'تقنية المعلومات',   en:'Information Technology'     },
  { ar:'الاتصالات',         en:'Telecommunications'         },
  { ar:'التعليم',           en:'Education'                  },
  { ar:'الرعاية الصحية',   en:'Healthcare'                 },
  { ar:'المال والأعمال',    en:'Finance & Business'         },
  { ar:'التصنيع',           en:'Manufacturing'              },
  { ar:'البناء والعقارات',  en:'Construction & Real Estate' },
  { ar:'التجزئة',           en:'Retail'                     },
  { ar:'الضيافة والسياحة',  en:'Hospitality & Tourism'      },
  { ar:'الإعلام والاتصال',  en:'Media & Communications'     },
  { ar:'أخرى',              en:'Other'                      },
];
const SIZES = ['1-10','11-50','51-200','201-500','500+'];

/* ── Field (نفس الديزاين القديم بالضبط) ─────────────────── */
function Field({ label, error, children, required }) {
  return (
    <div style={{ marginBottom:13 }}>
      <div style={{
        background:'var(--bg-secondary)',
        border:`1.5px solid ${error ? 'var(--danger,#EF4444)' : 'var(--border)'}`,
        borderRadius:10, overflow:'hidden',
        transition:'border-color var(--transition,0.2s), box-shadow var(--transition,0.2s), background var(--transition,0.2s)',
      }}
        onFocusCapture={e => { e.currentTarget.style.borderColor = error ? 'var(--danger,#EF4444)' : 'var(--accent-400,var(--text-primary))'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(26,26,30,0.06)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
        onBlurCapture={e  => { e.currentTarget.style.borderColor = error ? 'var(--danger,#EF4444)' : 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
        <span style={{ display:'block', fontSize:10.5, fontWeight:600, color:'var(--text-secondary)', padding:'9px 14px 2px' }}>
          {label}{required && <span style={{ color:'var(--danger,#EF4444)' }}> *</span>}
        </span>
        {children}
      </div>
      {error && <p style={{ fontSize:12, color:'var(--danger,#EF4444)', marginTop:4, paddingInlineStart:2 }}>⚠ {error}</p>}
    </div>
  );
}

const inp = {
  display:'block', width:'100%', padding:'2px 14px 9px',
  background:'transparent', border:'none', outline:'none',
  fontSize:13.5, color:'var(--text-primary)', fontFamily:'var(--font-en)',
  boxSizing:'border-box',
};

/* ── OTP Boxes ───────────────────────────────────────────── */
function OtpBoxes({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef());
  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      const next = digits.map((d, j) => j === i ? '' : d).join('');
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
    } else if (/^\d$/.test(e.key)) {
      const next = digits.map((d, j) => j === i ? e.key : d).join('');
      onChange(next);
      if (i < 5) refs[i + 1].current?.focus();
    }
    e.preventDefault();
  };

  return (
    <div style={{ display:'flex', gap:8, justifyContent:'center', margin:'20px 0' }}>
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]} value={d}
          onKeyDown={e => handleKey(i, e)} onChange={() => {}} maxLength={1}
          style={{
            width:46, height:54, textAlign:'center', fontSize:22, fontWeight:800,
            border:`1.5px solid ${d ? 'var(--text-primary)' : 'var(--border)'}`,
            borderRadius:10, background:'var(--bg-secondary)',
            color:'var(--text-primary)', outline:'none',
            transition:'border-color 0.15s', fontFamily:'var(--font-en)',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--text-primary)'}
          onBlur={e  => e.target.style.borderColor = d ? 'var(--text-primary)' : 'var(--border)'}
        />
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
════════════════════════════════════════════════════════════ */
export default function CompanyRegisterPage() {
  const { lang, dir } = useLangStore();
  const isAr     = lang === 'ar';
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();

  const [step,      setStep]      = useState(1);  // 1|2|3(otp)|4(success)
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [agreed,    setAgreed]    = useState(false);
  const [showPwd,   setShowPwd]   = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [otp,       setOtp]       = useState('');

  const [form, setForm] = useState({
    // step 1 — شخصي
    fullName:'', email:'', password:'',
    // step 2 — شركة
    companyName:'', companyNameEn:'', industry:'', companySize:'',
    phone:'', website:'', locationCountry:'', locationCity:'', description:'',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* ── Validate step 1 ── */
  const validateStep1 = () => {
    const e = {};
    if (!form.fullName.trim())  e.fullName = isAr ? 'الاسم مطلوب' : 'Name required';
    if (!form.email.trim())     e.email    = isAr ? 'الإيميل مطلوب' : 'Email required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = isAr ? 'إيميل غير صحيح' : 'Invalid email';
    if (!form.password)         e.password = isAr ? 'كلمة المرور مطلوبة' : 'Password required';
    else if (form.password.length < 8) e.password = isAr ? '8 أحرف على الأقل' : 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = isAr ? 'يجب أن تحتوي على حرف كبير وصغير ورقم' : 'Needs upper, lower & number';
    setErrors(e);
    if (Object.keys(e).length) { toast.error(isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'); return false; }
    return true;
  };

  /* ── Validate step 2 ── */
  const validateStep2 = () => {
    const e = {};
    if (!form.companyName.trim()) e.companyName = isAr ? 'اسم الشركة مطلوب' : 'Company name required';
    if (!form.industry)           e.industry    = isAr ? 'اختر القطاع' : 'Select industry';
    if (!form.companySize)        e.companySize = isAr ? 'اختر حجم الشركة' : 'Select company size';
    if (!agreed)                  e.agreed      = isAr ? 'يجب الموافقة على الشروط للمتابعة' : 'You must agree to the terms to continue';
    setErrors(e);
    if (Object.keys(e).length) { toast.error(isAr ? 'يرجى ملء الحقول المطلوبة' : 'Please fill required fields'); return false; }
    return true;
  };

  /* ── Submit → send OTP ── */
  const handleSubmit = async () => {
    if (!validateStep2()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register-company/init', {
        fullName:        form.fullName,
        email:           form.email,
        password:        form.password,
        companyName:     form.companyName,
        industry:        form.industry,
        companySize:     form.companySize,
        website:         form.website,
        locationCountry: form.locationCountry,
        locationCity:    form.locationCity,
        description:     form.description,
      });
      setSessionId(data.data.sessionId);
      setStep(3);
      toast.success(isAr ? 'تم إرسال رمز التحقق إلى بريدك' : 'Verification code sent!');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 409) {
        setErrors({ email: isAr ? 'البريد مسجّل مسبقاً' : 'Email already registered' });
        setStep(1);
      } else {
        toast.error(msg || (isAr ? 'فشل التسجيل' : 'Registration failed'));
      }
    } finally { setLoading(false); }
  };

  /* ── Verify OTP ── */
  const handleVerify = async () => {
    if (otp.length < 6) { toast.error(isAr ? 'أدخل رمز التحقق كاملاً' : 'Enter full OTP'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register-company/verify', { sessionId, otp });
      updateUser(data.data.user);
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'رمز غير صحيح' : 'Invalid code'));
      setOtp('');
    } finally { setLoading(false); }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/register-company/resend', { sessionId, email: form.email });
      toast.success(isAr ? 'تم إرسال رمز جديد' : 'New code sent');
      setOtp('');
    } catch { toast.error(isAr ? 'فشل إعادة الإرسال' : 'Resend failed'); }
    finally { setResending(false); }
  };

  /* ── Steps config ── */
  const STEPS = [
    { n:1, ar:'بياناتك الشخصية', en:'Personal Info'  },
    { n:2, ar:'بيانات الشركة',   en:'Company Info'   },
    { n:3, ar:'التحقق من البريد', en:'Verify Email'   },
  ];

  /* ══════════════════════════════════════════════════════════
     STEP 4 — SUCCESS
  ══════════════════════════════════════════════════════════ */
  if (step === 4) return (
    <div dir={dir} style={{ minHeight:'100vh', background:'var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:420 }}>
        <div style={{ fontSize:72, marginBottom:14 }}>🎉</div>
        <h2 style={{ fontSize:24, fontWeight:700, color:'var(--text-primary)', marginBottom:10, letterSpacing:'-0.02em' }}>
          {isAr ? 'تم تسجيل شركتك!' : 'Company Registered!'}
        </h2>
        <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.8, margin:'0 auto 16px', maxWidth:360 }}>
          {isAr
            ? 'حسابك جاهز الآن. الخطوة التالية هي رفع شهادة تسجيل شركتك حتى يتمكن فريقنا من مراجعتها وتفعيل حسابك.'
            : "Your account is ready. Next step: upload your company registration certificate for our team to review."}
        </p>
        <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.22)', borderRadius:10, padding:'10px 14px', marginBottom:22, textAlign: isAr ? 'right' : 'left' }}>
          <p style={{ fontSize:12.5, color:'#F59E0B', margin:0, fontWeight:600 }}>
            {isAr ? '⚠ حسابك قيد المراجعة — لا يمكن نشر وظائف حتى الموافقة' : '⚠ Account pending review — job posting locked until approved'}
          </p>
        </div>
        <button onClick={() => navigate('/company/profile')}
          style={{ width:'100%', padding:'13px 32px', borderRadius:10, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition:'opacity var(--transition,0.2s)', marginBottom:10 }}
          onMouseEnter={e => { e.currentTarget.style.opacity='0.82'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
          {isAr ? 'رفع شهادة التسجيل ←' : 'Upload Registration Certificate →'}
        </button>
        <button onClick={() => navigate('/company/dashboard')}
          style={{ width:'100%', padding:'11px', borderRadius:10, background:'transparent', border:'1.5px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', fontSize:13.5, fontWeight:600, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
          {isAr ? 'الذهاب للوحة التحكم' : 'Go to Dashboard'}
        </button>
      </div>
    </div>
  );

  /* ══════════════════════════════════════════════════════════
     FORM (steps 1-3)
  ══════════════════════════════════════════════════════════ */
  return (
    <div dir={dir} style={{ minHeight:'100vh', background:'var(--bg-primary)', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
      <style>{'@keyframes crFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}} @keyframes spin{to{transform:rotate(360deg)}}'}</style>

      {/* ── Top bar ── */}
      <div style={{ background:'var(--bg-primary)', borderBottom:'1px solid var(--border)', padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:12 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', textDecoration:'none' }}>
          <img src={LogoGold} alt="TalexHub" style={{ height:48, width:'auto', objectFit:'contain' }} />
        </Link>
        <div style={{ flex:1 }} />
        <Link to="/login" style={{ fontSize:12.5, color:'var(--text-secondary)', textDecoration:'none', transition:'color var(--transition,0.2s)' }}
          onMouseEnter={e => { e.currentTarget.style.color='var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.color='var(--text-secondary)'; }}>
          {isAr ? '← تسجيل الدخول' : '← Login'}
        </Link>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth:560, margin:'0 auto', padding:'40px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', marginBottom:28, animation:'crFadeUp 0.4s ease' }}>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', marginBottom:8, letterSpacing:'-0.02em' }}>
            {isAr ? 'سجّل شركتك على TalexHub' : 'Register your company on TalexHub'}
          </h1>
          <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
            {isAr
              ? 'انضم كصاحب عمل وابدأ في نشر الوظائف واكتشاف المواهب'
              : 'Join as an employer and start posting jobs & discovering talent'}
          </p>
        </div>

        {/* Progress bar */}
        <div style={{ display:'flex', gap:6, marginBottom:24 }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ flex:1 }}>
              <div style={{ height:3, borderRadius:99, marginBottom:5, background: step >= s.n ? 'var(--text-primary)' : 'var(--border)', transition:'background 0.3s' }} />
              <p style={{ fontSize:10.5, fontWeight: step === s.n ? 700 : 400, color: step === s.n ? 'var(--text-primary)' : 'var(--text-secondary)', margin:0, textAlign: i === 0 ? 'start' : i === STEPS.length - 1 ? 'end' : 'center' }}>
                {isAr ? s.ar : s.en}
              </p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:'var(--bg-primary)', borderRadius:18, padding:'26px', border:'1px solid var(--border)', animation:'crFadeUp 0.4s ease' }}>

          {/* ══ STEP 1 — بيانات شخصية ══ */}
          {step === 1 && (
            <>
              <h2 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:18 }}>
                👤 {isAr ? 'بياناتك الشخصية' : 'Your Personal Info'}
              </h2>

              <Field label={isAr ? 'الاسم الكامل' : 'Full Name'} error={errors.fullName} required>
                <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
                  placeholder={isAr ? 'محمد أحمد الشمري' : 'John Smith'} style={inp} autoFocus />
              </Field>

              <Field label={isAr ? 'البريد الإلكتروني' : 'Email Address'} error={errors.email} required>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="hr@company.com" dir="ltr" style={{ ...inp, textAlign:'left', direction:'ltr' }} />
              </Field>

              <Field label={isAr ? 'كلمة المرور' : 'Password'} error={errors.password} required>
                <div style={{ display:'flex', alignItems:'center' }}>
                  <input type={showPwd ? 'text' : 'password'} value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder={isAr ? '8 أحرف على الأقل' : 'Min 8 characters'}
                    dir="ltr" style={{ ...inp, flex:1, direction:'ltr', textAlign:'left' }} />
                  <button onClick={() => setShowPwd(p => !p)}
                    style={{ padding:'0 14px', background:'none', border:'none', cursor:'pointer', color:'var(--text-secondary)', flexShrink:0 }}>
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </Field>

              {/* strength hint */}
              {form.password.length > 0 && (
                <p style={{ fontSize:11.5, margin:'-6px 0 12px 2px', color: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password) && form.password.length >= 8 ? '#22C55E' : '#F59E0B' }}>
                  {/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password) && form.password.length >= 8
                    ? (isAr ? '✓ كلمة مرور قوية' : '✓ Strong password')
                    : (isAr ? '⚠ أضف حرف كبير وصغير ورقم' : '⚠ Add uppercase, lowercase & number')}
                </p>
              )}

              <button onClick={() => validateStep1() && setStep(2)}
                style={{ width:'100%', padding:'13px', borderRadius:10, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor:'pointer', fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition:'opacity var(--transition,0.2s)' }}
                onMouseEnter={e => { e.currentTarget.style.opacity='0.82'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}>
                {isAr ? 'التالي ←' : 'Next →'}
              </button>
            </>
          )}

          {/* ══ STEP 2 — بيانات الشركة ══ */}
          {step === 2 && (
            <>
              <h2 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:18 }}>
                🏢 {isAr ? 'معلومات الشركة' : 'Company Information'}
              </h2>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label={isAr ? 'اسم الشركة بالعربي' : 'Company Name (Arabic)'} error={errors.companyName} required>
                    <input type="text" value={form.companyName} onChange={e => set('companyName', e.target.value)}
                      placeholder={isAr ? 'شركة النور للتقنية' : ''} style={inp} autoFocus />
                  </Field>
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <Field label={isAr ? 'اسم الشركة بالإنجليزي' : 'Company Name (English)'}>
                    <input type="text" value={form.companyNameEn} onChange={e => set('companyNameEn', e.target.value)}
                      placeholder="Al Noor Technology" style={inp} />
                  </Field>
                </div>

                <Field label={isAr ? 'القطاع' : 'Industry'} error={errors.industry} required>
                  <select value={form.industry} onChange={e => set('industry', e.target.value)}
                    style={{ ...inp, cursor:'pointer', fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                    <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
                    {INDUSTRIES.map((o, i) => <option key={i} value={isAr ? o.ar : o.en}>{isAr ? o.ar : o.en}</option>)}
                  </select>
                </Field>

                <Field label={isAr ? 'حجم الشركة' : 'Company Size'} error={errors.companySize} required>
                  <select value={form.companySize} onChange={e => set('companySize', e.target.value)}
                    style={{ ...inp, cursor:'pointer' }}>
                    <option value="">{isAr ? '— اختر —' : '— Select —'}</option>
                    {SIZES.map(v => <option key={v} value={v}>{v} {isAr ? 'موظف' : 'employees'}</option>)}
                  </select>
                </Field>

                <Field label={isAr ? 'البريد الإلكتروني للشركة' : 'Company Email'}>
                  <input type="email" value={form.email} readOnly dir="ltr"
                    style={{ ...inp, textAlign:'left', direction:'ltr', opacity:0.6, cursor:'not-allowed' }} />
                </Field>

                <Field label={isAr ? 'رقم الهاتف' : 'Phone'}>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+962 7x xxx xxxx" dir="ltr" style={{ ...inp, textAlign:'left', direction:'ltr' }} />
                </Field>
              </div>

              <Field label={isAr ? 'الموقع الإلكتروني' : 'Website'}>
                <input type="url" value={form.website} onChange={e => set('website', e.target.value)}
                  placeholder="https://company.com" dir="ltr" style={{ ...inp, textAlign:'left', direction:'ltr' }} />
              </Field>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
                <Field label={isAr ? 'الدولة' : 'Country'}>
                  <input type="text" value={form.locationCountry} onChange={e => set('locationCountry', e.target.value)}
                    placeholder={isAr ? 'الأردن' : 'Jordan'} style={inp} />
                </Field>
                <Field label={isAr ? 'المدينة' : 'City'}>
                  <input type="text" value={form.locationCity} onChange={e => set('locationCity', e.target.value)}
                    placeholder={isAr ? 'عمّان' : 'Amman'} style={inp} />
                </Field>
              </div>

              <Field label={isAr ? 'نبذة عن الشركة' : 'About the Company'}>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder={isAr ? 'اكتب وصفاً مختصراً عن شركتك...' : 'Briefly describe your company...'}
                  style={{ ...inp, resize:'vertical', paddingTop:4 }} />
              </Field>

              {/* ── Checkbox الشروط والخصوصية ── */}
              <div style={{ marginBottom:16 }}>
                {/* native hidden checkbox — ربطه بالـ label يخلي الضغط على أي مكان (الصندوق أو النص) يشغّله */}
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: undefined })); }}
                  style={{ position:'absolute', opacity:0, width:0, height:0 }}
                />
                <label htmlFor="agree-terms" style={{ display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer', userSelect:'none' }}>
                  {/* custom visual box */}
                  <div style={{
                    width:18, height:18, borderRadius:5, flexShrink:0, marginTop:1,
                    border:`1.5px solid ${errors.agreed ? 'var(--danger,#EF4444)' : agreed ? 'var(--text-primary)' : 'var(--border)'}`,
                    background: agreed ? 'var(--text-primary)' : 'var(--bg-secondary)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    transition:'all 0.15s', pointerEvents:'none',
                  }}>
                    {agreed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="var(--bg-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize:12.5, color:'var(--text-secondary)', lineHeight:1.7 }}>
                    {isAr ? (
                      <>
                        أوافق على{' '}
                        <Link to="/terms" target="_blank" style={{ color:'var(--text-primary)', fontWeight:700, textDecoration:'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                          شروط الاستخدام
                        </Link>
                        {' '}و{' '}
                        <Link to="/privacy" target="_blank" style={{ color:'var(--text-primary)', fontWeight:700, textDecoration:'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                          سياسة الخصوصية
                        </Link>
                        {' '}الخاصة بـ TalexHub
                      </>
                    ) : (
                      <>
                        I agree to TalexHub's{' '}
                        <Link to="/terms" target="_blank" style={{ color:'var(--text-primary)', fontWeight:700, textDecoration:'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                          Terms of Service
                        </Link>
                        {' '}and{' '}
                        <Link to="/privacy" target="_blank" style={{ color:'var(--text-primary)', fontWeight:700, textDecoration:'none' }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration='underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration='none'}>
                          Privacy Policy
                        </Link>
                      </>
                    )}
                  </span>
                </label>
                {errors.agreed && (
                  <p style={{ fontSize:12, color:'var(--danger,#EF4444)', marginTop:6, paddingInlineStart:28 }}>⚠ {errors.agreed}</p>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep(1)}
                  style={{ padding:'13px 20px', borderRadius:10, background:'transparent', border:'1.5px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', fontSize:14, fontWeight:600, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition:'border-color var(--transition,0.2s), color var(--transition,0.2s)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; e.currentTarget.style.color='var(--text-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                  {isAr ? '← السابق' : '← Back'}
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  style={{ flex:1, padding:'13px', borderRadius:10, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', opacity: loading ? 0.65 : 1, transition:'opacity var(--transition,0.2s)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  {loading && <Loader2 size={15} style={{ animation:'spin .7s linear infinite' }} />}
                  {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال رمز التحقق ←' : 'Send Verification Code →')}
                </button>
              </div>
            </>
          )}

          {/* ══ STEP 3 — OTP ══ */}
          {step === 3 && (
            <>
              <div style={{ textAlign:'center', marginBottom:8 }}>
                <div style={{ fontSize:40, marginBottom:10 }}>📩</div>
                <h2 style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)', margin:'0 0 6px' }}>
                  {isAr ? 'تحقق من بريدك الإلكتروني' : 'Check your email'}
                </h2>
                <p style={{ fontSize:12.5, color:'var(--text-secondary)', margin:0, lineHeight:1.7 }}>
                  {isAr ? 'أرسلنا رمزاً مكوّناً من 6 أرقام إلى' : 'We sent a 6-digit code to'}
                  {' '}<strong style={{ color:'var(--text-primary)', direction:'ltr', display:'inline-block' }}>{form.email}</strong>
                </p>
              </div>

              <OtpBoxes value={otp} onChange={setOtp} />

              <button onClick={handleVerify} disabled={loading || otp.length < 6}
                style={{ width:'100%', padding:'13px', borderRadius:10, background:'var(--text-primary)', color:'var(--bg-primary)', border:'none', cursor: loading || otp.length < 6 ? 'not-allowed' : 'pointer', fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', opacity: loading || otp.length < 6 ? 0.6 : 1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'opacity var(--transition,0.2s)' }}>
                {loading && <Loader2 size={15} style={{ animation:'spin .7s linear infinite' }} />}
                {loading ? (isAr ? 'جاري التحقق...' : 'Verifying...') : (isAr ? 'تأكيد الرمز ✓' : 'Verify Code ✓')}
              </button>

              <div style={{ textAlign:'center', marginTop:14 }}>
                <span style={{ fontSize:12.5, color:'var(--text-secondary)' }}>
                  {isAr ? 'لم تستلم الرمز؟ ' : "Didn't receive it? "}
                </span>
                <button onClick={handleResend} disabled={resending}
                  style={{ fontSize:12.5, color:'var(--text-primary)', background:'none', border:'none', cursor:'pointer', fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', opacity: resending ? 0.5 : 1 }}>
                  {resending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'أعد الإرسال' : 'Resend')}
                </button>
              </div>

              <button onClick={() => setStep(2)}
                style={{ width:'100%', marginTop:10, padding:'10px', borderRadius:10, background:'transparent', border:'1.5px solid var(--border)', color:'var(--text-secondary)', cursor:'pointer', fontSize:13, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)', transition:'border-color var(--transition,0.2s)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}>
                {isAr ? '← تعديل البيانات' : '← Edit details'}
              </button>
            </>
          )}

        </div>{/* end card */}

        {/* Footer — only on steps 1 & 2 */}
        {step <= 2 && (
          <p style={{ textAlign:'center', fontSize:11, color:'var(--text-secondary)', marginTop:18, lineHeight:1.7 }}>
            {isAr
              ? <>بالتسجيل، أنت توافق على <Link to="/terms" target="_blank" style={{ color:'var(--text-secondary)', textDecoration:'underline' }}>شروط الاستخدام</Link> و<Link to="/privacy" target="_blank" style={{ color:'var(--text-secondary)', textDecoration:'underline' }}>سياسة الخصوصية</Link> الخاصة بـ TalexHub.</>
              : <>By registering, you agree to TalexHub's <Link to="/terms" target="_blank" style={{ color:'var(--text-secondary)', textDecoration:'underline' }}>Terms of Service</Link> and <Link to="/privacy" target="_blank" style={{ color:'var(--text-secondary)', textDecoration:'underline' }}>Privacy Policy</Link>.</>
            }
          </p>
        )}

      </div>
    </div>
  );
}