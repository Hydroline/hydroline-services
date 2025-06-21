import { createApp } from 'vue'
import { createPinia } from 'pinia'
import dayjs from 'dayjs'

import App from './App.vue'
import router from './router'

import utcPlugin from 'dayjs/plugin/utc'
import 'dayjs/locale/zh-cn'

import './assets/styles/tailwind.css'
import './assets/styles/global.scss'
import 'material-icons/iconfont/material-icons.css'

dayjs.locale('zh-cn')
dayjs.extend(utcPlugin)

const initApp = async (): Promise<void> => {
  const app = createApp(App)
  app.use(router).use(createPinia())
  app.mount('#app')
}

initApp().catch((e) => {
  console.error('应用初始化失败:', e)
})
