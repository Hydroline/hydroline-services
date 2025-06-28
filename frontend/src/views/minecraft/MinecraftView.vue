<!--
  Minecraft服务器管理页面
  监控和管理Minecraft服务器
-->
<script lang="ts" setup>
import { ref } from 'vue'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const serverStatus = ref<'online' | 'offline' | 'unknown'>('online')
</script>

<template>
  <div class="minecraft-page space-y-6 p-6 max-w-6xl mx-auto">
    <div class="page-header">
      <h1 class="text-3xl font-bold tracking-tight">Minecraft 服务器</h1>
      <p class="text-muted-foreground mt-2">
        监控服务器状态和管理工具
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <span 
              class="material-icons"
              :class="{
                'text-green-600': serverStatus === 'online',
                'text-red-600': serverStatus === 'offline',
                'text-gray-600': serverStatus === 'unknown'
              }"
            >
              {{ serverStatus === 'online' ? 'check_circle' : 
                 serverStatus === 'offline' ? 'error' : 'help' }}
            </span>
            服务器状态
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">
            {{ serverStatus === 'online' ? '在线' : 
               serverStatus === 'offline' ? '离线' : '未知' }}
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

    <Card>
      <CardHeader>
        <CardTitle>服务器管理</CardTitle>
        <CardDescription>管理工具和操作</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground">功能开发中...</p>
      </CardContent>
    </Card>
  </div>
</template> 