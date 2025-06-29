<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { userApi, type UpdateProfileData } from '@/api/user'
import { toast } from 'vue-sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Store
const authStore = useAuthStore()

// 状态
const isLoading = ref(false)
const isEditing = ref(false)

// 表单数据
const profileForm = reactive<UpdateProfileData>({
  displayName: '',
  email: '',
})

// 计算属性
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 初始化表单数据
const initializeForm = () => {
  if (user.value) {
    profileForm.displayName = user.value.displayName || ''
    profileForm.email = user.value.email || ''
  }
}

// 保存资料
const saveProfile = async () => {
  if (!isAuthenticated.value) return

  isLoading.value = true
  try {
    const response = await userApi.updateProfile(profileForm)
    const updatedUser = response.data.data

    // 更新store中的用户信息
    authStore.updateUserInfo(updatedUser)

    toast.success('资料更新成功')
    isEditing.value = false
  } catch (error: any) {
    console.error('更新资料失败:', error)
    toast.error('更新失败', {
      description: error.response?.data?.message || '请稍后重试',
    })
  } finally {
    isLoading.value = false
  }
}

// 取消编辑
const cancelEdit = () => {
  initializeForm()
  isEditing.value = false
}

// 处理头像上传
const handleAvatarUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    toast.error('请选择图片文件')
    return
  }

  // 检查文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('图片大小不能超过2MB')
    return
  }

  isLoading.value = true
  try {
    const response = await userApi.uploadAvatar(file)
    const avatarUrl = response.data.data.avatarUrl

    // 更新用户信息
    authStore.updateUserInfo({ avatar: avatarUrl })

    toast.success('头像更新成功')
  } catch (error: any) {
    console.error('头像上传失败:', error)
    toast.error('上传失败', {
      description: error.response?.data?.message || '请稍后重试',
    })
  } finally {
    isLoading.value = false
  }
}

// 登录提示
const showLoginPrompt = () => {
  toast.info('请先登录', {
    description: '登录后即可查看和编辑个人资料',
  })
}

onMounted(() => {
  if (isAuthenticated.value) {
    initializeForm()
  }
})
</script>

<template>
  <div class="profile-page space-y-6 p-6 max-w-4xl mx-auto">
    <!-- 未登录提示 -->
    <Card v-if="!isAuthenticated" class="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-amber-800">
          <span class="material-icons">lock</span>
          需要登录
        </CardTitle>
        <CardDescription class="text-amber-700">
          请先登录以查看和编辑您的个人资料
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="showLoginPrompt"> 登录账户 </Button>
      </CardContent>
    </Card>

    <!-- 个人资料内容 -->
    <template v-else>
      <!-- 基本信息卡片 -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>您的基本账户信息</CardDescription>
            </div>
            <Button
              v-if="!isEditing"
              @click="isEditing = true"
              variant="outline"
            >
              <span class="material-icons mr-2">edit</span>
              编辑
            </Button>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <!-- 头像区域 -->
          <div class="flex items-center gap-6">
            <div class="relative">
              <Avatar class="w-24 h-24">
                <AvatarImage :src="user?.avatar" />
                <AvatarFallback class="text-xl">
                  {{
                    user?.displayName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    '?'
                  }}
                </AvatarFallback>
              </Avatar>

              <!-- 头像上传按钮 -->
              <label
                v-if="isEditing"
                class="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                title="更换头像"
              >
                <span class="material-icons text-sm">camera_alt</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                  :disabled="isLoading"
                />
              </label>
            </div>

            <div class="flex-1">
              <h3 class="text-lg font-semibold">
                {{ user?.displayName || user?.username }}
              </h3>
              <p class="text-muted-foreground">@{{ user?.username }}</p>
              <p class="text-sm text-muted-foreground mt-1">
                注册时间:
                {{ new Date(user?.createdAt || '').toLocaleDateString() }}
              </p>
            </div>
          </div>

          <Separator />

          <!-- 表单字段 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label for="username">用户名</Label>
              <Input
                id="username"
                :value="user?.username"
                disabled
                class="bg-gray-50"
              />
              <p class="text-xs text-muted-foreground">用户名不可修改</p>
            </div>

            <div class="space-y-2">
              <Label for="displayName">显示名称</Label>
              <Input
                id="displayName"
                v-model="profileForm.displayName"
                :disabled="!isEditing || isLoading"
                placeholder="输入显示名称"
              />
            </div>

            <div class="space-y-2">
              <Label for="email">邮箱地址</Label>
              <Input
                id="email"
                v-model="profileForm.email"
                type="email"
                :disabled="!isEditing || isLoading"
                placeholder="输入邮箱地址"
              />
            </div>

            <div class="space-y-2">
              <Label>账户状态</Label>
              <div class="flex items-center gap-2">
                <span
                  class="material-icons text-sm"
                  :class="user?.isActive ? 'text-green-600' : 'text-red-600'"
                >
                  {{ user?.isActive ? 'check_circle' : 'cancel' }}
                </span>
                <span
                  :class="user?.isActive ? 'text-green-600' : 'text-red-600'"
                >
                  {{ user?.isActive ? '已激活' : '未激活' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 角色权限信息 -->
          <div v-if="user?.roles?.length" class="space-y-2">
            <Label>角色权限</Label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in user.roles"
                :key="role"
                class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
              >
                {{ role }}
              </span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="isEditing" class="flex gap-3 pt-4">
            <Button @click="saveProfile" :disabled="isLoading">
              <span v-if="isLoading" class="material-icons animate-spin mr-2"
                >refresh</span
              >
              {{ isLoading ? '保存中...' : '保存更改' }}
            </Button>
            <Button @click="cancelEdit" variant="outline" :disabled="isLoading">
              取消
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- 安全设置卡片 -->
      <Card>
        <CardHeader>
          <CardTitle>安全设置</CardTitle>
          <CardDescription>管理您的账户安全</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">修改密码</p>
              <p class="text-sm text-muted-foreground">
                定期更改密码以保护账户安全
              </p>
            </div>
            <Button variant="outline">
              <span class="material-icons mr-2">lock</span>
              修改密码
            </Button>
          </div>

          <Separator />

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">登录会话</p>
              <p class="text-sm text-muted-foreground">
                管理您的登录设备和会话
              </p>
            </div>
            <Button variant="outline">
              <span class="material-icons mr-2">devices</span>
              管理会话
            </Button>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  min-height: calc(100vh - 120px);
}
</style>
