import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// 基础用户信息
export class UserInfoDto {
  @ApiProperty({ description: '用户ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'steve_minecraft' })
  username: string;

  @ApiProperty({
    description: '邮箱',
    example: 'steve@example.com',
    nullable: true,
  })
  email: string | null;

  @ApiProperty({ description: '显示名称', example: 'Steve' })
  displayName: string;

  @ApiProperty({ description: '是否激活', example: true })
  isActive: boolean;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;
}

// 玩家状态
export class PlayerStatusDto {
  @ApiProperty({ description: '状态ID', example: 'status-123' })
  id: string;

  @ApiProperty({ description: '状态名称', example: '观战' })
  name: string;

  @ApiProperty({ description: '状态描述', example: '观战模式玩家' })
  description: string;

  @ApiProperty({ description: '颜色代码', example: '#808080' })
  color: string;

  @ApiProperty({ description: '是否为默认状态', example: false })
  isDefault: boolean;

  @ApiProperty({ description: '排序权重', example: 1 })
  sortOrder: number;
}

// 玩家类型
export class PlayerTypeDto {
  @ApiProperty({ description: '类型ID', example: 'type-123' })
  id: string;

  @ApiProperty({ description: '类型名称', example: '建筑师' })
  name: string;

  @ApiProperty({ description: '类型描述', example: '专注建筑的玩家' })
  description: string;

  @ApiProperty({
    description: '权限集',
    example: { canFly: true, canBuild: true },
  })
  permissions: Record<string, any>;

  @ApiProperty({ description: '是否为默认类型', example: false })
  isDefault: boolean;

  @ApiProperty({ description: '排序权重', example: 1 })
  sortOrder: number;
}

// 玩家联系信息
export class PlayerContactDto {
  @ApiProperty({ description: '联系信息ID', example: 'contact-123' })
  id: string;

  @ApiProperty({ description: '联系方式类型', example: 'QQ' })
  contactType: string;

  @ApiProperty({ description: '联系方式内容', example: '10001' })
  contactValue: string;

  @ApiProperty({ description: '是否为主要联系方式', example: true })
  isPrimary: boolean;

  @ApiProperty({ description: '是否已验证', example: false })
  isVerified: boolean;

  @ApiProperty({ description: '备注', example: '主要联系方式', nullable: true })
  note: string | null;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;
}

// 备用ID
export class AlternativeIdDto {
  @ApiProperty({ description: 'ID', example: 'alt-123' })
  id: string;

  @ApiProperty({ description: '备用玩家ID', example: 'old-uuid-123' })
  altId: string;

  @ApiProperty({ description: '备用昵称', example: 'OldSteve' })
  altNick: string;

  @ApiProperty({ description: '备注', example: '旧账号ID' })
  note: string;

  @ApiProperty({ description: '是否已验证', example: true })
  isVerified: boolean;
}

// 完整的玩家信息
export class PlayerDto {
  @ApiProperty({ description: '玩家记录ID', example: 'player-record-123' })
  id: string;

  @ApiProperty({
    description: 'Minecraft玩家UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  playerId: string;

  @ApiProperty({ description: 'Minecraft玩家昵称', example: 'Steve' })
  playerNick: string;

  @ApiProperty({ description: '用户信息', type: UserInfoDto })
  user: UserInfoDto;

  @ApiProperty({ description: '玩家状态', type: PlayerStatusDto })
  status: PlayerStatusDto;

  @ApiProperty({ description: '玩家类型', type: PlayerTypeDto })
  type: PlayerTypeDto;

  @ApiProperty({ description: '联系信息列表', type: [PlayerContactDto] })
  contactInfos: PlayerContactDto[];

  @ApiProperty({ description: '备用ID列表', type: [AlternativeIdDto] })
  alternativeIds: AlternativeIdDto[];

  @ApiProperty({ description: '加入时间', example: '2023-12-01T10:00:00Z' })
  joinedAt: string;

  @ApiProperty({
    description: '最后在线时间',
    example: '2023-12-15T12:00:00Z',
    nullable: true,
  })
  lastSeenAt: string | null;

  @ApiProperty({ description: '是否激活', example: true })
  isActive: boolean;

  @ApiProperty({
    description: '扩展元数据',
    example: { skin: 'default', cape: 'none' },
  })
  metadata: Record<string, any>;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: '更新时间', example: '2023-12-01T10:00:00Z' })
  updatedAt: string;
}

// 分页数据
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

// 玩家列表响应
export class PlayerListDto {
  @ApiProperty({ description: '玩家列表', type: [PlayerDto] })
  data: PlayerDto[];

  @ApiProperty({ description: '分页信息', type: PaginationDto })
  pagination: PaginationDto;
}

// 状态列表响应（包含统计信息）
export class PlayerStatusWithCountDto extends PlayerStatusDto {
  @ApiProperty({ description: '使用此状态的玩家数量', example: 5 })
  _count: { players: number };
}

// 类型列表响应（包含统计信息）
export class PlayerTypeWithCountDto extends PlayerTypeDto {
  @ApiProperty({ description: '使用此类型的玩家数量', example: 10 })
  _count: { players: number };
}

// 简单消息响应
export class MessageResponseDto {
  @ApiProperty({ description: '操作结果消息', example: '操作成功' })
  message: string;
}
