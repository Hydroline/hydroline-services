import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BindExternalAccountDto {
  @ApiProperty({
    description: '外部账号提供商',
    example: 'minecraft',
    enum: ['minecraft', 'microsoft', 'github', 'discord'],
  })
  @IsNotEmpty({ message: '提供商不能为空' })
  @IsString({ message: '提供商必须是字符串' })
  provider: string;

  @ApiProperty({ description: '外部账号ID', example: 'steve123' })
  @IsNotEmpty({ message: '外部账号ID不能为空' })
  @IsString({ message: '外部账号ID必须是字符串' })
  providerUserId: string;

  @ApiProperty({ description: '访问令牌', required: false })
  @IsOptional()
  @IsString({ message: '访问令牌必须是字符串' })
  accessToken?: string;

  @ApiProperty({ description: '刷新令牌', required: false })
  @IsOptional()
  @IsString({ message: '刷新令牌必须是字符串' })
  refreshToken?: string;

  @ApiProperty({ description: '额外元数据', required: false })
  @IsOptional()
  metadata?: any;
}
