<script lang="ts" setup>
import dayjs from 'dayjs'
import { ref, onMounted, onUnmounted } from 'vue'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const currentTime = ref(dayjs())

const getTimeToNextMinute = () => {
  const now = dayjs()
  const nextMinute = now.add(1, 'minute').startOf('minute')
  return nextMinute.diff(now)
}

const updateTime = () => {
  currentTime.value = dayjs()
}

let timer: ReturnType<typeof setTimeout> | null = null

const startTimer = () => {
  const timeToNextMinute = getTimeToNextMinute()

  timer = setTimeout(() => {
    updateTime()
    timer = setInterval(updateTime, 60000)
  }, timeToNextMinute)
}

onMounted(() => {
  startTimer()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
    clearInterval(timer)
  }
})
</script>

<template>
  <header
    class="page-header grid grid-cols-[1fr_auto_1fr] items-center px-8 py-2.5 text-text-subtle"
  >
    <div class="page-header-time">
      {{ currentTime.format('YYYY/M/D H:mm ') }}
    </div>
    <div
      class="page-header-router font-semibold text-text-emphasized tracking-widest"
    >
      {{ $route.meta.title }}
    </div>
    <div
      class="page-header-user text-right flex justify-end items-center gap-3"
    >
      <div class="page-header-user__info flex items-center gap-1">
        <div class="page-header-user__name">Admin</div>
        <div class="page-header-user__avatar">
          <Avatar>
            <AvatarFallback>测</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <div class="page-header-user__notices">
        <div class="material-icons !block !text-xl select-none">
          notifications
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.page-header-time {
  font-family: 'MiSans Latin';
}
</style>