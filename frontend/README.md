# Hydroline Services - 前端

这是 Hydroline Services 的前端应用，基于 Vue 3 + TypeScript + Vite 构建。

## 🚀 特性

- **现代化技术栈**: Vue 3 + TypeScript + Vite
- **组件库**: Shadcn/ui + Tailwind CSS
- **认证系统**: 支持本地登录、OAuth、SSO
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 请求**: Axios with 拦截器
- **类型安全**: 完整的 TypeScript 支持

## 📁 项目结构

```
src/
├── api/              # API 接口定义
├── assets/           # 静态资源
├── components/       # 组件
│   ├── auth/         # 认证相关组件
│   ├── layouts/      # 布局组件
│   └── ui/           # UI 组件 (shadcn/ui)
├── config/           # 配置管理
├── lib/              # 工具库
├── router/           # 路由配置
├── stores/           # 状态管理
└── views/            # 页面组件
    ├── auth/         # 认证页面
    ├── dashboard/    # 仪表盘
    ├── minecraft/    # Minecraft 服务器
    ├── player/       # 玩家管理
    ├── settings/     # 设置
    └── user/         # 用户相关
```

## 🛠️ 开发指南

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 开始开发

1. 安装依赖
```bash
pnpm install
```

2. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件配置您的环境
```

3. 启动开发服务器
```bash
pnpm dev
```

### 构建

```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 🔧 配置

应用配置通过环境变量管理，主要配置项：

- `VITE_API_URL`: 后端 API 地址
- `VITE_OAUTH_PROVIDERS`: 启用的 OAuth 提供商
- `VITE_ENABLE_SSO`: 是否启用 SSO
- `VITE_ENABLE_REGISTRATION`: 是否启用注册功能

详细配置请参考 `.env.example` 文件。

## 🎨 UI 组件

使用 shadcn/ui 组件库，基于 Radix UI 和 Tailwind CSS。

组件文档: [https://ui.shadcn.com](https://ui.shadcn.com)

## 📝 开发规范

### 组件开发

- 使用 Composition API
- TypeScript 类型定义
- 组件文档注释
- 适当的错误处理

### API 请求

```typescript
import { http } from '@/lib/http'

// 使用封装的 HTTP 客户端
const response = await http.get<DataType>('/api/endpoint')
```

### 状态管理

```typescript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
```

## 🔐 认证系统

- **本地登录**: 用户名/密码登录
- **OAuth**: 支持 Microsoft、QQ、Discord 等
- **SSO**: 跨系统单点登录
- **Token 管理**: 自动刷新和错误处理

## 📱 响应式设计

- 移动端优先设计
- Tailwind CSS 响应式工具类
- 现代化的 UI/UX

## 🧪 测试

```bash
# 运行测试
pnpm test

# 测试覆盖率
pnpm test:coverage
```

## �� 许可证

MIT License
