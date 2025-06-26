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
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RoleService } from './role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  QueryRoleDto,
  AssignRoleDto,
  RoleDto,
  RoleWithDetailsDto,
  RoleListDto,
  PermissionDto,
  MessageResponseDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser, SuccessMessage } from '../core/decorators';
import { ApiStandardResponses } from '../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../common/dto';

@ApiTags('角色管理')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  RoleDto,
  RoleWithDetailsDto,
  RoleListDto,
  PermissionDto,
  MessageResponseDto,
)
@Controller('roles')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @ApiOperation({ summary: '创建新角色' })
  @ApiStandardResponses(RoleWithDetailsDto, '角色创建成功')
  @Post()
  @Permissions('role:admin')
  @SuccessMessage('角色创建成功')
  create(@Body() createDto: CreateRoleDto, @CurrentUser() user) {
    return this.roleService.create(createDto, user.id);
  }

  @ApiOperation({ summary: '获取角色列表' })
  @ApiStandardResponses(RoleListDto, '角色列表获取成功')
  @Get()
  @Permissions('rbac:read')
  find(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @ApiOperation({ summary: '获取单个角色信息' })
  @ApiStandardResponses(RoleWithDetailsDto, '角色信息获取成功')
  @Get(':id')
  @Permissions('rbac:read')
  findOne(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: '更新角色信息' })
  @ApiStandardResponses(RoleWithDetailsDto, '角色更新成功')
  @Patch(':id')
  @Permissions('rbac:write')
  @SuccessMessage('角色更新成功')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @CurrentUser() user,
  ) {
    return this.roleService.update(id, updateRoleDto, user.id);
  }

  @ApiOperation({ summary: '删除角色' })
  @ApiStandardResponses(MessageResponseDto, '角色删除成功')
  @Delete(':id')
  @Permissions('rbac:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('角色删除成功')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.roleService.remove(id, user.id);
  }

  @ApiOperation({ summary: '为多个用户分配角色' })
  @ApiStandardResponses(MessageResponseDto, '角色分配成功')
  @Post(':roleId/assign')
  @Permissions('rbac:assign')
  @HttpCode(HttpStatus.OK)
  @SuccessMessage('角色分配成功')
  assignToUsers(
    @Param('roleId') roleId: string,
    @Body() assignDto: AssignRoleDto,
    @CurrentUser() user,
  ) {
    return this.roleService.assignToUsers(roleId, assignDto, user.id);
  }

  @ApiOperation({ summary: '为角色分配权限' })
  @ApiStandardResponses(RoleWithDetailsDto, '权限分配成功')
  @Post(':id/permissions')
  @Permissions('role:admin')
  @SuccessMessage('权限分配成功')
  assignPermissions(
    @Param('id') id: string,
    @Body() body: { permissionIds: string[] },
    @CurrentUser() user,
  ) {
    return this.roleService.assignPermissions(id, body.permissionIds, user.id);
  }

  @ApiOperation({ summary: '获取角色的权限' })
  @ApiStandardResponses(PermissionDto, '角色权限获取成功')
  @Get(':id/permissions')
  @Permissions('role:read')
  getRolePermissions(@Param('id') id: string) {
    return this.roleService.getPermissions(id);
  }

  @ApiOperation({ summary: '移除用户角色' })
  @ApiStandardResponses(MessageResponseDto, '角色移除成功')
  @ApiParam({ name: 'roleId', description: '角色ID' })
  @ApiParam({ name: 'userId', description: '用户ID' })
  @Delete(':roleId/users/:userId')
  @Permissions('role:assign')
  @SuccessMessage('角色移除成功')
  removeFromUser(
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
    @CurrentUser() user,
  ) {
    return this.roleService.removeFromUser(roleId, userId, user.id);
  }
}
