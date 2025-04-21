const path = require('path');
const seedDatabase = require(path.join(__dirname, 'utils', 'seedDatabase'));
const { sequelize } = require(path.join(__dirname, 'config', 'database'));
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const logger = require(path.join(__dirname, 'config', 'logger'));
const monitoring = require(path.join(__dirname, 'config', 'monitoring'));
const { errorHandler, handleUnhandledRejection, handleUncaughtException } = require(path.join(__dirname, 'middleware', 'error.middleware'));
const { validate, sanitize, validateApiKey } = require(path.join(__dirname, 'middleware', 'validate.middleware'));
const { performanceMonitor, healthCheck } = require(path.join(__dirname, 'middleware', 'performance.middleware'));
const cacheMiddleware = require(path.join(__dirname, 'middleware', 'cache.middleware'));
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { PrismaClient } = require('@prisma/client');

// Import security middleware
const { 
  csrfProtection, 
  handleCSRFError,
  xssProtection,
  parameterProtection,
  mongoQuerySanitization,
  securityHeaders
} = require(path.join(__dirname, 'middleware', 'security.middleware'));

// Import sanitization middleware
const {
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams
} = require(path.join(__dirname, 'middleware', 'sanitization.middleware'));

// Import validation middleware
const { handleValidationErrors } = require(path.join(__dirname, 'middleware', 'validation.middleware'));

// Import routes using absolute paths with __dirname
const routesPath = path.join(__dirname, 'routes');

// Import existing routes
const authRoutes = require('./routes/auth.routes');
const participantRoutes = require('./routes/participant.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const careNoteRoutes = require('./routes/carenote.routes');
const incidentReportRoutes = require('./routes/incidentreport.routes');
const documentRoutes = require('./routes/document.routes');
const reportRoutes = require('./routes/report.routes');
const billingRoutes = require('./routes/billing.routes');
// Commented out to fix Render deployment - file not implemented yet
// const userActivityRoutes = require('./routes/useractivity.routes');
// Commented out to fix Render deployment - missing hasRole middleware
// const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');
// Commented out to fix Render deployment - missing restrictivePractice.model
// const restrictivePracticeRoutes = require('./routes/restrictivepractice.routes');
const staffRoutes = require('./routes/staff.routes');
// Commented out to fix Render deployment - AnalyticsService is not a constructor
// const analyticsRoutes = require('./routes/analytics.routes');
const goalRoutes = require('./routes/goal.routes');
// Commented out to fix Render deployment - Route.get() requires a callback function error
// const securityRoutes = require('./routes/security.routes');
const testRoutes = require('./routes/test.routes');

// Routes that are not yet implemented
// const userActivityRoutes = require('./routes/useractivity.routes');  // File doesn't exist
// const careWorkerRoutes = require('./routes/careworker.routes');
// const auditLogRoutes = require('./routes/auditlog.routes');
// const invoiceRoutes = require('./routes/invoice.routes');
// const notificationRoutes = require('./routes/notification.routes');
// const emailRoutes = require('./routes/email.routes');
// const schedulerRoutes = require('./routes/scheduler.routes');

const prisma = new PrismaClient();

// Initialize express app
const app = express();

// Initialize Sentry
monitoring.initSentry();

// Security middleware
app.use(monitoring.sentryRequestHandler()); // Sentry request handler should be the first middleware

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ALLOWED_ORIGINS?.split(',') || [
    'https://careflow-frontend.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...corsOptions.origin],
      imgSrc: ["'self'", "data:", "https:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting configuration
const createRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || process.env.RATE_LIMIT_MAX || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: options.windowMs / 1000
    },
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: options.windowMs / 1000
      });
    },
    skip: (req) => {
      // Skip rate limiting for health check and documentation endpoints
      const excludedPaths = ['/health', '/api/health', '/api/docs', '/api/docs.json'];
      return excludedPaths.includes(req.path);
    },
    ...options
  });
};

// Apply different rate limits for different routes
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.API_RATE_LIMIT_MAX || 100
});

const authLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.AUTH_RATE_LIMIT_MAX || 5
});

const workerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.WORKER_RATE_LIMIT_MAX || 50
});

// Body parsing
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_FILE_SIZE || '10mb' }));

// Security measures
app.use(mongoSanitize());
app.use(hpp());

// Logging
app.use(morgan('combined'));

// Compression
app.use(compression());

// Performance monitoring
app.use(performanceMonitor);

// Cache middleware for GET requests
app.use(cacheMiddleware());

// Sanitization middleware
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(sanitizeParams);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
app.use('/api/workers', workerLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Add root route handler
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to Careflow API',
    version: process.env.API_VERSION || '1.0.0',
    documentation: '/api/docs', // For future API documentation
    environment: process.env.NODE_ENV
  });
});

// Register existing API routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/care-notes', careNoteRoutes);
app.use('/api/incident-reports', incidentReportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
// Commented out to fix Render deployment - file not implemented yet
// app.use('/api/user-activity', userActivityRoutes);
app.use('/api/messages', messageRoutes);
// Commented out to fix Render deployment - missing restrictivePractice.model
// app.use('/api/restrictive-practices', restrictivePracticeRoutes);
app.use('/api/staff', staffRoutes);
// Commented out to fix Render deployment - missing hasRole middleware
// app.use('/api/users', userRoutes);
// Commented out to fix Render deployment - AnalyticsService is not a constructor
// app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
// Commented out to fix Render deployment - Route.get() requires a callback function error
// app.use('/api/security', securityRoutes);

// Register test routes
app.use('/api/test', testRoutes);

// Future route registrations
// app.use('/api/user-activity', userActivityRoutes);  // Route commented out - file doesn't exist
// app.use('/api/care-workers', careWorkerRoutes);
// Commented out to fix Render deployment - file not implemented yet
// app.use('/api/audit', validateApiKey, auditLogRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/emails', emailRoutes);
// app.use('/api/schedulers', schedulerRoutes);

// Error handling middleware
app.use(handleValidationErrors);
app.use(handleCSRFError);
app.use(monitoring.sentryErrorHandler());
app.use(errorHandler);

// Handle unhandled promise rejections
process.on('unhandledRejection', handleUnhandledRejection);

// Handle uncaught exceptions
process.on('uncaughtException', handleUncaughtException);

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // Load models
    try {
      const models = require(path.join(__dirname, 'models'));
      if (!models || Object.keys(models).length === 0) {
        throw new Error('No models were loaded successfully');
      }
      logger.info('Models loaded successfully');
    } catch (error) {
      logger.error('Failed to load models:', error);
      throw error;
    }
    
    // Handle database migrations based on environment
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force: false });
      logger.info('Database models synchronized');
      
      if (process.env.SEED_DATABASE === 'true') {
        const seedResult = await seedDatabase();
        if (seedResult) {
          logger.info('Database seeded successfully');
        }
      }
    } else {
      await sequelize.authenticate();
      logger.info('Database connection verified');
      
      if (process.env.AUTO_MIGRATE === 'true') {
        try {
          // Skip sync in production to avoid foreign key constraint errors
          // A proper migration solution should be implemented
          logger.info('Auto migrations are disabled in production to prevent errors.');
          logger.info('Use a proper migration tool for production database changes.');
          
          // Instead of using sequelize.sync, just log the schema status
          const [results] = await sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `);
          logger.info(`Database contains ${results.length} tables`);
        } catch (error) {
          logger.error('Failed to check database schema:', error);
        }
      }
    }
    
    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Version: ${process.env.API_VERSION || '1.0.0'}`);
    });

    // Enhanced error handling
    server.on('error', (error) => {
      logger.error('Server error:', error);
      server.close(() => {
        logger.info('Server closed after error');
        process.exit(1);
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      server.close(() => {
        logger.info('Server closed');
      });
      
      try {
        await sequelize.close();
        logger.info('Database connections closed');
      } catch (error) {
        logger.error('Error closing database connections:', error);
      }
      
      process.exit(0);
    };

    // Handle various termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeApp();

module.exports = app;
