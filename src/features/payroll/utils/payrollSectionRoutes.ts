/**
 * URL slugs for payroll sidebar sections (Overview at /payroll).
 */

import type { UserRole } from '@/features/leave/constants/userRoles'
import { isHrAdminExperience } from '@/features/leave/constants/userRoles'

import type { PayrollPageTabId } from '../hooks/usePayrollPageTabs'
import { defaultPayrollTabForRole, payrollTabsForRole } from '../hooks/usePayrollPageTabs'
import { payrollBaseFromPathname } from './payrollModuleBasePath'

const SLUG_BY_TAB: Record<PayrollPageTabId, string> = {
  Overview: '',
  'Salary Structures': 'structures',
  'Variable Pay': 'variable-pay',
  'Final Settlement': 'settlement',
  'Payroll Settings': 'settings',
  'My Payslips': 'my-payslips',
}

const TAB_BY_SLUG: Record<string, PayrollPageTabId> = Object.fromEntries(
  Object.entries(SLUG_BY_TAB)
    .filter(([, slug]) => slug.length > 0)
    .map(([tab, slug]) => [slug, tab as PayrollPageTabId]),
)

export function payrollPathForTab(tab: PayrollPageTabId, base = '/payroll'): string {
  const slug = SLUG_BY_TAB[tab]
  return slug ? `${base}/${slug}` : base
}

export function payrollTabFromSection(
  section: string | undefined,
  pathname: string,
  role: UserRole,
): PayrollPageTabId {
  const allowed = payrollTabsForRole(role)
  const defaultTab = defaultPayrollTabForRole(role)

  const base = payrollBaseFromPathname(pathname)

  if (pathname === base || pathname === `${base}/`) {
    return isHrAdminExperience(role) ? 'Overview' : defaultTab
  }

  const tab = section ? TAB_BY_SLUG[section] : undefined
  if (tab && allowed.includes(tab)) return tab
  return defaultTab
}

export function isPayrollOverviewPath(pathname: string) {
  const base = payrollBaseFromPathname(pathname)
  return pathname === base || pathname === `${base}/`
}

export function payrollNonHrOverviewRedirect(role: UserRole, pathname: string): string | null {
  if (!isPayrollOverviewPath(pathname)) return null
  if (isHrAdminExperience(role)) return null
  const base = payrollBaseFromPathname(pathname)
  return payrollPathForTab(defaultPayrollTabForRole(role), base)
}
