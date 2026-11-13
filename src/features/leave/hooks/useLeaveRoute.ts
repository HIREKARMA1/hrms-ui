/**
 * Syncs leave section with URL path and role-allowed tabs.
 */

import { useCallback, useEffect, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'

import type { UserRole } from '../constants/userRoles'
import type { LeavePageTabId } from './useLeavePageTabs'
import { tabsForRole } from './useLeavePageTabs'
import { leaveNonHrOverviewRedirect, leavePathForTab, leaveTabFromSection } from '../utils/leaveSectionRoutes'
import type { HrOverviewNavigateOpts } from '../context/hrOverviewNavigate'

export function useLeaveRoute(role: UserRole) {
  const navigate = useNavigate()
  const location = useLocation()
  const { section } = useParams<{ section?: string }>()
  const allowedTabs = useMemo(() => [...tabsForRole(role)], [role])
  const activeTab = leaveTabFromSection(section, location.pathname, role)

  useEffect(() => {
    const nonHr = leaveNonHrOverviewRedirect(role, location.pathname)
    if (nonHr) {
      navigate(nonHr, { replace: true })
      return
    }
    const expected = leavePathForTab(activeTab)
    if (location.pathname !== expected) {
      navigate(`${expected}${location.search}`, { replace: true })
    }
  }, [activeTab, location.pathname, location.search, navigate, role])

  const goToTab = useCallback(
    (tab: LeavePageTabId, opts?: HrOverviewNavigateOpts) => {
      const params = new URLSearchParams()
      if (opts?.segment) params.set('segment', opts.segment)
      if (opts?.requestsSearch !== undefined) params.set('q', opts.requestsSearch)
      if (opts?.leaveTypeCode) params.set('q', opts.leaveTypeCode)
      if (opts?.calendarDepartment) params.set('department', opts.calendarDepartment)
      if (opts?.accrualConfirm) params.set('accrual', 'confirm')
      const base = leavePathForTab(tab)
      const search = params.toString()
      navigate(search ? `${base}?${search}` : base)
    },
    [navigate],
  )

  return { activeTab, goToTab, allowedTabs }
}
