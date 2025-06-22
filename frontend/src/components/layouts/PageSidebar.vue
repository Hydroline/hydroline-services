<template>
  <aside class="page-sidebar fixed top-1/2 -translate-y-1/2 left-0 w-10">
    <div class="page-sidebar-container px-1.5 py-3.5 w-full h-fit my-auto bg-white flex justify-start items-center border-1 border-l-0 border-[var(--border-color-base)]">
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
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.page-sidebar {
  .page-sidebar-container {
    border-top-right-radius: 1.375rem;
    border-bottom-right-radius: 1.375rem;
    box-shadow: 0 0 48px var(--border-color-base);

    .page-sidebar-item {
      a {
        color: var(--color-text--subtle);
      }
    }
  }
}
</style>
