<script lang="ts" setup>
import { Toaster as Sonner, type ToasterProps } from 'vue-sonner'

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'hsl(var(--background))',
      '--normal-text': 'hsl(var(--foreground))',
      '--normal-border': 'hsl(var(--border))',
      '--error-bg': 'hsl(var(--destructive))',
      '--error-text': 'hsl(var(--destructive-foreground))',
      '--success-bg': 'hsl(142, 76%, 36%)',
      '--success-text': 'hsl(0, 0%, 100%)',
    }"
  />
</template>

<style scoped>
:deep(.toaster) {
  z-index: 9999 !important;
}
</style>
