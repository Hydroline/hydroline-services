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
import { PlayerTypeService } from './player-type.service';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('玩家管理')
@ApiBearerAuth('JWT')
@Controller('player-type')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PlayerTypeController {
  constructor(private readonly playerTypeService: PlayerTypeService) {}

  @Get()
  @ApiOperation({ summary: '获取所有玩家类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @Permissions('player:read')
  async findAll() {
    return await this.playerTypeService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取玩家类型' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '类型不存在' })
  @Permissions('player:read')
  async findOne(@Param('id') id: string) {
    return await this.playerTypeService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '创建新玩家类型' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Permissions('player:write')
  async create(@Body() createTypeDto: any) {
    return await this.playerTypeService.create(createTypeDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新玩家类型' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '类型不存在' })
  @Permissions('player:write')
  async update(@Param('id') id: string, @Body() updateTypeDto: any) {
    return await this.playerTypeService.update(id, updateTypeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除玩家类型' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '类型不存在' })
  @Permissions('player:write')
  async remove(@Param('id') id: string) {
    return await this.playerTypeService.remove(id);
  }
} 