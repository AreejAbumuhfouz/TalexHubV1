'use strict';

const { CV }             = require('../models');
const aiSvc              = require('../services/ai.service');
const storageSvc         = require('../services/storage.service');
const { success, error } = require('../utils/apiResponse');
const logger             = require('../utils/logger');
const pdfParse           = require('pdf-parse');
const mammoth            = require('mammoth');

// ════════════════════════════════════════════════════════════
// PLAN RULES:
//
// FREE:
//   - extractCVStructure → Regex (parseBasic) — 0 tokens
//   - ATS analysis       → algorithmAnalysis   — 0 tokens
//   - Keywords           → algorithm detects from text
//   - AI Enhance         → ❌ blocked
//   - Career Path        → ❌ blocked
//
// PRO:
//   - extractCVStructure → DeepSeek AI         — tokens
//   - ATS analysis       → aiSvc.analyzeCV     — tokens
//   - Keywords           → AI custom keywords
//   - AI Enhance         → ✅ available
//   - Career Path        → ✅ available
// ════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────
// Extract raw text from file buffer
// ────────────────────────────────────────────────────────────
const extractText = async (buffer, mimetype) => {
  try {
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    }
    if (mimetype.includes('wordprocessingml') || mimetype.includes('msword')) {
      const { value } = await mammoth.extractRawText({ buffer });
      return value || '';
    }
    return '';
  } catch { return ''; }
};

// ────────────────────────────────────────────────────────────
// FREE: Regex parser — 0 tokens
// ────────────────────────────────────────────────────────────
const parseBasic = (text) => {
  const lines         = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emailMatch    = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch    = text.match(/(\+?[\d\s\-().]{8,15})/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

  const summaryIdx = lines.findIndex(l => /summary|profile|نبذة|ملخص|objective/i.test(l));
  const skillsIdx  = lines.findIndex(l => /^skills|^مهارات|technical skills/i.test(l));

  // detect experiences block
  const expIdx = lines.findIndex(l => /experience|خبرات|work history/i.test(l));
  const eduIdx = lines.findIndex(l => /education|تعليم|qualification/i.test(l));

  const experiences = [];
  if (expIdx > -1) {
    const block = lines.slice(expIdx + 1, eduIdx > expIdx ? eduIdx : expIdx + 20);
    let current = null;
    block.forEach(l => {
      if (l.length > 5 && l.length < 80 && !l.startsWith('•') && !l.startsWith('-')) {
        if (current) experiences.push(current);
        current = { title: l, company: '', startDate: '', endDate: '', current: false, description: '' };
      } else if (current && (l.startsWith('•') || l.startsWith('-'))) {
        current.description += (current.description ? '\n' : '') + l;
      }
    });
    if (current) experiences.push(current);
  }

  const education = [];
  if (eduIdx > -1) {
    const block = lines.slice(eduIdx + 1, eduIdx + 15);
    block.forEach(l => {
      if (/bachelor|master|bsc|ba |b\.s|بكالوريوس|ماجستير|دبلوم|diploma/i.test(l)) {
        education.push({ institution: '', degree: l, field: '', year: '' });
      } else if (/university|college|جامعة|كلية/i.test(l) && education.length > 0) {
        education[education.length - 1].institution = l;
      } else if (/\d{4}/.test(l) && education.length > 0) {
        const yearMatch = l.match(/\d{4}/);
        if (yearMatch) education[education.length - 1].year = yearMatch[0];
      }
    });
  }

  return {
    fullName:       lines[0] || '',
    headline:       lines[1] || '',
    email:          emailMatch    ? emailMatch[0]                 : '',
    phone:          phoneMatch    ? phoneMatch[0].trim()          : '',
    linkedin:       linkedinMatch ? `https://${linkedinMatch[0]}` : '',
    location:       '',
    summary:        summaryIdx > -1
      ? lines.slice(summaryIdx + 1, summaryIdx + 5).filter(l => l.length > 20).join(' ')
      : '',
    skills:         skillsIdx > -1
      ? lines.slice(skillsIdx + 1, skillsIdx + 20).filter(l => l.length < 120).join(', ')
      : '',
    languages:      '',
    certifications: '',
    experiences:    experiences.length > 0 ? experiences : [{ title:'', company:'', startDate:'', endDate:'', current:false, description:'' }],
    education:      education.length   > 0 ? education   : [{ institution:'', degree:'', field:'', year:'' }],
  };
};

// ────────────────────────────────────────────────────────────
// FREE: Algorithm analysis — 0 AI tokens
// Detects skills, keywords, missing sections from text patterns
// ────────────────────────────────────────────────────────────
const SKILL_DICT = {
  frontend:    ['react','vue','angular','next.js','html','css','tailwind','bootstrap','javascript','typescript','redux','jquery'],
  backend:     ['node.js','express','python','django','flask','java','spring','php','laravel','ruby','rails','go','rust'],
  database:    ['sql','mysql','postgresql','mongodb','firebase','redis','elasticsearch','sequelize','prisma','knex'],
  devops:      ['docker','kubernetes','aws','azure','gcp','ci/cd','jenkins','github actions','nginx','linux'],
  mobile:      ['react native','flutter','swift','kotlin','android','ios','expo'],
  design:      ['figma','adobe xd','photoshop','illustrator','ui/ux','wireframe'],
  soft:        ['leadership','management','communication','teamwork','problem solving','agile','scrum'],
  ai:          ['machine learning','deep learning','tensorflow','pytorch','nlp','computer vision','data science'],
  hr:          ['recruitment','talent acquisition','payroll','performance management','onboarding','hrms','labor law'],
  finance:     ['accounting','budgeting','financial analysis','excel','quickbooks','sap','ifrs'],
};

const ACTION_VERBS = ['managed','led','developed','implemented','analyzed','designed','built','created','improved','reduced','increased','delivered','launched','coordinated','supervised','trained','mentored','achieved','optimized','automated'];

const detectSkillsFromText = (text) => {
  const t = text.toLowerCase();
  const found = [];
  Object.values(SKILL_DICT).flat().forEach(skill => {
    if (t.includes(skill.toLowerCase())) found.push(skill);
  });
  return [...new Set(found)];
};

const detectMissingKeywords = (text) => {
  const t = text.toLowerCase();
  const allSkills = Object.values(SKILL_DICT).flat();
  // suggest skills NOT in the CV from same category
  const present  = allSkills.filter(s => t.includes(s));
  const category = Object.entries(SKILL_DICT).find(([, skills]) =>
    skills.some(s => present.includes(s))
  );
  if (!category) return [];
  return category[1].filter(s => !present.includes(s)).slice(0, 6);
};

const suggestKeywords = (text, jobTitle = '') => {
  const t = text.toLowerCase();
  const j = jobTitle.toLowerCase();

  // detect which category from job title
  const isHR       = /hr|human resource|موارد بشرية|توظيف/.test(j + t);
  const isDev      = /developer|engineer|مطور|مهندس|برمج/.test(j + t);
  const isDesigner = /designer|مصمم|ux|ui/.test(j + t);
  const isFinance  = /finance|accounting|محاسب|مالي/.test(j + t);

  const base = ACTION_VERBS.filter(v => !t.includes(v));

  if (isHR)       return [...new Set([...base, ...['streamlined hiring','reduced turnover','conducted interviews','managed onboarding']].slice(0, 8))];
  if (isDev)      return [...new Set([...base, ...['deployed','refactored','integrated','automated','tested']]).slice(0, 8)];
  if (isDesigner) return [...new Set([...base, ...['wireframed','prototyped','user tested','iterated','redesigned']]).slice(0, 8)];
  if (isFinance)  return [...new Set([...base, ...['reconciled','audited','forecasted','reported','budgeted']]).slice(0, 8)];

  return base.slice(0, 8);
};

const algorithmAnalysis = (text, lang = 'ar') => {
  const t         = (text || '').toLowerCase();
  const wordCount = t.split(/\s+/).filter(Boolean).length;

  const has = {
    summary:      /summary|profile|نبذة|ملخص|objective|about me/i.test(t),
    experience:   /experience|خبرة|عمل|worked|employment|intern/i.test(t),
    education:    /education|تعليم|بكالوريوس|bachelor|master|university|جامعة|college/i.test(t),
    skills:       /skills|مهارات|competencies|technical/i.test(t),
    contact:      /email|phone|هاتف|بريد|linkedin|tel:|mobile/i.test(t),
    achievements: /achieved|award|إنجاز|جائزة|accomplished|recognition|honor/i.test(t),
    numbers:      /\d+%|\d+k|\d+ years|\d+ سنوات|\d+\+|\$\d+/.test(text),
    keywords:     ACTION_VERBS.some(v => t.includes(v)),
    linkedin:     /linkedin\.com/i.test(t),
    certifications: /certif|شهادة|certified|license|diploma/i.test(t),
  };

  const tooShort = wordCount < 150;
  const tooLong  = wordCount > 800;

  // Scoring
  const scores = {
    formatting: Math.min(100,
      (has.contact?20:0) + (has.summary?20:0) + (has.experience?20:0) +
      (has.education?20:0) + (has.skills?10:0) + (has.linkedin?10:0)),
    keywords:   Math.min(100,
      (has.keywords?35:5) + (has.numbers?30:0) + (has.achievements?25:0) + (has.certifications?10:0)),
    experience: Math.min(100,
      has.experience ? (has.numbers?85:has.keywords?65:45) : 20),
    education:  Math.min(100, has.education ? 80 : 35),
    skills:     Math.min(100, has.skills    ? 75 : 25),
    clarity:    Math.min(100, tooShort?25 : tooLong?50 : 85),
  };

  const overallScore = Math.round(
    scores.formatting*0.20 + scores.keywords*0.25 +
    scores.experience*0.25 + scores.education*0.15 +
    scores.skills*0.10     + scores.clarity*0.05
  );

  // Build improvements list
  const improvements = [];

  if (!has.summary)
    improvements.push({ priority:'high', section:'summary',
      issue: lang==='ar' ? 'لا يوجد ملخص مهني' : 'No professional summary',
      fix:   lang==='ar' ? 'أضف ملخصاً من 3-4 جمل: من أنت، خبرتك، وما تبحث عنه' : 'Add 3-4 sentence summary: who you are, your experience, your goal' });

  if (!has.numbers)
    improvements.push({ priority:'high', section:'experience',
      issue: lang==='ar' ? 'لا توجد أرقام أو نتائج قابلة للقياس' : 'No measurable results or numbers',
      fix:   lang==='ar' ? 'مثال: "طورت تطبيقاً وفّر 40% من وقت الفريق" أو "قدت فريق من 5 مطورين"' : 'Example: "Built app saving 40% team time" or "Led team of 5 developers"' });

  if (!has.keywords)
    improvements.push({ priority:'high', section:'keywords',
      issue: lang==='ar' ? 'لا توجد أفعال قوية (Action Verbs)' : 'Missing strong action verbs',
      fix:   lang==='ar' ? 'ابدأ كل نقطة بفعل قوي: طورت، قدت، حللت، نفّذت، أدرت، حسّنت' : 'Start each bullet with: developed, led, analyzed, implemented, managed' });

  if (!has.skills)
    improvements.push({ priority:'medium', section:'skills',
      issue: lang==='ar' ? 'قسم المهارات غائب أو ضعيف' : 'Skills section missing or weak',
      fix:   lang==='ar' ? 'أضف مهارات تقنية محددة (برامج، لغات برمجة، أدوات) ومهارات ناعمة' : 'Add specific technical skills (software, languages, tools) and soft skills' });

  if (!has.contact)
    improvements.push({ priority:'high', section:'contact',
      issue: lang==='ar' ? 'معلومات التواصل ناقصة أو غير واضحة' : 'Contact information missing or unclear',
      fix:   lang==='ar' ? 'أضف في الأعلى: البريد الإلكتروني، رقم الهاتف، LinkedIn، الموقع' : 'Add at top: email, phone, LinkedIn, location' });

  if (!has.linkedin)
    improvements.push({ priority:'medium', section:'contact',
      issue: lang==='ar' ? 'LinkedIn غير مضمّن' : 'LinkedIn profile not included',
      fix:   lang==='ar' ? 'أضف رابط LinkedIn — يزيد فرص القبول بنسبة 40%' : 'Add LinkedIn URL — increases acceptance rate by 40%' });

  if (!has.achievements)
    improvements.push({ priority:'medium', section:'achievements',
      issue: lang==='ar' ? 'لا توجد إنجازات أو جوائز' : 'No achievements or awards mentioned',
      fix:   lang==='ar' ? 'أضف أي إنجاز: شهادة، جائزة، مشروع ناجح، ترقية' : 'Add any achievement: certification, award, successful project, promotion' });

  if (tooLong)
    improvements.push({ priority:'medium', section:'length',
      issue: lang==='ar' ? 'السيرة الذاتية طويلة جداً' : 'CV is too long',
      fix:   lang==='ar' ? 'قلل إلى صفحة واحدة (خريج) أو صفحتين (خبرة 5+ سنوات)' : 'Trim to 1 page (graduate) or 2 pages (5+ years experience)' });

  if (tooShort)
    improvements.push({ priority:'high', section:'content',
      issue: lang==='ar' ? 'المحتوى قليل جداً — السيرة تبدو فارغة' : 'Very little content — CV looks empty',
      fix:   lang==='ar' ? 'أضف تفاصيل كل وظيفة: المهام، الأدوات المستخدمة، الإنجازات' : 'Add details for each job: tasks, tools used, achievements' });

  // Detected skills from text
  const detectedSkills = detectSkillsFromText(text);

  // Missing keywords — algorithm detects based on skills present
  const missingKeywords = detectMissingKeywords(text);

  // Suggested action verbs not already in CV
  const suggestedKeywords = suggestKeywords(text).slice(0, 8);

  return {
    isFree:          true,
    overallScore,
    atsScore:        overallScore,
    scores,
    detectedSkills,
    missingKeywords,
    suggestedKeywords,
    strengths: [
      ...(has.experience     ? [lang==='ar'?'يوجد قسم خبرة واضح':'Clear experience section']          : []),
      ...(has.education      ? [lang==='ar'?'يوجد قسم تعليم':'Education section present']             : []),
      ...(has.skills         ? [lang==='ar'?'يوجد قسم مهارات':'Skills section present']               : []),
      ...(has.numbers        ? [lang==='ar'?'يوجد أرقام وإنجازات قابلة للقياس':'Measurable results'] : []),
      ...(has.certifications ? [lang==='ar'?'يوجد شهادات ودورات':'Certifications present']            : []),
      ...(has.linkedin       ? [lang==='ar'?'LinkedIn مضمّن':'LinkedIn included']                       : []),
    ].slice(0, 4),
    improvements: improvements.slice(0, 6),
    summary: overallScore >= 80
      ? (lang==='ar' ? '✅ سيرتك ممتازة وجاهزة للتقديم.' : '✅ Excellent CV, ready to apply.')
      : overallScore >= 60
      ? (lang==='ar' ? '⚠️ سيرتك جيدة لكن تحتاج بعض التحسينات.' : '⚠️ Good CV but needs some improvements.')
      : (lang==='ar' ? '❌ سيرتك تحتاج تحسينات مهمة قبل التقديم.' : '❌ CV needs important improvements before applying.'),
    tip: lang==='ar'
      // ? '⚡ ترقّ إلى Pro للحصول على تحليل DeepSeek AI مع اقتراحات كلمات مفتاحية مخصصة لوظيفتك المستهدفة.'
      // : '⚡ Upgrade to Pro for DeepSeek AI analysis with custom keywords for your target job.',
  };
};

// ════════════════════════════════════════════════════════════
// POST /api/v1/cvs/upload
// ════════════════════════════════════════════════════════════
exports.uploadAndAnalyze = async (req, res) => {
  if (!req.file) return error(res, 'يرجى رفع ملف', 400);

  const userId = req.user.id;
  const isPro  = ['pro','elite'].includes(req.user.planKey || 'free');
  const { title, template = 'classic', language = 'ar' } = req.body;

  // 1. Upload to R2
  const { key, url } = await storageSvc.uploadCV({
    buffer: req.file.buffer, mimetype: req.file.mimetype, originalname: req.file.originalname,
  });

  // 2. Extract raw text
  const rawText = await extractText(req.file.buffer, req.file.mimetype);
  if (!rawText || rawText.length < 50) {
    await storageSvc.remove(key).catch(() => {});
    return error(res, 'تعذّر قراءة الملف. تأكد أنه PDF أو DOCX نصي واضح', 400);
  }

  // 3. Parse structure for template
  //    PRO  → DeepSeek AI  (fills all fields automatically)
  //    FREE → Regex parser  (fills basic fields, user completes rest)
  let parsedData = null;
  if (isPro) {
    try {
      parsedData = await aiSvc.extractCVStructure(rawText);
    } catch (err) {
      console.error('AI extraction failed, using regex:', err.message);
    }
  }
  if (!parsedData) parsedData = parseBasic(rawText);

  // 4. Merge with user profile (profile data takes priority)
  const { User } = require('../models');
  const profile = await User.findByPk(userId, {
    attributes: ['fullName','headline','email','phone','locationCity','locationCountry','linkedinUrl'],
  }).catch(() => null);

  const mergedData = {
    ...parsedData,
    fullName: profile?.fullName    || parsedData.fullName || '',
    headline: profile?.headline    || parsedData.headline || '',
    email:    profile?.email       || parsedData.email    || '',
    phone:    profile?.phone       || parsedData.phone    || '',
    location: parsedData.location  || [profile?.locationCity, profile?.locationCountry].filter(Boolean).join(', '),
    linkedin: profile?.linkedinUrl || parsedData.linkedin || '',
  };

  // 5. Analyze CV
  //    PRO  → DeepSeek AI (deep analysis + custom keywords)
  //    FREE → Algorithm   (0 tokens, detects skills from text)
  let analysis;
  try {
    if (isPro) {
      analysis = { ...(await aiSvc.analyzeCV(rawText, '', '')), isFree: false };
    } else {
      analysis = algorithmAnalysis(rawText, language);
    }
  } catch (err) {
    console.error('Analysis error, fallback to algorithm:', err.message);
    analysis = algorithmAnalysis(rawText, language);
  }

  // 6. First CV = primary
  const count     = await CV.count({ where: { userId } });
  const isPrimary = count === 0;

  // 7. Save
  const cv = await CV.create({
    userId,
    title:           title || req.file.originalname.replace(/\.[^.]+$/, ''),
    fileUrl: url, fileKey: key,
    fileType:        req.file.mimetype.includes('pdf') ? 'pdf' : 'docx',
    fileSize:        req.file.size,
    rawText,
    parsedContent:   mergedData,
    analysisData:    analysis,
    aiFeedback:      analysis,
    extractedSkills: analysis?.detectedSkills || [],
    atsScore:        analysis?.atsScore    || null,
    overallScore:    analysis?.overallScore || null,
    isAnalyzed:      true,
    isPrimary,
    language,
    builderData:     { template, ...mergedData },
  });

  return success(res, { cv, analysis, parsedData: mergedData, template },
    'تم رفع السيرة الذاتية وتحليلها بنجاح', 201);
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/cvs
// ════════════════════════════════════════════════════════════
exports.getMyCVs = async (req, res) => {
  const cvs = await CV.findAll({
    where:      { userId: req.user.id },
    attributes: { exclude: ['rawText'] },
    order:      [['is_primary','DESC'],['created_at','DESC']],
  });
  return success(res, { cvs });
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/cvs/:id
// ════════════════════════════════════════════════════════════
exports.getCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  return success(res, { cv });
};

// ════════════════════════════════════════════════════════════
// GET /api/v1/cvs/:id/download
// ════════════════════════════════════════════════════════════
exports.downloadCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const downloadUrl = await storageSvc.getPresignedUrl(cv.fileKey, 3600);
  return success(res, { downloadUrl });
};
exports.getDownloadUrl = exports.downloadCV;

// ════════════════════════════════════════════════════════════
// PATCH /api/v1/cvs/:id — update template or fields
// ════════════════════════════════════════════════════════════
exports.updateCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);

  const { title, builderData, template, language, html } = req.body;

  const updates = {};
  if (title)       updates.title       = title;
  if (builderData) updates.builderData = {
    ...(cv.builderData || {}),
    ...builderData,
    ...(template ? { template } : {}),
  };
  if (template)    updates.template    = template;
  if (language)    updates.language    = language;

  await cv.update(updates);

  // إذا أُرسِل HTML → ولّد PDF وحدّث R2
  if (html && html.trim().length > 100) {
    let pdfBuffer = null;
    try {
      const htmlPdf = require('html-pdf-node');
      pdfBuffer = await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout')), 20000);
        htmlPdf.generatePdf(
          { content: html },
          { format:'A4', printBackground:true, margin:{top:'0',bottom:'0',left:'0',right:'0'}, args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] }
        ).then(b => { clearTimeout(t); resolve(b); }).catch(e => { clearTimeout(t); reject(e); });
      });
    } catch (e1) {
      logger.warn('updateCV html-pdf-node failed:', e1.message);
      try {
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--disable-gpu','--single-process'], timeout:30000 });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil:'domcontentloaded', timeout:20000 });
        pdfBuffer = await page.pdf({ format:'A4', printBackground:true, margin:{top:'0',bottom:'0',left:'0',right:'0'} });
        await browser.close();
      } catch (e2) { logger.error('updateCV puppeteer failed:', e2.message); }
    }

    if (pdfBuffer?.length > 0) {
      try {
        if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(() => {});
        const { key, url } = await storageSvc.upload({
          buffer: pdfBuffer, mimetype: 'application/pdf',
          originalname: `cv-${req.user.id}-${Date.now()}.pdf`,
          folder: 'generated-cvs', type: 'cv',
        });
        await cv.update({ fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length, status:'generated' });
        logger.info(`updateCV: PDF updated → ${key}`);
      } catch (e) { logger.error('updateCV PDF upload failed:', e.message); }
    }
  }

  const updated = await CV.findByPk(cv.id);
  return success(res, { cv: updated }, 'تم التحديث');
};

// ════════════════════════════════════════════════════════════
// POST /api/v1/cvs/:id/re-analyze
// FREE → algorithm | PRO → DeepSeek AI
// ════════════════════════════════════════════════════════════
exports.reAnalyze = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  if (!cv.rawText) return error(res, 'لا يوجد نص للتحليل', 400);

  const isPro = ['pro','elite'].includes(req.user.planKey || 'free');
  let analysis;
  try {
    if (isPro) {
      analysis = { ...(await aiSvc.analyzeCV(cv.rawText, '', '')), isFree: false };
    } else {
      analysis = algorithmAnalysis(cv.rawText, cv.language || 'ar');
    }
  } catch {
    analysis = algorithmAnalysis(cv.rawText, cv.language || 'ar');
  }

  await cv.update({ analysisData: analysis, aiFeedback: analysis, atsScore: analysis.atsScore, overallScore: analysis.overallScore });
  return success(res, { cv, analysis });
};
exports.reAnalyzeCV = exports.reAnalyze;

// ════════════════════════════════════════════════════════════
// POST /api/v1/cvs/:id/analyze-free — force algorithm always
// ════════════════════════════════════════════════════════════
exports.analyzeFree = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const analysis = algorithmAnalysis(cv.rawText || '', cv.language || 'ar');
  await cv.update({ atsScore: analysis.atsScore });
  return success(res, { analysis });
};
exports.analyzeForFree = exports.analyzeFree;

// ════════════════════════════════════════════════════════════
// PATCH /api/v1/cvs/:id/primary
// ════════════════════════════════════════════════════════════
exports.setPrimary = async (req, res) => {
  const userId = req.user.id;
  const cv = await CV.findOne({ where: { id: req.params.id, userId } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  await CV.update({ isPrimary: false }, { where: { userId } });
  await cv.update({ isPrimary: true });
  return success(res, { cv }, 'تم التعيين');
};

// ════════════════════════════════════════════════════════════
// DELETE /api/v1/cvs/:id
// ════════════════════════════════════════════════════════════
exports.deleteCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id: req.params.id, userId: req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(() => {});
  await cv.destroy();
  return success(res, {}, 'تم الحذف');
};

// ════════════════════════════════════════════════════════════
// POST /api/v1/cvs/build — AI section builder (PRO only)
// ════════════════════════════════════════════════════════════
exports.buildSection = async (req, res) => {
  const isPro = ['pro','elite'].includes(req.user.planKey || 'free');
  if (!isPro) return error(res, 'بناء الأقسام بالـ AI للباقة Pro فقط', 403);
  const { section, targetRole, userData, language } = req.body;
  if (!section) return error(res, 'يرجى تحديد القسم', 400);
  const content = await aiSvc.buildCVSection({ section, targetRole, userData, language });
  return success(res, { content });
};
exports.buildCVSection = exports.buildSection;

// ════════════════════════════════════════════════════════════
// POST /api/v1/cvs/generate-pdf
// ════════════════════════════════════════════════════════════
// exports.generatePDF = async (req, res) => {
//   const { html, cvId } = req.body;
//   if (!html) return error(res, 'يرجى إرسال HTML', 400);

//   // ── Try html-pdf-node first (lighter, works on Mac M1/M2) ─
//   // Install: npm install html-pdf-node
//   let pdfBuffer;
//   try {
//     const htmlPdf = require('html-pdf-node');
//     const file    = { content: html };
//     const options = {
//       format: 'A4',
//       margin: { top: '12mm', bottom: '12mm', left: '12mm', right: '12mm' },
//       printBackground: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
//     };
//     pdfBuffer = await htmlPdf.generatePdf(file, options);
//   } catch (htmlPdfErr) {
//     // ── Fallback: try Puppeteer ───────────────────────────────
//     logger.warn('html-pdf-node failed, trying puppeteer:', htmlPdfErr.message);
//     try {
//       const puppeteer = require('puppeteer');
//       const browser   = await puppeteer.launch({
//         headless: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
//       });
//       const page = await browser.newPage();
//       await page.setRequestInterception(true);
//       page.on('request', r => {
//         if (['font','image','media'].includes(r.resourceType())) r.abort();
//         else r.continue();
//       });
//       await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
//       pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top:'12mm', bottom:'12mm', left:'12mm', right:'12mm' } });
//       await browser.close();
//     } catch (puppeteerErr) {
//       logger.error('Both PDF generators failed:', puppeteerErr.message);
//       return error(res, 'فشل إنشاء PDF — يرجى المحاولة لاحقاً', 500);
//     }
//   }

//   // ── Upload to R2 ──────────────────────────────────────────
//   const { key, url } = await storageSvc.upload({
//     buffer:       pdfBuffer,
//     mimetype:     'application/pdf',
//     originalname: `cv-${req.user.id}-${Date.now()}.pdf`,
//     folder:       'generated-cvs',
//     type:         'cv',
//   });

//   if (cvId) {
//     const existing = await CV.findOne({ where: { id: cvId, userId: req.user.id } });
//     if (existing) {
//       if (existing.fileKey) await storageSvc.remove(existing.fileKey).catch(() => {});
//       await existing.update({ fileUrl: url, fileKey: key, fileType: 'pdf', fileSize: pdfBuffer.length });
//       return success(res, { downloadUrl: url, cv: existing });
//     }
//   }

//   return success(res, { downloadUrl: url }, 'تم إنشاء PDF', 201);
// };
// ════════════════════════════════════════════════════════════
// PATCH — replace the generatePDF export in cv.controller.js
// Fixes: Puppeteer headless deprecation + html-pdf-node failure
// ════════════════════════════════════════════════════════════

// exports.generatePDF = async (req, res) => {
//   const { html, cvId } = req.body;
//   if (!html) return error(res, 'يرجى إرسال HTML', 400);

//   let pdfBuffer;

//   // ── Try html-pdf-node first (lighter) ─────────────────────
//   try {
//     const htmlPdf = require('html-pdf-node');
//     pdfBuffer = await htmlPdf.generatePdf(
//       { content: html },
//       {
//         format: 'A4',
//         margin: { top: '0', bottom: '0', left: '0', right: '0' },
//         printBackground: true,
//         args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
//       }
//     );
//   } catch (htmlPdfErr) {
//     logger.warn('html-pdf-node failed, trying puppeteer:', htmlPdfErr.message);

//     // ── Fallback: Puppeteer with new headless mode ─────────
//     try {
//       const puppeteer = require('puppeteer');
//       const browser = await puppeteer.launch({
//         headless: 'new',   // ← fixes the deprecation warning
//         args: [
//           '--no-sandbox',
//           '--disable-setuid-sandbox',
//           '--disable-dev-shm-usage',
//           '--disable-gpu',
//           '--disable-extensions',
//           '--single-process',           // helps on low-memory servers
//         ],
//         timeout: 30000,
//       });

//       const page = await browser.newPage();
//       await page.setViewport({ width: 794, height: 1123 });

//       // Block unnecessary resources for speed
//       await page.setRequestInterception(true);
//       page.on('request', r => {
//         if (['font', 'image', 'media', 'stylesheet'].includes(r.resourceType())) r.abort();
//         else r.continue();
//       });

//       await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 25000 });

//       pdfBuffer = await page.pdf({
//         format: 'A4',
//         printBackground: true,
//         margin: { top: '0', bottom: '0', left: '0', right: '0' },
//         preferCSSPageSize: false,
//       });

//       await browser.close();
//     } catch (puppeteerErr) {
//       logger.error('Both PDF generators failed:', puppeteerErr.message);
//       return error(res, 'فشل إنشاء PDF — يرجى المحاولة لاحقاً', 500);
//     }
//   }

//   // ── Upload to R2 ──────────────────────────────────────────
//   const { key, url } = await storageSvc.upload({
//     buffer:       pdfBuffer,
//     mimetype:     'application/pdf',
//     originalname: `cv-${req.user.id}-${Date.now()}.pdf`,
//     folder:       'generated-cvs',
//     type:         'cv',
//   });

//   if (cvId) {
//     const existing = await CV.findOne({ where: { id: cvId, userId: req.user.id } });
//     if (existing) {
//       if (existing.fileKey) await storageSvc.remove(existing.fileKey).catch(() => {});
//       await existing.update({
//         fileUrl:  url,
//         fileKey:  key,
//         fileType: 'pdf',
//         fileSize: pdfBuffer.length,
//       });
//       return success(res, { downloadUrl: url, cv: existing });
//     }
//   }

//   return success(res, { downloadUrl: url }, 'تم إنشاء PDF', 201);
// };

// ════════════════════════════════════════════════════════════
// REPLACE exports.generatePDF in cv.controller.js
// ════════════════════════════════════════════════════════════
// This endpoint is now ONLY called from the Download modal.
// Save & Analyze no longer calls it at all.
// ════════════════════════════════════════════════════════════

exports.generatePDF = async (req, res) => {
  const { html, cvId } = req.body;
  if (!html) return error(res, 'يرجى إرسال HTML', 400);

  let pdfBuffer = null;

  // ── Attempt 1: html-pdf-node ──────────────────────────────
  try {
    const htmlPdf = require('html-pdf-node');
    pdfBuffer = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('html-pdf-node timeout')), 15000);
      htmlPdf.generatePdf(
        { content: html },
        {
          format: 'A4',
          margin: { top: '0', bottom: '0', left: '0', right: '0' },
          printBackground: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        }
      ).then(buf => { clearTimeout(timer); resolve(buf); })
       .catch(err => { clearTimeout(timer); reject(err); });
    });
  } catch (e1) {
    logger.warn('html-pdf-node failed:', e1.message);

    // ── Attempt 2: Puppeteer (new headless) ──────────────────
    try {
      const puppeteer = require('puppeteer');
      const browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--single-process',
          '--no-zygote',
        ],
        timeout: 30000,
      });
      const page = await browser.newPage();
      await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1 });
      await page.setRequestInterception(true);
      page.on('request', r => {
        if (['image', 'media', 'font'].includes(r.resourceType())) r.abort();
        else r.continue();
      });
      await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
      pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', bottom: '0', left: '0', right: '0' },
      });
      await browser.close();
    } catch (e2) {
      logger.error('Puppeteer also failed:', e2.message);
      // ── Attempt 3: Return error so frontend falls back to client-side jsPDF
      return error(res, 'PDF_SERVER_UNAVAILABLE', 503);
    }
  }

  // ── Upload to storage ─────────────────────────────────────
  try {
    const { key, url } = await storageSvc.upload({
      buffer:       pdfBuffer,
      mimetype:     'application/pdf',
      originalname: `cv-${req.user.id}-${Date.now()}.pdf`,
      folder:       'generated-cvs',
      type:         'cv',
    });

    if (cvId) {
      const existing = await CV.findOne({ where: { id: cvId, userId: req.user.id } });
      if (existing) {
        if (existing.fileKey) await storageSvc.remove(existing.fileKey).catch(() => {});
        await existing.update({ fileUrl: url, fileKey: key, fileType: 'pdf', fileSize: pdfBuffer.length });
        return success(res, { downloadUrl: url, cv: existing });
      }
    }
    return success(res, { downloadUrl: url }, 'تم إنشاء PDF', 201);
  } catch (storageErr) {
    logger.error('Storage upload failed:', storageErr.message);
    return error(res, 'فشل رفع الملف', 500);
  }
};
// ════════════════════════════════════════════════════════════
// ADD THIS BLOCK to the bottom of cv.controller.js
// (before module.exports if you use that pattern,
//  or just append — it uses exports.saveCV)
// ════════════════════════════════════════════════════════════

// POST /api/v1/cvs/save
// ════════════════════════════════════════════════════════════
// يحفظ بيانات CV + يُنشئ PDF جديد + يرفعه R2 + يُحدّث fileKey
// هكذا الـ fileKey دائماً = آخر PDF حفظه المستخدم
// وعند إرسال الـ CV بالإيميل يُرسَل الملف المحدّث
// ════════════════════════════════════════════════════════════
exports.saveCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, builderData, template, language, html } = req.body;

    // ── 1. جلب أو إنشاء الـ CV record ──────────────────────
    let cv = await CV.findOne({
      where: { userId },
      order: [['created_at', 'DESC']],
    });

    const mergedBuilder = {
      ...(cv?.builderData || {}),
      ...(builderData    || {}),
      ...(template ? { template } : {}),
    };

    if (cv) {
      await cv.update({
        builderData: mergedBuilder,
        ...(template && { template }),
        ...(language  && { language }),
      });
    } else {
      cv = await CV.create({
        userId,
        title:       title || 'My CV',
        builderData: mergedBuilder,
        template:    template || 'minimal',
        language:    language || 'ar',
        isPrimary:   true,
      });
    }

    // ── 2. توليد PDF من الـ HTML إذا أُرسِل ────────────────
    // الـ html يُرسَل من الـ frontend (renderTemplate)
    if (html && html.trim().length > 100) {
      let pdfBuffer = null;

      // Attempt 1: html-pdf-node
      try {
        const htmlPdf = require('html-pdf-node');
        pdfBuffer = await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('timeout')), 20000);
          htmlPdf.generatePdf(
            { content: html },
            {
              format: 'A4',
              printBackground: true,
              margin: { top: '0', bottom: '0', left: '0', right: '0' },
              args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            }
          ).then(buf => { clearTimeout(timer); resolve(buf); })
           .catch(err => { clearTimeout(timer); reject(err); });
        });
      } catch (e1) {
        logger.warn('saveCV html-pdf-node failed:', e1.message);

        // Attempt 2: Puppeteer
        try {
          const puppeteer = require('puppeteer');
          const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process'],
            timeout: 30000,
          });
          const page = await browser.newPage();
          await page.setViewport({ width: 794, height: 1123 });
          await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 20000 });
          pdfBuffer = await page.pdf({
            format: 'A4', printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' },
          });
          await browser.close();
        } catch (e2) {
          logger.error('saveCV puppeteer also failed:', e2.message);
          // نكمل الحفظ بدون PDF — الـ builderData محفوظ على الأقل
        }
      }

      // ── 3. ارفع الـ PDF الجديد لـ R2 ─────────────────────
      if (pdfBuffer && pdfBuffer.length > 0) {
        try {
          // احذف الملف القديم أولاً
          if (cv.fileKey) {
            await storageSvc.remove(cv.fileKey).catch(() => {});
          }

          const { key, url } = await storageSvc.upload({
            buffer:       pdfBuffer,
            mimetype:     'application/pdf',
            originalname: `cv-${userId}-${Date.now()}.pdf`,
            folder:       'generated-cvs',
            type:         'cv',
          });

          // حدّث الـ fileKey في DB
          await cv.update({
            fileUrl:  url,
            fileKey:  key,
            fileType: 'pdf',
            fileSize: pdfBuffer.length,
            status:   'generated',
          });

          logger.info(`saveCV: PDF generated & uploaded (${pdfBuffer.length} bytes) → ${key}`);
        } catch (storageErr) {
          logger.error('saveCV: storage upload failed:', storageErr.message);
          // الحفظ نجح — فقط الـ PDF ما اتحدّث
        }
      }
    }

    // أعد قراءة الـ cv بعد التحديثات
    const updatedCv = await CV.findByPk(cv.id);
    return success(res, { cv: updatedCv, id: updatedCv.id }, 'تم الحفظ بنجاح');

  } catch (err) {
    logger.error('saveCV error:', err.message);
    return error(res, err.message || 'فشل الحفظ', 500);
  }
};