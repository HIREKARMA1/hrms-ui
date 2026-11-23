/**
 * Shared HR dashboard counts used on Overview, Requests, Balances and Calendar.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { LOW_BALANCE_THRESHOLD_DAYS, LOW_BALANCE_TYPE_CODES } from '../constants/hrOverviewConstants'
import { activeEmployees, isOnApprovedLeaveToday } from './employmentStatus'
import { ledgerBalanceForType, pendingDaysForType } from './calculateBalance'
import { addDays } from './leaveDates'
import { leaveTodayIso } from './leaveToday'
import { buildAttentionSummary } from './buildAttentionSummary'

export function countOnLeaveToday(snapshot: LeaveSnapshot): number {
  const today = leaveTodayIso()
  const ids = new Set<string>()
  for (const emp of activeEmployees(snapshot.employees)) {
    if (isOnApprovedLeaveToday(emp.id, snapshot.requests, today)) ids.add(emp.id)
  }
  return ids.size
}

export function countUpcomingLeave7Days(snapshot: LeaveSnapshot): number {
  const today = leaveTodayIso()
  const end = addDays(today, 7)
  const activeIds = new Set(activeEmployees(snapshot.employees).map((e) => e.id))
  const ids = new Set<string>()
  for (const row of snapshot.requests) {
    if (row.status !== 'Approved' || !activeIds.has(row.employeeId)) continue
    if (row.fromDate > end || row.toDate < today) continue
    if (row.fromDate > today) ids.add(row.employeeId)
  }
  return ids.size
}

export function countPendingRequests(snapshot: LeaveSnapshot): number {
  return snapshot.requests.filter((item) => item.status === 'Pending' && activeEmployees(snapshot.employees).some((e) => e.id === item.employeeId)).length
}

export function countPendingWaitingOnHr(snapshot: LeaveSnapshot): number {
  return buildAttentionSummary(snapshot).waitingCount
}

export function countActiveEmployees(snapshot: LeaveSnapshot): number {
  return activeEmployees(snapshot.employees).length
}

export function countHrActionRequests(snapshot: LeaveSnapshot): number {
  return buildAttentionSummary(snapshot).waitingCount
}

export function countEscalatedRequests(snapshot: LeaveSnapshot): number {
  return snapshot.requests.filter((item) => item.escalated && item.status === 'Pending').length
}

export function countPendingEncashments(snapshot: LeaveSnapshot): number {
  return snapshot.encashments.filter((item) => item.status === 'Pending approval' || item.status === 'Pending payout').length
}

export function countCompOffExpiringSoon(snapshot: LeaveSnapshot, withinDays = 14): number {
  const limit = addDays(leaveTodayIso(), withinDays)
  return snapshot.compOffLots.filter((lot) => lot.status === 'Available' && lot.expiresOn <= limit).length
}

export function countLowBalanceEmployees(snapshot: LeaveSnapshot): number {
  let count = 0
  for (const emp of activeEmployees(snapshot.employees)) {
    const low = LOW_BALANCE_TYPE_CODES.some((code) => {
      const bal = ledgerBalanceForType(snapshot.ledger, emp.id, code) - pendingDaysForType(snapshot.requests, emp.id, code)
      return bal < LOW_BALANCE_THRESHOLD_DAYS
    })
    if (low) count += 1
  }
  return count
}

export function accrualMissingThisMonth(snapshot: LeaveSnapshot): boolean {
  const month = leaveTodayIso().slice(0, 7)
  return !snapshot.accrualRuns.includes(month)
}
