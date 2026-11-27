import type { LeaveAnalyticsData } from '@/features/employees/api/employeeDashboardApi.types'

import { leaveTypeChartColors } from '../constants/leaveTypeChartColors'
import { LEAVE_TYPE_CODES, LEAVE_TYPE_LABELS, type LeaveTypeCode } from '../constants/leaveTypeCodes'
import type { LeaveTrendMonth } from './overviewLeaveTrend'
import { monthKeysBetween } from './overviewRange'

export type OverviewDonutSlice = {
  code: string
  label: string
  days: number
  percent: number
  color: string
}

function formatMonthLabel(monthKey: string) {
  const date = new Date(`${monthKey}-01T12:00:00`)
  return date.toLocaleDateString(undefined, { month: 'short' })
}

function resolveChartCode(apiCode: string): LeaveTypeCode | null {
  const upper = apiCode.trim().toUpperCase()
  if ((LEAVE_TYPE_CODES as readonly string[]).includes(upper)) return upper as LeaveTypeCode
  return null
}

export function colorForLeaveTypeCode(code: string): string {
  const resolved = resolveChartCode(code)
  if (resolved) return leaveTypeChartColors[resolved]
  return '#5938db'
}

export function labelForLeaveTypeCode(code: string, name: string): string {
  const resolved = resolveChartCode(code)
  if (resolved) return LEAVE_TYPE_LABELS[resolved]
  return name.trim() || code
}

/** Monthly approved leave days from dashboard analytics daily series. */
export function leaveTrendMonthsFromAnalytics(
  data: LeaveAnalyticsData | undefined,
  from: string,
  to: string,
): { rows: LeaveTrendMonth[]; types: LeaveTypeCode[] } {
  const months = monthKeysBetween(from, to)
  const buckets = new Map<string, number>()
  for (const month of months) buckets.set(month, 0)

  for (const point of data?.series ?? []) {
    if (point.date < from || point.date > to) continue
    const month = point.date.slice(0, 7)
    if (!buckets.has(month)) continue
    buckets.set(month, (buckets.get(month) ?? 0) + point.approvedLeaveDays)
  }

  const rows: LeaveTrendMonth[] = months.map((month) => {
    const total = buckets.get(month) ?? 0
    return { month, label: formatMonthLabel(month), total, PL: total }
  })

  const hasDays = rows.some((row) => row.total > 0)
  const types: LeaveTypeCode[] = hasDays ? ['PL'] : []

  return { rows, types }
}

export function leaveDonutFromAnalytics(data: LeaveAnalyticsData | undefined): {
  slices: OverviewDonutSlice[]
  totalDays: number
} {
  const items = (data?.byLeaveType ?? []).filter((row) => row.approvedLeaveDays > 0)
  const totalDays = items.reduce((sum, row) => sum + row.approvedLeaveDays, 0)
  const slices: OverviewDonutSlice[] = items.map((row) => {
    const code = row.leaveTypeCode
    const days = row.approvedLeaveDays
    return {
      code,
      label: labelForLeaveTypeCode(code, row.leaveTypeName),
      days,
      percent: totalDays > 0 ? (days / totalDays) * 100 : 0,
      color: colorForLeaveTypeCode(code),
    }
  })
  slices.sort((a, b) => b.days - a.days)
  return { slices, totalDays }
}