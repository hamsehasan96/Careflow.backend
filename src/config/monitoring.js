const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');
const { Integrations } = require('@sentry/node');

// Initialize Sentry
const initSentry = () => {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        // Enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // Enable Express.js middleware tracing
        new Sentry.Integrations.Express(),
        // Enable performance monitoring
        new ProfilingIntegration(),
      ],
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
      // Set profilesSampleRate to 1.0 to profile all transactions
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
    });
    console.log(`Sentry initialized in ${process.env.NODE_ENV} environment`);
  } else {
    console.log('Sentry not initialized in development environment');
  }
};

// Sentry request handler
const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler({
    // Ensure user information is included in error reports
    user: ['id', 'username', 'email'],
    // Include IP address
    ip: true,
    // Don't include request body to avoid capturing sensitive information
    request: ['headers', 'method', 'url', 'query_string'],
  });
};

// Sentry error handler
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Only report errors with status code >= 400
      if (error.status) {
        return error.status >= 400;
      }
      return true;
    },
  });
};

// Performance monitoring middleware
const performanceMonitoring = (req, res, next) => {
  // Start transaction
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: `${req.method} ${req.path}`,
  });

  // Set transaction on scope
  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });

  // Add transaction data
  transaction.setData('query', req.query);
  transaction.setData('params', req.params);
  
  // Finish transaction when response is complete
  res.on('finish', () => {
    transaction.setHttpStatus(res.statusCode);
    transaction.finish();
  });

  next();
};

// Custom error reporting
const reportError = (error, context = {}) => {
  Sentry.withScope(scope => {
    // Add additional context
    Object.keys(context).forEach(key => {
      scope.setExtra(key, context[key]);
    });
    
    // Capture exception
    Sentry.captureException(error);
  });
};

// Health check middleware
const healthCheck = (req, res, next) => {
  // Add health check endpoint
  if (req.path === '/api/health') {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      memory: process.memoryUsage(),
    };
    
    return res.status(200).json(healthData);
  }
  
  next();
};

module.exports = {
  initSentry,
  sentryRequestHandler,
  sentryErrorHandler,
  performanceMonitoring,
  reportError,
  healthCheck
};
