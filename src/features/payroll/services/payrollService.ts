/**
 * Payroll data access layer — swap this file when connecting a real API.
 * Used by PayrollProvider and all payroll feature tabs.
 */

import { MOCK_REVISION_AUTHOR, PAYROLL_SERVICE_DELAY_MS } from '../constants/payrollRules'
import type { PayrollEmployee } from '../types/payroll'
import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryRevision, SalaryStructure } from '../types/salaryStructure'
import { sumGross, resolveComponentAmounts } from '../utils/calculateGrossFromStructure'
import { payrollMockStore } from './payrollMockStore'
import {
  delayPayrollService,
  setPayrollServiceFailNext,
  throwIfPayrollServiceFail,
} from './payrollServiceHelpers'

export { setPayrollServiceFailNext }
export {
  fetchOvertimeEntries,
  saveOvertimeEntry,
  setOvertimeStatus,
  fetchIncentiveEntries,
  saveIncentiveEntry,
  setIncentiveStatus,
  fetchBonusRuns,
  saveBonusRun,
  setBonusRunStatus,
  fetchFinalSettlements,
  saveFinalSettlement,
  setSettlementStatus,
} from './payrollVariablePayService'

export async function fetchPayrollEmployees(): Promise<PayrollEmployee[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.employees)
}

export async function getSettings(): Promise<PayrollSettings> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.settings)
}

export async function saveSettings(settings: PayrollSettings): Promise<PayrollSettings> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  payrollMockStore.settings = structuredClone(settings)
  return structuredClone(payrollMockStore.settings)
}

export async function getSalaryStructures(): Promise<SalaryStructure[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.structures)
}

export async function getRevisions(employeeId: string): Promise<SalaryRevision[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return payrollMockStore.revisions
    .filter((item) => item.employeeId === employeeId)
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))
    .map((item) => structuredClone(item))
}

export type EmployeeMonthlyInputsPatch = Pick<
  PayrollEmployee,
  'incomeTax' | 'unpaidLeaveDays' | 'loanRecovery'
>

export async function updateEmployeeMonthlyInputs(
  employeeId: string,
  patch: EmployeeMonthlyInputsPatch,
): Promise<PayrollEmployee> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const index = payrollMockStore.employees.findIndex((item) => item.id === employeeId)
  if (index < 0) {
    throw new Error('Employee not found')
  }
  const updated = { ...payrollMockStore.employees[index], ...patch }
  payrollMockStore.employees[index] = structuredClone(updated)
  return structuredClone(updated)
}

export async function saveSalaryStructure(
  structure: SalaryStructure,
  reason: string,
): Promise<SalaryStructure> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const settings = payrollMockStore.settings
  const index = payrollMockStore.structures.findIndex((item) => item.id === structure.id)
  if (index < 0) {
    throw new Error('Structure not found')
  }
  const previous = payrollMockStore.structures[index]
  const prevAmounts = resolveComponentAmounts(settings, previous.componentValues)
  const nextAmounts = resolveComponentAmounts(settings, structure.componentValues)
  payrollMockStore.revisions.unshift({
    id: `REV-${structure.employeeId}-${Date.now()}`,
    employeeId: structure.employeeId,
    effectiveFrom: structure.effectiveFrom,
    previousStructure: { ...previous.componentValues },
    newStructure: { ...structure.componentValues },
    previousGross: sumGross(prevAmounts),
    newGross: sumGross(nextAmounts),
    reason,
    changedBy: MOCK_REVISION_AUTHOR,
    changedAt: new Date().toISOString().slice(0, 10),
  })
  const updated: SalaryStructure = { ...structure, revisionCount: previous.revisionCount + 1 }
  payrollMockStore.structures[index] = structuredClone(updated)
  return structuredClone(updated)
}
