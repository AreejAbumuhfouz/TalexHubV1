'use strict';

/**
 * export.service.js
 * All data export logic for the admin dashboard.
 * Each function returns { rows, columns, headers, filename }
 * which gets passed to csvBuilder.sendCsv()
 */

const { Op }  = require('sequelize');
const {
  User, Company, Job, JobApplication, CV,
  AuditLog, CommunityPost, PostReport,
  Course, UserCourse,
  Wallet, WalletTransaction,
  Notification, ChatRoom,
  Referral, TrainingSession,
} = require('../models');
const { buildCsv } = require('../utils/csvBuilder');

const fmt = (d) => d ? new Date(d).toISOString().slice(0, 19).replace('T', ' ') : '';
const flatUser = (u) => ({
  id:           u.id,
  fullName:     u.fullName     || '',
  email:        u.email        || '',
  role:         u.role         || '',
  status:       u.status       || '',
  planKey:      u.planKey      || 'free',
  country:      u.locationCountry || '',
  city:         u.locationCity    || '',
  phone:        u.phone           || '',
  emailVerified:u.emailVerified ? 'Yes' : 'No',
  openToWork:   u.openToWork   ? 'Yes' : 'No',
  lastLogin:    fmt(u.lastLoginAt),
  joined:       fmt(u.createdAt || u.created_at),
});

/* ── USERS ─────────────────────────────────────────────── */
exports.exportUsers = async (filters = {}) => {
  const where = { deletedAt: null };
  if (filters.status)  where.status  = filters.status;
  if (filters.planKey) where.planKey = filters.planKey;
  if (filters.role)    where.role    = filters.role;

  const rows = await User.findAll({
    where,
    attributes: ['id','fullName','email','role','status','planKey',
      'locationCountry','locationCity','phone','emailVerified',
      'openToWork','lastLoginAt','createdAt'],
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const columns = ['id','fullName','email','role','status','planKey',
    'country','city','phone','emailVerified','openToWork','lastLogin','joined'];
  const headers = {
    id:'ID', fullName:'Full Name', email:'Email', role:'Role',
    status:'Status', planKey:'Plan', country:'Country', city:'City',
    phone:'Phone', emailVerified:'Email Verified', openToWork:'Open to Work',
    lastLogin:'Last Login', joined:'Joined',
  };

  return { csv: buildCsv(rows.map(flatUser), columns, headers), filename: `users_${Date.now()}.csv` };
};

/* ── JOBS ──────────────────────────────────────────────── */
exports.exportJobs = async (filters = {}) => {
  const where = { deletedAt: null };
  if (filters.status) where.status = filters.status;

  const rows = await Job.findAll({
    where,
    include: [{ model: Company, as: 'company', attributes: ['name'] }],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  });

  const mapped = rows.map(j => ({
    id:           j.id,
    title:        j.title        || '',
    company:      j.company?.name || '',
    status:       j.status       || '',
    jobType:      j.jobType      || '',
    locationCountry: j.locationCountry || '',
    locationCity:    j.locationCity    || '',
    isRemote:     j.isRemote ? 'Yes' : 'No',
    salaryMin:    j.salaryMin    || '',
    salaryMax:    j.salaryMax    || '',
    currency:     j.salaryCurrency || '',
    applications: j.applicationsCount || 0,
    views:        j.viewsCount   || 0,
    deadline:     j.deadline     || '',
    created:      fmt(j.createdAt),
  }));

  const columns = ['id','title','company','status','jobType','locationCountry',
    'locationCity','isRemote','salaryMin','salaryMax','currency','applications','views','deadline','created'];
  const headers = {
    id:'ID', title:'Title', company:'Company', status:'Status', jobType:'Type',
    locationCountry:'Country', locationCity:'City', isRemote:'Remote',
    salaryMin:'Salary Min', salaryMax:'Salary Max', currency:'Currency',
    applications:'Applications', views:'Views', deadline:'Deadline', created:'Created',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `jobs_${Date.now()}.csv` };
};

/* ── JOB APPLICANTS ────────────────────────────────────── */
exports.exportJobApplicants = async (jobId) => {
  const rows = await JobApplication.findAll({
    where: { jobId },
    include: [
      { model: User, as: 'applicant', attributes: ['fullName','email','phone','locationCountry'] },
      { model: Job,  as: 'job',       attributes: ['title'] },
    ],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  });

  const mapped = rows.map(a => ({
    id:         a.id,
    name:       a.applicant?.fullName || '',
    email:      a.applicant?.email    || '',
    phone:      a.applicant?.phone    || '',
    country:    a.applicant?.locationCountry || '',
    job:        a.job?.title          || '',
    status:     a.status              || '',
    matchScore: a.matchScore          || '',
    autoApplied:a.isAutoApplied ? 'Yes' : 'No',
    applied:    fmt(a.createdAt),
  }));

  const columns = ['id','name','email','phone','country','job','status','matchScore','autoApplied','applied'];
  const headers = {
    id:'ID', name:'Name', email:'Email', phone:'Phone', country:'Country',
    job:'Job', status:'Status', matchScore:'Match Score', autoApplied:'Auto Applied', applied:'Applied',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `applicants_job_${jobId}_${Date.now()}.csv` };
};

/* ── COMPANIES ─────────────────────────────────────────── */
exports.exportCompanies = async (filters = {}) => {
  const where = { deletedAt: null };
  if (filters.status) where.status = filters.status;

  const rows = await Company.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['fullName','email'] }],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  });

  const mapped = rows.map(c => ({
    id:          c.id,
    name:        c.name       || '',
    owner:       c.owner?.fullName || '',
    ownerEmail:  c.owner?.email    || '',
    status:      c.status     || '',
    industry:    c.industry   || '',
    size:        c.companySize || '',
    country:     c.locationCountry || '',
    city:        c.locationCity    || '',
    website:     c.website    || '',
    jobsPosted:  c.totalJobsPosted || 0,
    hires:       c.totalHires      || 0,
    created:     fmt(c.createdAt),
  }));

  const columns = ['id','name','owner','ownerEmail','status','industry','size',
    'country','city','website','jobsPosted','hires','created'];
  const headers = {
    id:'ID', name:'Company', owner:'Owner', ownerEmail:'Owner Email',
    status:'Status', industry:'Industry', size:'Size', country:'Country',
    city:'City', website:'Website', jobsPosted:'Jobs Posted', hires:'Hires', created:'Created',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `companies_${Date.now()}.csv` };
};

/* ── APPLICATIONS ──────────────────────────────────────── */
exports.exportApplications = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;

  const rows = await JobApplication.findAll({
    where,
    include: [
      { model: User,    as: 'applicant', attributes: ['fullName','email'] },
      { model: Job,     as: 'job',       attributes: ['title'] },
    ],
    order: [['createdAt', 'DESC']],
    limit: 10000,
    raw: true,
    nest: true,
  });

  const mapped = rows.map(a => ({
    id:         a.id,
    name:       a.applicant?.fullName || '',
    email:      a.applicant?.email    || '',
    job:        a.job?.title          || '',
    status:     a.status              || '',
    matchScore: a.matchScore          || '',
    autoApplied:a.isAutoApplied ? 'Yes' : 'No',
    method:     a.applyMethod         || '',
    applied:    fmt(a.createdAt),
  }));

  const columns = ['id','name','email','job','status','matchScore','autoApplied','method','applied'];
  const headers = {
    id:'ID', name:'Applicant', email:'Email', job:'Job', status:'Status',
    matchScore:'Match Score', autoApplied:'Auto Applied', method:'Method', applied:'Applied',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `applications_${Date.now()}.csv` };
};

/* ── COURSES ───────────────────────────────────────────── */
exports.exportCourses = async () => {
  const rows = await Course.findAll({
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  const mapped = rows.map(c => ({
    id:       c.id,
    title:    c.title    || '',
    status:   c.status   || '',
    price:    c.price    || 0,
    isFree:   c.isFree ? 'Yes' : 'No',
    level:    c.level    || '',
    language: c.language || '',
    enrolled: c.enrolledCount || 0,
    rating:   c.ratingAvg    || 0,
    ratings:  c.ratingCount  || 0,
    created:  fmt(c.createdAt),
  }));

  const columns = ['id','title','status','price','isFree','level','language','enrolled','rating','ratings','created'];
  const headers = {
    id:'ID', title:'Title', status:'Status', price:'Price', isFree:'Free',
    level:'Level', language:'Language', enrolled:'Enrolled', rating:'Avg Rating',
    ratings:'Total Ratings', created:'Created',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `courses_${Date.now()}.csv` };
};

/* ── WALLETS ───────────────────────────────────────────── */
exports.exportWallets = async () => {
  const rows = await Wallet.findAll({
    include: [{ model: User, as: 'user', attributes: ['fullName','email'] }],
    order: [['cashBalance', 'DESC']],
    raw: true,
    nest: true,
  });

  const mapped = rows.map(w => ({
    id:       w.id,
    name:     w.user?.fullName || '',
    email:    w.user?.email    || '',
    points:   w.pointsBalance  || 0,
    cash:     w.cashBalance    || 0,
    currency: w.currency       || 'USD',
    frozen:   w.isFrozen ? 'Yes' : 'No',
  }));

  const columns = ['id','name','email','points','cash','currency','frozen'];
  const headers = {
    id:'ID', name:'User', email:'Email', points:'Points Balance',
    cash:'Cash Balance', currency:'Currency', frozen:'Frozen',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `wallets_${Date.now()}.csv` };
};

/* ── TRANSACTIONS ──────────────────────────────────────── */
exports.exportTransactions = async (filters = {}) => {
  const where = {};
  if (filters.type) where.type = filters.type;

  const rows = await WalletTransaction.findAll({
    where,
    include: [{
      model: Wallet, as: 'wallet',
      include: [{ model: User, as: 'user', attributes: ['fullName','email'] }],
    }],
    order: [['createdAt', 'DESC']],
    limit: 10000,
    raw: true,
    nest: true,
  });

  const mapped = rows.map(t => ({
    id:          t.id,
    user:        t.wallet?.user?.fullName || '',
    email:       t.wallet?.user?.email    || '',
    type:        t.type          || '',
    points:      t.pointsDelta   || 0,
    cash:        t.cashDelta     || 0,
    description: t.description   || '',
    gateway:     t.paymentGateway|| '',
    created:     fmt(t.createdAt),
  }));

  const columns = ['id','user','email','type','points','cash','description','gateway','created'];
  const headers = {
    id:'ID', user:'User', email:'Email', type:'Type', points:'Points Delta',
    cash:'Cash Delta', description:'Description', gateway:'Gateway', created:'Date',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `transactions_${Date.now()}.csv` };
};

/* ── AUDIT LOG ─────────────────────────────────────────── */
exports.exportAuditLog = async (filters = {}) => {
  const where = {};
  if (filters.action)     where.action     = { [Op.iLike]: `%${filters.action}%` };
  if (filters.entityType) where.entityType = filters.entityType;

  const rows = await AuditLog.findAll({
    where,
    include: [{ model: User, as: 'actor', attributes: ['fullName','email'], required: false }],
    order: [['createdAt', 'DESC']],
    limit: 10000,
    raw: true,
    nest: true,
  });

  const mapped = rows.map(l => ({
    id:         l.id,
    actor:      l.actor?.fullName || '',
    actorEmail: l.actor?.email    || '',
    action:     l.action          || '',
    entityType: l.entityType      || '',
    entityId:   l.entityId        || '',
    ip:         l.ipAddress        || '',
    created:    fmt(l.createdAt),
  }));

  const columns = ['id','actor','actorEmail','action','entityType','entityId','ip','created'];
  const headers = {
    id:'ID', actor:'Actor', actorEmail:'Email', action:'Action',
    entityType:'Entity Type', entityId:'Entity ID', ip:'IP Address', created:'Date',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `audit_log_${Date.now()}.csv` };
};

/* ── WAITLIST ───────────────────────────────────────────── */
exports.exportWaitlist = async () => {
  const { sequelize } = require('../models');
  let rows = [];
  try {
    rows = await sequelize.query(
      'SELECT id, email, lang, ip, created_at FROM waitlist ORDER BY created_at DESC',
      { type: sequelize.QueryTypes.SELECT }
    );
  } catch { rows = []; }

  const mapped = rows.map(w => ({
    id:      w.id,
    email:   w.email   || '',
    lang:    w.lang    || '',
    ip:      w.ip      || '',
    created: fmt(w.created_at),
  }));

  const columns = ['id','email','lang','ip','created'];
  const headers = { id:'ID', email:'Email', lang:'Language', ip:'IP Address', created:'Signed Up' };

  return { csv: buildCsv(mapped, columns, headers), filename: `waitlist_${Date.now()}.csv` };
};

/* ── REPORTED POSTS ────────────────────────────────────── */
exports.exportReportedPosts = async () => {
  const rows = await PostReport.findAll({
    include: [
      { model: CommunityPost, as: 'post', attributes: ['content','userId'] },
    ],
    order: [['createdAt', 'DESC']],
    raw: true,
    nest: true,
  });

  const mapped = rows.map(r => ({
    id:       r.id,
    reason:   r.reason   || '',
    details:  r.details  || '',
    resolved: r.resolved ? 'Yes' : 'No',
    postId:   r.postId   || '',
    content:  (r.post?.content || '').slice(0, 100),
    created:  fmt(r.createdAt),
  }));

  const columns = ['id','reason','details','resolved','postId','content','created'];
  const headers = {
    id:'ID', reason:'Reason', details:'Details', resolved:'Resolved',
    postId:'Post ID', content:'Post Preview', created:'Reported',
  };

  return { csv: buildCsv(mapped, columns, headers), filename: `reported_posts_${Date.now()}.csv` };
};