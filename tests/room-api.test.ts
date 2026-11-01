import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildRoomListRequest } from '../app/utils/room-api.ts'
import type { RoomSearchFilters } from '../shared/types/room.ts'

const emptyFilters: RoomSearchFilters = {
  status: '',
  roomTypeId: '',
  floorNumber: '',
  checkInDate: '',
  checkOutDate: '',
  availableOnly: false,
}

describe('room API query builder', () => {
  it('builds a pageable room request with selected backend filters', () => {
    assert.deepEqual(
      buildRoomListRequest({
        ...emptyFilters,
        status: 'AVAILABLE',
        roomTypeId: 3,
        floorNumber: '2',
      }, 2, 10),
      {
        path: '/rooms',
        paginated: true,
        query: {
          page: 1,
          size: 10,
          sort: ['roomNumber,asc'],
          status: 'AVAILABLE',
          roomTypeId: 3,
          floorNumber: 2,
        },
      },
    )
  })

  it('uses the availability endpoint only with its required filter values', () => {
    assert.deepEqual(
      buildRoomListRequest({
        ...emptyFilters,
        availableOnly: true,
        roomTypeId: 3,
        checkInDate: '2026-11-01',
        checkOutDate: '2026-11-03',
      }, 1, 10),
      {
        path: '/rooms/available',
        paginated: false,
        query: {
          roomTypeId: 3,
          checkInDate: '2026-11-01',
          checkOutDate: '2026-11-03',
        },
      },
    )
  })

  it('omits a cleared room type from the room list query', () => {
    assert.deepEqual(
      buildRoomListRequest({ ...emptyFilters, roomTypeId: null }, 1, 10),
      {
        path: '/rooms',
        paginated: true,
        query: { page: 0, size: 10, sort: ['roomNumber,asc'] },
      },
    )
  })
})
