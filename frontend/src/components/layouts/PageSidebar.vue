<template>
  <aside class="page-sidebar px-1 py-3">
    <div class="page-sidebar-wrapper">
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
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  background: var(--color-surface-0);
  box-shadow: 0 0 32px var(--border-color-base--darker);
}
</style>
