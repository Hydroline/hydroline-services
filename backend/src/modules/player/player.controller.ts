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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PlayerService } from './player.service';
import {
  CreatePlayerDto,
  UpdatePlayerDto,
  QueryPlayerDto,
  ChangePasswordDto,
  PlayerDto,
  PlayerListDto,
  MessageResponseDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser, SuccessMessage } from '../core/decorators';
import { ApiStandardResponses } from '../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../common/dto';

@ApiTags('玩家管理')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  PlayerDto,
  PlayerListDto,
  MessageResponseDto,
)
@Controller('players')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @ApiOperation({ summary: '创建新玩家' })
  @ApiStandardResponses(PlayerDto, '玩家创建成功')
  @Post()
  @Permissions('player:write')
  @SuccessMessage('玩家创建成功')
  create(@Body() createPlayerDto: CreatePlayerDto, @CurrentUser() user) {
    return this.playerService.create(createPlayerDto, user.id);
  }

  @ApiOperation({ summary: '查询玩家列表' })
  @ApiStandardResponses(PlayerListDto, '玩家列表获取成功')
  @Get()
  @Permissions('player:read')
  findAll(@Query() query: QueryPlayerDto) {
    return this.playerService.findMany(query);
  }

  @ApiOperation({ summary: '获取当前登录玩家的信息' })
  @ApiStandardResponses(PlayerDto, '用户信息获取成功')
  @Get('me')
  getProfile(@CurrentUser() user) {
    return this.playerService.findOne(user.id);
  }

  @ApiOperation({ summary: '修改当前玩家密码' })
  @ApiStandardResponses(MessageResponseDto, '密码修改成功')
  @Patch('me/password')
  @SuccessMessage('密码修改成功')
  changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.playerService.changePassword(user.id, changePasswordDto);
  }

  @ApiOperation({ summary: '根据ID获取单个玩家信息' })
  @ApiStandardResponses(PlayerDto, '玩家信息获取成功')
  @Get(':id')
  @Permissions('player:read')
  findOne(@Param('id') id: string) {
    return this.playerService.findOne(id);
  }

  @ApiOperation({ summary: '更新玩家信息' })
  @ApiStandardResponses(PlayerDto, '玩家信息更新成功')
  @Patch(':id')
  @Permissions('player:write')
  @SuccessMessage('玩家信息更新成功')
  update(
    @Param('id') id: string,
    @Body() updatePlayerDto: UpdatePlayerDto,
    @CurrentUser() user,
  ) {
    return this.playerService.update(id, updatePlayerDto, user.id);
  }

  @ApiOperation({ summary: '删除玩家' })
  @ApiStandardResponses(MessageResponseDto, '玩家删除成功')
  @Delete(':id')
  @Permissions('player:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.playerService.remove(id, user.id);
  }
}
