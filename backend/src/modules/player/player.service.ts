import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { QueryPlayerDto, PlayerSortBy, SortOrder } from './dto/query-player.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { PlayerAuditService } from './player-audit.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlayerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: PlayerAuditService,
  ) {}

  // ========== 认证相关方法 ==========

  /**
   * 根据用户名查找玩家（用于登录认证）
   */
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
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
        minecraftPlayers: {
          include: {
            status: true,
            type: true,
          },
        },
      },
    });
  }

  /**
   * 验证密码
   */
  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    if (!user.password) {
      throw new BadRequestException('该用户未设置密码');
    }

    const isPasswordMatching = await this.validatePassword(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('当前密码错误');
    }

    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { 
        password: hashedNewPassword,
        tokenVersion: { increment: 1 }, // 使所有现有token失效
      },
    });

    // 记录审计日志
    await this.auditService.logPlayerAction({
      playerId: userId,
      operatorId: userId,
      action: 'CHANGE_PASSWORD',
      reason: '用户修改密码',
    });

    return { message: '密码修改成功' };
  }

  // ========== 玩家管理方法 ==========

  /**
   * 创建新玩家（同时创建User和MinecraftPlayer）
   */
  async create(createPlayerDto: CreatePlayerDto, operatorId?: string) {
    const { 
      username, 
      email, 
      password, 
      playerId, 
      playerNick, 
      statusId, 
      typeId, 
      ...otherData 
    } = createPlayerDto;

    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new ConflictException('邮箱已存在');
      }
    }

    // 检查玩家ID是否已存在
    if (playerId) {
      await this.checkPlayerIdConflict(playerId);
    }

    // 获取默认状态和类型
    const defaultStatus = statusId || (await this.getDefaultStatus())?.id;
    const defaultType = typeId || (await this.getDefaultType())?.id;

    // 加密密码
    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    // 事务创建用户和玩家
    const result = await this.prisma.$transaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          displayName: playerNick || username,
        },
      });

      // 创建Minecraft玩家（如果提供了playerId）
      let minecraftPlayer: any = null;
      if (playerId) {
        minecraftPlayer = await tx.minecraftPlayer.create({
          data: {
            playerId,
            playerNick: playerNick || username,
            userId: user.id,
            statusId: defaultStatus,
            typeId: defaultType,
            joinedAt: otherData.joinedAt ? new Date(otherData.joinedAt) : new Date(),
            lastSeenAt: otherData.lastSeenAt ? new Date(otherData.lastSeenAt) : null,
            isActive: otherData.isActive ?? true,
            metadata: otherData.metadata || {},
          },
        });
      }

      return { user, minecraftPlayer };
    });

    // 记录审计日志
    await this.auditService.logPlayerAction({
      playerId: result.user.id,
      operatorId,
      action: 'CREATE_PLAYER',
      newValue: { 
        username: result.user.username, 
        playerId: result.minecraftPlayer?.playerId,
        playerNick: result.minecraftPlayer?.playerNick 
      },
      reason: '创建新玩家账户',
    });

    return this.findOne(result.user.id);
  }

  /**
   * 查询玩家列表（支持分页、搜索、过滤）
   */
  async findMany(queryDto: QueryPlayerDto) {
    const {
      page = '1',
      limit = '20',
      search,
      statusId,
      typeId,
      userId,
      isActive,
      sortBy = PlayerSortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      startDate,
      endDate,
    } = queryDto;

    const pageNumber = parseInt(page, 10);
    const pageSize = Math.min(parseInt(limit, 10), 100); // 限制最大100条
    const skip = (pageNumber - 1) * pageSize;

    // 构建查询条件
    const where: any = {};

    if (search) {
      where.OR = [
        { playerNick: { contains: search, mode: 'insensitive' } },
        { playerId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (statusId) where.statusId = statusId;
    if (typeId) where.typeId = typeId;
    if (userId) where.userId = userId;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    if (startDate || endDate) {
      where.joinedAt = {};
      if (startDate) where.joinedAt.gte = new Date(startDate);
      if (endDate) where.joinedAt.lte = new Date(endDate);
    }

    // 执行查询
    const [players, total] = await Promise.all([
      this.prisma.minecraftPlayer.findMany({
        where,
        include: {
          user: true,
          status: true,
          type: true,
          contactInfos: true,
          alternativeIds: true,
          alternativeNicks: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: pageSize,
      }),
      this.prisma.minecraftPlayer.count({ where }),
    ]);

    return {
      data: players,
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
   * 根据ID查询单个玩家
   */
  async findOne(id: string) {
    const player = await this.prisma.minecraftPlayer.findUnique({
      where: { id },
      include: {
        user: true,
        status: true,
        type: true,
        contactInfos: true,
        alternativeIds: true,
        alternativeNicks: true,
        auditLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10, // 最近10条审计记录
        },
      },
    });

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    return player;
  }

  /**
   * 根据玩家ID（UUID）查询玩家
   */
  async findByPlayerId(playerId: string) {
    const player = await this.prisma.minecraftPlayer.findUnique({
      where: { playerId },
      include: {
        user: true,
        status: true,
        type: true,
        contactInfos: true,
        alternativeIds: true,
        alternativeNicks: true,
      },
    });

    if (!player) {
      throw new NotFoundException('玩家不存在');
    }

    return player;
  }

  /**
   * 更新玩家信息（包含复杂的主ID迁移逻辑）
   */
  async update(id: string, updatePlayerDto: UpdatePlayerDto, operatorId?: string) {
    const existingPlayer = await this.findOne(id);
    
    const { playerId, ...otherUpdates } = updatePlayerDto;

    // 如果只是普通更新，不涉及playerId变更
    if (!playerId || playerId === existingPlayer.playerId) {
      // 验证关联数据
      if (otherUpdates.statusId) {
        await this.validateStatusExists(otherUpdates.statusId);
      }
      if (otherUpdates.typeId) {
        await this.validateTypeExists(otherUpdates.typeId);
      }

      const updatedPlayer = await this.prisma.minecraftPlayer.update({
        where: { id },
        data: {
          playerNick: otherUpdates.playerNick,
          statusId: otherUpdates.statusId,
          typeId: otherUpdates.typeId,
          lastSeenAt: otherUpdates.lastSeenAt ? new Date(otherUpdates.lastSeenAt) : undefined,
          isActive: otherUpdates.isActive,
          metadata: otherUpdates.metadata,
        },
      });

      // 记录审计日志
      await this.auditService.logPlayerAction({
        playerId: id,
        operatorId,
        action: 'UPDATE_PLAYER',
        oldValue: this.extractAuditFields(existingPlayer),
        newValue: this.extractAuditFields(updatedPlayer),
        reason: '更新玩家信息',
      });

      return this.findOne(id);
    }

    // 如果涉及玩家ID变更，执行复杂的迁移逻辑
    return this.updatePlayerIdWithMigration(existingPlayer.playerId, playerId, otherUpdates, operatorId);
  }

  /**
   * 复杂的主ID迁移逻辑
   */
  private async updatePlayerIdWithMigration(
    playerId: string, 
    newPlayerId: string, 
    otherUpdates: any, 
    operatorId?: string
  ) {
    const existingPlayer = await this.findOne(playerId);
    const oldPlayerId = existingPlayer.playerId;

    // 1. 检查新ID是否与现有主表中的其他记录冲突
    const existingMainPlayer = await this.prisma.minecraftPlayer.findUnique({
      where: { playerId: newPlayerId },
    });

    if (existingMainPlayer && existingMainPlayer.id !== playerId) {
      throw new ConflictException('新的玩家ID已存在于主表中');
    }

    // 2. 检查新ID是否在alternative_ids表中
    const existingAltId = await this.prisma.playerAlternativeId.findFirst({
      where: { altId: newPlayerId },
      include: { player: true },
    });

    let playerToMerge: { id: string } | null = null;
    if (existingAltId) {
      playerToMerge = existingAltId.player;
    }

    return this.prisma.$transaction(async (tx) => {
      if (playerToMerge && playerToMerge.id !== playerId) {
        // 3. 如果新ID存在于其他玩家的alternative_ids中，需要合并数据
        await this.mergePlayerData(tx, playerId, playerToMerge.id, operatorId);
        
        // 删除被合并的玩家记录
        await tx.minecraftPlayer.delete({
          where: { id: playerToMerge.id },
        });
      } else if (existingAltId && existingAltId.playerId === playerId) {
        // 4. 如果新ID就在当前玩家的alternative_ids中，直接删除该记录
        await tx.playerAlternativeId.delete({
          where: { id: existingAltId.id },
        });
      }

      // 5. 将旧的主ID添加到alternative_ids表
      await tx.playerAlternativeId.create({
        data: {
          playerId: playerId,
          altId: oldPlayerId,
          altNick: existingPlayer.playerNick,
          note: '原主要ID',
          isVerified: true,
        },
      });

      // 6. 更新主表的playerId
      const updateData: any = { 
        playerId: newPlayerId,
        ...otherUpdates 
      };
      if (updateData.joinedAt) updateData.joinedAt = new Date(updateData.joinedAt);
      if (updateData.lastSeenAt) updateData.lastSeenAt = new Date(updateData.lastSeenAt);

      const updatedPlayer = await tx.minecraftPlayer.update({
        where: { id: playerId },
        data: updateData,
        include: {
          user: true,
          status: true,
          type: true,
          contactInfos: true,
          alternativeIds: true,
          alternativeNicks: true,
        },
      });

      // 记录审计日志
      await this.auditService.logPlayerAction({
        playerId: updatedPlayer.id,
        operatorId,
        action: 'MIGRATE_PLAYER_ID',
        oldValue: { playerId: oldPlayerId },
        newValue: { playerId: newPlayerId },
        reason: `主ID迁移: ${oldPlayerId} -> ${newPlayerId}`,
      }, tx);

      return updatedPlayer;
    });
  }

  /**
   * 合并玩家数据
   */
  private async mergePlayerData(tx: any, targetPlayerId: string, sourcePlayerId: string, operatorId?: string) {
    // 迁移联系信息
    await tx.playerContactInfo.updateMany({
      where: { playerId: sourcePlayerId },
      data: { playerId: targetPlayerId },
    });

    // 迁移alternative IDs
    await tx.playerAlternativeId.updateMany({
      where: { playerId: sourcePlayerId },
      data: { playerId: targetPlayerId },
    });

    // 迁移alternative昵称
    await tx.playerAlternativeNick.updateMany({
      where: { playerId: sourcePlayerId },
      data: { playerId: targetPlayerId },
    });

    // 迁移审计日志
    await tx.playerAuditLog.updateMany({
      where: { playerId: sourcePlayerId },
      data: { playerId: targetPlayerId },
    });

    // 记录合并日志
    await this.auditService.logPlayerAction({
      playerId: targetPlayerId,
      operatorId,
      action: 'MERGE_PLAYER_DATA',
      newValue: { mergedFromPlayerId: sourcePlayerId },
      reason: '玩家数据合并',
    }, tx);
  }

  /**
   * 删除玩家
   */
  async remove(id: string, operatorId?: string) {
    const player = await this.findOne(id);

    await this.prisma.minecraftPlayer.delete({
      where: { id },
    });

    // 记录审计日志
    await this.auditService.logPlayerAction({
      playerId: id,
      operatorId,
      action: 'DELETE_PLAYER',
      oldValue: this.extractAuditFields(player),
      reason: '删除玩家',
    });

    return { message: '玩家删除成功' };
  }

  /**
   * 检查玩家ID冲突
   */
  private async checkPlayerIdConflict(playerId: string) {
    // 检查主表
    const existingMain = await this.prisma.minecraftPlayer.findUnique({
      where: { playerId },
    });
    if (existingMain) {
      throw new ConflictException('玩家ID已存在');
    }

    // 检查alternative_ids表
    const existingAlt = await this.prisma.playerAlternativeId.findFirst({
      where: { altId: playerId },
    });
    if (existingAlt) {
      throw new ConflictException('玩家ID已存在于备用ID列表中');
    }
  }

  /**
   * 获取默认状态
   */
  private async getDefaultStatus() {
    return this.prisma.playerStatus.findFirst({
      where: { isDefault: true },
    });
  }

  /**
   * 获取默认类型
   */
  private async getDefaultType() {
    return this.prisma.playerType.findFirst({
      where: { isDefault: true },
    });
  }

  /**
   * 验证用户存在
   */
  private async validateUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('关联用户不存在');
    }
  }

  /**
   * 验证状态存在
   */
  private async validateStatusExists(statusId: string) {
    const status = await this.prisma.playerStatus.findUnique({ where: { id: statusId } });
    if (!status) {
      throw new BadRequestException('玩家状态不存在');
    }
  }

  /**
   * 验证类型存在
   */
  private async validateTypeExists(typeId: string) {
    const type = await this.prisma.playerType.findUnique({ where: { id: typeId } });
    if (!type) {
      throw new BadRequestException('玩家类型不存在');
    }
  }

  /**
   * 提取审计字段
   */
  private extractAuditFields(player: any) {
    return {
      playerId: player.playerId,
      playerNick: player.playerNick,
      userId: player.userId,
      statusId: player.statusId,
      typeId: player.typeId,
      isActive: player.isActive,
    };
  }
} 