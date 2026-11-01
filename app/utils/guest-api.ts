import type {
  GuestListRequest,
  GuestSearchCriteria,
  GuestSearchState,
} from '#shared/types/guest'

export function createEmptyGuestCriteria(): GuestSearchCriteria {
  return {
    firstName: '',
    lastName: '',
    idCardNumber: '',
    phoneNumber: '',
    email: '',
    nationality: '',
    gender: '',
    vipLevel: '',
  }
}

export function buildGuestListRequest(
  search: GuestSearchState,
  page: number,
  pageSize: number,
): GuestListRequest {
  const query: GuestListRequest['query'] = {
    page: Math.max(0, page - 1),
    size: pageSize,
    sort: ['createdAt,desc'],
  }

  if (search.mode === 'keyword') {
    const keyword = search.keyword.trim()
    if (keyword) {
      query.keyword = keyword
    }

    return { path: '/guests', query }
  }

  const criteria = Object.fromEntries(
    Object.entries(search.criteria)
      .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      .filter(([, value]) => typeof value === 'string' && value !== ''),
  ) as Record<string, string>
  const hasCriteria = Object.keys(criteria).length > 0

  if (!hasCriteria) {
    return { path: '/guests', query }
  }

  return {
    path: '/guests/search',
    query: { ...criteria, ...query },
  }
}
