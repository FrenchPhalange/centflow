<script setup lang="ts">
const props = defineProps<{
  months: Array<{ year: number; month: number; label: string }>
  categories: Array<{ key: string; label: string; color: string; data: number[] }>
}>()

const { formatEuro } = useFormatters()

// Toggle visibility per category
const hiddenCategories = ref(new Set<string>())
const showAll = ref(false)

const TOP_N = 5

// Sort categories by total descending
const sortedCategories = computed(() =>
  [...props.categories].sort((a, b) => {
    const totalA = a.data.reduce((s, v) => s + v, 0)
    const totalB = b.data.reduce((s, v) => s + v, 0)
    return totalB - totalA
  })
)

const visibleCategories = computed(() => {
  const cats = showAll.value ? sortedCategories.value : sortedCategories.value.slice(0, TOP_N)
  return cats.filter(c => !hiddenCategories.value.has(c.key))
})

const hasMore = computed(() => sortedCategories.value.length > TOP_N)

function toggleCategory(key: string) {
  const next = new Set(hiddenCategories.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  hiddenCategories.value = next
}

// SVG dimensions
const W = 320
const H = 180
const PAD = { top: 10, right: 10, bottom: 24, left: 45 }
const chartW = W - PAD.left - PAD.right
const chartH = H - PAD.top - PAD.bottom

const maxValue = computed(() => {
  let max = 0
  for (const cat of visibleCategories.value) {
    for (const v of cat.data) {
      if (v > max) max = v
    }
  }
  return max || 100
})

// Grid levels (3 horizontal lines)
const gridLevels = computed(() => {
  const m = maxValue.value
  const step = Math.ceil(m / 3 / 50) * 50
  return [step, step * 2, step * 3]
})

function x(index: number): number {
  if (props.months.length <= 1) return PAD.left + chartW / 2
  return PAD.left + (index / (props.months.length - 1)) * chartW
}

function y(value: number): number {
  const top = gridLevels.value[2] || maxValue.value
  return PAD.top + chartH - (value / top) * chartH
}

function linePath(data: number[]): string {
  return data.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
}

// Legend categories list (all, for toggle)
const legendCategories = computed(() =>
  showAll.value ? sortedCategories.value : sortedCategories.value.slice(0, TOP_N)
)
</script>

<template>
  <div v-if="categories.length > 0">
    <!-- SVG Chart -->
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" preserveAspectRatio="xMidYMid meet">
      <!-- Grid lines -->
      <line
        v-for="level in gridLevels"
        :key="level"
        :x1="PAD.left"
        :y1="y(level)"
        :x2="W - PAD.right"
        :y2="y(level)"
        stroke="var(--color-border)"
        stroke-width="0.5"
        stroke-dasharray="3,3"
      />

      <!-- Grid labels -->
      <text
        v-for="level in gridLevels"
        :key="'label-' + level"
        :x="PAD.left - 4"
        :y="y(level) + 3"
        text-anchor="end"
        fill="var(--color-text-muted)"
        font-size="8"
        font-family="DM Sans, system-ui"
      >
        {{ level >= 1000 ? `${(level / 1000).toFixed(1)}k` : level }}
      </text>

      <!-- X axis labels (months) -->
      <text
        v-for="(m, i) in months"
        :key="'month-' + i"
        :x="x(i)"
        :y="H - 4"
        text-anchor="middle"
        fill="var(--color-text-muted)"
        font-size="9"
        font-family="DM Sans, system-ui"
      >
        {{ m.label }}
      </text>

      <!-- Lines -->
      <g v-for="cat in visibleCategories" :key="cat.key">
        <path
          :d="linePath(cat.data)"
          :stroke="cat.color"
          stroke-width="2"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <!-- Data points -->
        <circle
          v-for="(v, i) in cat.data"
          :key="i"
          :cx="x(i)"
          :cy="y(v)"
          r="3"
          :fill="v > 0 ? cat.color : 'none'"
          :stroke="v > 0 ? cat.color : 'none'"
          stroke-width="1.5"
        >
          <title>{{ cat.label }}: {{ formatEuro(v) }}</title>
        </circle>
      </g>
    </svg>

    <!-- Legend -->
    <div class="flex flex-wrap gap-1.5 mt-3">
      <button
        v-for="cat in legendCategories"
        :key="cat.key"
        class="flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium transition-opacity"
        :class="hiddenCategories.has(cat.key) ? 'opacity-30' : 'opacity-100'"
        :style="{ backgroundColor: cat.color + '18', color: cat.color }"
        @click="toggleCategory(cat.key)"
      >
        <span
          class="w-2 h-2 rounded-full shrink-0"
          :style="{ backgroundColor: cat.color }"
        />
        {{ cat.label }}
      </button>
    </div>

    <!-- Toggle show all -->
    <button
      v-if="hasMore"
      class="mt-2 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
      @click="showAll = !showAll"
    >
      {{ showAll ? 'Top 5 seulement' : `Tout afficher (${categories.length})` }}
    </button>
  </div>

  <!-- Empty state -->
  <div v-else class="flex flex-col items-center py-6 gap-2">
    <UIcon name="i-lucide-trending-up" class="text-2xl text-[var(--color-border)]" />
    <p class="text-sm text-[var(--color-text-muted)]">Pas assez de données</p>
  </div>
</template>
