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
const { apiLimiter, authLimiter, workerLimiter } = require(path.join(__dirname, 'middleware', 'rateLimit.middleware'));
const { validate, sanitize, validateApiKey } = require(path.join(__dirname, 'middleware', 'validate.middleware'));
const { performanceMonitor, healthCheck } = require(path.join(__dirname, 'middleware', 'performance.middleware'));
const cacheMiddleware = require(path.join(__dirname, 'middleware', 'cache.middleware'));
require('dotenv').config();

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
const routesPath = path.join(process.cwd(), 'routes');
const authRoutes = require(path.join(routesPath, 'auth.routes'));
const participantRoutes = require(path.join(routesPath, 'participant.routes'));
const careWorkerRoutes = require(path.join(routesPath, 'careWorker.routes'));
const appointmentRoutes = require(path.join(routesPath, 'appointment.routes'));
const careNoteRoutes = require(path.join(routesPath, 'careNote.routes'));
const incidentReportRoutes = require(path.join(routesPath, 'incidentReport.routes'));
const documentRoutes = require(path.join(routesPath, 'document.routes'));
const reportRoutes = require(path.join(routesPath, 'report.routes'));
const billingRoutes = require(path.join(routesPath, 'billing.routes'));
const auditRoutes = require(path.join(routesPath, 'audit.routes'));
const userActivityRoutes = require(path.join(routesPath, 'userActivity.routes'));
const userRoutes = require(path.join(routesPath, 'user.routes'));
const messageRoutes = require(path.join(routesPath, 'message.routes'));
const restrictivePracticeRoutes = require(path.join(routesPath, 'restrictivepractice.routes'));
const staffRoutes = require(path.join(routesPath, 'staff.routes'));
const analyticsRoutes = require(path.join(routesPath, 'analytics.routes'));
const goalRoutes = require(path.join(routesPath, 'goal.routes'));
const securityRoutes = require(path.join(routesPath, 'security.routes'));
const invoiceRoutes = require(path.join(routesPath, 'invoice.routes'));
const notificationRoutes = require(path.join(routesPath, 'notification.routes'));
const emailRoutes = require(path.join(routesPath, 'email.routes'));
const schedulerRoutes = require(path.join(routesPath, 'scheduler.routes'));

// Initialize express app
const app = express();

// Initialize Sentry
monitoring.initSentry();

// Security middleware
app.use(monitoring.sentryRequestHandler()); // Sentry request handler should be the first middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL || "http://localhost:3000"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      sandbox: ['allow-forms', 'allow-scripts', 'allow-same-origin']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(xssProtection);
app.use(parameterProtection);
app.use(mongoQuerySanitization);
app.use(securityHeaders);

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 100 * 1000 // Only compress responses larger than 100kb
}));

// Performance monitoring
app.use(performanceMonitor);

// Cache middleware for GET requests
app.use(cacheMiddleware());

// Standard middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.get('/health', healthCheck);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/care-workers', careWorkerRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/care-notes', careNoteRoutes);
app.use('/api/incident-reports', incidentReportRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/audit', validateApiKey, auditRoutes);
app.use('/api/user-activity', userActivityRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/restrictive-practices', restrictivePracticeRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/schedulers', schedulerRoutes);

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
          await sequelize.runMigrations();
          logger.info('Database migrations completed successfully');
        } catch (error) {
          logger.error('Failed to run database migrations:', error);
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
