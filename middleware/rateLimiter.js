const rateLimit = require('express-rate-limit');
const { RATE_LIMIT } = require('../config/constants');
const logger = require('../utils/logger');

module.exports = rateLimit({
  windowMs: RATE_LIMIT.windowMs,
  max: RATE_LIMIT.max,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests, please try again later'
    });
  },
  standardHeaders: true,
  legacyHeaders: false
});