/**
 * Sticky section tab bar with primary bottom border on the active tab.
 * Rendered inside LeavePageChrome on LeavePage.
 */

import { useEffect, type KeyboardEvent } from 'react'

import { cn } from '@/lib/utils'

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'
import { LEAVE_MOTION } from './shared/leaveUi'

type LeavePageTabsProps = {
  tabs: LeavePageTabId[]
  activeTab: LeavePageTabId
  onTabChange: (tab: LeavePageTabId) => void
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
}

export function LeavePageTabs({ tabs, activeTab, onTabChange, onKeyDown }: LeavePageTabsProps) {
  useEffect(() => {
    document.getElementById(`leave-page-tab-${activeTab}`)?.focus({ preventScroll: true })
  }, [activeTab])

  return (
    <div role="tablist" aria-label="Leave management sections" className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`leave-page-tab-${tab}`}
            aria-selected={isActive}
            aria-controls={`leave-page-panel-${tab}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onTabChange(tab)}
            onKeyDown={onKeyDown}
            className={cn(
              'shrink-0 border-b-2 px-4 py-2 text-sm font-medium',
              LEAVE_MOTION,
              isActive
                ? 'border-hrms-primary font-semibold text-hrms-primary'
                : 'border-transparent text-hrms-text-secondary hover:text-hrms-navy',
            )}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
