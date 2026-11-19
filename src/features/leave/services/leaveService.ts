/**
 * Facade for leave UI components; the only service import surface in components.
 * Wraps mock store reads and mutations with a short delay.
 */

import type { LeaveEmployee } from '../types/employee'
import type { LeaveRequest } from '../types/leaveRequest'
import type { LedgerEntry } from '../types/ledger'
import type { LeaveSettings } from '../types/leaveSettings'
import type { SettingsHistoryEntry } from '../types/settingsHistory'
import { buildSettingsHistoryEntries } from '../utils/buildSettingsHistoryEntries'
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
  /** When `api`, `requests` came from GET /leaves; otherwise mock store data. */
  requestsSource?: 'api' | 'mock'
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
  settingsHistory: SettingsHistoryEntry[]
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
    settingsHistory: [...store.settingsHistory],
  }
}

export async function saveLeaveSettings(settings: LeaveSettings, userName: string): Promise<void> {
  await leaveDelay()
  const store = getLeaveStore()
  const before = structuredClone(store.settings)
  // Rule changes never recalculate existing requests or ledger entries; they apply to new requests only.
  const entries = buildSettingsHistoryEntries(before, settings, userName)
  store.settingsHistory.push(...entries)
  store.settings = structuredClone(settings)
}

/** Whether the monthly accrual for `yearMonth` (YYYY-MM) has already been run. */
export function hasAccrualRun(yearMonth: string): boolean {
  return getLeaveStore().accrualRuns.includes(yearMonth)
}

/** Marks the monthly accrual for `yearMonth` as run (idempotent). */
export function recordAccrualRun(yearMonth: string): void {
  const store = getLeaveStore()
  if (!store.accrualRuns.includes(yearMonth)) store.accrualRuns.push(yearMonth)
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

export async function saveSettingsDraft(settings: LeaveSettings, userName: string): Promise<void> {
  return saveLeaveSettings(settings, userName)
}
