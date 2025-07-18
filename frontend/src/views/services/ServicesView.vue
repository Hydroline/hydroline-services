<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const serverStatus = ref<'online' | 'offline' | 'unknown'>('online')
</script>

<template>
  <div class="player-page space-y-6 p-6 max-w-6xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span
              class="material-icons"
              :class="{
                'text-green-600': serverStatus === 'online',
                'text-red-600': serverStatus === 'offline',
                'text-gray-600': serverStatus === 'unknown',
              }"
            >
              {{
                serverStatus === 'online'
                  ? 'check_circle'
                  : serverStatus === 'offline'
                    ? 'error'
                    : 'help'
              }}
            </span>
            服务器状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">
            {{
              serverStatus === 'online'
                ? '在线'
                : serverStatus === 'offline'
                  ? '离线'
                  : '未知'
            }}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>在线玩家</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">23</p>
          <p class="text-sm text-muted-foreground">当前在线</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>服务器版本</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-lg font-medium">1.20.1</p>
          <p class="text-sm text-muted-foreground">Forge + Bukkit</p>
        </CardContent>
      </Card>
    </div>

    <Card v-if="!isAuthenticated" class="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle class="text-amber-800">需要登录</CardTitle>
        <CardDescription class="text-amber-700">
          请先登录以访问玩家管理功能
        </CardDescription>
      </CardHeader>
    </Card>

    <template v-else>
      <Card>
        <CardHeader>
          <CardTitle>玩家列表</CardTitle>
          <CardDescription>服务器注册玩家列表</CardDescription>
        </CardHeader>
        <CardContent>
          <p class="text-muted-foreground">功能开发中...</p>
        </CardContent>
      </Card>
    </template>
  </div>
</template>
