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
      const payload = await this.jwtService.verify(token, {
        secret: config.jwt.secret,
      });

      if (payload.type !== 'sso') {
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
    const redirectMap = {
      wiki: config.sso.wiki,
      forum: config.sso.forum,
      'media-wiki': config.sso.mediaWiki,
    };

    const baseUrl = redirectMap[targetSystem] || redirectMap.wiki;
    return `${baseUrl}?token=${token}`;
  }
}
