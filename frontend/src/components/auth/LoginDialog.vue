<script lang="ts" setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  authApi,
  type OAuthProvider,
  type LoginData,
  type RegisterData,
} from '@/api/auth'
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
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface Props {
  open: boolean
  defaultTab?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
  defaultTab: 'login',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: [user: any]
}>()

const authStore = useAuthStore()

const activeTab = ref<'login' | 'register'>(props.defaultTab)
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const oauthProviders = ref<OAuthProvider[]>([])

const loginForm = reactive<LoginData>({
  username: '',
  password: '',
})

const registerForm = reactive<RegisterData>({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  displayName: '',
  minecraftNick: '',
  minecraftUuid: '',
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const isLoginFormValid = computed(() => {
  return loginForm.username.length >= 3 && loginForm.password.length >= 6
})

const isRegisterFormValid = computed(() => {
  const errors = getRegisterFormErrors()
  return (
    Object.keys(errors).length === 0 &&
    registerForm.username.length >= 3 &&
    registerForm.password.length >= 6 &&
    registerForm.password === registerForm.confirmPassword
  )
})

const getRegisterFormErrors = () => {
  const errors: Record<string, string> = {}

  if (registerForm.username && registerForm.username.length < 3) {
    errors.username = '用户名至少需要3个字符'
  }

  if (
    registerForm.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)
  ) {
    errors.email = '请输入有效的邮箱地址'
  }

  if (registerForm.password && registerForm.password.length < 6) {
    errors.password = '密码至少需要6个字符'
  }

  if (
    registerForm.confirmPassword &&
    registerForm.password !== registerForm.confirmPassword
  ) {
    errors.confirmPassword = '密码确认不匹配'
  }

  if (
    registerForm.minecraftNick &&
    (registerForm.minecraftNick.length < 3 ||
      registerForm.minecraftNick.length > 16)
  ) {
    errors.minecraftNick = 'Minecraft昵称应为3-16个字符'
  }

  if (
    registerForm.minecraftUuid &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      registerForm.minecraftUuid,
    )
  ) {
    errors.minecraftUuid = '请输入有效的UUID格式'
  }

  return errors
}

const registerFormErrors = computed(() => getRegisterFormErrors())

const loadOAuthProviders = async () => {
  if (!config.features.oauth) return

  try {
    const response = await authApi.getOAuthProviders()
    const providers = response.data.data.providers || []
    oauthProviders.value = providers.filter(
      (provider) =>
        provider.enabled && config.oauth.providers.includes(provider.id),
    )
  } catch (error) {
    console.error('获取OAuth提供商失败:', error)
  }
}

const handleLogin = async () => {
  if (!isLoginFormValid.value) return

  isLoading.value = true
  try {
    const userData = await authStore.login(loginForm)
    emit('success', userData)
    closeDialog()
  } catch (error) {
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!isRegisterFormValid.value) return

  isLoading.value = true
  try {
    const registerData = {
      username: registerForm.username,
      password: registerForm.password,
      ...(registerForm.email && { email: registerForm.email }),
      ...(registerForm.displayName && {
        displayName: registerForm.displayName,
      }),
      ...(registerForm.minecraftNick && {
        minecraftNick: registerForm.minecraftNick,
      }),
      ...(registerForm.minecraftUuid && {
        minecraftUuid: registerForm.minecraftUuid,
      }),
    }

    const userData = await authStore.register(registerData)
    emit('success', userData)
    closeDialog()
  } catch (error) {
  } finally {
    isLoading.value = false
  }
}

const handleOAuthLogin = async (provider: string) => {
  try {
    await authStore.loginWithOAuth(provider)
  } catch (error) {}
}

const getProviderIcon = (providerId: string) => {
  const iconMap: Record<string, string> = {
    microsoft: '🪟',
    qq: '🐧',
    wechat: '💬',
    discord: '🎮',
  }
  return iconMap[providerId] || '🔗'
}

const closeDialog = () => {
  isOpen.value = false
  Object.assign(loginForm, { username: '', password: '' })
  Object.assign(registerForm, {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    minecraftNick: '',
    minecraftUuid: '',
  })
}

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      activeTab.value = props.defaultTab
      loadOAuthProviders()
    }
  },
)

onMounted(() => {
  if (props.open) {
    loadOAuthProviders()
  }
})
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="flex gap-0 p-0 w-240 h-140 !max-w-[unset] overflow-hidden border-0"
    >
      <div class="poster justify-end flex-2/5 relative">
        <div
          class="background absolute left-0 right-0 top-0 bottom-0 select-none"
        >
          <img
            src="@/assets/images/test_3.webp"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="blur-mask absolute left-0 right-0 top-0 bottom-0"></div>
        <div class="foreground w-full h-full">
          <DialogHeader
            class="relative w-full h-full flex flex-col justify-end p-6"
          >
            <DialogTitle>
              <div class="text-4xl font-semibold text-white tracking-tight">Hydroline</div>
              <div class="text-sm text-white/70 mt-0.5">代码 创意 探索无限</div>
            </DialogTitle>
            <DialogDescription>
              <div
                class="grid w-full grid-cols-2 gap-1 p-1 bg-muted rounded-lg"
              >
                <button
                  type="button"
                  @click="activeTab = 'login'"
                  :class="[
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    activeTab === 'login'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted-foreground/10',
                  ]"
                >
                  登录
                </button>
                <button
                  type="button"
                  @click="activeTab = 'register'"
                  :disabled="!config.features.registration"
                  :class="[
                    'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                    activeTab === 'register'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted-foreground/10',
                  ]"
                >
                  注册
                </button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </div>
      </div>

      <div class="py-12 px-9 flex-3/5 overflow-y-auto">
        <Tabs v-model="activeTab" class="w-full min-h-full">
          <TabsContent value="login" class="flex-1 flex flex-col px-2">
            <form
              @submit.prevent="handleLogin"
              class="flex-1 flex flex-col gap-4"
            >
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
                    <span class="material-icons !block text-lg">
                      {{ showPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                class="w-full h-11 mt-auto"
                :disabled="isLoading || !isLoginFormValid"
              >
                <span
                  v-if="isLoading"
                  class="material-icons !block animate-spin mr-2"
                  >refresh</span
                >
                {{ isLoading ? '登录中...' : '登录' }}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" class="flex-1 flex flex-col px-2">
            <form
              @submit.prevent="handleRegister"
              class="flex-1 flex flex-col gap-4"
            >
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
                  <p
                    v-if="registerFormErrors.username"
                    class="text-sm text-red-500"
                  >
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
                  <p
                    v-if="registerFormErrors.email"
                    class="text-sm text-red-500"
                  >
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
                      <span class="material-icons !block text-lg">
                        {{ showPassword ? 'visibility_off' : 'visibility' }}
                      </span>
                    </button>
                  </div>
                  <p
                    v-if="registerFormErrors.password"
                    class="text-sm text-red-500"
                  >
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
                      :class="{
                        'border-red-500': registerFormErrors.confirmPassword,
                      }"
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <span class="material-icons !block text-lg">
                        {{
                          showConfirmPassword ? 'visibility_off' : 'visibility'
                        }}
                      </span>
                    </button>
                  </div>
                  <p
                    v-if="registerFormErrors.confirmPassword"
                    class="text-sm text-red-500"
                  >
                    {{ registerFormErrors.confirmPassword }}
                  </p>
                </div>
              </div>

              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-icons !block text-green-600"
                    >videogame_asset</span
                  >
                  <Label class="text-base font-medium"
                    >Minecraft 信息（可选）</Label
                  >
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
                    :class="{
                      'border-red-500': registerFormErrors.minecraftNick,
                    }"
                  />
                  <p
                    v-if="registerFormErrors.minecraftNick"
                    class="text-sm text-red-500"
                  >
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
                    :class="{
                      'border-red-500': registerFormErrors.minecraftUuid,
                    }"
                  />
                  <p
                    v-if="registerFormErrors.minecraftUuid"
                    class="text-sm text-red-500"
                  >
                    {{ registerFormErrors.minecraftUuid }}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                class="w-full h-11 mt-auto"
                :disabled="isLoading || !isRegisterFormValid"
              >
                <span
                  v-if="isLoading"
                  class="material-icons !block animate-spin mr-2"
                  >refresh</span
                >
                {{ isLoading ? '注册中...' : '立即注册' }}
              </Button>
            </form>
          </TabsContent>

          <div v-if="oauthProviders.length > 0" class="space-y-4 mt-4 p-2">
            <div class="relative">
              <Separator />
              <div
                class="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
              >
                <span class="bg-white px-3 text-sm text-gray-500">
                  使用第三方账户{{ activeTab === 'login' ? '登录' : '注册' }}
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
        </Tabs>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style lang="scss">
[data-slot='dialog-overlay'] {
  backdrop-filter: blur(8px);
}

.blur-mask {
  backdrop-filter: blur(64px) saturate(150%);
  mask: linear-gradient(to top, #fff 0%, transparent 45%);
  pointer-events: none;
  background: var(--background-dark-2);
}
</style>
