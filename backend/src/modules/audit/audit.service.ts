import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 记录系统审计日志
   */
  async logSystemAction(data: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        detail: data.detail,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * 记录玩家审计日志
   */
  async logPlayerAction(data: {
    playerId: string;
    operatorId?: string;
    action: string;
    oldValue?: any;
    newValue?: any;
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.playerAuditLog.create({
      data: {
        playerId: data.playerId,
        operatorId: data.operatorId,
        action: data.action,
        oldValue: data.oldValue,
        newValue: data.newValue,
        reason: data.reason,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  /**
   * 获取系统审计日志
   */
  async getSystemAuditLogs(query: QueryAuditDto) {
    const {
      page = '1',
      limit = '20',
      action,
      resource,
      userId,
      startDate,
      endDate,
    } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = {};
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (resource) where.resource = resource;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data: logs,
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

  /**
   * 获取玩家审计日志
   */
  async getPlayerAuditLogs(playerId: string, query: QueryAuditDto) {
    const { page = '1', limit = '20', action, startDate, endDate } = query;

    const pageNumber = parseInt(page, 10);
    const pageSize = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNumber - 1) * pageSize;

    const where: any = { playerId };
    if (action) where.action = { contains: action, mode: 'insensitive' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      this.prisma.playerAuditLog.findMany({
        where,
        include: {
          player: {
            select: {
              id: true,
              playerId: true,
              playerNick: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.playerAuditLog.count({ where }),
    ]);

    return {
      data: logs,
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

  /**
   * 获取用户的操作日志
   */
  async getUserAuditLogs(userId: string, query: QueryAuditDto) {
    return this.getSystemAuditLogs({ ...query, userId });
  }

  /**
   * 获取审计统计信息
   */
  async getAuditStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 系统操作统计
    const systemStats = await this.prisma.auditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    // 玩家操作统计
    const playerStats = await this.prisma.playerAuditLog.groupBy({
      by: ['action'],
      where: {
        createdAt: {
          gte: startDate,
        },
      },
      _count: {
        action: true,
      },
      orderBy: {
        _count: {
          action: 'desc',
        },
      },
    });

    // 每日活动统计
    const dailyActivity = await this.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as system_actions,
        (SELECT COUNT(*) FROM player_audit_logs WHERE DATE(created_at) = DATE(audit_logs.created_at)) as player_actions
      FROM audit_logs 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      period: `最近${days}天`,
      systemActions: {
        total: systemStats.reduce((sum, item) => sum + item._count.action, 0),
        byAction: systemStats.map((item) => ({
          action: item.action,
          count: item._count.action,
        })),
      },
      playerActions: {
        total: playerStats.reduce((sum, item) => sum + item._count.action, 0),
        byAction: playerStats.map((item) => ({
          action: item.action,
          count: item._count.action,
        })),
      },
      dailyActivity,
    };
  }
}
