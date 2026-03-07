<script setup lang="ts">
import { MONTHS_SHORT } from '~/shared/constants'

const props = defineProps<{
  months: Array<{
    month: number
    totalRevenus: number
    totalDepenses: number
  }>
}>()

const { formatCompact } = useFormatters()

const maxValue = computed(() =>
  Math.max(...props.months.map(m => Math.max(m.totalRevenus, m.totalDepenses)), 1)
)

function barHeight(value: number): number {
  return (value / maxValue.value) * 100
}
</script>

<template>
  <div>
    <!-- Chart -->
    <div class="overflow-x-auto -mx-1 px-1">
      <div class="flex items-end gap-1.5 h-44 min-w-[520px]">
        <div
          v-for="m in months"
          :key="m.month"
          class="flex-1 flex flex-col items-center gap-0.5"
        >
          <div class="flex items-end gap-0.5 h-36 w-full">
            <!-- Revenus -->
            <div class="flex-1 flex flex-col items-center justify-end h-full">
              <div
                class="w-full rounded-t-md transition-all duration-500 min-h-[3px]"
                :style="{
                  height: `${barHeight(m.totalRevenus)}%`,
                  backgroundColor: 'var(--color-sage)',
                  opacity: m.totalRevenus > 0 ? '1' : '0.3',
                }"
                :title="`Revenus: ${formatCompact(m.totalRevenus)}`"
              />
            </div>
            <!-- Dépenses -->
            <div class="flex-1 flex flex-col items-center justify-end h-full">
              <div
                class="w-full rounded-t-md transition-all duration-500 min-h-[3px]"
                :style="{
                  height: `${barHeight(m.totalDepenses)}%`,
                  backgroundColor: 'var(--color-terracotta)',
                  opacity: m.totalDepenses > 0 ? '1' : '0.3',
                }"
                :title="`Dépenses: ${formatCompact(m.totalDepenses)}`"
              />
            </div>
          </div>
          <span class="text-[10px] text-[var(--color-text-muted)] mt-1 font-medium">
            {{ MONTHS_SHORT[m.month] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex justify-center gap-5 mt-4">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-[var(--color-sage)]" />
        <span class="text-xs text-[var(--color-text-muted)] font-medium">Revenus</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded bg-[var(--color-terracotta)]" />
        <span class="text-xs text-[var(--color-text-muted)] font-medium">Dépenses</span>
      </div>
    </div>
  </div>
</template>
