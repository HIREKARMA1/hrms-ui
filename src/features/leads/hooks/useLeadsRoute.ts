/**
 * Syncs leads section with URL and role-allowed tabs.
 */

import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { UserRole } from '@/features/leave/constants/userRoles'

import type { LeadsPageTabId } from './useLeadsPageTabs'
import { leadsBaseFromPathname } from '../utils/leadsModuleBasePath'
import { leadsPathForTab, leadsTabFromSection } from '../utils/leadsSectionRoutes'

export function useLeadsRoute(role: UserRole) {
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section?: string }>()
  const activeTab = leadsTabFromSection(section, location.pathname, role)
  const leadsBase = leadsBaseFromPathname(location.pathname)

  useEffect(() => {
    const expected = leadsPathForTab(activeTab, leadsBase)
    if (location.pathname !== expected) {
      navigate(`${expected}${location.search}`, { replace: true })
    }
  }, [activeTab, location.pathname, location.search, navigate, leadsBase])

  const goToTab = useCallback(
    (tab: LeadsPageTabId) => {
      navigate(leadsPathForTab(tab, leadsBaseFromPathname(location.pathname)))
    },
    [location.pathname, navigate],
  )

  return { activeTab, goToTab }
}