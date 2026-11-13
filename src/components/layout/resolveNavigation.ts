/**
 * Injects role-filtered Leave Management children into static navigation config.
 */

import { leaveNavChildrenForRole } from '@/features/leave/utils/leaveNavChildren'
import type { UserRole } from '@/features/leave/constants/userRoles'
import { payrollNavChildrenForRole } from '@/features/payroll/utils/payrollNavChildren'

import { navigationItems, type NavItem } from './navigation'

export function resolveNavigationItems(demoLeaveRole: UserRole): NavItem[] {
  return navigationItems.map((item) => {
    if (item.path === '/leave') {
      return { ...item, children: leaveNavChildrenForRole(demoLeaveRole) }
    }
    if (item.path === '/payroll') {
      return { ...item, children: payrollNavChildrenForRole(demoLeaveRole) }
    }
    return item
  })
}
