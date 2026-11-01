import type { AdminNavigationItem } from './admin-navigation'

export const NAVIGATION_PREFERENCES_KEY = 'hotel-admin:navigation'

export interface NavigationPreferences {
  favorites: string[]
  recentRoutes: string[]
}

export interface PreferenceStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export const DEFAULT_NAVIGATION_PREFERENCES: NavigationPreferences = {
  favorites: ['/'],
  recentRoutes: [],
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

function knownUniquePaths(paths: string[], validPaths: readonly string[]): string[] {
  const knownPaths = new Set(validPaths)
  return [...new Set(paths.filter(path => knownPaths.has(path)))]
}

export function readNavigationPreferences(
  storage: PreferenceStorage,
  validPaths: readonly string[],
): NavigationPreferences {
  const savedValue = storage.getItem(NAVIGATION_PREFERENCES_KEY)
  if (!savedValue) {
    return {
      favorites: [...DEFAULT_NAVIGATION_PREFERENCES.favorites],
      recentRoutes: [],
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(savedValue)
  }
  catch (cause) {
    if (cause instanceof SyntaxError) {
      return {
        favorites: [...DEFAULT_NAVIGATION_PREFERENCES.favorites],
        recentRoutes: [],
      }
    }
    throw cause
  }

  if (
    typeof parsed !== 'object'
    || parsed === null
    || !('favorites' in parsed)
    || !('recentRoutes' in parsed)
    || !isStringArray(parsed.favorites)
    || !isStringArray(parsed.recentRoutes)
  ) {
    return {
      favorites: [...DEFAULT_NAVIGATION_PREFERENCES.favorites],
      recentRoutes: [],
    }
  }

  return {
    favorites: knownUniquePaths(parsed.favorites, validPaths),
    recentRoutes: knownUniquePaths(parsed.recentRoutes, validPaths),
  }
}

export function writeNavigationPreferences(
  storage: PreferenceStorage,
  preferences: NavigationPreferences,
): void {
  storage.setItem(NAVIGATION_PREFERENCES_KEY, JSON.stringify(preferences))
}

export function toggleFavoritePath(
  preferences: NavigationPreferences,
  path: string,
  validPaths: readonly string[],
): NavigationPreferences {
  if (!validPaths.includes(path)) {
    return preferences
  }

  const isFavorite = preferences.favorites.includes(path)
  return {
    ...preferences,
    favorites: isFavorite
      ? preferences.favorites.filter(favorite => favorite !== path)
      : [...preferences.favorites, path],
  }
}

export function recordRecentPath(
  preferences: NavigationPreferences,
  path: string,
  validPaths: readonly string[],
): NavigationPreferences {
  if (!validPaths.includes(path)) {
    return preferences
  }

  return {
    ...preferences,
    recentRoutes: [
      path,
      ...preferences.recentRoutes.filter(recentPath => recentPath !== path),
    ],
  }
}

export function getValidNavigationPaths(
  navigation: readonly AdminNavigationItem[],
): string[] {
  return navigation.map(item => item.to)
}
