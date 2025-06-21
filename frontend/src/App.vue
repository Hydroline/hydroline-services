<script lang="ts" setup>
import PageHeader from './components/layouts/PageHeader.vue'
import PageContent from './components/layouts/PageContent.vue'
import PageFooter from './components/layouts/PageFooter.vue'
import PageSidebar from './components/layouts/PageSidebar.vue'
</script>

<template>
  <div class="main flex flex-col">
    <PageHeader />
    <div class="container flex">
      <PageSidebar />
      <div class="content-wrapper">
        <PageContent />
        <PageFooter />
      </div>
    </div>
  </div>
</template>
