import { ADMIN_NAVIGATION } from '~/utils/admin-navigation'
import {
  DEFAULT_NAVIGATION_PREFERENCES,
  NAVIGATION_PREFERENCES_KEY,
  getValidNavigationPaths,
  readNavigationPreferences,
  recordRecentPath,
  toggleFavoritePath,
  writeNavigationPreferences,
} from '~/utils/navigation-preferences'

export const useNavigationStore = defineStore('navigation', () => {
  const favorites = ref([...DEFAULT_NAVIGATION_PREFERENCES.favorites])
  const recentRoutes = ref([...DEFAULT_NAVIGATION_PREFERENCES.recentRoutes])
  const validPaths = getValidNavigationPaths(ADMIN_NAVIGATION)
  const hydrated = ref(false)

  function persist() {
    if (!import.meta.client) {
      return
    }

    writeNavigationPreferences(localStorage, {
      favorites: favorites.value,
      recentRoutes: recentRoutes.value,
    })
  }

  function hydrate() {
    if (!import.meta.client || hydrated.value) {
      return
    }

    const preferences = readNavigationPreferences(localStorage, validPaths)
    favorites.value = preferences.favorites
    recentRoutes.value = preferences.recentRoutes
    hydrated.value = true
  }

  function toggleFavorite(path: string) {
    const preferences = toggleFavoritePath(
      { favorites: favorites.value, recentRoutes: recentRoutes.value },
      path,
      validPaths,
    )
    favorites.value = preferences.favorites
    persist()
  }

  function recordRecent(path: string) {
    const preferences = recordRecentPath(
      { favorites: favorites.value, recentRoutes: recentRoutes.value },
      path,
      validPaths,
    )
    recentRoutes.value = preferences.recentRoutes
    persist()
  }

  return {
    favorites,
    recentRoutes,
    hydrate,
    toggleFavorite,
    recordRecent,
    storageKey: NAVIGATION_PREFERENCES_KEY,
  }
})
