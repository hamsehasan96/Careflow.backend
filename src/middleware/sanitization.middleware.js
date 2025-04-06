const sanitizeHtml = require('sanitize-html');
const { JSDOM } = require('jsdom');
const DOMPurify = require('dompurify');

// Create a DOM window for DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Middleware to sanitize request body fields
 */
const sanitizeBody = (req, res, next) => {
  if (!req.body) return next();

  // Sanitize each field in the request body
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      // Sanitize string values
      req.body[key] = sanitizeString(req.body[key]);
    } else if (typeof req.body[key] === 'object' && req.body[key] !== null) {
      // Recursively sanitize nested objects
      sanitizeObject(req.body[key]);
    }
  });

  next();
};

/**
 * Middleware to sanitize request query parameters
 */
const sanitizeQuery = (req, res, next) => {
  if (!req.query) return next();

  // Sanitize each query parameter
  Object.keys(req.query).forEach(key => {
    if (typeof req.query[key] === 'string') {
      req.query[key] = sanitizeString(req.query[key]);
    }
  });

  next();
};

/**
 * Middleware to sanitize request parameters
 */
const sanitizeParams = (req, res, next) => {
  if (!req.params) return next();

  // Sanitize each parameter
  Object.keys(req.params).forEach(key => {
    if (typeof req.params[key] === 'string') {
      req.params[key] = sanitizeString(req.params[key]);
    }
  });

  next();
};

/**
 * Sanitize a string value
 */
const sanitizeString = (value) => {
  // First use DOMPurify for basic XSS protection
  let sanitized = purify.sanitize(value);
  
  // Then use sanitize-html for more control over allowed tags
  sanitized = sanitizeHtml(sanitized, {
    allowedTags: [], // No HTML tags allowed by default
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape'
  });
  
  return sanitized;
};

/**
 * Sanitize HTML content with allowed formatting tags
 */
const sanitizeHtmlContent = (value, allowFormatting = false) => {
  const allowedTags = allowFormatting 
    ? ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'] 
    : [];
    
  return sanitizeHtml(value, {
    allowedTags: allowedTags,
    allowedAttributes: {},
    disallowedTagsMode: 'recursiveEscape'
  });
};

/**
 * Recursively sanitize an object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;

  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        obj[key].forEach((item, index) => {
          if (typeof item === 'string') {
            obj[key][index] = sanitizeString(item);
          } else if (typeof item === 'object' && item !== null) {
            sanitizeObject(item);
          }
        });
      } else {
        sanitizeObject(obj[key]);
      }
    }
  });
};

/**
 * Middleware to sanitize user input specifically for security routes
 * This middleware sanitizes all input in the request body
 */
const sanitizeUserInput = (req, res, next) => {
  if (!req.body) return next();

  // Sanitize each field in the request body
  Object.keys(req.body).forEach(key => {
    if (typeof req.body[key] === 'string') {
      // Sanitize string values
      req.body[key] = sanitizeString(req.body[key]);
    } else if (typeof req.body[key] === 'object' && req.body[key] !== null) {
      // Recursively sanitize nested objects
      sanitizeObject(req.body[key]);
    }
  });

  next();
};

module.exports = {
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  sanitizeString,
  sanitizeHtmlContent,
  sanitizeUserInput
};
