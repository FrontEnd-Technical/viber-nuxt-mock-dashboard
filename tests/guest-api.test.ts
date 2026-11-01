import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildGuestListRequest,
  createEmptyGuestCriteria,
} from '../app/utils/guest-api.ts'
import type { GuestSearchState } from '../shared/types/guest.ts'

const emptySearch: GuestSearchState = {
  mode: 'keyword',
  keyword: '',
  criteria: createEmptyGuestCriteria(),
}

describe('guest API query builder', () => {
  it('uses the guest collection for an unfiltered first page', () => {
    assert.deepEqual(buildGuestListRequest(emptySearch, 1, 10), {
      path: '/guests',
      query: { page: 0, size: 10, sort: ['createdAt,desc'] },
    })
  })

  it('trims quick-search keywords and converts the page to zero-based indexing', () => {
    assert.deepEqual(
      buildGuestListRequest({ ...emptySearch, keyword: '  Minh Anh  ' }, 3, 10),
      {
        path: '/guests',
        query: { page: 2, size: 10, sort: ['createdAt,desc'], keyword: 'Minh Anh' },
      },
    )
  })

  it('sends only populated advanced criteria as flat query fields', () => {
    const request = buildGuestListRequest({
      ...emptySearch,
      mode: 'advanced',
      criteria: {
        ...createEmptyGuestCriteria(),
        firstName: '  Minh ',
        phoneNumber: '0901',
        vipLevel: 'GOLD',
      },
    }, 2, 10)

    assert.deepEqual(request, {
      path: '/guests/search',
      query: {
        firstName: 'Minh',
        phoneNumber: '0901',
        vipLevel: 'GOLD',
        page: 1,
        size: 10,
        sort: ['createdAt,desc'],
      },
    })
  })

  it('falls back to the collection when advanced criteria are empty', () => {
    assert.equal(
      buildGuestListRequest({ ...emptySearch, mode: 'advanced' }, 1, 10).path,
      '/guests',
    )
  })
})
