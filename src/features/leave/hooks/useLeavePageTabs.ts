/**
 * Leave page tab state with role-filtered tab ids and arrow-key navigation.
 * Used by LeavePageTabs on LeavePage.
 */

import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'

import type { LeaveViewerRole } from '../types/viewer'

export const LEAVE_PAGE_TABS = [
  'My Leave',
  'Approvals',
  'Calendar',
  'Balances',
  'Accruals & Year-End',
  'Leave Settings',
] as const

export type LeavePageTabId = (typeof LEAVE_PAGE_TABS)[number]

const TABS_BY_ROLE: Record<LeaveViewerRole, LeavePageTabId[]> = {
  Employee: ['My Leave', 'Calendar'],
  Manager: ['My Leave', 'Approvals', 'Calendar'],
  HR: [...LEAVE_PAGE_TABS],
}

export function useLeavePageTabs(role: LeaveViewerRole) {
  const allowed = useMemo(() => TABS_BY_ROLE[role], [role])
  const [pickedTab, setPickedTab] = useState<LeavePageTabId | null>(null)
  const activeTab = pickedTab && allowed.includes(pickedTab) ? pickedTab : allowed[0]
  const setActiveTab = useCallback(
    (tab: LeavePageTabId) => {
      setPickedTab(tab)
    },
    [],
  )

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const index = allowed.indexOf(activeTab)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setActiveTab(allowed[(index + 1) % allowed.length])
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setActiveTab(allowed[(index - 1 + allowed.length) % allowed.length])
      }
      if (event.key === 'Home') {
        event.preventDefault()
        setActiveTab(allowed[0])
      }
      if (event.key === 'End') {
        event.preventDefault()
        setActiveTab(allowed[allowed.length - 1])
      }
    },
    [activeTab, allowed, setActiveTab],
  )

  return { activeTab, setActiveTab, onKeyDown, allowedTabs: allowed }
}
