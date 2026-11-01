export interface DashboardMetric {
  title: string
  value: string
  change: string
  icon: string
  tone: 'lavender' | 'blue' | 'mint' | 'purple'
}

export interface DashboardBooking {
  code: string
  guest: string
  checkIn: string
  status: 'Đã xác nhận' | 'Chờ xác nhận'
  total: string
}

export interface DashboardOverview {
  metrics: DashboardMetric[]
  occupancyRate: number
  occupiedRooms: number
  totalRooms: number
  recentBookings: DashboardBooking[]
}
