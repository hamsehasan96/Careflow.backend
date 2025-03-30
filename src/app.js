const seedDatabase = require('./utils/seedDatabase');
const sequelize = require('./config/database');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const logger = require('./config/logger');
const monitoring = require('./config/monitoring');
require('dotenv').config();

// Import security middleware
const { 
  apiLimiter, 
  authLimiter, 
  speedLimiter,
  csrfProtection, 
  handleCSRFError,
  xssProtection,
  parameterProtection,
  mongoQuerySanitization,
  securityHeaders
} = require('./middleware/security.middleware');

// Import sanitization middleware
const {
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams
} = require('./middleware/sanitization.middleware');

// Import validation middleware
const { handleValidationErrors } = require('./middleware/validation.middleware');

// Import routes
const authRoutes = require('./routes/auth.routes');
const participantRoutes = require('./routes/participant.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const staffRoutes = require('./routes/staff.routes');
const documentRoutes = require('./routes/document.routes');
const goalRoutes = require('./routes/goal.routes');
const carenoteRoutes = require('./routes/carenote.routes');
const incidentReportRoutes = require('./routes/incidentreport.routes');
const restrictivePracticeRoutes = require('./routes/restrictivepractice.routes');
const messageRoutes = require('./routes/message.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const auditLogRoutes = require('./routes/auditlog.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Initialize express app
const app = express();

// Initialize Sentry
monitoring.initSentry();

// Security middleware
app.use(monitoring.sentryRequestHandler()); // Sentry request handler should be the first middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(helmet());
app.use(xssProtection);
app.use(parameterProtection);
app.use(mongoQuerySanitization);
app.use(speedLimiter);

// Standard middleware
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitization middleware
app.use(sanitizeBody);
app.use(sanitizeQuery);
app.use(sanitizeParams);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);
// Apply stricter rate limiting to auth routes
app.use('/api/auth/', authLimiter);

// API routes
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await sequelize.authenticate();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbStatus ? 'connected' : 'disconnected',
      uptime: `${Math.floor(uptime)} seconds`,
      memory: {
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/carenotes', carenoteRoutes);
app.use('/api/incident-reports', incidentReportRoutes);
app.use('/api/restrictive-practices', restrictivePracticeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use(handleValidationErrors);
app.use(handleCSRFError);
app.use(monitoring.sentryErrorHandler());

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    
    // Load models
    try {
      const models = require('./models');
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
      // In development, use sync with force: false for safety
      await sequelize.sync({ force: false });
      logger.info('Database models synchronized');
      
      // Seed database if in development mode and SEED_DATABASE is true
      if (process.env.SEED_DATABASE === 'true') {
        const seedResult = await seedDatabase();
        if (seedResult) {
          logger.info('Database seeded successfully');
        }
      }
    } else {
      // In production, just verify the connection
      await sequelize.authenticate();
      logger.info('Database connection verified');
      
      // Run migrations if AUTO_MIGRATE is enabled
      if (process.env.AUTO_MIGRATE === 'true') {
        try {
          await sequelize.runMigrations();
          logger.info('Database migrations completed successfully');
        } catch (error) {
          logger.error('Failed to run database migrations:', error);
          // Don't throw error here, just log it
        }
      }
    }
    
    // Start server with healthcare-specific settings
    const PORT = process.env.PORT || 10000;
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Healthcare API Version: ${process.env.API_VERSION || '1.0.0'}`);
    });

    // Enhanced error handling for healthcare operations
    server.on('error', (error) => {
      logger.error('Server error:', error);
      // Attempt graceful shutdown
      server.close(() => {
        logger.info('Server closed after error');
        process.exit(1);
      });
    });

    // Handle process termination with healthcare data safety
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Close server first
      server.close(() => {
        logger.info('Server closed');
      });
      
      // Close database connections
      try {
        await sequelize.close();
        logger.info('Database connections closed');
      } catch (error) {
        logger.error('Error closing database connections:', error);
      }
      
      // Exit process
      process.exit(0);
    };

    // Handle various termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    logger.error('Unable to connect to the database or start server:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeApp();

module.exports = app;
