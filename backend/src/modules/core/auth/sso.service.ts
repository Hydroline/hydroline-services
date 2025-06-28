import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import config from '../../../config';

@Injectable()
export class SSOService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * 生成单点登录令牌
   */
  generateSSOToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      type: 'sso',
    };

    return this.jwtService.sign(payload, {
      secret: config.jwt.secret,
      expiresIn: '15m', // SSO令牌通常短期有效
    });
  }

  /**
   * 验证SSO令牌
   */
  async validateSSOToken(token: string): Promise<any> {
    try {
      if (!token || typeof token !== 'string') {
        return null;
      }

      const payload = await this.jwtService.verify(token, {
        secret: config.jwt.secret,
      });

      // 验证 payload 结构和类型
      if (!payload || typeof payload !== 'object' || payload.type !== 'sso') {
        return null;
      }

      // 验证必要字段
      if (!payload.sub || !payload.username) {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * 生成跨系统SSO重定向URL
   */
  generateSSORedirectUrl(user: User, targetSystem: string): string {
    const token = this.generateSSOToken(user);

    // 检查SSO是否启用
    if (!config.sso.enabled) {
      throw new Error(
        'SSO is not enabled. Please set SSO_ENABLED=true in your configuration.',
      );
    }

    let clientConfig;
    switch (targetSystem) {
      case 'wiki':
        clientConfig = config.sso.clients.wiki;
        break;
      case 'forum':
        clientConfig = config.sso.clients.forum;
        break;
      case 'media-wiki':
        clientConfig = config.sso.clients.mediawiki;
        break;
      default:
        clientConfig = config.sso.clients.wiki; // 默认使用wiki
    }

    if (!clientConfig.callbackUrl) {
      throw new Error(
        `SSO client '${targetSystem}' callback URL is not configured.`,
      );
    }

    return `${clientConfig.callbackUrl}?token=${token}`;
  }
}
