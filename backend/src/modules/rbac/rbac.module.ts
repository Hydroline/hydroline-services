import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { PermissionController } from './permission.controller';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [RoleController, PermissionController],
  providers: [RoleService, PermissionService],
  exports: [RoleService, PermissionService],
})
export class RbacModule {}
