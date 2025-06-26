import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerTypeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新类型
   */
  async create(data: {
    name: string;
    description?: string;
    permissions?: Record<string, any>;
    isDefault?: boolean;
    sortOrder?: number;
  }) {
    // 检查名称是否重复
    const existing = await this.prisma.playerType.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('类型名称已存在');
    }

    // 如果设置为默认，先取消其他默认类型
    if (data.isDefault) {
      await this.prisma.playerType.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.playerType.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: data.permissions || {},
        isDefault: data.isDefault || false,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  /**
   * 查询所有类型
   */
  async findAll() {
    return this.prisma.playerType.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });
  }

  /**
   * 查询单个类型
   */
  async findOne(id: string) {
    const type = await this.prisma.playerType.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!type) {
      throw new NotFoundException('类型不存在');
    }

    return type;
  }

  /**
   * 更新类型
   */
  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      permissions?: Record<string, any>;
      isDefault?: boolean;
      sortOrder?: number;
    },
  ) {
    const type = await this.findOne(id);

    // 检查系统类型
    if (type.isSystem && data.name && data.name !== type.name) {
      throw new ConflictException('系统类型不能修改名称');
    }

    // 检查名称重复
    if (data.name && data.name !== type.name) {
      const existing = await this.prisma.playerType.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('类型名称已存在');
      }
    }

    // 如果设置为默认，先取消其他默认类型
    if (data.isDefault) {
      await this.prisma.playerType.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.playerType.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除类型
   */
  async remove(id: string) {
    const type = await this.findOne(id);

    if (type.isSystem) {
      throw new ConflictException('系统类型不能删除');
    }

    if (type._count.players > 0) {
      throw new ConflictException('该类型下还有玩家，不能删除');
    }

    await this.prisma.playerType.delete({
      where: { id },
    });

    return { message: '类型删除成功' };
  }

  /**
   * 获取默认类型
   */
  async getDefault() {
    return this.prisma.playerType.findFirst({
      where: { isDefault: true },
    });
  }
}
