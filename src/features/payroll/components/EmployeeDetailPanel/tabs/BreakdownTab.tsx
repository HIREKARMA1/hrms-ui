/**
 * Salary breakdown tab showing earnings and deductions from computed payroll.
 * Used inside EmployeeDetailPanel; ESI appears here only (not statutory cards).
 */

import { SALARY_COMPONENT_IDS, SALARY_COMPONENT_LABELS } from '../../../constants/salaryComponents'
import type { EmployeeWithComputed } from '../../../types/payroll'
import { formatCurrency } from '../../../utils/formatCurrency'
import { VariablePayBreakdownSection } from './VariablePayBreakdownSection'

type BreakdownTabProps = {
  employee: EmployeeWithComputed
}

export function BreakdownTab({ employee }: BreakdownTabProps) {
  const earnings = SALARY_COMPONENT_IDS.map((id) => ({
    label: SALARY_COMPONENT_LABELS[id],
    value: employee.componentAmounts[id],
  }))
  const deductions = [
    { label: 'PF (employee)', value: employee.employeePf },
    ...(employee.esiApplicable
      ? [{ label: 'ESI (employee)', value: employee.employeeEsi }]
      : []),
    { label: 'Professional tax', value: employee.professionalTax },
    { label: 'Income tax (TDS)', value: employee.incomeTax },
    { label: 'Unpaid leave', value: employee.unpaidLeaveDeduction },
    { label: 'Loan recovery', value: employee.loanRecovery },
  ]

  return (
    <div className="space-y-5 text-sm">
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-hrms-page p-4 min-[380px]:grid-cols-3">
        <SummaryTile label="Gross" value={employee.gross} tone="navy" />
        <SummaryTile label="Deductions" value={employee.totalDeductions} tone="danger" />
        <SummaryTile label="Net pay" value={employee.netPay} tone="success" />
      </div>
      <Section title="Earnings" rows={earnings} />
      <VariablePayBreakdownSection variablePay={employee.variablePay} />
      <Section title="Deductions" rows={deductions} />
      <p className="text-hrms-text-secondary">
        Employer PF: <strong className="tabular-nums">{formatCurrency(employee.employerPf)}</strong>
      </p>
      {employee.esiApplicable ? (
        <p className="text-hrms-text-secondary">
          Employer ESI:{' '}
          <strong className="tabular-nums">{formatCurrency(employee.employerEsi)}</strong>
        </p>
      ) : (
        <p className="text-hrms-text-muted">ESI: Not applicable for this employee</p>
      )}
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
    <div
      className={
        highlighted
          ? 'min-w-0 rounded-lg bg-hrms-lavender px-3 py-2'
          : 'min-w-0'
      }
    >
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

function Section({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: number }[]
}) {
  return (
    <div>
      <p className="mb-2 font-semibold text-hrms-navy">{title}</p>
      <ul>
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 py-2 text-hrms-text-secondary"
          >
            <span className="min-w-0 flex-1">{row.label}</span>
            <span className="shrink-0 text-right tabular-nums">
              {formatCurrency(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
