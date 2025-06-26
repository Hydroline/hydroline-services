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
import { PermissionService } from './permission.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionDto,
  PermissionDto,
  PermissionWithRolesDto,
  PermissionListDto,
  ResourceListDto,
  ActionListDto,
  MessageResponseDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions, CurrentUser, SuccessMessage } from '../core/decorators';
import { ApiStandardResponses } from '../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../common/dto';

@ApiTags('权限管理')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  PermissionDto,
  PermissionWithRolesDto,
  PermissionListDto,
  ResourceListDto,
  ActionListDto,
  MessageResponseDto,
)
@Controller('permissions')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @ApiOperation({ summary: '创建新权限' })
  @ApiStandardResponses(PermissionDto, '权限创建成功')
  @Post()
  @Permissions('permission:admin')
  @SuccessMessage('权限创建成功')
  create(@Body() createPermissionDto: CreatePermissionDto, @CurrentUser() user) {
    return this.permissionService.create(createPermissionDto, user.id);
  }

  @ApiOperation({ summary: '获取权限列表' })
  @ApiStandardResponses(PermissionListDto, '权限列表获取成功')
  @Get()
  @Permissions('permission:read')
  getPermissions(@Query() query: QueryPermissionDto) {
    return this.permissionService.findAll(query);
  }

  @ApiOperation({ summary: '获取指定权限信息' })
  @ApiStandardResponses(PermissionWithRolesDto, '权限信息获取成功')
  @Get(':id')
  @Permissions('permission:read')
  getPermission(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @ApiOperation({ summary: '获取资源列表' })
  @ApiStandardResponses(ResourceListDto, '资源列表获取成功')
  @Get('resources/list')
  @Permissions('permission:read')
  getResources() {
    return this.permissionService.getResources();
  }

  @ApiOperation({ summary: '获取操作列表' })
  @ApiStandardResponses(ActionListDto, '操作列表获取成功')
  @Get('actions/list')
  @Permissions('permission:read')
  getActions() {
    return this.permissionService.getActions();
  }

  @ApiOperation({ summary: '更新权限信息' })
  @ApiStandardResponses(PermissionDto, '权限更新成功')
  @Patch(':id')
  @Permissions('permission:write')
  @SuccessMessage('权限更新成功')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
    @CurrentUser() user,
  ) {
    return this.permissionService.update(id, updatePermissionDto, user.id);
  }

  @ApiOperation({ summary: '删除权限' })
  @ApiStandardResponses(MessageResponseDto, '权限删除成功')
  @Delete(':id')
  @Permissions('permission:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('权限删除成功')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.permissionService.remove(id, user.id);
  }
}
