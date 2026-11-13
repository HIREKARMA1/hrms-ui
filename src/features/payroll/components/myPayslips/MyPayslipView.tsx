/**
 * Employee payslip: compact summary on page; full breakdown in dialog.
 */

import { useState } from 'react'

import type { EmployeeWithComputed } from '../../types/payroll'
import { MyPayslipDetailDialog } from './MyPayslipDetailDialog'
import { MyPayslipSummaryCard } from './MyPayslipSummaryCard'

type MyPayslipViewProps = {
  employee: EmployeeWithComputed
  payrollMonth: string
}

export function MyPayslipView({ employee, payrollMonth }: MyPayslipViewProps) {
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <MyPayslipSummaryCard
        employee={employee}
        payrollMonth={payrollMonth}
        onViewDetails={() => setDetailOpen(true)}
      />
      <MyPayslipDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        employee={employee}
        payrollMonth={payrollMonth}
      />
    </div>
  )
}
