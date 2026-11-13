/**
 * Auto-computed settlement earnings and deductions with captions.
 * Used when exit details change or user clicks Recalculate.
 */

import { getEncashableLeaveDays } from '../services/leaveEncashment'
import type { FinalSettlement, SettlementLine } from '../types/finalSettlement'
import type { PayrollEmployee } from '../types/payroll'
import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import { resolveComponentAmounts, sumGross } from './calculateGrossFromStructure'
import { formatCurrency } from './formatCurrency'
import {
  calculateGratuity,
  calculateLeaveEncashment,
  calculateNoticeRecovery,
} from './settlementCalculations'
import { computeSettlementMonthSalary, daysAfterLastWorkingDay } from './settlementLastMonthPay'
import { wageFromBase } from './variablePayCalculations'
import { roundMoney } from './roundMoney'

export function payrollMonthFromDate(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function yearsOfService(joiningDate: string, lastWorkingDay: string): number {
  const start = new Date(joiningDate)
  const end = new Date(lastWorkingDay)
  const years = (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return Math.max(0, years)
}

export function buildAutoSettlementLines(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  exit: Pick<
    FinalSettlement,
    'lastWorkingDay' | 'noticePeriodDaysRequired' | 'noticeDaysServed' | 'employeeId'
  >,
): { earnings: SettlementLine[]; deductions: SettlementLine[] } {
  const components = resolveComponentAmounts(settings, structure.componentValues)
  const fixedGross = sumGross(components)
  const month = payrollMonthFromDate(exit.lastWorkingDay)
  const unpaidAfter = daysAfterLastWorkingDay(exit.lastWorkingDay, month)
  const salaryNet = computeSettlementMonthSalary(employee, settings, structure, month, exit.lastWorkingDay)
  const lopDivisor = settings.finalSettlementRules.leaveEncashmentDayDivisor
  const paidDays = Math.max(0, lopDivisor - employee.unpaidLeaveDays - unpaidAfter)

  const earnings: SettlementLine[] = [
    {
      id: 'auto-salary',
      label: 'Salary for days worked (final month)',
      amount: salaryNet,
      caption: `${paidDays} paid day(s) in ${month} (after LOP)`,
    },
  ]

  const encashDays = getEncashableLeaveDays(exit.employeeId)
  const encashAmount = calculateLeaveEncashment(settings, components, fixedGross, encashDays)
  if (encashDays > 0) {
    const monthly = wageFromBase(settings.finalSettlementRules.leaveEncashmentRateBase, components, fixedGross)
    const rate = roundMoney(monthly / settings.finalSettlementRules.leaveEncashmentDayDivisor)
    earnings.push({
      id: 'auto-leave',
      label: 'Leave encashment',
      amount: encashAmount,
      caption: `${encashDays} days × ${formatCurrency(rate)}`,
    })
  }

  const serviceYears = yearsOfService(employee.joiningDate, exit.lastWorkingDay)
  const gratuity = calculateGratuity(settings, components, fixedGross, serviceYears)
  if (gratuity > 0) {
    earnings.push({
      id: 'auto-gratuity',
      label: 'Gratuity',
      amount: gratuity,
      caption: `${serviceYears.toFixed(1)} years of service`,
    })
  } else if (settings.finalSettlementRules.gratuityEnabled) {
    earnings.push({
      id: 'auto-gratuity-info',
      label: `Gratuity: not eligible (less than ${settings.finalSettlementRules.gratuityMinYears} years of service)`,
      amount: 0,
      infoOnly: true,
    })
  }

  const shortfall = Math.max(0, exit.noticePeriodDaysRequired - exit.noticeDaysServed)
  const deductions: SettlementLine[] = []
  const noticeAmount = calculateNoticeRecovery(settings, components, fixedGross, shortfall)
  if (noticeAmount > 0) {
    const monthly = wageFromBase(settings.finalSettlementRules.noticeRecoveryRateBase, components, fixedGross)
    const rate = roundMoney(monthly / settings.finalSettlementRules.noticeRecoveryDayDivisor)
    deductions.push({
      id: 'auto-notice',
      label: 'Notice period recovery',
      amount: noticeAmount,
      caption: `${shortfall} day(s) × ${formatCurrency(rate)}`,
    })
  }

  if (employee.loanRecovery > 0) {
    deductions.push({
      id: 'auto-loan',
      label: 'Loan outstanding',
      amount: employee.loanRecovery,
      caption: 'From employee payroll record',
    })
  }

  return { earnings, deductions }
}

export function mergeSettlementLines(
  autoEarnings: SettlementLine[],
  autoDeductions: SettlementLine[],
  previous: FinalSettlement,
): Pick<FinalSettlement, 'earningsLines' | 'deductionLines' | 'totalEarnings' | 'totalDeductions' | 'netPayable'> {
  const manualEarnings = previous.earningsLines.filter((line) => line.manual)
  const manualDeductions = previous.deductionLines.filter((line) => line.manual)
  const earningsLines = [...autoEarnings, ...manualEarnings]
  const deductionLines = [...autoDeductions, ...manualDeductions]
  const tds = previous.tds
  const totalEarnings = roundMoney(
    earningsLines.filter((line) => !line.infoOnly).reduce((sum, line) => sum + line.amount, 0),
  )
  const totalDeductions = roundMoney(
    deductionLines.reduce((sum, line) => sum + line.amount, 0) + tds,
  )
  const netPayable = roundMoney(totalEarnings - totalDeductions)
  return { earningsLines, deductionLines, totalEarnings, totalDeductions, netPayable }
}
