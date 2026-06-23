'use strict';

const { CommunityPost, PostReport, AuditLog } = require('../../models');
const { success, error, paginate } = require('../../utils/apiResponse');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: action.includes('post') ? 'CommunityPost' : 'PostReport', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

exports.hidePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return error(res, 'Post not found', 404);
    await post.update({ isHidden: true });
    await audit(req.user.id, 'post.hide', post.id, { isHidden: false }, { isHidden: true });
    return success(res, {}, 'Post hidden');
  } catch (err) { return error(res, err.message, 500); }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByPk(req.params.id);
    if (!post) return error(res, 'Post not found', 404);
    await audit(req.user.id, 'post.delete', post.id, { content: post.content?.slice(0, 100) }, null);
    await post.destroy();
    return success(res, {}, 'Post deleted');
  } catch (err) { return error(res, err.message, 500); }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    const { count, rows } = await PostReport.findAndCountAll({
      where: { resolved: false },
      include: [{ model: CommunityPost, as: 'post', attributes: ['id', 'content', 'userId'], required: false }],
      order: [['created_at', 'DESC']], limit, offset,
    });
    return paginate(res, rows, count, page, limit);
  } catch (err) { return error(res, err.message, 500); }
};

exports.resolveReport = async (req, res) => {
  try {
    const report = await PostReport.findByPk(req.params.id);
    if (!report) return error(res, 'Report not found', 404);
    await report.update({ resolved: true, resolvedBy: req.user.id });
    await audit(req.user.id, 'report.resolve', report.id, { resolved: false }, { resolved: true });
    return success(res, {}, 'Report resolved');
  } catch (err) { return error(res, err.message, 500); }
};