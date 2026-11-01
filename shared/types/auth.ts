export interface AuthUserProfile {
  id: number
  username: string
  email?: string
  fullName?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  authorities?: string[]
  enabled?: boolean
  accountNonExpired?: boolean
  accountNonLocked?: boolean
  credentialsNonExpired?: boolean
}
