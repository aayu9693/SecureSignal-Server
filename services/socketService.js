const { Server } = require('socket.io');
const { authenticateSocket } = require('../middleware/auth');
const logger = require('../utils/logger');
const SessionService = require('./sessionService');
const { ALLOWED_ORIGINS } = require('../config/constants'); 

class SocketService {
    constructor(server) {
        const origins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',') 
            : ALLOWED_ORIGINS;

        this.io = new Server(server, {
            cors: {
                origin: origins,
                methods: ["GET", "POST"],
                credentials: true,
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000, 
                skipMiddlewares: true,
            }
        });
        
        this.clients = new Map();
        this.sessionService = new SessionService();
        
        this.initializeMiddleware();
        this.initializeHandlers();

        setInterval(() => {
            this.sessionService.cleanupInactiveSessions();
        }, 30 * 60 * 1000); 
    }

    initializeMiddleware() {
        this.io.use((socket, next) => {
            try {
                authenticateSocket.socketAuth(socket, next);
            } catch (err) {
                logger.error(`Authentication error: ${err.message}`);
                next(new Error('Authentication failed'));
            }
        });
    }

    initializeHandlers() {
        this.io.on('connection', (socket) => {
            
            const userId = socket.user?.id || 'unknown';
            logger.info(`🟢 New client connected: ${socket.id} (User: ${userId})`);
            
            this.clients.set(socket.id, socket);
            
            if (userId !== 'unknown') {
                socket.join(`user_${userId}`);
            }

            socket.on('signal', (data) => {
                this.handleSignal(socket, data);
            });

            socket.on('disconnect', (reason) => {
                logger.info(`🔴 Client disconnected: ${socket.id}, Reason: ${reason}`);
                this.handleDisconnect(socket);
            });

            socket.on('error', (err) => {
                logger.error(`Socket error for ${socket.id}: ${err.message}`);
            });

            let heartbeatInterval = setInterval(() => {
                if (socket.connected) {
                    socket.emit('ping', { timestamp: Date.now() });
                }
            }, 30000); 

            socket.on('pong', () => {
               
                if (userId !== 'unknown') {
                    this.sessionService.updateLastActive(userId);
                }
            });

            socket.on('disconnect', () => {
                clearInterval(heartbeatInterval);
            });
        });
    }

    handleSignal(socket, data) {
        try {
            if (!this.validateSignalData(data)) {
                logger.warn(`Invalid signal data from ${socket.id}`);
                socket.emit('error', { message: 'Invalid signal data' });
                return;
            }

            logger.info(`📡 Signal from ${socket.id} to ${data.to}`);
            
            if (this.clients.has(data.to)) {
                this.io.to(data.to).emit('signal', { 
                    from: socket.id, 
                    signal: data.signal,
                    timestamp: Date.now()
                });
            } else {
                logger.warn(`❌ Receiver not found: ${data.to}`);
                socket.emit('error', { message: 'Receiver not found' });
            }
        } catch (err) {
            logger.error(`Error handling signal: ${err.message}`);
            socket.emit('error', { message: 'Internal server error' });
        }
    }

    handleDisconnect(socket) {
        try {
            const userId = socket.user?.id || 'unknown';
            logger.info(`🔴 Client disconnected: ${socket.id}`);
            
            this.clients.delete(socket.id);
            
            if (userId !== 'unknown') {
                this.sessionService.cleanupUserSessions(userId);
            }
        } catch (err) {
            logger.error(`Error during disconnect: ${err.message}`);
        }
    }

    validateSignalData(data) {
        return data && 
               data.to && 
               data.signal && 
               typeof data.to === 'string' && 
               typeof data.signal === 'object' &&
               Object.keys(data.signal).length > 0;
    }
}

module.exports = SocketService;