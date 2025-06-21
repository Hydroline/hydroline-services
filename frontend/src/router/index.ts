import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: '仪表盘' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
