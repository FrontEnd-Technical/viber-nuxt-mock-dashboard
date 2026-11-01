export type GuestGender = 'MALE' | 'FEMALE' | 'OTHER'
export type GuestVipLevel = 'REGULAR' | 'SILVER' | 'GOLD' | 'PLATINUM'

export interface Guest {
  id: number
  userId?: number | null
  firstName: string
  lastName: string
  fullName?: string | null
  idCardNumber: string
  phoneNumber: string
  email?: string | null
  address?: string | null
  nationality?: string | null
  dateOfBirth?: string | null
  gender?: GuestGender | null
  vipLevel?: GuestVipLevel | null
  notes?: string | null
  createdAt?: string | null
}

export interface GuestCreateRequest {
  userId?: number
  firstName: string
  lastName: string
  idCardNumber: string
  phoneNumber: string
  email?: string
  address?: string
  nationality?: string
  dateOfBirth?: string
  gender?: GuestGender
  vipLevel?: GuestVipLevel
  notes?: string
}

export interface GuestUpdateRequest {
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
  address?: string
  nationality?: string
  dateOfBirth?: string
  gender?: GuestGender
  vipLevel?: GuestVipLevel
  notes?: string
}

export interface GuestSearchCriteria {
  firstName: string
  lastName: string
  idCardNumber: string
  phoneNumber: string
  email: string
  nationality: string
  gender: GuestGender | ''
  vipLevel: GuestVipLevel | ''
}

export interface GuestSearchState {
  mode: 'keyword' | 'advanced'
  keyword: string
  criteria: GuestSearchCriteria
}

export interface GuestListRequest {
  path: '/guests' | '/guests/search'
  query: Record<string, string | number | string[]>
}
