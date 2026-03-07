<script setup lang="ts">
import { MONTHS, MONTHS_SHORT } from '~/shared/constants'

const { currentYear, currentMonth, setMonth, setYear } = useBudget()

const monthsContainer = ref<HTMLElement>()

const currentMonthLabel = computed(() => MONTHS[currentMonth.value])

function scrollToActive() {
  nextTick(() => {
    const el = monthsContainer.value?.querySelector('.active-month')
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  })
}

onMounted(scrollToActive)
watch(currentMonth, scrollToActive)
</script>

<template>
  <div class="mb-5">
    <!-- Year + current month label -->
    <div class="flex items-center justify-between mb-3">
      <h2 class="font-display text-2xl text-[var(--color-text)]">{{ currentMonthLabel }}</h2>

      <div class="flex items-center gap-1">
        <button
          class="btn-ghost w-9 h-9"
          @click="setYear(currentYear - 1)"
          aria-label="Année précédente"
        >
          <UIcon name="i-lucide-chevron-left" class="text-base" />
        </button>
        <span class="font-display text-base text-[var(--color-text-muted)] tabular-nums min-w-10 text-center">{{ currentYear }}</span>
        <button
          class="btn-ghost w-9 h-9"
          @click="setYear(currentYear + 1)"
          aria-label="Année suivante"
        >
          <UIcon name="i-lucide-chevron-right" class="text-base" />
        </button>
      </div>
    </div>

    <!-- Month pills -->
    <div
      ref="monthsContainer"
      class="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 snap-x"
      style="-ms-overflow-style: none; scrollbar-width: none;"
    >
      <button
        v-for="(monthLabel, i) in MONTHS_SHORT"
        :key="i"
        class="shrink-0 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 snap-start"
        :class="currentMonth === i
          ? 'pill-active active-month shadow-[var(--shadow-xs)]'
          : 'pill-inactive'"
        @click="setMonth(i)"
      >
        {{ monthLabel }}
      </button>
    </div>
  </div>
</template>

<style scoped>
div::-webkit-scrollbar {
  display: none;
}
</style>
