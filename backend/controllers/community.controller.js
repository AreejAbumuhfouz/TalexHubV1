

'use strict';

const { success, error, paginate } = require('../utils/apiResponse');
const { R2_PUBLIC_URL, R2_PUBLIC_URL_AVATAR } = require('../config/storage');
const {
  CommunityPost, PostComment, PostLike, PostReport, User, sequelize,
} = require('../models');
const { containsBadWords, filterBadWords } = require('../services/badWordsFilter');

/* ══════════════════════════════════════════════════════════
   POSTS — GET
══════════════════════════════════════════════════════════ */
exports.getPosts = async (req, res) => {
  const { category, page = 1, limit = 15 } = req.query;
  const where = { isHidden: false };
  if (category) where.category = category;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await CommunityPost.findAndCountAll({
    where,
    include: [{
      model: User, as: 'author',
      attributes: ['id', 'fullName', 'avatarUrl', 'headline', 'role'],
    }],
    order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit),
    offset,
  });

  let myLikes = new Set();
  if (req.user && rows.length) {
    const likes = await PostLike.findAll({
      where: { userId: req.user.id, postId: rows.map(p => p.id) },
      attributes: ['postId'],
    });
    myLikes = new Set(likes.map(l => l.postId));
  }

  const data = rows.map(p => ({ ...p.toJSON(), isLiked: myLikes.has(p.id) }));
  return paginate(res, data, count, parseInt(page), parseInt(limit));
};

/* ══════════════════════════════════════════════════════════
   POSTS — CREATE
   يقبل: نص فقط | صور فقط | رابط فقط | أي مجموعة منهم
══════════════════════════════════════════════════════════ */
exports.createPost = async (req, res) => {
  const { content, category = 'general', tags, mediaUrls, linkUrl } = req.body;
  if (!content?.trim()) return error(res, 'Content is required', 400);


  if (containsBadWords(content)) {
    return error(res, 'Post contains inappropriate language and was blocked', 400);
  }

  const hasContent = content?.trim();
  const hasFiles   = req.files?.length > 0;

  // ✅ روابط خارجية — نقبلهم من mediaUrls أو linkUrl
  let externalUrls = [];
  // const rawUrls = [];

  // if (mediaUrls) {
  //   const arr = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
  //   rawUrls.push(...arr);
  // }
  // if (linkUrl) {
  //   const arr = Array.isArray(linkUrl) ? linkUrl : [linkUrl];
  //   rawUrls.push(...arr);
  // }
  const rawUrls = [];

if (mediaUrls) {
  const arr = Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls];
  rawUrls.push(...arr);
}
if (linkUrl) {
  const arr = Array.isArray(linkUrl) ? linkUrl : [linkUrl];
  rawUrls.push(...arr);
}
const uniqueUrls = [...new Set(rawUrls)];
externalUrls = uniqueUrls.filter(u => {
  try { new URL(u); return true; } catch { return false; }
});

  externalUrls = rawUrls.filter(u => {
    try { new URL(u); return true; } catch { return false; }
  });

  const hasLinks = externalUrls.length > 0;

  // ✅ الإصلاح: نقبل الرابط لوحده كمحتوى كافي
  if (!hasContent && !hasFiles && !hasLinks) {
    return error(res, 'يجب إضافة نص أو صورة أو رابط على الأقل');
  }

  // ── صور مرفوعة على R2 ──
  const uploadedImages = (req.files || []).map(f => {
    const key = f.key || f.Key;
    return `${R2_PUBLIC_URL_AVATAR}/${key}`;
  });

  // ✅ نفصل الصور عن الروابط الخارجية في الحفظ
  // الصور المرفوعة + الروابط الخارجية كلها في mediaUrls
  const allMedia = [...uploadedImages, ...externalUrls].slice(0, 5);

  const tagList = Array.isArray(tags)
    ? tags
    : (tags || '').split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean);

  const post = await CommunityPost.create({
    userId:    req.user.id,
    content:   hasContent ? content.trim() : '',
    category,
    tags:      tagList,
    mediaUrls: allMedia.length > 0 ? allMedia : null,
  });

  const full = await CommunityPost.findByPk(post.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl', 'headline', 'role'] }],
  });
  return success(res, { ...full.toJSON(), isLiked: false }, 'تم نشر المنشور بنجاح', 201);
};

/* ══════════════════════════════════════════════════════════
   POSTS — DELETE
══════════════════════════════════════════════════════════ */
exports.deletePost = async (req, res) => {
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return error(res, 'المنشور غير موجود', 404);

  const isOwner = post.userId === req.user.id;
  const isAdmin = ['admin', 'support', 'moderator'].includes(req.user.role);
  if (!isOwner && !isAdmin) return error(res, 'غير مصرح', 403);

  await post.destroy();
  return success(res, null, 'تم حذف المنشور');
};

/* ══════════════════════════════════════════════════════════
   LIKES — TOGGLE
══════════════════════════════════════════════════════════ */
exports.toggleLike = async (req, res) => {
  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return error(res, 'المنشور غير موجود', 404);

  const existing = await PostLike.findOne({
    where: { userId: req.user.id, postId: post.id },
  });

  if (existing) {
    await existing.destroy();
    await CommunityPost.decrement('likesCount', { where: { id: post.id } });
    const updated = await CommunityPost.findByPk(post.id, { attributes: ['likesCount'] });
    return success(res, { liked: false, likesCount: Math.max(0, updated.likesCount) });
  }

  await sequelize.query(
    `INSERT INTO post_likes (user_id, post_id, created_at)
     VALUES (:userId, :postId, NOW())
     ON CONFLICT (user_id, post_id) DO NOTHING`,
    { replacements: { userId: req.user.id, postId: post.id } }
  );
  await CommunityPost.increment('likesCount', { where: { id: post.id } });
  const updated = await CommunityPost.findByPk(post.id, { attributes: ['likesCount'] });
  return success(res, { liked: true, likesCount: updated.likesCount });
};

/* ══════════════════════════════════════════════════════════
   COMMENTS — GET
══════════════════════════════════════════════════════════ */
exports.getComments = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await PostComment.findAndCountAll({
    where: { postId: req.params.id, parentId: null, isHidden: false },
    include: [
      { model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] },
      {
        model: PostComment, as: 'replies',
        where: { isHidden: false }, required: false,
        include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
      },
    ],
    order: [['created_at', 'ASC']],
    limit: parseInt(limit), offset,
  });

  return paginate(res, rows, count, parseInt(page), parseInt(limit));
};

/* ══════════════════════════════════════════════════════════
   COMMENTS — ADD
══════════════════════════════════════════════════════════ */
exports.addComment = async (req, res) => {
  const { content, parentId } = req.body;
  if (!content?.trim()) return error(res, 'التعليق مطلوب');

  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return error(res, 'المنشور غير موجود', 404);

  if (parentId) {
    const parent = await PostComment.findByPk(parentId);
    if (!parent || parent.postId !== post.id)
      return error(res, 'التعليق الأصلي غير صالح');
  }

  const comment = await PostComment.create({
    postId: post.id, userId: req.user.id,
    content: content.trim(), parentId: parentId || null,
  });
  await CommunityPost.increment('commentsCount', { where: { id: post.id } });

  const full = await PostComment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'fullName', 'avatarUrl'] }],
  });
  return success(res, full, 'تم إضافة التعليق', 201);
};

/* ══════════════════════════════════════════════════════════
   COMMENTS — DELETE
══════════════════════════════════════════════════════════ */
exports.deleteComment = async (req, res) => {
  const comment = await PostComment.findByPk(req.params.commentId);
  if (!comment) return error(res, 'التعليق غير موجود', 404);

  const isOwner = comment.userId === req.user.id;
  const isAdmin = ['admin', 'support', 'moderator'].includes(req.user.role);
  if (!isOwner && !isAdmin) return error(res, 'غير مصرح', 403);

  await comment.destroy();
  await CommunityPost.decrement('commentsCount', { where: { id: comment.postId } });
  return success(res, null, 'تم حذف التعليق');
};

/* ══════════════════════════════════════════════════════════
   REPORT
══════════════════════════════════════════════════════════ */
exports.reportPost = async (req, res) => {
  const { reason, details } = req.body;
  if (!reason) return error(res, 'سبب البلاغ مطلوب');

  const post = await CommunityPost.findByPk(req.params.id);
  if (!post) return error(res, 'المنشور غير موجود', 404);

  const exists = await PostReport.findOne({
    where: { postId: req.params.id, reporterId: req.user.id },
  });
  if (exists) return error(res, 'لقد أبلغت عن هذا المنشور مسبقاً');

  await PostReport.create({
    postId: req.params.id,
    reporterId: req.user.id,
    reason,
    details: details?.trim() || null,
  });
  return success(res, null, 'تم إرسال البلاغ، سيتم مراجعته خلال 24 ساعة');
};