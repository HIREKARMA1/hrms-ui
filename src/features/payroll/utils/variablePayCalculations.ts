/**
 * Pure overtime, bonus, and aggregation helpers for payroll month runs.
 * Used by calculatePayroll, Variable Pay tab, and bonus prepare flow.
 */

import type { PayrollSettings, WageBase } from '../types/payrollSettings'
import type { StructureComponentValues } from '../types/salaryStructure'
import type {
  BonusRun,
  IncentiveEntry,
  OvertimeEntry,
  VariablePayTotals,
} from '../types/variablePay'
import { sumGross } from './calculateGrossFromStructure'
import { roundMoney } from './roundMoney'

export function wageFromBase(
  base: WageBase,
  components: StructureComponentValues,
  fixedGross: number,
): number {
  return base === 'Basic' ? components.basic : fixedGross
}

export function hourlyOvertimeRate(
  settings: PayrollSettings,
  monthlyBase: number,
): number {
  const { workingDaysPerMonth, hoursPerDay, rateMultiplier } = settings.overtimeRules
  const standardHours = workingDaysPerMonth * hoursPerDay
  return roundMoney((monthlyBase / standardHours) * rateMultiplier)
}

export function calculateOvertimePay(hours: number, ratePerHour: number): number {
  return roundMoney(hours * ratePerHour)
}

export function calculateStatutoryBonus(
  settings: PayrollSettings,
  monthlyWage: number,
  eligibleMonths: number,
): number {
  const { bonusRules } = settings
  if (monthlyWage > bonusRules.eligibilitySalaryLimit) {
    return 0
  }
  const wageBase = Math.min(monthlyWage, bonusRules.calculationWageCeiling)
  return roundMoney((bonusRules.statutoryBonusPercent / 100) * wageBase * eligibleMonths)
}

export function isStatutoryBonusEligible(
  settings: PayrollSettings,
  monthlyWage: number,
): boolean {
  return monthlyWage <= settings.bonusRules.eligibilitySalaryLimit
}

const EMPTY_TOTALS: VariablePayTotals = {
  overtime: 0,
  bonus: 0,
  incentive: 0,
  total: 0,
}

export function aggregateApprovedVariablePay(
  payrollMonth: string,
  overtime: OvertimeEntry[],
  bonusRuns: BonusRun[],
  incentives: IncentiveEntry[],
): Map<string, VariablePayTotals> {
  const map = new Map<string, VariablePayTotals>()

  function ensure(employeeId: string): VariablePayTotals {
    const existing = map.get(employeeId)
    if (existing) {
      return existing
    }
    const created = { ...EMPTY_TOTALS }
    map.set(employeeId, created)
    return created
  }

  overtime
    .filter((item) => item.payrollMonth === payrollMonth && item.status === 'Approved')
    .forEach((item) => {
      const bucket = ensure(item.employeeId)
      bucket.overtime = roundMoney(bucket.overtime + item.amount)
    })

  bonusRuns
    .filter(
      (run) =>
        run.payoutMonth === payrollMonth &&
        (run.status === 'Approved' || run.status === 'Paid'),
    )
    .forEach((run) => {
      run.lines
        .filter((line) => line.included)
        .forEach((line) => {
          const bucket = ensure(line.employeeId)
          bucket.bonus = roundMoney(bucket.bonus + line.amount)
        })
    })

  incentives
    .filter((item) => item.payrollMonth === payrollMonth && item.status === 'Approved')
    .forEach((item) => {
      const bucket = ensure(item.employeeId)
      bucket.incentive = roundMoney(bucket.incentive + item.amount)
    })

  map.forEach((bucket) => {
    bucket.total = roundMoney(bucket.overtime + bucket.bonus + bucket.incentive)
  })

  return map
}

export function variablePayForPfEsiPt(
  settings: PayrollSettings,
  totals: VariablePayTotals,
): { pfAdd: number; esiAdd: number; ptAdd: number } {
  const { variablePayTreatment: treatment } = settings
  const pfAdd =
    (treatment.overtime.includedInPfWages ? totals.overtime : 0) +
    (treatment.bonus.includedInPfWages ? totals.bonus : 0) +
    (treatment.incentive.includedInPfWages ? totals.incentive : 0)
  const esiAdd =
    (treatment.overtime.includedInEsiWages ? totals.overtime : 0) +
    (treatment.bonus.includedInEsiWages ? totals.bonus : 0) +
    (treatment.incentive.includedInEsiWages ? totals.incentive : 0)
  const ptAdd =
    (treatment.overtime.includedInProfessionalTaxGross ? totals.overtime : 0) +
    (treatment.bonus.includedInProfessionalTaxGross ? totals.bonus : 0) +
    (treatment.incentive.includedInProfessionalTaxGross ? totals.incentive : 0)
  return { pfAdd, esiAdd, ptAdd }
}

export function resolveFixedGross(components: StructureComponentValues): number {
  return sumGross(components)
}
