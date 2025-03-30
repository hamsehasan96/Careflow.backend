const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const logger = require('../config/logger');

// Redis client for rate limiting
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// General API rate limiter
const apiLimiter = rateLimit({
  store: RedisStore({
    client: redis,
    prefix: 'rate-limit:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Auth routes rate limiter (stricter)
const authLimiter = rateLimit({
  store: RedisStore({
    client: redis,
    prefix: 'rate-limit:auth:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login attempts per hour
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many login attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Worker routes rate limiter
const workerLimiter = rateLimit({
  store: RedisStore({
    client: redis,
    prefix: 'rate-limit:worker:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per minute
  message: 'Too many worker requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Worker rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many worker requests, please try again later.',
      code: 'WORKER_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Forgot password rate limiter
const forgotPasswordLimiter = rateLimit({
  store: RedisStore({
    client: redis,
    prefix: 'rate-limit:forgot-password:'
  }),
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // Limit each IP to 3 forgot password attempts per day
  message: 'Too many forgot password attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Forgot password rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      status: 'error',
      message: 'Too many forgot password attempts, please try again later.',
      code: 'FORGOT_PASSWORD_RATE_LIMIT_EXCEEDED'
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  workerLimiter,
  forgotPasswordLimiter
}; 