export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'MAINTENANCE'

export interface Room {
  id: number
  roomNumber: string
  roomTypeId: number
  roomTypeCode?: string | null
  roomTypeName?: string | null
  basePrice?: number | null
  floorNumber: number
  status: RoomStatus
  notes?: string | null
}

export interface CreateRoomRequest {
  roomNumber: string
  roomTypeId: number
  floorNumber: number
  status?: RoomStatus
  notes?: string
}

export interface UpdateRoomStatusRequest {
  status: RoomStatus
  notes?: string
}

export interface RoomTypeOption {
  id: number
  code: string
  name: string
  status?: string
}

export interface RoomSearchFilters {
  status: RoomStatus | ''
  roomTypeId: number | '' | null
  floorNumber: string
  checkInDate: string
  checkOutDate: string
  availableOnly: boolean
}

export interface RoomListRequest {
  path: '/rooms' | '/rooms/available'
  query: Record<string, string | number | string[]>
  paginated: boolean
}
