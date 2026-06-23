

import { useState } from 'react';
import { Link } from 'react-router-dom';
import useLangStore from '../i18n';
import api from '../services/api';
import toast from 'react-hot-toast';
import LogoLight from '../assets/images/LogoGold.png';

export default function ComingSoonPage() {
  // ── Your store exports toggleLang, NOT toggle ──────────────
  const lang       = useLangStore(s => s.lang);
  const dir        = useLangStore(s => s.dir);
  const toggleLang = useLangStore(s => s.toggleLang);
  const isAr       = lang === 'ar';

  const [email,     setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const features = isAr
    ? ['تحليل السيرة بالذكاء الاصطناعي', 'تدريب المقابلات', 'مطابقة الوظائف الذكية', 'دورات مهنية', 'التقديم التلقائي']
    : ['AI Resume Analysis', 'Interview Training', 'Smart Job Matching', 'Career Courses', 'Auto Apply'];

  const handleSubmit = async () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) {
      toast.error(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }
    setLoading(true);
    try {
      await api.post('/waitlist', { email: email.trim(), lang });
      setSubmitted(true);
      setEmail('');
      toast.success(isAr ? 'تم تسجيلك بنجاح ✓' : "You're on the list ✓");
    } catch (err) {
      toast.error(err.response?.data?.message || (isAr ? 'فشل التسجيل' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={dir} style={{
      background: '#000', color: '#fff', minHeight: '100vh',
      fontFamily: isAr ? 'Tajawal, sans-serif' : 'DM Sans, sans-serif',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=Tajawal:wght@300;400;500;700&display=swap');
        .cs-feat:hover  { color: rgba(255,255,255,0.65) !important; border-color: rgba(255,255,255,0.18) !important; }
        .cs-lang:hover  { border-color: rgba(255,255,255,0.4) !important; color: #fff !important; background: rgba(255,255,255,0.05) !important; }
        .cs-submit:hover:not(:disabled) { background: rgba(255,255,255,0.88) !important; }
        @keyframes cs-fadein { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Grid */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none', zIndex:0,
        backgroundImage:'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
        backgroundSize:'64px 64px',
      }} />

      {/* Glow TR */}
      <div style={{ position:'absolute', width:560, height:560, top:-130, right:-80,
        background:'radial-gradient(circle,rgba(255,255,255,0.055) 0%,transparent 68%)',
        pointerEvents:'none', zIndex:0 }} />

      {/* Glow BL */}
      <div style={{ position:'absolute', width:400, height:400, bottom:-90, left:-50,
        background:'radial-gradient(circle,rgba(255,255,255,0.04) 0%,transparent 68%)',
        pointerEvents:'none', zIndex:0 }} />

      <div style={{
        position:'relative', zIndex:1,
        display:'flex', flexDirection:'column', minHeight:'100vh',
        maxWidth:860, margin:'0 auto', padding:'0 48px', width:'100%',
      }}>

        {/* NAV */}
        <nav style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'40px 0 32px',
          borderBottom:'1px solid rgba(255,255,255,0.07)',
        }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none' }}>
            <div style={{
              width:"35%", height:"35%", background:'#000', borderRadius:9,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            }}>
              <img src={LogoLight} alt="TalexHub"
                style={{ width:'100%', height:'100%', objectFit:'contain' }} />
            </div>
            
          </Link>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* ── Language toggle — toggleLang is the correct function name ── */}
            <button
              className="cs-lang"
              onClick={toggleLang}
              style={{
                background:'transparent',
                border:'1px solid rgba(255,255,255,0.15)',
                color:'rgba(255,255,255,0.6)',
                padding:'7px 18px', borderRadius:100,
                fontSize:12, fontWeight:500, letterSpacing:'0.05em',
                cursor:'pointer', transition:'all 0.2s',
                fontFamily: isAr ? 'DM Sans,sans-serif' : 'Tajawal,sans-serif',
              }}>
              {isAr ? 'English' : 'عربي'}
            </button>

            <span style={{
              fontSize:11, fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase',
              color:'rgba(255,255,255,0.35)',
              border:'1px solid rgba(255,255,255,0.1)',
              padding:'7px 16px', borderRadius:100,
            }}>
              {isAr ? 'قريباً' : 'Coming Soon'}
            </span>
          </div>
        </nav>

        {/* HERO */}
        <main style={{
          flex:1, display:'flex', flexDirection:'column',
          justifyContent:'center', padding:'76px 0 60px', position:'relative',
        }}>

          {/* Deco number */}
          <div style={{
            position:'absolute',
            [dir === 'rtl' ? 'left' : 'right']: -14,
            top:'50%', transform:'translateY(-55%)',
            fontFamily:'DM Serif Display,serif',
            fontSize:'clamp(150px,22vw,250px)',
            color:'rgba(255,255,255,0.022)',
            fontWeight:400, pointerEvents:'none',
            letterSpacing:'-0.04em', userSelect:'none', lineHeight:1,
          }}>
            01
          </div>

          {/* Eyebrow */}
          <p style={{
            fontSize:11, fontWeight:500,
            letterSpacing:'0.18em', textTransform:'uppercase',
            color:'rgba(255,255,255,0.3)', marginBottom:30,
            display:'flex', alignItems:'center', gap:14,
            animation:'cs-fadein 0.6s ease both',
          }}>
            {!isAr && <span style={{ display:'inline-block', width:28, height:1, background:'rgba(255,255,255,0.2)', flexShrink:0 }} />}
            {isAr ? 'نطلق قريباً' : 'We are launching soon'}
            {isAr  && <span style={{ display:'inline-block', width:28, height:1, background:'rgba(255,255,255,0.2)', flexShrink:0 }} />}
          </p>

          {/* H1 */}
          <h1 style={{
            fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Serif Display,serif',
            fontSize:'clamp(46px,8vw,84px)',
            fontWeight: isAr ? 700 : 400,
            lineHeight: isAr ? 1.25 : 1.0,
            letterSpacing: isAr ? 0 : '-0.03em',
            color:'#fff', marginBottom:10,
            animation:'cs-fadein 0.7s ease 0.1s both',
          }}>
            {isAr ? (
              <>مسيرتك المهنية،<br /><span style={{ color:'rgba(255,255,255,0.38)', fontWeight:300 }}>بشكل مختلف.</span></>
            ) : (
              <>Your career,<br /><em style={{ fontStyle:'italic', color:'rgba(255,255,255,0.38)' }}>redefined.</em></>
            )}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: isAr ? 17 : 16, fontWeight:300,
            color:'rgba(255,255,255,0.42)', lineHeight:1.85, maxWidth:500,
            marginTop:28, marginBottom:52,
            fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif',
            animation:'cs-fadein 0.7s ease 0.2s both',
          }}>
            {isAr
              ? 'TalexHub منصة مهنية مدعومة بالذكاء الاصطناعي — تربط المواهب العربية بالفرص العالمية بذكاء حقيقي.'
              : 'TalexHub is an AI-powered career platform built for Arab professionals — matching talent with global opportunities, smarter than ever.'}
          </p>

          {/* Email form */}
          <div style={{ maxWidth:500, animation:'cs-fadein 0.7s ease 0.3s both' }}>
            {!submitted ? (
              <>
                <div style={{
                  display:'flex',
                  border:'1px solid rgba(255,255,255,0.13)',
                  borderRadius:12, overflow:'hidden',
                  background:'rgba(255,255,255,0.03)',
                }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder={isAr ? 'أدخل بريدك الإلكتروني للوصول المبكر' : 'Enter your email for early access'}
                    style={{
                      flex:1, background:'transparent', border:'none', outline:'none',
                      padding:'15px 20px', fontSize:14, color:'#fff', minWidth:0,
                      fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif',
                      fontWeight:300, textAlign: isAr ? 'right' : 'left',
                    }}
                  />
                  <button
                    className="cs-submit"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      background:'#fff', color:'#000', border:'none',
                      padding:'15px 24px', fontSize:13, fontWeight:600,
                      fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      letterSpacing:'0.03em', transition:'background 0.2s',
                      whiteSpace:'nowrap', flexShrink:0,
                      opacity: loading ? 0.6 : 1,
                    }}>
                    {loading ? '...' : (isAr ? 'أبلغني عند الإطلاق' : 'Notify me')}
                  </button>
                </div>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', marginTop:12,
                  fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif' }}>
                  {isAr ? 'لن نرسل لك بريداً مزعجاً أبداً.' : 'No spam, ever.'}
                </p>
              </>
            ) : (
              <div style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'16px 20px',
                border:'1px solid rgba(255,255,255,0.12)',
                borderRadius:12, background:'rgba(255,255,255,0.04)',
              }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:'rgba(255,255,255,0.5)', flexShrink:0 }} />
                <span style={{ fontSize:14, color:'rgba(255,255,255,0.55)',
                  fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif' }}>
                  {isAr ? 'تم تسجيلك — سنتواصل معك قريباً.' : "You're on the list — we'll reach out soon."}
                </span>
              </div>
            )}
          </div>

          {/* Feature pills */}
          <div style={{
            display:'flex', flexWrap:'wrap', gap:10,
            marginTop:46, animation:'cs-fadein 0.7s ease 0.4s both',
          }}>
            {features.map((f, i) => (
              <span key={i} className="cs-feat" style={{
                fontSize:12, fontWeight:400,
                color:'rgba(255,255,255,0.28)',
                border:'1px solid rgba(255,255,255,0.07)',
                padding:'6px 15px', borderRadius:100,
                letterSpacing:'0.02em', cursor:'default',
                transition:'color 0.2s, border-color 0.2s',
                fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif',
              }}>
                {f}
              </span>
            ))}
          </div>
        </main>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.06)' }} />

        {/* Footer */}
        <footer style={{
          padding:'28px 0 40px',
          display:'flex', alignItems:'center',
          justifyContent:'space-between', flexWrap:'wrap', gap:16,
        }}>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.18)', letterSpacing:'0.02em',
            fontFamily: isAr ? 'Tajawal,sans-serif' : 'DM Sans,sans-serif' }}>
            {isAr ? '© 2026 TalexHub. جميع الحقوق محفوظة.' : '© 2026 TalexHub. All rights reserved.'}
          </p>
        </footer>

      </div>
    </div>
  );
}