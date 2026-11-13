/**
 * In-memory payroll mock state for settings, structures, and variable pay.
 * Used only by payrollService until a real API is connected.
 */

import { companyDefaultSettings } from './companyDefaults'
import { mockBonusRuns } from './mockBonusRuns'
import { mockFinalSettlements } from './mockFinalSettlements'
import { mockPayrollEmployees } from './mockPayrollData'
import { mockIncentiveEntries, mockOvertimeEntries } from './mockVariablePay'
import { mockSalaryRevisions } from './mockSalaryRevisions'
import { mockSalaryStructures } from './mockSalaryStructures'
import type { FinalSettlement } from '../types/finalSettlement'
import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryRevision, SalaryStructure } from '../types/salaryStructure'
import type { PayrollEmployee } from '../types/payroll'
import type { BonusRun, IncentiveEntry, OvertimeEntry } from '../types/variablePay'

type PayrollMockStore = {
  settings: PayrollSettings
  employees: PayrollEmployee[]
  structures: SalaryStructure[]
  revisions: SalaryRevision[]
  overtime: OvertimeEntry[]
  incentives: IncentiveEntry[]
  bonusRuns: BonusRun[]
  settlements: FinalSettlement[]
}

function cloneStore(): PayrollMockStore {
  return {
    settings: structuredClone(companyDefaultSettings),
    employees: structuredClone(mockPayrollEmployees),
    structures: structuredClone(mockSalaryStructures),
    revisions: structuredClone(mockSalaryRevisions),
    overtime: structuredClone(mockOvertimeEntries),
    incentives: structuredClone(mockIncentiveEntries),
    bonusRuns: structuredClone(mockBonusRuns),
    settlements: structuredClone(mockFinalSettlements),
  }
}

export let payrollMockStore: PayrollMockStore = cloneStore()

export function resetPayrollMockStore(): void {
  payrollMockStore = cloneStore()
}
