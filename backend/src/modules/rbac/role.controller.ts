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
import { 
  RbacGuard, 
  Permissions, 
  CurrentUser, 
  SuccessMessage,
  ApiStandardResponses,
  SuccessResponseDto, 
  ErrorResponseDto 
} from '../../common';

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
  create(@Body() createRoleDto: CreateRoleDto, @CurrentUser() user) {
    return this.roleService.create(createRoleDto, user.id);
  }

  @ApiOperation({ summary: '获取角色列表' })
  @ApiStandardResponses(RoleListDto, '角色列表获取成功')
  @Get()
  @Permissions('role:read')
  getRoles(@Query() query: QueryRoleDto) {
    return this.roleService.findAll(query);
  }

  @ApiOperation({ summary: '获取指定角色信息' })
  @ApiStandardResponses(RoleWithDetailsDto, '角色信息获取成功')
  @Get(':id')
  @Permissions('role:read')
  getRole(@Param('id') id: string) {
    return this.roleService.findOne(id);
  }

  @ApiOperation({ summary: '更新角色信息' })
  @ApiStandardResponses(RoleWithDetailsDto, '角色更新成功')
  @Patch(':id')
  @Permissions('role:write')
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
  @Permissions('role:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('角色删除成功')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.roleService.remove(id, user.id);
  }

  @ApiOperation({ summary: '为用户分配角色' })
  @ApiStandardResponses(MessageResponseDto, '角色分配成功')
  @Post(':roleId/assign')
  @Permissions('role:assign')
  @SuccessMessage('角色分配成功')
  assignToUsers(
    @Param('roleId') roleId: string,
    @Body() assignRoleDto: AssignRoleDto,
    @CurrentUser() user,
  ) {
    return this.roleService.assignToUsers(roleId, assignRoleDto, user.id);
  }

  @ApiOperation({ summary: '为角色分配权限' })
  @ApiStandardResponses(RoleWithDetailsDto, '权限分配成功')
  @Post(':id/permissions')
  @Permissions('role:assign')
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
