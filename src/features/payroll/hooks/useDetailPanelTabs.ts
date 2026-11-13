/**
 * Accessible tab state with arrow-key navigation for the detail panel.
 * Used by DetailPanelTabs in EmployeeDetailPanel.
 */

import { useCallback, useState, type KeyboardEvent } from 'react'

export const DETAIL_TABS = [
  'Breakdown',
  'Payment info',
  'History',
  'Payslip',
] as const

export type DetailTabId = (typeof DETAIL_TABS)[number]

export function useDetailPanelTabs(initial: DetailTabId = 'Breakdown') {
  const [activeTab, setActiveTab] = useState<DetailTabId>(initial)

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    const index = DETAIL_TABS.indexOf(activeTab)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      setActiveTab(DETAIL_TABS[(index + 1) % DETAIL_TABS.length])
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      setActiveTab(DETAIL_TABS[(index - 1 + DETAIL_TABS.length) % DETAIL_TABS.length])
    }
    if (event.key === 'Home') {
      event.preventDefault()
      setActiveTab(DETAIL_TABS[0])
    }
    if (event.key === 'End') {
      event.preventDefault()
      setActiveTab(DETAIL_TABS[DETAIL_TABS.length - 1])
    }
  }, [activeTab])

  return { activeTab, setActiveTab, onKeyDown }
}
