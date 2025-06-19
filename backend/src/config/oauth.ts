export default {
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID || '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
    callbackURL:
      process.env.MICROSOFT_CALLBACK_URL ||
      'http://localhost:3000/api/auth/microsoft/callback',
  },
  oauthServer: {
    accessTokenLifetime: process.env.OAUTH_ACCESS_TOKEN_LIFETIME || 3600, // 默认1小时
    refreshTokenLifetime: process.env.OAUTH_REFRESH_TOKEN_LIFETIME || 1209600, // 默认14天
  },
};
