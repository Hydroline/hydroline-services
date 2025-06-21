<script lang="ts" setup>
import dayjs from 'dayjs'
</script>

<template>
  <header
    class="page-header grid grid-cols-[1fr_auto_1fr] items-center px-8 py-2.5 text-[var(--color-text--subtle)]"
  >
    <div class="page-header-time">
      {{ dayjs().format('YYYY/M/D H:mm:ss ') }}
    </div>
    <div
      class="page-header-router font-semibold text-[var(--color-text--emphasized)] tracking-widest"
    >
      {{ $route.meta.title }}
    </div>
    <div class="page-header-user text-right flex justify-end gap-2">
      <div class="page-header-user__info">
        <div class="page-header-user__name">Admin</div>
        <div class="page-header-user__avatar"></div>
      </div>
      <div class="page-header-user__notices">
        <div class="material-icons">notifications</div>
      </div>
    </div>
  </header>
</template>
