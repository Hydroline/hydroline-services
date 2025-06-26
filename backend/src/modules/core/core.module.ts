import { Module, Global } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RbacGuard } from '../../common/guards';

@Global()
@Module({
  imports: [AuthModule],
  providers: [RbacGuard],
  exports: [AuthModule, RbacGuard],
})
export class CoreModule {}
