/**
 * Sidebar children for Leave Management from role-allowed sections.
 */

import type { NavChild } from '@/components/layout/navigation'

import type { UserRole } from '../constants/userRoles'
import { tabsForRole } from '../hooks/useLeavePageTabs'
import { leavePathForTab } from './leaveSectionRoutes'

export function leaveNavChildrenForRole(role: UserRole, base = '/leave'): NavChild[] {
  return tabsForRole(role).map((tab) => ({
    title: tab,
    path: leavePathForTab(tab, base),
  }))
}
