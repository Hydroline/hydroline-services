<script lang="ts" setup>
import dayjs from 'dayjs'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import LoginDialog from '@/components/auth/LoginDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

const currentTime = ref(dayjs())
const showLoginDialog = ref(false)

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
}

// 跳转到个人资料页面
const goToProfile = () => {
  router.push('/profile')
}

// 打开登录对话框
const openLoginDialog = () => {
  showLoginDialog.value = true
}

// 处理登录成功
const handleLoginSuccess = (userData: any) => {
  console.log('登录成功:', userData)
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
    <div class="page-header-time tracking-tight">
      {{ currentTime.format('YYYY/M/D H:mm ') }}
    </div>
    <div
      class="page-header-router font-semibold text-text-emphasized tracking-widest"
    >
      <template v-if="!$route.meta.hideTitle">
        {{ $route.meta.title }}
      </template>
    </div>
    <div
      class="page-header-user text-right flex justify-end items-center gap-4"
    >
      <!-- 未登录状态 -->
      <div v-if="!isAuthenticated" class="flex items-center gap-2">
        <Button
          @click="openLoginDialog"
          variant="link"
          size="sm"
          class="px-4 py-2 pr-0 text-text-subtle"
        >
          未登录
        </Button>
        <div
          class="material-icons !block !text-lg !text-text-subtle select-none hover:text-text-emphasized transition-colors"
        >
          person
        </div>
      </div>

      <!-- 已登录状态 -->
      <div v-else class="flex items-center gap-3">
        <!-- 用户下拉菜单 -->
        <DropdownMenu>
          <DropdownMenuTrigger
            class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div class="page-header-user__name font-medium text-sm">
              {{ user?.displayName || user?.username || 'Unknown' }}
            </div>
            <div class="page-header-user__avatar">
              <Avatar class="size-7">
                <AvatarFallback>
                  {{
                    user?.displayName?.charAt(0) ||
                    user?.username?.charAt(0) ||
                    '?'
                  }}
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

            <DropdownMenuItem
              @click="() => router.push('/settings')"
              class="cursor-pointer"
            >
              <span class="material-icons mr-2 text-sm">settings</span>
              设置
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              @click="handleLogout"
              class="cursor-pointer text-red-600 focus:text-red-600"
            >
              <span class="material-icons mr-2 text-sm">logout</span>
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- 通知图标 -->
        <div class="page-header-user__notices flex items-center gap-2">
          <div
            class="material-icons !block !text-xl !text-text-subtle select-none cursor-pointer hover:text-text-emphasized transition-colors"
            title="通知"
          >
            notifications
          </div>
          <div
            class="material-icons !block !text-xl !text-text-subtle select-none cursor-pointer hover:text-text-emphasized transition-colors"
            title="消息"
          >
            mail
          </div>
        </div>
      </div>
    </div>

    <!-- 登录对话框 -->
    <LoginDialog v-model:open="showLoginDialog" @success="handleLoginSuccess" />
  </header>
</template>
