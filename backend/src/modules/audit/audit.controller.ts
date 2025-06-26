import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { 
  QueryAuditDto,
  SystemAuditLogListDto,
  PlayerAuditLogListDto,
  AuditStatsDto,
} from './dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions } from '../core/decorators';
import { ApiStandardResponses } from '../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../common/dto';

@ApiTags('审计日志')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  SystemAuditLogListDto,
  PlayerAuditLogListDto,
  AuditStatsDto,
)
@Controller('audit')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('system')
  @ApiOperation({ 
    summary: '获取系统审计日志（管理员）',
    description: '获取系统操作的审计日志，包括用户登录、权限变更等操作记录'
  })
  @ApiStandardResponses(SystemAuditLogListDto, '系统审计日志获取成功')
  @Permissions('audit:read')
  getSystemAuditLogs(@Query() query: QueryAuditDto) {
    return this.auditService.getSystemAuditLogs(query);
  }

  @Get('player/:playerId')
  @ApiOperation({ 
    summary: '获取指定玩家的审计日志（管理员）',
    description: '获取特定玩家的所有操作记录，包括状态变更、权限调整等'
  })
  @ApiParam({ name: 'playerId', description: '玩家ID' })
  @ApiStandardResponses(PlayerAuditLogListDto, '玩家审计日志获取成功')
  @Permissions('audit:read')
  getPlayerAuditLogs(
    @Param('playerId') playerId: string,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.getPlayerAuditLogs(playerId, query);
  }

  @Get('my')
  @ApiOperation({ 
    summary: '获取当前用户的操作日志',
    description: '获取当前登录用户的所有操作记录'
  })
  @ApiStandardResponses(SystemAuditLogListDto, '用户操作日志获取成功')
  @UseGuards(AuthGuard('jwt'))
  getMyAuditLogs(@Request() req, @Query() query: QueryAuditDto) {
    return this.auditService.getUserAuditLogs(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: '获取审计统计信息（管理员）',
    description: '获取系统和玩家操作的统计信息，包括操作次数、类型分布等'
  })
  @ApiQuery({ 
    name: 'days', 
    description: '统计天数（默认30天）', 
    required: false, 
    example: 30 
  })
  @ApiStandardResponses(AuditStatsDto, '审计统计信息获取成功')
  @Permissions('audit:read')
  getAuditStats(@Query('days') days?: number) {
    return this.auditService.getAuditStats(days || 30);
  }
}
