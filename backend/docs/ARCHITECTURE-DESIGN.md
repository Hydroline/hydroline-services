# 架构设计标准

## 🏗️ 整体架构概述

本项目采用 NestJS 框架，基于分层架构设计，通过模块化方式组织代码，确保代码的可维护性、可扩展性和可测试性。

## 📁 目录结构标准

### 统一的通用组件层 (`src/common/`)

所有跨模块使用的通用组件统一放置在 `common/` 目录下，包括：

```
src/common/
├── decorators/           # 装饰器
│   ├── api-response.decorator.ts    # Swagger API 响应装饰器
│   ├── auth.decorator.ts            # 认证授权装饰器 (Roles, Permissions, CurrentUser)
│   ├── success-message.decorator.ts # 成功消息装饰器
│   └── index.ts
├── dto/                  # 通用数据传输对象
│   ├── response.dto.ts   # 标准响应格式
│   └── index.ts
├── filters/              # 异常过滤器
│   ├── http-exception.filter.ts     # 全局HTTP异常过滤器
│   └── index.ts
├── guards/               # 守卫
│   ├── rbac.guard.ts     # 基于角色的访问控制守卫
│   └── index.ts
├── interceptors/         # 拦截器
│   ├── transform.interceptor.ts     # 响应转换拦截器
│   └── index.ts
├── utils/                # 工具函数
│   ├── minecraft/        # Minecraft 相关工具
│   └── index.ts
└── index.ts              # 统一导出
```

### 业务模块层 (`src/modules/`)

```
src/modules/
├── core/                 # 核心业务模块
│   ├── auth/            # 认证授权模块
│   └── core.module.ts   # 核心模块配置
├── rbac/                # 角色权限管理模块
├── player/              # 玩家管理模块
├── minecraft/           # Minecraft 工具模块
├── audit/               # 审计日志模块
└── prisma/              # 数据库访问模块
```

## 🎯 设计原则

### 1. 统一导入原则

**✅ 推荐做法：**
```typescript
// 统一从 common 导入所有通用组件
import { 
  Permissions, 
  CurrentUser, 
  RbacGuard,
  ApiStandardResponses,
  SuccessResponseDto 
} from '../../common';
```

**❌ 避免做法：**
```typescript
// 分散导入，造成混乱
import { Permissions } from '../core/decorators';
import { RbacGuard } from '../core/guards';
import { ApiStandardResponses } from '../../common/decorators';
```

### 2. 职责分离原则

- **common/** - 纯技术组件，不包含业务逻辑
- **modules/core/** - 核心业务功能（认证、授权）
- **modules/\*/** - 具体业务模块

### 3. 依赖方向原则

```
业务模块 → common ← 核心模块
```

- 业务模块可以依赖 common 和 core
- 核心模块可以依赖 common
- common 不依赖任何业务模块

## 🔧 组件标准

### 装饰器 (Decorators)

**认证相关装饰器：**
```typescript
// 权限控制
@Permissions('user:read', 'user:write')

// 角色控制
@Roles('admin', 'moderator')

// 获取当前用户
@CurrentUser() user: User
```

**API文档装饰器：**
```typescript
// 标准响应格式
@ApiStandardResponses(UserDto, '用户信息获取成功')

// 成功消息
@SuccessMessage('操作成功')
```

### 守卫 (Guards)

```typescript
// 标准使用方式
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class ExampleController {
  @Get()
  @Permissions('resource:read')
  findAll() {}
}
```

### 响应格式标准

**成功响应：**
```json
{
  "code": 200,
  "status": "success",
  "message": null,
  "data": { ... },
  "timestamp": 1640995200000
}
```

**错误响应：**
```json
{
  "code": 400,
  "status": "error",
  "message": "错误描述",
  "data": null,
  "timestamp": 1640995200000
}
```

## 🚀 全局配置标准

### main.ts 配置

```typescript
// 全局验证管道
app.useGlobalPipes(new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
}));

// 全局异常过滤器
app.useGlobalFilters(new HttpExceptionFilter());

// 全局响应转换拦截器
app.useGlobalInterceptors(new TransformInterceptor(reflector));
```

### 模块注册标准

```typescript
// CoreModule 作为全局模块
@Global()
@Module({
  imports: [AuthModule],
  providers: [RbacGuard],
  exports: [AuthModule, RbacGuard],
})
export class CoreModule {}
```

## 📋 重构完成的改进

### ✅ 解决的问题

1. **导入路径混乱** - 统一为 `from '../../common'`
2. **重复异常处理** - 移除冗余的异常拦截器
3. **组件分散** - 所有通用组件集中到 `common/`
4. **职责不清** - 明确 `common/` 与 `core/` 的职责边界

### ✅ 架构优化

1. **单一入口** - `common/index.ts` 统一导出
2. **清晰分层** - 通用组件与业务逻辑分离
3. **标准化** - 统一的导入、使用和配置方式
4. **可维护性** - 降低模块间耦合度

## 🔄 迁移指南

### 从旧架构迁移

**步骤1：更新导入语句**
```typescript
// 旧写法
import { Permissions } from '../core/decorators';
import { RbacGuard } from '../core/guards';

// 新写法
import { Permissions, RbacGuard } from '../../common';
```

**步骤2：移除重复组件**
- 删除 `core/decorators/`
- 删除 `core/guards/`
- 删除 `core/interceptors/`

**步骤3：验证功能**
```bash
pnpm start  # 确保应用正常启动
```

## 🎯 最佳实践

### 1. 新增通用组件
```typescript
// 在 common/ 下创建新组件
// 在 common/index.ts 中导出
// 在其他模块中统一导入
```

### 2. 业务模块开发
```typescript
// 优先使用 common 中的组件
// 遵循统一的响应格式
// 使用标准的权限控制
```

### 3. 代码审查要点
- 检查导入路径是否统一
- 确认组件职责是否清晰
- 验证响应格式是否标准

## 📚 相关文档

- [RBAC权限系统](./RBAC-PERMISSIONS.md)
- [API开发规范](./API-STANDARDS.md)
- [项目主文档](./prompt/MAIN.md)

---

通过以上架构设计标准，确保项目代码的一致性、可维护性和可扩展性，为后续的低代码平台建设奠定坚实基础。 