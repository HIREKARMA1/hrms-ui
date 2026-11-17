/**
 * Payroll compute entry supporting extra unpaid days (settlements) and variable pay.
 * Used by calculatePayroll and Final Settlement last-month salary section.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type { ComputedPayroll, PayrollEmployee } from '../types/payroll'
import type { VariablePayTotals } from '../types/variablePay'
import { calculateEsi } from './calculateEsi'
import { resolveComponentAmounts, sumGross } from './calculateGrossFromStructure'
import { calculatePf } from './calculatePf'
import { calculateProfessionalTax } from './calculateProfessionalTax'
import { getLossOfPayDivisor } from './getLossOfPayDivisor'
import { variablePayForPfEsiPt } from './variablePayCalculations'
import { roundMoney } from './roundMoney'

const ZERO_VARIABLE: VariablePayTotals = {
  overtime: 0,
  bonus: 0,
  incentive: 0,
  total: 0,
}

type ComputeOptions = {
  payrollMonth: string
  variablePay?: VariablePayTotals
  extraUnpaidDays?: number
}

export function computePayrollFieldsWithOptions(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  options: ComputeOptions,
): ComputedPayroll {
  const componentAmounts = resolveComponentAmounts(settings, structure.componentValues)
  const fixedGross = sumGross(componentAmounts)
  const variablePay = options.variablePay ?? ZERO_VARIABLE
  const gross = roundMoney(fixedGross + variablePay.total)
  const { pfAdd, esiAdd, ptAdd } = variablePayForPfEsiPt(settings, variablePay)

  const { employeePf, employerPf } = calculatePf(settings, structure, componentAmounts, pfAdd)
  const { employeeEsi, employerEsi, esiApplicable } = calculateEsi(
    settings,
    structure.flags,
    fixedGross,
    componentAmounts,
    esiAdd,
  )
  const professionalTax = calculateProfessionalTax(
    settings,
    structure,
    fixedGross + ptAdd,
    options.payrollMonth,
  )
  const unpaidDays = employee.unpaidLeaveDays + (options.extraUnpaidDays ?? 0)
  const lopDivisor = getLossOfPayDivisor(settings)
  const unpaidLeaveDeduction = roundMoney((fixedGross / lopDivisor) * unpaidDays)
  const totalDeductions = roundMoney(
    employeePf +
      employeeEsi +
      professionalTax +
      employee.incomeTax +
      unpaidLeaveDeduction +
      employee.loanRecovery,
  )
  const netPay = roundMoney(gross - totalDeductions)
  const annualCtc = roundMoney(gross * 12 + employerPf * 12 + employerEsi * 12)

  return {
    fixedGross,
    gross,
    variablePay,
    annualCtc,
    componentAmounts,
    employeePf,
    employerPf,
    employeeEsi,
    employerEsi,
    esiApplicable,
    professionalTax,
    unpaidLeaveDeduction,
    totalDeductions,
    netPay,
  }
}

export type { ComputeOptions }
