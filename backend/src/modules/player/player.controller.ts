import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { QueryPlayerDto } from './dto/query-player.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('玩家管理')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  // ========== 个人账户相关接口 ==========
  
  @Get('me')
  @ApiOperation({ summary: '获取当前玩家信息' })
  @ApiResponse({ status: 200, description: '成功获取玩家信息' })
  getMyProfile(@Request() req) {
    return this.playerService.findOne(req.user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: '更新当前玩家信息' })
  @ApiResponse({ status: 200, description: '玩家信息更新成功' })
  updateMyProfile(@Request() req, @Body() updatePlayerDto: UpdatePlayerDto) {
    return this.playerService.update(req.user.id, updatePlayerDto, req.user.id);
  }

  @Patch('me/password')
  @ApiOperation({ summary: '修改当前玩家密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.playerService.changePassword(req.user.id, changePasswordDto);
  }

  // ========== 管理员功能 ==========

  @Post()
  @ApiOperation({ summary: '创建新玩家（管理员）' })
  @ApiResponse({ status: 201, description: '玩家创建成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:write')
  create(@Body() createPlayerDto: CreatePlayerDto, @Request() req) {
    return this.playerService.create(createPlayerDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '查询玩家列表（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:read')
  findAll(@Query() query: QueryPlayerDto) {
    return this.playerService.findMany(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定玩家信息（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:read')
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新玩家信息（管理员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:write')
  update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
    @Request() req,
  ) {
    return this.playerService.update(id, updatePlayerDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除玩家（管理员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:delete')
  remove(@Param('id') id: string, @Request() req) {
    return this.playerService.remove(id, req.user.id);
  }

  // ========== 玩家查找接口 ==========

  @Get('by-minecraft-id/:playerId')
  @ApiOperation({ summary: '根据Minecraft ID查找玩家' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(PermissionsGuard)
  @Permissions('player:read')
  findByMinecraftId(@Param('playerId') playerId: string) {
    return this.playerService.findByPlayerId(playerId);
  }
}

// 玩家状态管理控制器
@ApiTags('Player Status')
@Controller('player-status')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlayerStatusController {
  // 这里会在后续实现状态管理的控制器方法
}

// 玩家类型管理控制器
@ApiTags('Player Types')
@Controller('player-types')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlayerTypeController {
  // 这里会在后续实现类型管理的控制器方法
}

// 玩家联系信息管理控制器
@ApiTags('Player Contacts')
@Controller('player-contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlayerContactController {
  // 这里会在后续实现联系信息管理的控制器方法
} 