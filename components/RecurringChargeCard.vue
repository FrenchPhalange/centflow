<script setup lang="ts">
import type { BudgetType } from '~/shared/constants'
import type { RecurringCharge } from '~/composables/useRecurringCharges'

const props = defineProps<{
  title: string
  type: BudgetType
  categories: ReadonlyArray<{ key: string; label: string; icon: string; hint?: string }>
  charges: RecurringCharge[]
  accentColor: string
}>()

const { addCharge } = useRecurringCharges()
const { formatEuro } = useFormatters()

const open = ref(true)
const addingCategory = ref('')
const newLabel = ref('')
const newAmount = ref('')
const adding = ref(false)

const total = computed(() =>
  props.charges.reduce((sum, c) => sum + (c.isActive ? c.amount : 0), 0),
)

function chargesForCategory(categoryKey: string) {
  return props.charges.filter(c => c.category === categoryKey)
}

function getCategoryMeta(categoryKey: string) {
  return props.categories.find(c => c.key === categoryKey)
}

function startAdd(categoryKey: string) {
  addingCategory.value = categoryKey
  newLabel.value = ''
  newAmount.value = ''
}

function cancelAdd() {
  addingCategory.value = ''
  newLabel.value = ''
  newAmount.value = ''
}

async function onAdd() {
  const val = parseFloat(newAmount.value)
  if (isNaN(val) || val <= 0 || !addingCategory.value) return

  adding.value = true
  try {
    await addCharge({
      type: props.type,
      category: addingCategory.value,
      amount: val,
      label: newLabel.value.trim() || undefined,
    })
    cancelAdd()
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div class="card overflow-hidden">
    <!-- Header -->
    <button
      class="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-[var(--color-bg)]"
      @click="open = !open"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-2.5 h-2.5 rounded-full shrink-0"
          :style="{ backgroundColor: accentColor }"
        />
        <h2 class="font-display text-[17px]" :style="{ color: accentColor }">{{ title }}</h2>
      </div>
      <div class="flex items-center gap-2.5">
        <span class="font-display text-[15px] tabular-nums" :style="{ color: accentColor }">
          {{ formatEuro(total) }}
        </span>
        <div
          class="w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-200"
          :class="{ 'rotate-180': open }"
          :style="{ backgroundColor: accentColor + '18' }"
        >
          <UIcon
            name="i-lucide-chevron-down"
            class="text-sm"
            :style="{ color: accentColor }"
          />
        </div>
      </div>
    </button>

    <div v-if="open" class="h-px mx-4" :style="{ backgroundColor: accentColor + '25' }" />

    <Transition name="collapse">
      <div v-show="open">
        <div class="divide-y divide-[var(--color-border)]/40">
          <!-- Categories with existing charges -->
          <template v-for="cat in categories" :key="cat.key">
            <div v-if="chargesForCategory(cat.key).length > 0">
              <RecurringChargeRow
                v-for="charge in chargesForCategory(cat.key)"
                :key="charge.id"
                :charge="charge"
                :icon="cat.icon"
                :category-label="cat.label"
                :accent-color="accentColor"
              />
            </div>
          </template>

          <!-- Add form (contextual) -->
          <div v-if="addingCategory" class="px-4 py-3">
            <div class="flex items-center gap-2 mb-2">
              <UIcon
                :name="getCategoryMeta(addingCategory)?.icon || 'i-lucide-plus'"
                class="text-base"
                :style="{ color: accentColor }"
              />
              <span class="text-sm font-medium text-[var(--color-text)]">
                {{ getCategoryMeta(addingCategory)?.label }}
              </span>
            </div>
            <form class="flex items-center gap-2" @submit.prevent="onAdd">
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
              <button
                type="button"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors shrink-0"
                @click="cancelAdd"
              >
                <UIcon name="i-lucide-x" class="text-sm" />
              </button>
            </form>
          </div>

          <!-- Category picker (to add new charge) -->
          <div v-if="!addingCategory" class="px-4 py-3">
            <p class="text-[11px] text-[var(--color-text-muted)] mb-2 font-medium uppercase tracking-wider">Ajouter une charge</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in categories"
                :key="cat.key"
                class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:border-[var(--color-sage)] transition-colors"
                @click="startAdd(cat.key)"
              >
                <UIcon :name="cat.icon" class="text-xs" />
                {{ cat.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1200px;
  opacity: 1;
}
</style>
