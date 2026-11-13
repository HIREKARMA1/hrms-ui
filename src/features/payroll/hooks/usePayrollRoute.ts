/**
 * Syncs payroll section with URL path and role-allowed tabs.
 */

import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { UserRole } from '@/features/leave/constants/userRoles'

import type { PayrollPageTabId } from './usePayrollPageTabs'
import {
  payrollNonHrOverviewRedirect,
  payrollPathForTab,
  payrollTabFromSection,
} from '../utils/payrollSectionRoutes'

export function usePayrollRoute(role: UserRole) {
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section?: string }>()
  const activeTab = payrollTabFromSection(section, location.pathname, role)

  useEffect(() => {
    const nonHr = payrollNonHrOverviewRedirect(role, location.pathname)
    if (nonHr) {
      navigate(nonHr, { replace: true })
      return
    }
    const expected = payrollPathForTab(activeTab)
    if (location.pathname !== expected) {
      navigate(`${expected}${location.search}`, { replace: true })
    }
  }, [activeTab, location.pathname, location.search, navigate, role])

  const goToTab = useCallback(
    (tab: PayrollPageTabId) => {
      navigate(payrollPathForTab(tab))
    },
    [navigate],
  )

  return { activeTab, goToTab }
}
