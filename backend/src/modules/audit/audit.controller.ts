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
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { QueryAuditDto } from './dto/query-audit.dto';
import { AuthGuard } from '@nestjs/passport';
import { RbacGuard } from '../core/guards';
import { Permissions } from '../core/decorators';

@ApiTags('审计日志')
@Controller('audit')
@UseGuards(AuthGuard('jwt'), RbacGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('system')
  @ApiOperation({ summary: '获取系统审计日志（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('audit:read')
  getSystemAuditLogs(@Query() query: QueryAuditDto) {
    return this.auditService.getSystemAuditLogs(query);
  }

  @Get('player/:playerId')
  @ApiOperation({ summary: '获取指定玩家的审计日志（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @ApiParam({ name: 'playerId', description: '玩家ID' })
  @Permissions('audit:read')
  getPlayerAuditLogs(
    @Param('playerId') playerId: string,
    @Query() query: QueryAuditDto,
  ) {
    return this.auditService.getPlayerAuditLogs(playerId, query);
  }

  @Get('my')
  @ApiOperation({ summary: '获取当前用户的操作日志' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @UseGuards(AuthGuard('jwt'))
  getMyAuditLogs(@Request() req, @Query() query: QueryAuditDto) {
    return this.auditService.getUserAuditLogs(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: '获取审计统计信息（管理员）' })
  @ApiResponse({ status: 200, description: '查询成功' })
  @Permissions('audit:read')
  getAuditStats(@Query('days') days?: number) {
    return this.auditService.getAuditStats(days || 30);
  }
}
