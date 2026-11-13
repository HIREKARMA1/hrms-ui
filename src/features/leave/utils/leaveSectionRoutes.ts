/**
 * URL slugs for leave sidebar sections (Overview at /leave).
 */

import {
  isHrAdminExperience,
  type UserRole,
} from '../constants/userRoles'
import type { LeavePageTabId } from '../hooks/useLeavePageTabs'
import { tabsForRole } from '../hooks/useLeavePageTabs'

const SLUG_BY_TAB: Record<LeavePageTabId, string> = {
  Overview: '',
  Requests: 'requests',
  Calendar: 'calendar',
  Balances: 'balances',
  'Accruals & Year-End': 'accruals',
  Reports: 'reports',
  'Leave Settings': 'settings',
  'My Leave': 'my-leave',
  Approvals: 'approvals',
  Audit: 'audit',
  Access: 'access',
}

const TAB_BY_SLUG: Record<string, LeavePageTabId> = Object.fromEntries(
  Object.entries(SLUG_BY_TAB)
    .filter(([, slug]) => slug.length > 0)
    .map(([tab, slug]) => [slug, tab as LeavePageTabId]),
)

export function leavePathForTab(tab: LeavePageTabId): string {
  const slug = SLUG_BY_TAB[tab]
  return slug ? `/leave/${slug}` : '/leave'
}

export function leaveTabFromSection(section: string | undefined, pathname: string, role: UserRole): LeavePageTabId {
  const allowed = tabsForRole(role)
  const defaultTab = isHrAdminExperience(role) ? 'Overview' : allowed[0]

  if (pathname === '/leave' || pathname === '/leave/') {
    return isHrAdminExperience(role) ? 'Overview' : defaultTab
  }

  const tab = section ? TAB_BY_SLUG[section] : undefined
  if (tab && allowed.includes(tab)) return tab
  return defaultTab
}

export function isLeaveOverviewPath(pathname: string) {
  return pathname === '/leave' || pathname === '/leave/'
}

export function leaveNonHrOverviewRedirect(role: UserRole, pathname: string): string | null {
  if (!isLeaveOverviewPath(pathname)) return null
  if (isHrAdminExperience(role)) return null
  return leavePathForTab(tabsForRole(role)[0])
}
