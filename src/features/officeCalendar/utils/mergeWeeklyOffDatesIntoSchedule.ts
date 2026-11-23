/**
 * Adds weekly-off rows from GET /calendar/weekly-offs/dates when missing on view days.
 */
import { weeklyOffScheduleItem } from './mapCalendarViewToSchedule'
import type { OfficeCalendarScheduleItem } from './officeCalendarScheduleItems'

export function mergeWeeklyOffDatesIntoSchedule(
  items: OfficeCalendarScheduleItem[],
  offDates: readonly string[],
  monthKeyPrefix: string,
): OfficeCalendarScheduleItem[] {
  const existing = new Set(
    items.filter((row) => row.category === 'weeklyOff').map((row) => row.dateKey),
  )
  const extras: OfficeCalendarScheduleItem[] = []
  for (const dateKey of offDates) {
    if (!dateKey.startsWith(monthKeyPrefix)) continue
    if (existing.has(dateKey)) continue
    extras.push(weeklyOffScheduleItem(dateKey))
    existing.add(dateKey)
  }
  return extras.length ? [...items, ...extras] : items
}