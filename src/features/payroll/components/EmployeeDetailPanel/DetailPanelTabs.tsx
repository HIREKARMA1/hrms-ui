/**
 * Accessible tab list for employee detail sections with arrow-key support.
 * Used by EmployeeDetailPanel.
 */

import { useEffect, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

import { DETAIL_TABS, type DetailTabId } from '../../hooks/useDetailPanelTabs'

type DetailPanelTabsProps = {
  activeTab: DetailTabId
  onTabChange: (tab: DetailTabId) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

export function DetailPanelTabs({
  activeTab,
  onTabChange,
  onKeyDown,
}: DetailPanelTabsProps) {
  useEffect(() => {
    const tabButton = document.getElementById(`payroll-tab-${activeTab}`)
    tabButton?.focus()
  }, [activeTab])

  return (
    <div
      role="tablist"
      aria-label="Employee payroll details"
      className="flex flex-wrap gap-2 border-b border-hrms-border pb-2"
    >
      {DETAIL_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`payroll-tab-${tab}`}
          aria-selected={activeTab === tab}
          aria-controls={`payroll-panel-${tab}`}
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => onTabChange(tab)}
          onKeyDown={onKeyDown}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus',
            activeTab === tab
              ? 'bg-hrms-lavender text-hrms-primary'
              : 'text-hrms-text-secondary hover:bg-hrms-row-hover',
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
