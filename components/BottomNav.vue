<script setup lang="ts">
const route = useRoute()

const tabs = [
  { to: '/', icon: 'i-lucide-pencil-line', label: 'Saisie' },
  { to: '/synthese', icon: 'i-lucide-pie-chart', label: 'Synthèse' },
  { to: '/annuel', icon: 'i-lucide-calendar-days', label: 'Annuel' },
  { to: '/recurrences', icon: 'i-lucide-repeat', label: 'Récurrents' },
]

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <nav class="fixed bottom-0 inset-x-0 z-50 safe-bottom">
    <div class="app-container">
      <div class="mx-4 mb-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl shadow-[var(--shadow-md)] flex justify-around items-stretch h-16 px-1">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.to"
          :to="tab.to"
          class="flex flex-col items-center justify-center gap-1 flex-1 rounded-xl transition-all duration-200 my-1.5"
          :class="isActive(tab.to)
            ? 'bg-[var(--color-sage-light)] text-[var(--color-sage)]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'"
        >
          <UIcon :name="tab.icon" class="text-[22px]" />
          <span class="text-[11px] font-semibold tracking-wide">{{ tab.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>
