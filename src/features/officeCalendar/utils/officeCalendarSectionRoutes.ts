import type { UserRole } from '@/features/leave/constants/userRoles'

import {
  calendarTabsForRole,
  defaultCalendarTabForRole,
  type OfficeCalendarPageTabId,
} from '../hooks/useOfficeCalendarPageTabs'
import { calendarBaseFromPathname } from './calendarModuleBasePath'

export function calendarPathForTab(tab: OfficeCalendarPageTabId, base = '/hradmin/calendar'): string {
  if (tab === 'Overview') return base
  if (tab === 'Calendar') return `${base}/schedule`
  return `${base}/holidays`
}

export function calendarTabFromSection(
  section: string | undefined,
  pathname: string,
  role: UserRole,
): OfficeCalendarPageTabId {
  const allowed = calendarTabsForRole(role)
  const defaultTab = defaultCalendarTabForRole(role)
  const base = calendarBaseFromPathname(pathname)

  if (pathname === base || pathname === `${base}/`) {
    return defaultTab
  }

  if (pathname.endsWith('/holidays')) {
    const tab = allowed.find((item) => item === 'Holiday Management' || item === 'Holidays')
    return tab ?? defaultTab
  }

  if (section === 'schedule' && allowed.includes('Calendar')) {
    return 'Calendar'
  }

  return defaultTab
}

export function calendarNavChildrenForRole(role: UserRole, base = '/hradmin/calendar') {
  return calendarTabsForRole(role).map((tab) => ({
    title: tab,
    path: calendarPathForTab(tab, base),
  }))
}