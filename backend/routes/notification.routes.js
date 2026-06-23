'use strict';

const express  = require('express');
const router   = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { Notification } = require('../models');
const { success } = require('../utils/apiResponse');

// GET /notifications — جلب إشعارات المستخدم
router.get('/', protect, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { count, rows } = await Notification.findAndCountAll({
    where:  { userId: req.user.id },
    order:  [['created_at', 'DESC']],
    limit:  parseInt(limit),
    offset,
  });

  res.json({
    success: true,
    data: rows,
    pagination: {
      total: count,
      page:  parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit)),
    },
  });
});

// GET /notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  const count = await Notification.count({
    where: { userId: req.user.id, isRead: false },
  });
  return success(res, { count });
});

// PATCH /notifications/:id/read — علّم كمقروء
router.patch('/:id/read',
  protect,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    await Notification.update(
      { isRead: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );
    return success(res, {}, 'تم التعليم كمقروء');
  }
);

// PATCH /notifications/read-all — علّم الكل كمقروء
router.patch('/read-all', protect, async (req, res) => {
  await Notification.update(
    { isRead: true },
    { where: { userId: req.user.id, isRead: false } }
  );
  return success(res, {}, 'تم التعليم الكل كمقروء');
});

// DELETE /notifications/:id
router.delete('/:id',
  protect,
  [param('id').isUUID()],
  validate,
  async (req, res) => {
    await Notification.destroy({
      where: { id: req.params.id, userId: req.user.id },
    });
    return success(res, {}, 'تم الحذف');
  }
);

module.exports = router;
