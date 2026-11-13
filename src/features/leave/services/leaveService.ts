/**
 * Facade for leave UI components; the only service import surface in components.
 * Wraps mock store reads and mutations with a short delay.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LedgerEntry } from '../types/ledger'
import type { LeaveSettings } from '../types/leaveSettings'
import type { CompOffLot, CompOffRequest } from '../types/compOff'
import type { EncashmentRequest } from '../types/encashment'
import type { Delegation } from '../types/delegation'
import { getLeaveStore, resetLeaveStore } from './mockLeaveStore'
import { leaveDelay } from './serviceDelay'
import {
  addRequest,
  approveRequest,
  cancelRequest,
  nextRequestId,
  rejectRequest,
} from './requestActions'
import { createDefaultLeaveSettings } from './companyDefaults'

export type LeaveSnapshot = {
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

export async function fetchLeaveSnapshot(): Promise<LeaveSnapshot> {
  await leaveDelay()
  const store = getLeaveStore()
  return {
    employees: [...store.employees],
    settings: structuredClone(store.settings),
    requests: [...store.requests],
    ledger: [...store.ledger],
    compOffLots: [...store.compOffLots],
    compOffRequests: [...store.compOffRequests],
    encashments: [...store.encashments],
    delegations: [...store.delegations],
    accrualRuns: [...store.accrualRuns],
    yearEndRuns: [...store.yearEndRuns],
  }
}

export async function saveLeaveSettings(settings: LeaveSettings): Promise<void> {
  await leaveDelay()
  getLeaveStore().settings = structuredClone(settings)
}

export async function resetLeaveData(): Promise<void> {
  await leaveDelay()
  resetLeaveStore()
}

export {
  addRequest,
  approveRequest,
  cancelRequest,
  nextRequestId,
  rejectRequest,
  createDefaultLeaveSettings,
}

export async function saveSettingsDraft(settings: LeaveSettings): Promise<void> {
  return saveLeaveSettings(settings)
}
