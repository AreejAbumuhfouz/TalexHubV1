

export const FEATURES_DATA = [
  {
    slug:       'cv-analysis',
    icon:       'FileText',
    color:      '#3B82F6',
    gradient:   'linear-gradient(135deg, #3B82F620, #3B82F605)',
    badge:      { en: 'Most Popular', ar: 'الأكثر استخداماً' },
    badgeColor: '#22C55E',
    title:      { en: 'CV Analysis',         ar: 'تحليل السيرة الذاتية'       },
    tagline:    { en: 'ATS-powered CV scoring in seconds', ar: 'تقييم سيرتك الذاتية بالذكاء الاصطناعي في ثوانٍ' },
    description: {
      en: 'Our AI analyzes your CV against Applicant Tracking Systems (ATS) used by top employers. Get a detailed score, identify missing keywords, and receive actionable feedback to maximize your interview chances.',
      ar: 'يحلل الذكاء الاصطناعي سيرتك الذاتية مقابل أنظمة تتبع المتقدمين (ATS) المستخدمة لدى أبرز الشركات. احصل على تقييم تفصيلي، اكتشف الكلمات المفتاحية المفقودة، وتلقَّ توصيات قابلة للتطبيق لرفع فرصك في الحصول على مقابلة.',
    },
    benefits: [
      { en: 'ATS compatibility score out of 100', ar: 'نقاط التوافق مع ATS من أصل 100' },
      { en: 'Missing keywords detection', ar: 'اكتشاف الكلمات المفتاحية المفقودة' },
      { en: 'Section-by-section feedback', ar: 'تغذية راجعة لكل قسم على حدة' },
      { en: 'Job-specific analysis', ar: 'تحليل مخصص لكل وظيفة' },
      { en: 'Improvement priority ranking', ar: 'ترتيب أولوية التحسينات' },
    ],
    howItWorks: [
      { en: 'Upload your CV (PDF or DOCX)',       ar: 'ارفع سيرتك الذاتية (PDF أو DOCX)' },
      { en: 'Optionally add a job description',   ar: 'أضف وصف الوظيفة اختياريًا' },
      { en: 'AI scans and scores within seconds', ar: 'يحلل الذكاء الاصطناعي ويقيّم في ثوانٍ' },
      { en: 'Review your detailed report',        ar: 'راجع تقريرك التفصيلي' },
    ],
    path: '/features/cv-analysis',
  },

  // {
  //   slug:       'cover-letter',
  //   icon:       'Mail',
  //   color:      '#8B5CF6',
  //   gradient:   'linear-gradient(135deg, #8B5CF620, #8B5CF605)',
  //   badge:      null,
  //   title:      { en: 'Cover Letter Generator', ar: 'مولّد خطاب التقديم' },
  //   tagline:    { en: 'Personalized letters that get interviews', ar: 'خطابات مخصصة تفتح أبواب المقابلات' },
  //   description: {
  //     en: 'Generate tailored cover letters for any job in seconds. Our AI crafts compelling, professional letters that match the job requirements and highlight your most relevant experience — in Arabic or English.',
  //     ar: 'أنشئ خطابات تقديم مخصصة لأي وظيفة في ثوانٍ. يصوغ الذكاء الاصطناعي خطابات احترافية مقنعة تُبرز خبراتك الأكثر صلة بمتطلبات الوظيفة — بالعربية أو الإنجليزية.',
  //   },
  //   benefits: [
  //     { en: 'Tailored to each specific job posting', ar: 'مخصص لكل إعلان وظيفي' },
  //     { en: 'Arabic & English support',              ar: 'دعم العربية والإنجليزية' },
  //     { en: 'Professional tone & structure',         ar: 'أسلوب ومبنى احترافي' },
  //     { en: 'Highlights your key achievements',      ar: 'يبرز إنجازاتك الرئيسية' },
  //     { en: 'Ready in under 30 seconds',             ar: 'جاهز في أقل من 30 ثانية' },
  //   ],
  //   howItWorks: [
  //     { en: 'Paste the job description',                ar: 'الصق وصف الوظيفة' },
  //     { en: 'AI matches it with your CV',               ar: 'يطابق الذكاء الاصطناعي مع سيرتك' },
  //     { en: 'Get a customized 3-paragraph letter',      ar: 'احصل على خطاب مخصص من 3 فقرات' },
  //     { en: 'Edit, copy, and send',                     ar: 'حرّر، انسخ، وأرسل' },
  //   ],
  //   path: '/features/cover-letter',
  // },

  {
    slug:       'ai-interview',
    icon:       'Mic',
    color:      '#F59E0B',
    gradient:   'linear-gradient(135deg, #F59E0B20, #F59E0B05)',
    badge:      { en: 'Interactive', ar: 'تفاعلي' },
    badgeColor: '#F59E0B',
    title:      { en: 'AI Interview Training', ar: 'تدريب المقابلات بالذكاء الاصطناعي' },
    tagline:    { en: 'Practice makes perfect — train with AI', ar: 'التدريب يصنع الفرق — تدرّب مع الذكاء الاصطناعي' },
    description: {
      en: 'Prepare for your next interview with realistic AI-powered practice sessions. Get role-specific questions, record your answers, and receive detailed scoring and feedback to improve your confidence and performance.',
      ar: 'استعدّ لمقابلتك القادمة مع جلسات تدريبية واقعية تعتمد على الذكاء الاصطناعي. احصل على أسئلة متخصصة لوظيفتك، سجّل إجاباتك، وتلقَّ تقييمًا وتغذية راجعة تفصيلية لتعزيز ثقتك وأدائك.',
    },
    benefits: [
      { en: 'Role-specific question generation',    ar: 'أسئلة مخصصة لكل دور وظيفي'   },
      { en: 'Real-time answer scoring (0-100)',     ar: 'تقييم فوري للإجابات (0-100)' },
      { en: 'Behavioral & technical questions',    ar: 'أسئلة سلوكية وتقنية'           },
      { en: 'Detailed improvement suggestions',    ar: 'اقتراحات تفصيلية للتحسين'     },
      { en: 'Self-intro mandatory first question', ar: 'التعريف الذاتي كسؤال أول'     },
    ],
    howItWorks: [
      { en: 'Enter your target job title',        ar: 'أدخل المسمى الوظيفي المستهدف' },
      { en: 'AI generates tailored questions',    ar: 'يولّد الذكاء الاصطناعي أسئلة مخصصة' },
      { en: 'Answer each question',              ar: 'أجب عن كل سؤال' },
      { en: 'Get instant score & detailed tips', ar: 'احصل على تقييم فوري ونصائح تفصيلية' },
    ],
    path: '/features/ai-interview',
  },

  {
    slug:       'career-path',
    icon:       'Map',
    color:      '#22C55E',
    gradient:   'linear-gradient(135deg, #22C55E20, #22C55E05)',
    badge:      { en: 'AI Powered', ar: 'مدعوم بالذكاء الاصطناعي' },
    badgeColor: '#22C55E',
    title:      { en: 'Career Path Planner', ar: 'مخطط المسار المهني' },
    tagline:    { en: 'Your roadmap from today to your dream role', ar: 'خارطة طريقك من اليوم لوظيفة أحلامك' },
    description: {
      en: 'Get a complete, personalized career roadmap tailored to your current skills and your dream role. The AI maps out every stage, recommends specific courses, certifications, and milestones to track your progress.',
      ar: 'احصل على خارطة مسار مهني كاملة ومخصصة تناسب مهاراتك الحالية ووظيفة أحلامك. يرسم الذكاء الاصطناعي كل مرحلة، ويوصي بدورات وشهادات ومعالم محددة لتتبّع تقدمك.',
    },
    benefits: [
      { en: 'Multi-stage career roadmap',          ar: 'خارطة مهنية متعددة المراحل'       },
      { en: 'Skill gap identification',            ar: 'تحديد فجوات المهارات'             },
      { en: 'Course & certification recommendations', ar: 'توصيات بالدورات والشهادات'    },
      { en: 'Realistic timeline estimates',        ar: 'تقديرات زمنية واقعية'             },
      { en: 'Salary range projections',            ar: 'توقعات النطاق الراتبي'            },
    ],
    howItWorks: [
      { en: 'Upload or link your current CV',      ar: 'ارفع سيرتك الذاتية الحالية'      },
      { en: 'Enter your target role',              ar: 'حدد وظيفتك المستهدفة'             },
      { en: 'AI builds your full roadmap',         ar: 'يبني الذكاء الاصطناعي مسارك الكامل' },
      { en: 'Follow each stage and milestone',     ar: 'اتبع كل مرحلة ومعلم على حدة'     },
    ],
    path: '/features/career-path',
  },

  // {
  //   slug:       'auto-apply',
  //   icon:       'Zap',
  //   color:      '#EF4444',
  //   gradient:   'linear-gradient(135deg, #EF444420, #EF444405)',
  //   badge:      { en: 'Pro Feature', ar: 'ميزة Pro' },
  //   badgeColor: '#8B5CF6',
  //   title:      { en: 'Auto-Apply',         ar: 'التقديم التلقائي'       },
  //   tagline:    { en: 'Apply to dozens of jobs while you sleep', ar: 'تقدّم لعشرات الوظائف وأنت نائم' },
  //   description: {
  //     en: 'Let TalexHub apply to matching jobs on your behalf automatically. Our system finds suitable positions, generates custom cover letters, and submits applications — up to your daily limit — without you lifting a finger.',
  //     ar: 'دع TalexHub يتقدم للوظائف المناسبة بالنيابة عنك تلقائيًا. يجد نظامنا المناصب المناسبة، يُنشئ خطابات تقديم مخصصة، ويرسل الطلبات — حتى حدّك اليومي — دون أن تحرك ساكنًا.',
  //   },
  //   benefits: [
  //     { en: 'Automated job matching & applying',   ar: 'مطابقة وتقديم آلي للوظائف'   },
  //     { en: 'Custom cover letter per application', ar: 'خطاب تقديم مخصص لكل وظيفة'  },
  //     { en: 'Daily limit control by admin',        ar: 'تحكم في الحد اليومي من الأدمن' },
  //     { en: 'Consent-first, always in your hands', ar: 'موافقتك أولاً، بيدك دائمًا'  },
  //     { en: 'Runs 3× per day automatically',       ar: 'يعمل 3 مرات يوميًا تلقائيًا' },
  //   ],
  //   howItWorks: [
  //     { en: 'Enable auto-apply in your dashboard', ar: 'فعّل التقديم التلقائي في لوحتك' },
  //     { en: 'Set your job preferences',            ar: 'حدد تفضيلات وظيفتك'             },
  //     { en: 'System runs automatically 3×/day',   ar: 'يعمل النظام تلقائيًا 3 مرات/يوم' },
  //     { en: 'Track all applications in one place', ar: 'تابع جميع طلباتك في مكان واحد' },
  //   ],
  //   path: '/features/auto-apply',
  // },

  {
    slug:       'cv-builder',
    icon:       'Layout',
    color:      '#06B6D4',
    gradient:   'linear-gradient(135deg, #06B6D420, #06B6D405)',
    badge:      null,
    title:      { en: 'ATS CV Builder',     ar: 'منشئ السيرة الذاتية' },
    tagline:    { en: 'Professional CVs that pass every ATS filter', ar: 'سيرة ذاتية احترافية تجتاز كل فلاتر ATS' },
    description: {
      en: 'Build a polished, ATS-compliant CV with our structured templates. Choose from 4 professional designs — Classic, Minimal, Executive, and Compact — all optimized for recruiter screening systems and PDF export.',
      ar: 'أنشئ سيرة ذاتية احترافية ومتوافقة مع ATS باستخدام قوالبنا المنظمة. اختر من بين 4 تصاميم احترافية — الكلاسيكي، البسيط، التنفيذي، والمضغوط — كلها مُحسَّنة لأنظمة فرز المُجنِّدين وتصدير PDF.',
    },
    benefits: [
      { en: ' ATS-optimized templates',       ar: ' قوالب محسّنة لـ ATS'               },
      { en: 'PDF export with one click',       ar: 'تصدير PDF بنقرة واحدة'               },
      // { en: 'Auto-save to cloud (Cloudflare)', ar: 'حفظ تلقائي في السحابة'              },
      { en: 'Arabic & English content',        ar: 'محتوى عربي وإنجليزي'                 },
      // { en: 'Integrates with auto-apply',      ar: 'يتكامل مع التقديم التلقائي'          },
    ],
    howItWorks: [
      { en: 'Pick a template',                 ar: 'اختر قالبًا'                         },
      { en: 'Fill in your details',           ar: 'أضف بياناتك'                         },
      { en: 'AI enhances your content',        ar: 'يُحسّن الذكاء الاصطناعي محتواك'     },
      { en: 'Export as PDF ',  ar: 'صدّر PDF    '        },
    ],
    path: '/features/cv-builder',
  },
];

export const FEATURE_ICONS = {
  FileText:      '📄',
  Mail:          '✉️',
  Mic:           '🎤',
  Map:           '🗺️',
  Zap:           '⚡',
  Layout:        '📐',
};