const http = require('http');
const app = require('./app');
const { PORT, HOST } = require('./config/constants');
const logger = require('./utils/logger');
const SocketService = require('./services/socketService');

const server = http.createServer(app);

new SocketService(server);

server.listen(PORT, HOST, () => {
  logger.info(`✅ Ayush Signaling Server running on ${HOST}:${PORT}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.stack}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

