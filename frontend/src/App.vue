<script lang="ts" setup>
import PageHeader from './components/layouts/PageHeader.vue'
import PageContent from './components/layouts/PageContent.vue'
import PageFooter from './components/layouts/PageFooter.vue'
import PageSidebar from './components/layouts/PageSidebar.vue'
</script>

<template>
  <div class="main flex flex-col h-full">
    <PageHeader />
    <div class="main-container flex flex-1 h-full">
      <PageSidebar/>
      <div class="content-wrapper overflow-y-auto w-full">
        <PageContent />
        <PageFooter />
      </div>
    </div>
  </div>
</template>
