import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerStatusService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新状态
   */
  async create(data: {
    name: string;
    description?: string;
    color?: string;
    isDefault?: boolean;
    sortOrder?: number;
  }) {
    // 检查名称是否重复
    const existing = await this.prisma.playerStatus.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new ConflictException('状态名称已存在');
    }

    // 如果设置为默认，先取消其他默认状态
    if (data.isDefault) {
      await this.prisma.playerStatus.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.playerStatus.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color,
        isDefault: data.isDefault || false,
        sortOrder: data.sortOrder || 0,
      },
    });
  }

  /**
   * 查询所有状态
   */
  async findAll() {
    return this.prisma.playerStatus.findMany({
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
   * 查询单个状态
   */
  async findOne(id: string) {
    const status = await this.prisma.playerStatus.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!status) {
      throw new NotFoundException('状态不存在');
    }

    return status;
  }

  /**
   * 更新状态
   */
  async update(id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    isDefault?: boolean;
    sortOrder?: number;
  }) {
    const status = await this.findOne(id);

    // 检查系统状态
    if (status.isSystem && data.name && data.name !== status.name) {
      throw new ConflictException('系统状态不能修改名称');
    }

    // 检查名称重复
    if (data.name && data.name !== status.name) {
      const existing = await this.prisma.playerStatus.findUnique({
        where: { name: data.name },
      });
      if (existing) {
        throw new ConflictException('状态名称已存在');
      }
    }

    // 如果设置为默认，先取消其他默认状态
    if (data.isDefault) {
      await this.prisma.playerStatus.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.playerStatus.update({
      where: { id },
      data,
    });
  }

  /**
   * 删除状态
   */
  async remove(id: string) {
    const status = await this.findOne(id);

    if (status.isSystem) {
      throw new ConflictException('系统状态不能删除');
    }

    if (status._count.players > 0) {
      throw new ConflictException('该状态下还有玩家，不能删除');
    }

    await this.prisma.playerStatus.delete({
      where: { id },
    });

    return { message: '状态删除成功' };
  }

  /**
   * 获取默认状态
   */
  async getDefault() {
    return this.prisma.playerStatus.findFirst({
      where: { isDefault: true },
    });
  }
} 