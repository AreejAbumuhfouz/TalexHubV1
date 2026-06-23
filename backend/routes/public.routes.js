


'use strict';
const router  = require('express').Router();
const { Job, Setting } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { success } = require('../utils/apiResponse');

// ── Spread-out positions across the hero section ──────────
const POSITIONS = [
  { x: 0.07, y: 0.20 },
  { x: 0.72, y: 0.13 },
  { x: 0.80, y: 0.27 },
  { x: 0.82, y: 0.50 },
  { x: 0.04, y: 0.60 },
  { x: 0.02, y: 0.38 },
  { x: 0.88, y: 0.68 },
  { x: 0.61, y: 0.82 },
  { x: 0.17, y: 0.72 },
  { x: 0.66, y: 0.33 },
  { x: 0.36, y: 0.10 },
  { x: 0.73, y: 0.92 },
];

// ── Static fallback pills — always used when DB is empty ──
// These are realistic Arab-market job titles shown at launch
const STATIC_PILLS = [
  { text: 'React Developer',    textAr: 'مطور React'        },
  { text: 'Digital Marketing',  textAr: 'تسويق رقمي'        },
  { text: 'Software Engineer',  textAr: 'مهندس برمجيات'     },
  { text: 'AI Engineer',        textAr: 'مهندس ذكاء اصطناعي'},
  { text: 'UI/UX Designer',     textAr: 'مصمم UI/UX'        },
  { text: 'Data Science',       textAr: 'علوم البيانات'     },
  { text: 'Product Manager',    textAr: 'مدير منتجات'       },
  { text: 'Full Stack Dev',     textAr: 'مطور متكامل'       },
  { text: 'DevOps Engineer',    textAr: 'مهندس DevOps'      },
  { text: 'Mobile Developer',   textAr: 'مطور تطبيقات'      },
  { text: 'Cybersecurity',      textAr: 'أمن المعلومات'     },
  { text: 'Cloud Architect',    textAr: 'مهندس السحابة'     },
];

// ═══════════════════════════════════════════════════════════
// GET /api/v1/public/hero-pills
// Priority:
//   1. Admin manually saved pills  (Setting key: hero_pills)
//   2. Top job titles from DB      (live jobs)
//   3. Static domain defaults      (always works, even empty DB)
// ═══════════════════════════════════════════════════════════
router.get('/hero-pills', async (_req, res) => {
  try {
    // ── 1. Admin-managed pills ──────────────────────────────
    const row = await Setting.findByPk('hero_pills');
    if (row) {
      try {
        const pills = JSON.parse(row.value);
        if (Array.isArray(pills) && pills.length >= 3) {
          // Ensure every pill has x/y (admin may have saved without positions)
          const withPos = pills.map((p, i) => ({
            ...p,
            x: p.x ?? POSITIONS[i % POSITIONS.length].x,
            y: p.y ?? POSITIONS[i % POSITIONS.length].y,
          }));
          return success(res, { pills: withPos, source: 'admin' });
        }
      } catch { /* fall through */ }
    }

    // ── 2. Auto-generate from live DB jobs ─────────────────
    const [topTitles, topCities] = await Promise.all([
      Job.findAll({
        where:      { status: 'active', title: { [Op.ne]: null } },
        attributes: ['title', 'titleAr', [fn('COUNT', col('title')), 'cnt']],
        group:      ['title', 'titleAr'],
        order:      [[literal('"cnt"'), 'DESC']],
        limit:      9,
        raw:        true,
      }).catch(() => []),

      Job.findAll({
        where:      { status: 'active', locationCity: { [Op.ne]: null } },
        attributes: ['locationCity', [fn('COUNT', col('location_city')), 'cnt']],
        group:      ['locationCity'],
        order:      [[literal('"cnt"'), 'DESC']],
        limit:      3,
        raw:        true,
      }).catch(() => []),
    ]);

    const dbItems = [
      ...topTitles.map(r => ({ text: r.title, textAr: r.titleAr || r.title, type: 'title' })),
      ...topCities.map(r => ({ text: r.locationCity, textAr: r.locationCity, type: 'city' })),
    ];

    if (dbItems.length >= 4) {
      const pills = dbItems.slice(0, POSITIONS.length).map((item, i) => ({
        ...item, ...POSITIONS[i],
      }));
      return success(res, { pills, source: 'db' });
    }

    // ── 3. Static fallback — always returns something ──────
    const pills = STATIC_PILLS.map((item, i) => ({
      ...item, ...POSITIONS[i % POSITIONS.length],
    }));
    return success(res, { pills, source: 'static' });

  } catch (err) {
    // Even on crash — return static pills, never an empty array
    const pills = STATIC_PILLS.map((item, i) => ({
      ...item, ...POSITIONS[i % POSITIONS.length],
    }));
    return success(res, { pills, source: 'fallback' });
  }
});

module.exports = router;