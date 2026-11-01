export const PAGE_SIZE_OPTIONS = [10, 30, 50] as const

export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export function isPageSize(value: unknown): value is PageSize {
  return PAGE_SIZE_OPTIONS.some(option => option === value)
}
