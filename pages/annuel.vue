<script setup lang="ts">
import { MONTHS_SHORT } from '~/shared/constants'

const { currentYear, annualData, fetchAnnual, setYear, setMonth } = useBudget()
const { formatEuro, formatPercent } = useFormatters()
const router = useRouter()

const registerRefresh = inject<(fn: () => Promise<void>) => void>('registerRefresh')
registerRefresh?.(() => fetchAnnual())

onMounted(() => fetchAnnual())
watch(currentYear, () => fetchAnnual())

function goToMonth(month: number) {
  setMonth(month)
  router.push('/')
}

function ratioClass(revenus: number, depenses: number) {
  if (revenus === 0) return { text: 'text-[var(--color-text-muted)]', badge: '' }
  const ratio = (depenses / revenus) * 100
  if (ratio <= 80) return {
    text: 'text-[var(--color-sage)]',
    badge: 'bg-[var(--color-sage-light)] text-[var(--color-sage)]',
  }
  if (ratio <= 100) return {
    text: 'text-[var(--color-orange)]',
    badge: 'bg-[var(--color-orange-light)] text-[var(--color-orange)]',
  }
  return {
    text: 'text-[var(--color-terracotta)]',
    badge: 'bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]',
  }
}
</script>

<template>
  <div>
    <!-- Year selector -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="font-display text-2xl text-[var(--color-text)]">Vue annuelle</h2>
      <div class="flex items-center gap-1">
        <button
          class="btn-ghost w-9 h-9"
          @click="setYear(currentYear - 1)"
          aria-label="Année précédente"
        >
          <UIcon name="i-lucide-chevron-left" class="text-base" />
        </button>
        <span class="font-display text-base tabular-nums min-w-12 text-center text-[var(--color-text-muted)]">{{ currentYear }}</span>
        <button
          class="btn-ghost w-9 h-9"
          @click="setYear(currentYear + 1)"
          aria-label="Année suivante"
        >
          <UIcon name="i-lucide-chevron-right" class="text-base" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="!annualData" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="text-3xl text-[var(--color-text-muted)] animate-spin" />
    </div>

    <div v-else class="space-y-4">
      <!-- KPI cards -->
      <div class="grid grid-cols-2 gap-3">
        <div class="card-padded">
          <div class="text-xs text-[var(--color-text-muted)] font-medium mb-1.5">Revenus totaux</div>
          <div class="font-display text-xl text-[var(--color-sage)] tabular-nums leading-tight">{{ formatEuro(annualData.totalRevenus) }}</div>
        </div>
        <div class="card-padded">
          <div class="text-xs text-[var(--color-text-muted)] font-medium mb-1.5">Dépenses totales</div>
          <div class="font-display text-xl text-[var(--color-terracotta)] tabular-nums leading-tight">{{ formatEuro(annualData.totalDepenses) }}</div>
        </div>
        <div class="card-padded">
          <div class="text-xs text-[var(--color-text-muted)] font-medium mb-1.5">Solde annuel</div>
          <div
            class="font-display text-xl tabular-nums leading-tight"
            :class="annualData.solde >= 0 ? 'text-[var(--color-sage)]' : 'text-[var(--color-terracotta)]'"
          >
            {{ formatEuro(annualData.solde) }}
          </div>
        </div>
        <div class="card-padded">
          <div class="text-xs text-[var(--color-text-muted)] font-medium mb-1.5">Épargne moyenne</div>
          <div
            class="font-display text-xl tabular-nums leading-tight"
            :class="annualData.moyenneMensuelle >= 0 ? 'text-[var(--color-sage)]' : 'text-[var(--color-terracotta)]'"
          >
            {{ formatEuro(annualData.moyenneMensuelle) }}
          </div>
        </div>
      </div>

      <!-- Bar chart -->
      <div class="card-padded">
        <h3 class="font-display text-[15px] text-[var(--color-text)] mb-4">Évolution mensuelle</h3>
        <BarChart :months="annualData.months" />
      </div>

      <!-- Monthly table -->
      <div class="card overflow-hidden">
        <div class="px-4 pt-4 pb-2">
          <h3 class="font-display text-[15px] text-[var(--color-text)]">Détail mensuel</h3>
          <p class="text-xs text-[var(--color-text-muted)] mt-0.5">Appuyez sur un mois pour y accéder</p>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-[var(--color-border)]">
                <th class="text-left px-4 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Mois</th>
                <th class="text-right px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Revenus</th>
                <th class="text-right px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Dépenses</th>
                <th class="text-right px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">Solde</th>
                <th class="text-center px-3 py-2.5 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">%</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="m in annualData.months"
                :key="m.month"
                class="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg)] cursor-pointer transition-colors"
                @click="goToMonth(m.month)"
              >
                <td class="px-4 py-3 font-semibold text-[var(--color-text)]">{{ MONTHS_SHORT[m.month] }}</td>
                <td class="text-right px-3 py-3 tabular-nums text-[var(--color-sage)]">
                  {{ m.totalRevenus > 0 ? formatEuro(m.totalRevenus) : '—' }}
                </td>
                <td class="text-right px-3 py-3 tabular-nums text-[var(--color-terracotta)]">
                  {{ m.totalDepenses > 0 ? formatEuro(m.totalDepenses) : '—' }}
                </td>
                <td
                  class="text-right px-3 py-3 tabular-nums font-semibold"
                  :class="ratioClass(m.totalRevenus, m.totalDepenses).text"
                >
                  {{ (m.totalRevenus > 0 || m.totalDepenses > 0) ? formatEuro(m.totalRevenus - m.totalDepenses) : '—' }}
                </td>
                <td class="text-center px-3 py-3">
                  <span
                    v-if="m.totalRevenus > 0"
                    class="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    :class="ratioClass(m.totalRevenus, m.totalDepenses).badge"
                  >
                    {{ formatPercent((m.totalDepenses / m.totalRevenus) * 100) }}
                  </span>
                  <span v-else class="text-xs text-[var(--color-text-muted)]">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
