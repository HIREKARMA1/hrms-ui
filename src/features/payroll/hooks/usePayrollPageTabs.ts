/**
 * Payroll section ids by demo role (sidebar + URL).
 */

import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  type UserRole,
} from '@/features/leave/constants/userRoles'

export const HR_PAYROLL_TABS = [
  'Overview',
  'Salary Structures',
  'Variable Pay',
  'Final Settlement',
  'Payroll Settings',
] as const

export const MANAGER_PAYROLL_TABS = ['Overview', 'Variable Pay'] as const

export const EMPLOYEE_PAYROLL_TABS = ['My Payslips'] as const

export type HrPayrollTabId = (typeof HR_PAYROLL_TABS)[number]
export type ManagerPayrollTabId = (typeof MANAGER_PAYROLL_TABS)[number]
export type EmployeePayrollTabId = (typeof EMPLOYEE_PAYROLL_TABS)[number]

export type PayrollPageTabId = HrPayrollTabId | ManagerPayrollTabId | EmployeePayrollTabId

/** @deprecated Use HR_PAYROLL_TABS — kept for docs and migrations. */
export const PAYROLL_PAGE_TABS = HR_PAYROLL_TABS

export function payrollTabsForRole(role: UserRole): readonly PayrollPageTabId[] {
  if (isHrAdminExperience(role)) return HR_PAYROLL_TABS
  if (isManagerExperience(role)) return MANAGER_PAYROLL_TABS
  if (isEmployeeExperience(role)) return EMPLOYEE_PAYROLL_TABS
  return HR_PAYROLL_TABS
}

export function defaultPayrollTabForRole(role: UserRole): PayrollPageTabId {
  return payrollTabsForRole(role)[0]
}
