'use strict';

// ════════════════════════════════════════════════════════════
// BAD WORDS FILTER — يدعم عربي + إنجليزي
// ════════════════════════════════════════════════════════════

let BAD_WORDS_LIST = {
  en: [
    'fuck', 'shit', 'ass', 'bitch', 'damn', 'hell',
    'bastard', 'crap', 'dick', 'piss', 'slut', 'whore',
  ],
  ar: [
    'كس', 'زب', 'شرموط', 'عاهرة', 'قحبة', 'منيوك',
    'كلب', 'حمار', 'خنزير', 'وسخ', 'نجس',
    'كس ام', 'كس اخت', 'ابن الكلب', 'ابن الشرموطة',
    'ابن القحبة', 'ابن العاهرة', 'يا حيوان', 'يا بهيمة',
  ],
};

// تحميل من DB لو موجود
const loadFromDB = async () => {
  try {
    const { Setting } = require('../models');
    const row = await Setting.findOne({ where: { key: 'bad_words_list' } });
    if (row && row.value) {
      const custom = JSON.parse(row.value);
      if (custom.en) BAD_WORDS_LIST.en = custom.en;
      if (custom.ar) BAD_WORDS_LIST.ar = custom.ar;
    }
  } catch (err) {
    // Setting table might not exist yet
  }
};

// تشغيل أول مرة
loadFromDB();

const normalize = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/[_\-.,;:!?@#$%^&*()+=/\\|~{}[\]"']/g, '')
    .replace(/0/g, 'o')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/\$/g, 's')
    .replace(/@/g, 'a');
};

const containsBadWords = (text) => {
  if (!text) return false;
  const normalized = normalize(text);
  
  for (const word of BAD_WORDS_LIST.en) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(normalized)) return true;
  }
  
  for (const word of BAD_WORDS_LIST.ar) {
    const normalizedWord = normalize(word);
    if (normalized.includes(normalizedWord)) return true;
  }
  
  return false;
};

const filterBadWords = (text) => {
  if (!text) return text;
  let filtered = text;
  
  for (const word of BAD_WORDS_LIST.en) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '***');
  }
  
  for (const word of BAD_WORDS_LIST.ar) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '***');
  }
  
  return filtered;
};

const updateList = async (newList) => {
  if (newList.en) BAD_WORDS_LIST.en = newList.en;
  if (newList.ar) BAD_WORDS_LIST.ar = newList.ar;
  
  try {
    const { setSetting } = require('./settings.service');
    await setSetting('bad_words_list', JSON.stringify(BAD_WORDS_LIST));
  } catch (err) {
    // Silent fail - keep in memory
  }
};

const getList = () => ({ ...BAD_WORDS_LIST });

module.exports = {
  containsBadWords,
  filterBadWords,
  updateList,
  getList,
};