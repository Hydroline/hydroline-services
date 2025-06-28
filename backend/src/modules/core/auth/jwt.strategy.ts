import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import config from '../../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: any) {
    try {
      // 验证 payload 基本结构
      if (!payload || typeof payload !== 'object') {
        throw new UnauthorizedException('无效的令牌格式');
      }

      const user = await this.authService.validateJwtPayload(payload);
      if (!user) {
        throw new UnauthorizedException('用户不存在或已被禁用');
      }

      // 确保返回的用户数据结构完整
      if (!user.id || !user.username) {
        throw new UnauthorizedException('用户数据不完整');
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('令牌验证失败');
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
