/**
 * Sidebar sections for Leads Management by role.
 */

import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'

export const ADMIN_LEADS_TABS = [
  'Overview',
  'All Leads',
  'Pipeline',
  'Duplicates',
] as const

export const HR_LEADS_TABS = ['Overview', 'My Leads', 'Team Leads', 'Pipeline'] as const

export const EMPLOYEE_LEADS_TABS = ['My Leads'] as const

export type AdminLeadsTabId = (typeof ADMIN_LEADS_TABS)[number]
export type HrLeadsTabId = (typeof HR_LEADS_TABS)[number]
export type EmployeeLeadsTabId = (typeof EMPLOYEE_LEADS_TABS)[number]

export type LeadsPageTabId = AdminLeadsTabId | HrLeadsTabId | EmployeeLeadsTabId

export function leadsTabsForRole(role: UserRole): readonly LeadsPageTabId[] {
  if (isHrAdminExperience(role) || isSuperAdminExperience(role)) {
    return ADMIN_LEADS_TABS
  }
  if (isManagerExperience(role)) {
    return HR_LEADS_TABS
  }
  if (isEmployeeExperience(role)) {
    return EMPLOYEE_LEADS_TABS
  }
  return []
}

export function defaultLeadsTabForRole(role: UserRole): LeadsPageTabId {
  const tabs = leadsTabsForRole(role)
  return tabs[0] ?? 'Overview'
}