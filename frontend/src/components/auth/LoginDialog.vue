<!--
  登录对话框组件
  合并登录和注册功能，支持OAuth和SSO登录
-->
<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi, type OAuthProvider, type LoginData, type RegisterData } from '@/api/auth'
import { config } from '@/config'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

// Props
interface Props {
  open: boolean
  defaultTab?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'login'
})

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [user: any]
}>()

// Store
const authStore = useAuthStore()

// 状态
const activeTab = ref<'login' | 'register'>(props.defaultTab)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const oauthProviders = ref<OAuthProvider[]>([])

// 表单数据
const loginForm = reactive<LoginData>({
  username: '',
  password: ''
})

const registerForm = reactive<RegisterData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  minecraftNick: '',
  minecraftUuid: ''
})

// 计算属性
const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
})

const isLoginFormValid = computed(() => {
  return loginForm.username.length >= 3 && loginForm.password.length >= 6
})

const isRegisterFormValid = computed(() => {
  const errors = getRegisterFormErrors()
  return Object.keys(errors).length === 0 && 
         registerForm.username.length >= 3 &&
         registerForm.password.length >= 6 &&
         registerForm.password === registerForm.confirmPassword
})

// 注册表单验证
const getRegisterFormErrors = () => {
  const errors: Record<string, string> = {}
  
  if (registerForm.username && registerForm.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  }
  
  if (registerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.email = '请输入有效的邮箱地址'
  }
  
  if (registerForm.password && registerForm.password.length < 6) {
    errors.password = '密码至少需要6个字符'
  }
  
  if (registerForm.confirmPassword && registerForm.password !== registerForm.confirmPassword) {
    errors.confirmPassword = '密码确认不匹配'
  }
  
  if (registerForm.minecraftNick && (registerForm.minecraftNick.length < 3 || registerForm.minecraftNick.length > 16)) {
    errors.minecraftNick = 'Minecraft昵称应为3-16个字符'
  }
  
  if (registerForm.minecraftUuid && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(registerForm.minecraftUuid)) {
    errors.minecraftUuid = '请输入有效的UUID格式'
  }
  
  return errors
}

const registerFormErrors = computed(() => getRegisterFormErrors())

// 获取OAuth提供商列表
const loadOAuthProviders = async () => {
  if (!config.features.oauth) return
  
  try {
    const response = await authApi.getOAuthProviders()
    const providers = response.data.data.providers || []
    oauthProviders.value = providers.filter(provider => 
      provider.enabled && config.oauth.providers.includes(provider.id)
    )
  } catch (error) {
    console.error('获取OAuth提供商失败:', error)
  }
}

// 处理登录
const handleLogin = async () => {
  if (!isLoginFormValid.value) return

  isLoading.value = true
  try {
    const userData = await authStore.login(loginForm)
    emit('success', userData)
    closeDialog()
  } catch (error) {
    // 错误已在store中处理
  } finally {
    isLoading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!isRegisterFormValid.value) return

  isLoading.value = true
  try {
    const registerData = {
      username: registerForm.username,
      password: registerForm.password,
      ...(registerForm.email && { email: registerForm.email }),
      ...(registerForm.displayName && { displayName: registerForm.displayName }),
      ...(registerForm.minecraftNick && { minecraftNick: registerForm.minecraftNick }),
      ...(registerForm.minecraftUuid && { minecraftUuid: registerForm.minecraftUuid })
    }
    
    const userData = await authStore.register(registerData)
    emit('success', userData)
    closeDialog()
  } catch (error) {
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

// 关闭对话框
const closeDialog = () => {
  isOpen.value = false
  // 重置表单
  Object.assign(loginForm, { username: '', password: '' })
  Object.assign(registerForm, {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    minecraftNick: '',
    minecraftUuid: ''
  })
}

// 监听open变化
watch(() => props.open, (newValue) => {
  if (newValue) {
    activeTab.value = props.defaultTab
    loadOAuthProviders()
  }
})

onMounted(() => {
  if (props.open) {
    loadOAuthProviders()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md backdrop-blur-sm">
      <DialogHeader>
        <DialogTitle class="text-center text-xl">
          <span class="flex items-center justify-center gap-2">
            <img src="/src/assets/logo/Hydroline_Logo_Short.svg" alt="Logo" class="w-6 h-6" />
            {{ config.app.title }}
          </span>
        </DialogTitle>
        <DialogDescription class="text-center">
          {{ activeTab === 'login' ? '登录您的账户' : '创建新账户' }}
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-6">
        <Tabs v-model="activeTab" class="w-full">
          <TabsList class="grid w-full grid-cols-2">
            <TabsTrigger value="login">登录</TabsTrigger>
            <TabsTrigger 
              value="register" 
              :disabled="!config.features.registration"
            >
              注册
            </TabsTrigger>
          </TabsList>

          <!-- 登录表单 -->
          <TabsContent value="login" class="space-y-4 mt-6">
            <form @submit.prevent="handleLogin" class="space-y-4">
              <div class="space-y-2">
                <Label for="login-username">用户名或邮箱</Label>
                <Input
                  id="login-username"
                  v-model="loginForm.username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  required
                  :disabled="isLoading"
                  class="h-11"
                />
              </div>

              <div class="space-y-2">
                <Label for="login-password">密码</Label>
                <div class="relative">
                  <Input
                    id="login-password"
                    v-model="loginForm.password"
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
                :disabled="isLoading || !isLoginFormValid"
              >
                <span v-if="isLoading" class="material-icons animate-spin mr-2">refresh</span>
                {{ isLoading ? '登录中...' : '登录' }}
              </Button>
            </form>
          </TabsContent>

          <!-- 注册表单 -->
          <TabsContent value="register" class="space-y-4 mt-6">
            <form @submit.prevent="handleRegister" class="space-y-4">
              <!-- 基本信息 -->
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="register-username">用户名 *</Label>
                  <Input
                    id="register-username"
                    v-model="registerForm.username"
                    type="text"
                    placeholder="请输入用户名（至少3个字符）"
                    required
                    :disabled="isLoading"
                    class="h-11"
                    :class="{ 'border-red-500': registerFormErrors.username }"
                  />
                  <p v-if="registerFormErrors.username" class="text-sm text-red-500">
                    {{ registerFormErrors.username }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="register-email">邮箱地址</Label>
                  <Input
                    id="register-email"
                    v-model="registerForm.email"
                    type="email"
                    placeholder="请输入邮箱地址（可选）"
                    :disabled="isLoading"
                    class="h-11"
                    :class="{ 'border-red-500': registerFormErrors.email }"
                  />
                  <p v-if="registerFormErrors.email" class="text-sm text-red-500">
                    {{ registerFormErrors.email }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="register-displayName">显示名称</Label>
                  <Input
                    id="register-displayName"
                    v-model="registerForm.displayName"
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
                  <Label for="register-password">密码 *</Label>
                  <div class="relative">
                    <Input
                      id="register-password"
                      v-model="registerForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="请输入密码（至少6个字符）"
                      required
                      :disabled="isLoading"
                      class="h-11 pr-10"
                      :class="{ 'border-red-500': registerFormErrors.password }"
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
                  <p v-if="registerFormErrors.password" class="text-sm text-red-500">
                    {{ registerFormErrors.password }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="register-confirmPassword">确认密码 *</Label>
                  <div class="relative">
                    <Input
                      id="register-confirmPassword"
                      v-model="registerForm.confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="请再次输入密码"
                      required
                      :disabled="isLoading"
                      class="h-11 pr-10"
                      :class="{ 'border-red-500': registerFormErrors.confirmPassword }"
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
                  <p v-if="registerFormErrors.confirmPassword" class="text-sm text-red-500">
                    {{ registerFormErrors.confirmPassword }}
                  </p>
                </div>
              </div>

              <!-- Minecraft信息 -->
              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-green-600">videogame_asset</span>
                  <Label class="text-base font-medium">Minecraft 信息（可选）</Label>
                </div>
                
                <div class="space-y-2">
                  <Label for="register-minecraftNick">Minecraft 昵称</Label>
                  <Input
                    id="register-minecraftNick"
                    v-model="registerForm.minecraftNick"
                    type="text"
                    placeholder="请输入 Minecraft 游戏昵称"
                    :disabled="isLoading"
                    class="h-11"
                    :class="{ 'border-red-500': registerFormErrors.minecraftNick }"
                  />
                  <p v-if="registerFormErrors.minecraftNick" class="text-sm text-red-500">
                    {{ registerFormErrors.minecraftNick }}
                  </p>
                </div>

                <div class="space-y-2">
                  <Label for="register-minecraftUuid">Minecraft UUID</Label>
                  <Input
                    id="register-minecraftUuid"
                    v-model="registerForm.minecraftUuid"
                    type="text"
                    placeholder="请输入 Minecraft UUID（可选）"
                    :disabled="isLoading"
                    class="h-11"
                    :class="{ 'border-red-500': registerFormErrors.minecraftUuid }"
                  />
                  <p v-if="registerFormErrors.minecraftUuid" class="text-sm text-red-500">
                    {{ registerFormErrors.minecraftUuid }}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                class="w-full h-11"
                :disabled="isLoading || !isRegisterFormValid"
              >
                <span v-if="isLoading" class="material-icons animate-spin mr-2">refresh</span>
                {{ isLoading ? '注册中...' : '立即注册' }}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <!-- OAuth登录 -->
        <div v-if="oauthProviders.length > 0" class="space-y-4">
          <div class="relative">
            <Separator />
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="bg-white px-3 text-sm text-gray-500">
                或使用第三方账户{{ activeTab === 'login' ? '登录' : '注册' }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
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
      </div>
    </DialogContent>
  </Dialog>
</template>

<style lang="scss" scoped>
:deep(.dialog-overlay) {
  backdrop-filter: blur(8px);
}
</style> 