/**
 * Syncs payroll section with URL path and role-allowed tabs.
 */

import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import type { UserRole } from '@/features/leave/constants/userRoles'

import { isPayrollSettingsPath } from '../utils/isPayrollSettingsPath'
import type { PayrollPageTabId } from './usePayrollPageTabs'
import { payrollBaseFromPathname } from '../utils/payrollModuleBasePath'
import { consumePayrollSettingsGuard } from './payrollSettingsUnsavedBridge'
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
  const payrollBase = payrollBaseFromPathname(location.pathname)

  useEffect(() => {
    const nonHr = payrollNonHrOverviewRedirect(role, location.pathname)
    if (nonHr) {
      navigate(nonHr, { replace: true })
      return
    }
    const expected = payrollPathForTab(activeTab, payrollBase)
    if (location.pathname !== expected) {
      navigate(`${expected}${location.search}`, { replace: true })
    }
  }, [activeTab, location.pathname, location.search, navigate, payrollBase, role])

  const goToTab = useCallback(
    (tab: PayrollPageTabId) => {
      const target = payrollPathForTab(tab, payrollBaseFromPathname(location.pathname))
      if (isPayrollSettingsPath(location.pathname) && target !== location.pathname) {
        const guard = consumePayrollSettingsGuard()
        if (guard?.isDirty && !guard.promptConfirm()) return
      }
      navigate(target)
    },
    [location.pathname, navigate],
  )

  return { activeTab, goToTab }
}
