<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi, type OAuthProvider } from '@/api/auth'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  minecraftNick: '',
  minecraftUuid: ''
})

// 状态
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const oauthProviders = ref<OAuthProvider[]>([])

// 表单验证
const validation = computed(() => {
  const errors: Record<string, string> = {}
  
  if (formData.username && formData.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  }
  
  if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = '请输入有效的邮箱地址'
  }
  
  if (formData.password && formData.password.length < 6) {
    errors.password = '密码至少需要6个字符'
  }
  
  if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
    errors.confirmPassword = '密码确认不匹配'
  }
  
  if (formData.minecraftNick && (formData.minecraftNick.length < 3 || formData.minecraftNick.length > 16)) {
    errors.minecraftNick = 'Minecraft昵称应为3-16个字符'
  }
  
  if (formData.minecraftUuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(formData.minecraftUuid)) {
    errors.minecraftUuid = '请输入有效的UUID格式'
  }
  
  return errors
})

const isFormValid = computed(() => {
  return formData.username.length >= 3 &&
         formData.password.length >= 6 &&
         formData.password === formData.confirmPassword &&
         (!formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) &&
         Object.keys(validation.value).length === 0
})

// 获取OAuth提供商列表
const loadOAuthProviders = async () => {
  try {
    const response = await authApi.getOAuthProviders()
    oauthProviders.value = response.data.providers.filter(provider => provider.enabled)
  } catch (error) {
    console.error('获取OAuth提供商失败:', error)
  }
}

// 处理注册
const handleRegister = async () => {
  if (!isFormValid.value) {
    return
  }

  console.log('开始注册流程...')
  isLoading.value = true
  try {
    const registerData = {
      username: formData.username,
      password: formData.password,
      ...(formData.email && { email: formData.email }),
      ...(formData.displayName && { displayName: formData.displayName }),
      ...(formData.minecraftNick && { minecraftNick: formData.minecraftNick }),
      ...(formData.minecraftUuid && { minecraftUuid: formData.minecraftUuid })
    }
    
    console.log('调用 authStore.register...')
    await authStore.register(registerData)
    
    console.log('注册成功，认证状态:', authStore.isAuthenticated)
    console.log('用户信息:', authStore.user)
    
    // 注册成功，跳转到首页
    console.log('准备跳转到首页...')
    await router.push('/')
    console.log('跳转完成')
  } catch (error) {
    console.error('注册失败:', error)
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

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

// 获取提供商图标
const getProviderIcon = (providerId: string) => {
  const iconMap: Record<string, string> = {
    microsoft: '🪟',
    qq: '🐧',
    wechat: '💬',
    discord: '🎮'
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
  <div class="register-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="register-container w-full max-w-md">
      <!-- Logo区域 -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4">
          <img src="/src/assets/logo/Hydroline_Logo_Short.svg" alt="Hydroline" class="w-10 h-10" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Hydroline Services</h1>
        <p class="text-gray-600 mt-1">创建您的新账户</p>
      </div>

      <!-- 注册卡片 -->
      <Card class="w-full shadow-xl border-0">
        <CardHeader class="pb-6">
          <CardTitle class="text-xl text-center">账户注册</CardTitle>
          <CardDescription class="text-center">
            填写基本信息完成注册
          </CardDescription>
        </CardHeader>
        
        <CardContent class="space-y-6">
          <!-- 注册表单 -->
          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- 基本信息 -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="username">用户名 *</Label>
                <Input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  placeholder="请输入用户名（至少3个字符）"
                  required
                  :disabled="isLoading"
                  class="h-11"
                  :class="{ 'border-red-500': validation.username }"
                />
                <p v-if="validation.username" class="text-sm text-red-500">
                  {{ validation.username }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="email">邮箱地址</Label>
                <Input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  placeholder="请输入邮箱地址（可选）"
                  :disabled="isLoading"
                  class="h-11"
                  :class="{ 'border-red-500': validation.email }"
                />
                <p v-if="validation.email" class="text-sm text-red-500">
                  {{ validation.email }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="displayName">显示名称</Label>
                <Input
                  id="displayName"
                  v-model="formData.displayName"
                  type="text"
                  placeholder="请输入显示名称（可选）"
                  :disabled="isLoading"
                  class="h-11"
                />
              </div>
            </div>

            <!-- 密码设置 -->
            <div class="space-y-4">
              <div class="space-y-2">
                <Label for="password">密码 *</Label>
                <div class="relative">
                  <Input
                    id="password"
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="请输入密码（至少6个字符）"
                    required
                    :disabled="isLoading"
                    class="h-11 pr-10"
                    :class="{ 'border-red-500': validation.password }"
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
                <p v-if="validation.password" class="text-sm text-red-500">
                  {{ validation.password }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="confirmPassword">确认密码 *</Label>
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    v-model="formData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="请再次输入密码"
                    required
                    :disabled="isLoading"
                    class="h-11 pr-10"
                    :class="{ 'border-red-500': validation.confirmPassword }"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <span class="material-icons text-lg">
                      {{ showConfirmPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
                <p v-if="validation.confirmPassword" class="text-sm text-red-500">
                  {{ validation.confirmPassword }}
                </p>
              </div>
            </div>

            <!-- Minecraft信息 -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 pt-2">
                <span class="material-icons text-green-600">videogame_asset</span>
                <Label class="text-base font-medium">Minecraft 信息（可选）</Label>
              </div>
              
              <div class="space-y-2">
                <Label for="minecraftNick">Minecraft 昵称</Label>
                <Input
                  id="minecraftNick"
                  v-model="formData.minecraftNick"
                  type="text"
                  placeholder="请输入 Minecraft 游戏昵称"
                  :disabled="isLoading"
                  class="h-11"
                  :class="{ 'border-red-500': validation.minecraftNick }"
                />
                <p v-if="validation.minecraftNick" class="text-sm text-red-500">
                  {{ validation.minecraftNick }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="minecraftUuid">Minecraft UUID</Label>
                <Input
                  id="minecraftUuid"
                  v-model="formData.minecraftUuid"
                  type="text"
                  placeholder="请输入 Minecraft UUID（可选）"
                  :disabled="isLoading"
                  class="h-11"
                  :class="{ 'border-red-500': validation.minecraftUuid }"
                />
                <p v-if="validation.minecraftUuid" class="text-sm text-red-500">
                  {{ validation.minecraftUuid }}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              class="w-full h-11"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading" class="material-icons animate-spin mr-2">refresh</span>
              {{ isLoading ? '注册中...' : '立即注册' }}
            </Button>
          </form>

          <!-- OAuth登录 -->
          <div v-if="oauthProviders.length > 0">
            <div class="relative">
              <Separator />
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="bg-white px-4 text-sm text-gray-500">或使用第三方账户注册</span>
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

          <!-- 登录链接 -->
          <div class="text-center pt-4">
            <p class="text-sm text-gray-600">
              已有账户？
              <button
                @click="goToLogin"
                class="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                立即登录
              </button>
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- 底部信息 -->
      <div class="text-center mt-8 text-sm text-gray-500">
        <p>© 2024 Hydroline Services. 保留所有权利。</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-page {
  font-family: "Inter", "Helvetica Neue", "Helvetica", "Roboto", "BlinkMacSystemFont", "MiSans", "HarmonyOS Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  
  .register-container {
    animation: fadeInUp 0.6s ease-out;
  }
}

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