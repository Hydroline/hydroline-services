import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerContactService } from './player-contact.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser, SuccessMessage } from '../core/decorators';
import {
  CreatePlayerContactDto,
  UpdatePlayerContactDto,
} from './dto/player-contact.dto';

@ApiTags('玩家联系')
@Controller('players/:playerId/contacts')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerContactController {
  constructor(private readonly contactService: PlayerContactService) {}

  @Post()
  @Permissions('player:write')
  @ApiOperation({ summary: '为玩家添加联系方式' })
  create(
    @Param('playerId') playerId: string,
    @Body() createDto: CreatePlayerContactDto,
  ) {
    return this.contactService.create({ ...createDto, playerId });
  }

  @Get()
  @Permissions('player:read')
  @ApiOperation({ summary: '获取玩家的所有联系方式' })
  findAll(@Param('playerId') playerId: string) {
    return this.contactService.findByPlayer(playerId);
  }

  @Patch(':contactId')
  @Permissions('player:write')
  @ApiOperation({ summary: '更新玩家的联系方式' })
  @SuccessMessage('联系方式更新成功')
  update(
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdatePlayerContactDto,
  ) {
    return this.contactService.update(contactId, updateDto);
  }

  @Delete(':contactId')
  @Permissions('player:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除玩家的联系方式' })
  remove(@Param('contactId') contactId: string) {
    return this.contactService.remove(contactId);
  }
}
