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
import { CurrentUser } from '../decorators/user.decorator';

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
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );
    return this.authService.login(user, userAgent, ip);
  }

  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 400, description: '无效的刷新令牌' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }

  @ApiOperation({ summary: '生成 SSO 重定向 URL' })
  @ApiResponse({ status: 200, description: '生成成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('sso/:system')
  generateSSOUrl(@CurrentUser() user, @Req() req) {
    const targetSystem = req.params.system;
    return {
      redirectUrl: this.ssoService.generateSSORedirectUrl(user, targetSystem),
    };
  }

  @Get('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户会话列表' })
  async getSessions(@CurrentUser() user) {
    return this.authService.getUserSessions(user.id);
  }

  @Delete('sessions/:tokenId')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销指定会话' })
  async revokeSession(@CurrentUser() user, @Param('tokenId') tokenId: string) {
    await this.authService.revokeSession(tokenId, user.id);
    return { message: '会话已撤销' };
  }

  @Delete('sessions')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '撤销所有会话（除当前）' })
  async revokeAllSessions(@CurrentUser() user) {
    await this.authService.revokeAllSessions(user.id);
    return { message: '所有会话已撤销，请重新登录' };
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: '退出登录' })
  async logout(@CurrentUser() user, @Req() req) {
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
  }
}
