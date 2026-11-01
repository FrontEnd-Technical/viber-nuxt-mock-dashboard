import type {
  BookingListRequest,
  BookingSearchFilters,
} from '#shared/types/booking'

export function createEmptyBookingFilters(): BookingSearchFilters {
  return {
    bookingCode: '',
    guestId: '',
    guestIdCardNumber: '',
    status: '',
    checkInDateFrom: '',
    checkInDateTo: '',
    checkOutDateFrom: '',
    checkOutDateTo: '',
    minTotalAmount: '',
    maxTotalAmount: '',
  }
}

export function buildBookingListRequest(
  filters: BookingSearchFilters,
  page: number,
  pageSize: number,
): BookingListRequest {
  const query: BookingListRequest['query'] = {
    page: Math.max(0, page - 1),
    size: pageSize,
    sort: ['createdAt,desc'],
  }
  const criteria: Record<string, string | number> = {}
  const searchFields: Record<string, string> = {}
  const textFields = [
    'bookingCode',
    'guestIdCardNumber',
    'checkInDateFrom',
    'checkInDateTo',
    'checkOutDateFrom',
    'checkOutDateTo',
  ] as const

  for (const field of textFields) {
    const value = filters[field].trim()
    if (value) {
      searchFields[field] = value
    }
  }
  if (filters.guestId.trim()) {
    searchFields.guestId = filters.guestId
  }
  if (filters.minTotalAmount.trim()) {
    searchFields.minTotalAmount = filters.minTotalAmount
  }
  if (filters.maxTotalAmount.trim()) {
    searchFields.maxTotalAmount = filters.maxTotalAmount
  }

  if (Object.keys(searchFields).length) {
    for (const [field, value] of Object.entries(searchFields)) {
      criteria[field] = ['guestId', 'minTotalAmount', 'maxTotalAmount'].includes(field)
        ? Number(value)
        : value
    }
    if (filters.status) {
      criteria.status = filters.status
    }
    return {
      path: '/bookings/search',
      query: { ...criteria, ...query },
    }
  }

  if (filters.status) {
    query.status = filters.status
  }

  return { path: '/bookings', query }
}
