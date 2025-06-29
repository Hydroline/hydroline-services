<template>
  <aside
    ref="sidebarRef"
    class="page-sidebar fixed top-1/2 -translate-y-1/2 left-0 w-12 z-50"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div
      ref="containerRef"
      class="page-sidebar-container px-1 py-4.5 w-full h-fit my-auto bg-white/95 backdrop-blur-sm flex justify-center items-center border-1 border-l-0 border-[var(--border-color-base)] relative overflow-hidden"
    >
      <TooltipProvider>
        <div class="page-sidebar-wrapper flex flex-col gap-2 relative z-10">
          <div
            v-for="(item, index) in sidebarItems"
            :key="item.path"
            class="page-sidebar-item"
            @mouseenter="handleItemHover(index)"
            @mouseleave="handleItemLeave(index)"
          >
            <Tooltip>
              <TooltipTrigger as-child>
                <RouterLink
                  :to="item.path"
                  :active-class="'!text-text'"
                  class="sidebar-link block relative overflow-hidden transition-all duration-300"
                >
                  <div
                    :ref="(el) => el && iconRefs.push(el as HTMLElement)"
                    class="icon-container relative z-10 p-2 flex items-center justify-center"
                  >
                    <div
                      class="material-icons !block select-none text-[inherit] transition-all duration-300"
                    >
                      {{ item.icon }}
                    </div>
                  </div>
                </RouterLink>
              </TooltipTrigger>
              <TooltipContent side="right" :side-offset="12" class="bg-white text-text-subtle border-1 border-black/10">
                {{ item.label }}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const sidebarItems = [
  { path: '/', icon: 'dashboard', label: '仪表板' },
  { path: '/profile', icon: 'person', label: '个人资料' },
  { path: '/services', icon: 'construction', label: '服务' },
  { path: '/business', icon: 'videogame_asset', label: '事务' },
  { path: '/settings', icon: 'settings', label: '设置' },
]

const sidebarRef = ref<HTMLElement>()
const containerRef = ref<HTMLElement>()
const iconRefs = ref<HTMLElement[]>([])

onMounted(() => {
  nextTick(() => {
    if (containerRef.value) {
      gsap.set(containerRef.value, {
        x: 0,
        scale: 1,
      })
    }
  })
})

const handleMouseEnter = () => {
  if (!containerRef.value) return

  containerRef.value.classList.add('expanded')
}

const handleMouseLeave = () => {
  if (!containerRef.value) return

  containerRef.value.classList.remove('expanded')
}

const handleItemHover = (index: number) => {
  const icon = iconRefs.value[index]
  if (!icon) return

  gsap.to(icon, {
    scale: 1.1,
    rotation: 90,
    duration: 0.4,
    ease: 'back.out(1.2)',
  })
}

const handleItemLeave = (index: number) => {
  const icon = iconRefs.value[index]
  if (!icon) return

  gsap.to(icon, {
    scale: 1,
    rotation: 0,
    duration: 0.4,
    ease: 'back.out(1.2)',
  })
}
</script>

<style lang="scss" scoped>
.page-sidebar {
  .page-sidebar-container {
    border-top-right-radius: 1.75rem;
    border-bottom-right-radius: 1.75rem;
    border-left: none !important;
    box-shadow:
      0 8px 32px var(--border-color-base--lighter),
      0 0 56px var(--border-color-base);
    transition: box-shadow 0.4s ease;

    .page-sidebar-item {
      .sidebar-link {
        color: var(--color-surface-3);
        border-radius: 0.75rem;

        &:hover {
          color: var(--text-color);
          background: rgba(107, 114, 128, 0.1);
        }

        .icon-container {
          .material-icons {
            font-size: 1.25rem;
            font-weight: 400;
          }
        }
      }

      &.router-link-active {
        .sidebar-link {
          color: var(--text-color);
          background: rgba(107, 114, 128, 0.15);

          .icon-container {
            transform: scale(1.05);
          }
        }
      }
    }
  }
}
</style>
