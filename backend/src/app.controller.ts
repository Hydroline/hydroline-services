import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import {
  ApiTags,
  ApiOperation,
  ApiExtraModels,
  ApiProperty,
} from '@nestjs/swagger';
import { SuccessMessage } from './common';
import { ApiStandardResponses, SuccessResponseDto, ErrorResponseDto } from './common';

export class ServerInfoDto {
  @ApiProperty({
    description: '服务名称',
    example: 'Hydroline Services',
  })
  name: string;

  @ApiProperty({
    description: '服务版本',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: '服务描述',
    example: 'Minecraft 服务器聚合信息服务平台',
  })
  description: string;

  @ApiProperty({
    description: '环境',
    example: 'development',
    enum: ['development', 'production', 'test'],
  })
  environment: string;

  @ApiProperty({
    description: '服务器启动时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  uptime: string;

  @ApiProperty({
    description: 'Node.js 版本',
    example: 'v18.17.0',
  })
  nodeVersion: string;

  @ApiProperty({
    description: '服务状态',
    example: 'healthy',
    enum: ['healthy', 'degraded', 'unhealthy'],
  })
  status: string;

  @ApiProperty({
    description: '可用功能模块',
    example: ['auth', 'player', 'audit', 'rbac', 'minecraft'],
    type: [String],
  })
  features: string[];
}

@ApiTags('项目状态')
@ApiExtraModels(SuccessResponseDto, ErrorResponseDto, ServerInfoDto)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('server-info')
  @ApiOperation({
    summary: '获取服务器信息',
    description: '获取当前服务器的基本信息，包括版本、环境、运行状态等',
  })
  @ApiStandardResponses(ServerInfoDto, '服务器信息获取成功')
  @SuccessMessage('服务器信息获取成功')
  getServerInfo() {
    return this.appService.getServerInfo();
  }
}
