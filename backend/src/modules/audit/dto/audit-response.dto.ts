import { ApiProperty } from '@nestjs/swagger';

// 用户信息（简化版）
export class AuditUserDto {
  @ApiProperty({ description: '用户ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'admin' })
  username: string;

  @ApiProperty({ description: '显示名称', example: '管理员', nullable: true })
  displayName: string | null;
}

// 玩家信息（简化版）
export class AuditPlayerDto {
  @ApiProperty({ description: '玩家ID', example: 'player-123' })
  id: string;

  @ApiProperty({ description: '玩家游戏ID', example: 'Notch' })
  playerId: string;

  @ApiProperty({ description: '玩家昵称', example: 'Notch', nullable: true })
  playerNick: string | null;
}

// 系统审计日志
export class SystemAuditLogDto {
  @ApiProperty({ description: '日志ID', example: 'audit-123' })
  id: string;

  @ApiProperty({ description: '用户ID', example: 'user-123', nullable: true })
  userId: string | null;

  @ApiProperty({ description: '操作类型', example: 'LOGIN' })
  action: string;

  @ApiProperty({ description: '资源类型', example: 'user', nullable: true })
  resource: string | null;

  @ApiProperty({ description: '资源ID', example: 'user-456', nullable: true })
  resourceId: string | null;

  @ApiProperty({ 
    description: '操作详情', 
    example: { loginType: 'password', success: true },
    nullable: true 
  })
  detail: any;

  @ApiProperty({ description: 'IP地址', example: '192.168.1.1', nullable: true })
  ipAddress: string | null;

  @ApiProperty({ 
    description: '用户代理', 
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    nullable: true 
  })
  userAgent: string | null;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: '操作用户信息', type: AuditUserDto, nullable: true })
  user: AuditUserDto | null;
}

// 玩家审计日志
export class PlayerAuditLogDto {
  @ApiProperty({ description: '日志ID', example: 'audit-123' })
  id: string;

  @ApiProperty({ description: '玩家ID', example: 'player-123' })
  playerId: string;

  @ApiProperty({ description: '操作员ID', example: 'user-123', nullable: true })
  operatorId: string | null;

  @ApiProperty({ description: '操作类型', example: 'UPDATE_STATUS' })
  action: string;

  @ApiProperty({ 
    description: '旧值', 
    example: { status: 'active' },
    nullable: true 
  })
  oldValue: any;

  @ApiProperty({ 
    description: '新值', 
    example: { status: 'banned' },
    nullable: true 
  })
  newValue: any;

  @ApiProperty({ description: '操作原因', example: '违规行为', nullable: true })
  reason: string | null;

  @ApiProperty({ description: 'IP地址', example: '192.168.1.1', nullable: true })
  ipAddress: string | null;

  @ApiProperty({ 
    description: '用户代理', 
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    nullable: true 
  })
  userAgent: string | null;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T10:00:00Z' })
  createdAt: string;

  @ApiProperty({ description: '玩家信息', type: AuditPlayerDto })
  player: AuditPlayerDto;
}

// 分页信息
export class AuditPaginationDto {
  @ApiProperty({ description: '当前页码', example: 1 })
  page: number;

  @ApiProperty({ description: '每页条数', example: 20 })
  limit: number;

  @ApiProperty({ description: '总条数', example: 100 })
  total: number;

  @ApiProperty({ description: '总页数', example: 5 })
  pages: number;

  @ApiProperty({ description: '是否有下一页', example: true })
  hasNext: boolean;

  @ApiProperty({ description: '是否有上一页', example: false })
  hasPrev: boolean;
}

// 系统审计日志列表响应
export class SystemAuditLogListDto {
  @ApiProperty({ description: '审计日志列表', type: [SystemAuditLogDto] })
  data: SystemAuditLogDto[];

  @ApiProperty({ description: '分页信息', type: AuditPaginationDto })
  pagination: AuditPaginationDto;
}

// 玩家审计日志列表响应
export class PlayerAuditLogListDto {
  @ApiProperty({ description: '审计日志列表', type: [PlayerAuditLogDto] })
  data: PlayerAuditLogDto[];

  @ApiProperty({ description: '分页信息', type: AuditPaginationDto })
  pagination: AuditPaginationDto;
}

// 操作统计
export class ActionStatsDto {
  @ApiProperty({ description: '操作类型', example: 'LOGIN' })
  action: string;

  @ApiProperty({ description: '操作次数', example: 156 })
  count: number;
}

// 审计统计信息
export class AuditStatsDto {
  @ApiProperty({ description: '统计周期', example: '最近30天' })
  period: string;

  @ApiProperty({ 
    description: '系统操作统计',
    type: 'object',
    properties: {
      total: { type: 'number', example: 500 },
      byAction: { type: 'array', items: { $ref: '#/components/schemas/ActionStatsDto' } }
    }
  })
  systemActions: {
    total: number;
    byAction: ActionStatsDto[];
  };

  @ApiProperty({ 
    description: '玩家操作统计',
    type: 'object',
    properties: {
      total: { type: 'number', example: 300 },
      byAction: { type: 'array', items: { $ref: '#/components/schemas/ActionStatsDto' } }
    }
  })
  playerActions: {
    total: number;
    byAction: ActionStatsDto[];
  };

  @ApiProperty({ 
    description: '每日活动统计',
    example: [
      { date: '2023-12-01', system_actions: 50, player_actions: 30 },
      { date: '2023-12-02', system_actions: 60, player_actions: 25 }
    ]
  })
  dailyActivity: any[];
} 