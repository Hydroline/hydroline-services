import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsHexColor,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreatePlayerStatusDto {
  @ApiProperty({ description: '状态名称', example: '观战' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '状态描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '颜色代码', example: '#808080' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: '是否为默认状态' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdatePlayerStatusDto {
  @ApiPropertyOptional({ description: '状态名称', example: '观战' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: '状态描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '颜色代码', example: '#808080' })
  @IsHexColor()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: '是否为默认状态' })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: '排序权重' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
