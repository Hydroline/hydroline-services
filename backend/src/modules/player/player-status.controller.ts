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
  ApiBearerAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import { PlayerStatusService } from './player-status.service';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, SuccessMessage } from '../core/decorators';
import {
  CreatePlayerStatusDto,
  UpdatePlayerStatusDto,
  PlayerStatusWithCountDto,
  MessageResponseDto,
} from './dto';
import { ApiStandardResponses } from '../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../common/dto';

@ApiTags('玩家状态')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  PlayerStatusWithCountDto,
  MessageResponseDto,
)
@Controller('player-statuses')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerStatusController {
  constructor(private readonly playerStatusService: PlayerStatusService) {}

  @ApiOperation({ summary: '获取所有玩家状态' })
  @ApiStandardResponses(PlayerStatusWithCountDto, '状态列表获取成功')
  @Get()
  @Permissions('player:read')
  async findAll() {
    return await this.playerStatusService.findAll();
  }

  @ApiOperation({ summary: '根据ID获取玩家状态' })
  @ApiStandardResponses(PlayerStatusWithCountDto, '状态信息获取成功')
  @Get(':id')
  @Permissions('player:read')
  async findOne(@Param('id') id: string) {
    return await this.playerStatusService.findOne(id);
  }

  @ApiOperation({ summary: '创建新的玩家状态' })
  @ApiStandardResponses(PlayerStatusWithCountDto, '状态创建成功')
  @Post()
  @Permissions('player:admin')
  @SuccessMessage('状态创建成功')
  async create(@Body() createDto: CreatePlayerStatusDto) {
    return await this.playerStatusService.create(createDto);
  }

  @ApiOperation({ summary: '更新玩家状态' })
  @ApiStandardResponses(PlayerStatusWithCountDto, '状态更新成功')
  @Put(':id')
  @Permissions('player:admin')
  @SuccessMessage('状态更新成功')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlayerStatusDto,
  ) {
    return await this.playerStatusService.update(id, updateDto);
  }

  @ApiOperation({ summary: '删除玩家状态' })
  @ApiStandardResponses(MessageResponseDto, '状态删除成功')
  @Delete(':id')
  @Permissions('player:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('状态删除成功')
  async remove(@Param('id') id: string) {
    return await this.playerStatusService.remove(id);
  }
}
