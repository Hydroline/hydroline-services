import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { authApi, type UserInfo, type LoginData, type RegisterData } from '@/api/auth'
import { config } from '@/config'
import { authStorage } from '@/lib/storage'
import { toast } from 'vue-sonner'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<UserInfo | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => !!user.value)

  // 初始化认证状态
  const initAuth = async () => {
    if (authStorage.hasValidTokens()) {
      try {
        await fetchUserProfile()
      } catch (error) {
        console.error('初始化认证失败:', error)
        clearAuth()
      }
    }
  }

  // 获取用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await authApi.getProfile()
      user.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登录
  const login = async (data: LoginData) => {
    isLoading.value = true
    try {
      const response = await authApi.login(data)
      
      const { user: userData, accessToken, refreshToken } = response.data.data
      
      if (!userData) {
        throw new Error('用户信息为空')
      }
      
      if (!accessToken || !refreshToken) {
        throw new Error('Token信息不完整')
      }
      
      // 存储tokens
      authStorage.setTokens(accessToken, refreshToken)
      
      // 设置用户信息
      user.value = userData
      
      // 安全地访问用户显示名称
      const displayName = userData.displayName || userData.username || '用户'
      
      toast.success('登录成功', {
        description: `欢迎回来，${displayName}！`
      })
      
      return userData
    } catch (error: any) {
      console.error('登录过程中发生错误:', error)
      const message = error.response?.data?.message || error.message || '登录失败'
      toast.error('登录失败', {
        description: message
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 注册
  const register = async (data: RegisterData) => {
    isLoading.value = true
    try {
      const response = await authApi.register(data)
      
      const { user: userData, accessToken, refreshToken } = response.data.data
      
      if (!userData) {
        throw new Error('用户信息为空')
      }
      
      if (!accessToken || !refreshToken) {
        throw new Error('Token信息不完整')
      }
      
      // 存储tokens
      authStorage.setTokens(accessToken, refreshToken)
      
      // 设置用户信息
      user.value = userData
      
      // 安全地访问用户显示名称
      const displayName = userData.displayName || userData.username || '用户'
      
      toast.success('注册成功', {
        description: `欢迎加入，${displayName}！`
      })
      
      return userData
    } catch (error: any) {
      console.error('注册过程中发生错误:', error)
      const message = error.response?.data?.message || error.message || '注册失败'
      toast.error('注册失败', {
        description: message
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // OAuth登录
  const loginWithOAuth = async (provider: string) => {
    try {
      // 直接跳转到OAuth登录URL
      window.location.href = `/api/auth/oauth/${provider}`
    } catch (error: any) {
      const message = error.response?.data?.message || 'OAuth登录失败'
      toast.error('登录失败', {
        description: message
      })
      throw error
    }
  }

  // SSO登录（用于跨系统单点登录）
  const loginWithSSO = async (provider: string) => {
    try {
      const response = await authApi.generateSSOUrl(provider)
      // 重定向到SSO提供商
      window.location.href = response.data.data.redirectUrl
    } catch (error: any) {
      const message = error.response?.data?.message || 'SSO登录失败'
      toast.error('登录失败', {
        description: message
      })
      throw error
    }
  }

  // 登出
  const logout = async () => {
    isLoading.value = true
    try {
      await authApi.logout()
      clearAuth()
      toast.success('已安全退出')
    } catch (error) {
      // 即使API调用失败，也要清除本地数据
      clearAuth()
      toast.success('已退出登录')
    } finally {
      isLoading.value = false
    }
  }

  // 清除认证信息
  const clearAuth = () => {
    user.value = null
    authStorage.clearTokens()
  }

  // 修改密码
  const changePassword = async (oldPassword: string, newPassword: string) => {
    isLoading.value = true
    try {
      await authApi.changePassword({ oldPassword, newPassword })
      toast.success('密码修改成功')
    } catch (error: any) {
      const message = error.response?.data?.message || '密码修改失败'
      toast.error('修改失败', {
        description: message
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // 更新用户信息
  const updateUserInfo = (newUserInfo: Partial<UserInfo>) => {
    if (user.value) {
      user.value = { ...user.value, ...newUserInfo }
    }
  }

  // 检查用户权限
  const hasPermission = (permission: string): boolean => {
    if (!user.value?.roles) return false
    
    // 如果是超级管理员，拥有所有权限
    if (user.value.roles.includes('super_admin')) return true
    
    // TODO: 实现更细粒度的权限检查
    // 这里需要根据角色权限映射来检查
    return user.value.roles.some(role => 
      role === 'admin' || role === 'moderator'
    )
  }

  // 检查用户角色
  const hasRole = (role: string): boolean => {
    return user.value?.roles?.includes(role) || false
  }

  return {
    // 状态
    user: readonly(user),
    isLoading: readonly(isLoading),
    isAuthenticated,
    
    // 方法
    initAuth,
    fetchUserProfile,
    login,
    register,
    loginWithOAuth,
    loginWithSSO,
    logout,
    clearAuth,
    changePassword,
    updateUserInfo,
    hasPermission,
    hasRole
  }
}) 