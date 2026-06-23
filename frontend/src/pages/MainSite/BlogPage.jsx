import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import useLang from '../i18n';

const C = { slate:'#2D3436', trust:'#0047AB', ai:'#00FFFF', clear:'#F7F7F7', action:'#FFC300' };

const POSTS = [
  { id:'1',
    catAr:'نصائح مهنية', catEn:'Career Tips',
    titleAr:'كيف تكتب سيرة ذاتية تتخطى فلتر ATS في 2025',
    titleEn:'How to Write a CV That Passes ATS in 2025',
    excerptAr:'يرفض نظام ATS أكثر من 75% من السير الذاتية قبل أن يراها إنسان. إليك الطريقة الصحيحة لتجاوزه.',
    excerptEn:'ATS systems reject over 75% of CVs before any human sees them. Here is how to pass the filter.',
    readAr:'5 دقائق', readEn:'5 min', date:'2025-04-15', emoji:'📄',
    tagsAr:['سيرة ذاتية','ATS','توظيف'], tagsEn:['CV','ATS','Career'],
    contentAr:'نظام تتبع المتقدمين (ATS) هو برنامج يستخدمه أصحاب العمل لفلترة السير الذاتية تلقائياً قبل مراجعتها يدوياً. لإنشاء سيرة ذاتية تتجاوز هذا النظام:\n\n• استخدم الكلمات المفتاحية من إعلان الوظيفة بشكل طبيعي\n• اختر تنسيقاً بسيطاً وواضحاً بدون جداول أو أعمدة معقدة\n• استخدم عناوين قياسية مثل "الخبرات العملية" و"التعليم"\n• تجنب الصور والرسوم البيانية في السيرة الذاتية\n• احفظ الملف بصيغة PDF أو DOCX\n\nباتباع هذه النصائح، ستزيد فرصك في الوصول إلى مرحلة المقابلة بشكل كبير.',
    contentEn:'Applicant Tracking Systems (ATS) automatically filter CVs before human review. To create an ATS-friendly CV:\n\n• Naturally incorporate keywords from the job posting\n• Use a clean, simple format without complex tables or columns\n• Use standard headings like "Work Experience" and "Education"\n• Avoid images and graphics in your CV\n• Save as PDF or DOCX format\n\nFollowing these tips will significantly increase your chances of reaching the interview stage.',
  },
  { id:'2',
    catAr:'المقابلات', catEn:'Interviews',
    titleAr:'10 أسئلة شائعة في المقابلات وكيف تجيب عليها',
    titleEn:'10 Common Interview Questions & How to Answer Them',
    excerptAr:'هذه الأسئلة تظهر في كل مقابلة تقريباً. تعلّم كيف تجيب عليها باحترافية.',
    excerptEn:'These questions appear in almost every interview. Learn how to answer them professionally.',
    readAr:'8 دقائق', readEn:'8 min', date:'2025-04-10', emoji:'🎤',
    tagsAr:['مقابلة','نجاح','وظيفة'], tagsEn:['Interview','Success','Job'],
    contentAr:'أبرز الأسئلة الشائعة في المقابلات:\n\n1. حدّثنا عن نفسك — جهّز ملخصاً مهنياً من 2 دقيقتين\n2. ما هي نقاط قوتك وضعفك؟ — كن صادقاً ومحدداً\n3. لماذا تريد العمل لدينا؟ — ابحث عن الشركة مسبقاً\n4. أين ترى نفسك بعد 5 سنوات؟ — اربطها بأهداف الشركة\n5. لماذا تركت وظيفتك السابقة؟ — كن إيجابياً\n\nالسر الأساسي: استعد مسبقاً وتدرّب مع مرايا أو مع أصدقاء.',
    contentEn:'Top common interview questions:\n\n1. Tell me about yourself — prepare a 2-minute professional summary\n2. What are your strengths and weaknesses? — Be honest and specific\n3. Why do you want to work here? — Research the company beforehand\n4. Where do you see yourself in 5 years? — Link it to company goals\n5. Why did you leave your last job? — Stay positive\n\nThe key: prepare in advance and practice with a mirror or friends.',
  },
  { id:'3',
    catAr:'سوق العمل', catEn:'Job Market',
    titleAr:'أكثر 10 مهارات طلباً في سوق العمل العربي 2025',
    titleEn:'Top 10 Most In-Demand Skills in Arab Job Market 2025',
    excerptAr:'تحليل شامل لأكثر المهارات طلباً بناءً على آلاف الوظائف المنشورة في OPN.',
    excerptEn:'A comprehensive analysis of the most in-demand skills based on thousands of jobs on OPN.',
    readAr:'6 دقائق', readEn:'6 min', date:'2025-04-05', emoji:'📊',
    tagsAr:['مهارات','تقنية','سوق العمل'], tagsEn:['Skills','Tech','Job Market'],
    contentAr:'بناءً على تحليل آلاف الوظائف في منصة OPN، هذه أكثر المهارات طلباً:\n\n1. الذكاء الاصطناعي وتعلم الآلة\n2. تطوير الويب (React، Node.js)\n3. تحليل البيانات وPython\n4. الأمن السيبراني\n5. التسويق الرقمي\n6. إدارة المشاريع\n7. UX/UI Design\n8. DevOps والسحابة\n9. إدارة المنتجات\n10. اللغة الإنجليزية للأعمال\n\nاستثمر في هذه المهارات لتحسين فرصك في سوق العمل.',
    contentEn:'Based on analysis of thousands of jobs on OPN, here are the most in-demand skills:\n\n1. AI & Machine Learning\n2. Web Development (React, Node.js)\n3. Data Analysis & Python\n4. Cybersecurity\n5. Digital Marketing\n6. Project Management\n7. UX/UI Design\n8. DevOps & Cloud\n9. Product Management\n10. Business English\n\nInvest in these skills to improve your job market prospects.',
  },
  { id:'4',
    catAr:'ذكاء اصطناعي', catEn:'AI & Career',
    titleAr:'الذكاء الاصطناعي وسوق العمل: كيف تستعد لمستقبل العمل',
    titleEn:'AI & the Job Market: How to Prepare for the Future of Work',
    excerptAr:'الذكاء الاصطناعي يغير طبيعة العمل. تعرّف على كيفية الاستعداد والاستفادة منه.',
    excerptEn:'AI is changing the nature of work. Learn how to prepare and benefit from it.',
    readAr:'9 دقائق', readEn:'9 min', date:'2025-03-28', emoji:'🤖',
    tagsAr:['AI','مستقبل','تقنية'], tagsEn:['AI','Future','Technology'],
    contentAr:'الذكاء الاصطناعي لا يأخذ الوظائف، بل يغير طبيعتها. إليك كيف تستعد:\n\n• تعلّم كيف تستخدم أدوات الذكاء الاصطناعي في مجالك\n• ركّز على المهارات التي لا يستطيع AI إتقانها: الإبداع، التفكير النقدي، التواصل البشري\n• ابقَ محدّثاً بالتطورات في مجالك\n• استخدم AI كمساعد لرفع إنتاجيتك\n• طوّر مهاراتك التقنية الأساسية\n\nالمستقبل للمهنيين الذين يُتقنون العمل مع الذكاء الاصطناعي لا ضده.',
    contentEn:'AI is not taking jobs, it is changing their nature. Here is how to prepare:\n\n• Learn how to use AI tools in your field\n• Focus on skills AI cannot master: creativity, critical thinking, human connection\n• Stay updated with developments in your field\n• Use AI as an assistant to boost your productivity\n• Develop your core technical skills\n\nThe future belongs to professionals who master working with AI, not against it.',
  },
  { id:'5',
    catAr:'تطوير الذات', catEn:'Self-Development',
    titleAr:'كيف تبني شبكة علاقات مهنية قوية في العالم الرقمي',
    titleEn:'How to Build a Strong Professional Network in the Digital World',
    excerptAr:'شبكتك المهنية هي رأس مالك الحقيقي. تعلم بناءها بطريقة أصيلة.',
    excerptEn:'Your professional network is your real capital. Learn to build it authentically.',
    readAr:'7 دقائق', readEn:'7 min', date:'2025-03-20', emoji:'🤝',
    tagsAr:['نيتورك','لينكدإن','علاقات'], tagsEn:['Networking','LinkedIn','Connections'],
    contentAr:'بناء شبكة مهنية قوية يبدأ بالأصالة:\n\n• حسّن ملفك الشخصي على LinkedIn\n• شارك محتوى ذا قيمة في مجالك\n• تواصل مع الناس بنية حقيقية، لا فقط لطلب شيء\n• انضم إلى مجتمعات OPN والمجموعات المتخصصة\n• تابع الفعاليات المهنية حضورياً وافتراضياً\n• قدّم المساعدة قبل أن تطلبها\n\nالشبكة الحقيقية تُبنى على الثقة والعطاء المتبادل.',
    contentEn:'Building a strong professional network starts with authenticity:\n\n• Optimise your LinkedIn profile\n• Share valuable content in your field\n• Connect with people with genuine intent, not just to ask for things\n• Join OPN communities and specialised groups\n• Attend professional events in person and virtually\n• Give help before you ask for it\n\nA real network is built on trust and mutual giving.',
  },
  { id:'6',
    catAr:'نصائح مهنية', catEn:'Career Tips',
    titleAr:'من موظف إلى رائد أعمال: خطوات عملية للانطلاق',
    titleEn:'From Employee to Entrepreneur: Practical Steps to Get Started',
    excerptAr:'هل تفكر في ترك وظيفتك؟ هذا الدليل يساعدك على اتخاذ القرار الصحيح.',
    excerptEn:'Thinking about leaving your job? This guide helps you make the right decision.',
    readAr:'10 دقائق', readEn:'10 min', date:'2025-03-10', emoji:'🚀',
    tagsAr:['ريادة','أعمال','استقلالية'], tagsEn:['Entrepreneurship','Business','Freelance'],
    contentAr:'قبل أن تترك وظيفتك، خطط جيداً:\n\n• جهّز مدخرات تكفيك لـ 6 أشهر على الأقل\n• اختبر فكرتك وأنت لا تزال موظفاً\n• ابنِ قاعدة عملاء أو متابعين أولاً\n• تعلّم أساسيات إدارة الأعمال والتسويق\n• ابحث عن مرشد أو شريك يكمّلك\n• ابدأ بمشاريع صغيرة لتبني ثقتك\n\nالانتقال الناجح يتطلب تخطيطاً دقيقاً وشجاعة حقيقية.',
    contentEn:'Before leaving your job, plan carefully:\n\n• Save at least 6 months of expenses\n• Test your idea while still employed\n• Build a customer or follower base first\n• Learn business and marketing fundamentals\n• Find a mentor or complementary partner\n• Start with small projects to build confidence\n\nA successful transition requires careful planning and real courage.',
  },
];

const CATS_AR = ['الكل','نصائح مهنية','المقابلات','سوق العمل','ذكاء اصطناعي','تطوير الذات'];
const CATS_EN = ['All','Career Tips','Interviews','Job Market','AI & Career','Self-Development'];

function PostCard({ post, lang }) {
  const isAr = lang === 'ar';
  return (
    <Link to={`/blog/${post.id}`} style={{ textDecoration:'none', display:'block' }}>
      <div style={{
        background:'white', borderRadius:18, overflow:'hidden',
        border:`1px solid rgba(0,71,171,0.08)`,
        transition:'all 0.25s ease', height:'100%', display:'flex', flexDirection:'column',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-5px)'; e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,71,171,0.1)`; e.currentTarget.style.borderColor='rgba(0,71,171,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(0,71,171,0.08)'; }}>
        {/* Cover */}
        <div style={{
          height:140,
          background:`linear-gradient(135deg, rgba(0,71,171,0.08) 0%, rgba(0,71,171,0.04) 100%)`,
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:56, position:'relative',
        }}>
          {post.emoji}
          <span style={{
            position:'absolute', top:12, [isAr?'right':'left']:12,
            background:`rgba(0,71,171,0.1)`, border:`1px solid rgba(0,71,171,0.2)`,
            color:C.trust, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99,
          }}>
            {isAr ? post.catAr : post.catEn}
          </span>
        </div>
        {/* Content */}
        <div style={{ padding:'18px 20px', flexGrow:1, display:'flex', flexDirection:'column' }}>
          <h3 style={{ fontWeight:800, color:C.slate, fontSize:15, lineHeight:1.5, marginBottom:10,
            display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {isAr ? post.titleAr : post.titleEn}
          </h3>
          <p style={{ color:'rgba(45,52,54,0.5)', fontSize:13, lineHeight:1.7, flexGrow:1,
            display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {isAr ? post.excerptAr : post.excerptEn}
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:12, marginBottom:14 }}>
            {(isAr ? post.tagsAr : post.tagsEn).map(t => (
              <span key={t} style={{ fontSize:11, color:'rgba(45,52,54,0.4)', background:C.clear, padding:'2px 8px', borderRadius:99 }}>
                #{t}
              </span>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, borderTop:`1px solid rgba(0,71,171,0.06)` }}>
            <span style={{ fontSize:12, color:'rgba(45,52,54,0.4)' }}>
              📅 {new Date(post.date).toLocaleDateString(isAr?'ar-EG':'en-US',{year:'numeric',month:'short',day:'numeric'})}
            </span>
            <span style={{ fontSize:12, color:'rgba(45,52,54,0.4)' }}>
              ⏱ {isAr ? post.readAr : post.readEn}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Single post view ─────────────────────────────────────
function PostDetail({ post, lang, dir, onBack }) {
  const isAr = lang === 'ar';
  return (
    <div dir={dir}>
      <Header />
      <div style={{ maxWidth:740, margin:'0 auto', padding:'100px 24px 60px' }}>
        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:C.trust, fontSize:14, fontWeight:600, display:'flex', alignItems:'center', gap:6, marginBottom:24, fontFamily:'Tajawal, DM Sans, sans-serif' }}>
          {dir==='rtl' ? '→ ' : '← '}{isAr?'العودة للمدونة':'Back to Blog'}
        </button>
        <div style={{ background:`rgba(0,71,171,0.06)`, border:`1px solid rgba(0,71,171,0.12)`, color:C.trust, fontSize:12, fontWeight:700, padding:'4px 14px', borderRadius:99, display:'inline-block', marginBottom:20 }}>
          {isAr ? post.catAr : post.catEn}
        </div>
        <h1 style={{ fontSize:'clamp(1.6rem,4vw,2.4rem)', fontWeight:900, color:C.slate, marginBottom:16, lineHeight:1.3, fontFamily:'DM Serif Display, Tajawal, serif' }}>
          {isAr ? post.titleAr : post.titleEn}
        </h1>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:36, flexWrap:'wrap' }}>
          <span style={{ fontSize:13, color:'rgba(45,52,54,0.4)' }}>
            📅 {new Date(post.date).toLocaleDateString(isAr?'ar-EG':'en-US',{year:'numeric',month:'long',day:'numeric'})}
          </span>
          <span style={{ fontSize:13, color:'rgba(45,52,54,0.4)' }}>⏱ {isAr ? post.readAr : post.readEn}</span>
        </div>
        <div style={{ fontSize:80, textAlign:'center', marginBottom:36, padding:'32px', background:`rgba(0,71,171,0.04)`, borderRadius:20 }}>
          {post.emoji}
        </div>
        <div style={{ fontSize:16, lineHeight:2, color:'rgba(45,52,54,0.75)', whiteSpace:'pre-line' }}>
          {isAr ? post.contentAr : post.contentEn}
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:32, paddingTop:24, borderTop:`1px solid rgba(0,71,171,0.08)` }}>
          {(isAr ? post.tagsAr : post.tagsEn).map(t => (
            <span key={t} style={{ fontSize:12, background:`rgba(0,71,171,0.07)`, border:`1px solid rgba(0,71,171,0.15)`, color:C.trust, padding:'4px 12px', borderRadius:99 }}>#{t}</span>
          ))}
        </div>
        <div style={{ marginTop:48, padding:'28px', background:`linear-gradient(135deg, #020A15, #041228)`, borderRadius:20, textAlign:'center', border:`1px solid rgba(0,71,171,0.2)` }}>
          <p style={{ color:'rgba(247,247,247,0.7)', fontSize:14, marginBottom:14 }}>
            {isAr?'هل أنت مستعد لتطوير مسيرتك المهنية؟':'Ready to advance your career?'}
          </p>
          <Link to="/register" style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'11px 28px', borderRadius:12, background:`linear-gradient(135deg,${C.action},#FFB000)`, color:C.slate, textDecoration:'none', fontWeight:800, fontSize:14 }}>
            🚀 {isAr?'ابدأ مع OPN مجاناً':'Start with OPN Free'}
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN BLOG PAGE
// ══════════════════════════════════════════════
export default function BlogPage() {
  const { lang, dir } = useLang();
  const { id } = useParams();
  const navigate = useNavigate();
  const isAr = lang === 'ar';

  const [search, setSearch] = useState('');
  const [cat,    setCat]    = useState(isAr ? 'الكل' : 'All');

  const cats = isAr ? CATS_AR : CATS_EN;
  const allLabel = isAr ? 'الكل' : 'All';

  // Single post view
  if (id) {
    const post = POSTS.find(p => p.id === id);
    if (post) return <PostDetail post={post} lang={lang} dir={dir} onBack={() => navigate('/blog')} />;
  }

  const filtered = POSTS.filter(p => {
    const catMatch = cat === allLabel || (isAr ? p.catAr : p.catEn) === cat;
    const q = search.toLowerCase();
    const qMatch = !q ||
      (isAr ? p.titleAr : p.titleEn).toLowerCase().includes(q) ||
      (isAr ? p.excerptAr : p.excerptEn).toLowerCase().includes(q);
    return catMatch && qMatch;
  });

  return (
    <div dir={dir} style={{ minHeight:'100vh', background:C.clear, color:C.slate, fontFamily:'Tajawal, DM Sans, sans-serif' }}>
      <Header />

      {/* Hero */}
      <div style={{ background:`linear-gradient(160deg, #020A15, #041228, #020A15)`, padding:'100px 24px 60px', textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 50% 60%, rgba(0,71,171,0.15) 0%, transparent 65%)`, pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h1 style={{ fontSize:'clamp(2rem,5vw,3.2rem)', fontWeight:900, color:'white', marginBottom:12, fontFamily:'DM Serif Display, Tajawal, serif' }}>
            {isAr ? 'مدونة OPN' : 'OPN Blog'}
          </h1>
          <p style={{ color:'rgba(247,247,247,0.5)', marginBottom:28, fontSize:16 }}>
            {isAr ? 'نصائح مهنية، أخبار سوق العمل، وإلهام لمسيرتك' : 'Career advice, job market news, and professional inspiration'}
          </p>
          <div style={{ maxWidth:480, margin:'0 auto', position:'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={isAr ? 'ابحث في المقالات...' : 'Search articles...'}
              style={{ width:'100%', padding:'14px 48px 14px 18px', borderRadius:14, border:'none', outline:'none', fontSize:14, boxShadow:'0 4px 20px rgba(0,0,0,0.2)', fontFamily:'Tajawal, DM Sans, sans-serif' }} />
            <span style={{ position:'absolute', top:'50%', transform:'translateY(-50%)', [dir==='rtl'?'left':'right']:16, fontSize:18, color:'rgba(45,52,54,0.35)', pointerEvents:'none' }}>🔍</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1060, margin:'0 auto', padding:'40px 24px 60px' }}>
        {/* Category chips */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:36 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding:'8px 18px', borderRadius:99, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
              fontFamily:'Tajawal, DM Sans, sans-serif', transition:'all 0.2s',
              background: cat===c ? C.trust : 'white',
              color:       cat===c ? 'white' : 'rgba(45,52,54,0.6)',
              boxShadow:   cat===c ? `0 4px 14px rgba(0,71,171,0.25)` : '0 1px 4px rgba(0,0,0,0.06)',
            }}>{c}</button>
          ))}
        </div>

        {/* Featured */}
        {cat === allLabel && !search && filtered.length > 0 && (
          <Link to={`/blog/${filtered[0].id}`} style={{ textDecoration:'none', display:'block', marginBottom:32 }}>
            <div style={{ background:'white', borderRadius:20, overflow:'hidden', border:`1px solid rgba(0,71,171,0.08)`, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,71,171,0.1)`; e.currentTarget.style.borderColor='rgba(0,71,171,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.borderColor='rgba(0,71,171,0.08)'; }}>
              <div style={{ background:`linear-gradient(135deg, #020A15, #041228)`, minHeight:200, display:'flex', alignItems:'center', justifyContent:'center', fontSize:80 }}>
                {filtered[0].emoji}
              </div>
              <div style={{ padding:'28px 32px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginBottom:14 }}>
                  <span style={{ background:`rgba(0,71,171,0.08)`, color:C.trust, fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
                    {isAr ? filtered[0].catAr : filtered[0].catEn}
                  </span>
                  <span style={{ background:`rgba(255,195,0,0.12)`, color:'#B8860B', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:99 }}>
                    ⭐ {isAr?'مقال مميز':'Featured'}
                  </span>
                </div>
                <h2 style={{ fontWeight:900, color:C.slate, fontSize:'clamp(1.2rem,2.5vw,1.6rem)', marginBottom:12, lineHeight:1.4, fontFamily:'DM Serif Display, Tajawal, serif' }}>
                  {isAr ? filtered[0].titleAr : filtered[0].titleEn}
                </h2>
                <p style={{ color:'rgba(45,52,54,0.5)', fontSize:14, lineHeight:1.7, marginBottom:16 }}>
                  {isAr ? filtered[0].excerptAr : filtered[0].excerptEn}
                </p>
                <span style={{ color:C.trust, fontWeight:700, fontSize:14 }}>
                  {isAr?'اقرأ المقال ←':'Read Article →'}
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 24px', color:'rgba(45,52,54,0.4)' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
            <p style={{ fontSize:16, fontWeight:500 }}>{isAr?'لا توجد مقالات مطابقة':'No matching articles'}</p>
            <button onClick={() => { setSearch(''); setCat(allLabel); }} style={{ marginTop:12, background:'none', border:'none', color:C.trust, fontSize:14, fontWeight:600, cursor:'pointer' }}>
              {isAr?'إعادة الضبط':'Reset'}
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
            {(cat===allLabel&&!search ? filtered.slice(1) : filtered).map(p => (
              <PostCard key={p.id} post={p} lang={lang} />
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div style={{ marginTop:60, background:`linear-gradient(160deg, #020A15, #041228)`, borderRadius:20, padding:'40px 32px', textAlign:'center', border:`1px solid rgba(0,71,171,0.2)` }}>
          <h3 style={{ fontSize:'clamp(1.3rem,3vw,1.8rem)', fontWeight:900, color:'white', marginBottom:8, fontFamily:'DM Serif Display, Tajawal, serif' }}>
            {isAr?'اشترك في نشرتنا الأسبوعية':'Subscribe to Our Weekly Newsletter'}
          </h3>
          <p style={{ color:'rgba(247,247,247,0.5)', fontSize:14, marginBottom:24 }}>
            {isAr?'أحدث المقالات والنصائح المهنية في بريدك كل أسبوع':'Latest articles and career tips in your inbox every week'}
          </p>
          <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', maxWidth:440, margin:'0 auto' }}>
            <input type="email" placeholder={isAr?'بريدك الإلكتروني':'Your email'}
              dir="ltr"
              style={{ flex:1, minWidth:200, padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.06)', color:'white', fontSize:14, outline:'none', fontFamily:'DM Sans, sans-serif' }} />
            <button style={{ padding:'12px 24px', borderRadius:12, background:`linear-gradient(135deg,${C.action},#FFB000)`, border:'none', color:C.slate, fontSize:14, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Tajawal, DM Sans, sans-serif' }}>
              {isAr?'اشتراك':'Subscribe'}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}