<script setup lang="ts">
import type { RecurringCharge } from '~/composables/useRecurringCharges'

const props = defineProps<{
  charge: RecurringCharge
  icon: string
  categoryLabel: string
  accentColor?: string
}>()

const { updateCharge, toggleCharge, deleteCharge } = useRecurringCharges()
const { formatEuro } = useFormatters()

const editingAmount = ref(false)
const editValue = ref('')
const editInput = ref<HTMLInputElement | null>(null)

function startEdit() {
  editingAmount.value = true
  editValue.value = String(props.charge.amount)
  nextTick(() => {
    const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
    el?.focus()
    el?.select()
  })
}

function cancelEdit() {
  editingAmount.value = false
  editValue.value = ''
}

async function saveEdit() {
  const val = parseFloat(editValue.value)
  if (isNaN(val) || val <= 0) {
    cancelEdit()
    return
  }
  cancelEdit()
  await updateCharge(props.charge.id, { amount: val })
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}
</script>

<template>
  <div
    class="flex items-center gap-3 px-4 py-3 min-h-[52px] transition-opacity"
    :class="{ 'opacity-40': !charge.isActive }"
  >
    <!-- Category icon -->
    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
      :style="accentColor ? `background-color: ${accentColor}12` : 'background-color: var(--color-bg)'"
    >
      <UIcon
        :name="icon"
        class="text-base shrink-0"
        :style="accentColor ? `color: ${accentColor}` : 'color: var(--color-text-muted)'"
      />
    </div>

    <!-- Label -->
    <div class="flex-1 min-w-0">
      <span class="text-sm font-medium text-[var(--color-text)] truncate block">
        {{ categoryLabel }}
      </span>
      <span v-if="charge.label" class="text-[11px] text-[var(--color-text-muted)] leading-tight truncate block">
        {{ charge.label }}
      </span>
    </div>

    <!-- Amount (edit mode) -->
    <template v-if="editingAmount">
      <div class="relative shrink-0">
        <input
          ref="editInput"
          v-model="editValue"
          type="number"
          inputmode="decimal"
          step="0.01"
          min="0"
          class="amount-input !w-20"
          @blur="saveEdit"
          @keydown="onEditKeydown"
          @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
        >
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] pointer-events-none">€</span>
      </div>
    </template>

    <!-- Amount (display) + controls -->
    <template v-else>
      <button
        class="font-display text-[15px] tabular-nums text-[var(--color-text)] shrink-0 rounded-md px-1.5 py-0.5 hover:bg-[var(--color-sage)]/10 transition-colors cursor-text"
        title="Modifier le montant"
        @click="startEdit"
      >
        {{ formatEuro(charge.amount) }}
      </button>

      <!-- Toggle active -->
      <button
        class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
        :class="charge.isActive
          ? 'text-[var(--color-sage)] bg-[var(--color-sage)]/10'
          : 'text-[var(--color-text-muted)] bg-[var(--color-bg)]'"
        :title="charge.isActive ? 'Désactiver' : 'Activer'"
        @click="toggleCharge(charge.id)"
      >
        <UIcon :name="charge.isActive ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left'" class="text-lg" />
      </button>

      <!-- Delete -->
      <button
        class="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
        title="Supprimer"
        @click="deleteCharge(charge.id)"
      >
        <UIcon name="i-lucide-x" class="text-xs" />
      </button>
    </template>
  </div>
</template>
