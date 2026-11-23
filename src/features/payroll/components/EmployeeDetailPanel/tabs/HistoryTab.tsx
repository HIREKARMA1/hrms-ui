/**
 * Prior-month payroll history list for one employee.
 * Used inside EmployeeDetailPanel.
 */

import { usePayroll } from '../../../hooks/usePayroll'
import type { EmployeeWithComputed } from '../../../types/payroll'
import { buildPayrollHistory } from '../../../utils/buildHistory'
import { isEmployeeExitedForMonth } from '../../../utils/employeeExit'
import { formatCurrency } from '../../../utils/formatCurrency'
import { formatDate } from '../../../utils/formatDate'
import { StatusPill } from '../../StatusPill'

type HistoryTabProps = {
  employee: EmployeeWithComputed
}

export function HistoryTab({ employee }: HistoryTabProps) {
  const { settlements, payrollMonth } = usePayroll()
  const history = buildPayrollHistory(employee)
  const exited = isEmployeeExitedForMonth(employee.id, settlements, payrollMonth)

  return (
    <div className="space-y-3 text-sm">
      {exited ? (
        <p className="rounded-lg bg-hrms-muted-bg px-3 py-2 text-xs text-hrms-text-secondary">
          Exited — last working day before {payrollMonth}; excluded from this month&apos;s payroll run.
        </p>
      ) : null}
      <ul className="space-y-5">
        {history.map((item) => (
          <li key={item.monthLabel} className="rounded-xl border border-hrms-border px-4 py-3">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="min-w-0 font-semibold text-hrms-navy">{item.monthLabel}</span>
              <StatusPill status={item.status} className="shrink-0" />
            </div>
            <p className="mt-2 break-words text-hrms-text-secondary">
              <span className="tabular-nums">{formatCurrency(item.amount)}</span>
              {' · '}
              {formatDate(item.paidOn)}
            </p>
            {item.isLate ? (
              <p className="mt-1 text-xs text-hrms-warning">Paid late due to leave adjustment</p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
