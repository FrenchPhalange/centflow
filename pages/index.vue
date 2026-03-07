<script setup lang="ts">
import { REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from '~/shared/constants'

const { monthData, fetchMonth, loadingMonth, currentYear, currentMonth } = useBudget()

const registerRefresh = inject<(fn: () => Promise<void>) => void>('registerRefresh')
registerRefresh?.(() => fetchMonth())

const copying = ref(false)
const copyMessage = ref('')
const copyError = ref(false)

async function onCopyPrevious() {
  copying.value = true
  copyMessage.value = ''
  copyError.value = false
  try {
    const result = await $fetch(`/api/budget/${currentYear.value}/${currentMonth.value}/copy-previous`, {
      method: 'POST',
    })
    copyMessage.value = `${(result as any).copied} entrée(s) copiée(s)`
    await fetchMonth()
    setTimeout(() => { copyMessage.value = '' }, 3000)
  } catch (err: any) {
    copyMessage.value = err?.data?.statusMessage || 'Erreur lors de la copie'
    copyError.value = true
    setTimeout(() => { copyMessage.value = ''; copyError.value = false }, 3000)
  } finally {
    copying.value = false
  }
}

onMounted(() => fetchMonth())
</script>

<template>
  <div>
    <MonthSelector />
    <SummaryStrip />

    <!-- Loading -->
    <div v-if="loadingMonth" class="flex flex-col items-center justify-center py-16 gap-3">
      <UIcon name="i-lucide-loader-2" class="text-3xl text-[var(--color-text-muted)] animate-spin" />
      <span class="text-sm text-[var(--color-text-muted)]">Chargement…</span>
    </div>

    <div v-else class="space-y-3">
      <!-- Revenus -->
      <BudgetCard
        title="Revenus"
        type="revenu"
        :categories="REVENUE_CATEGORIES"
        :entries="monthData.entries.filter(e => e.type === 'revenu')"
        :total-revenus="monthData.totalRevenus"
        accent-color="var(--color-sage)"
      />

      <!-- Dépenses -->
      <BudgetCard
        title="Dépenses"
        type="depense"
        :categories="EXPENSE_CATEGORIES"
        :entries="monthData.entries.filter(e => e.type === 'depense')"
        :total-revenus="monthData.totalRevenus"
        accent-color="var(--color-terracotta)"
      />

      <!-- Copy previous -->
      <div class="flex items-center justify-between pt-1">
        <button
          :disabled="copying"
          class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors disabled:opacity-50 shadow-[var(--shadow-xs)]"
          @click="onCopyPrevious"
        >
          <UIcon v-if="copying" name="i-lucide-loader-2" class="text-base animate-spin" />
          <UIcon v-else name="i-lucide-copy" class="text-base" />
          <span>Copier le mois précédent</span>
        </button>
        <Transition name="fade">
          <span
            v-if="copyMessage"
            class="text-xs font-medium"
            :class="copyError ? 'text-[var(--color-terracotta)]' : 'text-[var(--color-sage)]'"
          >
            {{ copyMessage }}
          </span>
        </Transition>
      </div>
    </div>
  </div>
</template>
