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
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser } from '../core/decorators';

@ApiTags('权限管理')
@Controller('permissions')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @Permissions('role:admin')
  @ApiOperation({ summary: '创建新权限' })
  create(@Body() createDto: CreatePermissionDto, @CurrentUser() user) {
    return this.permissionService.create(createDto, user.id);
  }

  @Get()
  @Permissions('role:read')
  @ApiOperation({ summary: '查询权限列表' })
  findAll(@Query() query: QueryPermissionDto) {
    return this.permissionService.findAll(query);
  }

  @Get('resources')
  @ApiOperation({ summary: '获取资源类型列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('permission:read')
  getResources() {
    return this.permissionService.getResources();
  }

  @Get('actions')
  @ApiOperation({ summary: '获取操作类型列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('permission:read')
  getActions() {
    return this.permissionService.getActions();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取权限详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:read')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @Permissions('role:admin')
  @ApiOperation({ summary: '更新权限' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
    @CurrentUser() user,
  ) {
    return this.permissionService.update(id, updateDto, user.id);
  }

  @Delete(':id')
  @Permissions('role:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除权限' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.permissionService.remove(id, user.id);
  }
}
