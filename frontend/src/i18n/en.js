export default {
  // ── Nav ───────────────────────────────────────────
  nav: {
    jobs:      'Jobs',
    courses:   'Courses',
    community: 'Community',
    about:     'About',
    login:     'Login',
    start:     'Get Started',
    dashboard: 'Dashboard',
    pricing:      'Pricing',
    findJobs: "Find Jobs",
    hireTalent: "Hire Talent",
   
  },

  // ── Hero ──────────────────────────────────────────
  hero: {
    badge:       'The #1 AI-Powered Job Platform in the Arab World',
    headline1:   'Find Your',
    headline2:   'Dream Job',
    headline3:   'Powered by AI',
    subtitle:    'We analyze your CV, match it with top jobs, and auto-apply on your behalf — while you wait for the right opportunity',
    searchPlaceholder: 'Search jobs, companies, or skills...',
    searchBtn:   'Search',
    ctaUser:     'Get Started',
    ctaCompany:  'I\'m an Employer',
    socialProof: 'job seekers trust us',
    scrollHint:  'Scroll down',
  },

  // ── Stats ─────────────────────────────────────────
  stats: {
    jobs:      'Available Jobs',
    companies: 'Registered Companies',
    users:     'Job Seekers',
    success:   'Success Rate',
  },
  cta: {
    title: "Ready to build a stronger career future?",
    subtitle:
      "Join a platform that connects you with the best job opportunities based on your skills and interests.",
    primary: "Get Started Free",
    secondary: "Browse Jobs",
  },

  // ── Features ──────────────────────────────────────
  features: {
    title:    'Everything You Need in One Place',
    subtitle: 'Wazeefati combines AI, learning, and professional networking in one seamless experience',
    badge:    'Platform Features',
    new:      'New',
    exclusive:'Exclusive',
    items: [
      { title: 'AI CV Analysis',       desc: 'Instant ATS score with a detailed improvement report', tag: 'New' },
      { title: 'Smart Auto-Apply',     desc: 'AI matches and applies to hundreds of jobs — effortlessly', tag: 'Exclusive' },
      { title: 'Interview Training',   desc: 'Real simulations with instant feedback and precise tips', tag: '' },
      { title: 'Custom Learning Path', desc: 'Identify skill gaps and plan your career roadmap', tag: '' },
      { title: 'Arab Pro Network',     desc: 'Connect with professionals and get referrals', tag: '' },
      { title: 'Points & Rewards',     desc: 'Turn your activity into points and cash them out', tag: '' },
    ],
  },

  // ── How it works ──────────────────────────────────
  how: {
    title:    'How Does It Work?',
    subtitle: 'Four simple steps separate you from your dream job',
    steps: [
      { title: 'Create Account',    desc: 'In less than a minute — for free' },
      { title: 'Upload Your CV',    desc: 'Or build one with AI assistance' },
      { title: 'AI Matches & Applies', desc: 'Automatically to hundreds of jobs' },
      { title: 'Land Your Job',     desc: 'Get real-time notifications at every step' },
    ],
  },

  // ── Testimonials ──────────────────────────────────
  testimonials: {
    title:    'What They Say About Wazeefati',
    subtitle: 'Thousands of users trust our platform every day',
    items: [
      { name: 'Ahmed Al-Zahrani', role: 'React Developer — Riyadh', text: 'After one month I received 3 job offers! The platform completely transformed my CV with a detailed report I never expected.' },
      { name: 'Sara Al-Ghamdi',   role: 'Digital Marketing — Jeddah', text: 'The auto-apply feature saved me 4 hours daily I used to spend on manual applications. Now the platform applies and I track results.' },
      { name: 'Mohammed Al-Otaibi', role: 'Civil Engineer — Kuwait', text: 'The AI interview training was amazing — very precise feedback on my style that helped me prepare better than ever before.' },
    ],
  },

  // ── CTA ───────────────────────────────────────────
  cta: {
    title:    'Start Your Career Journey Today',
    subtitle: 'Join over 45,000 job seekers who use Wazeefati to find their dream jobs',
    btn1:     'Create Free Account 🚀',
    btn2:     'Browse Jobs',
  },

  // ── Footer ────────────────────────────────────────
  footer: {
    desc:      'The #1 AI-Powered Job Platform in the Arab World',
    copyright: 'All rights reserved',
    cols: [
      { title: 'For Job Seekers', links: ['CV Analysis', 'Jobs', 'Training', 'Courses'] },
      { title: 'For Companies',   links: ['Post Jobs', 'Find Talent', 'Plans', 'Support'] },
      { title: 'Platform',        links: ['About Us', 'Blog', 'Privacy', 'Terms'] },
    ],
    social: ['Twitter', 'LinkedIn', 'Instagram'],
  },

  // ── Auth ──────────────────────────────────────────
  auth: {
    register: {
      title:       'Create New Account',
      subtitle:    'Already have an account?',
      loginLink:   'Login',
      roleUser:    'Job Seeker',
      roleCompany: 'Employer',
      fullName:    'Full Name',
      email:       'Email Address',
      password:    'Password',
      confirmPass: 'Confirm Password',
      terms1:      'I agree to the',
      termsLink:   'Terms of Service',
      terms2:      'and',
      privacyLink: 'Privacy Policy',
      submit:      'Create Account →',
      loading:     'Creating account...',
      sideTitle:   'Join Wazeefati',
      sideDesc:    'Thousands of job seekers found their dream jobs with us',
      sideFeatures:['Free CV analysis', 'Auto-apply to jobs', 'AI interview training'],
      jobSeeker: "I'm looking for a job",
    employer: "I'm looking for candidates",
    },
    login: {
      title:       'Login',
      subtitle:    "Don't have an account?",
      registerLink:'Create Free Account',
      email:       'Email Address',
      password:    'Password',
      forgot:      'Forgot password?',
      remember:    'Remember me for 30 days',
      submit:      'Login →',
      loading:     'Logging in...',
      welcome:     'Welcome back! 👋',
      sideTitle:   'Welcome Back!',
      sideDesc:    'Great to see you again on Wazeefati. Your dream job is waiting',
      sideItems:   ['New auto-applications', 'Updated interview results', 'New matched jobs'],
    },
    otp: {
      title:       'Check Your Email',
      subtitle:    'We sent a verification code to',
      confirm:     'Confirm Code →',
      loading:     'Verifying...',
      resendQ:     "Didn't receive it?",
      resend:      'Resend',
      resendTimer: 'Resend in',
      resendSec:   's',
      resendOk:    '✅ New code sent successfully',
    },
    success: {
      title:    'Account Activated!',
      subtitle: 'Welcome to Wazeefati — start your career journey now',
      btn:      'Login →',
    },
    forgot: {
      title:    'Reset Password',
      subtitle: 'Enter your email and we\'ll send a verification code',
      submit:   'Send Verification Code',
      loading:  'Sending...',
      back:     '← Back',
      otpTitle: 'Enter Verification Code',
      otpSent:  'Sent to',
      newPass:  'New Password',
      save:     'Save Password',
      saving:   'Saving...',
      doneTitle:'Password Changed!',
      doneDesc: 'You can now login with your new password',
      doneBtn:  'Login →',
    },
    errors: {
      nameMin:      'Name must be at least 2 characters',
      emailInvalid: 'Invalid email address',
      passMin:      'Password must be at least 8 characters',
      passStrength: 'Must include uppercase, lowercase, and a number',
      passMismatch: 'Passwords do not match',
      termsRequired:'You must agree to the terms',
      required:     'This field is required',
      otpWrong:     'Code is incorrect or expired',
    },
    steps: ['Details', 'Verify'],
    trustBadge: 'active users',
  },

  // ── Dashboard ─────────────────────────────────────
  dashboard: {
    greetMorning:   'Good morning',
    greetAfternoon: 'Good afternoon',
    greetEvening:   'Good evening',
    subtitle:       "Here's your activity summary for today",
    aiBanner: {
      sub:   '🤖 AI found for you',
      title: 'Matching Jobs',
      icon:  '🎯',
      sub2:  'With compatibility above 75%',
      btn:   'View Jobs →',
    },
    stats: {
      matched:   'Matched Jobs',
      matchedSub:'Above 75% match',
      apps:      'Active Applications',
      appsSub:   '3 under review',
      training:  'Training Sessions',
      trainSub:  'Average: 82%',
      points:    'Wallet Points',
      pointsSub: '≈ $2.5',
    },
    urgents: [
      { title: 'Interview Invitation!', desc: 'Aramco Tech — Tomorrow at 10:00 AM', btn: 'View →' },
      { title: 'CV Needs Improvement', desc: 'Add 3 keywords to boost your ATS score to 90%', btn: 'View →' },
    ],
    activity: {
      title: 'Recent Activity',
      viewAll: 'View All',
      items: [
        { text: 'Auto-applied to React Developer at STC', time: '2 hours ago' },
        { text: 'CV analyzed — ATS Score: 78/100', time: '5 hours ago' },
        { text: 'Completed interview training session — Excellent result', time: 'Yesterday' },
        { text: 'Earned 50 bonus points for daily activity', time: 'Yesterday' },
        { text: '"Tech Solutions" viewed your profile', time: '2 days ago' },
      ],
    },
    profile: {
      title:    'Profile Completeness',
      excellent:'Excellent 🌟',
      good:     'Good 👍',
      needsWork:'Needs Work',
      completeBtn: 'Complete Profile',
      checks: ['CV Uploaded','Profile Photo','Skills Added','Work Experience','Job Preferences'],
    },
    quickActions: {
      title: 'Quick Actions',
      items: ['Upload CV', 'Browse Jobs', 'Start Training', 'Courses'],
    },
    interviews: {
      title: 'Upcoming Interviews',
      manage:'Manage',
      items: [
        { co: 'Tech Solutions', role: 'React Developer', date: 'Tomorrow', time: '10:00 AM' },
        { co: 'Gulf Group',     role: 'Data Analyst',    date: 'Friday',   time: '2:00 PM' },
      ],
    },
    nav: {
      home:      'Home',
      cvs:       'My CVs',
      jobs:      'My Jobs',
      training:  'Training',
      courses:   'My Courses',
      community: 'Community',
      wallet:    'Wallet',
      settings:  'Settings',
      logout:    'Logout',
      search:    'Search...',
    },
  },
};
