import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreatePlayerTypeDto {
  @ApiProperty({ description: '类型名称', example: '建筑师' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '类型描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: '权限集 (JSON格式)',
    example: { canFly: true },
  })
  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;

  @ApiPropertyOptional({ description: '是否为默认类型' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlayerTypeDto {
  @ApiPropertyOptional({ description: '类型名称' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '类型描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '权限集 (JSON格式)' })
  @IsObject()
  @IsOptional()
  permissions?: Record<string, any>;

  @ApiPropertyOptional({ description: '是否为默认类型' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
