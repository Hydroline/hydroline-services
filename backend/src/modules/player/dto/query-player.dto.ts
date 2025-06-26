import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsNumberString,
  IsEnum,
  IsUUID,
} from 'class-validator';

export enum PlayerSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  JOINED_AT = 'joinedAt',
  LAST_SEEN_AT = 'lastSeenAt',
  PLAYER_NICK = 'playerNick',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryPlayerDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumberString({}, { message: '页码必须是数字' })
  page?: string;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsNumberString({}, { message: '每页数量必须是数字' })
  limit?: string;

  @ApiPropertyOptional({
    description: '搜索关键词（支持玩家昵称、ID）',
    example: 'Steve',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: '玩家状态ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: '状态ID必须是有效的UUID格式' })
  statusId?: string;

  @ApiPropertyOptional({
    description: '玩家类型ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: '类型ID必须是有效的UUID格式' })
  typeId?: string;

  @ApiPropertyOptional({
    description: '关联用户ID过滤',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsOptional()
  @IsString()
  @IsUUID('4', { message: '用户ID必须是有效的UUID格式' })
  userId?: string;

  @ApiPropertyOptional({
    description: '是否激活过滤',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: PlayerSortBy,
    example: PlayerSortBy.CREATED_AT,
    default: PlayerSortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(PlayerSortBy, { message: '排序字段无效' })
  sortBy?: PlayerSortBy;

  @ApiPropertyOptional({
    description: '排序方向',
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: '排序方向无效' })
  sortOrder?: SortOrder;

  @ApiPropertyOptional({
    description: '开始时间过滤（joinedAt）',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '结束时间过滤（joinedAt）',
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
