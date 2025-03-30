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
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'CareFlow API is running' });
});

// Apply CSRF protection to all routes that modify data
app.use(csrfProtection);
app.use(handleCSRFError);

// Mount API routes
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

// Sentry error handler must be before any other error middleware
app.use(monitoring.sentryErrorHandler());

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error
  logger.error(`Error: ${err.message}`, { stack: err.stack });
  
  // Send error response
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Initialize database and start server
const initializeApp = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync database models (only in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database models synchronized');
      
      // Seed database if in development mode
      const seedResult = await seedDatabase();
      if (seedResult) {
        console.log('Database seeded successfully');
      }
    } else {
      // In production, just verify the connection
      await sequelize.authenticate();
      console.log('Database connection verified');
    }
    
    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    process.exit(1); // Exit with error code
  }
};

// Run the initialization
initializeApp();

module.exports = app;
