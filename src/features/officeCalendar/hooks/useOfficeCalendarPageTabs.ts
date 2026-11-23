import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'

export const ADMIN_CALENDAR_TABS = ['Overview', 'Calendar', 'Holiday Management'] as const
export const HR_CALENDAR_TABS = ['Overview', 'Calendar', 'Holidays'] as const
export const EMPLOYEE_CALENDAR_TABS = ['Calendar', 'Holidays'] as const

export type AdminCalendarTabId = (typeof ADMIN_CALENDAR_TABS)[number]
export type HrCalendarTabId = (typeof HR_CALENDAR_TABS)[number]
export type EmployeeCalendarTabId = (typeof EMPLOYEE_CALENDAR_TABS)[number]

export type OfficeCalendarPageTabId = AdminCalendarTabId | HrCalendarTabId | EmployeeCalendarTabId

export function calendarTabsForRole(role: UserRole): readonly OfficeCalendarPageTabId[] {
  if (isHrAdminExperience(role) || isSuperAdminExperience(role)) {
    return ADMIN_CALENDAR_TABS
  }
  if (isManagerExperience(role)) {
    return HR_CALENDAR_TABS
  }
  if (isEmployeeExperience(role)) {
    return EMPLOYEE_CALENDAR_TABS
  }
  return []
}

export function defaultCalendarTabForRole(role: UserRole): OfficeCalendarPageTabId {
  const tabs = calendarTabsForRole(role)
  return tabs[0] ?? 'Calendar'
}