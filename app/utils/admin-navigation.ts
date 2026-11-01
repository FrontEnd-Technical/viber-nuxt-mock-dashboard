export interface AdminNavigationItem {
  title: string
  to: string
  icon: string
  group: AdminNavigationGroupId
}

export interface AdminNavigationGroup {
  id: AdminNavigationGroupId
  title: string
}

export type AdminNavigationGroupId = 'overview' | 'hotel-management' | 'system'

export const ADMIN_NAVIGATION_GROUPS: AdminNavigationGroup[] = [
  { id: 'overview', title: 'Tổng quan' },
  { id: 'hotel-management', title: 'Quản lý khách sạn' },
  { id: 'system', title: 'Hệ thống' },
]

export const ADMIN_NAVIGATION: AdminNavigationItem[] = [
  { title: 'Tổng quan', to: '/', icon: 'mdi-view-dashboard-outline', group: 'overview' },
  { title: 'Đặt phòng', to: '/reservations', icon: 'mdi-calendar-check-outline', group: 'hotel-management' },
  { title: 'Phòng', to: '/rooms', icon: 'mdi-bed-outline', group: 'hotel-management' },
  { title: 'Khách hàng', to: '/guests', icon: 'mdi-account-group-outline', group: 'hotel-management' },
  { title: 'Báo cáo', to: '/reports', icon: 'mdi-chart-box-outline', group: 'hotel-management' },
  { title: 'Thư viện giao diện', to: '/ui-library', icon: 'mdi-palette-outline', group: 'system' },
]

export function getAdminNavigationItem(path: string): AdminNavigationItem | undefined {
  return ADMIN_NAVIGATION
    .filter(item =>
      path === item.to
      || (item.to !== '/' && path.startsWith(`${item.to}/`)),
    )
    .sort((first, second) => second.to.length - first.to.length)[0]
}

export function isAdminNavigationItemActive(
  path: string,
  item: AdminNavigationItem,
): boolean {
  return path === item.to
    || (item.to !== '/' && path.startsWith(`${item.to}/`))
}

export interface BreadcrumbItem {
  title: string
  to?: string
}

export function getPageTitle(path: string, routeTitle?: unknown): string {
  if (typeof routeTitle === 'string' && routeTitle.trim()) {
    return routeTitle.trim()
  }

  const knownPage = ADMIN_NAVIGATION.find(item => item.to === path)
  if (knownPage) {
    return knownPage.title
  }

  const segment = path.split('/').filter(Boolean).at(-1)
  if (!segment) {
    return 'Tổng quan'
  }

  const readableSegment = segment.replace(/[-_]+/g, ' ')
  return readableSegment.charAt(0).toUpperCase() + readableSegment.slice(1)
}

export function getBreadcrumbItems(path: string, pageTitle: string): BreadcrumbItem[] {
  const parentTitle = path === '/' ? 'Dashboards' : 'Quản lý khách sạn'

  return [
    { title: parentTitle, to: '/' },
    { title: pageTitle },
  ]
}

export function filterAdminNavigation(
  items: readonly AdminNavigationItem[],
  query: string,
): AdminNavigationItem[] {
  const normalizedQuery = query.trim().toLocaleLowerCase()

  if (!normalizedQuery) {
    return [...items]
  }

  return items.filter(item =>
    `${item.title} ${item.to}`.toLocaleLowerCase().includes(normalizedQuery),
  )
}
