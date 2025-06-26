import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: '当前密码',
    example: 'oldPassword123',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: '新密码长度至少6位' })
  newPassword: string;
} 