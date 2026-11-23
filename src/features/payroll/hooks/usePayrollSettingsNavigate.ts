/**
 * Navigate from Settings to other payroll tabs with unsaved draft guard.
 */

import { useCallback } from 'react'

import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'

import type { PayrollPageTabId } from './usePayrollPageTabs'
import { usePayrollRoute } from './usePayrollRoute'
export function usePayrollSettingsNavigate() {
  const { role } = useLeaveViewer()
  const { goToTab } = usePayrollRoute(role)

  const navigateToTab = useCallback(
    (tab: PayrollPageTabId) => {
      goToTab(tab)
    },
    [goToTab],
  )

  return { navigateToTab }
}