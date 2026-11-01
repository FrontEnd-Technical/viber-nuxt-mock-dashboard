import {
  clearAuthTokens,
  readAuthTokens,
  writeAuthTokens,
  type AuthTokens,
} from '~/utils/auth-token-storage'
import type { AuthUserProfile } from '#shared/types/auth'

export type AuthMode = 'admin' | 'guest'

const AUTH_MODE_SESSION_KEY = 'hotel-admin.auth-mode'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const mode = ref<AuthMode>('admin')
  const profile = ref<AuthUserProfile | null>(null)
  const sessionNotice = ref<string | null>(null)
  const hydrated = ref(false)

  function hydrate() {
    if (!import.meta.client || hydrated.value) {
      return
    }

    const tokens = readAuthTokens(localStorage)
    const storedMode = sessionStorage.getItem(AUTH_MODE_SESSION_KEY)
    mode.value = storedMode === 'guest' ? 'guest' : 'admin'
    accessToken.value = mode.value === 'guest' ? null : tokens.accessToken
    refreshToken.value = mode.value === 'guest' ? null : tokens.refreshToken

    if (mode.value === 'guest') {
      clearAuthTokens(localStorage)
    }

    hydrated.value = true
  }

  function setMode(nextMode: AuthMode) {
    if (!import.meta.client) {
      throw new Error('Chế độ xác thực có thể được thiết lập chỉ ở phía trình duyệt.')
    }

    mode.value = nextMode
    sessionStorage.setItem(AUTH_MODE_SESSION_KEY, nextMode)
    hydrated.value = true

    if (nextMode === 'guest') {
      clearTokens()
    }
  }

  function setTokens(tokens: AuthTokens) {
    if (!import.meta.client) {
      throw new Error('JWT có thể được lưu trữ chỉ ở phía trình duyệt.')
    }

    writeAuthTokens(localStorage, tokens)
    sessionStorage.setItem(AUTH_MODE_SESSION_KEY, 'admin')
    mode.value = 'admin'
    accessToken.value = tokens.accessToken
    refreshToken.value = tokens.refreshToken
    profile.value = null
    hydrated.value = true
  }

  function setProfile(user: AuthUserProfile) {
    profile.value = user
  }

  function setSessionNotice(message: string | null) {
    sessionNotice.value = message
  }

  function clearTokens() {
    if (import.meta.client) {
      clearAuthTokens(localStorage)
    }

    accessToken.value = null
    refreshToken.value = null
    profile.value = null
    hydrated.value = true
  }

  return {
    accessToken,
    refreshToken,
    mode,
    profile,
    sessionNotice,
    hydrate,
    setMode,
    setTokens,
    setProfile,
    setSessionNotice,
    clearTokens,
  }
})
