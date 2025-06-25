import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';
import config from '../../../config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private readonly authService: AuthService) {
    const microsoftConfig = config.oauth.providers.microsoft;
    
    // 检查Microsoft OAuth是否已启用和配置
    if (!microsoftConfig.enabled) {
      throw new Error('Microsoft OAuth is not enabled. Please set OAUTH_MICROSOFT_ENABLED=true in your configuration.');
    }

    if (!microsoftConfig.clientId || !microsoftConfig.clientSecret) {
      throw new Error('Microsoft OAuth credentials are not configured. Please set OAUTH_MICROSOFT_CLIENT_ID and OAUTH_MICROSOFT_CLIENT_SECRET.');
    }

    super({
      authorizationURL:
        'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      clientID: microsoftConfig.clientId,
      clientSecret: microsoftConfig.clientSecret,
      callbackURL: microsoftConfig.callbackURL,
      scope: ['user.read'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ) {
    // 从Microsoft Graph API获取用户信息
    const userInfo = await this.getUserInfo(accessToken);

    // 使用身份验证服务验证或创建用户
    return this.authService.validateOAuthUser({
      provider: 'microsoft',
      providerId: userInfo.id,
      email: userInfo.mail || userInfo.userPrincipalName,
      displayName: userInfo.displayName,
      accessToken,
      refreshToken,
    });
  }

  private async getUserInfo(accessToken: string) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.json();
  }
}
