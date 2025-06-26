import {
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: '用户名或邮箱',
    example: 'user@example.com',
    minLength: 3,
    maxLength: 100,
  })
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度不能少于3位' })
  @MaxLength(100, { message: '用户名长度不能超过100位' })
  @Matches(/^[a-zA-Z0-9_@.-]+$/, {
    message: '用户名只能包含字母、数字、下划线、@、点和横线',
  })
  username: string;

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
}
