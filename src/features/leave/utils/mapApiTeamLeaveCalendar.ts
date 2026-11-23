import type { TeamLeaveCalendarData } from '../types/api/teamLeaveCalendar.types'
import type { CalendarLeaveDayEntry } from './buildCalendarLeaveByDay'
import { addDays } from './leaveDates'

function resolveTypeCode(row: { leaveType?: { code?: string }; leaveTypeCode?: string }): string {
  return (row.leaveType?.code ?? row.leaveTypeCode ?? 'LV').trim().toUpperCase()
}

function resolveEmployeeName(row: TeamLeaveCalendarData['items'][number]): string {
  const nested = row.employee
  const fromNested = nested?.fullName?.trim()
  if (fromNested) return fromNested
  const parts = [nested?.firstName, nested?.lastName].filter(Boolean).join(' ').trim()
  if (parts) return parts
  return row.employeeName?.trim() || 'Team member'
}

function resolveEmployeeId(row: TeamLeaveCalendarData['items'][number]): string {
  return (row.employee?.id ?? row.employeeId ?? '').trim()
}

function resolveLabel(
  name: string,
  employeeId: string,
  viewerDemoId: string,
  viewerApiId: string | null,
): string {
  if (!employeeId) return name
  if (employeeId === viewerDemoId) return 'You'
  if (viewerApiId && employeeId === viewerApiId) return 'You'
  return name
}

function pushEntry(
  map: Map<string, CalendarLeaveDayEntry[]>,
  date: string,
  entry: CalendarLeaveDayEntry,
) {
  map.set(date, [...(map.get(date) ?? []), entry])
}

function expandRowToDays(
  map: Map<string, CalendarLeaveDayEntry[]>,
  row: TeamLeaveCalendarData['items'][number],
  viewerDemoId: string,
  viewerApiId: string | null,
) {
  const code = resolveTypeCode(row)
  const name = resolveEmployeeName(row)
  const employeeId = resolveEmployeeId(row)
  const label = resolveLabel(name, employeeId, viewerDemoId, viewerApiId)
  const entry: CalendarLeaveDayEntry = { code, label }

  const single = (row.date ?? row.day ?? row.calendarDate)?.slice(0, 10)
  if (single) {
    pushEntry(map, single, entry)
    return
  }

  const from = row.startDate?.slice(0, 10)
  const to = row.endDate?.slice(0, 10) ?? from
  if (!from || !to) return

  let cursor = from
  while (cursor <= to) {
    pushEntry(map, cursor, entry)
    cursor = addDays(cursor, 1)
  }
}

export function mapApiTeamLeaveCalendarToLeaveByDay(
  data: TeamLeaveCalendarData,
  viewerDemoId: string,
  viewerApiId: string | null,
): Map<string, CalendarLeaveDayEntry[]> {
  const map = new Map<string, CalendarLeaveDayEntry[]>()
  for (const row of data.items) {
    expandRowToDays(map, row, viewerDemoId, viewerApiId)
  }
  return map
}

function expandSelfRowToDays(
  map: Map<string, CalendarLeaveDayEntry[]>,
  row: TeamLeaveCalendarData['items'][number],
) {
  const code = resolveTypeCode(row)
  const entry: CalendarLeaveDayEntry = { code, label: 'Your leave' }

  const single = (row.date ?? row.day ?? row.calendarDate)?.slice(0, 10)
  if (single) {
    pushEntry(map, single, entry)
    return
  }

  const from = row.startDate?.slice(0, 10)
  const to = row.endDate?.slice(0, 10) ?? from
  if (!from || !to) return

  let cursor = from
  while (cursor <= to) {
    pushEntry(map, cursor, entry)
    cursor = addDays(cursor, 1)
  }
}

/** GET /leaves/calendar — employee self scope (approved only). */
export function mapApiSelfLeaveCalendarToLeaveByDay(
  data: TeamLeaveCalendarData,
): Map<string, CalendarLeaveDayEntry[]> {
  const map = new Map<string, CalendarLeaveDayEntry[]>()
  for (const row of data.items) {
    expandSelfRowToDays(map, row)
  }
  return map
}

/** Keeps pending chips from mock calendar when API returns approved-only rows. */
export function mergePendingCalendarEntries(
  apiMap: Map<string, CalendarLeaveDayEntry[]>,
  mockMap: Map<string, CalendarLeaveDayEntry[]>,
): Map<string, CalendarLeaveDayEntry[]> {
  const merged = new Map(apiMap)
  for (const [day, entries] of mockMap) {
    const pending = entries.filter((item) => item.pending)
    if (!pending.length) continue
    merged.set(day, [...(merged.get(day) ?? []), ...pending])
  }
  return merged
}

/** @deprecated Use mergePendingCalendarEntries */
export function mergePendingTeamCalendarEntries(
  apiMap: Map<string, CalendarLeaveDayEntry[]>,
  mockMap: Map<string, CalendarLeaveDayEntry[]>,
): Map<string, CalendarLeaveDayEntry[]> {
  return mergePendingCalendarEntries(apiMap, mockMap)
}