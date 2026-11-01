<script setup lang="ts">
const loadingStore = useLoadingStore()
</script>

<template>
  <Transition name="global-loading">
    <div
      v-if="loadingStore.isLoading"
      class="global-loading"
      role="status"
      aria-live="polite"
      aria-label="Đang tải dữ liệu"
    >
      <div class="global-loading__panel">
        <v-progress-circular
          indeterminate
          color="primary"
          :size="48"
          :width="4"
          aria-hidden="true"
        />
        <span>Đang tải dữ liệu...</span>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.global-loading {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(248, 249, 252, 0.68);
  backdrop-filter: blur(2px);
}

.global-loading__panel {
  display: flex;
  min-width: 156px;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 26px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 12px 36px rgba(20, 25, 45, 0.12);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
}

.global-loading-enter-active,
.global-loading-leave-active {
  transition: opacity 120ms ease;
}

.global-loading-enter-from,
.global-loading-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .global-loading-enter-active,
  .global-loading-leave-active {
    transition: none;
  }
}
</style>
