<script setup lang="ts">
import type { BudgetType } from '~/shared/constants'

const props = defineProps<{
  icon: string
  label: string
  hint?: string
  category: string
  type: BudgetType
  entries: Array<{ id: number; userId: string; userName: string; amount: number; label: string | null }>
  totalRevenus: number
  accentColor?: string
}>()

const { addEntry, updateEntry, deleteEntry } = useBudget()
const { user } = useAuth()
const { formatPercent, formatEuro } = useFormatters()

const expanded = ref(false)
const newLabel = ref('')
const newAmount = ref('')
const adding = ref(false)

const editingId = ref<number | null>(null)
const editAmount = ref('')
const editInput = ref<HTMLInputElement | null>(null)

function startEdit(entry: { id: number; amount: number }) {
  editingId.value = entry.id
  editAmount.value = String(entry.amount)
  nextTick(() => {
    const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
    el?.focus()
    el?.select()
  })
}

function cancelEdit() {
  editingId.value = null
  editAmount.value = ''
}

async function saveEdit() {
  if (editingId.value === null) return
  const val = parseFloat(editAmount.value)
  if (isNaN(val) || val <= 0) {
    cancelEdit()
    return
  }
  const id = editingId.value
  cancelEdit()
  await updateEntry(id, { amount: val })
}

function onEditKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cancelEdit()
  }
}

const myEntries = computed(() =>
  props.entries.filter(e => e.userId === user.value?.id)
)
const otherEntries = computed(() =>
  props.entries.filter(e => e.userId !== user.value?.id)
)
const totalAmount = computed(() =>
  props.entries.reduce((sum, e) => sum + e.amount, 0)
)
const otherTotal = computed(() =>
  otherEntries.value.reduce((sum, e) => sum + e.amount, 0)
)
const percentOfRevenue = computed(() =>
  props.totalRevenus > 0 ? (totalAmount.value / props.totalRevenus) * 100 : 0
)

async function onAdd() {
  const val = parseFloat(newAmount.value)
  if (isNaN(val) || val <= 0) return
  adding.value = true
  try {
    await addEntry(props.type, props.category, val, newLabel.value.trim() || undefined)
    newLabel.value = ''
    newAmount.value = ''
  } finally {
    adding.value = false
  }
}

async function onDelete(id: number) {
  await deleteEntry(id)
}

function toggleExpand() {
  expanded.value = !expanded.value
}
</script>

<template>
  <div>
    <!-- Header row (always visible) -->
    <button
      class="w-full flex items-center gap-3 px-4 py-3 min-h-[56px] text-left transition-colors hover:bg-[var(--color-bg)]/50"
      @click="toggleExpand"
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

      <!-- Label + meta -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-sm font-medium text-[var(--color-text)] truncate">{{ label }}</span>
          <!-- Other user's badge -->
          <span
            v-if="otherTotal > 0"
            class="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[var(--color-slate-light)] text-[var(--color-slate)] text-[10px] font-semibold"
            :title="`${otherEntries[0]?.userName} : ${formatEuro(otherTotal)}`"
          >
            {{ otherEntries[0]?.userName.charAt(0).toUpperCase() }}
            <span class="opacity-70">{{ formatEuro(otherTotal) }}</span>
          </span>
        </div>
        <div v-if="hint && !expanded" class="text-[11px] text-[var(--color-text-muted)] leading-tight mt-0.5 truncate">
          {{ hint }}
        </div>
        <div
          v-if="type === 'depense' && totalAmount > 0"
          class="text-[11px] text-[var(--color-text-muted)]"
          :class="hint && !expanded ? '' : 'mt-0.5'"
        >
          {{ formatPercent(percentOfRevenue) }} des revenus
        </div>
      </div>

      <!-- Total amount -->
      <span class="font-display text-[15px] tabular-nums text-[var(--color-text)] shrink-0">
        {{ totalAmount > 0 ? formatEuro(totalAmount) : '' }}
      </span>

      <!-- Chevron -->
      <div
        class="w-5 h-5 flex items-center justify-center shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': expanded }"
      >
        <UIcon name="i-lucide-chevron-down" class="text-xs text-[var(--color-text-muted)]" />
      </div>
    </button>

    <!-- Expanded content -->
    <Transition name="collapse">
      <div v-show="expanded" class="px-4 pb-3">
        <!-- Entry list -->
        <div v-if="myEntries.length || otherEntries.length" class="mb-2 space-y-1">
          <!-- My entries -->
          <div
            v-for="entry in myEntries"
            :key="entry.id"
            class="flex items-center gap-2 py-1.5 px-2 rounded-md bg-[var(--color-bg)]/60 text-sm"
          >
            <span class="flex-1 min-w-0 truncate text-[var(--color-text-muted)]">
              {{ entry.label || '(sans libellé)' }}
            </span>

            <!-- Mode édition -->
            <template v-if="editingId === entry.id">
              <div class="relative shrink-0">
                <input
                  ref="editInput"
                  v-model="editAmount"
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

            <!-- Mode lecture -->
            <template v-else>
              <button
                class="font-display tabular-nums text-[var(--color-text)] shrink-0 rounded-md px-1.5 py-0.5 -mx-1.5 -my-0.5 hover:bg-[var(--color-sage)]/10 transition-colors cursor-text"
                title="Modifier le montant"
                @click.stop="startEdit(entry)"
              >
                {{ formatEuro(entry.amount) }}
              </button>
              <button
                class="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors shrink-0"
                title="Supprimer"
                @click.stop="onDelete(entry.id)"
              >
                <UIcon name="i-lucide-x" class="text-xs" />
              </button>
            </template>
          </div>

          <!-- Other user's entries -->
          <div
            v-for="entry in otherEntries"
            :key="entry.id"
            class="flex items-center gap-2 py-1.5 px-2 rounded-md bg-[var(--color-bg)]/40 text-sm opacity-70"
          >
            <span
              class="shrink-0 w-5 h-5 rounded-full bg-[var(--color-slate-light)] text-[var(--color-slate)] text-[10px] font-semibold flex items-center justify-center"
              :title="entry.userName"
            >
              {{ entry.userName.charAt(0).toUpperCase() }}
            </span>
            <span class="flex-1 min-w-0 truncate text-[var(--color-text-muted)]">
              {{ entry.label || '(sans libellé)' }}
            </span>
            <span class="font-display tabular-nums text-[var(--color-text)] shrink-0">
              {{ formatEuro(entry.amount) }}
            </span>
          </div>
        </div>

        <!-- Add form -->
        <form
          class="flex items-center gap-2"
          @submit.prevent="onAdd"
        >
          <input
            v-model="newLabel"
            type="text"
            placeholder="Libellé (optionnel)"
            class="flex-1 min-w-0 text-sm px-2.5 py-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] outline-none focus:border-[var(--color-sage)] transition-colors"
          >
          <div class="relative shrink-0">
            <input
              v-model="newAmount"
              type="number"
              inputmode="decimal"
              step="0.01"
              min="0"
              placeholder="0"
              class="amount-input !w-24"
            >
            <span class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] pointer-events-none">€</span>
          </div>
          <button
            type="submit"
            :disabled="adding || !newAmount"
            class="w-8 h-8 flex items-center justify-center rounded-lg transition-colors shrink-0"
            :class="adding || !newAmount
              ? 'bg-[var(--color-bg)] text-[var(--color-text-muted)] cursor-not-allowed'
              : 'bg-[var(--color-sage)] text-white hover:opacity-90'"
          >
            <UIcon
              :name="adding ? 'i-lucide-loader-2' : 'i-lucide-plus'"
              class="text-sm"
              :class="{ 'animate-spin': adding }"
            />
          </button>
        </form>
      </div>
    </Transition>
  </div>
</template>
