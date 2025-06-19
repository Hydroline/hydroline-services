import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BindExternalAccountDto } from './dto/bind-external-account.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 创建新账户
   */
  async create(createAccountDto: CreateAccountDto) {
    // 检查用户名或邮箱是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createAccountDto.username },
          ...(createAccountDto.email
            ? [{ email: createAccountDto.email }]
            : []),
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createAccountDto.password, 10);

    // 创建新用户
    const user = await this.prisma.user.create({
      data: {
        ...createAccountDto,
        password: hashedPassword,
        isActive: true,
      },
    });

    // 删除密码后返回
    const { password, ...result } = user;
    return result;
  }

  /**
   * 查找所有账户
   */
  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    // 移除密码
    return users.map((user) => {
      const { password, ...result } = user;
      return result;
    });
  }

  /**
   * 查找单个账户
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        externalAccounts: {
          select: {
            id: true,
            provider: true,
            providerUserId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        sessions: {
          where: {
            isActive: true,
            expiresAt: { gt: new Date() },
          },
          select: {
            id: true,
            deviceInfo: true,
            ipAddress: true,
            lastUsedAt: true,
            createdAt: true,
          },
          orderBy: { lastUsedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 移除密码
    const { password, ...result } = user;
    return result;
  }

  /**
   * 更新账户信息
   */
  async update(id: string, updateAccountDto: UpdateAccountDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    // 如果更新密码，需要加密
    let data = { ...updateAccountDto };
    if (updateAccountDto.password) {
      data.password = await bcrypt.hash(updateAccountDto.password, 10);
    }

    // 更新用户信息
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });

    // 移除密码
    const { password, ...result } = updatedUser;
    return result;
  }

  /**
   * 删除账户
   */
  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`ID为${id}的用户不存在`);
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * 用户注册
   */
  async register(createAccountDto: CreateAccountDto) {
    // 校验用户名长度
    if (
      !createAccountDto.username ||
      createAccountDto.username.length < 3 ||
      createAccountDto.username.length > 32
    ) {
      throw new BadRequestException('用户名长度必须在3-32个字符之间');
    }
    // 只允许字母、数字、下划线、短横线，禁止emoji和特殊字符
    if (!/^[a-zA-Z0-9_-]+$/.test(createAccountDto.username)) {
      throw new BadRequestException('用户名只能包含字母、数字、下划线和短横线');
    }

    // 检查用户名或邮箱是否已存在
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createAccountDto.username },
          ...(createAccountDto.email
            ? [{ email: createAccountDto.email }]
            : []),
        ],
      },
    });
    if (existingUser) {
      throw new BadRequestException('用户名或邮箱已存在');
    }

    // 密码双SHA256加密
    const crypto = await import('crypto');
    function doubleSHA256(password: string) {
      return crypto
        .createHash('sha256')
        .update(crypto.createHash('sha256').update(password).digest('hex'))
        .digest('hex');
    }
    const hashedPassword = doubleSHA256(createAccountDto.password);

    // 组装数据，只存有传入的字段
    const data: any = {
      username: createAccountDto.username,
      password: hashedPassword,
      isActive: true,
    };
    if (createAccountDto.email) data.email = createAccountDto.email;
    if (createAccountDto.avatarUrl) data.avatarUrl = createAccountDto.avatarUrl;

    // 创建新用户
    const user = await this.prisma.user.create({ data });
    const { password, ...result } = user;
    return result;
  }

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    // 验证当前密码
    const crypto = await import('crypto');
    function doubleSHA256(password: string) {
      return crypto
        .createHash('sha256')
        .update(crypto.createHash('sha256').update(password).digest('hex'))
        .digest('hex');
    }

    const currentPasswordHash = doubleSHA256(changePasswordDto.currentPassword);
    if (currentPasswordHash !== user.password) {
      throw new UnauthorizedException('当前密码不正确');
    }

    // 加密新密码
    const newPasswordHash = doubleSHA256(changePasswordDto.newPassword);

    // 更新密码，同时增加token版本号使所有现有token失效
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: newPasswordHash,
        tokenVersion: { increment: 1 },
      },
    });

    // 撤销所有session
    await this.prisma.session.updateMany({
      where: { userId },
      data: { isActive: false },
    });

    return { message: '密码修改成功，请重新登录' };
  }

  /**
   * 更新个人资料
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
    });

    const { password, ...result } = updatedUser;
    return result;
  }

  /**
   * 绑定外部账号
   */
  async bindExternalAccount(userId: string, bindDto: BindExternalAccountDto) {
    // 检查是否已绑定相同提供商的账号
    const existingAccount = await this.prisma.externalAccount.findFirst({
      where: {
        userId,
        provider: bindDto.provider,
      },
    });

    if (existingAccount) {
      throw new BadRequestException(`已绑定${bindDto.provider}账号`);
    }

    // 检查该外部账号是否已被其他用户绑定
    const existingBinding = await this.prisma.externalAccount.findFirst({
      where: {
        provider: bindDto.provider,
        providerUserId: bindDto.providerUserId,
      },
    });

    if (existingBinding) {
      throw new BadRequestException('该外部账号已被其他用户绑定');
    }

    // 创建绑定记录
    const externalAccount = await this.prisma.externalAccount.create({
      data: {
        userId,
        provider: bindDto.provider,
        providerUserId: bindDto.providerUserId,
        accessToken: bindDto.accessToken,
        refreshToken: bindDto.refreshToken,
        metadata: bindDto.metadata,
      },
    });

    return externalAccount;
  }

  /**
   * 解绑外部账号
   */
  async unbindExternalAccount(userId: string, externalAccountId: string) {
    const externalAccount = await this.prisma.externalAccount.findFirst({
      where: {
        id: externalAccountId,
        userId,
      },
    });

    if (!externalAccount) {
      throw new NotFoundException('绑定记录不存在');
    }

    await this.prisma.externalAccount.delete({
      where: { id: externalAccountId },
    });

    return { message: '解绑成功' };
  }

  /**
   * 获取用户外部账号列表
   */
  async getExternalAccounts(userId: string) {
    return await this.prisma.externalAccount.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        providerUserId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * 获取用户操作日志
   */
  async getUserAuditLogs(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({
        where: { userId },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 获取用户活跃会话
   */
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

  /**
   * 撤销指定会话
   */
  async revokeSession(userId: string, sessionId: string) {
    const session = await this.prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException('会话不存在');
    }

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return { message: '会话已撤销' };
  }

  /**
   * 撤销除当前外的所有会话
   */
  async revokeOtherSessions(userId: string, currentTokenId?: string) {
    const whereCondition: any = {
      userId,
      isActive: true,
    };

    if (currentTokenId) {
      whereCondition.tokenId = { not: currentTokenId };
    }

    await this.prisma.session.updateMany({
      where: whereCondition,
      data: { isActive: false },
    });

    return { message: '其他会话已全部撤销' };
  }

  /**
   * 获取用户详细统计信息
   */
  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const [
      totalSessions,
      activeSessions,
      totalExternalAccounts,
      totalAuditLogs,
    ] = await Promise.all([
      this.prisma.session.count({ where: { userId } }),
      this.prisma.session.count({
        where: {
          userId,
          isActive: true,
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.externalAccount.count({ where: { userId } }),
      this.prisma.auditLog.count({ where: { userId } }),
    ]);

    return {
      totalSessions,
      activeSessions,
      totalExternalAccounts,
      totalAuditLogs,
      registrationDate: user.createdAt,
      lastUpdated: user.updatedAt,
    };
  }
}
