import type {
  ApiErrorResponse,
  ApiSuccessResponse,
  FieldErrorDetail,
} from '#shared/types/api'

export class ApiError extends Error {
  readonly statusCode: number
  readonly errorCode?: string
  readonly errors?: FieldErrorDetail[]
  readonly correlationId?: string

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    cause?: unknown,
    errors?: FieldErrorDetail[],
    correlationId?: string,
  ) {
    super(message, { cause })
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = errorCode
    this.errors = errors
    this.correlationId = correlationId
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasValidFieldErrors(value: Record<string, unknown>): boolean {
  const errors = value.errors
  return errors === undefined
    || errors === null
    || (Array.isArray(errors) && errors.every(error =>
      isRecord(error) && typeof error.message === 'string',
    ))
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return isRecord(value)
    && Number.isInteger(value.code)
    && typeof value.code === 'number'
    && value.code >= 100
    && value.code <= 599
    && typeof value.message === 'string'
    && (!('errorCode' in value) || typeof value.errorCode === 'string')
    && (value.success === false || value.code >= 400)
}

export function readApiSuccessResponse<T>(value: unknown): ApiSuccessResponse<T> {
  if (
    !isRecord(value)
    || !Number.isInteger(value.code)
    || typeof value.code !== 'number'
    || value.code < 100
    || value.code > 599
    || typeof value.message !== 'string'
    || ('errorCode' in value && typeof value.errorCode !== 'string')
    || ('success' in value && typeof value.success !== 'boolean')
    || !hasValidFieldErrors(value)
  ) {
    throw new ApiError(
      'Phản hồi API không đúng định dạng.',
      502,
      'INVALID_API_RESPONSE',
      value,
    )
  }

  if (value.success !== true || value.code < 200 || value.code >= 300) {
    throw new ApiError(
      value.message,
      value.code,
      typeof value.errorCode === 'string' ? value.errorCode : undefined,
      value,
      Array.isArray(value.errors) ? value.errors as FieldErrorDetail[] : undefined,
      typeof value.correlationId === 'string' ? value.correlationId : undefined,
    )
  }

  return value as unknown as ApiSuccessResponse<T>
}

export function unwrapApiResponse<T>(value: unknown): T {
  return readApiSuccessResponse<T>(value).data as T
}

export function toApiError(cause: unknown): ApiError {
  if (cause instanceof ApiError) {
    return cause
  }

  const errorRecord = isRecord(cause) ? cause : undefined
  const response = errorRecord && isRecord(errorRecord.response)
    ? errorRecord.response
    : undefined
  const body = response?._data ?? errorRecord?.data

  if (isApiErrorResponse(body)) {
    const responseStatus = response?.status
    const statusCode = typeof responseStatus === 'number'
      ? responseStatus
      : body.code
    return new ApiError(
      body.message,
      statusCode,
      body.errorCode,
      cause,
      body.errors ?? undefined,
      body.correlationId,
    )
  }

  const responseStatus = response?.status
  const errorStatus = errorRecord?.statusCode ?? errorRecord?.status
  const bodyCode = isRecord(body) && typeof body.code === 'number'
    ? body.code
    : undefined
  const statusCode = typeof responseStatus === 'number'
    ? responseStatus
    : typeof errorStatus === 'number'
      ? errorStatus
      : bodyCode ?? 0
  const message = cause instanceof Error
    ? cause.message
    : errorRecord && typeof errorRecord.message === 'string'
      ? errorRecord.message
      : 'Không thể kết nối đến máy chủ.'

  return new ApiError(
    message,
    statusCode,
    typeof body === 'object' && body !== null && 'errorCode' in body
      && typeof body.errorCode === 'string'
      ? body.errorCode
      : statusCode === 0
        ? 'NETWORK_ERROR'
        : undefined,
    cause,
  )
}
