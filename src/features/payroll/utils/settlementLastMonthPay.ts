/**
 * Salary for partial final month using calculatePayroll with extra unpaid days.
 * Used by Final Settlement panel earnings section.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { PayrollEmployee } from '../types/payroll'
import { computePayrollFieldsWithOptions } from './computePayrollWithOptions'

export function daysAfterLastWorkingDay(lastWorkingDay: string, payrollMonth: string): number {
  const [year, month] = payrollMonth.split('-').map(Number)
  const lastDayOfMonth = new Date(year, month, 0).getDate()
  const lastWorked = Number(lastWorkingDay.split('-')[2])
  return Math.max(0, lastDayOfMonth - lastWorked)
}

export function computeSettlementMonthSalary(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  payrollMonth: string,
  lastWorkingDay: string,
): number {
  const extraUnpaid = daysAfterLastWorkingDay(lastWorkingDay, payrollMonth)
  const computed = computePayrollFieldsWithOptions(employee, settings, structure, {
    payrollMonth,
    extraUnpaidDays: extraUnpaid,
  })
  return computed.netPay
}
