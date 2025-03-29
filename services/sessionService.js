const logger = require('../utils/logger');

class SessionService {
  constructor() {
    this.activeSessions = new Map();
  }

  createSession(userId, sessionData) {
    this.activeSessions.set(userId, {
      ...sessionData,
      lastActive: Date.now()
    });
    logger.info(`Session created for user ${userId}`);
  }

  getSession(userId) {
    return this.activeSessions.get(userId);
  }

  cleanupUserSessions(userId) {
    if (this.activeSessions.has(userId)) {
      this.activeSessions.delete(userId);
      logger.info(`Cleaned up sessions for user ${userId}`);
    }
  }

  cleanupInactiveSessions(inactiveTime = 30 * 60 * 1000) {
    const now = Date.now();
    for (const [userId, session] of this.activeSessions.entries()) {
      if (now - session.lastActive > inactiveTime) {
        this.activeSessions.delete(userId);
        logger.info(`Cleaned up inactive session for user ${userId}`);
      }
    }
  }
}

module.exports = SessionService;