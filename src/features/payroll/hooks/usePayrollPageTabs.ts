/**
 * Top-level Payroll Management page tab state with arrow-key support.
 * Used by PayrollPageTabs on PayrollPage.
 */

import { useCallback, useState, type KeyboardEvent } from 'react'

export const PAYROLL_PAGE_TABS = [
  'Overview',
  'Salary Structures',
  'Variable Pay',
  'Final Settlement',
  'Payroll Settings',
] as const

export type PayrollPageTabId = (typeof PAYROLL_PAGE_TABS)[number]

export function usePayrollPageTabs(initial: PayrollPageTabId = 'Overview') {
  const [activeTab, setActiveTab] = useState<PayrollPageTabId>(initial)

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const index = PAYROLL_PAGE_TABS.indexOf(activeTab)
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setActiveTab(PAYROLL_PAGE_TABS[(index + 1) % PAYROLL_PAGE_TABS.length])
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setActiveTab(
          PAYROLL_PAGE_TABS[(index - 1 + PAYROLL_PAGE_TABS.length) % PAYROLL_PAGE_TABS.length],
        )
      }
      if (event.key === 'Home') {
        event.preventDefault()
        setActiveTab(PAYROLL_PAGE_TABS[0])
      }
      if (event.key === 'End') {
        event.preventDefault()
        setActiveTab(PAYROLL_PAGE_TABS[PAYROLL_PAGE_TABS.length - 1])
      }
    },
    [activeTab],
  )

  return { activeTab, setActiveTab, onKeyDown }
}
