const jwt = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../config/constants');
const logger = require('../utils/logger');

module.exports = {
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      logger.warn('Authentication attempt without token');
      return res.sendStatus(401);
    }

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
      if (err) {
        logger.warn('Invalid token attempt');
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  },

  socketAuth: (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error'));
    }

    jwt.verify(token, TOKEN_SECRET, (err, decoded) => {
      if (err) {
        logger.warn('Invalid socket token attempt');
        return next(new Error('Authentication error'));
      }
      socket.user = decoded;
      next();
    });
  }
};