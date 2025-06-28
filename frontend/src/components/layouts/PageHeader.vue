<script lang="ts" setup>
import dayjs from 'dayjs'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'

const router = useRouter()
const authStore = useAuthStore()

const currentTime = ref(dayjs())

// 计算属性
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const getTimeToNextMinute = () => {
  const now = dayjs()
  const nextMinute = now.add(1, 'minute').startOf('minute')
  return nextMinute.diff(now)
}

const updateTime = () => {
  currentTime.value = dayjs()
}

let timer: ReturnType<typeof setTimeout> | null = null

const startTimer = () => {
  const timeToNextMinute = getTimeToNextMinute()

  timer = setTimeout(() => {
    updateTime()
    timer = setInterval(updateTime, 60000)
  }, timeToNextMinute)
}

// 处理登出
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// 跳转到个人资料页面
const goToProfile = () => {
  router.push('/profile')
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    clearInterval(timer)
  }
})
</script>

<template>
  <header
    class="page-header sticky top-0 left-0 right-0 z-20 h-fit grid grid-cols-[1fr_auto_1fr] items-center px-12 py-3 text-text-subtle backdrop-blur-lg border-b border-1 border-[var(--border-color-base)]"
  >
    <div class="page-header-time">
      {{ currentTime.format('YYYY/M/D H:mm ') }}
    </div>
    <div
      class="page-header-router font-semibold text-text-emphasized tracking-widest"
    >
      {{ $route.meta.title }}
    </div>
    <div
      class="page-header-user text-right flex justify-end items-center gap-4"
    >
      <!-- 未登录状态 -->
      <div v-if="!isAuthenticated" class="flex items-center gap-2">
        <button 
          @click="goToLogin"
          class="text-sm px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          登录
        </button>
      </div>

      <!-- 已登录状态 -->
      <div v-else class="flex items-center gap-4">
        <!-- 通知图标 -->
        <div class="page-header-user__notices flex items-center gap-2">
          <div
            class="material-icons !block !text-lg !text-text-subtle select-none cursor-pointer hover:text-text-emphasized transition-colors"
            title="通知"
          >
            notifications
          </div>
          <div
            class="material-icons !block !text-lg !text-text-subtle select-none cursor-pointer hover:text-text-emphasized transition-colors"
            title="消息"
          >
            mail
          </div>
        </div>

        <!-- 用户下拉菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div class="page-header-user__name font-medium">
              {{ user?.displayName || user?.username || 'Unknown' }}
            </div>
            <div class="page-header-user__avatar">
              <Avatar>
                <AvatarFallback>
                  {{ user?.displayName?.charAt(0) || user?.username?.charAt(0) || '?' }}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel class="font-normal">
              <div class="flex flex-col space-y-1">
                <p class="text-sm font-medium leading-none">
                  {{ user?.displayName || user?.username }}
                </p>
                <p class="text-xs leading-none text-muted-foreground">
                  {{ user?.email || '@' + user?.username }}
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem @click="goToProfile" class="cursor-pointer">
              <span class="material-icons mr-2 text-sm">person</span>
              个人资料
            </DropdownMenuItem>
            
            <DropdownMenuItem @click="() => router.push('/settings')" class="cursor-pointer">
              <span class="material-icons mr-2 text-sm">settings</span>
              设置
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem @click="handleLogout" class="cursor-pointer text-red-600 focus:text-red-600">
              <span class="material-icons mr-2 text-sm">logout</span>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.page-header-time {
  font-family: 'MiSans Latin';
}
</style>
