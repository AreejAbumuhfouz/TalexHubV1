// // // // // 'use strict';
// // // // // require('dotenv').config();
// // // // // const { sequelize } = require('../models');

// // // // // (async () => {
// // // // //   try {
// // // // //     // Hard delete all jobs (bypass soft-delete) + related applications
// // // // //     await sequelize.query('DELETE FROM job_applications');
// // // // //     await sequelize.query('DELETE FROM jobs');
// // // // //     console.log('✅ All jobs and job_applications deleted');
// // // // //     process.exit(0);
// // // // //   } catch (e) {
// // // // //     console.error('❌ Error:', e.message);
// // // // //     process.exit(1);
// // // // //   }
// // // // // })();

// // // // 'use strict';
// // // // require('dotenv').config();
// // // // const { sequelize, Job, Company, User } = require('../models');
// // // // const { v4: uuidv4 } = require('uuid');

// // // // const TEST_EMAIL = 'Areejabumahfouz@gmail.com';

// // // // // ════════════════════════════════════════════════════════════
// // // // // Sample jobs — varied titles/skills for realistic match testing
// // // // // ════════════════════════════════════════════════════════════
// // // // const JOB_TEMPLATES = [
// // // //   {
// // // //     title: 'Full Stack Web Developer',
// // // //     description: 'We are looking for a Full Stack Developer experienced in React, Node.js, and PostgreSQL to join our growing engineering team. You will build and maintain web applications end-to-end.',
// // // //     requirements: ['3+ years experience with React and Node.js', 'Strong understanding of REST APIs', 'Experience with PostgreSQL or similar databases', 'Familiarity with Git and CI/CD pipelines'],
// // // //     skillsRequired: ['React', 'Node.js', 'JavaScript', 'PostgreSQL', 'Express', 'Git'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 1200, salaryMax: 2000, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'Frontend Engineer — React',
// // // //     description: 'Join our product team building delightful user interfaces. You will work closely with designers to implement pixel-perfect, performant React components.',
// // // //     requirements: ['2+ years React experience', 'Strong CSS and responsive design skills', 'Experience with state management (Redux/Zustand)'],
// // // //     skillsRequired: ['React', 'JavaScript', 'CSS', 'Redux', 'TypeScript'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: true,
// // // //     salaryMin: 1000, salaryMax: 1700, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'Backend Engineer — Node.js',
// // // //     description: 'Build scalable backend services powering our platform. You will design APIs, optimize database queries, and ensure system reliability.',
// // // //     requirements: ['3+ years backend development', 'Experience with Node.js and Express', 'Strong SQL skills'],
// // // //     skillsRequired: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Zarqa', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 1300, salaryMax: 2200, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'RPA Developer',
// // // //     description: 'Develop and maintain Robotic Process Automation solutions using UiPath to automate repetitive business processes across departments.',
// // // //     requirements: ['Experience with UiPath or similar RPA tools', 'Understanding of business process automation', 'Strong analytical skills'],
// // // //     skillsRequired: ['UiPath', 'RPA', 'Automation', 'Process Analysis'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 900, salaryMax: 1500, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'Full Stack Developer — MERN Stack',
// // // //     description: 'We need a versatile Full Stack Developer comfortable across the MERN stack to build and ship features quickly in a fast-paced startup environment.',
// // // //     requirements: ['Experience with MongoDB, Express, React, Node.js', 'Comfortable working in agile teams', 'Good communication skills'],
// // // //     skillsRequired: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: true,
// // // //     salaryMin: 1100, salaryMax: 1900, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'Junior Web Developer',
// // // //     description: 'Great opportunity for a junior developer to grow with our team. You will work on real projects under mentorship from senior engineers.',
// // // //     requirements: ['Basic knowledge of HTML, CSS, JavaScript', 'Eagerness to learn React and Node.js', 'Fresh graduates welcome'],
// // // //     skillsRequired: ['HTML', 'CSS', 'JavaScript', 'React'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Irbid', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 600, salaryMax: 1000, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'Software Engineer — Web Applications',
// // // //     description: 'Design, develop, and deploy web applications using modern JavaScript frameworks. Collaborate with cross-functional teams to deliver high-quality software.',
// // // //     requirements: ['2+ years software development experience', 'Strong JavaScript fundamentals', 'Experience with REST APIs and databases'],
// // // //     skillsRequired: ['JavaScript', 'React', 'Node.js', 'SQL', 'API Design'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 1000, salaryMax: 1800, salaryCurrency: 'USD',
// // // //   },
// // // //   {
// // // //     title: 'UI/UX Designer',
// // // //     description: 'Create intuitive and visually appealing user interfaces for our web and mobile products. Conduct user research and translate insights into designs.',
// // // //     requirements: ['Portfolio demonstrating UI/UX work', 'Proficiency in Figma', 'Understanding of user-centered design principles'],
// // // //     skillsRequired: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
// // // //     jobType: 'full_time',
// // // //     locationCity: 'Amman', locationCountry: 'Jordan', isRemote: false,
// // // //     salaryMin: 800, salaryMax: 1400, salaryCurrency: 'USD',
// // // //   },
// // // // ];

// // // // (async () => {
// // // //   try {
// // // //     // ── 1. Get or create a test company ──
// // // //     let company = await Company.findOne({ where: { name: 'TalexHub Test Co' } });

// // // //     if (!company) {
// // // //       // Need an owner user — find any admin/company user, or create one
// // // //       let owner = await User.findOne({ where: { role: 'company' } });
// // // //       if (!owner) owner = await User.findOne({ where: { role: 'admin' } });
// // // //       if (!owner) {
// // // //         console.error('❌ No company or admin user found to own the test company. Create one first.');
// // // //         process.exit(1);
// // // //       }

// // // //       company = await Company.create({
// // // //         name: 'TalexHub Test Co',
// // // //         ownerId: owner.id,
// // // //         status: 'active',
// // // //         industry: 'Information Technology',
// // // //         locationCity: 'Amman',
// // // //         locationCountry: 'Jordan',
// // // //         emailDomain: 'talexhubtest.com',
// // // //         slug: 'talexhub-test-co-' + Date.now(),
// // // //       });
// // // //       console.log(`✅ Created test company: ${company.id}`);
// // // //     } else {
// // // //       console.log(`✅ Using existing test company: ${company.id}`);
// // // //     }

// // // //     // ── 2. Create jobs with applicationEmail = test email ──
// // // //     let created = 0;
// // // //     for (const tpl of JOB_TEMPLATES) {
// // // //       const slug = tpl.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now() + Math.random().toString(36).slice(2,6);
// // // //       // ✅ Use raw insert — skills_required/keywords are real PG ARRAY columns,
// // // //       // but the Job model's getter/setter expects JSON-string TEXT, causing
// // // //       // "malformed array literal" via Job.create(). Raw SQL bypasses that mismatch.
// // // //       // ✅ PG ARRAY columns need explicit ARRAY[...]::text[] syntax —
// // // //       // Sequelize replacements can't bind a JS array directly to an ARRAY column.
// // // //       const skillsArrLiteral = '{' + tpl.skillsRequired.map(s => '"' + s.replace(/"/g,'\\"') + '"').join(',') + '}';

// // // //       await sequelize.query(`
// // // //         INSERT INTO jobs (
// // // //           id, company_id, title, description, requirements, benefits,
// // // //           skills_required, keywords, job_type, location_city, location_country,
// // // //           is_remote, salary_min, salary_max, salary_currency, salary_visible,
// // // //           application_email, status, slug, created_at, updated_at
// // // //         ) VALUES (
// // // //           :id, :companyId, :title, :description, :requirements, :benefits,
// // // //           :skillsRequired::text[], '{}'::text[], :jobType, :locationCity, :locationCountry,
// // // //           :isRemote, :salaryMin, :salaryMax, :salaryCurrency, :salaryVisible,
// // // //           :applicationEmail, :status, :slug, NOW(), NOW()
// // // //         )
// // // //       `, {
// // // //         replacements: {
// // // //           id: uuidv4(),
// // // //           companyId: company.id,
// // // //           title: tpl.title,
// // // //           description: tpl.description,
// // // //           requirements: JSON.stringify(tpl.requirements),   // TEXT column — model expects JSON string
// // // //           benefits: JSON.stringify([]),                      // TEXT column
// // // //           skillsRequired: skillsArrLiteral,                   // PG array literal string e.g. {"React","Node.js"}
// // // //           jobType: tpl.jobType,
// // // //           locationCity: tpl.locationCity,
// // // //           locationCountry: tpl.locationCountry,
// // // //           isRemote: tpl.isRemote,
// // // //           salaryMin: tpl.salaryMin,
// // // //           salaryMax: tpl.salaryMax,
// // // //           salaryCurrency: tpl.salaryCurrency,
// // // //           salaryVisible: true,
// // // //           applicationEmail: TEST_EMAIL,
// // // //           status: 'active',
// // // //           slug,
// // // //         },
// // // //       });
// // // //       created++;
// // // //     }

// // // //     console.log(`✅ Created ${created} test jobs, all with applicationEmail = ${TEST_EMAIL}`);
// // // //     process.exit(0);
// // // //   } catch (e) {
// // // //     console.error('❌ Seed error:', e.message, e.stack);
// // // //     process.exit(1);
// // // //   }
// // // // })();

// // // require('dotenv').config();
// // // const { CV } = require('../models');
// // // const { renderTemplateToHtml } = require('../utils/cvTemplateRenderer');

// // // (async () => {
// // //   try {
// // //     const cv = await CV.findOne({
// // //       where: { userId: '48ce5390-34b8-4e8f-b3ea-2e5059228102' },
// // //       order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
// // //     });
// // //     console.log('CV found:', !!cv, cv?.id);
// // //     console.log('builderData:', JSON.stringify(cv?.builderData)?.slice(0, 300));

// // //     const html = renderTemplateToHtml(cv?.builderData || {}, 'modernblue', cv?.language || 'en');
// // //     console.log('HTML generated:', html?.length, 'chars');
// // //   } catch (e) {
// // //     console.error('ERROR:', e.message);
// // //     console.error(e.stack);
// // //   }
// // //   process.exit(0);
// // // })();

// // require('dotenv').config();
// // const { CV } = require('../models');
// // const { renderTemplateToHtml } = require('../utils/cvTemplateRenderer');
// // const storageSvc = require('../services/storage.service');

// // const PDF_MARGIN = { top:'18mm', bottom:'18mm', left:'15mm', right:'15mm' };
// // const PDF_ARGS   = ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'];

// // const generatePdfBuffer = async (html) => {
// //   try {
// //     const htmlPdf = require('html-pdf-node');
// //     return await new Promise((resolve, reject) => {
// //       const timer = setTimeout(() => reject(new Error('timeout')), 20000);
// //       htmlPdf.generatePdf({ content: html }, { format:'A4', printBackground:true, margin:PDF_MARGIN, args:PDF_ARGS })
// //         .then(buf => { clearTimeout(timer); resolve(buf); })
// //         .catch(err => { clearTimeout(timer); reject(err); });
// //     });
// //   } catch (e) {
// //     console.error('html-pdf-node failed:', e.message);
// //   }
// //   try {
// //     const puppeteer = require('puppeteer');
// //     const browser   = await puppeteer.launch({ headless:'new', args:[...PDF_ARGS,'--disable-gpu','--single-process','--no-zygote'], timeout:30000 });
// //     const page      = await browser.newPage();
// //     await page.setContent(html, { waitUntil:'domcontentloaded', timeout:20000 });
// //     const buf = await page.pdf({ format:'A4', printBackground:true, margin:PDF_MARGIN, displayHeaderFooter:false });
// //     await browser.close();
// //     return buf;
// //   } catch (e) {
// //     console.error('puppeteer failed:', e.message);
// //     return null;
// //   }
// // };

// // (async () => {
// //   try {
// //     const cv = await CV.findOne({
// //       where: { userId: '48ce5390-34b8-4e8f-b3ea-2e5059228102' },
// //       order: [['is_primary', 'DESC'], ['created_at', 'DESC']],
// //     });
// //     console.log('Step 1 - CV found:', !!cv, cv?.id);
// //     console.log('Step 1 - old fileKey:', cv?.fileKey);

// //     const cvData = { ...(cv.builderData || cv.parsedContent || {}), template: 'modernblue' };
// //     const html = renderTemplateToHtml(cvData, 'modernblue', cv.language || 'en');
// //     console.log('Step 2 - HTML generated:', html?.length, 'chars');

// //     console.log('Step 3 - Generating PDF buffer...');
// //     const pdfBuffer = await generatePdfBuffer(html);
// //     console.log('Step 3 - PDF buffer:', pdfBuffer ? `${pdfBuffer.length} bytes` : 'NULL/FAILED');

// //     if (!pdfBuffer) {
// //       console.error('❌ PDF generation failed completely - this is likely the root cause');
// //       process.exit(1);
// //     }

// //     console.log('Step 4 - Removing old file from R2:', cv.fileKey);
// //     if (cv.fileKey) {
// //       await storageSvc.remove(cv.fileKey).catch(e => console.error('Remove failed:', e.message));
// //     }
// //     console.log('Step 4 - Done');

// //     console.log('Step 5 - Uploading new PDF to R2...');
// //     const uploaded = await storageSvc.upload({
// //       buffer: pdfBuffer,
// //       mimetype: 'application/pdf',
// //       originalname: `cv-test-${Date.now()}.pdf`,
// //       folder: 'generated-cvs',
// //       type: 'cv',
// //     });
// //     console.log('Step 5 - Uploaded:', uploaded);

// //     console.log('✅ ALL STEPS PASSED');
// //   } catch (e) {
// //     console.error('❌ ERROR at some step:', e.message);
// //     console.error(e.stack);
// //   }
// //   process.exit(0);
// // })();

// require('dotenv').config();
// const { sequelize } = require('../models');

// (async () => {
//   const r = await sequelize.query(
//     "SELECT unnest(enum_range(NULL::enum_token_usage_feature)) AS val",
//     { type: sequelize.QueryTypes.SELECT }
//   ).catch(async () => {
//     // fallback: find the actual enum type name
//     return sequelize.query(`
//       SELECT t.typname, e.enumlabel
//       FROM pg_type t
//       JOIN pg_enum e ON t.oid = e.enumtypid
//       WHERE t.typname LIKE '%feature%' OR t.typname LIKE '%token_usage%'
//       ORDER BY t.typname, e.enumsortorder
//     `, { type: sequelize.QueryTypes.SELECT });
//   });
//   console.log(r);
//   process.exit(0);
// })();

require('dotenv').config();
const storageSvc = require('../services/storage.service');
const fs = require('fs');

(async () => {
  try {
    const key = 'generated-cvs/d31c7d64-7f8b-468d-a6e3-2d62167199b4.pdf';
    const buffer = await storageSvc.downloadFile(key);

    console.log('Type of buffer:', typeof buffer);
    console.log('Is Buffer instance:', Buffer.isBuffer(buffer));
    console.log('Length:', buffer?.length);
    console.log('First 20 bytes (hex):', buffer?.slice(0, 20)?.toString('hex'));
    console.log('First 8 chars as string:', buffer?.slice(0, 8)?.toString());
    console.log('Should start with %PDF — does it?', buffer?.slice(0, 4)?.toString() === '%PDF');

    // Save locally to inspect
    fs.writeFileSync('/tmp/test-download.pdf', buffer);
    console.log('Saved to /tmp/test-download.pdf — try opening it locally');
  } catch (e) {
    console.error('ERROR:', e.message);
    console.error(e.stack);
  }
  process.exit(0);
})();