const THRESHOLD = 50
const MAX_PULL = 80
const RESISTANCE = 0.4

export function usePullToRefresh() {
  const pullDistance = ref(0)
  const isPulling = ref(false)
  const isRefreshing = ref(false)

  let refreshFn: (() => Promise<void>) | null = null
  let startY = 0

  function registerRefresh(fn: () => Promise<void>) {
    refreshFn = fn
  }

  function onTouchStart(e: TouchEvent) {
    if (window.scrollY !== 0 || isRefreshing.value) return
    startY = e.touches[0]!.clientY
    isPulling.value = true
  }

  function onTouchMove(e: TouchEvent) {
    if (!isPulling.value || isRefreshing.value) return

    const currentY = e.touches[0]!.clientY
    const diff = (currentY - startY) * RESISTANCE

    if (diff < 0) {
      pullDistance.value = 0
      return
    }

    // Only prevent default when actually pulling to refresh (not normal scroll)
    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault()
    }

    pullDistance.value = Math.min(diff, MAX_PULL)
  }

  async function onTouchEnd() {
    if (!isPulling.value || isRefreshing.value) return

    if (pullDistance.value >= THRESHOLD && refreshFn) {
      isRefreshing.value = true
      pullDistance.value = THRESHOLD
      try {
        await refreshFn()
      } finally {
        isRefreshing.value = false
      }
    }

    pullDistance.value = 0
    isPulling.value = false
  }

  onMounted(() => {
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    document.removeEventListener('touchstart', onTouchStart)
    document.removeEventListener('touchmove', onTouchMove)
    document.removeEventListener('touchend', onTouchEnd)
  })

  return {
    pullDistance,
    isPulling,
    isRefreshing,
    registerRefresh,
  }
}
