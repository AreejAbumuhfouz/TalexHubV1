import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';

const STEPS = [
  { num:'01', icon:'👤', ar:'أنشئ حسابك مجاناً',    en:'Create Your Free Account',
    dAr:'سجّل في دقيقة واحدة باستخدام بريدك الإلكتروني أو حساب Google.',
    dEn:'Register in one minute using your email or Google account.' },
  { num:'02', icon:'📄', ar:'ارفع سيرتك الذاتية',   en:'Upload Your CV',
    dAr:'ارفع سيرتك الذاتية ودع الذكاء الاصطناعي يحللها ويحسّنها فوراً.',
    dEn:'Upload your CV and let AI analyse and optimise it instantly.' },
  { num:'03', icon:'🔍', ar:'اكتشف الوظائف المناسبة', en:'Discover Matching Jobs',
    dAr:'احصل على قائمة مخصصة من الوظائف التي تناسب ملفك المهني تماماً.',
    dEn:'Get a personalised list of jobs perfectly tailored to your professional profile.' },
  { num:'04', icon:'🏆', ar:'تقدّم واحصل على وظيفتك', en:'Apply & Get Hired',
    dAr:'تقدم بنقرة واحدة أو دع النظام يتقدم تلقائياً ثم استعد للمقابلة.',
    dEn:'Apply with one click or let the system apply automatically, then prepare for your interview.' },
];

export default function Process() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';

  return (
    <section aria-label={isAr ? 'كيف يعمل TalexHub' : 'How TalexHub works'}
      style={{ padding:'62px 24px', background:'var(--bg-primary)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }} dir={dir}>

        {/* Head */}
        <motion.div
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-60px' }}
          transition={{ duration:0.65, ease:[0.4,0,0.2,1] }}
          style={{ textAlign:'center', marginBottom:52 }}>
          <span style={{ display:'inline-block', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary)', fontFamily:'var(--font-en)', marginBottom:16 }}>
            {isAr ? 'كيف يعمل' : 'How It Works'}
          </span>
          <h2 style={{ fontSize:'clamp(1.75rem,3.5vw,2.6rem)', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:14, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? 'أربع خطوات إلى وظيفتك المثالية' : 'Four Steps to Your Dream Job'}
          </h2>
          <p style={{ fontSize:16, color:'var(--text-secondary)', lineHeight:1.8, maxWidth:520, margin:'0 auto' }}>
            {isAr
              ? 'عملية مبسّطة تأخذ بيدك من التسجيل حتى الحصول على العرض الوظيفي'
              : 'A streamlined process that guides you from registration all the way to your job offer'}
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:22 }}>
          {STEPS.map((s, i) => (
            <motion.article key={i}
              initial={{ opacity:0, y:24 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, margin:'-40px' }}
              transition={{ duration:0.55, ease:[0.4,0,0.2,1], delay: i * 0.08 }}
              whileHover={{ y:-4, boxShadow: isDark ? '0 16px 48px rgba(0,0,0,0.35)' : '0 16px 48px rgba(0,0,0,0.07)' }}
              style={{
                background:'var(--bg-primary)', border:'1px solid var(--border)',
                borderRadius:20, padding:'30px 26px',
                position:'relative', transition:'border-color 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-400)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>

              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-secondary)', letterSpacing:'0.1em', fontFamily:'var(--font-en)', marginBottom:18 }}>{s.num}</div>
              <div style={{ width:50, height:50, borderRadius:13, background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, marginBottom:18 }}>{s.icon}</div>
              <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:10, letterSpacing:'-0.01em' }}>
                {isAr ? s.ar : s.en}
              </h3>
              <p style={{ fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.75 }}>
                {isAr ? s.dAr : s.dEn}
              </p>

              {/* Step connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div style={{
                  display:'none', position:'absolute', top:48,
                  insetInlineEnd:-12, width:24, height:1,
                  background:'var(--border)', zIndex:2,
                }} className="step-line" />
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}