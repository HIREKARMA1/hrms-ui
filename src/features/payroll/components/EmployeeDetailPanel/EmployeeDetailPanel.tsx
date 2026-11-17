/**
 * Centered dialog for per-employee payroll review and actions (Overview table).
 */

import { useEffect, useRef, type RefObject } from 'react'

import { usePayroll } from '../../hooks/usePayroll'
import { useDetailPanelTabs } from '../../hooks/useDetailPanelTabs'
import {
  PayrollDialogBody,
  PayrollDialogCloseButton,
  PayrollDialogContent,
  PayrollDialogFooter,
  PayrollDialogHeader,
  PayrollDialogOverlay,
  PayrollDialogPortal,
  PayrollDialogRoot,
} from '../shared/PayrollDialog'
import { DetailPanelFooter } from './DetailPanelFooter'
import { DetailPanelHeader } from './DetailPanelHeader'
import { DetailPanelTabs } from './DetailPanelTabs'
import { BreakdownTab } from './tabs/BreakdownTab'
import { HistoryTab } from './tabs/HistoryTab'
import { PaymentInfoTab } from './tabs/PaymentInfoTab'
import { PayslipTab } from './tabs/PayslipTab'

type EmployeeDetailPanelProps = {
  returnFocusRef: RefObject<HTMLTableRowElement | null>
}

export function EmployeeDetailPanel({ returnFocusRef }: EmployeeDetailPanelProps) {
  const { employees, selectedEmployeeId, setSelectedEmployeeId } = usePayroll()
  const { activeTab, setActiveTab, onKeyDown } = useDetailPanelTabs()
  const dialogRef = useRef<HTMLDivElement>(null)

  const employee = employees.find((item) => item.id === selectedEmployeeId)
  const open = Boolean(employee)

  useEffect(() => {
    if (open) {
      window.requestAnimationFrame(() => dialogRef.current?.focus())
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
    <PayrollDialogRoot open={open} onOpenChange={handleOpenChange}>
      <PayrollDialogPortal>
        <PayrollDialogOverlay />
        <PayrollDialogContent
          size="md"
          className="flex max-h-[min(90vh,720px)] flex-col p-0 outline-none"
          aria-describedby={undefined}
        >
          <div ref={dialogRef} tabIndex={-1} className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PayrollDialogHeader
              title={employee.name}
              description={`${employee.id} · ${employee.department}`}
            >
              <DetailPanelHeader employee={employee} />
            </PayrollDialogHeader>
            <div className="shrink-0 border-b border-hrms-border px-6 py-3">
              <DetailPanelTabs activeTab={activeTab} onTabChange={setActiveTab} onKeyDown={onKeyDown} />
            </div>
            <PayrollDialogBody className="space-y-5">
              <div
                role="tabpanel"
                id={`payroll-panel-${activeTab}`}
                aria-labelledby={`payroll-tab-${activeTab}`}
                className="space-y-5"
              >
              {activeTab === 'Breakdown' ? <BreakdownTab employee={employee} /> : null}
              {activeTab === 'Payment info' ? <PaymentInfoTab employee={employee} /> : null}
              {activeTab === 'History' ? <HistoryTab employee={employee} /> : null}
              {activeTab === 'Payslip' ? <PayslipTab employee={employee} /> : null}
              </div>
            </PayrollDialogBody>
            <PayrollDialogFooter className="shadow-[0_-6px_16px_rgba(23,33,58,0.06)]">
              <DetailPanelFooter employee={employee} />
            </PayrollDialogFooter>
          </div>
          <PayrollDialogCloseButton />
        </PayrollDialogContent>
      </PayrollDialogPortal>
    </PayrollDialogRoot>
  )
}