/**
 * Overtime, bonus, and incentive lines after Earnings on Breakdown tab.
 * Shown only when the employee has approved variable pay for the month.
 */

import type { VariablePayTotals } from '../../../types/variablePay'
import { formatCurrency } from '../../../utils/formatCurrency'

type VariablePayBreakdownSectionProps = {
  variablePay: VariablePayTotals
}

export function VariablePayBreakdownSection({ variablePay }: VariablePayBreakdownSectionProps) {
  if (variablePay.total <= 0) {
    return null
  }

  const rows = [
    { label: 'Overtime', value: variablePay.overtime },
    { label: 'Bonus', value: variablePay.bonus },
    { label: 'Incentive', value: variablePay.incentive },
  ].filter((row) => row.value > 0)

  return (
    <div>
      <p className="mb-2 font-semibold text-hrms-navy">Variable pay (this month)</p>
      <ul>
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 py-2 text-hrms-text-secondary"
          >
            <span>{row.label}</span>
            <span className="tabular-nums">{formatCurrency(row.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
