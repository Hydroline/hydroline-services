# RBAC 权限系统文档

## 🎯 概述

本文档描述了 Hydroline Services 的完整 RBAC（基于角色的访问控制）权限系统，包括所有权限定义、角色配置和控制器使用规范。

## 📋 权限命名规范

权限命名采用 `{resource}:{action}` 格式：

- **Resource**: 资源类型（user, player, role, permission, audit, system, oauth）
- **Action**: 操作类型（read, write, delete, assign, admin）

## 🔑 完整权限列表

### User 权限
- `user:read` - 查看用户信息
- `user:write` - 编辑用户信息  
- `user:delete` - 删除用户
- `user:admin` - 用户管理员权限

### Player 权限
- `player:read` - 查看玩家信息
- `player:write` - 编辑玩家信息
- `player:delete` - 删除玩家
- `player:admin` - 玩家管理员权限

### Role 权限
- `role:read` - 查看角色信息
- `role:write` - 编辑角色信息
- `role:delete` - 删除角色
- `role:assign` - 分配角色权限
- `role:admin` - 角色管理员权限

### Permission 权限
- `permission:read` - 查看权限信息
- `permission:write` - 编辑权限信息
- `permission:delete` - 删除权限
- `permission:admin` - 权限管理员权限

### System 权限
- `system:read` - 查看系统信息
- `system:write` - 修改系统配置
- `system:admin` - 系统管理员权限

### Audit 权限
- `audit:read` - 查看审计日志

### OAuth 权限
- `oauth:read` - 查看OAuth客户端
- `oauth:write` - 管理OAuth客户端
- `oauth:admin` - OAuth管理员权限

## 👥 系统角色

### super_admin（超级管理员）
- **权限**: 拥有所有权限
- **用途**: 系统最高权限，完全访问控制

### admin（管理员）
- **权限**: 除 `system:admin` 和 `*:delete` 外的所有权限
- **用途**: 日常管理操作，但不能删除关键数据

### moderator（版主）
- **权限**: 所有 `*:read` 权限 + `player:write`
- **用途**: 内容审核和玩家管理

### user（普通用户）
- **权限**: 基础用户权限
- **用途**: 普通用户功能访问

## 🎛️ 控制器权限映射

### Auth Controller (`/auth`)
- `POST /auth/cleanup-sessions` → `system:admin`

### Player Controller (`/player`)
- `POST /players` → `player:admin`
- `GET /players` → `player:read`
- `GET /players/:id` → `player:read`
- `PATCH /players/:id` → `player:write`
- `DELETE /players/:id` → `player:delete`

### Player Status Controller (`/player-status`)
- `GET /player-status` → `player:read`
- `GET /player-status/:id` → `player:read`
- `POST /player-status` → `player:admin`
- `PATCH /player-status/:id` → `player:admin`
- `DELETE /player-status/:id` → `player:admin`

### Player Type Controller (`/player-type`)
- `POST /player-types` → `player:admin`
- `GET /player-types` → `player:read`
- `PATCH /player-types/:id` → `player:admin`
- `DELETE /player-types/:id` → `player:admin`

### Player Contact Controller (`/player-contact`)
- `POST /player-contact` → `player:write`
- `GET /player-contact` → `player:read`
- `PATCH /player-contact/:id` → `player:write`
- `DELETE /player-contact/:id` → `player:write`

### Permission Controller (`/permissions`)
- `POST /permissions` → `permission:admin`
- `GET /permissions` → `permission:read`
- `GET /permissions/:id` → `permission:read`
- `GET /permissions/resources/list` → `permission:read`
- `GET /permissions/actions/list` → `permission:read`
- `PATCH /permissions/:id` → `permission:write`
- `DELETE /permissions/:id` → `permission:delete`

### Role Controller (`/roles`)
- `POST /roles` → `role:admin`
- `GET /roles` → `role:read`
- `GET /roles/:id` → `role:read`
- `PATCH /roles/:id` → `role:write`
- `DELETE /roles/:id` → `role:delete`
- `POST /roles/:roleId/assign` → `role:assign`
- `POST /roles/:id/permissions` → `role:assign`
- `GET /roles/:id/permissions` → `role:read`
- `DELETE /roles/:roleId/users/:userId` → `role:assign`

### Audit Controller (`/audit`)
- `GET /audit/system` → `audit:read`
- `GET /audit/player/:playerId` → `audit:read`
- `GET /audit/my` → `audit:read`
- `GET /audit/stats` → `audit:read`

## 🔧 最佳实践

### 1. 权限设计原则
- **最小权限原则**: 仅给予必要权限
- **职责分离**: 不同角色有明确的权限边界
- **可追溯性**: 所有权限操作记录审计日志

### 2. 装饰器使用规范
```typescript
// ✅ 正确使用
@Permissions('resource:action')

// ❌ 避免使用（已废弃）
@Roles('role_name')
```

### 3. 权限检查最佳实践
```typescript
@Controller('example')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class ExampleController {
  
  @Get()
  @Permissions('resource:read')
  findAll() {
    // 实现逻辑
  }
  
  @Post()
  @Permissions('resource:write')  
  create() {
    // 实现逻辑
  }
  
  @Delete(':id')
  @Permissions('resource:delete')
  remove() {
    // 实现逻辑
  }
}
```

## 🚀 修复完成的问题

### ✅ 已修复问题

1. **种子数据完善**: 添加了缺失的权限（permission:*, role:delete, role:assign）
2. **控制器权限统一**: 修正了RBAC控制器中的权限命名不一致问题
3. **装饰器规范化**: 统一使用 `@Permissions` 装饰器，移除过时的 `@Roles`
4. **权限命名标准化**: 采用统一的 `resource:action` 命名规范
5. **角色权限分配**: 确保所有角色都有正确的权限分配

### 🎯 系统优势

- **完整性**: 覆盖所有功能模块的权限控制
- **一致性**: 统一的权限命名和使用规范
- **可扩展性**: 易于添加新的资源和操作权限
- **安全性**: 基于最小权限原则的权限设计
- **可维护性**: 清晰的权限结构和文档支持

## 📚 相关文件

- `backend/prisma/seed.ts` - 权限种子数据
- `backend/src/modules/core/decorators/roles.decorator.ts` - 权限装饰器定义
- `backend/src/modules/core/guards/rbac.guard.ts` - RBAC权限守卫
- `backend/src/modules/rbac/` - RBAC模块实现 