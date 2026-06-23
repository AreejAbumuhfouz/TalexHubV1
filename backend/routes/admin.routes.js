

'use strict';

const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const ctrl = require('../controllers/admin.controller');

// ════════════════════════════════════════════════════════════
// Rate Limiters
// ════════════════════════════════════════════════════════════
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 30,
  message: { success: false, message: 'Too many requests' },
});

const broadcastLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 10,
  message: { success: false, message: 'Broadcast limit reached' },
});

const bulkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, max: 5,
  message: { success: false, message: 'Bulk operation limit reached' },
});

// ════════════════════════════════════════════════════════════
// Middleware
// ════════════════════════════════════════════════════════════
router.use(protect, authorize('admin', 'support'));

// ════════════════════════════════════════════════════════════
// STATS
// ════════════════════════════════════════════════════════════
router.get('/stats', ctrl.getStats);
router.get('/analytics/overview', ctrl.getAnalyticsOverview);

// ════════════════════════════════════════════════════════════
// HERO PILLS
// ════════════════════════════════════════════════════════════
router.get('/hero-pills',  ctrl.getHeroPills);
router.post('/hero-pills', ctrl.saveHeroPills);

// ════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════
router.get('/users',              ctrl.getUsers);
router.post('/users',             sensitiveLimiter, ctrl.createUser);
router.get('/users/:id',          ctrl.getUser);
router.patch('/users/:id',        ctrl.updateUser);
router.patch('/users/:id/status', ctrl.updateUserStatus);
router.patch('/users/:id/plan',   ctrl.updateUserPlan);
router.patch('/users/:id/reset-password', sensitiveLimiter, ctrl.resetUserPassword);
router.delete('/users/:id',       sensitiveLimiter, ctrl.deleteUser);
router.patch('/users/bulk-plan',  bulkLimiter, ctrl.bulkUpdatePlans);

// ════════════════════════════════════════════════════════════
// COMPANIES
// ════════════════════════════════════════════════════════════
router.get('/companies',          ctrl.getCompanies);
router.get('/companies/pending',  ctrl.getPendingCompanies);
router.get('/companies/:id',      ctrl.getCompany);
router.post('/companies',         ctrl.createCompany);
router.patch('/companies/:id',    ctrl.updateCompany);
router.patch('/companies/:id/approve', ctrl.approveCompany);
router.patch('/companies/:id/reject',  ctrl.rejectCompany);
router.delete('/companies/:id',   ctrl.deleteCompany);

// ════════════════════════════════════════════════════════════
// JOBS
// ════════════════════════════════════════════════════════════
router.get('/jobs',               ctrl.getJobs);
router.get('/jobs/:id',           ctrl.getJob);
router.post('/jobs',              ctrl.createJob);
router.patch('/jobs/:id',         ctrl.updateJob);
router.patch('/jobs/:id/approve', ctrl.approveJob);
router.patch('/jobs/:id/reject',  ctrl.rejectJob);
router.delete('/jobs/:id',        ctrl.deleteJob);
router.get('/jobs/:id/applicants', ctrl.getJobApplicants);

// ════════════════════════════════════════════════════════════
// COURSES (PDF only - no lessons)
// ════════════════════════════════════════════════════════════
router.get('/courses/stats',      ctrl.getCourseStats);
router.get('/courses',            ctrl.getCourses);
router.get('/courses/:id',        ctrl.getCourse);
router.post('/courses',           sensitiveLimiter, ctrl.createCourse);
router.patch('/courses/:id',      ctrl.updateCourse);
router.patch('/courses/:id/pdf',  ctrl.replaceCoursePdf);
router.patch('/courses/:id/status', ctrl.updateCourseStatus);
router.delete('/courses/:id',     ctrl.deleteCourse);
router.get('/courses/:id/download', ctrl.downloadCoursePdf);

// ════════════════════════════════════════════════════════════
// CHAT ROOMS
// ════════════════════════════════════════════════════════════
router.get('/chat-rooms',             ctrl.getChatRooms);
router.get('/chat-rooms/:id',         ctrl.getChatRoom);
router.post('/chat-rooms',            ctrl.createChatRoom);
router.patch('/chat-rooms/:id',       ctrl.updateChatRoom);
router.patch('/chat-rooms/:id/toggle', ctrl.toggleChatRoom);
router.delete('/chat-rooms/:id',      ctrl.deleteChatRoom);

// ════════════════════════════════════════════════════════════
// WALLETS
// ════════════════════════════════════════════════════════════
router.get('/wallets',                ctrl.getWallets);
router.get('/wallets/transactions',   ctrl.getWalletTransactions); 
router.get('/wallets/:id',            ctrl.getWallet);
router.post('/wallets/adjust',        sensitiveLimiter, ctrl.adjustWallet);
router.post('/wallets/bulk-points',   bulkLimiter, ctrl.bulkAddPoints);

// ════════════════════════════════════════════════════════════
// CONTENT MODERATION
// ════════════════════════════════════════════════════════════
router.get('/reported-posts',          ctrl.getReportedPosts);
router.patch('/posts/:id/hide',        ctrl.hidePost);
router.delete('/posts/:id',            ctrl.deletePost);
router.patch('/reports/:id/resolve',   ctrl.resolveReport);

// ════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════
router.post('/notifications/broadcast', broadcastLimiter, ctrl.broadcastNotification);

// ════════════════════════════════════════════════════════════
// WAITLIST
// ════════════════════════════════════════════════════════════
router.get('/waitlist',               ctrl.getWaitlist);
router.delete('/waitlist/:email',     ctrl.deleteWaitlistEntry);

// ════════════════════════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════════════════════════
router.get('/settings',               ctrl.getSettings);
router.post('/settings',              ctrl.updateSetting);
router.post('/settings/bulk',         ctrl.bulkUpdateSettings);

// ════════════════════════════════════════════════════════════
// AUDIT LOG
// ════════════════════════════════════════════════════════════
router.get('/audit-logs',             ctrl.getAuditLogs);

// ════════════════════════════════════════════════════════════
// CATEGORIES
// ════════════════════════════════════════════════════════════
router.get('/categories/jobs',        ctrl.getJobCategories);
router.get('/categories/courses',     ctrl.getCourseCategories);
router.get('/categories/chat',        ctrl.getChatCategories);
router.get('/companies-list',         ctrl.getCompanyList);

// ════════════════════════════════════════════════════════════
// EXPORTS
// ════════════════════════════════════════════════════════════
router.get('/export/:type',                ctrl.exportData);
router.get('/export/jobs/:id/applicants',  ctrl.exportJobApplicants);

// ════════════════════════════════════════════════════════════
// PRICING
// ════════════════════════════════════════════════════════════
router.get('/pricing',           ctrl.adminGetPricing);
router.put('/pricing/tiers',     ctrl.adminSaveTiers);
router.put('/pricing/features',  ctrl.adminSaveFeatures);
router.post('/pricing/reset',    ctrl.adminResetPricing);

// ════════════════════════════════════════════════════════════
// PLANS
// ════════════════════════════════════════════════════════════
router.get('/plans', ctrl.getPlanFeatures);

// ════════════════════════════════════════════════════════════
// CHAT PLANS (Admin)
// ════════════════════════════════════════════════════════════
router.get('/chat-plans',              ctrl.getChatPlans);
router.put('/chat-plans',              ctrl.updateChatPlans);
router.post('/chat-plans/reset',       ctrl.resetChatPlans);
router.post('/chat-plans/toggle-free', ctrl.toggleFreeChatCreate);

// ════════════════════════════════════════════════════════════
// CHAT REPORTS (Admin)
// ════════════════════════════════════════════════════════════
router.get('/chat-reports',            ctrl.getChatReports);
router.get('/chat-reports/:id',        ctrl.getChatReport);
router.patch('/chat-reports/:id/resolve', ctrl.resolveChatReport);
router.delete('/chat-reports/:id',     ctrl.deleteChatReport);

// ════════════════════════════════════════════════════════════
// CHAT SUSPENSIONS (Admin)
// ════════════════════════════════════════════════════════════
router.get('/chat-suspensions',               ctrl.getSuspendedChatUsers);
router.post('/chat-suspensions/suspend',      ctrl.suspendChatUser);
router.post('/chat-suspensions/unsuspend',    ctrl.unsuspendChatUser);

// ════════════════════════════════════════════════════════════
// CHAT ROOM STATS
// ════════════════════════════════════════════════════════════
router.get('/chat-rooms/stats',        ctrl.getChatRoomStats);
router.get('/bad-words',   ctrl.getBadWords);
router.put('/bad-words',   ctrl.updateBadWords);



router.get('/training/sessions', ctrl.getAllSessions);
router.get('/training/sessions/:id', ctrl.getSessionById);

// Limits configuration
router.get('/training/limits', ctrl.getLimitsConfig);
router.put('/training/limits', ctrl.updateLimitsConfig);

// Statistics
router.get('/training/stats/global', ctrl.getGlobalStats);
router.get('/training/stats/users', ctrl.getUserUsageStats);

// User management
router.post('/training/users/:userId/reset-limits', ctrl.resetUserLimits);


// ════════════════════════════════════════════════════════════
// CAREER PATH (Admin)
// ════════════════════════════════════════════════════════════
router.get('/career-path/stats',         ctrl.getCareerPathStats);
router.get('/career-path/sessions',      ctrl.getCareerPathSessions);
router.get('/career-path/limits',        ctrl.getCareerPathLimits);
router.put('/career-path/limits',        ctrl.updateCareerPathLimits);
router.post('/career-path/limits/reset', ctrl.resetCareerPathLimits);


// ════════════════════════════════════════════════════════════
// CV MANAGEMENT (Admin)
// ════════════════════════════════════════════════════════════
router.get('/cv-config',  ctrl.adminGetCVConfig);
router.put('/cv-config',  ctrl.adminUpdateCVConfig);
router.get('/cv-stats',   ctrl.adminGetCVStats);
router.get('/cv-usage',   ctrl.adminGetCVUsage);
router.get('/cvs',        ctrl.adminListCVs);
router.get('/cvs/:id',    ctrl.adminGetCV);
router.delete('/cvs/:id', ctrl.adminDeleteCV);


router.get('/auto-apply/applications', ctrl.adminGetAutoApplications);


// ════════════════════════════════════════════════════════════
// أضيفي هذا في admin.routes.js
// ════════════════════════════════════════════════════════════

// ① بأعلى الملف، بعد باقي الـ requires:
const multer = require('multer');
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.mimetype === 'text/csv' || file.originalname?.toLowerCase().endsWith('.csv');
    if (ok) return cb(null, true);
    cb(new Error('CSV files only'));
  },
});

// ② بعد جزء "JOBS" الموجود (بعد router.get('/jobs/:id/applicants', ...)):
// ════════════════════════════════════════════════════════════
// JOBS — BULK CSV
// ════════════════════════════════════════════════════════════
router.get('/jobs/bulk-csv/template', ctrl.downloadBulkJobTemplate);
router.post('/jobs/bulk-csv', csvUpload.single('file'), ctrl.bulkUploadJobsCSV);

module.exports = router;