/**

 * Right slide-in panel for per-employee payroll review and actions.

 * Used on PayrollPage when a table row is selected.

 */



import { useEffect, useRef, type RefObject } from 'react'



import { Sheet, SheetContent } from '@/components/ui/sheet'



import { usePayroll } from '../../hooks/usePayroll'

import { useDetailPanelTabs } from '../../hooks/useDetailPanelTabs'

import { DetailPanelFooter } from './DetailPanelFooter'

import { DetailPanelHeader } from './DetailPanelHeader'

import { DetailPanelTabs } from './DetailPanelTabs'

import { BreakdownTab } from './tabs/BreakdownTab'

import { HistoryTab } from './tabs/HistoryTab'

import { PaymentInfoTab } from './tabs/PaymentInfoTab'

import { PayslipTab } from './tabs/PayslipTab'



const panelPaddingX = 'px-4 sm:px-6'



type EmployeeDetailPanelProps = {

  returnFocusRef: RefObject<HTMLTableRowElement | null>

}



export function EmployeeDetailPanel({ returnFocusRef }: EmployeeDetailPanelProps) {

  const { employees, selectedEmployeeId, setSelectedEmployeeId } = usePayroll()

  const { activeTab, setActiveTab, onKeyDown } = useDetailPanelTabs()

  const panelRef = useRef<HTMLDivElement>(null)



  const employee = employees.find((item) => item.id === selectedEmployeeId)

  const open = Boolean(employee)



  useEffect(() => {

    if (open) {

      window.requestAnimationFrame(() => {

        panelRef.current?.focus()

      })

    }

  }, [open, selectedEmployeeId])



  function handleOpenChange(nextOpen: boolean) {

    if (!nextOpen) {

      setSelectedEmployeeId(null)

      returnFocusRef.current?.focus()

    }

  }



  if (!employee) {

    return null

  }



  return (

    <Sheet open={open} onOpenChange={handleOpenChange}>

      <SheetContent

        className="flex h-full w-full max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-xl motion-reduce:transition-none [&>button]:top-5 [&>button]:right-4 sm:[&>button]:right-6"

        aria-describedby={undefined}

      >

        <div

          ref={panelRef}

          tabIndex={-1}

          className="flex min-h-0 flex-1 flex-col overflow-hidden outline-none"

        >

          <header
            className={`shrink-0 border-b border-hrms-border py-5 pr-12 sm:pr-14 ${panelPaddingX}`}
          >

            <DetailPanelHeader employee={employee} />

          </header>



          <div className={`shrink-0 ${panelPaddingX}`}>

            <DetailPanelTabs

              activeTab={activeTab}

              onTabChange={setActiveTab}

              onKeyDown={onKeyDown}

            />

          </div>



          <div

            role="tabpanel"

            id={`payroll-panel-${activeTab}`}

            aria-labelledby={`payroll-tab-${activeTab}`}

            className={`min-h-0 flex-1 space-y-5 overflow-x-hidden overflow-y-auto py-5 ${panelPaddingX}`}

          >

            {activeTab === 'Breakdown' ? <BreakdownTab employee={employee} /> : null}

            {activeTab === 'Payment info' ? <PaymentInfoTab employee={employee} /> : null}

            {activeTab === 'History' ? <HistoryTab employee={employee} /> : null}

            {activeTab === 'Payslip' ? <PayslipTab employee={employee} /> : null}

          </div>



          <footer
            className={`shrink-0 border-t border-hrms-border py-4 shadow-[0_-6px_16px_rgba(23,33,58,0.06)] ${panelPaddingX}`}
          >

            <DetailPanelFooter employee={employee} />

          </footer>

        </div>

      </SheetContent>

    </Sheet>

  )

}


