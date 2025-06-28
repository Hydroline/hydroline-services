<script lang="ts" setup>
import PageHeader from './components/layouts/PageHeader.vue'
import PageContent from './components/layouts/PageContent.vue'
import PageFooter from './components/layouts/PageFooter.vue'
import PageSidebar from './components/layouts/PageSidebar.vue'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <div class="main flex flex-col h-full min-h-[inherit]">
    <PageSidebar />
    <PageHeader />
    <PageContent />
    <PageFooter />
    
    <!-- 全局 Toast 通知 -->
    <Toaster 
      position="top-right"
      :toast-options="{
        duration: 4000,
        classes: {
          toast: 'font-medium',
          title: 'text-sm',
          description: 'text-xs opacity-90'
        }
      }"
    />
  </div>
</template>
