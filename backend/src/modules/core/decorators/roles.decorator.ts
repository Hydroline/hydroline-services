import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器，用于控制接口访问权限
 * 使用方法: @Roles('admin', 'moderator')
 * @param roles 允许访问的角色数组
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
