/**

 * Stacked monthly leave-day totals by type for the Overview trend chart.

 */



import type { LeaveSnapshot } from '../services/leaveService'

import { LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'

import { approvedLeaveRequests, requestOverlapsRange, weightPerCalendarDay } from './overviewApprovedLeave'

import { daysBetweenInclusive } from './leaveDates'

import { monthKeysBetween } from './overviewRange'



export type LeaveTrendMonth = { month: string; label: string; total: number } & Partial<Record<LeaveTypeCode, number>>



export function leaveDaysByMonthAndType(snapshot: LeaveSnapshot, from: string, to: string): { rows: LeaveTrendMonth[]; types: LeaveTypeCode[] } {

  const months = monthKeysBetween(from, to)

  const buckets = new Map<string, Partial<Record<LeaveTypeCode, number>>>()

  const typeSet = new Set<LeaveTypeCode>()

  for (const month of months) buckets.set(month, {})

  for (const row of approvedLeaveRequests(snapshot)) {

    if (!requestOverlapsRange(row, from, to)) continue

    const code = row.leaveTypeCode as LeaveTypeCode
    const weight = weightPerCalendarDay(row)

    for (const day of daysBetweenInclusive(row.fromDate, row.toDate)) {

      if (day < from || day > to) continue

      const month = day.slice(0, 7)

      const slot = buckets.get(month)

      if (!slot) continue

      slot[code] = (slot[code] ?? 0) + weight

      typeSet.add(code)

    }

  }

  const types = [...typeSet].sort((a, b) => LEAVE_TYPE_LABELS[a].localeCompare(LEAVE_TYPE_LABELS[b]))

  const rows = months.map((month) => {

    const slice = buckets.get(month) ?? {}

    const total = types.reduce((sum, code) => sum + (slice[code] ?? 0), 0)

    return { month, label: formatMonthLabel(month), total, ...slice }

  })

  return { rows, types }

}



function formatMonthLabel(monthKey: string) {

  const date = new Date(`${monthKey}-01T12:00:00`)

  return date.toLocaleDateString(undefined, { month: 'short' })

}


