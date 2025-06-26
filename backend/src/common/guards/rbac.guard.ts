import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../modules/prisma/prisma.service';
import { ROLES_KEY, PERMISSIONS_KEY } from '../decorators/auth.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有设置任何角色或权限要求，则允许访问
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.id) {
      throw new ForbiddenException('未提供有效的用户信息');
    }

    // 获取用户的角色和权限
    const userRolesAndPermissions = await this.getUserRolesAndPermissions(
      user.id,
    );
    const userRoles = userRolesAndPermissions.roles;
    const userPermissions = userRolesAndPermissions.permissions;

    // 检查角色
    if (requiredRoles) {
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));
      if (!hasRole) {
        throw new ForbiddenException(`需要角色: ${requiredRoles.join(', ')}`);
      }
    }

    // 检查权限
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );
      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `需要权限: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }

  private async getUserRolesAndPermissions(
    userId: string,
  ): Promise<{ roles: string[]; permissions: string[] }> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return { roles: [], permissions: [] };
    }

    const roles = userWithRoles.userRoles.map((ur) => ur.role.name);
    const permissions = new Set<string>();
    userWithRoles.userRoles.forEach((ur) => {
      ur.role.rolePermissions.forEach((rp) => {
        permissions.add(rp.permission.name);
      });
    });

    return { roles, permissions: Array.from(permissions) };
  }
} 