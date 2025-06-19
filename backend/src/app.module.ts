import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoreModule } from './modules/core/core.module';
import { AccountModule } from './modules/account/account.module';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Prisma 模块
    PrismaModule,

    // 核心模块
    CoreModule,

    // 业务模块
    AccountModule,
  ],
})
export class AppModule {}
