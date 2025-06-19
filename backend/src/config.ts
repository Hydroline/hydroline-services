export default {
  app: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: 'hydroline-jwt-secret-key-change-in-production',
    expiresIn: '7d',
    refreshSecret: 'hydroline-refresh-secret-key-change-in-production',
    refreshExpiresIn: '30d',
  },
  oauth: {
    microsoft: {
      clientId: 'your_microsoft_client_id',
      clientSecret: 'your_microsoft_client_secret',
      callbackURL: 'http://localhost:3000/api/auth/microsoft/callback',
    },
  },
  sso: {
    wiki: 'http://wiki.example.com/sso',
    forum: 'http://forum.example.com/sso',
    mediaWiki: 'http://mediawiki.example.com/sso',
  },
  frontend: {
    url: 'http://localhost:8080',
  },
};
