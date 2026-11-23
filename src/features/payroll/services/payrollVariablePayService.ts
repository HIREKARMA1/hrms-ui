/**
 * Mock API for overtime, bonus runs, incentives, and final settlements.
 * Re-exported through payrollService as the single component import surface.
 */

import { PAYROLL_SERVICE_DELAY_MS } from '../constants/payrollRules'
import { MOCK_SETTLEMENT_ACTOR } from '../constants/variablePayLabels'
import type { FinalSettlement, SettlementStatus } from '../types/finalSettlement'
import type {
  BonusRun,
  IncentiveEntry,
  ItemApprovalStatus,
  OvertimeEntry,
} from '../types/variablePay'
import { payrollMockStore } from './payrollMockStore'
import { throwIfPayrollServiceFail, delayPayrollService } from './payrollServiceHelpers'

export async function fetchOvertimeEntries(): Promise<OvertimeEntry[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.overtime)
}

export async function saveOvertimeEntry(entry: OvertimeEntry): Promise<OvertimeEntry> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const index = payrollMockStore.overtime.findIndex((item) => item.id === entry.id)
  if (index >= 0) {
    payrollMockStore.overtime[index] = structuredClone(entry)
  } else {
    payrollMockStore.overtime.push(structuredClone(entry))
  }
  return structuredClone(entry)
}

export async function setOvertimeStatus(
  id: string,
  status: ItemApprovalStatus,
  rejectionReason?: string,
): Promise<OvertimeEntry> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const item = payrollMockStore.overtime.find((row) => row.id === id)
  if (!item) {
    throw new Error('Overtime entry not found')
  }
  item.status = status
  item.rejectionReason = rejectionReason
  return structuredClone(item)
}

export async function fetchIncentiveEntries(): Promise<IncentiveEntry[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.incentives)
}

export async function saveIncentiveEntry(entry: IncentiveEntry): Promise<IncentiveEntry> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const index = payrollMockStore.incentives.findIndex((item) => item.id === entry.id)
  if (index >= 0) {
    payrollMockStore.incentives[index] = structuredClone(entry)
  } else {
    payrollMockStore.incentives.push(structuredClone(entry))
  }
  return structuredClone(entry)
}

export async function setIncentiveStatus(
  id: string,
  status: ItemApprovalStatus,
  rejectionReason?: string,
): Promise<IncentiveEntry> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const item = payrollMockStore.incentives.find((row) => row.id === id)
  if (!item) {
    throw new Error('Incentive entry not found')
  }
  item.status = status
  item.rejectionReason = rejectionReason
  return structuredClone(item)
}

export async function fetchBonusRuns(): Promise<BonusRun[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.bonusRuns)
}

export async function saveBonusRun(run: BonusRun): Promise<BonusRun> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const index = payrollMockStore.bonusRuns.findIndex((item) => item.id === run.id)
  if (index >= 0) {
    payrollMockStore.bonusRuns[index] = structuredClone(run)
  } else {
    payrollMockStore.bonusRuns.unshift(structuredClone(run))
  }
  return structuredClone(run)
}

export async function setBonusRunStatus(id: string, status: BonusRun['status']): Promise<BonusRun> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const item = payrollMockStore.bonusRuns.find((row) => row.id === id)
  if (!item) {
    throw new Error('Bonus run not found')
  }
  item.status = status
  return structuredClone(item)
}

export async function fetchFinalSettlements(): Promise<FinalSettlement[]> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  return structuredClone(payrollMockStore.settlements)
}

export async function saveFinalSettlement(
  settlement: FinalSettlement,
): Promise<FinalSettlement> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const index = payrollMockStore.settlements.findIndex((item) => item.id === settlement.id)
  if (index >= 0) {
    payrollMockStore.settlements[index] = structuredClone(settlement)
  } else {
    payrollMockStore.settlements.unshift(structuredClone(settlement))
  }
  return structuredClone(settlement)
}

export async function setSettlementStatus(
  id: string,
  status: SettlementStatus,
  rejectionReason?: string,
): Promise<FinalSettlement> {
  await delayPayrollService(PAYROLL_SERVICE_DELAY_MS)
  throwIfPayrollServiceFail()
  const item = payrollMockStore.settlements.find((row) => row.id === id)
  if (!item) {
    throw new Error('Settlement not found')
  }
  item.status = status
  item.rejectionReason = rejectionReason
  if (status === 'Pending approval') {
    item.timeline.push({ stage: 'Submitted', actor: MOCK_SETTLEMENT_ACTOR, date: today() })
  }
  if (status === 'Approved') {
    item.timeline.push({ stage: 'Approved', actor: MOCK_SETTLEMENT_ACTOR, date: today() })
  }
  if (status === 'Paid') {
    item.timeline.push({ stage: 'Paid', actor: MOCK_SETTLEMENT_ACTOR, date: today() })
  }
  if (status === 'Rejected') {
    item.timeline.push({
      stage: 'Rejected',
      actor: MOCK_SETTLEMENT_ACTOR,
      date: today(),
      note: rejectionReason,
    })
  }
  return structuredClone(item)
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}
