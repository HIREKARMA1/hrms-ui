/**
 * RBAC sidebar children for Office Calendar.
 * The Holidays child carries `calendar.holidays` (backend `holidays:read`), the
 * same feature OfficeCalendarPage uses to guard the holidays tab by URL.
 */

import type { UserRole } from '@/features/leave/constants/userRoles'
import { calendarNavChildrenForRole } from '@/features/officeCalendar/utils/officeCalendarSectionRoutes'
import { isOfficeCalendarHolidayTab } from '@/features/officeCalendar/utils/officeCalendarTabFeatures'

import type { BackendRoleCode, RoleNavChild } from '../types/roles'

function withHolidayFeature(children: { title: string; path: string }[]): RoleNavChild[] {
  return children.map(({ title, path }) =>
    isOfficeCalendarHolidayTab(title)
      ? { title, path, feature: 'calendar.holidays' as const }
      : { title, path },
  )
}

export function calendarNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return withHolidayFeature(calendarNavChildrenForRole(role, `${routePrefix}/calendar`))
}

export function employeeCalendarNavChildren(): RoleNavChild[] {
  return withHolidayFeature(calendarNavChildrenForRole('EMPLOYEE', '/employee/calendar'))
}
