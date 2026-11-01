import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  isApiRequestAllowed,
  isPublicAuthEndpoint,
  normalizeApiPath,
} from '../app/utils/api-auth-policy.ts'

describe('API authentication policy', () => {
  it('normalizes backend context paths before matching endpoint policy', () => {
    assert.equal(normalizeApiPath('/api/v1/auth/login'), '/auth/login')
    assert.equal(normalizeApiPath('/auth/refresh-token/'), '/auth/refresh-token')
  })

  it('marks login, register, and refresh as public auth endpoints', () => {
    assert.equal(isPublicAuthEndpoint('/auth/login'), true)
    assert.equal(isPublicAuthEndpoint('/api/v1/auth/register'), true)
    assert.equal(isPublicAuthEndpoint('/api/v1/auth/refresh-token'), true)
  })

  it('keeps logout and protected API endpoints authenticated', () => {
    assert.equal(isPublicAuthEndpoint('/auth/logout'), false)
    assert.equal(isPublicAuthEndpoint('/api/v1/auth/me'), false)
    assert.equal(isPublicAuthEndpoint('/api/v1/bookings'), false)
  })

  it('allows guest dashboard mock only and rejects protected API calls', () => {
    assert.equal(isApiRequestAllowed('guest', '/api/dashboard', '/'), true)
    assert.equal(isApiRequestAllowed('guest', '/bookings'), false)
    assert.equal(isApiRequestAllowed('guest', '/auth/login'), true)
    assert.equal(isApiRequestAllowed('admin', '/bookings'), true)
  })
})
