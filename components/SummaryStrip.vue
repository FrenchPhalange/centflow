<script setup lang="ts">
const { monthData } = useBudget()
const { formatEuro } = useFormatters()

const ratio = computed(() => {
  if (monthData.value.totalRevenus <= 0) return 0
  return Math.min((monthData.value.totalDepenses / monthData.value.totalRevenus) * 100, 100)
})

const ratioColor = computed(() => {
  if (ratio.value <= 80) return 'var(--color-sage)'
  if (ratio.value <= 100) return 'var(--color-orange)'
  return 'var(--color-terracotta)'
})

const soldePositive = computed(() => monthData.value.solde >= 0)
</script>

<template>
  <div class="card-padded mb-5">
    <!-- Top row: income / expenses / balance -->
    <div class="grid grid-cols-3 gap-2 mb-4">
      <div class="flex flex-col gap-0.5">
        <span class="text-xs text-[var(--color-text-muted)] font-medium">Revenus</span>
        <span class="font-display text-base text-[var(--color-sage)] tabular-nums leading-tight">
          {{ formatEuro(monthData.totalRevenus) }}
        </span>
      </div>
      <div class="flex flex-col gap-0.5 items-center text-center">
        <span class="text-xs text-[var(--color-text-muted)] font-medium">Dépenses</span>
        <span class="font-display text-base text-[var(--color-terracotta)] tabular-nums leading-tight">
          {{ formatEuro(monthData.totalDepenses) }}
        </span>
      </div>
      <div class="flex flex-col gap-0.5 items-end text-right">
        <span class="text-xs text-[var(--color-text-muted)] font-medium">Solde</span>
        <span
          class="font-display text-base tabular-nums leading-tight"
          :class="soldePositive ? 'text-[var(--color-sage)]' : 'text-[var(--color-terracotta)]'"
        >
          {{ formatEuro(monthData.solde) }}
        </span>
      </div>
    </div>

    <!-- Expense ratio bar -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <span class="text-[11px] text-[var(--color-text-muted)]">Taux de dépense</span>
        <span
          class="text-[11px] font-semibold tabular-nums"
          :style="{ color: ratioColor }"
        >
          {{ monthData.totalRevenus > 0 ? `${Math.round(ratio)}%` : '—' }}
        </span>
      </div>
      <div class="h-2 rounded-full bg-[var(--color-bg)] overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: `${ratio}%`, backgroundColor: ratioColor }"
        />
      </div>
    </div>
  </div>
</template>
