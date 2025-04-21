const Sentry = require('@sentry/node');

// Initialize Sentry
const initSentry = () => {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express(),
      ],
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
    });
    console.log(`Sentry initialized in ${process.env.NODE_ENV} environment`);
  } else {
    console.log('Sentry not initialized in development environment');
  }
};

// Sentry request handler
const sentryRequestHandler = () => {
  return Sentry.Handlers.requestHandler({
    user: ['id', 'username', 'email'],
    ip: true,
    request: ['headers', 'method', 'url', 'query_string'],
  });
};

// Sentry error handler
const sentryErrorHandler = () => {
  return Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      if (error.status) {
        return error.status >= 400;
      }
      return true;
    },
  });
};

// Performance monitoring middleware
const performanceMonitoring = (req, res, next) => {
  const transaction = Sentry.startTransaction({
    op: 'http.server',
    name: `${req.method} ${req.path}`,
  });

  Sentry.configureScope(scope => {
    scope.setSpan(transaction);
  });

  transaction.setData('query', req.query);
  transaction.setData('params', req.params);
  
  res.on('finish', () => {
    transaction.setHttpStatus(res.statusCode);
    transaction.finish();
  });

  next();
};

// Custom error reporting
const reportError = (error, context = {}) => {
  Sentry.withScope(scope => {
    Object.keys(context).forEach(key => {
      scope.setExtra(key, context[key]);
    });
    Sentry.captureException(error);
  });
};

// Health check middleware
const healthCheck = (req, res, next) => {
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
