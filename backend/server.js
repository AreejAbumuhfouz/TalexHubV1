'use strict';

// ════════════════════════════════════════════════════════════
// 1. تحميل متغيرات البيئة — أول شيء دائماً
// ════════════════════════════════════════════════════════════
require('dotenv').config();

// ════════════════════════════════════════════════════════════
// 2. التحقق من متغيرات البيئة الإلزامية
// ════════════════════════════════════════════════════════════
const REQUIRED_ENV = [
  'NODE_ENV', 'PORT', 'DB_URI',
  'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET',
  'FRONTEND_URL', 'API_PREFIX',
];

// ✅ SESSION_SECRET auto-generate in development
if (!process.env.SESSION_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ SESSION_SECRET is required in production');
    process.exit(1);
  }
  process.env.SESSION_SECRET = 'dev-session-secret-' + require('crypto').randomBytes(32).toString('hex');
  console.warn('⚠️  Using auto-generated SESSION_SECRET for development');
}

const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('❌ Missing environment variables:', missing.join(', '));
  process.exit(1);
}

// ════════════════════════════════════════════════════════════
// 3. التحقق من قوة الـ Secrets
// ════════════════════════════════════════════════════════════
const WEAK_SECRETS = [
  'your_super_secret_access_key_min_32_chars',
  'your_super_secret_refresh_key_min_32_chars',
  'your_cookie_secret_min_32_chars',
];

const hasWeakSecret =
  WEAK_SECRETS.includes(process.env.JWT_ACCESS_SECRET) ||
  WEAK_SECRETS.includes(process.env.JWT_REFRESH_SECRET) ||
  WEAK_SECRETS.includes(process.env.COOKIE_SECRET);

if (hasWeakSecret) {
  const genCmd = `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`;
  if (process.env.NODE_ENV === 'production') {
    console.error(`❌ Default JWT/Cookie secrets are NOT allowed in production. Generate strong secrets using:\n  ${genCmd}`);
    process.exit(1);
  } else {
    console.warn(`⚠️  WARNING: You are using default JWT/Cookie secrets — NOT safe for production. Generate strong secrets using:\n  ${genCmd}`);
  }
}

// ════════════════════════════════════════════════════════════
// 4. Imports — كل واحد مرة واحدة فقط
// ════════════════════════════════════════════════════════════
require('express-async-errors');

const express        = require('express');
const http           = require('http');
const { Server }     = require('socket.io');
const cors           = require('cors');
const helmet         = require('helmet');
const compression    = require('compression');
const morgan         = require('morgan');
const cookieParser   = require('cookie-parser');
const session        = require('express-session');
const { RedisStore } = require('connect-redis');
const Csrf           = require('csrf');
const csrfTokens     = new Csrf();
const rateLimit      = require('express-rate-limit');
const slowDown       = require('express-slow-down');
const hpp            = require('hpp');
const cacheUser      = require('./middleware/cacheUser');

// ✅ Redis
const redisClient = require('./config/redis');

// ✅ Database
const { sequelize } = require('./models');

// ✅ Utils & Middleware
const logger        = require('./utils/logger');
const errorHandler  = require('./middleware/errorHandler');
const socketHandler = require('./utils/socketHandler');

// ✅ Passport
const passport = require('./config/passport');

// ── Routes ────────────────────────────────────────────────────
const authRoutes             = require('./routes/auth.routes');
const companyRegisterRoutes = require('./routes/companyRegister.routes');
const userRoutes             = require('./routes/user.routes');
const companyRoutes          = require('./routes/company.routes');
const cvRoutes               = require('./routes/cv.routes');
const waitlistRoutes         = require('./routes/waitlist.routes');
const jobRoutes              = require('./routes/job.routes');
const applicationRoutes      = require('./routes/application.routes');
const adminRoutes            = require('./routes/admin.routes');
const trainingRoutes         = require('./routes/training.routes');
const courseRoutes           = require('./routes/course.routes');
const communityRoutes        = require('./routes/community.routes');
const chatRoutes             = require('./routes/chat.routes');
const careerPathRoutes       = require('./routes/careerpath.routes');
const walletRoutes           = require('./routes/wallet.routes');
const notificationRoutes     = require('./routes/notification.routes');
const paymentRoutes          = require('./routes/payment.routes');
const aiRoutes               = require('./routes/ai.routes');
const contactRoutes          = require('./routes/contact.routes');
const settingsRoutes         = require('./routes/settings.routes');
const deepUsageRoutes        = require('./routes/usage.routes');
const pointsAdminRoutes      = require('./routes/pointsAdmin.routes');
const newsletterRoutes       = require('./routes/newsletter.routes');
const plansRoutes            = require('./routes/plans.routes');
const filesRoutes            = require('./routes/files.routes');
const publicRoutes           = require('./routes/public.routes');
const companyAnalyticsRoutes = require('./routes/company.analytics.routes');

const aiFeaturesRoutes       = require('./routes/aiFeatures.routes'); // ✅ FIX #2

// ════════════════════════════════════════════════════════════
// 5. إنشاء التطبيق والسيرفر
// ════════════════════════════════════════════════════════════
const app    = express();
const server = http.createServer(app);

const IS_PROD = process.env.NODE_ENV === 'production';
const API     = process.env.API_PREFIX;

// ════════════════════════════════════════════════════════════
// 6. Socket.io
// ════════════════════════════════════════════════════════════
const io = new Server(server, {
  cors: {
    origin:      process.env.FRONTEND_URL,
    credentials: true,
  },
  allowEIO3: false,
});

// ════════════════════════════════════════════════════════════
// 7. Redis Events
// ════════════════════════════════════════════════════════════
// redisClient.on('error',        (err) => logger.error('❌ Redis error:', { message: err.message }));
redisClient.on('error', (err) => {
  console.error('❌ Redis error full:', err);
  console.error('❌ Message:', err?.message);
  console.error('❌ Code:', err?.code);
  console.error('❌ Stack:', err?.stack);
});
redisClient.on('connect',      ()    => logger.info('✅ Redis connected'));
redisClient.on('reconnecting', ()    => logger.warn('⚠️  Redis reconnecting...'));
// ════════════════════════════════════════════════════════════
// 8. Trust Proxy
// ════════════════════════════════════════════════════════════
app.set('trust proxy', 1);

// ════════════════════════════════════════════════════════════
// 9. Security Headers — Helmet
// ════════════════════════════════════════════════════════════
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:              ["'self'"],
      scriptSrc:               ["'self'"],
      styleSrc:                ["'self'"],
      imgSrc:                  ["'self'", 'data:', 'https:'],
      connectSrc:              ["'self'", process.env.FRONTEND_URL, process.env.R2_PUBLIC_URL].filter(Boolean),
      fontSrc:                 ["'self'", 'https:'],
      objectSrc:               ["'none'"],
      frameSrc:                ["'none'"],
      upgradeInsecureRequests: IS_PROD ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: IS_PROD
    ? { maxAge: 31_536_000, includeSubDomains: true, preload: true }
    : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ════════════════════════════════════════════════════════════
// 10. CORS
// ════════════════════════════════════════════════════════════
app.use(cors({
  origin:         process.env.FRONTEND_URL,
  credentials:    true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count'],
}));

// ════════════════════════════════════════════════════════════
// 11. Rate Limiting
// ════════════════════════════════════════════════════════════
const globalLimiter = rateLimit({
  windowMs:        parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:             parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  message:         { success: false, message: 'Too many requests, try again later' },
  standardHeaders: true,
  legacyHeaders:   false,
  skip:            (req) => req.method === 'OPTIONS',
});

const speedLimiter = slowDown({
  windowMs:   30_000,
  delayAfter: 200,
  delayMs:    () => 200,
});

app.use(globalLimiter);
app.use(speedLimiter);

// ════════════════════════════════════════════════════════════
// 12. Body Parsing
// ════════════════════════════════════════════════════════════
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// ════════════════════════════════════════════════════════════
// 13. SESSION MIDDLEWARE — before passport
// ════════════════════════════════════════════════════════════
app.use(session({
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:',
    ttl:    86400,
  }),
  secret:            process.env.SESSION_SECRET,
  name:              'TalexHub.sid',
  resave:            false,
  saveUninitialized: false,
  rolling:           true,
  cookie: {
    secure:   IS_PROD,
    httpOnly: true,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge:   24 * 60 * 60 * 1000,
  },
}));

// ════════════════════════════════════════════════════════════
// 14. CSRF Protection
// ════════════════════════════════════════════════════════════
app.get(`${API}/csrf-token`, (req, res) => {
  const secret = req.signedCookies._csrfSecret || csrfTokens.secretSync();
  const token  = csrfTokens.create(secret);

  res.cookie('_csrfSecret', secret, {
    httpOnly: true,
    signed:   true,
    secure:   IS_PROD,
    sameSite: IS_PROD ? 'strict' : 'lax',
    maxAge:   60 * 60 * 1000,
  });

  res.json({ csrfToken: token });
});

const csrfProtect = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const secret = req.signedCookies._csrfSecret;
  const token  = req.headers['x-csrf-token'];

  if (!secret || !token || !csrfTokens.verify(secret, token)) {
    logger.warn(`CSRF failed: ${req.method} ${req.path} from ${req.ip}`);
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }
  next();
};

app.use(csrfProtect);
app.use(cacheUser);

// ════════════════════════════════════════════════════════════
// 15. HPP + Compression
// ════════════════════════════════════════════════════════════
app.use(hpp());
app.use(compression({
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
}));

// ════════════════════════════════════════════════════════════
// 16. PASSPORT — after session
// ════════════════════════════════════════════════════════════
app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const { User } = require('./models');
//     const user = await User.findByPk(id, {
//       attributes: ['id', 'fullName', 'email', 'role', 'status', 'planKey', 'avatarUrl'],
//     });
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });

// ════════════════════════════════════════════════════════════
// 17. HTTP Logging
// ════════════════════════════════════════════════════════════
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(IS_PROD ? 'combined' : 'dev', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip:   (req) => req.path === '/health',
  }));
}

// ════════════════════════════════════════════════════════════
// 18. Attach io + redis to every request
// ════════════════════════════════════════════════════════════
app.use((req, _res, next) => {
  req.io    = io;
  req.redis = redisClient;
  next();
});

// ════════════════════════════════════════════════════════════
// 19. Health Check
// ════════════════════════════════════════════════════════════
app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    const redisPing = await redisClient.ping();
    res.json({
      status:    'OK',
      env:       process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      db:        'connected',
      redis:     redisPing === 'PONG' ? 'connected' : 'error',
      uptime:    Math.floor(process.uptime()),
    });
  } catch (err) {
    logger.error('Health check failed:', { message: err.message });
    res.status(503).json({ status: 'ERROR', db: 'disconnected' });
  }
});

// ════════════════════════════════════════════════════════════
// 20. API Routes
// ════════════════════════════════════════════════════════════
app.use(`${API}/auth`,                 authRoutes);
app.use(`${API}/auth/register-company`, companyRegisterRoutes);
app.use(`${API}/users`,                userRoutes);
app.use(`${API}/companies`,            companyRoutes);
app.use(`${API}/companies/analytics`,  companyAnalyticsRoutes);
app.use(`${API}/cvs`,                  cvRoutes);
app.use(`${API}/waitlist`,             waitlistRoutes);
app.use(`${API}/plans`,                plansRoutes);
app.use(`${API}/files`,                filesRoutes);
app.use(`${API}/jobs`,                 jobRoutes);
app.use(`${API}/applications`,         applicationRoutes);
app.use(`${API}/admin`,                adminRoutes);
app.use(`${API}/training`,             trainingRoutes);
app.use(`${API}/courses`,              courseRoutes);
app.use(`${API}/community`,            communityRoutes);
app.use(`${API}/chat`,                 chatRoutes);
app.use(`${API}/career-path`,          careerPathRoutes);
app.use(`${API}/wallet`,               walletRoutes);
app.use(`${API}/notifications`,        notificationRoutes);
app.use(`${API}/payments`,             paymentRoutes);
app.use(`${API}/ai`,                   aiRoutes);
app.use(`${API}/contact`,              contactRoutes);
app.use(`${API}/settings`,             settingsRoutes);
app.use(`${API}/usage`,                deepUsageRoutes);
app.use(`${API}/points-admin`,         pointsAdminRoutes);
app.use(`${API}/newsletter`,           newsletterRoutes);
app.use(`${API}/public`,               publicRoutes);
app.use(`${API}/ai-features`,          aiFeaturesRoutes); // ✅ FIX #2: was missing
app.use(`${API}/auto-apply`, require('./routes/autoApply.settings'));

// ════════════════════════════════════════════════════════════
// 21. 404 Handler
// ════════════════════════════════════════════════════════════
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ════════════════════════════════════════════════════════════
// 22. Global Error Handler
// ════════════════════════════════════════════════════════════
app.use(errorHandler);

// ════════════════════════════════════════════════════════════
// 23. Socket.io Handler
// ════════════════════════════════════════════════════════════
socketHandler(io);

// ════════════════════════════════════════════════════════════
// 24. Graceful Shutdown
// ════════════════════════════════════════════════════════════
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully...`);

  server.close(async () => {
    logger.info('✅ HTTP server closed');

    try {
      await redisClient.quit();
      logger.info('✅ Redis disconnected');
    } catch (err) {
      logger.error('Redis disconnect error:', { message: err.message });
    }

    try {
      await sequelize.close();
      logger.info('✅ PostgreSQL disconnected');
    } catch (err) {
      logger.error('DB disconnect error:', { message: err.message });
    }

    logger.info('👋 Server exited cleanly');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 15_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', { reason: String(reason) });
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { message: err.message, stack: err.stack });
  process.exit(1);
});

// ════════════════════════════════════════════════════════════
// 25. Start Server
// ════════════════════════════════════════════════════════════
const PORT = parseInt(process.env.PORT) || 5000;

const start = async () => {
  try {
    await redisClient.connect();
    logger.info('✅ Redis connected');

    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected');

    await require('./utils/ensureTables')();

    if (!IS_PROD) {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database synced (dev mode)');
    }

    server.listen(PORT, () => {
      logger.info(`🚀 Server running → http://localhost:${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📡 API prefix: ${API}`);
      logger.info(`⚡ PM2 instance: ${process.env.NODE_APP_INSTANCE ?? 0}`);
    });

    require('./jobs/cleanup.job');

    // ✅ FIX #3: Start auto-apply cron job
    const { startAutoApplyCron } = require('./jobs/autoApply.job');
    startAutoApplyCron(io);

  } catch (err) {
    logger.error('❌ Startup failed:', { message: err.message, stack: err.stack });
    process.exit(1);
  }
};

start();

module.exports = { app, server, io, redis: redisClient };