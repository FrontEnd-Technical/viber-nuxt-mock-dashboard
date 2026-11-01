<script setup lang="ts">
import type { ApiError } from '~/utils/api-response'
import type { ApiPageMeta } from '#shared/types/api'
import type {
  CreateRoomRequest,
  Room,
  RoomSearchFilters,
  RoomStatus,
  RoomTypeOption,
  UpdateRoomStatusRequest,
} from '#shared/types/room'
import AppOperationResultDialog from '~/components/shared/AppOperationResultDialog.vue'
import AppPagination from '~/components/shared/AppPagination.vue'
import AppPageHeading from '~/components/shared/AppPageHeading.vue'
import { buildRoomListRequest } from '~/utils/room-api'
import { ApiError as ApiErrorClass, toApiError } from '~/utils/api-response'
import { isPageSize, PAGE_SIZE_OPTIONS, type PageSize } from '~/utils/pagination'

definePageMeta({
  title: 'Phòng',
})

type CreateRoomForm = Omit<CreateRoomRequest, 'roomTypeId' | 'floorNumber'> & {
  roomTypeId: number | null
  floorNumber: number | null
}

const api = useApi()
const pageSize = ref<PageSize>(10)
const statusOptions: Array<{ title: string, value: RoomStatus | '' }> = [
  { title: 'Tất cả trạng thái', value: '' },
  { title: 'Trống', value: 'AVAILABLE' },
  { title: 'Đang có khách', value: 'OCCUPIED' },
  { title: 'Đã đặt', value: 'RESERVED' },
  { title: 'Đang dọn dẹp', value: 'CLEANING' },
  { title: 'Bảo trì', value: 'MAINTENANCE' },
]

function createEmptyFilters(): RoomSearchFilters {
  return {
    status: '',
    roomTypeId: '',
    floorNumber: '',
    checkInDate: '',
    checkOutDate: '',
    availableOnly: false,
  }
}

const filters = ref<RoomSearchFilters>(createEmptyFilters())
const appliedFilters = ref<RoomSearchFilters>(createEmptyFilters())
const rooms = ref<Room[]>([])
const roomTypes = ref<RoomTypeOption[]>([])
const meta = ref<ApiPageMeta>({})
const currentPage = ref(1)
const pending = ref(false)
const typesPending = ref(false)
const error = ref<ApiError | null>(null)
const typesError = ref<ApiError | null>(null)
const successMessage = ref('')
const validationMessage = ref('')
const isAvailabilityResult = ref(false)
const createDialogOpen = ref(false)
const statusDialogOpen = ref(false)
const createPending = ref(false)
const statusPending = ref(false)
const createValidationAttempted = ref(false)
const createRoomForm = ref<CreateRoomForm>({
  roomNumber: '',
  roomTypeId: null,
  floorNumber: null,
  status: 'AVAILABLE',
  notes: '',
})
const selectedRoom = ref<Room | null>(null)
const statusForm = ref<UpdateRoomStatusRequest>({
  status: 'AVAILABLE',
  notes: '',
})
const resultDialogOpen = ref(false)
const resultDialogTitle = ref('')
const resultDialogMessage = ref('')
const resultDialogType = ref<'success' | 'error'>('success')
const resultDialogDetails = ref<string[]>([])
let roomTypesLoadPromise: Promise<void> | null = null

const createFieldErrors = computed(() => {
  const roomNumber = createRoomForm.value.roomNumber.trim()
  const roomTypeId = createRoomForm.value.roomTypeId
  const floorValue = String(createRoomForm.value.floorNumber ?? '').trim()
  const floorNumber = Number(floorValue)

  return {
    roomNumber: !roomNumber ? 'Vui lòng nhập số phòng.' : '',
    roomTypeId: !Number.isSafeInteger(roomTypeId)
      || !roomTypes.value.some(roomType => roomType.id === roomTypeId)
      ? 'Vui lòng chọn loại phòng.'
      : '',
    floorNumber: !floorValue
      ? 'Vui lòng nhập tầng.'
      : !Number.isSafeInteger(floorNumber) || floorNumber < 0
        ? 'Tầng phải là số nguyên không âm.'
        : '',
  }
})

const pageCount = computed(() => isAvailabilityResult.value
  ? Math.max(1, Math.ceil(rooms.value.length / pageSize.value))
  : Math.max(1, meta.value.totalPages ?? 1))
const totalRecords = computed(() => meta.value.totalElements ?? rooms.value.length)
const visibleRooms = computed(() => isAvailabilityResult.value
  ? rooms.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
  : rooms.value)
const firstVisibleRecord = computed(() =>
  totalRecords.value ? (currentPage.value - 1) * pageSize.value + 1 : 0,
)
const lastVisibleRecord = computed(() =>
  Math.min(currentPage.value * pageSize.value, totalRecords.value),
)

function loadRoomTypes(): Promise<void> {
  if (roomTypesLoadPromise) {
    return roomTypesLoadPromise
  }

  typesPending.value = true
  typesError.value = null
  roomTypesLoadPromise = (async () => {
    try {
      const result = await api<RoomTypeOption[]>('/room-types')
      if (!Array.isArray(result)) {
        throw new ApiErrorClass('Danh sách loại phòng không đúng định dạng.', 502, 'INVALID_ROOM_TYPES')
      }
      roomTypes.value = result
    }
    catch (cause) {
      typesError.value = toApiError(cause)
    }
    finally {
      typesPending.value = false
      roomTypesLoadPromise = null
    }
  })()

  return roomTypesLoadPromise
}

async function loadRooms() {
  pending.value = true
  error.value = null
  successMessage.value = ''
  try {
    const searchFilters = appliedFilters.value
    const allRoomTypes = searchFilters.availableOnly
      && (searchFilters.roomTypeId === '' || searchFilters.roomTypeId === null)

    if (allRoomTypes) {
      if (typesPending.value) {
        await loadRoomTypes()
      }
      if (typesError.value) {
        throw new ApiErrorClass(
          'Không thể tra cứu phòng trống vì không tải được danh sách loại phòng.',
          502,
          'ROOM_TYPES_UNAVAILABLE',
        )
      }

      const requests = roomTypes.value.map(roomType =>
        buildRoomListRequest(
          { ...searchFilters, roomTypeId: roomType.id },
          currentPage.value,
          pageSize.value,
        ),
      )
      const responses = await Promise.all(requests.map(request =>
        api.withMeta<Room[]>(request.path, { query: request.query }),
      ))
      const availableRooms = responses.flatMap((response) => {
        if (!Array.isArray(response.data)) {
          throw new ApiErrorClass(
            'Danh sách phòng trống không đúng định dạng.',
            502,
            'INVALID_AVAILABLE_ROOMS',
          )
        }
        return response.data
      })

      rooms.value = availableRooms.sort((first, second) =>
        first.roomNumber.localeCompare(second.roomNumber, 'vi'),
      )
      meta.value = {
        pageNumber: 0,
        pageSize: pageSize.value,
        totalElements: rooms.value.length,
        totalPages: Math.max(1, Math.ceil(rooms.value.length / pageSize.value)),
      }
      isAvailabilityResult.value = true
      return
    }

    const request = buildRoomListRequest(searchFilters, currentPage.value, pageSize.value)
    if (request.path === '/rooms/available') {
      const response = await api.withMeta<Room[]>(request.path, { query: request.query })
      if (!Array.isArray(response.data)) {
        throw new ApiErrorClass('Danh sách phòng trống không đúng định dạng.', 502, 'INVALID_AVAILABLE_ROOMS')
      }
      rooms.value = response.data
      meta.value = {
        pageNumber: 0,
        pageSize: pageSize.value,
        totalElements: response.data.length,
        totalPages: Math.max(1, Math.ceil(response.data.length / pageSize.value)),
      }
    }
    else {
      const response = await api.withMeta<Room[]>(request.path, { query: request.query })
      if (!Array.isArray(response.data)) {
        throw new ApiErrorClass('Danh sách phòng không đúng định dạng.', 502, 'INVALID_ROOM_LIST')
      }
      rooms.value = response.data
      meta.value = response.meta ?? {
        pageNumber: currentPage.value - 1,
        pageSize: pageSize.value,
        totalElements: response.data.length,
        totalPages: 1,
      }
      if (typeof meta.value.pageNumber === 'number') {
        currentPage.value = meta.value.pageNumber + 1
      }
    }
    isAvailabilityResult.value = request.path === '/rooms/available'
  }
  catch (cause) {
    error.value = toApiError(cause)
    rooms.value = []
    meta.value = { totalElements: 0, totalPages: 1 }
    currentPage.value = 1
  }
  finally {
    pending.value = false
  }
}

async function applySearch() {
  validationMessage.value = ''
  const floorValue = filters.value.floorNumber.trim()
  if (floorValue && (!/^\d+$/.test(floorValue) || Number(floorValue) < 0)) {
    validationMessage.value = 'Tầng phải là số nguyên không âm.'
    return
  }
  if (filters.value.availableOnly) {
    if (!filters.value.checkInDate || !filters.value.checkOutDate) {
      validationMessage.value = 'Vui lòng chọn ngày nhận và trả phòng.'
      return
    }
    if (filters.value.checkOutDate <= filters.value.checkInDate) {
      validationMessage.value = 'Ngày trả phòng phải sau ngày nhận phòng.'
      return
    }
  }

  appliedFilters.value = { ...filters.value }
  currentPage.value = 1
  await loadRooms()
}

async function clearSearch() {
  filters.value = createEmptyFilters()
  appliedFilters.value = createEmptyFilters()
  currentPage.value = 1
  validationMessage.value = ''
  isAvailabilityResult.value = false
  await loadRooms()
}

async function changePage(page: number) {
  if (pending.value || page === currentPage.value || page < 1 || page > pageCount.value) {
    return
  }
  currentPage.value = page
  if (isAvailabilityResult.value) {
    return
  }
  await loadRooms()
}

async function changePageSize(value: unknown) {
  if (!isPageSize(value) || value === pageSize.value) {
    return
  }

  pageSize.value = value
  currentPage.value = 1
  if (!isAvailabilityResult.value) {
    await loadRooms()
  }
}

function showOperationResult(
  type: 'success' | 'error',
  title: string,
  message: string,
  details: string[] = [],
) {
  resultDialogType.value = type
  resultDialogTitle.value = title
  resultDialogMessage.value = message
  resultDialogDetails.value = details
  resultDialogOpen.value = true
}

function openCreateRoomDialog() {
  createRoomForm.value = {
    roomNumber: '',
    roomTypeId: null,
    floorNumber: null,
    status: 'AVAILABLE',
    notes: '',
  }
  createValidationAttempted.value = false
  createDialogOpen.value = true
}

function openStatusDialog(room: Room) {
  selectedRoom.value = room
  statusForm.value = {
    status: room.status,
    notes: room.notes ?? '',
  }
  statusDialogOpen.value = true
}

function getApiErrorDetails(cause: unknown): string[] {
  const error = toApiError(cause)
  const details = error.errors?.map(fieldError =>
    `${fieldError.field ? `${fieldError.field}: ` : ''}${fieldError.message}`,
  ) ?? []

  if (error.errorCode) {
    details.push(`Mã lỗi: ${error.errorCode}`)
  }
  if (error.correlationId) {
    details.push(`Mã tra cứu: ${error.correlationId}`)
  }
  return details
}

async function createRoom() {
  createValidationAttempted.value = true
  if (Object.values(createFieldErrors.value).some(Boolean)) {
    return
  }

  const roomNumber = createRoomForm.value.roomNumber.trim()
  const roomTypeId = Number(createRoomForm.value.roomTypeId)
  const floorNumber = Number(createRoomForm.value.floorNumber)

  const body: CreateRoomRequest = {
    roomNumber,
    roomTypeId,
    floorNumber,
    status: createRoomForm.value.status,
    notes: createRoomForm.value.notes?.trim() || undefined,
  }

  createPending.value = true
  try {
    const response = await api.withMeta<Room>('/rooms', {
      method: 'POST',
      body,
    })
    if (!response.data || typeof response.data.id !== 'number') {
      throw new ApiErrorClass(
        'Đã nhận phản hồi thành công nhưng dữ liệu phòng không hợp lệ.',
        502,
        'INVALID_CREATED_ROOM',
      )
    }

    createDialogOpen.value = false
    showOperationResult(
      'success',
      response.message,
      `Phòng ${response.data.roomNumber || roomNumber} đã được thêm vào danh sách phòng.`,
    )
    if (isAvailabilityResult.value) {
      filters.value = createEmptyFilters()
      appliedFilters.value = createEmptyFilters()
      isAvailabilityResult.value = false
    }
    currentPage.value = 1
    await loadRooms()
  }
  catch (cause) {
    const error = toApiError(cause)
    showOperationResult(
      'error',
      error.message,
      'Không thể tạo phòng. Kiểm tra thông tin và thử lại.',
      getApiErrorDetails(cause),
    )
  }
  finally {
    createPending.value = false
  }
}

async function updateRoomStatus() {
  if (!selectedRoom.value) {
    return
  }

  const room = selectedRoom.value
  const body: UpdateRoomStatusRequest = {
    status: statusForm.value.status,
    notes: statusForm.value.notes?.trim() || undefined,
  }

  statusPending.value = true
  try {
    const response = await api.withMeta<Room>(`/rooms/${room.id}/status`, {
      method: 'PATCH',
      body,
    })
    if (!response.data || typeof response.data.id !== 'number') {
      throw new ApiErrorClass(
        'Đã nhận phản hồi thành công nhưng dữ liệu phòng không hợp lệ.',
        502,
        'INVALID_UPDATED_ROOM',
      )
    }

    statusDialogOpen.value = false
    showOperationResult(
      'success',
      response.message,
      `Trạng thái phòng ${response.data.roomNumber || room.roomNumber} đã được cập nhật.`,
    )
    await loadRooms()
  }
  catch (cause) {
    const error = toApiError(cause)
    showOperationResult(
      'error',
      error.message,
      `Không thể cập nhật trạng thái phòng ${room.roomNumber}. Vui lòng thử lại.`,
      getApiErrorDetails(cause),
    )
  }
  finally {
    statusPending.value = false
  }
}

function roomStatusTitle(status: RoomStatus): string {
  return statusOptions.find(option => option.value === status)?.title ?? status
}

function roomStatusColor(status: RoomStatus): string {
  switch (status) {
    case 'AVAILABLE': return 'success'
    case 'OCCUPIED': return 'error'
    case 'RESERVED': return 'info'
    case 'CLEANING': return 'warning'
    case 'MAINTENANCE': return 'secondary'
  }
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
  void loadRoomTypes()
  void loadRooms()
})
</script>

<template>
  <div class="admin-page rooms-page">
    <header class="admin-page__header rooms-page__header">
      <div>
        <AppPageHeading title="Phòng" />
        <p class="admin-page__subtitle">
          Tra cứu phòng theo trạng thái, loại phòng, tầng hoặc ngày lưu trú.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        rounded="lg"
        @click="openCreateRoomDialog"
      >
        Thêm phòng
      </v-btn>
    </header>

    <v-card class="rooms-card search-card" rounded="xl" elevation="0">
      <div class="rooms-card__heading">
        <div class="rooms-card__heading-icon">
          <v-icon icon="mdi-magnify" size="20" />
        </div>
        <div>
          <h2 class="rooms-card__title">Tìm kiếm phòng</h2>
          <p class="rooms-card__subtitle">
            Chọn tiêu chí lọc được hỗ trợ bởi hệ thống.
          </p>
        </div>
      </div>

      <v-form @submit.prevent="applySearch">
        <div class="room-search-fields">
          <div v-if="!filters.availableOnly" class="room-search-field">
            <label class="room-search-field__label" for="room-status">Trạng thái phòng</label>
            <v-select
              id="room-status"
              v-model="filters.status"
              :items="statusOptions"
              aria-label="Trạng thái phòng"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
          <div class="room-search-field">
            <label class="room-search-field__label" for="room-type">Loại phòng</label>
            <v-select
              id="room-type"
              v-model="filters.roomTypeId"
              :items="roomTypes"
              item-title="name"
              item-value="id"
              aria-label="Loại phòng"
              placeholder="Tất cả loại phòng"
              clearable
              :loading="typesPending"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
          <div v-if="!filters.availableOnly" class="room-search-field">
            <label class="room-search-field__label" for="room-floor">Tầng</label>
            <v-text-field
              id="room-floor"
              v-model="filters.floorNumber"
              aria-label="Tầng"
              placeholder="Ví dụ: 2"
              type="number"
              min="0"
              step="1"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </div>

        <v-alert
          v-if="validationMessage"
          class="mt-4"
          type="warning"
          variant="tonal"
          role="alert"
        >
          {{ validationMessage }}
        </v-alert>
        <v-alert
          v-if="typesError"
          class="mt-4"
          type="error"
          variant="tonal"
          role="alert"
        >
          Không tải được loại phòng: {{ typesError.message }}
        </v-alert>

        <v-divider class="availability-divider" />
        <div class="availability-filter">
          <div class="availability-filter__intro">
            <v-icon icon="mdi-calendar-search-outline" color="primary" />
            <div>
              <strong>Tìm phòng trống theo ngày</strong>
              <p>Yêu cầu chọn một loại phòng và ngày nhận/trả phòng.</p>
            </div>
          </div>
          <v-switch
            v-model="filters.availableOnly"
            color="primary"
            hide-details
            inset
            aria-label="Bật tìm phòng trống theo ngày"
          />
        </div>
        <div v-if="filters.availableOnly" class="availability-fields">
          <div class="room-search-field">
            <label class="room-search-field__label" for="room-check-in">Ngày nhận phòng</label>
            <v-text-field
              id="room-check-in"
              v-model="filters.checkInDate"
              aria-label="Ngày nhận phòng"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
          <div class="room-search-field">
            <label class="room-search-field__label" for="room-check-out">Ngày trả phòng</label>
            <v-text-field
              id="room-check-out"
              v-model="filters.checkOutDate"
              aria-label="Ngày trả phòng"
              type="date"
              variant="outlined"
              density="comfortable"
              hide-details
            />
          </div>
        </div>

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

    <v-card class="rooms-card results-card" rounded="xl" elevation="0">
      <div class="results-card__header">
        <div>
          <h2 class="rooms-card__title">Danh sách phòng</h2>
          <p class="rooms-card__subtitle">Kết quả được tải trực tiếp từ máy chủ.</p>
        </div>
        <v-chip prepend-icon="mdi-bed-outline" variant="tonal" color="primary" size="small">
          {{ totalRecords }} phòng
        </v-chip>
      </div>
      <div class="records-summary" role="status" aria-live="polite">
        <span>
          {{ pending ? 'Đang tải danh sách…' : 'Đang hiển thị' }}
          <template v-if="!pending">
            <strong>{{ firstVisibleRecord }}–{{ lastVisibleRecord }}</strong>
            trong tổng số <strong>{{ totalRecords }}</strong> phòng
          </template>
        </span>
        <span class="records-summary__sample">
          {{ isAvailabilityResult ? 'Phòng trống theo ngày' : 'Danh sách phòng' }}
          <span class="records-summary__dot" />
          {{ pending ? 'Đang đồng bộ' : 'Dữ liệu máy chủ' }}
        </span>
      </div>
      <div class="records-table-wrap">
        <v-table class="records-table" density="comfortable">
          <thead>
            <tr>
              <th>Số phòng</th>
              <th>Loại phòng</th>
              <th>Tầng</th>
              <th>Giá cơ bản</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="room in visibleRooms" :key="room.id">
              <td class="record-code">{{ room.roomNumber }}</td>
              <td>
                <div class="record-primary">{{ room.roomTypeName || '—' }}</div>
                <div class="record-secondary">{{ room.roomTypeCode || `Loại #${room.roomTypeId}` }}</div>
              </td>
              <td>{{ room.floorNumber }}</td>
              <td class="record-total">{{ formatCurrency(room.basePrice) }}</td>
              <td>
                <v-chip :color="roomStatusColor(room.status)" variant="tonal" size="small">
                  {{ roomStatusTitle(room.status) }}
                </v-chip>
              </td>
              <td><span class="record-secondary">{{ room.notes || '—' }}</span></td>
              <td class="text-right">
                <v-btn
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  :aria-label="`Cập nhật trạng thái phòng ${room.roomNumber}`"
                  @click="openStatusDialog(room)"
                />
              </td>
            </tr>
            <tr v-if="pending && !rooms.length">
              <td colspan="7" class="loading-results">
                <v-progress-circular indeterminate color="primary" size="24" />
                <span>Đang tải phòng…</span>
              </td>
            </tr>
            <tr v-else-if="!rooms.length">
              <td colspan="7" class="empty-results">
                <v-icon icon="mdi-bed-empty" size="24" />
                <span>{{ error ? 'Không thể tải dữ liệu phòng.' : 'Không tìm thấy phòng phù hợp.' }}</span>
                <v-btn size="small" variant="text" @click="clearSearch">Xóa bộ lọc</v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>
      <AppPagination
        :page="currentPage"
        :page-count="pageCount"
        :page-size="pageSize"
        :page-size-options="[...PAGE_SIZE_OPTIONS]"
        :disabled="pending"
        ariaLabel="Phân trang danh sách phòng"
        @update:page="changePage"
        @update:page-size="changePageSize"
      />
    </v-card>

    <v-dialog
      v-model="createDialogOpen"
      max-width="620"
      :persistent="createPending"
    >
      <v-card rounded="xl">
        <v-card-title class="room-dialog-title">
          <div class="room-dialog-title__icon">
            <v-icon icon="mdi-bed-plus-outline" />
          </div>
          <div>
            <h2>Thêm phòng</h2>
            <p>Nhập thông tin phòng mới.</p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Đóng"
            :disabled="createPending"
            @click="createDialogOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <div class="room-form-grid">
            <v-text-field
              v-model="createRoomForm.roomNumber"
              :error-messages="createValidationAttempted ? createFieldErrors.roomNumber : []"
              label="Số phòng *"
              placeholder="Ví dụ: 101"
              prepend-inner-icon="mdi-door"
              variant="outlined"
              density="comfortable"
              required
            />
            <v-select
              v-model="createRoomForm.roomTypeId"
              :items="roomTypes"
              item-title="name"
              item-value="id"
              :error-messages="createValidationAttempted ? createFieldErrors.roomTypeId : []"
              label="Loại phòng *"
              :loading="typesPending"
              :disabled="typesPending || !roomTypes.length"
              prepend-inner-icon="mdi-bed-outline"
              variant="outlined"
              density="comfortable"
              required
            />
            <v-text-field
              v-model.number="createRoomForm.floorNumber"
              :error-messages="createValidationAttempted ? createFieldErrors.floorNumber : []"
              label="Tầng *"
              type="number"
              min="0"
              step="1"
              prepend-inner-icon="mdi-stairs"
              variant="outlined"
              density="comfortable"
              required
            />
            <v-select
              v-model="createRoomForm.status"
              :items="statusOptions.filter(option => option.value)"
              label="Trạng thái ban đầu"
              prepend-inner-icon="mdi-list-status"
              variant="outlined"
              density="comfortable"
            />
            <v-textarea
              v-model="createRoomForm.notes"
              class="room-form-grid__wide"
              label="Ghi chú"
              rows="3"
              auto-grow
              variant="outlined"
              density="comfortable"
            />
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions class="room-dialog-actions">
          <v-btn
            variant="text"
            :disabled="createPending"
            @click="createDialogOpen = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="createPending"
            :disabled="!roomTypes.length"
            @click="createRoom"
          >
            Tạo phòng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="statusDialogOpen"
      max-width="560"
      :persistent="statusPending"
    >
      <v-card rounded="xl">
        <v-card-title class="room-dialog-title">
          <div class="room-dialog-title__icon">
            <v-icon icon="mdi-pencil-outline" />
          </div>
          <div>
            <h2>Cập nhật trạng thái phòng</h2>
            <p v-if="selectedRoom">Phòng {{ selectedRoom.roomNumber }}</p>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            aria-label="Đóng"
            :disabled="statusPending"
            @click="statusDialogOpen = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-select
            v-model="statusForm.status"
            :items="statusOptions.filter(option => option.value)"
            label="Trạng thái *"
            prepend-inner-icon="mdi-list-status"
            variant="outlined"
            density="comfortable"
            required
          />
          <v-textarea
            v-model="statusForm.notes"
            class="mt-2"
            label="Ghi chú"
            rows="3"
            auto-grow
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="room-dialog-actions">
          <v-btn
            variant="text"
            :disabled="statusPending"
            @click="statusDialogOpen = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="statusPending"
            @click="updateRoomStatus"
          >
            Lưu trạng thái
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <AppOperationResultDialog
      v-model="resultDialogOpen"
      :title="resultDialogTitle"
      :message="resultDialogMessage"
      :type="resultDialogType"
      :details="resultDialogDetails"
    />
  </div>
</template>

<style scoped>
.rooms-page { display: grid; gap: 20px; }
.rooms-page__header { align-items: center; margin-bottom: 0; }
.rooms-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}
.search-card { padding: 24px; }
.rooms-card__heading, .results-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.rooms-card__heading { justify-content: flex-start; margin-bottom: 24px; }
.rooms-card__heading-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-kpi-lavender);
}
.rooms-card__title { margin: 0; font-size: 16px; font-weight: 600; line-height: 22px; }
.rooms-card__subtitle {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 18px;
}
.room-search-fields, .availability-fields {
  display: grid;
  gap: 12px;
}
.room-search-field {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(0, 3fr);
  align-items: center;
  gap: 16px;
}
.room-search-field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
}
.availability-divider { margin: 22px 0 14px; }
.availability-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.availability-filter__intro { display: flex; align-items: center; gap: 12px; }
.availability-filter__intro strong { font-size: 13px; font-weight: 600; }
.availability-filter__intro p {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}
.availability-fields {
  margin-top: 16px;
}
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
.records-summary__sample { display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.records-summary__dot { width: 6px; height: 6px; border-radius: 50%; background: #71dd8c; }
.records-table-wrap { overflow-x: auto; }
.records-table { min-width: 900px; }
.records-table :deep(th) {
  height: 44px;
  background: #fcfcfd;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}
.records-table :deep(td) { height: 68px; font-size: 12px; white-space: nowrap; }
.record-code { color: #585b83; font-size: 12px !important; font-weight: 600; }
.record-primary { color: var(--color-text); font-weight: 500; line-height: 18px; }
.record-secondary {
  max-width: 190px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
}
.record-total { font-weight: 600; }
.empty-results, .loading-results { height: 180px !important; color: var(--color-text-muted); text-align: center; }
.empty-results :deep(.v-icon), .loading-results :deep(.v-progress-circular) { display: block; margin: 0 auto 8px; }
.loading-results span { display: block; }
.room-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
}
.room-dialog-title__icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-kpi-lavender);
  color: rgb(var(--v-theme-primary));
}
.room-dialog-title h2 { margin: 0; font-size: 16px; font-weight: 600; }
.room-dialog-title p { margin: 3px 0 0; color: var(--color-text-muted); font-size: 12px; }
.room-dialog-title :deep(.v-btn) { margin-left: auto; }
.room-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.room-form-grid__wide { grid-column: 1 / -1; }
.room-dialog-actions { justify-content: flex-end; gap: 8px; padding: 16px 24px; }
@media (max-width: 900px) {
  .room-search-field { grid-template-columns: minmax(120px, 1fr) minmax(0, 3fr); }
}
@media (max-width: 700px) {
  .rooms-page__header { align-items: flex-start; flex-direction: column; }
  .search-card { padding: 20px 16px; }
  .room-search-field { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .room-search-fields, .availability-fields { gap: 14px; }
  .search-actions { flex-wrap: wrap; }
  .results-card { padding-top: 20px; }
  .results-card__header { padding-inline: 16px; }
  .records-summary { align-items: flex-start; flex-direction: column; padding: 10px 16px; }
}
@media (max-width: 520px) {
  .room-form-grid { grid-template-columns: minmax(0, 1fr); }
  .room-form-grid__wide { grid-column: auto; }
  .room-dialog-title, .room-dialog-actions { padding-inline: 16px; }
}
</style>
