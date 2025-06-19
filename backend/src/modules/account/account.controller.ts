import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BindExternalAccountDto } from './dto/bind-external-account.dto';
import { CurrentUser } from '../core/decorators/user.decorator';
import { Roles } from '../core/decorators/roles.decorator';
import { RolesGuard } from '../core/guards/roles.guard';

@ApiTags('账户')
@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({ summary: '创建新账户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @Post()
  create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @ApiOperation({ summary: '获取所有账户' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @ApiOperation({ summary: '获取当前用户账户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getProfile(@CurrentUser() user) {
    return this.accountService.findOne(user.id);
  }

  @ApiOperation({ summary: '更新当前用户个人资料' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put('me/profile')
  updateProfile(
    @CurrentUser() user,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.accountService.updateProfile(user.id, updateProfileDto);
  }

  @ApiOperation({ summary: '修改当前用户密码' })
  @ApiResponse({ status: 200, description: '密码修改成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('me/change-password')
  changePassword(
    @CurrentUser() user,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.accountService.changePassword(user.id, changePasswordDto);
  }

  @ApiOperation({ summary: '获取当前用户外部账号绑定列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/external-accounts')
  getExternalAccounts(@CurrentUser() user) {
    return this.accountService.getExternalAccounts(user.id);
  }

  @ApiOperation({ summary: '绑定外部账号' })
  @ApiResponse({ status: 201, description: '绑定成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('me/external-accounts')
  bindExternalAccount(
    @CurrentUser() user,
    @Body() bindExternalAccountDto: BindExternalAccountDto,
  ) {
    return this.accountService.bindExternalAccount(
      user.id,
      bindExternalAccountDto,
    );
  }

  @ApiOperation({ summary: '解绑外部账号' })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('me/external-accounts/:accountId')
  unbindExternalAccount(
    @CurrentUser() user,
    @Param('accountId') accountId: string,
  ) {
    return this.accountService.unbindExternalAccount(user.id, accountId);
  }

  @ApiOperation({ summary: '获取当前用户活跃会话列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/sessions')
  getUserSessions(@CurrentUser() user) {
    return this.accountService.getUserSessions(user.id);
  }

  @ApiOperation({ summary: '撤销指定会话' })
  @ApiResponse({ status: 200, description: '撤销成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Delete('me/sessions/:sessionId')
  revokeSession(@CurrentUser() user, @Param('sessionId') sessionId: string) {
    return this.accountService.revokeSession(user.id, sessionId);
  }

  @ApiOperation({ summary: '撤销其他所有会话（保留当前）' })
  @ApiResponse({ status: 200, description: '撤销成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('me/sessions/revoke-others')
  revokeOtherSessions(@CurrentUser() user, @Req() req) {
    // 从JWT payload中获取当前tokenId
    const token = req.headers.authorization?.split(' ')[1];
    let currentTokenId: string | undefined;

    if (token) {
      try {
        const payload = JSON.parse(
          Buffer.from(token.split('.')[1], 'base64').toString(),
        );
        currentTokenId = payload.jti;
      } catch (error) {
        // 如果解析失败，忽略错误，撤销所有会话
      }
    }

    return this.accountService.revokeOtherSessions(user.id, currentTokenId);
  }

  @ApiOperation({ summary: '获取当前用户操作日志' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: '每页数量',
    example: 20,
  })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/audit-logs')
  getUserAuditLogs(
    @CurrentUser() user,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.accountService.getUserAuditLogs(user.id, pageNum, limitNum);
  }

  @ApiOperation({ summary: '获取当前用户统计信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/stats')
  getUserStats(@CurrentUser() user) {
    return this.accountService.getUserStats(user.id);
  }

  @ApiOperation({ summary: '获取指定账户' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountService.findOne(id);
  }

  @ApiOperation({ summary: '更新账户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentUser() user,
  ) {
    // 确保只能更新自己的账户，除非是管理员
    if (id !== user.id && !user.roles.includes('admin')) {
      throw new Error('无权限更新其他用户账户');
    }
    return this.accountService.update(id, updateAccountDto);
  }

  @ApiOperation({ summary: '删除账户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiBearerAuth()
  @Roles('admin')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(id);
  }

  @ApiOperation({ summary: '用户注册' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @Post('register')
  async register(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.register(createAccountDto);
  }
}
