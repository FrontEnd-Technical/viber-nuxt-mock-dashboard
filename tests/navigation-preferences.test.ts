import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  DEFAULT_NAVIGATION_PREFERENCES,
  readNavigationPreferences,
  recordRecentPath,
  toggleFavoritePath,
  writeNavigationPreferences,
  type NavigationPreferences,
  type PreferenceStorage,
} from '../app/utils/navigation-preferences.ts'

function createStorage(initialValue: string | null = null) {
  const values = new Map<string, string>()
  if (initialValue !== null) {
    values.set('hotel-admin:navigation', initialValue)
  }

  const storage: PreferenceStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  }

  return { storage, values }
}

describe('navigation preferences', () => {
  const knownPaths = ['/', '/reservations', '/rooms']

  it('starts with the dashboard as the only favorite', () => {
    assert.deepEqual(DEFAULT_NAVIGATION_PREFERENCES, {
      favorites: ['/'],
      recentRoutes: [],
    })
  })

  it('toggles a known route favorite on and off', () => {
    const initial: NavigationPreferences = { favorites: ['/'], recentRoutes: [] }
    const added = toggleFavoritePath(initial, '/rooms', knownPaths)
    const removed = toggleFavoritePath(added, '/rooms', knownPaths)

    assert.deepEqual(added.favorites, ['/', '/rooms'])
    assert.deepEqual(removed.favorites, ['/'])
  })

  it('ignores unknown routes when toggling favorites', () => {
    const result = toggleFavoritePath(
      DEFAULT_NAVIGATION_PREFERENCES,
      '/unknown',
      knownPaths,
    )

    assert.deepEqual(result, DEFAULT_NAVIGATION_PREFERENCES)
  })

  it('persists and restores valid favorites and recent routes', () => {
    const { storage } = createStorage()
    const preferences = { favorites: ['/', '/rooms'], recentRoutes: ['/rooms'] }

    writeNavigationPreferences(storage, preferences)

    assert.deepEqual(readNavigationPreferences(storage, knownPaths), preferences)
  })

  it('removes unknown routes from persisted preferences', () => {
    const { storage } = createStorage(JSON.stringify({
      favorites: ['/rooms', '/deleted'],
      recentRoutes: ['/deleted', '/reservations'],
    }))

    assert.deepEqual(readNavigationPreferences(storage, knownPaths), {
      favorites: ['/rooms'],
      recentRoutes: ['/reservations'],
    })
  })

  it('returns defaults for malformed preference data', () => {
    const { storage } = createStorage('{bad json')

    assert.deepEqual(
      readNavigationPreferences(storage, knownPaths),
      DEFAULT_NAVIGATION_PREFERENCES,
    )
  })

  it('promotes a recently visited route and removes duplicates', () => {
    const current: NavigationPreferences = {
      favorites: ['/'],
      recentRoutes: ['/rooms', '/reservations'],
    }

    assert.deepEqual(recordRecentPath(current, '/rooms', knownPaths), {
      favorites: ['/'],
      recentRoutes: ['/rooms', '/reservations'],
    })
    assert.deepEqual(recordRecentPath(current, '/reservations', knownPaths), {
      favorites: ['/'],
      recentRoutes: ['/reservations', '/rooms'],
    })
  })

  it('does not add unknown routes to recent history', () => {
    assert.deepEqual(
      recordRecentPath(DEFAULT_NAVIGATION_PREFERENCES, '/unknown', knownPaths),
      DEFAULT_NAVIGATION_PREFERENCES,
    )
  })
})
