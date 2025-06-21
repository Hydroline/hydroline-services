<template>
  <aside class="page-sidebar px-1.5 py-3.5 h-fit my-auto bg-white border-">
    <div class="page-sidebar-wrapper flex flex-col gap-2">
      <div class="page-sidebar-item">
        <RouterLink to="/">
          <div class="material-icons !block select-none">dashboard</div>
        </RouterLink>
      </div>

      <div class="page-sidebar-item">
        <RouterLink to="/">
          <div class="material-icons !block select-none">dashboard</div>
        </RouterLink>
      </div>

      <div class="page-sidebar-item">
        <RouterLink to="/">
          <div class="material-icons !block select-none">dashboard</div>
        </RouterLink>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.page-sidebar {
  border-top-right-radius: 1.375rem;
  border-bottom-right-radius: 1.375rem;
  box-shadow: 0 0 48px var(--border-color-base);

  .page-sidebar-wrapper {
    padding-right: 0.25rem;
  }

  .page-sidebar-item {
    a {
      color: v-bind(text-text-subtle);
    }
  }
}
</style>
