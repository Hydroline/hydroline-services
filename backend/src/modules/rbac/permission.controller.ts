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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('权限管理')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ApiOperation({ summary: '创建权限' })
  @ApiResponse({ status: 201, description: '权限创建成功' })
  @Permissions('permission:write')
  create(@Body() createPermissionDto: CreatePermissionDto, @Request() req) {
    return this.permissionService.create(createPermissionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取权限列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('permission:read')
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
  @ApiOperation({ summary: '更新权限' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:write')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Request() req,
  ) {
    return this.permissionService.update(id, updatePermissionDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除权限' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '权限ID' })
  @Permissions('permission:delete')
  remove(@Param('id') id: string, @Request() req) {
    return this.permissionService.remove(id, req.user.id);
  }
} 