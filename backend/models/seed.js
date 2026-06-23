'use strict';


require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const {
  sequelize,
  User, OtpToken, RefreshToken,
  Company, CompanyMember, SubscriptionPlan, CompanySubscription,
  JobCategory, Job, JobApplication,
  CV,
  TrainingSession,
  CourseCategory, Course, CourseLesson, UserCourse, LessonProgress, LearningPath,
  CommunityPost, PostComment, PostLike, PostReport,
  ChatCategory, ChatRoom, ChatMessage, ChatTimeUsage, DirectMessage,
  Wallet, WalletTransaction, Referral,
  Notification, AuditLog, UserConnection,
} = require('./index');

// ── helpers ──────────────────────────────────────────────────
const daysFromNow = (n) => new Date(Date.now() + n * 86_400_000);
const weeksAgo    = (n) => new Date(Date.now() - n * 7 * 86_400_000);

async function seed() {
  await sequelize.authenticate();
  // Sync all models (alter:true is safe for dev; swap with force:true to reset)
  await sequelize.sync({ alter: true });

  console.log('🌱 Seeding database…');

  // ── 1. Users ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const [admin, support, moderator, companyOwner, user1, user2] = await Promise.all([
    User.upsert({
      id: uuidv4(), email: 'admin@example.com', emailVerified: true,
      passwordHash, role: 'admin', status: 'active',
      fullName: 'Alice Admin', phone: '+9665000001', phoneVerified: true,
      avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=200',
      headline: 'Platform Administrator', bio: 'Keeping things running.',
      locationCountry: 'SA', locationCity: 'Riyadh',
      preferredLanguage: 'ar', referralCode: 'ADMIN001',
      openToWork: false, discoverable: false,
    }, { returning: true }),

    User.upsert({
      id: uuidv4(), email: 'support@example.com', emailVerified: true,
      passwordHash, role: 'support', status: 'active',
      fullName: 'Sara Support', phone: '+9665000002', phoneVerified: true,
      avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=200',
      headline: 'Customer Support', locationCountry: 'SA', locationCity: 'Jeddah',
      preferredLanguage: 'ar', referralCode: 'SUPP001',
      openToWork: false, discoverable: false,
    }, { returning: true }),

    User.upsert({
      id: uuidv4(), email: 'moderator@example.com', emailVerified: true,
      passwordHash, role: 'moderator', status: 'active',
      fullName: 'Mohammed Moderator',
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=200',
      headline: 'Community Moderator', locationCountry: 'SA', locationCity: 'Dammam',
      preferredLanguage: 'ar', referralCode: 'MOD001',
      openToWork: false, discoverable: true,
    }, { returning: true }),

    User.upsert({
      id: uuidv4(), email: 'company.owner@example.com', emailVerified: true,
      passwordHash, role: 'company', status: 'active',
      fullName: 'Khalid Al-Harbi', phone: '+9665000003', phoneVerified: true,
      avatarUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?w=200',
      headline: 'CEO at TechCorp Arabia', bio: 'Building the future of tech in Saudi Arabia.',
      locationCountry: 'SA', locationCity: 'Riyadh',
      preferredLanguage: 'ar', referralCode: 'COMP001',
      openToWork: false, discoverable: true,
    }, { returning: true }),

    User.upsert({
      id: uuidv4(), email: 'user1@example.com', emailVerified: true,
      passwordHash, role: 'user', status: 'active',
      fullName: 'Fatima Al-Zahrani', phone: '+9665000004', phoneVerified: true,
      avatarUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=200',
      headline: 'Senior Frontend Developer', bio: 'Passionate about React & UX.',
      locationCountry: 'SA', locationCity: 'Riyadh',
      dateOfBirth: '1995-03-15', gender: 'female', nationality: 'SA',
      linkedinUrl: 'https://linkedin.com/in/fatima-zahrani',
      preferredLanguage: 'ar', referralCode: 'USR1001',
      desiredJobTitle: 'Lead Frontend Engineer',
      desiredIndustries: ['Technology', 'Fintech'],
      desiredLocations: ['Riyadh', 'Remote'],
      desiredSalaryMin: 15000, desiredSalaryMax: 25000,
      desiredJobTypes: ['full_time', 'remote'],
      openToWork: true, discoverable: true,
    }, { returning: true }),

    User.upsert({
      id: uuidv4(), email: 'user2@example.com', emailVerified: true,
      passwordHash, role: 'user', status: 'active',
      fullName: 'Omar Al-Ghamdi', phone: '+9665000005', phoneVerified: false,
      avatarUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?w=200',
      headline: 'Backend Developer', bio: 'Node.js & PostgreSQL enthusiast.',
      locationCountry: 'SA', locationCity: 'Jeddah',
      dateOfBirth: '1998-07-22', gender: 'male', nationality: 'SA',
      preferredLanguage: 'ar', referralCode: 'USR2001',
      desiredJobTitle: 'Backend Engineer',
      desiredIndustries: ['Technology'],
      desiredLocations: ['Jeddah', 'Riyadh'],
      desiredSalaryMin: 10000, desiredSalaryMax: 18000,
      desiredJobTypes: ['full_time'],
      openToWork: true, discoverable: true,
    }, { returning: true }),
  ]);

  // upsert returns [instance, created] — flatten
  const [adminUser]     = admin;
  const [supportUser]   = support;
  const [modUser]       = moderator;
  const [ownerUser]     = companyOwner;
  const [u1]            = user1;
  const [u2]            = user2;

  console.log('  ✓ Users');

  // ── 2. OtpTokens ─────────────────────────────────────────
  await OtpToken.bulkCreate([
    {
      id: uuidv4(), userId: u1.id, token: '123456',
      purpose: 'email_verify', expiresAt: daysFromNow(1), used: false,
    },
    {
      id: uuidv4(), userId: u2.id, token: '654321',
      purpose: 'password_reset', expiresAt: daysFromNow(1), used: false,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ OtpTokens');

  // ── 3. RefreshTokens ──────────────────────────────────────
  await RefreshToken.bulkCreate([
    {
      id: uuidv4(), userId: u1.id,
      tokenHash: 'hash_u1_' + Date.now(),
      deviceInfo: 'Chrome / Windows 11',
      ipAddress: '192.168.1.10',
      expiresAt: daysFromNow(30), revoked: false,
    },
    {
      id: uuidv4(), userId: u2.id,
      tokenHash: 'hash_u2_' + Date.now(),
      deviceInfo: 'Safari / macOS',
      ipAddress: '192.168.1.11',
      expiresAt: daysFromNow(30), revoked: false,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ RefreshTokens');

  // ── 4. Company ────────────────────────────────────────────
  const [company] = await Company.upsert({
    id: uuidv4(), ownerId: ownerUser.id, status: 'active',
    name: 'TechCorp Arabia', slug: 'techcorp-arabia',
    logoUrl: 'https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?w=200',
    coverUrl: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?w=800',
    website: 'https://techcorp.com.sa',
    emailDomain: 'techcorp.com.sa',
    applicationEmailFormat: 'jobs',
    industry: 'Technology', companySize: '51-200',
    foundedYear: 2018,
    description: 'Leading software development company in Saudi Arabia specialising in fintech and e-commerce solutions.',
    locationCountry: 'SA', locationCity: 'Riyadh',
    address: '8th Floor, Kingdom Centre, Olaya St, Riyadh',
    reviewedBy: adminUser.id, reviewedAt: new Date(),
    totalJobsPosted: 12, totalHires: 7,
  }, { returning: true });
  console.log('  ✓ Company');

  // ── 5. CompanyMember ──────────────────────────────────────
  await CompanyMember.bulkCreate([
    {
      id: uuidv4(), companyId: company.id, userId: ownerUser.id,
      role: 'owner', invitedAt: new Date(), acceptedAt: new Date(),
    },
    {
      id: uuidv4(), companyId: company.id, userId: supportUser.id,
      role: 'hr', invitedAt: new Date(), acceptedAt: new Date(),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ CompanyMembers');

  // ── 6. SubscriptionPlans ──────────────────────────────────
  const [freePlan, proPlan, enterprisePlan] = await Promise.all([
    SubscriptionPlan.upsert({
      id: uuidv4(), name: 'Free', nameAr: 'مجاني',
      description: 'Get started with basic job posting.',
      price: 0, currency: 'SAR', billingPeriod: 'monthly',
      maxJobs: 2, maxTeamMembers: 1,
      features: ['2 active jobs', '1 team member', 'Basic analytics'],
      isActive: true, sortOrder: 1,
    }, { returning: true }),

    SubscriptionPlan.upsert({
      id: uuidv4(), name: 'Pro', nameAr: 'احترافي',
      description: 'For growing teams.',
      price: 299, currency: 'SAR', billingPeriod: 'monthly',
      maxJobs: 20, maxTeamMembers: 5,
      features: ['20 active jobs', '5 team members', 'Advanced analytics', 'Priority support', 'CV screening AI'],
      isActive: true, sortOrder: 2,
    }, { returning: true }),

    SubscriptionPlan.upsert({
      id: uuidv4(), name: 'Enterprise', nameAr: 'مؤسسي',
      description: 'Unlimited scale for large organisations.',
      price: 999, currency: 'SAR', billingPeriod: 'monthly',
      maxJobs: -1, maxTeamMembers: -1,
      features: ['Unlimited jobs', 'Unlimited team', 'Dedicated account manager', 'Custom integrations', 'SLA'],
      isActive: true, sortOrder: 3,
    }, { returning: true }),
  ]);
  const [free] = freePlan;
  const [pro]  = proPlan;
  console.log('  ✓ SubscriptionPlans');

  // ── 7. CompanySubscription ────────────────────────────────
  await CompanySubscription.upsert({
    id: uuidv4(), companyId: company.id, planId: pro.id,
    status: 'active', startedAt: new Date(),
    expiresAt: daysFromNow(30), autoRenew: true,
    paymentRef: 'PAY-20240101-001',
  }, { returning: true });
  console.log('  ✓ CompanySubscription');

  // ── 8. CVs ────────────────────────────────────────────────
  const [cv1] = await CV.upsert({
    id: uuidv4(), userId: u1.id,
    title: 'Frontend Developer CV', status: 'analysed',
    isPrimary: true, fileUrl: 'https://storage.example.com/cvs/fatima-cv.pdf',
    fileName: 'fatima-cv.pdf', fileSize: 204800, fileType: 'application/pdf',
    storageKey: uuidv4(),
    parsedContent: {
      name: 'Fatima Al-Zahrani',
      skills: ['React', 'TypeScript', 'Node.js', 'TailwindCSS'],
      experience: [{ company: 'StartupX', title: 'Frontend Developer', years: 3 }],
    },
    atsScore: 82, qualityScore: 88,
    aiFeedback: { strengths: ['Clear layout', 'Quantified achievements'], improvements: ['Add more keywords'] },
    keywords: ['React', 'TypeScript', 'Frontend', 'JavaScript'],
    language: 'en',
  }, { returning: true });

  const [cv2] = await CV.upsert({
    id: uuidv4(), userId: u2.id,
    title: 'Backend Dev CV', status: 'uploaded',
    isPrimary: true, fileUrl: 'https://storage.example.com/cvs/omar-cv.pdf',
    fileName: 'omar-cv.pdf', fileSize: 153600, fileType: 'application/pdf',
    storageKey: uuidv4(),
    keywords: ['Node.js', 'PostgreSQL', 'REST API'],
    language: 'ar',
  }, { returning: true });
  console.log('  ✓ CVs');

  // ── 9. JobCategories ──────────────────────────────────────
  const [techCat] = await JobCategory.upsert({
    id: uuidv4(), name: 'Technology', nameAr: 'التقنية',
    slug: 'technology', icon: 'laptop', sortOrder: 1,
  }, { returning: true });

  const [devCat] = await JobCategory.upsert({
    id: uuidv4(), name: 'Software Development', nameAr: 'تطوير البرمجيات',
    slug: 'software-development', parentId: techCat.id,
    icon: 'code', sortOrder: 1,
  }, { returning: true });

  const [desCat] = await JobCategory.upsert({
    id: uuidv4(), name: 'Design', nameAr: 'التصميم',
    slug: 'design', icon: 'palette', sortOrder: 2,
  }, { returning: true });

  const [mktCat] = await JobCategory.upsert({
    id: uuidv4(), name: 'Marketing', nameAr: 'التسويق',
    slug: 'marketing', icon: 'megaphone', sortOrder: 3,
  }, { returning: true });
  console.log('  ✓ JobCategories');

  // ── 10. Jobs ──────────────────────────────────────────────
  const [job1] = await Job.upsert({
    id: uuidv4(), companyId: company.id, postedBy: ownerUser.id,
    categoryId: devCat.id, status: 'active',
    title: 'Senior Frontend Engineer',
    titleAr: 'مهندس واجهة أمامية أول',
    description: 'We are looking for a Senior Frontend Engineer to join our growing team. You will work on building high-quality web applications using React and TypeScript.',
    descriptionAr: 'نبحث عن مهندس واجهة أمامية متمرس للانضمام إلى فريقنا المتنامي.',
    requirements: '5+ years React experience, TypeScript, strong CSS skills, REST/GraphQL experience.',
    benefits: 'Competitive salary, health insurance, flexible hours, remote-friendly.',
    skillsRequired: ['React', 'TypeScript', 'CSS', 'GraphQL'],
    jobType: 'full_time',
    locationCountry: 'SA', locationCity: 'Riyadh',
    isRemote: true,
    salaryMin: 18000, salaryMax: 28000, salaryCurrency: 'SAR',
    salaryVisible: true, easyApply: true,
    applicationEmail: 'jobs@techcorp.com.sa',
    deadline: daysFromNow(30),
    keywords: ['React', 'Frontend', 'TypeScript', 'Senior'],
    viewsCount: 245, applicationsCount: 18,
    approvedBy: adminUser.id, approvedAt: new Date(),
    slug: 'senior-frontend-engineer-techcorp-arabia',
  }, { returning: true });

  const [job2] = await Job.upsert({
    id: uuidv4(), companyId: company.id, postedBy: ownerUser.id,
    categoryId: devCat.id, status: 'active',
    title: 'Backend Node.js Developer',
    titleAr: 'مطور Node.js للواجهة الخلفية',
    description: 'Join our backend team to build scalable APIs and microservices using Node.js, PostgreSQL, and Redis.',
    requirements: '3+ years Node.js, PostgreSQL, Redis, Docker.',
    benefits: 'Competitive salary, annual bonus, remote option.',
    skillsRequired: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    jobType: 'full_time',
    locationCountry: 'SA', locationCity: 'Riyadh',
    isRemote: false,
    salaryMin: 12000, salaryMax: 20000, salaryCurrency: 'SAR',
    salaryVisible: true, easyApply: true,
    applicationEmail: 'jobs@techcorp.com.sa',
    deadline: daysFromNow(45),
    keywords: ['Node.js', 'Backend', 'PostgreSQL'],
    viewsCount: 189, applicationsCount: 12,
    approvedBy: adminUser.id, approvedAt: new Date(),
    slug: 'backend-nodejs-developer-techcorp-arabia',
  }, { returning: true });

  const [job3] = await Job.upsert({
    id: uuidv4(), companyId: company.id, postedBy: ownerUser.id,
    categoryId: desCat.id, status: 'draft',
    title: 'UI/UX Designer',
    titleAr: 'مصمم واجهة المستخدم',
    description: 'We need a talented UI/UX designer to craft beautiful and intuitive interfaces.',
    requirements: '3+ years Figma, design systems, user research.',
    skillsRequired: ['Figma', 'Design Systems', 'User Research'],
    jobType: 'full_time',
    locationCountry: 'SA', locationCity: 'Riyadh',
    isRemote: true,
    salaryMin: 10000, salaryMax: 16000, salaryCurrency: 'SAR',
    salaryVisible: false, easyApply: true,
    deadline: daysFromNow(60),
    keywords: ['UI/UX', 'Figma', 'Design'],
    viewsCount: 0, applicationsCount: 0,
    slug: 'uiux-designer-techcorp-arabia',
  }, { returning: true });
  console.log('  ✓ Jobs');

  // ── 11. JobApplications ───────────────────────────────────
  const [app1] = await JobApplication.upsert({
    id: uuidv4(), jobId: job1.id, userId: u1.id, cvId: cv1.id,
    status: 'shortlisted',
    matchScore: 91.5,
    aiSummary: 'Strong candidate. 5 years React experience, TypeScript expert, portfolio shows excellent work.',
    isAutoApplied: false, applyMethod: 'easy_apply',
    coverLetter: 'I am very excited about this opportunity at TechCorp Arabia. My 5 years of React experience aligns perfectly with your requirements.',
  }, { returning: true });

  const [app2] = await JobApplication.upsert({
    id: uuidv4(), jobId: job2.id, userId: u2.id, cvId: cv2.id,
    status: 'viewed',
    matchScore: 74.0,
    aiSummary: 'Good candidate. 3 years Node.js, PostgreSQL skills match. Docker experience limited.',
    isAutoApplied: false, applyMethod: 'easy_apply',
    coverLetter: 'I have been working with Node.js and PostgreSQL for 3 years and would love to join TechCorp.',
  }, { returning: true });

  const [app3] = await JobApplication.upsert({
    id: uuidv4(), jobId: job1.id, userId: u2.id, cvId: cv2.id,
    status: 'sent',
    matchScore: 55.0,
    isAutoApplied: false, applyMethod: 'easy_apply',
  }, { returning: true });
  console.log('  ✓ JobApplications');

  // ── 12. TrainingSessions ──────────────────────────────────
  await TrainingSession.bulkCreate([
    {
      id: uuidv4(), userId: u1.id, jobId: job1.id,
      title: 'Frontend Interview Practice — TechCorp Arabia',
      questions: [
        { q: 'Explain React reconciliation.', score: 9 },
        { q: 'What is useCallback vs useMemo?', score: 8 },
        { q: 'How do you optimise a slow React app?', score: 7 },
      ],
      answers: {
        1: 'React reconciliation is the process by which React updates the DOM...',
        2: 'useCallback memoises a function reference, useMemo memoises a value...',
        3: 'I would start with React DevTools Profiler to identify bottlenecks...',
      },
      overallScore: 8.0,
      aiFeedback: 'Excellent answers overall. Consider giving more concrete examples for Q3.',
      durationSecs: 1800,
      status: 'completed', completedAt: new Date(),
    },
    {
      id: uuidv4(), userId: u2.id, jobId: job2.id,
      title: 'Backend Interview Practice — Node.js Role',
      questions: [
        { q: 'Explain the Node.js event loop.', score: 7 },
        { q: 'How does PostgreSQL MVCC work?', score: 6 },
      ],
      answers: {
        1: 'The event loop processes callbacks in phases...',
        2: 'MVCC uses transaction IDs and visibility rules...',
      },
      overallScore: 6.5,
      aiFeedback: 'Good understanding of Node.js. Deepen knowledge of database internals.',
      durationSecs: 1200,
      status: 'completed', completedAt: new Date(),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ TrainingSessions');

  // ── 13. CourseCategories ──────────────────────────────────
  const [techCourseCat] = await CourseCategory.upsert({
    id: uuidv4(), name: 'Technology', nameAr: 'التقنية',
    slug: 'tech-courses', icon: 'laptop',
  }, { returning: true });

  const [softSkillsCat] = await CourseCategory.upsert({
    id: uuidv4(), name: 'Soft Skills', nameAr: 'المهارات الناعمة',
    slug: 'soft-skills', icon: 'people',
  }, { returning: true });
  console.log('  ✓ CourseCategories');

  // ── 14. Courses ───────────────────────────────────────────
  const [course1] = await Course.upsert({
    id: uuidv4(), createdBy: adminUser.id, categoryId: techCourseCat.id,
    status: 'published',
    title: 'React & TypeScript Mastery',
    titleAr: 'إتقان React و TypeScript',
    description: 'A comprehensive course covering advanced React patterns, TypeScript best practices, and modern tooling.',
    descriptionAr: 'دورة شاملة تغطي أنماط React المتقدمة وأفضل ممارسات TypeScript.',
    thumbnailUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?w=400',
    language: 'ar', level: 'intermediate',
    tags: ['React', 'TypeScript', 'Frontend'],
    skillsCovered: ['React', 'TypeScript', 'State Management', 'Testing'],
    price: 199, currency: 'SAR', isFree: false, discountPct: 10,
    enrolledCount: 342, ratingAvg: 4.7, ratingCount: 89,
    slug: 'react-typescript-mastery',
  }, { returning: true });

  const [course2] = await Course.upsert({
    id: uuidv4(), createdBy: adminUser.id, categoryId: techCourseCat.id,
    status: 'published',
    title: 'Node.js Backend Development',
    titleAr: 'تطوير الواجهة الخلفية بـ Node.js',
    description: 'Build production-grade APIs with Node.js, Express, PostgreSQL, and Redis.',
    thumbnailUrl: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?w=400',
    language: 'ar', level: 'intermediate',
    tags: ['Node.js', 'Backend', 'API'],
    skillsCovered: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    price: 149, currency: 'SAR', isFree: false, discountPct: 0,
    enrolledCount: 218, ratingAvg: 4.5, ratingCount: 56,
    slug: 'nodejs-backend-development',
  }, { returning: true });

  const [course3] = await Course.upsert({
    id: uuidv4(), createdBy: adminUser.id, categoryId: softSkillsCat.id,
    status: 'published',
    title: 'Interview Skills for Tech Professionals',
    titleAr: 'مهارات المقابلة للمحترفين التقنيين',
    description: 'Master technical and behavioural interviews with proven frameworks.',
    thumbnailUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400',
    language: 'ar', level: 'beginner',
    tags: ['Interview', 'Career', 'Soft Skills'],
    skillsCovered: ['Communication', 'Problem Solving', 'STAR Method'],
    price: 0, currency: 'SAR', isFree: true, discountPct: 0,
    enrolledCount: 1205, ratingAvg: 4.9, ratingCount: 310,
    slug: 'interview-skills-tech',
  }, { returning: true });
  console.log('  ✓ Courses');

  // ── 15. CourseLessons ─────────────────────────────────────
  const lessons = await CourseLesson.bulkCreate([
    {
      id: uuidv4(), courseId: course1.id,
      title: 'Introduction to TypeScript Generics',
      contentType: 'video', fileUrl: 'https://storage.example.com/lessons/ts-generics.mp4',
      storageKey: uuidv4(), durationSecs: 1440, sortOrder: 1, isFreePreview: true,
    },
    {
      id: uuidv4(), courseId: course1.id,
      title: 'Advanced React Patterns',
      contentType: 'video', fileUrl: 'https://storage.example.com/lessons/react-patterns.mp4',
      storageKey: uuidv4(), durationSecs: 2100, sortOrder: 2, isFreePreview: false,
    },
    {
      id: uuidv4(), courseId: course1.id,
      title: 'TypeScript + React Cheatsheet',
      contentType: 'pdf', fileUrl: 'https://storage.example.com/lessons/cheatsheet.pdf',
      storageKey: uuidv4(), durationSecs: null, sortOrder: 3, isFreePreview: false,
    },
    {
      id: uuidv4(), courseId: course2.id,
      title: 'Building RESTful APIs with Express',
      contentType: 'video', fileUrl: 'https://storage.example.com/lessons/express-api.mp4',
      storageKey: uuidv4(), durationSecs: 1800, sortOrder: 1, isFreePreview: true,
    },
    {
      id: uuidv4(), courseId: course2.id,
      title: 'PostgreSQL Indexing Deep Dive',
      contentType: 'article', fileUrl: null,
      storageKey: uuidv4(), durationSecs: null, sortOrder: 2, isFreePreview: false,
    },
    {
      id: uuidv4(), courseId: course3.id,
      title: 'The STAR Method Explained',
      contentType: 'video', fileUrl: 'https://storage.example.com/lessons/star-method.mp4',
      storageKey: uuidv4(), durationSecs: 900, sortOrder: 1, isFreePreview: true,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ CourseLessons');

  // ── 16. UserCourses ───────────────────────────────────────
  await UserCourse.bulkCreate([
    {
      id: uuidv4(), userId: u1.id, courseId: course1.id,
      progressPct: 65, completed: false, enrolledAt: weeksAgo(2),
    },
    {
      id: uuidv4(), userId: u1.id, courseId: course3.id,
      progressPct: 100, completed: true,
      completedAt: weeksAgo(1), enrolledAt: weeksAgo(3),
    },
    {
      id: uuidv4(), userId: u2.id, courseId: course2.id,
      progressPct: 30, completed: false, enrolledAt: weeksAgo(1),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ UserCourses');

  // ── 17. LessonProgress ────────────────────────────────────
  await LessonProgress.bulkCreate([
    {
      id: uuidv4(), userId: u1.id, lessonId: lessons[0].id,
      completed: true, watchedSecs: 1440,
    },
    {
      id: uuidv4(), userId: u1.id, lessonId: lessons[1].id,
      completed: false, watchedSecs: 600,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ LessonProgress');

  // ── 18. LearningPaths ─────────────────────────────────────
  await LearningPath.bulkCreate([
    {
      id: uuidv4(), userId: u1.id,
      goal: 'Become a Lead Frontend Engineer in 6 months',
      currentSkills: ['React', 'JavaScript', 'CSS'],
      missingSkills: ['TypeScript', 'System Design', 'Team Leadership'],
      recommendedCourses: [course1.id, course3.id],
      aiNotes: 'Focus on TypeScript first; pair it with system design reading. Interview prep course recommended for the leadership role.',
      generatedAt: new Date(),
    },
    {
      id: uuidv4(), userId: u2.id,
      goal: 'Land a senior backend role',
      currentSkills: ['Node.js', 'PostgreSQL'],
      missingSkills: ['Redis', 'Docker', 'Kubernetes', 'System Design'],
      recommendedCourses: [course2.id],
      aiNotes: 'Complete the backend course, then tackle Docker and system design.',
      generatedAt: new Date(),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ LearningPaths');

  // ── 19. CommunityPosts ────────────────────────────────────
  const [post1] = await CommunityPost.upsert({
    id: uuidv4(), userId: u1.id, category: 'career_tips',
    content: 'Just passed my Google interview after 3 months of prep! Here are the 5 things that helped me the most: 1) LeetCode daily, 2) System design mocks, 3) STAR method for behavioural, 4) Mock interviews with peers, 5) Sleep well before the interview. AMA! 🎉',
    tags: ['interview', 'google', 'success'],
    isPinned: false, isHidden: false,
    likesCount: 142, commentsCount: 23, viewsCount: 892,
  }, { returning: true });

  const [post2] = await CommunityPost.upsert({
    id: uuidv4(), userId: u2.id, category: 'job_search',
    content: 'Does anyone have experience negotiating salary at Saudi tech companies? I have an offer for 15k SAR but the role seems worth more. Any tips?',
    tags: ['salary', 'negotiation', 'Saudi'],
    isPinned: false, isHidden: false,
    likesCount: 67, commentsCount: 14, viewsCount: 445,
  }, { returning: true });

  const [post3] = await CommunityPost.upsert({
    id: uuidv4(), userId: modUser.id, category: 'general',
    content: 'Welcome to the community! This is a space for job seekers and professionals to share insights, ask questions, and support each other. Please read the community guidelines pinned at the top.',
    tags: ['welcome', 'guidelines'],
    isPinned: true, isHidden: false,
    likesCount: 289, commentsCount: 45, viewsCount: 2100,
  }, { returning: true });
  console.log('  ✓ CommunityPosts');

  // ── 20. PostComments ──────────────────────────────────────
  const [comment1] = await PostComment.upsert({
    id: uuidv4(), postId: post1.id, userId: u2.id,
    content: 'Congratulations! Which LeetCode patterns did you focus on most?',
    likesCount: 12, isHidden: false,
  }, { returning: true });

  const [comment2] = await PostComment.upsert({
    id: uuidv4(), postId: post1.id, userId: u1.id,
    parentId: comment1.id,
    content: 'Sliding window, two pointers, and dynamic programming were the most common for me. Arrays/strings first, then graphs.',
    likesCount: 8, isHidden: false,
  }, { returning: true });

  await PostComment.upsert({
    id: uuidv4(), postId: post2.id, userId: u1.id,
    content: 'Always counter-offer! Research the market rate on Glassdoor and LinkedIn Salary first, then ask for 10-15% above your target.',
    likesCount: 22, isHidden: false,
  }, { returning: true });
  console.log('  ✓ PostComments');

  // ── 21. PostLikes ─────────────────────────────────────────
  await PostLike.bulkCreate([
    { id: uuidv4(), userId: u1.id, postId: post2.id },
    { id: uuidv4(), userId: u2.id, postId: post1.id },
    { id: uuidv4(), userId: adminUser.id, postId: post1.id },
    { id: uuidv4(), userId: u1.id, commentId: comment1.id },
  ], { ignoreDuplicates: true });
  console.log('  ✓ PostLikes');

  // ── 22. PostReports ───────────────────────────────────────
  await PostReport.bulkCreate([
    {
      id: uuidv4(), reporterId: u2.id, postId: post1.id,
      reason: 'spam', details: 'Appears to be self-promotion.',
      resolved: true, resolvedBy: modUser.id,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ PostReports');

  // ── 23. ChatCategories ────────────────────────────────────
  const [techChat] = await ChatCategory.upsert({
    id: uuidv4(), name: 'Tech Talk', nameAr: 'حديث التقنية',
    description: 'Discuss all things technology.',
    icon: 'cpu', sortOrder: 1, createdBy: adminUser.id,
  }, { returning: true });

  const [careerChat] = await ChatCategory.upsert({
    id: uuidv4(), name: 'Career Advice', nameAr: 'نصائح مهنية',
    description: 'Get and give career guidance.',
    icon: 'briefcase', sortOrder: 2, createdBy: adminUser.id,
  }, { returning: true });
  console.log('  ✓ ChatCategories');

  // ── 24. ChatRooms ─────────────────────────────────────────
  const [room1] = await ChatRoom.upsert({
    id: uuidv4(), categoryId: techChat.id, createdBy: adminUser.id,
    name: 'Frontend Developers', nameAr: 'مطورو الواجهة الأمامية',
    description: 'A room for frontend developers to share tips and resources.',
    roomType: 'text', accessType: 'public',
    maxMembers: 1000, freeMinutesPerWeek: 120,
    paidPricePerHour: 0, isPremium: false, pricePerAccess: 0,
    isActive: true,
  }, { returning: true });

  const [room2] = await ChatRoom.upsert({
    id: uuidv4(), categoryId: careerChat.id, createdBy: adminUser.id,
    name: 'Interview Prep Circle', nameAr: 'دائرة التحضير للمقابلات',
    description: 'Premium voice room with mock interviews every Thursday.',
    roomType: 'voice', accessType: 'paid',
    maxMembers: 50, freeMinutesPerWeek: 0,
    paidPricePerHour: 20, isPremium: true, pricePerAccess: 10,
    isActive: true,
  }, { returning: true });
  console.log('  ✓ ChatRooms');

  // ── 25. ChatMessages ──────────────────────────────────────
  await ChatMessage.bulkCreate([
    {
      id: uuidv4(), roomId: room1.id, senderId: u1.id,
      content: 'Has anyone tried Zustand for global state? Thinking of switching from Redux.',
      isDeleted: false,
    },
    {
      id: uuidv4(), roomId: room1.id, senderId: u2.id,
      content: 'Yes! Zustand is fantastic for smaller-medium apps. Much less boilerplate than Redux.',
      isDeleted: false,
    },
    {
      id: uuidv4(), roomId: room1.id, senderId: u1.id,
      content: 'Good to know. I will give it a shot on my side project this weekend.',
      isDeleted: false,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ ChatMessages');

  // ── 26. ChatTimeUsage ─────────────────────────────────────
  const mondayThisWeek = new Date();
  mondayThisWeek.setDate(mondayThisWeek.getDate() - mondayThisWeek.getDay() + 1);
  const weekStart = mondayThisWeek.toISOString().slice(0, 10);

  await ChatTimeUsage.bulkCreate([
    {
      id: uuidv4(), userId: u1.id, roomId: room1.id,
      weekStart, freeMinsUsed: 45, paidMinsUsed: 0,
    },
    {
      id: uuidv4(), userId: u2.id, roomId: room1.id,
      weekStart, freeMinsUsed: 90, paidMinsUsed: 0,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ ChatTimeUsage');

  // ── 27. DirectMessages ────────────────────────────────────
  await DirectMessage.bulkCreate([
    {
      id: uuidv4(), senderId: u1.id, recipientId: u2.id,
      content: 'Hey Omar, I saw your post about salary negotiation. Happy to chat!',
      isRead: true, readAt: new Date(),
    },
    {
      id: uuidv4(), senderId: u2.id, recipientId: u1.id,
      content: 'Thanks Fatima! That would be really helpful. When are you free?',
      isRead: false,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ DirectMessages');

  // ── 28. Wallets ───────────────────────────────────────────
  const wallets = await Wallet.bulkCreate([
    { id: uuidv4(), userId: u1.id, pointsBalance: 1250, cashBalance: 0.00, currency: 'SAR', isFrozen: false },
    { id: uuidv4(), userId: u2.id, pointsBalance: 400,  cashBalance: 0.00, currency: 'SAR', isFrozen: false },
    { id: uuidv4(), userId: ownerUser.id, pointsBalance: 0, cashBalance: 500.00, currency: 'SAR', isFrozen: false },
  ], { ignoreDuplicates: true, returning: true });
  const [w1, w2, w3] = wallets;
  console.log('  ✓ Wallets');

  // ── 29. WalletTransactions ────────────────────────────────
  await WalletTransaction.bulkCreate([
    {
      id: uuidv4(), walletId: w1.id, type: 'referral_reward',
      pointsDelta: 500, cashDelta: 0,
      description: 'Referral reward for inviting Omar Al-Ghamdi',
      referenceId: u2.id, referenceType: 'User',
      createdBy: adminUser.id,
    },
    {
      id: uuidv4(), walletId: w1.id, type: 'purchase',
      pointsDelta: 0, cashDelta: -199,
      description: 'Purchase: React & TypeScript Mastery course',
      referenceId: course1.id, referenceType: 'Course',
      paymentGateway: 'stripe', gatewayRef: 'ch_mock_001',
      createdBy: u1.id,
    },
    {
      id: uuidv4(), walletId: w1.id, type: 'referral_reward',
      pointsDelta: 750, cashDelta: 0,
      description: 'Bonus points for completing profile 100%',
      createdBy: adminUser.id,
    },
    {
      id: uuidv4(), walletId: w2.id, type: 'purchase',
      pointsDelta: 0, cashDelta: -149,
      description: 'Purchase: Node.js Backend Development course',
      referenceId: course2.id, referenceType: 'Course',
      paymentGateway: 'stripe', gatewayRef: 'ch_mock_002',
      createdBy: u2.id,
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ WalletTransactions');

  // ── 30. Referrals ─────────────────────────────────────────
  await Referral.bulkCreate([
    {
      id: uuidv4(), referrerId: u1.id, refereeId: u2.id,
      referralCode: u1.referralCode,
      rewardGiven: true, rewardGivenAt: weeksAgo(1),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ Referrals');

  // ── 31. Notifications ─────────────────────────────────────
  await Notification.bulkCreate([
    {
      id: uuidv4(), userId: u1.id,
      title: 'Your application was shortlisted!',
      titleAr: 'تم إدراجك في القائمة المختصرة!',
      body: 'TechCorp Arabia has shortlisted your application for Senior Frontend Engineer.',
      bodyAr: 'قامت TechCorp Arabia بإدراج طلبك لوظيفة مهندس واجهة أمامية أول.',
      type: 'application_status', channel: 'in_app',
      referenceId: app1.id, referenceType: 'JobApplication',
      isRead: false, sentAt: new Date(),
    },
    {
      id: uuidv4(), userId: u1.id,
      title: 'You earned 500 points!',
      titleAr: 'ربحت 500 نقطة!',
      body: 'You received a referral reward for inviting Omar Al-Ghamdi.',
      bodyAr: 'حصلت على مكافأة الإحالة لدعوة عمر الغامدي.',
      type: 'wallet_credit', channel: 'in_app',
      isRead: true, readAt: weeksAgo(1), sentAt: weeksAgo(1),
    },
    {
      id: uuidv4(), userId: u2.id,
      title: 'New job match: Backend Node.js Developer',
      titleAr: 'وظيفة مطابقة جديدة: مطور Node.js',
      body: 'A new job that matches your profile has been posted at TechCorp Arabia.',
      bodyAr: 'تم نشر وظيفة جديدة تتطابق مع ملفك الشخصي في TechCorp Arabia.',
      type: 'job_match', channel: 'in_app',
      referenceId: job2.id, referenceType: 'Job',
      isRead: false, sentAt: new Date(),
    },
    {
      id: uuidv4(), userId: u2.id,
      title: 'Welcome to the platform!',
      titleAr: 'مرحباً بك في المنصة!',
      body: 'Your account is active. Complete your profile to get the best job matches.',
      bodyAr: 'حسابك نشط. أكمل ملفك الشخصي للحصول على أفضل تطابقات الوظائف.',
      type: 'welcome', channel: 'email',
      isRead: true, readAt: weeksAgo(2), sentAt: weeksAgo(2),
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ Notifications');

  // ── 32. AuditLogs ─────────────────────────────────────────
  await AuditLog.bulkCreate([
    {
      id: uuidv4(), actorId: adminUser.id,
      action: 'company.approve', entityType: 'Company', entityId: company.id,
      oldValue: { status: 'pending_review' }, newValue: { status: 'active' },
      ipAddress: '10.0.0.1', userAgent: 'Mozilla/5.0 (admin dashboard)',
    },
    {
      id: uuidv4(), actorId: adminUser.id,
      action: 'job.approve', entityType: 'Job', entityId: job1.id,
      oldValue: { status: 'pending_approval' }, newValue: { status: 'active' },
      ipAddress: '10.0.0.1', userAgent: 'Mozilla/5.0 (admin dashboard)',
    },
    {
      id: uuidv4(), actorId: modUser.id,
      action: 'report.resolve', entityType: 'PostReport',
      oldValue: { resolved: false }, newValue: { resolved: true },
      ipAddress: '10.0.0.2', userAgent: 'Mozilla/5.0 (mod dashboard)',
    },
    {
      id: uuidv4(), actorId: u1.id,
      action: 'user.login', entityType: 'User', entityId: u1.id,
      newValue: { method: 'password', ip: '192.168.1.10' },
      ipAddress: '192.168.1.10', userAgent: 'Chrome/124 Windows',
    },
  ], { ignoreDuplicates: true });
  console.log('  ✓ AuditLogs');

  // ── 33. UserConnections ───────────────────────────────────
  await UserConnection.bulkCreate([
    { id: uuidv4(), followerId: u1.id, followingId: u2.id },
    { id: uuidv4(), followerId: u2.id, followingId: u1.id },
    { id: uuidv4(), followerId: u1.id, followingId: modUser.id },
    { id: uuidv4(), followerId: u2.id, followingId: ownerUser.id },
  ], { ignoreDuplicates: true });
  console.log('  ✓ UserConnections');

  console.log('\n✅ Seed complete!');
  console.log('\nTest credentials (all use password: Password123!)');
  console.log('  admin@example.com        — admin');
  console.log('  support@example.com      — support');
  console.log('  moderator@example.com    — moderator');
  console.log('  company.owner@example.com— company owner');
  console.log('  user1@example.com        — job seeker (Fatima)');
  console.log('  user2@example.com        — job seeker (Omar)');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
