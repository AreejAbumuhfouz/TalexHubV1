'use strict';
// ════════════════════════════════════════════════════════════
// Admin Controller — Main Entry Point
// ════════════════════════════════════════════════════════════

const stats         = require('./admin/stats.controller');
const user          = require('./admin/user.controller');
const company       = require('./admin/company.controller');
const job           = require('./admin/job.controller');
const course        = require('./admin/course.controller');
// const chatRoom      = require('./admin/chatRoom.controller');
const wallet        = require('./admin/wallet.controller');
const moderation    = require('./admin/moderation.controller');
const notification  = require('./admin/notification.controller');
const waitlist      = require('./admin/waitlist.controller');
const settings      = require('./admin/settings.controller');
const audit         = require('./admin/audit.controller');
const category      = require('./admin/category.controller');
const exportCtrl    = require('./admin/export.controller');
const pricing       = require('./admin/pricing.controller');
const heroPills     = require('./admin/heroPills.controller');
const chatRoomAdmin = require('./admin/chatRoom.controller');
const badWords = require('./admin/badWords.controller');
const training = require('./admin/training.controller');  // ✅ ADD THIS LINE
const careerPath = require('./admin/careerPath.admin.controller')
const cvAdmin = require('./admin/cv.admin.controller');
const autoApplyAdmin = require('./admin/Autoapply.admin.controller');

module.exports = {
  // Stats
  getStats:              stats.getStats,
  getAnalyticsOverview:  stats.getAnalyticsOverview,

  // Hero Pills
  getHeroPills:          heroPills.get,
  saveHeroPills:         heroPills.save,

  // Users
  getUsers:              user.getAll,
  getUser:               user.getOne,
  createUser:            user.create,
  updateUser:            user.update,
  updateUserStatus:      user.updateStatus,
  updateUserPlan:        user.updatePlan,
  resetUserPassword:     user.resetPassword,
  deleteUser:            user.delete,
  bulkUpdatePlans:       user.bulkUpdatePlans,

  // Companies
  getCompanies:          company.getAll,
  getPendingCompanies:   company.getPending,
  getCompany:            company.getOne,
  createCompany:         company.create,
  updateCompany:         company.update,
  approveCompany:        company.approve,
  rejectCompany:         company.reject,
  deleteCompany:         company.delete,

  // Jobs
  getJobs:               job.getAll,
  getJob:                job.getOne,
  createJob:             job.create,
  updateJob:             job.update,
  approveJob:            job.approve,
  rejectJob:             job.reject,
  deleteJob:             job.delete,
  getJobApplicants:      job.getApplicants,

  // Courses (PDF upload/download only - no lessons)
  getCourses:            course.getAll,
  getCourse:             course.getOne,
  createCourse:          course.create,
  updateCourse:          course.update,
  replaceCoursePdf:      course.replacePdf,
  updateCourseStatus:    course.updateStatus,
  deleteCourse:          course.delete,
  downloadCoursePdf:     course.downloadPdf,
  getCourseStats:        course.getStats,

  // Chat Rooms
  getChatRooms:             chatRoomAdmin.getAll,
  getChatRoom:              chatRoomAdmin.getOne,
  createChatRoom:           chatRoomAdmin.create,
  updateChatRoom:           chatRoomAdmin.update,
  toggleChatRoom:           chatRoomAdmin.toggle,
  deleteChatRoom:           chatRoomAdmin.delete,
  getChatRoomStats:         chatRoomAdmin.getStats,

  // Chat Plans Admin
  getChatPlans:             chatRoomAdmin.getPlans,
  updateChatPlans:          chatRoomAdmin.updatePlans,
  resetChatPlans:           chatRoomAdmin.resetPlans,
  toggleFreeChatCreate:     chatRoomAdmin.toggleFreeCreate,

  // Chat Reports Admin
  getChatReports:           chatRoomAdmin.getReports,
  getChatReport:            chatRoomAdmin.getReport,
  resolveChatReport:        chatRoomAdmin.resolveReport,
  deleteChatReport:         chatRoomAdmin.deleteReport,

  // Chat Suspensions
  getSuspendedChatUsers:    chatRoomAdmin.getSuspendedUsers,
  suspendChatUser:          chatRoomAdmin.suspendUser,
  unsuspendChatUser:        chatRoomAdmin.unsuspendUser,

  // Wallets
  getWallets:            wallet.getAll,
  getWallet:             wallet.getOne,
  adjustWallet:          wallet.adjust,
  bulkAddPoints:         wallet.bulkAddPoints,
  getWalletTransactions: wallet.getTransactions,

  // Content Moderation
  hidePost:              moderation.hidePost,
  deletePost:            moderation.deletePost,
  getReportedPosts:      moderation.getReportedPosts,
  resolveReport:         moderation.resolveReport,

  // Notifications
  broadcastNotification: notification.broadcast,

  // Waitlist
  getWaitlist:           waitlist.getAll,
  deleteWaitlistEntry:   waitlist.delete,

  // Settings
  getSettings:           settings.getAll,
  updateSetting:         settings.update,
  bulkUpdateSettings:    settings.bulkUpdate,

  // Audit Log
  getAuditLogs:          audit.getAll,

  // Categories
  getJobCategories:      category.getJobCategories,
  getCourseCategories:   category.getCourseCategories,
  getChatCategories:     category.getChatCategories,
  getCompanyList:        category.getCompanyList,

  // Exports
  exportData:            exportCtrl.exportData,
  exportJobApplicants:   exportCtrl.exportJobApplicants,

  // Plans & Pricing
  getPlanFeatures:       pricing.getPlanFeatures,
  adminGetPricing:       pricing.get,
  adminSaveTiers:        pricing.saveTiers,
  adminSaveFeatures:     pricing.saveFeatures,
  adminResetPricing:     pricing.reset,

  // Bad Words
  getBadWords:    badWords.getBadWords,
  updateBadWords: badWords.updateBadWords,

  getAllSessions:        training.getAllSessions,
  getSessionById:        training.getSessionById,
  getLimitsConfig:       training.getLimitsConfig,
  updateLimitsConfig:    training.updateLimitsConfig,
  getGlobalStats:        training.getGlobalStats,
  getUserUsageStats:     training.getUserUsageStats,
  resetUserLimits:       training.resetUserLimits,



  // Career Path Admin ✅
  getCareerPathLimits:    careerPath.getLimits,
  updateCareerPathLimits: careerPath.updateLimits,
  resetCareerPathLimits:  careerPath.resetLimits,
  getCareerPathSessions:  careerPath.getAllSessions,
  getCareerPathStats:     careerPath.getStats,


  // CV Admin
  adminGetCVConfig:  cvAdmin.getConfig,
  adminUpdateCVConfig: cvAdmin.updateConfig,
  adminGetCVStats:   cvAdmin.getStats,
  adminListCVs:      cvAdmin.listCVs,
  adminGetCV:        cvAdmin.getCV,
  adminDeleteCV:     cvAdmin.deleteCV,
  adminGetCVUsage:   cvAdmin.getUsage,

// Auto-Apply Admin
adminGetAutoApplications: autoApplyAdmin.getApplications,


 bulkUploadJobsCSV:       job.bulkUploadCSV,        // ✅ جديد
downloadBulkJobTemplate: job.downloadBulkTemplate, // ✅ جديد
};