/**
 * URL slugs for leave sidebar sections (Overview at /leave).
 */

import {
  isHrAdminExperience,
  type UserRole,
} from '../constants/userRoles'
import type { LeavePageTabId } from '../hooks/useLeavePageTabs'
import { tabsForRole } from '../hooks/useLeavePageTabs'
import { leaveBaseFromPathname } from './leaveModuleBasePath'

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

export function leavePathForTab(tab: LeavePageTabId, base = '/leave'): string {
  const slug = SLUG_BY_TAB[tab]
  return slug ? `${base}/${slug}` : base
}

export function leaveTabFromSection(section: string | undefined, pathname: string, role: UserRole): LeavePageTabId {
  const allowed = tabsForRole(role)
  const defaultTab = isHrAdminExperience(role) ? 'Overview' : allowed[0]
  const base = leaveBaseFromPathname(pathname)

  if (pathname === base || pathname === `${base}/`) {
    return isHrAdminExperience(role) ? 'Overview' : defaultTab
  }

  const tab = section ? TAB_BY_SLUG[section] : undefined
  if (tab && allowed.includes(tab)) return tab
  return defaultTab
}

export function isLeaveOverviewPath(pathname: string) {
  const base = leaveBaseFromPathname(pathname)
  return pathname === base || pathname === `${base}/`
}

export function leaveNonHrOverviewRedirect(role: UserRole, pathname: string): string | null {
  if (!isLeaveOverviewPath(pathname)) return null
  if (isHrAdminExperience(role)) return null
  const base = leaveBaseFromPathname(pathname)
  return leavePathForTab(tabsForRole(role)[0], base)
}
