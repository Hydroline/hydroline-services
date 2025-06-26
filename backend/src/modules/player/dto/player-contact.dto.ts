import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePlayerContactDto {
  @ApiProperty({ description: '联系方式类型', example: 'QQ' })
  @IsString()
  @IsNotEmpty()
  contactType: string;

  @ApiProperty({ description: '联系方式内容', example: '10001' })
  @IsString()
  @IsNotEmpty()
  contactValue: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// Update DTO is often similar but with all fields optional
export class UpdatePlayerContactDto {
  @ApiPropertyOptional({ description: '联系方式类型', example: 'QQ' })
  @IsString()
  @IsOptional()
  contactType?: string;

  @ApiPropertyOptional({ description: '联系方式内容', example: '10001' })
  @IsString()
  @IsOptional()
  contactValue?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}
