const helmet = require('helmet');
const { ALLOWED_ORIGINS } = require('./constants');

module.exports = (app) => {
  
  app.use(helmet());
  
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...ALLOWED_ORIGINS, "ws:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }));
  
  app.use(helmet.xssFilter());
  
  app.use(helmet.noSniff());
  
  app.disable('x-powered-by');
};