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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerContactService } from './player-contact.service';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('玩家管理')
@ApiBearerAuth('JWT')
@Controller('player-contact')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlayerContactController {
  constructor(private readonly playerContactService: PlayerContactService) {}

  @Get(':playerId')
  @ApiOperation({ summary: '获取指定玩家的联系信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('player:read')
  async findByPlayerId(@Param('playerId') playerId: string) {
    return await this.playerContactService.findByPlayer(playerId);
  }

  @Post()
  @ApiOperation({ summary: '创建玩家联系信息' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('player:write')
  async create(@Body() createContactDto: any) {
    return await this.playerContactService.create(createContactDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新玩家联系信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '联系信息不存在' })
  @Permissions('player:write')
  async update(@Param('id') id: string, @Body() updateContactDto: any) {
    return await this.playerContactService.update(id, updateContactDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除玩家联系信息' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '联系信息不存在' })
  @Permissions('player:write')
  async remove(@Param('id') id: string) {
    return await this.playerContactService.remove(id);
  }
} 