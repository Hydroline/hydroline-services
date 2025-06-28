import axios from 'axios'
import { authStorage } from '@/lib/storage'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // 注意：浏览器环境下不能设置 user-agent 头部
    // 如果需要发送设备信息，可以通过自定义头部或请求体发送
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理token过期
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshToken = authStorage.getRefreshToken()
      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken)
          // 注意：使用新的响应结构
          authStorage.setTokens(response.data.data.accessToken, refreshToken)
          // 重试原请求
          return api(error.config)
        } catch (refreshError) {
          // 刷新失败，清除token并跳转登录页
          authStorage.clearTokens()
          window.location.href = '/login'
        }
      } else {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// 类型定义
export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email?: string
  password: string
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
}

export interface AuthResponse {
  user: UserInfo
  accessToken: string
  refreshToken: string
}

// 标准API响应包装
export interface ApiResponse<T = any> {
  code: number
  status: string
  message: string
  data: T
  timestamp: number
  isoTime: string
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
}

// API 方法
export const authApi = {
  // 登录
  async login(data: LoginData): Promise<{ data: ApiResponse<AuthResponse> }> {
    return api.post('/api/auth/login', data)
  },

  // 注册
  async register(data: RegisterData): Promise<{ data: ApiResponse<AuthResponse> }> {
    return api.post('/api/auth/register', data)
  },

  // 获取用户信息
  async getProfile(): Promise<{ data: ApiResponse<UserInfo> }> {
    return api.get('/api/auth/profile')
  },

  // 修改密码
  async changePassword(data: ChangePasswordData): Promise<{ data: ApiResponse<{ message: string }> }> {
    return api.post('/api/auth/change-password', data)
  },

  // 刷新token
  async refreshToken(refreshToken: string): Promise<{ data: ApiResponse<{ accessToken: string }> }> {
    return api.post('/api/auth/refresh', { refreshToken })
  },

  // 登出
  async logout(): Promise<{ data: ApiResponse<{ message: string }> }> {
    return api.post('/api/auth/logout')
  },

  // 获取用户会话
  async getSessions(): Promise<{ data: ApiResponse<any[]> }> {
    return api.get('/api/auth/sessions')
  },

  // 撤销指定会话
  async revokeSession(tokenId: string): Promise<{ data: ApiResponse<{ message: string }> }> {
    return api.delete(`/api/auth/sessions/${tokenId}`)
  },

  // 撤销所有会话（除当前）
  async revokeAllSessions(): Promise<{ data: ApiResponse<{ message: string }> }> {
    return api.delete('/api/auth/sessions')
  },

  // 生成SSO登录URL
  async generateSSOUrl(system: string): Promise<{ data: ApiResponse<{ redirectUrl: string }> }> {
    return api.get(`/api/auth/sso/${system}`)
  },

  // 获取可用的OAuth提供商
  async getOAuthProviders(): Promise<{ data: ApiResponse<{ providers: OAuthProvider[] }> }> {
    return api.get('/api/auth/oauth/providers')
  }
}

// 刷新访问令牌的辅助函数
export const refreshAccessToken = (refreshToken: string) => {
  return api.post('/api/auth/refresh', { refreshToken })
}

export default api 