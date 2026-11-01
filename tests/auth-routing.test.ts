import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getAuthRouteDestination } from '../app/utils/auth-routing.ts'

describe('auth route access', () => {
  it('requires admin mode to authenticate before opening the dashboard', () => {
    assert.equal(getAuthRouteDestination('/', 'admin', false), 'login')
    assert.equal(getAuthRouteDestination('/', 'admin', true), 'allow')
  })

  it('allows guest mode on the dashboard only', () => {
    assert.equal(getAuthRouteDestination('/', 'guest', false), 'allow')
    assert.equal(getAuthRouteDestination('/rooms', 'guest', false), 'guest-access')
    assert.equal(getAuthRouteDestination('/ui-library', 'guest', false), 'guest-access')
  })

  it('redirects unauthenticated admin routes to login', () => {
    assert.equal(getAuthRouteDestination('/guests', 'admin', false), 'login')
    assert.equal(getAuthRouteDestination('/guests', 'admin', true), 'allow')
  })

  it('keeps login and guest access pages consistent with the active mode', () => {
    assert.equal(getAuthRouteDestination('/login', 'admin', false), 'allow')
    assert.equal(getAuthRouteDestination('/login', 'guest', false), 'dashboard')
    assert.equal(getAuthRouteDestination('/guest-access', 'guest', false), 'allow')
    assert.equal(getAuthRouteDestination('/guest-access', 'admin', false), 'dashboard')
  })
})
