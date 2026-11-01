import type { AuthMode } from '~/stores/auth'

export type AuthRouteDestination = 'allow' | 'dashboard' | 'login' | 'guest-access'

export function getAuthRouteDestination(
  path: string,
  mode: AuthMode,
  hasAccessToken: boolean,
): AuthRouteDestination {
  if (path === '/login') {
    return mode === 'guest' || hasAccessToken ? 'dashboard' : 'allow'
  }

  if (path === '/guest-access') {
    return mode === 'guest' ? 'allow' : 'dashboard'
  }

  if (path === '/') {
    return mode === 'guest' || hasAccessToken ? 'allow' : 'login'
  }

  if (mode === 'guest') {
    return 'guest-access'
  }

  return hasAccessToken ? 'allow' : 'login'
}
