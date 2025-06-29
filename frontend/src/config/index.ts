/**
 * 应用配置管理
 * 统一管理环境变量和应用配置
 */

export interface AppConfig {
  app: {
    title: string
    version: string
    debug: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
  api: {
    baseURL: string
    timeout: number
  }
  oauth: {
    providers: string[]
    enabled: boolean
  }
  features: {
    sso: boolean
    oauth: boolean
    registration: boolean
  }
}

const getEnv = (key: string, defaultValue?: string): string => {
  return import.meta.env[key] || defaultValue || ''
}

const getBoolEnv = (key: string, defaultValue = false): boolean => {
  const value = getEnv(key)
  if (!value) return defaultValue
  const lowerValue = value.toLowerCase()
  return lowerValue === 'true' || lowerValue === '1'
}

const getArrayEnv = (key: string, defaultValue: string[] = []): string[] => {
  const value = getEnv(key)
  return value ? value.split(',').map(item => item.trim()) : defaultValue
}

export const config: AppConfig = {
  app: {
    title: getEnv('VITE_APP_TITLE', 'Hydroline Services'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    debug: getBoolEnv('VITE_DEBUG', false),
    logLevel: (getEnv('VITE_LOG_LEVEL', 'info') as AppConfig['app']['logLevel'])
  },
  api: {
    baseURL: getEnv('VITE_API_URL', 'http://localhost:3000'),
    timeout: parseInt(getEnv('VITE_API_TIMEOUT', '10000'), 10)
  },
  oauth: {
    providers: getArrayEnv('VITE_OAUTH_PROVIDERS', ['microsoft']),
    enabled: getBoolEnv('VITE_ENABLE_OAUTH', true)
  },
  features: {
    sso: getBoolEnv('VITE_ENABLE_SSO', true),
    oauth: getBoolEnv('VITE_ENABLE_OAUTH', true),
    registration: getBoolEnv('VITE_ENABLE_REGISTRATION', true)
  }
}

// 配置验证
export const validateConfig = (): boolean => {
  const errors: string[] = []

  if (!config.api.baseURL) {
    errors.push('API_URL is required')
  }

  if (config.api.timeout <= 0) {
    errors.push('API_TIMEOUT must be greater than 0')
  }

  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    return false
  }

  return true
}

// 开发环境配置检查
if (config.app.debug) {
  console.group('🔧 Application Configuration')
  console.table(config)
  console.groupEnd()
  
  if (!validateConfig()) {
    throw new Error('Invalid configuration detected')
  }
}

export default config 