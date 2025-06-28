import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authStorage } from '@/lib/storage'

const routes = [
  { 
    path: '/', 
    name: 'Dashboard', 
    component: () => import('../views/dashboard/DashboardView.vue'), 
    meta: { title: '仪表盘', hideTitle: true } 
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/auth/AuthCallbackView.vue'),
    meta: { title: '登录回调' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/ProfileView.vue'),
    meta: { title: '个人资料' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/settings/SettingsView.vue'),
    meta: { title: '设置' }
  },
  {
    path: '/player',
    name: 'Player',
    component: () => import('../views/player/PlayerView.vue'),
    meta: { title: '玩家管理' }
  },
  {
    path: '/minecraft',
    name: 'Minecraft',
    component: () => import('../views/minecraft/MinecraftView.vue'),
    meta: { title: 'Minecraft 服务器' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫 - 移除强制登录，改为初始化认证状态
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果用户未初始化认证状态，且有有效token，先初始化
  if (!authStore.user && authStorage.hasValidTokens()) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('认证初始化失败:', error)
      // 如果初始化失败，清除无效token
      authStorage.clearTokens()
    }
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Hydroline Services`
  } else {
    document.title = 'Hydroline Services'
  }
  
  next()
})

export default router
