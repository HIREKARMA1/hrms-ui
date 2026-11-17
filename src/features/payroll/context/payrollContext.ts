/**
 * Payroll React context definition for shared employee state.
 * Used by PayrollProvider and usePayroll hook.
 */

import { createContext } from 'react'

import type { FinalSettlement } from '../types/finalSettlement'
import type { PayrollEmployee, PayrollStage } from '../types/payroll'
import type { PayrollSettings } from '../types/payrollSettings'
import type { SalaryRevision, SalaryStructure } from '../types/salaryStructure'
import type {
  BonusRun,
  IncentiveEntry,
  ItemApprovalStatus,
  OvertimeEntry,
} from '../types/variablePay'
import type { SettlementStatus } from '../types/finalSettlement'
import type { EmployeeMonthlyInputsPatch } from '../services/payrollService'
import { buildAlerts } from '../utils/buildAlerts'
import { enrichEmployees } from '../utils/calculatePayroll'
import { summarizePayroll } from '../utils/summarizePayroll'

export type PayrollContextValue = {
  employees: ReturnType<typeof enrichEmployees>
  rawEmployees: PayrollEmployee[]
  settings: PayrollSettings
  structures: SalaryStructure[]
  overtime: OvertimeEntry[]
  incentives: IncentiveEntry[]
  bonusRuns: BonusRun[]
  settlements: FinalSettlement[]
  payrollMonth: string
  setPayrollMonth: (month: string) => void
  summary: ReturnType<typeof summarizePayroll>
  alerts: ReturnType<typeof buildAlerts>
  loading: boolean
  error: string | null
  reload: () => void
  saveSettings: (settings: PayrollSettings) => Promise<void>
  saveSalaryStructure: (structure: SalaryStructure, reason: string) => Promise<void>
  updateEmployeeMonthlyInputs: (
    employeeId: string,
    patch: EmployeeMonthlyInputsPatch,
  ) => Promise<void>
  fetchRevisions: (employeeId: string) => Promise<SalaryRevision[]>
  payrollStage: PayrollStage
  setPayrollStage: (stage: PayrollStage) => void
  advancePayrollStage: () => void
  selectedEmployeeId: string | null
  setSelectedEmployeeId: (id: string | null) => void
  markAsPaid: (id: string) => void
  holdSalary: (id: string) => void
  retryPayment: (id: string) => void
  releaseSalary: (id: string) => void
  runDialogOpen: boolean
  setRunDialogOpen: (open: boolean) => void
  upsertOvertime: (entry: OvertimeEntry) => Promise<OvertimeEntry>
  updateOvertimeStatus: (
    id: string,
    status: ItemApprovalStatus,
    reason?: string,
  ) => Promise<OvertimeEntry>
  upsertIncentive: (entry: IncentiveEntry) => Promise<IncentiveEntry>
  updateIncentiveStatus: (
    id: string,
    status: ItemApprovalStatus,
    reason?: string,
  ) => Promise<IncentiveEntry>
  upsertBonusRun: (run: BonusRun) => Promise<BonusRun>
  updateBonusRunStatus: (id: string, status: BonusRun['status']) => Promise<BonusRun>
  upsertSettlement: (settlement: FinalSettlement) => Promise<FinalSettlement>
  updateSettlementStatus: (
    id: string,
    status: SettlementStatus,
    reason?: string,
  ) => Promise<FinalSettlement>
}

export const PayrollContext = createContext<PayrollContextValue | null>(null)
