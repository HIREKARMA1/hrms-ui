/**
 * Looks up professional tax from configured slabs for the employee gross.
 * Used by calculatePayroll when PT is enabled and applicable for the employee.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructureFlags } from '../types/salaryStructure'
import { payrollMonthIsFebruary } from './defaultPayrollMonth'
import { roundMoney } from './roundMoney'

export function calculateProfessionalTax(
  settings: PayrollSettings,
  flags: SalaryStructureFlags,
  gross: number,
  payrollMonth: string,
): number {
  if (!settings.professionalTaxEnabled || !flags.professionalTaxApplicable) {
    return 0
  }

  const slab = settings.professionalTaxSlabs.find((item) => {
    const withinUpper = item.toGross === null || gross <= item.toGross
    return gross >= item.fromGross && withinUpper
  })

  if (!slab) {
    return 0
  }

  const useFebruary =
    payrollMonthIsFebruary(payrollMonth) &&
    slab.februaryAmount !== undefined &&
    slab.februaryAmount > 0

  return roundMoney(useFebruary ? slab.februaryAmount! : slab.monthlyAmount)
}
