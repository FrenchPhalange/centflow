<script setup lang="ts">
const props = defineProps<{
  revenus: number
  depenses: number
}>()

const { formatEuro } = useFormatters()

const solde = computed(() => props.revenus - props.depenses)
const ratio = computed(() => props.revenus > 0 ? (props.depenses / props.revenus) * 100 : 0)

const status = computed(() => {
  if (props.revenus === 0 && props.depenses === 0) {
    return {
      label: 'Aucune donnée',
      color: 'var(--color-text-muted)',
      bg: 'var(--color-bg)',
      border: 'var(--color-border)',
      icon: 'i-lucide-minus-circle',
      message: 'Saisissez vos revenus et dépenses pour voir votre santé financière.',
    }
  }
  if (ratio.value <= 80) {
    return {
      label: 'Excellente santé',
      color: 'var(--color-sage)',
      bg: 'var(--color-sage-light)',
      border: 'var(--color-sage)',
      icon: 'i-lucide-trending-up',
      message: `Vous utilisez ${Math.round(ratio.value)}% de vos revenus. Continuez ainsi !`,
    }
  }
  if (ratio.value <= 100) {
    return {
      label: 'Attention',
      color: 'var(--color-orange)',
      bg: 'var(--color-orange-light)',
      border: 'var(--color-orange)',
      icon: 'i-lucide-alert-triangle',
      message: `Vous dépensez ${Math.round(ratio.value)}% de vos revenus. Restez vigilant.`,
    }
  }
  return {
    label: 'Dépassement',
    color: 'var(--color-terracotta)',
    bg: 'var(--color-terracotta-light)',
    border: 'var(--color-terracotta)',
    icon: 'i-lucide-trending-down',
    message: `Dépenses supérieures aux revenus de ${formatEuro(Math.abs(solde.value))}.`,
  }
})
</script>

<template>
  <div
    class="rounded-2xl p-4 flex items-start gap-3.5"
    :style="{
      backgroundColor: status.bg,
      border: `1.5px solid ${status.border}30`,
    }"
  >
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      :style="{ backgroundColor: status.color + '20' }"
    >
      <UIcon :name="status.icon" class="text-xl" :style="{ color: status.color }" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="font-semibold text-sm" :style="{ color: status.color }">{{ status.label }}</div>
      <div class="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">{{ status.message }}</div>
    </div>
  </div>
</template>
