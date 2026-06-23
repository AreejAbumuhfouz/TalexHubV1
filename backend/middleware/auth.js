
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash', 'twoFaSecret'] },
    });

    if (!user || user.status === 'deleted') {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended' });
    }

    // ✅ إضافة: التحقق من انتهاء صلاحية الخطة
    if (user.planKey !== 'free' && user.planExpiresAt && new Date(user.planExpiresAt) < new Date()) {
      // لا نمنع الوصول، لكن نعلم أن الخطة انتهت (يمكن التعامل معها في controller)
      req.planExpired = true;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Role '${req.user.role}' is not authorized for this action`,
    });
  }
  next();
};

// لا يرفض الطلب إذا ما في token — بس يضع req.user إذا وُجد
const optionalProtect = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);
    
    if (!token) return next(); // مجهول — تكمل بدون user
    
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['passwordHash', 'twoFaSecret'] },
    });
    
    // ✅ التصحيح: فقط المستخدم النشط يحصل على req.user
    if (user && user.status === 'active') {
      req.user = user;
    }
    // ✅ المستخدم المحظور أو المحذوف لا يحصل على req.user (يُعامل كزائر)
    // لا حاجة لوضع else if هنا لأننا لا نريد إضافة req.user لأي حالة أخرى
    
    next();
  } catch (err) {
    // token منتهي أو خاطئ — تكمل بدون user
    next();
  }
};

module.exports = { protect, authorize, optionalProtect };