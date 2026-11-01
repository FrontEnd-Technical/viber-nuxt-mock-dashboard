<script setup lang="ts">
import AppPageHeading from '~/components/shared/AppPageHeading.vue'

definePageMeta({
  title: 'Thư viện giao diện',
})

const palette = [
  { name: 'Page', token: '--color-page', value: '#FFFFFF' },
  { name: 'Surface', token: '--color-surface', value: '#F9F9FA' },
  { name: 'Text', token: '--color-text', value: '#1C1C1C' },
  { name: 'Text muted', token: '--color-text-muted', value: 'rgba(0, 0, 0, 0.4)' },
  { name: 'KPI lavender', token: '--color-kpi-lavender', value: '#EDEEFC' },
  { name: 'KPI blue', token: '--color-kpi-blue', value: '#E6F1FD' },
  { name: 'Chart cyan', token: '--color-chart-cyan', value: '#33D1FF' },
  { name: 'Chart mint', token: '--color-chart-mint', value: '#6BE6D3' },
  { name: 'Chart green', token: '--color-chart-green', value: '#71DD8C' },
  { name: 'Chart purple', token: '--color-chart-purple', value: '#B899EB' },
  { name: 'Chart blue', token: '--color-chart-blue', value: '#A0BCE8' },
]

const statusExamples = [
  { title: 'Đã xác nhận', color: 'success' },
  { title: 'Chờ xử lý', color: 'warning' },
  { title: 'Đang lưu trú', color: 'info' },
  { title: 'Đã hủy', color: 'error' },
]

const sampleBookings = [
  { code: 'BK-2026-1048', guest: 'Nguyễn Minh Anh', date: '31/10/2026', status: 'Đã xác nhận', color: 'success', total: '₫4.800.000' },
  { code: 'BK-2026-1047', guest: 'Trần Quốc Bảo', date: '01/11/2026', status: 'Chờ xử lý', color: 'warning', total: '₫3.200.000' },
  { code: 'BK-2026-1046', guest: 'Lê Hoàng Yến', date: '02/11/2026', status: 'Đã xác nhận', color: 'success', total: '₫6.500.000' },
]

const selectedStatus = ref('Đã xác nhận')
const selectedPeriod = ref('30 ngày qua')
const sampleSearch = ref('')
const sampleDate = ref('')
const sampleChecked = ref(true)
const sampleSwitch = ref(true)
const selectedRadio = ref('Phòng')
const selectedChips = ref(['Deluxe'])
const dialogOpen = ref(false)
const menuOpen = ref(false)
const snackbarOpen = ref(false)
const loading = ref(false)
let loadingTimer: ReturnType<typeof setTimeout> | undefined

function toggleChip(value: string) {
  selectedChips.value = selectedChips.value.includes(value)
    ? selectedChips.value.filter(item => item !== value)
    : [...selectedChips.value, value]
}

function simulateLoading() {
  if (loading.value) {
    return
  }

  loading.value = true
  loadingTimer = setTimeout(() => {
    loading.value = false
    loadingTimer = undefined
    snackbarOpen.value = true
  }, 900)
}

onBeforeUnmount(() => {
  if (loadingTimer) {
    clearTimeout(loadingTimer)
  }
})
</script>

<template>
  <div class="admin-page ui-library-page">
    <header class="admin-page__header">
      <div>
        <AppPageHeading title="Thư viện giao diện" />
        <p class="admin-page__subtitle">
          Mẫu component dùng chung và tương tác tham khảo cho toàn bộ hệ thống.
        </p>
      </div>
      <v-chip
        prepend-icon="mdi-palette-outline"
        color="primary"
        variant="tonal"
        size="small"
      >
        Design system
      </v-chip>
    </header>

    <div class="ui-library-grid">
      <section id="colors" class="dashboard-panel showcase-card showcase-card--wide">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">01 / FOUNDATION</p>
            <h2 class="showcase-card__title">Màu sắc</h2>
            <p class="showcase-card__description">
              Palette và token hiện được khai báo trong DESIGN.md.
            </p>
          </div>
          <v-icon icon="mdi-palette-swatch-outline" size="22" />
        </div>

        <div class="palette-grid">
          <div v-for="color in palette" :key="color.token" class="palette-swatch">
            <div class="palette-swatch__color" :style="{ backgroundColor: `var(${color.token})` }" />
            <div class="palette-swatch__details">
              <strong>{{ color.name }}</strong>
              <code>{{ color.value }}</code>
              <span>{{ color.token }}</span>
            </div>
          </div>
        </div>
        <div class="radius-samples">
          <div class="radius-sample radius-sample--card">
            <span>Card</span>
            <code>20 px</code>
          </div>
          <div class="radius-sample radius-sample--control">
            <span>Control</span>
            <code>8 px</code>
          </div>
          <div class="radius-sample radius-sample--pill">
            <span>Chip</span>
            <code>999 px</code>
          </div>
        </div>
      </section>

      <section id="typography" class="dashboard-panel showcase-card">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">02 / FOUNDATION</p>
            <h2 class="showcase-card__title">Typography</h2>
            <p class="showcase-card__description">Inter với các cấp độ rõ ràng, nhất quán.</p>
          </div>
          <v-icon icon="mdi-format-font" size="22" />
        </div>

        <div class="type-specimen">
          <span class="type-specimen__meta">Heading · 24 / 32 · 600</span>
          <h3 class="type-specimen__heading">Tổng quan khách sạn</h3>
        </div>
        <div class="type-specimen">
          <span class="type-specimen__meta">Card title · 16 / 22 · 600</span>
          <p class="type-specimen__card-title">Đặt phòng gần đây</p>
        </div>
        <div class="type-specimen">
          <span class="type-specimen__meta">Body · 14 / 20 · 400</span>
          <p class="type-specimen__body">Theo dõi tình trạng hoạt động và trải nghiệm lưu trú.</p>
        </div>
        <div class="type-specimen">
          <span class="type-specimen__meta">Caption · 12 / 16 · muted</span>
          <p class="type-specimen__caption">Cập nhật lần cuối: vừa xong</p>
        </div>
      </section>

      <section id="buttons" class="dashboard-panel showcase-card">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">03 / COMPONENTS</p>
            <h2 class="showcase-card__title">Button</h2>
            <p class="showcase-card__description">Phân cấp hành động và trạng thái điều khiển.</p>
          </div>
          <v-icon icon="mdi-gesture-tap-button" size="22" />
        </div>

        <div class="button-examples">
          <v-btn color="primary" prepend-icon="mdi-plus">
            Thêm đặt phòng
          </v-btn>
          <v-btn variant="outlined" prepend-icon="mdi-download-outline">
            Xuất dữ liệu
          </v-btn>
          <v-btn variant="text">Hủy</v-btn>
          <v-btn color="error" variant="tonal" prepend-icon="mdi-delete-outline">
            Xóa
          </v-btn>
          <v-btn
            :loading="loading"
            :disabled="loading"
            color="primary"
            prepend-icon="mdi-cloud-upload-outline"
            @click="simulateLoading"
          >
            Thử trạng thái loading
          </v-btn>
          <v-btn icon="mdi-dots-horizontal" variant="outlined" aria-label="Thêm tùy chọn" />
          <v-btn variant="outlined" disabled>Đang vô hiệu</v-btn>
        </div>
      </section>

      <section id="inputs" class="dashboard-panel showcase-card">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">04 / COMPONENTS</p>
            <h2 class="showcase-card__title">Input và lựa chọn</h2>
            <p class="showcase-card__description">Text field, select và lựa chọn trạng thái.</p>
          </div>
          <v-icon icon="mdi-form-textbox" size="22" />
        </div>

        <div class="input-examples">
          <v-text-field
            v-model="sampleSearch"
            label="Tên khách"
            placeholder="Nhập tên khách hàng"
            prepend-inner-icon="mdi-account-outline"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
          />
          <v-text-field
            label="Email"
            model-value="admin@staywise.vn"
            type="email"
            prepend-inner-icon="mdi-email-outline"
            variant="outlined"
            density="comfortable"
            hide-details
          />
          <v-text-field
            v-model="sampleDate"
            label="Ngày nhận phòng"
            type="date"
            variant="outlined"
            density="comfortable"
            hide-details
          />
          <v-select
            v-model="selectedPeriod"
            :items="['7 ngày qua', '30 ngày qua', '90 ngày qua']"
            label="Khoảng thời gian"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </div>

        <div class="choice-examples">
          <v-checkbox
            v-model="sampleChecked"
            label="Gửi email xác nhận"
            density="compact"
            hide-details
          />
          <v-switch
            v-model="sampleSwitch"
            label="Cho phép check-in sớm"
            color="primary"
            density="compact"
            hide-details
          />
          <v-radio-group v-model="selectedRadio" inline hide-details>
            <v-radio label="Phòng" value="Phòng" />
            <v-radio label="Khách" value="Khách" />
          </v-radio-group>
        </div>

        <div class="chip-examples" aria-label="Lựa chọn loại phòng">
          <v-chip
            v-for="type in ['Standard', 'Deluxe', 'Suite']"
            :key="type"
            :variant="selectedChips.includes(type) ? 'tonal' : 'outlined'"
            :color="selectedChips.includes(type) ? 'primary' : undefined"
            :aria-pressed="selectedChips.includes(type)"
            @click="toggleChip(type)"
          >
            {{ type }}
          </v-chip>
        </div>
      </section>

      <section id="feedback" class="dashboard-panel showcase-card">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">05 / COMPONENTS</p>
            <h2 class="showcase-card__title">Status và feedback</h2>
            <p class="showcase-card__description">Luôn đi kèm nhãn chữ, không chỉ dựa vào màu.</p>
          </div>
          <v-icon icon="mdi-message-badge-outline" size="22" />
        </div>

        <div class="status-examples">
          <v-chip
            v-for="status in statusExamples"
            :key="status.title"
            :color="status.color"
            variant="tonal"
            size="small"
          >
            {{ status.title }}
          </v-chip>
        </div>

        <v-alert type="success" variant="tonal" density="comfortable" title="Đã lưu thay đổi">
          Thông tin đặt phòng đã được cập nhật.
        </v-alert>
        <v-alert type="warning" variant="tonal" density="comfortable" title="Cần chú ý">
          Có 2 yêu cầu đang chờ xác nhận.
        </v-alert>

        <div class="progress-example">
          <div class="progress-example__label">
            <span>Công suất phòng</span>
            <strong>78%</strong>
          </div>
          <v-progress-linear model-value="78" color="success" height="8" rounded />
        </div>

        <div class="skeleton-example" aria-label="Ví dụ trạng thái loading">
          <v-skeleton-loader type="avatar, article" />
        </div>
      </section>

      <section id="overlays" class="dashboard-panel showcase-card">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">06 / COMPONENTS</p>
            <h2 class="showcase-card__title">Dialog, menu và popup</h2>
            <p class="showcase-card__description">Các lớp tương tác có thể kích hoạt để xem thử.</p>
          </div>
          <v-icon icon="mdi-dock-window" size="22" />
        </div>

        <div class="overlay-examples">
          <v-btn color="primary" variant="outlined" @click="dialogOpen = true">
            Mở dialog xác nhận
          </v-btn>

          <v-menu v-model="menuOpen">
            <template #activator="{ props }">
              <v-btn v-bind="props" variant="outlined" append-icon="mdi-chevron-down">
                Tùy chọn danh sách
              </v-btn>
            </template>
            <v-list density="compact" min-width="200">
              <v-list-item prepend-icon="mdi-eye-outline" title="Xem chi tiết" />
              <v-list-item prepend-icon="mdi-pencil-outline" title="Chỉnh sửa" />
              <v-list-item prepend-icon="mdi-archive-outline" title="Lưu trữ" />
            </v-list>
          </v-menu>

          <v-tooltip text="Tooltip giải thích một hành động">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon="mdi-information-outline" variant="text" aria-label="Thông tin về tooltip" />
            </template>
          </v-tooltip>

          <v-btn variant="text" prepend-icon="mdi-bell-outline" @click="snackbarOpen = true">
            Hiện snackbar
          </v-btn>
        </div>

        <v-dialog v-model="dialogOpen" max-width="420">
          <v-card rounded="xl">
            <v-card-title class="pa-6 pb-2">Xác nhận thao tác</v-card-title>
            <v-card-text class="px-6">
              Đây là dialog mẫu. Nội dung xác nhận nên nêu rõ hành động sẽ thực hiện.
            </v-card-text>
            <v-card-actions class="justify-end pa-6 pt-2">
              <v-btn variant="text" @click="dialogOpen = false">Hủy</v-btn>
              <v-btn color="primary" @click="dialogOpen = false">Xác nhận</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-snackbar v-model="snackbarOpen" timeout="2500">
          Thao tác mẫu đã hoàn tất.
          <template #actions>
            <v-btn variant="text" @click="snackbarOpen = false">Đóng</v-btn>
          </template>
        </v-snackbar>
      </section>

      <section id="cards-table" class="dashboard-panel showcase-card showcase-card--wide">
        <div class="showcase-card__header">
          <div>
            <p class="showcase-card__eyebrow">07 / COMPONENTS</p>
            <h2 class="showcase-card__title">Card và bảng</h2>
            <p class="showcase-card__description">Ví dụ dữ liệu minh họa, bảng giữ cuộn ngang trong card.</p>
          </div>
          <v-icon icon="mdi-table-large" size="22" />
        </div>

        <div class="mini-metric-grid">
          <div class="mini-metric">
            <span>Doanh thu tháng</span>
            <strong>₫428 tr</strong>
            <small class="mini-metric__positive">↗ 12,8% so với tháng trước</small>
          </div>
          <div class="mini-metric mini-metric--lavender">
            <span>Công suất phòng</span>
            <strong>78%</strong>
            <small>94 / 120 phòng đang có khách</small>
          </div>
          <div class="mini-metric mini-metric--blue">
            <span>Đặt phòng sắp tới</span>
            <strong>56</strong>
            <small>Trong 30 ngày tiếp theo</small>
          </div>
        </div>

        <div class="sample-table-heading">
          <div>
            <h3>Đặt phòng gần đây</h3>
            <span>3 bản ghi minh họa</span>
          </div>
          <v-select
            v-model="selectedStatus"
            :items="['Đã xác nhận', 'Chờ xử lý']"
            label="Trạng thái"
            variant="outlined"
            density="compact"
            hide-details
            class="sample-table-heading__select"
          />
        </div>

        <div class="sample-table-wrap">
          <v-table class="sample-table" density="comfortable">
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
              <tr v-for="booking in sampleBookings" :key="booking.code">
                <td class="sample-table__code">{{ booking.code }}</td>
                <td>{{ booking.guest }}</td>
                <td>{{ booking.date }}</td>
                <td>
                  <v-chip :color="booking.color" variant="tonal" size="small">
                    {{ booking.status }}
                  </v-chip>
                </td>
                <td class="text-right">{{ booking.total }}</td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.ui-library-page {
  min-width: 0;
}

.ui-library-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 16px;
}

.showcase-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 18px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.showcase-card--wide {
  grid-column: 1 / -1;
}

.showcase-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.showcase-card__header > .v-icon {
  flex: 0 0 auto;
  color: var(--color-text-muted);
}

.showcase-card__eyebrow {
  margin: 0 0 6px;
  color: var(--color-text-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
}

.showcase-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.showcase-card__description {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 18px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.palette-swatch {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #fff;
}

.palette-swatch__color {
  height: 54px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.palette-swatch__details {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
}

.palette-swatch__details strong {
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.palette-swatch__details code,
.palette-swatch__details span {
  overflow: hidden;
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.radius-samples {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.radius-sample {
  display: flex;
  min-width: 120px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: var(--color-surface);
  font-size: 11px;
}

.radius-sample code {
  color: var(--color-text-muted);
  font-family: inherit;
}

.radius-sample--card {
  border-radius: 20px;
}

.radius-sample--control {
  border-radius: 8px;
}

.radius-sample--pill {
  border-radius: 999px;
}

.type-specimen {
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.type-specimen:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.type-specimen__meta {
  display: block;
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 10px;
}

.type-specimen__heading,
.type-specimen__card-title,
.type-specimen__body,
.type-specimen__caption {
  margin: 0;
}

.type-specimen__heading {
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
}

.type-specimen__card-title {
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.type-specimen__body {
  font-size: 14px;
  line-height: 20px;
}

.type-specimen__caption {
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 16px;
}

.button-examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.input-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.choice-examples {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: center;
  gap: 8px;
}

.choice-examples :deep(.v-radio-group) {
  grid-column: 1 / -1;
}

.chip-examples,
.status-examples,
.overlay-examples {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.showcase-card :deep(.v-alert) {
  font-size: 12px;
}

.progress-example {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-example__label {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.skeleton-example {
  max-width: 280px;
  overflow: hidden;
}

.skeleton-example :deep(.v-skeleton-loader) {
  background: var(--color-surface);
}

.overlay-examples {
  min-height: 110px;
  align-content: flex-start;
}

.mini-metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.mini-metric {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 16px;
  background: var(--color-surface);
}

.mini-metric--lavender {
  background: var(--color-kpi-lavender);
}

.mini-metric--blue {
  background: var(--color-kpi-blue);
}

.mini-metric > span,
.mini-metric > small {
  color: var(--color-text-muted);
  font-size: 11px;
}

.mini-metric > strong {
  font-size: 22px;
  font-weight: 600;
}

.mini-metric__positive {
  color: #348358 !important;
}

.sample-table-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.sample-table-heading h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.sample-table-heading span {
  color: var(--color-text-muted);
  font-size: 11px;
}

.sample-table-heading__select {
  max-width: 200px;
}

.sample-table-wrap {
  min-width: 0;
  overflow-x: auto;
}

.sample-table {
  min-width: 680px;
}

.sample-table :deep(th) {
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.sample-table :deep(td) {
  font-size: 12px;
  white-space: nowrap;
}

.sample-table__code {
  color: #585b83;
  font-size: 11px !important;
  font-weight: 600;
}

@media (max-width: 1000px) {
  .palette-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .ui-library-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .showcase-card--wide {
    grid-column: auto;
  }
}

@media (max-width: 520px) {
  .showcase-card {
    padding: 18px;
  }

  .palette-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .input-examples,
  .mini-metric-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .sample-table-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .sample-table-heading__select {
    width: 100%;
    max-width: none;
  }
}
</style>
