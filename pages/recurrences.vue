<script setup lang="ts">
import { REVENUE_CATEGORIES, EXPENSE_CATEGORIES } from '~/shared/constants'

const { charges, loading, fetchCharges } = useRecurringCharges()

const registerRefresh = inject<(fn: () => Promise<void>) => void>('registerRefresh')
registerRefresh?.(() => fetchCharges())

const revenueCharges = computed(() =>
  charges.value.filter(c => c.type === 'revenu'),
)

const expenseCharges = computed(() =>
  charges.value.filter(c => c.type === 'depense'),
)

const activeCount = computed(() =>
  charges.value.filter(c => c.isActive).length,
)

onMounted(() => fetchCharges())
</script>

<template>
  <div>
    <!-- Header info -->
    <div class="mb-4">
      <h1 class="font-display text-xl text-[var(--color-text)]">Charges récurrentes</h1>
      <p class="text-sm text-[var(--color-text-muted)] mt-1">
        {{ activeCount }} charge{{ activeCount > 1 ? 's' : '' }} active{{ activeCount > 1 ? 's' : '' }} sur {{ charges.length }}
      </p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-3">
      <UIcon name="i-lucide-loader-2" class="text-3xl text-[var(--color-text-muted)] animate-spin" />
      <span class="text-sm text-[var(--color-text-muted)]">Chargement…</span>
    </div>

    <div v-else class="space-y-3">
      <!-- Revenus -->
      <RecurringChargeCard
        title="Revenus"
        type="revenu"
        :categories="REVENUE_CATEGORIES"
        :charges="revenueCharges"
        accent-color="var(--color-sage)"
      />

      <!-- Dépenses -->
      <RecurringChargeCard
        title="Dépenses"
        type="depense"
        :categories="EXPENSE_CATEGORIES"
        :charges="expenseCharges"
        accent-color="var(--color-terracotta)"
      />

      <!-- Hint -->
      <div class="flex items-start gap-2 px-1 pt-1">
        <UIcon name="i-lucide-info" class="text-sm text-[var(--color-text-muted)] shrink-0 mt-0.5" />
        <p class="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
          Ajoutez vos charges fixes puis appliquez-les au mois en cours via le bouton « Appliquer les charges fixes » sur la page de saisie.
        </p>
      </div>
    </div>
  </div>
</template>
