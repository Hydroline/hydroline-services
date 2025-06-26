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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlayerStatusService } from './player-status.service';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { RbacGuard } from '../core/guards';
import { Permissions } from '../core/decorators';
import {
  CreatePlayerStatusDto,
  UpdatePlayerStatusDto,
} from './dto/player-status.dto';

@ApiTags('玩家状态')
@Controller('player-statuses')
@UseGuards(JwtAuthGuard, RbacGuard)
@ApiBearerAuth()
export class PlayerStatusController {
  constructor(private readonly playerStatusService: PlayerStatusService) {}

  @Get()
  @Permissions('player:read')
  @ApiOperation({ summary: '获取所有玩家状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
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
  @Permissions('player:admin')
  @ApiOperation({ summary: '创建新的玩家状态' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() createDto: CreatePlayerStatusDto) {
    return await this.playerStatusService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新玩家状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '状态不存在' })
  @Permissions('player:admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlayerStatusDto,
  ) {
    return await this.playerStatusService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('player:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除玩家状态' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '状态不存在' })
  async remove(@Param('id') id: string) {
    return await this.playerStatusService.remove(id);
  }
}
