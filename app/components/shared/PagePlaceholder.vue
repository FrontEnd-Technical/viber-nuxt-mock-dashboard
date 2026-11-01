<script setup lang="ts">
import AppPageHeading from '~/components/shared/AppPageHeading.vue'

defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <AppPageHeading :title="title" />
        <p class="admin-page__subtitle">{{ description }}</p>
      </div>
    </header>

    <section class="dashboard-panel placeholder">
      <v-icon icon="mdi-tools" size="32" color="primary" />
      <h2>Trang đang được chuẩn bị</h2>
      <p>Khu vực này sẽ dùng chung hệ thống giao diện trong DESIGN.md.</p>
    </section>
  </div>
</template>

<style scoped>
.placeholder {
  display: grid;
  justify-items: start;
  gap: 12px;
}

.placeholder h2,
.placeholder p {
  margin: 0;
}

.placeholder h2 {
  font-size: 16px;
  font-weight: 600;
}

.placeholder p {
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
