export default {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
  },
  swagger: {
    title: 'Hydroline API',
    description: 'Hydroline - Minecraft 服务器聚合信息服务平台',
    version: '1.0',
    path: 'api-docs',
  },
};
