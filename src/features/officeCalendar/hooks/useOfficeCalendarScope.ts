import type { UserRole } from '@/features/leave/constants/userRoles'
import { isEmployeeExperience, isHrAdminExperience, isManagerExperience } from '@/features/leave/constants/userRoles'

export function useOfficeCalendarScope(role: UserRole) {
  const canManageHolidays = isHrAdminExperience(role)
  const canManageEvents = isHrAdminExperience(role)
  const canViewOverview = isHrAdminExperience(role) || isManagerExperience(role)
  const isReadOnlyHolidays = isEmployeeExperience(role) || isManagerExperience(role)

  return {
    canManageHolidays,
    canManageEvents,
    canViewOverview,
    isReadOnlyHolidays,
  }
}