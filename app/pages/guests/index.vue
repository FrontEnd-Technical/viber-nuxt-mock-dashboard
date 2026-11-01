<script setup lang="ts">
import type { ApiError } from '~/utils/api-response'
import type {
  Guest,
  GuestCreateRequest,
  GuestGender,
  GuestSearchState,
  GuestUpdateRequest,
  GuestVipLevel,
} from '#shared/types/guest'
import type { ApiPageMeta } from '#shared/types/api'
import AppPageHeading from '~/components/shared/AppPageHeading.vue'
import AppPagination from '~/components/shared/AppPagination.vue'
import { createEmptyGuestCriteria, buildGuestListRequest } from '~/utils/guest-api'
import { ApiError as ApiErrorClass, toApiError } from '~/utils/api-response'
import { isPageSize, PAGE_SIZE_OPTIONS, type PageSize } from '~/utils/pagination'

definePageMeta({
  title: 'Khách hàng',
})

type DialogMode = 'create' | 'edit' | 'details' | 'delete' | null

interface GuestForm {
  userId: string
  firstName: string
  lastName: string
  idCardNumber: string
  phoneNumber: string
  email: string
  address: string
  nationality: string
  dateOfBirth: string
  gender: GuestGender | ''
  vipLevel: GuestVipLevel | ''
  notes: string
}

const api = useApi()
const pageSize = ref<PageSize>(10)
const genderOptions = [
  { title: 'Nam', value: 'MALE' },
  { title: 'Nữ', value: 'FEMALE' },
  { title: 'Khác', value: 'OTHER' },
]
const vipOptions = [
  { title: 'Thường', value: 'REGULAR' },
  { title: 'Bạc', value: 'SILVER' },
  { title: 'Vàng', value: 'GOLD' },
  { title: 'Bạch kim', value: 'PLATINUM' },
]

function createEmptyForm(): GuestForm {
  return {
    userId: '',
    firstName: '',
    lastName: '',
    idCardNumber: '',
    phoneNumber: '',
    email: '',
    address: '',
    nationality: '',
    dateOfBirth: '',
    gender: '',
    vipLevel: '',
    notes: '',
  }
}

function createEmptySearch(): GuestSearchState {
  return {
    mode: 'keyword',
    keyword: '',
    criteria: createEmptyGuestCriteria(),
  }
}

const search = ref<GuestSearchState>(createEmptySearch())
const appliedSearch = ref<GuestSearchState>(createEmptySearch())
const guests = ref<Guest[]>([])
const meta = ref<ApiPageMeta>({})
const currentPage = ref(1)
const pending = ref(false)
const listError = ref<ApiError | null>(null)
const dialogError = ref<ApiError | null>(null)
const successMessage = ref('')
const isIdCardResult = ref(false)
const dialogMode = ref<DialogMode>(null)
const selectedGuest = ref<Guest | null>(null)
const guestForm = ref<GuestForm>(createEmptyForm())
const guestFormRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null)
const saving = ref(false)
const deleting = ref(false)

const pageCount = computed(() => Math.max(1, meta.value.totalPages ?? 1))
const totalRecords = computed(() => meta.value.totalElements ?? guests.value.length)
const firstVisibleRecord = computed(() =>
  totalRecords.value ? (currentPage.value - 1) * pageSize.value + 1 : 0,
)
const lastVisibleRecord = computed(() =>
  Math.min(currentPage.value * pageSize.value, totalRecords.value),
)
const isFormDialog = computed(() =>
  dialogMode.value === 'create' || dialogMode.value === 'edit',
)

function copySearch(source: GuestSearchState): GuestSearchState {
  return {
    mode: source.mode,
    keyword: source.keyword,
    criteria: { ...source.criteria },
  }
}

async function loadGuests() {
  pending.value = true
  listError.value = null

  try {
    const request = buildGuestListRequest(
      appliedSearch.value,
      currentPage.value,
      pageSize.value,
    )
    const response = await api.withMeta<Guest[]>(request.path, {
      query: request.query,
    })

    if (!Array.isArray(response.data)) {
      throw new ApiErrorClass(
        'Danh sách khách hàng từ máy chủ không đúng định dạng.',
        502,
        'INVALID_GUEST_LIST',
      )
    }

    guests.value = response.data
    meta.value = response.meta ?? { totalElements: response.data.length, totalPages: 1 }
    if (typeof meta.value.pageNumber === 'number') {
      currentPage.value = meta.value.pageNumber + 1
    }
    isIdCardResult.value = false
  }
  catch (cause) {
    listError.value = toApiError(cause)
    guests.value = []
    meta.value = { totalElements: 0, totalPages: 1 }
  }
  finally {
    pending.value = false
  }
}

async function applySearch() {
  appliedSearch.value = copySearch(search.value)
  currentPage.value = 1
  isIdCardResult.value = false
  successMessage.value = ''
  await loadGuests()
}

async function clearSearch() {
  search.value = createEmptySearch()
  appliedSearch.value = createEmptySearch()
  currentPage.value = 1
  isIdCardResult.value = false
  await loadGuests()
}

async function changePage(page: number) {
  if (page === currentPage.value || page < 1 || page > pageCount.value) {
    return
  }

  currentPage.value = page
  await loadGuests()
}

async function changePageSize(value: unknown) {
  if (!isPageSize(value) || value === pageSize.value) {
    return
  }

  pageSize.value = value
  currentPage.value = 1
  if (!isIdCardResult.value) {
    await loadGuests()
  }
}

async function findByIdCard() {
  const idCardNumber = search.value.criteria.idCardNumber.trim()
  if (!idCardNumber) {
    listError.value = new ApiErrorClass(
      'Vui lòng nhập số giấy tờ để tra cứu.',
      400,
      'ID_CARD_REQUIRED',
    )
    return
  }

  pending.value = true
  listError.value = null
  successMessage.value = ''
  try {
    const guest = await api<Guest>(
      `/guests/id-card/${encodeURIComponent(idCardNumber)}`,
    )
    guests.value = [guest]
    meta.value = { pageNumber: 0, pageSize: pageSize.value, totalElements: 1, totalPages: 1 }
    currentPage.value = 1
    isIdCardResult.value = true
  }
  catch (cause) {
    listError.value = toApiError(cause)
    guests.value = []
    meta.value = { totalElements: 0, totalPages: 1 }
    currentPage.value = 1
    isIdCardResult.value = true
  }
  finally {
    pending.value = false
  }
}

function emptyOptional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed || undefined
}

function openCreateDialog() {
  selectedGuest.value = null
  guestForm.value = createEmptyForm()
  dialogError.value = null
  dialogMode.value = 'create'
}

async function openDetails(guest: Guest) {
  dialogMode.value = 'details'
  selectedGuest.value = guest
  dialogError.value = null

  try {
    selectedGuest.value = await api<Guest>(`/guests/${guest.id}`)
  }
  catch (cause) {
    dialogError.value = toApiError(cause)
  }
}

async function openEdit(guest: Guest) {
  await openDetails(guest)
  if (!dialogError.value) {
    openEditDialog()
  }
}

function openEditDialog() {
  if (!selectedGuest.value) {
    return
  }

  const guest = selectedGuest.value
  guestForm.value = {
    userId: guest.userId == null ? '' : String(guest.userId),
    firstName: guest.firstName,
    lastName: guest.lastName,
    idCardNumber: guest.idCardNumber,
    phoneNumber: guest.phoneNumber,
    email: guest.email ?? '',
    address: guest.address ?? '',
    nationality: guest.nationality ?? '',
    dateOfBirth: guest.dateOfBirth ?? '',
    gender: guest.gender ?? '',
    vipLevel: guest.vipLevel ?? '',
    notes: guest.notes ?? '',
  }
  dialogError.value = null
  dialogMode.value = 'edit'
}

function openDeleteDialog() {
  dialogError.value = null
  dialogMode.value = 'delete'
}

function closeDialog() {
  if (saving.value || deleting.value) {
    return
  }
  dialogMode.value = null
  dialogError.value = null
}

async function saveGuest() {
  const validation = await guestFormRef.value?.validate()
  if (!validation?.valid) {
    return
  }

  const form = guestForm.value
  const optionalFields = {
    email: emptyOptional(form.email),
    address: emptyOptional(form.address),
    nationality: emptyOptional(form.nationality),
    dateOfBirth: emptyOptional(form.dateOfBirth),
    gender: form.gender || undefined,
    vipLevel: form.vipLevel || undefined,
    notes: emptyOptional(form.notes),
  }

  let body: GuestCreateRequest | GuestUpdateRequest
  if (dialogMode.value === 'create') {
    const createBody: GuestCreateRequest = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      idCardNumber: form.idCardNumber.trim(),
      phoneNumber: form.phoneNumber.trim(),
      ...optionalFields,
    }
    if (form.userId.trim()) {
      const userId = Number(form.userId)
      if (!Number.isSafeInteger(userId) || userId < 1) {
        dialogError.value = new ApiErrorClass(
          'Mã tài khoản liên kết phải là số nguyên dương.',
          400,
          'INVALID_USER_ID',
        )
        return
      }
      createBody.userId = userId
    }
    body = createBody
  }
  else {
    body = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim(),
      ...optionalFields,
    }
  }

  saving.value = true
  dialogError.value = null
  try {
    if (dialogMode.value === 'create') {
      await api<Guest>('/guests', { method: 'POST', body })
      successMessage.value = 'Đã thêm khách hàng mới.'
    }
    else if (dialogMode.value === 'edit' && selectedGuest.value) {
      await api<Guest>(`/guests/${selectedGuest.value.id}`, {
        method: 'PUT',
        body,
      })
      successMessage.value = 'Đã cập nhật thông tin khách hàng.'
    }
    else {
      return
    }

    dialogMode.value = null
    await loadGuests()
  }
  catch (cause) {
    dialogError.value = toApiError(cause)
  }
  finally {
    saving.value = false
  }
}

async function deleteGuest() {
  if (!selectedGuest.value) {
    return
  }

  deleting.value = true
  dialogError.value = null
  try {
    await api<void>(`/guests/${selectedGuest.value.id}`, { method: 'DELETE' })
    dialogMode.value = null
    successMessage.value = 'Đã xóa khách hàng.'
    if (guests.value.length === 1 && currentPage.value > 1) {
      currentPage.value -= 1
    }
    await loadGuests()
  }
  catch (cause) {
    dialogError.value = toApiError(cause)
  }
  finally {
    deleting.value = false
  }
}

function guestName(guest: Guest): string {
  return guest.fullName?.trim() || `${guest.firstName} ${guest.lastName}`.trim()
}

function genderTitle(gender?: GuestGender | null): string {
  return genderOptions.find(option => option.value === gender)?.title ?? '—'
}

function vipTitle(level?: GuestVipLevel | null): string {
  return vipOptions.find(option => option.value === level)?.title ?? 'Thường'
}

function vipColor(level?: GuestVipLevel | null): string {
  switch (level) {
    case 'SILVER':
      return 'info'
    case 'GOLD':
      return 'warning'
    case 'PLATINUM':
      return 'secondary'
    default:
      return 'default'
  }
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

function showFieldErrors(error: ApiError | null) {
  return error?.errors?.filter(item => item.message) ?? []
}

onMounted(() => {
  void loadGuests()
})
</script>

<template>
  <div class="admin-page guests-page">
    <header class="admin-page__header guests-page__header">
      <div>
        <AppPageHeading title="Khách hàng" />
        <p class="admin-page__subtitle">
          Quản lý hồ sơ, thông tin liên hệ và hạng thành viên khách hàng.
        </p>
      </div>
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus-outline"
        rounded="lg"
        @click="openCreateDialog"
      >
        Thêm khách hàng
      </v-btn>
    </header>

    <v-card class="guests-card search-card" rounded="xl" elevation="0">
      <div class="guests-card__heading">
        <div class="guests-card__heading-icon">
          <v-icon icon="mdi-magnify" size="20" />
        </div>
        <div>
          <h2 class="guests-card__title">Tìm kiếm</h2>
          <p class="guests-card__subtitle">
            Tra cứu nhanh hoặc kết hợp các tiêu chí hồ sơ khách.
          </p>
        </div>
      </div>

      <v-form @submit.prevent="applySearch">
        <div class="search-mode" role="group" aria-label="Chế độ tìm kiếm khách hàng">
          <button
            type="button"
            :aria-pressed="search.mode === 'keyword'"
            :class="{ 'is-selected': search.mode === 'keyword' }"
            @click="search.mode = 'keyword'"
          >
            Tìm nhanh
          </button>
          <button
            type="button"
            :aria-pressed="search.mode === 'advanced'"
            :class="{ 'is-selected': search.mode === 'advanced' }"
            @click="search.mode = 'advanced'"
          >
            Tìm nâng cao
          </button>
        </div>

        <div v-if="search.mode === 'keyword'" class="quick-search">
          <v-text-field
            v-model="search.keyword"
            label="Từ khóa"
            placeholder="Tên, số điện thoại, email hoặc số giấy tờ"
            prepend-inner-icon="mdi-account-search-outline"
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </div>

        <div v-else class="guest-search-grid">
          <section aria-labelledby="guest-search-title">
            <h3 id="guest-search-title" class="search-section-title">
              Thông tin khách hàng
            </h3>
            <div class="guest-fields-grid">
              <v-text-field
                v-model="search.criteria.firstName"
                label="Tên"
                placeholder="Nhập tên"
                prepend-inner-icon="mdi-account-outline"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                v-model="search.criteria.lastName"
                label="Họ và tên đệm"
                placeholder="Nhập họ và tên đệm"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                v-model="search.criteria.idCardNumber"
                label="Số giấy tờ"
                placeholder="CCCD / hộ chiếu"
                prepend-inner-icon="mdi-card-account-details-outline"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                v-model="search.criteria.phoneNumber"
                label="Số điện thoại"
                placeholder="Nhập số điện thoại"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                v-model="search.criteria.email"
                label="Email"
                placeholder="Nhập email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-text-field
                v-model="search.criteria.nationality"
                label="Quốc tịch"
                placeholder="Nhập quốc tịch"
                prepend-inner-icon="mdi-earth"
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </div>
          </section>

          <section class="guest-filters" aria-labelledby="guest-filter-title">
            <h3 id="guest-filter-title" class="search-section-title">
              Phân loại khách
            </h3>
            <v-select
              v-model="search.criteria.gender"
              :items="genderOptions"
              label="Giới tính"
              clearable
              prepend-inner-icon="mdi-human-male-female"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-select
              v-model="search.criteria.vipLevel"
              :items="vipOptions"
              label="Hạng thành viên"
              clearable
              prepend-inner-icon="mdi-star-outline"
              variant="outlined"
              density="comfortable"
              hide-details
            />
            <v-btn
              variant="outlined"
              prepend-icon="mdi-card-search-outline"
              :disabled="!search.criteria.idCardNumber.trim()"
              @click="findByIdCard"
            >
              Tra cứu chính xác số giấy tờ
            </v-btn>
          </section>
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
          <v-btn
            type="submit"
            color="primary"
            prepend-icon="mdi-magnify"
            :loading="pending"
          >
            {{ search.mode === 'keyword' ? 'Tìm nhanh' : 'Tìm khách hàng' }}
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <v-alert
      v-if="listError"
      type="error"
      variant="tonal"
      closable
      role="alert"
      @click:close="listError = null"
    >
      <div>{{ listError.message }}</div>
      <div v-if="listError.errorCode" class="text-caption mt-1">
        {{ listError.errorCode }}
      </div>
      <div v-if="listError.correlationId" class="text-caption mt-1">
        Mã tra cứu: {{ listError.correlationId }}
      </div>
    </v-alert>

    <v-alert
      v-if="successMessage"
      type="success"
      variant="tonal"
      closable
      role="status"
      @click:close="successMessage = ''"
    >
      {{ successMessage }}
    </v-alert>

    <v-card class="guests-card results-card" rounded="xl" elevation="0">
      <div class="results-card__header">
        <div>
          <h2 class="guests-card__title">Danh sách</h2>
          <p class="guests-card__subtitle">
            Hồ sơ khách hàng được đồng bộ từ hệ thống.
          </p>
        </div>
        <v-chip
          prepend-icon="mdi-account-group-outline"
          variant="tonal"
          color="primary"
          size="small"
        >
          {{ totalRecords }} khách hàng
        </v-chip>
      </div>

      <div class="records-summary" role="status" aria-live="polite">
        <span>
          {{ pending ? 'Đang tải danh sách…' : 'Đang hiển thị' }}
          <template v-if="!pending">
            <strong>{{ firstVisibleRecord }}–{{ lastVisibleRecord }}</strong>
            trong tổng số <strong>{{ totalRecords }}</strong> khách
          </template>
        </span>
        <span class="records-summary__source">
          {{ isIdCardResult ? 'Tra cứu giấy tờ' : 'Dữ liệu máy chủ' }}
          <span class="records-summary__dot" />
          {{ pending ? 'Đang đồng bộ' : 'Đã đồng bộ' }}
        </span>
      </div>

      <div class="records-table-wrap">
        <v-table class="records-table" density="comfortable">
          <thead>
            <tr>
              <th>Khách hàng</th>
              <th>Số giấy tờ</th>
              <th>Thông tin liên hệ</th>
              <th>Quốc tịch</th>
              <th>Giới tính</th>
              <th>Hạng thành viên</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="guest in guests" :key="guest.id">
              <td>
                <button class="guest-name-button" @click="openDetails(guest)">
                  {{ guestName(guest) }}
                </button>
                <div class="record-secondary">Mã khách: {{ guest.id }}</div>
              </td>
              <td class="record-code">{{ guest.idCardNumber }}</td>
              <td>
                <div class="record-primary">{{ guest.phoneNumber }}</div>
                <div class="record-secondary">{{ guest.email || 'Chưa có email' }}</div>
              </td>
              <td>{{ guest.nationality || '—' }}</td>
              <td>{{ genderTitle(guest.gender) }}</td>
              <td>
                <v-chip :color="vipColor(guest.vipLevel)" variant="tonal" size="small">
                  {{ vipTitle(guest.vipLevel) }}
                </v-chip>
              </td>
              <td class="text-right">
                <div class="record-actions">
                  <v-btn
                    icon="mdi-eye-outline"
                    size="small"
                    variant="text"
                    :aria-label="`Xem khách ${guestName(guest)}`"
                    @click="openDetails(guest)"
                  />
                  <v-btn
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    :aria-label="`Sửa khách ${guestName(guest)}`"
                    @click="openEdit(guest)"
                  />
                  <v-btn
                    icon="mdi-delete-outline"
                    size="small"
                    variant="text"
                    color="error"
                    :aria-label="`Xóa khách ${guestName(guest)}`"
                    @click="selectedGuest = guest; openDeleteDialog()"
                  />
                </div>
              </td>
            </tr>
            <tr v-if="!pending && !guests.length">
              <td colspan="7" class="empty-results">
                <v-icon icon="mdi-account-search-outline" size="24" />
                <span>{{ listError ? 'Không thể tải dữ liệu khách hàng.' : 'Không tìm thấy khách hàng phù hợp.' }}</span>
                <v-btn size="small" variant="text" @click="clearSearch">
                  Tải lại danh sách
                </v-btn>
              </td>
            </tr>
            <tr v-if="pending && !guests.length">
              <td colspan="7" class="loading-results">
                <v-progress-circular indeterminate color="primary" size="24" />
                <span>Đang tải danh sách khách hàng…</span>
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
        :pagination-disabled="isIdCardResult"
        ariaLabel="Phân trang danh sách khách hàng"
        @update:page="changePage"
        @update:page-size="changePageSize"
      />
    </v-card>

    <v-dialog
      :model-value="isFormDialog"
      max-width="760"
      scrollable
      @update:model-value="!$event && closeDialog()"
    >
      <v-card rounded="xl">
        <v-card-title class="dialog-title">
          <div class="dialog-title__icon">
            <v-icon :icon="dialogMode === 'create' ? 'mdi-account-plus-outline' : 'mdi-account-edit-outline'" />
          </div>
          <div>
            <h2>{{ dialogMode === 'create' ? 'Thêm khách hàng' : 'Cập nhật khách hàng' }}</h2>
            <p>Nhập đầy đủ thông tin hồ sơ khách hàng.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" aria-label="Đóng" @click="closeDialog" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert
            v-if="dialogError"
            class="mb-4"
            type="error"
            variant="tonal"
            role="alert"
          >
            <div>{{ dialogError.message }}</div>
            <div
              v-for="(fieldError, index) in showFieldErrors(dialogError)"
              :key="`${fieldError.field}-${index}`"
              class="text-caption mt-1"
            >
              {{ fieldError.field ? `${fieldError.field}: ` : '' }}{{ fieldError.message }}
            </div>
          </v-alert>
          <v-form ref="guestFormRef" @submit.prevent="saveGuest">
            <div class="form-fields-grid">
              <v-text-field
                v-if="dialogMode === 'create'"
                v-model="guestForm.userId"
                label="Mã tài khoản liên kết"
                placeholder="Không bắt buộc"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="guestForm.firstName"
                label="Tên *"
                :rules="[value => !!String(value ?? '').trim() || 'Vui lòng nhập tên.']"
                variant="outlined"
                density="comfortable"
                required
              />
              <v-text-field
                v-model="guestForm.lastName"
                label="Họ và tên đệm *"
                :rules="[value => !!String(value ?? '').trim() || 'Vui lòng nhập họ và tên đệm.']"
                variant="outlined"
                density="comfortable"
                required
              />
              <v-text-field
                v-model="guestForm.idCardNumber"
                label="Số giấy tờ *"
                :readonly="dialogMode === 'edit'"
                :rules="[value => !!String(value ?? '').trim() || 'Vui lòng nhập số giấy tờ.']"
                prepend-inner-icon="mdi-card-account-details-outline"
                variant="outlined"
                density="comfortable"
                required
              />
              <v-text-field
                v-model="guestForm.phoneNumber"
                label="Số điện thoại *"
                :rules="[value => !!String(value ?? '').trim() || 'Vui lòng nhập số điện thoại.']"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                density="comfortable"
                required
              />
              <v-text-field
                v-model="guestForm.email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="guestForm.nationality"
                label="Quốc tịch"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="guestForm.dateOfBirth"
                label="Ngày sinh"
                type="date"
                variant="outlined"
                density="comfortable"
              />
              <v-select
                v-model="guestForm.gender"
                :items="genderOptions"
                label="Giới tính"
                clearable
                variant="outlined"
                density="comfortable"
              />
              <v-select
                v-model="guestForm.vipLevel"
                :items="vipOptions"
                label="Hạng thành viên"
                clearable
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="guestForm.address"
                class="form-fields-grid__wide"
                label="Địa chỉ"
                prepend-inner-icon="mdi-map-marker-outline"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="guestForm.notes"
                class="form-fields-grid__wide"
                label="Ghi chú"
                rows="3"
                auto-grow
                variant="outlined"
                density="comfortable"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions class="dialog-actions">
          <v-btn variant="text" :disabled="saving" @click="closeDialog">
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-content-save-outline"
            :loading="saving"
            @click="saveGuest"
          >
            {{ dialogMode === 'create' ? 'Tạo khách hàng' : 'Lưu thay đổi' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="dialogMode === 'details'"
      max-width="640"
      @update:model-value="!$event && closeDialog()"
    >
      <v-card rounded="xl">
        <v-card-title class="dialog-title">
          <div class="dialog-title__icon">
            <v-icon icon="mdi-account-box-outline" />
          </div>
          <div>
            <h2>Thông tin khách hàng</h2>
            <p>Hồ sơ chi tiết và thông tin liên hệ.</p>
          </div>
          <v-btn icon="mdi-close" variant="text" aria-label="Đóng" @click="closeDialog" />
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-alert v-if="dialogError" class="mb-4" type="error" variant="tonal" role="alert">
            {{ dialogError.message }}
          </v-alert>
          <v-skeleton-loader v-else-if="!selectedGuest" type="list-item-two-line@4" />
          <template v-else>
            <div class="guest-detail-identity">
              <v-avatar color="secondary" size="54">
                <span class="text-h6 font-weight-bold">
                  {{ guestName(selectedGuest).slice(0, 2).toUpperCase() }}
                </span>
              </v-avatar>
              <div>
                <h3>{{ guestName(selectedGuest) }}</h3>
                <span>Mã khách hàng: {{ selectedGuest.id }}</span>
              </div>
              <v-chip :color="vipColor(selectedGuest.vipLevel)" variant="tonal" size="small">
                {{ vipTitle(selectedGuest.vipLevel) }}
              </v-chip>
            </div>
            <dl class="guest-details">
              <div><dt>Số giấy tờ</dt><dd>{{ selectedGuest.idCardNumber }}</dd></div>
              <div><dt>Số điện thoại</dt><dd>{{ selectedGuest.phoneNumber }}</dd></div>
              <div><dt>Email</dt><dd>{{ selectedGuest.email || '—' }}</dd></div>
              <div><dt>Ngày sinh</dt><dd>{{ formatDate(selectedGuest.dateOfBirth) }}</dd></div>
              <div><dt>Giới tính</dt><dd>{{ genderTitle(selectedGuest.gender) }}</dd></div>
              <div><dt>Quốc tịch</dt><dd>{{ selectedGuest.nationality || '—' }}</dd></div>
              <div class="guest-details__wide"><dt>Địa chỉ</dt><dd>{{ selectedGuest.address || '—' }}</dd></div>
              <div class="guest-details__wide"><dt>Ghi chú</dt><dd>{{ selectedGuest.notes || '—' }}</dd></div>
              <div class="guest-details__wide"><dt>Ngày tạo hồ sơ</dt><dd>{{ formatDateTime(selectedGuest.createdAt) }}</dd></div>
            </dl>
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions class="dialog-actions">
          <v-btn variant="text" @click="closeDialog">Đóng</v-btn>
          <v-btn
            color="primary"
            prepend-icon="mdi-pencil-outline"
            :disabled="!selectedGuest || !!dialogError"
            @click="openEditDialog"
          >
            Chỉnh sửa
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      :model-value="dialogMode === 'delete'"
      max-width="440"
      @update:model-value="!$event && closeDialog()"
    >
      <v-card rounded="xl">
        <v-card-title class="delete-dialog-title">
          <v-avatar color="error" variant="tonal" size="44">
            <v-icon icon="mdi-delete-outline" />
          </v-avatar>
          <div>
            <h2>Xóa khách hàng?</h2>
            <p>Thao tác này không thể hoàn tác.</p>
          </div>
        </v-card-title>
        <v-card-text>
          <v-alert v-if="dialogError" class="mb-4" type="error" variant="tonal" role="alert">
            {{ dialogError.message }}
          </v-alert>
          Hồ sơ của <strong>{{ selectedGuest ? guestName(selectedGuest) : '' }}</strong>
          sẽ bị xóa khỏi hệ thống.
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn variant="text" :disabled="deleting" @click="closeDialog">
            Hủy
          </v-btn>
          <v-btn color="error" prepend-icon="mdi-delete-outline" :loading="deleting" @click="deleteGuest">
            Xóa khách hàng
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.guests-page {
  display: grid;
  gap: 20px;
}

.guests-page__header {
  margin-bottom: 0;
}

.guests-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.search-card {
  padding: 24px;
}

.guests-card__heading,
.results-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.guests-card__heading {
  justify-content: flex-start;
  margin-bottom: 20px;
}

.guests-card__heading-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-kpi-lavender);
}

.guests-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
}

.guests-card__subtitle {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  line-height: 18px;
}

.search-mode {
  display: inline-flex;
  gap: 2px;
  margin-bottom: 18px;
  padding: 3px;
  border-radius: 8px;
  background: #f4f4f5;
}

.search-mode button {
  min-height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 12px;
}

.search-mode button.is-selected {
  background: #fff;
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-mode button:focus-visible,
.guest-name-button:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.quick-search {
  max-width: 720px;
}

.guest-search-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 28px;
}

.search-section-title {
  margin: 0 0 14px;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
}

.guest-fields-grid,
.form-fields-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.guest-filters {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
}

.guest-filters .search-section-title {
  margin-bottom: -4px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.results-card {
  padding: 24px 0 12px;
}

.results-card__header {
  padding: 0 24px 20px;
}

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

.records-summary strong {
  color: var(--color-text);
  font-weight: 600;
}

.records-summary__source {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.records-summary__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #71dd8c;
}

.records-table-wrap {
  overflow-x: auto;
}

.records-table {
  min-width: 940px;
}

.records-table :deep(th) {
  height: 44px;
  background: #fcfcfd;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
}

.records-table :deep(td) {
  height: 68px;
  font-size: 12px;
  white-space: nowrap;
}

.record-primary {
  color: var(--color-text);
  font-weight: 500;
  line-height: 18px;
}

.record-secondary {
  max-width: 190px;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
  text-overflow: ellipsis;
}

.record-code {
  color: #585b83;
  font-size: 11px !important;
  font-weight: 600;
}

.guest-name-button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  font: inherit;
  font-weight: 600;
  text-align: left;
}

.guest-name-button:hover {
  color: rgb(var(--v-theme-primary));
}

.record-actions {
  display: inline-flex;
  justify-content: flex-end;
}

.empty-results,
.loading-results {
  height: 180px !important;
  color: var(--color-text-muted);
  text-align: center;
}

.empty-results :deep(.v-icon),
.loading-results :deep(.v-progress-circular) {
  display: block;
  margin: 0 auto 8px;
}

.loading-results span {
  display: block;
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
}

.dialog-title__icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border-radius: 12px;
  background: var(--color-kpi-lavender);
  color: rgb(var(--v-theme-primary));
}

.dialog-title h2,
.delete-dialog-title h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.dialog-title p,
.delete-dialog-title p {
  margin: 3px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 400;
}

.dialog-title :deep(.v-btn) {
  margin-left: auto;
}

.dialog-actions {
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
}

.form-fields-grid__wide {
  grid-column: 1 / -1;
}

.guest-detail-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0 20px;
}

.guest-detail-identity h3 {
  margin: 0 0 4px;
  font-size: 16px;
}

.guest-detail-identity span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.guest-detail-identity :deep(.v-chip) {
  margin-left: auto;
}

.guest-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
}

.guest-details > div {
  min-width: 0;
}

.guest-details__wide {
  grid-column: 1 / -1;
}

.guest-details dt {
  margin-bottom: 4px;
  color: var(--color-text-muted);
  font-size: 11px;
}

.guest-details dd {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.delete-dialog-title {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 12px;
}

@media (max-width: 1000px) {
  .guest-search-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .guest-filters {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }

  .guest-filters .search-section-title {
    grid-column: 1 / -1;
    margin-bottom: -4px;
  }
}

@media (max-width: 700px) {
  .guests-page__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .search-card {
    padding: 20px 16px;
  }

  .guest-fields-grid,
  .guest-filters {
    grid-template-columns: minmax(0, 1fr);
  }

  .guest-filters .search-section-title {
    grid-column: auto;
  }

  .search-actions {
    flex-wrap: wrap;
  }

  .results-card {
    padding-top: 20px;
  }

  .results-card__header {
    padding-inline: 16px;
  }

  .records-summary {
    align-items: flex-start;
    flex-direction: column;
    padding: 10px 16px;
  }

}

@media (max-width: 520px) {
  .form-fields-grid,
  .guest-details {
    grid-template-columns: minmax(0, 1fr);
  }

  .form-fields-grid__wide,
  .guest-details__wide {
    grid-column: auto;
  }

  .dialog-title,
  .dialog-actions {
    padding-inline: 16px;
  }

  .guest-detail-identity {
    flex-wrap: wrap;
  }

  .guest-detail-identity :deep(.v-chip) {
    margin-left: 66px;
  }
}
</style>
