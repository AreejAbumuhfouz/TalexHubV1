'use strict';

const winston = require('winston');
const path    = require('path');
const fs      = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for development (readable)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (Object.keys(meta).length > 0 && meta.stack) {
      log += `\n${meta.stack}`;
    } else if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Custom format for production (JSON - for log analysis tools)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.metadata()
);

// Determine format based on environment
const isProduction = process.env.NODE_ENV === 'production';
const logFormat = isProduction ? prodFormat : devFormat;

// Create transports array
const transports = [
  // Console transport for all logs
  new winston.transports.Console({
    format: logFormat,
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  }),
  
  // File transport for errors only
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: prodFormat, // Always JSON for files
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
  
  // File transport for all logs (JSON format)
  new winston.transports.File({
    filename: path.join(logDir, 'app.log'),
    format: prodFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    tailable: true,
  }),
];

// Add separate HTTP request log file in production
if (isProduction) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logDir, 'http.log'),
      level: 'http',
      format: prodFormat,
      maxsize: 10485760,
      maxFiles: 5,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  format: prodFormat,
  transports,
  exitOnError: false, // Don't crash on logging errors
});

// Add custom methods for convenience
logger.logRequest = (req, statusCode = null) => {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.headers['cf-connecting-ip'] || req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    userId: req.user?.id || null,
  };
  
  if (statusCode) {
    logData.statusCode = statusCode;
  }
  
  logger.http(`${req.method} ${req.url}`, logData);
};

logger.logError = (err, req = null) => {
  const errorData = {
    message: err.message,
    stack: err.stack,
    name: err.name,
  };
  
  if (req) {
    errorData.url = req.url;
    errorData.method = req.method;
    errorData.userId = req.user?.id || null;
    errorData.ip = req.headers['cf-connecting-ip'] || req.ip;
  }
  
  logger.error(err.message, errorData);
};

// Handle uncaught exceptions and unhandled rejections
if (process.env.NODE_ENV === 'production') {
  logger.exceptions.handle(
    new winston.transports.File({ 
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 10485760,
      maxFiles: 3,
    })
  );
  
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', { error: reason });
  });
}

module.exports = logger;