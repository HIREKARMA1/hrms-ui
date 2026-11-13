/**
 * Top tab bar for leave sections styled like PayrollPageTabs.
 * Rendered on LeavePage above role-filtered tab panels.
 */

import { useEffect, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'

type LeavePageTabsProps = {
  tabs: LeavePageTabId[]
  activeTab: LeavePageTabId
  onTabChange: (tab: LeavePageTabId) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

export function LeavePageTabs({ tabs, activeTab, onTabChange, onKeyDown }: LeavePageTabsProps) {
  useEffect(() => {
    document.getElementById(`leave-page-tab-${activeTab}`)?.focus()
  }, [activeTab])

  return (
    <div
      role="tablist"
      aria-label="Leave management sections"
      className="-mx-1 flex gap-2 overflow-x-auto border-b border-hrms-border px-1 pb-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          id={`leave-page-tab-${tab}`}
          aria-selected={activeTab === tab}
          aria-controls={`leave-page-panel-${tab}`}
          tabIndex={activeTab === tab ? 0 : -1}
          onClick={() => onTabChange(tab)}
          onKeyDown={onKeyDown}
          className={cn(
            'shrink-0 rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus',
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
