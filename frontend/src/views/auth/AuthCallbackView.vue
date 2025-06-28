<!--
  OAuth/SSO 登录回调页面
  处理第三方登录回调逻辑
-->
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLoading = ref(true)
const error = ref<string | null>(null)
const success = ref(false)

// 处理回调
const handleCallback = async () => {
  try {
    const { code, state, error: callbackError, provider } = route.query

    if (callbackError) {
      throw new Error(callbackError as string)
    }

    if (!code) {
      throw new Error('缺少授权码')
    }

    console.log('处理OAuth回调:', { code, state, provider })

    // TODO: 实现实际的回调处理逻辑
    // 这里应该调用后端API来完成OAuth流程
    // const response = await authApi.handleOAuthCallback({ code, state, provider })
    
    // 模拟处理
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 假设登录成功，获取用户信息
    await authStore.fetchUserProfile()
    
    success.value = true
    toast.success('登录成功', {
      description: '正在跳转到首页...'
    })

    // 延迟跳转，让用户看到成功提示
    setTimeout(() => {
      router.push('/')
    }, 1500)

  } catch (err: any) {
    console.error('OAuth回调处理失败:', err)
    error.value = err.message || '登录失败'
    toast.error('登录失败', {
      description: error.value
    })
  } finally {
    isLoading.value = false
  }
}

// 返回首页
const goHome = () => {
  router.push('/')
}

onMounted(() => {
  handleCallback()
})
</script>

<template>
  <div class="auth-callback-page min-h-screen flex items-center justify-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="flex items-center justify-center gap-2">
          <img src="/src/assets/logo/Hydroline_Logo_Short.svg" alt="Logo" class="w-8 h-8" />
          登录处理中
        </CardTitle>
        <CardDescription>
          正在处理第三方登录信息...
        </CardDescription>
      </CardHeader>

      <CardContent class="text-center space-y-6">
        <!-- 加载状态 -->
        <div v-if="isLoading" class="space-y-4">
          <div class="flex justify-center">
            <span class="material-icons animate-spin text-4xl text-blue-600">refresh</span>
          </div>
          <p class="text-gray-600">正在验证登录信息，请稍候...</p>
        </div>

        <!-- 成功状态 -->
        <div v-else-if="success" class="space-y-4">
          <div class="flex justify-center">
            <span class="material-icons text-4xl text-green-600">check_circle</span>
          </div>
          <div>
            <p class="text-green-600 font-medium">登录成功！</p>
            <p class="text-gray-600 text-sm mt-1">正在跳转到首页...</p>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="space-y-4">
          <div class="flex justify-center">
            <span class="material-icons text-4xl text-red-600">error</span>
          </div>
          <div>
            <p class="text-red-600 font-medium">登录失败</p>
            <p class="text-gray-600 text-sm mt-1">{{ error }}</p>
          </div>
          <Button @click="goHome" class="w-full">
            返回首页
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style lang="scss" scoped>
.auth-callback-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style> 