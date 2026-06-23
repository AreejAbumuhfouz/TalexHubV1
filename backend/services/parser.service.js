'use strict';

const pdfParse = require('pdf-parse');
const mammoth  = require('mammoth');

/**
 * extractText
 * Extracts raw text from a PDF or DOCX buffer.
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {Promise<string>}
 */
const extractText = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text || '';
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || '';
    }

    throw new Error(`Unsupported mime type: ${mimeType}`);
  } catch (err) {
    throw new Error(`Text extraction failed: ${err.message}`);
  }
};

/**
 * parseCV
 * Tries to extract structured sections from raw text.
 * Returns a structured object for AI prompt context.
 */
const parseCV = (rawText) => {
  const text     = rawText.trim();
  const lines    = text.split('\n').map(l => l.trim()).filter(Boolean);
  const wordCount = text.split(/\s+/).length;

  // Section detection by keywords
  const sections = {
    contact:    extractSection(text, ['contact', 'phone', 'email', 'address', 'بريد', 'هاتف', 'عنوان']),
    summary:    extractSection(text, ['summary', 'objective', 'profile', 'ملخص', 'هدف', 'نبذة']),
    experience: extractSection(text, ['experience', 'work history', 'employment', 'خبرة', 'عمل']),
    education:  extractSection(text, ['education', 'degree', 'university', 'تعليم', 'جامعة', 'شهادة']),
    skills:     extractSection(text, ['skills', 'technologies', 'tools', 'مهارات', 'تقنيات']),
    languages:  extractSection(text, ['languages', 'lingual', 'لغات']),
    certifications: extractSection(text, ['certifications', 'courses', 'شهادات', 'دورات']),
  };

  return {
    rawText,
    wordCount,
    lineCount:   lines.length,
    sections,
    hasContact:      sections.contact.length > 0,
    hasExperience:   sections.experience.length > 0,
    hasEducation:    sections.education.length > 0,
    hasSkills:       sections.skills.length > 0,
    hasSummary:      sections.summary.length > 0,
    hasCertifications: sections.certifications.length > 0,
  };
};

function extractSection(text, keywords) {
  const lowerText = text.toLowerCase();
  const lines     = text.split('\n');

  for (const keyword of keywords) {
    const idx = lowerText.indexOf(keyword.toLowerCase());
    if (idx !== -1) {
      // Return ~300 chars from that section
      return text.substring(idx, idx + 300).trim();
    }
  }
  return '';
}

module.exports = { extractText, parseCV };
