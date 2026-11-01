import type { DashboardOverview } from '#shared/types/dashboard'
import type { ApiSuccessResponse } from '#shared/types/api'

export default defineEventHandler((): ApiSuccessResponse<DashboardOverview> => ({
  success: true,
  code: 200,
  message: 'OK',
  data: {
    metrics: [
      {
        title: 'Doanh thu tháng',
        value: '₫428 tr',
        change: '+12,8%',
        icon: 'mdi-cash-multiple',
        tone: 'lavender',
      },
      {
        title: 'Công suất phòng',
        value: '78%',
        change: '+5,2%',
        icon: 'mdi-bed-outline',
        tone: 'blue',
      },
      {
        title: 'Check-in hôm nay',
        value: '24',
        change: '+3',
        icon: 'mdi-login',
        tone: 'mint',
      },
      {
        title: 'Đặt phòng sắp tới',
        value: '56',
        change: '+8,4%',
        icon: 'mdi-calendar-check-outline',
        tone: 'purple',
      },
    ],
    occupancyRate: 78,
    occupiedRooms: 94,
    totalRooms: 120,
    recentBookings: [
      {
        code: 'BK-2026-1048',
        guest: 'Nguyễn Minh Anh',
        checkIn: '31/10/2026',
        status: 'Đã xác nhận',
        total: '₫4.800.000',
      },
      {
        code: 'BK-2026-1047',
        guest: 'Trần Quốc Bảo',
        checkIn: '01/11/2026',
        status: 'Chờ xác nhận',
        total: '₫3.200.000',
      },
      {
        code: 'BK-2026-1046',
        guest: 'Lê Hoàng Yến',
        checkIn: '02/11/2026',
        status: 'Đã xác nhận',
        total: '₫6.500.000',
      },
    ],
  },
}))
