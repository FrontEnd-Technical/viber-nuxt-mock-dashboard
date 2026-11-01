<script setup lang="ts">
const bars = [
  { month: 'T1', height: 48 },
  { month: 'T2', height: 62 },
  { month: 'T3', height: 54 },
  { month: 'T4', height: 78 },
  { month: 'T5', height: 66 },
  { month: 'T6', height: 90 },
  { month: 'T7', height: 72 },
  { month: 'T8', height: 100 },
  { month: 'T9', height: 82 },
  { month: 'T10', height: 68 },
  { month: 'T11', height: 88 },
  { month: 'T12', height: 76 },
]
</script>

<template>
  <section class="dashboard-panel revenue-chart">
    <div class="chart-heading">
      <div>
        <h2 class="dashboard-panel__title">Doanh thu theo tháng</h2>
        <p class="chart-heading__caption">Tổng doanh thu trong năm nay</p>
      </div>
      <v-chip size="small" variant="tonal" color="primary">
        Năm nay
      </v-chip>
    </div>

    <div class="chart" role="img" aria-label="Biểu đồ doanh thu minh họa theo tháng">
      <div class="chart__grid">
        <span>300 tr</span>
        <span>200 tr</span>
        <span>100 tr</span>
        <span>0</span>
      </div>
      <div class="chart__bars">
        <div v-for="bar in bars" :key="bar.month" class="chart__column">
          <div class="chart__bar" :style="{ height: `${bar.height}%` }" />
          <span>{{ bar.month }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.chart-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.chart-heading__caption {
  margin: -12px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.chart {
  display: flex;
  height: 240px;
  gap: 14px;
  padding-top: 16px;
}

.chart__grid {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 24px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.chart__bars {
  display: flex;
  min-width: 0;
  flex: 1;
  align-items: stretch;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  background: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(33.33% - 1px),
    rgba(0, 0, 0, 0.06) calc(33.33% - 1px),
    rgba(0, 0, 0, 0.06) 33.33%
  );
}

.chart__column {
  display: flex;
  min-width: 12px;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.chart__bar {
  width: min(28px, 100%);
  min-height: 8px;
  border-radius: 8px 8px 2px 2px;
  background: var(--color-chart-cyan);
}
</style>
