/**
 * Derives leave balance from append-only ledger entries per type.
 * Pending approved requests reduce available balance separately in UI.
 */

import type { LedgerEntry } from '../types/ledger'
import type { LeaveRequest } from '../types/leaveRequest'

export function ledgerBalanceForType(
  entries: LedgerEntry[],
  employeeId: string,
  leaveTypeCode: string,
): number {
  const sorted = [...entries]
    .filter((item) => item.employeeId === employeeId && item.leaveTypeCode === leaveTypeCode)
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  if (sorted.length === 0) {
    return 0
  }
  return sorted[sorted.length - 1].balanceAfter
}

export function pendingDaysForType(
  requests: LeaveRequest[],
  employeeId: string,
  leaveTypeCode: string,
): number {
  return requests
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.leaveTypeCode === leaveTypeCode &&
        item.status === 'Pending',
    )
    .reduce((sum, item) => sum + item.days, 0)
}

export function usedDaysForType(
  requests: LeaveRequest[],
  employeeId: string,
  leaveTypeCode: string,
  yearPrefix: string,
): number {
  return requests
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.leaveTypeCode === leaveTypeCode &&
        item.status === 'Approved' &&
        item.fromDate.startsWith(yearPrefix),
    )
    .reduce((sum, item) => sum + item.days, 0)
}
