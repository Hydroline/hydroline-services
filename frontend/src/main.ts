import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

import utcPlugin from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

import './assets/styles/main.scss'
import './assets/styles/tailwind.css'
import 'material-icons/iconfont/material-icons.css'

dayjs.locale('zh-cn')
dayjs.extend(utcPlugin)

const initApp = async (): Promise<void> => {
  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  app.use(router)
  
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
