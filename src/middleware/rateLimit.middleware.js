const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

// Memory store for rate limiting
const memoryStore = new Map();

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  const limiter = rateLimit({
    store: {
      incr: (key) => {
        const now = Date.now();
        const keyData = memoryStore.get(key) || { count: 0, resetTime: now + windowMs };
        
        // Clean up old data
        if (keyData.resetTime < now) {
          keyData.count = 0;
          keyData.resetTime = now + windowMs;
        }
        
        keyData.count++;
        memoryStore.set(key, keyData);
        return keyData.count;
      },
      decr: (key) => {
        const keyData = memoryStore.get(key);
        if (keyData) {
          keyData.count = Math.max(0, keyData.count - 1);
          memoryStore.set(key, keyData);
        }
      },
      resetKey: (key) => {
        memoryStore.delete(key);
      }
    },
    windowMs,
    max,
    message: {
      error: message || 'Too many requests, please try again later.'
    },
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: message || 'Too many requests, please try again later.'
      });
    }
  });

  return limiter;
};

// API rate limiter (100 requests per 15 minutes)
const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100,
  'API rate limit exceeded. Please try again later.'
);

// Auth rate limiter (5 requests per minute)
const authLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  5,
  'Too many login attempts. Please try again later.'
);

// Worker rate limiter (1000 requests per minute)
const workerLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  1000,
  'Worker rate limit exceeded.'
);

module.exports = {
  apiLimiter,
  authLimiter,
  workerLimiter
}; 