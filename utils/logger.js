const winston = require('winston');
const { format, transports } = winston;

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add colors for specific log types
logger.info.color = 'green';
logger.warn.color = 'yellow';
logger.error.color = 'red';

module.exports = logger;