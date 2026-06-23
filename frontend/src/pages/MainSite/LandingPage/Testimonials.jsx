import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLangStore from '../../../i18n';

const TESTIMONIALS = [
  { nameAr:'سارة المنصوري', nameEn:'Sara Al-Mansoori', roleAr:'مطوّرة React — دبي', roleEn:'React Developer — Dubai', avatar:'👩‍💻',
    qAr:'حصلت على وظيفتي في أقل من 3 أسابيع بعد تسجيلي في TalexHub. تحليل الذكاء الاصطناعي لسيرتي غيّر طريقة تقديمي بالكامل.',
    qEn:'I landed my job in less than 3 weeks after joining TalexHub. The AI analysis of my CV completely changed the way I present my applications.', rating:5 },
  { nameAr:'خالد العبدلي', nameEn:'Khaled Al-Abdali', roleAr:'مدير منتجات — الرياض', roleEn:'Product Manager — Riyadh', avatar:'👨‍💼',
    qAr:'ميزة تدريب المقابلات كانت الفيصل. تدرّبت مع الـ AI ثلاث مرات قبل المقابلة الحقيقية وكانت النتيجة مذهلة.',
    qEn:'The interview training feature was the game-changer. I practised with the AI three times before the real interview, and the result was incredible.', rating:5 },
  { nameAr:'ريم الشمري', nameEn:'Reem Al-Shamri', roleAr:'مصمّمة UX — عمّان', roleEn:'UX Designer — Amman', avatar:'👩‍🎨',
    qAr:'ما يميّز TalexHub هو أنه يفهم سوق العمل العربي فعلاً. ليس مجرد نسخة مترجمة من منصات أجنبية.',
    qEn:'What sets TalexHub apart is that it genuinely understands the Arab job market. It is not just a translated version of foreign platforms.', rating:5 },
  { nameAr:'أحمد السالم', nameEn:'Ahmad Al-Salem', roleAr:'مهندس بيانات — القاهرة', roleEn:'Data Engineer — Cairo', avatar:'👨‍💻',
    qAr:'التقديم التلقائي للوظائف وفّر عليّ ساعات يومياً. المنصة تعمل بينما أنا مشغول بعملي الحالي.',
    qEn:'The auto job application saved me hours every day. The platform works while I am busy with my current job.', rating:5 },
];

export default function Testimonials() {
  const { lang, dir } = useLangStore();
  const isAr = lang === 'ar';
  const [cur, setCur]    = useState(0);
  const intervalRef      = useRef(null);

  const next = useCallback(() => setCur(c => (c + 1) % TESTIMONIALS.length), []);
  const prev = useCallback(() => setCur(c => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length), []);

  useEffect(() => { intervalRef.current = setInterval(next, 5500); return () => clearInterval(intervalRef.current); }, [next]);

  const t = TESTIMONIALS[cur];

  return (
    <section aria-label={isAr ? 'آراء المستخدمين' : 'User testimonials'}
      style={{ padding:'96px 24px', background:'var(--bg-primary)' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }} dir={dir}>

        {/* Head */}
        <motion.div
          initial={{ opacity:0, y:24 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true, margin:'-60px' }}
          transition={{ duration:0.65, ease:[0.4,0,0.2,1] }}
          style={{ textAlign:'center', marginBottom:48 }}>
          <span style={{ display:'inline-block', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-secondary)', fontFamily:'var(--font-en)', marginBottom:16 }}>
            {isAr ? 'قصص النجاح' : 'Success Stories'}
          </span>
          <h2 style={{ fontSize:'clamp(1.75rem,3.5vw,2.4rem)', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.03em', lineHeight:1.15, marginBottom:12, fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
            {isAr ? 'ماذا يقول مستخدمونا' : 'What Our Users Say'}
          </h2>
          <p style={{ fontSize:15, color:'var(--text-secondary)', maxWidth:440, margin:'0 auto' }}>
            {isAr ? 'آلاف المهنيين العرب وجدوا وظائفهم المثالية عبر TalexHub' : 'Thousands of Arab professionals found their dream jobs through TalexHub'}
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity:0, y:20 }}
          whileInView={{ opacity:1, y:0 }}
          viewport={{ once:true }}
          transition={{ duration:0.6, ease:[0.4,0,0.2,1] }}
          style={{
            background:'var(--bg-secondary)', border:'1px solid var(--border)',
            borderRadius:24, padding:'clamp(32px,5vw,52px)', textAlign:'center',
            marginBottom:28, minHeight:260, display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden',
          }}>
          {/* Quote mark */}
          <div style={{
            position:'absolute', top:20, insetInlineStart:24,
            fontSize:72, lineHeight:1, color:'var(--border)',
            fontFamily:'Georgia,serif', userSelect:'none', pointerEvents:'none',
          }}>"</div>

          <AnimatePresence mode="wait">
            <motion.div key={cur}
              initial={{ opacity:0, y:12 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0, y:-12 }}
              transition={{ duration:0.35, ease:[0.4,0,0.2,1] }}
              style={{ position:'relative', zIndex:1 }}>
              <div style={{ width:58, height:58, borderRadius:'50%', background:'var(--bg-tertiary)', border:'2px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, margin:'0 auto 14px' }}>
                {t.avatar}
              </div>
              <div style={{ display:'flex', gap:3, justifyContent:'center', marginBottom:18 }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} style={{ color:'#F59E0B', fontSize:15 }}>★</span>
                ))}
              </div>
              <blockquote style={{ fontSize:'clamp(14px,2vw,17px)', color:'var(--text-primary)', lineHeight:1.85, fontWeight:400, maxWidth:580, margin:'0 auto 22px', fontStyle:'normal' }}>
                {isAr ? t.qAr : t.qEn}
              </blockquote>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>{isAr ? t.nameAr : t.nameEn}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:3 }}>{isAr ? t.roleAr : t.roleEn}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Controls */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14 }}>
          <button onClick={() => { clearInterval(intervalRef.current); prev(); }} aria-label={isAr ? 'السابق' : 'Previous'}
            style={{ width:36, height:36, borderRadius:'50%', border:'1.5px solid var(--border)', background:'var(--bg-primary)', cursor:'pointer', fontSize:13, color:'var(--text-primary)', display:'flex', alignItems:'center', justifyContent:'center', transition:'border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {isAr ? '→' : '←'}
          </button>
          <div style={{ display:'flex', gap:7 }}>
            {TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => { clearInterval(intervalRef.current); setCur(i); }}
                aria-label={`${i + 1}`}
                style={{ width: cur === i ? 22 : 7, height:7, borderRadius:99, border:'none', background: cur === i ? 'var(--text-primary)' : 'var(--border)', cursor:'pointer', transition:'all 0.3s ease', padding:0 }} />
            ))}
          </div>
          <button onClick={() => { clearInterval(intervalRef.current); next(); }} aria-label={isAr ? 'التالي' : 'Next'}
            style={{ width:36, height:36, borderRadius:'50%', border:'1.5px solid var(--border)', background:'var(--bg-primary)', cursor:'pointer', fontSize:13, color:'var(--text-primary)', display:'flex', alignItems:'center', justifyContent:'center', transition:'border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
            {isAr ? '←' : '→'}
          </button>
        </div>
      </div>
    </section>
  );
}