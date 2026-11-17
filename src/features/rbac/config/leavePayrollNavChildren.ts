/**
 * RBAC sidebar children for Leave / Payroll (same labels + routes as demo tab nav).
 */

import { leaveNavChildrenForRole } from '@/features/leave/utils/leaveNavChildren'
import type { UserRole } from '@/features/leave/constants/userRoles'
import { payrollNavChildrenForRole } from '@/features/payroll/utils/payrollNavChildren'

import type { BackendRoleCode, RoleNavChild } from '../types/roles'

function toRoleNavChildren(items: { title: string; path: string }[]): RoleNavChild[] {
  return items.map(({ title, path }) => ({ title, path }))
}

export function leaveNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return toRoleNavChildren(leaveNavChildrenForRole(role, `${routePrefix}/leave`))
}

export function payrollNavChildrenForRbac(
  roleCode: BackendRoleCode,
  routePrefix: string,
): RoleNavChild[] {
  const role = roleCode as UserRole
  return toRoleNavChildren(payrollNavChildrenForRole(role, `${routePrefix}/payroll`))
}

export function employeeLeaveNavChildren(): RoleNavChild[] {
  return toRoleNavChildren(leaveNavChildrenForRole('EMPLOYEE', '/employee/leave'))
}

export function employeePayrollNavChildren(): RoleNavChild[] {
  return toRoleNavChildren(payrollNavChildrenForRole('EMPLOYEE', '/employee/payslips'))
}
