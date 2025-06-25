import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';

@Injectable()
export class PermissionService {
  private readonly RESOURCES = [
    'user', 'player', 'role', 'permission', 'audit', 'system'
  ];

  private readonly ACTIONS = [
    'read', 'write', 'delete', 'assign', 'admin'
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(createPermissionDto: CreatePermissionDto, operatorId: string) {
    const { name, description, resource, action } = createPermissionDto;

    // 检查权限名是否已存在
    const existingPermission = await this.prisma.permission.findUnique({
      where: { name },
    });
    if (existingPermission) {
      throw new ConflictException('权限名已存在');
    }

    // 检查资源+操作组合是否已存在
    const existingCombination = await this.prisma.permission.findFirst({
      where: { resource, action },
    });
    if (existingCombination) {
      throw new ConflictException('该资源和操作的权限组合已存在');
    }

    const permission = await this.prisma.permission.create({
      data: {
        name,
        description,
        resource,
        action,
      },
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'CREATE_PERMISSION',
      resource: 'permission',
      resourceId: permission.id,
      detail: { name, description, resource: resource, action: action },
    });

    return permission;
  }

  async findAll(query: QueryPermissionDto) {
    const {
      page = '1',
      limit = '20',
      search,
      resource,
      action,
      isSystem,
    } = query;

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
    if (resource) where.resource = resource;
    if (action) where.action = action;
    if (typeof isSystem === 'boolean') where.isSystem = isSystem;

    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
        orderBy: [
          { resource: 'asc' },
          { action: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return {
      data: permissions.map(permission => ({
        ...permission,
        roles: permission.rolePermissions.map(rp => rp.role),
        roleCount: permission._count.rolePermissions,
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
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('权限不存在');
    }

    return {
      ...permission,
      roles: permission.rolePermissions.map(rp => rp.role),
      rolePermissions: undefined,
    };
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, operatorId: string) {
    const existingPermission = await this.findOne(id);

    if (existingPermission.isSystem) {
      throw new BadRequestException('系统权限不可修改');
    }

    const { name, description, resource, action } = updatePermissionDto;

    // 检查新权限名是否已存在
    if (name && name !== existingPermission.name) {
      const conflictPermission = await this.prisma.permission.findUnique({
        where: { name },
      });
      if (conflictPermission) {
        throw new ConflictException('权限名已存在');
      }
    }

    // 检查新资源+操作组合是否已存在
    if ((resource && resource !== existingPermission.resource) || 
        (action && action !== existingPermission.action)) {
      const newResource = resource || existingPermission.resource;
      const newAction = action || existingPermission.action;
      
      const conflictCombination = await this.prisma.permission.findFirst({
        where: { 
          resource: newResource, 
          action: newAction,
          id: { not: id }
        },
      });
      if (conflictCombination) {
        throw new ConflictException('该资源和操作的权限组合已存在');
      }
    }

    const permission = await this.prisma.permission.update({
      where: { id },
      data: {
        name,
        description,
        resource,
        action,
      },
    });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'UPDATE_PERMISSION',
      resource: 'permission',
      resourceId: permission.id,
      detail: { oldValue: existingPermission, newValue: updatePermissionDto },
    });

    return this.findOne(permission.id);
  }

  async remove(id: string, operatorId: string) {
    const permission = await this.findOne(id);

    if (permission.isSystem) {
      throw new BadRequestException('系统权限不可删除');
    }

    if (permission.roles.length > 0) {
      throw new BadRequestException('该权限还被角色使用，无法删除');
    }

    await this.prisma.permission.delete({ where: { id } });

    // 记录审计日志
    await this.auditService.logSystemAction({
      userId: operatorId,
      action: 'DELETE_PERMISSION',
      resource: 'permission',
      resourceId: id,
      detail: { deletedPermission: permission },
    });

    return { message: '权限删除成功' };
  }

  async getResources() {
    const resources = await this.prisma.permission.groupBy({
      by: ['resource'],
      _count: {
        resource: true,
      },
      orderBy: {
        resource: 'asc',
      },
    });

    return {
      available: this.RESOURCES,
      used: resources.map(r => ({
        name: r.resource,
        count: r._count.resource,
      })),
    };
  }

  async getActions() {
    const actions = await this.prisma.permission.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
      orderBy: {
        action: 'asc',
      },
    });

    return {
      available: this.ACTIONS,
      used: actions.map(a => ({
        name: a.action,
        count: a._count.action,
      })),
    };
  }
} 