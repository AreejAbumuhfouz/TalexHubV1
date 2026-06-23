'use strict';
// backend/controllers/aiFeatures.controller.js
// ════════════════════════════════════════════════════════════
// CRUD لإعدادات كل ميزة AI على حدة
// يُخزَّن في جدول settings بمفاتيح مثل: ai_feature_cv_analysis
// ════════════════════════════════════════════════════════════

const { Setting } = require('../models');
const { success, error } = require('../utils/apiResponse');

// ── Default config per feature ───────────────────────────
const FEATURE_DEFAULTS = {
  cv_analysis: {
    enabled:       true,
    maxTokens:     1500,
    temperature:   0.2,
    model:         'deepseek-chat',
    freeUsers:     false,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 0,
    dailyLimitPro:  10,
    dailyLimitElite: 50,
    systemPrompt:  `You are an expert ATS (Applicant Tracking System) analyst and career coach specializing in the Arab job market. 
Analyze CVs objectively and provide actionable, specific feedback for TalexHub platform users.
Always respond in valid JSON only. No markdown, no extra text.`,
    userPromptTemplate: `Analyze this CV{{hasJob ? ' for the position: "{{jobTitle}}"' : ''}}.

CV TEXT:
{{cvText}}

{{hasJob ? 'JOB DESCRIPTION:\n{{jobDescription}}' : ''}}`,
    description:   'ATS analysis of uploaded CV — scores, strengths, improvements',
    icon:          '📄',
    color:         '#3B82F6',
  },

  cover_letter: {
    enabled:       true,
    maxTokens:     500,
    temperature:   0.5,
    model:         'deepseek-chat',
    freeUsers:     false,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 0,
    dailyLimitPro:  10,
    dailyLimitElite: 30,
    systemPrompt:  `You are a professional cover letter writer specializing in the Arab job market for TalexHub users.
Write concise, compelling cover letters that get interviews.`,
    userPromptTemplate: `Write a professional cover letter.

Position: {{jobTitle}} at {{companyName}}
Job description: {{jobDescription}}
Candidate CV summary: {{cvText}}
Language: {{language}}

Write a 3-paragraph cover letter:
1. Opening — hook + position
2. Value — 2-3 specific achievements matching the role
3. Closing — call to action

Keep it under 250 words. Professional but human tone.`,
    description:   'Personalized cover letter based on CV and job description',
    icon:          '✉️',
    color:         '#8B5CF6',
  },

  interview: {
    enabled:       true,
    maxTokens:     1200,
    temperature:   0.6,
    model:         'deepseek-chat',
    freeUsers:     true,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 3,
    dailyLimitPro:  20,
    dailyLimitElite: 100,
    systemPrompt:  `You are an experienced interviewer who creates realistic, insightful interview questions for TalexHub users.
Focus on behavioral, situational, and technical questions relevant to the role.
Respond in valid JSON only.`,
    userPromptTemplate: `Generate {{count}} interview questions for: "{{jobTitle}}"
Difficulty: {{difficulty}}
Language: {{language}}`,
    description:   'AI interview questions generation & answer scoring',
    icon:          '🎤',
    color:         '#F59E0B',
  },

  career_path: {
    enabled:       true,
    maxTokens:     3000,
    temperature:   0.3,
    model:         'deepseek-chat',
    freeUsers:     false,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 0,
    dailyLimitPro:  5,
    dailyLimitElite: 20,
    systemPrompt:  `You are an expert career coach and HR specialist with deep knowledge of the Arab job market, MENA region industries, and international career standards.
Your task is to generate a detailed, realistic, and actionable career roadmap.
Always respond in valid JSON only. No markdown, no extra text.`,
    userPromptTemplate: `Based on this CV, generate a complete career path roadmap.
{{targetRole ? 'The user wants to reach this role: "{{targetRole}}"' : 'Suggest the best career path based on the CV.'}}

CV TEXT:
{{cvText}}`,
    description:   'Full career roadmap with stages, courses, certifications',
    icon:          '🗺️',
    color:         '#22C55E',
  },

  auto_apply: {
    enabled:       true,
    maxTokens:     500,
    temperature:   0.4,
    model:         'deepseek-chat',
    freeUsers:     false,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 0,
    dailyLimitPro:  20,
    dailyLimitElite: 100,
    systemPrompt:  `You are a professional cover letter writer for auto-apply feature on TalexHub.
Write short, targeted cover letters quickly.`,
    userPromptTemplate: `Write a brief cover letter for auto-apply.
Position: {{jobTitle}} at {{companyName}}
CV summary: {{cvText}}`,
    description:   'Auto-apply cover letter generation for job applications',
    icon:          '🤖',
    color:         '#EF4444',
  },

  chat: {
    enabled:       true,
    maxTokens:     1000,
    temperature:   0.7,
    model:         'deepseek-chat',
    freeUsers:     true,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 10,
    dailyLimitPro:  50,
    dailyLimitElite: 200,
    systemPrompt:  `أنت مساعد مهني ذكي لمنصة TalexHub — منصة التوظيف والتطوير المهني للعالم العربي.
مهمتك: مساعدة المستخدمين في مسيرتهم المهنية بأسلوب ودي، داعم، وعملي.`,
    userPromptTemplate: `{{message}}`,
    description:   'Career assistant chatbot for users',
    icon:          '💬',
    color:         '#06B6D4',
  },

  skill_gap: {
    enabled:       true,
    maxTokens:     1200,
    temperature:   0.4,
    model:         'deepseek-chat',
    freeUsers:     false,
    proUsers:      true,
    eliteUsers:    true,
    dailyLimitFree: 0,
    dailyLimitPro:  5,
    dailyLimitElite: 20,
    systemPrompt:  `You are a career development expert and learning path advisor for TalexHub platform.
Provide realistic, actionable skill development plans. Respond in valid JSON only.`,
    userPromptTemplate: `Create a skill gap analysis and learning path.

Current skills: {{currentSkills}}
Target role: {{targetRole}}
Years of experience: {{yearsExperience}}`,
    description:   'Skill gap analysis and personalized learning path',
    icon:          '📊',
    color:         '#F97316',
  },
};

const KEY = (f) => `ai_feature_${f}`;

// ════════════════════════════════════════════════════════════
//  GET /api/v1/ai-features   — all features config
// ════════════════════════════════════════════════════════════
exports.getAll = async (req, res) => {
  try {
    const features = {};
    for (const featureKey of Object.keys(FEATURE_DEFAULTS)) {
      const row = await Setting.findOne({ where: { key: KEY(featureKey) } });
      features[featureKey] = row
        ? { ...FEATURE_DEFAULTS[featureKey], ...JSON.parse(row.value) }
        : { ...FEATURE_DEFAULTS[featureKey] };
    }
    return success(res, features);
  } catch (err) {
    console.error('[aiFeatures.getAll]', err.message);
    return error(res, 'Failed to fetch AI feature settings', 500);
  }
};

// ════════════════════════════════════════════════════════════
//  GET /api/v1/ai-features/:feature   — single feature config
// ════════════════════════════════════════════════════════════
exports.getOne = async (req, res) => {
  try {
    const { feature } = req.params;
    if (!FEATURE_DEFAULTS[feature]) return error(res, 'Unknown feature', 404);

    const row = await Setting.findOne({ where: { key: KEY(feature) } });
    const config = row
      ? { ...FEATURE_DEFAULTS[feature], ...JSON.parse(row.value) }
      : { ...FEATURE_DEFAULTS[feature] };

    return success(res, config);
  } catch (err) {
    return error(res, 'Failed to fetch feature config', 500);
  }
};

// ════════════════════════════════════════════════════════════
//  PUT /api/v1/ai-features/:feature   — update single feature
// ════════════════════════════════════════════════════════════
exports.updateOne = async (req, res) => {
  try {
    const { feature } = req.params;
    if (!FEATURE_DEFAULTS[feature]) return error(res, 'Unknown feature', 404);

    const current = await Setting.findOne({ where: { key: KEY(feature) } });
    const existing = current ? JSON.parse(current.value) : {};
    const merged   = { ...existing, ...req.body, updatedAt: new Date().toISOString(), updatedBy: req.user?.id };

    await Setting.upsert({ key: KEY(feature), value: JSON.stringify(merged) });
    return success(res, { ...FEATURE_DEFAULTS[feature], ...merged }, `Feature "${feature}" updated`);
  } catch (err) {
    console.error('[aiFeatures.updateOne]', err.message);
    return error(res, 'Failed to update feature config', 500);
  }
};

// ════════════════════════════════════════════════════════════
//  POST /api/v1/ai-features/:feature/reset   — reset to defaults
// ════════════════════════════════════════════════════════════
exports.resetOne = async (req, res) => {
  try {
    const { feature } = req.params;
    if (!FEATURE_DEFAULTS[feature]) return error(res, 'Unknown feature', 404);

    await Setting.destroy({ where: { key: KEY(feature) } });
    return success(res, FEATURE_DEFAULTS[feature], `Feature "${feature}" reset to defaults`);
  } catch (err) {
    return error(res, 'Failed to reset feature', 500);
  }
};

// ════════════════════════════════════════════════════════════
//  PUT /api/v1/ai-features   — bulk update all features
// ════════════════════════════════════════════════════════════
exports.updateAll = async (req, res) => {
  try {
    const updates = req.body; // { cv_analysis: {...}, cover_letter: {...}, ... }
    for (const [featureKey, data] of Object.entries(updates)) {
      if (!FEATURE_DEFAULTS[featureKey]) continue;
      const current  = await Setting.findOne({ where: { key: KEY(featureKey) } });
      const existing = current ? JSON.parse(current.value) : {};
      const merged   = { ...existing, ...data, updatedAt: new Date().toISOString(), updatedBy: req.user?.id };
      await Setting.upsert({ key: KEY(featureKey), value: JSON.stringify(merged) });
    }
    return success(res, null, 'All features updated');
  } catch (err) {
    return error(res, 'Failed to bulk update features', 500);
  }
};

// ════════════════════════════════════════════════════════════
//  Export defaults so ai.service can use them
// ════════════════════════════════════════════════════════════
exports.FEATURE_DEFAULTS = FEATURE_DEFAULTS;
exports.getFeatureConfig  = async (feature) => {
  const row = await Setting.findOne({ where: { key: KEY(feature) } });
  return row
    ? { ...FEATURE_DEFAULTS[feature], ...JSON.parse(row.value) }
    : { ...(FEATURE_DEFAULTS[feature] || {}) };
};
