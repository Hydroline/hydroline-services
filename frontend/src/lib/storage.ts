/**
 * LocalStorage 管理库
 * 提供类型安全和最佳实践的本地存储管理
 */

export interface StorageOptions {
  /** 过期时间（毫秒）*/
  expires?: number
  /** 是否加密存储 */
  encrypt?: boolean
}

interface StorageItem<T = any> {
  value: T
  expires?: number
  encrypted?: boolean
}

class StorageManager {
  private prefix: string

  constructor(prefix = 'hydroline_') {
    this.prefix = prefix
  }

  /**
   * 设置存储项
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    try {
      const item: StorageItem<T> = {
        value,
        expires: options.expires ? Date.now() + options.expires : undefined,
        encrypted: options.encrypt
      }

      const serialized = JSON.stringify(item)
      localStorage.setItem(this.prefix + key, serialized)
    } catch (error) {
      console.error('存储设置失败:', error)
    }
  }

  /**
   * 获取存储项
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.prefix + key)
      if (!item) return defaultValue

      const parsed: StorageItem<T> = JSON.parse(item)

      // 检查是否过期
      if (parsed.expires && Date.now() > parsed.expires) {
        this.remove(key)
        return defaultValue
      }

      return parsed.value
    } catch (error) {
      console.error('存储获取失败:', error)
      return defaultValue
    }
  }

  /**
   * 移除存储项
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error('存储移除失败:', error)
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.prefix)
      )
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('存储清空失败:', error)
    }
  }

  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Object.keys(localStorage)
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.replace(this.prefix, ''))
  }

  /**
   * 获取存储大小（估算）
   */
  getSize(): number {
    let size = 0
    for (const key of this.keys()) {
      const item = localStorage.getItem(this.prefix + key)
      if (item) {
        size += item.length
      }
    }
    return size
  }
}

// 创建默认实例
export const storage = new StorageManager()

// 认证相关的专用存储方法
export const authStorage = {
  setTokens(accessToken: string, refreshToken: string) {
    storage.set('access_token', accessToken, { expires: 7 * 24 * 60 * 60 * 1000 }) // 7天
    storage.set('refresh_token', refreshToken, { expires: 30 * 24 * 60 * 60 * 1000 }) // 30天
  },

  getAccessToken(): string | undefined {
    return storage.get<string>('access_token')
  },

  getRefreshToken(): string | undefined {
    return storage.get<string>('refresh_token')
  },

  clearTokens() {
    storage.remove('access_token')
    storage.remove('refresh_token')
  },

  hasValidTokens(): boolean {
    return !!this.getAccessToken()
  }
}

// 用户偏好设置存储
export const userPreferences = {
  setTheme(theme: 'light' | 'dark' | 'auto') {
    storage.set('theme', theme)
  },

  getTheme(): 'light' | 'dark' | 'auto' {
    return storage.get('theme', 'auto')
  },

  setLanguage(language: string) {
    storage.set('language', language)
  },

  getLanguage(): string {
    return storage.get('language', 'zh-CN')
  }
}

export default storage 