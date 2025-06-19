import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';

import { TransformInterceptor } from './interceptors/transform.interceptor';
import { ExceptionInterceptor } from './interceptors/exception.interceptor';
import { RolesGuard } from './guards/roles.guard';

import config from '../../config';

@Global()
@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // JWT模块
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: { expiresIn: config.jwt.expiresIn },
    }),

    // Passport模块
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // 子模块
    AuthModule,
  ],
  providers: [TransformInterceptor, ExceptionInterceptor, RolesGuard],
  exports: [
    JwtModule,
    PassportModule,
    TransformInterceptor,
    ExceptionInterceptor,
    RolesGuard,
    AuthModule,
  ],
})
export class CoreModule {}
