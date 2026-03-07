<script setup lang="ts">
const props = defineProps<{
  items: Array<{
    key: string
    label: string
    icon: string
    amount: number
    color: string
    hint?: string
  }>
  total: number
  totalRevenus: number
}>()

const { formatEuro, formatPercent } = useFormatters()

const maxAmount = computed(() =>
  Math.max(...props.items.map(i => i.amount), 1)
)
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="item in items"
      :key="item.key"
      class="flex items-start gap-3"
    >
      <!-- Icon -->
      <div
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
        :style="{ backgroundColor: item.color + '18' }"
      >
        <UIcon :name="item.icon" class="text-base" :style="{ color: item.color }" />
      </div>

      <div class="flex-1 min-w-0">
        <!-- Label + amount -->
        <div class="flex items-baseline justify-between" :class="item.hint ? 'mb-0.5' : 'mb-1.5'">
          <span class="text-sm font-medium text-[var(--color-text)] truncate">{{ item.label }}</span>
          <span class="text-sm font-display tabular-nums ml-3 shrink-0">{{ formatEuro(item.amount) }}</span>
        </div>
        <div v-if="item.hint" class="text-[11px] text-[var(--color-text-muted)] leading-tight mb-1.5 truncate">
          {{ item.hint }}
        </div>
        <!-- Progress bar -->
        <div class="h-2 rounded-full overflow-hidden" style="background-color: var(--color-bg)">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{
              width: `${total > 0 ? (item.amount / maxAmount) * 100 : 0}%`,
              backgroundColor: item.color,
            }"
          />
        </div>
        <!-- Percentages row -->
        <div class="flex items-center gap-3 mt-1">
          <span class="text-[11px] text-[var(--color-text-muted)] tabular-nums">
            {{ formatPercent(total > 0 ? (item.amount / total) * 100 : 0) }} des dépenses
          </span>
          <span
            v-if="totalRevenus > 0"
            class="text-[11px] text-[var(--color-text-muted)] tabular-nums"
          >
            · {{ formatPercent((item.amount / totalRevenus) * 100) }} des revenus
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
