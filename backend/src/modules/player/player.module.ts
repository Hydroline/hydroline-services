import { Module, forwardRef } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { PlayerAuditService } from './player-audit.service';
import { PlayerStatusController } from './player-status.controller';
import { PlayerStatusService } from './player-status.service';
import { PlayerTypeController } from './player-type.controller';
import { PlayerTypeService } from './player-type.service';
import { PlayerContactController } from './player-contact.controller';
import { PlayerContactService } from './player-contact.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuditModule),
  ],
  controllers: [
    PlayerController,
    PlayerStatusController,
    PlayerTypeController,
    PlayerContactController,
  ],
  providers: [
    PlayerService,
    PlayerAuditService,
    PlayerStatusService,
    PlayerTypeService,
    PlayerContactService,
  ],
  exports: [PlayerService, PlayerAuditService],
})
export class PlayerModule {} 