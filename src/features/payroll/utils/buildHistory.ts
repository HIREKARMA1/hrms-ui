/**
 * Generates mock prior-month payroll history for the detail panel.
 * Used by HistoryTab — replace with API data when backend exists.
 */

import { PAYROLL_HISTORY_MONTH_COUNT } from '../constants/payrollRules'
import type { EmployeeWithComputed, PayrollHistoryMonth } from '../types/payroll'

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

export function buildPayrollHistory(
  employee: EmployeeWithComputed,
): PayrollHistoryMonth[] {
  const now = new Date()
  const items: PayrollHistoryMonth[] = []

  for (let index = 1; index <= PAYROLL_HISTORY_MONTH_COUNT; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 5)
    const amount = Math.round(employee.netPay * (index === 2 ? 0.97 : 1))
    items.push({
      monthLabel: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
      amount,
      paidOn: date.toISOString().slice(0, 10),
      status: index === 2 && employee.unpaidLeaveDays > 0 ? 'Pending' : 'Paid',
      isLate: index === 2 && employee.unpaidLeaveDays > 0,
    })
  }

  return items
}
