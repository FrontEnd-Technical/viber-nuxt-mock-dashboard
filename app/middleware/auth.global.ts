import { getAuthRouteDestination } from '~/utils/auth-routing'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()
  authStore.hydrate()

  const destination = getAuthRouteDestination(
    to.path,
    authStore.mode,
    Boolean(authStore.accessToken),
  )

  if (destination === 'allow') {
    return
  }

  if (destination === 'dashboard') {
    return navigateTo('/')
  }

  if (destination === 'guest-access') {
    return navigateTo({
      path: '/guest-access',
      query: { from: to.fullPath },
    })
  }

  return navigateTo({
    path: '/login',
    query: to.path === '/' ? undefined : { redirect: to.fullPath },
  })
})
