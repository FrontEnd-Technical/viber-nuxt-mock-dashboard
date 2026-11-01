export const useLoadingStore = defineStore('loading', () => {
  const activeRequests = ref(0)
  const isNavigating = ref(false)

  const isLoading = computed(() => activeRequests.value > 0 || isNavigating.value)

  function beginRequest(): () => void {
    activeRequests.value += 1
    let completed = false

    return () => {
      if (completed) {
        return
      }

      completed = true
      activeRequests.value = Math.max(0, activeRequests.value - 1)
    }
  }

  function beginNavigation() {
    isNavigating.value = true
  }

  function endNavigation() {
    isNavigating.value = false
  }

  return {
    activeRequests,
    isNavigating,
    isLoading,
    beginRequest,
    beginNavigation,
    endNavigation,
  }
})
