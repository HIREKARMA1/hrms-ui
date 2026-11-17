/**
 * Looks up professional tax from configured slabs for the employee gross.
 * Used by calculatePayroll when PT is enabled and applicable for the employee.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import { payrollMonthIsFebruary } from './defaultPayrollMonth'
import {
  getProfessionalTaxSlabsForState,
  resolveProfessionalTaxState,
} from './structureStatutory'
import { roundMoney } from './roundMoney'

export function calculateProfessionalTax(
  settings: PayrollSettings,
  structure: SalaryStructure,
  gross: number,
  payrollMonth: string,
): number {
  if (!settings.professionalTaxEnabled || !structure.flags.professionalTaxApplicable) {
    return 0
  }

  const state = resolveProfessionalTaxState(settings, structure)
  const slabs = getProfessionalTaxSlabsForState(settings, state)
  const slab = slabs.find((item) => {
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
