

// 'use strict';

// const { chat } = require('../config/ai');
// const tokenTracker = require('./tokenTracker.service');
// const apiSettingsSvc = require('./apiSettings.service');

// /* ════════════════════════════════════════════════════════════
//    INTERVIEW LIMITS CONFIG
// ════════════════════════════════════════════════════════════ */
// // استبدل DEFAULT_LIMITS بهذا:
// const DEFAULT_LIMITS = {
//   free:  { perDay: 0,  perMonth: 0,  allowCreation: false },
//   pro:   { perDay: 3,  perMonth: 18, allowCreation: true },
//   elite: { perDay: 5,  perMonth: 24, allowCreation: true },
// };

// const getLimitsConfig = async () => {
//   try {
//     const { Setting } = require('../models');
//     const row = await Setting.findOne({ where: { key: 'interview_limits' } });
//     if (row?.value) return JSON.parse(row.value);
//   } catch {}
//   return DEFAULT_LIMITS;
// };

// const getUserLimits = async (planKey) => {
//   const config = await getLimitsConfig();
//   return config[planKey] || config.free || DEFAULT_LIMITS.free;
// };

// const checkInterviewLimit = async (userId, planKey) => {
//   const { Op } = require('sequelize');
//   const { TrainingSession } = require('../models');
//   const limits = await getUserLimits(planKey);

//   // فحص اليوم
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const todayCount = await TrainingSession.count({
//     where: { userId, startedAt: { [Op.gte]: today } },
//   });

//   if (todayCount >= limits.perDay) {
//     return {
//       allowed: false,
//       message: {
//         en: `Daily interview limit reached (${limits.perDay}/${limits.perDay}). Try again tomorrow.`,
//         ar: `تم الوصول للحد اليومي للمقابلات (${limits.perDay}/${limits.perDay}). حاول غداً.`,
//       },
//       upgradeRequired: true,
//     };
//   }

//   // فحص الشهر
//   const thisMonth = new Date();
//   thisMonth.setDate(1);
//   thisMonth.setHours(0, 0, 0, 0);

//   const monthCount = await TrainingSession.count({
//     where: { userId, startedAt: { [Op.gte]: thisMonth } },
//   });

//   if (monthCount >= limits.perMonth) {
//     return {
//       allowed: false,
//       message: {
//         en: `Monthly interview limit reached (${limits.perMonth}). Upgrade to continue.`,
//         ar: `تم الوصول للحد الشهري للمقابلات (${limits.perMonth}). قم بالترقية للمتابعة.`,
//       },
//       upgradeRequired: true,
//     };
//   }

//   return { allowed: true, limits };
// };

// // ════════════════════════════════════════════════════════════
// // HELPER: Call AI with automatic token tracking
// // ════════════════════════════════════════════════════════════
// async function callAIWithTracking({ 
//   system, 
//   user, 
//   temperature = 0.3, 
//   maxTokens = 1000, 
//   json = false,
//   userId,
//   userEmail,
//   userName,
//   feature,
//   model = null
// }) {
//   const startTime = Date.now();
//   const inputText = `${system}\n\n${user}`;
  
//   let activeModel = model;
//   if (!activeModel) {
//     try {
//       const settings = await apiSettingsSvc.getDeepSeekSettings();
//       activeModel = settings.activeModel || 'deepseek-v4-flash';
//     } catch (error) {
//       console.error('[AI] Failed to get model from settings, using default:', error.message);
//       activeModel = 'deepseek-v4-flash';
//     }
//   }
  
//   try {
//     const response = await chat({ system, user, temperature, maxTokens, json, model: activeModel });
    
//     const inputTokens = Math.ceil(inputText.length / 4);
//     const outputTokens = Math.ceil((response?.length || 0) / 4);
    
//     await tokenTracker.recordSuccess(
//       userId, userEmail, userName, feature,
//       inputTokens, outputTokens, activeModel,
//       { duration: Date.now() - startTime, temperature, maxTokens, jsonMode: json }
//     );
    
//     return response;
//   } catch (error) {
//     await tokenTracker.recordFailure(
//       userId, userEmail, userName, feature,
//       error.message, activeModel,
//       { duration: Date.now() - startTime }
//     );
//     throw error;
//   }
// }

// // ════════════════════════════════════════════════════════════
// // 1. ATS CV ANALYSIS
// // ════════════════════════════════════════════════════════════
// exports.analyzeCV = async (cvText, jobTitle = '', jobDescription = '', userInfo = {}) => {
//   const hasJob = jobTitle || jobDescription;
//   if (!cvText || cvText.length < 100) {
//     throw new Error('CV text is required and must be at least 100 characters');
//   }

//   const system = `You are an expert ATS analyst. Analyze CVs objectively. Respond in valid JSON only.`;
//   const user = `Analyze this CV${hasJob ? ` for: "${jobTitle}"` : ''}.\nCV: ${cvText.substring(0, 8000)}\n${hasJob ? `Job: ${jobDescription.substring(0, 2000)}` : ''}\nReturn JSON with: overallScore, atsScore, scores, summary, strengths, improvements, missingKeywords, suggestedKeywords, yearsOfExperience, detectedSkills, educationLevel, language, tip.`;

//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.3, maxTokens: 2000, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'cv_analysis' });
//     return JSON.parse(raw);
//   } catch (error) {
//     throw new Error(`CV analysis failed: ${error.message}`);
//   }
// };

// // ════════════════════════════════════════════════════════════
// // 2-4. EXTRACT CV, BUILD SECTION, MATCH CV (موجودين)
// // ════════════════════════════════════════════════════════════
// exports.extractCVStructure = async (rawText, userInfo = {}) => {
//   const system = `You are a CV parser. Extract structured data. Respond in valid JSON only.`;
//   const user = `Extract info from CV:\n${rawText.substring(0, 4000)}\nReturn JSON: fullName, headline, email, phone, location, linkedin, summary, skills, languages, certifications, experiences[], education[].`;
//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.1, maxTokens: 2000, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'cv_analysis' });
//     return JSON.parse(raw);
//   } catch { return null; }
// };

// exports.buildCVSection = async ({ section, userData, language = 'ar', targetRole = '', userInfo = {} }) => {
//   const system = `You are a professional CV writer. Write compelling, ATS-friendly content.`;
//   const prompts = {
//     summary: `Write a 3-4 sentence professional summary targeting "${targetRole}". Data: ${JSON.stringify(userData)}. Language: ${language === 'ar' ? 'Arabic' : 'English'}.`,
//     experience: `Rewrite work experience to be impactful. Data: ${JSON.stringify(userData)}. Language: ${language === 'ar' ? 'Arabic' : 'English'}.`,
//     skills: `Organize skills for ${targetRole}. Skills: ${JSON.stringify(userData.skills)}. Language: ${language === 'ar' ? 'Arabic' : 'English'}.`,
//     objective: `Write career objective for "${targetRole}". Background: ${JSON.stringify(userData)}. Language: ${language === 'ar' ? 'Arabic' : 'English'}.`,
//   };
//   return callAIWithTracking({ system, user: prompts[section] || '', temperature: 0.5, maxTokens: 800, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'cv_analysis' });
// };

// // exports.matchCVToJob = async (cvText, jobTitle, jobDescription, requirements = '', userInfo = {}) => {
// //   const system = `You are an expert recruiter. Score candidate fit. Respond in valid JSON.`;
// //   const user = `Score match for ${jobTitle}.\nCV: ${cvText.substring(0, 3000)}\nJob: ${jobDescription}\nRequirements: ${requirements}\nReturn JSON: matchScore, verdict, verdictAr, matchedSkills, missingSkills, highlights, concerns, recommendation.`;
// //   try {
// //     const raw = await callAIWithTracking({ system, user, temperature: 0.2, maxTokens: 800, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'interview' });
// //     return JSON.parse(raw);
// //   } catch { return { matchScore: 50, verdict: 'partial_match', matchedSkills: [], missingSkills: [] }; }
// // };

// // ════════════════════════════════════════════════════════════
// // في ai.service.js — استبدلي دالة matchCVToJob بهذه
// // (feature: 'auto_apply' — القيمة الصحيحة من enum الموجود فعلياً)
// // ════════════════════════════════════════════════════════════

// exports.matchCVToJob = async (cvText, jobTitle, jobDescription, requirements = '', userInfo = {}) => {
//   const system = `You are an expert technical recruiter. Score how well this candidate's CV matches the job — be realistic and discriminating, not generous. Respond in valid JSON only.`;
//   const user = `Score the match between this CV and job posting.

// Job Title: ${jobTitle}
// Job Description: ${jobDescription}
// Requirements: ${requirements}

// CV:
// ${cvText.substring(0, 3000)}

// Return JSON with: matchScore (0-100, integer), verdict (strong_match | partial_match | weak_match), verdictAr, matchedSkills (array), missingSkills (array), highlights (array, max 3), concerns (array, max 2), recommendation (1 sentence).`;

//   try {
//     const raw = await callAIWithTracking({
//       system, user,
//       temperature: 0.2,
//       maxTokens: 600,
//       json: true,
//       userId: userInfo.id,
//       userEmail: userInfo.email,
//       userName: userInfo.fullName,
//       feature: 'auto_apply',   // ✅ valid enum value — was 'interview' (wrong category)
//     });
//     return JSON.parse(raw);
//   } catch {
//     return { matchScore: 50, verdict: 'partial_match', matchedSkills: [], missingSkills: [] };
//   }
// };

// // ════════════════════════════════════════════════════════════
// // 5. INTERVIEW TRAINING — Generate Questions
// // ════════════════════════════════════════════════════════════
// exports.generateInterviewQuestions = async ({
//   jobTitle, jobDescription = '', cvText = '', difficulty = 'medium', count = 5, language = 'ar', userInfo = {},
// }) => {
//   const system = `You are an experienced interviewer. Generate insightful questions. Respond in valid JSON.`;
//   const user = `Generate ${count} interview questions for: "${jobTitle}" (${difficulty}). Language: ${language === 'ar' ? 'Arabic' : 'English'}.${cvText ? `\nCV: ${cvText.substring(0, 1000)}` : ''}${jobDescription ? `\nJob: ${jobDescription.substring(0, 500)}` : ''}\nReturn JSON: questions[{id, type, question, hint, timeSeconds}].`;
//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.6, maxTokens: 1200, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'interview' });
//     return JSON.parse(raw);
//   } catch { return { questions: [] }; }
// };

// // ════════════════════════════════════════════════════════════
// // 6. SCORE INTERVIEW ANSWER
// // ════════════════════════════════════════════════════════════
// exports.scoreInterviewAnswer = async ({ question, answer, jobTitle, language = 'ar', userInfo = {} }) => {
//   const system = `You are an expert interviewer scoring responses. Respond in valid JSON.`;
//   const user = `Score answer for ${jobTitle}.\nQ: ${question}\nA: ${answer}\nLanguage: ${language === 'ar' ? 'Arabic' : 'English'}\nReturn JSON: score, grade, feedback, strengths, improvements, betterAnswer.`;
//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.3, maxTokens: 600, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'interview' });
//     return JSON.parse(raw);
//   } catch { return { score: 60, grade: 'average', feedback: 'تعذّر تقييم الإجابة.' }; }
// };

// // ════════════════════════════════════════════════════════════
// // 7-10. SKILL GAP, COVER LETTER, HEADLINE, CAREER PATH
// // ════════════════════════════════════════════════════════════
// exports.analyzeSkillGap = async ({ currentSkills, targetRole, yearsExperience = 0, language = 'ar', userInfo = {} }) => {
//   const system = `You are a career development expert. Respond in valid JSON.`;
//   const user = `Skill gap analysis for ${targetRole}. Skills: ${currentSkills.join(', ')}. Experience: ${yearsExperience}y. Language: ${language === 'ar' ? 'Arabic' : 'English'}. Return JSON: readinessScore, summary, gapSkills, learningPath, estimatedTimeToReady, quickWins.`;
//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.4, maxTokens: 1200, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'career_path' });
//     return JSON.parse(raw);
//   } catch { return { readinessScore: 50, gapSkills: [], learningPath: [] }; }
// };

// // exports.generateCoverLetter = async ({ cvText, jobTitle, companyName, jobDescription, language = 'ar', userInfo = {} }) => {
// //   const system = `You are a professional cover letter writer.`;
// //   const user = `Cover letter for ${jobTitle} at ${companyName}.\nCV: ${cvText.substring(0, 1500)}\nJob: ${jobDescription.substring(0, 800)}\nLanguage: ${language === 'ar' ? 'Arabic' : 'English'}.`;
// //   return callAIWithTracking({ system, user, temperature: 0.5, maxTokens: 500, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'cover_letter' });
// // };

// // ════════════════════════════════════════════════════════════
// // في ai.service.js — استبدلي دالة generateCoverLetter بالكامل بهذا:
// // ════════════════════════════════════════════════════════════

// // exports.generateCoverLetter = async ({ cvText, jobTitle, companyName, jobDescription, language = 'ar', userInfo = {} }) => {
// //   const isArabic = language === 'ar';

// //   const system = isArabic
// //     ? `أنت كاتب خطابات تقديم وظيفي محترف. اكتب خطاباً جاهزاً للإرسال فوراً، بدون أي عناصر نائبة (placeholders) مثل [Your Name] أو [Date] أو [Company Address]. استخدم فقط المعلومات الفعلية المتوفرة لك من السيرة الذاتية. لا تكتب أي تعليقات تمهيدية مثل "إليك خطاب التقديم" — ابدأ مباشرة بالخطاب نفسه. اكتب الخطاب بالكامل باللغة العربية الفصحى.`
// //     : `You are a professional cover letter writer. Write a letter that is ready to send immediately — with NO placeholders like [Your Name], [Date], or [Company Address]. Use only the actual information available from the CV. Do not write any preamble like "Here is a cover letter" — start directly with the letter itself. Write the entire letter in English.`;

// //   const user = isArabic
// //     ? `اكتب خطاب تقديم لوظيفة "${jobTitle}" في شركة "${companyName}".

// // السيرة الذاتية للمرشح:
// // ${cvText.substring(0, 1500)}

// // وصف الوظيفة:
// // ${jobDescription.substring(0, 800)}

// // تذكير: لا تستخدم أي عناصر نائبة. استخدم الاسم والمعلومات الفعلية الموجودة في السيرة الذاتية أعلاه فقط. اكتب بالعربية الفصحى الاحترافية.`
// //     : `Write a cover letter for the "${jobTitle}" position at "${companyName}".

// // Candidate's CV:
// // ${cvText.substring(0, 1500)}

// // Job description:
// // ${jobDescription.substring(0, 800)}

// // Reminder: do not use any placeholders. Use only the actual name and information present in the CV above. Write in professional English.`;

// //   const result = await callAIWithTracking({
// //     system, user,
// //     temperature: 0.5,
// //     maxTokens: 600,
// //     userId: userInfo.id,
// //     userEmail: userInfo.email,
// //     userName: userInfo.fullName,
// //     feature: 'cover_letter',
// //   });

// //   // Safety net: strip any leftover preamble lines or placeholder brackets
// //   return result
// //     .replace(/^(here'?s?|إليك|هذا)[^\n]*\n+/i, '')
// //     .trim();
// // };
// // ════════════════════════════════════════════════════════════
// // في ai.service.js — استبدلي دالة generateCoverLetter بالكامل بهذا:
// // ════════════════════════════════════════════════════════════

// exports.generateCoverLetter = async ({ cvText, jobTitle, companyName, jobDescription, language = 'ar', userInfo = {} }) => {
//   const isArabic = language === 'ar';

//   const system = isArabic
//     ? `أنت كاتب خطابات تقديم وظيفي محترف. اكتب خطاباً جاهزاً للإرسال فوراً، بدون أي عناصر نائبة (placeholders) مثل [Your Name] أو [Date] أو [Company Address]. استخدم فقط المعلومات الفعلية المتوفرة لك من السيرة الذاتية. لا تكتب أي تعليقات تمهيدية مثل "إليك خطاب التقديم" — ابدأ مباشرة بالخطاب نفسه. اكتب الخطاب بالكامل باللغة العربية الفصحى.`
//     : `You are a professional cover letter writer. Write a letter that is ready to send immediately — with NO placeholders like [Your Name], [Date], or [Company Address]. Use only the actual information available from the CV. Do not write any preamble like "Here is a cover letter" — start directly with the letter itself. Write the entire letter in English.`;

//   const user = isArabic
//     ? `اكتب خطاب تقديم لوظيفة "${jobTitle}" في شركة "${companyName}".

// السيرة الذاتية للمرشح:
// ${cvText.substring(0, 1500)}

// وصف الوظيفة:
// ${jobDescription.substring(0, 800)}

// تذكير: لا تستخدم أي عناصر نائبة. استخدم الاسم والمعلومات الفعلية الموجودة في السيرة الذاتية أعلاه فقط. اكتب بالعربية الفصحى الاحترافية.`
//     : `Write a cover letter for the "${jobTitle}" position at "${companyName}".

// Candidate's CV:
// ${cvText.substring(0, 1500)}

// Job description:
// ${jobDescription.substring(0, 800)}

// Reminder: do not use any placeholders. Use only the actual name and information present in the CV above. Write in professional English.`;

//   const result = await callAIWithTracking({
//     system, user,
//     temperature: 0.5,
//     maxTokens: 600,
//     userId: userInfo.id,
//     userEmail: userInfo.email,
//     userName: userInfo.fullName,
//     feature: 'cover_letter',
//   });

//   // Safety net: strip any leftover preamble lines or placeholder brackets
//   return result
//     .replace(/^(here'?s?|إليك|هذا)[^\n]*\n+/i, '')
//     .trim();
// };
// exports.generateHeadline = async ({ name, role, skills, yearsExp, language = 'ar', userInfo = {} }) => {
//   const system = `You are a personal branding expert. Write punchy headlines.`;
//   const user = `Generate 3 headlines for ${name}, ${role}. Skills: ${skills.slice(0, 5).join(', ')}. Experience: ${yearsExp}y. Language: ${language === 'ar' ? 'Arabic' : 'English'}.`;
//   const result = await callAIWithTracking({ system, user, temperature: 0.7, maxTokens: 200, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'chat' });
//   return result.split('\n').filter(l => l.trim()).slice(0, 3);
// };

// // exports.generateCareerPath = async ({ cvText, targetRole, lang = 'ar', userInfo = {} }) => {
// //   const system = `You are an expert career coach. Respond in valid JSON. ${lang === 'ar' ? 'Write all text in Arabic.' : 'Write all text in English.'}`;
// //   const user = `Career path${targetRole ? ` to "${targetRole}"` : ''}.\nCV: ${cvText.substring(0, 3500)}\nReturn JSON: currentRole, currentLevel, targetRole, estimatedYears, summary, currentSkills, missingSkills, stages, recommendedCourses, certifications, salaryRange, marketDemand, tips.`;
// //   try {
// //     const raw = await callAIWithTracking({ system, user, temperature: 0.3, maxTokens: 3000, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'career_path' });
// //     return JSON.parse(raw);
// //   } catch { throw new Error('Failed to parse career path response'); }
// // };

// exports.generateCareerPath = async ({ cvText, targetRole, lang = 'ar', userInfo = {} }) => {
//   const isArabic = lang === 'ar';
//   const system = `You are an expert career coach. Respond in valid JSON only. ${isArabic ? 'Write ALL text values in Arabic.' : 'Write ALL text values in English.'}`;
//   const user = `Career path${targetRole ? ` to "${targetRole}"` : ''}.
// CV: ${cvText.substring(0, 3500)}
// Return JSON with EXACTLY these fields:
// - currentRole (string)
// - currentLevel (string)
// - targetRole (string)
// - estimatedYears (number)
// - summary (string)
// - currentSkills (array of strings)
// - missingSkills (array of strings)
// - stages (array of: { title, duration, description, skills[], milestones[], certifications[] })
// - recommendedCourses (array of: { title, provider, skillCovered, durationHours, priority, free })
// - certifications (array of: { name, provider, priority, relevance })
// - salaryRange (object: { current, target } — use local currency if known, else numbers only)
// - marketDemand (string: "high" or "medium" or "low")
// - tips (array of strings, max 5)
// - aiImpact (object: { positive: [array of strings], negative: [array of strings] })
// ${isArabic ? 'كل النصوص يجب أن تكون باللغة العربية بما فيها aiImpact و tips و stages و summary.' : 'All text must be in English.'}`;
//   try {
//     const raw = await callAIWithTracking({ system, user, temperature: 0.3, maxTokens: 3000, json: true, userId: userInfo.id, userEmail: userInfo.email, userName: userInfo.fullName, feature: 'career_path' });
//     return JSON.parse(raw);
//   } catch { throw new Error('Failed to parse career path response'); }
// };
// // ════════════════════════════════════════════════════════════
// // EXPORTS
// // ════════════════════════════════════════════════════════════
// module.exports = {
//   // CV & Resume
//   analyzeCV: exports.analyzeCV,
//   extractCVStructure: exports.extractCVStructure,
//   buildCVSection: exports.buildCVSection,
//   matchCVToJob: exports.matchCVToJob,
  
//   // Interview Training
//   generateInterviewQuestions: exports.generateInterviewQuestions,
//   scoreInterviewAnswer: exports.scoreInterviewAnswer,
  
//   // Career Development
//   analyzeSkillGap: exports.analyzeSkillGap,
//   generateCoverLetter: exports.generateCoverLetter,
//   generateHeadline: exports.generateHeadline,
//   generateCareerPath: exports.generateCareerPath,
  
//   // Interview Limits System
//   checkInterviewLimit,
//   getLimitsConfig,
//   getUserLimits,
//   DEFAULT_LIMITS,
// };

'use strict';

const OpenAI = require('openai');

const PROVIDER = process.env.AI_PROVIDER || 'deepseek';

// ── DeepSeek client ────────────────────────────────────────
const deepseek = new OpenAI({
  apiKey:     process.env.DEEPSEEK_API_KEY,
  baseURL:    'https://api.deepseek.com',
  timeout:    90000,  // ✅ 90s — cover letters are long
  maxRetries: 0,      // ✅ we handle retries manually below
});

const client = PROVIDER === 'openai' ? openai : deepseek;
const MODEL  = PROVIDER === 'openai'
  ? (process.env.OPENAI_MODEL  || 'gpt-4o')
  : (process.env.DEEPSEEK_MODEL || 'deepseek-chat');

// ── Sleep helper ───────────────────────────────────────────
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ── Single attempt ─────────────────────────────────────────
const attempt = async (c, model, options) => {
  const res = await c.chat.completions.create({ ...options, model });
  if (!res?.choices?.[0]?.message?.content) throw new Error('Empty response from AI provider');
  return res.choices[0].message.content;
};

// ── Shared chat wrapper ────────────────────────────────────
const chat = async ({ system, user, temperature = 0.3, maxTokens = 2000, json = false }) => {
  if (!system || !user) throw new Error('System and user messages are required');

  const options = {
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user   },
    ],
    temperature,
    max_tokens: maxTokens,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  };

  // ✅ Try DeepSeek up to 3 times with backoff
  const MAX_RETRIES = 3;
  let lastErr;

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const result = await attempt(deepseek, PROVIDER === 'openai' ? MODEL : (process.env.DEEPSEEK_MODEL || 'deepseek-chat'), options);
      return result;
    } catch (err) {
      lastErr = err;
      const isPrematureClose = err.message?.includes('Premature close') || err.message?.includes('fetch');
      const isRateLimit      = err.status === 429 || err.message?.includes('rate');

      console.error(`[AI] DeepSeek attempt ${i + 1}/${MAX_RETRIES} failed:`, err.message);

      if (isPrematureClose || isRateLimit) {
        const wait = (i + 1) * 3000; // 3s, 6s, 9s
        console.log(`[AI] Waiting ${wait}ms before retry...`);
        await sleep(wait);
        continue;
      }

      // Non-retryable error (bad key, invalid request etc) — break immediately
      break;
    }
  }

  throw new Error(`DeepSeek failed after ${MAX_RETRIES} retries: ${lastErr?.message}`);
};

// ── Health check ───────────────────────────────────────────
const checkApiKey = async () => {
  try {
    await chat({ system: 'You are a test assistant', user: 'Say "OK"', temperature: 0, maxTokens: 5 });
    return { valid: true, provider: PROVIDER, model: MODEL };
  } catch (err) {
    return { valid: false, error: err.message, provider: PROVIDER };
  }
};

module.exports = { client, MODEL, chat, PROVIDER, checkApiKey };
