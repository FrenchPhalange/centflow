<script setup lang="ts">
import { EXPENSE_CATEGORIES, CATEGORY_COLORS } from '~/shared/constants'

const { monthData, fetchMonth, categoryEvolution, fetchCategoryEvolution, currentYear, currentMonth } = useBudget()
const { formatEuro } = useFormatters()

const registerRefresh = inject<(fn: () => Promise<void>) => void>('registerRefresh')
registerRefresh?.(async () => { await Promise.all([fetchMonth(), fetchCategoryEvolution()]) })

onMounted(() => {
  fetchMonth()
  fetchCategoryEvolution()
})

watch([currentYear, currentMonth], () => {
  fetchCategoryEvolution()
})

const donutSegments = computed(() =>
  EXPENSE_CATEGORIES.map(cat => {
    const amount = monthData.value.entries
      .filter(e => e.type === 'depense' && e.category === cat.key)
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      label: cat.label,
      value: amount,
      color: CATEGORY_COLORS[cat.key] || '#888',
    }
  }).filter(s => s.value > 0)
)

const breakdownItems = computed(() =>
  EXPENSE_CATEGORIES.map(cat => {
    const amount = monthData.value.entries
      .filter(e => e.type === 'depense' && e.category === cat.key)
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      key: cat.key,
      label: cat.label,
      icon: cat.icon,
      hint: cat.hint,
      amount,
      color: CATEGORY_COLORS[cat.key] || '#888',
    }
  }).filter(i => i.amount > 0).sort((a, b) => b.amount - a.amount)
)
</script>

<template>
  <div>
    <MonthSelector />
    <SummaryStrip />

    <div class="space-y-4">
      <!-- Donut chart -->
      <div class="card-padded">
        <h3 class="font-display text-[15px] text-[var(--color-text)] mb-5">Répartition des dépenses</h3>
        <DonutChart :segments="donutSegments" />
      </div>

      <!-- Breakdown by category -->
      <div class="card-padded">
        <div class="flex items-baseline justify-between mb-4">
          <h3 class="font-display text-[15px] text-[var(--color-text)]">Par catégorie</h3>
          <span class="text-xs text-[var(--color-text-muted)]">
            Total {{ formatEuro(monthData.totalDepenses) }}
          </span>
        </div>

        <BreakdownList
          v-if="breakdownItems.length > 0"
          :items="breakdownItems"
          :total="monthData.totalDepenses"
          :total-revenus="monthData.totalRevenus"
        />
        <div v-else class="flex flex-col items-center py-8 gap-2">
          <UIcon name="i-lucide-receipt" class="text-3xl text-[var(--color-border)]" />
          <p class="text-sm text-[var(--color-text-muted)]">Aucune dépense ce mois</p>
        </div>
      </div>

      <!-- Health badge -->
      <HealthBadge
        :revenus="monthData.totalRevenus"
        :depenses="monthData.totalDepenses"
      />

      <!-- Category evolution chart -->
      <div v-if="categoryEvolution" class="card-padded">
        <h3 class="font-display text-[15px] text-[var(--color-text)] mb-4">Évolution sur 6 mois</h3>
        <CategoryEvolutionChart
          :months="categoryEvolution.months"
          :categories="categoryEvolution.categories"
        />
      </div>
    </div>
  </div>
</template>
