'use strict';

const { Op } = require('sequelize');
const { User, Company, Job, JobApplication, Course, CV, ChatRoom, AuditLog, WalletTransaction } = require('../../models');
const { success, error } = require('../../utils/apiResponse');

exports.getStats = async (req, res) => {
  try {
    const { sequelize: sq } = require('../../models');
    const { PaymentRequest } = require('../../models');

    const now   = new Date();
    const day7  = new Date(now - 7 * 86400000);
    const day30 = new Date(now - 30 * 86400000);
    const day1  = new Date(now - 1 * 86400000);

    const [
      totalUsers, activeUsers, pendingUsers,
      totalCompanies, pendingCompanies,
      totalJobs, pendingJobs,
      totalApplications, totalCourses, totalCVs, totalChatRooms,
      newToday, newThisWeek, pendingPayments,
    ] = await Promise.all([
      User.count({ where: { deletedAt: null } }),
      User.count({ where: { status: 'active', lastLoginAt: { [Op.gte]: day30 } } }),
      User.count({ where: { status: 'pending', deletedAt: null } }),
      Company.count({ where: { deletedAt: null } }),
      Company.count({ where: { status: 'pending_review', deletedAt: null } }),
      Job.count({ where: { status: 'active', deletedAt: null } }),
      Job.count({ where: { status: 'pending_approval', deletedAt: null } }),
      JobApplication.count(),
      Course.count({ where: { status: 'published' } }),
      CV.count({ where: { deletedAt: null } }),
      ChatRoom.count({ where: { isActive: true } }),
      User.count({ where: { created_at: { [Op.gte]: day1 }, deletedAt: null } }),
      User.count({ where: { created_at: { [Op.gte]: day7 }, deletedAt: null } }),
      PaymentRequest.count({ where: { status: 'pending' } }),
    ]);

    const revenueRow = await PaymentRequest.findOne({
      attributes: [[sq.fn('COALESCE', sq.fn('SUM', sq.col('amount')), 0), 'total']],
      where: { status: 'approved' },
      raw: true,
    });
    const totalRevenue = parseFloat(revenueRow?.total || 0);

    const signupTrend = await sq.query(
      `SELECT DATE(created_at) AS day, COUNT(*)::int AS count FROM users WHERE created_at >= NOW() - INTERVAL '7 days' AND deleted_at IS NULL GROUP BY DATE(created_at) ORDER BY day ASC`,
      { type: sq.QueryTypes.SELECT }
    );

    const planBreakdown = await User.findAll({
      attributes: ['planKey', [User.sequelize.fn('COUNT', '*'), 'count']],
      where: { deletedAt: null }, group: ['planKey'], raw: true,
    });

    const roleBreakdown = await User.findAll({
      attributes: ['role', [User.sequelize.fn('COUNT', '*'), 'count']],
      where: { deletedAt: null }, group: ['role'], raw: true,
    });

    const onlineCount = req.io ? req.io.engine.clientsCount : 0;

    const recentActivity = await AuditLog.findAll({
      include: [{ model: User, as: 'actor', attributes: ['fullName', 'email'], required: false }],
      order: [['created_at', 'DESC']], limit: 10, raw: true, nest: true,
    });

    return success(res, {
      totalUsers, activeUsers, pendingUsers,
      totalCompanies, pendingCompanies,
      totalJobs, pendingJobs,
      totalApplications, totalCourses,
      totalCVs, totalChatRooms,
      newToday, newThisWeek,
      pendingPayments,
      totalRevenue,
      signupTrend,
      onlineCount,
      planBreakdown, roleBreakdown,
      recentActivity,
    });
  } catch (err) {
    console.error('Admin Stats Error:', err);
    return error(res, 'Failed to load statistics', 500);
  }
};

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [newUsersThisMonth, newUsersLastMonth, newJobsThisMonth, newApplicationsThisMonth, revenueThisMonth, conversionRate] = await Promise.all([
      User.count({ where: { created_at: { [Op.gte]: thisMonth }, deletedAt: null } }),
      User.count({ where: { created_at: { [Op.between]: [lastMonth, thisMonth] }, deletedAt: null } }),
      Job.count({ where: { created_at: { [Op.gte]: thisMonth }, deletedAt: null } }),
      JobApplication.count({ where: { created_at: { [Op.gte]: thisMonth } } }),
      WalletTransaction.sum('cashDelta', { where: { type: 'subscription_payment', created_at: { [Op.gte]: thisMonth } } }),
      User.count({ where: { planKey: { [Op.ne]: 'free' }, deletedAt: null } }),
    ]);

    const totalUsers = await User.count({ where: { deletedAt: null } });
    const conversionPercent = totalUsers > 0 ? ((conversionRate / totalUsers) * 100).toFixed(2) : 0;

    return success(res, {
      thisMonth: { newUsers: newUsersThisMonth, newJobs: newJobsThisMonth, newApplications: newApplicationsThisMonth, revenue: parseFloat(revenueThisMonth || 0), conversionRate: parseFloat(conversionPercent) },
      lastMonth: { newUsers: newUsersLastMonth },
      totalUsers,
      growth: newUsersLastMonth > 0 ? (((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100).toFixed(1) : 100,
    });
  } catch (err) {
    return error(res, 'Failed to fetch analytics', 500);
  }
};