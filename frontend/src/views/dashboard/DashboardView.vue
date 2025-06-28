<!--
  仪表盘页面
  提供系统概览和快速访问功能
-->
<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { config } from '@/config'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

// Store
const authStore = useAuthStore()

// 状态
const stats = ref({
  totalUsers: 0,
  onlineUsers: 0,
  serverStatus: 'unknown' as 'online' | 'offline' | 'unknown',
  lastUpdate: new Date()
})

// 计算属性
const user = computed(() => authStore.user)
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 功能卡片配置
const featureCards = computed(() => [
  {
    title: '玩家管理',
    description: '管理服务器玩家信息和权限',
    icon: 'person',
    path: '/player',
    enabled: isAuthenticated.value
  },
  {
    title: 'Minecraft 服务器',
    description: '查看服务器状态和管理工具',
    icon: 'videogame_asset',
    path: '/minecraft',
    enabled: true
  },
  {
    title: '个人资料',
    description: '查看和编辑个人信息',
    icon: 'account_circle',
    path: '/profile',
    enabled: isAuthenticated.value
  },
  {
    title: '系统设置',
    description: '应用配置和偏好设置',
    icon: 'settings',
    path: '/settings',
    enabled: isAuthenticated.value
  }
])

// 加载仪表盘数据
const loadDashboardData = async () => {
  // TODO: 从API加载实际数据
  stats.value = {
    totalUsers: 142,
    onlineUsers: 23,
    serverStatus: 'online',
    lastUpdate: new Date()
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<template>
  <div class="dashboard-page space-y-8 p-6">
    <!-- 欢迎区域 -->
    <div class="welcome-section">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">
            {{ isAuthenticated ? `欢迎回来，${user?.displayName || user?.username}` : '欢迎使用 Hydroline Services' }}
          </h1>
          <p class="text-muted-foreground mt-2">
            {{ isAuthenticated ? '这里是您的个人仪表盘' : '您可以浏览公开内容，登录以获得完整功能' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-muted-foreground">
            版本 {{ config.app.version }}
          </p>
          <p class="text-xs text-muted-foreground">
            最后更新: {{ stats.lastUpdate.toLocaleString() }}
          </p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">总用户数</CardTitle>
            <span class="material-icons text-muted-foreground">people</span>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.totalUsers }}</div>
            <p class="text-xs text-muted-foreground">注册用户总数</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">在线用户</CardTitle>
            <span class="material-icons text-muted-foreground">person</span>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.onlineUsers }}</div>
            <p class="text-xs text-muted-foreground">当前在线用户</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">服务器状态</CardTitle>
            <span 
              class="material-icons"
              :class="{
                'text-green-600': stats.serverStatus === 'online',
                'text-red-600': stats.serverStatus === 'offline',
                'text-gray-600': stats.serverStatus === 'unknown'
              }"
            >
              {{ stats.serverStatus === 'online' ? 'check_circle' : 
                 stats.serverStatus === 'offline' ? 'error' : 'help' }}
            </span>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold capitalize">
              {{ stats.serverStatus === 'online' ? '在线' : 
                 stats.serverStatus === 'offline' ? '离线' : '未知' }}
            </div>
            <p class="text-xs text-muted-foreground">Minecraft 服务器状态</p>
          </CardContent>
        </Card>
      </div>
    </div>

    <Separator />

    <!-- 功能快速访问 -->
    <div class="features-section">
      <h2 class="text-2xl font-semibold mb-6">快速访问</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          v-for="feature in featureCards" 
          :key="feature.title"
          class="cursor-pointer hover:shadow-md transition-shadow"
          :class="{ 'opacity-50': !feature.enabled }"
        >
          <CardHeader class="pb-3">
            <div class="flex items-center gap-3">
              <span class="material-icons text-primary text-2xl">{{ feature.icon }}</span>
              <div>
                <CardTitle class="text-lg">{{ feature.title }}</CardTitle>
                <CardDescription class="text-sm">{{ feature.description }}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent class="pt-0">
            <Button 
              :disabled="!feature.enabled"
              variant="outline" 
              class="w-full"
              @click="$router.push(feature.path)"
            >
              {{ feature.enabled ? '进入' : '需要登录' }}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- 公告或帮助信息 -->
    <div v-if="!isAuthenticated" class="info-section">
      <Card class="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-blue-900">
            <span class="material-icons">info</span>
            关于 Hydroline Services
          </CardTitle>
        </CardHeader>
        <CardContent class="text-blue-800">
          <p class="mb-4">
            Hydroline Services 是一个为 Minecraft 服务器设计的聚合信息服务平台，
            提供玩家管理、服务器监控、SSO 登录等功能。
          </p>
          <p class="mb-4">
            游客可以查看部分公开信息，注册登录后可以享受完整功能。
          </p>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" onclick="window.open('https://github.com/your-repo', '_blank')">
              查看源码
            </Button>
            <Button variant="outline" size="sm" onclick="window.open('/docs', '_blank')">
              查看文档
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style> 