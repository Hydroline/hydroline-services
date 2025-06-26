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
  ApiExtraModels,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SSOService } from './sso.service';
import {
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ChangePasswordDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  UserDto,
  SessionDto,
  MessageResponseDto,
  CleanupResponseDto,
  SSOUrlResponseDto,
} from './dto';
import { CurrentUser, Roles, SuccessMessage } from '../decorators';
import { RbacGuard } from '../guards';
import { ApiStandardResponses } from '../../../common/decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../../../common/dto';

@ApiTags('认证')
@ApiExtraModels(
  SuccessResponseDto,
  ErrorResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  RegisterResponseDto,
  UserDto,
  SessionDto,
  MessageResponseDto,
  CleanupResponseDto,
  SSOUrlResponseDto,
)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly ssoService: SSOService,
  ) {}

  @ApiOperation({ summary: '用户注册' })
  @ApiStandardResponses(RegisterResponseDto, '注册成功')
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  @SuccessMessage('注册成功')
  async register(
    @Body() registerDto: RegisterDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.authService.register(
      {
        username: registerDto.username,
        email: registerDto.email,
        password: registerDto.password,
        displayName: registerDto.displayName,
        minecraftUuid: registerDto.minecraftUuid,
        minecraftNick: registerDto.minecraftNick,
      },
      userAgent || 'Unknown Device',
      ip,
    );
  }

  @ApiOperation({ summary: '用户登录' })
  @ApiStandardResponses(LoginResponseDto, '登录成功')
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @SuccessMessage('登录成功')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
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

    return this.authService.login(user, userAgent || 'Unknown Device', ip);
  }

  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiStandardResponses(RefreshResponseDto, '令牌刷新成功')
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
  @ApiStandardResponses(UserDto, '用户信息获取成功')
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

  @ApiOperation({ summary: '修改当前用户密码' })
  @ApiStandardResponses(MessageResponseDto, '密码修改成功')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @SuccessMessage('密码修改成功')
  async changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, {
      oldPassword: changePasswordDto.oldPassword,
      newPassword: changePasswordDto.newPassword,
    });
  }

  @ApiOperation({ summary: '获取用户会话列表' })
  @ApiStandardResponses(SessionDto, '会话列表获取成功')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('sessions')
  @SuccessMessage('会话列表获取成功')
  async getSessions(@CurrentUser() user) {
    return this.authService.getUserSessions(user.id);
  }

  @ApiOperation({ summary: '撤销指定会话' })
  @ApiStandardResponses(MessageResponseDto, '会话撤销成功')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('sessions/:tokenId')
  @SuccessMessage('会话撤销成功')
  async revokeSession(@CurrentUser() user, @Param('tokenId') tokenId: string) {
    if (!tokenId?.trim()) {
      throw new BadRequestException('会话ID不能为空');
    }

    await this.authService.revokeSession(tokenId.trim(), user.id);
    return { message: '会话已撤销' };
  }

  @ApiOperation({ summary: '撤销所有会话（除当前）' })
  @ApiStandardResponses(MessageResponseDto, '所有会话撤销成功')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('sessions')
  @SuccessMessage('所有会话撤销成功')
  async revokeAllSessions(@CurrentUser() user) {
    await this.authService.revokeAllSessions(user.id);
    return { message: '所有会话已撤销，请重新登录' };
  }

  @ApiOperation({ summary: '退出登录' })
  @ApiStandardResponses(MessageResponseDto, '退出登录成功')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
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

  @ApiOperation({ summary: '清理过期会话（管理员功能）' })
  @ApiStandardResponses(CleanupResponseDto, '过期会话清理完成')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RbacGuard)
  @Roles('super_admin', 'admin')
  @Post('cleanup-sessions')
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
  @ApiStandardResponses(SSOUrlResponseDto, 'SSO重定向URL生成成功')
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
