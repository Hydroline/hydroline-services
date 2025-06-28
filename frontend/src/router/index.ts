import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authStorage } from '@/lib/storage'

const routes = [
  { 
    path: '/', 
    name: 'Dashboard', 
    component: () => import('../views/DashboardView.vue'), 
    meta: { title: '仪表盘', requiresAuth: true } 
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { title: '注册', requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { title: '个人资料', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/DashboardView.vue'), // 暂时使用仪表盘
    meta: { title: '设置', requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
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
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    console.log('需要认证，跳转到登录页')
    next('/login')
    return
  }
  
  // 检查是否需要访客身份（已登录用户不能访问登录/注册页）
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    console.log('已登录用户访问登录页，跳转到首页')
    next('/')
    return
  }
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Hydroline Services`
  }
  
  next()
})

export default router
