import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlayerContactService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 添加联系信息
   */
  async create(data: {
    playerId: string;
    contactType: string;
    contactValue: string;
    isPrimary?: boolean;
    note?: string;
  }) {
    // 检查玩家是否存在
    const player = await this.prisma.minecraftPlayer.findUnique({
      where: { id: data.playerId },
    });

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    // 检查是否已存在相同的联系方式
    const existing = await this.prisma.playerContactInfo.findFirst({
      where: {
        playerId: data.playerId,
        contactType: data.contactType,
        contactValue: data.contactValue,
      },
    });

    if (existing) {
      throw new ConflictException('该联系方式已存在');
    }

    // 如果设置为主要联系方式，取消同类型的其他主要联系方式
    if (data.isPrimary) {
      await this.prisma.playerContactInfo.updateMany({
        where: {
          playerId: data.playerId,
          contactType: data.contactType,
          isPrimary: true,
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.playerContactInfo.create({
      data: {
        playerId: data.playerId,
        contactType: data.contactType,
        contactValue: data.contactValue,
        isPrimary: data.isPrimary || false,
        note: data.note,
      },
      include: {
        player: {
          select: {
            playerNick: true,
            playerId: true,
          },
        },
      },
    });
  }

  /**
   * 获取玩家的所有联系信息
   */
  async findByPlayer(playerId: string, contactType?: string) {
    const where: any = { playerId };
    if (contactType) {
      where.contactType = contactType;
    }

    return this.prisma.playerContactInfo.findMany({
      where,
      orderBy: [
        { isPrimary: 'desc' },
        { contactType: 'asc' },
        { createdAt: 'asc' },
      ],
      include: {
        player: {
          select: {
            playerNick: true,
            playerId: true,
          },
        },
      },
    });
  }

  /**
   * 查询单个联系信息
   */
  async findOne(id: string) {
    const contact = await this.prisma.playerContactInfo.findUnique({
      where: { id },
      include: {
        player: {
          select: {
            playerNick: true,
            playerId: true,
          },
        },
      },
    });

    if (!contact) {
      throw new NotFoundException('联系信息不存在');
    }

    return contact;
  }

  /**
   * 更新联系信息
   */
  async update(id: string, data: {
    contactType?: string;
    contactValue?: string;
    isPrimary?: boolean;
    isVerified?: boolean;
    note?: string;
  }) {
    const contact = await this.findOne(id);

    // 检查是否已存在相同的联系方式（排除当前记录）
    if (data.contactType || data.contactValue) {
      const existing = await this.prisma.playerContactInfo.findFirst({
        where: {
          playerId: contact.playerId,
          contactType: data.contactType || contact.contactType,
          contactValue: data.contactValue || contact.contactValue,
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('该联系方式已存在');
      }
    }

    // 如果设置为主要联系方式，取消同类型的其他主要联系方式
    if (data.isPrimary) {
      await this.prisma.playerContactInfo.updateMany({
        where: {
          playerId: contact.playerId,
          contactType: data.contactType || contact.contactType,
          isPrimary: true,
          id: { not: id },
        },
        data: { isPrimary: false },
      });
    }

    return this.prisma.playerContactInfo.update({
      where: { id },
      data,
      include: {
        player: {
          select: {
            playerNick: true,
            playerId: true,
          },
        },
      },
    });
  }

  /**
   * 删除联系信息
   */
  async remove(id: string) {
    const contact = await this.findOne(id);

    await this.prisma.playerContactInfo.delete({
      where: { id },
    });

    return { message: '联系信息删除成功' };
  }

  /**
   * 验证联系信息
   */
  async verify(id: string, isVerified: boolean = true) {
    return this.update(id, { isVerified });
  }

  /**
   * 设置为主要联系方式
   */
  async setPrimary(id: string) {
    return this.update(id, { isPrimary: true });
  }

  /**
   * 按联系方式类型统计
   */
  async getContactTypeStats() {
    const stats = await this.prisma.playerContactInfo.groupBy({
      by: ['contactType'],
      _count: {
        contactType: true,
      },
      orderBy: {
        _count: {
          contactType: 'desc',
        },
      },
    });

    return stats.map(stat => ({
      contactType: stat.contactType,
      count: stat._count.contactType,
    }));
  }

  /**
   * 根据联系方式查找玩家
   */
  async findPlayerByContact(contactType: string, contactValue: string) {
    const contact = await this.prisma.playerContactInfo.findFirst({
      where: {
        contactType,
        contactValue,
      },
      include: {
        player: {
          include: {
            user: true,
            status: true,
            type: true,
          },
        },
      },
    });

    return contact?.player || null;
  }
} 