import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';

interface PlayerAuditLogData {
  playerId: string;
  operatorId?: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class PlayerAuditService {
  constructor(
    @Inject(forwardRef(() => AuditService))
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * 记录玩家操作日志
   */
  async logPlayerAction(
    data: PlayerAuditLogData,
    tx?: any, // 支持事务
  ) {
    const prismaClient = tx || this.prisma;

    return prismaClient.playerAuditLog.create({
      data: {
        playerId: data.playerId,
        operatorId: data.operatorId,
        action: data.action,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * 获取玩家操作历史
   */
  async getPlayerAuditLogs(
    playerId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { page = 1, limit = 20, action, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = { playerId };

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.playerAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          player: {
            select: {
              playerNick: true,
              playerId: true,
            },
          },
        },
      }),
      this.prisma.playerAuditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取操作者的审计日志
   */
  async getOperatorAuditLogs(
    operatorId: string,
    options: {
      page?: number;
      limit?: number;
      action?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { page = 1, limit = 20, action, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = { operatorId };

    if (action) {
      where.action = action;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.playerAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          player: {
            select: {
              playerNick: true,
              playerId: true,
            },
          },
        },
      }),
      this.prisma.playerAuditLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取系统审计统计
   */
  async getAuditStats(options: { startDate?: Date; endDate?: Date } = {}) {
    const { startDate, endDate } = options;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    // 按操作类型统计
    const actionStats = await this.prisma.playerAuditLog.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    // 按日期统计
    const dailyStats = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM player_audit_logs
      WHERE created_at >= COALESCE(${startDate}, '1900-01-01')
        AND created_at <= COALESCE(${endDate}, NOW())
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // 活跃操作者
    const activeOperators = await this.prisma.playerAuditLog.groupBy({
      by: ['operatorId'],
      where: {
        ...where,
        operatorId: { not: null },
      },
      _count: {
        operatorId: true,
      },
      orderBy: {
        _count: {
          operatorId: 'desc',
        },
      },
      take: 10,
    });

    return {
      actionStats,
      dailyStats,
      activeOperators,
    };
  }
}
