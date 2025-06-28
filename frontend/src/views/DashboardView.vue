<script lang="ts" setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  console.log('仪表盘页面加载，用户:', authStore.user?.username)
})
</script>

<template>
  <div class="page-dashboard my-8 h-full">
    <div class="page-item w-full h-54 relative bg-white rounded-2xl overflow-hidden shadow-[0_16px_64px_var(--border-color-base)]">
      <div class="page-item-background h-[inherit]">
        <img class="block w-full h-full object-cover select-none" src="@/assets/images/image_home_background_240730.webp" />
      </div>
      <div class="page-item-foreground absolute top-0 left-0 right-0 bottom-0 z-10 p-5 w-full h-full flex flex-col">
        <div class="page-item-foreground__title text-text-emphasized text-3xl font-semibold m-3">强大、实用。</div>
        <div class="page-item-foreground__subtitle text-white text-sm mt-auto mx-4">Hydroline 开发团队</div>
      </div>
    </div>
  </div>
</template>
