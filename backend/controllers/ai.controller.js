
'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/ai.controller.js
//
// AI Assistant — Career chatbot endpoints
// POST /api/v1/ai/chat          — conversational career assistant
// POST /api/v1/ai/cover-letter  — generate cover letter
// POST /api/v1/ai/headline      — generate profile headline options
// POST /api/v1/ai/skill-gap     — analyse skill gaps vs target role
// ════════════════════════════════════════════════════════════

const { CV, LearningPath, JobApplication } = require('../models');
const aiSvc              = require('../services/ai.service');
const { success, error } = require('../utils/apiResponse');
const { chat }           = require('../config/ai');

// ════════════════════════════════════════════════════════════
// POST /ai/chat
// Main conversational career assistant
// Body: { message: string, history: [{role, content}], lang: 'ar'|'en' }
// ════════════════════════════════════════════════════════════
exports.chat = async (req, res) => {
  const { message, history = [], lang = 'ar' } = req.body;

  if (!message?.trim()) return error(res, 'الرسالة مطلوبة', 400);

  // Pull user context — CV + recent applications count
  const cv = await CV.findOne({
    where:  { userId: req.user.id, isPrimary: true, deletedAt: null },
    attributes: ['parsedText', 'rawText', 'headline', 'skills'],
  });

  const appCount = await JobApplication.count({ where: { userId: req.user.id } });

  const userContext = cv
    ? `User profile summary:
- Name: ${req.user.fullName}
- Headline: ${cv.headline || 'not set'}
- Skills: ${cv.skills || 'not listed'}
- Total job applications sent: ${appCount}
- CV summary (first 800 chars): ${(cv.parsedText || cv.rawText || '').substring(0, 800)}`
    : `User: ${req.user.fullName} — no CV uploaded yet. Total applications: ${appCount}`;

  const system = lang === 'ar'
    ? `أنت مساعد مهني ذكي لمنصة TalexHub — منصة التوظيف والتطوير المهني للعالم العربي.
مهمتك: مساعدة المستخدمين في مسيرتهم المهنية بأسلوب ودي، داعم، وعملي.

${userContext}

قواعد المحادثة:
- تحدث دائماً بالعربية الفصحى البسيطة ما لم يطلب المستخدم الإنجليزية
- كن مشجعاً وإيجابياً، خاصةً عند الإحباط أو الرفض
- قدم نصائح قابلة للتطبيق وملموسة
- تذكر سياق المحادثة السابقة
- لا تساعد في مهام تقنية خارج نطاق التطوير المهني (مثل كتابة كود برمجي)
- إذا سأل المستخدم عن شيء خارج تخصصك، أحله بلطف لمصادر مناسبة`
    : `You are TalexHub's AI career assistant — a smart, empathetic coach for Arab-world professionals.
Your job: help users navigate their career journey with friendly, practical, encouraging advice.

${userContext}

Rules:
- Respond in English unless the user writes in Arabic
- Be encouraging and supportive, especially after rejections
- Give concrete, actionable advice
- Remember the conversation context
- Do not help with technical tasks outside career development (e.g. writing code)
- For out-of-scope questions, kindly redirect to appropriate resources`;

  // Build full message history for the AI
  const messages = [
    { role: 'system', content: system },
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user',   content: message },
  ];

  const response = await chat({
    system,
    user: message,
    temperature: 0.55,
    maxTokens:   600,
  });

  // For multi-turn, we need to call the client directly with full history
  const { client, MODEL } = require('../config/ai');
  const aiMessages = [
    { role: 'system', content: system },
    ...history.slice(-10),
    { role: 'user', content: message },
  ];

  const completion = await client.chat.completions.create({
    model:       MODEL,
    messages:    aiMessages,
    temperature: 0.55,
    max_tokens:  600,
  });

  const reply = completion.choices[0].message.content;

  return success(res, { reply, lang });
};

// ════════════════════════════════════════════════════════════
// POST /ai/cover-letter
// Generate personalised cover letter
// Body: { jobTitle, companyName, jobDescription, lang }
// ════════════════════════════════════════════════════════════
exports.generateCoverLetter = async (req, res) => {
  const { jobTitle, companyName, jobDescription, lang = 'ar' } = req.body;

  if (!jobTitle?.trim())    return error(res, 'المسمى الوظيفي مطلوب', 400);
  if (!companyName?.trim()) return error(res, 'اسم الشركة مطلوب', 400);
  if (!jobDescription?.trim()) return error(res, 'وصف الوظيفة مطلوب', 400);

  const cv = await CV.findOne({
    where:      { userId: req.user.id, isPrimary: true, deletedAt: null },
    attributes: ['parsedText', 'rawText'],
  });

  if (!cv) return error(res, 'يرجى رفع سيرة ذاتية أولاً', 400);

  const cvText = cv.parsedText || cv.rawText || '';

  const coverLetter = await aiSvc.generateCoverLetter({
    cvText,
    jobTitle,
    companyName,
    jobDescription,
    language: lang,
    userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
  });

  return success(res, { coverLetter });
};

// ════════════════════════════════════════════════════════════
// POST /ai/headline
// Generate 3 profile headline options
// Body: { lang }
// ════════════════════════════════════════════════════════════
exports.generateHeadline = async (req, res) => {
  const { lang = 'ar' } = req.body;

  const cv = await CV.findOne({
    where:      { userId: req.user.id, isPrimary: true, deletedAt: null },
    attributes: ['parsedText', 'rawText', 'skills'],
  });

  if (!cv) return error(res, 'يرجى رفع سيرة ذاتية أولاً', 400);

  const cvText = cv.parsedText || cv.rawText || '';
  // Simple extraction from CV text — extract role on first meaningful line
  const lines       = cvText.split('\n').map(l => l.trim()).filter(Boolean);
  const detectedRole = lines[1] || lines[0] || '';
  const skillsList   = (cv.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  const headlines = await aiSvc.generateHeadline({
    name:     req.user.fullName,
    role:     detectedRole,
    skills:   skillsList,
    yearsExp: 0,
    language: lang,
    userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
  });

  return success(res, { headlines });
};

// ════════════════════════════════════════════════════════════
// POST /ai/skill-gap
// Analyse skill gaps vs a target role
// Body: { targetRole, lang }
// ════════════════════════════════════════════════════════════
exports.analyzeSkillGap = async (req, res) => {
  const { targetRole, lang = 'ar' } = req.body;

  if (!targetRole?.trim()) return error(res, 'المسمى الوظيفي المستهدف مطلوب', 400);

  const cv = await CV.findOne({
    where:      { userId: req.user.id, isPrimary: true, deletedAt: null },
    attributes: ['skills', 'parsedText'],
  });

  if (!cv) return error(res, 'يرجى رفع سيرة ذاتية أولاً', 400);

  const currentSkills = (cv.skills || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (currentSkills.length === 0)
    return error(res, 'لا توجد مهارات محفوظة في سيرتك الذاتية. يرجى تحديثها أولاً', 400);

  const result = await aiSvc.analyzeSkillGap({
    currentSkills,
    targetRole,
    yearsExperience: 0,
    language: lang,
    userInfo: { id: req.user.id, email: req.user.email, fullName: req.user.fullName },
  });

  return success(res, result);
};