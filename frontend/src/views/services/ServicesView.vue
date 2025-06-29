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
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="player-page space-y-6 p-6 max-w-6xl mx-auto">
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
