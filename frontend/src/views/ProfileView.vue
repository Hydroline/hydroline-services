<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authApi, type UserInfo, type ChangePasswordData } from '@/api/auth'
import dayjs from 'dayjs'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'vue-sonner'

const authStore = useAuthStore()

// 用户信息编辑表单
const profileForm = reactive({
  displayName: '',
  email: '',
  minecraftNick: '',
  minecraftUuid: ''
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 状态
const isLoadingProfile = ref(false)
const isLoadingPassword = ref(false)
const isLoadingSessions = ref(false)
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const sessions = ref<any[]>([])

// 计算属性
const user = computed(() => authStore.user)

const passwordValidation = computed(() => {
  const errors: Record<string, string> = {}
  
  if (passwordForm.newPassword && passwordForm.newPassword.length < 6) {
    errors.newPassword = '新密码至少需要6个字符'
  }
  
  if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
    errors.confirmPassword = '密码确认不匹配'
  }
  
  return errors
})

const isPasswordFormValid = computed(() => {
  return passwordForm.oldPassword &&
         passwordForm.newPassword.length >= 6 &&
         passwordForm.newPassword === passwordForm.confirmPassword &&
         Object.keys(passwordValidation.value).length === 0
})

// 初始化表单数据
const initProfileForm = () => {
  if (user.value) {
    profileForm.displayName = user.value.displayName || ''
    profileForm.email = user.value.email || ''
    // TODO: 从API获取Minecraft信息
    profileForm.minecraftNick = ''
    profileForm.minecraftUuid = ''
  }
}

// 获取用户会话
const loadSessions = async () => {
  isLoadingSessions.value = true
  try {
    const response = await authApi.getSessions()
    sessions.value = response.data
  } catch (error: any) {
    console.error('获取会话失败:', error)
    toast.error('获取会话失败', {
      description: error.response?.data?.message || '未知错误'
    })
  } finally {
    isLoadingSessions.value = false
  }
}

// 保存个人信息
const saveProfile = async () => {
  isLoadingProfile.value = true
  try {
    // TODO: 实现用户信息更新API
    // const response = await authApi.updateProfile(profileForm)
    
    // 暂时更新本地状态
    authStore.updateUserInfo({
      displayName: profileForm.displayName,
      email: profileForm.email
    })
    
    toast.success('个人信息保存成功')
  } catch (error: any) {
    console.error('保存个人信息失败:', error)
    toast.error('保存失败', {
      description: error.response?.data?.message || '未知错误'
    })
  } finally {
    isLoadingProfile.value = false
  }
}

// 修改密码
const changePassword = async () => {
  if (!isPasswordFormValid.value) {
    return
  }

  isLoadingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    
    // 清空表单
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch (error) {
    // 错误已在store中处理
  } finally {
    isLoadingPassword.value = false
  }
}

// 撤销指定会话
const revokeSession = async (tokenId: string) => {
  try {
    await authApi.revokeSession(tokenId)
    toast.success('会话已撤销')
    await loadSessions()
  } catch (error: any) {
    console.error('撤销会话失败:', error)
    toast.error('撤销会话失败', {
      description: error.response?.data?.message || '未知错误'
    })
  }
}

// 撤销所有会话
const revokeAllSessions = async () => {
  try {
    await authApi.revokeAllSessions()
    toast.success('所有会话已撤销')
    await loadSessions()
  } catch (error: any) {
    console.error('撤销所有会话失败:', error)
    toast.error('撤销所有会话失败', {
      description: error.response?.data?.message || '未知错误'
    })
  }
}

// 格式化设备信息
const formatDeviceInfo = (deviceInfo: string) => {
  if (!deviceInfo) return '未知设备'
  
  // 简化User-Agent显示
  if (deviceInfo.includes('Chrome')) return '🌐 Chrome 浏览器'
  if (deviceInfo.includes('Firefox')) return '🦊 Firefox 浏览器'
  if (deviceInfo.includes('Safari')) return '🧭 Safari 浏览器'
  if (deviceInfo.includes('Edge')) return '🌊 Edge 浏览器'
  
  return '🖥️ ' + deviceInfo.substring(0, 30) + '...'
}

// 格式化时间
const formatTime = (time: string) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 获取角色显示文本
const getRoleText = (roles: string[]) => {
  const roleMap: Record<string, string> = {
    'super_admin': '超级管理员',
    'admin': '管理员',
    'moderator': '版主',
    'user': '普通用户'
  }
  
  return roles.map(role => roleMap[role] || role).join(', ')
}

onMounted(() => {
  initProfileForm()
  loadSessions()
})
</script>

<template>
  <div class="profile-page min-h-full p-6 max-w-4xl mx-auto">
    <!-- 页面标题 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">个人资料</h1>
      <p class="text-gray-600 mt-2">管理您的账户信息和安全设置</p>
    </div>

    <!-- 用户基本信息卡片 -->
    <Card class="mb-8">
      <CardContent class="p-6">
        <div class="flex items-center space-x-6">
          <Avatar class="w-20 h-20">
            <AvatarFallback class="text-2xl font-bold">
              {{ user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?' }}
            </AvatarFallback>
          </Avatar>
          
          <div class="flex-1">
            <h2 class="text-2xl font-bold">{{ user?.displayName || user?.username }}</h2>
            <p class="text-gray-600">@{{ user?.username }}</p>
            <p class="text-sm text-gray-500 mt-1">
              加入时间：{{ user?.createdAt ? formatTime(user.createdAt) : '未知' }}
            </p>
            
            <div class="flex items-center gap-4 mt-3">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="user?.isActive ? 'bg-green-500' : 'bg-red-500'"></span>
                <span class="text-sm">{{ user?.isActive ? '账户正常' : '账户禁用' }}</span>
              </div>
              
              <div v-if="user?.roles?.length" class="flex items-center gap-2">
                <span class="material-icons text-sm text-blue-600">admin_panel_settings</span>
                <span class="text-sm text-blue-600">{{ getRoleText(user.roles) }}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- 详细设置 -->
    <Tabs default-value="profile" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="profile">个人信息</TabsTrigger>
        <TabsTrigger value="security">安全设置</TabsTrigger>
        <TabsTrigger value="sessions">会话管理</TabsTrigger>
      </TabsList>

      <!-- 个人信息标签页 -->
      <TabsContent value="profile" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              更新您的基本个人信息
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <form @submit.prevent="saveProfile" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="displayName">显示名称</Label>
                  <Input
                    id="displayName"
                    v-model="profileForm.displayName"
                    placeholder="请输入显示名称"
                    :disabled="isLoadingProfile"
                  />
                </div>
                
                <div class="space-y-2">
                  <Label for="email">邮箱地址</Label>
                  <Input
                    id="email"
                    v-model="profileForm.email"
                    type="email"
                    placeholder="请输入邮箱地址"
                    :disabled="isLoadingProfile"
                  />
                </div>
              </div>

              <Separator />

              <div class="space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-icons text-green-600">videogame_asset</span>
                  <Label class="text-lg font-medium">Minecraft 信息</Label>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label for="minecraftNick">Minecraft 昵称</Label>
                    <Input
                      id="minecraftNick"
                      v-model="profileForm.minecraftNick"
                      placeholder="请输入 Minecraft 昵称"
                      :disabled="isLoadingProfile"
                    />
                  </div>
                  
                  <div class="space-y-2">
                    <Label for="minecraftUuid">Minecraft UUID</Label>
                    <Input
                      id="minecraftUuid"
                      v-model="profileForm.minecraftUuid"
                      placeholder="请输入 Minecraft UUID"
                      :disabled="isLoadingProfile"
                    />
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button
                  type="submit"
                  :disabled="isLoadingProfile"
                  class="min-w-[120px]"
                >
                  <span v-if="isLoadingProfile" class="material-icons animate-spin mr-2">refresh</span>
                  {{ isLoadingProfile ? '保存中...' : '保存更改' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 安全设置标签页 -->
      <TabsContent value="security" class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>修改密码</CardTitle>
            <CardDescription>
              定期更换密码以确保账户安全
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit.prevent="changePassword" class="space-y-4">
              <div class="space-y-2">
                <Label for="oldPassword">当前密码</Label>
                <div class="relative">
                  <Input
                    id="oldPassword"
                    v-model="passwordForm.oldPassword"
                    :type="showOldPassword ? 'text' : 'password'"
                    placeholder="请输入当前密码"
                    required
                    :disabled="isLoadingPassword"
                    class="pr-10"
                  />
                  <button
                    type="button"
                    @click="showOldPassword = !showOldPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <span class="material-icons text-lg">
                      {{ showOldPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <Label for="newPassword">新密码</Label>
                <div class="relative">
                  <Input
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    placeholder="请输入新密码（至少6个字符）"
                    required
                    :disabled="isLoadingPassword"
                    class="pr-10"
                    :class="{ 'border-red-500': passwordValidation.newPassword }"
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <span class="material-icons text-lg">
                      {{ showNewPassword ? 'visibility_off' : 'visibility' }}
                    </span>
                  </button>
                </div>
                <p v-if="passwordValidation.newPassword" class="text-sm text-red-500">
                  {{ passwordValidation.newPassword }}
                </p>
              </div>

              <div class="space-y-2">
                <Label for="confirmPassword">确认新密码</Label>
                <div class="relative">
                  <Input
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="请再次输入新密码"
                    required
                    :disabled="isLoadingPassword"
                    class="pr-10"
                    :class="{ 'border-red-500': passwordValidation.confirmPassword }"
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
                <p v-if="passwordValidation.confirmPassword" class="text-sm text-red-500">
                  {{ passwordValidation.confirmPassword }}
                </p>
              </div>

              <div class="flex justify-end">
                <Button
                  type="submit"
                  :disabled="isLoadingPassword || !isPasswordFormValid"
                  class="min-w-[120px]"
                >
                  <span v-if="isLoadingPassword" class="material-icons animate-spin mr-2">refresh</span>
                  {{ isLoadingPassword ? '修改中...' : '修改密码' }}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- 会话管理标签页 -->
      <TabsContent value="sessions" class="space-y-6">
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle>活动会话</CardTitle>
                <CardDescription>
                  管理您在不同设备上的登录会话
                </CardDescription>
              </div>
              <Button
                variant="outline"
                @click="revokeAllSessions"
                :disabled="isLoadingSessions"
              >
                撤销所有会话
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="isLoadingSessions" class="flex items-center justify-center py-8">
              <span class="material-icons animate-spin text-2xl">refresh</span>
            </div>
            
            <div v-else-if="sessions.length === 0" class="text-center py-8 text-gray-500">
              暂无活动会话
            </div>
            
            <div v-else class="space-y-4">
              <div
                v-for="session in sessions"
                :key="session.id"
                class="flex items-center justify-between p-4 border rounded-lg"
              >
                <div class="flex items-center space-x-4">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span class="material-icons text-blue-600">devices</span>
                  </div>
                  <div>
                    <p class="font-medium">{{ formatDeviceInfo(session.deviceInfo) }}</p>
                    <p class="text-sm text-gray-500">
                      IP: {{ session.ipAddress }} | 
                      最后活动: {{ formatTime(session.lastUsedAt) }}
                    </p>
                    <p class="text-xs text-gray-400">
                      创建时间: {{ formatTime(session.createdAt) }}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  @click="revokeSession(session.tokenId)"
                >
                  撤销
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  font-family: "Inter", "Helvetica Neue", "Helvetica", "Roboto", "BlinkMacSystemFont", "MiSans", "HarmonyOS Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style> 