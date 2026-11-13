/**
 * Per-day leave counts, names, and markers for the 14-day outlook strip.
 */

import type { LeaveSnapshot } from '../services/leaveService'
import { activeEmployees } from './employmentStatus'
import { approvedLeaveRequests } from './overviewApprovedLeave'
import { addDays, daysBetweenInclusive } from './leaveDates'
import { isWeeklyOffDay } from './weekday'
import { leaveTodayIso } from './leaveToday'

export type OutlookDayCell = {
  iso: string
  weekday: string
  dayNum: string
  monthLabel: string | null
  onLeaveCount: number
  onLeaveNames: string[]
  weeklyOff: boolean
  holidayNames: string[]
  coverageRisk: boolean
}

export function outlook14Days(snapshot: LeaveSnapshot, start = leaveTodayIso()): OutlookDayCell[] {
  const activeIds = new Set(activeEmployees(snapshot.employees).map((item) => item.id))
  const nameById = Object.fromEntries(snapshot.employees.map((item) => [item.id, item.name]))
  const byDept = new Map<string, Set<string>>()
  for (const emp of activeEmployees(snapshot.employees)) {
    const set = byDept.get(emp.department) ?? new Set<string>()
    set.add(emp.id)
    byDept.set(emp.department, set)
  }
  const holidays = new Map<string, string[]>()
  snapshot.settings.holidays.forEach((item) => {
    holidays.set(item.date, [...(holidays.get(item.date) ?? []), item.name])
  })
  const limit = snapshot.settings.teamCoverage.maxSameDepartmentPerDay
  const days = daysBetweenInclusive(start, addDays(start, 13))
  let lastMonth = ''
  return days.map((iso) => {
    const onIds = new Set<string>()
    for (const row of approvedLeaveRequests(snapshot)) {
      if (!activeIds.has(row.employeeId)) continue
      if (row.fromDate <= iso && row.toDate >= iso) onIds.add(row.employeeId)
    }
    let coverageRisk = false
    for (const [, deptIds] of byDept) {
      let count = 0
      for (const id of onIds) if (deptIds.has(id)) count += 1
      if (count >= limit) coverageRisk = true
    }
    const date = new Date(`${iso}T12:00:00`)
    const monthKey = iso.slice(0, 7)
    const monthLabel = monthKey !== lastMonth ? date.toLocaleDateString(undefined, { month: 'short' }) : null
    lastMonth = monthKey
    const names = [...onIds].map((id) => nameById[id] ?? id).sort()
    return {
      iso,
      weekday: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      dayNum: String(date.getDate()),
      monthLabel,
      onLeaveCount: onIds.size,
      onLeaveNames: names,
      weeklyOff: isWeeklyOffDay(iso, snapshot.settings.weeklyOffDays),
      holidayNames: holidays.get(iso) ?? [],
      coverageRisk,
    }
  })
}

export function outlookBusiestDay(cells: OutlookDayCell[]): string | null {
  const busiest = cells.reduce((best, cell) => (cell.onLeaveCount > (best?.onLeaveCount ?? -1) ? cell : best), cells[0])
  if (!busiest || busiest.onLeaveCount === 0) return null
  const date = new Date(`${busiest.iso}T12:00:00`)
  const label = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
  return `Busiest day: ${label}, ${busiest.onLeaveCount} people on leave`
}
