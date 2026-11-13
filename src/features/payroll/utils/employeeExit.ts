/**
 * Detects employees exited before a payroll month from F&F settlements.
 * Used to filter Overview payroll and variable-pay employee pickers.
 */

import type { FinalSettlement } from '../types/finalSettlement'
import type { PayrollEmployee } from '../types/payroll'

export function firstDayOfPayrollMonth(payrollMonth: string): string {
  return `${payrollMonth}-01`
}

export function isEmployeeExitedForMonth(
  employeeId: string,
  settlements: FinalSettlement[],
  payrollMonth: string,
): boolean {
  const cutoff = firstDayOfPayrollMonth(payrollMonth)
  return settlements.some(
    (item) =>
      item.employeeId === employeeId &&
      item.status !== 'Rejected' &&
      item.lastWorkingDay < cutoff,
  )
}

export function filterEmployeesForPayrollMonth(
  employees: PayrollEmployee[],
  settlements: FinalSettlement[],
  payrollMonth: string,
): PayrollEmployee[] {
  return employees.filter(
    (employee) => !isEmployeeExitedForMonth(employee.id, settlements, payrollMonth),
  )
}

export function getOpenSettlementEmployeeIds(settlements: FinalSettlement[]): Set<string> {
  return new Set(
    settlements
      .filter((item) => item.status !== 'Paid' && item.status !== 'Rejected')
      .map((item) => item.employeeId),
  )
}
