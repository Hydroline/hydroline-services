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
      console.error('User validation error:', error);
      throw error;
    }
  }

  async login(user: any, deviceInfo?: string, ipAddress?: string) {
    const tokenId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

    // 创建session记录
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
      jti: tokenId, // JWT ID，用于session追踪
    };

    return {
      user: {
        id: user.id,
        username: user.username,
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

      if (result.count > 0) {
        console.log(`清理了 ${result.count} 个过期的会话`);
      }

      return result;
    } catch (error) {
      console.error('清理过期会话时出错:', error);
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
}
