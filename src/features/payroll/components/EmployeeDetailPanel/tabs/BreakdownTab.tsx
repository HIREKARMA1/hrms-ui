/**
 * Salary breakdown tab showing earnings and deductions from computed payroll.
 * Used inside EmployeeDetailPanel; ESI appears here only (not statutory cards).
 */

import type { EmployeeWithComputed } from '../../../types/payroll'
import { formatCurrency } from '../../../utils/formatCurrency'
import { EmployeePayrollBreakdown } from '../../shared/EmployeePayrollBreakdown'

type BreakdownTabProps = {
  employee: EmployeeWithComputed
}

export function BreakdownTab({ employee }: BreakdownTabProps) {
  return (
    <div className="space-y-5 text-sm">
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-hrms-page p-4 min-[380px]:grid-cols-3">
        <SummaryTile label="Gross" value={employee.gross} tone="navy" />
        <SummaryTile label="Deductions" value={employee.totalDeductions} tone="danger" />
        <SummaryTile label="Net pay" value={employee.netPay} tone="success" />
      </div>
      <EmployeePayrollBreakdown employee={employee} />
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'navy' | 'danger' | 'success'
}) {
  const highlighted = tone === 'success'
  return (
    <div className={highlighted ? 'min-w-0 rounded-lg bg-hrms-lavender px-3 py-2' : 'min-w-0'}>
      <p className="text-sm text-hrms-text-secondary">{label}</p>
      <p
        className={`tabular-nums ${
          highlighted
            ? 'text-xl font-bold text-hrms-navy'
            : tone === 'danger'
              ? 'font-semibold text-hrms-danger'
              : 'font-semibold text-hrms-navy'
        }`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  )
}
