<script setup lang="ts">
const { user, logout, getInitial } = useAuth()
const { isOnline } = useOnlineStatus()
const { pullDistance, isPulling, isRefreshing, registerRefresh } = usePullToRefresh()

provide('registerRefresh', registerRefresh)
</script>

<template>
  <div class="min-h-dvh flex flex-col bg-[var(--color-bg)]">
    <!-- Header -->
    <header class="bg-[var(--color-bg)] border-b border-[var(--color-border)] safe-top">
      <div class="app-container flex items-center justify-between px-4 h-14">
        <!-- Logo + title -->
        <div class="flex items-center gap-2">
          <img src="/logo-icon.png" alt="Centflow" class="w-8 h-8 shrink-0" />
          <span class="font-display text-[17px] text-[var(--color-text)] tracking-tight">Centflow</span>
        </div>

        <!-- User area -->
        <div class="flex items-center gap-1">
          <button
            v-if="user"
            class="btn-ghost gap-2 pr-2 pl-1 text-sm font-medium text-[var(--color-text-muted)]"
            @click="logout"
            aria-label="Déconnexion"
          >
            <div
              class="w-7 h-7 rounded-full bg-[var(--color-sage)] text-white flex items-center justify-center text-xs font-bold shrink-0"
            >
              {{ getInitial(user.name) }}
            </div>
            <UIcon name="i-lucide-log-out" class="text-base" />
          </button>
        </div>
      </div>
    </header>

    <!-- Offline banner -->
    <Transition name="slide">
      <div
        v-if="!isOnline"
        class="bg-[var(--color-orange-light)] border-b border-[var(--color-orange)]/20"
      >
        <div class="app-container flex items-center gap-2 px-4 py-2 text-sm font-medium text-[var(--color-orange)]">
          <UIcon name="i-lucide-wifi-off" class="text-base shrink-0" />
          <span>Mode hors-ligne</span>
        </div>
      </div>
    </Transition>

    <!-- Pull-to-refresh indicator -->
    <PullToRefreshIndicator :pull-distance="pullDistance" :is-refreshing="isRefreshing" />

    <!-- Content -->
    <main
      class="flex-1 app-container w-full px-4 pb-28 pt-4"
      :style="{
        transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
        transition: isPulling ? 'none' : 'transform 0.2s ease',
      }"
    >
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <BottomNav />
  </div>
</template>
