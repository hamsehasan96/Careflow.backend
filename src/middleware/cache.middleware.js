const NodeCache = require('node-cache');
const path = require('path');
const logger = require(path.join(__dirname, '..', 'config', 'logger'));

// Cache with 5 minutes TTL by default
const cache = new NodeCache({ stdTTL: 300 });

const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      logger.debug('Cache hit:', key);
      return res.json(cachedResponse);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      cache.set(key, data, duration);
      logger.debug('Cached response:', key);
      return originalJson.call(this, data);
    };

    next();
  };
};

module.exports = cacheMiddleware; 