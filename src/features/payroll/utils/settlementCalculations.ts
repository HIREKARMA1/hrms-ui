/**
 * Leave encashment, notice recovery, gratuity, and F&F net settlement math.
 * Used by Final Settlement panel and settlement preview utils.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { StructureComponentValues } from '../types/salaryStructure'
import type { SettlementLine } from '../types/finalSettlement'
import { wageFromBase } from './variablePayCalculations'
import { roundMoney } from './roundMoney'

function dailyRate(monthlyWage: number, divisor: number): number {
  return roundMoney(monthlyWage / divisor)
}

export function calculateLeaveEncashment(
  settings: PayrollSettings,
  components: StructureComponentValues,
  fixedGross: number,
  encashableDays: number,
): number {
  const monthly = wageFromBase(
    settings.finalSettlementRules.leaveEncashmentRateBase,
    components,
    fixedGross,
  )
  const rate = dailyRate(monthly, settings.finalSettlementRules.leaveEncashmentDayDivisor)
  return roundMoney(encashableDays * rate)
}

export function calculateNoticeRecovery(
  settings: PayrollSettings,
  components: StructureComponentValues,
  fixedGross: number,
  shortfallDays: number,
): number {
  if (shortfallDays <= 0) {
    return 0
  }
  const monthly = wageFromBase(
    settings.finalSettlementRules.noticeRecoveryRateBase,
    components,
    fixedGross,
  )
  const rate = dailyRate(monthly, settings.finalSettlementRules.noticeRecoveryDayDivisor)
  return roundMoney(shortfallDays * rate)
}

export function calculateGratuity(
  settings: PayrollSettings,
  components: StructureComponentValues,
  fixedGross: number,
  yearsOfService: number,
): number {
  const rules = settings.finalSettlementRules
  if (!rules.gratuityEnabled || yearsOfService < rules.gratuityMinYears) {
    return 0
  }
  const monthly = wageFromBase(rules.gratuityWageBase, components, fixedGross)
  const raw =
    (yearsOfService * rules.gratuityDaysPerYear * monthly) / rules.gratuityDayDivisor
  return roundMoney(Math.min(raw, rules.gratuityMaxAmount))
}

export function calculateFinalSettlement(
  earnings: SettlementLine[],
  deductions: SettlementLine[],
  tds: number,
): { totalEarnings: number; totalDeductions: number; netPayable: number } {
  const earningsTotal = earnings.reduce((sum, line) => sum + line.amount, 0)
  const deductionTotal =
    deductions.reduce((sum, line) => sum + line.amount, 0) + tds
  return {
    totalEarnings: roundMoney(earningsTotal),
    totalDeductions: roundMoney(deductionTotal),
    netPayable: roundMoney(earningsTotal - deductionTotal),
  }
}
