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
import { PlayerStatusService } from './player-status.service';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('玩家管理')
@ApiBearerAuth('JWT')
@Controller('player-status')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlayerStatusController {
  constructor(private readonly playerStatusService: PlayerStatusService) {}

  @Get()
  @ApiOperation({ summary: '获取所有玩家状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('player:read')
  async findAll() {
    return await this.playerStatusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取玩家状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '状态不存在' })
  @Permissions('player:read')
  async findOne(@Param('id') id: string) {
    return await this.playerStatusService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建新玩家状态' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('player:write')
  async create(@Body() createStatusDto: any) {
    return await this.playerStatusService.create(createStatusDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新玩家状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '状态不存在' })
  @Permissions('player:write')
  async update(@Param('id') id: string, @Body() updateStatusDto: any) {
    return await this.playerStatusService.update(id, updateStatusDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除玩家状态' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '状态不存在' })
  @Permissions('player:write')
  async remove(@Param('id') id: string) {
    return await this.playerStatusService.remove(id);
  }
} 