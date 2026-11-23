/**
 * Aggregates payroll totals and status counts from the employee list.
 * Used by summary cards, statutory totals, and status cards.
 */

import { PAYMENT_STATUSES } from '../constants/paymentStatuses'
import type { EmployeeWithComputed, PayrollSummary } from '../types/payroll'

export function summarizePayroll(
  employees: EmployeeWithComputed[],
): PayrollSummary {
  const statusCounts = PAYMENT_STATUSES.reduce(
    (acc, status) => {
      acc[status] = employees.filter((item) => item.status === status).length
      return acc
    },
    {} as PayrollSummary['statusCounts'],
  )

  const totals = employees.reduce(
    (summary, employee) => ({
      employeeCount: summary.employeeCount + 1,
      totalGross: summary.totalGross + employee.gross,
      totalDeductions: summary.totalDeductions + employee.totalDeductions,
      totalNet: summary.totalNet + employee.netPay,
      totalPf: summary.totalPf + employee.employeePf,
      totalEmployerPf: summary.totalEmployerPf + employee.employerPf,
      totalTds: summary.totalTds + employee.incomeTax,
      totalProfessionalTax:
        summary.totalProfessionalTax + employee.professionalTax,
    }),
    {
      employeeCount: 0,
      totalGross: 0,
      totalDeductions: 0,
      totalNet: 0,
      totalPf: 0,
      totalEmployerPf: 0,
      totalTds: 0,
      totalProfessionalTax: 0,
    },
  )

  return { ...totals, statusCounts }
}
