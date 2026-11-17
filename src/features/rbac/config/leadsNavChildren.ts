/**
 * RBAC sidebar children for Leads Management.
 */

import type { UserRole } from '@/features/leave/constants/userRoles'
import { leadsNavChildrenForRole } from '@/features/leads/utils/leadsSectionRoutes'

import type { BackendRoleCode, RoleNavChild } from '../types/roles'

export function leadsNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return leadsNavChildrenForRole(role, `${routePrefix}/leads`)
}

export function employeeLeadsNavChildren(): RoleNavChild[] {
  return leadsNavChildrenForRole('EMPLOYEE', '/employee/leads')
}