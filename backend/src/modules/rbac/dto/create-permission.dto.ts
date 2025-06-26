import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: '权限名称',
    example: 'user:read',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: '权限描述',
    example: '查看用户信息',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '资源类型',
    example: 'user',
    enum: ['user', 'player', 'role', 'permission', 'audit', 'system'],
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: '操作类型',
    example: 'read',
    enum: ['read', 'write', 'delete', 'assign', 'admin'],
  })
  @IsString()
  @IsNotEmpty()
  action: string;
}
