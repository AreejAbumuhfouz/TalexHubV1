'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/contact.controller.js
// ════════════════════════════════════════════════════════════

const { ContactMessage, User } = require('../models');
const { success, error, paginate } = require('../utils/apiResponse');
const { Op } = require('sequelize');

const VALID_CATS = ['general', 'billing', 'technical', 'partnership', 'career', 'other'];
const VALID_PRIO = ['low', 'normal', 'high', 'urgent'];

/* ── simple email validation ─────────────────────────────── */
const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ════════════════════════════════════════════════════════════
// POST /contact
// أي شخص يرسل رسالة (مسجّل أو زائر)
// ════════════════════════════════════════════════════════════
exports.submit = async (req, res) => {
  try {
    const { name, email, phone, subject, category, message } = req.body;

    // Validation
    if (!name?.trim())    return error(res, 'الاسم مطلوب', 400);
    if (!email?.trim())   return error(res, 'البريد الإلكتروني مطلوب', 400);
    if (!isEmail(email))  return error(res, 'بريد إلكتروني غير صالح', 400);
    if (!subject?.trim()) return error(res, 'الموضوع مطلوب', 400);
    if (!message?.trim()) return error(res, 'الرسالة مطلوبة', 400);
    if (message.trim().length < 10)
      return error(res, 'الرسالة قصيرة جداً (10 أحرف على الأقل)', 400);

    // Rate limit — max 3 messages per email per 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await ContactMessage.count({
      where: { email: email.toLowerCase().trim(), created_at: { [Op.gte]: oneDayAgo } },
    });
    if (recent >= 3)
      return error(res, 'تم تجاوز الحد المسموح به للرسائل (3 رسائل / 24 ساعة)', 429);

    const msg = await ContactMessage.create({
      userId:   req.user?.id || null,
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      phone:    phone?.trim() || null,
      subject:  subject.trim(),
      category: VALID_CATS.includes(category) ? category : 'general',
      message:  message.trim(),
    });

    return success(res, { id: msg.id }, 'تم إرسال رسالتك بنجاح، سنرد خلال 24 ساعة', 201);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/contact
// Admin — جميع الرسائل مع فلترة
// ════════════════════════════════════════════════════════════
exports.getAll = async (req, res) => {
  try {
    const { status, priority, category, search, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status)   where.status   = status;
    if (priority) where.priority = priority;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { name:    { [Op.iLike]: `%${search}%` } },
        { email:   { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await ContactMessage.findAndCountAll({
      where,
      include: [
        {
          model: User, as: 'sender',
          attributes: ['id', 'fullName', 'email', 'avatarUrl'],
          required: false,
        },
        {
          model: User, as: 'replier',
          attributes: ['id', 'fullName'],
          required: false,
        },
      ],
      order:  [['created_at', 'DESC']],
      limit:  parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    return paginate(res, rows, count, parseInt(page), parseInt(limit));
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/contact/stats
// إحصاءات سريعة
// ════════════════════════════════════════════════════════════
exports.getStats = async (_req, res) => {
  try {
    const [total, newCount, replied, closed] = await Promise.all([
      ContactMessage.count(),
      ContactMessage.count({ where: { status: 'new' } }),
      ContactMessage.count({ where: { status: 'replied' } }),
      ContactMessage.count({ where: { status: 'closed' } }),
    ]);
    return success(res, { total, new: newCount, replied, closed, pending: total - replied - closed });
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /admin/contact/:id
// رسالة واحدة كاملة + mark as read
// ════════════════════════════════════════════════════════════
exports.getOne = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id, {
      include: [
        { model: User, as: 'sender',  attributes: ['id','fullName','email','avatarUrl'], required: false },
        { model: User, as: 'replier', attributes: ['id','fullName'],                    required: false },
      ],
    });
    if (!msg) return error(res, 'الرسالة غير موجودة', 404);

    // Auto mark as read
    if (msg.status === 'new') await msg.update({ status: 'read' });

    return success(res, msg);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /admin/contact/:id/reply
// رد الأدمن على الرسالة
// ════════════════════════════════════════════════════════════
exports.reply = async (req, res) => {
  try {
    const { replyText, adminNote } = req.body;
    if (!replyText?.trim()) return error(res, 'نص الرد مطلوب', 400);

    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return error(res, 'الرسالة غير موجودة', 404);

    await msg.update({
      replyText: replyText.trim(),
      repliedBy: req.user.id,
      repliedAt: new Date(),
      status:    'replied',
      ...(adminNote !== undefined && { adminNote: adminNote?.trim() || null }),
    });

    // TODO: send email to msg.email with replyText
    // await emailService.sendContactReply(msg.email, msg.name, replyText);

    return success(res, { msg }, 'تم إرسال الرد بنجاح');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /admin/contact/:id/status
// تغيير الحالة أو الأولوية
// ════════════════════════════════════════════════════════════
exports.updateStatus = async (req, res) => {
  try {
    const { status, priority, adminNote } = req.body;
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return error(res, 'الرسالة غير موجودة', 404);

    const updates = {};
    if (status   && ['new','read','replied','closed'].includes(status)) updates.status = status;
    if (priority && VALID_PRIO.includes(priority)) updates.priority = priority;
    if (adminNote !== undefined) updates.adminNote = adminNote?.trim() || null;

    await msg.update(updates);
    return success(res, { msg }, 'تم التحديث');
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// DELETE /admin/contact/:id
// حذف رسالة
// ════════════════════════════════════════════════════════════
exports.deleteOne = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return error(res, 'الرسالة غير موجودة', 404);
    await msg.destroy();
    return success(res, {}, 'تم الحذف');
  } catch (err) {
    return error(res, err.message, 500);
  }
};
