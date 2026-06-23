import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import useLangStore from '../i18n';
import useThemeStore from '../store/themeStore';

/* ════════════════════════════════════════════════════════════
   CUSTOM HOOK: Intersection Observer
════════════════════════════════════════════════════════════ */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isVisible];
}

/* ════════════════════════════════════════════════════════════
   ANIMATED BLOCK COMPONENT
════════════════════════════════════════════════════════════ */
function AnimBlock({ children, delay = 0 }) {
  const [ref, isVisible] = useInView();
  
  return (
    <div
      ref={ref}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   FAQ DATA
════════════════════════════════════════════════════════════ */
const getFAQData = (isAr) => [
  {
    category: isAr ? 'عام' : 'General',
    icon: '🌐',
    questions: [
      {
        q: isAr ? 'ما هي TalexHub؟' : 'What is TalexHub?',
        a: isAr
          ? 'TalexHub هي منصة توظيف ذكية تستخدم الذكاء الاصطناعي لربط المواهب العربية بأفضل فرص العمل. نقوم بتحليل السير الذاتية، ومطابقتها مع الوظائف المناسبة، والتقديم تلقائياً نيابة عنك.'
          : 'TalexHub is a smart recruitment platform that uses AI to connect Arab talent with the best job opportunities. We analyze CVs, match them with suitable positions, and auto-apply on your behalf.',
      },
      {
        q: isAr ? 'هل TalexHub مجانية؟' : 'Is TalexHub free?',
        a: isAr
          ? 'نعم! المنصة مجانية بالكامل للباحثين عن عمل. يمكنك إنشاء حساب، رفع سيرتك الذاتية، والتقدم لوظائف غير محدودة دون أي تكلفة. نوفر أيضاً ميزات مميزة اختيارية لتعزيز ظهورك.'
          : 'Yes! The platform is completely free for job seekers. You can create an account, upload your CV, and apply to unlimited jobs at no cost. We also offer optional premium features for enhanced visibility.',
      },
      {
        q: isAr ? 'كيف تختلف TalexHub عن منصات التوظيف الأخرى؟' : 'How is TalexHub different from other job platforms?',
        a: isAr
          ? 'TalexHub مصممة خصيصاً للسوق العربي. نستخدم ذكاء اصطناعي متقدم للتقديم التلقائي، ونوفر رؤى حول المقابلات، ونقدم تجربة مخصصة بالكامل تناسب احتياجات المهنيين العرب.'
          : 'TalexHub is specifically designed for the Arab market. We use advanced AI for auto-applying, provide interview insights, and offer a fully personalized experience tailored to Arab professionals\' needs.',
      },
    ],
  },
  {
    category: isAr ? 'الحساب والملف الشخصي' : 'Account & Profile',
    icon: '👤',
    questions: [
      {
        q: isAr ? 'كيف أنشئ حساباً على TalexHub؟' : 'How do I create an account on TalexHub?',
        a: isAr
          ? 'يمكنك إنشاء حساب بنقرة واحدة باستخدام حساب Google الخاص بك، أو عبر البريد الإلكتروني. بعد التسجيل، يمكنك إكمال ملفك الشخصي ورفع سيرتك الذاتية.'
          : 'You can create an account with one click using your Google account, or via email. After signing up, you can complete your profile and upload your CV.',
      },
      {
        q: isAr ? 'كيف أحدث سيرتي الذاتية؟' : 'How do I update my CV?',
        a: isAr
          ? 'انتقل إلى لوحة التحكم > السير الذاتية > تحميل سيرة ذاتية جديدة. سيقوم الذكاء الاصطناعي تلقائياً بإعادة تحليل سيرتك الذاتية للحصول على مطابقات أفضل.'
          : 'Go to Dashboard > CVs > Upload New CV. The AI will automatically re-analyze your CV for better matches.',
      },
      {
        q: isAr ? 'هل يمكنني حذف حسابي؟' : 'Can I delete my account?',
        a: isAr
          ? 'نعم، يمكنك حذف حسابك في أي وقت من خلال إعدادات الحساب > حذف الحساب. سيتم حذف جميع بياناتك بشكل دائم.'
          : 'Yes, you can delete your account anytime through Account Settings > Delete Account. All your data will be permanently removed.',
      },
      {
        q: isAr ? 'كيف أغير كلمة المرور؟' : 'How do I change my password?',
        a: isAr
          ? 'اذهب إلى إعدادات الحساب > الأمان > تغيير كلمة المرور. ستحتاج إلى إدخال كلمة المرور الحالية أولاً.'
          : 'Go to Account Settings > Security > Change Password. You\'ll need to enter your current password first.',
      },
    ],
  },
  {
    category: isAr ? 'البحث عن وظائف' : 'Job Search',
    icon: '💼',
    questions: [
      {
        q: isAr ? 'كيف يعمل التقديم التلقائي؟' : 'How does auto-apply work?',
        a: isAr
          ? 'بعد تحليل سيرتك الذاتية وتفضيلاتك، يقوم نظامنا تلقائياً بالتقديم على الوظائف التي تتطابق مع ملفك الشخصي. يمكنك تفعيل أو تعطيل هذه الميزة من الإعدادات.'
          : 'After analyzing your CV and preferences, our system automatically applies to jobs matching your profile. You can enable or disable this feature from Settings.',
      },
      {
        q: isAr ? 'كم عدد الوظائف التي يمكنني التقدم لها؟' : 'How many jobs can I apply to?',
        a: isAr
          ? 'غير محدود! يمكنك التقدم لأي عدد من الوظائف دون قيود.'
          : 'Unlimited! You can apply to as many jobs as you want without restrictions.',
      },
      {
        q: isAr ? 'هل يمكنني البحث عن وظائف في دول محددة؟' : 'Can I search for jobs in specific countries?',
        a: isAr
          ? 'نعم، يمكنك تصفية الوظائف حسب البلد، المدينة، القطاع، ومستوى الخبرة من خلال صفحة البحث عن الوظائف.'
          : 'Yes, you can filter jobs by country, city, industry, and experience level through the job search page.',
      },
      {
        q: isAr ? 'ماذا يحدث بعد التقديم على وظيفة؟' : 'What happens after applying for a job?',
        a: isAr
          ? 'ستتلقى إشعاراً بتقديم طلبك. إذا كان صاحب العمل مهتماً، سيتواصل معك عبر المنصة أو البريد الإلكتروني. يمكنك متابعة حالة طلباتك من لوحة التحكم.'
          : 'You\'ll receive a notification about your application. If the employer is interested, they\'ll contact you via the platform or email. Track your applications in the Dashboard.',
      },
    ],
  },
  {
    category: isAr ? 'لأصحاب العمل' : 'For Employers',
    icon: '🏢',
    questions: [
      {
        q: isAr ? 'كيف أنشر وظيفة على TalexHub؟' : 'How do I post a job on TalexHub?',
        a: isAr
          ? 'سجل كصاحب عمل، ثم انتقل إلى لوحة التحكم > نشر وظيفة. املأ تفاصيل الوظيفة ومتطلباتها، وسيتم نشرها فوراً.'
          : 'Register as an employer, then go to Dashboard > Post Job. Fill in the job details and requirements, and it will be published immediately.',
      },
      {
        q: isAr ? 'ما هي تكلفة نشر الوظائف؟' : 'What is the cost of posting jobs?',
        a: isAr
          ? 'نوفر خططاً مرنة تناسب جميع أحجام الشركات. راجع صفحة الأسعار للحصول على التفاصيل الكاملة.'
          : 'We offer flexible plans for companies of all sizes. Check the Pricing page for full details.',
      },
      {
        q: isAr ? 'كيف يعمل الذكاء الاصطناعي في مطابقة المرشحين؟' : 'How does AI match candidates?',
        a: isAr
          ? 'يقوم نظامنا بتحليل السير الذاتية ومطابقتها مع متطلبات الوظيفة باستخدام خوارزميات متقدمة، مما يوفر عليك الوقت والجهد في فرز المرشحين.'
          : 'Our system analyzes CVs and matches them with job requirements using advanced algorithms, saving you time and effort in screening candidates.',
      },
    ],
  },
  {
    category: isAr ? 'الأمان والخصوصية' : 'Security & Privacy',
    icon: '🔒',
    questions: [
      {
        q: isAr ? 'هل بياناتي آمنة على TalexHub؟' : 'Is my data safe on TalexHub?',
        a: isAr
          ? 'نعم، نستخدم تشفير SSL وجدران حماية متقدمة لحماية بياناتك. لا نشارك معلوماتك الشخصية أبداً دون موافقتك الصريحة.'
          : 'Yes, we use SSL encryption and advanced firewalls to protect your data. We never share your personal information without your explicit consent.',
      },
      {
        q: isAr ? 'من يمكنه رؤية سيرتي الذاتية؟' : 'Who can see my CV?',
        a: isAr
          ? 'يمكنك التحكم في رؤية سيرتك الذاتية من خلال إعدادات الخصوصية. يمكنك جعلها مرئية لجميع أصحاب العمل، أو لأصحاب عمل محددين، أو خاصة تماماً.'
          : 'You control CV visibility through Privacy Settings. Make it visible to all employers, specific employers, or completely private.',
      },
      {
        q: isAr ? 'كيف تستخدمون الذكاء الاصطناعي مع بياناتي؟' : 'How do you use AI with my data?',
        a: isAr
          ? 'نستخدم الذكاء الاصطناعي لتحليل سيرتك الذاتية ومطابقتها مع الوظائف المناسبة فقط. لا نشارك بياناتك مع أطراف ثالثة لأغراض تدريب نماذج الذكاء الاصطناعي.'
          : 'We use AI solely to analyze your CV and match it with suitable jobs. We do not share your data with third parties for AI model training purposes.',
      },
    ],
  },
  {
    category: isAr ? 'الدعم والمساعدة' : 'Support',
    icon: '💬',
    questions: [
      {
        q: isAr ? 'كيف أتصل بفريق الدعم؟' : 'How do I contact support?',
        a: isAr
          ? 'يمكنك التواصل معنا عبر البريد الإلكتروني support@TalexHub.com، أو من خلال صفحة الدعم، أو عبر الدردشة المباشرة خلال ساعات العمل.'
          : 'Contact us via email at support@TalexHub.com, through the Support page, or via live chat during business hours.',
      },
      {
        q: isAr ? 'ما هي ساعات عمل الدعم؟' : 'What are support hours?',
        a: isAr
          ? 'فريق الدعم متاح من الأحد إلى الخميس، من 9 صباحاً حتى 6 مساءً بتوقيت السعودية. نرد على استفسارات البريد الإلكتروني خلال 24 ساعة.'
          : 'Support is available Sunday to Thursday, 9 AM to 6 PM KSA time. We respond to email inquiries within 24 hours.',
      },
      {
        q: isAr ? 'هل توفرون دعماً باللغة العربية؟' : 'Do you provide Arabic support?',
        a: isAr
          ? 'نعم، فريق الدعم لدينا يتحدث العربية والإنجليزية بطلاقة.'
          : 'Yes, our support team is fluent in both Arabic and English.',
      },
    ],
  },
];

const FAQ_CATEGORIES = [
  { id: 'all', ar: 'الكل', en: 'All' },
  { id: 'عام', ar: 'عام', en: 'General' },
  { id: 'الحساب والملف الشخصي', ar: 'الحساب', en: 'Account' },
  { id: 'البحث عن وظائف', ar: 'البحث عن وظائف', en: 'Job Search' },
  { id: 'لأصحاب العمل', ar: 'لأصحاب العمل', en: 'For Employers' },
  { id: 'الأمان والخصوصية', ar: 'الأمان والخصوصية', en: 'Security' },
  { id: 'الدعم والمساعدة', ar: 'الدعم', en: 'Support' },
];

/* ════════════════════════════════════════════════════════════
   FAQ ACCORDION ITEM
════════════════════════════════════════════════════════════ */
function FAQItem({ question, answer, isOpen, onToggle, isDark }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className={`rounded-xl border transition-all duration-300 ${
        isDark
          ? 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left"
      >
        <span className={`text-sm sm:text-base font-semibold flex-1 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {question}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`flex-shrink-0 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke={isDark ? '#9CA3AF' : '#6B7280'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      <div
        className="transition-all duration-300 ease-out overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          ref={contentRef}
          className={`px-4 sm:px-5 pb-4 sm:pb-5 text-sm leading-relaxed ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SEARCH BAR
════════════════════════════════════════════════════════════ */
function SearchBar({ isAr, isDark, onSearch }) {
  return (
    <div className="relative max-w-xl mx-auto">
      <input
        type="text"
        placeholder={isAr ? 'ابحث عن سؤال...' : 'Search for a question...'}
        onChange={(e) => onSearch(e.target.value)}
        className={`w-full px-5 py-3.5 pl-12 rounded-xl border text-sm sm:text-base outline-none transition-all duration-200 ${
          isDark
            ? 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
            : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
        }`}
        style={{ fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN FAQ PAGE
════════════════════════════════════════════════════════════ */
export default function FAQPage() {
  const { lang, dir } = useLangStore();
  const { theme } = useThemeStore();
  const isAr = lang === 'ar';
  const isDark = theme === 'dark';
  
  const faqData = getFAQData(isAr);
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.title = isAr
      ? 'الأسئلة الشائعة — TalexHub'
      : 'FAQ — TalexHub';
  }, [isAr]);

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase());
    if (query) {
      // Expand all matching items
      const newOpen = new Set();
      faqData.forEach(cat => {
        cat.questions.forEach((q, i) => {
          if (
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query)
          ) {
            newOpen.add(`${cat.category}-${i}`);
          }
        });
      });
      setOpenItems(newOpen);
    }
  };

  // Filter FAQs by category and search
  const filteredFAQs = faqData.filter(cat => {
    if (activeCategory !== 'all' && cat.category !== activeCategory) return false;
    if (searchQuery) {
      return cat.questions.some(
        q => q.q.toLowerCase().includes(searchQuery) || q.a.toLowerCase().includes(searchQuery)
      );
    }
    return true;
  });

  return (
    <div
      dir={dir}
      className="min-h-screen"
      style={{
        background: isDark ? '#0F172A' : '#F8FAFC',
        color: isDark ? '#F1F5F9' : '#1E293B',
        fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)',
      }}
    >
      <Header />

      {/* Hero Section */}
      <section
        className="relative pt-28 sm:pt-32 lg:pt-36 pb-16 sm:pb-20 text-center overflow-hidden"
        style={{
          background: isDark ? '#0F172A' : '#F8FAFC',
          borderBottom: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
        }}
      >
        <div className="relative z-10 max-w-3xl mx-auto px-6">
          <AnimBlock>
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-6 ${
                isDark
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-blue-400' : 'bg-blue-500'}`} />
              <span className={`text-xs font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                TalexHub
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 -tracking-[0.02em]"
              style={{ fontFamily: isAr ? 'var(--font-ar)' : 'var(--font-en)' }}>
              {isAr ? 'كيف يمكننا مساعدتك؟' : 'How Can We Help You?'}
            </h1>
            
            <p className={`text-base sm:text-lg mb-8 max-w-xl mx-auto ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {isAr
                ? 'اعثر على إجابات لأكثر الأسئلة شيوعاً حول TalexHub'
                : 'Find answers to the most common questions about TalexHub'}
            </p>

            {/* Search */}
            <SearchBar isAr={isAr} isDark={isDark} onSearch={handleSearch} />
          </AnimBlock>
        </div>
      </section>

      {/* FAQ Content */}
      <section
        className="py-16 sm:py-20 lg:py-24"
        style={{ background: isDark ? '#0F172A' : '#F8FAFC' }}
      >
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Category Tabs */}
          <AnimBlock delay={100}>
            <div className="flex flex-wrap gap-2 justify-center mb-12" role="tablist">
              {FAQ_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? isDark
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-900 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200 border border-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200'
                  }`}
                >
                  {isAr ? cat.ar : cat.en}
                </button>
              ))}
            </div>
          </AnimBlock>

          {/* FAQ Categories */}
          <div className="space-y-12">
            {filteredFAQs.map((category, catIndex) => (
              <AnimBlock key={category.category} delay={catIndex * 80}>
                <div>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">{category.icon}</span>
                    <h2 className={`text-xl sm:text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.category}
                    </h2>
                    <div className={`flex-1 h-px ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                  </div>

                  {/* Questions */}
                  <div className="space-y-3">
                    {category.questions.map((item, qIndex) => {
                      const isOpen = openItems.has(`${category.category}-${qIndex}`);
                      const isMatch = searchQuery && (
                        item.q.toLowerCase().includes(searchQuery) ||
                        item.a.toLowerCase().includes(searchQuery)
                      );

                      return (
                        <div
                          key={qIndex}
                          className={isMatch ? 'ring-2 ring-blue-500/30 rounded-xl' : ''}
                        >
                          <FAQItem
                            question={item.q}
                            answer={item.a}
                            isOpen={isOpen}
                            onToggle={() => toggleItem(category.category, qIndex)}
                            isDark={isDark}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </AnimBlock>
            ))}

            {/* No Results */}
            {filteredFAQs.length === 0 && (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">🔍</span>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {isAr ? 'لا توجد نتائج' : 'No Results Found'}
                </h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                  {isAr
                    ? 'لم نجد أسئلة تطابق بحثك. جرب كلمات أخرى.'
                    : 'We couldn\'t find questions matching your search. Try different keywords.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section
        className="py-16 sm:py-20 text-center"
        style={{
          background: isDark ? '#0F172A' : '#F8FAFC',
          borderTop: `1px solid ${isDark ? '#1E293B' : '#E2E8F0'}`,
        }}
      >
        <AnimBlock>
          <div className="max-w-lg mx-auto px-6">
            <span className="text-4xl mb-4 block">💬</span>
            <h2 className={`text-2xl sm:text-3xl font-bold mb-3 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isAr ? 'لم تجد إجابتك؟' : "Didn't Find Your Answer?"}
            </h2>
            <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {isAr
                ? 'فريق الدعم لدينا جاهز لمساعدتك في أي استفسار'
                : 'Our support team is ready to help you with any questions'}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                to="/support"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isAr ? 'اتصل بالدعم' : 'Contact Support'}
                <span>→</span>
              </Link>
              <Link
                to="/contact"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 hover:-translate-y-0.5 ${
                  isDark
                    ? 'border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                    : 'border-gray-200 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                {isAr ? 'أرسل رسالة' : 'Send Message'}
              </Link>
            </div>
          </div>
        </AnimBlock>
      </section>

      <Footer />
    </div>
  );
}