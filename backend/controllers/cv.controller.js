

// 'use strict';

// const { CV, User, TokenUsage } = require('../models');
// const aiSvc                    = require('../services/ai.service');
// const storageSvc               = require('../services/storage.service');
// const { getSetting }           = require('../services/settings.service');
// const { success, error }       = require('../utils/apiResponse');
// const logger                   = require('../utils/logger');
// const pdfParse                 = require('pdf-parse');
// const mammoth                  = require('mammoth');
// const { Op }                   = require('sequelize');

// // ════════════════════════════════════════════════════════════
// // CV PLAN CONFIG
// // ════════════════════════════════════════════════════════════
// const DEFAULT_CV_PLAN_CONFIG = {
//   free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
//   pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
//   elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
// };

// const getCVPlanConfig = async () => {
//   try {
//     const row = await getSetting('cv_plan_config');
//     if (row) return typeof row === 'object' ? row : JSON.parse(row);
//   } catch {}
//   return DEFAULT_CV_PLAN_CONFIG;
// };

// const getEffectivePlan = (user) => {
//   if (['admin', 'support'].includes(user.role)) return 'elite';
//   if (!user.planExpiresAt || new Date(user.planExpiresAt) > new Date()) return user.planKey || 'free';
//   return 'free';
// };

// // ════════════════════════════════════════════════════════════
// // LANGUAGE DETECTION
// // ════════════════════════════════════════════════════════════
// const detectLanguage = (text = '') => {
//   const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
//   const totalChars  = text.replace(/\s/g, '').length;
//   if (totalChars === 0) return 'en';
//   return (arabicChars / totalChars) > 0.15 ? 'ar' : 'en';
// };

// // ════════════════════════════════════════════════════════════
// // TEXT EXTRACTION — never throws, always returns string
// // ════════════════════════════════════════════════════════════
// const extractText = async (buffer, mimetype) => {
//   try {
//     if (mimetype === 'application/pdf') {
//       const data = await pdfParse(buffer);
//       return data.text || '';
//     }
//     if (mimetype.includes('wordprocessingml') || mimetype.includes('msword')) {
//       const { value } = await mammoth.extractRawText({ buffer });
//       return value || '';
//     }
//     return '';
//   } catch (e) {
//     logger.warn('[CV] extractText failed:', e.message);
//     return ''; // ✅ never throw — return empty string
//   }
// };

// // ════════════════════════════════════════════════════════════
// // BASIC PARSER — works even on empty text
// // ════════════════════════════════════════════════════════════
// const parseBasic = (text = '') => {
//   const lines         = text.split('\n').map(l => l.trim()).filter(Boolean);
//   const emailMatch    = text.match(/[\w.-]+@[\w.-]+\.\w+/);
//   const phoneMatch    = text.match(/(\+?[\d\s\-().]{8,15})/);
//   const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
//   const summaryIdx    = lines.findIndex(l => /summary|profile|نبذة|ملخص|objective/i.test(l));
//   const skillsIdx     = lines.findIndex(l => /^skills|^مهارات|technical skills/i.test(l));
//   const expIdx        = lines.findIndex(l => /experience|خبرات|work history/i.test(l));
//   const eduIdx        = lines.findIndex(l => /education|تعليم|qualification/i.test(l));

//   const experiences = [];
//   if (expIdx > -1) {
//     const block = lines.slice(expIdx + 1, eduIdx > expIdx ? eduIdx : expIdx + 20);
//     let current = null;
//     block.forEach(l => {
//       if (l.length > 5 && l.length < 80 && !l.startsWith('•') && !l.startsWith('-')) {
//         if (current) experiences.push(current);
//         current = { title: l, company: '', startDate: '', endDate: '', current: false, description: '' };
//       } else if (current && (l.startsWith('•') || l.startsWith('-'))) {
//         current.description += (current.description ? '\n' : '') + l;
//       }
//     });
//     if (current) experiences.push(current);
//   }

//   const education = [];
//   if (eduIdx > -1) {
//     const block = lines.slice(eduIdx + 1, eduIdx + 15);
//     block.forEach(l => {
//       if (/bachelor|master|bsc|ba |b\.s|بكالوريوس|ماجستير|دبلوم|diploma/i.test(l)) {
//         education.push({ institution: '', degree: l, field: '', year: '' });
//       } else if (/university|college|جامعة|كلية/i.test(l) && education.length > 0) {
//         education[education.length - 1].institution = l;
//       } else if (/\d{4}/.test(l) && education.length > 0) {
//         const m = l.match(/\d{4}/);
//         if (m) education[education.length - 1].year = m[0];
//       }
//     });
//   }

//   return {
//     fullName:       lines[0] || '',
//     headline:       lines[1] || '',
//     email:          emailMatch    ? emailMatch[0]                 : '',
//     phone:          phoneMatch    ? phoneMatch[0].trim()          : '',
//     linkedin:       linkedinMatch ? `https://${linkedinMatch[0]}` : '',
//     location:       '',
//     summary:        summaryIdx > -1 ? lines.slice(summaryIdx+1, summaryIdx+5).filter(l=>l.length>20).join(' ') : '',
//     skills:         skillsIdx  > -1 ? lines.slice(skillsIdx+1, skillsIdx+20).filter(l=>l.length<120).join(', ') : '',
//     languages:      '',
//     certifications: '',
//     experiences:    experiences.length > 0 ? experiences : [{ title:'',company:'',startDate:'',endDate:'',current:false,description:'' }],
//     education:      education.length   > 0 ? education   : [{ institution:'',degree:'',field:'',year:'' }],
//   };
// };

// // ════════════════════════════════════════════════════════════
// // ALGORITHM ATS ANALYSIS
// // ════════════════════════════════════════════════════════════
// const SKILL_DICT = {
//   frontend:  ['react','vue','angular','next.js','html','css','tailwind','javascript','typescript'],
//   backend:   ['node.js','express','python','django','flask','java','spring','php','laravel'],
//   database:  ['sql','mysql','postgresql','mongodb','firebase','redis','sequelize'],
//   devops:    ['docker','kubernetes','aws','azure','gcp','ci/cd','jenkins','linux'],
//   mobile:    ['react native','flutter','swift','kotlin','android','ios'],
//   soft:      ['leadership','management','communication','teamwork','agile','scrum'],
// };
// const ACTION_VERBS = ['managed','led','developed','implemented','analyzed','designed','built','created','improved','reduced','increased','delivered','launched','optimized','automated'];

// const detectSkillsFromText = (text) => {
//   const t = text.toLowerCase();
//   const found = [];
//   Object.values(SKILL_DICT).flat().forEach(s => { if (t.includes(s.toLowerCase())) found.push(s); });
//   return [...new Set(found)];
// };

// const algorithmAnalysis = (text, lang = 'en') => {
//   const t  = (text || '').toLowerCase();
//   const wc = t.split(/\s+/).filter(Boolean).length;
//   const has = {
//     summary:        /summary|profile|نبذة|ملخص|objective|about me/i.test(t),
//     experience:     /experience|خبرة|عمل|worked|employment|intern/i.test(t),
//     education:      /education|تعليم|بكالوريوس|bachelor|master|university|جامعة/i.test(t),
//     skills:         /skills|مهارات|competencies|technical/i.test(t),
//     contact:        /email|phone|هاتف|بريد|linkedin|tel:|mobile/i.test(t),
//     achievements:   /achieved|award|إنجاز|جائزة|accomplished/i.test(t),
//     numbers:        /\d+%|\d+k|\d+ years|\d+ سنوات|\d+\+/.test(text),
//     keywords:       ACTION_VERBS.some(v => t.includes(v)),
//     linkedin:       /linkedin\.com/i.test(t),
//     certifications: /certif|شهادة|certified|license|diploma/i.test(t),
//   };
//   const tooShort = wc < 150, tooLong = wc > 800;
//   const scores = {
//     formatting: Math.min(100,(has.contact?20:0)+(has.summary?20:0)+(has.experience?20:0)+(has.education?20:0)+(has.skills?10:0)+(has.linkedin?10:0)),
//     keywords:   Math.min(100,(has.keywords?35:5)+(has.numbers?30:0)+(has.achievements?25:0)+(has.certifications?10:0)),
//     experience: Math.min(100,has.experience?(has.numbers?85:has.keywords?65:45):20),
//     education:  Math.min(100,has.education?80:35),
//     skills:     Math.min(100,has.skills?75:25),
//     clarity:    Math.min(100,tooShort?25:tooLong?50:85),
//   };
//   const overallScore = Math.round(scores.formatting*0.20+scores.keywords*0.25+scores.experience*0.25+scores.education*0.15+scores.skills*0.10+scores.clarity*0.05);
//   const improvements = [];
//   if (!has.summary)  improvements.push({priority:'high',   section:'summary',   issue:lang==='ar'?'لا يوجد ملخص مهني':'No professional summary',   fix:lang==='ar'?'أضف ملخصاً من 3-4 جمل':'Add 3-4 sentence summary'});
//   if (!has.numbers)  improvements.push({priority:'high',   section:'experience',issue:lang==='ar'?'لا توجد أرقام':'No measurable results',           fix:lang==='ar'?'أضف أرقاماً: "وفّرت 40%"':'Add numbers: "saved 40%"'});
//   if (!has.keywords) improvements.push({priority:'high',   section:'keywords',  issue:lang==='ar'?'لا توجد أفعال قوية':'Missing action verbs',       fix:lang==='ar'?'ابدأ بأفعال: قدت، طورت':'Use: led, developed'});
//   if (!has.skills)   improvements.push({priority:'medium', section:'skills',    issue:lang==='ar'?'قسم المهارات ضعيف':'Skills section weak',         fix:lang==='ar'?'أضف مهارات تقنية':'Add technical skills'});
//   if (!has.contact)  improvements.push({priority:'high',   section:'contact',   issue:lang==='ar'?'معلومات التواصل ناقصة':'Contact info missing',    fix:lang==='ar'?'أضف البريد والهاتف':'Add email, phone'});
//   if (!has.linkedin) improvements.push({priority:'medium', section:'contact',   issue:lang==='ar'?'LinkedIn غير مضمّن':'LinkedIn not included',       fix:lang==='ar'?'أضف رابط LinkedIn':'Add LinkedIn URL'});
//   if (tooShort)      improvements.push({priority:'high',   section:'content',   issue:lang==='ar'?'المحتوى قليل':'Very little content',              fix:lang==='ar'?'أضف تفاصيل لكل وظيفة':'Add details for each job'});
//   return {
//     isFree:true, overallScore, atsScore:overallScore, scores,
//     detectedSkills:    detectSkillsFromText(text),
//     missingKeywords:   Object.values(SKILL_DICT).flat().filter(s=>!t.includes(s)).slice(0,6),
//     suggestedKeywords: ACTION_VERBS.filter(v=>!t.includes(v)).slice(0,8),
//     strengths:[
//       ...(has.experience?[lang==='ar'?'يوجد قسم خبرة':'Clear experience section']:[]),
//       ...(has.education?[lang==='ar'?'يوجد قسم تعليم':'Education section present']:[]),
//       ...(has.skills?[lang==='ar'?'يوجد قسم مهارات':'Skills section present']:[]),
//       ...(has.numbers?[lang==='ar'?'يوجد أرقام وإنجازات':'Measurable results']:[]),
//       ...(has.certifications?[lang==='ar'?'يوجد شهادات':'Certifications present']:[]),
//       ...(has.linkedin?[lang==='ar'?'LinkedIn مضمّن':'LinkedIn included']:[]),
//     ].slice(0,4),
//     improvements:improvements.slice(0,6),
//     summary:overallScore>=80?(lang==='ar'?'✅ سيرتك ممتازة وجاهزة للتقديم.':'✅ Excellent CV, ready to apply.'):overallScore>=60?(lang==='ar'?'⚠️ سيرتك جيدة لكن تحتاج تحسينات.':'⚠️ Good CV but needs improvements.'):(lang==='ar'?'❌ سيرتك تحتاج تحسينات مهمة.':'❌ CV needs important improvements.'),
//   };
// };

// // ════════════════════════════════════════════════════════════
// // TRACK USAGE
// // ════════════════════════════════════════════════════════════
// // const trackUsage = async (userId, model = 'algorithm') => {
// //   try {
// //     await TokenUsage.create({ userId, feature:'cv_analysis', status:'success', model, inputTokens:0, outputTokens:0, cost:0 });
// //   } catch (e) { logger.warn('[CV] track usage failed:', e.message); }
// // };

// // const trackUsage = async (userId, model = 'algorithm') => {
// //   try {
// //     const { sequelize } = require('../models');
// //     await sequelize.query(`
// //       INSERT INTO token_usage (id, user_id, feature, status, model, input_tokens, output_tokens, cost, created_at, updated_at)
// //       VALUES (gen_random_uuid(), :userId, 'cv_analysis', 'success', :model, 0, 0, 0, NOW(), NOW())
// //     `, { replacements: { userId, model }, type: sequelize.QueryTypes.INSERT });
// //   } catch (e) { logger.warn('[CV] track usage failed:', e.message); }
// // };

// const trackUsage = async (userId, model = 'algorithm') => {
//   try {
//     await TokenUsage.create({
//       userId,
//       feature:       'cv_analysis',
//       status:        'success',
//       model,
//       inputTokens:   0,
//       outputTokens:  0,
//       totalTokens:   0,
//       estimatedCost: 0,    // ✅ صح — مش cost
//     });
//   } catch (e) { logger.warn('[CV] track usage failed:', e.message); }
// };

// const getUsageCounts = async (userId) => {
//   const today      = new Date(); today.setHours(0,0,0,0);
//   const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
//   let todayCount = 0, monthCount = 0;
//   try {
//     // ✅ استخدام timestamp بدل created_at — موجود في الـ model
//     todayCount  = await TokenUsage.count({
//       where: { userId, feature: 'cv_analysis', timestamp: { [Op.gte]: today } }
//     });
//     monthCount  = await TokenUsage.count({
//       where: { userId, feature: 'cv_analysis', timestamp: { [Op.gte]: monthStart } }
//     });
//   } catch (e) { logger.warn('[CV] getUsageCounts failed:', e.message); }
//   return { todayCount, monthCount };
// };

// // ════════════════════════════════════════════════════════════
// // GET USAGE COUNTS
// // ════════════════════════════════════════════════════════════
// // const getUsageCounts = async (userId) => {
// //   const today      = new Date(); today.setHours(0,0,0,0);
// //   const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
// //   let todayCount = 0, monthCount = 0;
// //   try {
// //     const { sequelize } = require('../models');
// //     const results = await sequelize.query(`
// //       SELECT
// //         COUNT(CASE WHEN created_at >= :today THEN 1 END)::int as today_count,
// //         COUNT(CASE WHEN created_at >= :month_start THEN 1 END)::int as month_count
// //       FROM token_usage
// //       WHERE user_id = :userId AND feature = 'cv_analysis'
// //     `, {
// //       replacements: { userId, today, month_start: monthStart },
// //       type: sequelize.QueryTypes.SELECT,
// //     });
// //     todayCount  = results[0]?.today_count  || 0;
// //     monthCount  = results[0]?.month_count  || 0;
// //   } catch (e) { logger.warn('[CV] getUsageCounts failed:', e.message); }
// //   return { todayCount, monthCount };
// // };

// // ════════════════════════════════════════════════════════════
// // CHECK ANALYSIS LIMITS
// // ════════════════════════════════════════════════════════════
// const checkAnalysisLimit = async (userId, planConfig) => {
//   const { todayCount, monthCount } = await getUsageCounts(userId);
//   if (planConfig.analysisPerDay   > 0 && todayCount  >= planConfig.analysisPerDay)   return { allowed:false, reason:'daily',   used:todayCount,  limit:planConfig.analysisPerDay   };
//   if (planConfig.analysisPerMonth > 0 && monthCount  >= planConfig.analysisPerMonth) return { allowed:false, reason:'monthly', used:monthCount,  limit:planConfig.analysisPerMonth };
//   return { allowed:true, todayCount, monthCount };
// };

// // ════════════════════════════════════════════════════════════
// // PDF HELPER
// // ════════════════════════════════════════════════════════════
// const PDF_MARGIN = { top:'18mm', bottom:'18mm', left:'15mm', right:'15mm' };
// const PDF_ARGS   = ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'];

// const generatePdfBuffer = async (html) => {
//   try {
//     const htmlPdf = require('html-pdf-node');
//     return await new Promise((resolve, reject) => {
//       const timer = setTimeout(() => reject(new Error('timeout')), 20000);
//       htmlPdf.generatePdf({ content: html }, { format:'A4', printBackground:true, margin:PDF_MARGIN, args:PDF_ARGS })
//         .then(buf => { clearTimeout(timer); resolve(buf); })
//         .catch(err => { clearTimeout(timer); reject(err); });
//     });
//   } catch {}
//   try {
//     const puppeteer = require('puppeteer');
//     const browser   = await puppeteer.launch({ headless:'new', args:[...PDF_ARGS,'--disable-gpu','--single-process','--no-zygote'], timeout:30000 });
//     const page      = await browser.newPage();
//     await page.setContent(html, { waitUntil:'domcontentloaded', timeout:20000 });
//     const buf = await page.pdf({ format:'A4', printBackground:true, margin:PDF_MARGIN, displayHeaderFooter:false });
//     await browser.close();
//     return buf;
//   } catch { return null; }
// };

// // ════════════════════════════════════════════════════════════
// // GET /cvs/limits
// // ════════════════════════════════════════════════════════════
// exports.getLimits = async (req, res) => {
//   try {
//     const allConfig  = await getCVPlanConfig();
//     const planKey    = getEffectivePlan(req.user);
//     const planConfig = allConfig[planKey] || allConfig.free;
//     const { todayCount, monthCount } = await getUsageCounts(req.user.id);
//     const cvCount = await CV.count({ where: { userId: req.user.id } });
//     return success(res, { planKey, planConfig, usage:{ today:todayCount, thisMonth:monthCount, cvCount } });
//   } catch (err) { return error(res, err.message, 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /cvs/upload — always replaces old CV
// // ════════════════════════════════════════════════════════════
// exports.uploadAndAnalyze = async (req, res) => {
//   if (!req.file) return error(res, 'يرجى رفع ملف', 400);

//   const userId     = req.user.id;
//   const planKey    = getEffectivePlan(req.user);
//   const allConfig  = await getCVPlanConfig();
//   const planConfig = allConfig[planKey] || allConfig.free;
//   const useAI      = planConfig.useAI;
//   const { title, template = 'classic' } = req.body;

//   // ── ✅ Delete ALL old CVs from R2 + DB ──────────────────
//   try {
//     const oldCVs = await CV.findAll({ where: { userId } });
//     for (const old of oldCVs) {
//       if (old.fileKey) await storageSvc.remove(old.fileKey).catch(() => {});
//       await old.destroy();
//     }
//   } catch (e) { logger.warn('[CV] cleanup old CVs failed:', e.message); }

//   // 1. Upload new file to R2
//   let key, url;
//   try {
//     const result = await storageSvc.uploadCV({ buffer:req.file.buffer, mimetype:req.file.mimetype, originalname:req.file.originalname });
//     key = result.key; url = result.url;
//   } catch (e) {
//     return error(res, 'فشل رفع الملف لـ Cloudflare R2', 500);
//   }

//   // 2. ✅ Extract text — never reject on empty
//   const rawText  = await extractText(req.file.buffer, req.file.mimetype);
//   const safeText = rawText || '';

//   logger.info(`[CV] Extracted ${safeText.length} chars from ${req.file.originalname}`);

//   // 3. Detect language
//   const detectedLang = detectLanguage(safeText);

//   // 4. Parse structure — works on empty text
//   let parsedData = null;
//   if (useAI && safeText.length > 100) {
//     try { parsedData = await aiSvc.extractCVStructure(safeText, { id:userId, email:req.user.email, fullName:req.user.fullName }); } catch {}
//   }
//   if (!parsedData) parsedData = parseBasic(safeText);

//   // 5. Merge with profile
//   const profile = await User.findByPk(userId, { attributes:['fullName','headline','email','phone','locationCity','locationCountry','linkedinUrl'] }).catch(()=>null);
//   const mergedData = {
//     ...parsedData,
//     fullName: profile?.fullName    || parsedData.fullName || '',
//     headline: profile?.headline    || parsedData.headline || '',
//     email:    profile?.email       || parsedData.email    || '',
//     phone:    profile?.phone       || parsedData.phone    || '',
//     location: parsedData.location  || [profile?.locationCity, profile?.locationCountry].filter(Boolean).join(', '),
//     linkedin: profile?.linkedinUrl || parsedData.linkedin || '',
//   };

//   // 6. Analyze
//   let analysis;
//   try {
//     if (useAI && safeText.length > 100) {
//       analysis = { ...(await aiSvc.analyzeCV(safeText,'','',{id:userId,email:req.user.email,fullName:req.user.fullName})), isFree:false };
//     } else {
//       analysis = algorithmAnalysis(safeText, detectedLang);
//     }
//   } catch { analysis = algorithmAnalysis(safeText, detectedLang); }

//   // 7. Track usage (only if not AI)
//   if (!useAI) await trackUsage(userId, 'algorithm');

//   // 8. Save new CV — always primary
//   const cv = await CV.create({
//     userId,
//     title:           title || req.file.originalname.replace(/\.[^.]+$/,''),
//     fileUrl:         url,
//     fileKey:         key,
//     fileType:        req.file.mimetype.includes('pdf') ? 'pdf' : 'docx',
//     fileSize:        req.file.size,
//     rawText:         safeText,
//     parsedContent:   mergedData,
//     analysisData:    analysis,
//     aiFeedback:      analysis,
//     extractedSkills: analysis?.detectedSkills || [],
//     atsScore:        analysis?.atsScore    || null,
//     overallScore:    analysis?.overallScore || null,
//     isAnalyzed:      true,
//     isPrimary:       true,
//     language:        detectedLang,
//     builderData:     { template, ...mergedData },
//   });

//   return success(res, {
//     cv, analysis, parsedData:mergedData, template,
//     detectedLanguage: detectedLang,
//     planConfig: { useAI, templatesAllowed:planConfig.templatesAllowed },
//   }, 'تم رفع السيرة الذاتية وتحليلها بنجاح', 201);
// };

// // ════════════════════════════════════════════════════════════
// // GET /cvs
// // ════════════════════════════════════════════════════════════
// exports.getMyCVs = async (req, res) => {
//   const allConfig  = await getCVPlanConfig();
//   const planKey    = getEffectivePlan(req.user);
//   const planConfig = allConfig[planKey] || allConfig.free;
//   const cvs = await CV.findAll({
//     where: { userId: req.user.id },
//     attributes: { exclude: ['rawText'] },
//     order: [['is_primary','DESC'],['created_at','DESC']],
//   });
//   return success(res, {
//     cvs,
//     planConfig: { maxCVs:planConfig.maxCVs, templatesAllowed:planConfig.templatesAllowed, useAI:planConfig.useAI, analysisPerDay:planConfig.analysisPerDay, analysisPerMonth:planConfig.analysisPerMonth },
//   });
// };

// // ════════════════════════════════════════════════════════════
// // GET /cvs/:id
// // ════════════════════════════════════════════════════════════
// exports.getCV = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   return success(res, { cv });
// };

// // ════════════════════════════════════════════════════════════
// // GET /cvs/:id/download
// // ════════════════════════════════════════════════════════════
// exports.downloadCV = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   const downloadUrl = await storageSvc.getPresignedUrl(cv.fileKey, 3600);
//   return success(res, { downloadUrl });
// };
// exports.getDownloadUrl = exports.downloadCV;

// // ════════════════════════════════════════════════════════════
// // PATCH /cvs/:id
// // ════════════════════════════════════════════════════════════
// exports.updateCV = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   const { title, builderData, template, language, html, setAsAutoApply } = req.body;
//   const updates = {};
//   if (title)       updates.title       = title;
//   if (builderData) updates.builderData = { ...(cv.builderData||{}), ...builderData, ...(template?{template}:{}) };
//   if (template)    updates.template    = template;
//   if (language)    updates.language    = language;
//   if (setAsAutoApply) {
//     const pk = getEffectivePlan(req.user);
//     if (!['pro','elite'].includes(pk)) return error(res, 'التقديم التلقائي للباقة Pro/Elite فقط', 403);
//     const old = await CV.findOne({ where: { userId:req.user.id, isAutoApply:true } });
//     if (old && old.id !== cv.id && old.autoApplyFileKey) {
//       await storageSvc.remove(old.autoApplyFileKey).catch(()=>{});
//       await old.update({ isAutoApply:false, autoApplyFileKey:null });
//     }
//     updates.isAutoApply = true;
//   }
//   await cv.update(updates);
//   if (html && html.trim().length > 100) {
//     const pdfBuffer = await generatePdfBuffer(html);
//     if (pdfBuffer?.length > 0) {
//       try {
//         if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
//         const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${req.user.id}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
//         const pdfUpdates = { fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length, status:'generated' };
//         if (setAsAutoApply) { pdfUpdates.autoApplyFileUrl=url; pdfUpdates.autoApplyFileKey=key; }
//         await cv.update(pdfUpdates);
//       } catch {}
//     }
//   }
//   const updated = await CV.findByPk(cv.id);
//   return success(res, { cv:updated }, 'تم التحديث');
// };

// // ════════════════════════════════════════════════════════════
// // POST /cvs/:id/analyze-free
// // ════════════════════════════════════════════════════════════
// exports.analyzeFree = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   const allConfig  = await getCVPlanConfig();
//   const planKey    = getEffectivePlan(req.user);
//   const planConfig = allConfig[planKey] || allConfig.free;
//   const limitCheck = await checkAnalysisLimit(req.user.id, planConfig);
//   if (!limitCheck.allowed) {
//     return res.status(429).json({ success:false, reason:limitCheck.reason, used:limitCheck.used, limit:limitCheck.limit,
//       message:{ ar:limitCheck.reason==='daily'?`وصلت للحد اليومي (${limitCheck.limit}/يوم).`:`وصلت للحد الشهري (${limitCheck.limit}/شهر).`, en:limitCheck.reason==='daily'?`Daily limit (${limitCheck.limit}/day).`:`Monthly limit (${limitCheck.limit}/month).` } });
//   }
//   const analysis = req.body.localAnalysis || algorithmAnalysis(cv.rawText||'', cv.language||'en');
//   const score    = analysis.overallScore ?? analysis.atsScore;
//   await cv.update({ atsScore:score, analysisData:analysis });
//   await trackUsage(req.user.id, 'algorithm');
//   return success(res, { analysis });
// };
// exports.analyzeForFree = exports.analyzeFree;

// // ════════════════════════════════════════════════════════════
// // POST /cvs/:id/re-analyze
// // ════════════════════════════════════════════════════════════
// exports.reAnalyze = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   const allConfig  = await getCVPlanConfig();
//   const planKey    = getEffectivePlan(req.user);
//   const planConfig = allConfig[planKey] || allConfig.free;
//   const limitCheck = await checkAnalysisLimit(req.user.id, planConfig);
//   if (!limitCheck.allowed) {
//     return res.status(429).json({ success:false, reason:limitCheck.reason, used:limitCheck.used, limit:limitCheck.limit,
//       message:{ ar:limitCheck.reason==='daily'?'وصلت للحد اليومي.':'وصلت للحد الشهري.', en:limitCheck.reason==='daily'?'Daily limit reached.':'Monthly limit reached.' } });
//   }
//   const rawText = cv.rawText || '';
//   let analysis;
//   try {
//     if (planConfig.useAI && rawText.length > 50) {
//       analysis = { ...(await aiSvc.analyzeCV(rawText,'','',{id:req.user.id,email:req.user.email,fullName:req.user.fullName})), isFree:false };
//     } else {
//       analysis = algorithmAnalysis(rawText, cv.language||'en');
//     }
//   } catch { analysis = algorithmAnalysis(rawText, cv.language||'en'); }
//   await cv.update({ analysisData:analysis, aiFeedback:analysis, atsScore:analysis.atsScore, overallScore:analysis.overallScore });
//   // ✅ Only track if NOT AI — AI service tracks itself
//   if (!planConfig.useAI) await trackUsage(req.user.id, 'algorithm');
//   return success(res, { cv, analysis });
// };
// exports.reAnalyzeCV = exports.reAnalyze;

// // ════════════════════════════════════════════════════════════
// // PATCH /cvs/:id/primary
// // ════════════════════════════════════════════════════════════
// exports.setPrimary = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   await CV.update({ isPrimary:false }, { where: { userId:req.user.id } });
//   await cv.update({ isPrimary:true });
//   return success(res, { cv }, 'تم التعيين');
// };

// // ════════════════════════════════════════════════════════════
// // DELETE /cvs/:id
// // ════════════════════════════════════════════════════════════
// exports.deleteCV = async (req, res) => {
//   const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
//   if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
//   if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
//   await cv.destroy();
//   return success(res, {}, 'تم الحذف');
// };

// // ════════════════════════════════════════════════════════════
// // POST /cvs/build
// // ════════════════════════════════════════════════════════════
// exports.buildSection = async (req, res) => {
//   const planKey    = getEffectivePlan(req.user);
//   const allConfig  = await getCVPlanConfig();
//   const planConfig = allConfig[planKey] || allConfig.free;
//   if (!planConfig.useAI) return error(res, 'بناء الأقسام بالـ AI للباقة Pro فقط', 403);
//   const { section, targetRole, userData, language } = req.body;
//   if (!section) return error(res, 'يرجى تحديد القسم', 400);
//   const content = await aiSvc.buildCVSection({ section, targetRole, userData, language, userInfo:{id:req.user.id,email:req.user.email,fullName:req.user.fullName} });
//   return success(res, { content });
// };
// exports.buildCVSection = exports.buildSection;

// // ════════════════════════════════════════════════════════════
// // POST /cvs/generate-pdf
// // ════════════════════════════════════════════════════════════
// exports.generatePDF = async (req, res) => {
//   const { html, cvId } = req.body;
//   if (!html) return error(res, 'يرجى إرسال HTML', 400);
//   const pdfBuffer = await generatePdfBuffer(html);
//   if (!pdfBuffer) return error(res, 'PDF_SERVER_UNAVAILABLE', 503);
//   try {
//     const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${req.user.id}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
//     if (cvId) {
//       const existing = await CV.findOne({ where: { id:cvId, userId:req.user.id } });
//       if (existing) {
//         if (existing.fileKey) await storageSvc.remove(existing.fileKey).catch(()=>{});
//         await existing.update({ fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length });
//         return success(res, { downloadUrl:url, cv:existing });
//       }
//     }
//     return success(res, { downloadUrl:url }, 'تم إنشاء PDF', 201);
//   } catch { return error(res, 'فشل رفع الملف', 500); }
// };

// // ════════════════════════════════════════════════════════════
// // POST /cvs/save
// // ════════════════════════════════════════════════════════════
// exports.saveCV = async (req, res) => {
//   try {
//     const userId     = req.user.id;
//     const allConfig  = await getCVPlanConfig();
//     const planKey    = getEffectivePlan(req.user);
//     const planConfig = allConfig[planKey] || allConfig.free;
//     const { title, builderData, template, language, html } = req.body;
//     let cv = await CV.findOne({ where: { userId }, order: [['created_at','DESC']] });
//     if (!cv) {
//       const cvCount = await CV.count({ where: { userId } });
//       if (cvCount >= planConfig.maxCVs) {
//         return res.status(403).json({ success:false, upgradeRequired:true, message:{ ar:`وصلت للحد الأقصى (${planConfig.maxCVs} سيرة).`, en:`CV limit reached (${planConfig.maxCVs}).` } });
//       }
//     }
//     const mergedBuilder = { ...(cv?.builderData||{}), ...(builderData||{}), ...(template?{template}:{}) };
//     if (cv) { await cv.update({ builderData:mergedBuilder, ...(template&&{template}), ...(language&&{language}) }); }
//     else    { cv = await CV.create({ userId, title:title||'My CV', builderData:mergedBuilder, template:template||'classic', language:language||'ar', isPrimary:true }); }
//     if (html && html.trim().length > 100) {
//       const pdfBuffer = await generatePdfBuffer(html);
//       if (pdfBuffer?.length > 0) {
//         try {
//           if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
//           const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${userId}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
//           await cv.update({ fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length, status:'generated' });
//         } catch {}
//       }
//     }
//     const updatedCv = await CV.findByPk(cv.id);
//     return success(res, { cv:updatedCv, id:updatedCv.id, planConfig:{ maxCVs:planConfig.maxCVs, templatesAllowed:planConfig.templatesAllowed, useAI:planConfig.useAI } }, 'تم الحفظ بنجاح');
//   } catch (err) { logger.error('saveCV error:', err.message); return error(res, err.message||'فشل الحفظ', 500); }
// };

// // ════════════════════════════════════════════════════════════
// // ADMIN
// // ════════════════════════════════════════════════════════════
// exports.adminGetCVConfig = async (req, res) => {
//   const config = await getCVPlanConfig();
//   return success(res, { config, defaults:DEFAULT_CV_PLAN_CONFIG });
// };
// exports.adminUpdateCVConfig = async (req, res) => {
//   const { config } = req.body;
//   if (!config) return error(res, 'config required', 400);
//   const { setSetting } = require('../services/settings.service');
//   await setSetting('cv_plan_config', JSON.stringify(config));
//   return success(res, { config }, 'تم تحديث إعدادات CV ✅');
// };

'use strict';

const { CV, User, TokenUsage } = require('../models');
const aiSvc                    = require('../services/ai.service');
const storageSvc               = require('../services/storage.service');
const { getSetting }           = require('../services/settings.service');
const { success, error }       = require('../utils/apiResponse');
const logger                   = require('../utils/logger');
const pdfParse                 = require('pdf-parse');
const mammoth                  = require('mammoth');
const { Op }                   = require('sequelize');
const { renderTemplateToHtml } = require('../utils/cvTemplateRenderer');

// ════════════════════════════════════════════════════════════
// CV PLAN CONFIG
// ════════════════════════════════════════════════════════════
const DEFAULT_CV_PLAN_CONFIG = {
  free:  { maxCVs: 1, analysisPerDay: 1,  analysisPerMonth: 15, templatesAllowed: 2, useAI: false },
  pro:   { maxCVs: 1, analysisPerDay: 3,  analysisPerMonth: 15, templatesAllowed: 4, useAI: true  },
  elite: { maxCVs: 1, analysisPerDay: 5,  analysisPerMonth: 30, templatesAllowed: 6, useAI: true  },
};

const getCVPlanConfig = async () => {
  try {
    const row = await getSetting('cv_plan_config');
    if (row) return typeof row === 'object' ? row : JSON.parse(row);
  } catch {}
  return DEFAULT_CV_PLAN_CONFIG;
};

const getEffectivePlan = (user) => {
  if (['admin', 'support'].includes(user.role)) return 'elite';
  if (!user.planExpiresAt || new Date(user.planExpiresAt) > new Date()) return user.planKey || 'free';
  return 'free';
};

// ════════════════════════════════════════════════════════════
// LANGUAGE DETECTION
// ════════════════════════════════════════════════════════════
const detectLanguage = (text = '') => {
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars  = text.replace(/\s/g, '').length;
  if (totalChars === 0) return 'en';
  return (arabicChars / totalChars) > 0.15 ? 'ar' : 'en';
};

// ════════════════════════════════════════════════════════════
// TEXT EXTRACTION — never throws, always returns string
// ════════════════════════════════════════════════════════════
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
  } catch (e) {
    logger.warn('[CV] extractText failed:', e.message);
    return '';
  }
};

// ════════════════════════════════════════════════════════════
// BASIC PARSER — works even on empty text
// ════════════════════════════════════════════════════════════
const parseBasic = (text = '') => {
  const lines         = text.split('\n').map(l => l.trim()).filter(Boolean);
  const emailMatch    = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch    = text.match(/(\+?[\d\s\-().]{8,15})/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  const summaryIdx    = lines.findIndex(l => /summary|profile|نبذة|ملخص|objective/i.test(l));
  const skillsIdx     = lines.findIndex(l => /^skills|^مهارات|technical skills/i.test(l));
  const expIdx        = lines.findIndex(l => /experience|خبرات|work history/i.test(l));
  const eduIdx        = lines.findIndex(l => /education|تعليم|qualification/i.test(l));

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
        const m = l.match(/\d{4}/);
        if (m) education[education.length - 1].year = m[0];
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
    summary:        summaryIdx > -1 ? lines.slice(summaryIdx+1, summaryIdx+5).filter(l=>l.length>20).join(' ') : '',
    skills:         skillsIdx  > -1 ? lines.slice(skillsIdx+1, skillsIdx+20).filter(l=>l.length<120).join(', ') : '',
    languages:      '',
    certifications: '',
    experiences:    experiences.length > 0 ? experiences : [{ title:'',company:'',startDate:'',endDate:'',current:false,description:'' }],
    education:      education.length   > 0 ? education   : [{ institution:'',degree:'',field:'',year:'' }],
  };
};

// ════════════════════════════════════════════════════════════
// ALGORITHM ATS ANALYSIS
// ════════════════════════════════════════════════════════════
const SKILL_DICT = {
  frontend:  ['react','vue','angular','next.js','html','css','tailwind','javascript','typescript'],
  backend:   ['node.js','express','python','django','flask','java','spring','php','laravel'],
  database:  ['sql','mysql','postgresql','mongodb','firebase','redis','sequelize'],
  devops:    ['docker','kubernetes','aws','azure','gcp','ci/cd','jenkins','linux'],
  mobile:    ['react native','flutter','swift','kotlin','android','ios'],
  soft:      ['leadership','management','communication','teamwork','agile','scrum'],
};
const ACTION_VERBS = ['managed','led','developed','implemented','analyzed','designed','built','created','improved','reduced','increased','delivered','launched','optimized','automated'];

const detectSkillsFromText = (text) => {
  const t = text.toLowerCase();
  const found = [];
  Object.values(SKILL_DICT).flat().forEach(s => { if (t.includes(s.toLowerCase())) found.push(s); });
  return [...new Set(found)];
};

const algorithmAnalysis = (text, lang = 'en') => {
  const t  = (text || '').toLowerCase();
  const wc = t.split(/\s+/).filter(Boolean).length;
  const has = {
    summary:        /summary|profile|نبذة|ملخص|objective|about me/i.test(t),
    experience:     /experience|خبرة|عمل|worked|employment|intern/i.test(t),
    education:      /education|تعليم|بكالوريوس|bachelor|master|university|جامعة/i.test(t),
    skills:         /skills|مهارات|competencies|technical/i.test(t),
    contact:        /email|phone|هاتف|بريد|linkedin|tel:|mobile/i.test(t),
    achievements:   /achieved|award|إنجاز|جائزة|accomplished/i.test(t),
    numbers:        /\d+%|\d+k|\d+ years|\d+ سنوات|\d+\+/.test(text),
    keywords:       ACTION_VERBS.some(v => t.includes(v)),
    linkedin:       /linkedin\.com/i.test(t),
    certifications: /certif|شهادة|certified|license|diploma/i.test(t),
  };
  const tooShort = wc < 150, tooLong = wc > 800;
  const scores = {
    formatting: Math.min(100,(has.contact?20:0)+(has.summary?20:0)+(has.experience?20:0)+(has.education?20:0)+(has.skills?10:0)+(has.linkedin?10:0)),
    keywords:   Math.min(100,(has.keywords?35:5)+(has.numbers?30:0)+(has.achievements?25:0)+(has.certifications?10:0)),
    experience: Math.min(100,has.experience?(has.numbers?85:has.keywords?65:45):20),
    education:  Math.min(100,has.education?80:35),
    skills:     Math.min(100,has.skills?75:25),
    clarity:    Math.min(100,tooShort?25:tooLong?50:85),
  };
  const overallScore = Math.round(scores.formatting*0.20+scores.keywords*0.25+scores.experience*0.25+scores.education*0.15+scores.skills*0.10+scores.clarity*0.05);
  const improvements = [];
  if (!has.summary)  improvements.push({priority:'high',   section:'summary',   issue:lang==='ar'?'لا يوجد ملخص مهني':'No professional summary',   fix:lang==='ar'?'أضف ملخصاً من 3-4 جمل':'Add 3-4 sentence summary'});
  if (!has.numbers)  improvements.push({priority:'high',   section:'experience',issue:lang==='ar'?'لا توجد أرقام':'No measurable results',           fix:lang==='ar'?'أضف أرقاماً: "وفّرت 40%"':'Add numbers: "saved 40%"'});
  if (!has.keywords) improvements.push({priority:'high',   section:'keywords',  issue:lang==='ar'?'لا توجد أفعال قوية':'Missing action verbs',       fix:lang==='ar'?'ابدأ بأفعال: قدت، طورت':'Use: led, developed'});
  if (!has.skills)   improvements.push({priority:'medium', section:'skills',    issue:lang==='ar'?'قسم المهارات ضعيف':'Skills section weak',         fix:lang==='ar'?'أضف مهارات تقنية':'Add technical skills'});
  if (!has.contact)  improvements.push({priority:'high',   section:'contact',   issue:lang==='ar'?'معلومات التواصل ناقصة':'Contact info missing',    fix:lang==='ar'?'أضف البريد والهاتف':'Add email, phone'});
  if (!has.linkedin) improvements.push({priority:'medium', section:'contact',   issue:lang==='ar'?'LinkedIn غير مضمّن':'LinkedIn not included',       fix:lang==='ar'?'أضف رابط LinkedIn':'Add LinkedIn URL'});
  if (tooShort)      improvements.push({priority:'high',   section:'content',   issue:lang==='ar'?'المحتوى قليل':'Very little content',              fix:lang==='ar'?'أضف تفاصيل لكل وظيفة':'Add details for each job'});
  return {
    isFree:true, overallScore, atsScore:overallScore, scores,
    detectedSkills:    detectSkillsFromText(text),
    missingKeywords:   Object.values(SKILL_DICT).flat().filter(s=>!t.includes(s)).slice(0,6),
    suggestedKeywords: ACTION_VERBS.filter(v=>!t.includes(v)).slice(0,8),
    strengths:[
      ...(has.experience?[lang==='ar'?'يوجد قسم خبرة':'Clear experience section']:[]),
      ...(has.education?[lang==='ar'?'يوجد قسم تعليم':'Education section present']:[]),
      ...(has.skills?[lang==='ar'?'يوجد قسم مهارات':'Skills section present']:[]),
      ...(has.numbers?[lang==='ar'?'يوجد أرقام وإنجازات':'Measurable results']:[]),
      ...(has.certifications?[lang==='ar'?'يوجد شهادات':'Certifications present']:[]),
      ...(has.linkedin?[lang==='ar'?'LinkedIn مضمّن':'LinkedIn included']:[]),
    ].slice(0,4),
    improvements:improvements.slice(0,6),
    summary:overallScore>=80?(lang==='ar'?'✅ سيرتك ممتازة وجاهزة للتقديم.':'✅ Excellent CV, ready to apply.'):overallScore>=60?(lang==='ar'?'⚠️ سيرتك جيدة لكن تحتاج تحسينات.':'⚠️ Good CV but needs improvements.'):(lang==='ar'?'❌ سيرتك تحتاج تحسينات مهمة.':'❌ CV needs important improvements.'),
  };
};

// ════════════════════════════════════════════════════════════
// TRACK USAGE
// ════════════════════════════════════════════════════════════
const trackUsage = async (userId, model = 'algorithm') => {
  try {
    await TokenUsage.create({
      userId, feature:'cv_analysis', status:'success', model,
      inputTokens:0, outputTokens:0, totalTokens:0, estimatedCost:0,
    });
  } catch (e) { logger.warn('[CV] track usage failed:', e.message); }
};

const getUsageCounts = async (userId) => {
  const today      = new Date(); today.setHours(0,0,0,0);
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  let todayCount = 0, monthCount = 0;
  try {
    todayCount  = await TokenUsage.count({ where: { userId, feature: 'cv_analysis', timestamp: { [Op.gte]: today } } });
    monthCount  = await TokenUsage.count({ where: { userId, feature: 'cv_analysis', timestamp: { [Op.gte]: monthStart } } });
  } catch (e) { logger.warn('[CV] getUsageCounts failed:', e.message); }
  return { todayCount, monthCount };
};

// ════════════════════════════════════════════════════════════
// CHECK ANALYSIS LIMITS
// ════════════════════════════════════════════════════════════
const checkAnalysisLimit = async (userId, planConfig) => {
  const { todayCount, monthCount } = await getUsageCounts(userId);
  if (planConfig.analysisPerDay   > 0 && todayCount  >= planConfig.analysisPerDay)   return { allowed:false, reason:'daily',   used:todayCount,  limit:planConfig.analysisPerDay   };
  if (planConfig.analysisPerMonth > 0 && monthCount  >= planConfig.analysisPerMonth) return { allowed:false, reason:'monthly', used:monthCount,  limit:planConfig.analysisPerMonth };
  return { allowed:true, todayCount, monthCount };
};

// ════════════════════════════════════════════════════════════
// PDF HELPER
// ════════════════════════════════════════════════════════════
const PDF_MARGIN = { top:'18mm', bottom:'18mm', left:'15mm', right:'15mm' };
const PDF_ARGS   = ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'];

const generatePdfBuffer = async (html) => {
  try {
    const htmlPdf = require('html-pdf-node');
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), 20000);
      htmlPdf.generatePdf({ content: html }, { format:'A4', printBackground:true, margin:PDF_MARGIN, args:PDF_ARGS })
        .then(buf => { clearTimeout(timer); resolve(buf); })
        .catch(err => { clearTimeout(timer); reject(err); });
    });
  } catch {}
  try {
    const puppeteer = require('puppeteer');
    const browser   = await puppeteer.launch({ headless:'new', args:[...PDF_ARGS,'--disable-gpu','--single-process','--no-zygote'], timeout:30000 });
    const page      = await browser.newPage();
    await page.setContent(html, { waitUntil:'domcontentloaded', timeout:20000 });
    const buf = await page.pdf({ format:'A4', printBackground:true, margin:PDF_MARGIN, displayHeaderFooter:false });
    await browser.close();
    return buf;
  } catch { return null; }
};

// ════════════════════════════════════════════════════════════
// ✅ NEW: Generate + upload templated PDF to R2, replacing old PDF
// Used at upload time (default template) and whenever the template changes.
// ════════════════════════════════════════════════════════════
const generateAndStoreTemplatedPdf = async (cv, cvData, template, language, userId) => {
  const html = renderTemplateToHtml(cvData, template, language);
  if (!html) return null;

  const pdfBuffer = await generatePdfBuffer(html);
  if (!pdfBuffer || pdfBuffer.length === 0) return null;

  // Delete old PDF from R2 first
  if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(() => {});

  const { key, url } = await storageSvc.upload({
    buffer: pdfBuffer,
    mimetype: 'application/pdf',
    originalname: `cv-${userId}-${Date.now()}.pdf`,
    folder: 'generated-cvs',
    type: 'cv',
  });

  return { key, url, size: pdfBuffer.length };
};

// ════════════════════════════════════════════════════════════
// GET /cvs/limits
// ════════════════════════════════════════════════════════════
exports.getLimits = async (req, res) => {
  try {
    const allConfig  = await getCVPlanConfig();
    const planKey    = getEffectivePlan(req.user);
    const planConfig = allConfig[planKey] || allConfig.free;
    const { todayCount, monthCount } = await getUsageCounts(req.user.id);
    const cvCount = await CV.count({ where: { userId: req.user.id } });
    return success(res, { planKey, planConfig, usage:{ today:todayCount, thisMonth:monthCount, cvCount } });
  } catch (err) { return error(res, err.message, 500); }
};

// ════════════════════════════════════════════════════════════
// POST /cvs/upload
// ✅ Original file (PDF/DOCX) is used ONLY to extract text + parse data.
// It is then DISCARDED — never stored in R2.
// Instead, a PDF is rendered from the default template ('classic')
// and THAT is what's stored in R2 + linked to the CV record.
// ════════════════════════════════════════════════════════════
const DEFAULT_TEMPLATE = 'classic';

exports.uploadAndAnalyze = async (req, res) => {
  if (!req.file) return error(res, 'يرجى رفع ملف', 400);

  const userId     = req.user.id;
  const planKey    = getEffectivePlan(req.user);
  const allConfig  = await getCVPlanConfig();
  const planConfig = allConfig[planKey] || allConfig.free;
  const useAI      = planConfig.useAI;
  const { title } = req.body;
  // ✅ Always start with the default template — original file is never kept
  const template = DEFAULT_TEMPLATE;

  // ── Delete ALL old CVs from R2 + DB ──────────────────
  try {
    const oldCVs = await CV.findAll({ where: { userId } });
    for (const old of oldCVs) {
      if (old.fileKey) await storageSvc.remove(old.fileKey).catch(() => {});
      await old.destroy();
    }
  } catch (e) { logger.warn('[CV] cleanup old CVs failed:', e.message); }

  // 1. ✅ Extract text from the UPLOADED file (in-memory only — never saved to R2)
  const rawText  = await extractText(req.file.buffer, req.file.mimetype);
  const safeText = rawText || '';
  logger.info(`[CV] Extracted ${safeText.length} chars from ${req.file.originalname}`);

  // 2. Detect language
  const detectedLang = detectLanguage(safeText);

  // 3. Parse structure
  let parsedData = null;
  if (useAI && safeText.length > 100) {
    try { parsedData = await aiSvc.extractCVStructure(safeText, { id:userId, email:req.user.email, fullName:req.user.fullName }); } catch {}
  }
  if (!parsedData) parsedData = parseBasic(safeText);

  // 4. Merge with profile
  const profile = await User.findByPk(userId, { attributes:['fullName','headline','email','phone','locationCity','locationCountry','linkedinUrl'] }).catch(()=>null);
  const mergedData = {
    ...parsedData,
    fullName: profile?.fullName    || parsedData.fullName || '',
    headline: profile?.headline    || parsedData.headline || '',
    email:    profile?.email       || parsedData.email    || '',
    phone:    profile?.phone       || parsedData.phone    || '',
    location: parsedData.location  || [profile?.locationCity, profile?.locationCountry].filter(Boolean).join(', '),
    linkedin: profile?.linkedinUrl || parsedData.linkedin || '',
  };

  // 5. Analyze (uses the extracted text, not the file itself)
  let analysis;
  try {
    if (useAI && safeText.length > 100) {
      analysis = { ...(await aiSvc.analyzeCV(safeText,'','',{id:userId,email:req.user.email,fullName:req.user.fullName})), isFree:false };
    } else {
      analysis = algorithmAnalysis(safeText, detectedLang);
    }
  } catch { analysis = algorithmAnalysis(safeText, detectedLang); }

  if (!useAI) await trackUsage(userId, 'algorithm');

  // 6. ✅ Render the DEFAULT TEMPLATE as PDF and upload THAT to R2
  //    (the original uploaded file is discarded — req.file.buffer is never persisted)
  let fileUrl = null, fileKey = null, fileSize = 0;
  try {
    const html = renderTemplateToHtml(mergedData, template, detectedLang);
    const pdfBuffer = await generatePdfBuffer(html);
    if (pdfBuffer?.length > 0) {
      const uploaded = await storageSvc.upload({
        buffer: pdfBuffer,
        mimetype: 'application/pdf',
        originalname: `cv-${userId}-${Date.now()}.pdf`,
        folder: 'generated-cvs',
        type: 'cv',
      });
      fileUrl = uploaded.url;
      fileKey = uploaded.key;
      fileSize = pdfBuffer.length;
    }
  } catch (e) {
    logger.error('[CV] Failed to render default template PDF on upload:', e.message);
  }

  // 7. Save CV record — fileUrl/fileKey point to the TEMPLATED PDF, not the original
  const cv = await CV.create({
    userId,
    title:           title || mergedData.fullName || 'My CV',
    fileUrl,
    fileKey,
    fileType:        'pdf',
    fileSize,
    rawText:         safeText,
    parsedContent:   mergedData,
    analysisData:    analysis,
    aiFeedback:      analysis,
    extractedSkills: analysis?.detectedSkills || [],
    atsScore:        analysis?.atsScore    || null,
    overallScore:    analysis?.overallScore || null,
    isAnalyzed:      true,
    isPrimary:       true,
    language:        detectedLang,
    builderData:     { template, ...mergedData },
  });

  return success(res, {
    cv, analysis, parsedData:mergedData, template,
    detectedLanguage: detectedLang,
    planConfig: { useAI, templatesAllowed:planConfig.templatesAllowed },
  }, 'تم رفع السيرة الذاتية وتحليلها بنجاح', 201);
};

// ════════════════════════════════════════════════════════════
// GET /cvs
// ════════════════════════════════════════════════════════════
exports.getMyCVs = async (req, res) => {
  const allConfig  = await getCVPlanConfig();
  const planKey    = getEffectivePlan(req.user);
  const planConfig = allConfig[planKey] || allConfig.free;
  const cvs = await CV.findAll({
    where: { userId: req.user.id },
    attributes: { exclude: ['rawText'] },
    order: [['is_primary','DESC'],['created_at','DESC']],
  });
  return success(res, {
    cvs,
    planConfig: { maxCVs:planConfig.maxCVs, templatesAllowed:planConfig.templatesAllowed, useAI:planConfig.useAI, analysisPerDay:planConfig.analysisPerDay, analysisPerMonth:planConfig.analysisPerMonth },
  });
};

// ════════════════════════════════════════════════════════════
// GET /cvs/:id
// ════════════════════════════════════════════════════════════
exports.getCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  return success(res, { cv });
};

// ════════════════════════════════════════════════════════════
// GET /cvs/:id/download
// ════════════════════════════════════════════════════════════
exports.downloadCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const downloadUrl = await storageSvc.getPresignedUrl(cv.fileKey, 3600);
  return success(res, { downloadUrl });
};
exports.getDownloadUrl = exports.downloadCV;

// ════════════════════════════════════════════════════════════
// PATCH /cvs/:id
// ✅ When `template` changes, regenerate + replace the stored PDF in R2
// immediately — this is what keeps emails/attachments always up to date.
// ════════════════════════════════════════════════════════════
exports.updateCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const { title, builderData, template, language, html, setAsAutoApply } = req.body;
  const updates = {};
  if (title)       updates.title       = title;
  if (builderData) updates.builderData = { ...(cv.builderData||{}), ...builderData, ...(template?{template}:{}) };
  if (template)    updates.template    = template;
  if (language)    updates.language    = language;
  if (setAsAutoApply) {
    const pk = getEffectivePlan(req.user);
    if (!['pro','elite'].includes(pk)) return error(res, 'التقديم التلقائي للباقة Pro/Elite فقط', 403);
    const old = await CV.findOne({ where: { userId:req.user.id, isAutoApply:true } });
    if (old && old.id !== cv.id && old.autoApplyFileKey) {
      await storageSvc.remove(old.autoApplyFileKey).catch(()=>{});
      await old.update({ isAutoApply:false, autoApplyFileKey:null });
    }
    updates.isAutoApply = true;
  }
  await cv.update(updates);

  // ✅ Priority 1: explicit HTML from the live editor (most accurate render)
  if (html && html.trim().length > 100) {
    const pdfBuffer = await generatePdfBuffer(html);
    if (pdfBuffer?.length > 0) {
      try {
        if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
        const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${req.user.id}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
        const pdfUpdates = { fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length, status:'generated' };
        if (setAsAutoApply) { pdfUpdates.autoApplyFileUrl=url; pdfUpdates.autoApplyFileKey=key; }
        await cv.update(pdfUpdates);
      } catch {}
    }
  }
  // ✅ Priority 2: template changed but no HTML sent (e.g. from Auto-Apply tab
  // template picker) — server renders the template itself and re-uploads.
  else if (template && template !== cv.builderData?.template) {
    try {
      const cvData = { ...(cv.builderData || cv.parsedContent || {}), template };
      const result = await generateAndStoreTemplatedPdf(cv, cvData, template, cv.language || 'en', req.user.id);
      if (result) {
        await cv.update({ fileUrl: result.url, fileKey: result.key, fileType: 'pdf', fileSize: result.size, status: 'generated' });
      }
    } catch (e) {
      logger.error('[CV] Failed to regenerate PDF on template change:', e.message);
    }
  }

  const updated = await CV.findByPk(cv.id);
  return success(res, { cv:updated }, 'تم التحديث');
};

// ════════════════════════════════════════════════════════════
// POST /cvs/:id/analyze-free
// ════════════════════════════════════════════════════════════
exports.analyzeFree = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const allConfig  = await getCVPlanConfig();
  const planKey    = getEffectivePlan(req.user);
  const planConfig = allConfig[planKey] || allConfig.free;
  const limitCheck = await checkAnalysisLimit(req.user.id, planConfig);
  if (!limitCheck.allowed) {
    return res.status(429).json({ success:false, reason:limitCheck.reason, used:limitCheck.used, limit:limitCheck.limit,
      message:{ ar:limitCheck.reason==='daily'?`وصلت للحد اليومي (${limitCheck.limit}/يوم).`:`وصلت للحد الشهري (${limitCheck.limit}/شهر).`, en:limitCheck.reason==='daily'?`Daily limit (${limitCheck.limit}/day).`:`Monthly limit (${limitCheck.limit}/month).` } });
  }
  const analysis = req.body.localAnalysis || algorithmAnalysis(cv.rawText||'', cv.language||'en');
  const score    = analysis.overallScore ?? analysis.atsScore;
  await cv.update({ atsScore:score, analysisData:analysis });
  await trackUsage(req.user.id, 'algorithm');
  return success(res, { analysis });
};
exports.analyzeForFree = exports.analyzeFree;

// ════════════════════════════════════════════════════════════
// POST /cvs/:id/re-analyze
// ════════════════════════════════════════════════════════════
exports.reAnalyze = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  const allConfig  = await getCVPlanConfig();
  const planKey    = getEffectivePlan(req.user);
  const planConfig = allConfig[planKey] || allConfig.free;
  const limitCheck = await checkAnalysisLimit(req.user.id, planConfig);
  if (!limitCheck.allowed) {
    return res.status(429).json({ success:false, reason:limitCheck.reason, used:limitCheck.used, limit:limitCheck.limit,
      message:{ ar:limitCheck.reason==='daily'?'وصلت للحد اليومي.':'وصلت للحد الشهري.', en:limitCheck.reason==='daily'?'Daily limit reached.':'Monthly limit reached.' } });
  }
  const rawText = cv.rawText || '';
  let analysis;
  try {
    if (planConfig.useAI && rawText.length > 50) {
      analysis = { ...(await aiSvc.analyzeCV(rawText,'','',{id:req.user.id,email:req.user.email,fullName:req.user.fullName})), isFree:false };
    } else {
      analysis = algorithmAnalysis(rawText, cv.language||'en');
    }
  } catch { analysis = algorithmAnalysis(rawText, cv.language||'en'); }
  await cv.update({ analysisData:analysis, aiFeedback:analysis, atsScore:analysis.atsScore, overallScore:analysis.overallScore });
  if (!planConfig.useAI) await trackUsage(req.user.id, 'algorithm');
  return success(res, { cv, analysis });
};
exports.reAnalyzeCV = exports.reAnalyze;

// ════════════════════════════════════════════════════════════
// PATCH /cvs/:id/primary
// ════════════════════════════════════════════════════════════
exports.setPrimary = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  await CV.update({ isPrimary:false }, { where: { userId:req.user.id } });
  await cv.update({ isPrimary:true });
  return success(res, { cv }, 'تم التعيين');
};

// ════════════════════════════════════════════════════════════
// DELETE /cvs/:id
// ════════════════════════════════════════════════════════════
exports.deleteCV = async (req, res) => {
  const cv = await CV.findOne({ where: { id:req.params.id, userId:req.user.id } });
  if (!cv) return error(res, 'السيرة الذاتية غير موجودة', 404);
  if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
  await cv.destroy();
  return success(res, {}, 'تم الحذف');
};

// ════════════════════════════════════════════════════════════
// POST /cvs/build
// ════════════════════════════════════════════════════════════
exports.buildSection = async (req, res) => {
  const planKey    = getEffectivePlan(req.user);
  const allConfig  = await getCVPlanConfig();
  const planConfig = allConfig[planKey] || allConfig.free;
  if (!planConfig.useAI) return error(res, 'بناء الأقسام بالـ AI للباقة Pro فقط', 403);
  const { section, targetRole, userData, language } = req.body;
  if (!section) return error(res, 'يرجى تحديد القسم', 400);
  const content = await aiSvc.buildCVSection({ section, targetRole, userData, language, userInfo:{id:req.user.id,email:req.user.email,fullName:req.user.fullName} });
  return success(res, { content });
};
exports.buildCVSection = exports.buildSection;

// ════════════════════════════════════════════════════════════
// POST /cvs/generate-pdf
// ════════════════════════════════════════════════════════════
exports.generatePDF = async (req, res) => {
  const { html, cvId } = req.body;
  if (!html) return error(res, 'يرجى إرسال HTML', 400);
  const pdfBuffer = await generatePdfBuffer(html);
  if (!pdfBuffer) return error(res, 'PDF_SERVER_UNAVAILABLE', 503);
  try {
    const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${req.user.id}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
    if (cvId) {
      const existing = await CV.findOne({ where: { id:cvId, userId:req.user.id } });
      if (existing) {
        if (existing.fileKey) await storageSvc.remove(existing.fileKey).catch(()=>{});
        await existing.update({ fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length });
        return success(res, { downloadUrl:url, cv:existing });
      }
    }
    return success(res, { downloadUrl:url }, 'تم إنشاء PDF', 201);
  } catch { return error(res, 'فشل رفع الملف', 500); }
};

// ════════════════════════════════════════════════════════════
// POST /cvs/save
// ════════════════════════════════════════════════════════════
exports.saveCV = async (req, res) => {
  try {
    const userId     = req.user.id;
    const allConfig  = await getCVPlanConfig();
    const planKey    = getEffectivePlan(req.user);
    const planConfig = allConfig[planKey] || allConfig.free;
    const { title, builderData, template, language, html } = req.body;
    let cv = await CV.findOne({ where: { userId }, order: [['created_at','DESC']] });
    if (!cv) {
      const cvCount = await CV.count({ where: { userId } });
      if (cvCount >= planConfig.maxCVs) {
        return res.status(403).json({ success:false, upgradeRequired:true, message:{ ar:`وصلت للحد الأقصى (${planConfig.maxCVs} سيرة).`, en:`CV limit reached (${planConfig.maxCVs}).` } });
      }
    }
    const mergedBuilder = { ...(cv?.builderData||{}), ...(builderData||{}), ...(template?{template}:{}) };
    const templateChanged = !!template && template !== cv?.builderData?.template;

    if (cv) { await cv.update({ builderData:mergedBuilder, ...(template&&{template}), ...(language&&{language}) }); }
    else    { cv = await CV.create({ userId, title:title||'My CV', builderData:mergedBuilder, template:template||'classic', language:language||'ar', isPrimary:true }); }

    if (html && html.trim().length > 100) {
      const pdfBuffer = await generatePdfBuffer(html);
      if (pdfBuffer?.length > 0) {
        try {
          if (cv.fileKey) await storageSvc.remove(cv.fileKey).catch(()=>{});
          const { key, url } = await storageSvc.upload({ buffer:pdfBuffer, mimetype:'application/pdf', originalname:`cv-${userId}-${Date.now()}.pdf`, folder:'generated-cvs', type:'cv' });
          await cv.update({ fileUrl:url, fileKey:key, fileType:'pdf', fileSize:pdfBuffer.length, status:'generated' });
        } catch {}
      }
    } else if (templateChanged) {
      // ✅ Template changed without explicit HTML — render server-side and replace R2 file
      try {
        const result = await generateAndStoreTemplatedPdf(cv, mergedBuilder, template, language || cv.language || 'en', userId);
        if (result) {
          await cv.update({ fileUrl: result.url, fileKey: result.key, fileType: 'pdf', fileSize: result.size, status: 'generated' });
        }
      } catch (e) { logger.error('[CV] saveCV template regen failed:', e.message); }
    }

    const updatedCv = await CV.findByPk(cv.id);
    return success(res, { cv:updatedCv, id:updatedCv.id, planConfig:{ maxCVs:planConfig.maxCVs, templatesAllowed:planConfig.templatesAllowed, useAI:planConfig.useAI } }, 'تم الحفظ بنجاح');
  } catch (err) { logger.error('saveCV error:', err.message); return error(res, err.message||'فشل الحفظ', 500); }
};

// ════════════════════════════════════════════════════════════
// ✅ NEW: PATCH /cvs/:id/template — dedicated endpoint for Auto-Apply tab
// template picker. Regenerates the stored R2 PDF immediately.
// ════════════════════════════════════════════════════════════
exports.updateTemplate = async (req, res) => {
  try {
    const { template } = req.body;
    if (!template) return error(res, 'template required', 400);

    const cv = await CV.findOne({ where: { userId: req.user.id }, order: [['is_primary','DESC'],['created_at','DESC']] });
    if (!cv) return error(res, 'لا توجد سيرة ذاتية', 404);

    const cvData = { ...(cv.builderData || cv.parsedContent || {}), template };
    const result = await generateAndStoreTemplatedPdf(cv, cvData, template, cv.language || 'en', req.user.id);

    if (!result) return error(res, 'فشل توليد PDF بالقالب الجديد', 500);

    await cv.update({
      builderData: cvData,
      template,
      fileUrl: result.url,
      fileKey: result.key,
      fileType: 'pdf',
      fileSize: result.size,
      status: 'generated',
    });

    return success(res, { cv }, 'تم تحديث القالب وحفظه ✓');
  } catch (err) {
    logger.error('[CV] updateTemplate error:', err.message);
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════
exports.adminGetCVConfig = async (req, res) => {
  const config = await getCVPlanConfig();
  return success(res, { config, defaults:DEFAULT_CV_PLAN_CONFIG });
};
exports.adminUpdateCVConfig = async (req, res) => {
  const { config } = req.body;
  if (!config) return error(res, 'config required', 400);
  const { setSetting } = require('../services/settings.service');
  await setSetting('cv_plan_config', JSON.stringify(config));
  return success(res, { config }, 'تم تحديث إعدادات CV ✅');
};