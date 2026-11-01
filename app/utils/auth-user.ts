import type { AuthUserProfile } from '#shared/types/auth'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeAuthUser(value: unknown): AuthUserProfile {
  if (
    !isRecord(value)
    || typeof value.id !== 'number'
    || typeof value.username !== 'string'
  ) {
    throw new TypeError('Thông tin người dùng API trả về không hợp lệ.')
  }

  const authorities = Array.isArray(value.authorities)
    ? value.authorities.flatMap((authority) => {
        if (typeof authority === 'string') {
          return [authority]
        }

        return isRecord(authority) && typeof authority.authority === 'string'
          ? [authority.authority]
          : []
      })
    : undefined

  return {
    id: value.id,
    username: value.username,
    ...(typeof value.email === 'string' && { email: value.email }),
    ...(typeof value.fullName === 'string' && { fullName: value.fullName }),
    ...(value.status === 'ACTIVE' || value.status === 'INACTIVE' || value.status === 'LOCKED'
      ? { status: value.status }
      : {}),
    ...(authorities && { authorities }),
    ...(typeof value.enabled === 'boolean' && { enabled: value.enabled }),
    ...(typeof value.accountNonExpired === 'boolean'
      && { accountNonExpired: value.accountNonExpired }),
    ...(typeof value.accountNonLocked === 'boolean'
      && { accountNonLocked: value.accountNonLocked }),
    ...(typeof value.credentialsNonExpired === 'boolean'
      && { credentialsNonExpired: value.credentialsNonExpired }),
  }
}
