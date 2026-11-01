export interface FieldErrorDetail {
  field?: string
  rejectedValue?: unknown
  message: string
}

export interface ApiPageMeta {
  pageNumber?: number
  pageSize?: number
  totalElements?: number
  totalPages?: number
  hasNext?: boolean
  hasPrevious?: boolean
  first?: boolean
  last?: boolean
}

export interface ApiSuccessResponse<T> {
  success: true
  code: number
  message: string
  data?: T
  errorCode?: string
  meta?: ApiPageMeta | null
  errors?: FieldErrorDetail[] | null
  timestamp?: string
  correlationId?: string
}

export interface ApiErrorResponse {
  success?: false
  code: number
  message: string
  errorCode?: string
  data?: unknown
  meta?: ApiPageMeta | null
  errors?: FieldErrorDetail[] | null
  timestamp?: string
  correlationId?: string
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse
