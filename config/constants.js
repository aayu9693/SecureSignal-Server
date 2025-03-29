module.exports = {
    ALLOWED_ORIGINS: [
      "https://vanishchat.infinityfreeapp.com",
      "http://vanishchat.infinityfreeapp.com",
    ],
    RATE_LIMIT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key-here',
    TOKEN_SECRET: process.env.TOKEN_SECRET || 'your-jwt-secret-here',
    PORT: process.env.PORT || 5000,
    HOST: process.env.HOST || '0.0.0.0'
  };