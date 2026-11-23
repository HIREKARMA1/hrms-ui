import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { UserRole } from '@/features/leave/constants/userRoles'

import type { OfficeCalendarPageTabId } from './useOfficeCalendarPageTabs'
import { calendarBaseFromPathname } from '../utils/calendarModuleBasePath'
import { calendarPathForTab, calendarTabFromSection } from '../utils/officeCalendarSectionRoutes'

export function useOfficeCalendarRoute(role: UserRole) {
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section?: string }>()
  const activeTab = calendarTabFromSection(section, location.pathname, role)
  const calendarBase = calendarBaseFromPathname(location.pathname)

  useEffect(() => {
    const expected = calendarPathForTab(activeTab, calendarBase)
    if (location.pathname !== expected) {
      navigate(`${expected}${location.search}`, { replace: true })
    }
  }, [activeTab, location.pathname, location.search, navigate, calendarBase])

  const goToTab = useCallback(
    (tab: OfficeCalendarPageTabId) => {
      navigate(calendarPathForTab(tab, calendarBaseFromPathname(location.pathname)))
    },
    [location.pathname, navigate],
  )

  return { activeTab, goToTab }
}