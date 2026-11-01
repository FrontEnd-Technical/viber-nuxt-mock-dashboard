import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack/types'
import type { ApiResponse, ApiSuccessResponse } from '#shared/types/api'
import {
  isApiRequestAllowed,
  isPublicAuthEndpoint,
  normalizeApiPath,
} from '~/utils/api-auth-policy'
import {
  ApiError,
  readApiSuccessResponse,
  toApiError,
  unwrapApiResponse,
} from '~/utils/api-response'

interface ApiClient {
  <T, R extends NitroFetchRequest = NitroFetchRequest>(
    request: R,
    options?: NitroFetchOptions<R>,
  ): Promise<T>
  withMeta<T, R extends NitroFetchRequest = NitroFetchRequest>(
    request: R,
    options?: NitroFetchOptions<R>,
  ): Promise<ApiSuccessResponse<T>>
}

interface RefreshedTokens {
  accessToken: string
  refreshToken: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requestPath(request: NitroFetchRequest): string {
  const requestUrl = request instanceof Request ? request.url : String(request)

  return new URL(requestUrl, 'http://nuxt.local').pathname
}

function isRefreshRequest(request: NitroFetchRequest, endpoint: string): boolean {
  return normalizeApiPath(requestPath(request)) === normalizeApiPath(endpoint)
}

function readRefreshedTokens(value: unknown): RefreshedTokens {
  if (
    !isRecord(value)
    || typeof value.accessToken !== 'string'
    || typeof value.refreshToken !== 'string'
  ) {
    throw new ApiError(
      'Phản hồi làm mới JWT không đúng định dạng.',
      502,
      'INVALID_REFRESH_RESPONSE',
      value,
    )
  }

  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const loadingStore = useLoadingStore()
  const refreshEndpoint = config.public.apiRefreshEndpoint
  const baseURL = config.public.apiBase
  let refreshInFlight: Promise<void> | undefined

  const http = $fetch.create({
    baseURL,
    retry: false,
    onRequest({ request, options }) {
      authStore.hydrate()
      const headers = new Headers(options.headers)

      if (isPublicAuthEndpoint(requestPath(request)) || !authStore.accessToken) {
        headers.delete('Authorization')
      }
      else {
        headers.set('Authorization', `Bearer ${authStore.accessToken}`)
      }

      options.headers = headers
    },
  })

  async function performRefresh(): Promise<void> {
    authStore.hydrate()

    if (!authStore.refreshToken) {
      throw new ApiError(
        'Không tìm thấy refresh token. Vui lòng đăng nhập lại.',
        401,
        'REFRESH_TOKEN_MISSING',
      )
    }

    const response = await $fetch<ApiResponse<RefreshedTokens>>(refreshEndpoint, {
      baseURL,
      method: 'POST',
      body: { refreshToken: authStore.refreshToken },
      retry: false,
    })
    const tokens = readRefreshedTokens(unwrapApiResponse<unknown>(response))
    authStore.setTokens(tokens)
  }

  function refreshOnce(): Promise<void> {
    if (!refreshInFlight) {
      refreshInFlight = performRefresh().finally(() => {
        refreshInFlight = undefined
      })
    }

    return refreshInFlight
  }

  async function sendEnvelope<T, R extends NitroFetchRequest = NitroFetchRequest>(
    request: R,
    options: NitroFetchOptions<R>,
    hasRetried = false,
  ): Promise<ApiSuccessResponse<T>> {
    authStore.hydrate()
    const accessTokenUsed = authStore.accessToken
    const requestPathname = requestPath(request)
    if (!isApiRequestAllowed(authStore.mode, requestPathname, options.baseURL)) {
      throw new ApiError(
        'Chế độ Guest không thể gọi API yêu cầu đăng nhập Admin.',
        403,
        'GUEST_MODE_REQUIRES_AUTH',
      )
    }

    try {
      const requestForAttempt = request instanceof Request
        ? request.clone()
        : request
      const response = await http<ApiSuccessResponse<T>>(requestForAttempt, options)
      return readApiSuccessResponse<T>(response)
    }
    catch (cause) {
      const error = toApiError(cause)

      if (error.statusCode !== 401) {
        throw error
      }

      const isPublicAuthRequest = isPublicAuthEndpoint(requestPathname)
      if (isPublicAuthRequest) {
        throw error
      }

      if (hasRetried || isRefreshRequest(request, refreshEndpoint) || !authStore.refreshToken) {
        authStore.clearTokens()
        throw error
      }

      if (authStore.accessToken && authStore.accessToken !== accessTokenUsed) {
        return sendEnvelope<T, R>(request, options, true)
      }

      try {
        await refreshOnce()
      }
      catch (refreshCause) {
        authStore.clearTokens()
        throw toApiError(refreshCause)
      }

      return sendEnvelope<T, R>(request, options, true)
    }
  }

  const api: ApiClient = Object.assign(
    <T, R extends NitroFetchRequest = NitroFetchRequest>(
      request: R,
      options?: NitroFetchOptions<R>,
    ) => {
      const finishLoading = loadingStore.beginRequest()
      return sendEnvelope<T, R>(request, options ?? {})
        .then(response => response.data as T)
        .finally(finishLoading)
    },
    {
      withMeta: <T, R extends NitroFetchRequest = NitroFetchRequest>(
        request: R,
        options?: NitroFetchOptions<R>,
      ) => {
        const finishLoading = loadingStore.beginRequest()
        return sendEnvelope<T, R>(request, options ?? {}).finally(finishLoading)
      },
    },
  )

  return {
    provide: {
      api,
    },
  }
})

declare module '#app' {
  interface NuxtApp {
    $api: ApiClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiClient
  }
}
