'use strict';

/**
 * Server-side CV template renderer
 * Mirrors the frontend cv-templates.js but runs in Node.js
 * Used to generate PDF attachments for auto-apply emails
 */

const TEMPLATES = {
  classic: { id: 'classic', nameEn: 'Classic' },
  minimal: { id: 'minimal', nameEn: 'Minimal' },
  executive: { id: 'executive', nameEn: 'Executive' },
  compact: { id: 'compact', nameEn: 'Compact' },
  classicpro: { id: 'classicpro', nameEn: 'Classic Pro' },
  modernblue: { id: 'modernblue', nameEn: 'Modern Blue' },
  executivepro: { id: 'executivepro', nameEn: 'Executive Pro' },
  cleantech: { id: 'cleantech', nameEn: 'Clean Tech' },
};

function cleanSkills(raw = '') {
  if (!raw) return [];
  if (typeof raw !== 'string') raw = Array.isArray(raw) ? raw.join(', ') : String(raw);
  return raw.split(/[,\n|•·]+/).map(s => s.trim()).filter(s => s.length > 1);
}

function formatDate(d) {
  if (!d) return '';
  if (d === 'Present' || d === 'الحاضر') return d;
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); }
  catch { return d; }
}

function renderTemplateToHtml(cvData = {}, template = 'classic', lang = 'en') {
  const isAr = lang === 'ar';
  const dir  = isAr ? 'rtl' : 'ltr';
  const font = isAr ? "'Noto Sans Arabic', Arial, sans-serif" : "'Inter', 'Segoe UI', Arial, sans-serif";

  const skills   = cleanSkills(cvData.skills);
  const langs    = cleanSkills(cvData.languages);
  const certs    = cleanSkills(cvData.certifications);
  const exps     = cvData.experiences?.filter(e => e.title || e.company) || [];
  const edus     = cvData.education?.filter(e => e.institution || e.degree) || [];

  const expHtml = exps.map(e => `
    <div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px">
        <strong style="font-size:14px">${e.title || ''}</strong>
        <span style="font-size:11px;color:#6B7280">${formatDate(e.startDate)}${e.endDate || e.current ? ` – ${e.current ? (isAr ? 'الحاضر' : 'Present') : formatDate(e.endDate)}` : ''}</span>
      </div>
      <div style="font-size:12px;color:#6B7280;margin:2px 0">${e.company || ''}${e.location ? `, ${e.location}` : ''}</div>
      ${e.description ? `<div style="font-size:12px;color:#374151;margin-top:6px;white-space:pre-line">${e.description}</div>` : ''}
    </div>`).join('');

  const eduHtml = edus.map(e => `
    <div style="margin-bottom:12px">
      <strong style="font-size:13px">${e.degree || ''}${e.field ? ` – ${e.field}` : ''}</strong>
      <div style="font-size:12px;color:#6B7280">${e.institution || ''}${e.year ? ` · ${e.year}` : ''}</div>
    </div>`).join('');

  const skillsHtml = skills.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${skills.map(s => `<span style="font-size:11px;padding:3px 8px;border-radius:99px;background:#F3F4F6;color:#374151;border:1px solid #E5E7EB">${s}</span>`).join('')}</div>`
    : '';

  const section = (title, content) => content ? `
    <div style="margin-bottom:22px">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#6B7280;margin-bottom:10px;padding-bottom:4px;border-bottom:1px solid #E5E7EB">${title}</div>
      ${content}
    </div>` : '';

  // ── Classic template (default) ──
  const bodyContent = `
    ${section(isAr ? 'الملخص المهني' : 'Professional Summary', cvData.summary ? `<p style="font-size:13px;color:#374151;line-height:1.7">${cvData.summary}</p>` : '')}
    ${section(isAr ? 'الخبرات العملية' : 'Work Experience', expHtml)}
    ${section(isAr ? 'التعليم' : 'Education', eduHtml)}
    ${section(isAr ? 'المهارات' : 'Skills', skillsHtml)}
    ${langs.length ? section(isAr ? 'اللغات' : 'Languages', `<div style="font-size:12px;color:#374151">${langs.join(' · ')}</div>`) : ''}
    ${certs.length ? section(isAr ? 'الشهادات' : 'Certifications', `<ul style="margin:0;padding-inline-start:16px">${certs.map(c => `<li style="font-size:12px;color:#374151;margin-bottom:3px">${c}</li>`).join('')}</ul>`) : ''}
  `;

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @page { margin: 18mm 15mm; size: A4; }
  * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; }
  body { font-family: ${font}; background:#fff; color:#111; }
</style>
</head>
<body>
  <div style="padding:32px 40px;max-width:800px;margin:0 auto">
    <!-- Header -->
    <div style="margin-bottom:24px;padding-bottom:20px;border-bottom:2px solid #111">
      <h1 style="font-size:26px;font-weight:800;letter-spacing:-0.03em;margin-bottom:4px">${cvData.fullName || ''}</h1>
      ${cvData.headline ? `<p style="font-size:14px;color:#6B7280;font-weight:500;margin-bottom:8px">${cvData.headline}</p>` : ''}
      <div style="font-size:11px;color:#6B7280;display:flex;flex-wrap:wrap;gap:12px">
        ${cvData.email    ? `<span>${cvData.email}</span>`    : ''}
        ${cvData.phone    ? `<span>${cvData.phone}</span>`    : ''}
        ${cvData.location ? `<span>${cvData.location}</span>` : ''}
        ${cvData.linkedin ? `<span>${cvData.linkedin}</span>` : ''}
      </div>
    </div>
    <!-- Body -->
    ${bodyContent}
  </div>
</body>
</html>`;
}

module.exports = { renderTemplateToHtml, TEMPLATES };