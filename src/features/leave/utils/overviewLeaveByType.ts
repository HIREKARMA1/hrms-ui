/**
 * Leave days grouped by type for the Overview donut (selected chart range).
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import { approvedLeaveRequests, requestOverlapsRange, weightPerCalendarDay } from './overviewApprovedLeave'
import { daysBetweenInclusive } from './leaveDates'

export type LeaveByTypeSlice = { code: LeaveTypeCode; label: string; days: number; percent: number }

export function leaveDaysByType(snapshot: LeaveSnapshot, from: string, to: string): { slices: LeaveByTypeSlice[]; totalDays: number } {
  const totals = new Map<LeaveTypeCode, number>()
  for (const row of approvedLeaveRequests(snapshot)) {
    if (!requestOverlapsRange(row, from, to)) continue
    const code = row.leaveTypeCode as LeaveTypeCode
    const weight = weightPerCalendarDay(row)
    for (const day of daysBetweenInclusive(row.fromDate, row.toDate)) {
      if (day < from || day > to) continue
      totals.set(code, (totals.get(code) ?? 0) + weight)
    }
  }
  const totalDays = [...totals.values()].reduce((sum, value) => sum + value, 0)
  const slices = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([code, days]) => ({
      code,
      label: LEAVE_TYPE_LABELS[code],
      days: Math.round(days * 10) / 10,
      percent: totalDays > 0 ? Math.round((days / totalDays) * 1000) / 10 : 0,
    }))
  return { slices, totalDays: Math.round(totalDays * 10) / 10 }
}
