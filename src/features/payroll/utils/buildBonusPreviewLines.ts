/**
 * Builds default bonus run lines for the prepare dialog preview step.
 * Statutory rows use bonus rules; other types default to 10% of Basic.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { BonusRunLine, BonusRunType } from '../types/variablePay'
import type { PayrollEmployee } from '../types/payroll'
import { resolveComponentAmounts, sumGross } from './calculateGrossFromStructure'
import { calculateStatutoryBonus, wageFromBase } from './variablePayCalculations'
import { roundMoney } from './roundMoney'

export function buildBonusPreviewLines(
  employees: PayrollEmployee[],
  structures: SalaryStructure[],
  settings: PayrollSettings,
  bonusType: BonusRunType,
): BonusRunLine[] {
  return employees.map((employee) => {
    const structure = structures.find((item) => item.employeeId === employee.id)
    if (!structure) {
      return { employeeId: employee.id, included: false, amount: 0 }
    }
    const components = resolveComponentAmounts(settings, structure.componentValues)
    const gross = sumGross(components)
    if (bonusType === 'Statutory') {
      const monthly = wageFromBase(settings.bonusRules.bonusWageBase, components, gross)
      const amount = calculateStatutoryBonus(settings, monthly, 12)
      return { employeeId: employee.id, included: amount > 0, amount, eligibleMonths: 12 }
    }
    const amount = roundMoney((components.basic * 10) / 100)
    return { employeeId: employee.id, included: amount > 0, amount }
  })
}
