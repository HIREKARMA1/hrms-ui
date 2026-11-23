import type { UserRole } from '@/features/leave/constants/userRoles'
import { isEmployeeExperience } from '@/features/leave/constants/userRoles'

import type { OfficeCalendarEvent } from '../types/officeCalendar'

export function visibleEventsForRole(
  events: OfficeCalendarEvent[],
  role: UserRole,
): OfficeCalendarEvent[] {
  if (!isEmployeeExperience(role)) {
    return events
  }
  return events.filter((item) => item.visibility === 'public')
}