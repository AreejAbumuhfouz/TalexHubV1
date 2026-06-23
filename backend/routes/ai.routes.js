'use strict';
// ════════════════════════════════════════════════════════════
// backend/routes/ai.routes.js
// All routes require authentication (protect middleware)
// ════════════════════════════════════════════════════════════

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const ctrl    = require('../controllers/ai.controller');

// All AI routes require a logged-in user
router.use(protect);

// POST /api/v1/ai/chat          — conversational career assistant (multi-turn)
router.post('/chat',          ctrl.chat);

// POST /api/v1/ai/cover-letter  — generate cover letter for a specific job
router.post('/cover-letter',  ctrl.generateCoverLetter);

// POST /api/v1/ai/headline      — generate 3 profile headline options
router.post('/headline',      ctrl.generateHeadline);

// POST /api/v1/ai/skill-gap     — skill gap analysis vs target role
router.post('/skill-gap',     ctrl.analyzeSkillGap);

module.exports = router;