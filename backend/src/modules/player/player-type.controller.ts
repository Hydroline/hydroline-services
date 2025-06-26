import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { PlayerTypeService } from './player-type.service';
import {
  CreatePlayerTypeDto,
  UpdatePlayerTypeDto,
  PlayerTypeWithCountDto,
  MessageResponseDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { 
  RbacGuard, 
  Permissions, 
  SuccessMessage,
  ApiStandardResponses,
  SuccessResponseDto, 
  ErrorResponseDto 
} from '../../common';

@ApiTags('玩家类型')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  PlayerTypeWithCountDto,
  MessageResponseDto,
)
@Controller('player-types')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerTypeController {
  constructor(private readonly typeService: PlayerTypeService) {}

  @ApiOperation({ summary: '创建新的玩家类型' })
  @ApiStandardResponses(PlayerTypeWithCountDto, '类型创建成功')
  @Post()
  @Permissions('player:admin')
  @SuccessMessage('类型创建成功')
  create(@Body() createDto: CreatePlayerTypeDto) {
    return this.typeService.create(createDto);
  }

  @ApiOperation({ summary: '获取所有玩家类型' })
  @ApiStandardResponses(PlayerTypeWithCountDto, '类型列表获取成功')
  @Get()
  @Permissions('player:read')
  findAll() {
    return this.typeService.findAll();
  }

  @ApiOperation({ summary: '更新玩家类型' })
  @ApiStandardResponses(PlayerTypeWithCountDto, '类型更新成功')
  @Patch(':id')
  @Permissions('player:admin')
  @SuccessMessage('类型更新成功')
  update(@Param('id') id: string, @Body() updateDto: UpdatePlayerTypeDto) {
    return this.typeService.update(id, updateDto);
  }

  @ApiOperation({ summary: '删除玩家类型' })
  @ApiStandardResponses(MessageResponseDto, '类型删除成功')
  @Delete(':id')
  @Permissions('player:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('类型删除成功')
  remove(@Param('id') id: string) {
    return this.typeService.remove(id);
  }
}
