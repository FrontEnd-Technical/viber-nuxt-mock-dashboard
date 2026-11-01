export interface AuthTokens {
  accessToken: string | null
  refreshToken: string | null
}

export interface AuthTokenStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const ACCESS_TOKEN_STORAGE_KEY = 'hotel-admin.access-token'
export const REFRESH_TOKEN_STORAGE_KEY = 'hotel-admin.refresh-token'

export function readAuthTokens(storage: AuthTokenStorage): AuthTokens {
  return {
    accessToken: storage.getItem(ACCESS_TOKEN_STORAGE_KEY),
    refreshToken: storage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  }
}

export function writeAuthTokens(storage: AuthTokenStorage, tokens: AuthTokens): void {
  if (tokens.accessToken) {
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken)
  }
  else {
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  }

  if (tokens.refreshToken) {
    storage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
  }
  else {
    storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  }
}

export function clearAuthTokens(storage: AuthTokenStorage): void {
  storage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  storage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}
