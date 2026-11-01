import type { RoomListRequest, RoomSearchFilters } from '#shared/types/room'

export function buildRoomListRequest(
  filters: RoomSearchFilters,
  page: number,
  pageSize: number,
): RoomListRequest {
  const query: RoomListRequest['query'] = {
    page: Math.max(0, page - 1),
    size: pageSize,
    sort: ['roomNumber,asc'],
  }

  if (filters.availableOnly) {
    return {
      path: '/rooms/available',
      paginated: false,
      query: {
        roomTypeId: Number(filters.roomTypeId),
        checkInDate: filters.checkInDate,
        checkOutDate: filters.checkOutDate,
      },
    }
  }

  if (filters.status) {
    query.status = filters.status
  }
  if (filters.roomTypeId !== '' && filters.roomTypeId !== null) {
    query.roomTypeId = filters.roomTypeId
  }
  if (filters.floorNumber.trim()) {
    query.floorNumber = Number(filters.floorNumber)
  }

  return { path: '/rooms', query, paginated: true }
}
