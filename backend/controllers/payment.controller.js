

'use strict';
// ════════════════════════════════════════════════════════════
// backend/controllers/payment.controller.js
// ════════════════════════════════════════════════════════════

const multer         = require('multer');
const { PaymentRequest, User } = require('../models');
const storage        = require('../services/storage.service');
const walletSvc      = require('../services/wallet.service');
const { success, error, paginate } = require('../utils/apiResponse');
const { PLAN_FEATURES, getTierForCountry } = require('../config/pricing');
const { Op }         = require('sequelize');
const detectCountry  = require('../utils/detectCountry'); // ✅ استخدم الملف الموحد
const isAr           = require('../utils/isAr'); // ✅ استخدم ملف موحد للغة (سننشئه)

// ── Multer: receipt image ─────────────────────────────────
const receiptUpload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|jpg|png|webp|gif)|application\/pdf/.test(file.mimetype);
    cb(ok ? null : new Error('صور أو PDF فقط'), ok);
  },
}).single('receipt');

// ════════════════════════════════════════════════════════════
// POST /payments/request
// المستخدم يرسل طلب دفع مع الإيصال
// ════════════════════════════════════════════════════════════
exports.submitRequest = (req, res) => {
  receiptUpload(req, res, async (uploadErr) => {
    try {
      if (uploadErr) return error(res, uploadErr.message, 400);

      const { planKey, billingPeriod = 'monthly', senderName, senderPhone, transactionRef, notes, paymentMethod = 'cliq' } = req.body;

      // تحقق من الخطة
      const VALID_PLANS = ['pro', 'elite'];
      if (!VALID_PLANS.includes(planKey))
        return error(res, 'خطة غير صالحة', 400);

      if (!senderName?.trim())     return error(res, 'اسم المرسل مطلوب', 400);
      if (!transactionRef?.trim()) return error(res, 'رقم العملية مطلوب', 400);
      if (!req.file)               return error(res, 'إيصال الدفع مطلوب', 400);

      // ✅ استخدام detectCountry الموحد
      const country  = detectCountry(req);
      const tier     = getTierForCountry(country);
      const amount   = billingPeriod === 'yearly'
        ? tier.plans[planKey].yearly
        : tier.plans[planKey].monthly;
      const currency = tier.currency;

      // تحقق من وجود طلب معلّق مسبقاً
      const pending = await PaymentRequest.findOne({
        where: { userId: req.user.id, status: 'pending' },
      });
      if (pending)
        return error(
          res,
          isAr(req) ? 'لديك طلب معلّق بالفعل، انتظر مراجعته' : 'You already have a pending request',
          400,
          { code: 'PENDING_EXISTS' }
        );

      // رفع الإيصال لـ R2
      const uploaded = await storage.upload({
        buffer:       req.file.buffer,
        mimetype:     req.file.mimetype,
        originalname: req.file.originalname,
        folder:       'receipts',
        type:         'receipt',
      });

      // أنشئ الطلب
      const request = await PaymentRequest.create({
        userId:         req.user.id,
        planKey,
        billingPeriod,
        amount,
        currency,
        paymentMethod,
        senderName:     senderName.trim(),
        senderPhone:    senderPhone?.trim() || null,
        transactionRef: transactionRef.trim(),
        receiptUrl:     uploaded.url,
        receiptKey:     uploaded.key,
        notes:          notes?.trim() || null,
        status:         'pending',
      });

      return success(res, { request }, 'تم إرسال طلب الدفع بنجاح، سيتم مراجعته خلال 24 ساعة', 201);
    } catch (err) {
      return error(res, err.message, 500);
    }
  });
};

// ════════════════════════════════════════════════════════════
// GET /payments/my
// طلباتي كمستخدم
// ════════════════════════════════════════════════════════════
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await PaymentRequest.findAll({
      where:  { userId: req.user.id },
      order:  [['created_at', 'DESC']],
      limit:  20,
    });
    return success(res, requests);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// GET /payments (Admin)
// كل الطلبات
// ════════════════════════════════════════════════════════════
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = {};
    if (status) where.status = status;

    const { count, rows } = await PaymentRequest.findAndCountAll({
      where,
      include: [{
        model: User, as: 'user',
        attributes: ['id', 'fullName', 'email', 'planKey', 'avatarUrl'],
        required: false,
      }],
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
// PATCH /payments/:id/approve (Admin)
// قبول الطلب وتفعيل الخطة
// ════════════════════════════════════════════════════════════
exports.approveRequest = async (req, res) => {
  try {
    const request = await PaymentRequest.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', required: false }],
    });
    if (!request)                     return error(res, 'الطلب غير موجود', 404);
    if (request.status !== 'pending') return error(res, 'الطلب ليس معلّقاً', 400);

    // فعّل الخطة مع تاريخ الانتهاء
    const expiryDate = new Date();
    if (request.billingPeriod === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // سنة
    } else {
      expiryDate.setDate(expiryDate.getDate() + 30);        // 30 يوم
    }

    await User.update(
      {
        planKey:           request.planKey,
        planExpiresAt:     expiryDate,
        planBillingPeriod: request.billingPeriod || 'monthly',
      },
      { where: { id: request.userId } }
    );

    // أضف الرصيد النقدي للمحفظة (لو الخطة لها رصيد مرفق)
    await walletSvc.creditCash(
      request.userId,
      request.amount,
      `اشتراك ${request.planKey} — ${request.billingPeriod}`,
      {
        referenceId:    request.id,
        referenceType:  'PaymentRequest',
        createdBy:      req.user.id,
        paymentGateway: request.paymentMethod,
        gatewayRef:     request.transactionRef,
      }
    ).catch(() => {}); // لا نوقف الموافقة لو فشل الكريدت

    // حدّث حالة الطلب
    await request.update({
      status:     'approved',
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
    });

    return success(res, { request }, `تم تفعيل خطة ${request.planKey} للمستخدم`);
  } catch (err) {
    return error(res, err.message, 500);
  }
};

// ════════════════════════════════════════════════════════════
// PATCH /payments/:id/reject (Admin)
// رفض الطلب
// ════════════════════════════════════════════════════════════
exports.rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body;
    const request    = await PaymentRequest.findByPk(req.params.id);
    if (!request)                     return error(res, 'الطلب غير موجود', 404);
    if (request.status !== 'pending') return error(res, 'الطلب ليس معلّقاً', 400);

    await request.update({
      status:          'rejected',
      reviewedBy:      req.user.id,
      reviewedAt:      new Date(),
      rejectionReason: reason?.trim() || null,
    });

    return success(res, { request }, 'تم رفض الطلب');
  } catch (err) {
    return error(res, err.message, 500);
  }
};