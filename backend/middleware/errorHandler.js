

'use strict';

const logger = require('../utils/logger');

const errorHandler = (err, req, res, _next) => {
  // Default to 500 if no statusCode on error
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'حدث خطأ داخلي في الخادم';

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message    = err.errors.map(e => e.message).join(', ');
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message    = 'Record already exists';
  }

  // Sequelize database error (e.g. column does not exist)
  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    message    = process.env.NODE_ENV === 'development'
      ? `Database error: ${err.message}`
      : 'حدث خطأ في قاعدة البيانات';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expired';
  }

  // Log error
  logger.error(`[${req.method}] ${req.path} → ${statusCode}: ${message}`, {
    timestamp: new Date().toISOString(),
  });

  if (process.env.NODE_ENV === 'development') {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;