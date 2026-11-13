/**
 * Leave page tab state with role-filtered tab ids and arrow-key navigation.
 */

import { useCallback, useMemo, useState, type KeyboardEvent } from 'react'

import {
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
  type UserRole,
} from '../constants/userRoles'

export const MANAGER_TABS = ['My Leave', 'Approvals', 'Calendar'] as const
export const EMPLOYEE_TABS = ['My Leave', 'Calendar'] as const

export const HR_ADMIN_TABS = [
  'Overview',
  'Requests',
  'Calendar',
  'Balances',
  'Accruals & Year-End',
  'Reports',
  'Leave Settings',
  'My Leave',
] as const

export const SUPER_ADMIN_ONLY_TABS = ['Audit', 'Access'] as const

export const SUPER_ADMIN_TABS = [...HR_ADMIN_TABS, ...SUPER_ADMIN_ONLY_TABS] as const

export type ManagerTabId = (typeof MANAGER_TABS)[number]
export type EmployeeTabId = (typeof EMPLOYEE_TABS)[number]
export type HrAdminTabId = (typeof HR_ADMIN_TABS)[number]
export type SuperAdminOnlyTabId = (typeof SUPER_ADMIN_ONLY_TABS)[number]
export type LeavePageTabId = ManagerTabId | EmployeeTabId | HrAdminTabId | SuperAdminOnlyTabId

export function tabsForRole(role: UserRole): readonly LeavePageTabId[] {
  if (isSuperAdminExperience(role)) return SUPER_ADMIN_TABS
  if (isHrAdminExperience(role)) return HR_ADMIN_TABS
  if (isManagerExperience(role)) return MANAGER_TABS
  return EMPLOYEE_TABS
}

export function useLeavePageTabs(role: UserRole) {
  const allowed = useMemo(() => [...tabsForRole(role)], [role])
  const [pickedTab, setPickedTab] = useState<LeavePageTabId | null>(null)
  const defaultTab = isHrAdminExperience(role) ? 'Overview' : allowed[0]
  const activeTab = pickedTab && allowed.includes(pickedTab) ? pickedTab : defaultTab
  const setActiveTab = useCallback((tab: LeavePageTabId) => setPickedTab(tab), [])

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
