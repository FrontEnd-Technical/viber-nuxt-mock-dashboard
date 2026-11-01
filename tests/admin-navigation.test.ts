import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  ADMIN_NAVIGATION,
  ADMIN_NAVIGATION_GROUPS,
  filterAdminNavigation,
  getAdminNavigationItem,
  getBreadcrumbItems,
  getPageTitle,
  isAdminNavigationItemActive,
} from '../app/utils/admin-navigation.ts'

describe('admin navigation', () => {
  it('uses the supplied route title and trims whitespace', () => {
    assert.equal(getPageTitle('/rooms', '  Phòng  '), 'Phòng')
  })

  it('uses the navigation label when route metadata is unavailable', () => {
    assert.equal(getPageTitle('/reservations'), 'Đặt phòng')
  })

  it('formats an unknown path segment as a readable title', () => {
    assert.equal(getPageTitle('/room-types'), 'Room types')
  })

  it('shows dashboard context and the current page in breadcrumbs', () => {
    assert.deepEqual(getBreadcrumbItems('/reports', 'Báo cáo'), [
      { title: 'Quản lý khách sạn', to: '/' },
      { title: 'Báo cáo' },
    ])
  })

  it('uses dashboard context on the dashboard route', () => {
    assert.deepEqual(getBreadcrumbItems('/', 'Tổng quan'), [
      { title: 'Dashboards', to: '/' },
      { title: 'Tổng quan' },
    ])
  })

  it('filters destinations case-insensitively', () => {
    assert.deepEqual(
      filterAdminNavigation(ADMIN_NAVIGATION, 'PHÒNG'),
      [ADMIN_NAVIGATION[1], ADMIN_NAVIGATION[2]],
    )
  })

  it('returns all destinations for an empty query', () => {
    assert.deepEqual(
      filterAdminNavigation(ADMIN_NAVIGATION, '   '),
      ADMIN_NAVIGATION,
    )
  })

  it('matches nested paths to the most specific known destination', () => {
    assert.equal(getAdminNavigationItem('/reservations/booking-123'), ADMIN_NAVIGATION[1])
    assert.equal(
      isAdminNavigationItemActive('/reservations/booking-123', ADMIN_NAVIGATION[1]),
      true,
    )
    assert.equal(getAdminNavigationItem('/unknown'), undefined)
  })

  it('registers the UI library page in the system group and search', () => {
    const uiLibrary = ADMIN_NAVIGATION.find(item => item.to === '/ui-library')

    assert.deepEqual(uiLibrary, {
      title: 'Thư viện giao diện',
      to: '/ui-library',
      icon: 'mdi-palette-outline',
      group: 'system',
    })
    assert.ok(ADMIN_NAVIGATION_GROUPS.some(group => group.id === 'system'))
    assert.deepEqual(filterAdminNavigation(ADMIN_NAVIGATION, 'ui-library'), [uiLibrary])
    assert.equal(getPageTitle('/ui-library'), 'Thư viện giao diện')
  })
})
