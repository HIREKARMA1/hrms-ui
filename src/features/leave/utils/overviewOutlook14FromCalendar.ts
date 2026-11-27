import type { BackendLeaveCalendarItem } from '../api/leaveApi.types'

import {
  calendarItemOverlapsDay,
  employeesOnLeaveOnDay,
} from './overviewFromLeaveCalendar'
import type { OutlookDayCell } from './overviewOutlook14'
import { outlookBusiestDay } from './overviewOutlook14'
import type { LeaveSnapshot } from '../services/leaveService'
import { addDays, daysBetweenInclusive } from './leaveDates'
import { isWeeklyOffDay } from './weekday'
import { leaveTodayIso } from './leaveToday'
import { isTeamCoverageConfigured } from './overviewTeamCoverage'

type BuildOutlook14FromCalendarInput = {
  items: BackendLeaveCalendarItem[]
  holidaysByDate: Map<string, string[]>
  weeklyOffDays: number[]
  coverageLimit: number | null
  departmentByEmployeeId: Map<string, string>
  start?: string
}

export function outlook14DaysFromCalendar(input: BuildOutlook14FromCalendarInput): OutlookDayCell[] {
  const start = input.start ?? leaveTodayIso()
  const days = daysBetweenInclusive(start, addDays(start, 13))
  let lastMonth = ''

  return days.map((iso) => {
    const onDay = employeesOnLeaveOnDay(input.items, iso)
    const onIds = new Set(onDay.map((row) => row.employeeId))
    const names = [...new Set(onDay.map((row) => row.employeeName))].sort()

    let coverageRisk = false
    if (input.coverageLimit !== null) {
      const byDept = new Map<string, number>()
      for (const row of onDay) {
        const dept = input.departmentByEmployeeId.get(row.employeeId) ?? 'Unassigned'
        byDept.set(dept, (byDept.get(dept) ?? 0) + 1)
      }
      for (const count of byDept.values()) {
        if (count >= input.coverageLimit) coverageRisk = true
      }
    }

    const date = new Date(`${iso}T12:00:00`)
    const monthKey = iso.slice(0, 7)
    const monthLabel = monthKey !== lastMonth ? date.toLocaleDateString(undefined, { month: 'short' }) : null
    lastMonth = monthKey

    return {
      iso,
      weekday: date.toLocaleDateString(undefined, { weekday: 'narrow' }),
      dayNum: String(date.getDate()),
      monthLabel,
      onLeaveCount: onIds.size,
      onLeaveNames: names,
      weeklyOff: isWeeklyOffDay(iso, input.weeklyOffDays),
      holidayNames: input.holidaysByDate.get(iso) ?? [],
      coverageRisk,
    }
  })
}

export function calendarDayLeaveDetail(
  iso: string,
  items: BackendLeaveCalendarItem[],
  typeCodeById: Map<string, string>,
  holidayNames: string[],
): { holidays: string[]; onLeave: { code: string; label: string }[] } {
  const onLeave = items
    .filter((item) => calendarItemOverlapsDay(item, iso))
    .map((item) => {
      const code = typeCodeById.get(item.leaveTypeId) ?? item.leaveTypeName
      return {
        code,
        label: `${item.employeeName} · ${item.leaveTypeName}`,
      }
    })
  return { holidays: holidayNames, onLeave }
}

export function resolveOutlook14Live(
  snapshot: LeaveSnapshot,
  items: BackendLeaveCalendarItem[],
  holidaysByDate: Map<string, string[]>,
): OutlookDayCell[] {
  const limit = isTeamCoverageConfigured(snapshot.settings.teamCoverage.maxSameDepartmentPerDay)
    ? snapshot.settings.teamCoverage.maxSameDepartmentPerDay
    : null
  const departmentByEmployeeId = new Map(
    snapshot.employees.map((employee) => [employee.id, employee.department]),
  )
  return outlook14DaysFromCalendar({
    items,
    holidaysByDate,
    weeklyOffDays: snapshot.settings.weeklyOffDays,
    coverageLimit: limit,
    departmentByEmployeeId,
  })
}

export { outlookBusiestDay }