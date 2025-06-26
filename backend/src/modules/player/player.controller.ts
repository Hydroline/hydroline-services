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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { QueryPlayerDto } from './dto/query-player.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser, SuccessMessage } from '../core/decorators';

@ApiTags('玩家管理')
@Controller('players')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Post()
  @Permissions('player:write')
  @ApiOperation({ summary: '创建新玩家' })
  @SuccessMessage('玩家创建成功')
  create(@Body() createPlayerDto: CreatePlayerDto, @CurrentUser() user) {
    return this.playerService.create(createPlayerDto, user.id);
  }

  @Get()
  @Permissions('player:read')
  @ApiOperation({ summary: '查询玩家列表' })
  findAll(@Query() query: QueryPlayerDto) {
    return this.playerService.findMany(query);
  }

  @Get('me')
  @ApiOperation({ summary: '获取当前登录玩家的信息' })
  getProfile(@CurrentUser() user) {
    return this.playerService.findOne(user.id);
  }

  @Patch('me/password')
  @ApiOperation({ summary: '修改当前玩家密码' })
  @SuccessMessage('密码修改成功')
  changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.playerService.changePassword(user.id, changePasswordDto);
  }

  @Get(':id')
  @Permissions('player:read')
  @ApiOperation({ summary: '根据ID获取单个玩家信息' })
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }

  @Patch(':id')
  @Permissions('player:write')
  @ApiOperation({ summary: '更新玩家信息' })
  @SuccessMessage('玩家信息更新成功')
  update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
    @CurrentUser() user,
  ) {
    return this.playerService.update(id, updatePlayerDto, user.id);
  }

  @Delete(':id')
  @Permissions('player:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除玩家' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.playerService.remove(id, user.id);
  }
}
