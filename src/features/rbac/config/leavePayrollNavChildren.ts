/**
 * RBAC sidebar children for Leave / Payroll (same labels + routes as demo tab nav).
 * Leave children carry the same feature key the Leave page uses to guard each
 * tab, so sidebar visibility and direct URL access follow one permission rule.
 */

import { leaveTabFeature } from '@/features/leave/constants/leaveTabFeatures'
import { leaveNavChildrenForRole } from '@/features/leave/utils/leaveNavChildren'
import type { LeavePageTabId } from '@/features/leave/hooks/useLeavePageTabs'
import type { UserRole } from '@/features/leave/constants/userRoles'
import { payrollNavChildrenForRole } from '@/features/payroll/utils/payrollNavChildren'

import type { BackendRoleCode, RoleNavChild } from '../types/roles'

function toRoleNavChildren(items: { title: string; path: string }[]): RoleNavChild[] {
  return items.map(({ title, path }) => ({ title, path }))
}

function toLeaveNavChildren(items: { title: string; path: string }[]): RoleNavChild[] {
  return items.map(({ title, path }) => {
    const feature = leaveTabFeature(title as LeavePageTabId)
    return feature ? { title, path, feature } : { title, path }
  })
}

export function leaveNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return toLeaveNavChildren(leaveNavChildrenForRole(role, `${routePrefix}/leave`))
}

export function payrollNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return toRoleNavChildren(payrollNavChildrenForRole(role, `${routePrefix}/payroll`))
}

export function employeeLeaveNavChildren(): RoleNavChild[] {
  return toLeaveNavChildren(leaveNavChildrenForRole('EMPLOYEE', '/employee/leave'))
}

export function employeePayrollNavChildren(): RoleNavChild[] {
  return toRoleNavChildren(payrollNavChildrenForRole('EMPLOYEE', '/employee/payslips'))
}
