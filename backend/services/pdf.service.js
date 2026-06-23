'use strict';

const puppeteer = require('puppeteer');

/**
 * generateCVPdf
 * Converts CV builder data into a professional PDF using Puppeteer.
 * @param {object} cvData - CV builder data
 * @param {object} userData - user info (name, email, phone...)
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateCVPdf = async (cvData, userData) => {
  const html = buildCVHtml(cvData, userData);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format:            'A4',
      printBackground:   true,
      margin:            { top: '16mm', right: '14mm', bottom: '16mm', left: '14mm' },
      displayHeaderFooter: false,
    });

    return pdf;
  } finally {
    await browser.close();
  }
};

// ── HTML template ─────────────────────────────────────────
function buildCVHtml(cv, user) {
  const bd = cv.builderData || {};

  const primaryColor = '#1A3C6E';
  const accentColor  = '#2E75B6';
  const goldColor    = '#D4A017';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Tajawal', Arial, sans-serif;
    font-size: 11px; color: #2D3748;
    line-height: 1.65; direction: rtl;
    background: white;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);
    color: white; padding: 28px 32px;
    display: flex; align-items: center; gap: 24px;
  }
  .avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    border: 3px solid rgba(255,255,255,0.5);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 800; color: white; flex-shrink: 0;
  }
  .header-info h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .header-info .headline { font-size: 13px; opacity: 0.85; margin-bottom: 8px; }
  .contact-row { display: flex; flex-wrap: wrap; gap: 16px; }
  .contact-item { font-size: 10.5px; opacity: 0.85; display: flex; align-items: center; gap: 4px; }

  /* ── Gold separator ── */
  .gold-bar { height: 4px; background: linear-gradient(90deg, ${goldColor}, transparent); }

  /* ── Layout ── */
  .body { display: flex; gap: 0; }
  .sidebar {
    width: 220px; flex-shrink: 0;
    background: #F7FAFC; padding: 20px 18px;
    border-left: 1px solid #E2E8F0;
  }
  .main { flex: 1; padding: 20px 24px; }

  /* ── Sections ── */
  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 12px; font-weight: 800; color: ${primaryColor};
    text-transform: uppercase; letter-spacing: 0.8px;
    margin-bottom: 10px; padding-bottom: 5px;
    border-bottom: 2px solid ${accentColor};
  }
  .section-title-sm {
    font-size: 11px; font-weight: 700; color: ${primaryColor};
    margin-bottom: 8px; padding-bottom: 4px;
    border-bottom: 1.5px solid #CBD5E0;
  }

  /* ── Summary ── */
  .summary { font-size: 11px; color: #4A5568; line-height: 1.8; }

  /* ── Experience ── */
  .exp-item { margin-bottom: 14px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .exp-title { font-weight: 700; font-size: 12px; color: #2D3748; }
  .exp-company { font-size: 11px; color: ${accentColor}; font-weight: 600; }
  .exp-period { font-size: 10px; color: #718096; white-space: nowrap; }
  .exp-bullets { margin-right: 14px; }
  .exp-bullets li { font-size: 10.5px; color: #4A5568; margin-bottom: 2px; }

  /* ── Education ── */
  .edu-item { margin-bottom: 10px; }
  .edu-degree { font-weight: 700; font-size: 11px; }
  .edu-school { font-size: 10.5px; color: ${accentColor}; }
  .edu-year { font-size: 10px; color: #718096; }

  /* ── Skills ── */
  .skill-tag {
    display: inline-block; background: #EBF4FF;
    border: 1px solid #BEE3F8; color: ${primaryColor};
    border-radius: 4px; padding: 2px 8px;
    font-size: 10px; font-weight: 600; margin: 2px;
  }

  /* ── Languages ── */
  .lang-item { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 10.5px; }
  .lang-level { color: ${accentColor}; font-weight: 600; font-size: 10px; }

  /* ── Certifications ── */
  .cert-item { margin-bottom: 6px; font-size: 10.5px; }
  .cert-name { font-weight: 600; }
  .cert-org { color: #718096; font-size: 10px; }
</style>
</head>
<body>

<!-- HEADER -->
<div class="header">
  <div class="avatar">
    ${(user.fullName || 'U').charAt(0).toUpperCase()}
  </div>
  <div class="header-info">
    <h1>${escHtml(user.fullName || '')}</h1>
    <div class="headline">${escHtml(cv.headline || bd.jobTitle || '')}</div>
    <div class="contact-row">
      ${user.email ? `<span class="contact-item">📧 ${escHtml(user.email)}</span>` : ''}
      ${user.phone ? `<span class="contact-item">📱 ${escHtml(user.phone)}</span>` : ''}
      ${(user.locationCity || user.locationCountry) ? `<span class="contact-item">📍 ${escHtml([user.locationCity, user.locationCountry].filter(Boolean).join('، '))}</span>` : ''}
      ${user.linkedinUrl ? `<span class="contact-item">🔗 LinkedIn</span>` : ''}
    </div>
  </div>
</div>
<div class="gold-bar"></div>

<!-- BODY -->
<div class="body">

  <!-- SIDEBAR -->
  <div class="sidebar">

    ${buildSkillsSection(cv.skillsFormatted || bd.skills || [])}
    ${buildLanguagesSection(bd.languages || [])}
    ${buildCertificationsSection(bd.certifications || [])}
    ${buildKeywordsSection(cv.keywordsForATS || [])}

  </div>

  <!-- MAIN -->
  <div class="main">

    ${buildSummarySection(cv.summary || '')}
    ${buildExperienceSection(cv.experienceEnhanced || bd.experience || [])}
    ${buildEducationSection(bd.education || [])}

  </div>
</div>

</body>
</html>`;
}

function buildSummarySection(summary) {
  if (!summary) return '';
  return `
    <div class="section">
      <div class="section-title">الملخص المهني</div>
      <p class="summary">${escHtml(summary)}</p>
    </div>`;
}

function buildExperienceSection(exp) {
  if (!exp?.length) return '';
  const items = exp.map(e => `
    <div class="exp-item">
      <div class="exp-header">
        <div>
          <div class="exp-title">${escHtml(e.title || '')}</div>
          <div class="exp-company">${escHtml(e.company || '')}</div>
        </div>
        <div class="exp-period">${escHtml(e.period || '')}</div>
      </div>
      ${e.bullets?.length ? `
        <ul class="exp-bullets">
          ${e.bullets.map(b => `<li>${escHtml(b)}</li>`).join('')}
        </ul>` : ''}
    </div>`).join('');

  return `<div class="section"><div class="section-title">الخبرة العملية</div>${items}</div>`;
}

function buildEducationSection(edu) {
  if (!edu?.length) return '';
  const items = edu.map(e => `
    <div class="edu-item">
      <div class="edu-degree">${escHtml(e.degree || '')}</div>
      <div class="edu-school">${escHtml(e.school || '')}</div>
      <div class="edu-year">${escHtml(e.year || e.period || '')}</div>
    </div>`).join('');
  return `<div class="section"><div class="section-title">التعليم</div>${items}</div>`;
}

function buildSkillsSection(skills) {
  if (!skills?.length) return '';
  const tags = skills.map(s => `<span class="skill-tag">${escHtml(s)}</span>`).join('');
  return `<div class="section"><div class="section-title-sm">المهارات</div>${tags}</div>`;
}

function buildLanguagesSection(langs) {
  if (!langs?.length) return '';
  const items = langs.map(l => `
    <div class="lang-item">
      <span>${escHtml(l.name || l)}</span>
      <span class="lang-level">${escHtml(l.level || '')}</span>
    </div>`).join('');
  return `<div class="section"><div class="section-title-sm">اللغات</div>${items}</div>`;
}

function buildCertificationsSection(certs) {
  if (!certs?.length) return '';
  const items = certs.map(c => `
    <div class="cert-item">
      <div class="cert-name">${escHtml(c.name || c)}</div>
      ${c.org ? `<div class="cert-org">${escHtml(c.org)}</div>` : ''}
    </div>`).join('');
  return `<div class="section"><div class="section-title-sm">الشهادات والدورات</div>${items}</div>`;
}

function buildKeywordsSection(keywords) {
  if (!keywords?.length) return '';
  const tags = keywords.map(k => `<span class="skill-tag">${escHtml(k)}</span>`).join('');
  return `<div class="section"><div class="section-title-sm">كلمات مفتاحية</div>${tags}</div>`;
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { generateCVPdf };
