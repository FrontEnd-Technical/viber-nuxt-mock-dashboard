<script setup lang="ts">
import type { ApiError } from '~/utils/api-response'
import type { ApiPageMeta } from '#shared/types/api'
import type { Booking, BookingSearchFilters, BookingStatus } from '#shared/types/booking'
import AppPageHeading from '~/components/shared/AppPageHeading.vue'
import { buildBookingListRequest, createEmptyBookingFilters } from '~/utils/booking-api'
import { ApiError as ApiErrorClass, toApiError } from '~/utils/api-response'

definePageMeta({
  title: 'Đặt phòng',
})

const api = useApi()
const pageSize = 10
const statusOptions: Array<{ title: string, value: BookingStatus | '' }> = [
  { title: 'Tất cả trạng thái', value: '' },
  { title: 'Chờ xác nhận', value: 'PENDING' },
  { title: 'Đã xác nhận', value: 'CONFIRMED' },
  { title: 'Đang lưu trú', value: 'CHECKED_IN' },
  { title: 'Đã trả phòng', value: 'CHECKED_OUT' },
  { title: 'Đã hủy', value: 'CANCELLED' },
]

const filters = ref<BookingSearchFilters>(createEmptyBookingFilters())
const appliedFilters = ref<BookingSearchFilters>(createEmptyBookingFilters())
const bookings = ref<Booking[]>([])
const meta = ref<ApiPageMeta>({})
const currentPage = ref(1)
const pending = ref(false)
const error = ref<ApiError | null>(null)
const validationMessage = ref('')
const detailBooking = ref<Booking | null>(null)
const detailPending = ref(false)
const detailError = ref<ApiError | null>(null)
const detailDialog = ref(false)

const pageCount = computed(() => Math.max(1, meta.value.totalPages ?? 1))
const totalRecords = computed(() => meta.value.totalElements ?? bookings.value.length)
const firstVisibleRecord = computed(() =>
  totalRecords.value ? (currentPage.value - 1) * pageSize + 1 : 0,
)
const lastVisibleRecord = computed(() =>
  Math.min(currentPage.value * pageSize, totalRecords.value),
)

async function loadBookings() {
  pending.value = true
  error.value = null
  try {
    const request = buildBookingListRequest(appliedFilters.value, currentPage.value, pageSize)
    const response = await api.withMeta<Booking[]>(request.path, { query: request.query })
    if (!Array.isArray(response.data)) {
      throw new ApiErrorClass('Danh sách đặt phòng không đúng định dạng.', 502, 'INVALID_BOOKING_LIST')
    }
    bookings.value = response.data
    meta.value = response.meta ?? {
      pageNumber: currentPage.value - 1,
      pageSize,
      totalElements: response.data.length,
      totalPages: 1,
    }
    if (typeof meta.value.pageNumber === 'number') {
      currentPage.value = meta.value.pageNumber + 1
    }
  }
  catch (cause) {
    error.value = toApiError(cause)
    bookings.value = []
    meta.value = { totalElements: 0, totalPages: 1 }
    currentPage.value = 1
  }
  finally {
    pending.value = false
  }
}

function validateFilters(): boolean {
  validationMessage.value = ''
  if (filters.value.guestId.trim()
    && (
      !/^\d+$/.test(filters.value.guestId.trim())
      || !Number.isSafeInteger(Number(filters.value.guestId))
      || Number(filters.value.guestId) < 1
    )) {
    validationMessage.value = 'Mã khách hàng phải là số nguyên dương.'
    return false
  }

  const amounts = [
    ['Giá trị tối thiểu', filters.value.minTotalAmount],
    ['Giá trị tối đa', filters.value.maxTotalAmount],
  ] as const
  for (const [label, value] of amounts) {
    if (value.trim() && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      validationMessage.value = `${label} phải là số không âm.`
      return false
    }
  }

  if (
    filters.value.minTotalAmount.trim()
    && filters.value.maxTotalAmount.trim()
    && Number(filters.value.minTotalAmount) > Number(filters.value.maxTotalAmount)
  ) {
    validationMessage.value = 'Giá trị tối đa phải lớn hơn hoặc bằng giá trị tối thiểu.'
    return false
  }

  if (
    filters.value.checkInDateFrom
    && filters.value.checkInDateTo
    && filters.value.checkInDateFrom > filters.value.checkInDateTo
  ) {
    validationMessage.value = 'Khoảng ngày nhận phòng không hợp lệ.'
    return false
  }
  if (
    filters.value.checkOutDateFrom
    && filters.value.checkOutDateTo
    && filters.value.checkOutDateFrom > filters.value.checkOutDateTo
  ) {
    validationMessage.value = 'Khoảng ngày trả phòng không hợp lệ.'
    return false
  }

  return true
}

async function applySearch() {
  if (!validateFilters()) {
    return
  }
  appliedFilters.value = { ...filters.value }
  currentPage.value = 1
  await loadBookings()
}

async function clearSearch() {
  filters.value = createEmptyBookingFilters()
  appliedFilters.value = createEmptyBookingFilters()
  currentPage.value = 1
  validationMessage.value = ''
  await loadBookings()
}

async function changePage(page: number) {
  if (pending.value || page === currentPage.value || page < 1 || page > pageCount.value) {
    return
  }
  currentPage.value = page
  await loadBookings()
}

async function openBookingDetails(booking: Booking) {
  detailDialog.value = true
  detailPending.value = true
  detailError.value = null
  detailBooking.value = booking
  try {
    detailBooking.value = await api<Booking>(`/bookings/${booking.id}`)
  }
  catch (cause) {
    detailError.value = toApiError(cause)
  }
  finally {
    detailPending.value = false
  }
}

function bookingStatusTitle(status: BookingStatus): string {
  return statusOptions.find(option => option.value === status)?.title ?? status
}

function bookingStatusColor(status: BookingStatus): string {
  switch (status) {
    case 'PENDING': return 'warning'
    case 'CONFIRMED': return 'info'
    case 'CHECKED_IN': return 'success'
    case 'CHECKED_OUT': return 'secondary'
    case 'CANCELLED': return 'error'
  }
}

function guestName(booking: Booking): string {
  const guest = booking.guest
  return guest?.fullName?.trim()
    || `${guest?.firstName ?? ''} ${guest?.lastName ?? ''}`.trim()
    || 'Chưa có thông tin'
}

function roomSummary(booking: Booking): string {
  if (!booking.rooms?.length) {
    return '—'
  }
  return booking.rooms
    .map(room => room.roomNumber ? `Phòng ${room.roomNumber}` : `Phòng #${room.roomId ?? room.id ?? ''}`)
    .join(', ')
}

function formatDate(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(date)
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

function formatCurrency(value?: number | null): string {
  if (value == null || !Number.isFinite(value)) {
    return '—'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

onMounted(() => {
  void loadBookings()
})
</script>

<template>
  <div class="admin-page bookings-page">
    <header class="admin-page__header bookings-page__header">
      <div>
        <AppPageHeading title="Đặt phòng" />
        <p class="admin-page__subtitle">
          Tra cứu đặt phòng theo mã, khách lưu trú, thời gian và giá trị.
        </p>
      </div>
    </header>

    <v-card class="bookings-card search-card" rounded="xl" elevation="0">
      <div class="bookings-card__heading">
        <div class="bookings-card__heading-icon">
          <v-icon icon="mdi-magnify" size="20" />
        </div>
        <div>
          <h2 class="bookings-card__title">Tìm kiếm đặt phòng</h2>
          <p class="bookings-card__subtitle">
            Kết hợp một hoặc nhiều tiêu chí tìm kiếm.
          </p>
        </div>
      </div>

      <v-form @submit.prevent="applySearch">
        <section class="booking-filter-section" aria-labelledby="booking-identity-title">
          <h3 id="booking-identity-title" class="search-section-title">
            Thông tin đặt phòng và khách hàng
          </h3>
          <div class="booking-fields-grid">
            <v-text-field
              v-model="filters.bookingCode"
              label="Mã đặt phòng"
              placeholder="Ví dụ: BK-2026-001"
              prepend-inner-icon="mdi-ticket-confirmation-outline"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.guestId"
              label="Mã khách hàng"
              placeholder="Nhập mã khách"
              type="number"
              min="1"
              prepend-inner-icon="mdi-account-outline"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.guestIdCardNumber"
              label="Số giấy tờ khách"
              placeholder="CCCD / hộ chiếu"
              prepend-inner-icon="mdi-card-account-details-outline"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-select
              v-model="filters.status"
              :items="statusOptions"
              label="Trạng thái đặt phòng"
              prepend-inner-icon="mdi-list-status"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </section>

        <section class="booking-filter-section" aria-labelledby="booking-date-title">
          <h3 id="booking-date-title" class="search-section-title">
            Thời gian lưu trú
          </h3>
          <div class="booking-date-grid">
            <v-text-field
              v-model="filters.checkInDateFrom"
              label="Nhận phòng từ"
              type="date"
              prepend-inner-icon="mdi-calendar-arrow-right"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.checkInDateTo"
              label="Nhận phòng đến"
              type="date"
              prepend-inner-icon="mdi-calendar-arrow-right"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.checkOutDateFrom"
              label="Trả phòng từ"
              type="date"
              prepend-inner-icon="mdi-calendar-arrow-left"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.checkOutDateTo"
              label="Trả phòng đến"
              type="date"
              prepend-inner-icon="mdi-calendar-arrow-left"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </section>

        <section class="booking-filter-section" aria-labelledby="booking-amount-title">
          <h3 id="booking-amount-title" class="search-section-title">
            Khoảng tổng tiền
          </h3>
          <div class="booking-amount-grid">
            <v-text-field
              v-model="filters.minTotalAmount"
              label="Từ số tiền"
              placeholder="0"
              type="number"
              min="0"
              step="1000"
              suffix="₫"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-text-field
              v-model="filters.maxTotalAmount"
              label="Đến số tiền"
              placeholder="Không giới hạn"
              type="number"
              min="0"
              step="1000"
              suffix="₫"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </section>

        <v-alert
          v-if="validationMessage"
          class="mt-4"
          type="warning"
          variant="tonal"
          role="alert"
        >
          {{ validationMessage }}
        </v-alert>

        <div class="search-actions">
          <v-btn
            variant="text"
            color="primary"
            prepend-icon="mdi-refresh"
            :disabled="pending"
            @click="clearSearch"
          >
            Xóa tìm kiếm
          </v-btn>
          <v-btn type="submit" color="primary" prepend-icon="mdi-magnify" :loading="pending">
            Tìm kiếm
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      closable
      role="alert"
      @click:close="error = null"
    >
      <div>{{ error.message }}</div>
      <div v-if="error.errorCode" class="text-caption mt-1">{{ error.errorCode }}</div>
      <div v-if="error.correlationId" class="text-caption mt-1">
        Mã tra cứu: {{ error.correlationId }}
      </div>
    </v-alert>

    <v-card class="bookings-card results-card" rounded="xl" elevation="0">
      <div class="results-card__header">
        <div>
          <h2 class="bookings-card__title">Danh sách đặt phòng</h2>
          <p class="bookings-card__subtitle">Kết quả được tải trực tiếp từ máy chủ.</p>
        </div>
        <v-chip
          prepend-icon="mdi-calendar-check-outline"
          variant="tonal"
          color="primary"
          size="small"
        >
          {{ totalRecords }} đặt phòng
        </v-chip>
      </div>
      <div class="records-summary" role="status" aria-live="polite">
        <span>
          {{ pending ? 'Đang tải danh sách…' : 'Đang hiển thị' }}
          <template v-if="!pending">
            <strong>{{ firstVisibleRecord }}–{{ lastVisibleRecord }}</strong>
            trong tổng số <strong>{{ totalRecords }}</strong> đặt phòng
          </template>
        </span>
        <span class="records-summary__source">
          {{ Object.values(appliedFilters).some(Boolean) ? 'Kết quả tìm kiếm' : 'Danh sách đặt phòng' }}
          <span class="records-summary__dot" />
          {{ pending ? 'Đang đồng bộ' : 'Dữ liệu máy chủ' }}
        </span>
      </div>

      <div class="records-table-wrap">
        <v-table class="records-table" density="comfortable">
          <thead>
            <tr>
              <th>Mã đặt phòng</th>
              <th>Khách hàng</th>
              <th>Phòng</th>
              <th>Nhận phòng</th>
              <th>Trả phòng</th>
              <th>Khách</th>
              <th>Trạng thái</th>
              <th class="text-right">Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in bookings" :key="booking.id">
              <td>
                <button class="booking-code-button" @click="openBookingDetails(booking)">
                  {{ booking.bookingCode }}
                </button>
                <div class="record-secondary">Mã hệ thống: {{ booking.id }}</div>
              </td>
              <td>
                <div class="record-primary">{{ guestName(booking) }}</div>
                <div class="record-secondary">
                  {{ booking.guest?.phoneNumber || booking.guest?.idCardNumber || '—' }}
                </div>
              </td>
              <td><span class="record-secondary room-summary">{{ roomSummary(booking) }}</span></td>
              <td>{{ formatDate(booking.checkInDate) }}</td>
              <td>{{ formatDate(booking.checkOutDate) }}</td>
              <td>{{ (booking.adultsCount ?? 0) + (booking.childrenCount ?? 0) }}</td>
              <td>
                <v-chip :color="bookingStatusColor(booking.status)" variant="tonal" size="small">
                  {{ bookingStatusTitle(booking.status) }}
                </v-chip>
              </td>
              <td class="text-right record-total">{{ formatCurrency(booking.totalAmount) }}</td>
            </tr>
            <tr v-if="pending && !bookings.length">
              <td colspan="8" class="loading-results">
                <v-progress-circular indeterminate color="primary" size="24" />
                <span>Đang tải đặt phòng…</span>
              </td>
            </tr>
            <tr v-else-if="!bookings.length">
              <td colspan="8" class="empty-results">
                <v-icon icon="mdi-calendar-search-outline" size="24" />
                <span>{{ error ? 'Không thể tải dữ liệu đặt phòng.' : 'Không tìm thấy đặt phòng phù hợp.' }}</span>
                <v-btn size="small" variant="text" @click="clearSearch">Xóa bộ lọc</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
      <div class="results-card__footer">
        <span class="pagination-caption">Trang {{ currentPage }} / {{ pageCount }}</span>
        <v-pagination
          :model-value="currentPage"
          :length="pageCount"
          :total-visible="5"
          :disabled="pending"
          density="comfortable"
          rounded="lg"
          aria-label="Phân trang danh sách đặt phòng"
          @update:model-value="changePage"
        />
      </div>
    </v-card>

    <v-dialog v-model="detailDialog" max-width="680" scrollable>
      <v-card rounded="xl">
        <v-card-title class="detail-title">
          <div class="detail-title__icon"><v-icon icon="mdi-calendar-text-outline" /></div>
          <div>
            <h2>Chi tiết đặt phòng</h2>
            <p>Thông tin đặt phòng và khách lưu trú.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" aria-label="Đóng" @click="detailDialog = false" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert v-if="detailError" type="error" variant="tonal" role="alert">
            {{ detailError.message }}
          </v-alert>
          <v-skeleton-loader v-else-if="detailPending" type="list-item-two-line@5" />
          <template v-else-if="detailBooking">
            <div class="booking-detail-header">
              <div>
                <strong>{{ detailBooking.bookingCode }}</strong>
                <span>Mã hệ thống: {{ detailBooking.id }}</span>
              </div>
              <v-chip
                :color="bookingStatusColor(detailBooking.status)"
                variant="tonal"
                size="small"
              >
                {{ bookingStatusTitle(detailBooking.status) }}
              </v-chip>
            </div>
            <dl class="booking-details">
              <div><dt>Khách hàng</dt><dd>{{ guestName(detailBooking) }}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{{ detailBooking.guest?.phoneNumber || '—' }}</dd></div>
              <div><dt>Số giấy tờ</dt><dd>{{ detailBooking.guest?.idCardNumber || '—' }}</dd></div>
              <div><dt>Phòng</dt><dd>{{ roomSummary(detailBooking) }}</dd></div>
              <div><dt>Nhận phòng</dt><dd>{{ formatDate(detailBooking.checkInDate) }}</dd></div>
              <div><dt>Trả phòng</dt><dd>{{ formatDate(detailBooking.checkOutDate) }}</dd></div>
              <div><dt>Số người lớn</dt><dd>{{ detailBooking.adultsCount ?? 0 }}</dd></div>
              <div><dt>Số trẻ em</dt><dd>{{ detailBooking.childrenCount ?? 0 }}</dd></div>
              <div><dt>Tiền đặt cọc</dt><dd>{{ formatCurrency(detailBooking.depositAmount) }}</dd></div>
              <div><dt>Tổng tiền</dt><dd>{{ formatCurrency(detailBooking.totalAmount) }}</dd></div>
              <div><dt>Check-in thực tế</dt><dd>{{ formatDateTime(detailBooking.actualCheckIn) }}</dd></div>
              <div><dt>Check-out thực tế</dt><dd>{{ formatDateTime(detailBooking.actualCheckOut) }}</dd></div>
              <div class="booking-details__wide">
                <dt>Yêu cầu đặc biệt</dt>
                <dd>{{ detailBooking.specialRequests || '—' }}</dd>
              </div>
            </dl>
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions class="detail-actions">
          <v-btn variant="text" @click="detailDialog = false">Đóng</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.bookings-page { display: grid; gap: 20px; }
.bookings-page__header { margin-bottom: 0; }
.bookings-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}
.search-card { padding: 24px; }
.bookings-card__heading, .results-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.bookings-card__heading { justify-content: flex-start; margin-bottom: 24px; }
.bookings-card__heading-icon, .detail-title__icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-kpi-lavender);
  color: rgb(var(--v-theme-primary));
}
.bookings-card__title { margin: 0; font-size: 16px; font-weight: 600; line-height: 22px; }
.bookings-card__subtitle {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 18px;
}
.booking-filter-section + .booking-filter-section {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.search-section-title { margin: 0 0 14px; font-size: 13px; font-weight: 600; line-height: 20px; }
.booking-fields-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 12px; }
.booking-date-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px 12px; }
.booking-amount-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 12px; }
.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.results-card { padding: 24px 0 12px; }
.results-card__header { padding: 0 24px 20px; }
.records-summary {
  display: flex;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 24px;
  border-block: 1px solid rgba(0, 0, 0, 0.06);
  background: #fcfcfd;
  color: var(--color-text-muted);
  font-size: 12px;
}
.records-summary strong { color: var(--color-text); font-weight: 600; }
.records-summary__source { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.records-summary__dot { width: 6px; height: 6px; border-radius: 50%; background: #71dd8c; }
.records-table-wrap { overflow-x: auto; }
.records-table { min-width: 1080px; }
.records-table :deep(th) {
  height: 44px;
  background: #fcfcfd;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.records-table :deep(td) { height: 68px; font-size: 12px; white-space: nowrap; }
.record-primary { color: var(--color-text); font-weight: 500; line-height: 18px; }
.record-secondary {
  max-width: 190px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
}
.room-summary { display: block; max-width: 180px; }
.record-total { font-weight: 600; }
.booking-code-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #585b83;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}
.booking-code-button:hover { color: rgb(var(--v-theme-primary)); }
.booking-code-button:focus-visible { outline: 2px solid var(--color-text); outline-offset: 2px; }
.empty-results, .loading-results { height: 180px !important; color: var(--color-text-muted); text-align: center; }
.empty-results :deep(.v-icon), .loading-results :deep(.v-progress-circular) { display: block; margin: 0 auto 8px; }
.loading-results span { display: block; }
.results-card__footer {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 24px 0;
}
.pagination-caption { color: var(--color-text-muted); font-size: 12px; white-space: nowrap; }
.results-card__footer :deep(.v-pagination__list) { justify-content: flex-end; }
.detail-title { display: flex; align-items: center; gap: 12px; padding: 20px 24px; }
.detail-title h2 { margin: 0; font-size: 16px; font-weight: 600; }
.detail-title p { margin: 3px 0 0; color: var(--color-text-muted); font-size: 12px; }
.detail-title :deep(.v-btn) { margin-left: auto; }
.booking-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 2px 0 18px;
}
.booking-detail-header div { display: grid; gap: 4px; }
.booking-detail-header strong { font-size: 15px; }
.booking-detail-header span { color: var(--color-text-muted); font-size: 12px; }
.booking-details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 0; }
.booking-details__wide { grid-column: 1 / -1; }
.booking-details dt { margin-bottom: 4px; color: var(--color-text-muted); font-size: 11px; }
.booking-details dd { margin: 0; color: var(--color-text); font-size: 13px; overflow-wrap: anywhere; }
.detail-actions { justify-content: flex-end; padding: 16px 24px; }
@media (max-width: 1100px) {
  .booking-fields-grid, .booking-date-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 700px) {
  .search-card { padding: 20px 16px; }
  .booking-fields-grid, .booking-date-grid, .booking-amount-grid { grid-template-columns: minmax(0, 1fr); }
  .search-actions { flex-wrap: wrap; }
  .results-card { padding-top: 20px; }
  .results-card__header { padding-inline: 16px; }
  .records-summary { align-items: flex-start; flex-direction: column; padding: 10px 16px; }
  .results-card__footer { align-items: flex-start; flex-direction: column; padding-inline: 16px; }
  .results-card__footer :deep(.v-pagination__list) { justify-content: flex-start; }
  .booking-details { grid-template-columns: minmax(0, 1fr); }
  .booking-details__wide { grid-column: auto; }
  .detail-title { padding-inline: 16px; }
}
</style>
