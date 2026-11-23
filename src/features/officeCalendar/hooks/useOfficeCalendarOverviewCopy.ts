/**
 * Overview hero title and subtitle copy by role (unchanged strings).
 */

import {
  isHrAdminExperience,
  isManagerExperience,
  type UserRole,
} from '@/features/leave/constants/userRoles'

export function useOfficeCalendarOverviewCopy(role: UserRole) {
  const teamView = isManagerExperience(role)
  const adminView = isHrAdminExperience(role)

  const title = teamView
    ? 'Team schedule at a glance'
    : adminView
      ? 'Organization calendar at a glance'
      : 'Calendar at a glance'

  const subtitle = teamView
    ? 'Holidays and public events for your team.'
    : 'KPIs and shortcuts — open Calendar or holidays for day-to-day planning.'

  return { title, subtitle }
}