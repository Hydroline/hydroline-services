/**
 * 认证相关API
 */

import { http } from '@/lib/http'

// 认证相关类型定义
export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email?: string
  password: string
  confirmPassword?: string
  displayName?: string
  minecraftUuid?: string
  minecraftNick?: string
}

export interface UserInfo {
  id: string
  username: string
  email: string | null
  displayName: string
  isActive: boolean
  createdAt: string
  roles?: string[]
  permissions?: string[]
}

export interface AuthResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface OAuthProvider {
  id: string
  name: string
  enabled: boolean
  loginUrl: string
  icon?: string
}

// 认证API接口
export const authApi = {
  // 登录
  async login(data: LoginData) {
    return http.post<AuthResponse>('/api/auth/login', data, {
      skipErrorHandler: true, // 跳过全局错误处理，由组件自行处理
    })
  },

  // 注册
  async register(data: RegisterData) {
    return http.post<AuthResponse>('/api/auth/register', data, {
      skipErrorHandler: true, // 跳过全局错误处理，由组件自行处理
    })
  },

  // 获取用户信息
  async getProfile() {
    return http.get<UserInfo>('/api/auth/profile')
  },

  // 修改密码
  async changePassword(data: ChangePasswordData) {
    return http.post<{ message: string }>('/api/auth/change-password', data)
  },

  // 刷新token
  async refreshToken(refreshToken: string) {
    return http.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken })
  },

  // 登出
  async logout() {
    return http.post<{ message: string }>('/api/auth/logout')
  },

  // 获取用户会话
  async getSessions() {
    return http.get<any[]>('/api/auth/sessions')
  },

  // 撤销指定会话
  async revokeSession(tokenId: string) {
    return http.delete<{ message: string }>(`/api/auth/sessions/${tokenId}`)
  },

  // 撤销所有会话（除当前）
  async revokeAllSessions() {
    return http.delete<{ message: string }>('/api/auth/sessions')
  },

  // 生成SSO登录URL
  async generateSSOUrl(system: string) {
    return http.get<{ redirectUrl: string }>(`/api/auth/sso/${system}`)
  },

  // 获取可用的OAuth提供商
  async getOAuthProviders() {
    return http.get<{ providers: OAuthProvider[] }>('/api/auth/oauth/providers')
  }
} 