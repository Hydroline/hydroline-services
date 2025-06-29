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
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/user/ProfileView.vue'),
    meta: { title: '个人资料' }
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('../views/services/ServicesView.vue'),
    meta: { title: '服务' }
  },
  {
    path: '/business',
    name: 'Business',
    component: () => import('../views/business/BusinessView.vue'),
    meta: { title: '业务' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/settings/SettingsView.vue'),
    meta: { title: '设置' }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: () => import('../views/auth/AuthCallbackView.vue'),
    meta: { title: 'SSO 登录' }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.user && authStorage.hasValidTokens()) {
    try {
      await authStore.initAuth()
    } catch (error) {
      console.error('认证初始化失败:', error)
      authStorage.clearTokens()
    }
  }
  
  if (to.meta.title) {
    document.title = `${to.meta.title} - Hydroline Services`
  } else {
    document.title = 'Hydroline Services'
  }
  
  next()
})

export default router
