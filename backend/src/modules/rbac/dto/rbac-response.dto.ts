import { ApiProperty } from '@nestjs/swagger';

// 权限信息
export class PermissionDto {
  @ApiProperty({ description: '权限ID', example: 'perm-123' })
  id: string;

  @ApiProperty({ description: '权限名称', example: 'user:read' })
  name: string;

  @ApiProperty({
    description: '权限描述',
    example: '查看用户信息',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: '资源类型', example: 'user' })
  resource: string;

  @ApiProperty({ description: '操作类型', example: 'read' })
  action: string;

  @ApiProperty({ description: '是否为系统权限', example: false })
  isSystem: boolean;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2023-12-01T10:00:00Z' })
  updatedAt: string;
}

// 角色信息（简化版，用于权限中的关联）
export class RoleSimpleDto {
  @ApiProperty({ description: '角色ID', example: 'role-123' })
  id: string;

  @ApiProperty({ description: '角色名称', example: '管理员' })
  name: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员，拥有所有权限',
    nullable: true,
  })
  description: string | null;
}

// 用户信息（简化版，用于角色中的关联）
export class UserSimpleDto {
  @ApiProperty({ description: '用户ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string;

  @ApiProperty({ description: '显示名称', example: '管理员', nullable: true })
  displayName: string | null;

  @ApiProperty({
    description: '邮箱',
    example: 'admin@example.com',
    nullable: true,
  })
  email: string | null;
}

// 带角色信息的权限
export class PermissionWithRolesDto extends PermissionDto {
  @ApiProperty({ description: '使用此权限的角色列表', type: [RoleSimpleDto] })
  roles: RoleSimpleDto[];

  @ApiProperty({ description: '角色数量', example: 3 })
  roleCount: number;
}

// 角色信息
export class RoleDto {
  @ApiProperty({ description: '角色ID', example: 'role-123' })
  id: string;

  @ApiProperty({ description: '角色名称', example: '管理员' })
  name: string;

  @ApiProperty({
    description: '角色描述',
    example: '系统管理员，拥有所有权限',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ description: '优先级', example: 100 })
  priority: number;

  @ApiProperty({ description: '是否为系统角色', example: false })
  isSystem: boolean;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2023-12-01T10:00:00Z' })
  updatedAt: string;
}

// 带权限和用户信息的角色
export class RoleWithDetailsDto extends RoleDto {
  @ApiProperty({ description: '角色权限列表', type: [PermissionDto] })
  permissions: PermissionDto[];

  @ApiProperty({ description: '拥有此角色的用户列表', type: [UserSimpleDto] })
  users: UserSimpleDto[];
}

// 带用户数量的角色（用于列表）
export class RoleWithCountDto extends RoleDto {
  @ApiProperty({ description: '权限列表', type: [PermissionDto] })
  permissions: PermissionDto[];

  @ApiProperty({ description: '用户数量', example: 5 })
  userCount: number;
}

// 分页信息
export class PaginationDto {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  limit: number;

  @ApiProperty({ description: '总条数', example: 100 })
  total: number;

  @ApiProperty({ description: '总页数', example: 5 })
  pages: number;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean;
}

// 权限列表响应
export class PermissionListDto {
  @ApiProperty({
    description: '权限列表',
    type: [PermissionWithRolesDto],
  })
  data: PermissionWithRolesDto[];

  @ApiProperty({ description: '分页信息', type: PaginationDto })
  pagination: PaginationDto;
}

// 角色列表响应
export class RoleListDto {
  @ApiProperty({ description: '角色列表', type: [RoleWithCountDto] })
  data: RoleWithCountDto[];

  @ApiProperty({ description: '分页信息', type: PaginationDto })
  pagination: PaginationDto;
}

// 资源统计
export class ResourceUsageDto {
  @ApiProperty({ description: '资源名称', example: 'user' })
  name: string;

  @ApiProperty({ description: '使用数量', example: 5 })
  count: number;
}

// 资源列表响应
export class ResourceListDto {
  @ApiProperty({
    description: '可用资源类型',
    example: ['user', 'player', 'role', 'permission', 'audit', 'system'],
  })
  available: string[];

  @ApiProperty({ description: '已使用资源统计', type: [ResourceUsageDto] })
  used: ResourceUsageDto[];
}

// 操作列表响应
export class ActionListDto {
  @ApiProperty({
    description: '可用操作类型',
    example: ['read', 'write', 'delete', 'assign', 'admin'],
  })
  available: string[];

  @ApiProperty({ description: '已使用操作统计', type: [ResourceUsageDto] })
  used: ResourceUsageDto[];
}

// 简单消息响应
export class MessageResponseDto {
  @ApiProperty({ description: '操作结果消息', example: '操作成功' })
  message: string;
} 