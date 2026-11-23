/**
 * Earnings and deductions line items shared by Breakdown tab and My Payslips.
 */

import { SALARY_COMPONENT_IDS, SALARY_COMPONENT_LABELS } from '../../constants/salaryComponents'
import type { EmployeeWithComputed } from '../../types/payroll'
import { formatCurrency } from '../../utils/formatCurrency'
import { VariablePayBreakdownSection } from '../EmployeeDetailPanel/tabs/VariablePayBreakdownSection'

type EmployeePayrollBreakdownProps = {
  employee: EmployeeWithComputed
}

function LineSection({
  title,
  rows,
}: {
  title: string
  rows: { label: string; value: number }[]
}) {
  return (
    <div>
      <p className="mb-2 font-semibold text-hrms-navy">{title}</p>
      <ul className="divide-y divide-hrms-border/60">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center justify-between gap-3 py-2.5 text-hrms-text-secondary">
            <span className="min-w-0 flex-1">{row.label}</span>
            <span className="shrink-0 text-right tabular-nums text-hrms-navy">{formatCurrency(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function EmployeePayrollBreakdown({ employee }: EmployeePayrollBreakdownProps) {
  const earnings = SALARY_COMPONENT_IDS.map((id) => ({
    label: SALARY_COMPONENT_LABELS[id],
    value: employee.componentAmounts[id],
  }))
  const deductions = [
    { label: 'PF (employee)', value: employee.employeePf },
    ...(employee.esiApplicable ? [{ label: 'ESI (employee)', value: employee.employeeEsi }] : []),
    { label: 'Professional tax', value: employee.professionalTax },
    { label: 'Income tax (TDS)', value: employee.incomeTax },
    { label: 'Unpaid leave', value: employee.unpaidLeaveDeduction },
    { label: 'Loan recovery', value: employee.loanRecovery },
  ]

  return (
    <div className="space-y-5 text-sm">
      <LineSection title="Earnings" rows={earnings} />
      <VariablePayBreakdownSection variablePay={employee.variablePay} />
      <LineSection title="Deductions" rows={deductions} />
      <p className="text-hrms-text-secondary">
        Employer PF: <strong className="tabular-nums">{formatCurrency(employee.employerPf)}</strong>
      </p>
      {employee.esiApplicable ? (
        <p className="text-hrms-text-secondary">
          Employer ESI: <strong className="tabular-nums">{formatCurrency(employee.employerEsi)}</strong>
        </p>
      ) : (
        <p className="text-hrms-text-muted">ESI: Not applicable for this employee</p>
      )}
    </div>
  )
}
