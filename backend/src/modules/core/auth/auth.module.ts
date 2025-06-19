import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SSOService } from './sso.service';
import { JwtStrategy } from './jwt.strategy';
import { MicrosoftStrategy } from './oauth.strategy';

import config from '../../../config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SSOService, JwtStrategy, MicrosoftStrategy],
  exports: [AuthService, SSOService, JwtStrategy],
})
export class AuthModule {}
