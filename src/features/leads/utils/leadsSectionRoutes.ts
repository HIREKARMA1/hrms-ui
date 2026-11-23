/**
 * URL slugs for leads sidebar sections.
 */

import type { UserRole } from '@/features/leave/constants/userRoles'

import type { LeadsPageTabId } from '../hooks/useLeadsPageTabs'
import { defaultLeadsTabForRole, leadsTabsForRole } from '../hooks/useLeadsPageTabs'
import { leadsBaseFromPathname } from './leadsModuleBasePath'

const SLUG_BY_TAB: Record<LeadsPageTabId, string> = {
  Overview: '',
  'All Leads': 'all',
  'My Leads': 'my',
  'Team Leads': 'team',
  Pipeline: 'pipeline',
  Duplicates: 'duplicates',
}

const TAB_BY_SLUG: Record<string, LeadsPageTabId> = Object.fromEntries(
  Object.entries(SLUG_BY_TAB)
    .filter(([, slug]) => slug.length > 0)
    .map(([tab, slug]) => [slug, tab as LeadsPageTabId]),
)

export function leadsPathForTab(tab: LeadsPageTabId, base = '/admin/leads'): string {
  const slug = SLUG_BY_TAB[tab]
  return slug ? `${base}/${slug}` : base
}

export function leadsTabFromSection(
  section: string | undefined,
  pathname: string,
  role: UserRole,
): LeadsPageTabId {
  const allowed = leadsTabsForRole(role)
  const defaultTab = defaultLeadsTabForRole(role)
  const base = leadsBaseFromPathname(pathname)

  if (pathname === base || pathname === `${base}/`) {
    return defaultTab
  }

  const tab = section ? TAB_BY_SLUG[section] : undefined
  if (tab && allowed.includes(tab)) return tab
  return defaultTab
}

export function leadsNavChildrenForRole(role: UserRole, base = '/admin/leads') {
  return leadsTabsForRole(role).map((tab) => ({
    title: tab,
    path: leadsPathForTab(tab, base),
  }))
}