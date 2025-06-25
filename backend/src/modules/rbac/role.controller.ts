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
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { JwtAuthGuard } from '../core/auth/jwt.strategy';
import { PermissionsGuard } from '../core/guards/roles.guard';
import { Permissions } from '../core/decorators/roles.decorator';

@ApiTags('角色管理')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '角色创建成功' })
  @Permissions('role:write')
  create(@Body() createRoleDto: CreateRoleDto, @Request() req) {
    return this.roleService.create(createRoleDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('role:read')
  findAll(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:read')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新角色' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:write')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Request() req) {
    return this.roleService.update(id, updateRoleDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:delete')
  remove(@Param('id') id: string, @Request() req) {
    return this.roleService.remove(id, req.user.id);
  }

  @Post(':id/permissions')
  @ApiOperation({ summary: '为角色分配权限' })
  @ApiResponse({ status: 200, description: '权限分配成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:write')
  assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
    @Request() req,
  ) {
    return this.roleService.assignPermissions(id, body.permissionIds, req.user.id);
  }

  @Post(':id/users')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: 200, description: '角色分配成功' })
  @ApiParam({ name: 'id', description: '角色ID' })
  @Permissions('role:assign')
  assignToUsers(
    @Param('id') id: string,
    @Body() assignRoleDto: AssignRoleDto,
    @Request() req,
  ) {
    return this.roleService.assignToUsers(id, assignRoleDto, req.user.id);
  }

  @Delete(':roleId/users/:userId')
  @ApiOperation({ summary: '移除用户角色' })
  @ApiResponse({ status: 200, description: '角色移除成功' })
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @Permissions('role:assign')
  removeFromUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.roleService.removeFromUser(roleId, userId, req.user.id);
  }
} 