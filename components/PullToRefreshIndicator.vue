<script setup lang="ts">
const props = defineProps<{
  pullDistance: number
  isRefreshing: boolean
}>()

const THRESHOLD = 50

const thresholdReached = computed(() => props.pullDistance >= THRESHOLD)

const arrowRotation = computed(() => {
  if (props.isRefreshing) return 0
  return thresholdReached.value ? 180 : (props.pullDistance / THRESHOLD) * 180
})

const opacity = computed(() => {
  if (props.isRefreshing) return 1
  return Math.min(props.pullDistance / 30, 1)
})
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden"
    :style="{ height: `${pullDistance}px` }"
  >
    <div
      class="w-9 h-9 rounded-full bg-white border border-[var(--color-border)] shadow-[var(--shadow-xs)] flex items-center justify-center"
      :style="{ opacity }"
    >
      <UIcon
        v-if="isRefreshing"
        name="i-lucide-loader-2"
        class="text-base text-[var(--color-sage)] animate-spin"
      />
      <UIcon
        v-else
        name="i-lucide-arrow-down"
        class="text-base text-[var(--color-text-muted)] transition-transform duration-200"
        :style="{ transform: `rotate(${arrowRotation}deg)` }"
      />
    </div>
  </div>
</template>
