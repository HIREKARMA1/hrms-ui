/**
 * Pure salary calculations for one employee using settings and structure.
 * Used by hooks, Overview table, detail panel, and structure live preview.
 */

import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryStructure } from '../types/salaryStructure'
import type {
  ComputedPayroll,
  EmployeeWithComputed,
  PayrollEmployee,
} from '../types/payroll'
import type { BonusRun, IncentiveEntry, OvertimeEntry } from '../types/variablePay'
import { computePayrollFieldsWithOptions } from './computePayrollWithOptions'
import { aggregateApprovedVariablePay } from './variablePayCalculations'
import { resolveComponentAmounts, sumGross } from './calculateGrossFromStructure'
import { calculateEsi } from './calculateEsi'
import { calculatePf } from './calculatePf'
import { calculateProfessionalTax } from './calculateProfessionalTax'
import { getLossOfPayDivisor } from './getLossOfPayDivisor'
import { roundMoney } from './roundMoney'

export function computePayrollFields(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  payrollMonth: string,
): ComputedPayroll {
  return computePayrollFieldsWithOptions(employee, settings, structure, {
    payrollMonth,
  })
}

export function computeStructurePreviewPayroll(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  payrollMonth: string,
): ComputedPayroll {
  const componentAmounts = resolveComponentAmounts(settings, structure.componentValues)
  const fixedGross = sumGross(componentAmounts)
  const gross = fixedGross
  const { employeePf, employerPf } = calculatePf(settings, structure, componentAmounts)
  const { employeeEsi, employerEsi, esiApplicable } = calculateEsi(
    settings,
    structure.flags,
    fixedGross,
    componentAmounts,
  )
  const professionalTax = calculateProfessionalTax(settings, structure, gross, payrollMonth)
  const lopDivisor = getLossOfPayDivisor(settings)
  const unpaidLeaveDeduction = roundMoney(
    (fixedGross / lopDivisor) * employee.unpaidLeaveDays,
  )
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
  const emptyVariable = { overtime: 0, bonus: 0, incentive: 0, total: 0 }

  return {
    fixedGross,
    gross,
    variablePay: emptyVariable,
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

export function enrichEmployee(
  employee: PayrollEmployee,
  settings: PayrollSettings,
  structure: SalaryStructure,
  payrollMonth: string,
  variablePayMap: Map<string, import('../types/variablePay').VariablePayTotals>,
): EmployeeWithComputed {
  const variablePay = variablePayMap.get(employee.id) ?? {
    overtime: 0,
    bonus: 0,
    incentive: 0,
    total: 0,
  }
  return {
    ...employee,
    ...computePayrollFieldsWithOptions(employee, settings, structure, {
      payrollMonth,
      variablePay,
    }),
  }
}

export function enrichEmployees(
  employees: PayrollEmployee[],
  settings: PayrollSettings,
  structures: SalaryStructure[],
  payrollMonth: string,
  overtime: OvertimeEntry[] = [],
  bonusRuns: BonusRun[] = [],
  incentives: IncentiveEntry[] = [],
): EmployeeWithComputed[] {
  const byEmployee = new Map(structures.map((item) => [item.employeeId, item]))
  const variablePayMap = aggregateApprovedVariablePay(
    payrollMonth,
    overtime,
    bonusRuns,
    incentives,
  )
  return employees.map((employee) => {
    const structure = byEmployee.get(employee.id)
    if (!structure) {
      throw new Error(`Missing structure for ${employee.id}`)
    }
    return enrichEmployee(employee, settings, structure, payrollMonth, variablePayMap)
  })
}

export { computePayrollFieldsWithOptions } from './computePayrollWithOptions'
