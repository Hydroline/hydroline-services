/**
 * Hydroline Services 配置文件
 *
 * 这里是所有配置项的集中管理地，你可以直接修改这些值或设置对应的环境变量
 *
 * 🔧 如何配置：
 * 1. 直接修改下面的配置值
 * 2. 或者设置环境变量（环境变量优先级更高）
 * 3. enabled: false 的功能将不会加载，避免启动错误
 */

export default {
  // ===== 应用基础配置 =====
  app: {
    port: parseInt(process.env.PORT || '3000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    name: 'Hydroline Services',
    description: 'Minecraft 服务器聚合信息服务平台',
    version: '1.0.0',
  },

  // ===== 服务器信息配置 =====
  server: {
    timezone: process.env.SERVER_TIMEZONE || 'UTC',
    location: {
      country: process.env.SERVER_COUNTRY || 'CN',
      region: process.env.SERVER_REGION || 'Asia/Shanghai',
      city: process.env.SERVER_CITY || 'Shanghai',
    },
    timeFormat: {
      useUTC: process.env.USE_UTC_TIME !== 'false', // 默认使用UTC时间
      timestampUnit: 'milliseconds', // 时间戳单位：毫秒
    },
  },

  // ===== 数据库配置 =====
  db: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://hydrolineTest1:T3R7Jb72Rfnn@server5.aurlemon.top:5432/hydrolineTest1',
  },

  // ===== JWT 认证配置 =====
  jwt: {
    secret: process.env.JWT_SECRET || 'hydroline-jwt-secret-请在生产环境中修改',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'hydroline-refresh-secret-请在生产环境中修改',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    issuer: 'hydroline-services',
    audience: ['hydroline-web', 'hydroline-api'],
  },

  // ===== OAuth 配置 =====
  oauth: {
    // OAuth服务端配置
    server: {
      enabled: process.env.OAUTH_SERVER_ENABLED === 'true' || false,
      authCodeTtl: 10 * 60, // 授权码有效期（秒）
      accessTokenTtl: 2 * 60 * 60, // 访问令牌有效期（秒）
      refreshTokenTtl: 30 * 24 * 60 * 60, // 刷新令牌有效期（秒）
      allowedGrantTypes: ['authorization_code', 'refresh_token'],
      defaultScopes: ['profile'],
      availableScopes: ['profile', 'email', 'player:read', 'player:write'],
    },
    // OAuth第三方登录配置
    providers: {
      microsoft: {
        enabled: process.env.OAUTH_MICROSOFT_ENABLED === 'true' || false,
        clientId: process.env.OAUTH_MICROSOFT_CLIENT_ID || '',
        clientSecret: process.env.OAUTH_MICROSOFT_CLIENT_SECRET || '',
        callbackURL:
          process.env.OAUTH_MICROSOFT_CALLBACK_URL ||
          'http://localhost:3000/api/auth/microsoft/callback',
        scope: ['profile', 'email', 'XboxLive.signin'],
      },
      qq: {
        enabled: process.env.OAUTH_QQ_ENABLED === 'true' || false,
        clientId: process.env.OAUTH_QQ_CLIENT_ID || '',
        clientSecret: process.env.OAUTH_QQ_CLIENT_SECRET || '',
        callbackURL:
          process.env.OAUTH_QQ_CALLBACK_URL ||
          'http://localhost:3000/api/auth/qq/callback',
      },
      wechat: {
        enabled: process.env.OAUTH_WECHAT_ENABLED === 'true' || false,
        appId: process.env.OAUTH_WECHAT_APP_ID || '',
        appSecret: process.env.OAUTH_WECHAT_APP_SECRET || '',
        callbackURL:
          process.env.OAUTH_WECHAT_CALLBACK_URL ||
          'http://localhost:3000/api/auth/wechat/callback',
      },
      discord: {
        enabled: process.env.OAUTH_DISCORD_ENABLED === 'true' || false,
        clientId: process.env.OAUTH_DISCORD_CLIENT_ID || '',
        clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET || '',
        callbackURL:
          process.env.OAUTH_DISCORD_CALLBACK_URL ||
          'http://localhost:3000/api/auth/discord/callback',
      },
    },
  },

  // ===== SSO 单点登录配置 =====
  sso: {
    enabled: process.env.SSO_ENABLED === 'true' || false,
    sessionCookieName: 'hydroline_session',
    sessionSecret:
      process.env.SESSION_SECRET ||
      'hydroline-session-secret-请在生产环境中修改',
    sessionTtl: 24 * 60 * 60, // 会话有效期（秒）
    crossDomainEnabled:
      process.env.SSO_CROSS_DOMAIN_ENABLED === 'true' || false,
    trustedDomains: process.env.SSO_TRUSTED_DOMAINS?.split(',') || [
      'localhost',
      '*.hydroline.local',
      '*.hydroline.com',
    ],
    clients: {
      wiki: {
        name: 'Hydroline Wiki',
        url: process.env.SSO_WIKI_URL || 'http://wiki.hydroline.local',
        callbackUrl:
          process.env.SSO_WIKI_CALLBACK_URL ||
          'http://wiki.hydroline.local/sso/callback',
        secret:
          process.env.SSO_WIKI_SECRET || 'wiki-sso-secret-请在生产环境中修改',
      },
      forum: {
        name: 'Hydroline Forum',
        url: process.env.SSO_FORUM_URL || 'http://forum.hydroline.local',
        callbackUrl:
          process.env.SSO_FORUM_CALLBACK_URL ||
          'http://forum.hydroline.local/sso/callback',
        secret:
          process.env.SSO_FORUM_SECRET || 'forum-sso-secret-请在生产环境中修改',
      },
      mediawiki: {
        name: 'MediaWiki',
        url:
          process.env.SSO_MEDIAWIKI_URL || 'http://mediawiki.hydroline.local',
        callbackUrl:
          process.env.SSO_MEDIAWIKI_CALLBACK_URL ||
          'http://mediawiki.hydroline.local/sso/callback',
        secret:
          process.env.SSO_MEDIAWIKI_SECRET ||
          'mediawiki-sso-secret-请在生产环境中修改',
      },
    },
  },

  // ===== 安全配置 =====
  security: {
    bcryptRounds: 12,
    rateLimiting: {
      enabled: process.env.RATE_LIMITING_ENABLED !== 'false',
      windowMs: 15 * 60 * 1000, // 15分钟
      max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      skipSuccessfulRequests: false,
    },
    cors: {
      enabled: process.env.CORS_ENABLED !== 'false',
      origin: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:5173',
      ],
      credentials: true,
    },
    helmet: {
      enabled: process.env.HELMET_ENABLED !== 'false',
      contentSecurityPolicy: false,
    },
  },

  // ===== API 配置 =====
  api: {
    prefix: 'api',
    version: 'v1',
    documentation: {
      enabled:
        process.env.API_DOCS_ENABLED !== 'false' &&
        process.env.NODE_ENV !== 'production',
      title: 'Hydroline Services API',
      description: 'Minecraft 服务器聚合信息服务平台 API 文档',
      version: '1.0.0',
      path: 'docs',
      tags: [
        { name: '项目状态', description: '项目状况检查' },
        { name: '认证', description: '用户认证、登录、注册、OAuth 等相关接口' },
        { name: '玩家管理', description: '玩家账户、资料管理、游戏数据等接口' },
        { name: '角色管理', description: '角色创建、编辑、权限分配等接口' },
        { name: '权限管理', description: '权限定义、资源管理等接口' },
        { name: '审计日志', description: '操作记录、安全审计等接口' },
        { name: '玩家状态', description: '玩家在线状态、游戏状态管理' },
        { name: '玩家类型', description: '玩家分类管理' },
        { name: '玩家联系', description: '玩家联系方式、社交账号管理' },
      ],
    },
  },

  // ===== 前端配置 =====
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    adminUrl: process.env.ADMIN_FRONTEND_URL || 'http://localhost:5174',
  },

  // ===== Minecraft 相关配置 =====
  minecraft: {
    players: {
      autoCreate: process.env.MINECRAFT_AUTO_CREATE_PLAYERS === 'true' || true,
      defaultStatus: '正常',
      defaultType: '普通玩家',
      idValidation: {
        uuidPattern:
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        usernamePattern: /^[a-zA-Z0-9_]{3,16}$/,
      },
    },
    servers: {
      defaultTimeout: parseInt(process.env.MINECRAFT_SERVER_TIMEOUT || '5000'),
      maxRetries: parseInt(process.env.MINECRAFT_SERVER_MAX_RETRIES || '3'),
    },
  },

  // ===== 日志配置 =====
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true' || false,
    logDirectory: process.env.LOG_DIRECTORY || './logs',
    maxFileSize: '10m',
    maxFiles: '14d',
  },

  // ===== 缓存配置 =====
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true' || false,
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0'),
    },
    ttl: {
      default: 300, // 5分钟
      user: 600, // 10分钟
      player: 300, // 5分钟
      config: 3600, // 1小时
    },
  },

  // ===== 邮件配置 =====
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true' || false,
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: {
      name: process.env.EMAIL_FROM_NAME || 'Hydroline Services',
      address: process.env.EMAIL_FROM_ADDRESS || 'noreply@hydroline.local',
    },
    templates: {
      welcome: 'welcome',
      resetPassword: 'reset-password',
      emailVerification: 'email-verification',
    },
  },
};
