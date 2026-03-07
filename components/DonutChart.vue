<script setup lang="ts">
const props = defineProps<{
  segments: Array<{ label: string; value: number; color: string }>
}>()

const { formatEuro } = useFormatters()

const total = computed(() =>
  props.segments.reduce((sum, s) => sum + s.value, 0)
)

const arcs = computed(() => {
  if (total.value === 0) return []

  const result: Array<{ d: string; color: string; label: string; value: number }> = []
  let cumulative = 0
  const cx = 50
  const cy = 50
  const r = 38
  const gap = 1.5 // degrees gap between segments
  const singleSeg = props.segments.filter(s => s.value > 0)

  for (const segment of singleSeg) {
    if (segment.value === 0) continue

    const pct = segment.value / total.value
    const startAngle = (cumulative / total.value) * 360 - 90
    cumulative += segment.value
    const endAngle = (cumulative / total.value) * 360 - 90

    const gapAdjusted = singleSeg.length === 1 ? 0 : gap
    const startRad = ((startAngle + gapAdjusted / 2) * Math.PI) / 180
    const endRad = ((endAngle - gapAdjusted / 2) * Math.PI) / 180

    const largeArc = (endAngle - startAngle - gapAdjusted) > 180 ? 1 : 0

    if (singleSeg.length === 1) {
      result.push({
        d: `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`,
        color: segment.color,
        label: segment.label,
        value: segment.value,
      })
    } else {
      const x1 = cx + r * Math.cos(startRad)
      const y1 = cy + r * Math.sin(startRad)
      const x2 = cx + r * Math.cos(endRad)
      const y2 = cy + r * Math.sin(endRad)

      result.push({
        d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: segment.color,
        label: segment.label,
        value: segment.value,
      })
    }
  }

  return result
})
</script>

<template>
  <div class="flex flex-col items-center gap-4">
    <!-- SVG Donut -->
    <div class="relative">
      <svg viewBox="0 0 100 100" class="w-44 h-44 -rotate-0">
        <!-- Empty state ring -->
        <circle
          v-if="total === 0"
          cx="50" cy="50" :r="38"
          fill="none"
          stroke="var(--color-border)"
          stroke-width="0.75"
        />
        <path
          v-for="(arc, i) in arcs"
          :key="i"
          :d="arc.d"
          :fill="arc.color"
          stroke="var(--color-card)"
          stroke-width="1.5"
          class="transition-all duration-300"
        >
          <title>{{ arc.label }}: {{ formatEuro(arc.value) }}</title>
        </path>
        <!-- Donut hole -->
        <circle cx="50" cy="50" r="25" fill="var(--color-card)" />
        <!-- Center text -->
        <text
          x="50" y="46"
          text-anchor="middle"
          font-family="DM Sans"
          font-size="5"
          fill="var(--color-text-muted)"
        >Total</text>
        <text
          x="50" y="56"
          text-anchor="middle"
          font-family="DM Serif Display"
          font-size="7.5"
          font-weight="700"
          fill="var(--color-text)"
        >{{ formatEuro(total) }}</text>
      </svg>
    </div>

    <!-- Legend -->
    <div
      v-if="segments.length > 0"
      class="w-full grid grid-cols-2 gap-x-3 gap-y-2"
    >
      <div
        v-for="seg in segments"
        :key="seg.label"
        class="flex items-center gap-2 min-w-0"
      >
        <div class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: seg.color }" />
        <span class="text-xs text-[var(--color-text-muted)] truncate">{{ seg.label }}</span>
        <span class="text-xs font-display tabular-nums ml-auto shrink-0">{{ formatEuro(seg.value) }}</span>
      </div>
    </div>

    <div v-else class="text-sm text-[var(--color-text-muted)]">Aucune dépense</div>
  </div>
</template>
