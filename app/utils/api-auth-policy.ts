import type { AuthMode } from '~/stores/auth'

const PUBLIC_AUTH_ENDPOINTS = new Set([
  '/auth/login',
  '/auth/register',
  '/auth/refresh-token',
])

export function normalizeApiPath(path: string): string {
  const withoutBasePath = path.replace(/^\/api\/v\d+(?=\/|$)/, '')
  const normalized = withoutBasePath.replace(/\/+$/, '')
  return normalized || '/'
}

export function isPublicAuthEndpoint(path: string): boolean {
  return PUBLIC_AUTH_ENDPOINTS.has(normalizeApiPath(path))
}

export function isApiRequestAllowed(
  mode: AuthMode,
  path: string,
  baseURL?: string,
): boolean {
  if (mode !== 'guest' || isPublicAuthEndpoint(path)) {
    return true
  }

  return normalizeApiPath(path) === '/api/dashboard' && baseURL === '/'
}
