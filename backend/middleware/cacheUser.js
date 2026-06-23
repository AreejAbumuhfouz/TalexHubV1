// backend/middleware/cacheUser.js
const { redisClient } = require('../server');

const cacheUser = async (req, res, next) => {
  if (!req.user?.id) return next();
  
  const cacheKey = `user:${req.user.id}`;
  
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      req.user = JSON.parse(cached);
      return next();
    }
    
    // بعد الـ response، خزن في cache
    const originalSend = res.send;
    res.send = function(data) {
      redisClient.setEx(cacheKey, 300, JSON.stringify(req.user)).catch(() => {});
      originalSend.call(this, data);
    };
  } catch (err) {
    console.error('Cache error:', err.message);
  }
  
  next();
};

module.exports = cacheUser;