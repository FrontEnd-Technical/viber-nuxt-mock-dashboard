<script setup lang="ts">
defineProps<{
  title: string
  value: string
  change: string
  icon: string
  tone: 'lavender' | 'blue' | 'mint' | 'purple'
}>()
</script>

<template>
  <v-card
    flat
    class="metric-card"
    :class="`metric-card--${tone}`"
    rounded="xl"
  >
    <div class="metric-card__top">
      <span>{{ title }}</span>
      <v-icon :icon="icon" size="20" />
    </div>
    <div class="metric-card__value">{{ value }}</div>
    <div class="metric-card__change">
      <v-icon icon="mdi-trending-up" size="16" />
      <span>{{ change }}</span>
      <span class="metric-card__period">so với tháng trước</span>
    </div>
  </v-card>
</template>

<style scoped>
.metric-card {
  min-height: 142px;
  padding: 20px;
}

.metric-card--lavender {
  background: var(--color-kpi-lavender);
}

.metric-card--blue {
  background: var(--color-kpi-blue);
}

.metric-card--mint {
  background: #e8f8f4;
}

.metric-card--purple {
  background: #f2ecfb;
}

.metric-card__top,
.metric-card__change {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metric-card__top {
  justify-content: space-between;
  font-size: 14px;
}

.metric-card__value {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 600;
  line-height: 36px;
}

.metric-card__change {
  margin-top: 4px;
  font-size: 12px;
}

.metric-card__period {
  color: var(--color-text-muted);
}
</style>
