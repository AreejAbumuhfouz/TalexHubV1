// // // ════════════════════════════════════════════════════════════
// // // CV TEMPLATES — 4 Professional ATS-100% Designs
// // // Arial only · Black / White / Gray · Zero icons · Zero color
// // // ════════════════════════════════════════════════════════════

// // const FONT = "Arial, Helvetica, sans-serif";

// // // ── Smart skills cleaner ─────────────────────────────────────
// // export const cleanSkills = (raw = '') => {
// //   if (!raw) return '';
// //   return raw
// //     .replace(/\*\*([^*]+)\*\*/g, '$1')
// //     .replace(/\*([^*]+)\*/g, '$1')
// //     .replace(/^#+\s*/gm, '')
// //     .replace(/^[\s•·]+/gm, '')
// //     .replace(/\b(TECHNICAL SKILLS?|SOFT SKILLS?|HARD SKILLS?|Front-?End|Back-?End|Databases?|Authentication|Security|Cloud|APIs?|LANGUAGES?|Technologies)\s*[:\-]/gi, '')
// //     .replace(/[\n\r|;]+/g, ',')
// //     .replace(/,\s*,+/g, ',')
// //     .split(',')
// //     .map(s => s.replace(/^[\s:\-]+|[\s:\-]+$/g, ''))
// //     .filter(s => s.length > 1 && s.length < 60)
// //     .filter((s, i, a) => a.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
// //     .join(',  ');
// // };

// // const contactLine = (d) =>
// //   [d.email, d.phone, d.location, d.linkedin].filter(Boolean).join('   |   ');

// // const expHtml = (experiences, isAr, itemStyle) =>
// //   (experiences||[]).filter(e=>e.title||e.company).map(e=>`
// //     <div style="margin-bottom:13px${itemStyle||''}">
// //       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
// //         <tr>
// //           <td style="font-size:13px;font-weight:bold;color:#111">${e.title||''}</td>
// //           <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">
// //             ${e.startDate||''}${(e.startDate||e.endDate||e.current)?' – ':''}${e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')}
// //           </td>
// //         </tr>
// //       </table>
// //       <div style="font-size:12px;color:#444;margin-top:2px">${e.company||''}</div>
// //       ${e.description?`<div style="font-size:12px;color:#555;margin-top:4px;line-height:1.75">${e.description.replace(/\n/g,'<br>')}</div>`:''}
// //     </div>`).join('');

// // const eduHtml = (education, isAr, itemStyle) =>
// //   (education||[]).filter(e=>e.institution||e.degree).map(e=>`
// //     <div style="margin-bottom:10px${itemStyle||''}">
// //       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
// //         <tr>
// //           <td style="font-size:13px;font-weight:bold;color:#111">${[e.degree,e.field].filter(Boolean).join(', ')}</td>
// //           <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">${e.year||''}</td>
// //         </tr>
// //       </table>
// //       <div style="font-size:12px;color:#444;margin-top:2px">${e.institution||''}</div>
// //     </div>`).join('');


// // // ════════════════════════════════════════════════════════════
// // // TEMPLATE 1 — CLASSIC
// // // Two-column. Works for every industry.
// // // ════════════════════════════════════════════════════════════
// // export const classic = (d={}, lang='ar') => {
// //   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
// //   const sec = l =>
// //     `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#333;border-bottom:1px solid #333;padding-bottom:3px;margin-bottom:9px;margin-top:15px">${l}</div>`;

// //   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// // <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.75;color:#111;background:#fff;padding:36px 44px}</style>
// // </head><body>

// //   <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
// //   ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;text-transform:uppercase;letter-spacing:.8px;font-weight:600">${d.headline}</div>`:''}
// //   <div style="font-size:11px;color:#666;margin-top:8px">${contactLine(d)}</div>
// //   <hr style="border:none;border-top:2.5px solid #111;margin:12px 0 3px">
// //   <hr style="border:none;border-top:.5px solid #111;margin-bottom:14px">

// //   ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:12px;color:#333;line-height:1.85;margin-bottom:2px">${d.summary}</p>`:''}

// //   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px"><tr valign="top">
// //     <td width="63%" style="padding-${isAr?'left':'right'}:20px">
// //       ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}`:''}
// //       ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}`:''}
// //     </td>
// //     <td width="37%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
// //       ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
// //       ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
// //       ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// //     </td>
// //   </tr></table>

// // </body></html>`;
// // };


// // // ════════════════════════════════════════════════════════════
// // // TEMPLATE 2 — MINIMAL
// // // Single column. Highest ATS score. Every recruiter reads it.
// // // ════════════════════════════════════════════════════════════
// // export const minimal = (d={}, lang='ar') => {
// //   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
// //   const sec = l =>
// //     `<div style="font-size:9.5px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#555;margin-bottom:5px;margin-top:20px">${l}</div>
// //      <hr style="border:none;border-top:.5px solid #ccc;margin-bottom:11px">`;

// //   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// // <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:42px 54px}</style>
// // </head><body>

// //   <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.01em;line-height:1.1">${d.fullName||''}</div>
// //   ${d.headline?`<div style="font-size:15px;color:#555;margin-top:6px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
// //   <div style="font-size:11px;color:#888;margin-top:8px">${contactLine(d)}</div>
// //   <hr style="border:none;border-top:1px solid #ccc;margin:13px 0 0">

// //   ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p><hr style="border:none;border-top:.5px solid #ccc;margin-top:15px">`:''}
// //   ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
// //   ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
// //   ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
// //   ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
// //   ${d.certifications?`${sec(isAr?'الشهادات والدورات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}

// // </body></html>`;
// // };


// // // ════════════════════════════════════════════════════════════
// // // TEMPLATE 3 — EXECUTIVE
// // // Centered name header with thick rule. Single column.
// // // Finance, law, consulting, senior management.
// // // ════════════════════════════════════════════════════════════
// // export const executive = (d={}, lang='ar') => {
// //   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
// //   const sec = l =>
// //     `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#222;margin-top:18px;margin-bottom:4px">${l}</div>
// //      <hr style="border:none;border-top:1.5px solid #222;margin-bottom:10px">`;

// //   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// // <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:38px 52px}</style>
// // </head><body>

// //   <!-- Centered header -->
// //   <div style="text-align:center;padding-bottom:14px;border-bottom:2.5px solid #111;margin-bottom:4px">
// //     <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.06em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
// //     ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
// //     <div style="font-size:11px;color:#777;margin-top:7px">${contactLine(d)}</div>
// //   </div>
// //   <hr style="border:none;border-top:.5px solid #bbb;margin-bottom:14px">

// //   ${d.summary?`${sec(isAr?'الملخص التنفيذي':'Executive Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p>`:''}

// //   ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة المهنية':'Professional Experience')}${expHtml(d.experiences,isAr)}`:''}

// //   ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم والمؤهلات':'Education & Qualifications')}${eduHtml(d.education,isAr)}`:''}

// //   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
// //     <tr valign="top">
// //       <td width="50%" style="padding-${isAr?'left':'right'}:20px">
// //         ${d.skills?`${sec(isAr?'المهارات الأساسية':'Core Competencies')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
// //       </td>
// //       <td width="50%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
// //         ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
// //         ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// //       </td>
// //     </tr>
// //   </table>

// // </body></html>`;
// // };


// // // ════════════════════════════════════════════════════════════
// // // TEMPLATE 4 — COMPACT
// // // Dense single column. Gray section bands. Left-border accent.
// // // Engineering, academia, research. Maximum content, 1 page.
// // // ════════════════════════════════════════════════════════════
// // export const compact = (d={}, lang='ar') => {
// //   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
// //   const sec = l =>
// //     `<div style="font-size:8.5px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#111;background:#efefef;padding:4px 8px;margin-top:13px;margin-bottom:7px">${l}</div>`;
// //   const accent = isAr
// //     ? ';padding-right:9px;border-right:2px solid #888'
// //     : ';padding-left:9px;border-left:2px solid #888';

// //   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// // <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:11.5px;line-height:1.7;color:#111;background:#fff;padding:28px 38px}</style>
// // </head><body>

// //   <!-- Name + contact in one row -->
// //   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px">
// //     <tr valign="middle">
// //       <td>
// //         <div style="font-size:28px;font-weight:bold;color:#000;letter-spacing:.02em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
// //         ${d.headline?`<div style="font-size:14px;color:#444;margin-top:5px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
// //       </td>
// //       <td align="${isAr?'left':'right'}" style="font-size:10px;color:#555;vertical-align:top;padding-${isAr?'right':'left'}:8px">
// //         ${[d.email,d.phone,d.location,d.linkedin].filter(Boolean).join('<br>')}
// //       </td>
// //     </tr>
// //   </table>
// //   <hr style="border:none;border-top:2px solid #111;margin-bottom:2px">
// //   <hr style="border:none;border-top:.5px solid #111;margin-bottom:8px">

// //   ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:11.5px;color:#333;line-height:1.8">${d.summary}</p>`:''}

// //   ${expHtml(d.experiences,isAr,accent)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr,accent)}`:''}

// //   ${eduHtml(d.education,isAr,accent)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr,accent)}`:''}

// //   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px">
// //     <tr valign="top">
// //       <td width="40%">
// //         ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11px;color:#333;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}
// //       </td>
// //       <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">
// //         ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11px;color:#444;line-height:1.8">${d.languages}</p>`:''}
// //       </td>
// //       <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">
// //         ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// //       </td>
// //     </tr>
// //   </table>

// // </body></html>`;
// // };


// // // ════════════════════════════════════════════════════════════
// // // DISPATCH
// // // ════════════════════════════════════════════════════════════
// // export const renderTemplate = (data, templateId, lang='ar') => {
// //   const d = { ...data, skills: cleanSkills(data.skills||'') };
// //   switch (templateId) {
// //     case 'classic':   return classic(d, lang);
// //     case 'executive': return executive(d, lang);
// //     case 'compact':   return compact(d, lang);
// //     default:          return minimal(d, lang);
// //   }
// // };

// // export const TEMPLATES = {
// //   classic:   { id:'classic',   nameAr:'كلاسيكي', nameEn:'Classic',   ats:100, emoji:'📋', descAr:'عمودان — لجميع المجالات',         descEn:'Two-column — all industries'       },
// //   minimal:   { id:'minimal',   nameAr:'بسيط',     nameEn:'Minimal',   ats:100, emoji:'📝', descAr:'عمود واحد — أعلى توافق ATS',       descEn:'Single column — highest ATS score' },
// //   executive: { id:'executive', nameAr:'تنفيذي',   nameEn:'Executive', ats:100, emoji:'🏆', descAr:'هيدر مركزي — مالي وقانوني وإداري', descEn:'Centered header — finance & law'   },
// //   compact:   { id:'compact',   nameAr:'مكثّف',    nameEn:'Compact',   ats:100, emoji:'📌', descAr:'كثيف — هندسة وأكاديميا وبحث',      descEn:'Dense — engineering & research'    },
// // };

// // ════════════════════════════════════════════════════════════
// // CV TEMPLATES — 8 Professional ATS-100% Designs
// // 4 Original + 4 New from DOCX templates
// // ════════════════════════════════════════════════════════════

// const FONT = "Arial, Helvetica, sans-serif";

// export const cleanSkills = (raw = '') => {
//   if (!raw) return '';
//   if (typeof raw !== 'string') raw = Array.isArray(raw) ? raw.join(', ') : String(raw);
//   return raw
//     .replace(/\*\*([^*]+)\*\*/g, '$1')
//     .replace(/\*([^*]+)\*/g, '$1')
//     .replace(/^#+\s*/gm, '')
//     .replace(/^[\s•·]+/gm, '')
//     .replace(/\b(TECHNICAL SKILLS?|SOFT SKILLS?|HARD SKILLS?|Front-?End|Back-?End|Databases?|Authentication|Security|Cloud|APIs?|LANGUAGES?|Technologies)\s*[:\-]/gi, '')
//     .replace(/[\n\r|;]+/g, ',')
//     .replace(/,\s*,+/g, ',')
//     .split(',')
//     .map(s => s.replace(/^[\s:\-]+|[\s:\-]+$/g, ''))
//     .filter(s => s.length > 1 && s.length < 60)
//     .filter((s, i, a) => a.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
//     .join(',  ');
// };

// const contactLine = (d, sep = '   |   ') =>
//   [d.email, d.phone, d.location, d.linkedin].filter(Boolean).join(sep);

// const expHtml = (experiences, isAr, itemStyle) =>
//   (experiences||[]).filter(e=>e.title||e.company).map(e=>`
//     <div style="margin-bottom:13px${itemStyle||''}">
//       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
//         <tr>
//           <td style="font-size:13px;font-weight:bold;color:#111">${e.title||''}</td>
//           <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">
//             ${e.startDate||''}${(e.startDate||e.endDate||e.current)?' – ':''}${e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')}
//           </td>
//         </tr>
//       </table>
//       <div style="font-size:12px;color:#444;margin-top:2px">${e.company||''}</div>
//       ${e.description?`<div style="font-size:12px;color:#555;margin-top:4px;line-height:1.75">${e.description.replace(/\n/g,'<br>')}</div>`:''}
//     </div>`).join('');

// const eduHtml = (education, isAr, itemStyle) =>
//   (education||[]).filter(e=>e.institution||e.degree).map(e=>`
//     <div style="margin-bottom:10px${itemStyle||''}">
//       <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
//         <tr>
//           <td style="font-size:13px;font-weight:bold;color:#111">${[e.degree,e.field].filter(Boolean).join(', ')}</td>
//           <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">${e.year||''}</td>
//         </tr>
//       </table>
//       <div style="font-size:12px;color:#444;margin-top:2px">${e.institution||''}</div>
//     </div>`).join('');


// // ════════════════════════════════════════════════════════════
// // ORIGINAL TEMPLATE 1 — CLASSIC
// // ════════════════════════════════════════════════════════════
// export const classic = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const sec = l =>
//     `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#333;border-bottom:1px solid #333;padding-bottom:3px;margin-bottom:9px;margin-top:15px">${l}</div>`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.75;color:#111;background:#fff;padding:36px 44px}</style>
// </head><body>
//   <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;text-transform:uppercase;letter-spacing:.8px;font-weight:600">${d.headline}</div>`:''}
//   <div style="font-size:11px;color:#666;margin-top:8px">${contactLine(d)}</div>
//   <hr style="border:none;border-top:2.5px solid #111;margin:12px 0 3px">
//   <hr style="border:none;border-top:.5px solid #111;margin-bottom:14px">
//   ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:12px;color:#333;line-height:1.85;margin-bottom:2px">${d.summary}</p>`:''}
//   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px"><tr valign="top">
//     <td width="63%" style="padding-${isAr?'left':'right'}:20px">
//       ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}`:''}
//       ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}`:''}
//     </td>
//     <td width="37%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
//       ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
//       ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
//       ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
//     </td>
//   </tr></table>
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // ORIGINAL TEMPLATE 2 — MINIMAL
// // ════════════════════════════════════════════════════════════
// export const minimal = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const sec = l =>
//     `<div style="font-size:9.5px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#555;margin-bottom:5px;margin-top:20px">${l}</div>
//      <hr style="border:none;border-top:.5px solid #ccc;margin-bottom:11px">`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:42px 54px}</style>
// </head><body>
//   <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.01em;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:15px;color:#555;margin-top:6px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
//   <div style="font-size:11px;color:#888;margin-top:8px">${contactLine(d)}</div>
//   <hr style="border:none;border-top:1px solid #ccc;margin:13px 0 0">
//   ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p><hr style="border:none;border-top:.5px solid #ccc;margin-top:15px">`:''}
//   ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
//   ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
//   ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
//   ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
//   ${d.certifications?`${sec(isAr?'الشهادات والدورات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // ORIGINAL TEMPLATE 3 — EXECUTIVE
// // ════════════════════════════════════════════════════════════
// export const executive = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const sec = l =>
//     `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#222;margin-top:18px;margin-bottom:4px">${l}</div>
//      <hr style="border:none;border-top:1.5px solid #222;margin-bottom:10px">`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:38px 52px}</style>
// </head><body>
//   <div style="text-align:center;padding-bottom:14px;border-bottom:2.5px solid #111;margin-bottom:4px">
//     <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.06em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//     ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
//     <div style="font-size:11px;color:#777;margin-top:7px">${contactLine(d)}</div>
//   </div>
//   <hr style="border:none;border-top:.5px solid #bbb;margin-bottom:14px">
//   ${d.summary?`${sec(isAr?'الملخص التنفيذي':'Executive Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p>`:''}
//   ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة المهنية':'Professional Experience')}${expHtml(d.experiences,isAr)}`:''}
//   ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم والمؤهلات':'Education & Qualifications')}${eduHtml(d.education,isAr)}`:''}
//   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
//     <tr valign="top">
//       <td width="50%" style="padding-${isAr?'left':'right'}:20px">
//         ${d.skills?`${sec(isAr?'المهارات الأساسية':'Core Competencies')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
//       </td>
//       <td width="50%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
//         ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
//         ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
//       </td>
//     </tr>
//   </table>
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // ORIGINAL TEMPLATE 4 — COMPACT
// // ════════════════════════════════════════════════════════════
// export const compact = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const sec = l =>
//     `<div style="font-size:8.5px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#111;background:#efefef;padding:4px 8px;margin-top:13px;margin-bottom:7px">${l}</div>`;
//   const accent = isAr?';padding-right:9px;border-right:2px solid #888':';padding-left:9px;border-left:2px solid #888';
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:11.5px;line-height:1.7;color:#111;background:#fff;padding:28px 38px}</style>
// </head><body>
//   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px">
//     <tr valign="middle">
//       <td>
//         <div style="font-size:28px;font-weight:bold;color:#000;letter-spacing:.02em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//         ${d.headline?`<div style="font-size:14px;color:#444;margin-top:5px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
//       </td>
//       <td align="${isAr?'left':'right'}" style="font-size:10px;color:#555;vertical-align:top;padding-${isAr?'right':'left'}:8px">
//         ${[d.email,d.phone,d.location,d.linkedin].filter(Boolean).join('<br>')}
//       </td>
//     </tr>
//   </table>
//   <hr style="border:none;border-top:2px solid #111;margin-bottom:2px">
//   <hr style="border:none;border-top:.5px solid #111;margin-bottom:8px">
//   ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:11.5px;color:#333;line-height:1.8">${d.summary}</p>`:''}
//   ${expHtml(d.experiences,isAr,accent)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr,accent)}`:''}
//   ${eduHtml(d.education,isAr,accent)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr,accent)}`:''}
//   <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px">
//     <tr valign="top">
//       <td width="40%">${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11px;color:#333;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}</td>
//       <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11px;color:#444;line-height:1.8">${d.languages}</p>`:''}</td>
//       <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}</td>
//     </tr>
//   </table>
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // NEW TEMPLATE 5 — CLASSIC PRO (DOCX 1)
// // ════════════════════════════════════════════════════════════
// export const classicpro = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const sec = l =>
//     `<div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#000;border-bottom:1.5px solid #000;padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.7;color:#111;background:#fff;padding:36px 44px}</style>
// </head><body>
//   <div style="font-size:18px;font-weight:bold;color:#000;letter-spacing:.05em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:12px;color:#444;margin-top:5px;font-weight:600">${d.headline}</div>`:''}
//   <div style="font-size:10px;color:#323232;margin-top:6px">${contactLine(d,'  |  ')}</div>
//   <hr style="border:none;border-top:1.5px solid #000;margin:10px 0 2px">
//   ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:10px;color:#333;line-height:1.8">${d.summary}</p>`:''}
//   ${sec(isAr?'الخبرة العملية':'Work Experience')}
//   ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
//     const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
//     const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#333;margin-top:1px;line-height:1.7">•  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
//     return `<div style="margin-bottom:12px"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr><td style="font-size:10px;font-weight:bold;color:#505050">${e.title||''}${e.company?',  '+e.company:''}</td><td align="${isAr?'left':'right'}" style="font-size:10px;color:#505050;white-space:nowrap">${period}</td></tr></table>${bullets}</div>`;
//   }).join('')}
//   ${sec(isAr?'التعليم':'Education')}
//   ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:7px"><div style="font-size:10px;font-weight:bold;color:#111">${[e.degree,e.field].filter(Boolean).join(', ')}</div><div style="font-size:10px;color:#444">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
//   ${d.skills||d.languages?`${sec(isAr?'المهارات التقنية':'Technical Skills')}${d.skills?`<p style="font-size:10px;color:#333;line-height:1.85;margin-bottom:4px">${cleanSkills(d.skills)}</p>`:''}${d.languages?`<p style="font-size:10px;color:#333"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}`:''}
//   ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#333;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // NEW TEMPLATE 6 — MODERN BLUE (DOCX 2)
// // ════════════════════════════════════════════════════════════
// export const modernblue = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const BLUE='#1F497D';
//   const sec = l =>
//     `<div style="font-size:11px;font-weight:bold;color:${BLUE};text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid ${BLUE};padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.75;color:#1E1E1E;background:#fff;padding:36px 46px}</style>
// </head><body>
//   <div style="font-size:22px;font-weight:bold;color:${BLUE};letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:13px;color:#646464;margin-top:5px">${d.headline}</div>`:''}
//   <div style="font-size:10px;color:#646464;margin-top:6px">${contactLine(d,'  ·  ')}</div>
//   <hr style="border:none;border-top:1px solid ${BLUE};margin:10px 0">
//   ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:10px;color:#1E1E1E;line-height:1.8">${d.summary}</p>`:''}
//   ${sec(isAr?'الخبرة العملية':'Work Experience')}
//   ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
//     const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
//     const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#1E1E1E;margin-top:1px;line-height:1.7">•  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
//     return `<div style="margin-bottom:13px"><div style="font-size:11px;font-weight:bold;color:#1E1E1E">${e.title||''}</div><div style="font-size:10px;color:#646464;margin-top:1px">${e.company||''}${period?'  |  '+period:''}</div>${bullets}</div>`;
//   }).join('')}
//   ${sec(isAr?'التعليم':'Education')}
//   ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:bold;color:#1E1E1E">${[e.degree,e.field].filter(Boolean).join(' — ')}</div><div style="font-size:10px;color:#646464">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
//   ${sec(isAr?'المهارات':'Skills')}
//   ${d.skills?`<p style="font-size:10px;color:#1E1E1E;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}
//   ${d.languages?`<p style="font-size:10px;color:#1E1E1E;margin-top:4px"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}
//   ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#1E1E1E;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // NEW TEMPLATE 7 — EXECUTIVE PRO (DOCX 3)
// // ════════════════════════════════════════════════════════════
// export const executivepro = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const NAVY='#192D50', RED='#C00000';
//   const sec = l =>
//     `<div style="font-size:12px;font-weight:bold;color:${NAVY};border-bottom:1px solid ${NAVY};padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.78;color:#282828;background:#fff;padding:38px 50px}</style>
// </head><body>
//   <div style="font-size:24px;font-weight:bold;color:${NAVY};letter-spacing:.04em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:11px;color:${RED};margin-top:5px">${d.headline}</div>`:''}
//   <div style="font-size:10px;color:#787878;margin-top:5px">${contactLine(d,'  ·  ')}</div>
//   <hr style="border:none;border-top:1.5px solid ${NAVY};margin:10px 0">
//   ${d.summary?`${sec(isAr?'الملخص التنفيذي':'Executive Profile')}<p style="font-size:10px;color:#282828;line-height:1.85">${d.summary}</p>`:''}
//   ${d.skills?`${sec(isAr?'الكفاءات الأساسية':'Core Competencies')}<p style="font-size:10px;color:#282828;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
//   ${sec(isAr?'الخبرة المهنية':'Professional Experience')}
//   ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
//     const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
//     const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#282828;margin-top:2px;line-height:1.7">▸  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
//     return `<div style="margin-bottom:13px"><div style="font-size:11px;font-weight:bold;color:${NAVY}">${e.title||''}${e.company?' — '+e.company:''}</div><div style="font-size:10px;color:${RED};margin-top:1px">${period}</div>${bullets}</div>`;
//   }).join('')}
//   ${sec(isAr?'التعليم والمؤهلات':'Education & Credentials')}
//   ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:bold;color:${NAVY}">${[e.degree,e.field].filter(Boolean).join(', ')}</div><div style="font-size:10px;color:#787878">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
//   ${d.languages||d.certifications?`${sec(isAr?'المهارات واللغات':'Skills & Languages')}${d.languages?`<p style="font-size:10px;color:#282828;margin-bottom:4px"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}${d.certifications?`<p style="font-size:10px;color:#282828;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}`:''}
// </body></html>`;
// };

// // ════════════════════════════════════════════════════════════
// // NEW TEMPLATE 8 — CLEAN TECH (DOCX 4)
// // ════════════════════════════════════════════════════════════
// export const cleantech = (d={}, lang='ar') => {
//   const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
//   const TEAL='#006969';
//   const sec = l =>
//     `<div style="font-size:10.5px;font-weight:bold;color:${TEAL};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${TEAL};padding-bottom:2px;margin-bottom:7px;margin-top:14px">${l}</div>`;
//   return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
// <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.7;color:#191919;background:#fff;padding:32px 44px}</style>
// </head><body>
//   <div style="font-size:20px;font-weight:bold;color:#191919;letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
//   ${d.headline?`<div style="font-size:12px;color:${TEAL};margin-top:4px">${d.headline}</div>`:''}
//   <div style="font-size:9.5px;color:#646464;margin-top:5px">${contactLine(d,'  |  ')}</div>
//   <hr style="border:none;border-top:1.5px solid #191919;margin:8px 0">
//   ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:10px;color:#191919;line-height:1.8">${d.summary}</p>`:''}
//   ${d.skills?`${sec(isAr?'المهارات التقنية':'Technical Skills')}<p style="font-size:10px;color:#191919;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}
//   ${sec(isAr?'الخبرة العملية':'Work Experience')}
//   ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
//     const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
//     const header=[e.title,e.company,period].filter(Boolean).join('  |  ');
//     const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#191919;margin-top:2px;line-height:1.7">–  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
//     return `<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:bold;color:#191919">${header}</div>${bullets}</div>`;
//   }).join('')}
//   ${sec(isAr?'التعليم':'Education')}
//   ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="font-size:10px;color:#191919;margin-bottom:5px">${[[e.degree,e.field].filter(Boolean).join(', '),e.institution,e.year].filter(Boolean).join('  |  ')}</div>`).join('')}
//   ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#191919;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
//   ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:10px;color:#191919">${d.languages}</p>`:''}
// </body></html>`;
// };


// // ════════════════════════════════════════════════════════════
// // DISPATCH
// // ════════════════════════════════════════════════════════════
// export const renderTemplate = (data, templateId, lang='ar') => {
//   const d = { ...data, skills: cleanSkills(data.skills||'') };
//   switch (templateId) {
//     case 'classic':      return classic(d, lang);
//     case 'executive':    return executive(d, lang);
//     case 'compact':      return compact(d, lang);
//     case 'classicpro':   return classicpro(d, lang);
//     case 'modernblue':   return modernblue(d, lang);
//     case 'executivepro': return executivepro(d, lang);
//     case 'cleantech':    return cleantech(d, lang);
//     default:             return minimal(d, lang);
//   }
// };

// // ════════════════════════════════════════════════════════════
// // TEMPLATES CONFIG
// // Icons: Lucide names — rendered in UI as <Icon> components
// // theme: 'dark' = white icon on dark bg | 'light' = black icon on white bg
// // ════════════════════════════════════════════════════════════
// export const TEMPLATES = {
//   classic:      { id:'classic',      nameAr:'كلاسيكي',      nameEn:'Classic',       ats:100, icon:'FileText',    theme:'dark',  descAr:'عمودان — لجميع المجالات',             descEn:'Two-column — all industries'        },
//   minimal:      { id:'minimal',      nameAr:'بسيط',          nameEn:'Minimal',       ats:100, icon:'AlignLeft',   theme:'dark',  descAr:'عمود واحد — أعلى توافق ATS',          descEn:'Single column — highest ATS score'  },
//   executive:    { id:'executive',    nameAr:'تنفيذي',        nameEn:'Executive',     ats:100, icon:'Award',       theme:'dark',  descAr:'هيدر مركزي — مالي وقانوني وإداري',   descEn:'Centered header — finance & law'    },
//   compact:      { id:'compact',      nameAr:'مكثّف',          nameEn:'Compact',       ats:100, icon:'LayoutList',  theme:'dark',  descAr:'كثيف — هندسة وأكاديميا وبحث',        descEn:'Dense — engineering & research'     },
//   classicpro:   { id:'classicpro',   nameAr:'كلاسيكي برو',   nameEn:'Classic Pro',   ats:100, icon:'File',        theme:'light', descAr:'أبيض وأسود احترافي — لجميع المجالات', descEn:'Clean black & white — all fields'   },
//   modernblue:   { id:'modernblue',   nameAr:'عصري أزرق',     nameEn:'Modern Blue',   ats:100, icon:'Briefcase',   theme:'light', descAr:'أزرق احترافي — تسويق وأعمال',        descEn:'Blue accent — marketing & business' },
//   executivepro: { id:'executivepro', nameAr:'تنفيذي برو',    nameEn:'Executive Pro', ats:100, icon:'Crown',       theme:'light', descAr:'نيفي وأحمر — مالي وتنفيذي C-level',  descEn:'Navy & red — finance & C-level'     },
//   cleantech:    { id:'cleantech',    nameAr:'تقني نظيف',     nameEn:'Clean Tech',    ats:100, icon:'Code2',       theme:'light', descAr:'تيل احترافي — هندسة وتقنية وبيانات', descEn:'Teal accent — tech & engineering'   },
// };

// ════════════════════════════════════════════════════════════
// CV TEMPLATES — 8 Professional ATS-100% Designs
// 4 Original + 4 New from DOCX templates
// ════════════════════════════════════════════════════════════

const FONT = "Arial, Helvetica, sans-serif";

export const cleanSkills = (raw = '') => {
  if (!raw) return '';
  if (typeof raw !== 'string') raw = Array.isArray(raw) ? raw.join(', ') : String(raw);
  return raw
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#+\s*/gm, '')
    .replace(/^[\s•·]+/gm, '')
    .replace(/\b(TECHNICAL SKILLS?|SOFT SKILLS?|HARD SKILLS?|Front-?End|Back-?End|Databases?|Authentication|Security|Cloud|APIs?|LANGUAGES?|Technologies)\s*[:\-]/gi, '')
    .replace(/[\n\r|;]+/g, ',')
    .replace(/,\s*,+/g, ',')
    .split(',')
    .map(s => s.replace(/^[\s:\-]+|[\s:\-]+$/g, ''))
    .filter(s => s.length > 1 && s.length < 60)
    .filter((s, i, a) => a.findIndex(x => x.toLowerCase() === s.toLowerCase()) === i)
    .join(',  ');
};

const contactLine = (d, sep = '   |   ') =>
  [d.email, d.phone, d.location, d.linkedin].filter(Boolean).join(sep);

const expHtml = (experiences, isAr, itemStyle) =>
  (experiences||[]).filter(e=>e.title||e.company).map(e=>`
    <div style="margin-bottom:13px${itemStyle||''}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        <tr>
          <td style="font-size:13px;font-weight:bold;color:#111">${e.title||''}</td>
          <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">
            ${e.startDate||''}${(e.startDate||e.endDate||e.current)?' – ':''}${e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')}
          </td>
        </tr>
      </table>
      <div style="font-size:12px;color:#444;margin-top:2px">${e.company||''}</div>
      ${e.description?`<div style="font-size:12px;color:#555;margin-top:4px;line-height:1.75">${e.description.replace(/\n/g,'<br>')}</div>`:''}
    </div>`).join('');

const eduHtml = (education, isAr, itemStyle) =>
  (education||[]).filter(e=>e.institution||e.degree).map(e=>`
    <div style="margin-bottom:10px${itemStyle||''}">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
        <tr>
          <td style="font-size:13px;font-weight:bold;color:#111">${[e.degree,e.field].filter(Boolean).join(', ')}</td>
          <td align="${isAr?'left':'right'}" style="font-size:11px;color:#555;white-space:nowrap;vertical-align:top">${e.year||''}</td>
        </tr>
      </table>
      <div style="font-size:12px;color:#444;margin-top:2px">${e.institution||''}</div>
    </div>`).join('');


// ════════════════════════════════════════════════════════════
// ORIGINAL TEMPLATE 1 — CLASSIC
// ════════════════════════════════════════════════════════════
export const classic = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const sec = l =>
    `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#333;border-bottom:1px solid #333;padding-bottom:3px;margin-bottom:9px;margin-top:15px">${l}</div>`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.75;color:#111;background:#fff;padding:36px 44px}</style>
</head><body>
  <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;text-transform:uppercase;letter-spacing:.8px;font-weight:600">${d.headline}</div>`:''}
  <div style="font-size:11px;color:#666;margin-top:8px">${contactLine(d)}</div>
  <hr style="border:none;border-top:2.5px solid #111;margin:12px 0 3px">
  <hr style="border:none;border-top:.5px solid #111;margin-bottom:14px">
  ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:12px;color:#333;line-height:1.85;margin-bottom:2px">${d.summary}</p>`:''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px"><tr valign="top">
    <td width="63%" style="padding-${isAr?'left':'right'}:20px">
      ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}`:''}
      ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}`:''}
    </td>
    <td width="37%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
      ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
      ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
      ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
    </td>
  </tr></table>
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// ORIGINAL TEMPLATE 2 — MINIMAL
// ════════════════════════════════════════════════════════════
export const minimal = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const sec = l =>
    `<div style="font-size:9.5px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#555;margin-bottom:5px;margin-top:20px">${l}</div>
     <hr style="border:none;border-top:.5px solid #ccc;margin-bottom:11px">`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:42px 54px}</style>
</head><body>
  <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.01em;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:15px;color:#555;margin-top:6px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
  <div style="font-size:11px;color:#888;margin-top:8px">${contactLine(d)}</div>
  <hr style="border:none;border-top:1px solid #ccc;margin:13px 0 0">
  ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p><hr style="border:none;border-top:.5px solid #ccc;margin-top:15px">`:''}
  ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
  ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr)}<hr style="border:none;border-top:.5px solid #ccc;margin-top:5px">`:''}
  ${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
  ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
  ${d.certifications?`${sec(isAr?'الشهادات والدورات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// ORIGINAL TEMPLATE 3 — EXECUTIVE
// ════════════════════════════════════════════════════════════
export const executive = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const sec = l =>
    `<div style="font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:3px;color:#222;margin-top:18px;margin-bottom:4px">${l}</div>
     <hr style="border:none;border-top:1.5px solid #222;margin-bottom:10px">`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:12px;line-height:1.8;color:#111;background:#fff;padding:38px 52px}</style>
</head><body>
  <div style="text-align:center;padding-bottom:14px;border-bottom:2.5px solid #111;margin-bottom:4px">
    <div style="font-size:30px;font-weight:bold;color:#000;letter-spacing:.06em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
    ${d.headline?`<div style="font-size:15px;color:#444;margin-top:6px;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
    <div style="font-size:11px;color:#777;margin-top:7px">${contactLine(d)}</div>
  </div>
  <hr style="border:none;border-top:.5px solid #bbb;margin-bottom:14px">
  ${d.summary?`${sec(isAr?'الملخص التنفيذي':'Executive Summary')}<p style="font-size:12px;color:#333;line-height:1.85">${d.summary}</p>`:''}
  ${expHtml(d.experiences,isAr)?`${sec(isAr?'الخبرة المهنية':'Professional Experience')}${expHtml(d.experiences,isAr)}`:''}
  ${eduHtml(d.education,isAr)?`${sec(isAr?'التعليم والمؤهلات':'Education & Qualifications')}${eduHtml(d.education,isAr)}`:''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
    <tr valign="top">
      <td width="50%" style="padding-${isAr?'left':'right'}:20px">
        ${d.skills?`${sec(isAr?'المهارات الأساسية':'Core Competencies')}<p style="font-size:11.5px;color:#333;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
      </td>
      <td width="50%" style="padding-${isAr?'right':'left'}:20px;border-${isAr?'right':'left'}:1px solid #ddd">
        ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11.5px;color:#444;line-height:1.8">${d.languages}</p>`:''}
        ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11.5px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
      </td>
    </tr>
  </table>
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// ORIGINAL TEMPLATE 4 — COMPACT
// ════════════════════════════════════════════════════════════
export const compact = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const sec = l =>
    `<div style="font-size:8.5px;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;color:#111;background:#efefef;padding:4px 8px;margin-top:13px;margin-bottom:7px">${l}</div>`;
  const accent = isAr?';padding-right:9px;border-right:2px solid #888':';padding-left:9px;border-left:2px solid #888';
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:11.5px;line-height:1.7;color:#111;background:#fff;padding:28px 38px}</style>
</head><body>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:4px">
    <tr valign="middle">
      <td>
        <div style="font-size:28px;font-weight:bold;color:#000;letter-spacing:.02em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
        ${d.headline?`<div style="font-size:14px;color:#444;margin-top:5px;text-transform:uppercase;letter-spacing:.5px;font-weight:600">${d.headline}</div>`:''}
      </td>
      <td align="${isAr?'left':'right'}" style="font-size:10px;color:#555;vertical-align:top;padding-${isAr?'right':'left'}:8px">
        ${[d.email,d.phone,d.location,d.linkedin].filter(Boolean).join('<br>')}
      </td>
    </tr>
  </table>
  <hr style="border:none;border-top:2px solid #111;margin-bottom:2px">
  <hr style="border:none;border-top:.5px solid #111;margin-bottom:8px">
  ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:11.5px;color:#333;line-height:1.8">${d.summary}</p>`:''}
  ${expHtml(d.experiences,isAr,accent)?`${sec(isAr?'الخبرة العملية':'Work Experience')}${expHtml(d.experiences,isAr,accent)}`:''}
  ${eduHtml(d.education,isAr,accent)?`${sec(isAr?'التعليم':'Education')}${eduHtml(d.education,isAr,accent)}`:''}
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-top:4px">
    <tr valign="top">
      <td width="40%">${d.skills?`${sec(isAr?'المهارات':'Skills')}<p style="font-size:11px;color:#333;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}</td>
      <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:11px;color:#444;line-height:1.8">${d.languages}</p>`:''}</td>
      <td width="30%" style="padding-${isAr?'right':'left'}:10px;border-${isAr?'right':'left'}:1px solid #ddd">${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:11px;color:#444;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}</td>
    </tr>
  </table>
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// NEW TEMPLATE 5 — CLASSIC PRO (DOCX 1)
// ════════════════════════════════════════════════════════════
export const classicpro = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const sec = l =>
    `<div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1.5px;color:#000;border-bottom:1.5px solid #000;padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.7;color:#111;background:#fff;padding:36px 44px}</style>
</head><body>
  <div style="font-size:18px;font-weight:bold;color:#000;letter-spacing:.05em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:12px;color:#444;margin-top:5px;font-weight:600">${d.headline}</div>`:''}
  <div style="font-size:10px;color:#323232;margin-top:6px">${contactLine(d,'  |  ')}</div>
  <hr style="border:none;border-top:1.5px solid #000;margin:10px 0 2px">
  ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:10px;color:#333;line-height:1.8">${d.summary}</p>`:''}
  ${sec(isAr?'الخبرة العملية':'Work Experience')}
  ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
    const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
    const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#333;margin-top:1px;line-height:1.7">•  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
    return `<div style="margin-bottom:12px"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse"><tr><td style="font-size:10px;font-weight:bold;color:#505050">${e.title||''}${e.company?',  '+e.company:''}</td><td align="${isAr?'left':'right'}" style="font-size:10px;color:#505050;white-space:nowrap">${period}</td></tr></table>${bullets}</div>`;
  }).join('')}
  ${sec(isAr?'التعليم':'Education')}
  ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:7px"><div style="font-size:10px;font-weight:bold;color:#111">${[e.degree,e.field].filter(Boolean).join(', ')}</div><div style="font-size:10px;color:#444">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
  ${d.skills||d.languages?`${sec(isAr?'المهارات التقنية':'Technical Skills')}${d.skills?`<p style="font-size:10px;color:#333;line-height:1.85;margin-bottom:4px">${cleanSkills(d.skills)}</p>`:''}${d.languages?`<p style="font-size:10px;color:#333"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}`:''}
  ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#333;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// NEW TEMPLATE 6 — MODERN BLUE (DOCX 2)
// ════════════════════════════════════════════════════════════
export const modernblue = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const BLUE='#1F497D';
  const sec = l =>
    `<div style="font-size:11px;font-weight:bold;color:${BLUE};text-transform:uppercase;letter-spacing:1px;border-bottom:1.5px solid ${BLUE};padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.75;color:#1E1E1E;background:#fff;padding:36px 46px}</style>
</head><body>
  <div style="font-size:22px;font-weight:bold;color:${BLUE};letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:13px;color:#646464;margin-top:5px">${d.headline}</div>`:''}
  <div style="font-size:10px;color:#646464;margin-top:6px">${contactLine(d,'  ·  ')}</div>
  <hr style="border:none;border-top:1px solid ${BLUE};margin:10px 0">
  ${d.summary?`${sec(isAr?'الملخص المهني':'Professional Summary')}<p style="font-size:10px;color:#1E1E1E;line-height:1.8">${d.summary}</p>`:''}
  ${sec(isAr?'الخبرة العملية':'Work Experience')}
  ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
    const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
    const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#1E1E1E;margin-top:1px;line-height:1.7">•  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
    return `<div style="margin-bottom:13px"><div style="font-size:11px;font-weight:bold;color:#1E1E1E">${e.title||''}</div><div style="font-size:10px;color:#646464;margin-top:1px">${e.company||''}${period?'  |  '+period:''}</div>${bullets}</div>`;
  }).join('')}
  ${sec(isAr?'التعليم':'Education')}
  ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:bold;color:#1E1E1E">${[e.degree,e.field].filter(Boolean).join(' — ')}</div><div style="font-size:10px;color:#646464">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
  ${sec(isAr?'المهارات':'Skills')}
  ${d.skills?`<p style="font-size:10px;color:#1E1E1E;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}
  ${d.languages?`<p style="font-size:10px;color:#1E1E1E;margin-top:4px"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}
  ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#1E1E1E;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// NEW TEMPLATE 7 — EXECUTIVE PRO (DOCX 3)
// ════════════════════════════════════════════════════════════
export const executivepro = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const NAVY='#192D50', RED='#C00000';
  const sec = l =>
    `<div style="font-size:12px;font-weight:bold;color:${NAVY};border-bottom:1px solid ${NAVY};padding-bottom:3px;margin-bottom:8px;margin-top:16px">${l}</div>`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.78;color:#282828;background:#fff;padding:38px 50px}</style>
</head><body>
  <div style="font-size:24px;font-weight:bold;color:${NAVY};letter-spacing:.04em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:11px;color:${RED};margin-top:5px">${d.headline}</div>`:''}
  <div style="font-size:10px;color:#787878;margin-top:5px">${contactLine(d,'  ·  ')}</div>
  <hr style="border:none;border-top:1.5px solid ${NAVY};margin:10px 0">
  ${d.summary?`${sec(isAr?'الملخص التنفيذي':'Executive Profile')}<p style="font-size:10px;color:#282828;line-height:1.85">${d.summary}</p>`:''}
  ${d.skills?`${sec(isAr?'الكفاءات الأساسية':'Core Competencies')}<p style="font-size:10px;color:#282828;line-height:1.9">${cleanSkills(d.skills)}</p>`:''}
  ${sec(isAr?'الخبرة المهنية':'Professional Experience')}
  ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
    const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
    const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#282828;margin-top:2px;line-height:1.7">▸  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
    return `<div style="margin-bottom:13px"><div style="font-size:11px;font-weight:bold;color:${NAVY}">${e.title||''}${e.company?' — '+e.company:''}</div><div style="font-size:10px;color:${RED};margin-top:1px">${period}</div>${bullets}</div>`;
  }).join('')}
  ${sec(isAr?'التعليم والمؤهلات':'Education & Credentials')}
  ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="margin-bottom:8px"><div style="font-size:10px;font-weight:bold;color:${NAVY}">${[e.degree,e.field].filter(Boolean).join(', ')}</div><div style="font-size:10px;color:#787878">${e.institution||''}${e.year?'  |  '+e.year:''}</div></div>`).join('')}
  ${d.languages||d.certifications?`${sec(isAr?'المهارات واللغات':'Skills & Languages')}${d.languages?`<p style="font-size:10px;color:#282828;margin-bottom:4px"><strong>${isAr?'اللغات:':'Languages:'}</strong> ${d.languages}</p>`:''}${d.certifications?`<p style="font-size:10px;color:#282828;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}`:''}
</body></html>`;
};

// ════════════════════════════════════════════════════════════
// NEW TEMPLATE 8 — CLEAN TECH (DOCX 4)
// ════════════════════════════════════════════════════════════
export const cleantech = (d={}, lang='ar') => {
  const isAr = lang==='ar', dir=isAr?'rtl':'ltr';
  const TEAL='#006969';
  const sec = l =>
    `<div style="font-size:10.5px;font-weight:bold;color:${TEAL};text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid ${TEAL};padding-bottom:2px;margin-bottom:7px;margin-top:14px">${l}</div>`;
  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="UTF-8">
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:${FONT};font-size:10px;line-height:1.7;color:#191919;background:#fff;padding:32px 44px}</style>
</head><body>
  <div style="font-size:20px;font-weight:bold;color:#191919;letter-spacing:.03em;text-transform:uppercase;line-height:1.1">${d.fullName||''}</div>
  ${d.headline?`<div style="font-size:12px;color:${TEAL};margin-top:4px">${d.headline}</div>`:''}
  <div style="font-size:9.5px;color:#646464;margin-top:5px">${contactLine(d,'  |  ')}</div>
  <hr style="border:none;border-top:1.5px solid #191919;margin:8px 0">
  ${d.summary?`${sec(isAr?'الملخص':'Summary')}<p style="font-size:10px;color:#191919;line-height:1.8">${d.summary}</p>`:''}
  ${d.skills?`${sec(isAr?'المهارات التقنية':'Technical Skills')}<p style="font-size:10px;color:#191919;line-height:1.85">${cleanSkills(d.skills)}</p>`:''}
  ${sec(isAr?'الخبرة العملية':'Work Experience')}
  ${(d.experiences||[]).filter(e=>e.title||e.company).map(e=>{
    const period=[e.startDate||'',(e.startDate||e.endDate||e.current)?' – ':'',e.current?(isAr?'حتى الآن':'Present'):(e.endDate||'')].join('');
    const header=[e.title,e.company,period].filter(Boolean).join('  |  ');
    const bullets=e.description?e.description.split('\n').filter(l=>l.trim()).map(l=>`<div style="font-size:10px;color:#191919;margin-top:2px;line-height:1.7">–  ${l.replace(/^[•\-\*▸–]\s*/,'')}</div>`).join(''):'';
    return `<div style="margin-bottom:12px"><div style="font-size:11px;font-weight:bold;color:#191919">${header}</div>${bullets}</div>`;
  }).join('')}
  ${sec(isAr?'التعليم':'Education')}
  ${(d.education||[]).filter(e=>e.institution||e.degree).map(e=>`<div style="font-size:10px;color:#191919;margin-bottom:5px">${[[e.degree,e.field].filter(Boolean).join(', '),e.institution,e.year].filter(Boolean).join('  |  ')}</div>`).join('')}
  ${d.certifications?`${sec(isAr?'الشهادات':'Certifications')}<p style="font-size:10px;color:#191919;white-space:pre-line;line-height:1.8">${d.certifications}</p>`:''}
  ${d.languages?`${sec(isAr?'اللغات':'Languages')}<p style="font-size:10px;color:#191919">${d.languages}</p>`:''}
</body></html>`;
};


// ════════════════════════════════════════════════════════════
// DISPATCH
// ════════════════════════════════════════════════════════════
export const renderTemplate = (data, templateId, lang='ar') => {
  const d = { ...data, skills: cleanSkills(data.skills||'') };
  switch (templateId) {
    case 'classic':      return classic(d, lang);
    case 'executive':    return executive(d, lang);
    case 'compact':      return compact(d, lang);
    case 'classicpro':   return classicpro(d, lang);
    case 'modernblue':   return modernblue(d, lang);
    case 'executivepro': return executivepro(d, lang);
    case 'cleantech':    return cleantech(d, lang);
    default:             return minimal(d, lang);
  }
};

// ════════════════════════════════════════════════════════════
// TEMPLATES CONFIG
// Icons: Lucide names — rendered in UI as <Icon> components
// theme: 'dark' = white icon on dark bg | 'light' = black icon on white bg
// ════════════════════════════════════════════════════════════
export const TEMPLATES = {
  classic:      { id:'classic',      nameAr:'كلاسيكي',      nameEn:'Classic',       ats:100, icon:'FileText',    theme:'dark',  descAr:'عمودان — لجميع المجالات',             descEn:'Two-column — all industries'        },
  minimal:      { id:'minimal',      nameAr:'بسيط',          nameEn:'Minimal',       ats:100, icon:'AlignLeft',   theme:'dark',  descAr:'عمود واحد — أعلى توافق ATS',          descEn:'Single column — highest ATS score'  },
  executive:    { id:'executive',    nameAr:'تنفيذي',        nameEn:'Executive',     ats:100, icon:'Award',       theme:'dark',  descAr:'هيدر مركزي — مالي وقانوني وإداري',   descEn:'Centered header — finance & law'    },
  compact:      { id:'compact',      nameAr:'مكثّف',          nameEn:'Compact',       ats:100, icon:'LayoutList',  theme:'dark',  descAr:'كثيف — هندسة وأكاديميا وبحث',        descEn:'Dense — engineering & research'     },
  classicpro:   { id:'classicpro',   nameAr:'كلاسيكي برو',   nameEn:'Classic Pro',   ats:100, icon:'File',        theme:'light', descAr:'أبيض وأسود احترافي — لجميع المجالات', descEn:'Clean black & white — all fields'   },
  modernblue:   { id:'modernblue',   nameAr:'عصري أزرق',     nameEn:'Modern Blue',   ats:100, icon:'Briefcase',   theme:'light', descAr:'أزرق احترافي — تسويق وأعمال',        descEn:'Blue accent — marketing & business' },
  executivepro: { id:'executivepro', nameAr:'تنفيذي برو',    nameEn:'Executive Pro', ats:100, icon:'Crown',       theme:'light', descAr:'نيفي وأحمر — مالي وتنفيذي C-level',  descEn:'Navy & red — finance & C-level'     },
  cleantech:    { id:'cleantech',    nameAr:'تقني نظيف',     nameEn:'Clean Tech',    ats:100, icon:'Code2',       theme:'light', descAr:'تيل احترافي — هندسة وتقنية وبيانات', descEn:'Teal accent — tech & engineering'   },
};