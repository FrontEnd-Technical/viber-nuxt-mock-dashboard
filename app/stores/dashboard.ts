import type { DashboardOverview } from '#shared/types/dashboard'

export const useDashboardStore = defineStore('dashboard', () => {
  const overview = ref<DashboardOverview | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const api = useApi()

  async function loadOverview() {
    pending.value = true
    error.value = null

    try {
      overview.value = await api<DashboardOverview>('/api/dashboard', {
        baseURL: '/',
      })
    }
    catch (cause) {
      error.value = cause instanceof Error
        ? cause.message
        : 'Không thể tải dữ liệu tổng quan.'
    }
    finally {
      pending.value = false
    }
  }

  return {
    overview,
    pending,
    error,
    loadOverview,
  }
})
