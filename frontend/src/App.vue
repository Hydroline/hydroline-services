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
  </div>

  <Toaster
    position="top-right"
    class="z-10000"
    :toast-options="{
      duration: 4000,
      classes: {
        toast: 'font-medium !bg-surface-0 !shadow-lg !border-1 !border-[var(--border-color-base)]',
        title: 'text-sm',
        description: 'text-xs',
      },
    }"
  />
</template>
