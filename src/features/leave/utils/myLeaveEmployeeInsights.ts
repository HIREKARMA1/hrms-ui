/**
 * Stat helpers for the employee My Leave overview row.
 */

import type { CompOffLot } from '../types/compOff'
import type { LeaveRequest } from '../types/leaveRequest'
import type { BalanceCardModel } from '../components/myLeave/MyLeaveBalanceCards'
import { formatDate } from './formatDate'
import { leaveTodayIso } from './leaveToday'

export function totalAvailableDays(cards: BalanceCardModel[]): number {
  return cards.reduce((sum, card) => sum + Math.max(0, card.available), 0)
}

export function nextLeaveSummary(requests: LeaveRequest[]): { value: string; detail?: string } {
  const today = leaveTodayIso()
  const next = requests
    .filter((row) => (row.status === 'Approved' || row.status === 'Pending') && row.toDate >= today)
    .sort((a, b) => a.fromDate.localeCompare(b.fromDate))[0]
  if (!next) return { value: 'None scheduled' }
  const value =
    next.fromDate === next.toDate ? formatDate(next.fromDate) : `${formatDate(next.fromDate)} – ${formatDate(next.toDate)}`
  const detail = next.status === 'Pending' ? 'Awaiting approval' : undefined
  return { value, detail }
}

export function availableCompOffDays(lots: CompOffLot[], employeeId: string): number {
  return lots
    .filter((lot) => lot.employeeId === employeeId && lot.status === 'Available')
    .reduce((sum, lot) => sum + lot.creditedDays, 0)
}
