/**

 * Top tab bar for Overview, Structures, and Settings on PayrollPage.

 * Rendered inside PayrollPageChrome; not sticky on its own.

 */



import { useEffect, type KeyboardEvent } from 'react'



import { cn } from '@/lib/utils'



import { PAYROLL_PAGE_TABS, type PayrollPageTabId } from '../hooks/usePayrollPageTabs'

import { PAYROLL_MOTION } from './shared/payrollUi'



type PayrollPageTabsProps = {

  activeTab: PayrollPageTabId

  onTabChange: (tab: PayrollPageTabId) => void

  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void

}



export function PayrollPageTabs({

  activeTab,

  onTabChange,

  onKeyDown,

}: PayrollPageTabsProps) {

  useEffect(() => {

    document.getElementById(`payroll-page-tab-${activeTab}`)?.focus({ preventScroll: true })

  }, [activeTab])



  return (

    <div

      role="tablist"

      aria-label="Payroll management sections"

      className="flex gap-1 overflow-x-auto"

    >

      {PAYROLL_PAGE_TABS.map((tab) => {

        const isActive = activeTab === tab

        return (

          <button

            key={tab}

            type="button"

            role="tab"

            id={`payroll-page-tab-${tab}`}

            aria-selected={isActive}

            aria-controls={`payroll-page-panel-${tab}`}

            tabIndex={isActive ? 0 : -1}

            onClick={() => onTabChange(tab)}

            onKeyDown={onKeyDown}

            className={cn(

              'shrink-0 border-b-2 px-4 py-2 text-sm font-medium',

              PAYROLL_MOTION,

              isActive

                ? 'border-hrms-primary bg-hrms-lavender/70 font-semibold text-hrms-primary'

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

