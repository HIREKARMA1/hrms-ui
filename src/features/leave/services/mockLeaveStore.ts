/**
 * In-memory leave data store mutated by split service modules.
 * Initialized once with employees, requests, ledger, and settings seeds.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LedgerEntry } from '../types/ledger'
import type { CompOffLot, CompOffRequest } from '../types/compOff'
import type { EncashmentRequest } from '../types/encashment'
import type { Delegation } from '../types/delegation'
import type { LeaveSettings } from '../types/leaveSettings'
import { createDefaultLeaveSettings } from './companyDefaults'
import { buildMockEmployees } from './mockEmployees'
import { buildMockLedgers } from './mockLedgers'
import { buildMockRequests } from './mockRequests'
import { buildMockCompOff } from './mockCompOff'
import { buildMockEncashment } from './mockEncashment'
import { leaveTodayIso } from '../utils/leaveToday'

export type LeaveStore = {
  employees: LeaveEmployee[]
  settings: LeaveSettings
  requests: LeaveRequest[]
  ledger: LedgerEntry[]
  compOffLots: CompOffLot[]
  compOffRequests: CompOffRequest[]
  encashments: EncashmentRequest[]
  delegations: Delegation[]
  accrualRuns: string[]
  yearEndRuns: string[]
}

let store: LeaveStore | null = null

export function getLeaveStore(): LeaveStore {
  if (!store) {
    const employees = buildMockEmployees()
    const employeeIds = employees.map((item) => item.id)
    const comp = buildMockCompOff()
    store = {
      employees,
      settings: createDefaultLeaveSettings(),
      requests: buildMockRequests(leaveTodayIso()),
      ledger: buildMockLedgers(employeeIds),
      compOffLots: comp.lots,
      compOffRequests: comp.requests,
      encashments: buildMockEncashment(),
      delegations: [],
      accrualRuns: ['2026-05'],
      yearEndRuns: [],
    }
  }
  return store
}

export function resetLeaveStore(): void {
  store = null
}
