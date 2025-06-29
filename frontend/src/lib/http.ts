/**
 * HTTP 请求封装
 * 提供统一的请求拦截、错误处理、类型安全等功能
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { toast } from 'vue-sonner'
import { config } from '@/config'
import { authStorage } from '@/lib/storage'

// 标准API响应接口
export interface ApiResponse<T = any> {
  code: number
  status: string
  message: string
  data: T
  timestamp: number
  isoTime: string
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean // 跳过认证
  skipErrorHandler?: boolean // 跳过错误处理
  showLoading?: boolean // 显示加载状态
  customErrorMessage?: string // 自定义错误消息
}

// 扩展 AxiosRequestConfig 类型以支持自定义属性
declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    skipErrorHandler?: boolean
    showLoading?: boolean
    customErrorMessage?: string
    _retry?: boolean
  }
}

// HTTP状态码枚举
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
}

class HttpClient {
  private instance: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.instance = axios.create({
      baseURL: config.api.baseURL,
      timeout: config.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token
        if (!config.skipAuth) {
          const token = authStorage.getAccessToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }

        // 添加请求ID用于调试
        if (import.meta.env.DEV) {
          config.headers['X-Request-ID'] =
            `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response
      },
      async (error) => {
        const originalRequest = error.config

        // 处理token过期
        if (
          error.response?.status === HttpStatus.UNAUTHORIZED &&
          !originalRequest._retry &&
          !originalRequest.skipErrorHandler
        ) {
          originalRequest._retry = true

          const refreshToken = authStorage.getRefreshToken()
          if (refreshToken && !originalRequest.url?.includes('/auth/refresh')) {
            try {
              // 防止并发刷新token
              if (!this.refreshPromise) {
                this.refreshPromise = this.refreshAccessToken(refreshToken)
              }

              const newToken = await this.refreshPromise
              this.refreshPromise = null

              // 更新原请求的token
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return this.instance(originalRequest)
            } catch (refreshError) {
              this.refreshPromise = null
              this.handleAuthError()
              return Promise.reject(refreshError)
            }
          } else {
            this.handleAuthError()
          }
        }

        // 自定义错误处理
        if (!originalRequest.skipErrorHandler) {
          this.handleError(error, originalRequest.customErrorMessage)
        }

        return Promise.reject(error)
      },
    )
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await this.instance.post<
      ApiResponse<{ accessToken: string }>
    >(
      '/api/auth/refresh',
      {
        refreshToken,
      },
      { skipAuth: true, skipErrorHandler: true },
    )

    const newToken = response.data.data.accessToken
    authStorage.setTokens(newToken, refreshToken)
    return newToken
  }

  private handleAuthError() {
    authStorage.clearTokens()

    // 跳转到首页而不是不存在的 /login 页面
    // 首页会自动检测未登录状态并显示登录对话框
    if (window.location.pathname !== '/') {
      window.location.href = '/'
    }
    
    toast.error('登录已过期', {
      description: '请重新登录',
    })
  }

  private handleError(error: any, customMessage?: string) {
    const response = error.response
    let message = customMessage || '请求失败'

    if (response?.data?.message) {
      message = response.data.message
    } else if (response?.status) {
      switch (response.status) {
        case HttpStatus.BAD_REQUEST:
          message = '请求参数错误'
          break
        case HttpStatus.UNAUTHORIZED:
          message = '未授权访问'
          break
        case HttpStatus.FORBIDDEN:
          message = '权限不足'
          break
        case HttpStatus.NOT_FOUND:
          message = '资源不存在'
          break
        case HttpStatus.INTERNAL_SERVER_ERROR:
          message = '服务器内部错误'
          break
        default:
          message = `请求失败 (${response.status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      message = '请求超时'
    } else if (error.message === 'Network Error') {
      message = '网络连接失败'
    }

    toast.error('操作失败', {
      description: message,
    })

    // 开发环境下打印详细错误信息
    if (config.app.debug) {
      console.group('🚨 HTTP Error')
      console.error('Error:', error)
      console.error('Response:', response)
      console.groupEnd()
    }
  }

  // GET 请求
  async get<T = any>(
    url: string,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.get(url, config)
  }

  // POST 请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.post(url, data, config)
  }

  // PUT 请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.put(url, data, config)
  }

  // PATCH 请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.patch(url, data, config)
  }

  // DELETE 请求
  async delete<T = any>(
    url: string,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    return this.instance.delete(url, config)
  }

  // 上传文件
  async upload<T = any>(
    url: string,
    file: File | FormData,
    config?: RequestConfig,
  ): Promise<AxiosResponse<ApiResponse<T>>> {
    const formData = file instanceof FormData ? file : new FormData()
    if (file instanceof File) {
      formData.append('file', file)
    }

    return this.instance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    })
  }

  // 下载文件
  async download(
    url: string,
    filename?: string,
    config?: RequestConfig,
  ): Promise<void> {
    const response = await this.instance.get(url, {
      ...config,
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // 获取原始axios实例（用于特殊需求）
  getRawInstance(): AxiosInstance {
    return this.instance
  }
}

// 创建默认实例
export const http = new HttpClient()

// 导出类型
export type { AxiosResponse, AxiosRequestConfig }
export default http
