import { IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: '头像URL', required: false })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  @IsUrl({}, { message: '头像URL格式不正确' })
  avatarUrl?: string;

  @ApiProperty({ description: '显示名称', required: false })
  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  displayName?: string;

  @ApiProperty({ description: '个人简介', required: false })
  @IsOptional()
  @IsString({ message: '个人简介必须是字符串' })
  bio?: string;

  @ApiProperty({ description: '个人设置（JSON格式）', required: false })
  @IsOptional()
  preferences?: any;
}
