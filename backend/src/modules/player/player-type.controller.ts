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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlayerTypeService } from './player-type.service';
import {
  CreatePlayerTypeDto,
  UpdatePlayerTypeDto,
} from './dto/player-type.dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions } from '../core/decorators';

@ApiTags('玩家类型')
@Controller('player-types')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PlayerTypeController {
  constructor(private readonly typeService: PlayerTypeService) {}

  @Post()
  @Permissions('player:admin')
  @ApiOperation({ summary: '创建新的玩家类型' })
  create(@Body() createDto: CreatePlayerTypeDto) {
    return this.typeService.create(createDto);
  }

  @Get()
  @Permissions('player:read')
  @ApiOperation({ summary: '获取所有玩家类型' })
  findAll() {
    return this.typeService.findAll();
  }

  @Patch(':id')
  @Permissions('player:admin')
  @ApiOperation({ summary: '更新玩家类型' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePlayerTypeDto) {
    return this.typeService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('player:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除玩家类型' })
  remove(@Param('id') id: string) {
    return this.typeService.remove(id);
  }
}
