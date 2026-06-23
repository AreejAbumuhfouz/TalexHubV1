import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useLangStore from '../../../i18n';

function AnimCounter({ to, suffix = '', delay = 0 }) {
  const [val, setVal]   = useState(0);
  const ref             = useRef(null);
  const started         = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now() + delay; const dur = 1600;
        const tick = () => {
          const now = Date.now();
          if (now < t0) { requestAnimationFrame(tick); return; }
          const p = Math.min((now - t0) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - p, 4)) * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick); obs.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, delay]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function Stats() {
  const { lang } = useLangStore();
  const isAr = lang === 'ar';

  const stats = [
    { to:45000, suffix:'+', ar:'باحث عن عمل نشط',    en:'Active Job Seekers',    dAr:'مسجّل على المنصة',    dEn:'registered on platform'   },
    { to:1200,  suffix:'+', ar:'شركة موثّقة',          en:'Verified Companies',    dAr:'من 16 دولة عربية',    dEn:'across 16 Arab countries' },
    { to:87,    suffix:'%', ar:'نسبة التوظيف الناجح', en:'Successful Hire Rate',  dAr:'خلال 30 يوم أو أقل', dEn:'within 30 days or less'   },
    { to:320,   suffix:'K+',ar:'وظيفة مكتملة',         en:'Jobs Completed',        dAr:'منذ انطلاق المنصة',  dEn:'since platform launch'    },
  ];

  return (
    <section aria-label={isAr ? 'إحصاءات المنصة' : 'Platform statistics'}
      style={{ padding:'72px 24px', background:'var(--bg-primary)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <motion.div
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-60px' }}
          transition={{ duration:0.65, ease:[0.4,0,0.2,1] }}
          style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:0 }}>
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity:0, y:16 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true }}
              transition={{ duration:0.55, ease:[0.4,0,0.2,1], delay: i * 0.08 }}
              style={{
                padding:'32px 28px', textAlign:'center',
                borderInlineEnd: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
              <div style={{ fontSize:'clamp(2rem,4vw,2.8rem)', fontWeight:800, color:'var(--text-primary)', letterSpacing:'-0.04em', lineHeight:1, marginBottom:10, fontFamily:'var(--font-en)' }}>
                <AnimCounter to={s.to} suffix={s.suffix} delay={i * 120} />
              </div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>
                {isAr ? s.ar : s.en}
              </div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
                {isAr ? s.dAr : s.dEn}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}