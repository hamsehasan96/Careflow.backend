const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const { redis } = require('../config/redis');
const logger = require('../config/logger');

// Create different rate limiters for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    store: new RedisStore({
      client: redis,
      prefix: 'rate-limit:',
      resetExpiryOnChange: true
    }),
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