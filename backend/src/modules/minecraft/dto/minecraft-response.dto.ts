import { ApiProperty } from '@nestjs/swagger';

// Java 版本信息
export class JavaVersionDto {
  @ApiProperty({ description: '版本名称', example: '1.20.1' })
  name: string;

  @ApiProperty({ description: '协议版本号', example: 763 })
  protocol: number;
}

// 玩家信息样本
export class PlayerSampleDto {
  @ApiProperty({ description: '玩家名称', example: 'Notch' })
  name: string;

  @ApiProperty({ description: '玩家UUID', example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' })
  id: string;
}

// Java 玩家信息
export class JavaPlayersDto {
  @ApiProperty({ description: '最大玩家数', example: 100000 })
  max: number;

  @ApiProperty({ description: '在线玩家数', example: 65432 })
  online: number;

  @ApiProperty({ 
    description: '玩家样本列表', 
    type: [PlayerSampleDto], 
    required: false 
  })
  sample?: PlayerSampleDto[];
}

// Java 服务器描述
export class JavaDescriptionDto {
  @ApiProperty({ description: '服务器描述文本', example: 'Hypixel Network [1.8-1.20]' })
  text: string;

  @ApiProperty({ description: '额外格式信息', required: false })
  extra?: any[];
}

// Java Ping 响应
export class JavaPingResponseDto {
  @ApiProperty({ description: '版本信息', type: JavaVersionDto })
  version: JavaVersionDto;

  @ApiProperty({ description: '玩家信息', type: JavaPlayersDto })
  players: JavaPlayersDto;

  @ApiProperty({ description: '服务器描述', type: JavaDescriptionDto })
  description: JavaDescriptionDto;

  @ApiProperty({ 
    description: '服务器图标 (base64)', 
    example: 'data:image/png;base64,...',
    required: false 
  })
  favicon?: string;

  @ApiProperty({ description: '延迟时间 (毫秒)', example: 45 })
  latency: number;
}

// 基岩版 Ping 响应
export class BedrockPingResponseDto {
  @ApiProperty({ description: '版本类型', example: 'MCPE' })
  edition: string;

  @ApiProperty({ description: '服务器MOTD', example: 'Dedicated Server' })
  motd: string;

  @ApiProperty({ description: '协议版本', example: 594 })
  protocolVersion: number;

  @ApiProperty({ description: '版本名称', example: '1.20.1' })
  versionName: string;

  @ApiProperty({ description: '在线玩家数', example: 0 })
  playerCount: number;

  @ApiProperty({ description: '最大玩家数', example: 20 })
  maxPlayers: number;

  @ApiProperty({ description: '服务器ID', example: '13253860892328930865' })
  serverId: string;

  @ApiProperty({ description: '世界名称', example: 'Bedrock level' })
  worldName: string;

  @ApiProperty({ description: '游戏模式', example: 'Survival' })
  gameMode: string;

  @ApiProperty({ description: '游戏模式ID', example: 0 })
  gameModeId: number;

  @ApiProperty({ description: 'IPv4 端口', example: 19132 })
  portIPv4: number;

  @ApiProperty({ description: 'IPv6 端口', example: 19133 })
  portIPv6: number;
}

// MOTD 转换请求
export class MotdRequestDto {
  @ApiProperty({ 
    description: 'MOTD 数据（字符串或对象）',
    oneOf: [
      { type: 'string', example: '§aHello §bWorld!' },
      { 
        type: 'object', 
        example: { 
          text: 'Hello ', 
          extra: [{ text: 'World!', color: 'blue' }] 
        } 
      }
    ]
  })
  motd: any;
}

// MOTD 转换响应
export class MotdHtmlResponseDto {
  @ApiProperty({ 
    description: '转换后的HTML',
    example: '<span style="color:#55FF55">Hello </span><span style="color:#55FFFF">World!</span>'
  })
  html: string;
}

// 玩家名验证响应
export class PlayerNameValidationDto {
  @ApiProperty({ description: '玩家名', example: 'Notch' })
  name: string;

  @ApiProperty({ description: '是否有效', example: true })
  isValid: boolean;
}

// UUID 验证响应
export class UuidValidationDto {
  @ApiProperty({ description: 'UUID', example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' })
  uuid: string;

  @ApiProperty({ description: '是否有效', example: true })
  isValid: boolean;
}

// UUID 格式化响应（添加连字符）
export class UuidDashResponseDto {
  @ApiProperty({ description: '原始UUID', example: '069a79f444e94726a5befca90e38aaf5' })
  original: string;

  @ApiProperty({ description: '带连字符的UUID', example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' })
  dashed: string;
}

// UUID 格式化响应（移除连字符）
export class UuidUndashResponseDto {
  @ApiProperty({ description: '原始UUID', example: '069a79f4-44e9-4726-a5be-fca90e38aaf5' })
  original: string;

  @ApiProperty({ description: '无连字符的UUID', example: '069a79f444e94726a5befca90e38aaf5' })
  undashed: string;
} 