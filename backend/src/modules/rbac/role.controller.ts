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
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignRoleDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser } from '../core/decorators';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Permissions('role:admin')
  @ApiOperation({ summary: '创建新角色' })
  create(@Body() createDto: CreateRoleDto, @CurrentUser() user) {
    return this.roleService.create(createDto, user.id);
  }

  @Get()
  @Permissions('rbac:read')
  @ApiOperation({ summary: '获取角色列表' })
  find(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  @Permissions('rbac:read')
  @ApiOperation({ summary: '获取单个角色信息' })
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @Patch(':id')
  @Permissions('rbac:write')
  @ApiOperation({ summary: '更新角色信息' })
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user,
  ) {
    return this.roleService.update(id, updateRoleDto, user.id);
  }

  @Delete(':id')
  @Permissions('rbac:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '删除角色' })
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.roleService.remove(id, user.id);
  }

  @Post(':roleId/assign')
  @Permissions('rbac:assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '为多个用户分配角色' })
  assignToUsers(
    @Param('roleId') roleId: string,
    @Body() assignDto: AssignRoleDto,
    @CurrentUser() user,
  ) {
    return this.roleService.assignToUsers(roleId, assignDto, user.id);
  }

  @Post(':id/permissions')
  @Permissions('role:admin')
  @ApiOperation({ summary: '为角色分配权限' })
  assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
    @CurrentUser() user,
  ) {
    return this.roleService.assignPermissions(id, body.permissionIds, user.id);
  }

  @Get(':id/permissions')
  @Permissions('role:read')
  @ApiOperation({ summary: '获取角色的权限' })
  getRolePermissions(@Param('id') id: string) {
    return this.roleService.getPermissions(id);
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
    @CurrentUser() user,
  ) {
    return this.roleService.removeFromUser(roleId, userId, user.id);
  }
}
