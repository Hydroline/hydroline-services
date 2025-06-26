import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

// ===================== 角色与权限装饰器 =====================

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器，用于控制接口访问权限
 * 使用方法: @Roles('admin', 'moderator')
 * @param roles 允许访问的角色数组
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';

/**
 * 权限装饰器，用于控制接口访问权限
 * 使用方法: @Permissions('user:read', 'user:write')
 * @param permissions 所需权限数组
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// ===================== 用户信息装饰器 =====================

/**
 * 获取当前登录用户的装饰器
 * 使用方法: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
); 