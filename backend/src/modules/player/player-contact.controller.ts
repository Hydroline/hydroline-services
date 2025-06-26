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
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PlayerContactService } from './player-contact.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard, Permissions, CurrentUser, SuccessMessage } from '../../common';
import {
  CreatePlayerContactDto,
  UpdatePlayerContactDto,
  PlayerContactDto,
  MessageResponseDto,
} from './dto';
import { ApiStandardResponses, SuccessResponseDto, ErrorResponseDto } from '../../common';

@ApiTags('玩家联系')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  PlayerContactDto,
  MessageResponseDto,
)
@Controller('players/:playerId/contacts')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerContactController {
  constructor(private readonly contactService: PlayerContactService) {}

  @ApiOperation({ summary: '为玩家添加联系方式' })
  @ApiStandardResponses(PlayerContactDto, '联系方式添加成功')
  @Post()
  @Permissions('player:write')
  @SuccessMessage('联系方式添加成功')
  create(
    @Param('playerId') playerId: string,
    @Body() createDto: CreatePlayerContactDto,
  ) {
    return this.contactService.create({ ...createDto, playerId });
  }

  @ApiOperation({ summary: '获取玩家的所有联系方式' })
  @ApiStandardResponses(PlayerContactDto, '联系方式列表获取成功')
  @Get()
  @Permissions('player:read')
  findAll(@Param('playerId') playerId: string) {
    return this.contactService.findByPlayer(playerId);
  }

  @ApiOperation({ summary: '更新玩家的联系方式' })
  @ApiStandardResponses(PlayerContactDto, '联系方式更新成功')
  @Patch(':contactId')
  @Permissions('player:write')
  @SuccessMessage('联系方式更新成功')
  update(
    @Param('contactId') contactId: string,
    @Body() updateDto: UpdatePlayerContactDto,
  ) {
    return this.contactService.update(contactId, updateDto);
  }

  @ApiOperation({ summary: '删除玩家的联系方式' })
  @ApiStandardResponses(MessageResponseDto, '联系方式删除成功')
  @Delete(':contactId')
  @Permissions('player:write')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('联系方式删除成功')
  remove(@Param('contactId') contactId: string) {
    return this.contactService.remove(contactId);
  }
}
