<script setup lang="ts">
import type { BudgetType } from '~/shared/constants'
import type { BudgetEntry } from '~/composables/useBudget'

const props = defineProps<{
  title: string
  type: BudgetType
  categories: ReadonlyArray<{ key: string; label: string; icon: string; hint?: string }>
  entries: BudgetEntry[]
  totalRevenus: number
  accentColor: string
}>()

const open = ref(true)

const { formatEuro } = useFormatters()

const total = computed(() =>
  props.entries.reduce((sum, e) => sum + e.amount, 0)
)

function entriesForCategory(category: string) {
  return props.entries.filter(e => e.category === category)
}
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-bg)]"
      @click="open = !open"
    >
      <div class="flex items-center gap-3">
        <!-- Colored accent dot -->
        <div
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: accentColor }"
        />
        <h2 class="font-display text-[17px]" :style="{ color: accentColor }">{{ title }}</h2>
      </div>
      <div class="flex items-center gap-2.5">
        <span class="font-display text-[15px] tabular-nums" :style="{ color: accentColor }">
          {{ formatEuro(total) }}
        </span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
          :class="{ 'rotate-180': open }"
          :style="{ backgroundColor: accentColor + '18' }"
        >
          <UIcon
            name="i-lucide-chevron-down"
            class="text-sm"
            :style="{ color: accentColor }"
          />
        </div>
      </div>
    </button>

    <!-- Divider when open -->
    <div
      v-if="open"
      class="h-px mx-4"
      :style="{ backgroundColor: accentColor + '25' }"
    />

    <!-- Content -->
    <Transition name="collapse">
      <div v-show="open">
        <div class="divide-y divide-[var(--color-border)]/40">
          <InputRow
            v-for="cat in categories"
            :key="cat.key"
            :icon="cat.icon"
            :label="cat.label"
            :hint="cat.hint"
            :category="cat.key"
            :type="type"
            :entries="entriesForCategory(cat.key)"
            :total-revenus="totalRevenus"
            :accent-color="accentColor"
          />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1200px;
  opacity: 1;
}
</style>
