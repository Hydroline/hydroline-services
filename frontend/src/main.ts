import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { config, validateConfig } from '@/config'

import utcPlugin from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

import './assets/styles/main.scss'
import './assets/styles/tailwind.css'
import 'vue-sonner/style.css'
import 'material-icons/iconfont/material-icons.css'

// 验证配置
if (!validateConfig()) {
  throw new Error('应用配置验证失败')
}

const userLanguage = navigator.language.toLowerCase()
const supportedLanguages = ['zh-cn', 'en', 'ja', 'ko', 'fr', 'de', 'ru']
const language =
  supportedLanguages.find((lang) => userLanguage.startsWith(lang)) || 'zh-cn'
dayjs.locale(language)
dayjs.extend(utcPlugin)

const initApp = async (): Promise<void> => {
  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  app.use(router)

  // 开发环境配置检查
  if (config.app.debug) {
    console.log('🚀 Hydroline Services 启动中...')
    console.log('📝 配置信息:', config)
  }

  // 初始化认证状态
  const authStore = useAuthStore()
  try {
    await authStore.initAuth()
  } catch (error) {
    console.error('认证初始化失败:', error)
  }

  app.mount('#app')
}

initApp().catch((e) => {
  console.error('应用初始化失败:', e)
})
