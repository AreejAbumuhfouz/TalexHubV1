import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';
import useThemeStore from '../../../store/themeStore';

export default function CTA() {
  const { lang, dir } = useLangStore();
  const { theme }     = useThemeStore();
  const isAr  = lang === 'ar';
  const isDark = theme === 'dark';

  const heroBg = isDark
    ? 'linear-gradient(160deg,#0a0a0a 0%,#111 50%,#0a0a0a 100%)'
    : 'linear-gradient(160deg,#1A1A1E 0%,#2C2D31 60%,#1A1A1E 100%)';

  return (
    <section aria-label={isAr ? 'ابدأ الآن' : 'Get started'}
      style={{ padding:'62px 24px 62px', background:'var(--bg-primary)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:28 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-60px' }}
          transition={{ duration:0.7, ease:[0.4,0,0.2,1] }}
          style={{
            background:heroBg, borderRadius:28,
            padding:'clamp(48px,7vw,80px) clamp(24px,5vw,64px)',
            position:'relative', overflow:'hidden',
            display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
            gap:48, alignItems:'center',
          }}
          dir={dir}>
          {/* Radial tint */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'radial-gradient(ellipse at 30% 50%,rgba(255,255,255,0.04) 0%,transparent 60%)' }} />

          {/* Left — headline */}
          <div style={{ position:'relative', zIndex:1 }}>
            <h2 style={{
              fontSize:'clamp(1.8rem,3.5vw,2.8rem)', fontWeight:700,
              color:'#fff', marginBottom:14, lineHeight:1.15, letterSpacing:'-0.03em',
              fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
            }}>
              {isAr ? <>جاهز لتغيير<br />مسارك المهني؟</> : <>Ready to Transform<br />Your Career?</>}
            </h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:15, lineHeight:1.8, maxWidth:380 }}>
              {isAr
                ? 'انضم مجاناً اليوم وابدأ رحلتك نحو الوظيفة التي تستحقها. لا بطاقة ائتمان مطلوبة.'
                : 'Join free today and begin your journey toward the job you deserve. No credit card required.'}
            </p>
          </div>

          {/* Right — CTAs */}
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:11 }}>
            <Link to="/register"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'17px 22px', borderRadius:14, background:'#fff', color:'#1A1A1E', textDecoration:'none', transition:'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity='1';   e.currentTarget.style.transform='none'; }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                  {isAr ? 'ابدأ مجاناً كباحث عن عمل' : 'Start Free as Job Seeker'}
                </div>
                <div style={{ fontSize:12, color:'rgba(26,26,30,0.45)', marginTop:2 }}>
                  {isAr ? 'تحليل CV + مطابقة وظائف' : 'CV analysis + job matching'}
                </div>
              </div>
              <span style={{ fontSize:16 }}>{isAr ? '←' : '→'}</span>
            </Link>

            <Link to="/company/register"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'17px 22px', borderRadius:14, background:'rgba(255,255,255,0.07)', border:'1.5px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.8)', textDecoration:'none', transition:'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.32)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.14)'; e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
                  {isAr ? 'وظّف أفضل المواهب' : 'Hire Top Talent'}
                </div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.32)', marginTop:2 }}>
                  {isAr ? 'حساب صاحب عمل ' : 'Employer account'}
                </div>
              </div>
              <span style={{ fontSize:16 }}>{isAr ? '←' : '→'}</span>
            </Link>

            {/* <p style={{ fontSize:12, color:'rgba(255,255,255,0.28)', textAlign:'center', marginTop:3 }}>
              {isAr
                ? '✓ لا رسوم خفية · ✓ إلغاء في أي وقت · ✓ بدون بطاقة ائتمان'
                : '✓ No hidden fees · ✓ Cancel anytime · ✓ No credit card'}
            </p> */}
          </div>
        </motion.div>
      </div>
    </section>
  );
}