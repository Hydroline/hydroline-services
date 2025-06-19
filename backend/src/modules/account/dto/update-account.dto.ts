import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
  @ApiProperty({
    description: '用户名',
    example: 'minecraft_player',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '用户名必须是字符串' })
  username?: string;

  @ApiProperty({ description: '密码', example: 'password123', required: false })
  @IsOptional()
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  password?: string;

  @ApiProperty({
    description: '邮箱',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatarUrl?: string;

  @ApiProperty({ description: '是否激活', required: false })
  @IsOptional()
  isActive?: boolean;
}
