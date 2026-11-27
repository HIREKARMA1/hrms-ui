import type { LeaveTypeOption } from '../api/leaveMappers'
import type { BackendLeaveCalendarItem } from '../api/leaveApi.types'
import { addDays, daysBetweenInclusive } from './leaveDates'
import { leaveTodayIso } from './leaveToday'

export function leaveTypeIdToCodeMap(types: LeaveTypeOption[]): Map<string, string> {
  return new Map(types.map((type) => [type.id, type.code]))
}

export function calendarItemFromDate(item: BackendLeaveCalendarItem): string {
  return item.startDate.slice(0, 10)
}

export function calendarItemToDate(item: BackendLeaveCalendarItem): string {
  return item.endDate.slice(0, 10)
}

export function calendarItemOverlapsDay(item: BackendLeaveCalendarItem, iso: string): boolean {
  const from = calendarItemFromDate(item)
  const to = calendarItemToDate(item)
  return from <= iso && to >= iso
}

/** Unique employees with approved leave starting after today within N days. */
export function countUpcomingLeaveStartsFromCalendar(
  items: BackendLeaveCalendarItem[],
  today = leaveTodayIso(),
  withinDays = 7,
): number {
  const end = addDays(today, withinDays)
  const ids = new Set<string>()
  for (const item of items) {
    const from = calendarItemFromDate(item)
    if (from <= today || from > end) continue
    ids.add(item.employeeId)
  }
  return ids.size
}

export function employeesOnLeaveOnDay(
  items: BackendLeaveCalendarItem[],
  iso: string,
): BackendLeaveCalendarItem[] {
  return items.filter((item) => calendarItemOverlapsDay(item, iso))
}

export function holidaysInRange(
  holidayItems: Array<{ date?: string; holidayDate?: string; name?: string; title?: string }>,
  from: string,
  to: string,
): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const item of holidayItems) {
    const iso = (item.date ?? item.holidayDate ?? '').slice(0, 10)
    if (!iso || iso < from || iso > to) continue
    const name = (item.name ?? item.title ?? 'Holiday').trim()
    map.set(iso, [...(map.get(iso) ?? []), name])
  }
  return map
}

export function overviewCalendarWindowBounds(today = leaveTodayIso()) {
  return {
    startDate: today,
    endDate: addDays(today, 30),
    outlookEnd: addDays(today, 13),
    days14: daysBetweenInclusive(today, addDays(today, 13)),
  }
}