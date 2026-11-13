/**
 * Maps demo role to calendar leave scope on LeavePage.
 */

import type { UserRole } from '../constants/userRoles'
import { isEmployeeExperience, isManagerExperience } from '../constants/userRoles'
import type { CalendarLeaveScope } from './buildCalendarLeaveByDay'

export function resolveCalendarScope(role: UserRole): CalendarLeaveScope {
  if (isEmployeeExperience(role)) return 'self'
  if (isManagerExperience(role)) return 'team'
  return 'org'
}
