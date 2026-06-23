'use strict';

const exportSvc = require('../../services/export.service');
const { AuditLog } = require('../../models');
const { error } = require('../../utils/apiResponse');
const { sendCsv } = require('../../utils/csvBuilder');

const audit = (actor, action, id, o, n) =>
  AuditLog.create({ actorId: actor, action, entityType: 'Export', entityId: id, oldValue: o ? JSON.stringify(o) : null, newValue: JSON.stringify(n) }).catch(() => {});

exports.exportData = async (req, res) => {
  const { type } = req.params;
  const filters = req.query;
  const allowed = ['users', 'jobs', 'companies', 'applications', 'courses', 'wallets', 'transactions', 'audit', 'waitlist', 'reports'];
  if (!allowed.includes(type)) return error(res, `Invalid type. Valid: ${allowed.join(', ')}`, 400);

  try {
    let result;
    switch (type) {
      case 'users': result = await exportSvc.exportUsers(filters); break;
      case 'jobs': result = await exportSvc.exportJobs(filters); break;
      case 'companies': result = await exportSvc.exportCompanies(filters); break;
      case 'applications': result = await exportSvc.exportApplications(filters); break;
      case 'courses': result = await exportSvc.exportCourses(); break;
      case 'wallets': result = await exportSvc.exportWallets(); break;
      case 'transactions': result = await exportSvc.exportTransactions(filters); break;
      case 'audit': result = await exportSvc.exportAuditLog(filters); break;
      case 'waitlist': result = await exportSvc.exportWaitlist(); break;
      case 'reports': result = await exportSvc.exportReportedPosts(); break;
    }
    await audit(req.user.id, `export.${type}`, null, null, { filters });
    sendCsv(res, result.csv, result.filename);
  } catch (err) { return error(res, `Export failed: ${err.message}`, 500); }
};

exports.exportJobApplicants = async (req, res) => {
  try {
    const result = await exportSvc.exportJobApplicants(req.params.id);
    await audit(req.user.id, 'export.job_applicants', null, null, { jobId: req.params.id });
    sendCsv(res, result.csv, result.filename);
  } catch (err) { return error(res, `Export failed: ${err.message}`, 500); }
};