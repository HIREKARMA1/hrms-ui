/**
 * Table rows with keyboard support for opening the detail panel.
 * Used inside EmployeeTable on PayrollPage.
 */

import { cn } from '@/lib/utils'

import type { EmployeeWithComputed } from '../types/payroll'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { payrollTrClass } from './shared/payrollTableLayout'
import { StatusPill } from './StatusPill'

type EmployeeTableBodyProps = {
  employees: EmployeeWithComputed[]
  selectedEmployeeId: string | null
  onSelect: (id: string, row: HTMLTableRowElement) => void
}

export function EmployeeTableBody({
  employees,
  selectedEmployeeId,
  onSelect,
}: EmployeeTableBodyProps) {
  if (employees.length === 0) {
    return (
      <tr>
        <td colSpan={9} className="py-10 text-center text-sm text-hrms-text-secondary">
          No employees match your filters.
        </td>
      </tr>
    )
  }

  return (
    <>
      {employees.map((employee) => (
        <tr
          key={employee.id}
          tabIndex={0}
          className={cn(
            'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-hrms-focus',
            payrollTrClass,
            selectedEmployeeId === employee.id && 'bg-hrms-lavender/50',
          )}
          onClick={(event) => onSelect(employee.id, event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect(employee.id, event.currentTarget)
            }
          }}
        >
          <td className="px-4 py-3 text-sm text-hrms-text-secondary whitespace-nowrap">{employee.id}</td>
          <td className="px-4 py-3 text-sm font-medium text-hrms-navy whitespace-nowrap">{employee.name}</td>
          <td className="px-4 py-3 text-sm text-hrms-text-secondary whitespace-nowrap">{employee.department}</td>
          <td className="px-4 py-3 text-right text-sm tabular-nums whitespace-nowrap">
            {formatCurrency(employee.gross)}
          </td>
          <td className="px-4 py-3 text-right text-sm tabular-nums whitespace-nowrap">
            {formatCurrency(employee.employeePf)}
          </td>
          <td className="px-4 py-3 text-right text-sm tabular-nums whitespace-nowrap">
            {formatCurrency(employee.incomeTax)}
          </td>
          <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-hrms-navy whitespace-nowrap">
            {formatCurrency(employee.netPay)}
          </td>
          <td className="px-4 py-3 text-sm text-hrms-text-secondary whitespace-nowrap">
            {formatDate(employee.paidOn)}
          </td>
          <td className="px-4 py-3 whitespace-nowrap">
            <StatusPill status={employee.status} />
          </td>
        </tr>
      ))}
    </>
  )
}
