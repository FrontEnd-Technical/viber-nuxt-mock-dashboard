import type { Guest } from '#shared/types/guest'

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'

export interface BookingRoom {
  id?: number
  roomId?: number
  roomNumber?: string
  roomTypeName?: string
  pricePerNight?: number
  nights?: number
}

export interface Booking {
  id: number
  bookingCode: string
  guest?: Guest | null
  createdByUserId?: number | null
  checkInDate: string
  checkOutDate: string
  actualCheckIn?: string | null
  actualCheckOut?: string | null
  adultsCount?: number
  childrenCount?: number
  totalAmount?: number
  depositAmount?: number
  status: BookingStatus
  specialRequests?: string | null
  rooms?: BookingRoom[]
  createdAt?: string | null
}

export interface BookingSearchFilters {
  bookingCode: string
  guestId: string
  guestIdCardNumber: string
  status: BookingStatus | ''
  checkInDateFrom: string
  checkInDateTo: string
  checkOutDateFrom: string
  checkOutDateTo: string
  minTotalAmount: string
  maxTotalAmount: string
}

export interface BookingListRequest {
  path: '/bookings' | '/bookings/search'
  query: Record<string, string | number | string[]>
}
