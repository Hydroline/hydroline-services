import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';

@Injectable()
export class RoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(createRoleDto: CreateRoleDto, operatorId: string) {
    const { name, description, priority, permissionIds } = createRoleDto;

    // 检查角色名是否已存在
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });
    if (existingRole) {
      throw new ConflictException('角色名已存在');
    }

    // 验证权限ID
    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: permissionIds } },
      });
      if (permissions.length !== permissionIds.length) {
        throw new BadRequestException('包含无效的权限ID');
      }
    }

    const role = await this.prisma.$transaction(async (tx) => {
      // 创建角色
      const newRole = await tx.role.create({
        data: {
          name,
          description,
          priority: priority ?? 0,
        },
      });

      // 分配权限
      if (permissionIds && permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: newRole.id,
            permissionId,
          })),
        });
      }

      return newRole;
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'CREATE_ROLE',
      resource: 'role',
      resourceId: role.id,
      detail: { name, description, permissionIds },
    });

    return this.findOne(role.id);
  }

  async findAll(query: QueryRoleDto) {
    const { page = '1', limit = '20', search, isSystem } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (typeof isSystem === 'boolean') {
      where.isSystem = isSystem;
    }

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: {
            select: {
              userId: true,
            },
          },
          _count: {
            select: {
              userRoles: true,
            },
          },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles.map((role) => ({
        ...role,
        permissions: role.rolePermissions.map((rp) => rp.permission),
        userCount: role._count.userRoles,
        rolePermissions: undefined,
        _count: undefined,
      })),
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        pages: Math.ceil(total / pageSize),
        hasNext: pageNumber * pageSize < total,
        hasPrev: pageNumber > 1,
      },
    };
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return {
      ...role,
      permissions: role.rolePermissions.map((rp) => rp.permission),
      users: role.userRoles.map((ur) => ur.user),
      rolePermissions: undefined,
      userRoles: undefined,
    };
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, operatorId: string) {
    const existingRole = await this.findOne(id);

    if (existingRole.isSystem) {
      throw new BadRequestException('系统角色不可修改');
    }

    const { name, description, priority, permissionIds } = updateRoleDto;

    // 检查新角色名是否已存在
    if (name && name !== existingRole.name) {
      const conflictRole = await this.prisma.role.findUnique({
        where: { name },
      });
      if (conflictRole) {
        throw new ConflictException('角色名已存在');
      }
    }

    const role = await this.prisma.$transaction(async (tx) => {
      // 更新角色基本信息
      const updatedRole = await tx.role.update({
        where: { id },
        data: {
          name,
          description,
          priority,
        },
      });

      // 更新权限分配
      if (permissionIds !== undefined) {
        // 删除现有权限关联
        await tx.rolePermission.deleteMany({
          where: { roleId: id },
        });

        // 添加新权限关联
        if (permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId: id,
              permissionId,
            })),
          });
        }
      }

      return updatedRole;
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'UPDATE_ROLE',
      resource: 'role',
      resourceId: role.id,
      detail: { oldValue: existingRole, newValue: updateRoleDto },
    });

    return this.findOne(role.id);
  }

  async remove(id: string, operatorId: string) {
    const role = await this.findOne(id);

    if (role.isSystem) {
      throw new BadRequestException('系统角色不可删除');
    }

    if (role.users.length > 0) {
      throw new BadRequestException('该角色下还有用户，无法删除');
    }

    await this.prisma.role.delete({ where: { id } });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'DELETE_ROLE',
      resource: 'role',
      resourceId: id,
      detail: { deletedRole: role },
    });

    return { message: '角色删除成功' };
  }

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
    operatorId: string,
  ) {
    const role = await this.findOne(roleId);

    if (role.isSystem) {
      throw new BadRequestException('系统角色权限不可修改');
    }

    // 验证权限ID
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new BadRequestException('包含无效的权限ID');
    }

    await this.prisma.$transaction(async (tx) => {
      // 删除现有权限关联
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 添加新权限关联
      if (permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId,
            permissionId,
          })),
        });
      }
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'ASSIGN_ROLE_PERMISSIONS',
      resource: 'role',
      resourceId: roleId,
      detail: { permissionIds },
    });

    return this.findOne(roleId);
  }

  async assignToUsers(
    roleId: string,
    assignRoleDto: AssignRoleDto,
    operatorId: string,
  ) {
    const role = await this.findOne(roleId);
    const { userIds, expiresAt } = assignRoleDto;

    // 验证用户ID
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
    });
    if (users.length !== userIds.length) {
      throw new BadRequestException('包含无效的用户ID');
    }

    // 批量分配角色
    await this.prisma.userRole.createMany({
      data: userIds.map((userId) => ({
        userId,
        roleId,
        assignedBy: operatorId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      })),
      skipDuplicates: true,
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'ASSIGN_ROLE_TO_USERS',
      resource: 'role',
      resourceId: roleId,
      detail: { userIds, expiresAt },
    });

    return { message: '角色分配成功' };
  }

  async removeFromUser(roleId: string, userId: string, operatorId: string) {
    const userRole = await this.prisma.userRole.findFirst({
      where: { roleId, userId },
    });

    if (!userRole) {
      throw new NotFoundException('用户角色关联不存在');
    }

    await this.prisma.userRole.delete({
      where: { id: userRole.id },
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'REMOVE_ROLE_FROM_USER',
      resource: 'role',
      resourceId: roleId,
      detail: { targetUserId: userId },
    });

    return { message: '角色移除成功' };
  }

  async getPermissions(roleId: string) {
    const roleWithPermissions = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!roleWithPermissions) {
      throw new NotFoundException('角色不存在');
    }

    return roleWithPermissions.rolePermissions.map((rp) => rp.permission);
  }
}
