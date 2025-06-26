import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  Delete,
  Param,
  Ip,
  Headers,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SSOService } from './sso.service';
import { LoginDto, RefreshTokenDto } from './dto';
import { CurrentUser, Roles, SuccessMessage } from '../decorators';
import { RbacGuard } from '../guards';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly ssoService: SSOService,
  ) {}

  @ApiOperation({ summary: '用户登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @SuccessMessage('登录成功')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    // 输入验证
    if (!loginDto.username?.trim() || !loginDto.password?.trim()) {
      throw new BadRequestException('用户名和密码不能为空');
    }

    const user = await this.authService.validateUser(
      loginDto.username.trim(),
      loginDto.password,
    );

    if (!user) {
      // 此处故意不返回详细错误，增加安全性
      throw new UnauthorizedException('用户名或密码错误');
    }

    return this.authService.login(user, userAgent, ip);
  }

  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 400, description: '无效的刷新令牌' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @SuccessMessage('令牌刷新成功')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    if (!refreshTokenDto.refreshToken?.trim()) {
      throw new BadRequestException('刷新令牌不能为空');
    }

    return this.authService.refreshToken(refreshTokenDto.refreshToken.trim());
  }

  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @SuccessMessage('用户信息获取成功')
  getProfile(@CurrentUser() user) {
    if (!user || !user.id) {
      throw new UnauthorizedException('用户信息不完整');
    }
    return user;
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户会话列表' })
  @SuccessMessage('会话列表获取成功')
  async getSessions(@CurrentUser() user) {
    return this.authService.getUserSessions(user.id);
  }

  @Delete('sessions/:tokenId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销指定会话' })
  @SuccessMessage('会话撤销成功')
  async revokeSession(@CurrentUser() user, @Param('tokenId') tokenId: string) {
    if (!tokenId?.trim()) {
      throw new BadRequestException('会话ID不能为空');
    }

    await this.authService.revokeSession(tokenId.trim(), user.id);
    return { message: '会话已撤销' };
  }

  @Delete('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销所有会话（除当前）' })
  @SuccessMessage('所有会话撤销成功')
  async revokeAllSessions(@CurrentUser() user) {
    await this.authService.revokeAllSessions(user.id);
    return { message: '所有会话已撤销，请重新登录' };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  @SuccessMessage('退出登录成功')
  async logout(@CurrentUser() user, @Req() req) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (token) {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        if (payload.jti) {
          await this.authService.revokeSession(payload.jti, user.id);
        }
      }
      return { message: '已成功退出登录' };
    } catch (error) {
      return { message: '已成功退出登录' };
    }
  }

  @Post('cleanup-sessions')
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Roles('super_admin', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '清理过期会话（管理员功能）' })
  @SuccessMessage('过期会话清理完成')
  async cleanupExpiredSessions(@CurrentUser() user) {
    // 权限检查已由 RbacGuard 完成
    try {
      const result = await this.authService.cleanupExpiredSessions();
      return {
        message: '清理完成',
        deletedCount: result.count,
      };
    } catch (error) {
      throw new BadRequestException('清理过期会话失败');
    }
  }

  @ApiOperation({ summary: '生成 SSO 重定向 URL' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiResponse({ status: 400, description: '不支持的系统或SSO未启用' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('sso/:system')
  @SuccessMessage('SSO重定向URL生成成功')
  generateSSOUrl(@CurrentUser() user, @Req() req) {
    try {
      const targetSystem = req.params.system;

      if (!targetSystem?.trim()) {
        throw new BadRequestException('目标系统不能为空');
      }

      const allowedSystems = ['wiki', 'forum', 'mediawiki'];
      if (!allowedSystems.includes(targetSystem)) {
        throw new BadRequestException(`不支持的系统: ${targetSystem}`);
      }

      return {
        redirectUrl: this.ssoService.generateSSORedirectUrl(user, targetSystem),
      };
    } catch (error) {
      throw error;
    }
  }
}
