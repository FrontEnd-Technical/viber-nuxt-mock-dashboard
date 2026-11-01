<script setup lang="ts">
import MetricCard from '~/components/dashboard/MetricCard.vue'
import RevenueChart from '~/components/dashboard/RevenueChart.vue'
import AppPageHeading from '~/components/shared/AppPageHeading.vue'

definePageMeta({
  title: 'Tổng quan',
})

const dashboardStore = useDashboardStore()

const metrics = computed(() => dashboardStore.overview?.metrics ?? [])

onMounted(() => {
  if (!dashboardStore.overview) {
    void dashboardStore.loadOverview()
  }
})
</script>

<template>
  <div class="admin-page">
    <header class="admin-page__header">
      <div>
        <AppPageHeading title="Tổng quan" />
        <p class="admin-page__subtitle">
          Theo dõi tình hình hoạt động khách sạn của bạn.
        </p>
      </div>
      <v-btn
        prepend-icon="mdi-calendar-month-outline"
        variant="outlined"
        rounded="lg"
      >
        30 ngày qua
      </v-btn>
    </header>

    <v-alert
      v-if="dashboardStore.error"
      class="mb-6"
      type="error"
      variant="tonal"
      closable
      @click:close="dashboardStore.error = null"
    >
      {{ dashboardStore.error }}
      <template #append>
        <v-btn
          variant="text"
          size="small"
          :loading="dashboardStore.pending"
          @click="dashboardStore.loadOverview()"
        >
          Thử lại
        </v-btn>
      </template>
    </v-alert>

    <div class="dashboard-grid">
      <template v-if="dashboardStore.pending && !metrics.length">
        <v-skeleton-loader
          v-for="item in 4"
          :key="item"
          type="card"
          rounded="xl"
        />
      </template>
      <template v-else>
        <MetricCard
          v-for="metric in metrics"
          :key="metric.title"
          v-bind="metric"
        />
      </template>
    </div>

    <div class="dashboard-content">
      <RevenueChart />

      <section class="dashboard-panel occupancy-panel">
        <h2 class="dashboard-panel__title">Công suất phòng</h2>
        <div class="occupancy-panel__value">
          {{ dashboardStore.overview?.occupancyRate ?? '--' }}%
        </div>
        <v-progress-linear
          :model-value="dashboardStore.overview?.occupancyRate ?? 0"
          color="info"
          height="10"
          rounded
        />
        <div class="occupancy-panel__legend">
          <span>Phòng đang có khách</span>
          <strong>{{ dashboardStore.overview?.occupiedRooms ?? '--' }} phòng</strong>
        </div>
        <div class="occupancy-panel__legend">
          <span>Tổng số phòng</span>
          <strong>{{ dashboardStore.overview?.totalRooms ?? '--' }} phòng</strong>
        </div>
      </section>
    </div>

    <section class="dashboard-panel bookings-panel">
      <div class="bookings-panel__heading">
        <h2 class="dashboard-panel__title">Đặt phòng gần đây</h2>
        <v-btn to="/reservations" variant="text" append-icon="mdi-arrow-right">
          Xem tất cả
        </v-btn>
      </div>
      <v-table density="comfortable">
        <thead>
          <tr>
            <th>Mã đặt phòng</th>
            <th>Khách hàng</th>
            <th>Nhận phòng</th>
            <th>Trạng thái</th>
            <th class="text-right">Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="booking in dashboardStore.overview?.recentBookings ?? []"
            :key="booking.code"
          >
            <td class="font-weight-medium">{{ booking.code }}</td>
            <td>{{ booking.guest }}</td>
            <td>{{ booking.checkIn }}</td>
            <td>
              <v-chip
                size="small"
                :color="booking.status === 'Đã xác nhận' ? 'success' : 'warning'"
                variant="tonal"
              >
                {{ booking.status }}
              </v-chip>
            </td>
            <td class="text-right">{{ booking.total }}</td>
          </tr>
          <tr v-if="!dashboardStore.pending && !dashboardStore.overview?.recentBookings.length">
            <td colspan="5" class="text-center text-medium-emphasis">
              Chưa có dữ liệu đặt phòng.
            </td>
          </tr>
        </tbody>
      </v-table>
    </section>
  </div>
</template>

<style scoped>
.dashboard-content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 16px;
  margin-top: 16px;
}

.occupancy-panel__value {
  margin: 12px 0 18px;
  font-size: 36px;
  font-weight: 600;
}

.occupancy-panel__legend {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  font-size: 12px;
}

.occupancy-panel__legend span {
  color: var(--color-text-muted);
}

.bookings-panel {
  margin-top: 16px;
}

.bookings-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bookings-panel__heading .dashboard-panel__title {
  margin-bottom: 12px;
}

@media (max-width: 800px) {
  .dashboard-content {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
