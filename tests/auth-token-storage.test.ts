import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  clearAuthTokens,
  readAuthTokens,
  writeAuthTokens,
  type AuthTokenStorage,
} from '../app/utils/auth-token-storage.ts'

function createStorage(): AuthTokenStorage {
  const values = new Map<string, string>()

  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  }
}

describe('auth token storage', () => {
  it('stores and reads access and refresh tokens', () => {
    const storage = createStorage()

    writeAuthTokens(storage, {
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
    })

    assert.deepEqual(readAuthTokens(storage), {
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
    })
  })

  it('returns null for tokens that have not been stored', () => {
    assert.deepEqual(readAuthTokens(createStorage()), {
      accessToken: null,
      refreshToken: null,
    })
  })

  it('removes both tokens when clearing authentication', () => {
    const storage = createStorage()
    writeAuthTokens(storage, {
      accessToken: 'access.jwt',
      refreshToken: 'refresh.jwt',
    })

    clearAuthTokens(storage)

    assert.deepEqual(readAuthTokens(storage), {
      accessToken: null,
      refreshToken: null,
    })
  })
})
