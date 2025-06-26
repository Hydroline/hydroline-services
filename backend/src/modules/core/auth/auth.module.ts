import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { MicrosoftStrategy } from './oauth.strategy';
import { SSOService } from './sso.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { PlayerModule } from '../../player/player.module';
import config from '../../../config';

// 动态providers数组
const dynamicProviders = [AuthService, JwtStrategy, SSOService];

// 只在OAuth启用时添加Microsoft策略
if (config.oauth.providers.microsoft.enabled) {
  try {
    const { MicrosoftStrategy } = require('./oauth.strategy');
    dynamicProviders.push(MicrosoftStrategy);
  } catch (error) {
    console.warn(
      'Microsoft OAuth strategy disabled due to configuration error:',
      error.message,
    );
  }
}

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    forwardRef(() => PlayerModule),
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: dynamicProviders,
  exports: [AuthService, SSOService],
})
export class AuthModule {}
