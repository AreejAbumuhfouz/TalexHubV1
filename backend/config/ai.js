
'use strict';

const OpenAI = require('openai');

const PROVIDER = process.env.AI_PROVIDER || 'deepseek';

// ── DeepSeek client ────────────────────────────────────────
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  timeout: 30000, // ✅ إضافة مهلة 30 ثانية
  maxRetries: 3,  // ✅ إعادة المحاولة 3 مرات
});

// ── OpenAI client (fallback) ───────────────────────────────
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3,
});

// ── Active client + model ──────────────────────────────────
const client = PROVIDER === 'openai' ? openai : deepseek;
const MODEL = PROVIDER === 'openai'
  ? (process.env.OPENAI_MODEL || 'gpt-4o')
  : (process.env.DEEPSEEK_MODEL || 'deepseek-chat');

// ── Shared chat wrapper with error handling ────────────────
const chat = async ({ system, user, temperature = 0.3, maxTokens = 2000, json = false }) => {
  // ✅ التحقق من المدخلات
  if (!system || !user) {
    throw new Error('System and user messages are required');
  }

  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  const options = {
    model: MODEL,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  // DeepSeek and OpenAI both support JSON mode
  if (json) {
    options.response_format = { type: 'json_object' };
  }

  try {
    const res = await client.chat.completions.create(options);
    
    if (!res?.choices?.[0]?.message?.content) {
      throw new Error('Empty response from AI provider');
    }
    
    return res.choices[0].message.content;
  } catch (error) {
    console.error(`[AI Error] Provider: ${PROVIDER}, Model: ${MODEL}`, error.message);
    
    // ✅ محاولة fallback إذا فشل DeepSeek
    if (PROVIDER === 'deepseek' && error.message.includes('API key') === false) {
      console.log('⚠️ Falling back to OpenAI...');
      try {
        const fallbackRes = await openai.chat.completions.create(options);
        return fallbackRes.choices[0].message.content;
      } catch (fallbackError) {
        console.error('[Fallback Error]', fallbackError.message);
        throw new Error(`Both AI providers failed: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// ✅ إضافة دالة للتحقق من صحة المفتاح
const checkApiKey = async () => {
  try {
    await chat({
      system: 'You are a test assistant',
      user: 'Say "OK"',
      temperature: 0,
      maxTokens: 5,
    });
    return { valid: true, provider: PROVIDER, model: MODEL };
  } catch (error) {
    return { valid: false, error: error.message, provider: PROVIDER };
  }
};

module.exports = { client, MODEL, chat, PROVIDER, checkApiKey };