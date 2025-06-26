import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: '用户名',
    example: 'steve_minecraft',
    minLength: 3,
    maxLength: 50,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3位' })
  @MaxLength(50, { message: '用户名长度不能超过50位' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: '用户名只能包含字母、数字、下划线和横线',
  })
  username: string;

  @ApiPropertyOptional({
    description: '邮箱地址',
    example: 'steve@example.com',
  })
  @IsEmail({}, { message: '邮箱格式不正确' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: '密码',
    example: 'password123',
    minLength: 6,
    maxLength: 128,
  })
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度不能少于6位' })
  @MaxLength(128, { message: '密码长度不能超过128位' })
  password: string;

  @ApiPropertyOptional({
    description: '显示名称',
    example: 'Steve',
  })
  @IsString({ message: '显示名称必须是字符串' })
  @IsOptional()
  displayName?: string;

  @ApiPropertyOptional({
    description: 'Minecraft 玩家 UUID（可选）',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'Minecraft UUID 必须是字符串' })
  @IsOptional()
  minecraftUuid?: string;

  @ApiPropertyOptional({
    description: 'Minecraft 玩家昵称（可选）',
    example: 'Steve',
  })
  @IsString({ message: 'Minecraft 昵称必须是字符串' })
  @IsOptional()
  minecraftNick?: string;
} 