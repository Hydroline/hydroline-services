import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsUUID,
  IsBoolean,
  MinLength,
  IsNotEmpty,
  IsDateString,
  IsObject,
} from 'class-validator';

export class CreatePlayerDto {
  // ========== 用户账户信息 ==========

  @ApiProperty({
    description: '用户名（登录用）',
    example: 'steve_minecraft',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiPropertyOptional({
    description: '邮箱地址',
    example: 'steve@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: '登录密码',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: '密码长度至少6位' })
  @IsOptional()
  password?: string;

  // ========== Minecraft玩家信息 ==========

  @ApiPropertyOptional({
    description: 'Minecraft玩家UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsOptional()
  playerId?: string;

  @ApiPropertyOptional({
    description: 'Minecraft玩家昵称',
    example: 'Steve',
  })
  @IsString()
  @IsOptional()
  playerNick?: string;

  @ApiPropertyOptional({
    description: '玩家状态ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  statusId?: string;

  @ApiPropertyOptional({
    description: '玩家类型ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  @IsUUID()
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional({
    description: '加入时间',
    example: '2024-01-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  joinedAt?: string;

  @ApiPropertyOptional({
    description: '最后在线时间',
    example: '2024-01-15T12:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  lastSeenAt?: string;

  @ApiPropertyOptional({
    description: '是否激活',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: '扩展元数据',
    example: { skin: 'default', cape: 'none' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
