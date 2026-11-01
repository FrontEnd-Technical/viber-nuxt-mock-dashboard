import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { normalizeAuthUser } from '../app/utils/auth-user.ts'

describe('auth user profile', () => {
  it('normalizes the safe profile fields and omits the password', () => {
    const profile = normalizeAuthUser({
      id: 12,
      username: 'admin',
      fullName: 'Hotel Admin',
      email: 'admin@example.com',
      password: '$2a$hashed-value',
      status: 'ACTIVE',
      authorities: [{ authority: 'ROLE_ADMIN' }, { authority: 'ROLE_MANAGER' }],
      enabled: true,
    })

    assert.deepEqual(profile, {
      id: 12,
      username: 'admin',
      fullName: 'Hotel Admin',
      email: 'admin@example.com',
      status: 'ACTIVE',
      authorities: ['ROLE_ADMIN', 'ROLE_MANAGER'],
      enabled: true,
    })
    assert.equal('password' in profile, false)
  })

  it('rejects malformed user data', () => {
    assert.throws(
      () => normalizeAuthUser({ username: 'admin' }),
      /không hợp lệ/,
    )
  })
})
