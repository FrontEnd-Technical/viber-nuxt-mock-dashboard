import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildBookingListRequest,
  createEmptyBookingFilters,
} from '../app/utils/booking-api.ts'

describe('booking API query builder', () => {
  it('uses the pageable collection endpoint when no filters are specified', () => {
    assert.deepEqual(
      buildBookingListRequest(createEmptyBookingFilters(), 1, 10),
      {
        path: '/bookings',
        query: { page: 0, size: 10, sort: ['createdAt,desc'] },
      },
    )
  })

  it('serializes populated booking filters as flat criteria query fields', () => {
    const filters = {
      ...createEmptyBookingFilters(),
      bookingCode: ' BK-100 ',
      guestId: '23',
      status: 'CONFIRMED' as const,
      checkInDateFrom: '2026-11-01',
      maxTotalAmount: '9000000',
    }
    assert.deepEqual(buildBookingListRequest(filters, 3, 10), {
      path: '/bookings/search',
      query: {
        bookingCode: 'BK-100',
        checkInDateFrom: '2026-11-01',
        guestId: 23,
        status: 'CONFIRMED',
        maxTotalAmount: 9000000,
        page: 2,
        size: 10,
        sort: ['createdAt,desc'],
      },
    })
  })

  it('uses the list endpoint for status-only filters', () => {
    assert.deepEqual(
      buildBookingListRequest({
        ...createEmptyBookingFilters(),
        status: 'CHECKED_IN',
      }, 1, 10),
      {
        path: '/bookings',
        query: {
          page: 0,
          size: 10,
          sort: ['createdAt,desc'],
          status: 'CHECKED_IN',
        },
      },
    )
  })
})
