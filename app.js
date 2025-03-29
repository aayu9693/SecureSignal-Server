const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { ALLOWED_ORIGINS, SESSION_SECRET } = require('./config/constants');
const securityConfig = require('./config/security');
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

securityConfig(app);

app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.get('/', (req, res) => {
  logger.info('Server status check');
  res.send('✅ Ayush Signaling Server is running!');
});

app.post('/login', (req, res) => {
  
});

app.get('/protected', authMiddleware.authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;