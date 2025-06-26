<script lang="ts" setup>
import dayjs from 'dayjs'
import HydrolineLogo from '@/assets/logo/Hydroline_Logo_Normal.svg'
</script>

<template>
  <footer
    class="page-footer px-16 py-8 mt-8 text-text-subtle text-sm bg-surface-0 border-t border-1 border-[var(--border-color-base--lighter)] flex justify-between items-center"
  >
    <div class="page-footer-mark flex items-center select-none">
      <HydrolineLogo class="h-12" />
      <div class="page-footer-mark__text text-xl font-semibold">Coding, Creating, Exploring</div>
    </div>
    <div class="page-footer-info text-right">
      <div
        class="page-footer-info__register text-text-weaken mb-1 flex gap-3 items-center justify-end"
      >
        <span>闽ICP备2023007345号-1</span>
        <span>闽公网安备35010202001677号</span>
      </div>
      <div class="page-footer-info__copyright font-medium">
        Copyright © 2024 - {{ dayjs().year() }} Hydrlab Studio. All Rights Reserved. 氢气实验室
        版权所有
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.page-footer-mark {
  svg {
    mask: linear-gradient(
      to right,
      transparent 0% 12%,
      #fff 50%,
      transparent 88% 100%
    );
  }

  .page-footer-mark__text {
    font-family: 'BoutiqueBitmap';
  }
}
</style>
