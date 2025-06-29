import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import config from '../../../config';
import { PlayerService } from '../../player/player.service';
import { SSOService } from './sso.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => PlayerService))
    private readonly playerService: PlayerService,
    private readonly ssoService: SSOService,
  ) {}

  async validateUserById(userId: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        isActive: true,
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const { password, ...result } = user;
    return result;
  }

  // 增强版JWT验证 - 包含session和tokenVersion检查
  async validateJwtPayload(payload: any): Promise<any> {
    // 验证 payload 结构
    if (!payload || typeof payload !== 'object' || !payload.sub) {
      throw new UnauthorizedException('无效的令牌格式');
    }

    const user = await this.validateUserById(payload.sub);
    if (!user) {
      return null;
    }

    // 检查token版本是否匹配
    if (
      typeof payload.tokenVersion === 'number' &&
      payload.tokenVersion !== user.tokenVersion
    ) {
      throw new UnauthorizedException('Token已失效，请重新登录');
    }

    // 如果有tokenId，验证session是否有效
    if (payload.jti) {
      const session = await this.prisma.session.findUnique({
        where: { tokenId: payload.jti },
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        throw new UnauthorizedException('会话已失效，请重新登录');
      }

      // 更新最后使用时间
      await this.prisma.session.update({
        where: { id: session.id },
        data: { lastUsedAt: new Date() },
      });
    }

    return user;
  }

  /**
   * 验证用户登录
   */
  async validateUser(username: string, password: string): Promise<any> {
    try {
      const user = await this.playerService.findByUsername(username);
      if (!user) {
        return null;
      }

      if (!user.password) {
        throw new BadRequestException('该账户未设置密码，请使用第三方登录');
      }

      const isPasswordValid = await this.playerService.validatePassword(
        password,
        user.password,
      );
      if (!isPasswordValid) {
        return null;
      }

      if (!user.isActive) {
        throw new BadRequestException('账户已被禁用');
      }

      // 移除密码字段，返回用户信息
      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      throw error;
    }
  }

  async login(user: any, deviceInfo?: string, ipAddress?: string) {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await this.prisma.session.create({
      data: {
        userId: user.id,
        tokenId,
        deviceInfo: deviceInfo || 'Unknown Device',
        ipAddress: ipAddress || 'Unknown IP',
        expiresAt,
      },
    });

    const payload = {
      sub: user.id,
      username: user.username,
      tokenVersion: user.tokenVersion,
      jti: tokenId,
    };

    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        roles: user.userRoles?.map((ur) => ur.role.name) || [],
      },
      accessToken: this.jwtService.sign(payload, {
        secret: config.jwt.secret,
        expiresIn: config.jwt.expiresIn,
      }),
      refreshToken: this.jwtService.sign(
        { ...payload, type: 'refresh' },
        {
          secret: config.jwt.refreshSecret,
          expiresIn: config.jwt.refreshExpiresIn,
        },
      ),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verify(refreshToken, {
        secret: config.jwt.refreshSecret,
      });

      if (payload.type !== 'refresh') {
        throw new BadRequestException('无效的刷新令牌');
      }

      const user = await this.validateUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 检查token版本
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new UnauthorizedException('Token已失效，请重新登录');
      }

      // 验证session
      if (payload.jti) {
        const session = await this.prisma.session.findUnique({
          where: { tokenId: payload.jti },
        });

        if (!session || !session.isActive) {
          throw new UnauthorizedException('会话已失效，请重新登录');
        }
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        tokenVersion: user.tokenVersion,
        jti: payload.jti,
      };

      return {
        accessToken: this.jwtService.sign(newPayload, {
          secret: config.jwt.secret,
          expiresIn: config.jwt.expiresIn,
        }),
      };
    } catch (error) {
      throw new BadRequestException('无效的刷新令牌');
    }
  }

  // 撤销单个session
  async revokeSession(tokenId: string, userId: string) {
    await this.prisma.session.updateMany({
      where: {
        tokenId,
        userId,
      },
      data: {
        isActive: false,
      },
    });
  }

  // 撤销用户所有session
  async revokeAllSessions(userId: string) {
    // 增加token版本，使所有现有token失效
    await this.prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });

    // 标记所有session为不活跃
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });
  }

  // 获取用户活跃sessions
  async getUserSessions(userId: string) {
    return await this.prisma.session.findMany({
      where: {
        userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        tokenId: true,
        deviceInfo: true,
        ipAddress: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  // 清理过期session
  async cleanupExpiredSessions() {
    try {
      const result = await this.prisma.session.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: new Date() } }, { isActive: false }],
        },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async validateOAuthUser(oauthUser: any) {
    // 查找是否已有此OAuth账号关联的用户
    let user = await this.prisma.user.findFirst({
      where: { email: oauthUser.email },
    });

    // 如果没有，创建一个新用户
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username: `${oauthUser.provider}_${oauthUser.providerId}`,
          email: oauthUser.email,
          password: await bcrypt.hash(
            Math.random().toString(36).slice(-10),
            config.security.bcryptRounds,
          ), // 随机密码
          isActive: true,
        },
      });

      // 这里应该还有关联外部账号的逻辑，但为简化暂不展示
    }

    return user;
  }

  /**
   * 用户注册
   */
  async register(registerData: {
    username: string;
    email?: string;
    password: string;
    displayName?: string;
    minecraftUuid?: string;
    minecraftNick?: string;
  }, deviceInfo?: string, ipAddress?: string) {
    const { username, email, password, displayName, minecraftUuid, minecraftNick } = registerData;

    // 检查用户名是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUser) {
      throw new BadRequestException('用户名已存在');
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new BadRequestException('邮箱已存在');
      }
    }

    // 检查 Minecraft UUID 是否已存在
    if (minecraftUuid) {
      const existingMinecraftPlayer = await this.prisma.minecraftPlayer.findUnique({
        where: { playerId: minecraftUuid },
      });
      if (existingMinecraftPlayer) {
        throw new BadRequestException('该 Minecraft 账户已被绑定');
      }
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 事务创建用户和可能的 Minecraft 玩家记录
    const result = await this.prisma.$transaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          displayName: displayName || username,
          isActive: true,
        },
      });

      // 如果提供了 Minecraft 信息，创建玩家记录
      if (minecraftUuid) {
        // 获取默认状态和类型
        const [defaultStatus, defaultType] = await Promise.all([
          tx.playerStatus.findFirst({ where: { isDefault: true } }),
          tx.playerType.findFirst({ where: { isDefault: true } }),
        ]);

        await tx.minecraftPlayer.create({
          data: {
            playerId: minecraftUuid,
            playerNick: minecraftNick || username,
            userId: user.id,
            statusId: defaultStatus?.id,
            typeId: defaultType?.id,
            joinedAt: new Date(),
            isActive: true,
            metadata: {},
          },
        });
      }

      return user;
    });

    // 自动登录并返回 token
    return this.login(result, deviceInfo, ipAddress);
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordData: {
    oldPassword: string;
    newPassword: string;
  }) {
    const { oldPassword, newPassword } = changePasswordData;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    if (!user.password) {
      throw new BadRequestException('该用户未设置密码');
    }

    const isPasswordMatching = await this.playerService.validatePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordMatching) {
      throw new BadRequestException('当前密码错误');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        tokenVersion: { increment: 1 }, // 使所有现有token失效
      },
    });

    // 标记所有session为不活跃（强制重新登录）
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    return { message: '密码修改成功，请重新登录' };
  }
}
