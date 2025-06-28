/**
 * 系统相关API
 */

import { http } from '@/lib/http'

export interface SystemInfo {
  version: string
  environment: string
  uptime: number
  features: {
    oauth: boolean
    sso: boolean
    registration: boolean
  }
}

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    database: boolean
    redis?: boolean
    external_services?: boolean
  }
  timestamp: string
}

export const systemApi = {
  // 获取系统信息
  async getInfo() {
    return http.get<SystemInfo>('/api/system/info')
  },

  // 健康检查
  async healthCheck() {
    return http.get<HealthCheck>('/api/system/health')
  },

  // 获取配置信息（公开部分）
  async getPublicConfig() {
    return http.get<Record<string, any>>('/api/system/config/public')
  }
} 