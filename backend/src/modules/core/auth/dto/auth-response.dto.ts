import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: '用户ID', example: 'user-123' })
  id: string;

  @ApiProperty({ description: '用户名', example: 'testuser' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: '用户角色', example: ['user', 'admin'] })
  roles: string[];
}

export class LoginResponseDto {
  @ApiProperty({ description: '用户信息', type: UserDto })
  user: UserDto;

  @ApiProperty({ 
    description: '访问令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  accessToken: string;

  @ApiProperty({ 
    description: '刷新令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  refreshToken: string;
}

export class RefreshResponseDto {
  @ApiProperty({ 
    description: '新的访问令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  accessToken: string;
}

export class SessionDto {
  @ApiProperty({ description: '会话ID', example: 'session-123' })
  id: string;

  @ApiProperty({ description: '令牌ID', example: 'token-456' })
  tokenId: string;

  @ApiProperty({ description: '设备信息', example: 'Chrome/91.0 Windows NT 10.0' })
  deviceInfo: string;

  @ApiProperty({ description: 'IP地址', example: '192.168.1.1' })
  ipAddress: string;

  @ApiProperty({ description: '最后使用时间', example: '2023-12-01T10:00:00Z' })
  lastUsedAt: string;

  @ApiProperty({ description: '创建时间', example: '2023-12-01T09:00:00Z' })
  createdAt: string;
}

export class SessionsResponseDto {
  @ApiProperty({ description: '会话列表', type: [SessionDto] })
  sessions: SessionDto[];
}

export class MessageResponseDto {
  @ApiProperty({ description: '操作结果消息', example: '操作成功' })
  message: string;
}

export class CleanupResponseDto {
  @ApiProperty({ description: '操作结果消息', example: '清理完成' })
  message: string;

  @ApiProperty({ description: '删除的会话数量', example: 5 })
  deletedCount: number;
}

export class SSOUrlResponseDto {
  @ApiProperty({ 
    description: 'SSO重定向URL', 
    example: 'https://wiki.example.com/sso/callback?token=...' 
  })
  redirectUrl: string;
}

export class RegisterResponseDto {
  @ApiProperty({ description: '用户信息', type: UserDto })
  user: UserDto;

  @ApiProperty({ 
    description: '访问令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  accessToken: string;

  @ApiProperty({ 
    description: '刷新令牌', 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' 
  })
  refreshToken: string;
}

export class OAuthProviderDto {
  @ApiProperty({ 
    description: '提供商标识', 
    example: 'microsoft',
    enum: ['microsoft', 'qq', 'wechat', 'discord']
  })
  id: string;

  @ApiProperty({ description: '提供商名称', example: 'Microsoft' })
  name: string;

  @ApiProperty({ description: '是否启用', example: true })
  enabled: boolean;

  @ApiProperty({ description: '登录URL', example: '/api/auth/oauth/microsoft' })
  loginUrl: string;
}

export class OAuthProvidersResponseDto {
  @ApiProperty({ 
    description: '可用的OAuth提供商列表', 
    type: [OAuthProviderDto] 
  })
  providers: OAuthProviderDto[];
} 