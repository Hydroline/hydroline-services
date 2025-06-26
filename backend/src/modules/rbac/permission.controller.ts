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
  @Permissions('role:admin')
  @SuccessMessage('权限创建成功')
  create(@Body() createDto: CreatePermissionDto, @CurrentUser() user) {
    return this.permissionService.create(createDto, user.id);
  }

  @ApiOperation({ summary: '查询权限列表' })
  @ApiStandardResponses(PermissionListDto, '权限列表获取成功')
  @Get()
  @Permissions('role:read')
  findAll(@Query() query: QueryPermissionDto) {
    return this.permissionService.findAll(query);
  }

  @ApiOperation({ summary: '获取资源类型列表' })
  @ApiStandardResponses(ResourceListDto, '资源类型列表获取成功')
  @Get('resources')
  @Permissions('permission:read')
  getResources() {
    return this.permissionService.getResources();
  }

  @ApiOperation({ summary: '获取操作类型列表' })
  @ApiStandardResponses(ActionListDto, '操作类型列表获取成功')
  @Get('actions')
  @Permissions('permission:read')
  getActions() {
    return this.permissionService.getActions();
  }

  @ApiOperation({ summary: '获取权限详情' })
  @ApiStandardResponses(PermissionWithRolesDto, '权限详情获取成功')
  @ApiParam({ name: 'id', description: '权限ID' })
  @Get(':id')
  @Permissions('permission:read')
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @ApiOperation({ summary: '更新权限' })
  @ApiStandardResponses(PermissionWithRolesDto, '权限更新成功')
  @Patch(':id')
  @Permissions('role:admin')
  @SuccessMessage('权限更新成功')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
    @CurrentUser() user,
  ) {
    return this.permissionService.update(id, updateDto, user.id);
  }

  @ApiOperation({ summary: '删除权限' })
  @ApiStandardResponses(MessageResponseDto, '权限删除成功')
  @Delete(':id')
  @Permissions('role:admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SuccessMessage('权限删除成功')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.permissionService.remove(id, user.id);
  }
}
