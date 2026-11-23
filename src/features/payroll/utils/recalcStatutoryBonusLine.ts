/**
 * Recomputes one statutory bonus preview row from structure and eligible months.
 * Used when eligible months change in the bonus run preview table.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { BonusRunLine } from '../types/variablePay'
import { resolveComponentAmounts, sumGross } from './calculateGrossFromStructure'
import {
  calculateStatutoryBonus,
  isStatutoryBonusEligible,
  wageFromBase,
} from './variablePayCalculations'

export function recalcStatutoryBonusLine(
  line: BonusRunLine,
  structure: SalaryStructure | undefined,
  settings: PayrollSettings,
): BonusRunLine {
  if (!structure) {
    return { ...line, amount: 0, included: false }
  }
  const components = resolveComponentAmounts(settings, structure.componentValues)
  const gross = sumGross(components)
  const monthly = wageFromBase(settings.bonusRules.bonusWageBase, components, gross)
  const months = line.eligibleMonths ?? 12
  if (!isStatutoryBonusEligible(settings, monthly)) {
    return { ...line, amount: 0, included: false, eligibleMonths: months }
  }
  const amount = calculateStatutoryBonus(settings, monthly, months)
  return { ...line, amount, included: amount > 0, eligibleMonths: months }
}
