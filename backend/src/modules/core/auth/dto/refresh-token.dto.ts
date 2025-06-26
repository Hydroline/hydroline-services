import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({
    description: '刷新令牌',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: '刷新令牌不能为空' })
  @IsString({ message: '刷新令牌必须是字符串' })
  @MinLength(10, { message: '刷新令牌格式不正确' })
  @Matches(/^[A-Za-z0-9._-]+$/, {
    message: '刷新令牌包含无效字符',
  })
  refreshToken: string;
}
