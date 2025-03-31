const path = require('path');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const csrf = require('csurf');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// More strict rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after an hour'
});

// Speed limiter - slows down responses rather than blocking
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500 // begin adding 500ms of delay per request
});

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Handle CSRF errors
const handleCSRFError = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    logger.warn(`CSRF token validation failed for IP: ${req.ip}`);
    return res.status(403).json({
      status: 'error',
      message: 'Invalid CSRF token',
      code: 'INVALID_CSRF_TOKEN'
    });
  }
  next(err);
};

// XSS protection middleware
const xssProtection = xss();

// Parameter pollution protection
const parameterProtection = hpp({
  whitelist: [
    'page',
    'limit',
    'sort',
    'fields'
  ]
});

// MongoDB query sanitization
const mongoQuerySanitization = mongoSanitize();

// Security headers middleware (using helmet)
const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data: https:; " +
    "connect-src 'self' " + (process.env.API_URL || 'http://localhost:3000') + "; " +
    "frame-ancestors 'none';"
  );

  next();
};

// File upload security middleware
const fileUploadSecurity = (req, res, next) => {
  // If no file was uploaded, continue
  if (!req.file && !req.files) return next();
  
  // Check file types and sizes
  const checkFile = (file) => {
    // Allowed file types
    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'text/csv'
    ];
    
    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type: ${file.mimetype}. Only images, PDFs, Word documents, Excel spreadsheets, and CSV files are allowed.`);
    }
    
    // Check file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${file.originalname}. Maximum file size is 10MB.`);
    }
  };
  
  try {
    if (req.file) {
      // Single file upload
      checkFile(req.file);
    } else if (req.files) {
      // Multiple file upload
      if (Array.isArray(req.files)) {
        req.files.forEach(checkFile);
      } else {
        // Multiple fields with files
        Object.keys(req.files).forEach(key => {
          const files = req.files[key];
          if (Array.isArray(files)) {
            files.forEach(checkFile);
          } else {
            checkFile(files);
          }
        });
      }
    }
    next();
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  apiLimiter,
  authLimiter,
  speedLimiter,
  csrfProtection,
  handleCSRFError,
  xssProtection,
  parameterProtection,
  mongoQuerySanitization,
  securityHeaders,
  fileUploadSecurity
};
