const path = require('path');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code,
      statusCode: err.statusCode
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      user: req.user ? req.user.id : 'anonymous'
    }
  });

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
    return;
  }

  // Production error response
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      code: err.code
    });
    return;
  }

  // Programming or unknown errors
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    code: 'INTERNAL_ERROR'
  });
};

// Handle unhandled promise rejections
const handleUnhandledRejection = (err) => {
  logger.error('Unhandled Rejection:', err);
  // Give server time to finish pending requests
  process.exit(1);
};

// Handle uncaught exceptions
const handleUncaughtException = (err) => {
  logger.error('Uncaught Exception:', err);
  // Give server time to finish pending requests
  process.exit(1);
};

// 404 handler
const handleNotFound = (req, res, next) => {
  next(new APIError(`Can't find ${req.originalUrl} on this server!`, 404, 'NOT_FOUND'));
};

module.exports = {
  APIError,
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleNotFound
};
