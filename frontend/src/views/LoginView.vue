<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi, type OAuthProvider } from '@/api/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const formData = reactive({
  username: '',
  password: '',
})

// 状态
const isLoading = ref(false)
const showPassword = ref(false)
const oauthProviders = ref<OAuthProvider[]>([])

// 获取OAuth提供商列表
const loadOAuthProviders = async () => {
  try {
    const response = await authApi.getOAuthProviders()
    oauthProviders.value = response.data.providers.filter(provider => provider.enabled)
  } catch (error) {
    console.error('获取OAuth提供商失败:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    return
  }

  console.log('开始登录流程...')
  isLoading.value = true
  
  try {
    console.log('调用 authStore.login...')
    await authStore.login({
      username: formData.username,
      password: formData.password,
    })

    console.log('登录成功，认证状态:', authStore.isAuthenticated)
    console.log('用户信息:', authStore.user)
    
    // 登录成功，跳转到首页
    console.log('准备跳转到首页...')
    await router.push('/')
    console.log('跳转完成')
  } catch (error) {
    console.error('登录失败:', error)
    // 错误已在store中处理
  } finally {
    isLoading.value = false
  }
}

// 处理OAuth登录
const handleOAuthLogin = async (provider: string) => {
  try {
    await authStore.loginWithOAuth(provider)
  } catch (error) {
    // 错误已在store中处理
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 获取提供商图标
const getProviderIcon = (providerId: string) => {
  const iconMap: Record<string, string> = {
    microsoft: '🪟',
    qq: '🐧',
    wechat: '💬',
    discord: '🎮',
  }
  return iconMap[providerId] || '🔗'
}

onMounted(() => {
  loadOAuthProviders()
  
  // 如果用户已经登录，直接跳转到首页
  if (authStore.isAuthenticated) {
    console.log('用户已登录，跳转到首页')
    router.push('/')
  }
})
</script>

<template>
  <div class="login-page min-h-screen flex items-center justify-center p-4">
    <div class="login-container w-full max-w-md">
      <!-- 登录卡片 -->
      <Card class="w-full shadow-xl border-0">
        <CardHeader class="pb-6">
          <CardTitle class="text-xl text-center">账户登录</CardTitle>
          <CardDescription class="text-center">
            使用您的用户名或邮箱登录
          </CardDescription>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- 登录表单 -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <div class="space-y-2">
              <Label for="username">用户名或邮箱</Label>
              <Input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="请输入用户名或邮箱"
                required
                :disabled="isLoading"
                class="h-11"
              />
            </div>

            <div class="space-y-2">
              <Label for="password">密码</Label>
              <div class="relative">
                <Input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  required
                  :disabled="isLoading"
                  class="h-11 pr-10"
                />
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <span class="material-icons text-lg">
                    {{ showPassword ? 'visibility_off' : 'visibility' }}
                  </span>
                </button>
              </div>
            </div>

            <Button
              type="submit"
              class="w-full h-11"
              :disabled="isLoading || !formData.username || !formData.password"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-2"
                >refresh</span
              >
              {{ isLoading ? '登录中...' : '登录' }}
            </Button>
          </form>

          <!-- OAuth登录 -->
          <div v-if="oauthProviders.length > 0">
            <div class="relative">
              <Separator />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="bg-white px-4 text-sm text-gray-500"
                  >或使用第三方账户登录</span
                >
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 mt-6">
              <Button
                v-for="provider in oauthProviders"
                :key="provider.id"
                variant="outline"
                class="h-11"
                @click="handleOAuthLogin(provider.id)"
              >
                <span class="mr-2">{{ getProviderIcon(provider.id) }}</span>
                {{ provider.name }}
              </Button>
            </div>
          </div>

          <!-- 注册链接 -->
          <div class="text-center pt-4">
            <p class="text-sm text-gray-600">
              还没有账户？
              <button
                @click="goToRegister"
                class="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                立即注册
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
