
'use strict';
const express = require('express');
const router  = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, optionalProtect } = require('../middleware/auth');
const { communityImageUpload } = require('../middleware/upload');
const ctrl    = require('../controllers/community.controller');

/* ── Posts ─────────────────────────────────────────────────── */
router.get('/', optionalProtect, ctrl.getPosts);

router.post(
  '/',
  protect,
  communityImageUpload.array('images', 4),
  [
    body('content').trim().notEmpty().isLength({ min: 1, max: 5000 }),
    body('tags').optional().isArray({ max: 10 }),
  ],
  validate,
  ctrl.createPost
);

router.delete('/:id',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.deletePost
);

/* ── Likes ──────────────────────────────────────────────────── */
router.post('/:id/like',
  protect,
  [param('id').isUUID()],
  validate,
  ctrl.toggleLike
);

/* ── Comments ───────────────────────────────────────────────── */
router.get('/:id/comments',
  [param('id').isUUID()],
  validate,
  ctrl.getComments
);

router.post('/:id/comments',
  protect,
  [
    param('id').isUUID(),
    body('content').trim().notEmpty().isLength({ min: 1, max: 2000 }),
  ],
  validate,
  ctrl.addComment
);

router.delete('/comments/:commentId',
  protect,
  [param('commentId').isUUID()],
  validate,
  ctrl.deleteComment
);

/* ── Report ─────────────────────────────────────────────────── */
router.post('/:id/report',
  protect,
  [
    param('id').isUUID(),
    body('reason').trim().notEmpty().isLength({ min: 5, max: 500 }),
  ],
  validate,
  ctrl.reportPost
);

module.exports = router;