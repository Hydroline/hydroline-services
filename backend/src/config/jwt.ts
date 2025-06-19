export default {
  secret: process.env.JWT_SECRET || 'hydroline-jwt-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'hydroline-refresh-secret-key',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  security: {
    enableSessionTracking: process.env.JWT_ENABLE_SESSION_TRACKING !== 'false',
    enableTokenVersioning: process.env.JWT_ENABLE_TOKEN_VERSIONING !== 'false',
    maxActiveSessions: parseInt(process.env.JWT_MAX_ACTIVE_SESSIONS || '5'),
    rotateRefreshToken: process.env.JWT_ROTATE_REFRESH_TOKEN !== 'false',
  },
};
