<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="card"
    :class="
      cn(
        'bg-white text-text flex flex-col gap-6 rounded-xl border border-neutral-200 py-6 shadow-[0_0_16px_var(--border-color-base--lighter)] dark:bg-neutral-950 dark:text-neutral-50 dark:border-neutral-500',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
