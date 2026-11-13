/**
 * Role-filtered sidebar children for Payroll Management.
 */

import type { NavChild } from '@/components/layout/navigation'
import type { UserRole } from '@/features/leave/constants/userRoles'

import { payrollTabsForRole } from '../hooks/usePayrollPageTabs'
import { payrollPathForTab } from './payrollSectionRoutes'

export function payrollNavChildrenForRole(role: UserRole): NavChild[] {
  return payrollTabsForRole(role).map((tab) => ({
    title: tab,
    path: payrollPathForTab(tab),
  }))
}
